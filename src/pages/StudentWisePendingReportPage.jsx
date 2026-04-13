import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Assessment,
  FileDownload,
  AccountCircle,
  Phone,
  LocationOn,
  School,
  ArrowBack,
  Search,
  ReceiptLong,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ep1 from "../api/ep1";
import global1 from "./global1";

const StudentWisePendingReportPage = () => {
  const navigate = useNavigate();
  const [regno, setRegno] = useState("");
  const [academicyear, setAcademicyear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  const years = [
    "2021-22",
    "2022-23",
    "2023-24",
    "2024-25",
    "2025-26",
    "2026-27",
    "2027-28",
    "2028-29",
  ];

  const handleSearch = async () => {
    if (!regno) {
      setError("Please enter a Registration Number");
      return;
    }

    setLoading(true);
    setError("");
    setReportData(null);

    try {
      let url = `/api/v2/studentwiseledgerpendingreport?colid=${global1.colid}&regno=${regno}`;
      if (academicyear) {
        url += `&academicyear=${academicyear}`;
      }

      const response = await ep1.get(url);

      if (response.data.success) {
        setReportData(response.data.data);
        if (response.data.data.pendingItems.length === 0) {
          setError("No pending fees found for this student.");
        }
      } else {
        setError(response.data.message || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(
        err.response?.data?.message || "Error generating report. Please check the registration number."
      );
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!reportData) return;

    const { student, pendingItems, institution } = reportData;
    const doc = new jsPDF();

    // Institution Logo & Name - Load image safely
    if (institution.logo) {
      try {
        const logoImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous"; // Handle potential CORS issues
          img.src = institution.logo;
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(e);
        });
        if (logoImg) {
          doc.addImage(logoImg, "PNG", 15, 10, 30, 30);
        }
      } catch (err) {
        console.error("Failed to load logo for PDF:", err);
        // Fallback: Proceed without logo if loading fails
      }
    }

    doc.setFontSize(20);
    doc.setTextColor(25, 118, 210); // Standard Blue
    doc.text(institution.name || "Institution Name", 50, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(institution.address || "", 50, 28, { maxWidth: 140 });

    doc.setDrawColor(25, 118, 210);
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    // Report Title
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text("Student Pending Fee Report", 105, 55, { align: "center" });

    // Student Information Block
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STUDENT DETAILS", 15, 65);
    doc.setLineWidth(0.1);
    doc.line(15, 67, 45, 67);

    doc.setFont("helvetica", "normal");
    doc.text(`Name: ${student.name}`, 15, 75);
    doc.text(`Reg No: ${student.regno}`, 15, 82);
    doc.text(`Program: ${student.programcode}`, 15, 89);
    doc.text(`Semester: ${student.semester || "N/A"}`, 15, 96);

    doc.text(`Father's Name: ${student.fathername || "N/A"}`, 105, 75);
    doc.text(`Phone: ${student.phone || "N/A"}`, 105, 82);
    doc.text(`Admission Year: ${student.admissionyear || "N/A"}`, 105, 89);
    doc.text(`Category: ${student.category || "N/A"}`, 105, 96);

    // Pending Fees Table
    const tableHeaders = [
      ["#", "Fee Item", "Year", "Sem", "Amount", "Concession", "Paid", "Balance", "Date"],
    ];

    const tableData = pendingItems.map((item, index) => [
      index + 1,
      item.feeitem,
      item.academicyear,
      item.semester || "N/A",
      `INR ${item.amount.toLocaleString()}`,
      `INR ${(item.concession || 0).toLocaleString()}`,
      `INR ${item.paid.toLocaleString()}`,
      `INR ${item.balance.toLocaleString()}`,
      new Date(item.classdate).toLocaleDateString("en-IN"),
    ]);

    const totalBalance = pendingItems.reduce((acc, item) => acc + item.balance, 0);

    autoTable(doc, {
      startY: 105,
      head: tableHeaders,
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [25, 118, 210] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 8 },
      foot: [
        ["", "", "", "", "", "", "TOTAL PENDING", `INR ${totalBalance.toLocaleString()}`, ""],
      ],
      footStyles: { fillColor: [245, 245, 245], textColor: [211, 47, 47], fontStyle: "bold" },
    });

    // Footer
    const lastY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, lastY);
    doc.text(`Authorized Signatory`, 150, lastY);

    doc.save(`Pending_Fee_Report_${student.regno}.pdf`);
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton color="primary" onClick={() => navigate(-1)} sx={{ bgcolor: "white", boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          {reportData?.institution?.logo && (
            <Box
              component="img"
              src={reportData.institution.logo}
              alt="Logo"
              sx={{ height: 60, width: "auto", mr: 1 }}
            />
          )}
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a237e" }}>
            Student Pending Fee Report
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="textSecondary">
          {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* Search Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={5} md={4}>
            <TextField
              fullWidth
              label="Student Registration Number"
              variant="outlined"
              value={regno}
              onChange={(e) => setRegno(e.target.value)}
              placeholder="Enter Reg No (e.g., 2024001)"
              InputProps={{
                startAdornment: <AccountCircle sx={{ color: "action.active", mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Academic Year (Optional)</InputLabel>
              <Select
                value={academicyear}
                onChange={(e) => setAcademicyear(e.target.value)}
                label="Academic Year (Optional)"
              >
                <MenuItem value="">All Academic Years</MenuItem>
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={loading ? null : <Search />}
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: 56, borderRadius: 2, fontWeight: "bold" }}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

      {error && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Report Results */}
      {reportData && (
        <Grid container spacing={4}>
          {/* Student Info Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", height: "100%" }}>
              <Box sx={{
                bgcolor: "#1a237e",
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white"
              }}>
                <AccountCircle sx={{ fontSize: 60 }} />
              </Box>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold" }}>
                  {reportData.student.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
                  ID: {reportData.student.regno}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <School color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Program & Semester</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {reportData.student.programcode} - Sem {reportData.student.semester || "N/A"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Phone color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Contact Number</Typography>
                      <Typography variant="body2" fontWeight="medium">{reportData.student.phone || "N/A"}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <LocationOn color="primary" fontSize="small" />
                    <Box>
                      <Typography variant="caption" color="textSecondary">Address</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: "break-word" }}>
                        {reportData.student.address || "No address provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 3, p: 2, bgcolor: "#e3f2fd", borderRadius: 2 }}>
                  <Typography variant="caption" color="primary" fontWeight="bold">Parental Info</Typography>
                  <Typography variant="body2">Father: {reportData.student.fathername || "N/A"}</Typography>
                  <Typography variant="body2">Mother: {reportData.student.mothername || "N/A"}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Items Table */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ReceiptLong color="error" />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Pending Fee Breakup</Typography>
                </Box>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<FileDownload />}
                  onClick={generatePDF}
                  sx={{ borderRadius: 2, px: 3 }}
                >
                  Download Report PDF
                </Button>
              </Box>

              {reportData.pendingItems.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#fafafa" }}>
                          <TableCell sx={{ fontWeight: "bold" }}>Fee Item</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="center">Year</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="center">Sem</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="right">Amount</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "#2e7d32" }} align="right">Concession</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="right">Paid</TableCell>
                          <TableCell sx={{ fontWeight: "bold", color: "#d32f2f" }} align="right">Balance</TableCell>
                          <TableCell sx={{ fontWeight: "bold" }} align="center">Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData.pendingItems.map((item, index) => (
                          <TableRow key={index} hover>
                            <TableCell>{item.feeitem}</TableCell>
                            <TableCell align="center">
                              <Chip label={item.academicyear} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="center">{item.semester || "N/A"}</TableCell>
                            <TableCell align="right">₹ {item.amount.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ color: "#2e7d32" }}>
                              ₹ {(item.concession || 0).toLocaleString()}
                            </TableCell>
                            <TableCell align="right">₹ {item.paid.toLocaleString()}</TableCell>
                            <TableCell align="right" sx={{ color: "#d32f2f", fontWeight: "bold" }}>
                              ₹ {item.balance.toLocaleString()}
                            </TableCell>
                            <TableCell align="center">
                              {new Date(item.classdate).toLocaleDateString("en-IN")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{
                    mt: 4,
                    p: 3,
                    bgcolor: "#fff5f5",
                    borderRadius: 3,
                    border: "1px dashed #feb2b2",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <Typography variant="h6" color="textSecondary">Total Outstanding Balance</Typography>
                    <Typography variant="h4" color="error" sx={{ fontWeight: "900" }}>
                      ₹ {reportData.pendingItems.reduce((acc, item) => acc + item.balance, 0).toLocaleString()}
                    </Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ py: 10, textAlign: "center" }}>
                  <Typography color="textSecondary">No pending fee records found.</Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default StudentWisePendingReportPage;
