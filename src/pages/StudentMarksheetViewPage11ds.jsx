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
import { PictureAsPdf, Download as DownloadIcon } from '@mui/icons-material';
import ep1 from '../api/ep1'; // Axios instance
import global1 from './global1';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentMarksheetViewPage11ds = () => {
    const [regno, setRegno] = useState('');
    const [semester, setSemester] = useState('11');
    const [academicyear, setAcademicyear] = useState('2025-2026');

    // Dynamic options
    const [availableSemesters, setAvailableSemesters] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);

    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [fullPdfData, setFullPdfData] = useState(null);
    const [pdfParams, setPdfParams] = useState({
        remarks: '',
        promotedToClass: '',
        newSessionDate: '',
    });

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

    // Fetch config on mount
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
                setAvailableSemesters(response.data.semesters || []);
                setAvailableYears(response.data.admissionyears || []);

                // Set defaults if available
                if (!semester && response.data.semesters.length > 0) setSemester(response.data.semesters[0]);
                if (!academicyear && response.data.admissionyears.length > 0) setAcademicyear(response.data.admissionyears[0]);
            }
        } catch (error) {
            console.error('Error fetching semesters/years:', error);
            showSnackbar('Failed to fetch filter data', 'error');
        }
    };

    // Step 1: Fetch Data and Open Dialog
    const handleOpenPdfDialog = async () => {
        if (!regno) {
            showSnackbar('Please enter Registration Number', 'warning');
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
                // Pre-fill dialog if data exists
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
            showSnackbar(error.response?.data?.message || 'Failed to generate PDF', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Step 2: Generate PDF with User Inputs
    const handleGenerateClick = () => {
        if (!fullPdfData) return;

        // Merge user inputs
        const finalData = {
            ...fullPdfData,
            school: schoolConfig,
            remarks: pdfParams.remarks,
            promotedToClass: pdfParams.promotedToClass,
            newSessionDate: pdfParams.newSessionDate
        };

        createPDF(finalData);
        handleCloseDialog();
        showSnackbar('PDF generated successfully', 'success');
    };

    const createPDF = (data) => {
        const doc = new jsPDF('p', 'pt', 'a4');
        const mainBorderColor = [0, 128, 0]; // Olive Green

        // --- Helper Functions ---
        const drawText = (text, x, y, size = 12, bold = false, color = [0, 0, 0], align = 'left') => {
            doc.setFontSize(size);
            doc.setFont("helvetica", bold ? "bold" : "normal");
            doc.setTextColor(...color);
            doc.text(String(text), x, y, { align });
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

        // Layout Config - Wider Page
        const pageW = 595.28;
        const margin = 20;
        const contentW = pageW - (margin * 2);

        const drawPageBorder = () => {
            drawRect(margin, margin, contentW, 842 - (margin * 2), { lineWidth: 3, strokeColor: mainBorderColor });
            drawRect(margin + 5, margin + 5, contentW - 10, 842 - (margin * 2) - 10, { lineWidth: 1 });
        };

        const drawSchoolHeader = () => {
            // Top Corners
            drawText("School Code", margin + 15, margin + 20, 10, true);
            drawText(data.school?.schoolcode || "", margin + 15, margin + 35, 12);
            drawText("UDISE Code", pageW - margin - 80, margin + 20, 10, true);
            drawText(data.school?.udisecode || "", pageW - margin - 80, margin + 35, 12);

            // Center School Info
            if (data.school) {
                const schoolName = (data.school.schoolname || 'SCHOOL NAME').toUpperCase();
                drawText(schoolName, pageW / 2, margin + 60, 22, true, [0, 0, 0], 'center');
                drawText(`CBSE Affiliation No. : ${data.school.affiliationno || ''}`, pageW / 2, margin + 80, 12, true, [0, 0, 0], 'center');

                // --- Icon Helpers ---
                const drawLocationIcon = (x, y, size = 10) => {
                    doc.setLineWidth(1);
                    doc.circle(x, y - size / 2, size / 2); // Pin head
                    doc.line(x - size / 2, y - size / 2, x, y + size / 2); // Left point
                    doc.line(x + size / 2, y - size / 2, x, y + size / 2); // Right point
                    doc.circle(x, y - size / 2, 1, 'F'); // Dot
                };

                const drawEmailIcon = (x, y, size = 10) => {
                    doc.setLineWidth(1);
                    doc.rect(x, y, size * 1.5, size); // Envelope body
                    doc.line(x, y, x + size * 0.75, y + size / 2); // Left flap
                    doc.line(x + size * 1.5, y, x + size * 0.75, y + size / 2); // Right flap
                };

                const drawPhoneIcon = (x, y, size = 10) => {
                    doc.setLineWidth(1);
                    doc.circle(x + size / 2, y + size / 2, size / 2); // Icon bg
                    // Simple receiver using a thick line for simplicity at small scale
                    doc.setLineWidth(2);
                    doc.line(x + 3, y + 5, x + size - 3, y + 5);
                    doc.line(x + 3, y + 5, x + 3, y + size - 2);
                };

                // Address Line 1
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal"); // CRITICAL: Reset to normal for accurate width calc

                const addr1 = data.school.addressline1 || '';
                const addr1W = doc.getTextWidth(addr1);
                const addrX = (pageW / 2) - (addr1W / 2);
                drawLocationIcon(addrX - 12, margin + 95, 8);
                drawText(addr1, pageW / 2, margin + 95, 10, false, [0, 0, 0], 'center');

                drawText(data.school.addressline2 || '', pageW / 2, margin + 108, 10, false, [0, 0, 0], 'center');

                // Email
                doc.setFont("helvetica", "normal");
                const emailText = `Email: ${data.school.email || ''}`;
                const emailW = doc.getTextWidth(emailText);
                const emailX = (pageW / 2) - (emailW / 2);
                drawEmailIcon(emailX - 22, margin + 118, 8); // Adjusted Y to 118 for vert alignment
                drawText(emailText, pageW / 2, margin + 125, 10, false, [0, 0, 0], 'center');

                // Phone
                doc.setFont("helvetica", "normal");
                const phoneText = `Phone: ${data.school.phone || ''}`;
                const phoneW = doc.getTextWidth(phoneText);
                const phoneX = (pageW / 2) - (phoneW / 2);
                drawPhoneIcon(phoneX - 20, margin + 132, 10);
                drawText(phoneText, pageW / 2, margin + 140, 10, false, [0, 0, 0], 'center');
            }

            // Left: CBSE Logo
            try {
                const cbseLogoImg = new Image();
                cbseLogoImg.src = '/CBSE_logo.jpeg';
                doc.addImage(cbseLogoImg, 'JPEG', margin + 10, margin + 45, 60, 60);
            } catch (e) { }

            // Right: School Logo
            if (data.school?.logolink) {
                try {
                    const logoUrl = data.school.logolink.startsWith('http') ? data.school.logolink : `${ep1.defaults.baseURL}/${data.school.logolink}`;
                    doc.addImage(logoUrl, 'PNG', pageW - margin - 70, margin + 45, 60, 60);
                } catch (e) { }
            }
        };

        // ==================== PAGE 1: PROFILE ====================
        drawPageBorder();
        drawSchoolHeader();

        // Performance Profile Heading
        drawText("PERFORMANCE  PROFILE", pageW / 2, 210, 18, true, [0, 0, 0], 'center');
        drawText(`Session : ${academicyear}`, pageW / 2, 235, 14, true, [0, 0, 0], 'center');
        drawLine(180, 240, 415, 240, 1.5); // Underline

        // Sub-heading: Student Profile
        drawText("Student Profile", margin + 20, 270, 14, true);

        // Photo
        const photoW = 80;
        const photoH = 100;
        const photoX = pageW - margin - photoW - 15;
        const photoY = 295; // Shifted further down

        drawRect(photoX, photoY, photoW, photoH, { lineWidth: 1 });
        if (data.profile?.photo) {
            try {
                const pUrl = data.profile.photo.startsWith('http') ? data.profile.photo : `${ep1.defaults.baseURL}/${data.profile.photo}`;
                doc.addImage(pUrl, 'JPEG', photoX + 1, photoY + 1, photoW - 2, photoH - 2);
            } catch (e) { drawText("Photo", photoX + 25, photoY + 50, 10); }
        } else {
            drawText("Photo", photoX + 25, photoY + 50, 10);
        }

        const profileStartY = 300; // Shifted down to match photoY
        const lblX = margin + 20;
        const valX = margin + 140;
        const lineLen = 220;
        const rowH = 30;

        const drawField = (label, value, y, maxLen = lineLen) => {
            drawText(label, lblX, y, 12, true);
            drawText(":", lblX + 110, y, 12, true);
            drawText(value || "", valX, y, 12);
            drawLine(valX, y + 3, valX + maxLen, y + 3, 1);
        };

        drawField("Student's Name", data.profile.name, profileStartY);
        drawField("Father's Name", data.profile.father, profileStartY + rowH);
        drawField("Mother's Name", data.profile.mother, profileStartY + rowH * 2);
        drawField("Resi. Address", data.profile.address, profileStartY + rowH * 3, 280); // 280 to be safe


        const splitY = profileStartY + rowH * 4;

        drawText("Class", lblX, splitY, 12, true);
        drawText(":", lblX + 40, splitY, 12, true);
        drawText(`${semester}`, lblX + 50, splitY, 12);
        drawLine(lblX + 50, splitY + 3, lblX + 150, splitY + 3, 1);

        drawText("Section", lblX + 170, splitY, 12, true);
        drawText(":", lblX + 220, splitY, 12, true);
        drawText(data.profile.class.split('-')[1] || "", lblX + 230, splitY, 12);
        drawLine(lblX + 230, splitY + 3, lblX + 300, splitY + 3, 1);

        const splitY2 = splitY + rowH;
        drawText("Roll No.", lblX, splitY2, 12, true);
        drawText(":", lblX + 50, splitY2, 12, true);
        drawText(data.profile.rollno, lblX + 60, splitY2, 12);
        drawLine(lblX + 60, splitY2 + 3, lblX + 150, splitY2 + 3, 1);

        drawText("DOB", lblX + 170, splitY2, 12, true);
        drawText(":", lblX + 200, splitY2, 12, true);
        drawText(data.profile.dob, lblX + 210, splitY2, 10);
        drawLine(lblX + 210, splitY2 + 3, lblX + 300, splitY2 + 3, 1);

        const splitY3 = splitY2 + rowH;
        drawField("Admission No.", data.profile.regno, splitY3);
        drawField("CBSE Reg. No.", "", splitY3 + rowH);

        // Attendance Table
        const attY = 600;
        const attX = margin + 20;
        const attW = contentW - 40;

        drawRect(attX, attY, attW, 25, { fillColor: [230, 230, 230], lineWidth: 1 });
        drawRect(attX, attY + 25, attW, 25, { lineWidth: 1 });
        drawRect(attX, attY + 50, attW, 25, { lineWidth: 1 });

        const col1 = attW * 0.4;
        const col2 = attW * 0.3;

        drawLine(attX + col1, attY, attX + col1, attY + 75, 1);
        drawLine(attX + col1 + col2, attY, attX + col1 + col2, attY + 75, 1);

        drawText("Attendance", attX + col1 / 2, attY + 17, 12, true, [0, 0, 0], 'center');
        drawText("Term-I", attX + col1 + col2 / 2, attY + 17, 12, true, [0, 0, 0], 'center');
        drawText("Term-II", attX + col1 + col2 + col2 / 2, attY + 17, 12, true, [0, 0, 0], 'center');

        drawText("Total Working Days", attX + 10, attY + 42, 11);
        drawText(data.profile.term1workingdays || '-', attX + col1 + col2 / 2, attY + 42, 11, false, [0, 0, 0], 'center');
        drawText(data.profile.term2workingdays || '-', attX + col1 + col2 + col2 / 2, attY + 42, 11, false, [0, 0, 0], 'center');

        drawText("Total Attendance", attX + 10, attY + 67, 11);
        drawText(data.profile.term1attendance || '-', attX + col1 + col2 / 2, attY + 67, 11, false, [0, 0, 0], 'center');
        drawText(data.profile.term2attendance || '-', attX + col1 + col2 + col2 / 2, attY + 67, 11, false, [0, 0, 0], 'center');


        // ==================== PAGE 2: SCHOLASTIC AREAS ====================
        doc.addPage();
        drawPageBorder();

        drawText("PART I - SCHOLASTIC AREAS", pageW / 2, 60, 14, true, [0, 0, 0], 'center');

        const tabX = margin + 10;
        const tabY = 80;
        const tabW = contentW - 20;

        const wSr = 25;
        const wSub = 90;
        const wTot = 40;
        const wGrd = 40;

        const remW = tabW - (wSr + wSub + wTot + wGrd);
        const groupW = remW / 3;
        const subW = groupW / 4;

        const startX_Unit = tabX + wSr + wSub;
        const startX_Half = startX_Unit + groupW;
        const startX_Ann = startX_Half + groupW;
        const startX_Tot = startX_Ann + groupW;
        const startX_Grd = startX_Tot + wTot;

        const h1 = 25;
        const h2 = 25;
        const h3 = 25;

        // Draw Headers
        drawRect(tabX, tabY, wSr, h1 + h2 + h3);
        drawText("Sr", tabX + wSr / 2, tabY + 40, 9, true, [0, 0, 0], 'center');

        drawRect(tabX + wSr, tabY, wSub, h1 + h2 + h3);
        drawText("Subject", tabX + wSr + wSub / 2, tabY + 40, 10, true, [0, 0, 0], 'center');

        drawRect(startX_Unit, tabY, groupW, h1);
        drawText("UNIT TEST", startX_Unit + groupW / 2, tabY + 17, 9, true, [0, 0, 0], 'center');

        const uCols = ["Pre Mid", "Post Mid", "(A)", "(I)"];
        const uSub = ["(50)", "(50)", "(100)", "20%"];
        uCols.forEach((t, i) => {
            drawRect(startX_Unit + (i * subW), tabY + h1, subW, h2);
            drawText(t, startX_Unit + (i * subW) + subW / 2, tabY + h1 + 15, 6, true, [0, 0, 0], 'center');
            drawRect(startX_Unit + (i * subW), tabY + h1 + h2, subW, h3);
            drawText(uSub[i], startX_Unit + (i * subW) + subW / 2, tabY + h1 + h2 + 15, 6, true, [0, 0, 0], 'center');
        });

        drawRect(startX_Half, tabY, groupW, h1);
        drawText("HALF YEARLY", startX_Half + groupW / 2, tabY + 17, 9, true, [0, 0, 0], 'center');
        const hCols = ["TH", "Practical", "(B)", "(II)"];
        const hSub = ["(70/80)", "(30/20)", "(100)", "30%"];
        hCols.forEach((t, i) => {
            drawRect(startX_Half + (i * subW), tabY + h1, subW, h2);
            drawText(t, startX_Half + (i * subW) + subW / 2, tabY + h1 + 15, 6, true, [0, 0, 0], 'center');
            drawRect(startX_Half + (i * subW), tabY + h1 + h2, subW, h3);
            drawText(hSub[i], startX_Half + (i * subW) + subW / 2, tabY + h1 + h2 + 15, 6, true, [0, 0, 0], 'center');
        });

        drawRect(startX_Ann, tabY, groupW, h1);
        drawText("ANNUAL EXAM", startX_Ann + groupW / 2, tabY + 17, 9, true, [0, 0, 0], 'center');
        const aCols = ["TH", "Practical", "(C)", "(III)"];
        const aSub = ["(70/80)", "(30/20)", "(100)", "50%"];
        aCols.forEach((t, i) => {
            drawRect(startX_Ann + (i * subW), tabY + h1, subW, h2);
            drawText(t, startX_Ann + (i * subW) + subW / 2, tabY + h1 + 15, 6, true, [0, 0, 0], 'center');
            drawRect(startX_Ann + (i * subW), tabY + h1 + h2, subW, h3);
            drawText(aSub[i], startX_Ann + (i * subW) + subW / 2, tabY + h1 + h2 + 15, 6, true, [0, 0, 0], 'center');
        });

        drawRect(startX_Tot, tabY, wTot, h1 + h2 + h3);
        drawText("TOTAL", startX_Tot + wTot / 2, tabY + 30, 8, true, [0, 0, 0], 'center');
        drawText("(I+II+III)", startX_Tot + wTot / 2, tabY + 45, 6, false, [0, 0, 0], 'center');

        drawRect(startX_Grd, tabY, wGrd, h1 + h2 + h3);
        drawText("GRADE", startX_Grd + wGrd / 2, tabY + 40, 8, true, [0, 0, 0], 'center');

        // DATA ROWS
        let cY = tabY + h1 + h2 + h3;
        const rH = 20;

        let sums = {
            unit: [0, 0, 0, 0],
            half: [0, 0, 0, 0],
            ann: [0, 0, 0, 0],
            tot: 0
        };

        data.subjects.forEach((sub, idx) => {
            drawRect(tabX, cY, wSr, rH);
            drawText(idx + 1, tabX + wSr / 2, cY + 14, 9, false, [0, 0, 0], 'center');

            drawRect(tabX + wSr, cY, wSub, rH);
            drawText(sub.subjectname.substring(0, 18), tabX + wSr + 2, cY + 14, 9);

            const uVals = [sub.unitpremid, sub.unitpostmid, sub.unitTotal, sub.unit20];
            uVals.forEach((v, i) => {
                drawRect(startX_Unit + (i * subW), cY, subW, rH);
                drawText(v || '-', startX_Unit + (i * subW) + subW / 2, cY + 14, 8, false, [0, 0, 0], 'center');
                if (!isNaN(parseFloat(v))) sums.unit[i] += parseFloat(v);
            });

            const hVals = [sub.hyTh, sub.hyPr, sub.hyTotal, sub.hy30];
            hVals.forEach((v, i) => {
                drawRect(startX_Half + (i * subW), cY, subW, rH);
                drawText(v || '-', startX_Half + (i * subW) + subW / 2, cY + 14, 8, false, [0, 0, 0], 'center');
                if (!isNaN(parseFloat(v))) sums.half[i] += parseFloat(v);
            });

            const aVals = [sub.annTh, sub.annPr, sub.annTotal, sub.ann50];
            aVals.forEach((v, i) => {
                drawRect(startX_Ann + (i * subW), cY, subW, rH);
                drawText(v || '-', startX_Ann + (i * subW) + subW / 2, cY + 14, 8, false, [0, 0, 0], 'center');
                if (!isNaN(parseFloat(v))) sums.ann[i] += parseFloat(v);
            });

            drawRect(startX_Tot, cY, wTot, rH);
            drawText(sub.grandTotal || '-', startX_Tot + wTot / 2, cY + 14, 9, true, [0, 0, 0], 'center');
            if (!isNaN(parseFloat(sub.grandTotal))) sums.tot += parseFloat(sub.grandTotal);

            drawRect(startX_Grd, cY, wGrd, rH);
            drawText(sub.grade || '-', startX_Grd + wGrd / 2, cY + 14, 9, true, [0, 0, 0], 'center');

            cY += rH;
        });

        // --- SUMMARY ROWS ---
        const lastSubIdx = data.subjects.length; // +1 for 1-based

        // 1. Max Marks
        drawRect(tabX, cY, wSr, rH);
        drawText(lastSubIdx + 1, tabX + wSr / 2, cY + 14, 9, false, [0, 0, 0], 'center');
        drawRect(tabX + wSr, cY, wSub, rH);
        drawText("Max Marks", tabX + wSr + 2, cY + 14, 9, true);

        // Blank cells for Max Marks (or hardcoded)
        for (let k = 0; k < 4; k++) drawRect(startX_Unit + (k * subW), cY, subW, rH);
        for (let k = 0; k < 4; k++) drawRect(startX_Half + (k * subW), cY, subW, rH);
        for (let k = 0; k < 4; k++) drawRect(startX_Ann + (k * subW), cY, subW, rH);
        drawRect(startX_Tot, cY, wTot, rH);
        drawRect(startX_Grd, cY, wGrd, rH);
        cY += rH;

        // 2. Marks Obtained
        drawRect(tabX, cY, wSr, rH);
        drawText(lastSubIdx + 2, tabX + wSr / 2, cY + 14, 9, false, [0, 0, 0], 'center');
        drawRect(tabX + wSr, cY, wSub, rH);
        drawText("Marks Obtained", tabX + wSr + 2, cY + 14, 9, true);

        // Show sums
        sums.unit.forEach((v, i) => { drawRect(startX_Unit + (i * subW), cY, subW, rH); drawText(v.toFixed(0), startX_Unit + (i * subW) + subW / 2, cY + 14, 8, false, [0, 0, 0], 'center'); });
        sums.half.forEach((v, i) => { drawRect(startX_Half + (i * subW), cY, subW, rH); drawText(v.toFixed(0), startX_Half + (i * subW) + subW / 2, cY + 14, 8, false, [0, 0, 0], 'center'); });
        sums.ann.forEach((v, i) => { drawRect(startX_Ann + (i * subW), cY, subW, rH); drawText(v.toFixed(0), startX_Ann + (i * subW) + subW / 2, cY + 14, 8, false, [0, 0, 0], 'center'); });
        drawRect(startX_Tot, cY, wTot, rH); drawText(sums.tot.toFixed(0), startX_Tot + wTot / 2, cY + 14, 9, true, [0, 0, 0], 'center');
        drawRect(startX_Grd, cY, wGrd, rH);
        cY += rH;

        // 3. Percentage
        drawRect(tabX, cY, wSr, rH);
        drawText(lastSubIdx + 3, tabX + wSr / 2, cY + 14, 9, false, [0, 0, 0], 'center');
        drawRect(tabX + wSr, cY, wSub, rH);
        drawText("Percentage", tabX + wSr + 2, cY + 14, 9, true);
        // Spanning all main cols
        drawRect(startX_Unit, cY, tabW - (wSr + wSub), rH);
        // Or keep grid? User image shows grid continues.
        // But Percentage is one value? Ah, user image has empty cells. Let's make empty grid.
        // Actually, user image shows Percentage Row is just one merged cell or empty cells? 
        // It has grid lines. So I will reproduce grid lines.
        // I will place % in the Total column or Middle?
        // User image shows empty cells. I'll just draw grid.
        // I'll put my calc % in a reasonable place (e.g. Total Col or just Text).

        // Grid
        // ... (Drawing grid loops) ...
        const drawEmptyRow = () => {
            for (let k = 0; k < 4; k++) drawRect(startX_Unit + (k * subW), cY, subW, rH);
            for (let k = 0; k < 4; k++) drawRect(startX_Half + (k * subW), cY, subW, rH);
            for (let k = 0; k < 4; k++) drawRect(startX_Ann + (k * subW), cY, subW, rH);
            drawRect(startX_Tot, cY, wTot, rH);
            drawRect(startX_Grd, cY, wGrd, rH);
        }
        drawEmptyRow();
        // Print Percentage
        drawText(`${data.percentage}%`, startX_Tot + wTot / 2, cY + 14, 9, true, [0, 0, 0], 'center');
        cY += rH;

        // 4. Rank
        drawRect(tabX, cY, wSr, rH);
        drawText(lastSubIdx + 4, tabX + wSr / 2, cY + 14, 9, false, [0, 0, 0], 'center');
        drawRect(tabX + wSr, cY, wSub, rH);
        drawText("Rank", tabX + wSr + 2, cY + 14, 9, true);
        drawEmptyRow();
        drawText(data.rank || '-', startX_Tot + wTot / 2, cY + 14, 9, true, [0, 0, 0], 'center');
        cY += rH;

        // 5. Class Teacher's Remarks (AS TABLE ROW)
        const rHR = 30; // Increased height
        drawRect(tabX, cY, wSr, rHR);
        drawText(lastSubIdx + 5, tabX + wSr / 2, cY + 15, 9, false, [0, 0, 0], 'center');
        drawRect(tabX + wSr, cY, wSub, rHR);

        // Wrapped Text
        doc.setFontSize(8);
        doc.text("Class Teacher's", tabX + wSr + 2, cY + 12);
        doc.text("Remarks", tabX + wSr + 2, cY + 22);

        // Merged Cell for Remark
        drawRect(startX_Unit, cY, tabW - (wSr + wSub), rHR);
        if (data.remarks) drawText(data.remarks, startX_Unit + 10, cY + 18, 9);
        cY += rHR;


        cY += 30;

        // PART II: CO-SCHOLASTIC
        drawText("PART II : CO-SCHOLASTIC AREAS [ON A 5 POINT (A-E) GRADING SCALE]", tabX, cY, 11, true);
        cY += 15;

        const coTabW = tabW;

        drawRect(tabX, cY, 80, 25, { fillColor: [240, 240, 240], lineWidth: 1 });
        drawText("CODE", tabX + 40, cY + 17, 10, true, [0, 0, 0], 'center');

        drawRect(tabX + 80, cY, coTabW - 180, 25, { fillColor: [240, 240, 240], lineWidth: 1 });
        drawText("AREA", tabX + 80 + (coTabW - 180) / 2, cY + 17, 10, true, [0, 0, 0], 'center');

        drawRect(tabX + coTabW - 100, cY, 100, 25, { fillColor: [240, 240, 240], lineWidth: 1 });
        drawText("GRADE", tabX + coTabW - 50, cY + 17, 10, true, [0, 0, 0], 'center');

        cY += 25;
        const coScholastics = [
            { code: "500", name: "Work Education", grade: "" },
            { code: "502", name: "Physical & Health Education", grade: "" },
            { code: "503", name: "General Studies", grade: "" }
        ];

        coScholastics.forEach(co => {
            drawRect(tabX, cY, 80, 25);
            drawText(co.code, tabX + 40, cY + 17, 10, false, [0, 0, 0], 'center');

            drawRect(tabX + 80, cY, coTabW - 180, 25);
            drawText(co.name, tabX + 90, cY + 17, 10);

            drawRect(tabX + coTabW - 100, cY, 100, 25);
            drawText(co.grade, tabX + coTabW - 50, cY + 17, 10, false, [0, 0, 0], 'center');

            cY += 25;
        });

        // COMPARTMENT TABLE
        cY += 30;
        drawText("DETAILS OF COMPARTMENT EXAMINATION", tabX + (tabW / 2), cY, 11, true, [0, 0, 0], 'center');
        cY += 15;

        const compCols = ["SR. NO.", "SUBJECT", "MAX MARKS", "MARKS OBT", "RESULT"];
        const compWs = [50, 200, 80, 100, tabW - 430];
        let ccX = tabX;
        compCols.forEach((h, i) => {
            drawRect(ccX, cY, compWs[i], 25, { fillColor: [240, 240, 240], lineWidth: 1 });
            drawText(h, ccX + compWs[i] / 2, cY + 17, 8, true, [0, 0, 0], 'center');
            ccX += compWs[i];
        });
        cY += 25;
        // Empty Rows (1)
        for (let r = 0; r < 1; r++) {
            ccX = tabX;
            compWs.forEach((w, i) => {
                drawRect(ccX, cY, w, 25);
                ccX += w;
            });
            cY += 25;
        }

        // ==================== PAGE 3: INSTRUCTIONS ====================
        doc.addPage();
        drawPageBorder();

        drawText("Instructions", 297.5, 60, 16, true, [0, 0, 0], 'center'); // Underline manually if needed
        drawLine(250, 65, 345, 65, 1);

        drawText("Grading scale for scholastic areas: Grades are awarded on a 8-point grading", 40, 100, 12);
        drawText("scale as follows:", 40, 115, 12);

        // Grade Table 1
        let gY = 140;
        const gX = 80;
        drawRect(gX, gY, 435, 25, { fillColor: [240, 240, 240], lineWidth: 1 });
        drawText("MARKS RANGE", gX + 100, gY + 17, 11, true);
        drawText("GRADE", gX + 320, gY + 17, 11, true);

        gY += 25;
        const gradeScale = [
            ["91-100", "A1"], ["81-90", "A2"], ["71-80", "B1"], ["61-70", "B2"],
            ["51-60", "C1"], ["41-50", "C2"], ["33-40", "D"], ["32 & Below", "E (Failed)"]
        ];

        gradeScale.forEach(row => {
            drawRect(gX, gY, 217.5, 25);
            drawText(row[0], gX + 108, gY + 17, 10, false, [0, 0, 0], 'center');

            drawRect(gX + 217.5, gY, 217.5, 25);
            drawText(row[1], gX + 326, gY + 17, 10, false, [0, 0, 0], 'center');
            gY += 25;
        });

        gY += 40;
        drawText("Grading scale for Internal Assessment: Grades awarded on 5-point scale:", 40, gY, 12);
        gY += 25;

        // Grade Table 2 (Internal/Co-Scholastic)
        drawRect(gX, gY, 435, 25, { fillColor: [240, 240, 240] });
        drawText("MARKS RANGE", gX + 100, gY + 17, 11, true);
        drawText("GRADE", gX + 320, gY + 17, 11, true);
        gY += 25;

        const user5Point = [
            ["40-50", "A"], ["31-40", "B"], ["21-30", "C"], ["11-20", "D"], ["10 & Below", "E"]
        ];

        user5Point.forEach(row => {
            drawRect(gX, gY, 217.5, 25);
            drawText(row[0], gX + 108, gY + 17, 10, false, [0, 0, 0], 'center');
            drawRect(gX + 217.5, gY, 217.5, 25);
            drawText(row[1], gX + 326, gY + 17, 10, false, [0, 0, 0], 'center');
            gY += 25;
        });

        // --- NEW LOCATION: Result / Promotion / Date / Signatures (After Instructions) ---
        gY += 40;

        drawText(`RESULT: ${data.result}`, 40, gY, 14, true);
        drawText(`RANK: ${data.rank || '-'}`, 300, gY, 14, true);
        gY += 30;

        drawText("Congratulations! Promoted to class:", 40, gY, 12);
        const pClass = data.promotedToClass || "";
        drawText(pClass, 260, gY, 12);
        drawLine(250, gY + 3, 500, gY + 3, 1);
        gY += 25;

        drawText("New Session Begins on:", 40, gY, 12);
        let nDate = data.newSessionDate || "";
        if (nDate && nDate.includes('-')) {
            const [yyyy, mm, dd] = nDate.split('-');
            if (yyyy && mm && dd && yyyy.length === 4) {
                nDate = `${dd}/${mm}/${yyyy}`;
            }
        }
        drawText(nDate, 200, gY, 12);
        drawLine(190, gY + 3, 400, gY + 3, 1);
        gY += 25;

        drawText("Date:", 40, gY, 12);
        drawLine(80, gY + 3, 200, gY + 3, 1);

        // Signatures
        const sY = 800;
        drawText("Class Teacher", 50, sY, 12, true);
        drawText("Exam Incharge", 250, sY, 12, true, [0, 0, 0], 'center');
        drawText("Principal", 480, sY, 12, true);


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
                Class 11 & 12 Report Card (PDF)
            </Typography>

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
                        <Grid item xs={12} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Semester/Class"
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
                        <Grid item xs={12} md={3} sx={{ textAlign: 'right' }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
                                onClick={handleOpenPdfDialog}
                                disabled={loading}
                            >
                                Generate PDF
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* GENERATE PDF DIALOG */}
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

export default StudentMarksheetViewPage11ds;
