/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    IconButton,
    TextField,
    MenuItem,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Autocomplete,
    Grid,
    Alert
} from "@mui/material";
import {
    ArrowBack as BackIcon,
    Refresh as RefreshIcon,
    AssignmentInd as AssignIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";

const LeadTransferds = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLeadIds, setSelectedLeadIds] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Bulk Action Dialog States
    const [openAssignDialog, setOpenAssignDialog] = useState(false);

    // Data for Dialogs
    const [counselorOptions, setCounselorOptions] = useState([]);
    const [selectedCounselor, setSelectedCounselor] = useState(null);

    useEffect(() => {
        fetchLeads();
        fetchMySubCounselors();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            // Fetch leads assigned to current counselor
            const res = await ep1.get("/api/v2/getallleadsds", {
                params: {
                    colid: global1.colid,
                    user: global1.user,
                    assignedto: global1.user // Filter specifically for leads assigned to them
                },
            });
            if (res.data.success) {
                setLeads(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching leads:", err);
            showSnackbar("Failed to fetch leads", "error");
        }
        setLoading(false);
    };

    const fetchMySubCounselors = async () => {
        try {
            const res = await ep1.get("/api/v2/getsubcounselorsbycounselords", {
                params: { 
                    colid: global1.colid, 
                    counselloremail: global1.user 
                },
            });
            if (res.data.success) {
                setCounselorOptions(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching sub-counselors:", err);
        }
    };

    const handleBulkTransfer = async () => {
        if (!selectedCounselor) return;
        try {
            await ep1.post("/api/v2/leads/bulk-transfer-subcounselor", {
                leadIds: selectedLeadIds,
                subCounselorEmail: selectedCounselor.subcounselloremail,
                subCounselorName: selectedCounselor.subcounsellorname
            });
            showSnackbar("Leads transferred to sub-counselor successfully", "success");
            setOpenAssignDialog(false);
            fetchLeads(); // Refresh
            setSelectedLeadIds([]);
        } catch (err) {
            console.error("Error transferring leads:", err);
            showSnackbar("Failed to transfer leads", "error");
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        { field: "name", headerName: "Name", width: 180 },
        { field: "phone", headerName: "Phone", width: 130 },
        { field: "email", headerName: "Email", width: 200 },
        { field: "pipeline_stage", headerName: "Stage", width: 150 },
        { field: "assignedto", headerName: "Assigned To", width: 180 },
        { field: "subcounsellorname", headerName: "Sub-Counselor Name", width: 180 },
        { field: "subcounselloremail", headerName: "Sub-Counselor Email", width: 200 },
        {
            field: "createdAt",
            headerName: "Created At",
            width: 150,
            valueFormatter: (params) => {
                const val = params?.value !== undefined ? params.value : params;
                return val ? dayjs(val).format("DD MMM YYYY") : "-";
            }
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: "white", border: "1px solid #e2e8f0" }}>
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        Lead Transfer
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    onClick={fetchLeads}
                    startIcon={<RefreshIcon />}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AssignIcon />}
                    disabled={selectedLeadIds.length === 0}
                    onClick={() => setOpenAssignDialog(true)}
                >
                    Transfer to Sub-Counselor ({selectedLeadIds.length})
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={leads}
                    columns={columns}
                    getRowId={(row) => row._id}
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => setSelectedLeadIds(newSelection)}
                    slots={{ toolbar: GridToolbar }}
                    loading={loading}
                />
            </Paper>

            {/* Transfer Dialog */}
            <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Transfer Leads to Sub-Counselor</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Transferring {selectedLeadIds.length} leads to:</Typography>
                    <Autocomplete
                        options={counselorOptions}
                        getOptionLabel={(option) => `${option.subcounsellorname} (${option.subcounselloremail})`}
                        onChange={(e, val) => setSelectedCounselor(val)}
                        renderInput={(params) => <TextField {...params} label="Select Sub-Counselor" fullWidth />}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkTransfer} variant="contained" disabled={!selectedCounselor}>Transfer</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default LeadTransferds;
