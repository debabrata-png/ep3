import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Snackbar,
  Alert,
  Divider,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ep1 from "../api/ep1";
import { useParams, useNavigate } from "react-router-dom";
import global1 from "./global1";

const SECTIONS = [
  { key: "basic", title: "Admission Basic Details", fields: [
      "applicationNo", "admissionNo", "satsNo", "languageCombination", "medium", "section", "reservationCategory"
  ]},
  { key: "personal", title: "Student Personal Details", fields: [
      "studentName", "dob", "gender", "placeOfBirth", "nationality", "religion", "caste", "subCaste", "aadhaar", "mobile", "email"
  ]},
  { key: "parents", title: "Parent / Guardian Details", fields: [
      "fatherName", "motherName", "guardianName", "guardianAddress", "parentAnnualIncome"
  ]},
  { key: "address", title: "Address Details", fields: [
      "permanentAddress", "correspondenceAddress", "state", "district", "taluk"
  ]},
  { key: "academic", title: "Academic Background (SSLC)", fields: [
      "lastSchoolName", "lastSchoolAddress", "sslcRegisterNo", "sslcYear", "sslcMonth", "totalMarks", "percentage"
  ]},
  { key: "pu", title: "PU Program Selection", fields: [
      "part1Lang1", "part1Lang2", "optSubject1", "optSubject2", "optSubject3", "optSubject4", "puMedium"
  ]},
  { key: "other", title: "Other Details", fields: [
      "sportsActivities", "physicallyChallenged", "blind", "mentallyChallenged"
  ]}
];

