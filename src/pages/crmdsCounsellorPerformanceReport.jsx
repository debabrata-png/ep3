import React, { useState, useEffect, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Typography, Button, TextField, Paper, Grid, FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList, Legend
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const CrmdsCounsellorPerformanceReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef();
    const colid = global1.colid;

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await ep1.post("/api/v2/crmds/counsellor-performance-report", {
                startDate,
                endDate,
                colid
            });
            if (res.data.success) {
                setSummary(res.data.summary || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, []);

    const exportExcel = () => {
        if (!summary.length) return alert("No data to export");
        const exportData = summary.map(d => ({
            "Counsellor": d.counsellor,
            "Total Leads": d.totalLeads,
            "Connected": d.connected,
            "Follow Up": d.followUp,
            "Admission": d.admission
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Counsellor Performance");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Counsellor_Performance_Report.xlsx");
    };

    const exportPDF = async () => {
        if (!summary.length) return alert("No data to export");
        const pdf = new jsPDF("p", "mm", "a4");

        pdf.setFontSize(22);
        pdf.setTextColor(67, 56, 202);
        pdf.text("Counsellor Performance Report", 14, 20);
        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

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
            head: [["Counsellor", "Total Leads", "Connected", "Follow Up", "Admission"]],
            body: summary.map(r => [r.counsellor, r.totalLeads, r.connected, r.followUp, r.admission]),
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [37, 99, 235], textColor: 255 },
            alternateRowStyles: { fillColor: [239, 246, 255] },
            margin: { left: 14, right: 14 }
        });

        pdf.save("Counsellor_Performance_Report.pdf");
    };

    const columns = [
        { field: "counsellor", headerName: "Counsellor", flex: 1.5 },
        { field: "totalLeads", headerName: "Total Leads", flex: 1, type: 'number' },
        { field: "connected", headerName: "Connected", flex: 1, type: 'number' },
        { field: "followUp", headerName: "Follow Up", flex: 1, type: 'number' },
        { field: "admission", headerName: "Admission", flex: 1, type: 'number' }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f8fafc' }}>
            <Box sx={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                borderRadius: 4, p: 4, mb: 4, color: 'white',
                display: 'flex', alignItems: 'center', gap: 3,
                boxShadow: '0 10px 30px -5px rgba(37, 99, 235, 0.4)'
            }}>
                <FilterAltIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Counsellor Performance Report
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                        Compare counsellor productivity across lead stages
                    </Typography>
                </Box>
            </Box>

            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth size="small" type="date" label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth size="small" type="date" label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="contained" fullWidth onClick={generateReport} disabled={loading}
                            sx={{ borderRadius: 2.5, bgcolor: '#2563eb', fontWeight: 700 }}
                        >
                            {loading ? "Generating..." : "Generate"}
                        </Button>
                        <Button variant="outlined" color="success" onClick={exportExcel} startIcon={<DownloadIcon />} sx={{ borderRadius: 2.5 }}>Excel</Button>
                        <Button variant="outlined" color="error" onClick={exportPDF} startIcon={<PictureAsPdfIcon />} sx={{ borderRadius: 2.5 }}>PDF</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper ref={chartRef} elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: 500 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Performance metrics by Counsellor</Typography>
                <Box sx={{ width: "100%", height: 380 }}>
                    <ResponsiveContainer>
                        <BarChart data={summary} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="counsellor"
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                angle={-45} textAnchor="end" interval={0}
                            />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="totalLeads" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            <Bar dataKey="connected" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            <Bar dataKey="followUp" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            <Bar dataKey="admission" fill="#ef4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>

            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Performance Details Table</Typography>
                </Box>
                <Box sx={{ height: 500, width: "100%", bgcolor: '#ffffff' }}>
                    <DataGrid
                        rows={summary.map((r, i) => ({ id: i, ...r }))}
                        columns={columns}
                        rowHeight={52}
                        disableRowSelectionOnClick
                        sx={{ border: 'none' }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default CrmdsCounsellorPerformanceReport;
