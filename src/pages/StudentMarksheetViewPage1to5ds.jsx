import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    Button,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Snackbar
} from '@mui/material';
import { Search, Download as DownloadIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import ep1 from '../api/ep1'; // Import API instance
import global1 from './global1'; // Import global1

const StudentMarksheetViewPage1to5ds = () => {
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [semester, setSemester] = useState('');
    const [academicyear, setAcademicyear] = useState('');
    const [regno, setRegno] = useState('');
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);
    const [marks, setMarks] = useState([]);
    const [schoolConfig, setSchoolConfig] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // PDF Generation Params
    const [pdfParams, setPdfParams] = useState({
        remarksTerm1: '',
        remarksTerm2: '',
        promotedToClass: '',
        newSessionDate: '',
    });

    const [colid, setColid] = useState(null);

    useEffect(() => {
        const storedColid = localStorage.getItem('colid');
        const globalColid = global1.colid;
        const finalColid = storedColid || globalColid;

        console.log("Colid Debug:", { storedColid, globalColid, finalColid }); // DEBUG

        if (finalColid) {
            setColid(finalColid);
            fetchSchoolConfig(finalColid);
            fetchInitialData(finalColid);
        } else {
            console.warn("No colid found in localStorage or global1");
            showSnackbar("System Error: Institution ID missing. Please login again.", "error");
        }
    }, []);

    const fetchSchoolConfig = async (cid) => {
        try {
            const response = await ep1.get('/api/v2/getschreportconfds', {
                params: { colid: cid }
            });
            if (response.data && response.data.success && response.data.data) {
                setSchoolConfig(response.data.data);
            } else if (response.data) {
                // Fallback if structure is different but data exists
                setSchoolConfig(response.data);
            }
        } catch (error) {
            console.error("Error fetching school config:", error);
        }
    };


    const fetchInitialData = async (cid) => {
        try {
            const response = await ep1.get('/api/v2/getdistinctsemestersandyears9ds', {
                params: { colid: cid }
            });

            if (response.data && response.data.success) {
                const sems = response.data.semesters || [];
                const years = response.data.admissionyears || [];

                console.log("Fetched Data:", sems, years); // DEBUG

                setAvailableSemesters(sems);
                setAvailableYears(years);

                // Default selection
                if (sems.length > 0) setSemester(sems[0]);
                if (years.length > 0) setAcademicyear(years[0]);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            // Fallback data for dev
            setAvailableSemesters(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']);
            setAvailableYears(['2023-2024', '2024-2025']);
        }
    };

    const fetchMarks = async () => {
        if (!regno || !semester || !academicyear) {
            showSnackbar("Please fill all search fields.", "warning");
            return;
        }

        setLoading(true);
        setMarks([]); // Clear previous
        try {
            const response = await ep1.get('/api/v2/getmarksheetpdfdata9ds', {
                params: {
                    colid,
                    regno,
                    semester,
                    academicyear
                }
            });

            if (response.data && response.data.success) {
                // The KG page structure puts data in response.data.data
                // And looks like it might return a single object or list?
                // KG page: setMarks(response.data.data.subjects); setFullPdfData(response.data.data);
                // But my logic expects an array of students?
                // Let's adapt to KG response structure which seems to be for a SINGLE student.

                const studentData = response.data.data;
                if (studentData) {
                    // Subjects are returned in creation order (by createdAt) from backend
                    setMarks([studentData]); // Wrap in array to match my existing rendering logic

                    setPdfParams(prev => ({
                        ...prev,
                        promotedToClass: studentData.promotedToClass || '',
                        newSessionDate: studentData.newSessionDate || ''
                    }));

                } else {
                    showSnackbar("No records found for this student.", "info");
                    setMarks([]);
                }
            } else {
                showSnackbar("No records found.", "info");
                setMarks([]);
            }

            // Logic handled in try block above
        } catch (error) {
            console.error("Error fetching marks:", error);
            showSnackbar("Error fetching student marks.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPdfDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleGenerateClick = async () => {
        setDownloading(true);
        // Wait for a brief moment to allow UI update
        setTimeout(async () => {
            await generateMarksheetPDF(marks[0]);
            setDownloading(false);
            setOpenDialog(false);
        }, 100);
    };


    // --- PDF GENERATION LOGIC ---
    const generateMarksheetPDF = (pdfData) => {
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth(); // 595
        const pageHeight = doc.internal.pageSize.getHeight(); // 842
        const centerX = pageWidth / 2;

        const mainBorderColor = [0, 100, 0]; // Green

        // Helper Functions
        const drawRect = (x, y, w, h, opts = {}) => {
            doc.setDrawColor(0);
            if (opts.strokeColor) doc.setDrawColor(...opts.strokeColor);
            doc.setLineWidth(opts.lineWidth || 1);

            if (opts.fillColor) {
                doc.setFillColor(...opts.fillColor);
                doc.rect(x, y, w, h, 'FD'); // Fill and Draw
            } else {
                doc.rect(x, y, w, h);
            }
        };

        const drawText = (text, x, y, fontSize = 10, isBold = false, color = [0, 0, 0], align = 'left') => {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setTextColor(...color);
            doc.text(String(text), x, y, { align });
        };

        const drawCenteredText = (text, x, y, w, h, fontSize, isBold = false) => {
            drawText(text, x + w / 2, y + h / 2 + (fontSize / 3), fontSize, isBold, [0, 0, 0], 'center');
        };

        const drawLine = (x1, y1, x2, y2, width = 1) => {
            doc.setLineWidth(width);
            doc.line(x1, y1, x2, y2);
        };

        // --- PAGE 1: PROFILE & ATTENDANCE ---
        // Outer Borders
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        // --- HEADER ---
        const logoY = 50;
        const logoSize = 65;
        const schoolLogoWidth = 100;
        const schoolLogoHeight = 60;
        const topTextY = 35;

        // 1. Top Row: School Code (Left) & UDISE Code (Right)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);

        doc.text(`School Code: ${schoolConfig?.schoolcode || ''}`, 30, topTextY);
        doc.text(`UDISE Code: ${schoolConfig?.udisecode || ''}`, 565, topTextY, { align: 'right' });

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
        const schoolName = schoolConfig?.schoolname || "SCHOOL NAME";

        doc.setFontSize(22);
        doc.setFont("times", "bold");
        doc.setTextColor(128, 0, 0); // Maroon - Cambria Bold approximation
        doc.text(schoolName.toUpperCase(), centerX, headY, { align: 'center' });
        doc.setTextColor(0, 0, 0); // Reset to black

        headY += 18;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`CBSE Affiliation No. : ${schoolConfig?.affiliationno || ''}`, centerX, headY, { align: 'center' });

        headY += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const address = `${schoolConfig?.addressline1 || ''}, ${schoolConfig?.addressline2 || ''}`;

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
            } else if (type === 'telephone' || type === 'phone') {
                doc.rect(x - 2.5, y - 1, 5, 2.5, 'F');
                doc.rect(x - 1, y - 2, 2, 1, 'F');
                doc.setLineWidth(1.2);
                doc.line(x - 2, y - 2, x + 2, y - 2);
                doc.circle(x - 2, y - 2, 0.8, 'F');
                doc.circle(x + 2, y - 2, 0.8, 'F');
                doc.setFillColor(255);
                doc.circle(x, y + 0.3, 0.5, 'F');
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
        const email = schoolConfig?.email || "";
        const emailW = doc.getTextWidth(email);
        doc.text(email, centerX, headY, { align: 'center' });
        drawIcon('email', centerX - (emailW / 2) - 10, headY - 1);

        headY += 15;
        const phone = schoolConfig?.phone || "";
        const tel = schoolConfig?.telephone || "";

        const pText = phone ? ` ${phone}` : "";
        const tText = tel ? ` ${tel}` : "";
        const separator = "   |   ";
        const pW = doc.getTextWidth(pText);
        const telW = doc.getTextWidth(tText);
        const sepW = (phone && tel) ? doc.getTextWidth(separator) : 0;
        const iconW = 12;

        const totalW = (phone ? (iconW + pW) : 0) + sepW + (tel ? (iconW + telW) : 0);
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



        let y = 175; // Adjusted start Y after header

        y += 40;
        drawText("PERFORMANCE PROFILE", centerX, y, 18, true, [0, 0, 0], 'center');
        y += 25;
        // Session Centered
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const sessionText = `Session : ${pdfData.academicyear || academicyear}`;
        const sessionW = doc.getTextWidth(sessionText);
        doc.text(sessionText, centerX, 175 + 40 + 25, { align: 'center' });
        drawLine(centerX - sessionW / 2, 175 + 40 + 25 + 2, centerX + sessionW / 2, 175 + 40 + 25 + 2, 1);


        // Student Profile
        // Photo Box
        drawRect(450, 150, 100, 120, { lineWidth: 1 });
        // Try to add image if available
        if (pdfData.profile?.photo) {
            try {
                const photoUrl = pdfData.profile.photo.startsWith('http') ? pdfData.profile.photo : `${ep1.defaults.baseURL}/${pdfData.profile.photo}`;
                doc.addImage(photoUrl, 'JPEG', 451, 151, 98, 118);
            } catch (e) {
                drawText("Photo", 500, 210, 10, false, [0, 0, 0], 'center');
            }
        } else {
            drawText("Photo", 500, 210, 10, false, [0, 0, 0], 'center');
        }

        drawText("Student Profile", 30, 280, 14, true);

        let currentY = 320;
        const lineGap = 35;
        const labelX = 30;
        const valX = 150; // Compact spacing
        const endLineX = 570;

        // Helper to format date dd/mm/yyyy
        const formatDate = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
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

        // Class / Section
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


        drawLineItem("Date of Birth", formatDate(pdfData.profile.dob)); // "Date of Birth" label

        drawLineItem("Mother's Name", pdfData.profile.mother);
        drawLineItem("Father's Name", pdfData.profile.father);
        drawLineItem("Address", pdfData.profile.address);
        drawLineItem("Contact No.", pdfData.profile.contact);

        // Attributes Table (Attendance)
        const attY = 650;
        const attX = 30;
        const attW = 535;
        const attRowH = 25;

        // Header
        drawRect(attX, attY, attW, attRowH, { lineWidth: 1, fillColor: [240, 240, 240] });
        const col1W = 178;
        const col2W = 178;
        // Vertical lines
        drawLine(attX + col1W, attY, attX + col1W, attY + (attRowH * 3), 1);
        drawLine(attX + col1W + col2W, attY, attX + col1W + col2W, attY + (attRowH * 3), 1);

        drawCenteredText("Attendance", attX, attY, col1W, attRowH, 12, true);
        drawCenteredText("Term-I", attX + col1W, attY, col2W, attRowH, 12, true);
        drawCenteredText("Term-II", attX + col1W + col2W, attY, attW - col1W - col2W, attRowH, 12, true);

        // Rows
        const drawAttRow = (label, val1, val2, index) => {
            const y = attY + (attRowH * index);
            drawRect(attX, y, attW, attRowH, { lineWidth: 1 });
            // Redraw verticals to cover rect borders if needed
            drawLine(attX + col1W, y, attX + col1W, y + attRowH, 1);
            drawLine(attX + col1W + col2W, y, attX + col1W + col2W, y + attRowH, 1);

            drawText(label, attX + 10, y + 17, 11, true);
            drawCenteredText(String(val1 || '-'), attX + col1W, y, col2W, attRowH, 11);
            drawCenteredText(String(val2 || '-'), attX + col1W + col2W, y, attW - col1W - col2W, attRowH, 11);
        };

        drawAttRow("Total Working Days", pdfData.attendance?.term1?.working || '-', pdfData.attendance?.term2?.working || '-', 1);
        drawAttRow("Total Attendance", pdfData.attendance?.term1?.present || '-', pdfData.attendance?.term2?.present || '-', 2);

        // Signatures
        drawText("Class Teacher's Signature", 50, 780, 12, true);
        drawText("Parent's Signature", 400, 780, 12, true);


        // --- PAGE 2: SCHOLASTIC PART I ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        drawCenteredText("PART I - SCHOLASTIC AREAS", 20, 30, 555, 30, 16, true);

        const sTableX = 25;
        const sTableY = 70;
        const sTableW = 545;
        const subW = 100;
        const valW = 37; // For 12 columns

        const h1 = 25;
        const h2 = 100; // Vertical text height
        const h3 = 20; // Max Marks

        // Headers
        // Subject
        drawRect(sTableX, sTableY, subW, h1 + h2 + h3, { lineWidth: 1 });
        drawCenteredText("SUBJECT", sTableX, sTableY, subW, h1 + h2 + h3, 11, true);

        // Term Labels
        const tW = valW * 6;
        drawRect(sTableX + subW, sTableY, tW, h1, { lineWidth: 1, fillColor: [240, 240, 240] });
        drawCenteredText("TERM-I (100 MARKS)", sTableX + subW, sTableY, tW, h1, 10, true);
        drawRect(sTableX + subW + tW, sTableY, tW, h1, { lineWidth: 1, fillColor: [240, 240, 240] });
        drawCenteredText("TERM-II (100 MARKS)", sTableX + subW + tW, sTableY, tW, h1, 10, true);

        // Vertical Headers
        const vHeaders = [
            "Pre Mid Term", "Note Book", "Sub. Enrichment", "Mid Term Exam", "Marks Obtained", "GRADE",
            "Post Mid Term", "Note Book", "Sub. Enrichment", "Annual Exam", "Marks Obtained", "GRADE"
        ];

        let cx = sTableX + subW;
        const vy = sTableY + h1;
        vHeaders.forEach(h => {
            drawRect(cx, vy, valW, h2, { lineWidth: 1 });
            doc.text(h, cx + (valW / 2) + 4, vy + h2 - 10, { angle: 90 });
            cx += valW;
        });

        // Max Marks
        const maxMarks = ["(10)", "(5)", "(5)", "(80)", "(100)", "", "(10)", "(5)", "(5)", "(80)", "(100)", ""];
        cx = sTableX + subW;
        const my = sTableY + h1 + h2;
        maxMarks.forEach(m => {
            drawRect(cx, my, valW, h3, { lineWidth: 1 });
            if (m) drawCenteredText(m, cx, my, valW, h3, 9);
            cx += valW;
        });

        // Data Rows
        let dy = my + h3;
        const dRH = 25;
        const scholasticSubjects = pdfData.subjects.filter(sub => !sub.isAdditional || sub.isAdditional === 'false');

        // Sort logic (ensure previously sorted)

        let gT1Obt = 0;
        let gT2Obt = 0;
        let hasFailure = false;

        scholasticSubjects.forEach(sub => {
            // Calculations
            // Term 1
            const t1PT = parseFloat(sub.term1PeriodicTest || 0); // 10
            const t1NB = parseFloat(sub.term1Notebook || 0);     // 5
            const t1Enr = parseFloat(sub.term1Enrichment || 0);  // 5
            const t1Mid = parseFloat(sub.term1MidExam || 0);     // 80
            const t1Tot = (t1PT + t1NB + t1Enr + t1Mid);
            const t1Grade = sub.term1Grade;

            // Term 2
            const t2PT = parseFloat(sub.term2PeriodicTest || 0);
            const t2NB = parseFloat(sub.term2Notebook || 0);
            const t2Enr = parseFloat(sub.term2Enrichment || 0);
            const t2Ann = parseFloat(sub.term2AnnualExam || 0);
            const t2Tot = (t2PT + t2NB + t2Enr + t2Ann);
            const t2Grade = sub.term2Grade;

            // Check E Grade
            if ((t1Grade && t1Grade.toUpperCase() === 'E') || (t2Grade && t2Grade.toUpperCase() === 'E')) {
                hasFailure = true;
            }

            gT1Obt += t1Tot;
            gT2Obt += t2Tot;

            const rowVals = [
                t1PT, t1NB, t1Enr, t1Mid, t1Tot.toFixed(0), t1Grade,
                t2PT, t2NB, t2Enr, t2Ann, t2Tot.toFixed(0), t2Grade
            ];

            drawRect(sTableX, dy, subW, dRH, { lineWidth: 1 });
            const subNameWidth = doc.getTextWidth(sub.subjectname);
            if (subNameWidth > subW - 10) {
                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                const splitSub = doc.splitTextToSize(sub.subjectname, subW - 10);
                doc.text(splitSub, sTableX + 5, dy + 10);
                doc.setFontSize(10);
            } else {
                drawText(sub.subjectname, sTableX + 5, dy + 17, 10);
            }

            cx = sTableX + subW;
            rowVals.forEach(v => {
                drawRect(cx, dy, valW, dRH, { lineWidth: 1 });
                drawCenteredText(String(v || '-'), cx, dy, valW, dRH, 11);
                cx += valW;
            });
            dy += dRH;
        });

        // Total Row
        drawRect(sTableX, dy, subW, dRH, { lineWidth: 1 });
        drawText("Total", sTableX + 5, dy + 17, 11, true);

        cx = sTableX + subW;
        for (let i = 0; i < 12; i++) {
            drawRect(cx, dy, valW, dRH, { lineWidth: 1 });
            if (i === 4) drawCenteredText(gT1Obt.toFixed(0), cx, dy, valW, dRH, 11, true);
            if (i === 10) drawCenteredText(gT2Obt.toFixed(0), cx, dy, valW, dRH, 11, true);
            cx += valW;
        }
        dy += 40;

        // Final Assessment
        // Table Structure like in image:
        // Term I (50%) | Term II (50%) | Grand Total | Percentage | Overall Grade | Rank
        drawRect(sTableX, dy, sTableW, 25, { lineWidth: 1, fillColor: [230, 230, 230] });
        drawCenteredText("FINAL ASSESSMENT", sTableX, dy, sTableW, 25, 12, true);
        dy += 25;

        const faCols = ["TERM - I (50%)", "TERM - II (50%)", "Grand Total", "Percentage", "Overall Grade", "Rank"];
        const faW = sTableW / 6;

        cx = sTableX;
        faCols.forEach(c => {
            drawRect(cx, dy, faW, 30, { lineWidth: 1 });
            drawCenteredText(c, cx, dy, faW, 30, 10, true);
            cx += faW;
        });
        dy += 30;

        // Calculate Final Stats
        // Logic: 50% of T1 Total + 50% of T2 Total = Grand Total

        const t1Weighted = gT1Obt * 0.5;
        const t2Weighted = gT2Obt * 0.5;
        const grandTot = t1Weighted + t2Weighted;

        const maxPossPerTerm = scholasticSubjects.length * 100;
        const grandMax = maxPossPerTerm; // Since we took 50% + 50% = 100%

        const overallPerc = grandMax > 0 ? (grandTot / grandMax) * 100 : 0;

        const rank = hasFailure ? '-' : (pdfData.rank || '-');

        const calculateOverallGrade = (percentage) => {
            if (percentage >= 91) return 'A1';
            if (percentage >= 81) return 'A2';
            if (percentage >= 71) return 'B1';
            if (percentage >= 61) return 'B2';
            if (percentage >= 51) return 'C1';
            if (percentage >= 41) return 'C2';
            if (percentage >= 33) return 'D';
            return 'E';
        };

        const overallGradeStr = hasFailure ? 'E' : calculateOverallGrade(overallPerc);

        const faVals = [
            t1Weighted.toFixed(1),
            t2Weighted.toFixed(1),
            grandTot.toFixed(0),
            `${overallPerc.toFixed(1)}%`,
            overallGradeStr,
            rank
        ];

        cx = sTableX;
        faVals.forEach(v => {
            drawRect(cx, dy, faW, 30, { lineWidth: 1 });
            drawCenteredText(v, cx, dy, faW, 30, 11);
            cx += faW;
        });
        dy += 50;


        // Class Teacher Remarks (Moved back to Page 2)
        const pageBottom = 802; // Bottom margin reference
        const remLimit = pageBottom - dy - 20; // Available height
        if (remLimit > 40) {
            drawRect(sTableX, dy, sTableW, 25, { lineWidth: 1, fillColor: [240, 240, 240] });
            drawCenteredText("CLASS TEACHER'S REMARKS", sTableX, dy, sTableW, 25, 12, true);
            dy += 25;

            const boxH = remLimit - 25;
            drawRect(sTableX, dy, sTableW, boxH, { lineWidth: 1 });

            const remarks = pdfParams.remarksTerm1 || pdfData.remarks || "";
            if (remarks) {
                doc.setFont("helvetica", "normal");
                const lines = doc.splitTextToSize(remarks, sTableW - 20);
                const maxLines = Math.floor((boxH - 10) / 12);
                const displayLines = lines.slice(0, maxLines);
                doc.text(displayLines, sTableX + 10, dy + 20);
            }
        }



        // --- PAGE 3: CO-SCHOLASTIC & ADDITIONAL ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        drawCenteredText("PART II - CO-SCHOLASTIC AREAS", 20, 50, 555, 30, 16, true);

        let cy = 90;
        const cX = 30;
        const cW = 535;
        const cRH = 30;



        // Header
        drawRect(cX, cy, cW, 25, { lineWidth: 1, fillColor: [240, 240, 240] });

        drawCenteredText("CO-SCHOLASTIC AREAS (ON 3-POINT (A-C) GRADING SCALE)", cX, cy, cW, 25, 11, true);
        cy += 25;

        drawRect(cX, cy, 250, 30, { lineWidth: 1 });
        drawCenteredText("SUBJECT", cX, cy, 250, 30, 11, true);
        drawRect(cX + 250, cy, 142, 30, { lineWidth: 1 });
        drawCenteredText("GRADE (TERM - I)", cX + 250, cy, 142, 30, 10, true);
        drawRect(cX + 392, cy, 143, 30, { lineWidth: 1 });
        drawCenteredText("GRADE (TERM - II)", cX + 392, cy, 143, 30, 10, true);
        cy += 30;

        // Co-Scholastic Data
        if (pdfData.coScholastic) {
            pdfData.coScholastic.forEach(co => {
                drawRect(cX, cy, 250, cRH, { lineWidth: 1 });
                const areaWidth = doc.getTextWidth(co.area);
                if (areaWidth > 240) {
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    const splitArea = doc.splitTextToSize(co.area, 240);
                    doc.text(splitArea, cX + 10, cy + 12);
                    doc.setFontSize(11);
                } else {
                    drawText(co.area, cX + 10, cy + 20, 11, true);
                }
                drawRect(cX + 250, cy, 142, cRH, { lineWidth: 1 });
                drawCenteredText(co.term1Grade || '-', cX + 250, cy, 142, cRH, 11);
                drawRect(cX + 392, cy, 143, cRH, { lineWidth: 1 });
                drawCenteredText(co.term2Grade || '-', cX + 392, cy, 143, cRH, 11);
                cy += cRH;
            });
        }

        cy += 40;
        drawCenteredText("PART III - ADDITIONAL SUBJECT", 20, cy, 555, 30, 16, true);
        cy += 40;

        // Additional Subjects Table
        const addSubjects = pdfData.subjects.filter(sub => sub.isAdditional === true || sub.isAdditional === 'true');
        if (addSubjects.length > 0) {
            const areaW = 180;
            const termW = 177;

            drawRect(cX, cy, areaW, 50, { lineWidth: 1 });
            drawCenteredText("AREA", cX, cy, areaW, 50, 11, true);

            // Term 1 Header
            drawRect(cX + areaW, cy, termW, 25, { lineWidth: 1 });
            drawCenteredText("TERM - I", cX + areaW, cy, termW, 25, 11, true);
            drawRect(cX + areaW, cy + 25, termW / 2, 25, { lineWidth: 1 });
            drawCenteredText("MARKS", cX + areaW, cy + 25, termW / 2, 25, 9, true);
            drawRect(cX + areaW + termW / 2, cy + 25, termW / 2, 25, { lineWidth: 1 });
            drawCenteredText("GRADE", cX + areaW + termW / 2, cy + 25, termW / 2, 25, 9, true);

            // Term 2 Header
            const t2X = cX + areaW + termW;
            drawRect(t2X, cy, termW, 25, { lineWidth: 1 });
            drawCenteredText("TERM - II", t2X, cy, termW, 25, 11, true);
            drawRect(t2X, cy + 25, termW / 2, 25, { lineWidth: 1 });
            drawCenteredText("MARKS", t2X, cy + 25, termW / 2, 25, 9, true);
            drawRect(t2X + termW / 2, cy + 25, termW / 2, 25, { lineWidth: 1 });
            drawCenteredText("GRADE", t2X + termW / 2, cy + 25, termW / 2, 25, 9, true);
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
                drawRect(cX, cy, areaW, 30, { lineWidth: 1 });
                const addSubWidth = doc.getTextWidth(sub.subjectname);
                if (addSubWidth > areaW - 10) {
                    doc.setFontSize(9);
                    const splitSub = doc.splitTextToSize(sub.subjectname, areaW - 10);
                    doc.text(splitSub, cX + 5, cy + 12);
                    doc.setFontSize(10);
                } else {
                    drawText(sub.subjectname, cX + 5, cy + 20, 10);
                }

                // T1
                const t1Total = sub.term1Total || '-';
                const t1GradeCalc = t1Total !== '-' ? calculateAddGrade(t1Total) : '-';

                drawRect(cX + areaW, cy, termW / 2, 30, { lineWidth: 1 });
                drawCenteredText(String(t1Total), cX + areaW, cy, termW / 2, 30, 10);
                drawRect(cX + areaW + termW / 2, cy, termW / 2, 30, { lineWidth: 1 });
                drawCenteredText(String(t1GradeCalc), cX + areaW + termW / 2, cy, termW / 2, 30, 10);

                // T2
                const t2Total = sub.term2Total || '-';
                const t2GradeCalc = t2Total !== '-' ? calculateAddGrade(t2Total) : '-';

                drawRect(t2X, cy, termW / 2, 30, { lineWidth: 1 });
                drawCenteredText(String(t2Total), t2X, cy, termW / 2, 30, 10);
                drawRect(t2X + termW / 2, cy, termW / 2, 30, { lineWidth: 1 });
                drawCenteredText(String(t2GradeCalc), t2X + termW / 2, cy, termW / 2, 30, 10);

                cy += 30;
            });
        }

        cy += 50;
        drawText("Congratulations, Promoted to class:", 30, cy, 12);
        drawLine(240, cy + 2, 550, cy + 2, 1);
        drawText(pdfParams.promotedToClass || "", 250, cy, 12, true);

        cy += 30;
        drawText("New Session Begins on:", 30, cy, 12);
        const sessionDate = formatDate(pdfParams.newSessionDate);
        drawText(`Date:   ${sessionDate}`, 240, cy, 12, true);
        drawLine(280, cy + 2, 550, cy + 2, 1);

        // Signatures
        drawText("Exam I/C Signature", 50, 780, 12, true);
        drawText("Principal's Signature", 400, 780, 12, true);


        // --- PAGE 4: INSTRUCTIONS ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        drawText("Instructions", centerX, 60, 18, true, [0, 0, 0], 'center');

        // ... (Instruction Tables Logic similar to KG, adjusted for readability)
        let iy = 100;
        drawText("Grading scale for scholastic areas : Grades are awarded on a 8-point grading", 40, iy, 12);
        iy += 15;
        drawText("scale as follows", 40, iy, 12);
        iy += 20;

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
        schGrades.forEach(g => {
            drawRect(iTableX, gY, iTableW / 2, 30, { lineWidth: 1 });
            drawCenteredText(g[0], iTableX, gY, iTableW / 2, 30, 11);
            drawRect(iTableX + iTableW / 2, gY, iTableW / 2, 30, { lineWidth: 1 });
            drawCenteredText(g[1], iTableX + iTableW / 2, gY, iTableW / 2, 30, 11);
            gY += 30;
        });

        iy = gY + 40;
        drawText("Grading scale for co-scholastic areas : Grades are awarded on 3-point", 40, iy, 12);
        iy += 15;
        drawText("grading scale as follows", 40, iy, 12);
        iy += 20;

        drawRect(iTableX, iy, iTableW, 30, { lineWidth: 1.5 });
        drawCenteredText("GRADE", iTableX, iy, iTableW / 2, 30, 12, true);
        drawCenteredText("GRADE POINT", iTableX + iTableW / 2, iy, iTableW / 2, 30, 12, true);

        const coGrades = [['A', '5 (Outstanding)'], ['B', '4 (Very Good)'], ['C', '3 (Fair)']];
        gY = iy + 30;
        coGrades.forEach(g => {
            drawRect(iTableX, gY, iTableW / 2, 30, { lineWidth: 1 });
            drawCenteredText(g[0], iTableX, gY, iTableW / 2, 30, 11);
            drawRect(iTableX + iTableW / 2, gY, iTableW / 2, 30, { lineWidth: 1 });
            drawCenteredText(g[1], iTableX + iTableW / 2, gY, iTableW / 2, 30, 11);
            gY += 30;
        });

        // FOOTER QUOTE
        doc.setFontSize(14);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(128, 0, 128);
        drawCenteredText("“Education is the key that unlock the golden door to freedom”", 20, 750, 555, 30, 14, true);

        doc.save(`Marksheet_${pdfData.profile.rollNo || 'Student'}.pdf`);
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
                Student Marksheet View (Class 1 - 5)
            </Typography>

            {/* DEBUG INFO */}
            {/* Debug Info Removed */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Registration Number"
                                value={regno}
                                onChange={(e) => setRegno(e.target.value)}
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
                                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
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
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
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

            {marks.length > 0 && (
                <Card>
                    <CardContent>
                        {/* Preview Section */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom>Marks Preview</Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell rowSpan={2}>Subject</TableCell>
                                            <TableCell align="center" colSpan={6}>Term I</TableCell>
                                            <TableCell align="center" colSpan={6}>Term II</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell align="center">PT(10)</TableCell>
                                            <TableCell align="center">NB(5)</TableCell>
                                            <TableCell align="center">SE(5)</TableCell>
                                            <TableCell align="center">Mid(80)</TableCell>
                                            <TableCell align="center">Obt</TableCell>
                                            <TableCell align="center">Gr</TableCell>

                                            <TableCell align="center">PT(10)</TableCell>
                                            <TableCell align="center">NB(5)</TableCell>
                                            <TableCell align="center">SE(5)</TableCell>
                                            <TableCell align="center">Ann(80)</TableCell>
                                            <TableCell align="center">Obt</TableCell>
                                            <TableCell align="center">Gr</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {marks[0]?.subjects?.filter(s => !s.isAdditional || s.isAdditional === 'false').map((sub, idx) => {
                                            const t1Tot = parseFloat(sub.term1PeriodicTest || 0) + parseFloat(sub.term1Notebook || 0) + parseFloat(sub.term1Enrichment || 0) + parseFloat(sub.term1MidExam || 0);
                                            const t2Tot = parseFloat(sub.term2PeriodicTest || 0) + parseFloat(sub.term2Notebook || 0) + parseFloat(sub.term2Enrichment || 0) + parseFloat(sub.term2AnnualExam || 0);
                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell>{sub.subjectname}</TableCell>
                                                    <TableCell align="center">{sub.term1PeriodicTest}</TableCell>
                                                    <TableCell align="center">{sub.term1Notebook}</TableCell>
                                                    <TableCell align="center">{sub.term1Enrichment}</TableCell>
                                                    <TableCell align="center">{sub.term1MidExam}</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>{t1Tot}</TableCell>
                                                    <TableCell align="center">{sub.term1Grade}</TableCell>

                                                    <TableCell align="center">{sub.term2PeriodicTest}</TableCell>
                                                    <TableCell align="center">{sub.term2Notebook}</TableCell>
                                                    <TableCell align="center">{sub.term2Enrichment}</TableCell>
                                                    <TableCell align="center">{sub.term2AnnualExam}</TableCell>
                                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>{t2Tot}</TableCell>
                                                    <TableCell align="center">{sub.term2Grade}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>

                        <Alert severity="info" sx={{ mb: 2 }}>
                            Preview showing Logic for Class 1-5. Click Generate to download updated PDF.
                        </Alert>

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

            {/* Dialog for PDF Options */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Generate Report Card (Class 1-5)</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Class Teacher's Remarks"
                            fullWidth
                            multiline
                            rows={3}
                            value={pdfParams.remarksTerm1}
                            onChange={(e) => setPdfParams({ ...pdfParams, remarksTerm1: e.target.value })}
                        />
                        <TextField
                            select
                            label="Promoted to Class"
                            fullWidth
                            value={pdfParams.promotedToClass}
                            onChange={(e) => setPdfParams({ ...pdfParams, promotedToClass: e.target.value })}
                        >
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
                        Download
                    </Button>
                </DialogActions>
            </Dialog>

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

        </Box>
    );
};

export default StudentMarksheetViewPage1to5ds;
