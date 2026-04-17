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

const steps = ["Registration", "Personal details", "Academic Qualification & Documents", "Application fee", "Provisional fee"];

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

        if (activeStep === 0) {
            if (!isLoginView) {
                if (!formData.fullName) newErrors.fullName = "Required";
                if (!formData.mobileNo || formData.mobileNo.length < 10) newErrors.mobileNo = "Enter valid Phone Number.";
                if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Enter valid Email Id.";
                if (!formData.password) newErrors.password = "Required";
                if (!formData.program) newErrors.program = "Required";
            }
        } else if (activeStep === 1) {
            if (!formData.nationality) newErrors.nationality = "Required";
            if (!formData.fatherMobile || formData.fatherMobile.length < 10) newErrors.fatherMobile = "Enter valid Phone Number.";
            if (!formData.fatherProfession) newErrors.fatherProfession = "Required";
            if (!formData.motherName) newErrors.motherName = "Required";

            if (!formData.permanentAddress.addressLine1) newErrors.pAddress = "Required";
            if (!formData.permanentAddress.countryIso) newErrors.pCountry = "Required";
            if (!formData.permanentAddress.stateIso) newErrors.pState = "Required";

            if (formData.fatherEmail && !emailRegex.test(formData.fatherEmail)) newErrors.fatherEmail = "Enter valid Email Id.";
            if (formData.motherEmail && !emailRegex.test(formData.motherEmail)) newErrors.motherEmail = "Enter valid Email Id.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveDraft = async () => {
        if (activeStep === 0) {
            showSnackbar("Please complete Step 1 formally using Next before saving as draft.", "warning");
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

    const renderDocumentUploadCard = (docKey, label) => {
        const isUploading = uploadingDoc === docKey;
        const fileUrl = formData.documents?.[docKey];
        const verification = docVerification[docKey];
        const isUploaded = !!fileUrl;

        return (
            <Grid item xs={12} md={6} key={docKey}>
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 2,
                        borderColor: isUploaded
                            ? (verification?.verified ? 'success.main' : 'warning.main')
                            : 'divider',
                        borderWidth: isUploaded ? 2 : 1,
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
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#333', fontSize: '0.8rem' }}>
                            {label}
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
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Father's/Guardian's Name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    required
                />
            </Grid>
            <Grid item xs={12} md={6}>
                <TextField
                    fullWidth
                    label="Father's/Guardian's Email"
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
                    label="Father's/Guardian's Mobile"
                    value={formData.fatherMobile}
                    onChange={(e) => setFormData({ ...formData, fatherMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
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
                    label="Father's/Guardian's Profession"
                    value={formData.fatherProfession || ""}
                    onChange={(e) => setFormData({ ...formData, fatherProfession: e.target.value })}
                    required
                    error={!!errors.fatherProfession}
                    helperText={errors.fatherProfession}
                >
                    {['Service', 'Business', 'Professional', 'Retired', 'Other'].map(p => (
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
                    onChange={(e) => setFormData({ ...formData, motherMobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    inputProps={{ maxLength: 10 }}
                />
            </Grid>
            <Grid item xs={12} md={6}>
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
                    select
                    fullWidth
                    label="10th Board"
                    value={['GSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', ''].includes(formData.sscDetails.board) ? formData.sscDetails.board : 'Others'}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                            ...formData,
                            sscDetails: { ...formData.sscDetails, board: val === 'Others' ? ' ' : val }
                        });
                    }}
                    required
                >
                    {['GSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', 'Others'].map(b => (
                        <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            {!['GSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', ''].includes(formData.sscDetails.board) && (
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Mention 10th Board"
                        value={(formData.sscDetails?.board || '').trim()}
                        onChange={(e) => setFormData({
                            ...formData,
                            sscDetails: { ...formData.sscDetails, board: e.target.value || ' ' }
                        })}
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
                    label={formData.sscDetails.scoreType === "CGPA" ? "CGPA" : "10th Score Value"}
                    value={formData.sscDetails.scoreValue}
                    onChange={(e) => setFormData({
                        ...formData,
                        sscDetails: { ...formData.sscDetails, scoreValue: e.target.value }
                    })}
                    required
                    placeholder={formData.sscDetails.scoreType === "CGPA" ? "Enter CGPA" : "Enter Percentage/Grade"}
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
                    value={['GSHSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', ''].includes(formData.hscDetails.board) ? formData.hscDetails.board : 'Others'}
                    onChange={(e) => {
                        const val = e.target.value;
                        setFormData({
                            ...formData,
                            hscDetails: { ...formData.hscDetails, board: val === 'Others' ? ' ' : val }
                        });
                    }}
                    required
                >
                    {['GSHSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', 'Others'].map(b => (
                        <MenuItem key={b} value={b}>{b}</MenuItem>
                    ))}
                </TextField>
            </Grid>
            {!['GSHSEB', 'CBSE', 'ICSE', 'NIOS', 'IB', ''].includes(formData.hscDetails.board) && (
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        label="Mention 12th Board"
                        value={(formData.hscDetails?.board || '').trim()}
                        onChange={(e) => setFormData({
                            ...formData,
                            hscDetails: { ...formData.hscDetails, board: e.target.value || ' ' }
                        })}
                        required
                    />
                </Grid>
            )}

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
                            label={formData.hscDetails.scoreType === "CGPA" ? "CGPA" : "12th Score Value"}
                            value={formData.hscDetails.scoreValue}
                            onChange={(e) => setFormData({
                                ...formData,
                                hscDetails: { ...formData.hscDetails, scoreValue: e.target.value }
                            })}
                            required
                            placeholder={formData.hscDetails.scoreType === "CGPA" ? "Enter CGPA" : "Enter Percentage/Grade"}
                        />
                    </Grid>
                </>
            )}

            {/* GRADUATION DETAILS FOR PG & DOCTORAL */}
            {(["Postgraduate", "PG", "Post Graduate", "DOCTORAL", "Ph.D", "Doctoral"].includes(formData.programLevel)) && (
                <>
                    <Grid item xs={12}>
                        <Divider><Typography variant="body2" color="textSecondary">Graduation Details</Typography></Divider>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                            Note: Please enter your pending graduation details after the results are declared.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Graduation Programme"
                            value={formData.graduationDetails.programme}
                            onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, programme: e.target.value } })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Specialisation"
                            value={formData.graduationDetails.specialisation}
                            onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, specialisation: e.target.value } })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name of University"
                            value={formData.graduationDetails.university}
                            onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, university: e.target.value } })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name of College"
                            value={formData.graduationDetails.college}
                            onChange={(e) => setFormData({ ...formData, graduationDetails: { ...formData.graduationDetails, college: e.target.value } })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset" required>
                            <FormLabel component="legend">What is the status of your undergraduate results?</FormLabel>
                            <RadioGroup
                                row
                                value={formData.graduationDetails.resultStatus}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    graduationDetails: { ...formData.graduationDetails, resultStatus: e.target.value }
                                })}
                            >
                                <FormControlLabel value="Declared" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Declared" />
                                <FormControlLabel value="Awaited" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Awaited" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    {formData.graduationDetails.resultStatus === "Declared" && (
                        <>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Year of Passing"
                                    value={formData.graduationDetails.passingYear}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        graduationDetails: { ...formData.graduationDetails, passingYear: e.target.value }
                                    })}
                                    required
                                >
                                    {Array.from({ length: 20 }, (_, i) => 2026 - i).map(year => (
                                        <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Graduation Score Type"
                                    value={formData.graduationDetails.scoreType}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        graduationDetails: { ...formData.graduationDetails, scoreType: e.target.value }
                                    })}
                                    required
                                >
                                    <MenuItem value="Percentage">Percentage</MenuItem>
                                    <MenuItem value="CGPA">CGPA</MenuItem>
                                    <MenuItem value="Grade">Grade</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label={formData.graduationDetails.scoreType === "CGPA" ? "CGPA" : "Graduation Score Value"}
                                    value={formData.graduationDetails.scoreValue}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        graduationDetails: { ...formData.graduationDetails, scoreValue: e.target.value }
                                    })}
                                    required
                                    placeholder={formData.graduationDetails.scoreType === "CGPA" ? "Enter CGPA" : "Enter Percentage/Grade"}
                                />
                            </Grid>
                        </>
                    )}
                </>
            )}

            {/* POST-GRADUATION DETAILS FOR DOCTORAL */}
            {["DOCTORAL", "Ph.D", "Doctoral"].includes(formData.programLevel) && (
                <>
                    <Grid item xs={12}>
                        <Divider><Typography variant="body2" color="textSecondary">Post-Graduation Details</Typography></Divider>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">
                            Note: Please enter your pending post-graduation details after the results are declared.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Post-Graduation Programme"
                            value={formData.postGraduationDetails.programme}
                            onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, programme: e.target.value } })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Specialisation"
                            value={formData.postGraduationDetails.specialisation}
                            onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, specialisation: e.target.value } })}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name of University"
                            value={formData.postGraduationDetails.university}
                            onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, university: e.target.value } })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Name of College"
                            value={formData.postGraduationDetails.college}
                            onChange={(e) => setFormData({ ...formData, postGraduationDetails: { ...formData.postGraduationDetails, college: e.target.value } })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset" required>
                            <FormLabel component="legend">What is the status of your post-graduate results?</FormLabel>
                            <RadioGroup
                                row
                                value={formData.postGraduationDetails.resultStatus}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    postGraduationDetails: { ...formData.postGraduationDetails, resultStatus: e.target.value }
                                })}
                            >
                                <FormControlLabel value="Declared" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Declared" />
                                <FormControlLabel value="Awaited" control={<Radio sx={{ color: '#E31E24', '&.Mui-checked': { color: '#E31E24' } }} />} label="Awaited" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>

                    {formData.postGraduationDetails.resultStatus === "Declared" && (
                        <>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Year of Passing"
                                    value={formData.postGraduationDetails.passingYear}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        postGraduationDetails: { ...formData.postGraduationDetails, passingYear: e.target.value }
                                    })}
                                    required
                                >
                                    {Array.from({ length: 20 }, (_, i) => 2026 - i).map(year => (
                                        <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Post-Graduation Score Type"
                                    value={formData.postGraduationDetails.scoreType}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        postGraduationDetails: { ...formData.postGraduationDetails, scoreType: e.target.value }
                                    })}
                                    required
                                >
                                    <MenuItem value="Percentage">Percentage</MenuItem>
                                    <MenuItem value="CGPA">CGPA</MenuItem>
                                    <MenuItem value="Grade">Grade</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label={formData.postGraduationDetails.scoreType === "CGPA" ? "CGPA" : "Post-Graduation Score Value"}
                                    value={formData.postGraduationDetails.scoreValue}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        postGraduationDetails: { ...formData.postGraduationDetails, scoreValue: e.target.value }
                                    })}
                                    required
                                    placeholder={formData.postGraduationDetails.scoreType === "CGPA" ? "Enter CGPA" : "Enter Percentage/Grade"}
                                />
                            </Grid>
                        </>
                    )}
                </>
            )}

            {/* ENTRANCE EXAM DETAILS */}
            {(
                ["Undergraduate", "UG"].includes(formData.programLevel) ||
                ["Postgraduate", "PG", "Post Graduate", "DOCTORAL", "Ph.D", "Doctoral"].includes(formData.programLevel) ||
                ["Diploma", "Diploma to Degree"].includes(formData.programLevel)
            ) && (
                    <>
                        <Grid item xs={12}>
                            <Divider><Typography variant="body2" color="textSecondary">Entrance Exam Details</Typography></Divider>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                select
                                fullWidth
                                label="Entrance Exam Field"
                                value={formData.entranceExamName}
                                onChange={(e) => setFormData({ ...formData, entranceExamName: e.target.value })}
                            >
                                {["Undergraduate", "UG"].includes(formData.programLevel) && ['JEE', 'GUJCET', 'Other'].map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                                {["Postgraduate", "PG", "Post Graduate", "DOCTORAL", "Ph.D", "Doctoral"].includes(formData.programLevel) && ['CAT', 'CMAT', 'JG Entrance Test (JGET)', 'GRE', 'GMAT', 'NMAT', 'SNAP', 'XAT', 'MAT', 'Other'].map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                                {["Diploma", "Diploma to Degree"].includes(formData.programLevel) && ['DDCET', 'Other'].map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Entrance Exam Score"
                                value={formData.entranceExamScore}
                                onChange={(e) => setFormData({ ...formData, entranceExamScore: e.target.value })}
                                placeholder="Enter your score / rank"
                            />
                        </Grid>
                    </>
                )}


            <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CloudUploadIcon sx={{ color: '#E31E24' }} />
                    <Typography variant="h6">Upload Documents</Typography>
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 1 }}>
                    Upload your documents (JPG, PNG, WebP, PDF — max 5MB each). Documents will be auto-verified using OCR.
                </Typography>
                {!applicationId && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Please complete registration (Step 1) before uploading documents.
                    </Alert>
                )}
            </Grid>
            {[
                { key: 'studentPhoto', label: 'STUDENT PHOTO', always: true },
                { key: 'marksheet10', label: '10th MARKSHEET', always: true },
                { key: 'marksheet12', label: '12th MARKSHEET', always: true },
                { key: 'aadharFront', label: 'AADHAAR CARD (FRONT)', always: true },
                { key: 'aadharBack', label: 'AADHAAR CARD (BACK)', always: true },
                { key: 'leavingCertificate', label: 'LEAVING / TRANSFER CERTIFICATE', always: true },
                { key: 'migrationCertificate', label: 'MIGRATION CERTIFICATE', always: true },
                { key: 'casteCertificate', label: 'CASTE CERTIFICATE', always: true },
                { key: 'gradSem1', label: 'GRADUATION SEM 1 MARKSHEET', pgOnly: true },
                { key: 'gradSem2', label: 'GRADUATION SEM 2 MARKSHEET', pgOnly: true },
                { key: 'gradSem3', label: 'GRADUATION SEM 3 MARKSHEET', pgOnly: true },
                { key: 'gradSem4', label: 'GRADUATION SEM 4 MARKSHEET', pgOnly: true },
                { key: 'gradSem5', label: 'GRADUATION SEM 5 MARKSHEET', pgOnly: true },
                { key: 'entranceExamResult', label: 'ENTRANCE EXAM SCORECARD', examSection: true },
                { key: 'ddcetCertificate', label: 'DDCET / OTHER CERTIFICATE', diplomaOnly: true }
            ].filter(doc => {
                if (doc.always) return true;
                if (doc.pgOnly) return ["Postgraduate", "PG", "Post Graduate", "DOCTORAL", "Ph.D", "Doctoral"].includes(formData.programLevel);
                if (doc.examSection) return (
                    ["Undergraduate", "UG"].includes(formData.programLevel) ||
                    ["Postgraduate", "PG", "Post Graduate", "DOCTORAL", "Ph.D", "Doctoral"].includes(formData.programLevel) ||
                    ["Diploma", "Diploma to Degree"].includes(formData.programLevel)
                );
                if (doc.diplomaOnly) return ["Diploma", "Diploma to Degree"].includes(formData.programLevel);
                return false;
            }).map((doc) => renderDocumentUploadCard(doc.key, doc.label))}
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

    const generateOfferLetter = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // Header with institution branding
        doc.setFillColor(227, 30, 36);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PROVISIONAL OFFER LETTER', pageWidth / 2, 18, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Admission Office', pageWidth / 2, 28, { align: 'center' });
        doc.text(`Academic Year: ${formData.academicYear || '2026-27'}`, pageWidth / 2, 35, { align: 'center' });

        y = 55;

        // Reference & Date
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        doc.text(`Ref No: ADM/${applicationId?.slice(-6)?.toUpperCase() || 'XXXXXX'}`, margin, y);
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth - margin, y, { align: 'right' });
        y += 15;

        // Body
        doc.setTextColor(30, 30, 30);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Dear ${formData.fullName || 'Applicant'},`, margin, y);
        y += 10;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const body1 = `Congratulations! We are pleased to inform you that your application for admission has been provisionally accepted. Based on your submitted credentials and the payment of the provisional admission fee, you have secured a seat in the following program:`;
        const lines1 = doc.splitTextToSize(body1, pageWidth - 2 * margin);
        doc.text(lines1, margin, y);
        y += lines1.length * 6 + 10;

        // Program Details Box
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 60, 3, 3, 'F');
        doc.setDrawColor(200, 210, 220);
        doc.roundedRect(margin, y, pageWidth - 2 * margin, 60, 3, 3, 'S');

        const boxX = margin + 10;
        let boxY = y + 12;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont('helvetica', 'normal');

        const details = [
            ['Student Name', formData.fullName || 'N/A'],
            ['Program Applied', formData.program || 'N/A'],
            ['Category / School', formData.school || formData.category || 'N/A'],
            ['Provisional Fee Paid', `INR ${provisionalFee?.amount || 0}`],
            ['Transaction ID', formData.provisionalFeeTxnId || 'N/A']
        ];

        details.forEach(([label, value]) => {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100);
            doc.text(`${label}:`, boxX, boxY);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 30);
            doc.text(value, boxX + 55, boxY);
            boxY += 10;
        });

        y += 75;

        // Terms
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const terms = [
            '1. This offer is provisional and subject to verification of your original documents at the time of reporting.',
            '2. Please report to the institute on the designated date with all original documents for physical verification.',
            '3. The provisional fee paid is non-refundable and will be adjusted against your total tuition fee.',
            '4. Failure to report within the stipulated time may result in cancellation of this offer.'
        ];
        terms.forEach(t => {
            const tLines = doc.splitTextToSize(t, pageWidth - 2 * margin);
            doc.text(tLines, margin, y);
            y += tLines.length * 5 + 4;
        });

        y += 10;
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 30);
        doc.text('We look forward to welcoming you to our institution.', margin, y);
        y += 20;
        doc.text('Warm Regards,', margin, y);
        y += 7;
        doc.setFont('helvetica', 'bold');
        doc.text('Admission Committee', margin, y);

        // Footer
        doc.setFillColor(227, 30, 36);
        doc.rect(0, doc.internal.pageSize.getHeight() - 15, pageWidth, 15, 'F');
        doc.setTextColor(255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('This is a system-generated document and does not require a physical signature.', pageWidth / 2, doc.internal.pageSize.getHeight() - 6, { align: 'center' });

        doc.save(`Offer_Letter_${formData.fullName?.replace(/\s+/g, '_') || 'Student'}.pdf`);
    };

    const renderProvisionalFeeStep = () => {
        // If fee is already paid, show success + download option
        if (formData.provisionalFeeStatus === 'Paid') {
            return (
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sx={{ textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Provisional Fee Paid Successfully!</Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ mb: 1 }}>
                            Amount: <strong>₹{provisionalFee?.amount || 0}</strong> | Txn ID: <strong>{formData.provisionalFeeTxnId || 'N/A'}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                            Program: <strong>{formData.program}</strong>
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<DownloadIcon />}
                            onClick={generateOfferLetter}
                            sx={{
                                px: 5, py: 1.5, fontSize: '1.1rem',
                                background: 'linear-gradient(90deg, #1976d2 0%, #0d47a1 100%)',
                                '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }
                            }}
                        >
                            Download Offer Letter
                        </Button>
                    </Grid>
                </Grid>
            );
        }

        return (
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
    };

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
