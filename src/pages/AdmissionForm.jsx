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
    Delete as DeleteIcon
} from "@mui/icons-material";
import { useParams, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import { Country, State, City } from "country-state-city";

const steps = ["Registration", "Personal details", "Academic Qualification & Documents", "SOP"];

const AdmissionForm = () => {
    const { colid } = useParams();
    const [searchParams] = useSearchParams();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const [isLoginView, setIsLoginView] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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

    const [formData, setFormData] = useState({
        // Step 0
        fullName: "",
        mobileNo: "",
        email: "",
        academicYear: "2024-25",
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

        // Step 5 (Mapped to index 3 in steps array)
        sop: "",
        sourceOfInformation: "Website"
    });

    useEffect(() => {
        const colid = formData.colid;
        fetchQualifications(colid);
        // Initialize states for India (default)
        setPStates(State.getStatesOfCountry("IN"));
        setCStates(State.getStatesOfCountry("IN"));
    }, []);

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

    const handleQualificationChange = async (val) => {
        setFormData({ ...formData, programLevel: val, school: "", program: "" });
        try {
            const res = await ep1.get('/api/v2/getcategoriesbyedqag1', {
                params: { colid: formData.colid, education_qualification: val }
            });
            setCategories(res.data.data || []);
        } catch (err) {
            console.error("Error fetching schools/categories:", err);
        }
    };

    const handleSchoolChange = async (school) => {
        setFormData({ ...formData, school, program: "" });
        try {
            const res = await ep1.get('/api/v2/getallprogramcounselords', {
                params: { 
                    colid: formData.colid, 
                    category: school, 
                    is_active: 'Yes', 
                    education_qualification: formData.programLevel 
                }
            });
            setPrograms(res.data.data || []);
        } catch (err) {
            console.error("Error fetching programs:", err);
        }
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
                setApplicationId(res.data.data._id);
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
                            <MenuItem value="2024-25">2024-25</MenuItem>
                            <MenuItem value="2025-26">2025-26</MenuItem>
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
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Select School/Category"
                            value={formData.school}
                            onChange={(e) => handleSchoolChange(e.target.value)}
                            disabled={!formData.programLevel}
                        >
                            {categories.map((c) => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Select Program"
                            value={formData.program}
                            onChange={(e) => {
                                const prog = programs.find(p => p.course_name === e.target.value);
                                setFormData({ ...formData, program: e.target.value, programId: prog?._id });
                            }}
                            disabled={!formData.school}
                        >
                            {programs.map((p) => (
                                <MenuItem key={p._id} value={p.course_name}>{p.course_name}</MenuItem>
                            ))}
                        </TextField>
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
                    <MenuItem value="Transgender">Transgender</MenuItem>
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
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Aadhar Number"
                    value={formData.aadharNumber}
                    onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="WhatsApp Number"
                    value={formData.whatsAppNumber}
                    onChange={(e) => setFormData({ ...formData, whatsAppNumber: e.target.value })}
                />
            </Grid>
            
            <Grid item xs={12}>
                <Divider><Typography variant="body2" color="textSecondary">Parent/Guardian Details</Typography></Divider>
            </Grid>
            
            {/* Father Details */}
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Father's Name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Father's Email"
                    value={formData.fatherEmail}
                    onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Father's Mobile"
                    value={formData.fatherMobile}
                    onChange={(e) => setFormData({ ...formData, fatherMobile: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Father's Occupation"
                    value={formData.fatherOccupation}
                    onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                />
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
                    onChange={(e) => setFormData({ ...formData, motherMobile: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Mother's Occupation"
                    value={formData.motherOccupation}
                    onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                />
            </Grid>

            {/* Guardian Details */}
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Guardian's Name"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Guardian's Email"
                    value={formData.guardianEmail}
                    onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Guardian's Mobile"
                    value={formData.guardianMobile}
                    onChange={(e) => setFormData({ ...formData, guardianMobile: e.target.value })}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Guardian's Occupation"
                    value={formData.guardianOccupation}
                    onChange={(e) => setFormData({ ...formData, guardianOccupation: e.target.value })}
                />
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
                    fullWidth
                    label="District"
                    value={formData.permanentAddress.district}
                    onChange={(e) => onAddressChange('permanent', 'district', e.target.value)}
                />
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    select
                    fullWidth
                    label="City"
                    value={formData.permanentAddress.city}
                    onChange={(e) => onAddressChange('permanent', 'city', e.target.value)}
                    disabled={!formData.permanentAddress.stateIso}
                >
                    {pCities.map((c) => (
                        <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
                <TextField
                    fullWidth
                    label="Pincode"
                    value={formData.permanentAddress.pincode}
                    onChange={(e) => onAddressChange('permanent', 'pincode', e.target.value)}
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
                            fullWidth
                            label="District"
                            value={formData.correspondenceAddress.district}
                            onChange={(e) => onAddressChange('correspondence', 'district', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            fullWidth
                            label="City"
                            value={formData.correspondenceAddress.city}
                            onChange={(e) => onAddressChange('correspondence', 'city', e.target.value)}
                            disabled={!formData.correspondenceAddress.stateIso}
                        >
                            {cCities.map((c) => (
                                <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <TextField
                            fullWidth
                            label="Pincode"
                            value={formData.correspondenceAddress.pincode}
                            onChange={(e) => onAddressChange('correspondence', 'pincode', e.target.value)}
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
                    label="10th Board"
                    value={formData.sscDetails.board}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, board: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="10th Year"
                    value={formData.sscDetails.passingYear}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, passingYear: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="10th Percentage/CGPA"
                    value={formData.sscDetails.scoreValue}
                    onChange={(e) => setFormData({ 
                        ...formData, 
                        sscDetails: { ...formData.sscDetails, scoreValue: e.target.value } 
                    })}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>

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
            case 3: return renderStep5();
            default: return <Typography>Form Completed</Typography>;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <HistoryEduIcon sx={{ fontSize: 40, color: '#E31E24' }} />
                    <Box>
                        <Typography variant="h4" fontWeight="bold">Admission Form</Typography>
                        <Typography color="textSecondary">Complete the steps to submit your application</Typography>
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
                                disabled={submitting}
                                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <NextIcon />}
                            >
                                {activeStep === 0 ? (isLoginView ? "Login & Resume" : "Register & Continue") : "Save & Next"}
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
