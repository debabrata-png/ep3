import React, { useState, useEffect, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Typography, Button, TextField, Paper, Grid
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList, Cell
} from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import global1 from "./global1.js";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e"];

const CrmdsConversionReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef();
    const colid = global1.colid;

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await ep1.post("/api/v2/crmds/conversion-report", { startDate, endDate, colid });
            if (res.data.success) setSummary(res.data.summary || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        generateReport();
    }, []);

    const exportExcel = () => {
        if (!summary.length) return alert("No data");
        const exportData = summary.map(d => ({
            "Counsellor": d.counsellor,
            "Leads": d.leads,
            "Admissions": d.admissions,
            "Conversion %": d.conversionPercent.toFixed(2) + "%"
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Conversion Report");
        saveAs(new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "Conversion_Report.xlsx");
    };

    const exportPDF = async () => {
        if (!summary.length) return alert("No data to export");
        const pdf = new jsPDF("p", "mm", "a4");

        pdf.setFontSize(22);
        pdf.setTextColor(67, 56, 202);
        pdf.text("Conversion Report", 14, 20);
        
        let currentY = 35;

        if (chartRef.current) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 14, currentY, pdfWidth, imgHeight);
            currentY += imgHeight + 10;
        }
        autoTable(pdf, {
            startY: currentY,
            head: [["Counsellor", "Leads", "Admissions", "Conversion %"]],
            body: summary.map(r => [r.counsellor, r.leads, r.admissions, r.conversionPercent.toFixed(2) + "%"]),
            headStyles: { fillColor: [16, 185, 129] }
        });
        pdf.save("Conversion_Report.pdf");
    };

    const columns = [
        { field: "counsellor", headerName: "Counsellor", flex: 1.5 },
        { field: "leads", headerName: "Leads", flex: 1, type: 'number' },
        { field: "admissions", headerName: "Admissions", flex: 1, type: 'number' },
        { 
            field: "conversionPercent", 
            headerName: "Conversion %", 
            flex: 1, 
            type: 'number',
            valueFormatter: (params) => params.value.toFixed(2) + "%"
        }
    ];

    return (
        <Box sx={{ p: 4, minHeight: '100vh', background: '#f8fafc' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', borderRadius: 4, p: 4, mb: 4, color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Conversion Report</Typography>
                <Typography variant="subtitle1">Analyze counsellor efficiency in converting leads to admissions</Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField fullWidth size="small" type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="contained" fullWidth onClick={generateReport} sx={{ bgcolor: '#059669' }}>Generate</Button>
                        <Button variant="outlined" color="success" onClick={exportExcel}>Excel</Button>
                        <Button variant="outlined" color="error" onClick={exportPDF}>PDF</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper ref={chartRef} sx={{ p: 4, mb: 4, borderRadius: 4, height: 500 }}>
                <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>Conversion Percentage by Counsellor</Typography>
                <ResponsiveContainer>
                    <BarChart data={summary} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="counsellor" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="conversionPercent" radius={[6, 6, 0, 0]} maxBarSize={60} isAnimationActive={false}>
                            <LabelList dataKey="conversionPercent" position="top" formatter={(v) => `${v.toFixed(1)}%`} style={{ fill: '#475569', fontWeight: 800, fontSize: 13 }} />
                            {summary.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            <Paper sx={{ borderRadius: 4, height: 500, overflow: 'hidden' }}>
                <DataGrid rows={summary.map((r, i) => ({ id: i, ...r }))} columns={columns} />
            </Paper>
        </Box>
    );
};

export default CrmdsConversionReport;
