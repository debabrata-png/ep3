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

const StudentMarksheetViewPage9to10ds = () => {
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
                setAvailableSemesters(sems);
                setAvailableYears(years);

                if (sems.length > 0) setSemester(sems[0]);
                if (years.length > 0) setAcademicyear(years[0]);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
            setAvailableSemesters(['Class 9', 'Class 10']);
            setAvailableYears(['2023-2024', '2024-2025']);
        }
    };

    const fetchMarks = async () => {
        if (!regno || !semester || !academicyear) {
            showSnackbar("Please fill all search fields.", "warning");
            return;
        }

        setLoading(true);
        setMarks([]);
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
                const studentData = response.data.data;
                if (studentData) {
                    if (studentData.subjects) {
                        // We will handle specific sorting/filtering in the PDF generation
                        // But for preview, we can just sort by ID or predefined order
                        studentData.subjects.sort((a, b) => a.id - b.id);
                    }
                    setMarks([studentData]);

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
                doc.rect(x, y, w, h, 'FD');
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

        const formatDate = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        // --- PAGE 1: PROFILE & ATTENDANCE ---
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
        doc.setTextColor(128, 0, 0); // Maroon
        doc.text(schoolName.toUpperCase(), centerX, headY, { align: 'center' });
        doc.setTextColor(0, 0, 0); // Reset

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


        let y = 175;

        y += 40;
        drawText("PERFORMANCE PROFILE", centerX, y, 18, true, [0, 0, 0], 'center');
        y += 5; // Reduced space between Performance Profile and Session

        // Session Centered
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const sessionText = `Session: ${pdfData.academicyear || academicyear}`;
        const sessionW = doc.getTextWidth(sessionText);
        doc.text(sessionText, centerX, y + 25, { align: 'center' });
        drawLine(centerX - sessionW / 2, y + 25 + 2, centerX + sessionW / 2, y + 25 + 2, 1);


        // Student Profile Photo
        drawRect(450, 150, 100, 120, { lineWidth: 1 });
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
        const valX = 150;
        const endLineX = 570;

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


        drawLineItem("Date of Birth", formatDate(pdfData.profile.dob)); // Date of Birth
        drawLineItem("Mother's Name", pdfData.profile.mother);
        drawLineItem("Father's Name", pdfData.profile.father);
        drawLineItem("Address", pdfData.profile.address);
        drawLineItem("Contact No.", pdfData.profile.contact);
        drawLineItem("CBSE Reg. No.", pdfData.profile.cbseRegNo || '');

        // Attributes Table (Attendance)
        const attY = 650;
        const attX = 30;
        const attW = 535;
        const attRowH = 25;

        drawRect(attX, attY, attW, attRowH, { lineWidth: 1, fillColor: [240, 240, 240] });
        const col1W = 178;
        const col2W = 178;
        drawLine(attX + col1W, attY, attX + col1W, attY + (attRowH * 3), 1);
        drawLine(attX + col1W + col2W, attY, attX + col1W + col2W, attY + (attRowH * 3), 1);

        drawCenteredText("Attendance", attX, attY, col1W, attRowH, 12, true);
        drawCenteredText("Term-I", attX + col1W, attY, col2W, attRowH, 12, true);
        drawCenteredText("Term-II", attX + col1W + col2W, attY, attW - col1W - col2W, attRowH, 12, true);

        const drawAttRow = (label, val1, val2, index) => {
            const y = attY + (attRowH * index);
            drawRect(attX, y, attW, attRowH, { lineWidth: 1 });
            drawLine(attX + col1W, y, attX + col1W, y + attRowH, 1);
            drawLine(attX + col1W + col2W, y, attX + col1W + col2W, y + attRowH, 1);

            drawText(label, attX + 10, y + 17, 11, true);
            drawCenteredText(String(val1 || '-'), attX + col1W, y, col2W, attRowH, 11);
            drawCenteredText(String(val2 || '-'), attX + col1W + col2W, y, attW - col1W - col2W, attRowH, 11);
        };

        drawAttRow("Total Working Days", pdfData.attendance?.term1?.working || '-', pdfData.attendance?.term2?.working || '-', 1);
        drawAttRow("Total Attendance", pdfData.attendance?.term1?.present || '-', pdfData.attendance?.term2?.present || '-', 2);

        // Signatures (Class Teacher & Parent) on Page 1
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
        const valW = 37;

        const h1 = 25;
        const h2 = 100;
        const h3 = 20;

        // Headers
        drawRect(sTableX, sTableY, subW, h1 + h2 + h3, { lineWidth: 1 });
        drawCenteredText("SUBJECT", sTableX, sTableY, subW, h1 + h2 + h3, 11, true);

        const tW = valW * 6;
        drawRect(sTableX + subW, sTableY, tW, h1, { lineWidth: 1, fillColor: [240, 240, 240] });
        drawCenteredText("TERM-I (100 MARKS)", sTableX + subW, sTableY, tW, h1, 10, true);
        drawRect(sTableX + subW + tW, sTableY, tW, h1, { lineWidth: 1, fillColor: [240, 240, 240] });
        drawCenteredText("TERM-II (100 MARKS)", sTableX + subW + tW, sTableY, tW, h1, 10, true);

        // vHeaders
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

        // --- Data Logic: Best 5 Subjects ---
        const scholasticSubjects = pdfData.subjects.filter(sub => !sub.isAdditional || sub.isAdditional === 'false');

        // Determine if there is any failure before filtering them out
        let hasFailure = false;
        scholasticSubjects.forEach(sub => {
            if ((sub.term1Grade && sub.term1Grade.toUpperCase() === 'E') || (sub.term2Grade && sub.term2Grade.toUpperCase() === 'E')) {
                hasFailure = true;
            }
        });

        // Exclude failed subjects from the Part I display (REMOVED - now keeps them per user request)
        const passedSubjects = scholasticSubjects;


        // Calculate Total Marks for sorting
        const subjectsWithTotal = passedSubjects.map(sub => {
            const t1 = (parseFloat(sub.term1PeriodicTest || 0) + parseFloat(sub.term1Notebook || 0) + parseFloat(sub.term1Enrichment || 0) + parseFloat(sub.term1MidExam || 0));
            const t2 = (parseFloat(sub.term2PeriodicTest || 0) + parseFloat(sub.term2Notebook || 0) + parseFloat(sub.term2Enrichment || 0) + parseFloat(sub.term2AnnualExam || 0));
            const total = t1 + t2;
            return { ...sub, calculatedTotal: total };
        });

        // Sort by Total Descending
        subjectsWithTotal.sort((a, b) => b.calculatedTotal - a.calculatedTotal);

        let mainSubjects = [];
        let additionalSubjects = [];

        // Assuming user wants 5 main subjects.
        if (subjectsWithTotal.length > 5) {
            mainSubjects = subjectsWithTotal.slice(0, 5);
            additionalSubjects = subjectsWithTotal.slice(5);
        } else {
            mainSubjects = subjectsWithTotal;
        }

        // Also add any explicitly marked additional subjects to the additional list
        const explicitAdditional = pdfData.subjects.filter(sub => sub.isAdditional === true || sub.isAdditional === 'true');
        additionalSubjects = [...additionalSubjects, ...explicitAdditional];


        let dy = my + h3;
        const dRH = 25;

        let gT1Obt = 0;
        let gT2Obt = 0;

        mainSubjects.forEach(sub => {
            const t1PT = parseFloat(sub.term1PeriodicTest || 0);
            const t1NB = parseFloat(sub.term1Notebook || 0);
            const t1Enr = parseFloat(sub.term1Enrichment || 0);
            const t1Mid = parseFloat(sub.term1MidExam || 0);
            const t1Tot = (t1PT + t1NB + t1Enr + t1Mid);
            const t1Grade = sub.term1Grade;

            const t2PT = parseFloat(sub.term2PeriodicTest || 0);
            const t2NB = parseFloat(sub.term2Notebook || 0);
            const t2Enr = parseFloat(sub.term2Enrichment || 0);
            const t2Ann = parseFloat(sub.term2AnnualExam || 0);
            const t2Tot = (t2PT + t2NB + t2Enr + t2Ann);
            const t2Grade = sub.term2Grade;

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

        // Total Row (Page 2 continued)
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

        // --- ADDITIONAL SUBJECTS (Still in PART I) ---
        if (additionalSubjects.length > 0) {
            drawCenteredText("ADDITIONAL SUBJECTS", 20, dy, 555, 30, 16, true);
            dy += 35;

            // Headers for Additional
            drawRect(sTableX, dy, subW, h1 + h2 + h3, { lineWidth: 1 });
            drawCenteredText("SUBJECT", sTableX, dy, subW, h1 + h2 + h3, 11, true);

            drawRect(sTableX + subW, dy, tW, h1, { lineWidth: 1, fillColor: [240, 240, 240] });
            drawCenteredText("TERM-I (100 MARKS)", sTableX + subW, dy, tW, h1, 10, true);
            drawRect(sTableX + subW + tW, dy, tW, h1, { lineWidth: 1, fillColor: [240, 240, 240] });
            drawCenteredText("TERM-II (100 MARKS)", sTableX + subW + tW, dy, tW, h1, 10, true);

            cx = sTableX + subW;
            const aVy = dy + h1;
            vHeaders.forEach(h => {
                drawRect(cx, aVy, valW, h2, { lineWidth: 1 });
                doc.text(h, cx + (valW / 2) + 4, aVy + h2 - 10, { angle: 90 });
                cx += valW;
            });

            cx = sTableX + subW;
            const aMy = dy + h1 + h2;
            maxMarks.forEach(m => {
                drawRect(cx, aMy, valW, h3, { lineWidth: 1 });
                if (m) drawCenteredText(m, cx, aMy, valW, h3, 9);
                cx += valW;
            });

            dy += (h1 + h2 + h3);

            additionalSubjects.forEach(sub => {
                const t1PT = parseFloat(sub.term1PeriodicTest || 0);
                const t1NB = parseFloat(sub.term1Notebook || 0);
                const t1Enr = parseFloat(sub.term1Enrichment || 0);
                const t1Mid = parseFloat(sub.term1MidExam || 0);
                const t1Tot = (t1PT + t1NB + t1Enr + t1Mid);
                const t1Grade = sub.term1Grade;

                const t2PT = parseFloat(sub.term2PeriodicTest || 0);
                const t2NB = parseFloat(sub.term2Notebook || 0);
                const t2Enr = parseFloat(sub.term2Enrichment || 0);
                const t2Ann = parseFloat(sub.term2AnnualExam || 0);
                const t2Tot = (t2PT + t2NB + t2Enr + t2Ann);
                const t2Grade = sub.term2Grade;

                const rowVals = [
                    t1PT, t1NB, t1Enr, t1Mid, t1Tot.toFixed(0), t1Grade,
                    t2PT, t2NB, t2Enr, t2Ann, t2Tot.toFixed(0), t2Grade
                ];

                drawRect(sTableX, dy, subW, dRH, { lineWidth: 1 });
                const addSubNameWidth = doc.getTextWidth(sub.subjectname);
                if (addSubNameWidth > subW - 10) {
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
            dy += 40;
        }

        // Final Assessment
        drawRect(sTableX, dy, sTableW, 25, { lineWidth: 1, fillColor: [230, 230, 230] });
        drawCenteredText("FINAL ASSESSMENT", sTableX, dy, sTableW, 25, 12, true);
        dy += 25;

        // Assuming weighted average similar to 1-8 for now as calculation details were vague,
        // but user mentioned Term I and Term II calculation is different. 
        // Standard 9-10 often uses best of Terms or specific weighting. 
        const faCols = ["TERM - I (50%)", "TERM - II (50%)", "Grand Total", "Percentage", "Overall Grade", "Rank"];
        const faW = sTableW / 6;

        cx = sTableX;
        faCols.forEach(c => {
            drawRect(cx, dy, faW, 30, { lineWidth: 1 });
            drawCenteredText(c, cx, dy, faW, 30, 10, true);
            cx += faW;
        });
        dy += 30;

        const t1Weighted = gT1Obt * 0.5;
        const t2Weighted = gT2Obt * 0.5;
        const grandTot = t1Weighted + t2Weighted;
        const maxPossPerTerm = mainSubjects.length * 100; // Best 5
        const grandMax = maxPossPerTerm;
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


        // --- PAGE 3: CO-SCHOLASTIC & COMPARTMENT & PROMOTION ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        let cy = 50;
        const cX = 30;
        const cW = 535;
        const cRH = 30;

        drawCenteredText("PART II - CO-SCHOLASTIC AREAS", 20, cy, 555, 30, 16, true);
        cy += 40;

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
        cy += 50;

        // --- COMPARTMENT TABLE (Page 3) ---
        // Use compartmentSubjects from backend (subjects with weighted score < 33)
        const failedSubjects = (pdfData.compartmentSubjects && pdfData.compartmentSubjects.length > 0)
            ? pdfData.compartmentSubjects
            : [];

        if (failedSubjects.length > 0) {
            drawCenteredText("DETAILS OF COMPARTMENT EXAMINATION", 20, cy, 555, 30, 14, true);
            cy += 40;

            const compHeaders = ["SR. NO.", "SUBJECT", "MAX MARKS", "MARKS OBTAINED", "RESULT"];
            const compWs = [cW * 0.1, cW * 0.35, cW * 0.15, cW * 0.2, cW * 0.2]; // widened MARKS OBTAINED


            let compX = cX;
            compHeaders.forEach((h, i) => {
                drawRect(compX, cy, compWs[i], 30, { lineWidth: 1 });
                drawCenteredText(h, compX, cy, compWs[i], 30, 10, true);
                compX += compWs[i];
            });
            cy += 30;

            failedSubjects.forEach((sub, i) => {
                compX = cX;
                drawRect(compX, cy, compWs[0], 30, { lineWidth: 1 });
                drawCenteredText(String(i + 1), compX, cy, compWs[0], 30, 10);
                compX += compWs[0];

                drawRect(compX, cy, compWs[1], 30, { lineWidth: 1 });
                drawCenteredText(sub.subjectname || sub, compX, cy, compWs[1], 30, 10);
                compX += compWs[1];

                drawRect(compX, cy, compWs[2], 30, { lineWidth: 1 });
                drawCenteredText("100", compX, cy, compWs[2], 30, 10);
                compX += compWs[2];

                // Show supplementary exam marks if entered, otherwise show dash
                const suppMarks = (sub.compartmentobtained !== null && sub.compartmentobtained !== undefined)
                    ? String(sub.compartmentobtained) : '—';
                drawRect(compX, cy, compWs[3], 30, { lineWidth: 1 });
                drawCenteredText(suppMarks, compX, cy, compWs[3], 30, 10);
                compX += compWs[3];

                // Result: pass if supplementary >= 33, else blank/fail
                const resultText = (sub.compartmentobtained !== null && sub.compartmentobtained !== undefined)
                    ? (Number(sub.compartmentobtained) >= 33 ? 'PASS' : 'FAIL') : '';
                drawRect(compX, cy, compWs[4], 30, { lineWidth: 1 });
                drawCenteredText(resultText, compX, cy, compWs[4], 30, 10);
                cy += 30;
            });
            cy += 40;
        }


        // --- CLASS TEACHER REMARKS (Page 3) ---
        drawRect(cX, cy, cW, 25, { lineWidth: 1, fillColor: [240, 240, 240] });
        drawCenteredText("CLASS TEACHER'S REMARKS", cX, cy, cW, 25, 12, true);
        cy += 25;
        const remH3 = 100; // Increased box size
        drawRect(cX, cy, cW, remH3, { lineWidth: 1 });
        const remarks = pdfParams.remarksTerm1 || pdfData.remarks || "";
        if (remarks) {
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(remarks, cW - 20);
            const maxLines = Math.floor((remH3 - 10) / 12);
            doc.text(lines.slice(0, maxLines), cX + 10, cy + 20);
        }
        cy += remH3 + 30;

        // Details of Promotion
        drawText("Congratulations ,Promoted to class:", 30, cy, 12);
        drawLine(240, cy + 2, 550, cy + 2, 1);
        drawText(pdfParams.promotedToClass || "", 250, cy, 12, true);

        cy += 30;
        drawText("New Session Begins on:", 30, cy, 12);
        const sessionDate = formatDate(pdfParams.newSessionDate);
        drawText(`Date:   ${sessionDate}`, 240, cy, 12, true);
        drawLine(280, cy + 2, 550, cy + 2, 1);

        // Exam I/C & Principal Slgnatures (Bottom of Page 3)
        cy = 750;
        drawText("Exam I/C Signature", 50, cy, 12, true);
        drawText("Principal's Signature", 400, cy, 12, true);


        // --- PAGE 4: INSTRUCTIONS ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        drawText("Instructions", centerX, 60, 18, true, [0, 0, 0], 'center');

        // ... Instruction Tables (Standard) ...
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

        // Footer Quote
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
                Student Marksheet View (Class 9 - 10)
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Registration No"
                                fullWidth
                                value={regno}
                                onChange={(e) => setRegno(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                select
                                label="Class/Semester"
                                fullWidth
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                {availableSemesters.map((sem) => (
                                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                select
                                label="Academic Year"
                                fullWidth
                                value={academicyear}
                                onChange={(e) => setAcademicyear(e.target.value)}
                            >
                                {availableYears.map((year) => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button
                                variant="contained"
                                startIcon={<Search />}
                                onClick={fetchMarks}
                                disabled={loading}
                                fullWidth
                                sx={{ height: '56px' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Search & View"}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {marks.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Student Details: {marks[0].profile?.name}</Typography>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<DownloadIcon />}
                                onClick={handleOpenPdfDialog}
                                disabled={downloading}
                            >
                                {downloading ? "Generating..." : "Generate PDF Report"}
                            </Button>
                        </Box>
                        {/* Preview Table for 9-10 can be simple */}
                        <Alert severity="info" sx={{ mb: 2 }}>Preview shows all subjects. PDF will organize Top 5 and Additional subjects automatically.</Alert>
                    </CardContent>
                </Card>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Finalize Report Card</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            label="Remarks (Term 1)"
                            fullWidth
                            multiline
                            rows={2}
                            value={pdfParams.remarksTerm1}
                            onChange={(e) => setPdfParams({ ...pdfParams, remarksTerm1: e.target.value })}
                            sx={{ mb: 2 }}
                            helperText="Leave empty to use fetched remarks"
                        />
                        <TextField
                            label="Promoted To Class"
                            fullWidth
                            value={pdfParams.promotedToClass}
                            onChange={(e) => setPdfParams({ ...pdfParams, promotedToClass: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="New Session Begins On"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={pdfParams.newSessionDate}
                            onChange={(e) => setPdfParams({ ...pdfParams, newSessionDate: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleGenerateClick} variant="contained" color="primary">
                        Generate & Download
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentMarksheetViewPage9to10ds;
