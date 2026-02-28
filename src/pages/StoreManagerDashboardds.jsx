
import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Autocomplete // Added
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

import PRTemplate from './PRTemplate';
import { createRoot } from 'react-dom/client';

const StoreManagerDashboardds = () => {
    const [tabValue, setTabValue] = useState(0);
    const [requests, setRequests] = useState([]);
    const [inventory, setInventory] = useState([]);

    // Allotment State
    const [openAllotModal, setOpenAllotModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [allotQty, setAllotQty] = useState('');
    const [currentStock, setCurrentStock] = useState(null); // For availability check

    // Purchase Request State
    const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
    const [purchaseQty, setPurchaseQty] = useState('');

    // Add Stock State
    const [openAddStockModal, setOpenAddStockModal] = useState(false);
    const [stores, setStores] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [newStock, setNewStock] = useState({ storeid: '', itemid: '', quantity: '' });

    // Print State
    const [printPRData, setPrintPRData] = useState(null);
    const [prConfigData, setPrConfigData] = useState({
        institutionname: '',
        address: '',
        phone: '',
        prshort: ''
    });
    const [configId, setConfigId] = useState(null);


    // Create PR Tab State
    const [cart, setCart] = useState([]);
    const [history, setHistory] = useState([]); // PR History
    const [createPrCategory, setCreatePrCategory] = useState('');
    const [createPrType, setCreatePrType] = useState('');
    const [createPrItem, setCreatePrItem] = useState(null);
    const [createPrQty, setCreatePrQty] = useState('');
    const [createPrUnit, setCreatePrUnit] = useState('');
    const [apiCategories, setApiCategories] = useState([]);
    const [apiTypes, setApiTypes] = useState([]);
    const [apiUnits, setApiUnits] = useState([]);

    const fetchCategories = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemcategoryds?colid=${global1.colid}`);
            const items = res.data.data.items || [];
            if (items.length > 0) {
                setApiCategories(items.map(c => c.name || c.category).filter(Boolean));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTypes = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemtypeds?colid=${global1.colid}`);
            const itemTypes = res.data.data.itemTypes || [];
            if (itemTypes.length > 0) {
                setApiTypes(itemTypes.map(t => t.name || t.itemtype).filter(Boolean));
            }
        } catch (error) {
            console.error('Error fetching types:', error);
        }
    };

    const fetchUnits = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemunitds?colid=${global1.colid}`);
            const items = res.data.data.items || [];
            if (items.length > 0) {
                setApiUnits(items.map(u => u.name || u.unitcode || u.unit).filter(Boolean));
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    };

    const handleAddToCart = () => {
        if (!createPrItem || !createPrQty) return;
        const newItem = {
            itemid: createPrItem._id,
            itemcode: createPrItem.itemcode,
            itemname: createPrItem.itemname,
            quantity: createPrQty,
            unit: createPrUnit,
            storeid: createPrItem.storeid || stores[0]?._id, // Default to first store if not linked? Or logic needs refinement.
            storename: stores.find(s => s._id === (createPrItem.storeid || stores[0]?._id))?.storename || 'General Store'
        };
        setCart([...cart, newItem]);
        setCreatePrItem(null);
        setCreatePrQty('');
        setCreatePrUnit('');
    };

    const handleGeneratePR = async () => {
        // Generate PR Number
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(1000 + Math.random() * 9000);
        // Use prshort from config, default to PRCSPU
        const prefix = prConfigData.prshort || 'PRCSPU';
        const prNum = `${prefix}/ ${yyyy}${mm}${dd}${random}`;

        try {
            // Loop and Save
            for (const item of cart) {
                await ep1.post('/api/v2/addstorerequisationds', {
                    itemid: item.itemid,
                    itemname: item.itemname,
                    itemcode: item.itemcode,
                    name: global1.name,
                    storeid: item.storeid,
                    store: item.storename,
                    quantity: Number(item.quantity),
                    reqdate: new Date(),
                    reqstatus: 'Purchase Requested', // Directly set status
                    colid: global1.colid,
                    user: global1.user,
                    prnumber: prNum // Save generated PR Number
                });
            }

            alert(`PR Generated Successfully! PR Number: ${prNum}`);

            // Set Print Data
            setPrintConfig(prev => ({ ...prev, prNumber: prNum }));
            setRequestToPrint(null); // Clear single request
            // We need to pass the CART items to the print dialog
            // We can reuse requestToPrint but it expects a single object usually. 
            // Better to add a 'printItems' state or pass cart directly if we open dialog immediately.
            setOpenPrintDialog(true);

            // Clear Cart (maybe after print confirm? but let's clear now to avoid duplicates)
            // setCart([]); // Keep cart until print confirmed? Or clear and save in a 'lastGeneratedPR' state?
            // Let's keep cart for the print dialog to read, then clear.

        } catch (error) {
            console.error("Error generating PR:", error);
            alert("Failed to generate PR.");
        }
    };

    const fetchPRConfig = async () => {
        try {
            const response = await ep1.get(`/api/v2/getprconfigds?colid=${global1.colid}`);
            if (response.data.data) {
                const data = response.data.data;
                setPrConfigData({
                    institutionname: data.institutionname || "People's Group",
                    address: data.address || "Karond Bhanpur By Pass Road, Bhopal-462037",
                    phone: data.phone || "+91-0755-4005013",
                    prshort: data.prshort || 'PRCSPU'
                });
                setConfigId(data._id);
            }
        } catch (error) {
            console.error('Error fetching PR Config:', error);
        }
    };

    const handleSaveConfig = async () => {
        try {
            const payload = {
                ...prConfigData,
                colid: global1.colid,
                user: global1.user,
                name: global1.name || localStorage.getItem('name')
            };

            if (configId) {
                await ep1.post(`/api/v2/updateprconfigds?id=${configId}`, payload);
            } else {
                await ep1.post('/api/v2/addprconfigds', payload);
                fetchPRConfig();
            }
            alert('Configuration Saved Successfully');
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration');
        }
    };

    useEffect(() => {
        // Restore global1 if missing (on reload)
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
            global1.name = localStorage.getItem('name');
            global1.department = localStorage.getItem('department');
            global1.role = localStorage.getItem('role');
        }

        if (tabValue === 0) fetchRequests();
        else if (tabValue === 1) {
            fetchInventory();
            fetchStores();
            fetchAllItems();
        } else if (tabValue === 2) {
            fetchStores();
            fetchAllItems();
        } else if (tabValue === 3) {
            fetchHistory();
        }

        // Always fetch config
        fetchPRConfig();
    }, [tabValue]);

    const fetchRequests = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallrequisationds?colid=${global1.colid}`);
            let all = response.data.data.requisitions || [];

            // Filter by Assigned Stores
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMappings = mappings.filter(m => m.user === global1.user); // Match current user

            if (userMappings.length > 0) {
                const allowedStoreIds = userMappings.map(m => m.storeid);
                const allowedStoreNames = userMappings.map(m => m.store);

                // Filter requests where storeid matches or store name matches
                all = all.filter(r =>
                    allowedStoreIds.includes(r.storeid) || allowedStoreNames.includes(r.store)
                );
            } else {
                // No mapping = Show All
            }

            // Show Pending and Purchase Requested
            setRequests(all.filter(r => r.reqstatus === 'Pending' || r.reqstatus === 'Purchase Requested').map(r => ({ ...r, id: r._id })));
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const [allowedStoresDebug, setAllowedStoresDebug] = useState([]);

    const fetchInventory = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            let items = response.data.data.storeItems || [];

            // Filter by Visible Stores (if stores state is populated)
            // Note: fetchStores() runs concurrently or before/after. 
            // Better to rely on the same logic or ensure stores are loaded.
            // However, since stores state update might lag, let's re-implement the check logic or wait for stores.
            // Actually, we can just filter by the same logic here or simpler:
            // If we want strict security, we'd do it on backend. Frontend: filter by 'stores' state if available.
            // But 'stores' state might not be ready yet.
            // Let's replicate the mapping check for robustness.

            const mapRes = await ep1.get(`/api/v2/getallstoreuserds?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMappings = mappings.filter(m => m.user === global1.user);

            if (userMappings.length > 0) {
                // User requested filtering based on store name
                // Normalize allowed stores: trim whitespace and lowercase for robust matching
                const allowedStoreNames = userMappings.map(m => m.store ? m.store.trim().toLowerCase() : "");

                // Debugging to see what is happening
                console.log("Debug - Allowed Stores (Normalized):", allowedStoreNames);
                console.log("Debug - Total Items before filter:", items.length);

                // Filter items
                items = items.filter(i => {
                    if (!i.storename) return false; // Skip items with no store name
                    const itemStoreName = i.storename.trim().toLowerCase();
                    return allowedStoreNames.includes(itemStoreName);
                });

                console.log("Debug - Items after filter:", items.length);
            } else {
                setAllowedStoresDebug(['ALL (No Mapping Found)']);
                // If no mappings, show ALL items (Admin/Default View)
            }

            setInventory(items.map(i => ({ ...i, id: i._id })));
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            // Fetch sent requests (storerequisationds)
            const response = await ep1.get(`/api/v2/getallstorerequisationds?colid=${global1.colid}`);
            let all = response.data.data.requisitions || [];

            // Filter by Assigned Stores
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMappings = mappings.filter(m => m.user === global1.user);

            if (userMappings.length > 0) {
                const allowedStoreIds = userMappings.map(m => m.storeid);
                // store requisation might use 'store' for name or 'storeid'
                const allowedStoreNames = userMappings.map(m => m.store);

                all = all.filter(r =>
                    allowedStoreIds.includes(r.storeid) || allowedStoreNames.includes(r.store)
                );
            }

            // Filter for those that have a PR Number (indicating they were generated via new tab) or just all
            setHistory(all.map(r => ({ ...r, id: r._id })));
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleReprint = (prNumber) => {
        if (!prNumber) {
            alert("No PR Number found for this record.");
            return;
        }

        // Filter all items with this PR Number
        const itemsToPrint = history.filter(item => item.prnumber === prNumber);

        if (itemsToPrint.length === 0) {
            alert("No items found for this PR.");
            return;
        }

        setPrintConfig(prev => ({ ...prev, prNumber: prNumber }));

        // Open Print
        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Print PR</title>');
        printWindow.document.write('</head><body><div id="print-root"></div></body></html>');
        printWindow.document.close();

        const root = createRoot(printWindow.document.getElementById('print-root'));

        const createdByName = global1.name || localStorage.getItem('name') || global1.user || 'Unknown';

        root.render(
            <PRTemplate
                requestData={{}} // Empty fallback
                items={itemsToPrint}
                prNumber={prNumber}
                instituteName={printConfig.institutionName}
                instituteAddress={printConfig.address}
                institutePhone={printConfig.phone}
                createdByName={createdByName}
            />
        );

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 1000);
    };

    const fetchStores = async () => {
        try {
            // 1. Fetch All Stores
            const res = await ep1.get(`/api/v2/getallstoremasterds?colid=${global1.colid}`);
            const allStores = res.data.data.stores || [];

            // 2. Fetch User-Store Mappings
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];

            // 3. Check for Mapping
            // Using global1.user (which should be email/username) to match 'user' field in storeuserds
            // Also checking 'userid' if available, but 'user' field seems primary based on previous context
            const userMappings = mappings.filter(m => m.user === global1.user || m.userid === global1.user);

            if (userMappings.length > 0) {
                // User is restricted to specific stores
                const allowedStoreIds = userMappings.map(m => m.storeid);
                // Also match by store name if ID is missing (fallback)
                const allowedStoreNames = userMappings.map(m => m.store);

                const filteredStores = allStores.filter(s =>
                    allowedStoreIds.includes(s._id) || allowedStoreNames.includes(s.storename)
                );
                setStores(filteredStores);
            } else {
                // No mapping found -> Show ALL stores (Admin/Default)
                setStores(allStores);
            }

        } catch (e) {
            console.error("Error fetching stores:", e);
        }
    };
    const fetchAllItems = async () => { try { const res = await ep1.get(`/api/v2/getallitemmasterds?colid=${global1.colid}`); setAllItems(res.data.data.items || []); } catch (e) { console.error(e); } };

    // --- Allotment Logic ---
    const handleOpenAllot = async (request) => {
        setSelectedRequest(request);
        setAllotQty(request.quantity); // Default to full amount
        setCurrentStock('Checking...');
        setOpenAllotModal(true);

        // Fetch Live Stock Availability
        try {
            const invRes = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            const storeItems = invRes.data.data.storeItems || [];
            const matchingItem = storeItems.find(si => si.itemcode === request.itemcode && si.storeid === request.storeid);
            setCurrentStock(matchingItem ? matchingItem.quantity : 0);
        } catch (error) {
            console.error(error);
            setCurrentStock('Error');
        }
    };

    const submitAllotment = async () => {
        if (Number(allotQty) > Number(currentStock)) {
            alert(`Insufficient Stock! Available: ${currentStock}`);
            return;
        }

        try {
            // Re-fetch to get ID (or store it in state, but logic needs matchingItem ID)
            const invRes = await ep1.get(`/api/v2/getallstoreitemds?colid=${global1.colid}`);
            const storeItems = invRes.data.data.storeItems || [];
            const matchingItem = storeItems.find(si => si.itemcode === selectedRequest.itemcode && si.storeid === selectedRequest.storeid);

            if (!matchingItem) {
                alert('Item not found in inventory during processing.');
                return;
            }

            const response = await ep1.post('/api/v2/allotitem', {
                requestId: selectedRequest._id,
                storeItemId: matchingItem._id,
                quantity: Number(allotQty),
                storeId: selectedRequest.storeid,
                itemId: selectedRequest.itemcode,
                userId: global1.user || 'StoreManager',
                colid: global1.colid
            });
            alert(response.data.message);
            setOpenAllotModal(false);
            fetchRequests();
        } catch (error) {
            console.error('Error allotting item:', error);
            alert('Failed to allot item.');
        }
    };

    // --- Purchase Request Logic ---
    const handleRequestPurchase = (request) => {
        setSelectedRequest(request);
        setPurchaseQty(request.quantity);
        setOpenPurchaseModal(true);
    };

    const submitPurchaseRequest = async () => {
        try {
            const storeObj = stores.find(s => s._id === selectedRequest.storeid);
            const itemMaster = allItems.find(i => i.itemcode === selectedRequest.itemcode);

            // 1. Add to Purchase Cell
            await ep1.post('/api/v2/addstorerequisationds', {
                itemid: itemMaster?._id || selectedRequest.itemid,
                itemname: selectedRequest.itemname,
                name: `Purchase Request - ${selectedRequest.itemname}`,
                storeid: selectedRequest.storeid,
                store: selectedRequest.storename || storeObj?.storename || 'Unknown Store',
                quantity: Number(purchaseQty),
                reqdate: new Date(),
                reqstatus: 'Pending',
                colid: global1.colid,
                user: global1.user
            });

            // 2. Update Original Request Status
            await ep1.post(`/api/v2/updaterequisationds?id=${selectedRequest._id}`, {
                reqstatus: 'Purchase Requested'
            });

            alert('Purchase Request Sent to Purchase Cell');
            setOpenPurchaseModal(false);
            fetchRequests();
        } catch (error) {
            console.error('Error sending purchase request:', error);
            alert('Failed to send request');
        }
    };

    // --- Add Stock Logic ---
    const handleAddStockSubmit = async () => {
        try {
            const selectedStore = stores.find(s => s._id === newStock.storeid);
            const selectedItem = allItems.find(i => i._id === newStock.itemid);

            await ep1.post('/api/v2/addstoreitemds', {
                colid: global1.colid,
                user: global1.user,
                storeid: newStock.storeid,
                storename: selectedStore?.storename,
                itemid: newStock.itemid,
                itemcode: selectedItem?.itemcode,
                itemname: selectedItem?.itemname,
                quantity: Number(newStock.quantity),
                type: selectedItem?.itemtype,
                status: 'Available'
            });
            alert('Stock Added Successfully');
            setOpenAddStockModal(false);
            fetchInventory();
        } catch (error) {
            console.error('Error adding stock:', error);
            alert('Failed to add stock');
        }
    };
    // --- Print Logic ---
    const [openPrintDialog, setOpenPrintDialog] = useState(false);
    const [printConfig, setPrintConfig] = useState({
        institutionName: prConfigData.institutionname,
        address: prConfigData.address,
        phone: prConfigData.phone,
        prNumber: ''
    });
    const [requestToPrint, setRequestToPrint] = useState(null);

    const handlePrintPR = async (row) => {
        // Check if PR Number already exists
        let prNum = row.prnumber;

        if (!prNum) {
            // Generate New PR Number: PRCSPU/YYYYMMDD<Random>
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const random = Math.floor(1000 + Math.random() * 9000);
            // Use prshort from config, default to PRCSPU
            const prefix = prConfigData.prshort || 'PRCSPU';
            prNum = `${prefix}/ ${yyyy}${mm}${dd}${random}`;

            // Save to Backend
            try {
                await ep1.post(`/api/v2/updaterequisationds?id=${row._id}`, {
                    prnumber: prNum,
                    colid: global1.colid
                });

                // Update Local State
                setRequests(prev => prev.map(r => r._id === row._id ? { ...r, prnumber: prNum } : r));
                setPrintPRData(prev => prev ? { ...prev, prnumber: prNum } : null);

            } catch (error) {
                console.error("Error saving PR Number:", error);
                alert("Could not generate/save PR Number. Printing with temporary ID.");
            }
        }

        setRequestToPrint(row);
        setPrintConfig({
            institutionName: prConfigData.institutionname,
            address: prConfigData.address,
            phone: prConfigData.phone,
            prNumber: prNum
        });
        setOpenPrintDialog(true);
    };

    const handleConfirmPrint = () => {
        setOpenPrintDialog(false);

        const printWindow = window.open('', '', 'height=800,width=800');
        printWindow.document.write('<html><head><title>Print PR</title>');
        printWindow.document.write('</head><body><div id="print-root"></div></body></html>');
        printWindow.document.close();

        const root = createRoot(printWindow.document.getElementById('print-root'));

        // Determine what to print: Single Request or Cart
        const itemsToPrint = requestToPrint ? null : cart;

        // createdByName
        const createdByName = global1.name || localStorage.getItem('name') || global1.user || 'Unknown';

        root.render(
            <PRTemplate
                requestData={requestToPrint || {}}
                items={itemsToPrint}
                prNumber={printConfig.prNumber}
                instituteName={printConfig.institutionName}
                instituteAddress={printConfig.address}
                institutePhone={printConfig.phone}
                createdByName={createdByName}
            />
        );

        setTimeout(() => {
            printWindow.focus();
            printWindow.print();

            // If we printed the cart, clear it now
            if (!requestToPrint && cart.length > 0) {
                setCart([]);
            }
        }, 1000);
    };

    // --- Columns ---
    // Dynamic Columns
    const generateColumns = (data, context) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        const cols = keys
            .filter(key => key !== '_id' && key !== 'colid' && key !== 'id' && key !== '__v')
            .map(key => {
                const colDef = {
                    field: key,
                    headerName: key.charAt(0).toUpperCase() + key.slice(1),
                    width: 150
                };

                if (key.toLowerCase().includes('date')) {
                    colDef.valueFormatter = (params) => {
                        if (!params.value) return 'N/A';
                        const date = new Date(params.value);
                        return isNaN(date.getTime()) ? params.value : date.toLocaleDateString();
                    };
                }

                if (key === 'reqstatus' || key === 'status') {
                    colDef.renderCell = (params) => (
                        <Box sx={{ color: params.value === 'Pending' ? 'orange' : 'green', border: '1px solid', borderRadius: 1, px: 1 }}>
                            {params.value}
                        </Box>
                    );
                }

                return colDef;
            });

        if (context === 'requests') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 350,
                renderCell: (params) => (
                    <Box>
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleOpenAllot(params.row)}
                            sx={{ mr: 1, display: params.row.reqstatus === 'Pending' ? 'inline-flex' : 'none' }}
                        >
                            Allot
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => handleRequestPurchase(params.row)}
                            sx={{ mr: 1, display: params.row.reqstatus === 'Pending' ? 'inline-flex' : 'none' }}
                        >
                            Request Purchase
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            onClick={() => handlePrintPR(params.row)}
                            disabled={params.row.reqstatus !== 'Purchase Requested'}
                            sx={{ display: params.row.reqstatus === 'Purchase Requested' ? 'inline-flex' : 'none' }}
                        >
                            Print PR
                        </Button>
                    </Box>
                )
            });
        }

        return cols;
    };



    const columns = [
        { field: 'itemname', headerName: 'Item Name', width: 200 },
        { field: 'quantity', headerName: 'Quantity', width: 100 },
        { field: 'storename', headerName: 'Store', width: 150 },
        { field: 'department', headerName: 'Department', width: 150 },
        { field: 'reqdate', headerName: 'Date', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
        { field: 'reqstatus', headerName: 'Status', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 300,
            renderCell: (params) => (
                <Box>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenAllot(params.row)}
                        sx={{ mr: 1 }}
                    >
                        Approve / Allot
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        onClick={() => handlePrintPR(params.row)}
                    >
                        Print PR
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <Box p={3}>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label="Requests" />
                <Tab label="Inventory & Stock" />
                <Tab label="Create PR" />
                <Tab label="PR History" />
                <Tab label="Configuration" />
            </Tabs>

            {tabValue === 0 && (
                <Box sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={requests}
                        columns={columns}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                    />
                </Box>
            )}

            {tabValue === 1 && (
                <Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={() => setOpenAddStockModal(true)}>
                            Add Stock
                        </Button>
                    </Box>
                    <Box sx={{ height: 600, width: '100%' }}>
                        <DataGrid
                            rows={inventory}
                            columns={[
                                { field: 'itemname', headerName: 'Item Name', width: 200 },
                                { field: 'quantity', headerName: 'Quantity', width: 150 },
                                { field: 'storename', headerName: 'Store', width: 200 },
                                {
                                    field: 'updatedate',
                                    headerName: 'Last Updated',
                                    width: 200,
                                    valueFormatter: (params) => params.value ? new Date(params.value).toLocaleString() : ''
                                }
                            ]}
                            pageSizeOptions={[10, 25, 50]}
                        />
                    </Box>
                </Box>
            )}

            {/* Configuration Tab */}
            {tabValue === 4 && (
                <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>PR Print Configuration</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Institution Name"
                                fullWidth
                                value={prConfigData.institutionname}
                                onChange={(e) => setPrConfigData({ ...prConfigData, institutionname: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Address"
                                fullWidth
                                value={prConfigData.address}
                                onChange={(e) => setPrConfigData({ ...prConfigData, address: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Phone"
                                fullWidth
                                value={prConfigData.phone}
                                onChange={(e) => setPrConfigData({ ...prConfigData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="PR Short Code (e.g., PRCSPU)"
                                fullWidth
                                value={prConfigData.prshort}
                                onChange={(e) => setPrConfigData({ ...prConfigData, prshort: e.target.value })}
                                helperText="This code will be prefixed to generated PR Numbers."
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'right' }}>
                            <Button variant="contained" onClick={handleSaveConfig}>
                                Save Configuration
                            </Button>
                        </Grid>
                    </Grid>
                </Box >
            )}

            {
                tabValue === 2 && (
                    <Box p={3}>
                        {/* ... (Create PR Tab content) ... */}
                        <Typography variant="h6" gutterBottom>Create New Purchase Requisition</Typography>

                        {/* Input Section */}
                        {/* ... existing input section ... */}
                        <Paper sx={{ p: 2, mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={2}>
                                    <Autocomplete
                                        options={apiCategories.length > 0 ? apiCategories : [...new Set(allItems.map(i => i.category || '').filter(Boolean))]}
                                        value={createPrCategory}
                                        onOpen={fetchCategories}
                                        onChange={(e, val) => {
                                            setCreatePrCategory(val || '');
                                            setCreatePrType('');
                                            setCreatePrItem(null);
                                            setCreatePrUnit('');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Category" size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Autocomplete
                                        options={apiTypes.length > 0 ? apiTypes : [...new Set(allItems.filter(i => !createPrCategory || i.category === createPrCategory).map(i => i.itemtype || '').filter(Boolean))]}
                                        value={createPrType}
                                        onOpen={fetchTypes}
                                        onChange={(e, val) => {
                                            setCreatePrType(val || '');
                                            setCreatePrItem(null);
                                            setCreatePrUnit('');
                                        }}
                                        disabled={!createPrCategory}
                                        renderInput={(params) => <TextField {...params} label="Type" size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Autocomplete
                                        options={allItems.filter(i =>
                                            (!createPrCategory || (i.category || '') === createPrCategory) &&
                                            (!createPrType || (i.itemtype || '') === createPrType)
                                        )}
                                        getOptionLabel={(option) => option.itemname || ""}
                                        value={createPrItem}
                                        onChange={(e, val) => {
                                            setCreatePrItem(val);
                                            setCreatePrUnit(val?.unit || '');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Select Item" size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Autocomplete
                                        options={apiUnits}
                                        value={createPrUnit}
                                        onOpen={fetchUnits}
                                        onChange={(e, val) => {
                                            setCreatePrUnit(val || '');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Unit" size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={1.5}>
                                    <TextField
                                        label="Quantity"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={createPrQty}
                                        onChange={(e) => setCreatePrQty(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={1.5}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAddToCart}
                                        disabled={!createPrItem || !createPrQty || !createPrUnit}
                                        fullWidth
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Cart Table */}
                        <Box sx={{ height: 300, width: '100%', mb: 2 }}>
                            <DataGrid
                                rows={cart.map((item, index) => ({ ...item, id: index }))}
                                columns={[
                                    { field: 'itemname', headerName: 'Item Name', width: 250 },
                                    { field: 'quantity', headerName: 'Quantity', width: 100 },
                                    { field: 'unit', headerName: 'Unit', width: 100 },
                                    { field: 'storename', headerName: 'Store', width: 200 },
                                    {
                                        field: 'actions',
                                        headerName: 'Actions',
                                        width: 150,
                                        renderCell: (params) => (
                                            <Button
                                                size="small"
                                                color="error"
                                                onClick={() => setCart(prev => prev.filter((_, i) => i !== params.id))}
                                            >
                                                Remove
                                            </Button>
                                        )
                                    }
                                ]}
                                pageSizeOptions={[5, 10]}
                                disableRowSelectionOnClick
                            />
                        </Box>

                        {/* Generate Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                size="large"
                                color="secondary"
                                disabled={cart.length === 0}
                                onClick={handleGeneratePR}
                            >
                                Generate PR & Print
                            </Button>
                        </Box>
                    </Box>
                )
            }

            {
                tabValue === 3 && (
                    <Box sx={{ height: 600, width: '100%', p: 3 }}>
                        <Typography variant="h6" gutterBottom>PR History (Sent to Purchase Cell)</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                            <Button onClick={fetchHistory} variant="outlined" size="small">Refresh</Button>
                        </Box>
                        <DataGrid
                            rows={history}
                            columns={[
                                { field: 'prnumber', headerName: 'PR Number', width: 200 },
                                { field: 'reqdate', headerName: 'Date', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString() },
                                { field: 'itemname', headerName: 'Item', width: 200 },
                                { field: 'quantity', headerName: 'Qty', width: 100 },
                                { field: 'store', headerName: 'Store', width: 150 },
                                { field: 'reqstatus', headerName: 'Status', width: 150 },
                                {
                                    field: 'actions',
                                    headerName: 'Actions',
                                    width: 200,
                                    renderCell: (params) => (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleReprint(params.row.prnumber)}
                                        >
                                            Reprint PR
                                        </Button>
                                    )
                                }
                            ]}
                            pageSizeOptions={[10, 25, 50]}
                            disableRowSelectionOnClick
                            initialState={{
                                sorting: {
                                    sortModel: [{ field: 'reqdate', sort: 'desc' }],
                                },
                            }}
                        />
                    </Box>
                )
            }

            {/* Allotment Modal */}
            <Dialog open={openAllotModal} onClose={() => setOpenAllotModal(false)}>
                <DialogTitle>Allot Item: {selectedRequest?.itemname}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography><strong>Requested Qty:</strong> {selectedRequest?.quantity}</Typography>
                        <Typography><strong>Current Stock:</strong> {currentStock}</Typography>

                        <TextField
                            label="Allot Quantity"
                            type="number"
                            fullWidth
                            sx={{ mt: 2 }}
                            value={allotQty}
                            onChange={(e) => setAllotQty(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAllotModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={submitAllotment}>Confirm Allotment</Button>
                </DialogActions>
            </Dialog>

            {/* Purchase Request Dialog */}
            <Dialog open={openPurchaseModal} onClose={() => setOpenPurchaseModal(false)}>
                <DialogTitle>Request Purchase from Purchase Cell</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <TextField
                        label="Quantity Needed"
                        fullWidth
                        type="number"
                        value={purchaseQty}
                        onChange={(e) => setPurchaseQty(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPurchaseModal(false)}>Cancel</Button>
                    <Button onClick={submitPurchaseRequest} variant="contained">Send Request</Button>
                </DialogActions>
            </Dialog>

            {/* Add Stock Dialog */}
            <Dialog open={openAddStockModal} onClose={() => setOpenAddStockModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Opening Stock</DialogTitle>
                <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Autocomplete
                        options={stores}
                        getOptionLabel={(option) => option.storename || ""}
                        value={stores.find(s => s._id === newStock.storeid) || null}
                        onChange={(event, newValue) => setNewStock({ ...newStock, storeid: newValue ? newValue._id : '' })}
                        renderInput={(params) => <TextField {...params} label="Select Store" />}
                    />
                    <Autocomplete
                        options={allItems}
                        getOptionLabel={(option) => option.itemname || ""}
                        value={allItems.find(i => i._id === newStock.itemid) || null}
                        onChange={(event, newValue) => setNewStock({ ...newStock, itemid: newValue ? newValue._id : '' })}
                        renderInput={(params) => <TextField {...params} label="Select Item" />}
                    />
                    <TextField
                        label="Quantity"
                        type="number"
                        value={newStock.quantity}
                        onChange={(e) => setNewStock({ ...newStock, quantity: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddStockModal(false)}>Cancel</Button>
                    <Button onClick={handleAddStockSubmit} variant="contained">Add Stock</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default StoreManagerDashboardds;
