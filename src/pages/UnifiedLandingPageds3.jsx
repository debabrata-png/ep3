import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    MenuItem,
    Alert,
    Snackbar,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ArrowBack as BackIcon,
    QrCode as QrCodeIcon,
    Link as LinkIcon,
    Download as DownloadIcon,
    Close as CloseIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { encryptData } from "../utils/encryption";
import QRCode from "qrcode";

const UnifiedLandingPageds3 = () => {
    const navigate = useNavigate();
    const [landingPages, setLandingPages] = useState([]);
    const [sources, setSources] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(null);
    const [openQrDialog, setOpenQrDialog] = useState(false);
    const [openQrListDialog, setOpenQrListDialog] = useState(false);
    const [openLinkDialog, setOpenLinkDialog] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [qrFormData, setQrFormData] = useState({
        qr_name: "",
        source: "",
    });
    const [linkFormData, setLinkFormData] = useState({
        source: "",
    });
    const [generatedQr, setGeneratedQr] = useState("");
    const [generatedLink, setGeneratedLink] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [formData, setFormData] = useState({
        page_name: "",
        page_slug: "",
        headline: "",
        subheadline: "",
        description: "",
        image_url: "",
        cta_button_text: "",
        form_fields: [
            { field_name: "name", field_label: "Full Name", field_type: "text", is_required: true },
            { field_name: "phone", field_label: "Phone Number", field_type: "tel", is_required: true },
            { field_name: "email", field_label: "Email", field_type: "email", is_required: false },
        ],
    });

    // Available CRM fields including the new extended fields
    const availableCRMFields = [
        { field_name: "name", field_label: "Full Name", field_type: "text" },
        { field_name: "phone", field_label: "Phone Number", field_type: "tel" },
        { field_name: "email", field_label: "Email", field_type: "email" },
        { field_name: "gender", field_label: "Gender", field_type: "select" },
        { field_name: "fathername", field_label: "Father's/Guardian's Name", field_type: "text" },
        { field_name: "fathercontactno", field_label: "Father's/Guardian's Contact", field_type: "tel" },
        { field_name: "tenth_percentage", field_label: "10th Percentage/CGPA", field_type: "text" },
        { field_name: "tenth_board", field_label: "10th Board", field_type: "text" },
        { field_name: "tenth_year", field_label: "10th Passing Year", field_type: "number" },
        { field_name: "twelfth_percentage", field_label: "12th Percentage/CGPA", field_type: "text" },
        { field_name: "twelfth_board", field_label: "12th Board", field_type: "text" },
        { field_name: "twelfth_year", field_label: "12th Passing Year", field_type: "number" },
        { field_name: "ug_percentage", field_label: "UG Percentage/CGPA", field_type: "text" },
        { field_name: "ug_university", field_label: "UG University", field_type: "text" },
        { field_name: "ug_year", field_label: "UG Passing Year", field_type: "number" },
        { field_name: "course_interested", field_label: "Course Interested", field_type: "select" },
        { field_name: "city", field_label: "City", field_type: "text" },
        { field_name: "state", field_label: "State", field_type: "text" },
        { field_name: "source", field_label: "Source", field_type: "select" },
    ];

    useEffect(() => {
        fetchLandingPages();
        fetchSources();
    }, []);

    const fetchLandingPages = async () => {
        try {
            const res = await ep1.get("/api/v2/getallunifiedlandingpagesds3", {
                params: { colid: global1.colid },
            });
            // Filter or label them if needed, but for now we show all
            setLandingPages(res.data.data);
        } catch (err) {
            console.error("Error fetching unified landing pages:", err);
            showSnackbar("Failed to fetch unified landing pages", "error");
        }
    };

    const fetchSources = async () => {
        try {
            const res = await ep1.get("/api/v2/getallsourcesds", {
                params: { colid: global1.colid },
            });
            setSources(res.data.data);
        } catch (err) {
            console.error("Error fetching sources:", err);
        }
    };

    const generateSlug = (pageName) => {
        const random = Math.random().toString(36).substring(2, 8);
        const nameSlug = pageName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `${nameSlug}-${random}`;
    };

    const generateUrl = (slug, source = null) => {
        const currentUrl = window.location.origin;
        const encryptedData = encryptData({
            colid: global1.colid,
            user: global1.user,
            logo: global1.logo
        });

        // Points to the NEW extended landing page route
        let url = `${currentUrl}/publicextendedlandingds3/${slug}?data=${encryptedData}`;
        if (source) {
            url += `&source=${encodeURIComponent(source)}`;
        }
        return url;
    };

    const handleOpenDialog = (page = null) => {
        if (page) {
            setEditMode(true);
            setCurrentPage(page);
            setFormData({
                page_name: page.page_name,
                page_slug: page.page_slug,
                headline: page.page_content?.headline || "",
                subheadline: page.page_content?.subheadline || "",
                description: page.page_content?.description || "",
                image_url: page.page_content?.image_url || "",
                cta_button_text: page.page_content?.cta_button_text || "",
                form_fields: page.form_fields || [
                    { field_name: "name", field_label: "Full Name", field_type: "text", is_required: true },
                    { field_name: "phone", field_label: "Phone Number", field_type: "tel", is_required: true },
                    { field_name: "email", field_label: "Email", field_type: "email", is_required: true },
                ],
            });
        } else {
            setEditMode(false);
            setCurrentPage(null);
            setFormData({
                page_name: "",
                page_slug: "",
                headline: "",
                subheadline: "",
                description: "",
                image_url: "",
                cta_button_text: "",
                form_fields: [
                    { field_name: "name", field_label: "Full Name", field_type: "text", is_required: true },
                    { field_name: "phone", field_label: "Phone Number", field_type: "tel", is_required: true },
                    { field_name: "email", field_label: "Email", field_type: "email", is_required: true },
                ],
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = async () => {
        try {
            const slug = formData.page_slug || generateSlug(formData.page_name);
            const pageUrl = generateUrl(slug);

            const payload = {
                page_name: formData.page_name,
                page_slug: slug,
                page_url: pageUrl,
                page_content: {
                    headline: formData.headline,
                    subheadline: formData.subheadline,
                    description: formData.description,
                    image_url: formData.image_url,
                    cta_button_text: formData.cta_button_text,
                },
                form_fields: formData.form_fields,
                colid: global1.colid,
                created_by: global1.user,
            };

            if (editMode) {
                await ep1.post("/api/v2/updateunifiedlandingpageds3", payload, {
                    params: { id: currentPage._id },
                });
                showSnackbar("Extended landing page updated successfully", "success");
            } else {
                await ep1.post("/api/v2/createunifiedlandingpageds3", payload);
                showSnackbar("Extended landing page created successfully", "success");
            }

            fetchLandingPages();
            handleCloseDialog();
        } catch (err) {
            console.error("Error saving landing page:", err);
            showSnackbar("Failed to save landing page", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this landing page?")) {
            try {
                await ep1.get(`/api/v2/deleteunifiedlandingpageds3/${id}`);
                showSnackbar("Landing page deleted successfully", "success");
                fetchLandingPages();
            } catch (err) {
                console.error("Error deleting landing page:", err);
                showSnackbar("Failed to delete landing page", "error");
            }
        }
    };

    const handleOpenLinkDialog = (page) => {
        setSelectedPage(page);
        setLinkFormData({ source: "" });
        setGeneratedLink(page.page_url);
        setOpenLinkDialog(true);
    };

    const handleGenerateLink = () => {
        const linkWithSource = generateUrl(selectedPage.page_slug, linkFormData.source);
        setGeneratedLink(linkWithSource);
    };

    const handleOpenQrDialog = (page) => {
        setSelectedPage(page);
        setQrFormData({ qr_name: "", source: "" });
        setGeneratedQr("");
        setOpenQrDialog(true);
    };

    const handleGenerateQr = async () => {
        if (!qrFormData.qr_name || !qrFormData.source) {
            showSnackbar("Please fill QR name and source", "error");
            return;
        }

        try {
            const qrUrl = generateUrl(selectedPage.page_slug, qrFormData.source);
            const qrDataUrl = await QRCode.toDataURL(qrUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' }
            });
            setGeneratedQr(qrDataUrl);
        } catch (err) {
            console.error("Error generating QR code:", err);
            showSnackbar("Failed to generate QR code", "error");
        }
    };

    const handleSaveQr = async () => {
        if (!generatedQr) {
            showSnackbar("Please generate QR code first", "error");
            return;
        }

        try {
            await ep1.post("/api/v2/addunifiedqrcodeds3", {
                qr_name: qrFormData.qr_name,
                source: qrFormData.source,
                qr_data_url: generatedQr,
            }, {
                params: { id: selectedPage._id },
            });

            showSnackbar("QR code saved successfully", "success");
            setOpenQrDialog(false);
            setGeneratedQr("");
            setQrFormData({ qr_name: "", source: "" });
            fetchLandingPages();
        } catch (err) {
            console.error("Error saving QR code:", err);
            showSnackbar("Failed to save QR code", "error");
        }
    };

    const handleViewQrCodes = (page) => {
        setSelectedPage(page);
        setOpenQrListDialog(true);
    };

    const handleDeleteQr = async (qrId) => {
        if (window.confirm("Are you sure you want to delete this QR code?")) {
            try {
                await ep1.get("/api/v2/deleteunifiedqrcodeds3", {
                    params: { id: selectedPage._id, qr_id: qrId },
                });
                showSnackbar("QR code deleted successfully", "success");
                fetchLandingPages();
                const updatedPage = landingPages.find(p => p._id === selectedPage._id);
                setSelectedPage(updatedPage);
            } catch (err) {
                console.error("Error deleting QR code:", err);
                showSnackbar("Failed to delete QR code", "error");
            }
        }
    };

    const handleDownloadQr = (qrDataUrl, qrName) => {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `${qrName}.png`;
        link.click();
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleAddFormField = (field) => {
        const exists = formData.form_fields.some(f => f.field_name === field.field_name);
        if (!exists) {
            setFormData({
                ...formData,
                form_fields: [...formData.form_fields, { ...field, is_required: false }]
            });
        }
    };

    const handleRemoveFormField = (fieldName) => {
        setFormData({
            ...formData,
            form_fields: formData.form_fields.filter(f => f.field_name !== fieldName)
        });
    };

    const handleToggleRequired = (fieldName) => {
        setFormData({
            ...formData,
            form_fields: formData.form_fields.map(f =>
                f.field_name === fieldName ? { ...f, is_required: !f.is_required } : f
            )
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showSnackbar("URL copied to clipboard", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
                <IconButton
                    onClick={() => navigate("/dashboardcrmds")}
                    sx={{
                        mr: 2,
                        bgcolor: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        "&:hover": { bgcolor: "#f8fafc" }
                    }}
                >
                    <BackIcon sx={{ color: "#1e293b" }} />
                </IconButton>
                <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, color: "#1e293b" }}>
                    Extended Data Landing Pages (V3)
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                        bgcolor: "#1565c0",
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
                        "&:hover": { bgcolor: "#0d47a1" }
                    }}
                >
                    Create Extended Landing Page
                </Button>
            </Box>

            <Grid container spacing={4}>
                {landingPages.map((page) => (
                    <Grid item xs={12} md={6} lg={4} key={page._id}>
                        <Card
                            sx={{
                                height: "100%",
                                borderRadius: 4,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                border: "1px solid rgba(0,0,0,0.05)",
                                display: "flex",
                                flexDirection: "column",
                                transition: "transform 0.2s, box-shadow 0.2s",
                                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 12px 30px rgba(0,0,0,0.1)" }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#334155" }}>
                                    {page.page_name}
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                                        <strong>Visits:</strong> {page.visit_count} | <strong>Conversions:</strong> {page.conversion_count}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                                        <strong>QR Codes:</strong> {page.qr_codes?.length || 0}
                                    </Typography>
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: "space-between", px: 3, pb: 3, pt: 0 }}>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenLinkDialog(page)}
                                        title="Get Tracking Link"
                                        sx={{ color: "#1565c0", bgcolor: "rgba(21, 101, 192, 0.1)", "&:hover": { bgcolor: "rgba(21, 101, 192, 0.2)" } }}
                                    >
                                        <LinkIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleViewQrCodes(page)}
                                        title="View QR Codes"
                                        sx={{ color: "#0288d1", bgcolor: "rgba(2, 136, 209, 0.1)", "&:hover": { bgcolor: "rgba(2, 136, 209, 0.2)" } }}
                                    >
                                        <QrCodeIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenQrDialog(page)}
                                        title="Generate QR Code"
                                        sx={{ color: "#2e7d32", bgcolor: "rgba(46, 125, 50, 0.1)", "&:hover": { bgcolor: "rgba(46, 125, 50, 0.2)" } }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDialog(page)}
                                        sx={{ color: "#f59e0b", bgcolor: "rgba(245, 158, 11, 0.1)", "&:hover": { bgcolor: "rgba(245, 158, 11, 0.2)" } }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDelete(page._id)}
                                        sx={{ color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Same Dialogs as V2 but with extended field capabilities */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editMode ? "Edit Extended Landing Page" : "Create Extended Landing Page"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Page Name"
                                    value={formData.page_name}
                                    onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Page Slug"
                                    value={formData.page_slug}
                                    onChange={(e) => setFormData({ ...formData, page_slug: e.target.value })}
                                    helperText="Leave empty for auto-generation."
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Content Config</Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField fullWidth label="Headline" value={formData.headline} onChange={(e) => setFormData({ ...formData, headline: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Subheadline" value={formData.subheadline} onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="CTA Button Text" value={formData.cta_button_text} onChange={(e) => setFormData({ ...formData, cta_button_text: e.target.value })} placeholder="Submit Details" />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Selected Fields</Typography>
                                <Box sx={{ mb: 2 }}>
                                    {formData.form_fields.map((field) => (
                                        <Chip
                                            key={field.field_name}
                                            label={field.field_label}
                                            onDelete={() => handleRemoveFormField(field.field_name)}
                                            onClick={() => handleToggleRequired(field.field_name)}
                                            color={field.is_required ? "primary" : "default"}
                                            sx={{ m: 0.5 }}
                                        />
                                    ))}
                                </Box>
                                <Typography variant="body2" gutterBottom>Available Fields (Includes Academic & Guardian):</Typography>
                                <Box>
                                    {availableCRMFields.filter(field => !formData.form_fields.some(f => f.field_name === field.field_name)).map((field) => (
                                        <Chip key={field.field_name} label={field.field_label} onClick={() => handleAddFormField(field)} variant="outlined" sx={{ m: 0.5, cursor: 'pointer' }} />
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">{editMode ? "Update" : "Create"}</Button>
                </DialogActions>
            </Dialog>

            {/* Tracking Link Dialog */}
            <Dialog open={openLinkDialog} onClose={() => setOpenLinkDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Get Tracking Link</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            select
                            label="Select Source (Optional)"
                            value={linkFormData.source}
                            onChange={(e) => {
                                const newSource = e.target.value;
                                setLinkFormData({ source: newSource });
                                const newLink = generateUrl(selectedPage.page_slug, newSource);
                                setGeneratedLink(newLink);
                            }}
                            sx={{ mb: 3, mt: 1 }}
                        >
                            <MenuItem value=""><em>None (Base URL)</em></MenuItem>
                            {sources.filter(s => s.is_active === 'Yes').map((source) => (
                                <MenuItem key={source._id} value={source.source_name}>{source.source_name}</MenuItem>
                            ))}
                        </TextField>

                        <TextField fullWidth label="Generated Link" value={generatedLink} InputProps={{ readOnly: true }} sx={{ mb: 2 }} multiline rows={3} />
                        <Button fullWidth variant="outlined" startIcon={<LinkIcon />} onClick={() => copyToClipboard(generatedLink)} sx={{ fontWeight: 600 }}>Copy Tracking Link</Button>
                    </Box>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenLinkDialog(false)}>Close</Button></DialogActions>
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Generate QR Code</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField fullWidth label="QR Code Name" value={qrFormData.qr_name} onChange={(e) => setQrFormData({ ...qrFormData, qr_name: e.target.value })} sx={{ mb: 2 }} />
                        <TextField fullWidth select label="Source" value={qrFormData.source} onChange={(e) => setQrFormData({ ...qrFormData, source: e.target.value })} sx={{ mb: 2 }}>
                            {sources.filter(s => s.is_active === 'Yes').map((source) => (
                                <MenuItem key={source._id} value={source.source_name}>{source.source_name}</MenuItem>
                            ))}
                        </TextField>
                        <Button fullWidth variant="outlined" onClick={handleGenerateQr} sx={{ mb: 2 }}>Generate QR Code</Button>
                        {generatedQr && <Box sx={{ textAlign: 'center' }}><img src={generatedQr} alt="QR Code" style={{ maxWidth: '100%' }} /></Box>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenQrDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveQr} variant="contained" disabled={!generatedQr}>Save QR Code</Button>
                </DialogActions>
            </Dialog>

            {/* QR List Dialog */}
            <Dialog open={openQrListDialog} onClose={() => setOpenQrListDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>QR Codes - {selectedPage?.page_name}</DialogTitle>
                <DialogContent>
                    {selectedPage?.qr_codes && selectedPage.qr_codes.length > 0 ? (
                        <List>
                            {selectedPage.qr_codes.map((qr) => (
                                <ListItem key={qr._id}>
                                    <Box sx={{ mr: 2 }}><img src={qr.qr_data_url} alt={qr.qr_name} width="80" /></Box>
                                    <ListItemText primary={qr.qr_name} secondary={`Source: ${qr.source}`} />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleDownloadQr(qr.qr_data_url, qr.qr_name)}><DownloadIcon /></IconButton>
                                        <IconButton onClick={() => handleDeleteQr(qr._id)} color="error"><DeleteIcon /></IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    ) : <Typography sx={{ p: 4, textAlign: 'center' }}>No QR codes yet.</Typography>}
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenQrListDialog(false)}>Close</Button></DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default UnifiedLandingPageds3;
