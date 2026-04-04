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
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
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

const PublicUnifiedLandingPageds2 = () => {
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
    const [groupedPrograms, setGroupedPrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [logo, setLogo] = useState("");




    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        stateIso: "",
        stateName: "",
        cityName: "",
        qualification: "",
        category: "",
        programId: "",
        declaration: false
    });

    // Configuration for dropdown menu responsiveness and wrapping
    const menuProps = {
        PaperProps: {
            sx: {
                maxHeight: 400,
                width: { xs: 'calc(100% - 32px)', sm: 'auto' }, // Responsive width
                '& .MuiMenuItem-root': {
                    whiteSpace: 'normal', // This enables the wrapping
                    wordBreak: 'break-word',
                    fontSize: { xs: '0.875rem', md: '1rem' },
                    py: 1.5
                },
            },
        },
    };

    useEffect(() => {
        const encryptedData = searchParams.get('data');
        if (encryptedData) {
            const decrypted = decryptData(encryptedData);
            console.log("Decrypted URL Data:", decrypted);
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
                ep1.get('/api/v2/geteducationqualificationsag1', { params: { colid } })
            ];

            // Only fetch logo from API if not already provided in URL
            if (!existingLogo) {
                promises.push(ep1.get('/api/v2/checkinstitutionsds', { params: { colid } }));
            }

            const results = await Promise.all(promises);
            setQualifications(results[0].data.data || []);

            if (!existingLogo && results[1]?.data.data?.institutions?.[0]) {
                setLogo(results[1].data.data.institutions[0].logo || "");
            }
        } catch (err) {
            console.error("Error fetching initial data:", err);
        }
    };

    const handleStateChange = (stateIso, stateName) => {
        setFormData(prev => ({ ...prev, stateIso, stateName, cityName: "" }));
        setCitiesList(City.getCitiesOfState('IN', stateIso));
    };

    const handleQualificationChange = async (qualification) => {
        setFormData(prev => ({ ...prev, qualification, category: "", programId: "" }));
        setGroupedPrograms([]);

        if (!qualification || !decryptedData?.colid) return;

        setLoadingPrograms(true);
        try {
            const catRes = await ep1.get('/api/v2/getcategoriesbyedqag1', {
                params: { colid: decryptedData.colid, education_qualification: qualification }
            });
            const fetchedCategories = catRes.data.data || [];

            const programFetchPromises = fetchedCategories.map(async (cat) => {
                try {
                    const progRes = await ep1.get('/api/v2/getallprogramcounselords', {
                        params: {
                            colid: decryptedData.colid,
                            category: cat,
                            is_active: 'Yes',
                            education_qualification: qualification
                        }
                    });
                    return { category: cat, programs: progRes.data.data || [] };
                } catch (err) {
                    console.error(`Error fetching programs for category ${cat}:`, err);
                    return { category: cat, programs: [] };
                }
            });

            const results = await Promise.all(programFetchPromises);
            setGroupedPrograms(results.filter(r => r.programs.length > 0));
        } catch (err) {
            console.error("Error fetching grouped programs:", err);
            showSnackbar("Error fetching programs. Please try again.", "error");
        }
        setLoadingPrograms(false);
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
            const rawSource = searchParams.get('source');
            const sourceParam = rawSource ? decodeURIComponent(rawSource) : null;
            const leadSource = sourceParam || landingPage.source || `Unified Landing Page - ${landingPage.page_name}`;

            const allPrograms = groupedPrograms.flatMap(g => g.programs);
            const selectedProg = allPrograms.find(p => p._id === formData.programId);

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
                cityName: "", qualification: "", category: "", programId: "",
                declaration: false
            });
            setCitiesList([]); setGroupedPrograms([]);

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
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b", fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Page Not Found</Typography>
                <Typography variant="body1" color="text.secondary">The landing page you're looking for doesn't exist.</Typography>
            </Container>
        );
    }

    if (!decryptedData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b", fontSize: { xs: '1.5rem', md: '2.125rem' } }}>Invalid Link</Typography>
                <Typography variant="body1" color="text.secondary">This link is invalid or has expired. Please contact support.</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            py: { xs: 2, md: 6 },
            backgroundImage: landingPage.page_content?.image_url ? `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url(${landingPage.page_content.image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            bgcolor: '#f8fafc',
        }}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={{
                    p: { xs: 3, md: 6 },
                    mb: 4,
                    textAlign: 'center',
                    background: landingPage.page_content?.image_url ? 'rgba(30, 41, 59, 0.6)' : '#E31E24',
                    backdropFilter: landingPage.page_content?.image_url ? 'blur(10px)' : 'none',
                    color: 'white',
                    borderRadius: { xs: 2, md: 4 },
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    border: landingPage.page_content?.image_url ? '1px solid rgba(255,255,255,0.1)' : 'none'
                }}>
                    {logo && (
                        <Box sx={{ mb: 3 }}>
                            <img
                                src={logo}
                                alt="University Logo"
                                style={{
                                    height: '80px',
                                    width: 'auto',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                            />
                        </Box>
                    )}
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '3rem' } }}>
                        {landingPage.page_content?.headline || "Welcome"}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, opacity: 0.9, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        {landingPage.page_content?.subheadline || ""}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, maxWidth: 800, mx: "auto", opacity: 0.9, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                        {landingPage.page_content?.description || ""}
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={{
                    p: { xs: 2, sm: 4, md: 6 },
                    borderRadius: { xs: 2, md: 4 },
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    border: "1px solid rgba(0,0,0,0.05)",
                    bgcolor: landingPage.page_content?.image_url ? 'rgba(255, 255, 255, 0.95)' : 'white'
                }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    SelectProps={{ MenuProps: menuProps }}
                                    onChange={(e) => handleStateChange(e.target.value, statesList.find(s => s.isoCode === e.target.value)?.name)}
                                    InputProps={{ startAdornment: <MapIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {statesList.map((state) => (<MenuItem key={state.isoCode} value={state.isoCode}>{state.name}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Select City" required value={formData.cityName} disabled={!formData.stateIso}
                                    SelectProps={{ MenuProps: menuProps }}
                                    onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                                    InputProps={{ startAdornment: <LocationCityIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {citiesList.map((city) => (<MenuItem key={city.name} value={city.name}>{city.name}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Select Level of Programme" required value={formData.qualification}
                                    SelectProps={{ MenuProps: menuProps }}
                                    onChange={(e) => handleQualificationChange(e.target.value)}
                                    InputProps={{ startAdornment: <WorkspacePremiumIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    {qualifications.map((qual, idx) => (<MenuItem key={idx} value={qual}>{qual}</MenuItem>))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                {loadingPrograms ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                        <CircularProgress size={30} />
                                        <Typography sx={{ ml: 2 }}>Loading available programs...</Typography>
                                    </Box>
                                ) : groupedPrograms.length > 0 ? (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}>
                                            Select your desired program
                                        </Typography>
                                        {groupedPrograms.map((group, idx) => (
                                            <Paper key={idx} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }} elevation={0}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#E31E24", mb: 2, display: "flex", alignItems: "center" }}>
                                                    <SchoolIcon sx={{ mr: 1, fontSize: 20 }} /> {group.category}
                                                </Typography>
                                                <RadioGroup
                                                    value={formData.programId}
                                                    onChange={(e) => {
                                                        const progId = e.target.value;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            programId: progId,
                                                            category: group.category
                                                        }));
                                                    }}
                                                >
                                                    <Grid container spacing={1}>
                                                        {group.programs.map((prog) => (
                                                            <Grid item xs={12} sm={6} key={prog._id}>
                                                                <FormControlLabel
                                                                    value={prog._id}
                                                                    control={<Radio sx={{ color: "#E31E24", "&.Mui-checked": { color: "#E31E24" } }} />}
                                                                    label={<Typography sx={{ fontSize: "0.95rem" }}>{prog.course_name}</Typography>}
                                                                    sx={{
                                                                        width: "100%",
                                                                        m: 0,
                                                                        p: 1,
                                                                        borderRadius: 2,
                                                                        transition: "0.2s",
                                                                        "&:hover": { bgcolor: "rgba(227, 30, 36, 0.04)" },
                                                                        ...(formData.programId === prog._id && {
                                                                            bgcolor: "rgba(227, 30, 36, 0.08)",
                                                                            border: "1px solid rgba(227, 30, 36, 0.2)"
                                                                        })
                                                                    }}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                </RadioGroup>
                                            </Paper>
                                        ))}
                                    </Box>
                                ) : formData.qualification && (
                                    <Alert severity="info" sx={{ mt: 2 }}>No programs found for the selected level.</Alert>
                                )}
                            </Grid>



                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Checkbox required checked={formData.declaration} onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })} color="primary" />}
                                    label={<Typography variant="body2" color="text.secondary">I hereby declare that the information provided is true and correct. I agree to receive communications from the institution.</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting || formData.phone.length !== 10}
                                    sx={{ py: 1.5, fontSize: "1.1rem", fontWeight: 700, borderRadius: 2, textTransform: "none", bgcolor: "#E31E24", boxShadow: "0 4px 12px rgba(227, 30, 36, 0.3)", "&:hover": { bgcolor: "#c41a1f" } }}>
                                    {submitting ? <CircularProgress size={24} color="inherit" /> : "Submit Application"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default PublicUnifiedLandingPageds2;