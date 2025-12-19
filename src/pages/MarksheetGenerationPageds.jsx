import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import jsPDF from "jspdf";
import global1 from "./global1";
import ep1 from "../api/ep1";

function MarksheetGenerationPageds() {
  const [generationMode, setGenerationMode] = useState("single");
  const [filters, setFilters] = useState({
    regno: "",
    programcode: "",
    academicyear: "",
    semester: "",
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchSingleStudent = async () => {
    if (!filters.regno) {
      setMessage({ type: "error", text: "Please enter Registration Number" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await ep1.get('/api/v2/listmarksheetdatads', {
        params: {
          colid: global1.colid,
          user: global1.user,
          regno: filters.regno
        }
      });

      if (response.data.success && response.data.data.length > 0) {
        setStudents(response.data.data);
        setMessage({ type: "success", text: "Student found" });
      } else {
        setStudents([]);
        setMessage({ type: "info", text: "No marksheet data found for this student" });
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to fetch student data" 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBulkStudents = async () => {
    if (!filters.programcode || !filters.academicyear || !filters.semester) {
      setMessage({
        type: "error",
        text: "Please fill Program Code, Academic Year, and Semester",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await ep1.get('/api/v2/listmarksheetdatads', {
        params: {
          colid: global1.colid,
          user: global1.user,
          programcode: filters.programcode,
          academicyear: filters.academicyear,
          semester: filters.semester
        }
      });

      if (response.data.success && response.data.data.length > 0) {
        const finalized = response.data.data.filter((s) => s.status === "finalized");
        setStudents(finalized);
        setMessage({
          type: "success",
          text: `Found ${finalized.length} finalized marksheets`,
        });
      } else {
        setStudents([]);
        setMessage({
          type: "info",
          text: "No finalized marksheets found",
        });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to fetch students" 
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMarksheetPDF = async (pdfData) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    // Border color based on class type
    const borderColor = pdfData.classtype === "IX-X" ? [0, 128, 0] : [255, 153, 26];

    // Helper functions
    const drawBorder = () => {
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(1);
      doc.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);
    };

    const drawLine = (x1, y1, x2, y2, width = 0.5) => {
      doc.setLineWidth(width);
      doc.setDrawColor(0, 0, 0);
      doc.line(x1, y1, x2, y2);
    };

    const drawRect = (x, y, w, h, fill = false) => {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      if (fill) {
        doc.setFillColor(240, 240, 240);
        doc.rect(x, y, w, h, "FD");
      } else {
        doc.rect(x, y, w, h);
      }
    };

    const centerText = (text, y, fontSize = 12, bold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      const textWidth = doc.getTextWidth(text);
      doc.text(text, (pageWidth - textWidth) / 2, y);
    };

    // ==================== PAGE 1: PROFILE PAGE ====================
    drawBorder();

    // School Code
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("School Code", 15, 15);
    doc.setFont("helvetica", "normal");
    doc.text("15040", 15, 19);

    doc.setFont("helvetica", "bold");
    doc.text("UDISE Code", 170, 15);
    doc.setFont("helvetica", "normal");
    doc.text("22051023902", 170, 19);

    // School Name
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    centerText("CAREER PUBLIC SCHOOL", 30);

    doc.setFontSize(10);
    centerText("CBSE-Affiliation No.-3330196", 37);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    centerText("Behind Ambedkar Bhawan, Mudapar Bazar ,Korba(C.G.)-495677", 42);
    centerText("careerpublicschool.korba@gmail.com", 47);
    centerText("07759-249351     62689-21464", 52);

    // Performance Profile
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    centerText("PERFORMANCE  PROFILE", 62);
    drawLine(80, 63, 130, 63, 0.8);

    // Session
    doc.setFontSize(12);
    doc.text("Session :", 85, 72);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.session, 105, 72);

    // Photo box
    drawRect(170, 65, 25, 30);

    // Student Profile Section
    drawLine(15, 100, 195, 100, 0.8);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Student's  Profile", 15, 108);
    drawLine(15, 109, 195, 109, 0.5);

    let yPos = 118;
    const lineGap = 10;

    // Profile fields
    const profileFields = [
      { label: "Name", value: pdfData.profile.name },
      { label: "Father's Name", value: pdfData.profile.father },
      { label: "Mother's Name", value: pdfData.profile.mother },
      { label: "Residential Address", value: pdfData.profile.address },
    ];

    profileFields.forEach((field) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(field.label, 20, yPos);
      drawLine(60, yPos + 1, 195, yPos + 1, 0.3);
      doc.setFont("helvetica", "normal");
      doc.text(field.value, 62, yPos);
      yPos += lineGap;
    });

    // Class & Section with Roll No
    doc.setFont("helvetica", "bold");
    doc.text("Class & Section", 20, yPos);
    drawLine(60, yPos + 1, 115, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.profile.classSection, 62, yPos);
    doc.setFont("helvetica", "bold");
    doc.text("Roll No.", 125, yPos);
    drawLine(145, yPos + 1, 195, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.profile.rollNo, 147, yPos);
    yPos += lineGap;

    // DOB with Admission No
    doc.setFont("helvetica", "bold");
    doc.text("Date of Birth", 20, yPos);
    drawLine(60, yPos + 1, 115, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.profile.dob, 62, yPos);
    doc.setFont("helvetica", "bold");
    doc.text("Admission No.", 125, yPos);
    drawLine(155, yPos + 1, 195, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.profile.admissionNo, 157, yPos);
    yPos += lineGap;

    // Contact with CBSE Reg
    doc.setFont("helvetica", "bold");
    doc.text("Contact No.", 20, yPos);
    drawLine(60, yPos + 1, 115, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.profile.contact, 62, yPos);
    doc.setFont("helvetica", "bold");
    doc.text("CBSE Reg. No.", 125, yPos);
    drawLine(160, yPos + 1, 195, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.profile.cbseRegNo, 162, yPos);

    // Attendance Section
    yPos = 200;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    centerText("ATTENDANCE", yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.text("Term - I", 85, yPos);
    doc.text("Term - II", 135, yPos);

    yPos += 5;
    const attTableX = 40;
    const attTableY = yPos;
    const col1W = 60;
    const col2W = 40;
    const col3W = 40;
    const rowH = 10;

    drawRect(attTableX, attTableY, col1W + col2W + col3W, rowH * 2);
    drawLine(attTableX + col1W, attTableY, attTableX + col1W, attTableY + rowH * 2, 0.5);
    drawLine(attTableX + col1W + col2W, attTableY, attTableX + col1W + col2W, attTableY + rowH * 2, 0.5);
    drawLine(attTableX, attTableY + rowH, attTableX + col1W + col2W + col3W, attTableY + rowH, 0.5);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Total Working Days", attTableX + 2, attTableY + 7);
    doc.setFont("helvetica", "normal");
    doc.text(String(pdfData.attendance.term1.working), attTableX + col1W + 15, attTableY + 7);
    doc.text(String(pdfData.attendance.term2.working), attTableX + col1W + col2W + 15, attTableY + 7);

    doc.setFont("helvetica", "bold");
    doc.text("Total Attendance", attTableX + 2, attTableY + rowH + 7);
    doc.setFont("helvetica", "normal");
    doc.text(String(pdfData.attendance.term1.present), attTableX + col1W + 15, attTableY + rowH + 7);
    doc.text(String(pdfData.attendance.term2.present), attTableX + col1W + col2W + 15, attTableY + rowH + 7);

    // Signatures
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Class Teacher's Signature", 20, 280);
    doc.text("Parent's Signature", 140, 280);

    // ==================== PAGE 2: INSTRUCTIONS ====================
    doc.addPage();
    drawBorder();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    centerText("Instructions", 20);

    yPos = 30;
    doc.setFontSize(10);
    doc.text("Grading Scale for scholastic area : Grades are awarded on 8-point grading scale as follows :-", 15, yPos);

    yPos += 8;
    const scholasticGrades = [
      ["MARKS RANGE", "GRADE"],
      ["91-100", "A1"],
      ["81-90", "A2"],
      ["71-80", "B1"],
      ["61-70", "B2"],
      ["51-60", "C1"],
      ["41-50", "C2"],
      ["33-40", "D"],
      ["32 & Below", "E (Failed)"],
    ];

    const tableStartX = 40;
    const cellWidth = 65;
    const cellHeight = 8;

    scholasticGrades.forEach((row, index) => {
      if (index === 0) {
        doc.setFont("helvetica", "bold");
        drawRect(tableStartX, yPos, cellWidth, cellHeight, true);
        drawRect(tableStartX + cellWidth, yPos, cellWidth, cellHeight, true);
      } else {
        doc.setFont("helvetica", "normal");
        drawRect(tableStartX, yPos, cellWidth, cellHeight);
        drawRect(tableStartX + cellWidth, yPos, cellWidth, cellHeight);
      }

      doc.setFontSize(9);
      doc.text(row[0], tableStartX + cellWidth / 2 - doc.getTextWidth(row[0]) / 2, yPos + 6);
      doc.text(row[1], tableStartX + cellWidth + cellWidth / 2 - doc.getTextWidth(row[1]) / 2, yPos + 6);

      yPos += cellHeight;
    });

    // Co-scholastic grading
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    const coScholasticText = pdfData.classtype === "IX-X"
      ? "Grading Scale for Co-Scholastic areas : Grades are awarded on 3-point grading scale as"
      : "Grading Scale for Co-Scholastic areas : Grades are awarded on 5-point grading scale as";
    doc.text(coScholasticText, 15, yPos);
    yPos += 5;
    doc.text("follows :-", 15, yPos);
    yPos += 8;

    const coScholasticGrades = pdfData.classtype === "IX-X"
      ? [
          ["GRADE", "GRADE POINT"],
          ["A", "5 (Outstanding)"],
          ["B", "4 (Very Good)"],
          ["C", "3 (Fair)"],
        ]
      : [
          ["GRADE", "GRADE POINT"],
          ["41-50", "A"],
          ["31-40", "B"],
          ["21-30", "C"],
          ["11-20", "D"],
          ["10 & Below", "E"],
        ];

    coScholasticGrades.forEach((row, index) => {
      if (index === 0) {
        doc.setFont("helvetica", "bold");
        drawRect(tableStartX, yPos, cellWidth, cellHeight, true);
        drawRect(tableStartX + cellWidth, yPos, cellWidth, cellHeight, true);
      } else {
        doc.setFont("helvetica", "normal");
        drawRect(tableStartX, yPos, cellWidth, cellHeight);
        drawRect(tableStartX + cellWidth, yPos, cellWidth, cellHeight);
      }

      doc.setFontSize(9);
      doc.text(row[0], tableStartX + cellWidth / 2 - doc.getTextWidth(row[0]) / 2, yPos + 6);
      doc.text(row[1], tableStartX + cellWidth + cellWidth / 2 - doc.getTextWidth(row[1]) / 2, yPos + 6);

      yPos += cellHeight;
    });

    // ==================== PAGE 3: SCHOLASTIC AREAS ====================
    doc.addPage();
    drawBorder();

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    centerText("PART I - SCHOLASTIC AREAS", 20);

    yPos = 28;

    // Table headers
    const subTableX = 15;
    const colWidths = [40, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12];
    const headerHeight = 15;

    // Main headers
    drawRect(subTableX, yPos, colWidths[0], headerHeight);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Scholastic", subTableX + 2, yPos + 6);
    doc.text("Areas:", subTableX + 2, yPos + 10);

    let currentX = subTableX + colWidths[0];
    drawRect(currentX, yPos, colWidths.slice(1, 7).reduce((a, b) => a + b, 0), 7);
    doc.text("Term - I (100 Marks)", currentX + 25, yPos + 5);

    currentX += colWidths.slice(1, 7).reduce((a, b) => a + b, 0);
    drawRect(currentX, yPos, colWidths.slice(7).reduce((a, b) => a + b, 0), 7);
    doc.text("Term - II (100 Marks)", currentX + 25, yPos + 5);

    // Sub-headers
    yPos += 7;
    currentX = subTableX + colWidths[0];

    const headers = [
      "P.Test\n(10)", "Note\n(5)", "Enr\n(5)", "Mid\n(80)", "Obt\n(100)", "Gr",
      "P.Test\n(10)", "Note\n(5)", "Enr\n(5)", "Ann\n(80)", "Obt\n(100)", "Gr",
    ];

    headers.forEach((header, i) => {
      drawRect(currentX, yPos, colWidths[i + 1], 8);
      const lines = header.split("\n");
      doc.setFontSize(6);
      lines.forEach((line, j) => {
        doc.text(line, currentX + colWidths[i + 1] / 2 - doc.getTextWidth(line) / 2, yPos + 3 + j * 2);
      });
      currentX += colWidths[i + 1];
    });

    // Subject rows
    yPos += 8;
    const subRowHeight = 8;

    pdfData.subjects.forEach((subject) => {
      drawRect(subTableX, yPos, colWidths[0], subRowHeight);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(subject.subjectname.substring(0, 25), subTableX + 2, yPos + 5);

      currentX = subTableX + colWidths[0];
      const values = [
        subject.term1PeriodicTest, subject.term1Notebook, subject.term1Enrichment,
        subject.term1MidExam, subject.term1Total, subject.term1Grade,
        subject.term2PeriodicTest, subject.term2Notebook, subject.term2Enrichment,
        subject.term2AnnualExam, subject.term2Total, subject.term2Grade,
      ];

      values.forEach((value, i) => {
        drawRect(currentX, yPos, colWidths[i + 1], subRowHeight);
        doc.text(String(value), currentX + colWidths[i + 1] / 2 - doc.getTextWidth(String(value)) / 2, yPos + 5);
        currentX += colWidths[i + 1];
      });

      yPos += subRowHeight;
    });

    // Total row
    drawRect(subTableX, yPos, colWidths[0], subRowHeight);
    doc.setFont("helvetica", "bold");
    doc.text("Total", subTableX + 15, yPos + 5);

    currentX = subTableX + colWidths[0];
    for (let i = 0; i < 12; i++) {
      drawRect(currentX, yPos, colWidths[i + 1], subRowHeight);
      currentX += colWidths[i + 1];
    }

    // Final assessment
    yPos += 18;
    const finalHeaders = ["Term - I\n(50%)", "Term - II\n(50%)", "Grand\nTotal", "Percent", "Grade", "Rank"];
    const finalWidths = [32, 32, 32, 32, 32, 32];

    currentX = subTableX;
    finalHeaders.forEach((header, i) => {
      drawRect(currentX, yPos, finalWidths[i], 10, true);
      const lines = header.split("\n");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      lines.forEach((line, j) => {
        doc.text(line, currentX + finalWidths[i] / 2 - doc.getTextWidth(line) / 2, yPos + 4 + j * 3);
      });
      currentX += finalWidths[i];
    });

    yPos += 10;
    currentX = subTableX;
    const finalValues = [
      pdfData.term1TotalMarks,
      pdfData.term2TotalMarks,
      pdfData.grandTotal,
      `${pdfData.percentage}%`,
      pdfData.overallGrade,
      pdfData.rank || "-",
    ];

    finalValues.forEach((value, i) => {
      drawRect(currentX, yPos, finalWidths[i], 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(String(value), currentX + finalWidths[i] / 2 - doc.getTextWidth(String(value)) / 2, yPos + 5);
      currentX += finalWidths[i];
    });

    // Remarks
    yPos += 15;
    drawRect(subTableX, yPos, 180, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Class Teacher's", subTableX + 2, yPos + 5);
    doc.text("Remark", subTableX + 2, yPos + 10);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.remarks || "-", subTableX + 50, yPos + 7);

    // ==================== PAGE 4: CO-SCHOLASTIC ====================
    doc.addPage();
    drawBorder();

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PART II - CO-SCHOLASTIC AREAS : [ON 3-POINT (A-C) GRADING SCALE]", 15, 20);

    yPos = 28;
    const coTableX = 15;
    const coColWidths = [120, 35, 35];

    // Headers
    drawRect(coTableX, yPos, coColWidths[0] + coColWidths[1] + coColWidths[2], 8, true);
    doc.text("Grade", coTableX + coColWidths[0] + 10, yPos + 5);
    doc.text("Grade", coTableX + coColWidths[0] + coColWidths[1] + 10, yPos + 5);
    yPos += 8;

    drawRect(coTableX, yPos - 8, coColWidths[0], 8);
    drawRect(coTableX + coColWidths[0], yPos - 8, coColWidths[1], 8, true);
    drawRect(coTableX + coColWidths[0] + coColWidths[1], yPos - 8, coColWidths[2], 8, true);

    doc.setFontSize(8);
    doc.text("(Term I)", coTableX + coColWidths[0] + 10, yPos - 3);
    doc.text("(Term II)", coTableX + coColWidths[0] + coColWidths[1] + 10, yPos - 3);

    // Co-scholastic rows
    pdfData.coScholastic.forEach((item) => {
      drawRect(coTableX, yPos, coColWidths[0], 8);
      drawRect(coTableX + coColWidths[0], yPos, coColWidths[1], 8);
      drawRect(coTableX + coColWidths[0] + coColWidths[1], yPos, coColWidths[2], 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(item.area, coTableX + 2, yPos + 5);
      doc.text(item.term1Grade, coTableX + coColWidths[0] + 15, yPos + 5);
      doc.text(item.term2Grade, coTableX + coColWidths[0] + coColWidths[1] + 15, yPos + 5);

      yPos += 8;
    });

    // Promotion section
    yPos = 200;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Congratulations Promoted to Class :", 15, yPos);
    drawLine(88, yPos + 1, 195, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.promotedToClass || "", 90, yPos);

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text("New Session begins on :", 15, yPos);
    drawLine(70, yPos + 1, 195, yPos + 1, 0.3);
    doc.setFont("helvetica", "normal");
    doc.text(pdfData.newSessionDate || "", 72, yPos);

    // Signatures
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Exam I/C Signature", 20, 280);
    doc.text("Principal's Signature", 140, 280);

    return doc;
  };

  const handleGeneratePDF = async (regno) => {
    setGenerating(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await ep1.get('/api/v2/getmarksheetforpdfds', {
        params: {
          regno: regno,
          colid: global1.colid
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch marksheet data");
      }

      const pdfData = response.data.data;
      const doc = await generateMarksheetPDF(pdfData);

      doc.save(`Marksheet_${regno}_${pdfData.session}.pdf`);
      setMessage({ type: "success", text: `Marksheet generated for ${regno}` });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || `Failed to generate PDF: ${error.message}` 
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    if (students.length === 0) {
      setMessage({ type: "error", text: "No students to generate marksheets for" });
      return;
    }

    setMessage({ type: "info", text: `Generating ${students.length} marksheets...` });

    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      try {
        await handleGeneratePDF(student.regno);
        successCount++;
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        failCount++;
      }
    }

    setMessage({
      type: "success",
      text: `Bulk generation complete. Success: ${successCount}, Failed: ${failCount}`,
    });
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <PictureAsPdfIcon sx={{ fontSize: 40, color: "primary.main", mr: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Generate Marksheets
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: "", text: "" })}>
            {message.text}
          </Alert>
        )}

        <Card sx={{ mb: 3, bgcolor: "#f5f5f5" }}>
          <CardContent>
            <FormControl component="fieldset">
              <FormLabel component="legend">Generation Mode</FormLabel>
              <RadioGroup
                row
                value={generationMode}
                onChange={(e) => {
                  setGenerationMode(e.target.value);
                  setStudents([]);
                  setFilters({
                    regno: "",
                    programcode: "",
                    academicyear: "",
                    semester: "",
                  });
                }}
              >
                <FormControlLabel value="single" control={<Radio />} label="Single Student (by Reg No)" />
                <FormControlLabel
                  value="bulk"
                  control={<Radio />}
                  label="Bulk Generation (by Program/Year/Semester)"
                />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {generationMode === "single" ? (
                <>
                  <Grid item xs={12} md={8}>
                    <TextField
                      fullWidth
                      label="Registration Number"
                      name="regno"
                      value={filters.regno}
                      onChange={handleFilterChange}
                      placeholder="Enter student registration number"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={fetchSingleStudent}
                      disabled={loading}
                      sx={{ height: "56px" }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Search Student"}
                    </Button>
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Program Code"
                      name="programcode"
                      value={filters.programcode}
                      onChange={handleFilterChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Academic Year"
                      name="academicyear"
                      placeholder="e.g., 2023-24"
                      value={filters.academicyear}
                      onChange={handleFilterChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      select
                      fullWidth
                      label="Semester"
                      name="semester"
                      value={filters.semester}
                      onChange={handleFilterChange}
                      required
                    >
                      <MenuItem value="IX">IX</MenuItem>
                      <MenuItem value="X">X</MenuItem>
                      <MenuItem value="XI">XI</MenuItem>
                      <MenuItem value="XII">XII</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={fetchBulkStudents}
                      disabled={loading}
                      sx={{ height: "56px" }}
                    >
                      {loading ? <CircularProgress size={24} /> : "Search Students"}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>

            {generationMode === "bulk" && students.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleBulkGenerate}
                  startIcon={<DownloadIcon />}
                  disabled={generating}
                >
                  {generating ? "Generating..." : `Generate All (${students.length})`}
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {students.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>S.No</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Reg No</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Academic Year</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Semester</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Class Type</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Subjects</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student._id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Chip label={student.regno} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{student.academicyear}</TableCell>
                    <TableCell>{student.semester}</TableCell>
                    <TableCell>{student.classtype}</TableCell>
                    <TableCell>
                      <Chip label={student.subjects?.length || 0} color="success" size="small" />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={
                          generating ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />
                        }
                        onClick={() => handleGeneratePDF(student.regno)}
                        disabled={generating}
                      >
                        {generating ? "Generating..." : "Generate PDF"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {students.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {generationMode === "single"
                ? "Enter a registration number and click 'Search Student'"
                : "Select criteria and click 'Search Students' to view eligible students"}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default MarksheetGenerationPageds;