const ConfirmPucAdmissionds = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    programcode: "",
    admissionyear: new Date().getFullYear().toString(),
    semester: "1",
    feecategory: "General",
  });
  const [feeAmount, setFeeAmount] = useState(null);
  const [feeData, setFeeData] = useState([]);
  const [fetchingFees, setFetchingFees] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [showDialog, setShowDialog] = useState(false);
  const [customRegno, setCustomRegno] = useState("");
  const [regnoChoice, setRegnoChoice] = useState("auto");
  const [approvalFields, setApprovalFields] = useState({ email: "", phone: "" });

  const fetchApplication = async () => {
    setLoading(true);
    try {
      const { data } = await ep1.get(`/api/v2/puc/admission/${id}`, { params: { colid: global1.colid } });
      if (data.success) {
        setApplication(data.data);
        setFilters(prev => ({
          ...prev,
          programcode: data.data.languageCombination || "",
        }));
      }
    } catch (err) {
      showSnackbar("Failed to fetch admission details", "error");
    }
    setLoading(false);
  };

  const fetchFeeAmount = async () => {
    if (!filters.programcode || !filters.admissionyear || !filters.semester) {
      showSnackbar("Program, Year, and Semester are required", "warning");
      return;
    }
    setFetchingFees(true);
    try {
      const { data } = await ep1.post("/api/v2/getfeesprovds", {
        colid: global1.colid,
        programcode: filters.programcode,
        academicyear: filters.admissionyear,
        semester: filters.semester,
      });
      if (data.success) {
        const filtered = data.data.filter(f => 
          f.programcode === filters.programcode &&
          f.academicyear === filters.admissionyear &&
          f.semester === filters.semester
        );
        setFeeData(filtered);
        setFeeAmount(filtered.reduce((acc, curr) => acc + curr.amount, 0));
        if (filtered.length === 0) showSnackbar("No fees found for these criteria", "info");
      }
    } catch (err) {
      showSnackbar("Failed to fetch fees", "error");
    }
    setFetchingFees(false);
  };

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const generateRegno = (programcode, year) => {
    const yearSuffix = year?.slice(-2) || "00";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${programcode}-${yearSuffix}-${rand}`;
  };

  const handleApproveClick = () => {
    if (feeAmount === null) {
      showSnackbar("Please apply fee filter first", "warning");
      return;
    }
    setCustomRegno(generateRegno(filters.programcode, filters.admissionyear));
    setApprovalFields({
      email: application.email || "",
      phone: application.phone || application.mobile || "",
    });
    setRegnoChoice("auto");
    setShowDialog(true);
  };

  const confirmApprove = async () => {
    let regno = customRegno.trim() || generateRegno(filters.programcode, filters.admissionyear);

    try {
      const checkRes = await ep1.get("/api/v2/checkregno", { params: { regno } });
      if (checkRes.data.exists) {
        showSnackbar("Registration number already exists!", "error");
        return;
      }
    } catch (err) {
      showSnackbar("Error checking registration number", "error");
      return;
    }

    if (!approvalFields.email || !approvalFields.phone) {
      showSnackbar("Email and Phone are required for approval", "warning");
      return;
    }

    setShowDialog(false);

    try {
      const userPayload = {
        email: approvalFields.email,
        name: application.studentName || application.name,
        phone: approvalFields.phone,
        password: "Password@123",
        role: "Student",
        regno,
        programcode: filters.programcode,
        admissionyear: filters.admissionyear,
        semester: filters.semester,
        section: "A",
        gender: application.gender || "",
        department: filters.programcode,
        colid: global1.colid,
        status: 1,
      };

      const userRes = await ep1.post("/api/v2/createuser", userPayload);
      const studentId = userRes.data?.data?._id;
      if (!studentId) throw new Error(userRes.data?.message || "User creation failed");

      if (feeData.length > 0) {
        for (const fee of feeData) {
          await ep1.post("/api/v2/createledgerstud", {
            name: fee.feeeitem,
            user: studentId,
            feegroup: fee.feegroup,
            regno,
            student: application.studentName || application.name,
            feeitem: fee.feeeitem,
            amount: fee.amount,
            paid: 0,
            concession: 0,
            balance: fee.amount,
            academicyear: filters.admissionyear,
            colid: global1.colid,
            classdate: new Date(),
            status: "unpaid",
            programcode: filters.programcode,
            admissionyear: filters.admissionyear,
            feecategory: fee.feecategory,
            semester: fee.semester,
            type: "Credit",
          });
        }
      }

      await ep1.post(`/api/v2/puc/admission/status/${id}`, { status: "Approved", colid: global1.colid });
      fetchApplication();
      showSnackbar("Admission confirmed & Student created!", "success");
    } catch (err) {
      showSnackbar(err.message || "Error confirming admission.", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const renderSection = (title, fields) => {
    const present = fields.filter((f) => application[f] !== undefined && application[f] !== null && application[f] !== "");
    if (present.length === 0) return null;
    return (
      <Accordion defaultExpanded sx={{ mb: 1.5, borderRadius: 2, "&:before": { display: "none" }, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: "#f8fafc", borderRadius: "0 0 8px 8px" }}>
          <Grid container spacing={2}>
            {present.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f}>
                <Typography variant="caption" color="textSecondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                    {f.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {f === "dob" ? new Date(application[f]).toLocaleDateString() : String(application[f])}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress />
    </Box>
  );

  if (!application) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography align="center">Admission record not found.</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 10 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1e293b", mb: 0.5 }}>Application Review</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" color="text.secondary">Status:</Typography>
            <Chip 
              label={application.status || "Pending"} 
              color={application.status === "Approved" ? "success" : application.status === "Rejected" ? "error" : "warning"} 
              sx={{ fontWeight: 700 }} 
            />
          </Box>
        </Box>
        <Button variant="outlined" onClick={() => navigate("/admin/puc-admissions-list")} sx={{ borderRadius: 2, textTransform: 'none' }}>Back to Admissions</Button>
      </Box>

      {SECTIONS.map(({ key, title, fields }) => renderSection(title, fields))}

      {application.status !== "Approved" && (
        <Paper elevation={0} sx={{ mt: 4, p: 4, borderRadius: 4, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Approval Controls</Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Program Code"
                fullWidth
                value={filters.programcode}
                onChange={(e) => handleFilterChange("programcode", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Admission Year"
                fullWidth
                value={filters.admissionyear}
                onChange={(e) => handleFilterChange("admissionyear", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Semester"
                fullWidth
                value={filters.semester}
                onChange={(e) => handleFilterChange("semester", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                onClick={fetchFeeAmount}
                disabled={fetchingFees}
                sx={{ height: 56, bgcolor: "#3b82f6", fontWeight: 700 }}
              >
                {fetchingFees ? <CircularProgress size={24} color="inherit" /> : "Apply Fee Filter"}
              </Button>
            </Grid>
            {feeAmount !== null && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ fontWeight: 600 }}>Calculated Fees: ₹{feeAmount}</Alert>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                onClick={handleApproveClick}
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
              >
                Approve & Create Student
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                onClick={() => {
                  if (window.confirm("Reject this application?")) {
                    ep1.post(`/api/v2/puc/admission/status/${id}`, { status: "Rejected", colid: global1.colid })
                      .then(() => { fetchApplication(); showSnackbar("Application Rejected", "info"); })
                      .catch(() => showSnackbar("Error rejecting application", "error"));
                  }
                }}
              >
                Reject Application
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirmation – Registration Number</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={regnoChoice}
            onChange={(e) => {
              setRegnoChoice(e.target.value);
              if (e.target.value === "auto") {
                setCustomRegno(generateRegno(filters.programcode, filters.admissionyear));
              } else {
                setCustomRegno("");
              }
            }}
          >
            <FormControlLabel value="auto" control={<Radio />} label="Auto-generate registration number" />
            <FormControlLabel value="manual" control={<Radio />} label="Enter custom registration number" />
          </RadioGroup>
          <TextField
            margin="dense"
            label="Registration Number"
            fullWidth
            value={customRegno}
            onChange={(e) => setCustomRegno(e.target.value)}
            disabled={regnoChoice === "auto"}
            sx={{ mt: 2 }}
          />
          {(!application?.email) && (
            <TextField
              margin="dense"
              label="Student Email (Required)"
              fullWidth
              variant="outlined"
              value={approvalFields.email}
              onChange={(e) => setApprovalFields({ ...approvalFields, email: e.target.value })}
              sx={{ mt: 2 }}
            />
          )}
          {(!application?.phone && !application?.mobile) && (
            <TextField
              margin="dense"
              label="Student Phone (Required)"
              fullWidth
              variant="outlined"
              value={approvalFields.phone}
              onChange={(e) => setApprovalFields({ ...approvalFields, phone: e.target.value })}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowDialog(false)} color="inherit">Cancel</Button>
          <Button onClick={confirmApprove} variant="contained" color="success" sx={{ px: 4 }}>Confirm Approval</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConfirmPucAdmissionds;
