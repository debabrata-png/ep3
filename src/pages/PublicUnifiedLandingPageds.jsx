import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Grid,
    Alert,
    Snackbar,
    CircularProgress,
    MenuItem,
} from "@mui/material";
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Category as CategoryIcon,
} from "@mui/icons-material";
import { useParams, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import { decryptData } from "../utils/encryption";

const PublicUnifiedLandingPageds = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const [landingPage, setLandingPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // NEW: State for Category and Programs
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [programs, setPrograms] = useState([]);

    const [decryptedData, setDecryptedData] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        course_interested: "",
        city: "",
        state: "",
    });

    useEffect(() => {
        // Decrypt data from URL
        const encryptedData = searchParams.get('data');
        if (encryptedData) {
            const decrypted = decryptData(encryptedData);
            if (decrypted) {
                setDecryptedData(decrypted);
                console.log('✅ Decrypted data:', decrypted);
            } else {
                showSnackbar("Invalid link. Please contact support.", "error");
            }
        }

        fetchLandingPage();
        fetchCategories(); // NEW: Fetch categories on load
    }, [slug]);

    // NEW: Effect to fetch programs when category changes
    useEffect(() => {
        if (selectedCategory && landingPage) {
            fetchProgramsByCategory(selectedCategory);
        } else {
            setPrograms([]);
        }
    }, [selectedCategory, landingPage]);

    const fetchLandingPage = async () => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getunifiedlandingpagebyslugds/${slug}`);
            setLandingPage(res.data.data);
        } catch (err) {
            console.error("Error fetching landing page:", err);
            showSnackbar("Landing page not found", "error");
        }
        setLoading(false);
    };

    // NEW: Fetch all categories
    const fetchCategories = async () => {
        try {
            // Assuming global1 is not available here, so we might need colid from somewhere else
            // But usually public APIs should handle this or we use a generous query
            // However, for categories, we likely need the colid. 
            // The colid should be in the landing page data or decrypted data.
            // We'll wait until landingPage is loaded or decryptedData is available if they are needed for colid.
            // actually, getallcategories usually needs colid. 
            // Let's rely on decryptedData.colid if available, otherwise we might have issues.
            // But wait, existing Publiclandingpageds.jsx uses ep1 which might have interceptors or auth?
            // No, public pages usually don't have auth headers.
            // Let's check if we can get categories without auth or if we need to pass colid.
            // We will use decryptedData.colid once available.
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    // NEW: We need colid to fetch categories.
    // We can call this inside fetchLandingPage after setting landingPage, 
    // or use the decryptedData.colid
    useEffect(() => {
        if (decryptedData?.colid) {
            fetchCategoriesWithColid(decryptedData.colid);
        }
    }, [decryptedData]);

    const fetchCategoriesWithColid = async (colid) => {
        try {
            const res = await ep1.get("/api/v2/getallcategoriesds", {
                params: { colid: colid }
            });
            setCategories(res.data.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }

    // NEW: Fetch programs filtered by category
    const fetchProgramsByCategory = async (category) => {
        try {
            const res = await ep1.get(`/api/v2/getprogramsbycategoryds/${category}`, {
                params: { colid: landingPage.colid },
            });
            setPrograms(res.data.data);
        } catch (err) {
            console.error("Error fetching programs:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!decryptedData) {
            showSnackbar("Invalid link. Please contact support.", "error");
            return;
        }

        if (!selectedCategory) {
            showSnackbar("Please select a category", "error");
            return;
        }

        setSubmitting(true);
        try {
            // Get source from URL query parameter or use default
            const sourceParam = searchParams.get('source');
            const leadSource = sourceParam || `Unified Landing Page - ${landingPage.page_name}`;

            const payload = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                category: selectedCategory, // NEW: Use selected category
                course_interested: formData.course_interested,
                source: leadSource,
                city: formData.city,
                state: formData.state,
                colid: decryptedData.colid,
                user: decryptedData.user,
                landing_page_id: landingPage._id,
                // We might want to flag this came from a unified page if needed
            };

            console.log('📤 Submitting payload:', payload);

            // Create lead
            await ep1.post("/api/v2/createleadds", payload);

            // Conversion count is now handled in the backend createleadds controller

            showSnackbar("Thank you! We will contact you soon.", "success");
            setFormData({
                name: "",
                phone: "",
                email: "",
                course_interested: "",
                city: "",
                state: "",
            });
            setSelectedCategory(""); // Reset category
            setPrograms([]);
        } catch (err) {
            console.error("Error submitting form:", err);
            const errorMessage = err.response?.data?.message || "Failed to submit. Please try again.";
            showSnackbar(errorMessage, "error");
        }
        setSubmitting(false);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!landingPage) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Page Not Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    The landing page you're looking for doesn't exist.
                </Typography>
            </Container>
        );
    }

    if (!decryptedData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Invalid Link
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    This link is invalid or has expired. Please contact support.
                </Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 6 }}>
            <Container maxWidth="lg">
                {/* Hero Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        mb: 4,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                        color: 'white',
                        borderRadius: 4,
                        boxShadow: "0 10px 30px rgba(21, 101, 192, 0.3)"
                    }}
                >
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
                        {landingPage.page_content?.headline || "Welcome"}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, opacity: 0.9 }}>
                        {landingPage.page_content?.subheadline || ""}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, maxWidth: 800, mx: "auto", opacity: 0.9 }}>
                        {landingPage.page_content?.description || ""}
                    </Typography>
                    {landingPage.page_content?.image_url && (
                        <Box sx={{ mt: 4 }}>
                            <img
                                src={landingPage.page_content.image_url}
                                alt="Landing"
                                style={{ maxWidth: '100%', borderRadius: '16px', boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                            />
                        </Box>
                    )}
                </Paper>

                {/* Form Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                        border: "1px solid rgba(0,0,0,0.05)"
                    }}
                >
                    <Typography variant="h4" gutterBottom sx={{ color: "#1565c0", fontWeight: 700, textAlign: "center" }}>
                        {landingPage.page_content?.cta_button_text || "Apply Now"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center", fontSize: "1.1rem" }}>
                        Fill in your details and our counsellor will contact you shortly
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* NEW: Category Dropdown - ALWAYS VISIBLE */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Select Category"
                                    required
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    InputProps={{
                                        startAdornment: <CategoryIcon sx={{ color: "#64748b", mr: 1 }} />,
                                        sx: { borderRadius: 2 }
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat._id} value={cat.category_name}>
                                            {cat.category_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Dynamically render form fields based on landingPage.form_fields */}
                            {landingPage.form_fields?.map((field, index) => {
                                const gridSize = field.field_type === 'textarea' ? 12 : 6;

                                // Determine icon based on field name
                                const getFieldIcon = (fieldName) => {
                                    switch (fieldName) {
                                        case 'name': return <PersonIcon sx={{ color: "#64748b" }} />;
                                        case 'phone': return <PhoneIcon sx={{ color: "#64748b" }} />;
                                        case 'email': return <EmailIcon sx={{ color: "#64748b" }} />;
                                        case 'course_interested': return <SchoolIcon sx={{ color: "#64748b" }} />;
                                        default: return null;
                                    }
                                };

                                return (
                                    <Grid item xs={12} sm={gridSize} key={index}>
                                        {field.field_type === 'select' && field.field_name === 'course_interested' ? (
                                            <TextField
                                                fullWidth
                                                select
                                                label={field.field_label}
                                                required={field.is_required}
                                                value={formData[field.field_name]}
                                                onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
                                                disabled={!selectedCategory} // Disable if no category selected
                                                helperText={!selectedCategory ? "Please select a category first" : ""}
                                                InputProps={{
                                                    startAdornment: getFieldIcon(field.field_name),
                                                    sx: { borderRadius: 2 }
                                                }}
                                            >
                                                {programs.map((program) => (
                                                    <MenuItem key={program._id} value={program.course_name}>
                                                        {program.course_name}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        ) : field.field_type === 'textarea' ? (
                                            <TextField
                                                fullWidth
                                                label={field.field_label}
                                                required={field.is_required}
                                                value={formData[field.field_name]}
                                                onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
                                                multiline
                                                rows={3}
                                                InputProps={{
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        ) : (
                                            <TextField
                                                fullWidth
                                                label={field.field_label}
                                                type={field.field_type}
                                                required={field.is_required}
                                                value={formData[field.field_name]}
                                                onChange={(e) => setFormData({ ...formData, [field.field_name]: e.target.value })}
                                                InputProps={{
                                                    startAdornment: getFieldIcon(field.field_name),
                                                    sx: { borderRadius: 2 }
                                                }}
                                            />
                                        )}
                                    </Grid>
                                );
                            })}

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={submitting}
                                    sx={{
                                        py: 1.5,
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        textTransform: "none",
                                        bgcolor: "#ef6c00",
                                        boxShadow: "0 4px 12px rgba(239, 108, 0, 0.3)",
                                        "&:hover": { bgcolor: "#e65100" }
                                    }}
                                >
                                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {/* Features Section */}
                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12}>
                        <Typography variant="h5" textAlign="center" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>
                            Why Choose Us?
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                height: '100%',
                                borderRadius: 4,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                border: "1px solid rgba(0,0,0,0.05)",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "translateY(-4px)" }
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1565c0" }}>
                                Expert Faculty
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Learn from industry experts with years of experience
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                height: '100%',
                                borderRadius: 4,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                border: "1px solid rgba(0,0,0,0.05)",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "translateY(-4px)" }
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1565c0" }}>
                                100% Placement
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Guaranteed placement assistance in top companies
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                height: '100%',
                                borderRadius: 4,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                border: "1px solid rgba(0,0,0,0.05)",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "translateY(-4px)" }
                            }}
                        >
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1565c0" }}>
                                Modern Campus
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                State-of-the-art facilities and infrastructure
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Footer */}
                <Box sx={{ mt: 8, py: 4, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.secondary">
                        © 2025 Career College. All rights reserved.
                    </Typography>
                </Box>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PublicUnifiedLandingPageds;
