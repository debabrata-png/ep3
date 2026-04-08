import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    Chip, Button, Paper, Grid, FormControl, InputLabel, Select, MenuItem,
    TextField, Switch, FormControlLabel, Autocomplete
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ep1 from '../api/ep1';
import global1 from './global1';
import POInvoiceTemplate2 from './POInvoiceTemplate2';
import ImprestManagerds2 from './ImprestManagerds2';

const PurchaseOrderDashboardNewds2 = ({ role }) => {
    const currentRole = global1.role; // Always use actual runtime role from global state
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

    const [prPaginationModel, setPrPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [poPaginationModel, setPoPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [prRowCount, setPrRowCount] = useState(0);
    const [poRowCount, setPoRowCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Add-to-PO Modal State
    const [openPOModal, setOpenPOModal] = useState(false);
    const [selectedPRForPO, setSelectedPRForPO] = useState(null);
    const [poModalVendor, setPoModalVendor] = useState('');
    const [poCreationMode, setPoCreationMode] = useState('NEW'); // 'NEW' | 'EXISTING'
    const [matchingDraftPOs, setMatchingDraftPOs] = useState([]);
    const [selectedDraftPO, setSelectedDraftPO] = useState('');
    const [poItemVendorItem, setPoItemVendorItem] = useState(null);
    const [addToPoQty, setAddToPoQty] = useState('');
    const [addToPoPrice, setAddToPoPrice] = useState('');
    const [selectedPODeliveryType, setSelectedPODeliveryType] = useState('Physical Delivery');

    // PO History Modal State
    const [openHistoryModal, setOpenHistoryModal] = useState(false);
    const [historyPO, setHistoryPO] = useState(null);
    const [poLogs, setPoLogs] = useState([]);

    // Delivery Types
    const [deliveryTypes, setDeliveryTypes] = useState([]);

    // Budget Tracking
    const [availableBudget, setAvailableBudget] = useState(null);

    const fetchAvailableBudget = async (category) => {
        if (!category) {
            setAvailableBudget(null);
            return;
        }
        try {
            const yearStr = new Date().getFullYear().toString();
            const res = await ep1.get(`/api/v2/getavailbudgetbycategoryds?colid=${global1.colid}&category=${encodeURIComponent(category)}`);
            if (res.data && res.data.data) {
                setAvailableBudget(res.data.data.availableAmount);
            } else {
                setAvailableBudget(null);
            }
        } catch (error) {
            console.error("Error fetching budget for category", error);
            setAvailableBudget(null);
        }
    };

    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            if (tabValue === 0) {
                const page = prPaginationModel.page + 1;
                const limit = prPaginationModel.pageSize;
                await fetchStoreRequests(page, limit);
            }
            if (tabValue === 1) {
                await fetchStoreRequests();
                fetchVendors(); fetchAllItems(); fetchVendorItems(); fetchPoConfig(); fetchDeliveryTypes();
            }
            if (tabValue === 2) {
                const page = poPaginationModel.page + 1;
                const limit = poPaginationModel.pageSize;
                await fetchPOs(page, limit); fetchApprovalConfig(); fetchPoConfig(); fetchDeliveryTypes();
            }
            setLoading(false);
        };
        fetchData();
    }, [tabValue, prPaginationModel, poPaginationModel]);

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
            const cacheBuster = `_t=${new Date().getTime()}`;
            let url;
            // Always use global1.role — never the static 'OE' prop from OEDashboardds2
            if (currentRole === 'OE' || currentRole === 'PE' || currentRole === 'SPE') {
                url = page ? `/api/v2/getAssignedRequisitions2?colid=${global1.colid}&page=${page}&limit=${limit}&user=${global1.user}&${cacheBuster}`
                    : `/api/v2/getAssignedRequisitions2?colid=${global1.colid}&user=${global1.user}&${cacheBuster}`;
            } else {
                url = page ? `/api/v2/getallstorerequisationds2?colid=${global1.colid}&page=${page}&limit=${limit}&${cacheBuster}`
                    : `/api/v2/getallstorerequisationds2?colid=${global1.colid}&${cacheBuster}`;
            }
            const response = await ep1.get(url);
            let reqs = response.data.data.requisitions || [];

            try {
                const assignRes = await ep1.get(`/api/v2/getallprassigneds2?colid=${global1.colid}`);
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
            if (page) setPrRowCount(response.data.total || response.data.count || 0);
        } catch (error) { console.error(error); }
    };

    const fetchVendors = async () => {
        try {
            const response = await ep1.get(`/api/v2/getallvendords2?colid=${global1.colid}`);
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
            const cacheBuster = `_t=${new Date().getTime()}`;
            const url = page
                ? `/api/v2/getallstorepoorderds2?colid=${global1.colid}&page=${page}&limit=${limit}&${cacheBuster}`
                : `/api/v2/getallstorepoorderds2?colid=${global1.colid}&${cacheBuster}`;
            const response = await ep1.get(url);
            const orders = response.data.data.poOrders || [];
            setPurchaseOrders(orders.map(p => ({ ...p, id: p._id })));
            if (page) setPoRowCount(response.data.total || response.data.count || 0);
        } catch (error) { console.error(error); }
    };

    const fetchDeliveryTypes = async () => {
        try {
            const res = await ep1.get(`/api/v2/getalldeliverytypeds2?colid=${global1.colid}`);
            const types = res.data.data.deliveryTypes || [];
            setDeliveryTypes(types.map(t => t.name));
        } catch (e) {
            // fallback defaults
            setDeliveryTypes(['Physical Delivery', 'Online Delivery', 'Service Based']);
        }
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

    // ─── Add-to-PO Modal Handlers ──────────────────────────────────────────────
    const handleOpenAddToPOModal = async (pr) => {
        setSelectedPRForPO(pr);
        setPoModalVendor('');
        setPoCreationMode('NEW');
        setSelectedDraftPO('');
        setPoItemVendorItem(null);
        setAddToPoQty(pr.quantity || '');
        setAddToPoPrice('');
        setMatchingDraftPOs([]);

        // Ensure all data arrays are ready for fallback matches
        if (vendors.length === 0) await fetchVendors();
        if (vendorItems.length === 0) await fetchVendorItems();

        let localAllItems = allItems;
        if (localAllItems.length === 0) {
            try {
                const response = await ep1.get(`/api/v2/getallitemmasterds2?colid=${global1.colid}`);
                localAllItems = response.data.data.items || [];
                setAllItems(localAllItems);
            } catch (error) { console.error(error); }
        }

        // Find category: either from PR or fallback to master items list
        let prCategory = pr.category;
        if (!prCategory) {
            const mItem = localAllItems.find(i => i._id === pr.itemid || i.itemname === pr.itemname || i.item === pr.itemname);
            if (mItem) prCategory = mItem.category;
        }

        // Save computed category so the JSX can display it easily
        pr.computedCategory = prCategory;

        if (prCategory) {
            fetchAvailableBudget(prCategory);
        } else {
            setAvailableBudget(null);
        }

        // Pre-load all draft POs so we have them ready
        try {
            const res = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
            const allPOs = res.data.data.poOrders || [];
            setMatchingDraftPOs(allPOs.filter(p => p.postatus === 'Draft'));
        } catch (e) { console.error(e); }

        setOpenPOModal(true);
    };

    const handlePoModalVendorChange = (vendorId) => {
        setPoModalVendor(vendorId);
        setPoItemVendorItem(null);
        setAddToPoPrice('');
        if (!vendorId || !selectedPRForPO) return;

        // Find vendor-item mapping for the PR's item
        const pr = selectedPRForPO;
        const vItem = vendorItems.find(vi =>
            vi.vendorid === vendorId &&
            (vi.itemid === pr.itemid || vi.item === pr.itemname)
        );
        if (vItem) {
            setPoItemVendorItem(vItem);
            const price = Number(vItem.price || 0);
            const discount = Number(vItem.discount || 0);
            setAddToPoPrice((price - price * discount / 100).toFixed(2));
        }
    };

    const submitAddPRToPO = async () => {
        if (!poModalVendor) return alert('Please select a vendor.');
        if (!addToPoQty || Number(addToPoQty) <= 0) return alert('Please enter a valid quantity.');
        if (!addToPoPrice || Number(addToPoPrice) <= 0) return alert('Please enter a valid price.');
        if (poCreationMode === 'EXISTING' && !selectedDraftPO) return alert('Please select a draft PO to add to.');

        const pr = selectedPRForPO;
        const maxQty = Number(pr.quantity || 0) - Number(pr.orderedQuantity || 0);
        if (Number(addToPoQty) > maxQty) return alert(`Cannot exceed PR remaining quantity (${maxQty}).`);

        try {
            const vendorObj = vendors.find(v => v._id === poModalVendor);
            const vItem = poItemVendorItem;
            const qty = Number(addToPoQty);
            const basePrice = Number(addToPoPrice);
            const igst = Number(vItem?.igst || 0);
            const sgst = Number(vItem?.sgst || 0);
            const cgst = Number(vItem?.cgst || 0);
            const totalTax = igst > 0 ? igst : (sgst + cgst);
            const taxPerUnit = basePrice * (totalTax / 100);
            const unitWithTax = basePrice + taxPerUnit;
            const lineTotal = (basePrice * qty) + (taxPerUnit * qty);

            let targetPOId = selectedDraftPO;

            if (poCreationMode === 'NEW') {
                // Generate sequential PO number: PO-{YYYY}{MM}{seq}
                const poDate = new Date();
                const poYYYY = poDate.getFullYear();
                const poMM = String(poDate.getMonth() + 1).padStart(2, '0');
                const poBase = `PO-${poYYYY}${poMM}`;
                let poSeq = 1;
                try {
                    const seqRes = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
                    const allPOs = seqRes.data.data.poOrders || seqRes.data.data.pos || [];
                    const matching = allPOs.filter(p => p.poid && p.poid.startsWith(poBase));
                    if (matching.length > 0) {
                        const maxSeq = Math.max(...matching.map(p => {
                            const parts = p.poid.split('-');
                            return parseInt(parts[parts.length - 1], 10) || 0;
                        }));
                        poSeq = maxSeq + 1;
                    }
                } catch (e) { console.error('Error fetching POs for sequence:', e); }
                const newPOId = `${poBase}-${String(poSeq).padStart(3, '0')}`;
                const poPayload = {
                    name: newPOId,
                    vendorid: poModalVendor,
                    vendor: vendorObj?.vendorname,
                    year: new Date().getFullYear().toString(),
                    poid: newPOId,
                    postatus: 'Draft',
                    deliveryType: selectedPODeliveryType,
                    poType: 'Standard',
                    colid: global1.colid,
                    user: global1.user,
                    price: lineTotal,
                    netprice: lineTotal,
                    returnamount: 0,
                    creatorName: global1.name || global1.user,
                    storeid: pr.storeid,
                    storename: pr.store || 'Main Store'
                };
                const poRes = await ep1.post('/api/v2/addstorepoorderds2', poPayload);
                targetPOId = poRes.data.data.poid;
            } else {
                const existingPO = matchingDraftPOs.find(p => p.poid === selectedDraftPO);
                if (existingPO) {
                    await ep1.post(`/api/v2/updatestorepoorderds2?id=${existingPO._id}`, {
                        price: (Number(existingPO.price) || 0) + lineTotal,
                        netprice: (Number(existingPO.netprice) || 0) + lineTotal
                    });
                }
            }

            // Add PO item
            await ep1.post('/api/v2/addstorepoitemsds2', {
                name: `POI-${Date.now()}`,
                poid: targetPOId,
                vendorid: poModalVendor,
                vendor: vendorObj?.vendorname,
                itemid: pr.itemid || '',
                itemname: pr.itemname,
                itemcode: pr.itemcode || '',
                itemtype: pr.itemtype || '',
                category: pr.category || '',
                unit: pr.unit || vItem?.unit || '',
                gst: totalTax, sgst, cgst, igst,
                quantity: qty,
                price: basePrice,
                unitPriceWithTax: unitWithTax,
                total: lineTotal,
                postatus: 'Draft',
                year: new Date().getFullYear().toString(),
                colid: global1.colid,
                user: global1.user,
                storereqid: pr._id,
                storeid: pr.storeid,
                storename: pr.store || 'Main Store'
            });

            // Update PR orderedQuantity
            await ep1.post(`/api/v2/updatestorerequisationds2?id=${pr._id}`, {
                orderedQuantity: Number(pr.orderedQuantity || 0) + qty
            });

            alert('Added to PO successfully! View in Manage POs → Draft.');
            setOpenPOModal(false);
            setPoPaginationModel({ page: 0, pageSize: 10 });
            setTabValue(2); // Auto-switch to Manage POs tab to see the new PO
        } catch (err) {
            console.error(err);
            alert('Failed: ' + (err.response?.data?.message || err.message));
        }
    };

    // ─── PO History Modal Handler ────────────────────────────────────────────
    const handleViewHistory = async (po) => {
        setHistoryPO(po);
        setPoLogs([]);
        setOpenHistoryModal(true);
        try {
            const res = await ep1.get(`/api/v2/getpologds2?colid=${global1.colid}&poid=${po.poid}`);
            setPoLogs(res.data.data.logs || []);
        } catch (e) {
            console.error(e);
        }
    };



    const handleEditPO = async (po) => {
        if (currentRole === 'PE' || currentRole === 'SPE') {
            if (po.postatus !== 'Draft') {
                alert('You can only edit Draft POs directly. Request an edit for Submitted POs.');
                return;
            }
        }

        setIsEditMode(true);
        setEditingPOId(po._id);
        setEditingPOObj(po);
        setSelectedVendor(po.vendorid);

        try {
            const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
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

    const handleRequestEdit = async (poId) => {
        try {
            await ep1.post('/api/v2/requestpoedit2', { id: poId, user: global1.user });
            alert("Edit Request sent to Manager");
            fetchPOs(poPaginationModel.page + 1, poPaginationModel.pageSize);
        } catch (e) {
            console.error(e);
            alert("Failed to request edit");
        }
    };

    const handleSubmitPO = async (poId) => {
        try {
            await ep1.post(`/api/v2/updatestorepoorderds2?id=${poId}`, { postatus: 'Submitted' });
            alert("PO Submitted Successfully");
            fetchPOs(poPaginationModel.page + 1, poPaginationModel.pageSize);
        } catch (e) {
            console.error(e);
            alert("Failed to submit PO");
        }
    };

    const handleManagerReviewEditRequest = async (poId, approved) => {
        try {
            await ep1.post('/api/v2/approvepoedit2', { id: poId, user: global1.user, approved });
            alert(`Edit Request ${approved ? 'Approved' : 'Rejected'}.`);
            fetchPOs(poPaginationModel.page + 1, poPaginationModel.pageSize);
        } catch (e) {
            console.error(e);
            alert("Failed to review edit request");
        }
    };

    const handleSavePO = async () => {
        if (!selectedVendor) {
            alert('Please select a Vendor first.');
            return;
        }
        // Allow empty draft PO — items can be added later
        try {
            let currentPO = editingPOObj;
            let currentPOIdStr = currentPO?.poid;
            const vendorObj = vendors.find(v => v._id === selectedVendor);
            const totalAmount = poItems.reduce((sum, item) => sum + (Number(item.total || 0)), 0);

            if (!isEditMode) {
                // Generate sequential PO number: PO-{YYYY}{MM}{seq}
                const poDate = new Date();
                const poYYYY = poDate.getFullYear();
                const poMM = String(poDate.getMonth() + 1).padStart(2, '0');
                const poBase = `PO-${poYYYY}${poMM}`;
                let poSeq = 1;
                try {
                    const seqRes = await ep1.get(`/api/v2/getallstorepoorderds2?colid=${global1.colid}`);
                    const allPOs = seqRes.data.data.poOrders || seqRes.data.data.pos || [];
                    const matching = allPOs.filter(p => p.poid && p.poid.startsWith(poBase));
                    if (matching.length > 0) {
                        const maxSeq = Math.max(...matching.map(p => {
                            const parts = p.poid.split('-');
                            return parseInt(parts[parts.length - 1], 10) || 0;
                        }));
                        poSeq = maxSeq + 1;
                    }
                } catch (e) { console.error('Error fetching POs for sequence:', e); }
                const newPOId = `${poBase}-${String(poSeq).padStart(3, '0')}`;
                const poPayload = {
                    name: newPOId,
                    vendorid: selectedVendor,
                    vendor: vendorObj?.vendorname,
                    year: new Date().getFullYear().toString(),
                    poid: newPOId,
                    postatus: 'Draft',
                    deliveryType: selectedPODeliveryType || 'Physical Delivery',
                    colid: global1.colid,
                    user: global1.user,
                    price: totalAmount,
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
                const poPayload = {
                    price: totalAmount,
                    netprice: totalAmount,
                };
                await ep1.post(`/api/v2/updatestorepoorderds2?id=${currentPO._id}`, poPayload);
            }

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

            alert(isEditMode ? 'PO Draft Updated Successfully' : 'PO Draft Created Successfully');
            setPoItems([]);
            setSelectedVendor('');
            setSelectedCategory('');
            setSelectedType('');
            setSelectedMasterItem('');
            setIsEditMode(false);
            setEditingPOId(null);
            setEditingPOObj(null);
            setPoPaginationModel({ page: 0, pageSize: poPaginationModel.pageSize });
            setTabValue(2);
            // fetchPOs is handled by useEffect when tabValue or poPaginationModel changes
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
            fetchPOs(poPaginationModel.page + 1, poPaginationModel.pageSize);
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
            const res = await ep1.get(`/api/v2/getallstorepoitemsds2?colid=${global1.colid}`);
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
            const res = await ep1.get(`/api/v2/getOEUsers2?colid=${global1.colid}`);
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
                const checkRes = await ep1.get(`/api/v2/getallprassigneds2?colid=${global1.colid}`);
                const allAssignments = checkRes.data?.data?.assignments || [];
                const assignmentObj = allAssignments.find(a => a.storereqid === selectedReqForAssign._id);

                if (assignmentObj) {
                    await ep1.post(`/api/v2/updateprassigneds2?id=${assignmentObj._id}`, {
                        prassigneemail: userObj.email,
                        prassignename: userObj.name
                    });
                    alert("Re-assigned Successfully");
                } else {
                    alert("Could not find original assignment to update");
                }
            } else {
                await ep1.post('/api/v2/addprassigneds2', {
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
            fetchStoreRequests(prPaginationModel.page + 1, prPaginationModel.pageSize);
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
                    colDef.valueFormatter = (value) => {
                        if (!value) return 'N/A';
                        const date = new Date(value);
                        if (isNaN(date.getTime())) return value;
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

        if (context === 'storeRequests') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 250,
                renderCell: (params) => {
                    const isCompleted = params.row.reqstatus === 'Completed';
                    const isAssigned = params.row.reqstatus === 'Assigned';
                    const isPERole = currentRole === 'PE' || currentRole === 'SPE';
                    const isManagerRole = currentRole !== 'PE' && currentRole !== 'SPE' && currentRole !== 'OE';

                    if (isCompleted) return <Typography variant="caption">Completed</Typography>;

                    // PE/SPE: Add to PO buttons only
                    if (isPERole && isAssigned) {
                        return (
                            <Box display="flex" gap={1}>
                                <Button variant="contained" color="primary" size="small" onClick={() => handleOpenAddToPOModal(params.row)}>Add to PO</Button>
                                <Button variant="outlined" color="primary" size="small" onClick={() => handleOpenAddToPOModal(params.row)}>Open POs</Button>
                            </Box>
                        );
                    }

                    // Manager: Assign/Reassign
                    if (isManagerRole) {
                        return (
                            <Button variant="contained" size="small" onClick={() => isAssigned ? handleOpenReassignDialog(params.row) : handleOpenAssignDialog(params.row)}>
                                {isAssigned ? 'Reassign' : 'Assign'}
                            </Button>
                        );
                    }

                    return null;
                }
            });
        }

        if (context === 'poItems') {
            cols.push({
                field: 'actions',
                headerName: 'Actions',
                width: 150,
                renderCell: (params) => {
                    const isDraft = params.row.postatus === 'Draft' || params.row.isNew;
                    return isDraft ? (
                        <Button color="error" size="small" onClick={() => handleRemoveItem(params.row.id)}>Remove</Button>
                    ) : null;
                }
            });
        }

        if (context === 'purchaseOrders') {
            cols.push({
                field: 'actions',
                headerName: 'Actions & Approvals',
                width: 450,
                renderCell: (params) => {
                    const po = params.row;
                    const currentStep = po.currentStep || 1;
                    const status = po.postatus || 'Draft';
                    const stepConfig = approvalConfig.find(s => s.stepNumber === currentStep);
                    const canApprove = stepConfig && stepConfig.approverEmail === global1.user && status !== 'Approved' && status !== 'Draft';

                    let infoText = "";
                    if (status === 'Approved') infoText = "Fully Approved";
                    else if (status === 'Draft') infoText = "Draft (Not Submitted)";
                    else if (status === 'EditRequested') infoText = "Edit Requested by PE";
                    else if (stepConfig) infoText = `Waiting for: ${stepConfig.approverEmail}`;
                    else infoText = "Submitted - Pending Configuration";

                    const isPE = currentRole === 'PE' || currentRole === 'SPE';
                    const isManager = currentRole === 'Purchase Manager' || currentRole === 'Admin' || currentRole === 'Purchasepu';

                    return (
                        <Box display="flex" flexDirection="column" gap={1}>
                            <Typography variant="caption" color="textSecondary">
                                {infoText}
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                <Button variant="contained" color="secondary" size="small" onClick={() => handleViewPO(po)}>
                                    View / Print
                                </Button>

                                {/* Draft Controls */}
                                {(status === 'Draft' || status === 'Pending') && (isPE || isManager) && (
                                    <>
                                        <Button variant="contained" color="primary" size="small" onClick={() => handleEditPO(po)}>
                                            Edit Draft
                                        </Button>
                                        <Button variant="contained" color="success" size="small" onClick={() => handleSubmitPO(po._id)}>
                                            Submit PO
                                        </Button>
                                    </>
                                )}

                                {/* PE Edit Request */}
                                {status === 'Submitted' && isPE && (
                                    <Button variant="outlined" color="warning" size="small" onClick={() => handleRequestEdit(po._id)}>
                                        Request Edit
                                    </Button>
                                )}

                                {/* Manager Edit Approvals */}
                                {status === 'EditRequested' && isManager && (
                                    <>
                                        <Button variant="contained" color="success" size="small" onClick={() => handleManagerReviewEditRequest(po._id, true)}>
                                            Approve Edit
                                        </Button>
                                        <Button variant="outlined" color="error" size="small" onClick={() => handleManagerReviewEditRequest(po._id, false)}>
                                            Reject Edit
                                        </Button>
                                    </>
                                )}

                                {/* Dynamic Approval Step */}
                                {canApprove && (
                                    <Button variant="contained" color="primary" size="small" onClick={() => handleDynamicVerify(po._id)}>
                                        Verify Step {currentStep}
                                    </Button>
                                )}

                                {/* CA / Approver: Send Back one step */}
                                {canApprove && currentStep > 1 && (
                                    <Button variant="outlined" color="warning" size="small" onClick={() => {
                                        const remarks = prompt('Reason for sending back (optional):') || 'Sent back for revisions';
                                        ep1.post('/api/v2/sendBackDynamicStep2', { id: po._id, user_email: global1.user, remarks })
                                            .then(() => { alert('Sent back one step.'); fetchPOs(poPaginationModel.page + 1, poPaginationModel.pageSize); })
                                            .catch(e => alert(e.response?.data?.message || e.message));
                                    }}>
                                        Send Back
                                    </Button>
                                )}

                                {/* PO History */}
                                <Button variant="text" size="small" color="info" onClick={() => handleViewHistory(po)}>History</Button>
                            </Box>
                        </Box>
                    );
                }
            });
        }
        return cols;
    };

    const storeReqColumns = generateColumns(storeRequests, 'storeRequests');

    // Static PO items columns — prevents 'No columns' when list is empty
    const poItemsColumns = [
        { field: 'itemname', headerName: 'Item Name', width: 180 },
        { field: 'itemtype', headerName: 'Type', width: 110 },
        { field: 'category', headerName: 'Category', width: 120 },
        { field: 'unit', headerName: 'Unit', width: 80 },
        { field: 'quantity', headerName: 'Qty', width: 80, type: 'number' },
        { field: 'price', headerName: 'Unit Price (₹)', width: 120, type: 'number' },
        { field: 'gst', headerName: 'GST %', width: 80, type: 'number' },
        { field: 'total', headerName: 'Total (₹)', width: 110, type: 'number' },
        {
            field: 'actions', headerName: 'Actions', width: 120,
            renderCell: (params) => {
                const isDraft = params.row.postatus === 'Draft' || params.row.isNew;
                return isDraft ? (
                    <Button color="error" size="small" onClick={() => handleRemoveItem(params.row.id)}>Remove</Button>
                ) : null;
            }
        }
    ];

    // Static PO columns — defined independently of data to prevent 'No columns' on empty list
    const poColumns = [
        { field: 'poid', headerName: 'PO ID', width: 160 },
        { field: 'vendor', headerName: 'Vendor', width: 160 },
        {
            field: 'postatus', headerName: 'Status', width: 130,
            renderCell: (params) => (
                <Chip
                    label={params.value || 'Draft'}
                    color={params.value === 'Approved' ? 'success' : params.value === 'Draft' ? 'default' : params.value?.includes('Sent Back') ? 'error' : 'warning'}
                    size="small"
                />
            )
        },
        { field: 'deliveryType', headerName: 'Delivery Type', width: 150 },
        { field: 'year', headerName: 'Year', width: 80 },
        {
            field: 'price', headerName: 'Total (₹)', width: 130,
            renderCell: (params) => {
                const v = parseFloat(params.value);
                return `₹${isNaN(v) ? '0.00' : v.toFixed(2)}`;
            }
        },
        {
            field: 'netprice', headerName: 'Net Price (₹)', width: 130,
            renderCell: (params) => {
                const v = parseFloat(params.value);
                return `₹${isNaN(v) ? '0.00' : v.toFixed(2)}`;
            }
        },
        { field: 'storename', headerName: 'Store', width: 140 },
        { field: 'poType', headerName: 'PO Type', width: 110 },
        { field: 'creatorName', headerName: 'Created By', width: 150 },
        {
            field: 'updatedate', headerName: 'Date', width: 120,
            renderCell: (params) => {
                const raw = params.row.updatedate || params.row.createdAt;
                if (!raw) return 'N/A';
                const d = new Date(raw);
                if (isNaN(d.getTime())) return String(raw);
                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            }
        },
        {
            field: 'actions', headerName: 'Actions & Approvals', width: 450,
            renderCell: (params) => {
                const po = params.row;
                const currentStep = po.currentStep || 1;
                const status = po.postatus || 'Draft';
                const stepConfig = approvalConfig.find(s => s.stepNumber === currentStep);
                const canApprove = stepConfig && stepConfig.approverEmail === global1.user && status !== 'Approved' && status !== 'Draft';
                let infoText = status === 'Approved' ? 'Fully Approved' : status === 'Draft' ? 'Draft' : status === 'EditRequested' ? 'Edit Requested' : stepConfig ? `Waiting: ${stepConfig.approverEmail}` : 'Submitted';
                const isPE = currentRole === 'PE' || currentRole === 'SPE';
                const isManager = currentRole === 'Purchase Manager' || currentRole === 'Admin' || currentRole === 'Purchasepu';
                return (
                    <Box display="flex" flexDirection="column" gap={0.5}>
                        <Typography variant="caption" color="textSecondary">{infoText}</Typography>
                        <Box display="flex" gap={0.5} flexWrap="wrap">
                            <Button variant="contained" color="secondary" size="small" onClick={() => handleViewPO(po)}>View / Print</Button>
                            {(status === 'Draft' || status === 'Pending') && (isPE || isManager) && (
                                <>
                                    <Button variant="contained" color="primary" size="small" onClick={() => handleEditPO(po)}>Edit Draft</Button>
                                    <Button variant="contained" color="success" size="small" onClick={() => handleSubmitPO(po._id)}>Submit PO</Button>
                                </>
                            )}
                            {status === 'Submitted' && isPE && (
                                <Button variant="outlined" color="warning" size="small" onClick={() => handleRequestEdit(po._id)}>Request Edit</Button>
                            )}
                            {status === 'EditRequested' && isManager && (
                                <>
                                    <Button variant="contained" color="success" size="small" onClick={() => handleManagerReviewEditRequest(po._id, true)}>Approve Edit</Button>
                                    <Button variant="outlined" color="error" size="small" onClick={() => handleManagerReviewEditRequest(po._id, false)}>Reject Edit</Button>
                                </>
                            )}
                            {canApprove && (
                                <Button variant="contained" color="primary" size="small" onClick={() => handleDynamicVerify(po._id)}>Verify Step {currentStep}</Button>
                            )}
                            {canApprove && currentStep > 1 && (
                                <Button variant="outlined" color="warning" size="small" onClick={() => {
                                    const remarks = prompt('Reason for sending back:') || 'Sent back for revisions';
                                    ep1.post('/api/v2/sendBackDynamicStep2', { id: po._id, user_email: global1.user, remarks })
                                        .then(() => { alert('Sent back.'); fetchPOs(poPaginationModel.page + 1, poPaginationModel.pageSize); })
                                        .catch(e => alert(e.message));
                                }}>Send Back</Button>
                            )}
                            <Button variant="text" size="small" color="info" onClick={() => handleViewHistory(po)}>History</Button>
                        </Box>
                    </Box>
                );
            }
        }
    ];

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
                        paginationModel={prPaginationModel}
                        onPaginationModelChange={setPrPaginationModel}
                        paginationMode="server"
                        rowCount={prRowCount}
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
                                        fetchAvailableBudget(newValue || '');
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
                                {availableBudget !== null && (
                                    <Typography variant="caption" color="primary" sx={{ mt: 1, ml: 1 }}>
                                        Available Budget: ₹{availableBudget.toFixed(2)}
                                    </Typography>
                                )}
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
                                    disabled={isEditMode && poItems.length > 0}
                                    renderInput={(params) => <TextField {...params} label="Vendor" />}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Delivery Type selector for Create PO */}
                    <Box mb={2} mt={1}>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
                            <InputLabel>Delivery Type</InputLabel>
                            <Select value={selectedPODeliveryType} label="Delivery Type" disabled={isEditMode} onChange={(e) => setSelectedPODeliveryType(e.target.value)}>
                                {(deliveryTypes.length > 0 ? deliveryTypes : ['Physical Delivery', 'Online Delivery', 'Service Based']).map(dt => (
                                    <MenuItem key={dt} value={dt}>{dt}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

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

                    <Box display="flex" gap={2} alignItems="center" mt={2} flexWrap="wrap">
                        <Button variant="contained" color="primary" onClick={handleSavePO}>
                            {isEditMode ? 'Update Purchase Order' : poItems.length === 0 ? 'Save as Empty Draft PO' : 'Generate Purchase Order'}
                        </Button>
                        {!isEditMode && poItems.length === 0 && selectedVendor && (
                            <Typography variant="caption" color="text.secondary">
                                💡 You can save an empty Draft PO now and add items later from the Store Requests tab or by editing this PO.
                            </Typography>
                        )}
                        {isEditMode && <Button variant="text" onClick={() => { setIsEditMode(false); setPoItems([]); setTabValue(2); setSelectedVendor(''); setSelectedCategory(''); setSelectedType(''); setSelectedMasterItem(''); }}>Cancel Edit</Button>}
                    </Box>
                </Box>
            )}

            {tabValue === 2 && (
                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={purchaseOrders}
                        columns={poColumns}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={poPaginationModel}
                        onPaginationModelChange={setPoPaginationModel}
                        paginationMode="server"
                        rowCount={poRowCount}
                        loading={loading}
                        disableSelectionOnClick
                    />
                </Paper>
            )}

            {tabValue === 3 && (
                <ImprestManagerds2 />
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
                    <POInvoiceTemplate2
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

            {/* ─── Add-to-PO / Open PO Modal ──────────────────────────────────────── */}
            <Dialog open={openPOModal} onClose={() => setOpenPOModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Add PR to Purchase Order — {selectedPRForPO?.itemname} (Remaining: {Number(selectedPRForPO?.quantity || 0) - Number(selectedPRForPO?.orderedQuantity || 0)} {selectedPRForPO?.unit || ''})
                </DialogTitle>
                <DialogContent dividers>
                    {availableBudget !== null && (
                        <Box mb={2} p={1} bgcolor="#f0fdf4" border="1px solid #bbf7d0" borderRadius={1}>
                            <Typography variant="subtitle2" color="success.main">
                                Available Budget for {selectedPRForPO?.computedCategory || selectedPRForPO?.category || 'Category'}: ₹{availableBudget.toFixed(2)}
                            </Typography>
                        </Box>
                    )}
                    <Box display="flex" gap={2} mb={2}>
                        <Button variant={poCreationMode === 'NEW' ? 'contained' : 'outlined'} onClick={() => {
                            setPoCreationMode('NEW');
                            setSelectedDraftPO('');
                            setPoModalVendor('');
                            setPoItemVendorItem(null);
                            setAddToPoPrice('');
                        }}>Create New Draft PO</Button>
                        <Button variant={poCreationMode === 'EXISTING' ? 'contained' : 'outlined'} onClick={() => setPoCreationMode('EXISTING')}>Add to Existing Draft PO</Button>
                    </Box>

                    <Grid container spacing={2}>
                        {/* NEW mode: user picks vendor freely */}
                        {poCreationMode === 'NEW' && (
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={vendors}
                                    getOptionLabel={(o) => o.vendorname || ''}
                                    value={vendors.find(v => v._id === poModalVendor) || null}
                                    onChange={(_, nv) => handlePoModalVendorChange(nv ? nv._id : '')}
                                    renderInput={(params) => <TextField {...params} label="Select Vendor" />}
                                />
                            </Grid>
                        )}

                        {/* EXISTING mode: pick draft PO first — vendor is auto-filled from it */}
                        {poCreationMode === 'EXISTING' && (
                            <Grid item xs={12}>
                                <Autocomplete
                                    options={matchingDraftPOs}
                                    getOptionLabel={(o) => `${o.poid} — ${o.vendor || 'Unknown Vendor'} (₹${o.price || 0})`}
                                    value={matchingDraftPOs.find(p => p.poid === selectedDraftPO) || null}
                                    onChange={(_, nv) => {
                                        if (nv) {
                                            setSelectedDraftPO(nv.poid);
                                            // Auto-fill vendor from the existing PO — no need to re-select
                                            handlePoModalVendorChange(nv.vendorid);
                                        } else {
                                            setSelectedDraftPO('');
                                            setPoModalVendor('');
                                            setPoItemVendorItem(null);
                                            setAddToPoPrice('');
                                        }
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Select Open Draft PO" />}
                                />
                                {/* Show the vendor that is locked to the selected PO */}
                                {selectedDraftPO && poModalVendor && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        🔒 Vendor locked: <strong>{vendors.find(v => v._id === poModalVendor)?.vendorname || matchingDraftPOs.find(p => p.poid === selectedDraftPO)?.vendor || poModalVendor}</strong>
                                    </Typography>
                                )}
                            </Grid>
                        )}

                        {/* Delivery Type */}
                        {poCreationMode === 'NEW' && (
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Delivery Type</InputLabel>
                                    <Select value={selectedPODeliveryType} label="Delivery Type" onChange={(e) => setSelectedPODeliveryType(e.target.value)}>
                                        {(deliveryTypes.length > 0 ? deliveryTypes : ['Physical Delivery', 'Online Delivery', 'Service Based']).map(dt => (
                                            <MenuItem key={dt} value={dt}>{dt}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        {/* Vendor-Item Terms */}
                        {poItemVendorItem && (
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, bgcolor: '#f4f6f8', border: '1px solid #ddd' }}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}><Typography variant="body2"><strong>Vendor Payment Terms:</strong> {vendors.find(v => v._id === poModalVendor)?.payterm || 'Not defined'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="body2"><strong>Item Warranty:</strong> {poItemVendorItem.warranty || 'None specified'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="body2"><strong>Item Payment Terms:</strong> {poItemVendorItem.paymentTerms || 'Standard'}</Typography></Grid>
                                        <Grid item xs={6}><Typography variant="body2"><strong>Tax:</strong> GST {(poItemVendorItem.igst || 0) > 0 ? poItemVendorItem.igst : ((poItemVendorItem.cgst || 0) + (poItemVendorItem.sgst || 0))}% (CGST {poItemVendorItem.cgst || 0}%, SGST {poItemVendorItem.sgst || 0}%, IGST {poItemVendorItem.igst || 0}%)</Typography></Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        )}

                        {!poItemVendorItem && poModalVendor && (
                            <Grid item xs={12}>
                                <Typography color="warning.main" variant="body2">⚠️ This vendor does not have a mapped rate for "{selectedPRForPO?.itemname}". You can still enter a price manually.</Typography>
                            </Grid>
                        )}

                        {/* Quantity and Price */}
                        <Grid item xs={6} md={3}>
                            <TextField
                                label="Quantity to Order"
                                type="number"
                                fullWidth
                                value={addToPoQty}
                                onChange={(e) => {
                                    const max = Number(selectedPRForPO?.quantity || 0) - Number(selectedPRForPO?.orderedQuantity || 0);
                                    setAddToPoQty(Math.min(Number(e.target.value), max));
                                }}
                                helperText={`Max: ${Number(selectedPRForPO?.quantity || 0) - Number(selectedPRForPO?.orderedQuantity || 0)}`}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <TextField label="Unit Price (₹)" type="number" fullWidth value={addToPoPrice} onChange={(e) => setAddToPoPrice(e.target.value)} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPOModal(false)}>Cancel</Button>
                    <Button variant="contained" disabled={!poModalVendor || !addToPoQty || !addToPoPrice || (poCreationMode === 'EXISTING' && !selectedDraftPO)} onClick={submitAddPRToPO}>
                        Save to Draft PO
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ─── PO History / Audit Log Modal ────────────────────────────────────── */}
            <Dialog open={openHistoryModal} onClose={() => setOpenHistoryModal(false)} maxWidth="md" fullWidth>
                <DialogTitle>PO History — {historyPO?.poid}</DialogTitle>
                <DialogContent dividers>
                    {poLogs.length === 0 && <Typography color="textSecondary">No history available yet.</Typography>}
                    {poLogs.map((log, i) => (
                        <Paper key={i} sx={{ p: 1.5, mb: 1, borderLeft: '4px solid', borderColor: log.action === 'Approved' ? 'success.main' : log.action === 'Created' ? 'primary.main' : log.action.includes('Edit') ? 'warning.main' : 'grey.400' }}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle2">{log.action} — {log.userName || log.user}</Typography>
                                <Typography variant="caption" color="textSecondary">{new Date(log.timestamp).toLocaleString()}</Typography>
                            </Box>
                            {log.remarks && <Typography variant="body2" color="textSecondary">{log.remarks}</Typography>}
                            {log.changes && log.changes.length > 0 && (
                                <Box mt={0.5}>
                                    {log.changes.map((c, j) => (
                                        <Typography key={j} variant="caption" display="block">• {c.itemname}: Qty {c.originalQty} → {c.revisedQty}</Typography>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistoryModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>

    );
};

export default PurchaseOrderDashboardNewds2;
