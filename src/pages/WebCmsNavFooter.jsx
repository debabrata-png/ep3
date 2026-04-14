import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    TextField,
    Divider,
    IconButton,
    Snackbar,
    Alert,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tabs,
    Tab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as BackIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Language as BrandingIcon,
    Menu as NavIcon,
    ExpandMore as ExpandMoreIcon,
    ContactSupport as ContactIcon,
    Share as SocialIcon,
    ViewColumn as ColumnIcon,
    ListAlt as FormIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const WebCmsNavFooter = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [settings, setSettings] = useState({
        branding: { site_name: "", logo_url: "", primary_color: "#2563eb", secondary_color: "#f59e0b" },
        navbar: { links: [] },
        footer: { 
            columns: [], 
            social_links: { facebook: "", twitter: "", instagram: "", linkedin: "" }, 
            contact_info: { address: "", phone: "", email: "" },
            copyright_text: ""
        }
    });
    const [forms, setForms] = useState([]); // Form templates
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        fetchSettings();
        fetchForms();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await ep1.get("/api/v2/cms/settings", {
                params: { colid: global1.colid }
            });
            if (res.data.success) {
                setSettings(prev => ({
                    ...prev,
                    ...res.data.data,
                    branding: { ...prev.branding, ...(res.data.data.branding || {}) },
                    navbar: { ...prev.navbar, ...(res.data.data.navbar || {}) },
                    footer: { ...prev.footer, ...(res.data.data.footer || {}) }
                }));
            }
        } catch (err) {
            console.error("Error fetching settings:", err);
        }
    };

    const fetchForms = async () => {
        try {
            const res = await ep1.get("/api/v2/cms/forms", {
                params: { colid: global1.colid }
            });
            setForms(res.data);
        } catch (err) {
            console.error("Error fetching forms:", err);
        }
    };

    const handleSaveSettings = async () => {
        try {
            const res = await ep1.post("/api/v2/cms/settings", {
                ...settings,
                colid: global1.colid
            });
            if (res.data.success) {
                setSnackbar({ open: true, message: "Settings saved!", severity: "success" });
            }
        } catch (err) {
            setSnackbar({ open: true, message: "Save failed", severity: "error" });
        }
    };

    const handleSaveForm = async (form) => {
        try {
            if (form._id) {
                await ep1.post("/api/v2/cms/forms/update", form, { params: { colid: global1.colid, formId: form._id } });
            } else {
                await ep1.post("/api/v2/cms/forms", form, { params: { colid: global1.colid } });
            }
            fetchForms();
            setSnackbar({ open: true, message: "Form template saved!", severity: "success" });
        } catch (err) {
            setSnackbar({ open: true, message: "Form save failed", severity: "error" });
        }
    };

    const deleteForm = async (formId) => {
        if (!window.confirm("Delete this form template and all its responses?")) return;
        try {
            await ep1.delete("/api/v2/cms/forms", { params: { colid: global1.colid, formId } });
            fetchForms();
            setSnackbar({ open: true, message: "Form deleted", severity: "success" });
        } catch (err) {
            setSnackbar({ open: true, message: "Delete failed", severity: "error" });
        }
    };

    const addNavLink = () => {
        const newLinks = [...settings.navbar.links, { label: "New Link", slug: "", is_external: false, sub_links: [] }];
        setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
    };

    const addSubLink = (parentIdx) => {
        const newLinks = [...settings.navbar.links];
        if (!newLinks[parentIdx].sub_links) newLinks[parentIdx].sub_links = [];
        newLinks[parentIdx].sub_links.push({ label: "Sub Item", slug: "", is_external: false });
        setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
    };

    const addFooterColumn = () => {
        const newCols = [...(settings.footer.columns || []), { title: "Useful Links", links: [] }];
        setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
    };

    const addFooterColumnLink = (colIdx) => {
        const newCols = [...settings.footer.columns];
        newCols[colIdx].links.push({ label: "Footer Link", slug: "", is_external: false });
        setSettings({ ...settings, footer: { ...settings.footer, columns: newCols } });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => navigate("/web-builder")} sx={{ mr: 1 }}>
                        <BackIcon />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">Global Website Settings</Typography>
                </Box>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                    <Tab label="General & Branding" />
                    <Tab label="Navigation & Footer" />
                    <Tab label="Form Manager" />
                </Tabs>
            </Box>

            {tab === 0 && (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom display="flex" alignItems="center" color="primary">
                                <BrandingIcon sx={{ mr: 1 }} /> Branding & Identity
                            </Typography>
                            <TextField
                                fullWidth label="Site Name" size="small" margin="normal"
                                value={settings.branding.site_name}
                                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, site_name: e.target.value } })}
                            />
                            <TextField
                                fullWidth label="Logo URL" size="small" margin="normal"
                                value={settings.branding.logo_url}
                                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, logo_url: e.target.value } })}
                            />
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <TextField
                                    label="Primary Color" type="color" size="small"
                                    value={settings.branding.primary_color}
                                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primary_color: e.target.value } })}
                                    sx={{ width: '50%' }}
                                />
                                <TextField
                                    label="Secondary Color" type="color" size="small"
                                    value={settings.branding.secondary_color}
                                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, secondary_color: e.target.value } })}
                                    sx={{ width: '50%' }}
                                />
                            </Stack>
                            <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleSaveSettings}>Save Branding</Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {tab === 1 && (
                <Grid container spacing={4}>
                    {/* Navbar Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" display="flex" alignItems="center" color="primary">
                                    <NavIcon sx={{ mr: 1 }} /> Navigation Bar
                                </Typography>
                                <Button size="small" startIcon={<AddIcon />} onClick={addNavLink}>Add Link</Button>
                            </Box>
                            <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
                                {settings.navbar.links.map((link, idx) => (
                                    <Accordion key={idx} sx={{ mb: 1 }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography sx={{ fontWeight: 600 }}>{link.label || 'New Link'}</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container spacing={1} mb={2}>
                                                <Grid item xs={5}>
                                                    <TextField fullWidth size="small" label="Label" value={link.label} 
                                                        onChange={(e) => {
                                                            const newLinks = [...settings.navbar.links];
                                                            newLinks[idx].label = e.target.value;
                                                            setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField fullWidth size="small" label="Slug/URL" value={link.slug} 
                                                        onChange={(e) => {
                                                            const newLinks = [...settings.navbar.links];
                                                            newLinks[idx].slug = e.target.value;
                                                            setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
                                                        }}
                                                    />
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton color="error" onClick={() => {
                                                        const newLinks = settings.navbar.links.filter((_, i) => i !== idx);
                                                        setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
                                                    }}><DeleteIcon /></IconButton>
                                                </Grid>
                                            </Grid>
                                            <Button size="small" startIcon={<AddIcon />} onClick={() => addSubLink(idx)}>Add Sub Item</Button>
                                            {link.sub_links?.map((sub, sIdx) => (
                                                <Box key={sIdx} sx={{ ml: 3, mt: 1, display: 'flex', gap: 1 }}>
                                                    <TextField size="small" label="Sub Label" value={sub.label} sx={{ flex: 1 }} onChange={(e) => {
                                                        const newLinks = [...settings.navbar.links];
                                                        newLinks[idx].sub_links[sIdx].label = e.target.value;
                                                        setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
                                                    }} />
                                                    <TextField size="small" label="Sub Slug" value={sub.slug} sx={{ flex: 1 }} onChange={(e) => {
                                                        const newLinks = [...settings.navbar.links];
                                                        newLinks[idx].sub_links[sIdx].slug = e.target.value;
                                                        setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
                                                    }} />
                                                    <IconButton size="small" color="error" onClick={() => {
                                                        const newLinks = [...settings.navbar.links];
                                                        newLinks[idx].sub_links = newLinks[idx].sub_links.filter((_, i) => i !== sIdx);
                                                        setSettings({ ...settings, navbar: { ...settings.navbar, links: newLinks } });
                                                    }}><DeleteIcon fontSize="small" /></IconButton>
                                                </Box>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Footer Section */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" display="flex" alignItems="center" color="primary" sx={{ mb: 2 }}>
                                <ColumnIcon sx={{ mr: 1 }} /> Footer Info
                            </Typography>
                            <Stack spacing={2}>
                                <TextField fullWidth size="small" label="Footer Email" value={settings.footer.contact_info?.email || ""} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, contact_info: { ...settings.footer.contact_info, email: e.target.value } } })} />
                                <TextField fullWidth size="small" label="Footer Phone" value={settings.footer.contact_info?.phone || ""} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, contact_info: { ...settings.footer.contact_info, phone: e.target.value } } })} />
                                <TextField fullWidth size="small" label="Copyright Text" value={settings.footer.copyright_text || ""} onChange={(e) => setSettings({ ...settings, footer: { ...settings.footer, copyright_text: e.target.value } })} />
                            </Stack>
                            <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleSaveSettings}>Save Nav & Footer</Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {tab === 2 && (
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">Form Templates</Typography>
                            <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setForms([...forms, { title: "New Form", fields: [{ label: "Name", type: "text" }] }])}>
                                Create New Form
                            </Button>
                        </Box>
                        {forms.map((form, fIdx) => (
                            <Paper key={fIdx} sx={{ p: 3, mb: 3 }}>
                                <Box display="flex" justifyContent="space-between" mb={2}>
                                    <TextField label="Form Title" size="small" value={form.title} sx={{ width: 300 }} onChange={(e) => {
                                        const newForms = [...forms];
                                        newForms[fIdx].title = e.target.value;
                                        setForms(newForms);
                                    }} />
                                    <Box>
                                        <Button startIcon={<SaveIcon />} color="success" onClick={() => handleSaveForm(form)} sx={{ mr: 1 }}>Save Template</Button>
                                        <Button startIcon={<DeleteIcon />} color="error" onClick={() => deleteForm(form._id)}>Delete</Button>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" mb={1}>Fields</Typography>
                                {form.fields?.map((field, flIdx) => (
                                    <Box key={flIdx} sx={{ display: 'flex', gap: 2, mb: 1, alignItems: 'center' }}>
                                        <TextField label="Field Label" size="small" value={field.label} onChange={(e) => {
                                            const newForms = [...forms];
                                            newForms[fIdx].fields[flIdx].label = e.target.value;
                                            setForms(newForms);
                                        }} />
                                        <FormControl size="small" sx={{ width: 150 }}>
                                            <InputLabel>Type</InputLabel>
                                            <Select value={field.type} label="Type" onChange={(e) => {
                                                const newForms = [...forms];
                                                newForms[fIdx].fields[flIdx].type = e.target.value;
                                                setForms(newForms);
                                            }}>
                                                <MenuItem value="text">Short Text</MenuItem>
                                                <MenuItem value="textarea">Long Text</MenuItem>
                                                <MenuItem value="email">Email</MenuItem>
                                                <MenuItem value="number">Number</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <IconButton size="small" color="error" onClick={() => {
                                            const newForms = [...forms];
                                            newForms[fIdx].fields = newForms[fIdx].fields.filter((_, i) => i !== flIdx);
                                            setForms(newForms);
                                        }}><DeleteIcon /></IconButton>
                                    </Box>
                                ))}
                                <Button startIcon={<AddIcon />} size="small" onClick={() => {
                                    const newForms = [...forms];
                                    if (!newForms[fIdx].fields) newForms[fIdx].fields = [];
                                    newForms[fIdx].fields.push({ label: "New Field", type: "text" });
                                    setForms(newForms);
                                }}>Add Field</Button>
                            </Paper>
                        ))}
                    </Grid>
                </Grid>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default WebCmsNavFooter;
