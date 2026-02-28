import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Chip, Button, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
    TextField, Switch, FormControlLabel, Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';
import POInvoiceTemplate from './POInvoiceTemplate';
import ImprestManagerds from './ImprestManagerds';

const PurchaseOrderDashboardNewds = ({ role }) => {
    const [tabValue, setTabValue] = useState(0);
    const [storeRequests, setStoreRequests] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [vendorItems, setVendorItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);

    const [selectedVendor, setSelectedVendor] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedMasterItem, setSelectedMasterItem] = useState('');
    const [poItems, setPoItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPOId, setEditingPOId] = useState(null);
    const [editingPOObj, setEditingPOObj] = useState(null);
    const [activeStoreRequestId, setActiveStoreRequestId] = useState(null);

    const [openViewModal, setOpenViewModal] = useState(false);
    const [viewPOData, setViewPOData] = useState(null);
    const [viewPOItems, setViewPOItems] = useState([]);
    const [viewVendorData, setViewVendorData] = useState(null);

    const [selectedItem, setSelectedItem] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    const [instName, setInstName] = useState("PEOPLE'S PUBLIC SCHOOL");
    const [instAddress, setInstAddress] = useState("BHANPUR, KAROND BYPASS ROAD, BHOPAL (M.P.) - 462010");
    const [instPhone, setInstPhone] = useState("(0755) 4005170");
    const [instShortName, setInstShortName] = useState("PPS");
    const [isAmendment, setIsAmendment] = useState(false);

    const [approvalConfig, setApprovalConfig] = useState([]);
    const [poConfig, setPoConfig] = useState({ notes: '', terms: '' });

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPaginationModel({ page: 0, pageSize: 10 });
    }, [tabValue]);

    useEffect(() => {
        setLoading(true);
        if (!global1.colid && localStorage.getItem('colid')) {
            global1.colid = localStorage.getItem('colid');
            global1.user = localStorage.getItem('user');
            global1.name = localStorage.getItem('name');
            global1.department = localStorage.getItem('department');
        }

        const fetchData = async () => {
            const page = paginationModel.page + 1;
            const limit = paginationModel.pageSize;
            if (tabValue === 0) await fetchStoreRequests(page, limit);
            if (tabValue === 1) {
                await fetchStoreRequests(); // Fetch PRs for the dropdown
                fetchVendors(); fetchAllItems(); fetchVendorItems(); fetchPoConfig();
            }
            if (tabValue === 2) { await fetchPOs(page, limit); fetchApprovalConfig(); fetchPoConfig(); }
            setLoading(false);
        };
        fetchData();
    }, [tabValue, paginationModel]);

    const fetchPoConfig = async () => {
        try {
            const res = await ep1.get(`/api/v2/getpoconfigds?colid=${global1.colid}`);
            if (res.data.data) setPoConfig(res.data.data);
        } catch (e) { console.error("Error fetching PO config", e); }
    };

    const fetchApprovalConfig = async () => {
        try {
            const response = await ep1.get(`/api/v2/getapprovalconfig?colid=${global1.colid}&module=Purchase Order`);
            setApprovalConfig(response.data.data);
        } catch (error) { console.error('Error fetching config:', error); }
    };

    const fetchStoreRequests = async (page, limit) => {
        try {
            let url;
            const currentRole = role || global1.role;
            if (currentRole === 'OE' || currentRole === 'PE') {
                url = page ? `/api/v2/getAssignedRequisitions?colid=${global1.colid}&page=${page}&limit=${limit}&user=${global1.user}`
                    : `/api/v2/getAssignedRequisitions?colid=${global1.colid}&user=${global1.user}`;
            } else {
                url = page ? `/api/v2/getallstorerequisationds?colid=${global1.colid}&page=${page}&limit=${limit}`
                    : `/api/v2/getallstorerequisationds?colid=${global1.colid}`;
            }
            const response = await ep1.get(url);
            let reqs = response.data.data.requisitions || [];

            try {
                const assignRes = await ep1.get(`/api/v2/getallprassigneds?colid=${global1.colid}`);
                const assignments = assignRes.data?.data?.assignments || [];
                reqs = reqs.map(r => {
                    const assignedInfo = assignments.find(a => a.storereqid === r._id);
                    return {
                        ...r,
                        assignedTo: assignedInfo ? assignedInfo.prassignename : (r.reqstatus === 'Assigned' || r.reqstatus === 'PO Created' ? 'Unknown' : 'Not Assigned'),
                        id: r._id
                    };
                });
            } catch (err) {
                console.error("Error fetching assignments for reqs", err);
                reqs = reqs.map(r => ({ ...r, id: r._id }));
            }

            setStoreRequests(reqs);
            if (page) setRowCount(response.data.total || response.data.count || 0);
        } catch (error) { console.error(error); }
    };

    const fetchVendors = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallvendords?colid=${global1.colid}`);
            setVendors(response.data.data.vendors || response.data.data || []);
        } catch (error) { console.error(error); }
    };

    const fetchAllItems = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallitemmasterds?colid=${global1.colid}`);
            setAllItems(response.data.data.items || []);
        } catch (error) { console.error(error); }
    };

    const fetchVendorItems = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallvendoritemds?colid=${global1.colid}`);
            setVendorItems(response.data.data.vendorItems || []);
        } catch (error) { console.error(error); }
    };

    const fetchPOs = async (page, limit) => {
        try {
            const url = page ? `/api/v2/getallstorepoorderds?colid=${global1.colid}&page=${page}&limit=${limit}` : `/api/v2/getallstorepoorderds?colid=${global1.colid}`;
            const response = await ep1.get(url);
            const orders = response.data.data.poOrders || [];
            setPurchaseOrders(orders.map(p => ({ ...p, id: p._id })));
            if (page) setRowCount(response.data.total || response.data.count || 0);
        } catch (error) { console.error(error); }
    };

    useEffect(() => {
        if (selectedVendor) {
            setFilteredItems(vendorItems.filter(vi => vi.vendorid === selectedVendor));
        } else {
            setFilteredItems([]);
        }
    }, [selectedVendor, vendorItems]);

    const [selectedItemDetails, setSelectedItemDetails] = useState(null);

    const handleItemSelect = (e) => {
        const vItemId = e.target.value;
        setSelectedItem(vItemId);
        const vItem = vendorItems.find(vi => vi._id === vItemId);
        if (vItem) {
            setSelectedItemDetails(vItem);
            const price = Number(vItem.price || 0);
            const discount = Number(vItem.discount || 0);
            const basePrice = price - (price * discount / 100);
            setNewItemPrice(basePrice.toFixed(2));
        } else {
            setSelectedItemDetails(null);
            setNewItemPrice('');
        }
    };

    const addItemToPO = () => {
        if (!selectedItem || !newItemQty || !newItemPrice) return;
        const vItem = vendorItems.find(vi => vi._id === selectedItem);
        const masterItem = allItems.find(i => i._id === vItem.itemid) || {};
        const qty = Number(newItemQty);
        const basePrice = Number(newItemPrice);

        let igst = Number(vItem.igst || 0);
        let sgst = Number(vItem.sgst || 0);
        let cgst = Number(vItem.cgst || 0);
        let gst = Number(vItem.gst || 0);
        let taxAmountPerUnit = 0;
        let totalTaxPercent = 0;

        if (igst > 0) {
            sgst = 0;
            cgst = 0;
            totalTaxPercent = igst;
        } else if (sgst > 0 || cgst > 0) {
            igst = 0;
            totalTaxPercent = sgst + cgst;
        } else {
            totalTaxPercent = gst;
        }

        taxAmountPerUnit = basePrice * (totalTaxPercent / 100);
        const unitPriceWithTax = basePrice + taxAmountPerUnit;
        const totalBase = basePrice * qty;
        const totalTax = taxAmountPerUnit * qty;
        const totalLineAmount = totalBase + totalTax;

        setPoItems([...poItems, {
            id: Date.now(),
            itemid: masterItem._id,
            itemname: vItem.item,
            itemcode: masterItem.itemcode,
            itemtype: vItem.type || masterItem.itemtype,
            category: vItem.category,
            unit: vItem.unit,
            gst: totalTaxPercent,
            sgst: sgst,
            cgst: cgst,
            igst: igst,
            quantity: qty,
            price: basePrice,
            unitPriceWithTax: unitPriceWithTax,
            total: totalLineAmount,
            storereqid: activeStoreRequestId,
            storeid: activeStoreRequestId ? (storeRequests.find(r => r._id === activeStoreRequestId)?.storeid || '') : '',
            storename: activeStoreRequestId ? (storeRequests.find(r => r._id === activeStoreRequestId)?.store || '') : '',
            isNew: true
        }]);
        setActiveStoreRequestId(null);

        setSelectedItem('');
        setNewItemQty('');
        setNewItemPrice('');
        setSelectedItemDetails(null);
        setSelectedMasterItem('');
    };

    const handleRemoveItem = (id) => {
        setPoItems(poItems.filter(i => i.id !== id));
    };

    const handleEditPO = async (po) => {
        setIsEditMode(true);
        setEditingPOId(po._id);
        setEditingPOObj(po);
        setSelectedVendor(po.vendorid);

        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds?colid=${global1.colid}`);
            const allItemsValues = res.data.data.poItems || [];
            const myItems = allItemsValues.filter(i => i.poid === po.poid);

            setPoItems(myItems.map(i => ({
                ...i,
                id: i._id,
                total: i.total || (Number(i.quantity) * Number(i.price)),
                isNew: false
            })));
            setTabValue(1);
        } catch (error) {
            console.error("Error fetching PO items for edit", error);
        }
    };

    const handleSavePO = async () => {
        if (!selectedVendor || poItems.length === 0) {
            alert('Select Vendor and add items');
            return;
        }
        try {
            let currentPO = editingPOObj;
            let currentPOIdStr = currentPO?.poid;
            const vendorObj = vendors.find(v => v._id === selectedVendor);
            const totalAmount = poItems.reduce((sum, item) => sum + (Number(item.total || 0)), 0);

            if (!isEditMode) {
                const poPayload = {
                    name: `PO-${Date.now()}`,
                    vendorid: selectedVendor,
                    vendor: vendorObj?.vendorname,
                    year: new Date().getFullYear().toString(),
                    poid: `PO-${Date.now()}`,
                    postatus: 'Pending',
                    colid: global1.colid,
                    user: global1.user,
                    price: totalAmount,
                    netprice: totalAmount,
                    returnamount: 0,
                    creatorName: global1.name || global1.user,
                    storeid: poItems.length > 0 ? poItems[0].storeid : '',
                    storename: poItems.length > 0 ? poItems[0].storename : ''
                };
                const poRes = await ep1.post('/api/v2/addstorepoorderds', poPayload);
                currentPO = poRes.data.data;
                currentPOIdStr = currentPO.poid;
            } else {
                const poPayload = {
                    price: totalAmount,
                    netprice: totalAmount,
                };
                await ep1.post(`/api/v2/updatestorepoorderds?id=${currentPO._id}`, poPayload);
            }

            for (const item of poItems) {
                if (isEditMode && !item.isNew) continue;
                await ep1.post('/api/v2/addstorepoitemsds', {
                    name: `POI-${Date.now()}`,
                    poid: currentPOIdStr,
                    vendorid: selectedVendor,
                    vendor: vendorObj?.vendorname,
                    itemid: item.itemid,
                    itemname: item.itemname,
                    itemcode: item.itemcode,
                    itemtype: item.itemtype,
                    category: item.category,
                    unit: item.unit,
                    gst: item.gst,
                    sgst: item.sgst,
                    cgst: item.cgst,
                    igst: item.igst,
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    unitPriceWithTax: Number(item.unitPriceWithTax),
                    total: Number(item.total),
                    postatus: 'Pending',
                    year: new Date().getFullYear().toString(),
                    colid: global1.colid,
                    user: global1.user,
                    storereqid: item.storereqid,
                    storeid: item.storeid,
                    storename: item.storename
                });
            }

            alert(isEditMode ? 'PO Updated Successfully' : 'PO Created Successfully');
            setPoItems([]);
            setSelectedVendor('');
            setSelectedCategory('');
            setSelectedType('');
            setSelectedMasterItem('');
            setIsEditMode(false);
            setEditingPOId(null);
            setEditingPOObj(null);
            setTabValue(2);
            fetchPOs();
        } catch (error) {
            console.error('Error saving PO:', error);
            alert('Failed to save PO');
        }
    };

    const handleDynamicVerify = async (poId) => {
        try {
            await ep1.post('/api/v2/verifyDynamicStep', {
                id: poId,
                user_email: global1.user
            });
            alert('Step Verified Successfully');
            fetchPOs();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to verify step');
        }
    };

    const handleViewPO = async (po) => {
        let poDataToView = { ...po };
        if (!poDataToView.creatorName || poDataToView.creatorName.includes('@')) {
            try {
                if (poDataToView.user === global1.user && global1.name) {
                    poDataToView.creatorName = global1.name;
                }
            } catch (e) { }
        }
        setViewPOData(poDataToView);
        setOpenViewModal(true);
        setViewPOItems([]);
        setViewVendorData(null);
        setIsAmendment(false);

        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds?colid=${global1.colid}`);
            const allItems = res.data.data.poItems || [];
            const myItems = allItems.filter(i => i.poid === po.poid);
            setViewPOItems(myItems);
        } catch (error) { console.error("Error fetching items details", error); }

        try {
            if (vendors.length > 0) {
                const v = vendors.find(v => v._id === po.vendorid || v.vendorid === po.vendorid);
                if (v) setViewVendorData(v);
                else fetchSpecificVendor(po.vendorid);
            } else {
                fetchSpecificVendor(po.vendorid);
            }
        } catch (error) { console.error("Error fetching vendor details", error); }
    };

    const fetchSpecificVendor = async (id) => {
        if (!id) return;
        try {
            const res = await ep1.get(`/api/v2/getvendordsbyid?id=${id}`);
            if (res.data && res.data.data && res.data.data.vendor) {
                setViewVendorData(res.data.data.vendor);
            }
        } catch (e) { console.error(e); }
    }

    const handlePrint = () => {
        const printContent = document.getElementById('printable-po-area');
        if (printContent) {
            const printWindow = window.open('', '', 'height=800,width=800');
            printWindow.document.write('<html><head><title>Print PO</title>');
            const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(style => {
                printWindow.document.head.appendChild(style.cloneNode(true));
            });
            printWindow.document.write('</head><body >');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        }
    };

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedReqForAssign, setSelectedReqForAssign] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [selectedOEUser, setSelectedOEUser] = useState('');
    const [isReassigningReq, setIsReassigningReq] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await ep1.get(`/api/v2/getOEUsers?colid=${global1.colid}`);
            if (res.data && res.data.data) {
                setUsersList(res.data.data);
            }
        } catch (error) { console.error("Error fetching users", error); }
    };

    const handleOpenAssignDialog = (req) => {
        setSelectedReqForAssign(req);
        setIsReassigningReq(false);
        setAssignDialogOpen(true);
        if (usersList.length === 0) fetchUsers();
    };

    const handleOpenReassignDialog = (req) => {
        setSelectedReqForAssign(req);
        setIsReassigningReq(true);
        setAssignDialogOpen(true);
        if (usersList.length === 0) fetchUsers();
    };

    const handleAssignConfirm = async () => {
        if (!selectedOEUser || !selectedReqForAssign) return;
        const userObj = usersList.find(u => u.email === selectedOEUser);
        try {
            if (isReassigningReq) {
                const checkRes = await ep1.get(`/api/v2/getallprassigneds?colid=${global1.colid}`);
                const allAssignments = checkRes.data?.data?.assignments || [];
                const assignmentObj = allAssignments.find(a => a.storereqid === selectedReqForAssign._id);

                if (assignmentObj) {
                    await ep1.post(`/api/v2/updateprassigneds?id=${assignmentObj._id}`, {
                        prassigneemail: userObj.email,
                        prassignename: userObj.name
                    });
                    alert("Re-assigned Successfully");
                } else {
                    alert("Could not find original assignment to update");
                }
            } else {
                await ep1.post('/api/v2/addprassigneds', {
                    name: global1.name,
                    user: global1.user,
                    colid: global1.colid,
                    prassigneemail: userObj.email,
                    prassignename: userObj.name,
                    storereqid: selectedReqForAssign._id,
                    storename: selectedReqForAssign.store || 'Main Store',
                    status: 'Assigned'
                });
                alert("Assigned Successfully");
            }
            setAssignDialogOpen(false);
            setSelectedReqForAssign(null);
            setSelectedOEUser('');
            setIsReassigningReq(false);
            fetchStoreRequests(paginationModel.page + 1, paginationModel.pageSize);
        } catch (error) {
            console.error(error);
            alert("Failed to assign");
        }
    };

    const generateColumns = (data, context) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        const cols = keys
            .filter(key => key !== '_id' && key !== 'colid' && key !== 'id' && key !== '__v'
                && key !== 'approvalLog' && key !== 'level' && key !== 'level1_status' && key !== 'level2_status')
            .map(key => {
                const colDef = {
                    field: key,
                    headerName: key === 'assignedTo' ? 'Assigned To' : key.charAt(0).toUpperCase() + key.slice(1),
                    width: 150
                };
                if (key.toLowerCase().includes('date')) {
                    colDef.valueFormatter = (params) => {
                        if (!params.value) return 'N/A';
                        const date = new Date(params.value);
                        if (isNaN(date.getTime())) return params.value;
                        const d = String(date.getDate()).padStart(2, '0');
                        const m = String(date.getMonth() + 1).padStart(2, '0');
                        const y = date.getFullYear();
                        return `${d}/${m}/${y}`;
                    };
                }
                if (key === 'postatus' || key === 'reqstatus' || key.includes('status') || key === 'approvalStatus') {
                    colDef.renderCell = (params) => (
                        <Chip
                            label={params.value || 'Pending'}
                            color={
                                params.value === 'Approved' || params.value === 'Allotted' || params.value === 'Verified' || params.value === 'Completed' || params.value === 'Assigned' ? 'success' :
                                    params.value?.includes('Pending') ? 'warning' : 'default'
                            }
                            size="small"
                        />
                    );
                }
                return colDef;
            });

        if (context === 'storeRequests' && role !== 'PE' && role !== 'SPE') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 150,
                renderCell: (params) => (
                    params.row.reqstatus === 'Assigned' ? (
                        <Button variant="contained" size="small" onClick={() => handleOpenReassignDialog(params.row)}>
                            Reassign
                        </Button>
                    ) : params.row.reqstatus !== 'Completed' ? (
                        <Button variant="contained" size="small" onClick={() => handleOpenAssignDialog(params.row)}>
                            Assign
                        </Button>
                    ) : <Typography variant="caption">Completed</Typography>
                )
            });
        }

        if (context === 'poItems') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 150,
                renderCell: (params) => (
                    params.row.isNew !== false ?
                        <Button color="error" size="small" onClick={() => handleRemoveItem(params.row.id)}>Remove</Button>
                        : null
                )
            });
        }

        if (context === 'purchaseOrders') {
            cols.push({
                field: 'actions',
                headerName: 'Approval',
                width: 350,
                renderCell: (params) => {
                    const po = params.row;
                    const currentStep = po.currentStep || 1;
                    const status = po.postatus;
                    const stepConfig = approvalConfig.find(s => s.stepNumber === currentStep);
                    const canApprove = stepConfig && stepConfig.approverEmail === global1.user && status !== 'Approved';

                    let infoText = "";
                    if (status === 'Approved') infoText = "Fully Approved";
                    else if (stepConfig) infoText = `Waiting for: ${stepConfig.approverEmail}`;
                    else infoText = "No Approval Step Configured";

                    return (
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Typography variant="caption" color="textSecondary">
                                {infoText}
                            </Typography>
                            <Box display="flex" gap={1}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    onClick={() => handleViewPO(po)}
                                >
                                    View / Print
                                </Button>
                                {status === 'Pending' && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleEditPO(po)}
                                    >
                                        Edit
                                    </Button>
                                )}
                                {canApprove && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleDynamicVerify(po._id)}
                                    >
                                        Verify Step {currentStep}
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    );
                }
            });
        }
        return cols;
    };

    const storeReqColumns = generateColumns(storeRequests, 'storeRequests');
    const poItemsColumns = generateColumns(poItems, 'poItems');
    const poColumns = generateColumns(purchaseOrders, 'purchaseOrders');

    return (
        <Box p={3} sx={{ height: '85vh', width: '100%' }}>
            <Typography variant="h4" gutterBottom>Purchase Cell Dashboard</Typography>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
                <Tab label="Store Requests" />
                <Tab label={isEditMode ? "Edit PO" : "Create PO"} />
                <Tab label="Manage POs" />
                {(global1.role === 'Purchase' || global1.role === 'Admin' || global1.role === 'Purchasepu') && <Tab label="Imprest Approval" />}
            </Tabs>

            {tabValue === 0 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={storeRequests}
                        columns={storeReqColumns}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        paginationMode="server"
                        rowCount={rowCount}
                        loading={loading}
                        disableSelectionOnClick
                    />
                </Paper>
            )}

            {tabValue === 1 && (
                <Box>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={[...new Set(allItems.map(i => i.category || '').filter(Boolean))]}
                                    value={selectedCategory}
                                    onChange={(event, newValue) => {
                                        setSelectedCategory(newValue || '');
                                        setSelectedType('');
                                        setSelectedMasterItem('');
                                        if (!isEditMode && poItems.length === 0) {
                                            setSelectedVendor('');
                                        }
                                        setSelectedItem('');
                                        setSelectedItemDetails(null);
                                        setNewItemPrice('');
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Category" />}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={[...new Set(allItems.filter(i => !selectedCategory || i.category === selectedCategory).map(i => i.itemtype || '').filter(Boolean))]}
                                    value={selectedType}
                                    onChange={(event, newValue) => {
                                        setSelectedType(newValue || '');
                                        setSelectedMasterItem('');
                                        if (!isEditMode && poItems.length === 0) {
                                            setSelectedVendor('');
                                        }
                                        setSelectedItem('');
                                        setSelectedItemDetails(null);
                                        setNewItemPrice('');
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Type" />}
                                    disabled={!selectedCategory}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={allItems.filter(i =>
                                        (!selectedCategory || (i.category || '') === selectedCategory) &&
                                        (!selectedType || (i.itemtype || '') === selectedType)
                                    )}
                                    getOptionLabel={(option) => option.itemname || option.item || option.name || option.itemcode || ""}
                                    value={allItems.find(i => i._id === selectedMasterItem) || null}
                                    onChange={(event, newValue) => {
                                        const newMasterItemId = newValue ? newValue._id : '';
                                        setSelectedMasterItem(newMasterItemId);

                                        if (newMasterItemId && selectedVendor) {
                                            const vItem = vendorItems.find(vi => vi.itemid === newMasterItemId && vi.vendorid === selectedVendor);
                                            if (vItem) {
                                                setSelectedItem(vItem._id);
                                                setSelectedItemDetails(vItem);
                                                const price = Number(vItem.price || 0);
                                                const discount = Number(vItem.discount || 0);
                                                const basePrice = price - (price * discount / 100);
                                                setNewItemPrice(basePrice.toFixed(2));
                                            } else {
                                                setSelectedItem('');
                                                setSelectedItemDetails(null);
                                                setNewItemPrice('');
                                            }
                                        } else {
                                            if (!isEditMode && poItems.length === 0) {
                                                setSelectedVendor('');
                                            }
                                            setSelectedItem('');
                                            setSelectedItemDetails(null);
                                            setNewItemPrice('');
                                        }
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Item" />}
                                    disabled={!selectedType}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={
                                        selectedMasterItem
                                            ? vendors.filter(v => vendorItems.some(vi => vi.itemid === selectedMasterItem && vi.vendorid === v._id))
                                            : vendors
                                    }
                                    getOptionLabel={(option) => option.vendorname || ""}
                                    value={vendors.find(v => v._id === selectedVendor) || null}
                                    onChange={(event, newValue) => {
                                        const vendorId = newValue ? newValue._id : '';
                                        setSelectedVendor(vendorId);

                                        if (newValue && selectedMasterItem) {
                                            const vItem = vendorItems.find(vi => vi.itemid === selectedMasterItem && vi.vendorid === vendorId);
                                            if (vItem) {
                                                setSelectedItem(vItem._id);
                                                setSelectedItemDetails(vItem);
                                                const price = Number(vItem.price || 0);
                                                const discount = Number(vItem.discount || 0);
                                                const basePrice = price - (price * discount / 100);
                                                setNewItemPrice(basePrice.toFixed(2));
                                            }
                                        } else {
                                            setSelectedItem('');
                                            setSelectedItemDetails(null);
                                            setNewItemPrice('');
                                        }
                                    }}
                                    disabled={!selectedMasterItem || isEditMode || poItems.length > 0}
                                    renderInput={(params) => <TextField {...params} label="Vendor" />}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Add Item to PO</Typography>
                        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <Autocomplete
                                        options={storeRequests.filter(r => r.reqstatus !== 'Completed')}
                                        getOptionLabel={(option) => `${option.itemname || 'Unknown'} (PR: ${option.prnumber || option.name})`}
                                        value={storeRequests.find(r => r._id === activeStoreRequestId) || null}
                                        onChange={(event, newValue) => {
                                            setActiveStoreRequestId(newValue ? newValue._id : null);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Select PR (Optional)" size="small" />}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField label="Qty" type="number" size="small" fullWidth value={newItemQty} onChange={(e) => setNewItemQty(e.target.value)} />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField label="Price" type="number" size="small" fullWidth value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Button variant="outlined" onClick={addItemToPO} disabled={!selectedItem} fullWidth>Add Item</Button>
                            </Grid>
                        </Grid>

                        <div style={{ height: 300, width: '100%' }}>
                            <DataGrid
                                rows={poItems}
                                columns={poItemsColumns}
                                pageSize={5}
                                rowsPerPageOptions={[5]}
                                disableSelectionOnClick
                                pagination
                            />
                        </div>
                    </Paper>

                    <Button variant="contained" color="primary" onClick={handleSavePO}>
                        {isEditMode ? 'Update Purchase Order' : 'Generate Purchase Order'}
                    </Button>
                    {isEditMode && <Button variant="text" onClick={() => { setIsEditMode(false); setPoItems([]); setTabValue(2); setSelectedVendor(''); setSelectedCategory(''); setSelectedType(''); setSelectedMasterItem(''); }}>Cancel Edit</Button>}
                </Box>
            )}

            {tabValue === 2 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={purchaseOrders}
                        columns={poColumns}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        paginationMode="server"
                        rowCount={rowCount}
                        loading={loading}
                        disableSelectionOnClick
                    />
                </Paper>
            )}

            {tabValue === 3 && (
                <ImprestManagerds />
            )}

            <Dialog open={openViewModal} onClose={() => setOpenViewModal(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    PO View
                    <Box display="inline-block" ml={2}>
                        <Button variant="contained" onClick={handlePrint}>Print / Save PDF</Button>
                        <Button onClick={() => setOpenViewModal(false)} sx={{ ml: 1 }}>Close</Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Customize Institution Details (for this print)</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Institution Name" size="small" value={instName} onChange={(e) => setInstName(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Address" size="small" value={instAddress} onChange={(e) => setInstAddress(e.target.value)} />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField fullWidth label="Phone" size="small" value={instPhone} onChange={(e) => setInstPhone(e.target.value)} />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField fullWidth label="Short Name (for Footer)" size="small" value={instShortName} onChange={(e) => setInstShortName(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={isAmendment} onChange={(e) => setIsAmendment(e.target.checked)} />}
                                    label="Print as Amendment"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                    <POInvoiceTemplate
                        poData={viewPOData}
                        poItems={viewPOItems}
                        vendorData={viewVendorData}
                        instName={instName}
                        instAddress={instAddress}
                        instPhone={instPhone}
                        instShortName={instShortName}
                        isAmendment={isAmendment}
                        notes={poConfig.notes}
                        terms={poConfig.terms}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>Assign Request</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Assigning Request: <b>{selectedReqForAssign?.itemname}</b> (Qty: {selectedReqForAssign?.quantity})
                    </Typography>
                    <Autocomplete
                        options={usersList}
                        getOptionLabel={(option) => {
                            if (typeof option === 'string') return option;
                            return `${option.name} (${option.email})`;
                        }}
                        value={usersList.find(u => u.email === selectedOEUser) || null}
                        onChange={(event, newValue) => {
                            setSelectedOEUser(newValue ? newValue.email : '');
                        }}
                        renderInput={(params) => <TextField {...params} label="Select Officer Executive" />}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssignConfirm}>Confirm Assignment</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PurchaseOrderDashboardNewds;
