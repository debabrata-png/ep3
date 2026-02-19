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
    Alert,
    Snackbar,
    Grid,
    Tooltip,
    InputAdornment,
    Card,
    CardContent,
    Autocomplete,
    CircularProgress,
} from "@mui/material";
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    WhatsApp as WhatsAppIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    ArrowBack as BackIcon,
    Delete as DeleteIcon,
    Note as NoteIcon,
    School as SchoolIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
    DataGrid,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";

const CustomToolbar = () => {
    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            {(global1.role === 'Admin' || global1.role === 'All' || global1.role === 'CRM') && <GridToolbarExport />}
            <Box sx={{ flexGrow: 1 }} />
            <GridToolbarQuickFilter debounceMs={500} />
        </GridToolbarContainer>
    );
};

const ConfirmAdmissionds = () => {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [pipelineStages, setPipelineStages] = useState([]);
    const [finalStages, setFinalStages] = useState([]);

    // Admission Dialog State
    const [openAdmissionDialog, setOpenAdmissionDialog] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [admissionFormData, setAdmissionFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        course_interested: "",
    });

    const [programs, setPrograms] = useState([]);

    useEffect(() => {
        fetchPipelineStages();
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (finalStages.length > 0) {
            fetchLeads();
        }
    }, [finalStages]);

    const fetchPrograms = async () => {
        try {
            const res = await ep1.get("/api/v2/getallprogrammasterds", {
                params: { colid: global1.colid }
            });
            if (res.data.status === "Success") {
                setPrograms(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching programs:", err);
        }
    };

    const fetchPipelineStages = async () => {
        try {
            const res = await ep1.get("/api/v2/getallpipelinestageag", {
                params: { colid: global1.colid }
            });
            if (res.data.status === "Success") {
                const stages = res.data.data;
                setPipelineStages(stages);
                const final = stages.filter(s => s.is_final_stage).map(s => s.stagename);
                setFinalStages(final);
            }
        } catch (err) {
            console.error("Error fetching pipeline stages:", err);
        }
    };

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const params = {
                colid: global1.colid,
                user: global1.user,
                role: global1.role,
                pipeline_stage: "All" // We fetch all and filter client side or backend should support array
            };

            // Ideally backend should support filtering by multiple stages or we fetch all and filter here
            // For now, fetching all leads and filtering in frontend for those in final stages
            const res = await ep1.get("/api/v2/getallleadsadmin", { params });

            const allLeads = res.data.data;
            const admittedLeads = allLeads.filter(lead => finalStages.includes(lead.pipeline_stage));

            setLeads(admittedLeads);
        } catch (err) {
            console.error("Error fetching leads:", err);
            showSnackbar("Failed to fetch leads", "error");
        }
        setLoading(false);
    };

    const handleOpenAdmissionDialog = (lead) => {
        setSelectedLead(lead);
        // Auto-populate program details if possible
        const matchedProgram = programs.find(p => p.course_name === lead.program);

        setAdmissionFormData({
            name: lead.name || "",
            email: lead.email || "",
            phone: lead.phone || "",
            address: lead.address || "", // Assuming lead has address or use custom fields
            city: lead.city || "",
            state: lead.state || "",
            course_interested: lead.course_interested || "",

            // New Fields
            regno: "",
            department: lead.course_interested || "", // Defaulting to course_interested if available
            programcode: matchedProgram ? matchedProgram.course_code : "",
            admissionyear: new Date().getFullYear().toString(),
            semester: "1",
            section: "A",
        });
        setOpenAdmissionDialog(true);
    };

    const handleConfirmAdmission = async () => {
        // Basic validation
        if (!admissionFormData.regno || !admissionFormData.department || !admissionFormData.programcode) {
            showSnackbar("Please fill all required fields (Reg No, Department, Program Code)", "warning");
            return;
        }

        try {
            const payload = {
                lead_id: selectedLead._id,
                colid: global1.colid,
                ...admissionFormData
            };

            const res = await ep1.post("/api/v2/confirmadmissionds", payload);

            if (res.data.success) {
                showSnackbar("Admission Confirmed! Student account created.", "success");
                setOpenAdmissionDialog(false);
                fetchLeads(); // Refresh list
            } else {
                showSnackbar(res.data.message || "Failed to confirm admission", "error");
            }
        } catch (err) {
            console.error("Error confirming admission:", err);
            showSnackbar(err.response?.data?.message || "Failed to confirm admission", "error");
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const columns = [
        {
            field: "name",
            headerName: "Name",
            width: 180,
            renderCell: (params) => (
                <Box sx={{ fontWeight: 600, color: "#1e293b" }}>{params.value}</Box>
            ),
        },
        { field: "phone", headerName: "Phone", width: 130 },
        { field: "email", headerName: "Email", width: 200 },
        { field: "course_interested", headerName: "Course", width: 150 },
        {
            field: "pipeline_stage",
            headerName: "Stage",
            width: 160,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color="success"
                    size="small"
                    sx={{ borderRadius: 1, fontWeight: 500 }}
                />
            ),
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleOpenAdmissionDialog(params.row)}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Confirm Admission
                </Button>
            ),
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 1 }}>
                    Confirm Admissions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review and confirm student admissions for leads in final stages.
                </Typography>
            </Box>

            <Paper sx={{ height: 600, width: "100%", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <DataGrid
                    rows={leads}
                    columns={columns}
                    getRowId={(row) => row._id}
                    components={{ Toolbar: CustomToolbar }}
                    loading={loading}
                    sx={{
                        border: "none",
                        "& .MuiDataGrid-cell": { borderBottom: "1px solid #f1f5f9" },
                        "& .MuiDataGrid-columnHeaders": { bgcolor: "#f8fafc", fontWeight: 700 },
                    }}
                />
            </Paper>

            {/* Admission Dialog */}
            <Dialog open={openAdmissionDialog} onClose={() => setOpenAdmissionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>Confirm Student Admission</DialogTitle>
                <DialogContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        This action will create a new Student account with default password <b>Password@123</b>.
                    </Alert>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                        <TextField
                            label="Student Name"
                            value={admissionFormData.name}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={admissionFormData.email}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Phone"
                            value={admissionFormData.phone}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, phone: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Course"
                            value={admissionFormData.course_interested}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, course_interested: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="City"
                            value={admissionFormData.city}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, city: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="State"
                            value={admissionFormData.state}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, state: e.target.value })}
                            fullWidth
                        />

                        {/* New Fields */}
                        <TextField
                            label="Registration No (Required)"
                            value={admissionFormData.regno}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, regno: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Department (Required)"
                            value={admissionFormData.department}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, department: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Program Code (Required)"
                            value={admissionFormData.programcode}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, programcode: e.target.value })}
                            fullWidth
                            required
                            helperText={!admissionFormData.programcode ? "Ensure Program Master has codes or enter manually" : ""}
                        />
                        <TextField
                            label="Admission Year"
                            value={admissionFormData.admissionyear}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, admissionyear: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Semester"
                            value={admissionFormData.semester}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, semester: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Section"
                            value={admissionFormData.section}
                            onChange={(e) => setAdmissionFormData({ ...admissionFormData, section: e.target.value })}
                            fullWidth
                        />
                    </Box>

                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAdmissionDialog(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmAdmission} variant="contained" color="success">
                        Confirm & Create Student
                    </Button>
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

export default ConfirmAdmissionds;
