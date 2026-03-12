
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
    FormControl, InputLabel, Select, MenuItem, Autocomplete // Added
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';

import PRTemplate2 from './PRTemplate2';
import GRNTemplate2 from './GRNTemplate2';
import { createRoot } from 'react-dom/client';

const StoreManagerDashboardds2 = () => {
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

    // GRN State
    const [gatePasses, setGatePasses] = useState([]);
    const [completedGRNs, setCompletedGRNs] = useState([]);
    const [openGRNModal, setOpenGRNModal] = useState(false);
    const [selectedGatePass, setSelectedGatePass] = useState(null);
    const [grnItems, setGrnItems] = useState([]);
    const [grnRemarks, setGrnRemarks] = useState('');

    // Local Purchase History State
    const [localPurchaseHistory, setLocalPurchaseHistory] = useState([]);
    const [openEditLocalPOModal, setOpenEditLocalPOModal] = useState(false);
    const [editLocalPO, setEditLocalPO] = useState(null);

    // Inventory Edit/Delete State
    const [openEditStockModal, setOpenEditStockModal] = useState(false);
    const [editStockItem, setEditStockItem] = useState(null);

    // Local Purchase Restructure State
    const [localPurchaseSubTab, setLocalPurchaseSubTab] = useState(0);
    const [budgetHeads, setBudgetHeads] = useState([]);
    const [localPoBudgetHead, setLocalPoBudgetHead] = useState('');
    const [localPoApproxAmount, setLocalPoApproxAmount] = useState('');
    const [storeApprovalThreshold, setStoreApprovalThreshold] = useState(5000);

    // Update Actual PO State
    const [updateActualPO, setUpdateActualPO] = useState(null);
    const [newActualAmount, setNewActualAmount] = useState('');

    // Local GRN State
    const [localGRNModal, setLocalGRNModal] = useState(false);
    const [localGRNSelectedPO, setLocalGRNSelectedPO] = useState(null);
    const [localGRNItems, setLocalGRNItems] = useState([]);
    const [localGRNRemarks, setLocalGRNRemarks] = useState('');

    // Vendor Data State
    const [vendors, setVendors] = useState([]);
    const [vendorItems, setVendorItems] = useState([]);

    const fetchCategories = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallitemcategoryds2?colid=${global1.colid}`);
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
            const res = await ep1.get(`/api/v2/getallitemtypeds2?colid=${global1.colid}`);
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
            const res = await ep1.get(`/api/v2/getallitemunitds2?colid=${global1.colid}`);
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
        // Generate sequential PR Number: {prefix}{YYYY}{MM}{seq}
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = prConfigData.prshort || 'PU';
        const baseCode = `${prefix}-${yyyy}${mm}`;
        // Fetch existing PRs to determine next sequence
        let seq = 1;
        try {
            const res = await ep1.get(`/api/v2/getallstorerequisationds2?colid=${global1.colid}`);
            const allReqs = res.data.data.requisitions || [];
            const matching = allReqs.filter(r => r.prnumber && r.prnumber.startsWith(baseCode));
            if (matching.length > 0) {
                const maxSeq = Math.max(...matching.map(r => {
                    const parts = r.prnumber.split('-');
                    return parseInt(parts[parts.length - 1], 10) || 0;
                }));
                seq = maxSeq + 1;
            }
        } catch (e) { console.error('Error fetching PRs for sequence:', e); }
        const prNum = `${baseCode}-${String(seq).padStart(3, '0')}`;

        try {
            // Loop and Save
            for (const item of cart) {
                await ep1.post('/api/v2/addstorerequisationds2', {
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
            const response = await ep1.get(`/api/v2/getprconfigds2?colid=${global1.colid}`);
            if (response.data.data) {
                const data = response.data.data;
                setPrConfigData({
                    institutionname: data.institutionname || "People's Group",
                    address: data.address || "Karond Bhanpur By Pass Road, Bhopal-462037",
                    phone: data.phone || "+91-0755-4005013",
                    prshort: data.prshort || 'PU'
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
                name: global1.name
            };

            if (configId) {
                await ep1.post(`/api/v2/updateprconfigds2?id=${configId}`, payload);
            } else {
                await ep1.post('/api/v2/addprconfigds2', payload);
                fetchPRConfig();
            }
            alert('Configuration Saved Successfully');
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Failed to save configuration');
        }
    };

    const fetchVendorsList = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallvendords2?colid=${global1.colid}`);
            setVendors(res.data.data?.vendors || []);
        } catch (e) { console.error('Error fetching vendors', e); }
    };

    const fetchVendorItemsList = async () => {
        try {
            const res = await ep1.get(`/api/v2/getallvendoritemds2?colid=${global1.colid}`);
            setVendorItems(res.data.data?.vendorItems || []);
        } catch (e) { console.error('Error fetching vendor items', e); }
    };

    useEffect(() => {
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
        } else if (tabValue === 4) {
            fetchCashBalanceAndBudgets();
            fetchStores();
            fetchAllItems();
            fetchLocalPurchaseHistory();
        } else if (tabValue === 7) {
            fetchVendorsList();
        } else if (tabValue === 8) {
            fetchVendorsList();
            fetchAllItems();
            fetchVendorItemsList();
        }

        // Always fetch config
        fetchPRConfig();
    }, [tabValue]);

    // Local Purchase State
    const [myCashBalance, setMyCashBalance] = useState(0);
    const [localPoAmount, setLocalPoAmount] = useState('');
    const [localPoVendor, setLocalPoVendor] = useState('');
    const [localPoCategory, setLocalPoCategory] = useState('');
    const [localPoType, setLocalPoType] = useState('');
    const [localPoItem, setLocalPoItem] = useState(null);
    const [localPoUnit, setLocalPoUnit] = useState('');
    const [localPoQty, setLocalPoQty] = useState('');

    const fetchLocalPurchaseHistory = async () => {
        try {
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMapping = mappings.find(m => m.user === global1.user || m.userid === global1.user);

            const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            let poOrders = res.data.data.poOrders || [];
            // Filter only Local type POs
            poOrders = poOrders.filter(po => po.poType === 'Local');
            // Filter by user's store if mapping found
            if (userMapping) {
                poOrders = poOrders.filter(po => po.storeid === userMapping.storeid || po.storename === userMapping.store);
            }
            setLocalPurchaseHistory(poOrders.map(po => ({ ...po, id: po._id })));
        } catch (e) {
            console.error('Error fetching local purchase history:', e);
        }
    };

    const handleDeleteLocalPO = async (id) => {
        if (!window.confirm('Are you sure you want to delete this local purchase record?')) return;
        try {
            await ep1.post(`/api/v2/deletestorepoorderds2?id=${id}`);
            setLocalPurchaseHistory(prev => prev.filter(p => p._id !== id));
        } catch (e) {
            alert('Failed to delete: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleSaveEditLocalPO = async () => {
        if (!editLocalPO) return;
        try {
            await ep1.post(`/api/v2/updatestorepoorderds2?id=${editLocalPO._id}`, {
                vendorname: editLocalPO.vendorname,
                actualAmount: Number(editLocalPO.actualAmount),
                price: Number(editLocalPO.actualAmount),
                netprice: Number(editLocalPO.actualAmount),
                postatus: editLocalPO.postatus,
                colid: global1.colid
            });
            setOpenEditLocalPOModal(false);
            fetchLocalPurchaseHistory();
        } catch (e) {
            alert('Failed to update: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleDeleteStockItem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
        try {
            await ep1.post(`/api/v2/deletestoreitemds2?id=${id}`);
            setInventory(prev => prev.filter(i => i._id !== id));
        } catch (e) {
            alert('Failed to delete: ' + (e.response?.data?.message || e.message));
        }
    };

    const handleSaveEditStock = async () => {
        if (!editStockItem) return;
        try {
            await ep1.post(`/api/v2/updatestoreitemds2?id=${editStockItem._id}`, {
                quantity: Number(editStockItem.quantity),
                status: editStockItem.status,
                colid: global1.colid
            });
            setOpenEditStockModal(false);
            fetchInventory();
        } catch (e) {
            alert('Failed to update: ' + (e.response?.data?.message || e.message));
        }
    };

    const fetchCashBalanceAndBudgets = async () => {
        try {
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMapping = mappings.find(m => m.user === global1.user || m.userid === global1.user);
            if (userMapping) {
                const res = await ep1.get(`/api/v2/getstorecashaccounts2?colid=${global1.colid}&storeid=${userMapping.storeid}`);
                const account = res.data.data && res.data.data.length > 0 ? res.data.data[0] : null;
                setMyCashBalance(account ? account.balance : 0);
                if (account && account.approvalThreshold !== undefined) {
                    setStoreApprovalThreshold(account.approvalThreshold);
                }

                const budgetRes = await ep1.get(`/api/v2/getstorebudgets2?colid=${global1.colid}&storeid=${userMapping.storeid}`);
                setBudgetHeads(budgetRes.data.data || []);
            }
        } catch (e) {
            console.error("error fetching cash balance/budgets", e);
        }
    }

    const handleLocalPurchase = async () => {
        if (!localPoApproxAmount || !localPoVendor || !localPoItem || !localPoQty || !localPoUnit || !localPoBudgetHead) return alert("Fill all fields including Budget Head & Amount");

        const approxAmt = Number(localPoApproxAmount);
        const requiresApproval = approxAmt > storeApprovalThreshold;
        if (!requiresApproval && approxAmt > myCashBalance) return alert("Insufficient Cash Balance for Auto-Approval");

        try {
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
            const mappings = mapRes.data.data.storeUsers || [];
            const userMapping = mappings.find(m => m.user === global1.user || m.userid === global1.user);
            if (!userMapping) return alert("No store mapped to your user.");

            // Generate Sequential LPO
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const uniq = String(Date.now()).slice(-4);
            const lpoNum = `PU-${yyyy}${mm}${uniq}`;

            const poPayload = {
                name: `Local-PO-${lpoNum}`,
                vendorname: localPoVendor,
                vendor: localPoVendor,
                year: yyyy.toString(),
                poid: lpoNum,
                postatus: requiresApproval ? 'Pending Approval' : 'Auto Approved',
                poType: 'Local',
                deliveryType: 'Direct Local',
                colid: global1.colid,
                user: global1.user,
                price: approxAmt,
                netprice: approxAmt,
                actualAmount: 0,
                creatorName: global1.name || global1.user,
                storeid: userMapping.storeid,
                storename: userMapping.store,
                budgetHeadId: localPoBudgetHead // Tracking local budget usage
            };
            const poRes = await ep1.post('/api/v2/addstorepoorderds2', poPayload);
            const currentPO = poRes.data.data;

            if (!requiresApproval) {
                // Deduct cash automatically if below threshold
                await ep1.post('/api/v2/deductcashforlocalpo2', {
                    poid: currentPO.poid,
                    colid: global1.colid,
                    actualAmount: approxAmt // Deduct approx initially, actual later
                });
            }

            // Create inventory item outline to wait for GRN
            await ep1.post('/api/v2/addstoreitemds2', {
                colid: global1.colid,
                user: global1.user,
                storeid: userMapping.storeid,
                storename: userMapping.store,
                itemid: localPoItem._id,
                itemcode: localPoItem.itemcode,
                itemname: localPoItem.itemname,
                quantity: 0, // Stock goes up when GRN is created
                type: localPoItem.itemtype,
                status: poPayload.postatus === 'Pending Approval' ? 'Awaiting Approval' : 'Awaiting Delivery (GRN)',
                remarks: `LPO: ${lpoNum}`
            });

            alert(requiresApproval ? `LPO Created & sent for Higher Authority Approval. Amount: ₹${approxAmt}` : `LPO Auto-Approved. Cash Deducted by ₹${approxAmt}`);
            setLocalPoApproxAmount(''); setLocalPoVendor(''); setLocalPoCategory(''); setLocalPoType(''); setLocalPoItem(null); setLocalPoUnit(''); setLocalPoQty(''); setLocalPoBudgetHead('');
            fetchCashBalanceAndBudgets();
            fetchLocalPurchaseHistory();
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Failed to create Local Purchase Request");
        }
    };

    const handleUpdateActualAmount = async () => {
        if (!newActualAmount || isNaN(newActualAmount)) return alert("Enter valid Actual Amount");
        const actAmt = Number(newActualAmount);

        try {
            const res = await ep1.post(`/api/v2/updatelpoactualamount2`, {
                colid: global1.colid,
                poid: updateActualPO.poid,
                newActualAmount: actAmt,
                user: global1.user
            });
            alert(res.data.message);
            setUpdateActualPO(null);
            setNewActualAmount('');
            fetchCashBalanceAndBudgets();
            fetchLocalPurchaseHistory();
        } catch (e) {
            console.error(e);
            alert(e.response?.data?.message || "Failed to update actual amount.");
        }
    };

    const handleCreateLocalGRN = async () => {
        if (!localGRNSelectedPO) return alert("Select PO");
        try {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const uniq = String(Date.now()).slice(-4);
            const grnData = {
                grnNo: `GRN-${yyyy}${mm}${uniq}`,
                lpoId: localGRNSelectedPO.poid,
                storeid: localGRNSelectedPO.storeid,
                storeName: localGRNSelectedPO.storename,
                vendorName: localGRNSelectedPO.vendorname,
                items: localGRNItems,
                receivedBy: global1.name || global1.user,
                colid: global1.colid
            };
            await ep1.post('/api/v2/addlocalgrnds2', grnData);

            // Now update the pending inventory item's quantity to reflect delivery
            // We'd usually call an endpoint to update storeitem quantity based on remarks logic.

            alert('Local GRN created successfully!');
            setLocalGRNModal(false);
            fetchLocalPurchaseHistory();
        } catch (error) {
            console.error(error);
            alert("Failed to create GRN: " + (error.response?.data?.error || error.message));
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallrequisationds2?colid=${global1.colid}`);
            let all = response.data.data.requisitions || [];

            // Filter by Assigned Stores
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
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
            const response = await ep1.get(`/api/v2/getallstoreitemds2?colid=${global1.colid}`);
            let items = response.data.data.storeItems || [];

            // Filter by Visible Stores (if stores state is populated)
            // Note: fetchStores() runs concurrently or before/after. 
            // Better to rely on the same logic or ensure stores are loaded.
            // However, since stores state update might lag, let's re-implement the check logic or wait for stores.
            // Actually, we can just filter by the same logic here or simpler:
            // If we want strict security, we'd do it on backend. Frontend: filter by 'stores' state if available.
            // But 'stores' state might not be ready yet.
            // Let's replicate the mapping check for robustness.

            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
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
            // Fetch sent requests (storerequisationds2)
            const response = await ep1.get(`/api/v2/getallstorerequisationds2?colid=${global1.colid}`);
            let all = response.data.data.requisitions || [];

            // Filter by Assigned Stores
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
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

        const createdByName = global1.name || global1.user || 'Unknown';

        root.render(
            <PRTemplate2
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
            const res = await ep1.get(`/api/v2/getallstoremasterds2?colid=${global1.colid}`);
            const allStores = res.data.data.stores || [];

            // 2. Fetch User-Store Mappings
            const mapRes = await ep1.get(`/api/v2/getallstoreuserds2?colid=${global1.colid}`);
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
    const fetchAllItems = async () => { try { const res = await ep1.get(`/api/v2/getallitemmasterds2?colid=${global1.colid}`); setAllItems(res.data.data.items || []); } catch (e) { console.error(e); } };

    // --- Allotment Logic ---
    const handleOpenAllot = async (request) => {
        setSelectedRequest(request);
        setAllotQty(request.quantity); // Default to full amount
        setCurrentStock('Checking...');
        setOpenAllotModal(true);

        // Fetch Live Stock Availability
        try {
            const invRes = await ep1.get(`/api/v2/getallstoreitemds2?colid=${global1.colid}`);
            const storeItems = invRes.data.data.storeItems || [];
            const matchingItem = storeItems.find(si =>
                ((request.itemcode && si.itemcode === request.itemcode) ||
                    (request.itemname && si.itemname === request.itemname) ||
                    (request.itemid && si.itemid === request.itemid)) &&
                si.storeid === request.storeid
            );
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
            const invRes = await ep1.get(`/api/v2/getallstoreitemds2?colid=${global1.colid}`);
            const storeItems = invRes.data.data.storeItems || [];
            const matchingItem = storeItems.find(si =>
                ((selectedRequest.itemcode && si.itemcode === selectedRequest.itemcode) ||
                    (selectedRequest.itemname && si.itemname === selectedRequest.itemname) ||
                    (selectedRequest.itemid && si.itemid === selectedRequest.itemid)) &&
                si.storeid === selectedRequest.storeid
            );

            if (!matchingItem) {
                alert('Item not found in inventory during processing.');
                return;
            }

            const response = await ep1.post('/api/v2/allotitem2', {
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
            await ep1.post('/api/v2/addstorerequisationds2', {
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
            await ep1.post(`/api/v2/updaterequisationds2?id=${selectedRequest._id}`, {
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

            await ep1.post('/api/v2/addstoreitemds2', {
                colid: global1.colid,
                user: global1.user,
                storeid: newStock.storeid,
                storename: selectedStore?.storename,
                itemid: newStock.itemid,
                itemcode: selectedItem?.itemcode,
                itemname: selectedItem?.itemname,
                category: selectedItem?.category,
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
            // Generate sequential PR Number: {prefix}{YYYY}{MM}{seq}
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const prefix = prConfigData.prshort || 'PU';
            const baseCode = `${prefix}-${yyyy}${mm}`;
            let seq = 1;
            try {
                const seqRes = await ep1.get(`/api/v2/getallstorerequisationds2?colid=${global1.colid}`);
                const allReqs = seqRes.data.data.requisitions || [];
                const matching = allReqs.filter(r => r.prnumber && r.prnumber.startsWith(baseCode));
                if (matching.length > 0) {
                    const maxSeq = Math.max(...matching.map(r => {
                        const parts = r.prnumber.split('-');
                        return parseInt(parts[parts.length - 1], 10) || 0;
                    }));
                    seq = maxSeq + 1;
                }
            } catch (e) { console.error('Error fetching PRs for sequence:', e); }
            prNum = `${baseCode}-${String(seq).padStart(3, '0')}`;

            // Save to Backend
            try {
                await ep1.post(`/api/v2/updaterequisationds2?id=${row._id}`, {
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
            <PRTemplate2
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
                        return isNaN(date.getTime()) ? params.value : date.toLocaleDateString('en-GB');
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
        { field: 'reqdate', headerName: 'Date', width: 150, valueFormatter: (params) => { const val = params?.value || params; return val ? new Date(val).toLocaleDateString('en-GB') : ''; } },
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
                <Tab label="Local Purchases (Cash)" />
                <Tab label="Configuration" />
                <Tab label="GRN" />
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
                                { field: 'category', headerName: 'Category', width: 150 },
                                { field: 'type', headerName: 'Type', width: 120 },
                                { field: 'itemcode', headerName: 'Item Code', width: 130 },
                                { field: 'quantity', headerName: 'Quantity', width: 110 },
                                { field: 'storename', headerName: 'Store', width: 180 },
                                { field: 'status', headerName: 'Status', width: 120 },
                                {
                                    field: 'updatedate',
                                    headerName: 'Last Updated',
                                    width: 160,
                                    valueFormatter: (params) => { const val = params?.value || params; return val ? new Date(val).toLocaleString('en-GB') : ''; }
                                },
                                {
                                    field: 'actions',
                                    headerName: 'Actions',
                                    width: 180,
                                    sortable: false,
                                    renderCell: (params) => (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => {
                                                    setEditStockItem({ ...params.row });
                                                    setOpenEditStockModal(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDeleteStockItem(params.row._id)}
                                            >
                                                Delete
                                            </Button>
                                        </Box>
                                    )
                                }
                            ]}
                            pageSizeOptions={[10, 25, 50]}
                        />
                    </Box>
                </Box>
            )}

            {/* Configuration Tab */}
            {tabValue === 5 && (
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
                                label="PR Short Code (e.g., PU)"
                                fullWidth
                                value={prConfigData.prshort}
                                onChange={(e) => setPrConfigData({ ...prConfigData, prshort: e.target.value })}
                                helperText="This code will be prefixed to generated PR Numbers. (Default: PU)"
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
                                { field: 'reqdate', headerName: 'Date', width: 150, valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB') },
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

            {/* Local Purchases Tab Rewrite */}
            {tabValue === 4 && (
                <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
                    <Typography variant="h5" gutterBottom>Local Store Purchases</Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h6">Available Cash Balance:</Typography>
                        <Typography variant="h6" color={myCashBalance > 0 ? "success.main" : "error.main"}>
                            ₹{myCashBalance}
                        </Typography>
                    </Box>

                    <Paper sx={{ mb: 3 }}>
                        <Tabs
                            value={localPurchaseSubTab}
                            onChange={(e, val) => setLocalPurchaseSubTab(val)}
                            textColor="secondary"
                            indicatorColor="secondary"
                        >
                            <Tab label="1. Create Local PO" />
                            <Tab label="2. Update Actual Amount" />
                            <Tab label="3. Local GRN" />
                        </Tabs>
                    </Paper>

                    {/* SUB-TAB 0: Create LPO */}
                    {localPurchaseSubTab === 0 && (
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Budget Head</InputLabel>
                                        <Select
                                            value={localPoBudgetHead}
                                            label="Budget Head"
                                            onChange={(e) => setLocalPoBudgetHead(e.target.value)}
                                        >
                                            {budgetHeads.map(b => <MenuItem key={b._id} value={b._id}>{b.headName} ({b.headType}) - ₹{b.availableBudget} Avail</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Approximate Amount (₹)"
                                        type="number"
                                        size="small"
                                        fullWidth
                                        value={localPoApproxAmount}
                                        onChange={(e) => setLocalPoApproxAmount(e.target.value)}
                                        helperText={`If > ₹${storeApprovalThreshold}, requires Higher Authority Approval`}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={3}>
                                    <Autocomplete
                                        options={apiCategories.length > 0 ? apiCategories : [...new Set(allItems.map(i => i.category || '').filter(Boolean))]}
                                        value={localPoCategory}
                                        onOpen={fetchCategories}
                                        onChange={(e, val) => {
                                            setLocalPoCategory(val || '');
                                            setLocalPoType('');
                                            setLocalPoItem(null);
                                            setLocalPoUnit('');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Category" size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Autocomplete
                                        options={apiTypes.length > 0 ? apiTypes : [...new Set(allItems.filter(i => !localPoCategory || i.category === localPoCategory).map(i => i.itemtype || '').filter(Boolean))]}
                                        value={localPoType}
                                        onOpen={fetchTypes}
                                        onChange={(e, val) => {
                                            setLocalPoType(val || '');
                                            setLocalPoItem(null);
                                            setLocalPoUnit('');
                                        }}
                                        disabled={!localPoCategory}
                                        renderInput={(params) => <TextField {...params} label="Type" size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Autocomplete
                                        options={allItems.filter(i =>
                                            (!localPoCategory || (i.category || '') === localPoCategory) &&
                                            (!localPoType || (i.itemtype || '') === localPoType)
                                        )}
                                        getOptionLabel={(option) => option.itemname || ""}
                                        value={localPoItem}
                                        onChange={(e, val) => {
                                            setLocalPoItem(val);
                                            setLocalPoUnit(val?.unit || '');
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Select Item" size="small" />}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Autocomplete
                                        options={apiUnits}
                                        value={localPoUnit}
                                        onOpen={fetchUnits}
                                        onChange={(e, val) => setLocalPoUnit(val || '')}
                                        renderInput={(params) => <TextField {...params} label="Unit" size="small" />}
                                    />
                                </Grid>
                            </Grid>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Quantity Needed"
                                        type="number"
                                        fullWidth
                                        value={localPoQty}
                                        onChange={(e) => setLocalPoQty(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Local Vendor / Shop Name"
                                        fullWidth
                                        value={localPoVendor}
                                        onChange={(e) => setLocalPoVendor(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                                    <Button variant="contained" color="secondary" onClick={handleLocalPurchase}>
                                        Create Local Purchase Order
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* LPO Status History */}
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" mb={1}>LPO Tracking</Typography>
                                <Box sx={{ height: 300, width: '100%' }}>
                                    <DataGrid
                                        rows={localPurchaseHistory}
                                        columns={[
                                            { field: 'poid', headerName: 'LPO No', width: 150 },
                                            { field: 'vendorname', headerName: 'Vendor', width: 180 },
                                            { field: 'price', headerName: 'Approx (₹)', width: 110 },
                                            { field: 'actualAmount', headerName: 'Actual (₹)', width: 110 },
                                            {
                                                field: 'postatus', headerName: 'Status', width: 180,
                                                renderCell: (params) => (
                                                    <Typography variant="body2" color={params.value === 'Pending Approval' ? 'warning.main' : 'success.main'}>
                                                        {params.value}
                                                    </Typography>
                                                )
                                            },
                                            { field: 'createdAt', headerName: 'Date', width: 120, valueFormatter: (params) => new Date(params.value).toLocaleDateString('en-GB') }
                                        ]}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* SUB-TAB 1: Update Actual Amount */}
                    {localPurchaseSubTab === 1 && (
                        <Box>
                            <Typography variant="body1" mb={2}>Select an approved LPO to input the final actual amount spent.</Typography>

                            {updateActualPO ? (
                                <Paper sx={{ p: 3, mb: 3 }}>
                                    <Typography variant="h6">Update Total for {updateActualPO.poid}</Typography>
                                    <Typography variant="body2" mb={2}>Vendor: {updateActualPO.vendorname} | Approx: ₹{updateActualPO.price}</Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="New Actual Amount (₹)"
                                                value={newActualAmount}
                                                onChange={(e) => setNewActualAmount(e.target.value)}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Button variant="contained" color="primary" onClick={handleUpdateActualAmount}>Submit Actual</Button>
                                            <Button variant="outlined" onClick={() => setUpdateActualPO(null)}>Cancel</Button>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            ) : null}

                            <Box sx={{ height: 350, width: '100%' }}>
                                <DataGrid
                                    rows={localPurchaseHistory.filter(po => po.postatus === 'Auto Approved' || po.postatus === 'Approved')}
                                    columns={[
                                        { field: 'poid', headerName: 'LPO No', width: 150 },
                                        { field: 'vendorname', headerName: 'Vendor', width: 200 },
                                        { field: 'price', headerName: 'Approx Amt (₹)', width: 150 },
                                        { field: 'actualAmount', headerName: 'Actual Amt (₹)', width: 150 },
                                        {
                                            field: 'actions', headerName: 'Action', width: 150, renderCell: (params) => (
                                                <Button size="small" variant="contained" onClick={() => {
                                                    setUpdateActualPO(params.row);
                                                    setNewActualAmount(params.row.actualAmount > 0 ? params.row.actualAmount : '');
                                                }}>Update Actual</Button>
                                            )
                                        }
                                    ]}
                                />
                            </Box>
                        </Box>
                    )}

                    {/* SUB-TAB 2: Local GRN */}
                    {localPurchaseSubTab === 2 && (
                        <Box>
                            <Typography variant="body1" mb={2}>Create GRN for delivered Local Purchases. Items will be added to Available Stock.</Typography>

                            <Box sx={{ height: 350, width: '100%', mb: 2 }}>
                                <DataGrid
                                    rows={localPurchaseHistory.filter(po => (po.postatus === 'Auto Approved' || po.postatus === 'Approved'))} // In a real app we filter out POs that already have full GRNs
                                    columns={[
                                        { field: 'poid', headerName: 'LPO No', width: 150 },
                                        { field: 'vendorname', headerName: 'Vendor', width: 200 },
                                        { field: 'status', headerName: 'Status', width: 150, valueGetter: () => 'Awaiting GRN' },
                                        {
                                            field: 'actions', headerName: 'Action', width: 150, renderCell: (params) => (
                                                <Button size="small" color="secondary" variant="contained" onClick={() => {
                                                    setLocalGRNSelectedPO(params.row);
                                                    setLocalGRNItems([{
                                                        itemname: "Local PO Items (See Invoice)",
                                                        quantity: 1,
                                                        unit: "Lot",
                                                        remarks: ""
                                                    }]);
                                                    setLocalGRNRemarks('');
                                                    setLocalGRNModal(true);
                                                }}>Create GRN</Button>
                                            )
                                        }
                                    ]}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

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

            {/* ── Edit Stock Item Dialog ─────────────────────────────────── */}
            <Dialog open={openEditStockModal} onClose={() => setOpenEditStockModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Inventory Item</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {editStockItem && (
                        <>
                            <Typography variant="body1"><strong>Item:</strong> {editStockItem.itemname} ({editStockItem.itemcode})</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Store:</strong> {editStockItem.storename}</Typography>
                            <TextField
                                label="Quantity"
                                type="number"
                                fullWidth
                                value={editStockItem.quantity}
                                onChange={(e) => setEditStockItem({ ...editStockItem, quantity: e.target.value })}
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                label="Status"
                                fullWidth
                                value={editStockItem.status || 'Available'}
                                onChange={(e) => setEditStockItem({ ...editStockItem, status: e.target.value })}
                                helperText="e.g. Available, Low Stock, Out of Stock"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditStockModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEditStock}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* ── Edit Local PO Dialog ──────────────────────────────────────── */}
            <Dialog open={openEditLocalPOModal} onClose={() => setOpenEditLocalPOModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Local Purchase Record</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {editLocalPO && (
                        <>
                            <Typography variant="body2" color="text.secondary"><strong>PO ID:</strong> {editLocalPO.poid}</Typography>
                            <TextField
                                label="Vendor / Shop Name"
                                fullWidth
                                value={editLocalPO.vendorname || ''}
                                onChange={(e) => setEditLocalPO({ ...editLocalPO, vendorname: e.target.value })}
                                sx={{ mt: 1 }}
                            />
                            <TextField
                                label="Amount Spent (₹)"
                                type="number"
                                fullWidth
                                value={editLocalPO.actualAmount || ''}
                                onChange={(e) => setEditLocalPO({ ...editLocalPO, actualAmount: e.target.value })}
                            />
                            <TextField
                                label="Status"
                                fullWidth
                                value={editLocalPO.postatus || 'Completed'}
                                onChange={(e) => setEditLocalPO({ ...editLocalPO, postatus: e.target.value })}
                                helperText="e.g. Completed, Cancelled"
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditLocalPOModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveEditLocalPO}>Save Changes</Button>
                </DialogActions>
            </Dialog>

            {/* ── GRN Tab ────────────────────────────────────────────────── */}
            {
                tabValue === 6 && (() => {
                    const fetchGatePasses = async () => {
                        try {
                            const res = await ep1.get(`/api/v2/getallgatewaypasses2?colid=${global1.colid}`);
                            const all = (res.data.data || []).filter(p => p.passType === 'Inward');
                            setGatePasses(all.map(p => ({ ...p, id: p._id })));
                        } catch (e) { console.error(e); }
                    };
                    const fetchGRNs = async () => {
                        try {
                            const res = await ep1.get(`/api/v2/getallgrnds2?colid=${global1.colid}`);
                            setCompletedGRNs((res.data.data || []).map(g => ({ ...g, id: g._id })));
                        } catch (e) { console.error(e); }
                    };
                    if (gatePasses.length === 0) fetchGatePasses();
                    if (completedGRNs.length === 0) fetchGRNs();

                    const handleOpenGRNModal = (pass) => {
                        setSelectedGatePass(pass);
                        setGrnRemarks('');
                        setGrnItems((pass.items || []).map(item => ({
                            ...item,
                            grnQuantity: item.deliveredQuantity
                        })));
                        setOpenGRNModal(true);
                    };

                    const handleSubmitGRN = async () => {
                        if (!selectedGatePass) return;
                        try {
                            await ep1.post('/api/v2/addgrnds2', {
                                gatePassNumber: selectedGatePass.passNumber,
                                poid: selectedGatePass.poid,
                                colid: global1.colid,
                                storeId: global1.storeid || '',
                                storeName: global1.storename || '',
                                receivedBy: global1.name || global1.user,
                                items: grnItems,
                                remarks: grnRemarks,
                                billAmount: selectedGatePass.billAmount || 0,
                                user: global1.user
                            });
                            alert('GRN created successfully!');
                            setOpenGRNModal(false);
                            setGatePasses([]);
                            setCompletedGRNs([]);
                        } catch (err) {
                            alert('Failed to create GRN: ' + (err.response?.data?.error || err.message));
                        }
                    };

                    const handlePrintGRN = (grn) => {
                        const printWindow = window.open('', '', 'height=900,width=900');
                        printWindow.document.write('<html><head><title>GRN - ' + (grn.grnNo || '') + '</title></head><body><div id="grn-print-root"></div></body></html>');
                        printWindow.document.close();
                        const root = createRoot(printWindow.document.getElementById('grn-print-root'));
                        root.render(
                            <GRNTemplate2
                                poData={grn}
                                items={grn.items || []}
                                grnNumber={grn.grnNo}
                                instituteName={prConfigData.institutionname}
                                instituteAddress={prConfigData.address}
                                institutePhone={prConfigData.phone}
                                extraData={{
                                    gatePassNumber: grn.gatePassNumber,
                                    receivedBy: grn.receivedBy,
                                    vehicleNo: grn.vehicleNo,
                                    lrNo: grn.lrNo,
                                    dcInvoiceNo: grn.dcInvoiceNo,
                                    billAmount: grn.billAmount,
                                    remarks: grn.remarks
                                }}
                            />
                        );
                        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1000);
                    };

                    const openPassesFiltered = gatePasses.filter(p => p.status !== 'GRN Created');
                    const gpColumns = [
                        { field: 'passNumber', headerName: 'Pass No', width: 140 },
                        { field: 'poid', headerName: 'PO ID', width: 140 },
                        { field: 'vendorName', headerName: 'Vendor', width: 150 },
                        { field: 'vehicleNo', headerName: 'Vehicle', width: 110 },
                        { field: 'deliveryPersonName', headerName: 'Delivery Person', width: 140 },
                        { field: 'createdAt', headerName: 'Date', width: 100, valueFormatter: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '' },
                        { field: 'actions', headerName: 'Action', width: 130, renderCell: (p) => <Button variant="contained" size="small" onClick={() => handleOpenGRNModal(p.row)}>Create GRN</Button> }
                    ];
                    const grnColumns = [
                        { field: 'grnNo', headerName: 'GRN No', width: 160 },
                        { field: 'gatePassNumber', headerName: 'Gate Pass', width: 130 },
                        { field: 'poid', headerName: 'PO ID', width: 130 },
                        { field: 'vendorName', headerName: 'Vendor', width: 150 },
                        { field: 'status', headerName: 'Status', width: 120 },
                        { field: 'grnDate', headerName: 'GRN Date', width: 100, valueFormatter: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '' },
                        { field: 'actions', headerName: 'Actions', width: 120, renderCell: (p) => <Button size="small" variant="outlined" onClick={() => handlePrintGRN(p.row)}>Print GRN</Button> }
                    ];

                    return (
                        <Box>
                            <Typography variant="h6" gutterBottom>Open Gate Passes (GRN Pending)</Typography>
                            <Paper sx={{ height: 350, mb: 4 }}>
                                <DataGrid rows={openPassesFiltered} columns={gpColumns} pageSizeOptions={[10]} />
                            </Paper>
                            <Typography variant="h6" gutterBottom>Created GRNs</Typography>
                            <Paper sx={{ height: 350 }}>
                                <DataGrid rows={completedGRNs} columns={grnColumns} pageSizeOptions={[10]} />
                            </Paper>

                            <Dialog open={openGRNModal} onClose={() => setOpenGRNModal(false)} maxWidth="md" fullWidth>
                                <DialogTitle>Create GRN — Gate Pass: {selectedGatePass?.passNumber}</DialogTitle>
                                <DialogContent dividers>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Vendor: {selectedGatePass?.vendorName} | PO: {selectedGatePass?.poid} | Vehicle: {selectedGatePass?.vehicleNo}
                                    </Typography>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                        <thead>
                                            <tr style={{ background: '#f5f5f5' }}>
                                                {['Sr.', 'Item', 'Unit', 'Expected Qty', 'Delivered Qty', 'GRN Qty (Confirm)'].map(h => (
                                                    <th key={h} style={{ border: '1px solid #ddd', padding: '6px 8px', textAlign: 'left' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {grnItems.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}>{idx + 1}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}>{item.itemname}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}>{item.unit}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}>{item.expectedQuantity}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}>{item.deliveredQuantity}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}>
                                                        <TextField type="number" size="small" sx={{ width: 80 }}
                                                            value={item.grnQuantity}
                                                            onChange={(e) => {
                                                                const nw = [...grnItems];
                                                                nw[idx].grnQuantity = e.target.value;
                                                                setGrnItems(nw);
                                                            }}
                                                            inputProps={{ min: 0, max: item.deliveredQuantity }} />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <TextField fullWidth label="Remarks" multiline rows={2} value={grnRemarks} onChange={(e) => setGrnRemarks(e.target.value)} sx={{ mt: 2 }} />
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpenGRNModal(false)}>Cancel</Button>
                                    <Button variant="contained" onClick={handleSubmitGRN}>Save & Send to Quality Check</Button>
                                </DialogActions>
                            </Dialog>
                        </Box>
                    );
                })()
            }


        </Box >
    );
};

export default StoreManagerDashboardds2;
