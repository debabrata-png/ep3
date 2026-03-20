import React, { useEffect, useState } from "react";
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
  Grid,
  Card,
  CardContent,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import {
  Assessment,
  FileDownload,
  ArrowBack,
  Search,
  Clear,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DCRReportPageds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    academic: [],
    feecategory: [],
    feebook: [],
    feeitem: [],
    programcode: [],
    feecounter: [],
    paymode: [],
    institutions: [],
  });

  const [filters, setFilters] = useState({
    reportFormat: "Detailed",
    academicyear: "",
    receiptType: "Regular",
    feebook: "",
    feecounterType: "",
    paymode: "",
    feecounter: "",
    programcode: "",
    feeitem: "",
    receiptStatus: "With Cancelled",
    fromdate: new Date().toISOString().split("T")[0],
    todate: new Date().toISOString().split("T")[0],
  });

  const [reportData, setReportData] = useState([]);
  const [feeItems, setFeeItems] = useState([]); // pivot fee-head columns (Detailed only)

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const res = await ep1.get(`/api/v2/dcr/dropdowns?colid=${global1.colid}`);
      if (res.data.success) {
        setDropdowns(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching dropdowns", err);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setFeeItems([]);
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        colid: global1.colid,
      }).toString();

      // Detailed report uses a dedicated endpoint that joins User table & pivots fee items
      const endpoint = filters.reportFormat === "Detailed"
        ? `/api/v2/dcr/detailed-report?${queryParams}`
        : `/api/v2/dcr/report?${queryParams}`;

      const res = await ep1.get(endpoint);
      if (res.data.success) {
        setReportData(res.data.data);
        if (res.data.feeItems) setFeeItems(res.data.feeItems);
      }
    } catch (err) {
      console.error("Error generating report", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (reportData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(reportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DCR Report");
    XLSX.writeFile(wb, `DCR_Report_${filters.reportFormat}_${new Date().getTime()}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");

    const selectedInst = dropdowns.institutions?.find(i => i.colid === Number(filters.feebook));
    const instName = selectedInst ? selectedInst.institutionname : "Daily Collection Register";
    const logoUrl = global1.logo;
    const logoImg = document.getElementById("report-logo");

    const generatePDF = (imgData = null) => {
      // Header logic
      let yPos = 60;
      if (imgData) {
        try {
          doc.addImage(imgData, "PNG", 40, 20, 60, 60);
          yPos = 70;
        } catch (e) {
          console.error("Error adding image to PDF", e);
        }
      }

      doc.setFontSize(22);
      doc.setTextColor(26, 35, 126);
      doc.text(instName, doc.internal.pageSize.width / 2, 50, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Daily Collection Register - ${filters.reportFormat}`, 40, yPos + 30);
      doc.text(`Date Range: ${filters.fromdate} to ${filters.todate}`, 40, yPos + 50);
      
      if (filters.paymode) doc.text(`Transaction Type: ${filters.paymode}`, 40, yPos + 70);

      const tableHeaders = [Object.keys(reportData[0] || {})];
      const tableData = reportData.map(row => Object.values(row));

      autoTable(doc, {
        head: tableHeaders,
        body: tableData,
        startY: yPos + 90,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [26, 35, 126], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        margin: { top: 100 },
      });

      doc.save(`DCR_Report_${filters.reportFormat}_${new Date().getTime()}.pdf`);
    };

    if (logoImg) {
      generatePDF(logoImg);
    } else {
      generatePDF();
    }
  };

  const reportFormats = [
    "Detailed", "Short", "Summary", "PreviousYears Summary",
    "Summary Trans. Wise", "Date Wise Summary", "Prev Session Detailed",
    "Date Wise", "Academic Session Summary", "Summary Tran. Course Wise",
    "Summary Tran. Basic Course Wise", "DCR Details Demand Wise",
    "Consolidated Summary Tran. Course Wise",
    "DCR Details Date Wise Fee Head Description Wise",
  ];

  return (
    <Box sx={{ p: 4, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: "#fff", boxShadow: 1 }}>
            <ArrowBack />
          </IconButton>
          {(dropdowns.institutions?.find(i => i.colid === Number(filters.feebook))?.logo || global1.logo) && (
            <img 
              id="report-logo"
              crossOrigin="anonymous"
              src={dropdowns.institutions?.find(i => i.colid === Number(filters.feebook))?.logo || global1.logo} 
              alt="logo" 
              style={{ height: 50, borderRadius: 8, objectFit: "contain" }} 
            />
          )}
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a237e" }}>
            Daily Collection Register
          </Typography>
        </Box>
      </Box>

      {/* Filters Paper */}
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #e0e0e0", mb: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: "#d32f2f", fontWeight: 600 }}>
          * Report Format
        </Typography>
        <RadioGroup row name="reportFormat" value={filters.reportFormat} onChange={handleChange} sx={{ mb: 4 }}>
          <Grid container spacing={1}>
            {reportFormats.map((format) => (
              <Grid item xs={12} sm={6} md={3} lg={2.4} key={format}>
                <Paper variant="outlined" sx={{
                  p: 0.5,
                  pl: 1,
                  borderRadius: 2,
                  borderColor: filters.reportFormat === format ? "#1976d2" : "#e0e0e0",
                  bgcolor: filters.reportFormat === format ? "#e3f2fd" : "transparent"
                }}>
                  <FormControlLabel
                    value={format}
                    control={<Radio size="small" />}
                    label={<Typography variant="caption" sx={{ fontWeight: 500 }}>{format}</Typography>}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </RadioGroup>

        <Grid container spacing={3}>
          {/* Row 1 */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Session"
              name="academicyear"
              value={filters.academicyear}
              onChange={handleChange}
              variant="outlined"
              size="small"
              required
            >
              <MenuItem value="">Please Select</MenuItem>
              {dropdowns.academic?.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Receipt Type"
              name="receiptType"
              value={filters.receiptType}
              onChange={handleChange}
              variant="outlined"
              size="small"
              required
            >
              <MenuItem value="Regular">Regular</MenuItem>
              <MenuItem value="All">All</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Report Book Type"
              name="feebook"
              value={filters.feebook}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="">Please Select</MenuItem>
              {dropdowns.institutions?.map((inst) => (
                <MenuItem key={inst.colid} value={inst.colid}>{inst.institutionname}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Counter Type"
              name="feecounterType"
              value={filters.feecounterType}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="">Please Select</MenuItem>
              <MenuItem value="Online">Online</MenuItem>
              <MenuItem value="Offline">Offline</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Transaction Type"
              name="paymode"
              value={filters.paymode}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="">Please Select</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="NEFT">NEFT</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="PG">PG</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Counter"
              name="feecounter"
              value={filters.feecounter}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {dropdowns.feecounter?.map((counter) => (
                <MenuItem key={counter} value={counter}>{counter}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Row 3 */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Courses"
              name="programcode"
              value={filters.programcode}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              {dropdowns.programcode?.map((code) => (
                <MenuItem key={code} value={code}>{code}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Receipt Status"
              name="receiptStatus"
              value={filters.receiptStatus}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="With Cancelled">With Cancelled</MenuItem>
              <MenuItem value="Regular">Regular</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="From Date"
              name="fromdate"
              value={filters.fromdate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              required
            />
          </Grid>

          {/* Row 4 */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Feeheads"
              name="feeitem"
              value={filters.feeitem}
              onChange={handleChange}
              variant="outlined"
              size="small"
            >
              <MenuItem value="">Select feehead</MenuItem>
              {dropdowns.feeitem?.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="To Date"
              name="todate"
              value={filters.todate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              size="small"
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleGenerateReport}
            disabled={loading}
            sx={{ borderRadius: 10, px: 4, bgcolor: "#1976d2", textTransform: "none" }}
          >
            {loading ? "Generating..." : "Show Report"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={() => setReportData([])}
            sx={{ borderRadius: 10, px: 4, textTransform: "none" }}
          >
            Reset
          </Button>
          {reportData.length > 0 && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<FileDownload />}
                onClick={handleExportExcel}
                sx={{ borderRadius: 10, px: 4, textTransform: "none" }}
              >
                Export Excel
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<FileDownload />}
                onClick={handleExportPDF}
                sx={{ borderRadius: 10, px: 4, textTransform: "none", ml: 2 }}
              >
                Export PDF
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Report Table */}
      {reportData.length > 0 && (() => {
        const isDetailed = filters.reportFormat === "Detailed";

        // Fixed student-info columns (always first for Detailed)
        const fixedCols = isDetailed
          ? ["Sr No", "Reg No", "Student Name", "Father Name", "Mother Name",
             "DOB", "Gender", "Category", "Programme", "Semester",
             "Department", "Phone", "Address", "Academic Year",
             "Fee Category", "Counter", "Pay Mode"]
          : Object.keys(reportData[0] || {});

        // All column headers: fixed + fee-head pivots + Grand Total
        const allCols = isDetailed
          ? [...fixedCols, ...feeItems, "Grand Total"]
          : fixedCols;

        return (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e0e0e0", overflowX: "auto" }}>
            <Table stickyHeader size="small" sx={{ minWidth: isDetailed ? 1400 : "auto" }}>
              <TableHead>
                <TableRow>
                  {allCols.map((key) => (
                    <TableCell
                      key={key}
                      sx={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        bgcolor: feeItems.includes(key)
                          ? "#e8f5e9"   // green tint for fee-head columns
                          : key === "Grand Total"
                            ? "#fff3e0" // orange tint for total
                            : "#e3f2fd", // blue tint for student info
                        color: "#1a237e",
                        borderBottom: "2px solid #1976d2"
                      }}
                    >
                      {key}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index} hover>
                    {allCols.map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          whiteSpace: "nowrap",
                          fontWeight: col === "Grand Total" ? 700 : 400,
                          color: col === "Grand Total" ? "#e65100" : "inherit"
                        }}
                      >
                        {row[col] !== undefined
                          ? (typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col]))
                          : ""}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      })()}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && reportData.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 10, opacity: 0.5 }}>
          <Assessment sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h6">Generate a report to see results</Typography>
        </Box>
      )}
    </Box>
  );
};

export default DCRReportPageds;
