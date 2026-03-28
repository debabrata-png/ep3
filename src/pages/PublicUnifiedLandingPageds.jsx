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
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Category as CategoryIcon,
    LocationCity as LocationCityIcon,
    LocationOn as LocationOnIcon,
    Map as MapIcon,
    WorkspacePremium as WorkspacePremiumIcon,
} from "@mui/icons-material";
import { useParams, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import { decryptData } from "../utils/encryption";
import { State, City } from "country-state-city";

const PublicUnifiedLandingPageds = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const [landingPage, setLandingPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // States for Form Fields
    const [decryptedData, setDecryptedData] = useState(null);
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    const [qualifications, setQualifications] = useState([]);
    const [categories, setCategories] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [sources, setSources] = useState([]);
    const [logo, setLogo] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        stateIso: "",
        stateName: "",
        cityName: "",
        area: "",
        qualification: "",
        category: "",
        programId: "",
        source: "",
        declaration: false
    });

    useEffect(() => {
        const encryptedData = searchParams.get('data');
        if (encryptedData) {
            const decrypted = decryptData(encryptedData);
            if (decrypted) {
                setDecryptedData(decrypted);
                if (decrypted.logo) {
                    setLogo(decrypted.logo);
                }
                fetchInitialData(decrypted.colid, decrypted.logo);
            } else {
                showSnackbar("Invalid link. Please contact support.", "error");
            }
        }

        // India states by default
        setStatesList(State.getStatesOfCountry('IN'));
        fetchLandingPage();
    }, [slug]);

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

    const fetchInitialData = async (colid, existingLogo) => {
        try {
            const promises = [
                ep1.get('/api/v2/geteducationqualificationsag1', { params: { colid } }),
                ep1.get('/api/v2/getallsourcesds', { params: { colid } })
            ];

            // Only fetch logo if not provided in URL
            if (!existingLogo) {
                promises.push(ep1.get('/api/v2/checkinstitutionsds', { params: { colid } }));
            }

            const results = await Promise.all(promises);
            setQualifications(results[0].data.data || []);
            setSources(results[1].data.data || []);

            if (!existingLogo && results[2]?.data.data?.institutions?.[0]) {
                setLogo(results[2].data.data.institutions[0].logo || "");
            }
        } catch (err) {
            console.error("Error fetching initial data:", err);
        }
    };

    // Handle State Change
    const handleStateChange = (stateIso, stateName) => {
        setFormData(prev => ({ ...prev, stateIso, stateName, cityName: "" }));
        setCitiesList(City.getCitiesOfState('IN', stateIso));
    };

    // Handle Qualification Change
    const handleQualificationChange = async (qualification) => {
        setFormData(prev => ({ ...prev, qualification, category: "", programId: "" }));
        setCategories([]);
        setPrograms([]);
        if (!qualification || !decryptedData?.colid) return;

        try {
            const res = await ep1.get('/api/v2/getcategoriesbyedqag1', {
                params: { colid: decryptedData.colid, education_qualification: qualification }
            });
            setCategories(res.data.data || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    // Handle Category Change
    const handleCategoryChange = async (category, education_qualification) => {
        setFormData(prev => ({ ...prev, category, programId: "" }));
        setPrograms([]);
        if (!category || !decryptedData?.colid) return;

        try {
            const res = await ep1.get('/api/v2/getallprogramcounselords', {
                params: { colid: decryptedData.colid, category, is_active: 'Yes', education_qualification: education_qualification }
            });
            setPrograms(res.data.data || []);
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
        if (formData.phone.length !== 10) {
            showSnackbar("Mobile number must be exactly 10 digits", "error");
            return;
        }
        if (!formData.declaration) {
            showSnackbar("Please check the declaration box to proceed", "error");
            return;
        }

        setSubmitting(true);
        try {
            const sourceParam = searchParams.get('source');
            const leadSource = formData.source || sourceParam || `Unified Landing Page - ${landingPage.page_name}`;

            // Get counselor from explicitly selected program, fallback to category
            const selectedProg = programs.find(p => p._id === formData.programId);

            let assignedCounselor = null;
            if (selectedProg?.counsellor_email) {
                assignedCounselor = selectedProg.counsellor_email;
            } else if (formData.category) {
                const res = await ep1.get("/api/v2/getcounselorbyedpds", {
                    params: {
                        colid: decryptedData.colid,
                        category_name: formData.category,
                        education_qualification: formData.qualification
                    }
                })
                const allCounsellors = res.data.data.counsellors || [];
                const activeCounsellors = allCounsellors.filter(c => c.is_active === 'Yes');

                if (activeCounsellors.length > 0) {
                    const randomIndex = Math.floor(Math.random() * activeCounsellors.length);
                    assignedCounselor = activeCounsellors[randomIndex].counsellor_email;
                }
            }

            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                state: formData.stateName,
                city: formData.cityName,
                address: formData.area, // Mapping area to address
                qualification: formData.qualification,
                category: formData.category,
                course_interested: selectedProg?.course_name || "",
                program: selectedProg?.course_name || "",
                program_type: selectedProg?.program_type || "",
                source: leadSource,
                institution: selectedProg.institution,
                colid: decryptedData.colid,
                user: decryptedData.user,
                landing_page_id: landingPage._id,
                assignedto: assignedCounselor || "",
            };

            await ep1.post("/api/v2/createleadds", payload);

            showSnackbar("Thank you! We will contact you soon.", "success");
            setFormData({
                name: "", email: "", phone: "", stateIso: "", stateName: "",
                cityName: "", area: "", qualification: "", category: "", programId: "",
                source: "", declaration: false
            });
            setCitiesList([]); setCategories([]); setPrograms([]);

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
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>Page Not Found</Typography>
                <Typography variant="body1" color="text.secondary">The landing page you're looking for doesn't exist.</Typography>
            </Container>
        );
    }

    if (!decryptedData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>Invalid Link</Typography>
                <Typography variant="body1" color="text.secondary">This link is invalid or has expired. Please contact support.</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            py: 6,
            backgroundImage: landingPage.page_content?.image_url ? `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${landingPage.page_content.image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            bgcolor: '#f8fafc'
        }}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{
                    p: 6,
                    mb: 4,
                    textAlign: 'center',
                    background: landingPage.page_content?.image_url ? 'rgba(30, 41, 59, 0.6)' : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                    backdropFilter: landingPage.page_content?.image_url ? 'blur(10px)' : 'none',
                    color: 'white',
                    borderRadius: 4,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: landingPage.page_content?.image_url ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                    {logo && (
                        <Box sx={{ mb: 3 }}>
                            <img
                                src={logo}
                                alt="Institution Logo"
                                style={{
                                    maxHeight: '80px',
                                    maxWidth: '200px',
                                    backgroundColor: 'white',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                        </Box>
                    )}
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>{landingPage.page_content?.headline || "Welcome"}</Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, opacity: 0.9 }}>{landingPage.page_content?.subheadline || ""}</Typography>
                    <Typography variant="body1" sx={{ mt: 2, maxWidth: 800, mx: "auto", opacity: 0.9 }}>{landingPage.page_content?.description || ""}</Typography>
                </Paper>

                <Paper elevation={0} sx={{
                    p: 6,
                    borderRadius: 4,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    bgcolor: landingPage.page_content?.image_url ? 'rgba(255, 255, 255, 0.95)' : 'white'
                }}>
                    <Typography variant="h4" gutterBottom sx={{ color: "#1565c0", fontWeight: 700, textAlign: "center" }}>
                        {landingPage.page_content?.cta_button_text || "Apply Now"}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Full Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    InputProps={{ startAdornment: <PersonIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email Address" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    InputProps={{ startAdornment: <EmailIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Mobile Number" type="tel" required value={formData.phone}
                                    onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 10) setFormData({ ...formData, phone: val }); }}
                                    helperText={formData.phone.length > 0 && formData.phone.length < 10 ? "Must be exactly 10 digits" : ""}
                                    error={formData.phone.length > 0 && formData.phone.length < 10}
                                    InputProps={{ startAdornment: <PhoneIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Select State" required value={formData.stateIso}
                                    onChange={(e) => handleStateChange(e.target.value, statesList.find(s => s.isoCode === e.target.value)?.name)}
                                    InputProps={{ startAdornment: <MapIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {statesList.map((state) => (<MenuItem key={state.isoCode} value={state.isoCode}>{state.name}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Select City" required value={formData.cityName} disabled={!formData.stateIso}
                                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                                    InputProps={{ startAdornment: <LocationCityIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {citiesList.map((city) => (<MenuItem key={city.name} value={city.name}>{city.name}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Area" required value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    InputProps={{ startAdornment: <LocationOnIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Education Qualification" required value={formData.qualification}
                                    onChange={(e) => handleQualificationChange(e.target.value)}
                                    InputProps={{ startAdornment: <WorkspacePremiumIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {qualifications.map((qual, idx) => (<MenuItem key={idx} value={qual}>{qual}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Select Department" required value={formData.category} disabled={!formData.qualification}
                                    onChange={(e) => handleCategoryChange(e.target.value, formData.qualification)}
                                    InputProps={{ startAdornment: <CategoryIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {categories.map((cat, idx) => (<MenuItem key={idx} value={cat}>{cat}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Select Program" required value={formData.programId} disabled={!formData.category}
                                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                                    InputProps={{ startAdornment: <SchoolIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {programs.map((prog) => (<MenuItem key={prog._id} value={prog._id}>{prog.course_name}</MenuItem>))}
                                </TextField>
                            </Grid>
                            {/* Sources Field (If desired, can be shown or hidden based on requirements. Appears it was dynamic before.) */}
                            {landingPage.form_fields?.some(f => f.field_name === 'source') && (
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth select label="Source" required value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        InputProps={{ startAdornment: <CategoryIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                        {sources.filter(s => s.is_active === 'Yes').map((src) => (<MenuItem key={src._id} value={src.source_name}>{src.source_name}</MenuItem>))}
                                    </TextField>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Checkbox required checked={formData.declaration} onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })} color="primary" />}
                                    label="I hereby declare that the information provided is true and correct. I agree to receive communications from the institution."
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting || formData.phone.length !== 10}
                                    sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: 700, borderRadius: 2, textTransform: "none", bgcolor: "#ef6c00", boxShadow: "0 4px 12px rgba(239, 108, 0, 0.3)", "&:hover": { bgcolor: "#e65100" } }}>
                                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                <Grid container spacing={4} sx={{ mt: 4 }}>
                    <Grid item xs={12}><Typography variant="h5" textAlign="center" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>Why Choose Us?</Typography></Grid>
                    <Grid item xs={12} md={4}><Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}><Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1565c0" }}>Expert Faculty</Typography><Typography variant="body2" color="text.secondary">Learn from industry experts with years of experience</Typography></Paper></Grid>
                    <Grid item xs={12} md={4}><Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}><Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1565c0" }}>100% Placement</Typography><Typography variant="body2" color="text.secondary">Guaranteed placement assistance in top companies</Typography></Paper></Grid>
                    <Grid item xs={12} md={4}><Paper elevation={0} sx={{ p: 4, textAlign: 'center', height: '100%', borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)" }}><Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1565c0" }}>Modern Campus</Typography><Typography variant="body2" color="text.secondary">State-of-the-art facilities and infrastructure</Typography></Paper></Grid>
                </Grid>

                <Box sx={{ mt: 8, py: 4, textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="body2" color="text.secondary">© 2025 Career College. All rights reserved.</Typography>
                </Box>
            </Container>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PublicUnifiedLandingPageds;
