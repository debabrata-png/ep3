import React, { useState, useEffect } from "react";
import {
    Container, Box, Typography, Button, Paper, Grid, TextField,
    MenuItem, IconButton, Alert, Snackbar, Chip, Card, CardContent,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, RadioGroup, Radio,
    FormControlLabel, FormLabel, CircularProgress, Tooltip, Divider
} from "@mui/material";
import {
    ArrowBack as BackIcon,
    EmojiEvents as TrophyIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckIcon,
    Cancel as CancelIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Publish as PublishIcon,
    PictureAsPdf as PdfIcon,
    Add as AddIcon
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import ep1 from "../api/ep1";
import global1 from "./global1";

const AdmissionMeritList = () => {
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [meritLists, setMeritLists] = useState([]);
    const [selectedMeritList, setSelectedMeritList] = useState(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Generate Form State
    const [generateDialog, setGenerateDialog] = useState(false);
    const [genForm, setGenForm] = useState({
        programId: "",
        academicYear: "",
        tiebreaker: "applicationDate",
        meritListNumber: 1
    });

    // Filter State
    const [filterProgramId, setFilterProgramId] = useState("");
    const [filterYear, setFilterYear] = useState("");

    useEffect(() => {
        fetchPrograms();
        fetchMeritLists();
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await ep1.get("/api/v2/getallprogramcounselords", {
                params: { colid: global1.colid }
            });
            setPrograms(res.data.data || []);
        } catch (err) {
            console.error("Error fetching programs:", err);
        }
    };

    const fetchMeritLists = async () => {
        setLoading(true);
        try {
            const params = { colid: global1.colid };
            if (filterProgramId) params.programId = filterProgramId;
            if (filterYear) params.academicYear = filterYear;

            const res = await ep1.get("/api/v2/admission/merit-lists", { params });
            setMeritLists(res.data.data || []);
        } catch (err) {
            console.error("Error fetching merit lists:", err);
            showSnackbar("Failed to fetch merit lists", "error");
        }
        setLoading(false);
    };

    const fetchMeritListDetail = async (id) => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/admission/merit-list/${id}`);
            setSelectedMeritList(res.data.data);
        } catch (err) {
            console.error("Error fetching merit list detail:", err);
            showSnackbar("Failed to load merit list", "error");
        }
        setLoading(false);
    };

    const handleGenerateMeritList = async () => {
        if (!genForm.programId || !genForm.academicYear) {
            showSnackbar("Please select a program and academic year", "warning");
            return;
        }

        setGenerating(true);
        try {
            const res = await ep1.post("/api/v2/admission/generate-merit-list", {
                programId: genForm.programId,
                colid: global1.colid,
                academicYear: genForm.academicYear,
                tiebreaker: genForm.tiebreaker,
                meritListNumber: genForm.meritListNumber,
                generatedBy: global1.user
            });

            if (res.data.success) {
                showSnackbar(res.data.message, "success");
                setGenerateDialog(false);
                fetchMeritLists();
                if (res.data.data) {
                    setSelectedMeritList(res.data.data);
                }
            } else {
                showSnackbar(res.data.message || "Failed to generate", "error");
            }
        } catch (err) {
            console.error("Generate error:", err);
            showSnackbar(err.response?.data?.message || "Failed to generate merit list", "error");
        }
        setGenerating(false);
    };

    const handleAllotSeat = async (applicationId) => {
        if (!selectedMeritList) return;
        try {
            const res = await ep1.post("/api/v2/admission/merit-allot-seat", {
                meritListId: selectedMeritList._id,
                applicationId
            });
            if (res.data.success) {
                showSnackbar("Seat allotted successfully", "success");
                setSelectedMeritList(res.data.data);
            } else {
                showSnackbar(res.data.message, "error");
            }
        } catch (err) {
            showSnackbar(err.response?.data?.message || "Failed to allot seat", "error");
        }
    };

    const handleDeclineSeat = async (applicationId) => {
        if (!selectedMeritList) return;
        try {
            const res = await ep1.post("/api/v2/admission/merit-decline-seat", {
                meritListId: selectedMeritList._id,
                applicationId
            });
            if (res.data.success) {
                showSnackbar("Seat declined", "info");
                setSelectedMeritList(res.data.data);
            } else {
                showSnackbar(res.data.message, "error");
            }
        } catch (err) {
            showSnackbar(err.response?.data?.message || "Failed to decline seat", "error");
        }
    };

    const handlePublish = async (meritListId) => {
        try {
            const res = await ep1.post("/api/v2/admission/merit-publish", { meritListId });
            if (res.data.success) {
                showSnackbar("Merit list published", "success");
                fetchMeritLists();
                if (selectedMeritList?._id === meritListId) {
                    setSelectedMeritList(res.data.data);
                }
            }
        } catch (err) {
            showSnackbar("Failed to publish", "error");
        }
    };

    const handleDeleteList = async (id) => {
        if (!window.confirm("Are you sure you want to delete this merit list?")) return;
        try {
            await ep1.get(`/api/v2/admission/merit-delete/${id}`);
            showSnackbar("Merit list deleted", "success");
            fetchMeritLists();
            if (selectedMeritList?._id === id) {
                setSelectedMeritList(null);
            }
        } catch (err) {
            showSnackbar("Failed to delete", "error");
        }
    };

    const handleExportPdf = () => {
        if (!selectedMeritList) return;

        const doc = new jsPDF("landscape");
        const ml = selectedMeritList;

        // Title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`Merit List #${ml.meritListNumber} - ${ml.programName}`, 14, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Program Code: ${ml.programCode || '-'} | Academic Year: ${ml.academicYear}`, 14, 28);
        doc.text(`Total Seats: ${ml.totalSeats} | Allotted: ${ml.seatsAllotted} | Remaining: ${ml.seatsRemaining}`, 14, 34);
        doc.text(`Generated: ${new Date(ml.generatedAt).toLocaleString()} | Tiebreaker: ${ml.tiebreaker}`, 14, 40);

        // Table header
        let y = 50;
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const headers = ["Rank", "Name", "Email", "Mobile", "Score", "Type", "Application Date", "Status"];
        const colWidths = [15, 55, 60, 35, 25, 25, 40, 25];
        let x = 14;
        headers.forEach((h, i) => {
            doc.text(h, x, y);
            x += colWidths[i];
        });

        doc.setFont("helvetica", "normal");
        y += 6;

        // Table rows
        for (const student of ml.students) {
            if (y > 190) {
                doc.addPage();
                y = 20;
            }
            x = 14;
            const row = [
                String(student.rank),
                student.fullName || '-',
                student.email || '-',
                student.mobileNo || '-',
                String(student.scoreValue),
                student.scoreType || '-',
                new Date(student.applicationDate).toLocaleDateString(),
                student.seatStatus
            ];
            row.forEach((cell, i) => {
                doc.text(cell.substring(0, 30), x, y);
                x += colWidths[i];
            });
            y += 6;
        }

        doc.save(`merit_list_${ml.programCode}_${ml.meritListNumber}.pdf`);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    // Stat cards for selected merit list
    const StatCard = ({ title, value, color }) => (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 15px rgba(0,0,0,0.06)', minWidth: 140 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
                <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color, mt: 0.5 }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    // DataGrid columns for merit list students
    const studentColumns = [
        { field: "rank", headerName: "Rank", width: 70, renderCell: (params) => (
            <Chip label={`#${params.value}`} size="small" sx={{ fontWeight: 700, bgcolor: params.value <= 3 ? '#fef3c7' : '#f1f5f9', color: params.value <= 3 ? '#d97706' : '#475569' }} />
        )},
        { field: "fullName", headerName: "Student Name", width: 200, renderCell: (params) => (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
        )},
        { field: "email", headerName: "Email", width: 220 },
        { field: "mobileNo", headerName: "Mobile", width: 130 },
        { field: "scoreValue", headerName: "HSC Marks", width: 110, type: 'number', renderCell: (params) => (
            <Chip label={params.value} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
        )},
        { field: "scoreType", headerName: "Score Type", width: 100 },
        { field: "applicationDate", headerName: "Applied On", width: 130, renderCell: (params) => (
            new Date(params.value).toLocaleDateString()
        )},
        { field: "seatStatus", headerName: "Seat Status", width: 130, renderCell: (params) => {
            const colors = { Pending: 'default', Allotted: 'success', Declined: 'error', Waitlisted: 'warning' };
            return <Chip label={params.value} size="small" color={colors[params.value] || 'default'} sx={{ fontWeight: 600 }} />;
        }},
        { field: "actions", headerName: "Actions", width: 160, renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {params.row.seatStatus === 'Pending' && (
                    <>
                        <Tooltip title="Allot Seat">
                            <IconButton size="small" color="success" onClick={() => handleAllotSeat(params.row.applicationId)}>
                                <CheckIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Decline">
                            <IconButton size="small" color="error" onClick={() => handleDeclineSeat(params.row.applicationId)}>
                                <CancelIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
                {params.row.seatStatus === 'Allotted' && (
                    <Tooltip title="Decline Seat">
                        <IconButton size="small" color="warning" onClick={() => handleDeclineSeat(params.row.applicationId)}>
                            <CancelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        )}
    ];

    // Merit list summary columns
    const listColumns = [
        { field: "programName", headerName: "Program", width: 200, renderCell: (params) => (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{params.value}</Typography>
        )},
        { field: "programCode", headerName: "Code", width: 100 },
        { field: "academicYear", headerName: "Year", width: 100 },
        { field: "meritListNumber", headerName: "List #", width: 70, renderCell: (params) => (
            <Chip label={`#${params.value}`} size="small" color="primary" sx={{ fontWeight: 700 }} />
        )},
        { field: "totalApplicants", headerName: "Applicants", width: 100, type: 'number' },
        { field: "totalSeats", headerName: "Seats", width: 80, type: 'number' },
        { field: "seatsAllotted", headerName: "Allotted", width: 90, type: 'number' },
        { field: "seatsRemaining", headerName: "Remaining", width: 100, type: 'number' },
        { field: "status", headerName: "Status", width: 100, renderCell: (params) => {
            const colors = { Draft: 'default', Published: 'success', Archived: 'warning' };
            return <Chip label={params.value} size="small" color={colors[params.value] || 'default'} sx={{ fontWeight: 600 }} />;
        }},
        { field: "generatedAt", headerName: "Generated", width: 160, renderCell: (params) => (
            new Date(params.value).toLocaleString()
        )},
        { field: "actions", headerName: "Actions", width: 180, renderCell: (params) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="View Details">
                    <IconButton size="small" color="primary" onClick={() => fetchMeritListDetail(params.row._id)}>
                        <ViewIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                {params.row.status === 'Draft' && (
                    <Tooltip title="Publish">
                        <IconButton size="small" color="success" onClick={() => handlePublish(params.row._id)}>
                            <PublishIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDeleteList(params.row._id)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        )}
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, bgcolor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", "&:hover": { bgcolor: "#f8fafc" } }}
                    >
                        <BackIcon sx={{ color: "#1e293b" }} />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b", display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrophyIcon sx={{ color: '#d97706', fontSize: 32 }} />
                            Admission Merit Lists
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Generate and manage merit lists based on HSC marks
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setGenerateDialog(true)}
                    sx={{
                        bgcolor: "#1565c0",
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        px: 3,
                        boxShadow: "0 4px 12px rgba(21, 101, 192, 0.3)",
                        "&:hover": { bgcolor: "#0d47a1" }
                    }}
                >
                    Generate Merit List
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Filter by Program</InputLabel>
                            <Select
                                value={filterProgramId}
                                onChange={(e) => setFilterProgramId(e.target.value)}
                                label="Filter by Program"
                            >
                                <MenuItem value="">All Programs</MenuItem>
                                {programs.map(p => (
                                    <MenuItem key={p._id} value={p._id}>{p.course_name} ({p.course_code})</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Academic Year"
                            placeholder="e.g. 2025-26"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchMeritLists}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Refresh
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Merit Lists Table */}
            <Paper sx={{ height: 380, width: "100%", borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden", mb: 3 }}>
                <DataGrid
                    rows={meritLists}
                    columns={listColumns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    pageSizeOptions={[5, 10]}
                    disableRowSelectionOnClick
                    sx={{
                        border: 0,
                        "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc", color: "#475569", fontWeight: 600 },
                        "& .MuiDataGrid-row:hover": { backgroundColor: "#f8fafc" },
                    }}
                />
            </Paper>

            {/* Selected Merit List Detail */}
            {selectedMeritList && (
                <Paper sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    {/* Detail Header */}
                    <Box sx={{ p: 3, bgcolor: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)', color: 'white' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    Merit List #{selectedMeritList.meritListNumber} — {selectedMeritList.programName}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.85 }}>
                                    {selectedMeritList.programCode} | {selectedMeritList.academicYear} | Tiebreaker: {selectedMeritList.tiebreaker}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip label={selectedMeritList.status} color={selectedMeritList.status === 'Published' ? 'success' : 'default'}
                                    sx={{ fontWeight: 700, color: 'white', bgcolor: selectedMeritList.status === 'Published' ? 'rgba(76,175,80,0.9)' : 'rgba(255,255,255,0.2)' }} />
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<PdfIcon />}
                                    onClick={handleExportPdf}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                                >
                                    Export PDF
                                </Button>
                            </Box>
                        </Box>

                        {/* Stat Cards */}
                        <Grid container spacing={2}>
                            <Grid item><StatCard title="Total Applicants" value={selectedMeritList.totalApplicants} color="#1565c0" /></Grid>
                            <Grid item><StatCard title="Total Seats" value={selectedMeritList.totalSeats} color="#7c3aed" /></Grid>
                            <Grid item><StatCard title="Seats Allotted" value={selectedMeritList.seatsAllotted} color="#16a34a" /></Grid>
                            <Grid item><StatCard title="Seats Remaining" value={selectedMeritList.seatsRemaining} color="#dc2626" /></Grid>
                        </Grid>
                    </Box>

                    {/* Students Table */}
                    <Box sx={{ height: 500, width: '100%' }}>
                        <DataGrid
                            rows={selectedMeritList.students || []}
                            columns={studentColumns}
                            getRowId={(row) => row.applicationId || row._id}
                            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
                            pageSizeOptions={[10, 25, 50, 100]}
                            disableRowSelectionOnClick
                            sx={{
                                border: 0,
                                "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f8fafc", fontWeight: 600 },
                                "& .MuiDataGrid-row:hover": { backgroundColor: "#eff6ff" },
                            }}
                        />
                    </Box>
                </Paper>
            )}

            {/* Generate Dialog */}
            <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrophyIcon sx={{ color: '#d97706' }} />
                    Generate Merit List
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Select Program</InputLabel>
                            <Select
                                value={genForm.programId}
                                onChange={(e) => setGenForm({ ...genForm, programId: e.target.value })}
                                label="Select Program"
                            >
                                {programs.map(p => (
                                    <MenuItem key={p._id} value={p._id}>
                                        {p.course_name} ({p.course_code}) — {p.total_seats || 0} seats
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            required
                            label="Academic Year"
                            placeholder="e.g. 2025-26"
                            value={genForm.academicYear}
                            onChange={(e) => setGenForm({ ...genForm, academicYear: e.target.value })}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Merit List Number"
                            value={genForm.meritListNumber}
                            onChange={(e) => setGenForm({ ...genForm, meritListNumber: parseInt(e.target.value) || 1 })}
                            helperText="1st list = 1, 2nd list = 2 (excludes already allotted students)"
                            inputProps={{ min: 1 }}
                        />

                        <FormControl>
                            <FormLabel sx={{ fontWeight: 600, mb: 1 }}>Tiebreaker (when marks are same)</FormLabel>
                            <RadioGroup
                                value={genForm.tiebreaker}
                                onChange={(e) => setGenForm({ ...genForm, tiebreaker: e.target.value })}
                            >
                                <FormControlLabel value="applicationDate" control={<Radio />} label="Application Submission Date (earlier = higher rank)" />
                                <FormControlLabel value="name" control={<Radio />} label="Alphabetical by Name" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setGenerateDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button
                        onClick={handleGenerateMeritList}
                        variant="contained"
                        disabled={generating}
                        startIcon={generating ? <CircularProgress size={18} /> : <TrophyIcon />}
                        sx={{
                            bgcolor: "#1565c0",
                            textTransform: "none",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "#0d47a1" }
                        }}
                    >
                        {generating ? "Generating..." : "Generate"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default AdmissionMeritList;
