import React, { useState, useEffect } from "react";
import {
    Container, Box, Typography, Paper, Grid, Divider, Button,
    Chip, Table, TableBody, TableCell, TableRow, IconButton,
    CircularProgress, Alert, Snackbar
} from "@mui/material";
import {
    ArrowBack as BackIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    FileDownload as DownloadIcon,
    PictureAsPdf as PdfIcon
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";

const ApplicationDetailsView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const fetchDetails = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/admission/application/${id}`);
            setApplication(res.data.data);
        } catch (err) {
            console.error("Error fetching application details:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleAction = async (action) => {
        if (!window.confirm(`Are you sure you want to ${action} this application?`)) return;
        setSubmitting(true);
        try {
            if (action === "approve") {
                await ep1.post(`/api/v2/admission/approve/${id}`);
            } else {
                await ep1.post(`/api/v2/admission/status/${id}`, { status: action === "reject" ? "Rejected" : "Hold" });
            }
            showSnackbar(`Application ${action}ed successfully!`);
            fetchDetails();
        } catch (err) {
            showSnackbar(err.response?.data?.message || `Failed to ${action} application`, "error");
        }
        setSubmitting(false);
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
    if (!application) return <Box sx={{ py: 10 }}><Typography align="center">Application not found.</Typography></Box>;

    const DataRow = ({ label, value }) => (
        <TableRow>
            <TableCell sx={{ width: '30%', color: 'text.secondary', borderBottom: 'none', py: 0.5 }}>{label}</TableCell>
            <TableCell sx={{ borderBottom: 'none', fontWeight: 500, py: 0.5 }}>{value || "-"}</TableCell>
        </TableRow>
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}>Back</Button>
                <Typography variant="h5" fontWeight="bold">Application Details</Typography>
                <Chip label={application.status} color="primary" />
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
                        <Typography variant="h6" gutterBottom color="primary">Basic Information</Typography>
                        <Table size="small">
                            <TableBody>
                                <DataRow label="Full Name" value={application.fullName} />
                                <DataRow label="Email" value={application.email} />
                                <DataRow label="Mobile" value={application.mobileNo} />
                                <DataRow label="Program" value={application.program} />
                                <DataRow label="School" value={application.school} />
                                <DataRow label="Level" value={application.programLevel} />
                                <DataRow label="Academic Year" value={application.academicYear} />
                                <DataRow label="Date of Applied" value={new Date(application.applicationDate).toLocaleString()} />
                            </TableBody>
                        </Table>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom color="primary">Parent / Guardian Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" sx={{ bgcolor: '#f5f5f5', p: 1 }}>Father</Typography>
                                <Table size="small">
                                    <TableBody>
                                        <DataRow label="Name" value={application.fatherName} />
                                        <DataRow label="Email" value={application.fatherEmail} />
                                        <DataRow label="Mobile" value={application.fatherMobile} />
                                        <DataRow label="Occupation" value={application.fatherOccupation} />
                                    </TableBody>
                                </Table>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" sx={{ bgcolor: '#f5f5f5', p: 1 }}>Mother</Typography>
                                <Table size="small">
                                    <TableBody>
                                        <DataRow label="Name" value={application.motherName} />
                                        <DataRow label="Email" value={application.motherEmail} />
                                        <DataRow label="Mobile" value={application.motherMobile} />
                                        <DataRow label="Occupation" value={application.motherOccupation} />
                                    </TableBody>
                                </Table>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="subtitle2" sx={{ bgcolor: '#f5f5f5', p: 1 }}>Guardian</Typography>
                                <Table size="small">
                                    <TableBody>
                                        <DataRow label="Name" value={application.guardianName} />
                                        <DataRow label="Email" value={application.guardianEmail} />
                                        <DataRow label="Mobile" value={application.guardianMobile} />
                                        <DataRow label="Occupation" value={application.guardianOccupation} />
                                    </TableBody>
                                </Table>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom color="primary">Address Details</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ bgcolor: '#f5f5f5', p: 1 }}>Permanent Address</Typography>
                                <Table size="small">
                                    <TableBody>
                                        <DataRow label="Line 1" value={application.permanentAddress?.addressLine1} />
                                        <DataRow label="City" value={application.permanentAddress?.city} />
                                        <DataRow label="State" value={application.permanentAddress?.state} />
                                        <DataRow label="Pincode" value={application.permanentAddress?.pincode} />
                                        <DataRow label="Nationality" value={application.permanentAddress?.nationality} />
                                    </TableBody>
                                </Table>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" sx={{ bgcolor: '#f5f5f5', p: 1 }}>Correspondence Address</Typography>
                                <Table size="small">
                                    <TableBody>
                                        <DataRow label="Line 1" value={application.correspondenceAddress?.addressLine1} />
                                        <DataRow label="City" value={application.correspondenceAddress?.city} />
                                        <DataRow label="State" value={application.correspondenceAddress?.state} />
                                        <DataRow label="Pincode" value={application.correspondenceAddress?.pincode} />
                                        <DataRow label="Nationality" value={application.correspondenceAddress?.nationality} />
                                    </TableBody>
                                </Table>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
                        <Typography variant="h6" gutterBottom color="primary">Academic Qualification</Typography>
                        
                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, bgcolor: '#f5f5f5', p: 1 }}>SSC (Grade 10)</Typography>
                        <Table size="small">
                            <TableBody>
                                <DataRow label="Board" value={application.sscDetails?.board} />
                                <DataRow label="Year" value={application.sscDetails?.passingYear} />
                                <DataRow label="Score" value={`${application.sscDetails?.scoreValue} (${application.sscDetails?.scoreType})`} />
                            </TableBody>
                        </Table>

                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, bgcolor: '#f5f5f5', p: 1 }}>HSC (Grade 12)</Typography>
                        <Table size="small">
                            <TableBody>
                                <DataRow label="Board" value={application.hscDetails?.board} />
                                <DataRow label="Year" value={application.hscDetails?.passingYear} />
                                <DataRow label="Score" value={`${application.hscDetails?.scoreValue} (${application.hscDetails?.scoreType})`} />
                                <DataRow label="Stream" value={application.hscDetails?.stream} />
                            </TableBody>
                        </Table>
                    </Paper>

                    <Paper sx={{ p: 3 }} elevation={2}>
                        <Typography variant="h6" gutterBottom color="primary">Statement of Purpose</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
                            {application.sop || "No SOP provided."}
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3, bgcolor: '#fdfdfd' }} elevation={2}>
                        <Typography variant="h6" gutterBottom>Actions</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            {['Submitted', 'Hold', 'Pending', 'Draft'].includes(application.status) && (
                                <>
                                    <Button 
                                        variant="contained" 
                                        color="success" 
                                        fullWidth 
                                        startIcon={<ApproveIcon />}
                                        onClick={() => handleAction("approve")}
                                        disabled={submitting}
                                    >
                                        Approve & Onboard
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="warning" 
                                        fullWidth
                                        onClick={() => handleAction("hold")}
                                        disabled={submitting}
                                    >
                                        Put on Hold
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        color="error" 
                                        fullWidth 
                                        startIcon={<RejectIcon />}
                                        onClick={() => handleAction("reject")}
                                        disabled={submitting}
                                    >
                                        Reject Application
                                    </Button>
                                </>
                            )}
                            <Button variant="outlined" startIcon={<DownloadIcon />}>Download Details</Button>
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }} elevation={2}>
                        <Typography variant="h6" gutterBottom>Uploaded Documents</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                            {application.documents ? Object.entries(application.documents).map(([key, value]) => (
                                <Box key={key} sx={{ display: 'flex', alignItems: 'center', p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                                    <PdfIcon color="error" sx={{ mr: 1 }} />
                                    <Typography variant="caption" sx={{ flexGrow: 1 }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</Typography>
                                    <IconButton size="small"><DownloadIcon fontSize="small" /></IconButton>
                                </Box>
                            )) : <Typography variant="caption">No documents found.</Typography>}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ApplicationDetailsView;
