import React, { useState, useEffect, useRef } from "react";
import {
    Container, Box, Typography, TextField, Button, Paper, Grid,
    Stepper, Step, StepLabel, MenuItem, FormControl, InputLabel,
    Select, IconButton, Divider, CircularProgress, Alert, Snackbar,
    FormControlLabel, Checkbox, Radio, RadioGroup, FormLabel,
    Chip, Tooltip, LinearProgress, Card, CardContent
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
    School as SchoolIcon,
    Download as DownloadIcon,
    VerifiedUser as VerifiedUserIcon,
    Warning as WarningIcon,
    InsertDriveFile as FileIcon,
    Refresh as RefreshIcon,
    Image as ImageIcon
} from "@mui/icons-material";
import { jsPDF } from "jspdf";
import { useParams, useSearchParams } from "react-router-dom";
import ep1 from "../api/ep1";
import { Country, State, City } from "country-state-city";
import Tesseract from "tesseract.js";

const steps = [
    "Registration", 
    "Applicant Details", 
    "Academic Qualification & Entrance Details", 
    "Fee Details & Document Upload", 
    "Provisional Fee details", 
    "Statement of Purpose (SOP)", 
    "Review and Submit"
];

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
    const [errors, setErrors] = useState({});

    // Document Upload States
    const [uploadingDoc, setUploadingDoc] = useState(null); // which doc is currently uploading
    const [docVerification, setDocVerification] = useState({}); // { docKey: { verified, confidence, matchDetails } }
    const fileInputRefs = useRef({});

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

        // New Fields
        diplomaDetails: {
            programme: "",
            university: "",
            college: "",
            medium: "",
            passingYear: "",
            scoreType: "Percentage",
            scoreValue: "",
            isFromGujarat: "No",
            resultStatus: "Declared"
        },
        professionalQualification: "", // For Doctoral
        mPhilAwarded: "No", // For Doctoral
        mPhilDetails: {
            subject: "",
            university: "",
            college: "",
            commencementYear: "",
            markingScheme: "Percentage",
            passingYear: "",
            resultStatus: "Declared",
            scoreValue: ""
        },
        entranceMPhilStatus: "", // Doctoral 6 options
        clearedNetSletJrf: "No",
        teachingExperience: "",

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
            resultStatus: "Declared",
            passingYear: "",
            scoreType: "Percentage",
            scoreValue: ""
        },
        postGraduationDetails: {
            programme: "",
            specialisation: "",
            university: "",
            college: "",
            resultStatus: "Declared",
            passingYear: "",
            scoreType: "Percentage",
            scoreValue: ""
        },
        entranceExamName: "",
        entranceExamScore: "",
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
            gradSem6: "",
            gradDegreeCertificate: "",
            pgFinalSem: "",
            professionalQualCert: "",
            netSletCert: "",
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

    const validateForm = () => {
        let newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let isValid = true;

        switch (activeStep) {
            case 0: // Registration
                if (!isLoginView) {
                    if (!formData.fullName) newErrors.fullName = "Required";
                    if (!formData.mobileNo || formData.mobileNo.length < 10) newErrors.mobileNo = "Enter valid Phone Number.";
                    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Enter valid Email Id.";
                    if (!formData.password) newErrors.password = "Required";
                    if (!formData.program) newErrors.program = "Required";
                }
                break;

            case 1: // Applicant Details
                if (!formData.nationality) newErrors.nationality = "Required";
                if (formData.nationality === "OTHERS" && !formData.nationalityOther) newErrors.nationalityOther = "Please specify nationality";
                if (!formData.fatherMobile || formData.fatherMobile.length < 10) newErrors.fatherMobile = "Enter valid 10-digit Number.";
                
                // Mother's mobile is optional, only check length if provided
                if (formData.motherMobile && formData.motherMobile.length < 10) {
                    newErrors.motherMobile = "Enter valid 10-digit Number.";
                }

                if (!formData.fatherName) newErrors.fatherName = "Required";
                if (!formData.motherName) newErrors.motherName = "Required";
                if (!formData.fatherProfession) newErrors.fatherOccupation = "Required";
                
                // Email format check
                if (formData.fatherEmail && !emailRegex.test(formData.fatherEmail)) newErrors.fatherEmail = "Invalid email format";
                if (formData.motherEmail && !emailRegex.test(formData.motherEmail)) newErrors.motherEmail = "Invalid email format";
                
                // Uniqueness check - Normalized (last 10 digits)
                const getNormalized = (val) => (val || "").toString().replace(/\D/g, '').slice(-10);
                const sMobile = getNormalized(formData.mobileNo || formData.mobileNumber);
                const sWhatsApp = getNormalized(formData.whatsAppNumber);
                const fMobile = getNormalized(formData.fatherMobile);
                const mMobile = getNormalized(formData.motherMobile);

                if (fMobile && sMobile && fMobile === sMobile) {
                    newErrors.fatherMobile = "Father's number cannot be same as Student's registered number";
                    isValid = false;
                } else if (fMobile && sWhatsApp && fMobile === sWhatsApp) {
                    newErrors.fatherMobile = "Father's number cannot match Student's WhatsApp number";
                    isValid = false;
                }

                if (mMobile && sMobile && mMobile === sMobile) {
                    newErrors.motherMobile = "Mother's number cannot be same as Student's registered number";
                    isValid = false;
                }
                break;

            case 2: // Academic Details
                if (!formData.sscDetails.schoolName) newErrors.sscSchool = "Required";
                if (!formData.sscDetails.board) newErrors.sscBoard = "Required";
                if (!formData.sscDetails.scoreValue) newErrors.sscScore = "Required";

                if (!isD2D) {
                    if (!formData.hscDetails.schoolName) newErrors.hscSchool = "Required";
                    if (!formData.hscDetails.board) newErrors.hscBoard = "Required";
                    if (!formData.hscDetails.scoreValue) newErrors.hscScore = "Required";
                }

                if (isPG || isDoctoral) {
                    if (!formData.graduationDetails.programme) newErrors.gradProg = "Required";
                    if (!formData.graduationDetails.university) newErrors.gradUniv = "Required";
                    if (!formData.graduationDetails.scoreValue) newErrors.gradScore = "Required";
                }

                if (isDoctoral) {
                    if (!formData.postGraduationDetails.programme) newErrors.pgProg = "Required";
                    if (!formData.postGraduationDetails.university) newErrors.pgUniv = "Required";
                    if (!formData.postGraduationDetails.scoreValue) newErrors.pgScore = "Required";
                }
                break;

            case 3: // Fee & Documents
                // Check mandatory documents
                const docKeys = Object.keys(formData.documents);
                docKeys.forEach(key => {
                    if (isDocMandatory(key) && !formData.documents[key]) {
                        newErrors[key] = "Required Document";
                        isValid = false;
                    }
                });
                
                if (formData.applicationFeeStatus !== 'Paid') {
                    // We don't necessarily set an error here that blocks 'isValid', 
                    // because the payment button itself handles its own logic, 
                    // but we can block 'Save & Next' in the UI.
                }
                break;

            case 5: // SOP
                if (!formData.sop || formData.sop.trim().length < 50) {
                    newErrors.sop = "Please provide a more detailed Statement of Purpose (min 50 chars)";
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return isValid && Object.keys(newErrors).length === 0;
    };

    const handleSaveDraft = async () => {
        if (activeStep === 0) {
            showSnackbar("Please complete Step 1 formally using Next before saving as draft.", "warning");
            return;
        }

        if (!validateForm()) {
            showSnackbar("Please fix validation errors before saving as draft", "warning");
            return;
        }

        setSubmitting(true);
        try {
            await ep1.post(`/api/v2/admission/update/${applicationId}`, {
                ...formData,
                currentStep: activeStep
            });
            showSnackbar("Draft saved successfully!", "success");
        } catch (err) {
            showSnackbar("Failed to save draft", "error");
        }
        setSubmitting(false);
    };

    const handleNext = async () => {
        if (!validateForm()) {
            showSnackbar("Please fill all valid details", "warning");
            return;
        }

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
            // Incremental Update or Final Submission
            setSubmitting(true);
            try {
                const isFinalStep = activeStep === 6;
                const updatePayload = {
                    ...formData,
                    currentStep: isFinalStep ? 6 : activeStep + 1,
                    status: isFinalStep ? 'Submitted' : formData.status || 'Draft'
                };

                await ep1.post(`/api/v2/admission/update/${applicationId}`, updatePayload);
                
                if (isFinalStep) {
                    showSnackbar("Application submitted successfully!", "success");
                    // Optionally redirect or show success UI
                    localStorage.removeItem("admission_app_id");
                } else {
                    setActiveStep((prev) => prev + 1);
                }
            } catch (err) {
                showSnackbar("Failed to save progress", "error");
            }
        }
        setSubmitting(false);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleStepClick = (index) => {
        if (index === activeStep) return;
        if (index < activeStep) {
            setActiveStep(index);
            return;
        }
        
        // Forward navigation
        if (index > activeStep) {
            // If they haven't registered, they can't go past step 0
            if (!applicationId && index > 0) {
                if (activeStep === 0) {
                    showSnackbar("Please complete registration first", "warning");
                }
                return;
            }

            // Only allow jumping forward one step at a time or to previously reached steps
            // For simplicity, if validateForm passes, allow clicking any previously accessible step
            if (validateForm()) {
                // If moving forward, we should ideally validate all intermediate required data
                // but for now, we'll allow navigation to any step if the current one is valid 
                // and the application exists (for steps > 0)
                setActiveStep(index);
            } else {
                showSnackbar("Please fill all required details in the current step", "warning");
            }
        }
    };

    // ── OCR Verification (runs in browser using Tesseract.js) ─────
    const runOcrVerification = async (file, docType) => {
        const result = { verified: false, confidence: 0, matchDetails: [] };

        try {
            // Skip OCR for PDFs and student photos
            if (file.type === 'application/pdf' || docType === 'studentPhoto') {
                result.verified = docType === 'studentPhoto';
                result.confidence = docType === 'studentPhoto' ? 100 : 0;
                result.matchDetails = []; // Clear messages for photos/PDFs
                return result;
            }

            // Create object URL for Tesseract
            const imageUrl = URL.createObjectURL(file);
            const ocrResult = await Tesseract.recognize(imageUrl, 'eng');
            URL.revokeObjectURL(imageUrl);

            const extractedText = ocrResult.data.text || '';
            result.confidence = Math.round(ocrResult.data.confidence || 0);
            const textLower = extractedText.toLowerCase().replace(/\s+/g, ' ');

            // Verification logic based on document type
            switch (docType) {
                case 'aadharFront':
                case 'aadharBack': {
                    const aadhaar = (formData.aadharNumber || '').replace(/\s/g, '');
                    if (aadhaar && aadhaar.length === 12) {
                        const formatted = `${aadhaar.slice(0, 4)} ${aadhaar.slice(4, 8)} ${aadhaar.slice(8, 12)}`;
                        if (textLower.includes(aadhaar) || textLower.includes(formatted.toLowerCase())) {
                            result.matchDetails.push('Aadhaar number matched');
                            result.verified = true;
                        } else {
                            result.matchDetails.push('Aadhaar number not found in document');
                        }
                    }
                    const nameForAadhaar = (formData.fullName || '').toLowerCase().trim();
                    if (nameForAadhaar) {
                        const parts = nameForAadhaar.split(/\s+/).filter(p => p.length > 2);
                        const nameMatches = parts.filter(p => textLower.includes(p));
                        // Require at least 2 name parts or the entire name if it's short
                        if (nameMatches.length >= Math.min(2, parts.length)) {
                            result.matchDetails.push(`Name matched`);
                            result.verified = true;
                        }
                    }
                    break;
                }
                case 'marksheet10':
                case 'marksheet12': {
                    const studentName = (formData.fullName || '').toLowerCase().trim();
                    if (studentName) {
                        const parts = studentName.split(/\s+/).filter(p => p.length > 2);
                        const nameMatches = parts.filter(p => textLower.includes(p));
                        if (nameMatches.length >= Math.min(2, parts.length)) {
                            result.matchDetails.push(`Name matched`);
                            result.verified = true;
                        }
                    }
                    const score = docType === 'marksheet10'
                        ? (formData.sscDetails?.scoreValue || '').toString()
                        : (formData.hscDetails?.scoreValue || '').toString();
                    if (score && textLower.includes(score)) {
                        result.matchDetails.push(`Score "${score}" found in document`);
                        result.verified = true;
                    }
                    break;
                }
                default: {
                    const name = (formData.fullName || '').toLowerCase().trim();
                    if (name) {
                        const parts = name.split(/\s+/);
                        const matches = parts.filter(p => p.length > 2 && textLower.includes(p));
                        if (matches.length >= 1) {
                            result.matchDetails.push(`Name parts matched: ${matches.join(', ')}`);
                            result.verified = true;
                        } else {
                            result.matchDetails.push('Student name not found in document');
                        }
                    }
                }
            }
        } catch (err) {
            console.error('OCR Error:', err);
            result.matchDetails.push('OCR could not process this document');
        }

        return result;
    };

    // ── Document Upload Handler ───────────────────────────────────
    const handleDocumentUpload = async (file, docType) => {
        if (!applicationId) {
            showSnackbar("Please complete registration first", "warning");
            return;
        }
        if (!file) return;

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showSnackbar("File size must be less than 5MB", "error");
            return;
        }

        setUploadingDoc(docType);

        try {
            // Step 1: Run OCR verification in the browser
            const verificationResult = await runOcrVerification(file, docType);

            // Step 2: Upload file + verification result to backend
            const formDataUpload = new FormData();
            formDataUpload.append('document', file);
            formDataUpload.append('applicationId', applicationId);
            formDataUpload.append('docType', docType);
            formDataUpload.append('verificationResult', JSON.stringify(verificationResult));

            const res = await ep1.post('/api/v2/admission/upload-document', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                // Update formData with file URL
                setFormData(prev => ({
                    ...prev,
                    documents: { ...prev.documents, [docType]: res.data.data.fileUrl }
                }));

                // Update verification status
                setDocVerification(prev => ({
                    ...prev,
                    [docType]: verificationResult
                }));

                const verStatus = verificationResult.verified ? 'verified ✓' : 'uploaded (unverified)';
                showSnackbar(`Document ${verStatus}`, verificationResult.verified ? 'success' : 'info');
            } else {
                showSnackbar(res.data.message || 'Upload failed', 'error');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showSnackbar(err.response?.data?.message || 'Failed to upload document', 'error');
        }

        setUploadingDoc(null);
    };

    const isUG = formData.programLevel === "Undergraduate";
    const isPG = formData.programLevel === "Postgraduate";
    const isD2D = formData.programLevel === "Diploma to Degree (D2D)";
    const isDoctoral = formData.programLevel === "Doctoral";

    const isDocMandatory = (docKey) => {
        const category = (formData.category || "").toUpperCase();

        // Caste Certificate logic
        if (docKey === "casteCertificate") {
            return category !== "OPEN" && category !== "GENERAL";
        }

        // Standard mandatory for all
        const allMandatory = ["studentPhoto", "marksheet10", "aadharFront", "aadharBack"];
        if (allMandatory.includes(docKey)) return true;

        // Level specific mandatory
        if (isUG || isD2D) {
            if (["marksheet12"].includes(docKey)) return true;
        }

        if (isPG) {
            if (["marksheet12", "gradDegreeCertificate"].includes(docKey)) return true;
        }

        if (isDoctoral) {
            if (["marksheet12", "gradDegreeCertificate", "pgFinalSem"].includes(docKey)) return true;
        }

        return false;
    };

    const getScoreLabel = (type) => {
        if (type === "Percentage") return "Percentage (%)";
        if (type === "Grade") return "Grade";
        if (type === "CGPA") return "CGPA (Out of 4/7/10)";
        return "Score";
    };

    const renderSectionTitle = (title) => (
        <Grid item xs={12}>
            <Box sx={{
                mb: 2,
                mt: 3,
                pb: 1,
                borderBottom: '2px solid #E31E24',
                display: 'inline-block'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {title}
                </Typography>
            </Box>
        </Grid>
    );

    const handleDocumentDelete = async (docType) => {
        if (!applicationId) return;

        try {
            await ep1.post(`/api/v2/admission/delete-document/${applicationId}/${docType}`);
            setFormData(prev => ({
                ...prev,
                documents: { ...prev.documents, [docType]: '' }
            }));
            setDocVerification(prev => {
                const updated = { ...prev };
                delete updated[docType];
                return updated;
            });
            // Clear file input
            if (fileInputRefs.current[docType]) {
                fileInputRefs.current[docType].value = '';
            }
            showSnackbar('Document removed', 'info');
        } catch (err) {
            showSnackbar('Failed to delete document', 'error');
        }
    };

    const renderProfileBanner = () => {
        if (activeStep === 0 && !applicationId) return null;

        return (
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {/* My Profile Section */}
                    <Grid item xs={12} md={7}>
                        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', height: '100%' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Box
                                        component="img"
                                        src={formData.documents.studentPhoto || "https://via.placeholder.com/100x120?text=Photo"}
                                        sx={{
                                            width: 80,
                                            height: 100,
                                            borderRadius: 1,
                                            objectFit: 'cover',
                                            border: '2px solid #fff',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', mb: 0.5 }}>
                                            {formData.fullName || "GUEST APPLICANT"}
                                        </Typography>
                                        <Grid container spacing={1}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="textSecondary" display="block">Application number</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#E31E24' }}>
                                                   {applicationId ? `ADM/${applicationId.slice(-8).toUpperCase()}` : "NOT GENERATED"}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="textSecondary" display="block">Email ID</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.email || "N/A"}</Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="textSecondary" display="block">Mobile Number</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{formData.mobileNo || "N/A"}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Course Applied Section */}
                    <Grid item xs={12} md={5}>
                        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: '#f8fafc', borderColor: '#e2e8f0', height: '100%' }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
                                    Course Applied
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="textSecondary" display="block">Level of Programme</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                            {formData.programLevel || "NOT SELECTED"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="textSecondary" display="block">School</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                            {formData.school || "NOT SELECTED"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="textSecondary" display="block">Program</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#E31E24' }}>
                                            {formData.program || "NOT SELECTED"}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const renderDocumentUploadCard = (docKey, label) => {
        const isUploading = uploadingDoc === docKey;
        const fileUrl = formData.documents?.[docKey];
        const verification = docVerification[docKey];
        const isUploaded = !!fileUrl;
        const mandatory = isDocMandatory(docKey);

        return (
            <Grid item xs={12} md={6} key={docKey}>
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        borderColor: isUploaded
                            ? (verification?.verified ? 'success.main' : 'warning.main')
                            : (mandatory ? '#E31E24' : 'divider'),
                        borderWidth: isUploaded || mandatory ? 2 : 1,
                        transition: 'all 0.3s ease',
                        '&:hover': { borderColor: '#E31E24', boxShadow: '0 2px 8px rgba(227,30,36,0.1)' },
                        position: 'relative',
                        overflow: 'visible'
                    }}
                >
                    {/* Verification Badge - Hidden for Student Photo */}
                    {isUploaded && docKey !== 'studentPhoto' && (
                        <Chip
                            size="small"
                            icon={verification?.verified ? <VerifiedUserIcon /> : <WarningIcon />}
                            label={verification?.verified ? 'Verified' : 'Unverified'}
                            color={verification?.verified ? 'success' : 'warning'}
                            sx={{
                                position: 'absolute',
                                top: -12,
                                right: 12,
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                zIndex: 1
                            }}
                        />
                    )}

                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: mandatory ? '#E31E24' : '#64748b', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>
                            {label} {mandatory && "(Required)"}
                        </Typography>

                        {isUploading ? (
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <CircularProgress size={30} sx={{ color: '#E31E24', mb: 1 }} />
                                <Typography variant="caption" display="block" color="textSecondary">
                                    Uploading & verifying...
                                </Typography>
                            </Box>
                        ) : isUploaded ? (
                            <Box>
                                {/* File Preview */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    bgcolor: 'rgba(0,0,0,0.03)',
                                    borderRadius: 1,
                                    mb: 1
                                }}>
                                    {fileUrl.match(/\.(jpg|jpeg|png|webp)$/i)
                                        ? <ImageIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                        : <FileIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                    }
                                    <Typography variant="caption" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {fileUrl.split('/').pop()}
                                    </Typography>
                                </Box>

                                {/* Verification Details - Hidden for Student Photo */}
                                {docKey !== 'studentPhoto' && verification?.matchDetails?.length > 0 && (
                                    <Box sx={{ mb: 1 }}>
                                        {verification.matchDetails.map((detail, idx) => (
                                            <Typography key={idx} variant="caption" display="block" sx={{
                                                color: verification.verified ? 'success.dark' : 'warning.dark',
                                                fontSize: '0.7rem'
                                            }}>
                                                • {detail}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}

                                {/* Action Buttons */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => fileInputRefs.current[docKey]?.click()}
                                        sx={{ fontSize: '0.7rem', textTransform: 'none', flex: 1 }}
                                    >
                                        Re-upload
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDocumentDelete(docKey)}
                                        sx={{ fontSize: '0.7rem', textTransform: 'none' }}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            /* Upload Area */
                            <Box
                                onClick={() => fileInputRefs.current[docKey]?.click()}
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    p: 2,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        borderColor: '#E31E24',
                                        bgcolor: 'rgba(227,30,36,0.02)'
                                    }
                                }}
                            >
                                <CloudUploadIcon sx={{ fontSize: 28, color: '#999', mb: 0.5 }} />
                                <Typography variant="caption" display="block" color="textSecondary">
                                    Click to upload
                                </Typography>
                                <Typography variant="caption" display="block" color="textSecondary" sx={{ fontSize: '0.65rem' }}>
                                    JPG, PNG, WebP, PDF (max 5MB)
                                </Typography>
                            </Box>
                        )}

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                            style={{ display: 'none' }}
                            ref={el => fileInputRefs.current[docKey] = el}
                            onChange={(e) => {
                                if (e.target.files[0]) {
                                    handleDocumentUpload(e.target.files[0], docKey);
                                }
                            }}
                        />
                    </CardContent>
                </Card>
            </Grid>
        );
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
                            error={!!errors.fullName}
                            helperText={errors.fullName}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Mobile Number"
                            value={formData.mobileNo}
                            onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            required
                            inputProps={{ maxLength: 10 }}
                            error={!!errors.mobileNo}
                            helperText={errors.mobileNo}
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
                    error={!!errors.email}
                    helperText={errors.email}
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
                    error={!!errors.password}
                    helperText={errors.password}
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
                                <MenuItem key={q} value={q}>
                                    {q === "Undergraduate" ? "Undergraduate (UG)" : q === "Postgraduate" ? "Postgraduate (PG)" : q}
                                </MenuItem>
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
                    label="Date of Birth (DD/MM/YYYY)"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ lang: 'en-GB' }}
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
                    error={!!errors.nationality}
                    helperText={errors.nationality}
                >
                    <MenuItem value="Indian">Indian</MenuItem>
                    <MenuItem value="OTHERS">OTHERS</MenuItem>
                </TextField>
            </Grid>

            {formData.nationality === "OTHERS" && (
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Specify Nationality"
                        placeholder="Enter your nationality"
                        value={formData.nationalityOther || ""}
                        onChange={(e) => setFormData({ ...formData, nationalityOther: e.target.value })}
                        required
                        error={!!errors.nationalityOther}
                        helperText={errors.nationalityOther}
                    />
                </Grid>
            )}
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
                <Divider><Typography variant="body2" color="textSecondary">Parent Details</Typography></Divider>
            </Grid>

            {/* Father Details */}
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Father's Name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    required
                    error={!!errors.fatherName}
                    helperText={errors.fatherName}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Father's Email"
                    value={formData.fatherEmail}
                    onChange={(e) => setFormData({ ...formData, fatherEmail: e.target.value })}
                    required
                    error={!!errors.fatherEmail}
                    helperText={errors.fatherEmail}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Father's Mobile"
                    value={formData.fatherMobile}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, fatherMobile: val });
                        // Live validation
                        const sMobile = (formData.mobileNo || formData.mobileNumber || "").toString().replace(/\D/g, '').slice(-10);
                        if (val && sMobile && val === sMobile) {
                            setErrors(prev => ({ ...prev, fatherMobile: "Father's number cannot be same as Student's registered number" }));
                        } else {
                            setErrors(prev => ({ ...prev, fatherMobile: "" }));
                        }
                    }}
                    required
                    inputProps={{ maxLength: 10 }}
                    error={!!errors.fatherMobile}
                    helperText={errors.fatherMobile}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    select
                    fullWidth
                    label="Father's Occupation"
                    value={formData.fatherProfession || ""}
                    onChange={(e) => setFormData({ ...formData, fatherProfession: e.target.value })}
                    required
                    error={!!errors.fatherOccupation}
                    helperText={errors.fatherOccupation}
                >
                    {['Service', 'Business', 'Retired', 'Other'].map(p => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* Mother Details */}
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Mother's Name"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    required
                    error={!!errors.motherName}
                    helperText={errors.motherName}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Mother's Email"
                    value={formData.motherEmail}
                    onChange={(e) => setFormData({ ...formData, motherEmail: e.target.value })}
                    error={!!errors.motherEmail}
                    helperText={errors.motherEmail}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Mother's Mobile"
                    value={formData.motherMobile}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, motherMobile: val });
                        // Live validation
                        const sMobile = (formData.mobileNo || formData.mobileNumber || "").toString().replace(/\D/g, '').slice(-10);
                        if (val && sMobile && val === sMobile) {
                            setErrors(prev => ({ ...prev, motherMobile: "Mother's number cannot be same as Student's registered number" }));
                        } else {
                            setErrors(prev => ({ ...prev, motherMobile: "" }));
                        }
                    }}
                    inputProps={{ maxLength: 10 }}
                    error={!!errors.motherMobile}
                    helperText={errors.motherMobile}
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    select
                    fullWidth
                    label="Mother's Occupation"
                    value={formData.motherProfession || ""}
                    onChange={(e) => setFormData({ ...formData, motherProfession: e.target.value, motherOccupation: e.target.value })}
                    error={!!errors.motherOccupation}
                    helperText={errors.motherOccupation}
                >
                    {['Service', 'Business', 'Homemaker', 'Retired', 'Other'].map(p => (
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
                    required
                    error={!!errors.pAddress}
                    helperText={errors.pAddress}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    select
                    fullWidth
                    label="Nationality/Country"
                    value={formData.permanentAddress.countryIso}
                    onChange={(e) => onAddressChange('permanent', 'countryIso', e.target.value)}
                    required
                    error={!!errors.pCountry}
                    helperText={errors.pCountry}
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
                    required
                    error={!!errors.pState}
                    helperText={errors.pState}
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

    const renderStep2 = () => {
        const years = Array.from({ length: 31 }, (_, i) => (new Date().getFullYear() - i).toString());
        const programLevel = (formData.programLevel || "").toUpperCase();
        const isDoctoral = ["DOCTORAL", "PH.D", "PHD"].some(v => programLevel.includes(v));
        const isPG = ["POSTGRADUATE", "PG", "POST GRADUATE"].some(v => programLevel.includes(v));
        const isUG = ["UNDERGRADUATE", "UG"].some(v => programLevel.includes(v));
        const isD2D = ["DIPLOMA TO DEGREE", "D2D"].some(v => programLevel.includes(v));

        return (
            <Grid container spacing={3}>
                {/* 10th Details - All Forms */}
                {renderSectionTitle("10th/SSC Details")}
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="10th School Name"
                        value={formData.sscDetails.schoolName}
                        onChange={(e) => setFormData({ ...formData, sscDetails: { ...formData.sscDetails, schoolName: e.target.value } })}
                        required
                        error={!!errors.sscSchool}
                        helperText={errors.sscSchool}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="10th Board"
                        value={['GSEB', 'CBSE', 'ICSE', 'IB', 'Other'].includes(formData.sscDetails.board) ? formData.sscDetails.board : (formData.sscDetails.board ? 'Other' : '')}
                        onChange={(e) => {
                            const val = e.target.value;
                            setFormData({
                                ...formData,
                                sscDetails: { ...formData.sscDetails, board: val === 'Other' ? ' ' : val }
                            });
                        }}
                        required
                    >
                        {["GSEB", "CBSE", "ICSE", "IB", "Other"].map(board => (
                            <MenuItem key={board} value={board}>{board}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                {formData.sscDetails.board && !['GSEB', 'CBSE', 'ICSE', 'IB'].includes(formData.sscDetails.board) && (
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Specify 10th Board"
                            value={formData.sscDetails.board || ""}
                            onChange={(e) => setFormData({ ...formData, sscDetails: { ...formData.sscDetails, board: e.target.value } })}
                            required
                        />
                    </Grid>
                )}
                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="10th Year of Passing"
                        value={formData.sscDetails.passingYear}
                        onChange={(e) => setFormData({ ...formData, sscDetails: { ...formData.sscDetails, passingYear: e.target.value } })}
                        required
                    >
                        {years.map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="10th Score Type"
                        value={formData.sscDetails.scoreType}
                        onChange={(e) => setFormData({ ...formData, sscDetails: { ...formData.sscDetails, scoreType: e.target.value } })}
                        required
                    >
                        {['Percentage', 'Grade', 'CGPA'].map(t => (
                            <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label={getScoreLabel(formData.sscDetails.scoreType)}
                        value={formData.sscDetails.scoreValue}
                        onChange={(e) => setFormData({ ...formData, sscDetails: { ...formData.sscDetails, scoreValue: e.target.value } })}
                        required
                    />
                </Grid>

                {/* Diploma Details - Only for D2D */}
                {isD2D && (
                    <>
                        {renderSectionTitle("Diploma Details")}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Diploma Programme Name"
                                value={formData.diplomaDetails?.programme || ""}
                                onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, programme: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Diploma University Name"
                                value={formData.diplomaDetails?.university || ""}
                                onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, university: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Diploma College"
                                value={formData.diplomaDetails?.college || ""}
                                onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, college: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Diploma Medium"
                                value={formData.diplomaDetails?.medium || ""}
                                onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, medium: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">What is the status of Diploma Result?</FormLabel>
                                <RadioGroup
                                    row
                                    value={formData.diplomaDetails?.resultStatus || "Declared"}
                                    onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, resultStatus: e.target.value } })}
                                >
                                    <FormControlLabel value="Declared" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Declared" />
                                    <FormControlLabel value="Awaited" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Awaited" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        {formData.diplomaDetails?.resultStatus === "Declared" && (
                            <>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Year of Passing"
                                        value={formData.diplomaDetails?.passingYear || ""}
                                        onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, passingYear: e.target.value } })}
                                        required
                                    >
                                        {years.map(y => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Diploma Score Type"
                                        value={formData.diplomaDetails?.scoreType || "Percentage"}
                                        onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, scoreType: e.target.value } })}
                                        required
                                    >
                                        {['Percentage', 'Grade', 'CGPA'].map(t => (
                                            <MenuItem key={t} value={t}>{t}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label={getScoreLabel(formData.diplomaDetails?.scoreType)}
                                        value={formData.diplomaDetails?.scoreValue || ""}
                                        onChange={(e) => setFormData({ ...formData, diplomaDetails: { ...formData.diplomaDetails, scoreValue: e.target.value } })}
                                        required
                                    />
                                </Grid>
                            </>
                        )}
                    </>
                )}

                {/* 12th Details - Except D2D */}
                {!isD2D && (
                    <>
                        {renderSectionTitle("12th/HSC Details")}
                        
                        {/* Hide result status and gujarat question for PG and Doctoral as per requirements */}
                        {!isPG && !isDoctoral && (
                            <>
                                <Grid item xs={12} md={6}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">What is the status of your 12th/HSC result?</FormLabel>
                                        <RadioGroup
                                            row
                                            value={formData.hscDetails.resultStatus}
                                            onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, resultStatus: e.target.value } })}
                                        >
                                            <FormControlLabel value="Declared" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Declared" />
                                            <FormControlLabel value="Awaited" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Awaited" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">Have you completed 10th and 12th from Gujarat State?</FormLabel>
                                        <RadioGroup
                                            row
                                            value={formData.hscDetails.isFromGujarat}
                                            onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, isFromGujarat: e.target.value } })}
                                        >
                                            <FormControlLabel value="Yes" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Yes" />
                                            <FormControlLabel value="No" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="No" />
                                        </RadioGroup>
                                    </FormControl>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="12th Stream"
                                value={formData.hscDetails.stream}
                                onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, stream: e.target.value } })}
                                required
                            >
                                {[
                                    "ARTS & HUMANITIES",
                                    "COMMERCE",
                                    "PHYSICS, CHEMISTRY & BIOLOGY",
                                    "PHYSICS, CHEMISTRY & MATHEMATICS",
                                    "VOCATIONAL",
                                    "OTHERS"
                                ].map(stream => (
                                    <MenuItem key={stream} value={stream}>{stream}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="12th Medium"
                                value={formData.hscDetails.medium}
                                onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, medium: e.target.value } })}
                                required
                            >
                                {['Gujarati', 'English', 'Hindi', 'Other'].map(m => (
                                    <MenuItem key={m} value={m}>{m}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="12th School/College Name"
                                value={formData.hscDetails.schoolName}
                                onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, schoolName: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="12th Board"
                                value={['GSEB', 'CBSE', 'ICSE', 'IB', 'Other'].includes(formData.hscDetails.board) ? formData.hscDetails.board : (formData.hscDetails.board ? 'Other' : '')}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFormData({
                                        ...formData,
                                        hscDetails: { ...formData.hscDetails, board: val === 'Other' ? ' ' : val }
                                    });
                                }}
                                required
                            >
                                {["GSEB", "CBSE", "ICSE", "IB", "Other"].map(board => (
                                    <MenuItem key={board} value={board}>{board}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        {(formData.hscDetails.board && !['GSEB', 'CBSE', 'ICSE', 'IB'].includes(formData.hscDetails.board)) && (
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Specify 12th Board"
                                    value={formData.hscDetails.board || ""}
                                    onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, board: e.target.value } })}
                                    required
                                />
                            </Grid>
                        )}
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="12th Year of Passing"
                                value={formData.hscDetails.passingYear}
                                onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, passingYear: e.target.value } })}
                                required
                            >
                                {years.map(y => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="12th Score Type"
                                value={formData.hscDetails.scoreType}
                                onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, scoreType: e.target.value } })}
                                required
                            >
                                {['Percentage', 'Grade', 'CGPA'].map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label={getScoreLabel(formData.hscDetails.scoreType)}
                                value={formData.hscDetails.scoreValue}
                                onChange={(e) => setFormData({ ...formData, hscDetails: { ...formData.hscDetails, scoreValue: e.target.value } })}
                                required
                            />
                        </Grid>
                    </>
                )}

                {/* Graduation Details - PG and Doctoral */}
                {(isPG || isDoctoral) && (
                    <>
                        {renderSectionTitle("Graduation Details")}
                        
                        {/* Hide result status for Doctoral */}
                        {!isDoctoral && (
                            <Grid item xs={12} md={12}>
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">What is the status of your Under Graduate result?</FormLabel>
                                    <RadioGroup
                                        row
                                        value={formData.graduationDetails.resultStatus}
                                        onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, resultStatus: e.target.value } })}
                                    >
                                        <FormControlLabel value="Declared" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Declared" />
                                        <FormControlLabel value="Awaited" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Awaited" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Graduation Programme"
                                value={formData.graduationDetails.programme}
                                onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, programme: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="Specialisation"
                                value={formData.graduationDetails.specialisation}
                                onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, specialisation: e.target.value } })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="University Name"
                                value={formData.graduationDetails.university}
                                onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, university: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="College Name"
                                value={formData.graduationDetails.college}
                                onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, college: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="Year of Passing"
                                value={formData.graduationDetails.passingYear}
                                onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, passingYear: e.target.value } })}
                                required
                            >
                                {years.map(y => (
                                    <MenuItem key={y} value={y}>{y}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="Score Type"
                                value={formData.graduationDetails.scoreType}
                                onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, scoreType: e.target.value } })}
                                required
                            >
                                {['Percentage', 'Grade', 'CGPA'].map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label={getScoreLabel(formData.graduationDetails.scoreType)}
                                value={formData.graduationDetails.scoreValue}
                                onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, scoreValue: e.target.value } })}
                                required
                            />
                        </Grid>

                        {isDoctoral && (
                            <Grid item xs={12} md={8}>
                                <TextField
                                    select
                                    fullWidth
                                    label="After Graduation, have you completed any Professional Qualification?"
                                    value={formData.professionalQualification || ""}
                                    onChange={(e) => setFormData({ ...formData, professionalQualification: e.target.value })}
                                >
                                    {['CA', 'CS', 'ICWA', 'ACCA', 'None'].map(pq => (
                                        <MenuItem key={pq} value={pq}>{pq}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}
                    </>
                )}

                {/* Post Graduation Details - Doctoral */}
                {isDoctoral && (
                    <>
                        {renderSectionTitle("Post-Graduation Details")}
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="PG Programme"
                                value={formData.postGraduationDetails.programme}
                                onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, programme: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="PG Specialisation"
                                value={formData.postGraduationDetails.specialisation}
                                onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, specialisation: e.target.value } })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label="PG University"
                                value={formData.postGraduationDetails.university}
                                onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, university: e.target.value } })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                select
                                fullWidth
                                label="PG Score Type"
                                value={formData.postGraduationDetails.scoreType}
                                onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, scoreType: e.target.value } })}
                                required
                            >
                                {['Percentage', 'Grade', 'CGPA'].map(t => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                label={getScoreLabel(formData.postGraduationDetails.scoreType)}
                                value={formData.postGraduationDetails.scoreValue}
                                onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, scoreValue: e.target.value } })}
                                required
                            />
                        </Grid>

                        {/* M.Phil Details */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Have you been awarded an M.Phil. degree?</FormLabel>
                                <RadioGroup
                                    row
                                    value={formData.mPhilAwarded || "No"}
                                    onChange={(e) => setFormData({ ...formData, mPhilAwarded: e.target.value })}
                                >
                                    <FormControlLabel value="Yes" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="No" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        {formData.mPhilAwarded === "Yes" && (
                            <>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Subject / Area of Study"
                                        value={formData.mPhilDetails?.subject || ""}
                                        onChange={(e) => setFormData({ ...formData, mPhilDetails: { ...formData.mPhilDetails, subject: e.target.value } })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Name of University"
                                        value={formData.mPhilDetails?.university || ""}
                                        onChange={(e) => setFormData({ ...formData, mPhilDetails: { ...formData.mPhilDetails, university: e.target.value } })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label="Name of College"
                                        value={formData.mPhilDetails?.college || ""}
                                        onChange={(e) => setFormData({ ...formData, mPhilDetails: { ...formData.mPhilDetails, college: e.target.value } })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Year of Commencement"
                                        value={formData.mPhilDetails?.commencementYear || ""}
                                        onChange={(e) => setFormData({ ...formData, mPhilDetails: { ...formData.mPhilDetails, commencementYear: e.target.value } })}
                                        required
                                    >
                                        {years.map(y => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Marking Scheme"
                                        value={formData.mPhilDetails?.markingScheme || "Percentage"}
                                        onChange={(e) => setFormData({ ...formData, mPhilDetails: { ...formData.mPhilDetails, markingScheme: e.target.value } })}
                                        required
                                    >
                                        <MenuItem value="Percentage">Percentage</MenuItem>
                                        <MenuItem value="Grade">Grade</MenuItem>
                                        <MenuItem value="CGPA">CGPA</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        label={getScoreLabel(formData.mPhilDetails?.markingScheme)}
                                        value={formData.mPhilDetails?.scoreValue || ""}
                                        onChange={(e) => setFormData({ ...formData, mPhilDetails: { ...formData.mPhilDetails, scoreValue: e.target.value } })}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Year of Passing"
                                        value={formData.mPhilDetails?.passingYear || ""}
                                        onChange={(e) => setFormData({ ...formData, mPhilDetails: { ...formData.mPhilDetails, passingYear: e.target.value } })}
                                        required
                                    >
                                        {years.map(y => (
                                            <MenuItem key={y} value={y}>{y}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                select
                                fullWidth
                                label="Please Select the appropriate option for your Entrance Exam and M.Phill year of commencement"
                                value={formData.entranceMPhilStatus || ""}
                                onChange={(e) => setFormData({ ...formData, entranceMPhilStatus: e.target.value })}
                                required
                            >
                                <MenuItem value="Entrance Exam Given & M.Phill After 2009">I have given the entrance exam and i have appeared for M.Phill after 2009</MenuItem>
                                <MenuItem value="Entrance Exam Given & M.Phill Before 2009">I have given the entrance exam and i have appeared for M.Phill Before 2009</MenuItem>
                                <MenuItem value="Entrance Exam Given But No M.Phill">I have given the entrance exam but i have not appeared for M.Phill</MenuItem>
                                <MenuItem value="No Entrance Exam & No M.Phill">I have not given the entrance exam and i have not appeared for M.Phill</MenuItem>
                                <MenuItem value="No Entrance Exam & No M.Phill After 2009">I have not given the entrance exam and i have not appeared for M.Phill after 2009</MenuItem>
                                <MenuItem value="No Entrance Exam & No M.Phill Before 2009">I have not given the entrance exam and i have not appeared for M.Phill Before 2009</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Have you Cleared NET/SLET/JRF ?</FormLabel>
                                <RadioGroup
                                    row
                                    value={formData.clearedNetSletJrf || "No"}
                                    onChange={(e) => setFormData({ ...formData, clearedNetSletJrf: e.target.value })}
                                >
                                    <FormControlLabel value="Yes" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Yes" />
                                    <FormControlLabel value="No" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="No" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Total Teaching/Research/Industry Experience"
                                placeholder="8 months / 2 years etc."
                                value={formData.teachingExperience || ""}
                                onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value })}
                            />
                        </Grid>
                    </>
                )}

                {/* Entrance Test Section - Only for UG and D2D */}
                {(isUG || isD2D) && (
                    <>
                        {renderSectionTitle("Entrance Test Details")}
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Entrance Exam"
                                value={formData.entranceExamDetails.examName}
                                onChange={(e) => setFormData({ ...formData, entranceExamDetails: { ...formData.entranceExamDetails, examName: e.target.value } })}
                            >
                                <MenuItem value="GUJCET">GUJCET</MenuItem>
                                <MenuItem value="JEE">JEE</MenuItem>
                                {isD2D && <MenuItem value="DDCET">DDCET</MenuItem>}
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Score/Rank"
                                value={formData.entranceExamDetails.score}
                                onChange={(e) => setFormData({ ...formData, entranceExamDetails: { ...formData.entranceExamDetails, score: e.target.value } })}
                            />
                        </Grid>
                    </>
                )}
            </Grid>
        );
    };

    const renderApplicationFeeStep = () => {
        const fee = applicationFee;
        return (
            <Grid container spacing={3}>
                {renderSectionTitle("Fee Details & Document Upload")}
                
                <Grid item xs={12}>
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(227, 30, 36, 0.02)', borderRadius: 2, border: '1px solid rgba(227, 30, 36, 0.1)', mb: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#E31E24', mb: 2 }}>
                            {fee ? `Application Fee: ₹${fee.amount}` : "Loading Fee Details..."}
                        </Typography>
                        
                        <Alert severity="warning" sx={{ textAlign: 'left', mb: 3, border: '1px solid #ffcc00' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Important Note:</Typography>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Kindly pay the Application Fee to proceed with the application.</li>
                                <li>The Application Fee is <strong>non-refundable</strong>.</li>
                                <li>Ensure all documents are uploaded correctly before making the payment.</li>
                            </ul>
                        </Alert>

                        {formData.applicationFeeStatus === 'Paid' ? (
                            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2 }}>
                                <CheckCircleIcon sx={{ fontSize: 40 }} />
                                <Box sx={{ textAlign: 'left' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Successful</Typography>
                                    <Typography variant="body2">Transaction ID: {formData.applicationFeeTxnId}</Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Select Payment Gateway</Typography>
                                <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                                    {gateways.map((gw) => (
                                        <Grid item key={gw._id} xs={12} sm={4}>
                                            <Button
                                                fullWidth
                                                variant={selectedGatewayId === gw._id ? "contained" : "outlined"}
                                                onClick={() => setSelectedGatewayId(gw._id)}
                                                sx={{
                                                    height: '60px',
                                                    borderColor: '#E31E24',
                                                    color: selectedGatewayId === gw._id ? 'white' : '#E31E24',
                                                    bgcolor: selectedGatewayId === gw._id ? '#E31E24' : 'transparent',
                                                    '&:hover': { bgcolor: selectedGatewayId === gw._id ? '#c41a1f' : 'rgba(227, 30, 36, 0.04)' }
                                                }}
                                            >
                                                {gw.gatwayname}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => handleInitiatePayment("application")}
                                    disabled={!selectedGatewayId || paymentProcessing || !fee}
                                    sx={{ px: 8, py: 1.5, fontSize: '1.1rem', bgcolor: '#E31E24', '&:hover': { bgcolor: '#c41a1f' } }}
                                >
                                    {paymentProcessing ? <CircularProgress size={24} color="inherit" /> : `Pay ₹${fee?.amount || '0'} Now`}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Grid>

                {/* Documents Upload Section Moved Here */}
                <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1 }}>Document Upload</Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 3, display: 'block' }}>
                        Maximum 5MB per file. (JPG, PNG, PDF)
                    </Typography>
                    <Grid container spacing={2}>
                        {renderDocumentUploadCard("studentPhoto", "STUDENT PHOTO")}
                        {renderDocumentUploadCard("marksheet10", "10th MARKSHEET")}
                        {!isD2D && renderDocumentUploadCard("marksheet12", "12th MARKSHEET")}
                        {renderDocumentUploadCard("aadharFront", "AADHAAR CARD (FRONT)")}
                        {renderDocumentUploadCard("aadharBack", "AADHAAR CARD (BACK)")}
                        {renderDocumentUploadCard("leavingCertificate", "LEAVING / TRANSFER CERTIFICATE")}
                        {renderDocumentUploadCard("casteCertificate", "CASTE CERTIFICATE")}
                        
                        {(isPG || isDoctoral) && (
                            <>
                                {renderDocumentUploadCard("gradSem1", "GRADUATION SEM 1 MARKSHEET")}
                                {renderDocumentUploadCard("gradSem2", "GRADUATION SEM 2 MARKSHEET")}
                                {renderDocumentUploadCard("gradSem3", "GRADUATION SEM 3 MARKSHEET")}
                                {renderDocumentUploadCard("gradSem4", "GRADUATION SEM 4 MARKSHEET")}
                                {renderDocumentUploadCard("gradSem5", "GRADUATION SEM 5 MARKSHEET")}
                                {renderDocumentUploadCard("gradSem6", "GRADUATION SEM 6 MARKSHEET")}
                                {renderDocumentUploadCard("gradDegreeCertificate", "GRADUATION DEGREE CERTIFICATE")}
                            </>
                        )}

                        {isDoctoral && (
                            <>
                                {renderDocumentUploadCard("pgFinalSem", "POST GRADUATION FINAL SEM MARKSHEET")}
                                {renderDocumentUploadCard("professionalQualCert", "PROFESSIONAL QUALIFICATION CERTIFICATE")}
                                {renderDocumentUploadCard("netSletCert", "NET/SLET/JRF CERTIFICATE")}
                            </>
                        )}
                        {renderDocumentUploadCard("migrationCertificate", "MIGRATION CERTIFICATE")}
                    </Grid>
                </Grid>
            </Grid>
        );
    };

    const renderProvisionalFeeStep = () => {
        const fee = provisionalFee;
        return (
            <Grid container spacing={3}>
                {renderSectionTitle("Provisional Fee Details")}
                <Grid item xs={12}>
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(227, 30, 36, 0.02)', borderRadius: 2, border: '1px solid rgba(227, 30, 36, 0.1)' }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#E31E24', mb: 2 }}>
                            {fee ? `Provisional Fee: ₹${fee.amount}` : "Provisional Fee Not Found"}
                        </Typography>

                        <Alert severity="info" sx={{ textAlign: 'left', mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Important Note:</Typography>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                <li>Payment of Provisional Fee is required to secure your seat.</li>
                                <li>This amount will be adjusted against your first semester fees.</li>
                                <li>Registration will be confirmed only after successful payment.</li>
                            </ul>
                        </Alert>

                        {formData.provisionalFeeStatus === 'Paid' ? (
                            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 2 }}>
                                <CheckCircleIcon sx={{ fontSize: 40 }} />
                                <Box sx={{ textAlign: 'left' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>Payment Successful</Typography>
                                    <Typography variant="body2">Transaction ID: {formData.provisionalFeeTxnId}</Typography>
                                </Box>
                            </Box>
                        ) : (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Select Payment Gateway</Typography>
                                <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                                    {gateways.map((gw) => (
                                        <Grid item key={gw._id} xs={12} sm={4}>
                                            <Button
                                                fullWidth
                                                variant={selectedGatewayId === gw._id ? "contained" : "outlined"}
                                                onClick={() => setSelectedGatewayId(gw._id)}
                                                sx={{
                                                    height: '60px',
                                                    borderColor: '#E31E24',
                                                    color: selectedGatewayId === gw._id ? 'white' : '#E31E24',
                                                    bgcolor: selectedGatewayId === gw._id ? '#E31E24' : 'transparent',
                                                    '&:hover': { bgcolor: selectedGatewayId === gw._id ? '#c41a1f' : 'rgba(227, 30, 36, 0.04)' }
                                                }}
                                            >
                                                {gw.gatwayname}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => handleInitiatePayment("provisional")}
                                    disabled={!selectedGatewayId || paymentProcessing || !fee}
                                    sx={{ px: 8, py: 1.5, fontSize: '1.1rem', bgcolor: '#E31E24', '&:hover': { bgcolor: '#c41a1f' } }}
                                >
                                    {paymentProcessing ? <CircularProgress size={24} color="inherit" /> : `Pay ₹${fee?.amount || '0'} Now`}
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>
        );
    };

    const renderStep6 = () => (
        <Grid container spacing={3}>
            {renderSectionTitle("Final Review")}
            <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 3 }}>
                    Please review all your details carefully. Once submitted, you cannot edit the information.
                </Alert>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>Application Summary</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">Full Name</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.fullName}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">Program</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.program}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">Application Fee</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: formData.applicationFeeStatus === 'Paid' ? 'success.main' : 'error.main' }}>
                                {formData.applicationFeeStatus}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="caption" color="textSecondary">Provisional Fee</Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: formData.provisionalFeeStatus === 'Paid' ? 'success.main' : 'error.main' }}>
                                {formData.provisionalFeeStatus}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    );

    const renderStep5 = () => (
        <Grid container spacing={3}>
            {renderSectionTitle("Statement of Purpose (SOP)")}
            <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    Share your vision, research interests (if Doctoral), and why you choose to join our university. 
                    Maximum 1000 words.
                </Alert>
                <TextField
                    fullWidth
                    multiline
                    rows={12}
                    label="Explain your Purpose"
                    placeholder="Describe your academic and professional goals..."
                    value={formData.sop || ""}
                    onChange={(e) => setFormData({ ...formData, sop: e.target.value })}
                />
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
            case 6: return renderStep6();
            default: return null;
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

                {renderProfileBanner()}

                <Stepper activeStep={activeStep} sx={{ mb: 4, display: { xs: 'none', md: 'flex' } }}>
                    {steps.map((label, index) => (
                        <Step key={label} onClick={() => handleStepClick(index)} sx={{ cursor: 'pointer' }}>
                            <StepLabel
                                StepIconProps={{
                                    sx: {
                                        '&.Mui-active': { color: '#E31E24' },
                                        '&.Mui-completed': { color: '#4caf50' }
                                    }
                                }}
                            >
                                {label}
                            </StepLabel>
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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {applicationId && activeStep > 0 && activeStep < 3 && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleSaveDraft}
                                disabled={submitting}
                            >
                                Save as Draft
                            </Button>
                        )}
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
