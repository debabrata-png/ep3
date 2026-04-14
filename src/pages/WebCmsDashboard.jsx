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
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Settings as SettingsIcon,
    Visibility as VisibilityIcon,
    Language as LanguageIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const WebCmsDashboard = () => {
    const navigate = useNavigate();
    const [pages, setPages] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
    });

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await ep1.get("/api/v2/cms/pages", {
                params: { colid: global1.colid }
            });
            if (res.data.success) {
                setPages(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching pages:", err);
            showSnackbar("Failed to fetch pages", "error");
        }
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCreatePage = async () => {
        if (!formData.title || !formData.slug) {
            showSnackbar("Please fill all fields", "warning");
            return;
        }

        try {
            const res = await ep1.post("/api/v2/cms/pages", {
                ...formData,
                colid: global1.colid,
                created_by: localStorage.getItem("email"),
                blocks: []
            });

            if (res.data.success) {
                showSnackbar("Page created successfully");
                setOpenDialog(false);
                setFormData({ title: "", slug: "" });
                fetchPages();
                // Optionally navigate to editor immediately
                // navigate(`/web-builder/edit/${res.data.data._id}`);
            }
        } catch (err) {
            showSnackbar(err.response?.data?.message || "Error creating page", "error");
        }
    };

    const handleDeletePage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this page?")) return;

        try {
            const res = await ep1.delete(`/api/v2/cms/pages/${id}`);
            if (res.data.success) {
                showSnackbar("Page deleted");
                fetchPages();
            }
        } catch (err) {
            showSnackbar("Error deleting page", "error");
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    Wiser Website CMS
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => navigate("/web-builder/settings")}
                        sx={{ mr: 2 }}
                    >
                        Global Settings
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenDialog(true)}
                    >
                        Create New Page
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {pages.map((page) => (
                    <Grid item xs={12} sm={6} md={4} key={page._id}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                    {page.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Slug: /{page.slug}
                                </Typography>
                                <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 1 }}>
                                    Blocks: {page.blocks?.length || 0}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                                <Box>
                                    <Tooltip title="Edit Page Content">
                                        <IconButton color="primary" onClick={() => navigate(`/web-builder/edit/${page._id}`)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View Live">
                                        <IconButton color="info" onClick={() => window.open(`/wiser/?colid=${page.colid}&slug=${page.slug}`, "_blank")}>
                                            <VisibilityIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <Tooltip title="Delete Page">
                                    <IconButton color="error" onClick={() => handleDeletePage(page._id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}

                {pages.length === 0 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 5, textAlign: 'center', backgroundColor: '#f9f9f9' }}>
                            <LanguageIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary">
                                No pages created yet.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{ mt: 2 }}
                                onClick={() => setOpenDialog(true)}
                            >
                                Get Started
                            </Button>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Create Page Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Create New Website Page</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Page Title"
                            variant="outlined"
                            margin="normal"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., About Us"
                        />
                        <TextField
                            fullWidth
                            label="Page Slug"
                            variant="outlined"
                            margin="normal"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                            placeholder="e.g., about-us"
                            helperText="This becomes the URL of your page"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreatePage}>Create Page</Button>
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

export default WebCmsDashboard;
