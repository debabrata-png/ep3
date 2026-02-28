import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Grid,
    Snackbar,
    Alert,
    MenuItem,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { PictureAsPdf, Download as DownloadIcon, Search } from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';
import jsPDF from 'jspdf';

const StudentMarksheetViewPage11ds = () => {
    const [regno, setRegno] = useState('');
    const [semester, setSemester] = useState('');
    const [academicyear, setAcademicyear] = useState('');

    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);

    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [fullPdfData, setFullPdfData] = useState(null);
    const [pdfParams, setPdfParams] = useState({
        remarks: '',
        promotedToClass: '',
        newSessionDate: '',
    });

    const [schoolConfig, setSchoolConfig] = useState(null);

    useEffect(() => {
        fetchSemestersAndYears();
        fetchSchoolConfig();
    }, []);

    const fetchSchoolConfig = async () => {
        try {
            const response = await ep1.get('/api/v2/getschreportconfds', {
                params: { colid: global1.colid }
            });
            if (response.data.success && response.data.data) {
                setSchoolConfig(response.data.data);
            } else if (response.data) {
                setSchoolConfig(response.data);
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
                const sems = response.data.semesters || [];
                const years = response.data.admissionyears || [];
                setAvailableSemesters(sems);
                setAvailableYears(years);

                if (sems.length > 0) setSemester(sems[0]);
                if (years.length > 0) setAcademicyear(years[0]);
            }
        } catch (error) {
            console.error('Error fetching semesters/years:', error);
        }
    };

    const handleSearchClick = async () => {
        if (!regno || !semester || !academicyear) {
            showSnackbar('Please enter all fields', 'warning');
            return;
        }

        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/getmarksheetpdfdata11ds', {
                params: {
                    colid: global1.colid,
                    regno,
                    semester,
                    academicyear
                }
            });

            if (response.data.success) {
                const data = response.data.data;
                setFullPdfData(data);
                setPdfParams({
                    remarks: data.remarks || '',
                    promotedToClass: data.promotedToClass || '',
                    newSessionDate: data.newSessionDate || ''
                });
                setOpenDialog(true);
            } else {
                showSnackbar('Student data not found', 'error');
            }
        } catch (error) {
            console.error('Error fetching PDF data:', error);
            showSnackbar(error.response?.data?.message || 'Failed to fetch data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateClick = () => {
        setDownloading(true);
        setTimeout(() => {
            const finalData = {
                ...fullPdfData,
                school: schoolConfig,
                remarks: pdfParams.remarks,
                promotedToClass: pdfParams.promotedToClass,
                newSessionDate: pdfParams.newSessionDate
            };
            createPDF(finalData);
            setDownloading(false);
            setOpenDialog(false);
            showSnackbar('PDF generated successfully', 'success');
        }, 100);
    };

    const createPDF = (data) => {
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const centerX = pageWidth / 2;
        const mainBorderColor = [0, 100, 0]; // Dark Green

        // --- Helper Functions ---
        const drawText = (text, x, y, fontSize = 10, isBold = false, color = [0, 0, 0], align = 'left') => {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", isBold ? "bold" : "normal");
            doc.setTextColor(...color);
            doc.text(String(text), x, y, { align });
        };

        const drawCenteredText = (text, x, y, w, h, fontSize, isBold = false, color = [0, 0, 0]) => {
            drawText(text, x + w / 2, y + h / 2 + (fontSize / 3), fontSize, isBold, color, 'center');
        };

        const drawLine = (x1, y1, x2, y2, width = 1) => {
            doc.setLineWidth(width);
            doc.setDrawColor(0);
            doc.line(x1, y1, x2, y2);
        };

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
        const topTextY = 35; // School Code / UDISE Code Y position

        // 1. Top Row: School Code (Left) & UDISE Code (Right)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);

        // Left: School Code
        doc.text(`School Code: ${schoolConfig?.schoolcode || ''}`, 30, topTextY);

        // Right: UDISE Code
        doc.text(`UDISE Code: ${schoolConfig?.udisecode || ''}`, 565, topTextY, { align: 'right' });


        // 2. Logos
        // User Instruction: "CBSE logo will go to the right side"
        // Implied: School Logo go to the Left side.

        try {
            const schoolLogoImg = new Image();
            schoolLogoImg.src = '/CPS.jpeg';
            doc.addImage(schoolLogoImg, 'JPEG', 30, logoY + 15, schoolLogoWidth, schoolLogoHeight);
        } catch (e) {
            console.warn("Logo error", e);
        }

        // Right: CBSE Logo
        try {
            const cbseLogoImg = new Image();
            cbseLogoImg.src = '/CBSE_logo.png';
            // Align right margin (565) - width (65) = 500
            doc.addImage(cbseLogoImg, 'PNG', 500, logoY, logoSize, logoSize);
        } catch (e) {
            // Placeholder text or circle if image missing
            // doc.circle(532, logoY + 32, 32);
            // doc.text("CBSE", 532, logoY + 32, {align:'center'});
        }


        // 3. Center School Details
        let headY = 60;
        const schoolName = schoolConfig?.schoolname || "SCHOOL NAME";

        // School Name
        doc.setFontSize(22);
        doc.setFont("times", "bold");
        doc.setTextColor(128, 0, 0); // Maroon - Cambria Bold approximation
        doc.text(schoolName.toUpperCase(), centerX, headY, { align: 'center' });
        doc.setTextColor(0, 0, 0); // Reset to black

        // Affiliation No
        headY += 18;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`CBSE Affiliation No. : ${schoolConfig?.affiliationno || ''}`, centerX, headY, { align: 'center' });

        // Address
        headY += 15;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const address = `${schoolConfig?.addressline1 || ''}, ${schoolConfig?.addressline2 || ''}`;

        // Icon Drawing Helper
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


        // Email
        headY += 15;
        const email = schoolConfig?.email || "";
        const emailW = doc.getTextWidth(email);
        doc.text(email, centerX, headY, { align: 'center' });
        drawIcon('email', centerX - (emailW / 2) - 10, headY - 1); // Adjust Y for icon

        // Contact (Phone & Telephone)
        headY += 15;
        const phone = schoolConfig?.phone || "";
        const tel = schoolConfig?.telephone || "";

        let contactTextFull = "";
        let startX = centerX;

        // We want: [Icon] Phone  |  [Icon] Telephone
        // Calculate total width to center multiple items

        const pText = phone ? ` ${phone}` : "";
        const tText = tel ? ` ${tel}` : "";
        const separator = "   |   ";

        // Measure
        const pW = doc.getTextWidth(pText);
        const tW = doc.getTextWidth(tText);
        const sepW = (phone && tel) ? doc.getTextWidth(separator) : 0;
        const iconW = 12; // Space for icon

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

        // Center: School Name, Affiliation, Address, Contacts (Removed duplicate block)

        let y = 175;
        // Adjusted spacing to prevent overlap
        y += 20;
        drawCenteredText("PERFORMANCE PROFILE", 20, y, 555, 30, 18, true);
        y += 35; // Increased gap

        // Session Centered
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        const sessionText = `Session : ${academicyear}`;
        const sessionW = doc.getTextWidth(sessionText);
        doc.text(sessionText, centerX, y + 10, { align: 'center' });
        drawLine(centerX - sessionW / 2, y + 12, centerX + sessionW / 2, y + 12, 1);

        // Photo
        drawRect(450, 150, 100, 120, { lineWidth: 1 });
        if (data.profile?.photo) {
            try {
                const photoUrl = data.profile.photo.startsWith('http') ? data.profile.photo : `${ep1.defaults.baseURL}/${schoolConfig.logolink}`;
                doc.addImage(photoUrl, 'JPEG', 451, 151, 98, 118);
            } catch (e) { drawText("Photo", 500, 210, 10, false, [0, 0, 0], 'center'); }
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

        drawLineItem("Roll No.", data.profile.rollNo || data.profile.rollno);
        drawLineItem("Admission No.", data.profile.admissionNo || data.profile.regno);
        drawLineItem("Student's Name", data.profile.name);

        drawText("Class", labelX, currentY, 12, true);
        drawText(":", labelX + 110, currentY, 12, true);
        drawLine(valX, currentY + 2, 350, currentY + 2, 1);
        const classVal = data.classtype || semester;
        drawText(classVal, valX + 10, currentY, 12);

        drawText("Section", 370, currentY, 12, true);
        drawText(":", 420, currentY, 12, true);
        drawLine(430, currentY + 2, endLineX, currentY + 2, 1);
        drawText(data.profile.section || (data.profile.class ? data.profile.class.split('-')[1] : ""), 440, currentY, 12);
        currentY += lineGap;


        drawLineItem("Date of Birth", formatDate(data.profile.dob));
        drawLineItem("Mother's Name", data.profile.mother);
        drawLineItem("Father's Name", data.profile.father);
        drawLineItem("Address", data.profile.address);
        drawLineItem("Contact No.", data.profile.contact || data.profile.phone || '');
        drawLineItem("CBSE Reg. No.", data.profile.cbseRegNo || '');

        // Attendance
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

        drawAttRow("Total Working Days", data.profile.term1workingdays || '-', data.profile.term2workingdays || '-', 1);
        drawAttRow("Total Attendance", data.profile.term1attendance || '-', data.profile.term2attendance || '-', 2);

        // Page 1 Signatures
        drawText("Class Teacher's Signature", 50, 780, 12, true);
        drawText("Parent's Signature", 400, 780, 12, true);


        // --- PAGE 2: SCHOLASTIC PART I ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawCenteredText("PART I - SCHOLASTIC AREAS", 20, 30, 555, 30, 16, true);

        // Center table: page width 595 - table width 527 = 68. 68 / 2 = 34
        const sTableX = 34;
        const sTableY = 85; // Move down to leave room for 70h vertical text

        // Exact Reference Layout Dimensions
        const wSr = 25;
        const wSub = 120;
        const wMark = 26; // Unified width for all marks columns
        const wTot = 35;
        const wGrd = 35;

        const wU = wMark;
        const wH = wMark;
        const wA = wMark;

        const sTableW = wSr + wSub + (wU * 4) + (wH * 4) + (wA * 4) + wTot + wGrd;

        // Start X positions
        const xSr = sTableX;
        const xSub = xSr + wSr;
        const xUnit = xSub + wSub;
        const xHY = xUnit + (wU * 4);
        const xAnn = xHY + (wH * 4);
        const xTot = xAnn + (wA * 4);
        const xGrd = xTot + wTot;

        // Heights
        const h1 = 20; // Top Row (EXAMINATION, UNIT TEST...)
        const h2 = 70; // Header Text (Pre Mid Term...) - Fall for wrapping, increased for vertical text
        const h3 = 15; // Max Marks ((50), (100)...)

        // Helper for vertical centered text (rotated 90 degrees)
        const drawVerticalHeader = (text, x, y, w, h, fontSize = 7) => {
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", "bold");
            // angle: 90 draws text upward from the bottom of the cell
            const textW = doc.getTextWidth(text);
            const textH = fontSize * doc.internal.getLineHeightFactor();
            // Center Horizontally
            const cx = x + (w / 2) + (textH / 4);
            // Center Vertically
            const cy = y + h - ((h - textW) / 2);
            doc.text(text, cx, cy, { angle: 90 });
        };

        const drawMarksHeaders = (startY) => {
            // Examination top header for left side
            drawRect(xSr, startY, wSr + wSub, h1, { fillColor: [240, 240, 240] });
            drawCenteredText("EXAMINATION", xSr, startY, wSr + wSub, h1, 10, true);

            // Sr
            drawRect(xSr, startY + h1, wSr, h2 + h3);
            drawText("Sr.", xSr + (wSr / 2), startY + h1 + ((h2 + h3) / 2) - 2, 9, true, [0, 0, 0], 'center');
            drawText("No", xSr + (wSr / 2), startY + h1 + ((h2 + h3) / 2) + 8, 9, true, [0, 0, 0], 'center');

            // Subject
            drawRect(xSub, startY + h1, wSub, h2 + h3);
            drawCenteredText("Subject", xSub, startY + h1, wSub, h2 + h3, 10, true);

            // Unit Test Header
            drawRect(xUnit, startY, (wU * 4), h1, { fillColor: [240, 240, 240] });
            drawCenteredText("UNIT TEST", xUnit, startY, (wU * 4), h1, 10, true);
            const uCols = ["Pre Mid Term", "Post Mid Term", "(A) Total", "(I) 20% Of A"];
            const uSubRow = ["(50)", "(50)", "(100)", "(WTG)"];
            uCols.forEach((t, i) => {
                drawRect(xUnit + (i * wU), startY + h1, wU, h2);
                drawVerticalHeader(t, xUnit + (i * wU), startY + h1, wU, h2, 7);
                drawRect(xUnit + (i * wU), startY + h1 + h2, wU, h3);
                drawCenteredText(uSubRow[i], xUnit + (i * wU), startY + h1 + h2, wU, h3, 7, true);
            });

            // Half Yearly Header
            drawRect(xHY, startY, (wH * 4), h1, { fillColor: [240, 240, 240] });
            drawCenteredText("HALF YEARLY", xHY, startY, (wH * 4), h1, 10, true);
            const hCols = ["TH", "Subject Enrichment", "(B) Total", "(II) 30% Of B"];
            const hSubRow = ["(70/80)", "(30/20)", "(100)", "(WTG)"];
            hCols.forEach((t, i) => {
                drawRect(xHY + (i * wH), startY + h1, wH, h2);
                drawVerticalHeader(t, xHY + (i * wH), startY + h1, wH, h2, 7);
                drawRect(xHY + (i * wH), startY + h1 + h2, wH, h3);
                drawCenteredText(hSubRow[i], xHY + (i * wH), startY + h1 + h2, wH, h3, 7, true);
            });

            // Annual Exam Header
            drawRect(xAnn, startY, (wA * 4), h1, { fillColor: [240, 240, 240] });
            drawCenteredText("ANNUAL EXAM", xAnn, startY, (wA * 4), h1, 10, true);
            const aCols = ["TH", "Practical", "(C) Total", "(III) 50% Of C"];
            const aSubRow = ["(70/80)", "(30/20)", "(100)", "(WTG)"];
            aCols.forEach((t, i) => {
                drawRect(xAnn + (i * wA), startY + h1, wA, h2);
                drawVerticalHeader(t, xAnn + (i * wA), startY + h1, wA, h2, 7);
                drawRect(xAnn + (i * wA), startY + h1 + h2, wA, h3);
                drawCenteredText(aSubRow[i], xAnn + (i * wA), startY + h1 + h2, wA, h3, 7, true);
            });

            // Total
            drawRect(xTot, startY, wTot, h1 + h2 + h3, { fillColor: [240, 240, 240] });
            drawCenteredText("TOTAL", xTot, startY, wTot, h1, 9, true); // Keep TOTAL specifically at the top row (h1)

            // Draw the mathematical string vertically within the remaining h2 + h3 space
            // Adding a manual Y-offset to bring it further down away from "TOTAL"
            doc.setFontSize(7);
            doc.setFont("helvetica", "bold");
            const totFormulaW = doc.getTextWidth("(I) + (II) + (III)");
            // Align in center of column, place near bottom of cell
            doc.text("(I) + (II) + (III)", xTot + (wTot / 2) + 2.5, startY + h1 + h2 + h3 - 4, { angle: 90 });

            // Grade
            drawRect(xGrd, startY, wGrd, h1 + h2 + h3, { fillColor: [240, 240, 240] });
            drawVerticalHeader("GRADE", xGrd, startY, wGrd, h1 + h2 + h3, 10);
        };

        // Draw Part I Headers
        drawMarksHeaders(sTableY);
        // Helper for multi-line centered text (Still kept just in case)
        const drawMultiLineHeader = (text, x, y, w, h, fontSize = 7, lineHeight = 9) => {
            const lines = text.split(" ");
            const totalTextH = lines.length * lineHeight;
            let startY = y + (h - totalTextH) / 2 + (fontSize / 2);
            doc.setFontSize(fontSize);
            doc.setFont("helvetica", "bold");
            lines.forEach((line, i) => {
                doc.text(line, x + w / 2, startY + (i * lineHeight), { align: 'center' });
            });
        };


        // --- Data Logic ---
        // Calculate and Sort
        const subjectsWithTotal = data.subjects.map(sub => {
            const t20 = parseFloat(sub.unit20 || 0);
            const t30 = parseFloat(sub.hy30 || 0);
            const t50 = parseFloat(sub.ann50 || 0);
            const finalTot = t20 + t30 + t50;
            return { ...sub, calculatedTotal: finalTot };
        });

        subjectsWithTotal.sort((a, b) => b.calculatedTotal - a.calculatedTotal);

        let mainSubjects = [];
        let additionalSubjects = [];

        if (subjectsWithTotal.length > 5) {
            mainSubjects = subjectsWithTotal.slice(0, 5);
            additionalSubjects = subjectsWithTotal.slice(5);
        } else {
            mainSubjects = subjectsWithTotal;
        }

        let dy = sTableY + h1 + h2 + h3;
        const drH = 30; // Data Row Height

        // Vars for Total Row (Grand Total)
        let grandTot = 0;
        let hasFailure = false;

        // Check wrap for subject names
        const drawSubName = (name, x, y, w, h) => {
            const subTextW = doc.getTextWidth(name);
            if (subTextW > (w - 4)) {
                drawMultiLineHeader(name, x, y, w, h, 8, 10);
            } else {
                drawText(name, x + 5, y + (h / 2) + 3, 9, true); // Left align subject
            }
            doc.setFont("helvetica", "normal"); // reset
        };

        mainSubjects.forEach((sub, idx) => {
            // Sr
            drawRect(xSr, dy, wSr, drH);
            drawCenteredText(String(idx + 1), xSr, dy, wSr, drH, 9);

            // Subject (Wider now)
            drawRect(xSub, dy, wSub, drH);
            const subName = sub.subjectname || "";
            doc.setFontSize(9); // Size 9 for subject
            doc.setFont("helvetica", "bold"); // Bold subject name

            drawSubName(subName, xSub, dy, wSub, drH);

            const drawMarkCell = (val, x, w) => {
                drawRect(x, dy, w, drH);
                drawCenteredText(String(val || ''), x, dy, w, drH, 8);
            };

            // Unit
            drawMarkCell(sub.unitpremid, xUnit, wU);
            drawMarkCell(sub.unitpostmid, xUnit + wU, wU);
            drawMarkCell(sub.unitTotal, xUnit + (2 * wU), wU);
            drawMarkCell(sub.unit20, xUnit + (3 * wU), wU);

            // HY
            const hyEnrich = sub.subjectEnrichment || sub.hyPr; // Assumption from previous code
            drawMarkCell(sub.hyTh, xHY, wH);
            drawMarkCell(hyEnrich, xHY + wH, wH);
            drawMarkCell(sub.hyTotal, xHY + (2 * wH), wH);
            drawMarkCell(sub.hy30, xHY + (3 * wH), wH);

            // Ann
            drawMarkCell(sub.annTh, xAnn, wA);
            drawMarkCell(sub.annPr, xAnn + wA, wA);
            drawMarkCell(sub.annTotal, xAnn + (2 * wA), wA);
            drawMarkCell(sub.ann50, xAnn + (3 * wA), wA);

            // Total
            const subTot = sub.calculatedTotal.toFixed(0);
            grandTot += parseFloat(sub.calculatedTotal);

            drawRect(xTot, dy, wTot, drH);
            drawCenteredText(subTot, xTot, dy, wTot, drH, 9, true);

            // Grade
            drawRect(xGrd, dy, wGrd, drH);
            drawCenteredText(sub.grade || '-', xGrd, dy, wGrd, drH, 9, true);

            dy += drH;
        });

        // --- FOOTER SECTION (Ref Look) ---
        // Max Marks
        drawRect(sTableX, dy, wSr + wSub, drH);
        drawText("Max Marks", sTableX + 5, dy + (drH / 2) + 3, 9, true);
        // Blank cells for columns
        for (let i = 0; i < 4; i++) drawRect(xUnit + (i * wU), dy, wU, drH);
        for (let i = 0; i < 4; i++) drawRect(xHY + (i * wH), dy, wH, drH);
        for (let i = 0; i < 4; i++) drawRect(xAnn + (i * wA), dy, wA, drH);
        drawRect(xTot, dy, wTot, drH);
        drawRect(xGrd, dy, wGrd, drH);
        dy += drH;

        // Marks Obtained
        drawRect(sTableX, dy, wSr + wSub, drH);
        drawText("Marks Obtained", sTableX + 5, dy + (drH / 2) + 3, 9, true);
        // Blanks
        for (let i = 0; i < 4; i++) drawRect(xUnit + (i * wU), dy, wU, drH);
        for (let i = 0; i < 4; i++) drawRect(xHY + (i * wH), dy, wH, drH);
        for (let i = 0; i < 4; i++) drawRect(xAnn + (i * wA), dy, wA, drH);

        // Grand Total Cell
        drawRect(xTot, dy, wTot, drH);
        drawCenteredText(grandTot.toFixed(0), xTot, dy, wTot, drH, 9, true);
        // Grade Blank
        drawRect(xGrd, dy, wGrd, drH);
        dy += drH;

        // Percentage
        drawRect(sTableX, dy, wSr + wSub, drH);
        drawText("Percentage", sTableX + 5, dy + (drH / 2) + 3, 9, true);
        // Merge Unit/HY/Ann columns for percentage display:
        drawRect(xUnit, dy, sTableW - (wSr + wSub + wTot + wGrd), drH); // Span marks cols
        const percentage = (grandTot / (mainSubjects.length * 100)) * 100;
        drawCenteredText(`${percentage.toFixed(1)}%`, xUnit, dy, sTableW - (wSr + wSub + wTot + wGrd), drH, 10, true);
        // Footer blanks
        drawRect(xTot, dy, wTot, drH);
        drawRect(xGrd, dy, wGrd, drH);
        dy += drH;


        // Rank
        drawRect(sTableX, dy, wSr + wSub, drH);
        drawText("Rank", sTableX + 5, dy + (drH / 2) + 3, 9, true);

        // Merge rest and complete the main table
        drawRect(xUnit, dy, sTableW - (wSr + wSub), drH);
        drawCenteredText(String(data.rank || '-'), xUnit, dy, sTableW - (wSr + wSub), drH, 10, true);
        dy += drH;

        // Add a line gap
        dy += 10;

        if (additionalSubjects.length > 0) {
            // Title for Additional Subjects spans entire table
            drawRect(sTableX, dy, sTableW, drH, { fillColor: [240, 240, 240] });
            drawCenteredText("ADDITIONAL SUBJECTS", sTableX, dy, sTableW, drH, 12, true);
            dy += drH;

            // Part III Headers
            drawMarksHeaders(dy);
            dy += (h1 + h2 + h3); // Advance by header total height

            // Part III Rows
            additionalSubjects.forEach((sub, i) => {
                drawRect(xSr, dy, wSr, drH);
                drawCenteredText(String(i + 1), xSr, dy, wSr, drH, 9);

                drawRect(xSub, dy, wSub, drH);
                drawSubName(sub.subjectname, xSub, dy, wSub, drH);

                const drawMarkCell = (val, x, w) => {
                    drawRect(x, dy, w, drH);
                    drawCenteredText(String(val || ''), x, dy, w, drH, 8);
                };

                // Unit
                drawMarkCell(sub.unitpremid, xUnit, wU);
                drawMarkCell(sub.unitpostmid, xUnit + wU, wU);
                drawMarkCell(sub.unitTotal, xUnit + (2 * wU), wU);
                drawMarkCell(sub.unit20, xUnit + (3 * wU), wU);

                // HY
                const hyEnrich = sub.subjectEnrichment || sub.hyPr;
                drawMarkCell(sub.hyTh, xHY, wH);
                drawMarkCell(hyEnrich, xHY + wH, wH);
                drawMarkCell(sub.hyTotal, xHY + (2 * wH), wH);
                drawMarkCell(sub.hy30, xHY + (3 * wH), wH);

                // Ann
                drawMarkCell(sub.annTh, xAnn, wA);
                drawMarkCell(sub.annPr, xAnn + wA, wA);
                drawMarkCell(sub.annTotal, xAnn + (2 * wA), wA);
                drawMarkCell(sub.ann50, xAnn + (3 * wA), wA);

                drawRect(xTot, dy, wTot, drH);
                drawCenteredText(sub.calculatedTotal.toFixed(0), xTot, dy, wTot, drH, 9, true);

                drawRect(xGrd, dy, wGrd, drH);
                drawCenteredText(sub.grade || '-', xGrd, dy, wGrd, drH, 9, true);
                dy += drH;
            });
        }

        // --- CLASS TEACHER REMARKS BLOCK (Page 2) ---
        dy += 10;
        drawRect(sTableX, dy, sTableW, 25, { fillColor: [240, 240, 240] });
        drawCenteredText("CLASS TEACHER'S REMARKS", sTableX, dy, sTableW, 25, 12, true);
        dy += 25;

        // Calculate remaining height
        const pageBottomLimit = 810;
        let remH = pageBottomLimit - dy;
        if (remH < 60) remH = 60; // Min height

        drawRect(sTableX, dy, sTableW, remH);
        if (data.remarks) {
            const lines = doc.splitTextToSize(data.remarks, sTableW - 10);
            doc.text(lines, sTableX + 5, dy + 20);
        }



        // --- PAGE 3: CO-SCHOLASTIC & COMPARTMENT & REMARKS & PROMOTION ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        let cy = 50;
        const cX = 30;
        const cW = 535;

        // Part II Co-Scholastic
        drawCenteredText("PART II : CO-SCHOLASTIC AREAS [ON A 5 POINT (A-E) GRADING SCALE]", 20, cy, 555, 30, 12, true);
        cy += 40;

        drawRect(cX, cy, 80, 25, { fillColor: [240, 240, 240] });
        drawCenteredText("CODE", cX, cy, 80, 25, 10, true);
        drawRect(cX + 80, cy, cW - 180, 25, { fillColor: [240, 240, 240] });
        drawCenteredText("AREA", cX + 80, cy, cW - 180, 25, 10, true);
        drawRect(cX + cW - 100, cy, 100, 25, { fillColor: [240, 240, 240] });
        drawCenteredText("GRADE", cX + cW - 100, cy, 100, 25, 10, true);
        cy += 25;

        const coScholastics = [ // Assuming static or from data if available
            { code: "500", name: "Work Education", grade: data.coScholastic?.workEducation || "" },
            { code: "502", name: "Physical & Health Education", grade: data.coScholastic?.physicalEducation || "" },
            { code: "503", name: "General Studies", grade: data.coScholastic?.generalStudies || "" }
        ];

        // If data.coScholastic is array and has elements
        const coData = (data.coScholastic && Array.isArray(data.coScholastic) && data.coScholastic.length > 0)
            ? data.coScholastic
            : coScholastics;

        coData.forEach(co => {
            drawRect(cX, cy, 80, 25, { lineWidth: 1 });
            drawCenteredText(co.code || '', cX, cy, 80, 25, 10);
            drawRect(cX + 80, cy, cW - 180, 25, { lineWidth: 1 });

            const areaWidth = doc.getTextWidth(co.name || co.area || '');
            if (areaWidth > cW - 190) {
                doc.setFontSize(9);
                const splitArea = doc.splitTextToSize(co.name || co.area || '', cW - 190);
                doc.text(splitArea, cX + 90, cy + 10);
                doc.setFontSize(10);
            } else {
                drawText(co.name || co.area || '', cX + 90, cy + 18, 10);
            }

            drawRect(cX + cW - 100, cy, 100, 25, { lineWidth: 1 });
            // Default to '-' instead of empty string if grade is missing
            const finalGrade = co.grade || co.term1Grade;
            drawCenteredText(finalGrade && finalGrade.trim() !== '' ? finalGrade : '-', cX + cW - 100, cy, 100, 25, 10);
            cy += 25;
        });

        cy += 40;


        // Compartment Table — uses backend compartmentSubjects (subjects with total < 33)
        const failedSubjects = (data.compartmentSubjects && data.compartmentSubjects.length > 0)
            ? data.compartmentSubjects
            : [];

        if (failedSubjects.length > 0) {
            drawCenteredText("DETAILS OF COMPARTMENT EXAMINATION", 20, cy, 555, 30, 12, true);
            cy += 30;

            const compCols = ["SR. NO.", "SUBJECT", "MAX MARKS", "MARKS OBT", "RESULT"];
            const compWs = [50, 200, 80, 80, 125];
            let compX = cX;
            compCols.forEach((h, i) => {
                drawRect(compX, cy, compWs[i], 25, { fillColor: [240, 240, 240] });
                drawCenteredText(h, compX, cy, compWs[i], 25, 9, true);
                compX += compWs[i];
            });
            cy += 25;

            failedSubjects.forEach((sub, i) => {
                compX = cX;
                drawRect(compX, cy, compWs[0], 25);
                drawCenteredText(String(i + 1), compX, cy, compWs[0], 25, 9);
                compX += compWs[0];

                drawRect(compX, cy, compWs[1], 25);
                drawText(sub.subjectname || sub, compX + 5, cy + 18, 9);
                compX += compWs[1];

                drawRect(compX, cy, compWs[2], 25);
                drawCenteredText("100", compX, cy, compWs[2], 25, 9);
                compX += compWs[2];

                // Show supplementary exam marks if entered, otherwise show dash
                const suppMarks = (sub.compartmentobtained !== null && sub.compartmentobtained !== undefined)
                    ? String(sub.compartmentobtained) : '—';
                drawRect(compX, cy, compWs[3], 25);
                drawCenteredText(suppMarks, compX, cy, compWs[3], 25, 9);
                compX += compWs[3];

                // Result: pass if supplementary >= 33, else blank
                const resultText = (sub.compartmentobtained !== null && sub.compartmentobtained !== undefined)
                    ? (Number(sub.compartmentobtained) >= 33 ? 'PASS' : 'FAIL') : '';
                drawRect(compX, cy, compWs[4], 25);
                drawCenteredText(resultText, compX, cy, compWs[4], 25, 9);
                cy += 25;
            });
            cy += 30;
        }

        // Promotion & Session
        drawText("Congratulations, Promoted to class:", 30, cy, 12);
        drawLine(240, cy + 2, 550, cy + 2, 1);
        drawText(pdfParams.promotedToClass || "", 250, cy, 12, true);
        cy += 30;

        drawText("New Session Begins on:", 30, cy, 12);
        const sessionDate = formatDate(pdfParams.newSessionDate);
        drawText(sessionDate, 200, cy, 12, true);
        drawLine(180, cy + 2, 400, cy + 2, 1);
        cy += 30;


        // Signatures (Exam I/C & Principal) - Bottom of Page 3
        const sigY = 750;
        drawText("Exam I/C Signature", 50, sigY, 12, true);
        drawText("Principal's Signature", 400, sigY, 12, true);


        // --- PAGE 4: INSTRUCTIONS ---
        doc.addPage();
        drawRect(10, 10, 575, 822, { lineWidth: 4, strokeColor: mainBorderColor });
        drawRect(20, 20, 555, 802, { lineWidth: 1.5 });

        drawCenteredText("Instructions", 20, 60, 555, 30, 16, true);
        drawLine(250, 85, 345, 85, 1); // Underline

        let iy = 110;
        drawText("Grading scale for scholastic areas : Grades are awarded on a 8-point grading", 40, iy, 12);
        iy += 15;
        drawText("scale as follows", 40, iy, 12);
        iy += 30;

        const iTableX = 80;
        const iTableW = 435;

        drawRect(iTableX, iy, iTableW, 30, { lineWidth: 1.5, fillColor: [240, 240, 240] });
        drawCenteredText("MARKS RANGE", iTableX, iy, iTableW / 2, 30, 12, true);
        drawCenteredText("GRADE", iTableX + iTableW / 2, iy, iTableW / 2, 30, 12, true);

        const schGrades = [
            ['91-100', 'A1'], ['81-90', 'A2'], ['71-80', 'B1'], ['61-70', 'B2'],
            ['51-60', 'C1'], ['41-50', 'C2'], ['33-40', 'D'], ['32 & Below', 'E (Failed)']
        ];
        let gY = iy + 30;
        schGrades.forEach(g => {
            drawRect(iTableX, gY, iTableW / 2, 25, { lineWidth: 1 });
            drawCenteredText(g[0], iTableX, gY, iTableW / 2, 25, 11);
            drawRect(iTableX + iTableW / 2, gY, iTableW / 2, 25, { lineWidth: 1 });
            drawCenteredText(g[1], iTableX + iTableW / 2, gY, iTableW / 2, 25, 11);
            gY += 25;
        });

        gY += 30;
        drawText("Grading scale for Internal Assessment : Grades are awarded on 5-point scale", 40, gY, 12);
        gY += 25;

        drawRect(iTableX, gY, iTableW, 30, { lineWidth: 1.5, fillColor: [240, 240, 240] });
        drawCenteredText("MARKS RANGE", iTableX, gY, iTableW / 2, 30, 12, true);
        drawCenteredText("GRADE", iTableX + iTableW / 2, gY, iTableW / 2, 30, 12, true);
        gY += 30;

        const intGrades = [
            ["40-50", "A"], ["31-40", "B"], ["21-30", "C"], ["11-20", "D"], ["10 & Below", "E"]
        ];
        intGrades.forEach(g => {
            drawRect(iTableX, gY, iTableW / 2, 25, { lineWidth: 1 });
            drawCenteredText(g[0], iTableX, gY, iTableW / 2, 25, 11);
            drawRect(iTableX + iTableW / 2, gY, iTableW / 2, 25, { lineWidth: 1 });
            drawCenteredText(g[1], iTableX + iTableW / 2, gY, iTableW / 2, 25, 11);
            gY += 25;
        });

        // Footer Quote
        doc.setFontSize(14);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(128, 0, 128);
        drawCenteredText("“Education is the key that unlock the golden door to freedom”", 20, 750, 555, 30, 14, true);

        doc.save(`${data.profile.regno}_ReportCard_11_12.pdf`);
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
                Class 11 & 12 Report Card
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Registration No."
                                value={regno}
                                onChange={(e) => setRegno(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Semester"
                                value={semester}
                                onChange={(e) => setSemester(e.target.value)}
                            >
                                {availableSemesters.map((sem) => (
                                    <MenuItem key={sem} value={sem}>{sem}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
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
                        <Grid item xs={12} md={3}>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress size={24} /> : <Search />}
                                onClick={handleSearchClick}
                                disabled={loading}
                                fullWidth
                                sx={{ height: '56px' }}
                            >
                                Search
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Generate Report Card</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Remarks"
                            multiline
                            rows={3}
                            value={pdfParams.remarks}
                            onChange={(e) => setPdfParams({ ...pdfParams, remarks: e.target.value })}
                        />
                        <TextField
                            label="Promoted To Class"
                            value={pdfParams.promotedToClass}
                            onChange={(e) => setPdfParams({ ...pdfParams, promotedToClass: e.target.value })}
                        />
                        <TextField
                            label="New Session Begins On"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={pdfParams.newSessionDate}
                            onChange={(e) => setPdfParams({ ...pdfParams, newSessionDate: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleGenerateClick}
                        variant="contained"
                        color="success"
                        startIcon={downloading ? <CircularProgress size={20} /> : <DownloadIcon />}
                        disabled={downloading}
                    >
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default StudentMarksheetViewPage11ds;
