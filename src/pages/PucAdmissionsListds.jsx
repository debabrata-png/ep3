import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  TextField,
  Snackbar,
  Alert,
  Chip,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const PucAdmissionsListds = () => {
  const navigate = useNavigate();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    programcode: "",
    admissionyear: new Date().getFullYear().toString(),
    colid: global1.colid,
    semester: "1",
    feecategory: "General",
  });
  const [feeAmount, setFeeAmount] = useState(null);
  const [feeData, setFeeData] = useState([]);
  const [fetchingFees, setFetchingFees] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [showRegnoDialog, setShowRegnoDialog] = useState(false);
  const [customRegno, setCustomRegno] = useState("");
  const [currentApp, setCurrentApp] = useState(null);
  const [approvalFields, setApprovalFields] = useState({ email: "", phone: "" });

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getpucadmissions", {
        params: { colid: global1.colid },
      });
      setAdmissions(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchFeeAmount = async () => {
    if (!filters.programcode || !filters.admissionyear || !filters.semester) {
      setSnackbar({ open: true, message: "Program, Year, and Semester are required", severity: "warning" });
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
      }
    } catch (err) {
      console.error(err);
    }
    setFetchingFees(false);
  };

  useEffect(() => {
    fetchAdmissions();
  }, [filters.colid]);

  const generateRegno = (programcode, year) => {
    const yearSuffix = year?.slice(-2) || "00";
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${programcode}-${yearSuffix}-${rand}`;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (app, newStatus) => {
    if (newStatus !== "Approved") {
      ep1.post(`/api/v2/puc/admission/status/${app._id}`, { status: newStatus, colid: global1.colid })
        .then(() => fetchAdmissions())
        .catch(() => {
          setSnackbar({ open: true, message: "Error updating status.", severity: "error" });
        });
      return;
    }
    setCurrentApp(app);
    setApprovalFields({
      email: app.email || "",
      phone: app.phone || app.mobile || "",
    });
    setCustomRegno(generateRegno(filters.programcode, filters.admissionyear));
    setShowRegnoDialog(true);
  };

  const confirmApprove = async () => {
    const app = currentApp;
    let regno = customRegno.trim() || generateRegno(filters.programcode, filters.admissionyear);

    try {
      const { data } = await ep1.get("/api/v2/checkregno", { params: { regno } });
      if (data.exists) {
        setSnackbar({ open: true, message: "Registration number already exists!", severity: "error" });
        return;
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Error checking registration number.", severity: "error" });
      return;
    }

    if (!approvalFields.email || !approvalFields.phone) {
      setSnackbar({ open: true, message: "Email and Phone are required for approval", severity: "warning" });
      return;
    }

    setShowRegnoDialog(false);

    try {
      const userPayload = {
        email: approvalFields.email,
        name: app.studentName || app.name,
        phone: approvalFields.phone,
        password: "Password@123",
        role: "Student",
        regno,
        programcode: filters.programcode,
        admissionyear: filters.admissionyear,
        semester: filters.semester,
        section: "A",
        gender: app.gender || "",
        department: filters.programcode,
        colid: global1.colid,
        status: 1,
      };

      const userRes = await ep1.post("/api/v2/createuser", userPayload);
      const studentId = userRes?.data?.data?._id;
      if (!studentId) throw new Error(userRes?.data?.message || "User creation failed");

      if (feeData.length > 0) {
        for (const fee of feeData) {
          await ep1.post("/api/v2/createledgerstud", {
            name: fee.feeeitem,
            user: studentId,
            feegroup: fee.feegroup,
            regno,
            student: app.studentName || app.name,
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

      await ep1.post(`/api/v2/puc/admission/status/${app._id}`, { status: "Approved", colid: global1.colid });
      await fetchAdmissions();
      setSnackbar({ open: true, message: "Approved successfully!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Error approving.", severity: "error" });
    }
  };

  return (
    <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
      <Box p={3} maxWidth="xl" mx="auto">
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>PUC Admission Review Portal</Typography>
            <Typography variant="body2" color="text.secondary">Manage and confirm PUC applications</Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            href={`https://campustechnology1.netlify.app/pucadmissionform/${global1.colid}`}
            target="_blank"
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Go to Admission Form
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} sm={3} md={2}>
              <TextField
                label="Program Code"
                value={filters.programcode}
                onChange={(e) => handleFilterChange("programcode", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <TextField
                label="Year"
                value={filters.admissionyear}
                onChange={(e) => handleFilterChange("admissionyear", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <TextField
                label="Semester"
                value={filters.semester}
                onChange={(e) => handleFilterChange("semester", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <TextField
                label="Fee Category"
                value={filters.feecategory}
                onChange={(e) => handleFilterChange("feecategory", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <Button
                variant="contained"
                onClick={fetchFeeAmount}
                fullWidth
                disabled={fetchingFees}
                sx={{ height: 40, bgcolor: "#3b82f6" }}
              >
                {fetchingFees ? <CircularProgress size={20} color="inherit" /> : "Apply Fees"}
              </Button>
            </Grid>
            <Grid item xs={12} sm={3} md={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total Fee: ₹{feeAmount ?? 0}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f5f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Program</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center"><CircularProgress sx={{ my: 4 }} /></TableCell></TableRow>
              ) : admissions.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No admissions found</TableCell></TableRow>
              ) : (
                admissions.map((app) => (
                  <TableRow key={app._id} hover>
                    <TableCell
                      sx={{ cursor: "pointer", color: "primary.main", fontWeight: 600 }}
                      onClick={() => navigate(`/confirm-puc-admission/${app._id}`)}
                    >
                      {app.studentName || app.name}
                    </TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.programAppliedFor || app.languageCombination}</TableCell>
                    <TableCell>
                      <Chip
                        label={app.status || "Pending"}
                        color={app.status === "Approved" ? "success" : app.status === "Rejected" ? "error" : "warning"}
                        size="small"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      {app.status !== "Approved" ? (
                        <Select
                          value={app.status || "Pending"}
                          onChange={(e) => handleStatusChange(app, e.target.value)}
                          size="small"
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          {feeAmount !== null ? <MenuItem value="Approved">Approve</MenuItem> : null}
                          <MenuItem value="Rejected">Reject</MenuItem>
                        </Select>
                      ) : (
                        <Typography color="text.secondary" variant="body2">Immutable</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Dialog open={showRegnoDialog} onClose={() => setShowRegnoDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Approve PUC Application</DialogTitle>
          <DialogContent>
            <RadioGroup
              defaultValue="auto"
              onChange={(e) => {
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
              variant="outlined"
              value={customRegno}
              onChange={(e) => setCustomRegno(e.target.value)}
              sx={{ mt: 2 }}
            />
            {(!currentApp?.email) && (
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
            {(!currentApp?.phone && !currentApp?.mobile) && (
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
            <Button onClick={() => setShowRegnoDialog(false)} color="inherit">Cancel</Button>
            <Button onClick={confirmApprove} variant="contained" color="success" sx={{ px: 4 }}>Confirm Approval</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default PucAdmissionsListds;
