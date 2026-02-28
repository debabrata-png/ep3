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

const StudentMarksheetViewPageKGds = () => {
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
    remarksTerm1: '',
    remarksTerm2: '',
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
      // Use the existing endpoint which returns marks data. We will re-process this data for KG logic.
      const response = await ep1.get('/api/v2/getmarksheetpdfdata9ds', {
        params: {
          colid: global1.colid,
          regno,
          semester,
          academicyear
        }
      });

      if (response.data.success) {
        if (response.data.data && response.data.data.subjects) {
          setMarks(response.data.data.subjects);
          setFullPdfData(response.data.data);
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
      remarksTerm1: pdfParams.remarksTerm1 || fullPdfData.remarksTerm1,
      remarksTerm2: pdfParams.remarksTerm2 || fullPdfData.remarksTerm2,
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
      unit: "pt",
      format: "a4",
    });

    // --- HELPER FUNCTIONS ---
    const drawText = (text, x, y, size = 12, bold = false, color = [0, 0, 0], align = 'left') => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      doc.text(String(text), x, y, { align: align });
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

    // Helper to center text in a box
    const drawCenteredText = (text, x, y, w, h, size = 10, bold = false) => {
      const textWidth = doc.getTextWidth(String(text));
      const textX = x + (w - textWidth) / 2;
      const textY = y + (h / 2) + (size / 3); // Vertical center approx
      drawText(text, textX, textY, size, bold);
    };

    const getBorderColor = () => [128, 0, 128]; // Purple for Nursery-KG
    const mainBorderColor = getBorderColor();

    // --- PAGE 1: PERFORMANCE PROFILE ---

    // Borders
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    // --- HEADER ---
    const logoY = 50;
    const logoSize = 65;
    const schoolLogoWidth = 100;
    const schoolLogoHeight = 60;
    const topTextY = 35;
    const centerX = 297.5;

    // 1. Top Row: School Code (Left) & UDISE Code (Right)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    doc.text(`School Code: ${pdfData.school?.schoolcode || ''}`, 30, topTextY);
    doc.text(`UDISE Code: ${pdfData.school?.udisecode || ''}`, 565, topTextY, { align: 'right' });

    // 2. Logos (School Left, CBSE Right)
    try {
      const schoolLogoImg = new Image();
      schoolLogoImg.src = '/CPS.jpeg';
      doc.addImage(schoolLogoImg, 'JPEG', 30, logoY + 15, schoolLogoWidth, schoolLogoHeight);
    } catch (e) { }

    try {
      const cbseLogoImg = new Image();
      cbseLogoImg.src = '/CBSE_logo.png';
      doc.addImage(cbseLogoImg, 'PNG', 500, logoY, logoSize, logoSize);
    } catch (e) { }

    // 3. Center School Details
    let headY = 60;
    const schoolName = pdfData.school?.schoolname || "SCHOOL NAME";

    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.setTextColor(128, 0, 0); // Maroon - Cambria Bold approximation
    doc.text(schoolName.toUpperCase(), centerX, headY, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset to black

    headY += 18;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`CBSE Affiliation No. : ${pdfData.school?.affiliationno || ''}`, centerX, headY, { align: 'center' });

    headY += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const address = `${pdfData.school?.addressline1 || ''}, ${pdfData.school?.addressline2 || ''}`;

    const drawIcon = (type, x, y) => {
      const r = 5.5;
      doc.setLineWidth(0.8);
      doc.setDrawColor(0);
      doc.circle(x, y - 1, r, 'S');

      doc.setFillColor(0);

      if (type === 'location') {
        doc.circle(x, y - 2.5, 2.2, 'F');
        doc.triangle(x - 2.1, y - 2, x + 2.1, y - 2, x, y + 2, 'F');
        doc.setFillColor(255);
        doc.circle(x, y - 2.5, 0.8, 'F');
      } else if (type === 'email') {
        doc.rect(x - 3.5, y - 3, 7, 4.5, 'F');
        doc.setDrawColor(255);
        doc.setLineWidth(0.6);
        doc.line(x - 3.5, y - 3, x, y - 0.5);
        doc.line(x + 3.5, y - 3, x, y - 0.5);
        doc.setDrawColor(0);
      } else if (type === 'telephone' || type === 'phone') {
        doc.rect(x - 2.5, y - 1, 5, 2.5, 'F');
        doc.rect(x - 1, y - 2, 2, 1, 'F');
        doc.setLineWidth(1.2);
        doc.line(x - 2, y - 2, x + 2, y - 2);
        doc.circle(x - 2, y - 2, 0.8, 'F');
        doc.circle(x + 2, y - 2, 0.8, 'F');
        doc.setFillColor(255);
        doc.circle(x, y + 0.3, 0.5, 'F');
        doc.setFillColor(0);
      } else if (type === 'mobile') {
        doc.roundedRect(x - 2, y - 3.5, 4, 7, 0.8, 0.8, 'F');
        doc.setFillColor(255);
        doc.rect(x - 1.5, y - 2.2, 3, 4.5, 'F');
        doc.circle(x, y + 2.8, 0.3, 'F');
        doc.setFillColor(0);
      }
    };

    const addrW = doc.getTextWidth(address);
    doc.text(address, centerX, headY, { align: 'center' });
    drawIcon('location', centerX - (addrW / 2) - 8, headY);

    headY += 15;
    const email = pdfData.school?.email || "";
    const emailW = doc.getTextWidth(email);
    doc.text(email, centerX, headY, { align: 'center' });
    drawIcon('email', centerX - (emailW / 2) - 10, headY - 1);

    headY += 15;
    const phone = pdfData.school?.phone || "";
    const tel = pdfData.school?.telephone || "";

    const pText = phone ? ` ${phone}` : "";
    const tText = tel ? ` ${tel}` : "";
    const separator = "   |   ";
    const pW = doc.getTextWidth(pText);
    const tW = doc.getTextWidth(tText);
    const sepW = (phone && tel) ? doc.getTextWidth(separator) : 0;
    const iconW = 12;

    const totalW = (phone ? (iconW + pW) : 0) + sepW + (tel ? (iconW + tW) : 0);
    let curX = centerX - (totalW / 2);

    if (phone) {
      drawIcon('telephone', curX + 4, headY - 2);
      doc.text(pText, curX + iconW, headY);
      curX += iconW + pW;
    }
    if (phone && tel) {
      doc.text(separator, curX, headY);
      curX += sepW;
    }
    if (tel) {
      drawIcon('mobile', curX + 4, headY - 2);
      doc.text(tText, curX + iconW, headY);
    }

    headY += 15;



    // Logo & CBSE Logo


    // Title
    drawText("PERFORMANCE  PROFILE", centerX, 210, 18, true, [0, 0, 0], 'center');

    // Session (Centered)
    const sessionText = `Session : ${pdfData.session}`;
    drawText(sessionText, centerX, 235, 14, true, [0, 0, 0], 'center');
    const sessionW = doc.getTextWidth(sessionText);
    drawLine(centerX - sessionW / 2, 237, centerX + sessionW / 2, 237, 1);

    // --- Profile Section ---
    // Photo Box
    drawRect(485, 200, 80, 100, { lineWidth: 1 });
    if (pdfData.profile && pdfData.profile.photo) {
      try {
        const photoUrl = pdfData.profile.photo.startsWith('http') ? pdfData.profile.photo : `${ep1.defaults.baseURL}/${pdfData.profile.photo}`;
        doc.addImage(photoUrl, 'JPEG', 486, 201, 78, 98);
      } catch (e) {
        drawText("Photo", 510, 250, 10);
      }
    } else {
      drawText("Photo", 510, 250, 10);
    }

    drawText("Student Profile", 30, 280, 14, true);

    let currentY = 320;
    const lineGap = 35;
    const labelX = 30;
    const valX = 150;
    const endLineX = 570;

    // Helper to format date dd/mm/yyyy
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return as is if invalid
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const drawLineItem = (label, value) => {
      drawText(label, labelX, currentY, 12, true);
      drawText(":", labelX + 110, currentY, 12, true);
      drawLine(valX, currentY + 2, endLineX, currentY + 2, 1);
      drawText(value || "", valX + 10, currentY, 12);
      currentY += lineGap;
    };

    drawLineItem("Roll No.", pdfData.profile.rollNo);
    drawLineItem("Admission No.", pdfData.profile.admissionNo);
    drawLineItem("Student's Name", pdfData.profile.name);

    // Split Row for Class / Section
    drawText("Class", labelX, currentY, 12, true);
    drawText(":", labelX + 110, currentY, 12, true);
    drawLine(valX, currentY + 2, 350, currentY + 2, 1);
    const classVal = pdfData.classtype || semester;
    drawText(classVal, valX + 10, currentY, 12);

    drawText("Section", 370, currentY, 12, true);
    drawText(":", 420, currentY, 12, true);
    drawLine(430, currentY + 2, endLineX, currentY + 2, 1);
    drawText(pdfData.profile.section || "", 440, currentY, 12);
    currentY += lineGap;

    drawLineItem("Date of Birth", formatDate(pdfData.profile.dob));
    drawLineItem("Mother's Name", pdfData.profile.mother);
    drawLineItem("Father's Name", pdfData.profile.father);
    drawLineItem("Address", pdfData.profile.address);
    drawLineItem("Contact No.", pdfData.profile.contact);

    // --- Attendance Table ---
    const attY = 650;
    const attX = 30;
    const attW = 535;
    const attRowH = 25;

    // Header
    drawRect(attX, attY, attW, attRowH, { lineWidth: 1, fillColor: [240, 240, 240] });
    const col1W = 178; // 1/3
    const col2W = 178;
    drawLine(attX + col1W, attY, attX + col1W, attY + (attRowH * 3), 1);
    drawLine(attX + col1W + col2W, attY, attX + col1W + col2W, attY + (attRowH * 3), 1);

    drawCenteredText("Attendance", attX, attY, col1W, attRowH, 12, true);
    drawCenteredText("Term-I", attX + col1W, attY, col2W, attRowH, 12, true);
    drawCenteredText("Term-II", attX + col1W + col2W, attY, attW - col1W - col2W, attRowH, 12, true);

    // Rows
    const drawAttRow = (label, val1, val2, index) => {
      const y = attY + (attRowH * index);
      drawRect(attX, y, attW, attRowH, { lineWidth: 1 });
      drawLine(attX + col1W, y, attX + col1W, y + attRowH, 1);
      drawLine(attX + col1W + col2W, y, attX + col1W + col2W, y + attRowH, 1);

      drawText(label, attX + 10, y + 17, 11, true);
      drawCenteredText(String(val1), attX + col1W, y, col2W, attRowH, 11);
      drawCenteredText(String(val2), attX + col1W + col2W, y, attW - col1W - col2W, attRowH, 11);
    };

    drawAttRow("Total Working Days", pdfData.attendance.term1.working, pdfData.attendance.term2.working, 1);
    drawAttRow("Total Attendance", pdfData.attendance.term1.present, pdfData.attendance.term2.present, 2);

    // Signatures (Bottom)
    drawText("Class Teacher's Signature", 50, 780, 12, true);
    drawText("Parent's Signature", 400, 780, 12, true);


    // --- PAGE 2: SCHOLASTIC AREAS ---
    doc.addPage();
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 }); // Inner border

    // Title
    drawText("PART I - SCHOLASTIC AREAS", centerX, 50, 16, true, [0, 0, 0], 'center');

    // --- Scholastic Table ---
    const tableX = 25;
    const tableY = 70;
    const tableW = 545;
    const subColW = 100;
    const valColW = 37;

    const row1H = 25;
    const row2H = 100;
    const row3H = 20;

    // Header 1: Term Labels
    drawRect(tableX, tableY, subColW, row1H + row2H + row3H, { lineWidth: 1 }); // Subject box
    drawCenteredText("SUBJECT", tableX, tableY, subColW, row1H + row2H + row3H, 11, true);

    const term1W = valColW * 6;
    drawRect(tableX + subColW, tableY, term1W, row1H, { lineWidth: 1, fillColor: [240, 240, 240] });
    drawCenteredText("TERM-I (100 MARKS)", tableX + subColW, tableY, term1W, row1H, 10, true);

    const term2W = valColW * 6;
    drawRect(tableX + subColW + term1W, tableY, term2W, row1H, { lineWidth: 1, fillColor: [240, 240, 240] });
    drawCenteredText("TERM-II (100 MARKS)", tableX + subColW + term1W, tableY, term2W, row1H, 10, true);

    // Header 2: Vertical Vertical Headers
    const headers = [
      "Pre Mid Term", "Note Book", "Sub. Enrichment", "Mid Term Exam", "Marks Obtained", "GRADE",
      "Post Mid Term", "Note Book", "Sub. Enrichment", "Annual Exam", "Marks Obtained", "GRADE"
    ];

    let cx = tableX + subColW;
    const vy = tableY + row1H;
    headers.forEach((h) => {
      drawRect(cx, vy, valColW, row2H, { lineWidth: 1 });
      doc.text(h, cx + (valColW / 2) + 4, vy + row2H - 10, { angle: 90 });
      cx += valColW;
    });

    // Header 3: Max Marks (Centered)
    const maxMarks = ["(10)", "(5)", "(5)", "(80)", "(100)", "", "(10)", "(5)", "(5)", "(80)", "(100)", ""];
    cx = tableX + subColW;
    const my = tableY + row1H + row2H;
    maxMarks.forEach((m) => {
      drawRect(cx, my, valColW, row3H, { lineWidth: 1 });
      if (m) drawCenteredText(m, cx, my, valColW, row3H, 9);
      cx += valColW;
    });

    // Data Rows
    let dy = my + row3H;
    const dRowH = 25;

    // Filter scholastic subjects
    const scholasticSubjects = pdfData.subjects.filter(sub => !sub.isAdditional || sub.isAdditional === 'false');

    // Calculate Grand Totals for Total Row
    let gT1Obt = 0, gT2Obt = 0;
    let hasFailure = false;

    // FONT SIZE INCREASED for data
    const dataFontSize = 11;

    scholasticSubjects.forEach((sub, i) => {
      // Calculations
      // Term 1
      const t1PT = sub.term1PeriodicTest || 0;
      const t1NB = sub.term1Notebook || 0;
      const t1Enr = sub.term1Enrichment || 0;
      const t1Mid = sub.term1MidExam || 0;
      const t1Tot = (parseFloat(t1PT) + parseFloat(t1NB) + parseFloat(t1Enr) + parseFloat(t1Mid)).toFixed(1);
      const t1Grade = sub.term1Grade;

      // Term 2
      const t2PT = sub.term2PeriodicTest || 0;
      const t2NB = sub.term2Notebook || 0;
      const t2Enr = sub.term2Enrichment || 0;
      const t2Ann = sub.term2AnnualExam || 0;
      const t2Tot = (parseFloat(t2PT) + parseFloat(t2NB) + parseFloat(t2Enr) + parseFloat(t2Ann)).toFixed(1);
      const t2Grade = sub.term2Grade;

      // Check for Failure (Grade E)
      if ((t1Grade && t1Grade.toUpperCase() === 'E') || (t2Grade && t2Grade.toUpperCase() === 'E')) {
        hasFailure = true;
      }

      // Add to Grands
      gT1Obt += parseFloat(t1Tot);
      gT2Obt += parseFloat(t2Tot);

      const rowVals = [
        t1PT, t1NB, t1Enr, t1Mid, t1Tot, t1Grade,
        t2PT, t2NB, t2Enr, t2Ann, t2Tot, t2Grade
      ];

      drawRect(tableX, dy, subColW, dRowH, { lineWidth: 1 });
      const subNameWidth = doc.getTextWidth(sub.subjectname);
      if (subNameWidth > subColW - 10) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const splitSub = doc.splitTextToSize(sub.subjectname, subColW - 10);
        doc.text(splitSub, tableX + 5, dy + 12);
        doc.setFontSize(10); // reset
      } else {
        drawText(sub.subjectname, tableX + 5, dy + 17, 10);
      }

      cx = tableX + subColW;
      rowVals.forEach(v => {
        drawRect(cx, dy, valColW, dRowH, { lineWidth: 1 });
        drawCenteredText(String(v || '-'), cx, dy, valColW, dRowH, dataFontSize);
        cx += valColW;
      });
      dy += dRowH;
    });

    // Total Row (Only Totals)
    drawRect(tableX, dy, subColW, dRowH, { lineWidth: 1 });
    drawText("Total", tableX + 5, dy + 17, 11, true);

    // Draw cells for total row
    cx = tableX + subColW;
    for (let c = 0; c < 12; c++) {
      drawRect(cx, dy, valColW, dRowH, { lineWidth: 1 });
      if (c === 4) drawCenteredText(gT1Obt.toFixed(0), cx, dy, valColW, dRowH, 11, true);
      if (c === 10) drawCenteredText(gT2Obt.toFixed(0), cx, dy, valColW, dRowH, 11, true);
      cx += valColW;
    }
    dy += 10;

    // --- FINAL ASSESSMENT ---
    dy += 30;
    drawRect(tableX, dy, tableW, 25, { lineWidth: 1, fillColor: [230, 230, 230] });
    drawCenteredText("FINAL ASSESSMENT", tableX, dy, tableW, 25, 12, true);
    dy += 25;

    // Table Structure: Term I (Assessment) | Term II (Assessment)
    const halfW = tableW / 2;
    drawRect(tableX, dy, halfW, 25, { lineWidth: 1 });
    drawCenteredText("TERM - I (Assessment)", tableX, dy, halfW, 25, 11, true);
    drawRect(tableX + halfW, dy, halfW, 25, { lineWidth: 1 });
    drawCenteredText("TERM - II (Assessment)", tableX + halfW, dy, halfW, 25, 11, true);
    dy += 25;

    // Calculate Final Values
    const maxPoss = scholasticSubjects.length * 100;
    const p1 = maxPoss > 0 ? ((gT1Obt / maxPoss) * 100).toFixed(2) : 0;
    const p2 = maxPoss > 0 ? ((gT2Obt / maxPoss) * 100).toFixed(2) : 0;

    const rank = hasFailure ? '-' : (pdfData.rank || '-');

    const finalRows = [
      { label: "Maximum Marks", v1: maxPoss, v2: maxPoss },
      { label: "Marks Obtained", v1: gT1Obt.toFixed(0), v2: gT2Obt.toFixed(0) },
      { label: "Percentage", v1: `${p1}%`, v2: `${p2}%` },
      { label: "Rank", v1: rank, v2: rank }
    ];

    const labelW = 120;
    const valueW = halfW - labelW;

    finalRows.forEach(row => {
      // Term 1 Side
      drawRect(tableX, dy, labelW, 25, { lineWidth: 1 });
      drawText(row.label, tableX + 5, dy + 17, 10, true);
      drawRect(tableX + labelW, dy, valueW, 25, { lineWidth: 1 });
      drawCenteredText(String(row.v1), tableX + labelW, dy, valueW, 25, 11);

      // Term 2 Side
      drawRect(tableX + halfW, dy, labelW, 25, { lineWidth: 1 });
      drawText(row.label, tableX + halfW + 5, dy + 17, 10, true);
      drawRect(tableX + halfW + labelW, dy, valueW, 25, { lineWidth: 1 });
      drawCenteredText(String(row.v2), tableX + halfW + labelW, dy, valueW, 25, 11);

      dy += 25;
    });

    // --- Remarks ---
    dy += 20;
    const maxY = 750; // Bottom limit inside border
    const remarkH = Math.max(100, maxY - dy); // Ensure at least 100, extend to bottom
    drawRect(tableX, dy, tableW, 30, { lineWidth: 1, fillColor: [240, 240, 240] });
    drawCenteredText("CLASS TEACHER'S REMARKS", tableX, dy, tableW, 30, 12, true);
    dy += 30;
    drawRect(tableX, dy, tableW, remarkH, { lineWidth: 1 });

    const remarkText = pdfData.remarksTerm2 || pdfData.remarksTerm1 || pdfData.remarks || "";
    if (remarkText) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(remarkText, tableW - 20);
      doc.text(lines, tableX + 10, dy + 20);
    }


    // --- PAGE 3: CO-SCHOLASTIC & ADDITIONAL ---
    doc.addPage();
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    drawCenteredText("PART II - CO-SCHOLASTIC AREAS", 20, 50, 555, 30, 16, true);

    // Co-Scholastic Table
    let cy = 90;
    const cTableX = 30;
    const cTableW = 535;
    const cRowH = 30;

    // Header
    drawRect(cTableX, cy, cTableW, 25, { lineWidth: 1, fillColor: [240, 240, 240] });
    drawCenteredText("CO-SCHOLASTIC AREAS (ON 3-POINT (A-C) GRADING SCALE)", cTableX, cy, cTableW, 25, 11, true);
    cy += 25;
    drawRect(cTableX, cy, 250, 30, { lineWidth: 1 }); // Subject
    drawCenteredText("SUBJECT", cTableX, cy, 250, 30, 11, true);
    drawRect(cTableX + 250, cy, 142, 30, { lineWidth: 1 });
    drawCenteredText("GRADE (TERM - I)", cTableX + 250, cy, 142, 30, 10, true);
    drawRect(cTableX + 392, cy, 143, 30, { lineWidth: 1 });
    drawCenteredText("GRADE (TERM - II)", cTableX + 392, cy, 143, 30, 10, true);
    cy += 30;

    pdfData.coScholastic.forEach(co => {
      drawRect(cTableX, cy, 250, cRowH, { lineWidth: 1 });
      const areaWidth = doc.getTextWidth(co.area);
      if (areaWidth > 240) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        const splitArea = doc.splitTextToSize(co.area, 240);
        doc.text(splitArea, cTableX + 10, cy + 12);
        doc.setFontSize(11); // reset
      } else {
        drawText(co.area, cTableX + 10, cy + 20, 11, true);
      }

      drawRect(cTableX + 250, cy, 142, cRowH, { lineWidth: 1 });
      drawCenteredText(co.term1Grade || '-', cTableX + 250, cy, 142, cRowH, 11);

      drawRect(cTableX + 392, cy, 143, cRowH, { lineWidth: 1 });
      drawCenteredText(co.term2Grade || '-', cTableX + 392, cy, 143, cRowH, 11);
      cy += cRowH;
    });

    cy += 40;

    // Additional Subjects
    drawCenteredText("PART III - ADDITIONAL SUBJECT", 20, cy, 555, 30, 16, true);
    cy += 40;

    const addSubjects = pdfData.subjects.filter(sub => sub.isAdditional === true || sub.isAdditional === 'true');

    if (addSubjects.length > 0) {
      drawRect(cTableX, cy, 180, 50, { lineWidth: 1 });
      drawCenteredText("AREA", cTableX, cy, 180, 50, 11, true);

      drawRect(cTableX + 180, cy, 177, 25, { lineWidth: 1 });
      drawCenteredText("TERM - I", cTableX + 180, cy, 177, 25, 11, true);

      drawRect(cTableX + 180, cy + 25, 88, 25, { lineWidth: 1 });
      drawCenteredText("MARKS", cTableX + 180, cy + 25, 88, 25, 9, true);
      drawRect(cTableX + 268, cy + 25, 89, 25, { lineWidth: 1 });
      drawCenteredText("GRADE", cTableX + 268, cy + 25, 89, 25, 9, true);

      drawRect(cTableX + 357, cy, 178, 25, { lineWidth: 1 });
      drawCenteredText("TERM - II", cTableX + 357, cy, 178, 25, 11, true);

      drawRect(cTableX + 357, cy + 25, 89, 25, { lineWidth: 1 });
      drawCenteredText("MARKS", cTableX + 357, cy + 25, 89, 25, 9, true);
      drawRect(cTableX + 446, cy + 25, 89, 25, { lineWidth: 1 });
      drawCenteredText("GRADE", cTableX + 446, cy + 25, 89, 25, 9, true);

      cy += 50;

      const calculateAddGrade = (marks) => {
        if (!marks || isNaN(marks)) return '-';
        const num = parseFloat(marks) * 2;
        if (num >= 91) return 'A1';
        if (num >= 81) return 'A2';
        if (num >= 71) return 'B1';
        if (num >= 61) return 'B2';
        if (num >= 51) return 'C1';
        if (num >= 41) return 'C2';
        if (num >= 33) return 'D';
        return 'E';
      };

      addSubjects.forEach(sub => {
        drawRect(cTableX, cy, 180, 30, { lineWidth: 1 });
        const addSubWidth = doc.getTextWidth(sub.subjectname);
        if (addSubWidth > 170) {
          doc.setFontSize(9);
          const splitSub = doc.splitTextToSize(sub.subjectname, 170);
          doc.text(splitSub, cTableX + 5, cy + 12);
          doc.setFontSize(10); // reset
        } else {
          drawText(sub.subjectname, cTableX + 5, cy + 20, 10);
        }

        const t1Total = sub.term1Total || '-';
        const t1GradeCalc = t1Total !== '-' ? calculateAddGrade(t1Total) : '-';

        drawRect(cTableX + 180, cy, 88, 30, { lineWidth: 1 });
        drawCenteredText(String(t1Total), cTableX + 180, cy, 88, 30, 10);
        drawRect(cTableX + 268, cy, 89, 30, { lineWidth: 1 });
        drawCenteredText(String(t1GradeCalc), cTableX + 268, cy, 89, 30, 10);

        const t2Total = sub.term2Total || '-';
        const t2GradeCalc = t2Total !== '-' ? calculateAddGrade(t2Total) : '-';

        drawRect(cTableX + 357, cy, 89, 30, { lineWidth: 1 });
        drawCenteredText(String(t2Total), cTableX + 357, cy, 89, 30, 10);
        drawRect(cTableX + 446, cy, 89, 30, { lineWidth: 1 });
        drawCenteredText(String(t2GradeCalc), cTableX + 446, cy, 89, 30, 10);
        cy += 30;
      });
    }

    cy += 50;

    // Promotion Info
    drawText("Congratulations, Promoted to class:", 30, cy, 12);
    drawLine(240, cy + 2, 550, cy + 2, 1);
    drawText(pdfData.promotedToClass || "", 250, cy, 12, true);

    cy += 30;
    drawText("New Session Begins on:", 30, cy, 12);
    const sessionDate = formatDate(pdfData.newSessionDate);
    drawText(`Date:   ${sessionDate}`, 240, cy, 12, true);
    drawLine(280, cy + 2, 550, cy + 2, 1);

    // Signatures (Bottom of Page 3)
    drawText("Exam I/C Signature", 50, 780, 12, true);
    drawText("Principal's Signature", 400, 780, 12, true);


    // --- PAGE 4: INSTRUCTIONS ---
    doc.addPage();
    drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
    drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

    drawText("Instructions", centerX, 60, 18, true, [0, 0, 0], 'center');

    let iy = 100;
    drawText("Grading scale for scholastic areas : Grades are awarded on a 8-point grading", 40, iy, 12);
    iy += 15;
    drawText("scale as follows", 40, iy, 12);
    iy += 20;

    // Table 1: Scholastic Grades
    const iTableX = 80;
    const iTableW = 435;

    drawRect(iTableX, iy, iTableW, 30, { lineWidth: 1.5 });
    drawCenteredText("MARKS RANGE", iTableX, iy, iTableW / 2, 30, 12, true);
    drawCenteredText("GRADE", iTableX + iTableW / 2, iy, iTableW / 2, 30, 12, true);

    const schGrades = [
      ['91-100', 'A1'], ['81-90', 'A2'], ['71-80', 'B1'], ['61-70', 'B2'],
      ['51-60', 'C1'], ['41-50', 'C2'], ['33-40', 'D'], ['32 and Below', 'E (Needs improvement)']
    ];

    let gY = iy + 30;
    const gH = 30;
    schGrades.forEach(g => {
      drawRect(iTableX, gY, iTableW / 2, gH, { lineWidth: 1 });
      drawCenteredText(g[0], iTableX, gY, iTableW / 2, gH, 11);
      drawRect(iTableX + iTableW / 2, gY, iTableW / 2, gH, { lineWidth: 1 });
      drawCenteredText(g[1], iTableX + iTableW / 2, gY, iTableW / 2, gH, 11);
      gY += gH;
    });

    iy = gY + 40;
    drawText("Grading scale for co-scholastic areas : Grades are awarded on 3-point", 40, iy, 12);
    iy += 15;
    drawText("grading scale as follows", 40, iy, 12);
    iy += 20;

    // Table 2: Co-Scholastic
    drawRect(iTableX, iy, iTableW, 30, { lineWidth: 1.5 });
    drawCenteredText("GRADE", iTableX, iy, iTableW / 2, 30, 12, true);
    drawCenteredText("GRADE POINT", iTableX + iTableW / 2, iy, iTableW / 2, 30, 12, true);

    const coGrades = [
      ['A', '5 (Outstanding)'],
      ['B', '4 (Very Good)'],
      ['C', '3 (Fair)']
    ];

    gY = iy + 30;
    coGrades.forEach(g => {
      drawRect(iTableX, gY, iTableW / 2, gH, { lineWidth: 1 });
      drawCenteredText(g[0], iTableX, gY, iTableW / 2, gH, 11);
      drawRect(iTableX + iTableW / 2, gY, iTableW / 2, gH, { lineWidth: 1 });
      drawCenteredText(g[1], iTableX + iTableW / 2, gY, iTableW / 2, gH, 11);
      gY += gH;
    });

    // FOOTER QUOTE
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(128, 0, 128); // Purple quote
    drawCenteredText("“Education is the key that unlock the golden door to freedom”", 20, 750, 555, 30, 14, true);

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
        Student Marksheet View (Nursery - KG II)
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
                label="Class"
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

            <Alert severity="info" sx={{ mb: 2 }}>
              PDF Generation ready for Nursery-KG Format. Click "Generate Report" to preview/download.
            </Alert>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
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
              value={pdfParams.remarksTerm1}
              onChange={(e) => setPdfParams({ ...pdfParams, remarksTerm1: e.target.value })}
              placeholder="Enter remarks..."
            />

            <TextField
              select
              label="Promoted to Class"
              fullWidth
              value={pdfParams.promotedToClass}
              onChange={(e) => setPdfParams({ ...pdfParams, promotedToClass: e.target.value })}
            >
              {availableSemesters.map((sem) => (
                <MenuItem key={sem} value={sem}>
                  {sem}
                </MenuItem>
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

export default StudentMarksheetViewPageKGds;
