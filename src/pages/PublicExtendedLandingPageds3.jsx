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
    Divider,
    FormControl,
    FormLabel,
} from "@mui/material";
import {
    Phone as PhoneIcon,
    Email as EmailIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    LocationCity as LocationCityIcon,
    Map as MapIcon,
    WorkspacePremium as WorkspacePremiumIcon,
    Wc as GenderIcon,
    SupervisorAccount as GuardianIcon,
} from "@mui/icons-material";
import { useParams, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import { decryptData } from "../utils/encryption";
import { State, City } from "country-state-city";

// Academic Constants
const BOARDS_10TH = ['GSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', 'Others'];
const BOARDS_12TH = ['GSHSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', 'Others'];
const STREAMS_12TH = ['Science', 'Commerce', 'Arts', 'Diploma', 'Other'];
const MEDIUMS_12TH = ['English', 'Gujarati', 'Hindi', 'Other'];
const SCORE_TYPES = ['Percentage', 'CGPA', 'Grade'];
const PASSING_YEARS = Array.from({ length: 25 }, (_, i) => 2026 - i);
const RESULT_STATUSES = ['Declared', 'Awaited'];

const PublicExtendedLandingPageds3 = () => {
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
        gender: "",
        fathername: "",
        fathercontactno: "",
        stateIso: "",
        stateName: "",
        cityName: "",
        qualification: "",
        category: "",
        programId: "",
        // 10th
        board10th: "",
        otherBoard10th: "",
        school10th: "",
        stream10th: "",
        yearofpassing10th: "",
        scoreType10th: "Percentage",
        percentage10th: "",
        // 12th
        resultStatus12th: "Declared",
        board12th: "",
        otherBoard12th: "",
        school12th: "",
        stream12th: "",
        medium12th: "",
        yearofpassing12th: "",
        scoreType12th: "Percentage",
        percentage12th: "",
        // UG
        universityug: "",
        collegeug: "",
        streamug: "",
        resultStatusug: "Declared",
        yearofpassingug: "",
        scoreTypeug: "Percentage",
        cgpaug: "",
        declaration: false
    });

    const menuProps = {
        PaperProps: {
            sx: {
                maxHeight: 400,
                width: { xs: 'calc(100% - 32px)', sm: 'auto' },
                '& .MuiMenuItem-root': {
                    whiteSpace: 'normal',
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
            const res = await ep1.get(`/api/v2/getunifiedlandingpagebyslugds3/${slug}`);
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
            promises.push(ep1.get('/api/v2/checkinstitutionsds', { params: { colid } }));

            const results = await Promise.all(promises);
            setQualifications(results[0].data.data || []);

            if (results[1]?.data.data?.institutions?.[0]) {
                setLogo(results[1].data.data.institutions[0].logo || existingLogo || "");
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
            const leadSource = sourceParam || landingPage.source || `Extended Landing Page - ${landingPage.page_name}`;

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
                ...formData,
                state: formData.stateName,
                city: formData.cityName,
                course_interested: selectedProg?.course_name || "",
                program: selectedProg?.course_name || "",
                program_type: selectedProg?.program_type || "",
                source: leadSource,
                institution: selectedProg?.institution || "",
                colid: decryptedData.colid,
                user: decryptedData.user,
                landing_page_id: landingPage._id,
                landing_page_slug: landingPage.page_slug,
                assignedto: decryptedData.user,
                // Clean academic fields for backend
                percentage10th: formData.scoreType10th === "Percentage" ? formData.percentage10th : `${formData.percentage10th} ${formData.scoreType10th}`,
                percentage12th: formData.resultStatus12th === "Awaited" ? "Awaited" : (formData.scoreType12th === "Percentage" ? formData.percentage12th : `${formData.percentage12th} ${formData.scoreType12th}`),
                cgpaug: formData.resultStatusug === "Awaited" ? "Awaited" : (formData.scoreTypeug === "Percentage" ? formData.cgpaug : `${formData.cgpaug} ${formData.scoreTypeug}`),
            };

            await ep1.post("/api/v2/createleadds", payload);

            showSnackbar("Thank you! We will contact you soon.", "success");
            setFormData({
                name: "", email: "", phone: "", gender: "", fathername: "", fathercontactno: "",
                stateIso: "", stateName: "", cityName: "", qualification: "", category: "", programId: "",
                board10th: "", otherBoard10th: "", school10th: "", stream10th: "", yearofpassing10th: "", scoreType10th: "Percentage", percentage10th: "",
                resultStatus12th: "Declared", board12th: "", otherBoard12th: "", school12th: "", stream12th: "", medium12th: "", yearofpassing12th: "", scoreType12th: "Percentage", percentage12th: "",
                universityug: "", collegeug: "", streamug: "", resultStatusug: "Declared", yearofpassingug: "", scoreTypeug: "Percentage", cgpaug: "",
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

    if (!landingPage || !decryptedData) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: "#1e293b" }}>
                    {!landingPage ? "Page Not Found" : "Invalid Link"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {!landingPage ? "The landing page you're looking for doesn't exist." : "This link is invalid or has expired. Please contact support."}
                </Typography>
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
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {logo && (
                        <Box sx={{ mb: 3 }}>
                            <img src={logo} alt="University Logo" style={{ height: '110px', width: 'auto' }} />
                        </Box>
                    )}
                    <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', md: '3rem' } }}>
                        {landingPage.page_content?.headline || "Welcome"}
                    </Typography>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, opacity: 0.9 }}>
                        {landingPage.page_content?.subheadline || ""}
                    </Typography>
                </Paper>

                <Paper elevation={0} sx={{
                    p: { xs: 2, sm: 4, md: 6 },
                    borderRadius: { xs: 2, md: 4 },
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                    bgcolor: 'rgba(255, 255, 255, 0.95)'
                }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Basic Details Section */}
                            <Grid item xs={12}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>Basic Details</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Name (as per Marksheet)" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    InputProps={{ startAdornment: <PersonIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth select label="Gender" required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    InputProps={{ startAdornment: <GenderIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }}>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Mobile Number" type="tel" required value={formData.phone}
                                    onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 10) setFormData({ ...formData, phone: val }); }}
                                    helperText={formData.phone.length > 0 && formData.phone.length < 10 ? "Must be exactly 10 digits" : ""}
                                    error={formData.phone.length > 0 && formData.phone.length < 10}
                                    InputProps={{ startAdornment: <PhoneIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Email ID" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    InputProps={{ startAdornment: <EmailIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>

                            {/* Guardian Details Section */}
                            <Grid item xs={12} sx={{ mt: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>Guardian Details</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Father's/Guardian's Name" required value={formData.fathername} onChange={(e) => setFormData({ ...formData, fathername: e.target.value })}
                                    InputProps={{ startAdornment: <GuardianIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Father's/Guardian's Contact No" required value={formData.fathercontactno}
                                    onChange={(e) => { const val = e.target.value.replace(/\D/g, ""); if (val.length <= 10) setFormData({ ...formData, fathercontactno: val }); }}
                                    InputProps={{ startAdornment: <PhoneIcon sx={{ color: "#64748b", mr: 1 }} />, sx: { borderRadius: 2 } }} />
                            </Grid>

                            {/* Location Section */}
                            <Grid item xs={12} sx={{ mt: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>Location</Typography>
                                <Divider sx={{ mb: 2 }} />
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

                            {/* Programme Selection Section */}
                            <Grid item xs={12} sx={{ mt: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>Programme Selection</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12}>
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
                                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: "#1e293b", mb: 2 }}>Select your desired program</Typography>
                                        {groupedPrograms.map((group, idx) => (
                                            <Paper key={idx} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }} elevation={0}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#E31E24", mb: 2, display: "flex", alignItems: "center" }}>
                                                    <SchoolIcon sx={{ mr: 1, fontSize: 20 }} /> {group.category}
                                                </Typography>
                                                <RadioGroup value={formData.programId} onChange={(e) => setFormData(prev => ({ ...prev, programId: e.target.value, category: group.category }))}>
                                                    <Grid container spacing={1}>
                                                        {group.programs.map((prog) => (
                                                            <Grid item xs={12} sm={6} key={prog._id}>
                                                                <FormControlLabel value={prog._id} control={<Radio sx={{ color: "#E31E24" }} />} label={prog.course_name} />
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

                            {/* 10th Education Details */}
                            <Grid item xs={12} sx={{ mt: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>10th Education Details</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="10th Board"
                                    value={BOARDS_10TH.includes(formData.board10th) ? formData.board10th : (formData.board10th ? 'Others' : '')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({
                                            ...formData,
                                            board10th: val === 'Others' ? (formData.otherBoard10th || ' ') : val
                                        });
                                    }}
                                    SelectProps={{ MenuProps: menuProps }}
                                    required
                                >
                                    {BOARDS_10TH.map(b => (
                                        <MenuItem key={b} value={b}>{b}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            {(!BOARDS_10TH.includes(formData.board10th) || formData.board10th === 'Others') && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Mention 10th Board"
                                        value={formData.otherBoard10th}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            board10th: e.target.value || ' ',
                                            otherBoard10th: e.target.value
                                        })}
                                        required
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField fullWidth label="School Name" required value={formData.school10th} onChange={(e) => setFormData({ ...formData, school10th: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Year of Passing"
                                    value={formData.yearofpassing10th}
                                    onChange={(e) => setFormData({ ...formData, yearofpassing10th: e.target.value })}
                                    SelectProps={{ MenuProps: menuProps }}
                                    required
                                >
                                    {PASSING_YEARS.map(year => (
                                        <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Score Type"
                                    value={formData.scoreType10th}
                                    onChange={(e) => setFormData({ ...formData, scoreType10th: e.target.value })}
                                    required
                                >
                                    {SCORE_TYPES.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                                <TextField
                                    fullWidth
                                    label={formData.scoreType10th === "CGPA" ? "CGPA" : "Percentage / Grade"}
                                    value={formData.percentage10th}
                                    onChange={(e) => setFormData({ ...formData, percentage10th: e.target.value })}
                                    required
                                />
                            </Grid>

                            {/* 12th Education Details */}
                            <Grid item xs={12} sx={{ mt: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>12th Education Details</Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">12th/HSC Result Status *</FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.resultStatus12th}
                                        onChange={(e) => setFormData({ ...formData, resultStatus12th: e.target.value })}
                                    >
                                        {RESULT_STATUSES.map(status => (
                                            <FormControlLabel key={status} value={status} control={<Radio />} label={status} />
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="12th Stream"
                                    value={formData.stream12th}
                                    onChange={(e) => setFormData({ ...formData, stream12th: e.target.value })}
                                    required
                                >
                                    {STREAMS_12TH.map(s => (
                                        <MenuItem key={s} value={s}>{s}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="12th Board"
                                    value={BOARDS_12TH.includes(formData.board12th) ? formData.board12th : (formData.board12th ? 'Others' : '')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({
                                            ...formData,
                                            board12th: val === 'Others' ? (formData.otherBoard12th || ' ') : val
                                        });
                                    }}
                                    SelectProps={{ MenuProps: menuProps }}
                                    required
                                >
                                    {BOARDS_12TH.map(b => (
                                        <MenuItem key={b} value={b}>{b}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            {(!BOARDS_12TH.includes(formData.board12th) || formData.board12th === 'Others') && (
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Mention 12th Board"
                                        value={formData.otherBoard12th}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            board12th: e.target.value || ' ',
                                            otherBoard12th: e.target.value
                                        })}
                                        required
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField fullWidth label="School/College Name" required value={formData.school12th} onChange={(e) => setFormData({ ...formData, school12th: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="12th Medium"
                                    value={formData.medium12th}
                                    onChange={(e) => setFormData({ ...formData, medium12th: e.target.value })}
                                    required
                                >
                                    {MEDIUMS_12TH.map(m => (
                                        <MenuItem key={m} value={m}>{m}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {formData.resultStatus12th === "Declared" && (
                                <>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="12th Year of Passing"
                                            value={formData.yearofpassing12th}
                                            onChange={(e) => setFormData({ ...formData, yearofpassing12th: e.target.value })}
                                            SelectProps={{ MenuProps: menuProps }}
                                            required
                                        >
                                            {PASSING_YEARS.map(year => (
                                                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Score Type"
                                            value={formData.scoreType12th}
                                            onChange={(e) => setFormData({ ...formData, scoreType12th: e.target.value })}
                                            required
                                        >
                                            {SCORE_TYPES.map(type => (
                                                <MenuItem key={type} value={type}>{type}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField
                                            fullWidth
                                            label={formData.scoreType12th === "CGPA" ? "CGPA" : "Percentage / Grade"}
                                            value={formData.percentage12th}
                                            onChange={(e) => setFormData({ ...formData, percentage12th: e.target.value })}
                                            required
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Graduation Details - Conditional for PG/Doctoral */}
                            {["Postgraduate", "PG", "Post Graduate", "DOCTORAL", "Ph.D", "Doctoral"].includes(formData.qualification) && (
                                <>
                                    <Grid item xs={12} sx={{ mt: 3 }}>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1e293b" }}>Graduation Details</Typography>
                                        <Divider sx={{ mb: 2 }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend">Graduation Result Status *</FormLabel>
                                            <RadioGroup
                                                row
                                                value={formData.resultStatusug}
                                                onChange={(e) => setFormData({ ...formData, resultStatusug: e.target.value })}
                                            >
                                                {RESULT_STATUSES.map(status => (
                                                    <FormControlLabel key={status} value={status} control={<Radio />} label={status} />
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Graduation Programme/Degree" required value={formData.streamug} onChange={(e) => setFormData({ ...formData, streamug: e.target.value })} placeholder="B.Tech, B.Com, etc." />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField fullWidth label="University" required value={formData.universityug} onChange={(e) => setFormData({ ...formData, universityug: e.target.value })} />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField fullWidth label="College Name" required value={formData.collegeug} onChange={(e) => setFormData({ ...formData, collegeug: e.target.value })} />
                                    </Grid>
                                    {formData.resultStatusug === "Declared" && (
                                        <>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Year of Passing"
                                                    value={formData.yearofpassingug}
                                                    onChange={(e) => setFormData({ ...formData, yearofpassingug: e.target.value })}
                                                    SelectProps={{ MenuProps: menuProps }}
                                                    required
                                                >
                                                    {PASSING_YEARS.map(year => (
                                                        <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={6}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Score Type"
                                                    value={formData.scoreTypeug}
                                                    onChange={(e) => setFormData({ ...formData, scoreTypeug: e.target.value })}
                                                    required
                                                >
                                                    {SCORE_TYPES.map(type => (
                                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                                    ))}
                                                </TextField>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={6}>
                                                <TextField
                                                    fullWidth
                                                    label={formData.scoreTypeug === "CGPA" ? "CGPA" : "Percentage / Grade"}
                                                    value={formData.cgpaug}
                                                    onChange={(e) => setFormData({ ...formData, cgpaug: e.target.value })}
                                                    required
                                                />
                                            </Grid>
                                        </>
                                    )}
                                </>
                            )}

                            <Grid item xs={12} sx={{ mt: 4 }}>
                                <FormControlLabel
                                    control={<Checkbox required checked={formData.declaration} onChange={(e) => setFormData({ ...formData, declaration: e.target.checked })} color="primary" />}
                                    label={<Typography variant="body2" color="text.secondary">I hereby declare that the information provided is true and correct. I agree to receive communications from the institution.</Typography>}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting || formData.phone.length !== 10}
                                    sx={{ py: 2, fontSize: "1.1rem", fontWeight: 700, borderRadius: 2, textTransform: "none", bgcolor: "#E31E24", "&:hover": { bgcolor: "#c41a1f" } }}>
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

export default PublicExtendedLandingPageds3;
