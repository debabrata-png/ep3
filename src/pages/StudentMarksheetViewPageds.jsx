import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Divider,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search, Print, Download as DownloadIcon } from '@mui/icons-material';
import jsPDF from "jspdf";
import ep1 from '../api/ep1';
import global1 from './global1';

const StudentMarksheetViewPageds = () => {
  const [regno, setRegno] = useState('');
  const [semester, setSemester] = useState('');
  const [academicyear, setAcademicyear] = useState('');
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Dynamic options from User table
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [fullPdfData, setFullPdfData] = useState(null);
  const [schoolConfig, setSchoolConfig] = useState({
    schoolname: "CAREER PUBLIC SCHOOL",
    schoolcode: "15040",
    udisecode: "22051023902",
    affiliationno: "3330196",
    addressline1: "Behind Ambedkar Bhawan, Mudapar Bazar",
    addressline2: "Korba(C.G.)-495677",
    email: "careerpublicschool.korba@gmail.com",
    phone: "07759-249351     62689-21464",
    logolink: ""
  });
  const [pdfParams, setPdfParams] = useState({
    remarks: '',
    promotedToClass: '',
    newSessionDate: '',
  });

  // Fetch semesters and years on component mount
  useEffect(() => {
    fetchSemestersAndYears();
    fetchSchoolConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSchoolConfig = async () => {
    try {
      const response = await ep1.get('/api/v2/getschreportconfds', {
        params: { colid: global1.colid }
      });
      if (response.data.success && response.data.data) {
        setSchoolConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching school config:', error);
    }
  };

  const fetchSemestersAndYears = async () => {
    try {
      const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
        params: { colid: global1.colid }
      });

      if (response.data.success) {
        setAvailableSemesters(response.data.semesters);
        setAvailableYears(response.data.admissionyears);

        // Set default values
        if (response.data.semesters.length > 0) {
          setSemester(response.data.semesters[0]);
        }
        if (response.data.admissionyears.length > 0) {
          setAcademicyear(response.data.admissionyears[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters and years:', error);
      showSnackbar('Failed to fetch semesters and years', 'error');
    }
  };

  const fetchMarks = async () => {
    if (!regno) {
      showSnackbar('Please enter registration number', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Use the same endpoint as PDF generation to ensure consistent data and formatting
      const response = await ep1.get('/api/v2/getmarksheetpdfdata9ds', {
        params: {
          colid: global1.colid,
          regno,
          semester,
          academicyear
        }
      });

      if (response.data.success) {
        // The endpoint returns data.subjects which contains the formatted marks
        if (response.data.data && response.data.data.subjects) {
          setMarks(response.data.data.subjects);
          setFullPdfData(response.data.data); // Store full data for PDF
        } else {
          setMarks([]);
          setFullPdfData(null);
          showSnackbar('No marks found for this student', 'info');
        }
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
      if (error.response && error.response.status === 404) {
        showSnackbar('Student or marks not found', 'info');
        setMarks([]);
      } else {
        showSnackbar('Failed to fetch marks', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPdfDialog = () => {
    if (!fullPdfData) {
      showSnackbar('No data to generate report', 'warning');
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleGenerateClick = async () => {
    if (!fullPdfData) return;

    // Merge user inputs
    const finalPdfData = {
      ...fullPdfData,
      school: schoolConfig,
      remarks: pdfParams.remarks || fullPdfData.remarks,
      promotedToClass: pdfParams.promotedToClass || fullPdfData.promotedToClass,
      newSessionDate: pdfParams.newSessionDate || fullPdfData.newSessionDate,
    };

    handleCloseDialog();
    setDownloading(true);
    try {
      const doc = await generateMarksheetPDF(finalPdfData);
      doc.save(`Marksheet_${finalPdfData.profile?.regno || 'Report'}.pdf`);
      showSnackbar('Report generated successfully', 'success');
    } catch (e) {
      console.error("PDF Generation Error", e);
      showSnackbar('Failed to generate PDF', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generateMarksheetPDF = async (pdfData) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",  // Changed to points for better precision (1pt = 1/72 inch)
      format: "a4",
    });



    // Helper functions
    const drawText = (text, x, y, size = 12, bold = false, color = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      doc.text(String(text), x, y);
    };

    const drawLine = (x1, y1, x2, y2, width = 1, color = [0, 0, 0]) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(width);
      doc.line(x1, y1, x2, y2);
    };

    const drawRect = (x, y, w, h, options = {}) => {
      const { lineWidth = 1, strokeColor = [0, 0, 0], fillColor = null } = options;
      doc.setDrawColor(...strokeColor);
      doc.setLineWidth(lineWidth);

      if (fillColor) {
        doc.setFillColor(...fillColor);
        doc.rect(x, y, w, h, 'FD');
      } else {
        doc.rect(x, y, w, h);
      }
    };

    // Helper to get border color based on class
    const getBorderColor = (classType) => {
      // Normalize to lower case for comparison
      const normalizedClass = String(classType || "").toLowerCase();

      const purpleClasses = ["nursery", "lkg", "ukg", "kg-1", "kg-2", "kg-i", "kg-ii", "kg1", "kg2"];

      // Check if it's one of the purple classes
      if (purpleClasses.some(c => normalizedClass.includes(c))) {
        return [128, 0, 128]; // Purple
      }

      // Default to Olive Green for Class 1-12
      return [0, 128, 0]; // Olive Green
    };

    const mainBorderColor = getBorderColor(pdfData.classtype || semester); // Use semester as fallback for class

    // ==================== PAGE 1: PROFILE PAGE ====================

    // Colored outer border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });

    // Inner black border
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    // School Code & UDISE Code (top corners)
    drawText("School Code", 30, 35, 10, true);
    drawText(pdfData.school?.schoolcode || "", 30, 50, 12);
    drawText("UDISE Code", 470, 35, 10, true);
    drawText(pdfData.school?.udisecode || "", 470, 50, 12);

    // School name and details
    // School name and details
    if (pdfData.school) {
      doc.setFontSize(22);
      doc.setFont("times", "bold");
      doc.setTextColor(128, 0, 0); // Maroon - Cambria Bold approximation
      doc.text((pdfData.school.schoolname || 'SCHOOL NAME').toUpperCase(), 297.5, 90, { align: 'center' });
      doc.setTextColor(0, 0, 0); // Reset to black

      doc.setFontSize(12);
      doc.text(`CBSE Affiliation No. : ${pdfData.school.affiliationno || ''}`, 297.5, 110, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      // Helper to draw icons based on text position
      const drawIcon = (type, textX, textY, textWidth) => {
        const iconX = textX - (textWidth / 2) - 18;
        const iconY = textY - 3;
        doc.setLineWidth(0.8);
        doc.setDrawColor(0);
        doc.setFillColor(255, 255, 255);
        const r = 5.5;
        if (type === 'location') {
          doc.circle(iconX + 4, iconY - 1, r);
          doc.setFillColor(0);
          doc.circle(iconX + 4, iconY - 2, 1.5, 'F');
          doc.setLineWidth(1.2);
          doc.line(iconX + 4, iconY + r - 1.5, iconX + 4, iconY + r + 3);
          doc.setLineWidth(0.8);
        } else if (type === 'email') {
          doc.circle(iconX + 4, iconY - 1, r);
          doc.rect(iconX + 0.5, iconY - 3.2, 7, 4.5);
          doc.line(iconX + 0.5, iconY - 3.2, iconX + 4, iconY - 0.5);
          doc.line(iconX + 7.5, iconY - 3.2, iconX + 4, iconY - 0.5);
        } else if (type === 'phone') {
          // Mobile phone icon in circle
          doc.circle(iconX + 4, iconY - 1, r);
          doc.roundedRect(iconX + 2.2, iconY - 4.5, 3.6, 6, 0.5, 0.5);
          doc.setFillColor(0);
          doc.circle(iconX + 4, iconY + 0.8, 0.5, 'F');
        }
      };

      const address = `${pdfData.school.addressline1 || ''}, ${pdfData.school.addressline2 || ''}`;
      const addressW = doc.getTextWidth(address);
      doc.text(address, 297.5, 125, { align: 'center' });
      drawIcon('location', 297.5, 125, addressW);

      const email = pdfData.school.email || '';
      const emailW = doc.getTextWidth(email);
      doc.text(email, 297.5, 140, { align: 'center' });
      if (email) drawIcon('email', 297.5, 140, emailW);

      const phone = pdfData.school.phone || '';
      const phoneW = doc.getTextWidth(phone);
      doc.text(phone, 297.5, 155, { align: 'center' });
      if (phone) drawIcon('phone', 297.5, 155, phoneW);

    } else {
      // Fallback if no school config
      drawText("SCHOOL NAME", 150, 90, 22, true);
    }

    // Add School Logo (Right) - Lowered to Y=60
    if (pdfData.school?.logolink) {
      try {
        const logoUrl = pdfData.school.logolink.startsWith('http') ? pdfData.school.logolink : `${ep1.defaults.baseURL}/${pdfData.school.logolink}`;
        doc.addImage(logoUrl, 'PNG', 30, 75, 100, 60);
      } catch (e) { console.warn("School Logo fail", e); }
    }

    // Add CBSE Logo (Left) - static asset - Lowered to Y=60
    try {
      const cbseLogoImg = new Image();
      cbseLogoImg.src = '/CBSE_logo.jpeg';
      doc.addImage(cbseLogoImg, 'JPEG', 505, 60, 65, 65);
    } catch (e) { /* ignore */ }

    // PERFORMANCE PROFILE heading
    drawText("PERFORMANCE  PROFILE", 180, 210, 18, true);
    drawLine(180, 215, 415, 215, 2);

    // Session
    drawText("Session :", 210, 235, 14, true);
    drawText(pdfData.session, 275, 235, 14);

    // Photo box
    drawRect(485, 200, 80, 100, { lineWidth: 2 });

    // Add Photo if available
    if (pdfData.profile && pdfData.profile.photo) {
      try {
        // Assuming photo is a full URL or base64. 
        // If it's a relative path, you might need to prepend the backend URL.
        const photoUrl = pdfData.profile.photo.startsWith('http')
          ? pdfData.profile.photo
          : `${ep1.defaults.baseURL}/${pdfData.profile.photo}`;

        // Note: addImage might fail if Cross-Origin issues exist. 
        // In a real app, you might need to fetch the image as blob/base64 first.
        doc.addImage(photoUrl, 'JPEG', 486, 201, 78, 98);
      } catch (e) {
        console.warn("Could not add photo to PDF", e);
        drawText("Photo", 505, 255, 10);
      }
    } else {
      drawText("Photo", 505, 255, 10);
    }

    // Updated start Y for the table
    // Previous subTableY was ~280
    // Let's check where subTableY is used.
    // If it's not defined here, I might need to replace where it's defined.
    // Looking at the next lines in file...
    // It seems subTableY isn't defined in this chunk. I should verify if I need to update it.
    // The view_file output stopped at 350. The initialization is likely below.
    // I will replace this chunk and assume subTableY needs update if it was based on static Y.
    // Wait, the previous file had subTableY used later. Let's assume I need to find where subTableY is.
    // For now, let's just update the profile section.



    // Student's Profile heading
    drawText("Student's  Profile", 30, 280, 14, true);


    // Profile fields
    let currentY = 320;
    const lineGap = 35;
    const leftLabelX = 40;
    const leftValueX = 180;
    const rightLabelX = 350;
    const rightValueX = 450;
    const endX = 565;

    // Helper for profile row
    const drawProfileRow = (label, value, y) => {
      drawText(label, leftLabelX, y, 12, true);
      drawText(":", leftLabelX + 130, y, 12, true); // Colon alignment
      drawLine(leftValueX, y + 3, endX, y + 3, 1);
      drawText(value || "", leftValueX + 5, y, 12);
    };

    // Helper for split row (2 items)
    const drawSplitRow = (label1, value1, label2, value2, y) => {
      // First item
      drawText(label1, leftLabelX, y, 12, true);
      drawText(":", leftLabelX + 130, y, 12, true);
      drawLine(leftValueX, y + 3, rightLabelX - 10, y + 3, 1);
      drawText(value1 || "", leftValueX + 5, y, 12);

      // Second item
      drawText(label2, rightLabelX, y, 12, true);
      drawText(":", rightLabelX + 90, y, 12, true);
      drawLine(rightValueX, y + 3, endX, y + 3, 1);
      drawText(value2 || "", rightValueX + 5, y, 12);
    };

    // Student Name
    drawProfileRow("Student's Name", pdfData.profile.name, currentY);
    currentY += lineGap;

    // Father's Name
    drawProfileRow("Father's Name", pdfData.profile.father, currentY);
    currentY += lineGap;

    // Mother's Name
    drawProfileRow("Mother's Name", pdfData.profile.mother, currentY);
    currentY += lineGap;

    // Resi. Address
    drawProfileRow("Resi. Address", pdfData.profile.address, currentY);
    currentY += lineGap;

    // Class & Section
    drawSplitRow("Class", pdfData.classtype || semester, "Section", pdfData.profile.section, currentY);
    currentY += lineGap;

    // Roll No. & Date of Birth
    drawSplitRow("Roll No.", pdfData.profile.rollNo, "Date of Birth", pdfData.profile.dob, currentY);
    currentY += lineGap;

    // Admission No. & Contact No.
    drawSplitRow("Admission No.", pdfData.profile.admissionNo, "Contact No.", pdfData.profile.contact, currentY);
    currentY += lineGap;

    // CBSE Reg. No.
    drawProfileRow("CBSE Reg. No.", pdfData.profile.cbseRegNo || "", currentY);
    currentY += lineGap;

    // ATTENDANCE Table
    // ATTENDANCE Table
    const tableX = 58;
    const tableY = 600;
    const col1W = 180;
    const col2W = 150;
    const col3W = 150;
    const rowH = 25;

    // Draw Header Row
    drawRect(tableX, tableY, col1W + col2W + col3W, rowH, { lineWidth: 1.5, fillColor: [230, 230, 230] }); // Light gray header
    drawText("Attendance", tableX + 45, tableY + 17, 12, true);
    drawText("Term-I", tableX + col1W + 50, tableY + 17, 12, true);
    drawText("Term-II", tableX + col1W + col2W + 50, tableY + 17, 12, true);

    // Draw Data Rows
    const drawAttendanceRow = (label, t1, t2, index) => {
      const y = tableY + rowH * (index + 1);
      drawRect(tableX, y, col1W + col2W + col3W, rowH, { lineWidth: 1 });

      // Vertical dividers
      drawLine(tableX + col1W, y, tableX + col1W, y + rowH, 1);
      drawLine(tableX + col1W + col2W, y, tableX + col1W + col2W, y + rowH, 1);

      drawText(label, tableX + 10, y + 17, 12, true);
      drawText(String(t1), tableX + col1W + 65, y + 17, 12);
      drawText(String(t2), tableX + col1W + col2W + 65, y + 17, 12);
    };

    drawAttendanceRow("Total Working Days", pdfData.attendance.term1.working || "-", pdfData.attendance.term2.working || "-", 0);
    drawAttendanceRow("Total Attendance", pdfData.attendance.term1.present || "-", pdfData.attendance.term2.present || "-", 1);

    // Signature lines
    drawText("Class Teacher's Signature", 40, 800, 12, true);
    drawText("Parent's Signature", 400, 800, 12, true);



    // ==================== SORTING & CALCULATION LOGIC ====================

    // Helper to extract numeric value from mark
    const getMarkValue = (mark) => {
      const num = parseFloat(mark);
      return isNaN(num) ? 0 : num;
    };

    // Calculate total score for sorting (Term 1 + Term 2 Total)
    const processedSubjects = pdfData.subjects.map(sub => {
      const t1 = getMarkValue(sub.term1Total);
      const t2 = getMarkValue(sub.term2Total);
      return {
        ...sub,
        totalScore: t1 + t2, // Used for sorting
        t1Value: t1,
        t2Value: t2
      };
    });

    // Sort descending by total score
    processedSubjects.sort((a, b) => b.totalScore - a.totalScore);

    // 1. Logic Separation based on 'isAdditional' flag
    const scholasticSubjects = processedSubjects.filter(sub =>
      !sub.isAdditional || sub.isAdditional === 'false' || sub.isAdditional === false
    );
    const additionalSubjects = processedSubjects.filter(sub =>
      sub.isAdditional === 'true' || sub.isAdditional === true
    );

    // Filter Failed Subjects (Compartment)
    // Criteria: Term 2 Grade starts with 'E' OR Term 2 Total < 33 (assuming 33 is pass)
    const failedSubjects = processedSubjects.filter(sub => {
      const grade = sub.term2Grade ? sub.term2Grade.toUpperCase() : '';
      // Check if grade is E, E1, E2
      if (grade.startsWith('E')) return true;
      // Check marks if grade is missing or ambiguous
      const marks = parseFloat(sub.term2Total);
      if (!isNaN(marks) && marks < 33) return true;
      return false;
    });

    // Calculate Totals for Scholastic Only
    let grandT1 = 0;
    let grandT2 = 0;

    scholasticSubjects.forEach(sub => {
      grandT1 += sub.t1Value;
      grandT2 += sub.t2Value;
    });
    grandT1 = parseFloat(grandT1.toFixed(1));
    grandT2 = parseFloat(grandT2.toFixed(1));

    // 50% Weighting Calculation
    const weightedT1 = parseFloat((grandT1 * 0.5).toFixed(1));
    const weightedT2 = parseFloat((grandT2 * 0.5).toFixed(1));
    const recalculatedGrandTotal = parseFloat((weightedT1 + weightedT2).toFixed(1));

    // Max marks calculation: 
    // 5 subjects * 100 marks per subject = 500 max marks total per term.
    // Weighted max per term = 250.
    // Total Weighted Max = 500.

    const overallPercentage = scholasticSubjects.length > 0
      ? (recalculatedGrandTotal / (scholasticSubjects.length * 100)) * 100
      : 0;

    // Helper for overall grade
    const calculateGrade = (percentage) => {
      if (percentage >= 91) return "A1";
      if (percentage >= 81) return "A2";
      if (percentage >= 71) return "B1";
      if (percentage >= 61) return "B2";
      if (percentage >= 51) return "C1";
      if (percentage >= 41) return "C2";
      if (percentage >= 33) return "D";
      return "E";
    };

    const overallGrade = calculateGrade(overallPercentage);


    // ==================== PAGE 3: SCHOLASTIC AREAS ====================
    doc.addPage();

    // Colored border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });

    // Title
    drawText("PART I - SCHOLASTIC AREAS", 195, 60, 16, true);

    // Main subjects table
    // Main subjects table
    const subTableX = 20;
    let subTableY = 90;
    const totalW = 555;
    const subjectColW = 100; // Increased for Subject
    const colW = 38; // 38 * 12 = 456. Total = 556. Approx.

    // Header Heights
    const headerRow1H = 25;
    const headerRow2H = 100; // Vertical text area
    const headerRow3H = 20; // Marks row

    // Draw Headers
    // Row 1: Term Headers
    drawRect(subTableX, subTableY, subjectColW, headerRow1H + headerRow2H + headerRow3H, { lineWidth: 1 }); // Subject cell spanning 3 rows
    drawText("SUBJECT", subTableX + 25, subTableY + 70, 10, true); // Centered roughly

    // Term 1 Header
    drawRect(subTableX + subjectColW, subTableY, colW * 6, headerRow1H, { lineWidth: 1, fillColor: [240, 240, 240] });
    drawText("TERM-I (100 MARKS)", subTableX + subjectColW + 60, subTableY + 17, 10, true);

    // Term 2 Header
    drawRect(subTableX + subjectColW + (colW * 6), subTableY, colW * 6, headerRow1H, { lineWidth: 1, fillColor: [240, 240, 240] });
    drawText("TERM-II (100 MARKS)", subTableX + subjectColW + (colW * 6) + 60, subTableY + 17, 10, true);

    // Row 2: Vertical Headers
    const headers = [
      "Pre Mid Term", "Note Book", "Sub. Enrichment", "Mid Term Exam", "Marks Obtained", "GRADE",
      "Post Mid Term", "Note Book", "Sub. Enrichment", "Annual Exam", "Marks Obtained", "GRADE"
    ];

    let currentX = subTableX + subjectColW;
    const verticalTextY = subTableY + headerRow1H + 90; // Bottom of text (since rotated 90deg, anchor is bottom-left usually)

    headers.forEach((h, i) => {
      drawRect(currentX, subTableY + headerRow1H, colW, headerRow2H, { lineWidth: 1 });
      // Vertical Text
      doc.text(h, currentX + 23, verticalTextY, { angle: 90 });
      currentX += colW;
    });

    // Row 3: Max Marks
    const maxMarks = [
      "(10)", "(5)", "(5)", "(80)", "(100)", "",
      "(10)", "(5)", "(5)", "(80)", "(100)", ""
    ];

    currentX = subTableX + subjectColW;
    maxMarks.forEach((m, i) => {
      drawRect(currentX, subTableY + headerRow1H + headerRow2H, colW, headerRow3H, { lineWidth: 1 });
      if (m) drawText(m, currentX + 8, subTableY + headerRow1H + headerRow2H + 13, 9);
      currentX += colW;
    });


    // Data Rows
    let rowY = subTableY + headerRow1H + headerRow2H + headerRow3H;
    const subRowHeight = 25;

    // Helper to draw a data row
    const drawDataRow = (name, values, isTotal = false) => {
      // Subject Name
      drawRect(subTableX, rowY, subjectColW, subRowHeight, { lineWidth: 1 });
      drawText(name.substring(0, 25), subTableX + 5, rowY + 17, isTotal ? 10 : 9, isTotal);

      // Values
      let x = subTableX + subjectColW;
      values.forEach((val, i) => {
        drawRect(x, rowY, colW, subRowHeight, { lineWidth: 1 });
        const text = String(val);
        const textWidth = doc.getTextWidth(text);
        drawText(text, x + (colW - textWidth) / 2, rowY + 17, 9, isTotal);
        x += colW;
      });
      rowY += subRowHeight;
    };

    // Scholastic Subjects
    scholasticSubjects.forEach(sub => {
      const vals = [
        sub.term1PeriodicTest || "-", sub.term1Notebook || "-", sub.term1Enrichment || "-", sub.term1MidExam || "-", sub.term1Total || "-", sub.term1Grade || "-",
        sub.term2PeriodicTest || "-", sub.term2Notebook || "-", sub.term2Enrichment || "-", sub.term2AnnualExam || "-", sub.term2Total || "-", sub.term2Grade || "-"
      ];
      drawDataRow(sub.subjectname, vals);
    });

    // Total Row
    // Term 1 Totals
    // For totals, usually we sum Max Marks? No, usually checking grand totals.
    // The image has empty cells for individual components in Total row?
    // Image shows: Total | | | | | | | | | | | |
    // If user wants empty cells or specific sums?
    // User image cuts off at Total.
    // I will show Grand Total in the "Marks Obtained" columns (index 4 and 10).
    const totalVals = ["", "", "", "", grandT1, "", "", "", "", "", grandT2, ""];
    drawDataRow("Total", totalVals, true);



    // FINAL ASSESSMENT section
    rowY += 40;
    drawText("FINAL ASSESSMENT", subTableX + 220, rowY, 14, true);

    // Final assessment table
    rowY += 35;
    const finalHeaders = ["Term - I\n(50%)", "Term - II\n(50%)", "Grand\nTotal", "Percentage", "Overall\nGrade", "Rank"];
    const finalWidths = [92, 92, 93, 92, 93, 93]; // Total: 555

    currentX = subTableX;
    finalHeaders.forEach((header, i) => {
      drawRect(currentX, rowY, finalWidths[i], 40, { lineWidth: 1, fillColor: [240, 240, 240] });
      const lines = header.split('\n');
      lines.forEach((line, j) => {
        const textWidth = doc.getTextWidth(line);
        drawText(line, currentX + (finalWidths[i] - textWidth) / 2, rowY + 18 + (j * 10), 10, true);
      });
      currentX += finalWidths[i];
    });

    // Final assessment data row
    rowY += 40;
    currentX = subTableX;

    // Using Recalculated Values
    const finalValues = [
      weightedT1,
      weightedT2,
      recalculatedGrandTotal,
      `${overallPercentage.toFixed(2)}%`,
      overallGrade, // Recalculated
      pdfData.rank || "-"
    ];

    finalValues.forEach((value, i) => {
      drawRect(currentX, rowY, finalWidths[i], 30, { lineWidth: 1 });
      const text = String(value);
      const textWidth = doc.getTextWidth(text);
      drawText(text, currentX + (finalWidths[i] - textWidth) / 2, rowY + 20, 11);
      currentX += finalWidths[i];
    });

    // Class Teacher's Remark - Expanded to bottom of page

    // Check space. If < 150 points left, add new page
    if (rowY > 650) {
      doc.addPage();
      drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor }); // Outer Green Border
      // Inner black border
      drawRect(20, 20, 555, 802, { lineWidth: 1.5 });
      rowY = 50;
    } else {
      rowY += 40; // Add some padding from previous table
    }

    // Calculate remaining height to bottom margin (leaving space for signature or bottom border)
    // Bottom border is at 822 (outer) / 802 (inner). Let's say usable bottom is 802.
    // Leave 10px buffer. 
    const bottomLimit = 802;
    const availableHeight = bottomLimit - rowY; // Use all remaining space

    // Ensure minimum height of 150
    const remarkBoxHeight = Math.max(availableHeight, 150);

    drawRect(subTableX, rowY, totalW, remarkBoxHeight, { lineWidth: 1 });
    drawText("Class Teacher's Remark:", subTableX + 10, rowY + 20, 12, true);

    // Allow wrapping for long remarks
    const remarkText = pdfData.remarks || "-";
    const splitRemark = doc.splitTextToSize(remarkText, totalW - 40); // wrap within box width
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(splitRemark, subTableX + 20, rowY + 40);

    // ==================== PAGE 4: CO-SCHOLASTIC AREAS ====================
    doc.addPage();

    // Colored border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
    // Inner border
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    // PART II heading
    drawText("PART II - CO-SCHOLASTIC AREAS : [ON 3-POINT (A-C) GRADING SCALE]", 30, 60, 12, true);

    // Co-scholastic table
    const coTableX = 30;
    let coTableY = 90;
    const coTableW = 535;
    const coTableH = 130;

    // Main table border
    drawRect(coTableX, coTableY, coTableW, coTableH, { lineWidth: 1.5 });

    // Column headers
    drawRect(coTableX, coTableY, coTableW, 25, { lineWidth: 1, fillColor: [242, 242, 242] });

    // Vertical lines for columns
    drawLine(coTableX + 280, coTableY, coTableX + 280, coTableY + coTableH, 1);
    drawLine(coTableX + 380, coTableY, coTableX + 380, coTableY + coTableH, 1);

    // Headers
    drawText("Grade", coTableX + 320, coTableY + 13, 11, true);
    drawText("Grade", coTableX + 420, coTableY + 13, 11, true);
    drawText("(Term I)", coTableX + 310, coTableY + 22, 9);
    drawText("(Term II)", coTableX + 410, coTableY + 22, 9);

    // Co-scholastic data rows - TRACK END Y
    currentY = coTableY + 40; // Start after header
    pdfData.coScholastic.forEach((item, idx) => {
      const rowY = coTableY + 40 + (idx * 25);
      currentY = rowY + 25; // Update currentY to bottom of this row

      // Horizontal line
      drawLine(coTableX, rowY - 15, coTableX + coTableW, rowY - 15, 0.5);

      // Area name
      drawText(item.area, coTableX + 5, rowY - 3, 9);

      // Grades
      drawText(item.term1Grade || "-", coTableX + 320, rowY - 3, 10);
      drawText(item.term2Grade || "-", coTableX + 420, rowY - 3, 10);
    });

    // ==================== PART III: ADDITIONAL SUBJECTS (INLINE) ====================
    if (additionalSubjects.length > 0) {
      // Ensure we start below the table border OR the last row, whichever is lower
      currentY = Math.max(currentY, coTableY + coTableH) + 40; // Safe spacing

      // PART III heading
      drawText("ADDITIONAL SUBJECT", 30, currentY, 12, true);
      currentY += 20;

      // Additional Subjects Table
      const addTableX = 30;
      let addTableY = currentY;
      const addTableW = 535;

      // Table Header
      drawRect(addTableX, addTableY, addTableW, 50, { lineWidth: 1, fillColor: [242, 242, 242] });

      // AREA Column
      drawRect(addTableX, addTableY, 250, 50, { lineWidth: 1 });
      drawText("AREA", addTableX + 100, addTableY + 30, 11, true);

      // TERM I Header
      drawRect(addTableX + 250, addTableY, 142.5, 25, { lineWidth: 1 });
      drawText("TERM - I", addTableX + 290, addTableY + 17, 10, true);

      // TERM II Header
      drawRect(addTableX + 392.5, addTableY, 142.5, 25, { lineWidth: 1 });
      drawText("TERM - II", addTableX + 435, addTableY + 17, 10, true);

      // Subheaders
      drawRect(addTableX + 250, addTableY + 25, 71.25, 25, { lineWidth: 1 });
      drawText("MARKS", addTableX + 260, addTableY + 42, 9, true);

      drawRect(addTableX + 321.25, addTableY + 25, 71.25, 25, { lineWidth: 1 });
      drawText("GRADE", addTableX + 331, addTableY + 42, 9, true);

      drawRect(addTableX + 392.5, addTableY + 25, 71.25, 25, { lineWidth: 1 });
      drawText("MARKS", addTableX + 402, addTableY + 42, 9, true);

      drawRect(addTableX + 463.75, addTableY + 25, 71.25, 25, { lineWidth: 1 });
      drawText("GRADE", addTableX + 473, addTableY + 42, 9, true);

      // Data Rows
      let addRowY = addTableY + 50;
      const addRowH = 30;

      additionalSubjects.forEach((sub) => {
        drawRect(addTableX, addRowY, addTableW, addRowH, { lineWidth: 1 });

        // Divider Lines
        drawLine(addTableX + 250, addRowY, addTableX + 250, addRowY + addRowH, 1);
        drawLine(addTableX + 321.25, addRowY, addTableX + 321.25, addRowY + addRowH, 1);
        drawLine(addTableX + 392.5, addRowY, addTableX + 392.5, addRowY + addRowH, 1);
        drawLine(addTableX + 463.75, addRowY, addTableX + 463.75, addRowY + addRowH, 1);

        // Area Name
        const addSubNameWidth = doc.getTextWidth(sub.subjectname);
        if (addSubNameWidth > 240) {
          doc.setFontSize(9);
          const splitSub = doc.splitTextToSize(sub.subjectname, 240);
          doc.text(splitSub, addTableX + 10, addRowY + 12);
          doc.setFontSize(10);
        } else {
          drawText(sub.subjectname, addTableX + 10, addRowY + 20, 10, true);
        }

        // Values
        // Term 1 Marks/Grade
        drawText(String(sub.term1Total || "-"), addTableX + 270, addRowY + 20, 10);
        drawText(String(sub.term1Grade || "-"), addTableX + 340, addRowY + 20, 10);

        // Term 2 Marks/Grade
        drawText(String(sub.term2Total || "-"), addTableX + 410, addRowY + 20, 10);
        drawText(String(sub.term2Grade || "-"), addTableX + 480, addRowY + 20, 10);

        addRowY += addRowH;
      });

      currentY = addRowY; // Update main cursor
    }

    // ==================== COMPARTMENT TABLE ====================
    if (failedSubjects.length > 0) {
      // Ensure formatting spacing
      currentY = Math.max(currentY, coTableY + coTableH) + 40;

      // Title
      const compTitle = "DETAILS OF COMPARTMENT EXAMINATION";
      const titleW = doc.getTextWidth(compTitle);
      drawText(compTitle, (595 - titleW) / 2, currentY, 14, true); // Centered (A4 width ~595)

      currentY += 20;

      // Table formatting
      const compTableX = 30;
      const compTableW = 535;
      const compHeaderH = 30;
      const compRowH = 25;

      // Column Widths from image approximation
      // SR NO | SUBJECT | MAX MARKS | MARKS OBTAINED | RESULT
      const cw1 = 40; // Sr No
      const cw3 = 80; // Max Marks
      const cw4 = 100; // Marks Obtained
      const cw5 = 80; // Result
      const cw2 = compTableW - cw1 - cw3 - cw4 - cw5; // Subject (Remaining)

      const cx1 = compTableX;
      const cx2 = cx1 + cw1;
      const cx3 = cx2 + cw2;
      const cx4 = cx3 + cw3;
      const cx5 = cx4 + cw4;

      // Header Row
      drawRect(cx1, currentY, cw1, compHeaderH, { lineWidth: 1, fillColor: [240, 240, 240] });
      drawRect(cx2, currentY, cw2, compHeaderH, { lineWidth: 1, fillColor: [240, 240, 240] });
      drawRect(cx3, currentY, cw3, compHeaderH, { lineWidth: 1, fillColor: [240, 240, 240] });
      drawRect(cx4, currentY, cw4, compHeaderH, { lineWidth: 1, fillColor: [240, 240, 240] });
      drawRect(cx5, currentY, cw5, compHeaderH, { lineWidth: 1, fillColor: [240, 240, 240] });

      // Header Text
      // Centering helper
      const centerText = (txt, x, w, y) => {
        const tw = doc.getTextWidth(txt);
        doc.text(txt, x + (w - tw) / 2, y);
      };

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      centerText("SR.\nNO.", cx1, cw1, currentY + 12);
      centerText("SUBJECT", cx2, cw2, currentY + 18);
      centerText("MAX\nMARKS", cx3, cw3, currentY + 12); // Multiline
      centerText("MARKS\nOBTAINED", cx4, cw4, currentY + 12);
      centerText("RESULT", cx5, cw5, currentY + 18);

      currentY += compHeaderH;

      // Data Rows
      failedSubjects.forEach((sub, idx) => {
        drawRect(cx1, currentY, cw1, compRowH, { lineWidth: 1 });
        drawRect(cx2, currentY, cw2, compRowH, { lineWidth: 1 });
        drawRect(cx3, currentY, cw3, compRowH, { lineWidth: 1 });
        drawRect(cx4, currentY, cw4, compRowH, { lineWidth: 1 });
        drawRect(cx5, currentY, cw5, compRowH, { lineWidth: 1 });

        doc.setFont("helvetica", "normal");
        centerText(String(idx + 1), cx1, cw1, currentY + 16);
        drawText(sub.subjectname, cx2 + 5, currentY + 16, 10); // Left align subject
        centerText("80", cx3, cw3, currentY + 16); // Hardcoded 80 based on requirements

        // Empty columns for Marks Obtained and Result

        currentY += compRowH;
      });
    }

    // Promotion section - Dynamic Y
    // Ensure we don't overlap if previous content pushed lower than 480
    // But user wants it in the empty space, so let's start after currentY with some padding.
    // Origin was 480.
    let promotionY = Math.max(480, currentY + 40);
    drawText("Congratulations Promoted to Class :", 30, promotionY, 12, true);
    drawLine(250, promotionY + 3, 550, promotionY + 3, 1);
    drawText(pdfData.promotedToClass || "", 260, promotionY, 12);

    // Display Rank
    drawText(`Rank: ${pdfData.rank || '-'}`, 450, promotionY - 20, 12, true);

    promotionY += 30;
    drawText("New Session begins on :", 30, promotionY, 12, true);
    drawLine(180, promotionY + 3, 550, promotionY + 3, 1);

    // Format Date to DD/MM/YYYY
    let sessionDate = pdfData.newSessionDate || "";
    if (sessionDate && sessionDate.includes('-')) {
      const [yyyy, mm, dd] = sessionDate.split('-');
      if (yyyy && mm && dd && yyyy.length === 4) {
        sessionDate = `${dd}/${mm}/${yyyy}`;
      }
    }
    drawText(sessionDate, 190, promotionY, 12);

    // Signature section
    drawText("Exam I/C Signature", 50, 800, 12, true);
    drawText("Principal's Signature", 400, 800, 12, true);





    // ==================== PAGE 5: INSTRUCTIONS ====================
    doc.addPage();

    // Colored outer border
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    // Instructions title
    drawText("Instructions", 250, 70, 18, true);

    // First grading scale section
    drawText("Grading Scale for scholastic area : Grades are awarded on 8-point grading scale as follows :-", 40, 110, 12, true);

    // First table - Scholastic grading scale
    let table1X = 80;
    let table1Y = 140;
    const table1W = 435;
    const table1H = 240;
    const table1Rows = 9;
    const rowHeight = table1H / table1Rows;

    // Table border
    drawRect(table1X, table1Y, table1W, table1H, { lineWidth: 1.5 });

    // Vertical divider
    drawLine(table1X + table1W / 2, table1Y, table1X + table1W / 2, table1Y + table1H, 1.5);

    // Horizontal lines
    for (let i = 1; i < table1Rows; i++) {
      const y = table1Y + (i * rowHeight);
      drawLine(table1X, y, table1X + table1W, y, 1);
    }

    // Headers
    drawText("MARKS RANGE", table1X + 80, table1Y + 20, 12, true);
    drawText("GRADE", table1X + table1W / 2 + 80, table1Y + 20, 12, true);

    // Data
    const scholasticGrades = [
      ['91-100', 'A1'],
      ['81-90', 'A2'],
      ['71-80', 'B1'],
      ['61-70', 'B2'],
      ['51-60', 'C1'],
      ['41-50', 'C2'],
      ['33-40', 'D'],
      ['32 & Below', 'E (Failed)']
    ];

    scholasticGrades.forEach((row, i) => {
      const y = table1Y + ((i + 2) * rowHeight) - 10;
      drawText(row[0], table1X + 80, y, 11);
      drawText(row[1], table1X + table1W / 2 + 80, y, 11);
    });

    // Second grading scale section - Co-Scholastic
    drawText("Grading Scale for Co-Scholastic areas : Grades are awarded on 3-point grading scale as", 40, 415, 12, true);
    drawText("follows :-", 40, 430, 12, true);

    // Second table - Co-Scholastic grading scale (3-point)
    let table2X = 80;
    let table2Y = 455;
    const table2W = 435;
    const table2H = 120;
    const table2Rows = 4;
    const row2Height = table2H / table2Rows;

    // Table border
    drawRect(table2X, table2Y, table2W, table2H, { lineWidth: 1.5 });

    // Vertical divider
    drawLine(table2X + table2W / 2, table2Y, table2X + table2W / 2, table2Y + table2H, 1.5);

    // Horizontal lines
    for (let i = 1; i < table2Rows; i++) {
      const y = table2Y + (i * row2Height);
      drawLine(table2X, y, table2X + table2W, y, 1);
    }

    // Headers
    drawText("GRADE", table2X + 80, table2Y + 20, 12, true);
    drawText("GRADE POINT", table2X + table2W / 2 + 80, table2Y + 20, 12, true);

    // Data for Co-Scholastic 3-point scale
    const coScholasticGrades = [
      ['A', '5 (Outstanding)'],
      ['B', '4 (Very Good)'],
      ['C', '3 (Fair)']
    ];

    coScholasticGrades.forEach((row, i) => {
      const y = table2Y + ((i + 2) * row2Height) - 8;
      drawText(row[0], table2X + 80, y, 11);
      drawText(row[1], table2X + table2W / 2 + 80, y, 11);
    });

    return doc;
  };



  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Marksheet View (Class 9-10)
      </Typography>

      {/* Search Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Registration Number"
                value={regno}
                onChange={(e) => setRegno(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchMarks()}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                {availableSemesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Academic Year"
                value={academicyear}
                onChange={(e) => setAcademicyear(e.target.value)}
              >
                {availableYears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={fetchMarks}
                disabled={loading || !semester || !academicyear}
                fullWidth
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Marksheet Display */}
      {marks.length > 0 && (
        <Card>
          <CardContent>
            {/* Student Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5">
                {marks[0].studentname} - {marks[0].regno}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Class: {semester} | Academic Year: {academicyear}
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Term 1 Marks */}
            <Typography variant="h6" gutterBottom color="primary">
              Term I Marks
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell align="center">Periodic (10)</TableCell>
                    <TableCell align="center">Notebook (5)</TableCell>
                    <TableCell align="center">Enrichment (5)</TableCell>
                    <TableCell align="center">Mid Exam (80)</TableCell>
                    <TableCell align="center">Total (100)</TableCell>
                    <TableCell align="center">Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marks.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.subjectname}</TableCell>
                      <TableCell align="center">{row.term1PeriodicTest}</TableCell>
                      <TableCell align="center">{row.term1Notebook}</TableCell>
                      <TableCell align="center">{row.term1Enrichment}</TableCell>
                      <TableCell align="center">{row.term1MidExam}</TableCell>
                      <TableCell align="center">{row.term1Total}</TableCell>
                      <TableCell align="center">{row.term1Grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Term 2 Marks */}
            <Typography variant="h6" gutterBottom color="primary">
              Term II Marks
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Subject</TableCell>
                    <TableCell align="center">Periodic (10)</TableCell>
                    <TableCell align="center">Notebook (5)</TableCell>
                    <TableCell align="center">Enrichment (5)</TableCell>
                    <TableCell align="center">Annual Exam (80)</TableCell>
                    <TableCell align="center">Total (100)</TableCell>
                    <TableCell align="center">Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {marks.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.subjectname}</TableCell>
                      <TableCell align="center">{row.term2PeriodicTest}</TableCell>
                      <TableCell align="center">{row.term2Notebook}</TableCell>
                      <TableCell align="center">{row.term2Enrichment}</TableCell>
                      <TableCell align="center">{row.term2AnnualExam}</TableCell>
                      <TableCell align="center">{row.term2Total}</TableCell>
                      <TableCell align="center">{row.term2Grade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
              >
                Print View
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleOpenPdfDialog}
                disabled={downloading}
              >
                {downloading ? 'Processing...' : 'Generate Report'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Generation Options Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Report Card</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Class Teacher's Remarks"
              fullWidth
              multiline
              rows={3}
              value={pdfParams.remarks}
              onChange={(e) => setPdfParams({ ...pdfParams, remarks: e.target.value })}
              placeholder="Enter remarks..."
            />

            <TextField
              select
              label="Promoted to Class"
              fullWidth
              value={pdfParams.promotedToClass}
              onChange={(e) => setPdfParams({ ...pdfParams, promotedToClass: e.target.value })}
              helperText="Select the class student is promoted to"
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {availableSemesters.map((sem) => (
                <MenuItem key={sem} value={sem}>{sem}</MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="New Session Begins On"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={pdfParams.newSessionDate}
              onChange={(e) => setPdfParams({ ...pdfParams, newSessionDate: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateClick} startIcon={<DownloadIcon />}>
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentMarksheetViewPageds;
