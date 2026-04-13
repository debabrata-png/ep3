import React, { useState, useEffect } from "react";
import {
    Container, Box, Typography, TextField, Button, Paper, Grid,
    Stepper, Step, StepLabel, MenuItem, FormControl, InputLabel,
    Select, IconButton, Divider, CircularProgress, Alert, Snackbar,
    FormControlLabel, Checkbox, Radio, RadioGroup, FormLabel
} from "@mui/material";
import {
    CloudUpload as CloudUploadIcon,
    NavigateNext as NextIcon,
    NavigateBefore as BeforeIcon,
    CheckCircle as CheckCircleIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    HistoryEdu as HistoryEduIcon,
    Description as DescriptionIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    School as SchoolIcon
} from "@mui/icons-material";
import { useParams, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import { Country, State, City } from "country-state-city";

const steps = ["Registration", "Personal details", "Academic Qualification & Documents", "Application fee", "Provisional fee", "SOP"];

const AdmissionForm = () => {
    const { colid } = useParams();
    const [searchParams] = useSearchParams();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const [isLoginView, setIsLoginView] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [gateways, setGateways] = useState([]);
    const [selectedGatewayId, setSelectedGatewayId] = useState("");
    const [applicationFee, setApplicationFee] = useState(null);
    const [provisionalFee, setProvisionalFee] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    // Address Dropdown States
    const [countries] = useState(Country.getAllCountries());
    const [pStates, setPStates] = useState([]);
    const [pCities, setPCities] = useState([]);
    const [cStates, setCStates] = useState([]);
    const [cCities, setCCities] = useState([]);

    // Step 0: Registration Data
    const [qualifications, setQualifications] = useState([]);
    const [categories, setCategories] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [groupedPrograms, setGroupedPrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(false);
    const [institutionLogo, setInstitutionLogo] = useState("");

    const [formData, setFormData] = useState({
        // Step 0
        fullName: "",
        mobileNo: "",
        email: "",
        academicYear: "2026-27",
        programLevel: "",
        school: "",
        program: "",
        programId: "",
        password: "",
        colid: colid || searchParams.get("colid") || "1",

        // Step 1
        dob: "",
        gender: "",
        nationality: "Indian",
        nationalityOther: "",
        category: "",
        aadharNumber: "",
        isMinority: "No",
        isPhysicallyChallenged: "No",
        whatsAppNumber: "",
        religion: "",
        isHostelRequired: "No",
        fatherName: "",
        fatherEmail: "",
        fatherMobile: "",
        fatherOccupation: "",
        motherName: "",
        motherEmail: "",
        motherMobile: "",
        motherOccupation: "",
        guardianName: "",
        guardianEmail: "",
        guardianMobile: "",
        guardianOccupation: "",
        familyIncome: "Below 5L",
        applyForScholarship: "No",
        permanentAddress: {
            addressLine1: "",
            country: "India",
            countryIso: "IN",
            state: "",
            stateIso: "",
            district: "",
            city: "",
            pincode: "",
            nationality: "Indian"
        },
        isCorrespondenceSameAsPermanent: true,
        correspondenceAddress: {
            addressLine1: "",
            country: "India",
            countryIso: "IN",
            state: "",
            stateIso: "",
            district: "",
            city: "",
            pincode: "",
            nationality: "Indian"
        },

        // Step 2
        sscDetails: {
            schoolName: "",
            board: "",
            passingYear: "",
            scoreType: "Percentage",
            scoreValue: ""
        },
        hscDetails: {
            stream: "",
            board: "",
            medium: "",
            schoolName: "",
            passingYear: "",
            scoreType: "Percentage",
            scoreValue: "",
            isFromGujarat: "No"
        },
        graduationDetails: {
            programme: "",
            specialisation: "",
            university: "",
            college: "",
            resultStatus: "Declared"
        },
        achievements: "",
        extraCurricular: "",
        documents: {
            studentPhoto: "",
            marksheet10: "",
            marksheet12: "",
            leavingCertificate: "",
            migrationCertificate: "",
            casteCertificate: "",
            aadharFront: "",
            aadharBack: "",
            gradSem1: "",
            gradSem2: "",
            gradSem3: "",
            gradSem4: "",
            gradSem5: "",
            entranceExamResult: "",
            ddcetCertificate: ""
        },

        // Step 5 (Mapped to index 5 in steps array)
        sop: "",
        entranceExamDetails: "",
        sourceOfInformation: "Website",

        // Payment Details
        applicationFeeStatus: "Unpaid",
        provisionalFeeStatus: "Unpaid",
        applicationFeeTxnId: "",
        provisionalFeeTxnId: ""
    });

    useEffect(() => {
        const colid = formData.colid;
        fetchQualifications(colid);
        fetchInstitutionInfo(colid);
        fetchGateways(colid);
        
        // Handle Payment Callback
        const paymentSuccess = searchParams.get("paymentSuccess");
        const feeType = searchParams.get("feeType");
        const txnId = searchParams.get("txnId");
        const appId = searchParams.get("appId");

        if (paymentSuccess === "true" && appId) {
            setApplicationId(appId);
            handlePaymentReturn(appId, feeType, txnId);
        }

        // Initialize states for India (default)
        setPStates(State.getStatesOfCountry("IN"));
        setCStates(State.getStatesOfCountry("IN"));

        // Auto-resume if appId in localStorage
        const savedAppId = localStorage.getItem("admission_app_id");
        if (savedAppId && !paymentSuccess) {
            resumeApplication(savedAppId);
        }
    }, []);

    const resumeApplication = async (appId) => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/admission/get/${appId}`);
            if (res.data.success) {
                const app = res.data.data;
                setApplicationId(appId);
                setFormData(prev => ({ ...prev, ...app }));
                setActiveStep(app.currentStep || 1);
            }
        } catch (err) {
            console.error("Error resuming application:", err);
            localStorage.removeItem("admission_app_id");
        }
        setLoading(false);
    };

    // Fetch Fees when program or category changes
    useEffect(() => {
        if (formData.program && formData.colid) {
            fetchFees();
        }
    }, [formData.program, formData.category, formData.academicYear]);

    const handlePaymentReturn = async (appId, feeType, txnId) => {
        setLoading(true);
        try {
            // Fetch application data first to be sure
            const res = await ep1.get(`/api/v2/admission/application/${appId}`);
            const app = res.data.data;
            setFormData(prev => ({ ...prev, ...app }));
            
            let updates = {};
            let nextStep = 0;
            if (feeType === "application") {
                updates = { applicationFeeStatus: "Paid", applicationFeeTxnId: txnId, currentStep: 4 };
                nextStep = 4;
            } else if (feeType === "provisional") {
                updates = { provisionalFeeStatus: "Paid", provisionalFeeTxnId: txnId, currentStep: 5 };
                nextStep = 5;
            }

            if (Object.keys(updates).length > 0) {
                await ep1.post(`/api/v2/admission/update/${appId}`, updates);
                setFormData(prev => ({ ...prev, ...updates }));
                setActiveStep(nextStep);
                showSnackbar(`Payment successful! Moved to next step.`, `success`);
            }
        } catch (err) {
            console.error("Error handling payment return:", err);
            showSnackbar("Error processing payment status", "error");
        }
        setLoading(false);
    };

    const fetchGateways = async (colid) => {
        try {
            const res = await ep1.post('/api/v2/pgmasterds/getall', { colid: Number(colid) });
            if (res.data.success) {
                setGateways(res.data.data.filter(g => g.isactive));
            }
        } catch (err) {
            console.error("Error fetching gateways:", err);
        }
    };

    const fetchFees = async () => {
        try {
            // Fetch Application Fee
            const appFeeRes = await ep1.post('/api/v2/getfeeapplicationds', { 
                colid: formData.colid 
            });
            if (appFeeRes.data.success) {
                const fees = appFeeRes.data.data;
                const match = fees.find(f => 
                    f.programcode === formData.program && 
                    f.academicyear === formData.academicYear &&
                    f.status === "Active"
                );
                setApplicationFee(match || null);
            }

            // Fetch Provisional Fee
            const provFeeRes = await ep1.post('/api/v2/getfeesprovds', { 
                colid: formData.colid 
            });
            if (provFeeRes.data.success) {
                const fees = provFeeRes.data.data;
                const match = fees.find(f => 
                    f.programcode === formData.program && 
                    f.academicyear === formData.academicYear &&
                    f.status === "Active"
                );
                setProvisionalFee(match || null);
            }
        } catch (err) {
            console.error("Error fetching fees:", err);
        }
    };

    const fetchInstitutionInfo = async (colid) => {
        try {
            const res = await ep1.get('/api/v2/checkinstitutionsds', { 
                params: { colid: Number(colid) } 
            });
            if (res.data.data?.institutions?.[0]) {
                const logo = res.data.data.institutions[0].logo || "";
                console.log("Fetched Logo:", logo);
                setInstitutionLogo(logo);
            }
        } catch (err) {
            console.error("Error fetching institution info:", err);
        }
    };

    const fetchQualifications = async (colid) => {
        try {
            const res = await ep1.get('/api/v2/geteducationqualificationsag1', { params: { colid } });
            setQualifications(res.data.data || []);
        } catch (err) {
            console.error("Error fetching qualifications:", err);
        }
    };

    const onAddressChange = (type, field, value) => {
        const isPerm = type === 'permanent';
        const currentAddr = isPerm ? formData.permanentAddress : formData.correspondenceAddress;
        let updatedAddr = { ...currentAddr, [field]: value };

        // Handle cascading logic separately
        if (field === 'countryIso') {
            const countryName = Country.getCountryByCode(value)?.name || "";
            const states = State.getStatesOfCountry(value);
            updatedAddr = { ...updatedAddr, nationality: countryName, country: countryName, state: "", stateIso: "", city: "" };
            if (isPerm) { setPStates(states); setPCities([]); } else { setCStates(states); setCCities([]); }
            if (isPerm && formData.isCorrespondenceSameAsPermanent) { setCStates(states); setCCities([]); }
        } else if (field === 'stateIso') {
            const stateObj = State.getStateByCodeAndCountry(value, currentAddr.countryIso);
            const stateName = stateObj?.name || "";
            const cities = City.getCitiesOfState(currentAddr.countryIso, value);
            updatedAddr = { ...updatedAddr, state: stateName, city: "" };
            if (isPerm) { setPCities(cities); } else { setCCities(cities); }
            if (isPerm && formData.isCorrespondenceSameAsPermanent) { setCCities(cities); }
        }

        setFormData(prev => {
            const newFormData = { ...prev, [isPerm ? 'permanentAddress' : 'correspondenceAddress']: updatedAddr };
            if (isPerm && prev.isCorrespondenceSameAsPermanent) {
                newFormData.correspondenceAddress = { ...updatedAddr };
            }
            return newFormData;
        });
    };

    const handleQualificationChange = async (qualification) => {
        setFormData(prev => ({ ...prev, programLevel: qualification, school: "", program: "", programId: "" }));
        setGroupedPrograms([]);
        setLoadingPrograms(true);

        try {
            const catRes = await ep1.get('/api/v2/getcategoriesbyedqag1', {
                params: { colid: formData.colid, education_qualification: qualification }
            });
            const fetchedCategories = catRes.data.data || [];

            const programFetchPromises = fetchedCategories.map(async (cat) => {
                try {
                    const progRes = await ep1.get('/api/v2/getallprogramcounselords', {
                        params: {
                            colid: formData.colid,
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

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            showSnackbar("Please enter both email and password", "warning");
            return;
        }
        setSubmitting(true);
        try {
            const res = await ep1.post("/api/v2/admission/login", {
                email: formData.email,
                password: formData.password
            });
            const app = res.data.data;
            setApplicationId(app._id);
            setFormData({ ...formData, ...app });
            setActiveStep(app.currentStep || 1);
            showSnackbar("Application resumed successfully!");
        } catch (err) {
            showSnackbar(err.response?.data?.message || "Login failed", "error");
        }
        setSubmitting(false);
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleInitiatePayment = async (feeType) => {
        if (!selectedGatewayId) {
            showSnackbar("Please select a payment gateway", "warning");
            return;
        }

        const selectedGateway = gateways.find(g => g._id === selectedGatewayId);
        if (!selectedGateway || !selectedGateway.api) {
            showSnackbar("Invalid gateway configuration", "error");
            return;
        }

        const fee = feeType === "application" ? applicationFee : provisionalFee;
        if (!fee) {
            showSnackbar("Fee details not found for this program", "error");
            return;
        }

        setPaymentProcessing(true);
        try {
            const payload = {
                studentname: formData.fullName,
                regno: applicationId, // Using application ID as registration number for tracking
                amount: fee.amount.toString(),
                email: formData.email,
                phone: formData.mobileNo,
                paymentpurpose: `${feeType === "application" ? "Application" : "Provisional"} Fee for ${formData.program}`,
                colid: formData.colid,
                gatewayname: selectedGateway.gatwayname,
                accountno: selectedGateway.accountno,
                paymenttype: feeType.toUpperCase(),
                user: formData.email,
                frontendcallbackurl: window.location.origin + window.location.pathname + `?paymentSuccess=true&feeType=${feeType}&appId=${applicationId}`
            };

            const response = await ep1.post(selectedGateway.api, payload);

            if (response.data.success && response.data.data.paymenturl) {
                window.location.href = response.data.data.paymenturl;
            } else {
                throw new Error(response.data.message || "Failed to get payment URL");
            }
        } catch (err) {
            console.error("Payment initiation error:", err);
            showSnackbar(err.response?.data?.message || err.message, "error");
        } finally {
            setPaymentProcessing(false);
        }
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            // Login Mode handling
            if (isLoginView) {
                await handleLogin();
                return;
            }
            // Registration Mode handling
            if (!formData.fullName || !formData.email || !formData.password || !formData.program) {
                showSnackbar("Please fill all required fields", "warning");
                return;
            }
            setSubmitting(true);
            try {
                console.log("Registering Application Payload:", formData);
                const res = await ep1.post("/api/v2/admission/register", formData);
                const newAppId = res.data.data._id;
                setApplicationId(newAppId);
                localStorage.setItem("admission_app_id", newAppId);
                setActiveStep(1);
                showSnackbar("Registration successful!");
            } catch (err) {
                showSnackbar(err.response?.data?.message || "Registration failed", "error");
            }
        } else {
            // Incremental Update
            setSubmitting(true);
            try {
                await ep1.post(`/api/v2/admission/update/${applicationId}`, {
                    ...formData,
                    currentStep: activeStep + 1
                });
                setActiveStep((prev) => prev + 1);
            } catch (err) {
                showSnackbar("Failed to save progress", "error");
            }
        }
        setSubmitting(false);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const renderStep0 = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{isLoginView ? "Resume Application" : "Basic Registration"}</Typography>
                <Button 
                    variant="text" 
                    onClick={() => setIsLoginView(!isLoginView)}
                    sx={{ textTransform: 'none' }}
                >
                    {isLoginView ? "New Applicant? Register Here" : "Already applied? Login to Resume"}
                </Button>
            </Grid>
            {!isLoginView && (
                <>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Full Name (As per SSC/HSC)"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Mobile Number"
                            value={formData.mobileNo}
                            onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value })}
                            required
                        />
                    </Grid>
                </>
            )}
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Email ID"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
            </Grid>
            {!isLoginView && (
                <>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Academic Year"
                            value={formData.academicYear}
                            onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                        >
                            <MenuItem value="2026-27">2026-27</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Level of Program"
                            value={formData.programLevel}
                            onChange={(e) => handleQualificationChange(e.target.value)}
                        >
                            {qualifications.map((q) => (
                                <MenuItem key={q} value={q}>{q}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    
                    <Grid item xs={12}>
                        {loadingPrograms ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                <CircularProgress size={30} />
                                <Typography sx={{ ml: 2 }}>Loading available programs...</Typography>
                            </Box>
                        ) : groupedPrograms.length > 0 ? (
                            <Box sx={{ mt: 1 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                                    Select your desired program
                                </Typography>
                                {groupedPrograms.map((group, idx) => (
                                    <Paper key={idx} sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid #e2e8f0" }} elevation={0}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#E31E24", mb: 1.5, display: "flex", alignItems: "center" }}>
                                            <SchoolIcon sx={{ mr: 1, fontSize: 18 }} /> {group.category}
                                        </Typography>
                                        <RadioGroup
                                            value={formData.programId}
                                            onChange={(e) => {
                                                const progId = e.target.value;
                                                const selectedProg = group.programs.find(p => p._id === progId);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    programId: progId,
                                                    program: selectedProg?.course_name || "",
                                                    school: group.category
                                                }));
                                            }}
                                        >
                                            <Grid container spacing={1}>
                                                {group.programs.map((prog) => (
                                                    <Grid item xs={12} sm={6} key={prog._id}>
                                                        <FormControlLabel
                                                            value={prog._id}
                                                            control={<Radio size="small" sx={{ color: "#E31E24", "&.Mui-checked": { color: "#E31E24" } }} />}
                                                            label={<Typography sx={{ fontSize: "0.875rem" }}>{prog.course_name}</Typography>}
                                                            sx={{
                                                                width: "100%",
                                                                m: 0,
                                                                p: 0.5,
                                                                borderRadius: 1,
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
                        ) : formData.programLevel && (
                            <Alert severity="info">No programs found for the selected level.</Alert>
                        )}
                    </Grid>
                </>
            )}
        </Grid>
    );

    const renderStep1 = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6">Applicant Details</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="Gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="Category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                    {['EWS', 'OBC', 'GENERAL', 'SBC', 'SC', 'ST'].map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="Nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    required
                >
                    <MenuItem value="Indian">Indian</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="Religion"
                    value={formData.religion}
                    onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                    required
                >
                    <MenuItem value="Hindu">Hindu</MenuItem>
                    <MenuItem value="Muslim">Muslim</MenuItem>
                    <MenuItem value="Sikh">Sikh</MenuItem>
                    <MenuItem value="Christian">Christian</MenuItem>
                    <MenuItem value="Jain">Jain</MenuItem>
                    <MenuItem value="Buddhist">Buddhist</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="Physically Challenged"
                    value={formData.isPhysicallyChallenged}
                    onChange={(e) => setFormData({ ...formData, isPhysicallyChallenged: e.target.value })}
                    required
                >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="Family Income"
                    value={formData.familyIncome}
                    onChange={(e) => setFormData({ ...formData, familyIncome: e.target.value })}
                    required
                >
                    <MenuItem value="Below 5L">Below 5L</MenuItem>
                    <MenuItem value="5-10L">5-10L</MenuItem>
                    <MenuItem value="Above 10L">Above 10L</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Aadhar Number"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    required
                    inputProps={{ maxLength: 12 }}
                    placeholder="12-digit number"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="WhatsApp Number"
                    value={formData.whatsAppNumber}
                    onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                    inputProps={{ maxLength: 10 }}
                    placeholder="10-digit number"
                />
            </Grid>
            
            <Grid item xs={12}>
                <Divider><Typography variant="body2" color="textSecondary">Parent/Guardian Details</Typography></Divider>
            </Grid>
            
            {/* Father/Guardian Details */}
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Father's/Guardian's Name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    required
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Father's/Guardian's Email"
                    value={formData.fatherEmail}
                    onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })}
                    required
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Father's/Guardian's Mobile"
                    value={formData.fatherMobile}
                    onChange={(e) => setFormData({ ...formData, fatherMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                    inputProps={{ maxLength: 10 }}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    select
                    fullWidth
                    label="Father's/Guardian's Profession"
                    value={formData.fatherProfession || ""}
                    onChange={(e) => setFormData({ ...formData, fatherProfession: e.target.value })}
                    required
                >
                    {['Service', 'Business', 'Professional', 'Retired', 'Other'].map(p => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* Mother Details */}
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Mother's Name"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Mother's Email"
                    value={formData.motherEmail}
                    onChange={(e) => setFormData({ ...formData, motherEmail: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Mother's Mobile"
                    value={formData.motherMobile}
                    onChange={(e) => setFormData({ ...formData, motherMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    inputProps={{ maxLength: 10 }}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    select
                    fullWidth
                    label="Mother's Profession"
                    value={formData.motherProfession || ""}
                    onChange={(e) => setFormData({ ...formData, motherProfession: e.target.value, motherOccupation: e.target.value })}
                >
                    {['Service', 'Business', 'Professional', 'Homemaker', 'Retired', 'Other'].map(p => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            
            <Grid item xs={12}>
                <Divider><Typography variant="body2" color="textSecondary">Permanent Address Details</Typography></Divider>
            </Grid>
            <Grid item xs={12} md={12}>
                <TextField
                    fullWidth
                    label="Address Line 1"
                    value={formData.permanentAddress.addressLine1}
                    onChange={(e) => onAddressChange('permanent', 'addressLine1', e.target.value)}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    select
                    fullWidth
                    label="Nationality/Country"
                    value={formData.permanentAddress.countryIso}
                    onChange={(e) => onAddressChange('permanent', 'countryIso', e.target.value)}
                >
                    {countries.map((c) => (
                        <MenuItem key={c.isoCode} value={c.isoCode}>{c.name}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    select
                    fullWidth
                    label="State"
                    value={formData.permanentAddress.stateIso}
                    onChange={(e) => onAddressChange('permanent', 'stateIso', e.target.value)}
                    disabled={!formData.permanentAddress.countryIso}
                >
                    {pStates.map((s) => (
                        <MenuItem key={s.isoCode} value={s.isoCode}>{s.name}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    select
                    fullWidth
                    label="District"
                    value={formData.permanentAddress.district}
                    onChange={(e) => onAddressChange('permanent', 'district', e.target.value)}
                    disabled={!formData.permanentAddress.stateIso}
                    required
                >
                    {pCities.map((c) => (
                        <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="City/Town"
                    value={formData.permanentAddress.city}
                    onChange={(e) => onAddressChange('permanent', 'city', e.target.value)}
                    required
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Pincode"
                    value={formData.permanentAddress.pincode}
                    onChange={(e) => onAddressChange('permanent', 'pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    inputProps={{ maxLength: 6 }}
                />
            </Grid>

            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={formData.isCorrespondenceSameAsPermanent}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                    ...prev,
                                    isCorrespondenceSameAsPermanent: checked,
                                    correspondenceAddress: checked ? { ...prev.permanentAddress } : prev.correspondenceAddress
                                }));
                                if (checked) {
                                    setCStates(pStates);
                                    setCCities(pCities);
                                }
                            }}
                        />
                    }
                    label="Correspondence Address is same as Permanent Address"
                />
            </Grid>

            {!formData.isCorrespondenceSameAsPermanent && (
                <>
                    <Grid item xs={12}>
                        <Divider><Typography variant="body2" color="textSecondary">Correspondence Address Details</Typography></Divider>
                    </Grid>
                    <Grid item xs={12} md={12}>
                        <TextField
                            fullWidth
                            label="Address Line 1"
                            value={formData.correspondenceAddress.addressLine1}
                            onChange={(e) => onAddressChange('correspondence', 'addressLine1', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="Nationality/Country"
                            value={formData.correspondenceAddress.countryIso}
                            onChange={(e) => onAddressChange('correspondence', 'countryIso', e.target.value)}
                        >
                            {countries.map((c) => (
                                <MenuItem key={c.isoCode} value={c.isoCode}>{c.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="State"
                            value={formData.correspondenceAddress.stateIso}
                            onChange={(e) => onAddressChange('correspondence', 'stateIso', e.target.value)}
                            disabled={!formData.correspondenceAddress.countryIso}
                        >
                            {cStates.map((s) => (
                                <MenuItem key={s.isoCode} value={s.isoCode}>{s.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="District"
                            value={formData.correspondenceAddress.district}
                            onChange={(e) => onAddressChange('correspondence', 'district', e.target.value)}
                            disabled={!formData.correspondenceAddress.stateIso}
                            required
                        >
                            {cCities.map((c) => (
                                <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            fullWidth
                            label="City/Town"
                            value={formData.correspondenceAddress.city}
                            onChange={(e) => onAddressChange('correspondence', 'city', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            fullWidth
                            label="Pincode"
                            value={formData.correspondenceAddress.pincode}
                            onChange={(e) => onAddressChange('correspondence', 'pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            inputProps={{ maxLength: 6 }}
                        />
                    </Grid>
                </>
            )}
        </Grid>
    );

    const renderStep2 = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6">Academic Qualification</Typography>
            </Grid>
            <Grid item xs={12}>
                <Alert severity="info">
                    Applying for: <strong>{formData.program}</strong> ({formData.school})
                </Alert>
            </Grid>
            
            {/* SSC Details */}
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="10th School Name"
                    value={formData.sscDetails.schoolName}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, schoolName: e.target.value } 
                    })}
                    required
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="10th Board"
                    value={formData.sscDetails.board}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, board: e.target.value } 
                    })}
                    required
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="10th Year of Passing"
                    value={formData.sscDetails.passingYear}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, passingYear: e.target.value } 
                    })}
                    required
                >
                    {Array.from({ length: 20 }, (_, i) => 2026 - i).map(year => (
                        <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    select
                    fullWidth
                    label="10th Score Type"
                    value={formData.sscDetails.scoreType}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, scoreType: e.target.value } 
                    })}
                    required
                >
                    <MenuItem value="Percentage">Percentage</MenuItem>
                    <MenuItem value="CGPA">CGPA</MenuItem>
                    <MenuItem value="Grade">Grade</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="10th Score Value"
                    value={formData.sscDetails.scoreValue}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, scoreValue: e.target.value } 
                    })}
                    required
                    placeholder="Enter Percentage/CGPA"
                />
            </Grid>

            {/* HSC Details Questions */}
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>12th/HSC Details & Additional Questions</Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">What is the status of your 12th/HSC result? *</FormLabel>
                    <RadioGroup
                        row
                        value={formData.hscDetails.resultStatus || "Declared"}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            hscDetails: { ...formData.hscDetails, resultStatus: e.target.value } 
                        })}
                    >
                        <FormControlLabel value="Declared" control={<Radio />} label="Declared" />
                        <FormControlLabel value="Awaited" control={<Radio />} label="Awaited" />
                    </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">Have you completed 10th and 12th from Gujarat State? *</FormLabel>
                    <RadioGroup
                        row
                        value={formData.hscDetails.isFromGujarat}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            hscDetails: { ...formData.hscDetails, isFromGujarat: e.target.value } 
                        })}
                    >
                        <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                        <FormControlLabel value="No" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl>
            </Grid>

            {/* Conditional 12th Details */}
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="12th Stream"
                    value={formData.hscDetails.stream}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        hscDetails: { ...formData.hscDetails, stream: e.target.value } 
                    })}
                    required
                >
                    {['Science', 'Commerce', 'Arts', 'Diploma', 'Other'].map(s => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    select
                    fullWidth
                    label="12th Medium"
                    value={formData.hscDetails.medium}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        hscDetails: { ...formData.hscDetails, medium: e.target.value } 
                    })}
                    required
                >
                    <MenuItem value="English">English</MenuItem>
                    <MenuItem value="Gujarati">Gujarati</MenuItem>
                    <MenuItem value="Hindi">Hindi</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="12th School/College Name"
                    value={formData.hscDetails.schoolName}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        hscDetails: { ...formData.hscDetails, schoolName: e.target.value } 
                    })}
                    required
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    select
                    fullWidth
                    label="12th Board"
                    value={formData.hscDetails.board}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        hscDetails: { ...formData.hscDetails, board: e.target.value } 
                    })}
                    required
                >
                    {['GSHSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', 'Other'].map(b => (
                        <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            {formData.hscDetails.resultStatus === "Declared" && (
                <>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="12th Year of Passing"
                            value={formData.hscDetails.passingYear}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                hscDetails: { ...formData.hscDetails, passingYear: e.target.value } 
                            })}
                            required
                        >
                            {Array.from({ length: 20 }, (_, i) => 2026 - i).map(year => (
                                <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            select
                            fullWidth
                            label="12th Score Type"
                            value={formData.hscDetails.scoreType}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                hscDetails: { ...formData.hscDetails, scoreType: e.target.value } 
                            })}
                            required
                        >
                            <MenuItem value="Percentage">Percentage</MenuItem>
                            <MenuItem value="CGPA">CGPA</MenuItem>
                            <MenuItem value="Grade">Grade</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="12th Score Value"
                            value={formData.hscDetails.scoreValue}
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                hscDetails: { ...formData.hscDetails, scoreValue: e.target.value } 
                            })}
                            required
                        />
                    </Grid>
                </>
            )}

            {/* B.Tech Specific Details */}
            {formData.programLevel === "Undergraduate" && formData.program.includes("B.Tech") && (
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Entrance Exam Details (JEE/GUJCET etc.) - Please mention Score/Rank"
                        value={formData.entranceExamDetails || ""}
                        onChange={(e) => setFormData({ ...formData, entranceExamDetails: e.target.value })}
                        required
                    />
                </Grid>
            )}

            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="12th Board"
                    value={formData.hscDetails.board}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        hscDetails: { ...formData.hscDetails, board: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="12th Year"
                    value={formData.hscDetails.passingYear}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        hscDetails: { ...formData.hscDetails, passingYear: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="12th Percentage/CGPA"
                    value={formData.hscDetails.scoreValue}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        hscDetails: { ...formData.hscDetails, scoreValue: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

            <Grid item xs={12}>
                <Typography variant="h6">Documents Upload (Links)</Typography>
                <Typography variant="caption" color="textSecondary">Provide links for your documents (e.g., from Google Drive, Dropbox, etc.)</Typography>
            </Grid>
            {[
                { key: 'studentPhoto', label: 'STUDENT PHOTO' },
                { key: 'marksheet10', label: '10th MARKSHEET' },
                { key: 'marksheet12', label: '12th MARKSHEET' },
                { key: 'aadharFront', label: 'AADHAR FRONT' },
                { key: 'aadharBack', label: 'AADHAR BACK' },
                { key: 'leavingCertificate', label: 'LEAVING / TRANSFER CERTIFICATE' },
                { key: 'migrationCertificate', label: 'MIGRATION CERTIFICATE' },
                { key: 'casteCertificate', label: 'CASTE CERTIFICATE' },
                { key: 'entranceExamResult', label: 'ENTRANCE EXAM SCORECARD' },
                { key: 'ddcetCertificate', label: 'DDCET / OTHER CERTIFICATE' }
            ].map((doc) => (
                 <Grid item xs={12} md={6} key={doc.key}>
                    <TextField
                        fullWidth
                        label={doc.label}
                        placeholder="Paste document link here"
                        value={formData.documents[doc.key]}
                        onChange={(e) => setFormData({ 
                            ...formData, 
                            documents: { ...formData.documents, [doc.key]: e.target.value } 
                        })}
                        InputLabelProps={{ shrink: true }}
                    />
                 </Grid>
            ))}
        </Grid>
    );

    const renderApplicationFeeStep = () => (
        <Grid container spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12}>
                <Typography variant="h6" align="center">Application Fee Payment</Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                    Your application fee is <strong>₹{applicationFee?.amount || 0}</strong>. 
                    Please select a payment gateway and click 'Pay Now' to proceed.
                </Alert>
            </Grid>
            {applicationFee ? (
                <>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Select Payment Gateway"
                            value={selectedGatewayId}
                            onChange={(e) => setSelectedGatewayId(e.target.value)}
                            required
                        >
                            {gateways.map((g) => (
                                <MenuItem key={g._id} value={g._id}>
                                    {g.gatwayname}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => handleInitiatePayment("application")}
                            disabled={paymentProcessing}
                            startIcon={paymentProcessing ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                            sx={{ px: 5, py: 1.5, fontSize: '1.1rem' }}
                        >
                            {paymentProcessing ? "Processing..." : `Pay Now ₹${applicationFee.amount}`}
                        </Button>
                    </Grid>
                </>
            ) : (
                <Grid item xs={12}>
                    <Alert severity="error">Unable to fetch application fee for this program. Please contact support.</Alert>
                </Grid>
            )}
        </Grid>
    );

    const renderProvisionalFeeStep = () => (
        <Grid container spacing={3} justifyContent="center" alignItems="center">
            <Grid item xs={12}>
                <Typography variant="h6" align="center">Provisional Admission Fee Payment</Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                    Your provisional admission fee is <strong>₹{provisionalFee?.amount || 0}</strong>. 
                    This fee is required to reserve your seat.
                </Alert>
            </Grid>
            {provisionalFee ? (
                <>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Select Payment Gateway"
                            value={selectedGatewayId}
                            onChange={(e) => setSelectedGatewayId(e.target.value)}
                            required
                        >
                            {gateways.map((g) => (
                                <MenuItem key={g._id} value={g._id}>
                                    {g.gatwayname}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                        <Button
                            variant="contained"
                            color="success"
                            size="large"
                            onClick={() => handleInitiatePayment("provisional")}
                            disabled={paymentProcessing}
                            startIcon={paymentProcessing ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                            sx={{ px: 5, py: 1.5, fontSize: '1.1rem' }}
                        >
                            {paymentProcessing ? "Processing..." : `Pay Now ₹${provisionalFee.amount}`}
                        </Button>
                    </Grid>
                </>
            ) : (
                <Grid item xs={12}>
                    <Alert severity="error">Unable to fetch provisional fee for this program. Please contact support.</Alert>
                </Grid>
            )}
        </Grid>
    );

    const renderStep5 = () => (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h6">Statement of Purpose (SOP)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Please write a brief statement of purpose exploring your interest in the course and your future goals.
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={10}
                    placeholder="Writie your SOP here..."
                    value={formData.sop}
                    onChange={(e) => setFormData({ ...formData, sop: e.target.value })}
                />
            </Grid>
            <Grid item xs={12}>
                <FormControl component="fieldset">
                    <FormLabel component="legend">How did you hear about us?</FormLabel>
                    <RadioGroup
                        row
                        value={formData.sourceOfInformation}
                        onChange={(e) => setFormData({ ...formData, sourceOfInformation: e.target.value })}
                    >
                        <FormControlLabel value="Website" control={<Radio />} label="Website" />
                        <FormControlLabel value="Social Media" control={<Radio />} label="Social Media" />
                        <FormControlLabel value="Friend/Relative" control={<Radio />} label="Friend/Relative" />
                        <FormControlLabel value="Advertisement" control={<Radio />} label="Advertisement" />
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    );

    const renderContent = () => {
        switch (activeStep) {
            case 0: return renderStep0();
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderApplicationFeeStep();
            case 4: return renderProvisionalFeeStep();
            case 5: return renderStep5();
            default: return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main', mb: 3 }} />
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>Application Submitted!</Typography>
                    <Typography variant="h6" color="textSecondary" sx={{ mb: 4 }}>
                        Thank you for applying. Your application has been successfully received and is under review.
                    </Typography>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.03)', display: 'inline-block', borderRadius: 2 }}>
                        <Typography variant="subtitle1">Application ID: <strong>{applicationId}</strong></Typography>
                        <Typography variant="body2" color="textSecondary">Please save this for future reference.</Typography>
                    </Paper>
                </Box>
            );
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Box sx={{ 
                    mb: 4, 
                    p: { xs: 2, sm: 3 }, 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center', 
                    textAlign: { xs: 'center', sm: 'left' },
                    gap: { xs: 2, sm: 3 }, 
                    bgcolor: '#E31E24', 
                    borderRadius: 2,
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(227, 30, 36, 0.3)'
                }}>
                    {institutionLogo ? (
                        <Box
                            component="img"
                            src={institutionLogo}
                            alt="Logo"
                            sx={{ 
                                height: { xs: 60, sm: 80 }, 
                                width: 'auto', 
                                objectFit: 'contain',
                                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                            }}
                        />
                    ) : (
                        <HistoryEduIcon sx={{ fontSize: { xs: 40, sm: 50 }, color: 'white' }} />
                    )}
                    <Box>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 800, 
                            textTransform: 'uppercase', 
                            letterSpacing: 1,
                            fontSize: { xs: '1.5rem', sm: '2.125rem' }
                        }}>
                            Admission Form
                        </Typography>
                        <Typography sx={{ 
                            color: 'rgba(255,255,255,0.9)', 
                            fontSize: { xs: '0.9rem', sm: '1.1rem' } 
                        }}>
                            Complete the steps to submit your application
                        </Typography>
                    </Box>
                </Box>

                <Stepper activeStep={activeStep} sx={{ mb: 4, display: { xs: 'none', md: 'flex' } }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ mt: 2 }}>
                    {renderContent()}
                </Box>

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        startIcon={<BeforeIcon />}
                    >
                        Back
                    </Button>
                    <Box>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{ backgroundColor: '#E31E24', '&:hover': { backgroundColor: '#c41a1f' } }}
                                disabled={submitting}
                                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                            >
                                Submit Application
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{ backgroundColor: '#E31E24', '&:hover': { backgroundColor: '#c41a1f' } }}
                                disabled={
                                    submitting || 
                                    (activeStep === 3 && formData.applicationFeeStatus !== 'Paid') || 
                                    (activeStep === 4 && formData.provisionalFeeStatus !== 'Paid')
                                }
                                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <NextIcon />}
                            >
                                {activeStep === 0 ? (isLoginView ? "Login & Resume" : "Register & Continue") : 
                                 (activeStep === 3 || activeStep === 4) ? "Payment Pending" : "Save & Next"}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Paper>

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

export default AdmissionForm;
