import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Button,
    Paper,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Switch,
    FormControlLabel,
    Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';
import POInvoiceTemplate2 from './POInvoiceTemplate2';
import ImprestManagerds2 from './ImprestManagerds2';

const PurchaseOrderDashboardds2 = ({ role }) => {
    const currentRole = global1.role;

    const [tabValue, setTabValue] = useState(0);
    // Data States
    const [storeRequests, setStoreRequests] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [vendorItems, setVendorItems] = useState([]); // All vendor items
    const [filteredItems, setFilteredItems] = useState([]); // Items for selected vendor
    const [purchaseOrders, setPurchaseOrders] = useState([]);

    // For New/Edit PO
    const [selectedVendor, setSelectedVendor] = useState('');
    const [poItems, setPoItems] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingPOId, setEditingPOId] = useState(null);
    const [editingPOObj, setEditingPOObj] = useState(null);
    const [activeStoreRequestId, setActiveStoreRequestId] = useState(null); // Track which request is being processed

    // View PO State
    const [openViewModal, setOpenViewModal] = useState(false);
    const [viewPOData, setViewPOData] = useState(null);
    const [viewPOItems, setViewPOItems] = useState([]);
    const [viewVendorData, setViewVendorData] = useState(null);

    // Add Item to PO Form
    const [selectedItem, setSelectedItem] = useState(''); // This will be vendoritemds2._id
    const [newItemQty, setNewItemQty] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');

    // Dynamic Institution Details for PO View
    const [instName, setInstName] = useState("PEOPLE'S PUBLIC SCHOOL");
    const [instAddress, setInstAddress] = useState("BHANPUR, KAROND BYPASS ROAD, BHOPAL (M.P.) - 462010");
    const [instPhone, setInstPhone] = useState("(0755) 4005170");
    const [instShortName, setInstShortName] = useState("PPS");
    const [isAmendment, setIsAmendment] = useState(false);

    // Add to PO / Open PO Modal State
    const [openPOModal, setOpenPOModal] = useState(false);
    const [selectedPRForPO, setSelectedPRForPO] = useState(null);
    const [poModalVendor, setPoModalVendor] = useState('');
    const [matchingDraftPOs, setMatchingDraftPOs] = useState([]);
    const [selectedDraftPO, setSelectedDraftPO] = useState('');

    // Dynamic Approval State
    const [approvalConfig, setApprovalConfig] = useState([]);

    // Dynamic PO Config State
    // Dynamic PO Config State
    const [poConfig, setPoConfig] = useState({ notes: '', terms: '' });

    // Pagination State
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setPaginationModel({ page: 0, pageSize: 10 });
    }, [tabValue]);

    useEffect(() => {
        setLoading(true);

        // Restore global1 if missing (on reload)
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

            // Tab 3 (Imprest) handles its own fetching inside the component

            setLoading(false);
        };
        fetchData();
    }, [tabValue, paginationModel]);

    const fetchPoConfig = async () => {
        try {
            const res = await ep1.get(`/api/v2/getpoconfigds2?colid=${global1.colid}`);
            if (res.data.data) setPoConfig(res.data.data);
        } catch (e) { console.error("Error fetching PO config", e); }
    };

    const fetchApprovalConfig = async () => {
        try {
            const response = await ep1.get(`/api/v2/getapprovalconfig2?colid=${global1.colid}&module=Purchase Order`);
            setApprovalConfig(response.data.data);
        } catch (error) { console.error('Error fetching config:', error); }
    };

    const fetchStoreRequests = async (page, limit) => {
        try {
            let url;
            const currentRole = role || global1.role;
            if (currentRole === 'OE' || currentRole === 'PE') {
                // Fetch assigned requests for this OE/PE user
                url = page ? `/api/v2/getAssignedRequisitions2?colid=${global1.colid}&page=${page}&limit=${limit}&user=${global1.user}`
                    : `/api/v2/getAssignedRequisitions2?colid=${global1.colid}&user=${global1.user}`;
            } else {
                // Fetch all requests (for Manager / Admin)
                url = page ? `/api/v2/getallstorerequisationds2?colid=${global1.colid}&page=${page}&limit=${limit}`
                    : `/api/v2/getallstorerequisationds2?colid=${global1.colid}`;
            }

            const response = await ep1.get(url);
            const reqs = response.data.data.requisitions || [];
            setStoreRequests(reqs.map(r => ({ ...r, id: r._id })));
            if (page) setRowCount(response.data.total || response.data.count || 0);
        } catch (error) { console.error(error); }
    };

    const fetchVendors = async () => {
        try {
            // Fetch all for dropdown
            const response = await ep1.get(`/api/v2/getallvendords2?colid=${global1.colid}`);
            // Check if it's nested in data.vendors or just data
            setVendors(response.data.data.vendors || response.data.data || []);
        } catch (error) { console.error(error); }
    };

    const fetchAllItems = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallitemmasterds2?colid=${global1.colid}`);
            setAllItems(response.data.data.items || []);
        } catch (error) { console.error(error); }
    };

    const fetchVendorItems = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallvendoritemds2?colid=${global1.colid}`);
            setVendorItems(response.data.data.vendorItems || []);
        } catch (error) { console.error(error); }
    };

    const fetchPOs = async (page, limit) => {
        try {
            const url = page ? `/api/v2/getallstorepoorderds2?colid=${global1.colid}&page=${page}&limit=${limit}` : `/api/v2/getallstorepoorderds2?colid=${global1.colid}`;
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

    // State for selected item details
    const [selectedItemDetails, setSelectedItemDetails] = useState(null);

    const handleItemSelect = (e) => {
        const vItemId = e.target.value;
        setSelectedItem(vItemId);

        const vItem = vendorItems.find(vi => vi._id === vItemId);
        if (vItem) {
            setSelectedItemDetails(vItem); // Store full object for later use
            // Calculate Price using Discount
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
        if (!selectedItem || !newItemQty || !newItemPrice) {
            alert("Please select a vendor item, quantity, and price.");
            return;
        }
        if (!activeStoreRequestId) {
            alert("PO Creation must originate from a Purchase Requisition. Please select a PR.");
            return;
        }

        const pr = storeRequests.find(r => r._id === activeStoreRequestId);
        if (pr) {
            const maxAllowed = Number(pr.quantity || 0) - Number(pr.orderedQuantity || 0);
            if (Number(newItemQty) > maxAllowed) {
                alert(`Cannot exceed PR remaining quantity. Max allowed: ${maxAllowed}`);
                return;
            }
        }

        const vItem = vendorItems.find(vi => vi._id === selectedItem);
        const masterItem = allItems.find(i => i._id === vItem.itemid) || {};

        // Calculate Taxes based on Vendor Item configuration
        const qty = Number(newItemQty);
        const basePrice = Number(newItemPrice);

        // Fetch explicit tax values
        let igst = Number(vItem.igst || 0);
        let sgst = Number(vItem.sgst || 0);
        let cgst = Number(vItem.cgst || 0);
        let gst = Number(vItem.gst || 0);

        let taxAmountPerUnit = 0;
        let totalTaxPercent = 0;

        // Logic: If IGST is present, it overrides Intra-state taxes (Inter-state transaction)
        if (igst > 0) {
            sgst = 0;
            cgst = 0;
            totalTaxPercent = igst;
        } else if (sgst > 0 || cgst > 0) {
            // Intra-state
            igst = 0;
            totalTaxPercent = sgst + cgst;
            // Consistency check: If user2 provided 'gst' total but valid sgst/cgst, rely on components.
        } else {
            // Fallback: If only 'gst' (Total) is provided without breakdown
            // We assume Intra-state split for lack of better info, or store as is? 
            // Let's treat it as generic tax if components missing. 
            // But usually we need components. Let's assume equal split if only GST given? 
            // Or just store as GST total.
            totalTaxPercent = gst;
            if (totalTaxPercent > 0) {
                // Auto-split for record keeping? Let's keep it in 'gst' field and leave others 0 
                // unless user2 manually updates master. 
                // But request asked to "fetch... from vendor item". 
            }
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
            gst: totalTaxPercent, // Store total effective % here for quick ref
            sgst: sgst,
            cgst: cgst,
            igst: igst,
            quantity: qty,
            price: basePrice,
            unitPriceWithTax: unitPriceWithTax,
            total: totalLineAmount,
            storereqid: activeStoreRequestId, // Store ID here
            storeid: activeStoreRequestId ? (storeRequests.find(r => r._id === activeStoreRequestId)?.storeid || '') : '',
            storename: activeStoreRequestId ? (storeRequests.find(r => r._id === activeStoreRequestId)?.store || '') : '',
            isNew: true
        }]);
        setActiveStoreRequestId(null); // Reset after adding
        setSelectedItem('');
        setNewItemQty('');
        setNewItemPrice('');
        setSelectedItemDetails(null);
    };

    const handleRemoveItem = async (id) => {
        const itemToRemove = poItems.find(i => i.id === id);
        if (!itemToRemove) return;

        // If it's a persisted DB item, hard-delete it via the API
        if (itemToRemove.isNew === false) {
            try {
                await ep1.delete(`/api/v2/deletestorepoitemsds2?id=${id}`);
            } catch (err) {
                console.error("Failed to delete item from DB", err);
                return alert("Could not delete item from server.");
            }
        }

        // Remove locally from UI state
        setPoItems(poItems.filter(i => i.id !== id));
    };

    const handleEditPO = async (po) => {
        setIsEditMode(true);
        setEditingPOId(po._id);
        setEditingPOObj(po);
        setSelectedVendor(po.vendorid);

        // Fetch PO Items
        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
            const allItemsValues = res.data.data.poItems || [];
            const myItems = allItemsValues.filter(i => i.poid === po.poid);

            setPoItems(myItems.map(i => ({
                ...i,
                id: i._id,
                // Ensure calculations or fields exist for display
                // If legacy data updates, total might just be qty*price. 
                // We trust 'total' or recalculate? Let's use stored total if available
                total: i.total || (Number(i.quantity) * Number(i.price)),
                isNew: false
            })));

            setTabValue(1);
        } catch (error) {
            console.error("Error fetching PO items for edit", error);
        }
    };

    const handleRequestEdit = async (po) => {
        if (!window.confirm("Are you sure you want to request an edit? This will notify the Purchase Manager.")) return;
        try {
            await ep1.post(`/api/v2/updatestorepoorderds2?id=${po._id}`, {
                postatus: 'EditRequested'
            });
            alert("Edit request sent to Purchase Manager.");
            fetchPOs();
        } catch (e) {
            console.error(e);
            alert("Failed to request edit.");
        }
    };

    const handleApproveEditRequest = async (po) => {
        try {
            await ep1.post(`/api/v2/updatestorepoorderds2?id=${po._id}`, {
                postatus: 'Draft'
            });
            alert("Edit request approved. PO sent back to Draft.");
            fetchPOs();
        } catch (e) {
            console.error(e);
            alert("Failed to approve edit request.");
        }
    };

    const handleSubmitPO = async (po) => {
        if (!window.confirm("Submit this PO for approval? You will no longer be able to edit it unless changes are requested.")) return;
        try {
            await ep1.post(`/api/v2/updatestorepoorderds2?id=${po._id}`, {
                postatus: 'Submitted'
            });
            alert("PO Submitted successfully.");
            fetchPOs();
        } catch (e) {
            console.error(e);
            alert("Failed to submit PO.");
        }
    };

    const handleSavePO = async () => {
        if (!selectedVendor) {
            alert('Select Vendor to create a Draft PO.');
            return;
        }



        try {
            let currentPO = editingPOObj;
            let currentPOIdStr = currentPO?.poid;
            const vendorObj = vendors.find(v => v._id === selectedVendor);

            // Calculate Totals - Sum of all line totals (which include tax)
            const totalAmount = poItems.reduce((sum, item) => sum + (Number(item.total || 0)), 0);

            if (!isEditMode) {
                // Create New PO Header
                const poPayload = {
                    name: `PO-${Date.now()}`,
                    vendorid: selectedVendor,
                    vendor: vendorObj?.vendorname,
                    year: new Date().getFullYear().toString(),
                    poid: `PO-${Date.now()}`,
                    postatus: 'Draft',
                    colid: global1.colid,
                    user: global1.user,
                    price: totalAmount, // This is now Grand Total
                    netprice: totalAmount,
                    returnamount: 0,
                    creatorName: global1.name || global1.user,
                    storeid: poItems.length > 0 ? poItems[0].storeid : '',
                    storename: poItems.length > 0 ? poItems[0].storename : ''
                };
                const poRes = await ep1.post('/api/v2/addstorepoorderds2', poPayload);
                currentPO = poRes.data.data;
                currentPOIdStr = currentPO.poid;
            } else {
                // Update Existing PO Header
                const poPayload = {
                    price: totalAmount,
                    netprice: totalAmount,
                };
                await ep1.post(`/api/v2/updatestorepoorderds2?id=${currentPO._id}`, poPayload);
            }

            // Loop through items and add only NEW ones
            for (const item of poItems) {
                if (isEditMode && !item.isNew) continue;

                await ep1.post('/api/v2/addstorepoitemsds2', {
                    name: `POI-${Date.now()}`,
                    poid: currentPOIdStr,
                    vendorid: selectedVendor,
                    vendor: vendorObj?.vendorname,
                    itemid: item.itemid,
                    itemname: item.itemname,
                    itemcode: item.itemcode,
                    itemtype: item.itemtype,
                    category: item.category, // New Field
                    unit: item.unit,         // New Field
                    gst: item.gst,           // New Field
                    sgst: item.sgst,
                    cgst: item.cgst,
                    igst: item.igst,
                    quantity: Number(item.quantity),
                    price: Number(item.price), // Base Price
                    unitPriceWithTax: Number(item.unitPriceWithTax), // New Field
                    total: Number(item.total), // New Field (Line Total)
                    postatus: 'Pending',
                    year: new Date().getFullYear().toString(),
                    colid: global1.colid,
                    user: global1.user,
                    storereqid: item.storereqid, // Link to Store Request
                    storeid: item.storeid,
                    storename: item.storename
                });
            }

            alert(isEditMode ? 'PO Updated Successfully' : 'PO Created Successfully');
            // Reset
            setPoItems([]);
            setSelectedVendor('');
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
            await ep1.post('/api/v2/verifyDynamicStep2', {
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

    const handleDynamicSendBack = async (poId) => {
        const remarks = prompt("Please provide a reason for sending this PO back:");
        if (remarks === null) return; // User cancelled

        try {
            await ep1.post('/api/v2/sendBackDynamicStep2', {
                id: poId,
                user_email: global1.user,
                remarks: remarks || "Sent back for revisions."
            });
            alert('PO Sent Back successfully.');
            fetchPOs();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to send back');
        }
    };

    const handleViewPO = async (po) => {
        let poDataToView = { ...po };

        // Fix: Fetch Creator Name if missing (for historical data showing email)
        if (!poDataToView.creatorName || poDataToView.creatorName.includes('@')) {
            try {
                // Try to look up user2 by email in cached usersList or fetch
                // We don't have a direct 'getUserByEmail' easily accessible here without auth context usually.
                // But we can try to use the 'user2' field (email) to find them if they differ.
                // Actually, let's just use what we have, but if global user2 matches, use global name.
                if (poDataToView.user === global1.user && global1.name) {
                    poDataToView.creatorName = global1.name;
                } else {
                    // If it's another user2, we might need to fetch their profile.
                    // Assuming we can't easily fetch other user2's name without a dedicated endpoint or list.
                    // But we can check if we have an OE user2 list loaded? No, this is generic.
                    // Let's assume for now we use the email if name defaults failed, 
                    // BUT verify if 'user2' field IS the name? No, 'user2' is email.
                    // Improvement: If creatorName is missing, try to display "Purchase Officer" or generic if unknown.
                    // Or Leave it as is, but prioritised global1.name for current user2.
                }
            } catch (e) { }
        }

        setViewPOData(poDataToView);
        setOpenViewModal(true);
        setViewPOItems([]);
        setViewVendorData(null);
        setIsAmendment(false);

        // Fetch Items
        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
            const allItems = res.data.data.poItems || [];
            const myItems = allItems.filter(i => i.poid === po.poid);
            setViewPOItems(myItems);
        } catch (error) { console.error("Error fetching items details", error); }

        // Fetch Vendor
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
            const res = await ep1.get(`/api/v2/getvendordsbyid2?id=${id}`);
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

            // Copy Styles
            const styles = document.head.querySelectorAll('style, link[rel="stylesheet"]');
            styles.forEach(style => {
                printWindow.document.head.appendChild(style.cloneNode(true));
            });

            printWindow.document.write('</head><body >');
            printWindow.document.write(printContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            // Wait for styles to apply (especially links) before printing
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 500);
        }
    };

    // ... (keep handleSavePO etc.)

    // Assignment State (for Managers/Admins)
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedReqForAssign, setSelectedReqForAssign] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [selectedOEUser, setSelectedOEUser] = useState('');

    const fetchUsers = async () => {
        try {
            // Fetch users for assignment (OE users)
            const res = await ep1.get(`/api/v2/getOEUsers2?colid=${global1.colid}`); // Now fetches actual OEs
            if (res.data && res.data.data) {
                setUsersList(res.data.data);
            }
        } catch (error) { console.error("Error fetching users", error); }
    };

    const handleOpenAssignDialog = (req) => {
        setSelectedReqForAssign(req);
        setAssignDialogOpen(true);
        if (usersList.length === 0) fetchUsers();
    };

    const handleAssignConfirm = async () => {
        if (!selectedOEUser || !selectedReqForAssign) return;

        const userObj = usersList.find(u => u.email === selectedOEUser);

        try {
            await ep1.post('/api/v2/addprassigneds2', {
                name: global1.name,
                user: global1.user, // Creator (Purchase Officer/Admin)
                colid: global1.colid,
                prassigneemail: userObj.email,
                prassignename: userObj.name,
                storereqid: selectedReqForAssign._id,
                storename: selectedReqForAssign.store || 'Main Store', // Fallback
                status: 'Assigned'
            });
            alert("Assigned Successfully");
            setAssignDialogOpen(false);
            setSelectedReqForAssign(null);
            setSelectedOEUser('');
            // Refresh list
            fetchStoreRequests(paginationModel.page + 1, paginationModel.pageSize);
        } catch (error) {
            console.error(error);
            alert("Failed to assign");
        }
    };

    const [poCreationMode, setPoCreationMode] = useState('NEW'); // 'NEW' or 'EXISTING'

    const handleOpenAddToPOModal = async (reqRow) => {
        setOpenPOModal(true); // Open immediately for snappiness
        setSelectedPRForPO(reqRow);

        // Fetch catalogs if missing
        if (vendors.length === 0) fetchVendors();
        if (allItems.length === 0) fetchAllItems();
        if (vendorItems.length === 0) fetchVendorItems();

        // Guarantee POs are fetched regardless of currently active tab!
        try {
            const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`); // un-paginated fetch to get ALL drafts
            const allPOsUnpaginated = res.data.data.pos || [];

            setPoCreationMode('NEW');
            setPoModalVendor('');
            setMatchingDraftPOs(allPOsUnpaginated.filter(po => po.postatus === 'Draft'));
            setSelectedDraftPO('');
            setNewItemQty(Number(reqRow.quantity || 0) - Number(reqRow.orderedQuantity || 0));
            setSelectedItem('');
            setSelectedItemDetails(null);
            setNewItemPrice('');

            // Sync background PO state
            setPurchaseOrders(allPOsUnpaginated.map(p => ({ ...p, id: p._id })));
        } catch (e) {
            console.error("Critical failure fetching draft POs for modal:", e);
        }
    };

    const handlePoModalVendorChange = (vendorId) => {
        setPoModalVendor(vendorId);
        resolveVendorItemMapping(vendorId);
    };

    const handlePoModalDraftSelection = (draftPoId) => {
        setSelectedDraftPO(draftPoId);
        const selectedDraft = purchaseOrders.find(po => po.poid === draftPoId);
        if (selectedDraft && selectedDraft.vendorid) {
            setPoModalVendor(selectedDraft.vendorid);
            resolveVendorItemMapping(selectedDraft.vendorid);
        } else {
            setPoModalVendor('');
            resolveVendorItemMapping('');
        }
    };

    const resolveVendorItemMapping = (vendorId) => {
        if (vendorId && selectedPRForPO) {
            const masterItem = allItems.find(i => i.itemcode === selectedPRForPO.itemcode || i.itemname === selectedPRForPO.itemname);
            if (masterItem) {
                const vendorItemsForVendor = vendorItems.filter(vi => vi.vendorid === vendorId);
                const vItem = vendorItemsForVendor.find(vi => vi.itemid === masterItem._id || vi.item === selectedPRForPO.itemname);
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
                setSelectedItem('');
                setSelectedItemDetails(null);
                setNewItemPrice('');
            }
        } else {
            setSelectedItem('');
            setSelectedItemDetails(null);
            setNewItemPrice('');
        }
    };

    const submitAddPRToPO = async () => {
        if (!poModalVendor || !selectedItem || !newItemQty || !newItemPrice || (poCreationMode === 'EXISTING' && !selectedDraftPO)) {
            return alert("Please select a vendor that supplies this item, and verify quantity/price/target PO.");
        }

        const pr = storeRequests.find(r => r._id === selectedPRForPO._id);
        if (pr) {
            const maxAllowed = Number(pr.quantity || 0) - Number(pr.orderedQuantity || 0);
            if (Number(newItemQty) > maxAllowed) {
                return alert(`Cannot exceed PR remaining quantity (${maxAllowed}).`);
            }
        }

        try {
            const vItem = vendorItems.find(vi => vi._id === selectedItem);
            const masterItem = allItems.find(i => i._id === vItem.itemid) || {};
            const vendorObj = vendors.find(v => v._id === poModalVendor);

            const qty = Number(newItemQty);
            const basePrice = Number(newItemPrice);
            let igst = Number(vItem.igst || 0);
            let sgst = Number(vItem.sgst || 0);
            let cgst = Number(vItem.cgst || 0);
            let totalTaxPercent = igst > 0 ? igst : (sgst + cgst);
            const taxAmountPerUnit = basePrice * (totalTaxPercent / 100);
            const unitPriceWithTax = basePrice + taxAmountPerUnit;
            const totalLineAmount = (basePrice * qty) + (taxAmountPerUnit * qty);

            let targetPOIdStr = selectedDraftPO;

            if (poCreationMode === 'NEW') {
                const poPayload = {
                    name: `PO-${Date.now()}`,
                    vendorid: poModalVendor,
                    vendor: vendorObj?.vendorname,
                    year: new Date().getFullYear().toString(),
                    poid: `PO-${Date.now()}`,
                    postatus: 'Draft',
                    colid: global1.colid,
                    user: global1.user,
                    price: totalLineAmount,
                    netprice: totalLineAmount,
                    returnamount: 0,
                    creatorName: global1.name || global1.user,
                    storeid: selectedPRForPO.storeid,
                    storename: selectedPRForPO.store || 'Main Store',
                    deliveryType: 'Physical Delivery',
                    poType: 'Standard'
                };
                const poRes = await ep1.post('/api/v2/addstorepoorderds2', poPayload);
                targetPOIdStr = poRes.data.data.poid;
            } else {
                const existingPO = purchaseOrders.find(p => p.poid === selectedDraftPO);
                if (existingPO) {
                    const newTotal = (Number(existingPO.price) || 0) + totalLineAmount;
                    await ep1.post(`/api/v2/updatestorepoorderds2?id=${existingPO._id}`, {
                        price: newTotal,
                        netprice: newTotal
                    });
                }
            }

            await ep1.post('/api/v2/addstorepoitemsds2', {
                name: `POI-${Date.now()}`,
                poid: targetPOIdStr,
                vendorid: poModalVendor,
                vendor: vendorObj?.vendorname,
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
                postatus: 'Draft',
                year: new Date().getFullYear().toString(),
                colid: global1.colid,
                user: global1.user,
                storereqid: selectedPRForPO._id,
                storeid: selectedPRForPO.storeid,
                storename: selectedPRForPO.store || 'Main Store'
            });

            alert('Added to PO Successfully. You can view/edit it in Manage POs -> Draft.');
            setOpenPOModal(false);
            fetchStoreRequests(paginationModel.page + 1, paginationModel.pageSize);
            fetchPOs();
        } catch (error) {
            console.error(error);
            alert('Failed to construct Draft PO flow: ' + (error.response?.data?.message || error.message));
        }
    };

    // Dynamic Column Generator
    const generateColumns = (data, context) => {
        if (!data || data.length === 0) return [];
        const keys = Object.keys(data[0]);
        const cols = keys
            .filter(key => key !== '_id' && key !== 'colid' && key !== 'id' && key !== '__v'
                && key !== 'approvalLog' && key !== 'level' && key !== 'level1_status' && key !== 'level2_status') // Hide legacy/complex fields
            .map(key => {
                // ... (keep earlier formatting logic for Date/Chips)
                const colDef = {
                    field: key,
                    headerName: key.charAt(0).toUpperCase() + key.slice(1),
                    width: 150
                };

                // Date Formatting
                if (key.toLowerCase().includes('date')) {
                    colDef.valueFormatter = (params) => {
                        if (!params.value) return 'N/A';
                        const date = new Date(params.value);
                        return isNaN(date.getTime()) ? params.value : date.toLocaleDateString();
                    };
                }

                // Status Chips
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

        // Add Actions Column for Store Requests
        if (context === 'storeRequests') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 250,
                renderCell: (params) => {
                    const isManager = currentRole === 'Purchasepu' || currentRole === 'Admin';
                    const isAssigned = params.row.reqstatus === 'Assigned';
                    const isCompleted = params.row.reqstatus === 'Completed';

                    // Purchasepu sees Assign / Reassign
                    const canAssign = isManager && !isCompleted;

                    // The execution roles ONLY see Add To PO. Managers also see it.
                    const canAddToPO = !isCompleted && (isAssigned || isManager);

                    return (
                        <Box display="flex" gap={1} alignItems="center">
                            {canAssign && (
                                <Button variant="contained" size="small" onClick={() => handleOpenAssignDialog(params.row)}>
                                    {isAssigned ? 'Reassign' : 'Assign'}
                                </Button>
                            )}

                            {canAddToPO && (
                                <>
                                    <Button variant="outlined" color="primary" size="small" sx={{ whiteSpace: 'nowrap' }} onClick={() => handleOpenAddToPOModal(params.row)}>
                                        Add to PO
                                    </Button>
                                    <Button variant="outlined" color="secondary" size="small" sx={{ whiteSpace: 'nowrap' }} onClick={() => handleOpenAddToPOModal(params.row)}>
                                        Open POs
                                    </Button>
                                </>
                            )}
                        </Box>
                    );
                }
            });
        }

        // ... (keep poItems actions)
        if (context === 'poItems') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 150,
                renderCell: (params) => {
                    const status = params.row.postatus || (editingPOObj?.postatus);
                    const canRemove = params.row.isNew !== false || status === 'Draft';
                    return canRemove ? (
                        <Button color="error" size="small" onClick={() => handleRemoveItem(params.row.id)}>Remove</Button>
                    ) : null;
                }
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

                    // Find config for current step (1-based index in PO, 0-based in array if sorted? No, stepNumber corresponds)
                    // Config is array of objects { stepNumber, approverEmail, ... }
                    const stepConfig = approvalConfig.find(s => s.stepNumber === currentStep);

                    // Check if currentUser is the approver
                    const canApprove = stepConfig && stepConfig.approverEmail === global1.user && status !== 'Approved' && status !== 'Draft' && status !== 'EditRequested';

                    // Approval Info
                    let infoText = "";
                    if (status === 'Draft') infoText = "Draft Mode";
                    else if (status === 'Approved') infoText = "Fully Approved";
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
                                {status === 'Draft' && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleEditPO(po)}
                                        >
                                            Edit Draft
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleSubmitPO(po)}
                                        >
                                            Submit
                                        </Button>
                                    </>
                                )}
                                {status === 'Submitted' && (currentRole === 'PE' || currentRole === 'SPE') && (
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        onClick={() => handleRequestEdit(po)}
                                    >
                                        Request Edit
                                    </Button>
                                )}
                                {status === 'EditRequested' && currentRole !== 'PE' && currentRole !== 'SPE' && (
                                    <Button
                                        variant="contained"
                                        color="info"
                                        size="small"
                                        onClick={() => handleApproveEditRequest(po)}
                                    >
                                        Approve Edit
                                    </Button>
                                )}
                                {status !== 'Draft' && status !== 'Approved' && status !== 'EditRequested' && currentRole !== 'PE' && currentRole !== 'SPE' && (
                                    <Button
                                        variant="contained"
                                        color="warning"
                                        size="small"
                                        onClick={() => handleEditPO(po)}
                                    >
                                        Manager Edit
                                    </Button>
                                )}
                                {canApprove && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="small"
                                            onClick={() => handleDynamicVerify(po._id)} // Using _id dynamically
                                        >
                                            Verify Step {currentStep}
                                        </Button>
                                        {currentStep > 1 && (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDynamicSendBack(po._id)} // Using _id dynamically
                                            >
                                                Send Back
                                            </Button>
                                        )}
                                    </>
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
                <Tab label={isEditMode ? "Edit PO" : "Create Empty Draft PO"} />
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
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    options={vendors}
                                    getOptionLabel={(option) => option.vendorname || ""}
                                    value={vendors.find(v => v._id === selectedVendor) || null}
                                    onChange={(event, newValue) => setSelectedVendor(newValue ? newValue._id : '')}
                                    disabled={isEditMode}
                                    renderInput={(params) => <TextField {...params} label="Select Vendor" />}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>PO Items</Typography>
                        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <Autocomplete
                                        options={storeRequests.filter(r => r.reqstatus !== 'Completed')}
                                        getOptionLabel={(option) => `${option.itemname || 'Unknown'} (PR: ${option.prnumber || option.name})`}
                                        value={storeRequests.find(r => r._id === activeStoreRequestId) || null}
                                        onChange={(event, newValue) => {
                                            setActiveStoreRequestId(newValue ? newValue._id : null);
                                            if (newValue && selectedVendor) {
                                                // Find matching master item by name/code
                                                const masterItem = allItems.find(i => i.itemcode === newValue.itemcode || i.itemname === newValue.itemname);
                                                if (masterItem) {
                                                    const vItem = filteredItems.find(vi => vi.itemid === masterItem._id || vi.item === newValue.itemname);
                                                    if (vItem) {
                                                        setSelectedItem(vItem._id);
                                                        setSelectedItemDetails(vItem);
                                                        const price = Number(vItem.price || 0);
                                                        const discount = Number(vItem.discount || 0);
                                                        const basePrice = price - (price * discount / 100);
                                                        setNewItemPrice(basePrice.toFixed(2));
                                                    } else {
                                                        alert("Selected vendor does not supply this PR item.");
                                                        setSelectedItem('');
                                                        setNewItemPrice('');
                                                    }
                                                }
                                                setNewItemQty(Number(newValue.quantity || 0) - Number(newValue.orderedQuantity || 0));
                                            } else {
                                                setSelectedItem('');
                                                setNewItemQty('');
                                                setNewItemPrice('');
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Select PR (Mandatory)" size="small" />}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth size="small">
                                    <Autocomplete
                                        options={filteredItems}
                                        getOptionLabel={(option) => `${option.item} (Price: ${option.price})`}
                                        value={filteredItems.find(vi => vi._id === selectedItem) || null}
                                        onChange={(event, newValue) => {
                                            const vItemId = newValue ? newValue._id : '';
                                            setSelectedItem(vItemId);

                                            if (newValue) {
                                                setSelectedItemDetails(newValue);
                                                const price = Number(newValue.price || 0);
                                                const discount = Number(newValue.discount || 0);
                                                const basePrice = price - (price * discount / 100);
                                                setNewItemPrice(basePrice.toFixed(2));
                                            } else {
                                                setSelectedItemDetails(null);
                                                setNewItemPrice('');
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Select Item" size="small" />}
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
                            {/* Items Table inside Create/Edit Tab - CLIENT SIDE PAGINATION ONLY */}
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
                    {isEditMode && <Button variant="text" onClick={() => { setIsEditMode(false); setPoItems([]); setTabValue(2); }}>Cancel Edit</Button>}
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
                <ImprestManagerds2 />
            )}

            {/* View PO Modal */}
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
                    <POInvoiceTemplate2
                        poData={viewPOData}
                        poItems={viewPOItems}
                        vendorData={viewVendorData}
                        instName={instName}
                        instAddress={instAddress}
                        instPhone={instPhone}
                        instShortName={instShortName}
                        isAmendment={isAmendment}
                        notes={poConfig.notes}  // Pass dynamic notes
                        terms={poConfig.terms}  // Pass dynamic terms
                    />
                </DialogContent>
            </Dialog>

            {/* Assignment Dialog */}
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

            {/* Add to Draft PO Modal for PE/SPE */}
            <Dialog open={openPOModal} onClose={() => setOpenPOModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>Add to PO / Open PO</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ borderLeft: '4px solid #1976d2', pl: 1 }}>
                            <strong>Processing PR:</strong> {selectedPRForPO?.itemname} (Max Quantity Available: {Number(selectedPRForPO?.quantity || 0) - Number(selectedPRForPO?.orderedQuantity || 0)})
                        </Typography>

                        <Box sx={{ mb: 3, mt: 2 }}>
                            <Button
                                variant={poCreationMode === 'NEW' ? 'contained' : 'outlined'}
                                onClick={() => { setPoCreationMode('NEW'); setPoModalVendor(''); setSelectedDraftPO(''); setSelectedItem(''); }}
                                sx={{ mr: 2 }}
                            >
                                Create New Draft PO
                            </Button>
                            <Button
                                variant={poCreationMode === 'EXISTING' ? 'contained' : 'outlined'}
                                onClick={async () => {
                                    setPoCreationMode('EXISTING');
                                    // ensure fresh drafts if someone else added one
                                    try {
                                        const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
                                        const allPOsUnpaginated = res.data.data.poOrders || [];
                                        setMatchingDraftPOs(allPOsUnpaginated.filter(po => po.postatus === 'Draft'));
                                        setPurchaseOrders(allPOsUnpaginated.map(p => ({ ...p, id: p._id })));
                                    } catch (e) {
                                        console.error("Failed to refresh drafts", e);
                                    }
                                    setPoModalVendor(''); setSelectedDraftPO(''); setSelectedItem('');
                                }}
                            >
                                Add to Existing PO
                            </Button>
                        </Box>

                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {poCreationMode === 'NEW' && (
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <Autocomplete
                                            options={vendors}
                                            getOptionLabel={(option) => option.vendorname || ""}
                                            value={vendors.find(v => v._id === poModalVendor) || null}
                                            onChange={(event, newValue) => handlePoModalVendorChange(newValue ? newValue._id : '')}
                                            renderInput={(params) => <TextField {...params} label="Select Vendor" />}
                                        />
                                    </FormControl>
                                </Grid>
                            )}

                            {poCreationMode === 'EXISTING' && (
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <Autocomplete
                                            options={matchingDraftPOs}
                                            getOptionLabel={(option) => `${option.poid} - ${option.vendor || 'Unknown Vendor'} (${option.price || 0} INR)`}
                                            value={matchingDraftPOs.find(p => p.poid === selectedDraftPO) || null}
                                            onChange={(event, newValue) => handlePoModalDraftSelection(newValue ? newValue.poid : '')}
                                            renderInput={(params) => <TextField {...params} label="Select Open Draft PO" />}
                                        />
                                    </FormControl>
                                </Grid>
                            )}

                            {selectedItem ? (
                                <>
                                    {selectedItemDetails && (
                                        <Grid item xs={12}>
                                            <Paper sx={{ p: 2, bgcolor: '#f4f6f8', border: '1px solid #ddd' }}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2"><strong>Vendor Global Terms:</strong> {vendors.find(v => v._id === poModalVendor)?.payterm || 'Not Defined'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2"><strong>Item Warranty:</strong> {selectedItemDetails.warranty || 'None Specified'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2"><strong>Item Payment Terms:</strong> {selectedItemDetails.paymentTerms || 'Standard Terms'}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant="body2"><strong>Tax Summary:</strong> GST {(selectedItemDetails.igst || 0) > 0 ? selectedItemDetails.igst : ((selectedItemDetails.cgst || 0) + (selectedItemDetails.sgst || 0))}% (CGST {selectedItemDetails.cgst || 0}%, SGST {selectedItemDetails.sgst || 0}%, IGST {selectedItemDetails.igst || 0}%)</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>
                                    )}

                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            label="Quantity to Order"
                                            type="number"
                                            fullWidth
                                            value={newItemQty}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                const maxQty = Number(selectedPRForPO?.quantity || 0) - Number(selectedPRForPO?.orderedQuantity || 0);
                                                if (val > maxQty) {
                                                    setNewItemQty(maxQty); // Prevent exceeding PR limit
                                                } else {
                                                    setNewItemQty(val);
                                                }
                                            }}
                                            helperText={`Max: ${Number(selectedPRForPO?.quantity || 0) - Number(selectedPRForPO?.orderedQuantity || 0)}`}
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <TextField label="Unit Price" type="number" fullWidth value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Delivery Type</InputLabel>
                                            <Select value="Physical Delivery" label="Delivery Type">
                                                <MenuItem value="Physical Delivery">Physical Delivery</MenuItem>
                                                <MenuItem value="Online Delivery">Online Delivery</MenuItem>
                                                <MenuItem value="Service Based">Service Based</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </>
                            ) : poModalVendor ? (
                                <Grid item xs={12}>
                                    <Typography color="error" variant="body2">⚠️ This vendor does not supply the master item ({selectedPRForPO?.itemname}) as specified in the PR. Please map it or select a different Vendor/PO.</Typography>
                                </Grid>
                            ) : null}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPOModal(false)}>Cancel</Button>
                    <Button variant="contained" disabled={!selectedItem || (!poModalVendor) || (poCreationMode === 'EXISTING' && !selectedDraftPO)} onClick={submitAddPRToPO}>
                        Submit / Save to Draft
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PurchaseOrderDashboardds2;
