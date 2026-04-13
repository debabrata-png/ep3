import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Autocomplete,
  TextField,
  Divider,
} from "@mui/material";
import {
  Assessment,
  FileDownload,
  ArrowBack,
  Search,
  ReceiptLong,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ProgramWisePendingReportPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ programcodes: [], academicyears: [], semesters: [] });
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchFilters();
  }, []);

  const fetchFilters = async () => {
    try {
      const response = await ep1.get(`/api/v2/programwisependingfilters?colid=${global1.colid}`);
      if (response.data.success) {
        setFilters(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching filters:", err);
      setError("Failed to load filter options.");
    }
  };

  const handleSearch = async () => {
    if (!selectedProgram || !selectedYear) {
      setError("Please select both a Program and an Academic Year");
      return;
    }

    setLoading(true);
    setError("");
    setReportData(null);

    try {
      let url = `/api/v2/programwiseledgerpendingreport?colid=${global1.colid}&programcode=${encodeURIComponent(selectedProgram)}&academicyear=${selectedYear}`;
      if (selectedSemester && selectedSemester !== "All") {
        url += `&semester=${selectedSemester}`;
      }

      const response = await ep1.get(url);

      if (response.data.success) {
        setReportData(response.data.data);
        if (response.data.data.pendingItems.length === 0) {
          setError("No pending fees found for the selected criteria.");
        }
      } else {
        setError(response.data.message || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(err.response?.data?.message || "Error generating report.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!reportData || reportData.pendingItems.length === 0) return;

    const { pendingItems, institution } = reportData;
    const doc = new jsPDF("l", "mm", "a4"); // Landscape for detailed report

    // Institution Branding
    if (institution.logo) {
      try {
        const logoImg = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = institution.logo;
          img.onload = () => resolve(img);
          img.onerror = () => {
            // Try without crossOrigin as a fallback
            const img2 = new Image();
            img2.src = institution.logo;
            img2.onload = () => resolve(img2);
            img2.onerror = (e) => reject(e);
          };
          // Timeout after 5 seconds
          setTimeout(() => reject(new Error("Logo load timeout")), 5000);
        });

        if (logoImg) {
          const canvas = document.createElement("canvas");
          canvas.width = logoImg.width;
          canvas.height = logoImg.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(logoImg, 0, 0);
          const dataURL = canvas.toDataURL("image/png");
          doc.addImage(dataURL, "PNG", 15, 10, 25, 25, undefined, 'FAST');
        }
      } catch (err) {
        console.error("Failed to load logo for PDF:", err);
      }
    }

    doc.setFontSize(18);
    doc.setTextColor(25, 118, 210);
    doc.text(institution.name || "Institution Name", 45, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(institution.address || "", 45, 26, { maxWidth: 200 });

    doc.line(15, 40, 280, 40);

    // Report Header
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text(`Program-wise Detailed Pending Report: ${selectedProgram}`, 148, 50, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Year: ${selectedYear} | Semester: ${selectedSemester}`, 148, 56, { align: "center" });

    // Table
    const tableHeaders = [
      ["#", "Student Name", "Reg No", "Fee Item", "Year", "Sem", "Amount", "Concession", "Paid", "Balance", "Date"],
    ];

    const tableData = pendingItems.map((item, index) => [
      index + 1,
      item.name,
      item.regno,
      item.feeitem,
      item.academicyear,
      item.semester || "N/A",
      `₹${item.amount.toLocaleString()}`,
      `₹${(item.concession || 0).toLocaleString()}`,
      `₹${item.paid.toLocaleString()}`,
      `₹${item.balance.toLocaleString()}`,
      new Date(item.classdate).toLocaleDateString("en-IN"),
    ]);

    const totalBalance = pendingItems.reduce((acc, item) => acc + item.balance, 0);
    const totalConcession = pendingItems.reduce((acc, item) => acc + (item.concession || 0), 0);

    autoTable(doc, {
      startY: 65,
      head: tableHeaders,
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [25, 118, 210], fontSize: 8 },
      bodyStyles: { fontSize: 7 },
      margin: { left: 15, right: 15 },
      foot: [
        ["", "", "", "", "", "", "", "TOTALS:", `₹${totalConcession.toLocaleString()}`, "", `₹${totalBalance.toLocaleString()}`, ""],
      ],
      footStyles: { fillColor: [245, 245, 245], textColor: [211, 47, 47], fontStyle: "bold", fontSize: 8 },
    });

    // Footer
    const lastY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, lastY);
    doc.text(`Page: ${doc.internal.getNumberOfPages()}`, 270, lastY);

    doc.save(`Program_Pending_Report_${selectedProgram}_${selectedYear}.pdf`);
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
            Program Wise Pending Fee Report
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="textSecondary">
          Institution Branding & Detailed Analytics
        </Typography>
      </Box>

      {/* Filter Section */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={filters.programcodes}
              value={selectedProgram}
              onChange={(e, val) => setSelectedProgram(val || "")}
              renderInput={(params) => <TextField {...params} label="Select Program" variant="outlined" />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Academic Year"
              >
                {filters.academicyears.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                label="Semester"
              >
                <MenuItem value="All">All Semesters</MenuItem>
                {filters.semesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>Semester {sem}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Search />}
              onClick={handleSearch}
              disabled={loading}
              sx={{ height: 56, borderRadius: 2, fontWeight: "bold" }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 4, borderRadius: 2 }} />}

      {error && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>{error}</Alert>
      )}

      {/* Results Table */}
      {reportData && (
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ReceiptLong color="error" />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Detailed Pending Breakup</Typography>
            </Box>
            <Button
              variant="contained"
              color="error"
              startIcon={<FileDownload />}
              onClick={generatePDF}
              sx={{ borderRadius: 2, px: 3 }}
              disabled={reportData.pendingItems.length === 0}
            >
              Download Detailed PDF
            </Button>
          </Box>

          {reportData.pendingItems.length > 0 ? (
            <>
              <TableContainer sx={{ maxHeight: '60vh' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>Student Details</TableCell>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>Fee Item</TableCell>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }} align="center">Year/Sem</TableCell>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }} align="right">Amount</TableCell>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }} align="right">Concession</TableCell>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }} align="right">Paid</TableCell>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5", color: "#d32f2f" }} align="right">Balance</TableCell>
                      <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }} align="center">Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.pendingItems.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                          <Typography variant="caption" color="textSecondary">{item.regno}</Typography>
                        </TableCell>
                        <TableCell>{item.feeitem}</TableCell>
                        <TableCell align="center">
                          <Chip label={`${item.academicyear} / S${item.semester || 'N/A'}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">₹ {item.amount.toLocaleString()}</TableCell>
                        <TableCell align="right">₹ {(item.concession || 0).toLocaleString()}</TableCell>
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
                <Box>
                  <Typography variant="h6" color="textSecondary">Total Outstanding for {selectedProgram}</Typography>
                  <Typography variant="body2" color="textSecondary">Count: {reportData.pendingItems.length} records</Typography>
                  <Typography variant="body2" color="info.main">Total Concession: ₹ {reportData.pendingItems.reduce((acc, item) => acc + (item.concession || 0), 0).toLocaleString()}</Typography>
                </Box>
                <Typography variant="h4" color="error" sx={{ fontWeight: "900" }}>
                  ₹ {reportData.pendingItems.reduce((acc, item) => acc + item.balance, 0).toLocaleString()}
                </Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ py: 10, textAlign: "center" }}>
              <Typography color="textSecondary">No pending fee records found for the selected criteria.</Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default ProgramWisePendingReportPage;
