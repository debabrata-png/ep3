import React, { useState, useEffect, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Typography, Button, TextField, Paper, Grid, Card, CardContent
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
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

const CrmdsDailyCallingReport = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState([]);
    const [activeStages, setActiveStages] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef();
    const colid = global1.colid;

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await ep1.post("/api/v2/crmds/daily-calling-report", {
                startDate,
                endDate,
                colid
            });
            if (res.data.success) {
                setSummary(res.data.summary || []);
                setActiveStages(res.data.activeStages || []);
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
        const exportData = summary.map(d => {
            const row = {
                "Date": d.date,
                "Counsellor": d.counsellor,
                "New Leads Assigned": d.newLeadsAssigned,
                "Calls Done": d.callsDone
            };
            activeStages.forEach(stage => {
                row[stage] = d.stageCounts ? d.stageCounts[stage] : 0;
            });
            return row;
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Calling Report");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Daily_Calling_Report.xlsx");
    };

    const exportPDF = async () => {
        if (!summary.length) return alert("No data to export");
        const pdf = jsPDF("l", "mm", "a4");

        pdf.setFontSize(22);
        pdf.setTextColor(5, 150, 105);
        pdf.text("Daily Calling Report", 14, 20);
        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Period: ${startDate} to ${endDate}`, 14, 28);

        let currentY = 40;
        if (chartRef.current) {
            const canvas = await html2canvas(chartRef.current, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 14, currentY, pdfWidth, imgHeight);
            currentY += imgHeight + 10;
        }

        const headers = ["Date", "Counsellor", "New Leads", "Calls Done", ...activeStages];
        const rows = summary.map(r => [
            r.date, r.counsellor, r.newLeadsAssigned, r.callsDone,
            ...activeStages.map(s => r.stageCounts ? r.stageCounts[s] : 0)
        ]);

        autoTable(pdf, {
            startY: currentY,
            head: [headers],
            body: rows,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [5, 150, 105] },
            alternateRowStyles: { fillColor: [240, 253, 244] }
        });

        pdf.save("Daily_Calling_Report.pdf");
    };

    const columns = [
        { field: "date", headerName: "Date", flex: 1 },
        { field: "counsellor", headerName: "Counsellor", flex: 1.5 },
        { field: "newLeadsAssigned", headerName: "New Leads Assigned", flex: 1.2, type: 'number' },
        { field: "callsDone", headerName: "Calls Done", flex: 1, type: 'number' },
        ...activeStages.map(stage => ({
            field: `stage_${stage}`,
            headerName: stage,
            flex: 1,
            type: 'number',
            valueGetter: (params) => params.row.stageCounts ? params.row.stageCounts[stage] : 0
        }))
    ];

    // Prepare chart data (agg by date)
    const chartDataMap = {};
    summary.forEach(item => {
        if (!chartDataMap[item.date]) {
            chartDataMap[item.date] = { date: item.date, calls: 0 };
            activeStages.forEach(s => chartDataMap[item.date][s] = 0);
        }
        chartDataMap[item.date].calls += item.callsDone;
        activeStages.forEach(s => {
            chartDataMap[item.date][s] += (item.stageCounts ? item.stageCounts[s] : 0);
        });
    });
    const chartData = Object.values(chartDataMap).sort((a, b) => a.date.localeCompare(b.date));

    // Colors for dynamic lines
    const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f8fafc' }}>
            <Box sx={{
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                borderRadius: 4, p: 4, mb: 4, color: 'white',
                display: 'flex', alignItems: 'center', gap: 3,
                boxShadow: '0 10px 30px -5px rgba(16, 185, 129, 0.4)'
            }}>
                <FilterAltIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                        Daily Calling Report
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>
                        Monitor daily counselor activities and lead engagement across pipeline stages
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
                            sx={{ borderRadius: 2.5, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, fontWeight: 700 }}
                        >
                            {loading ? "Generating..." : "Generate"}
                        </Button>
                        <Button variant="outlined" color="success" onClick={exportExcel} startIcon={<DownloadIcon />} sx={{ borderRadius: 2.5 }}>Excel</Button>
                        <Button variant="outlined" color="error" onClick={exportPDF} startIcon={<PictureAsPdfIcon />} sx={{ borderRadius: 2.5 }}>PDF</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper ref={chartRef} elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: 500 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 4 }}>Call Activity Trend</Typography>
                <Box sx={{ width: "100%", height: 380 }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                            <Tooltip contentStyle={{ borderRadius: 12 }} />
                            <Legend />
                            <Line type="monotone" dataKey="calls" name="Total Calls" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                            {activeStages.map((stage, index) => (
                                <Line 
                                    key={stage}
                                    type="monotone" 
                                    dataKey={stage} 
                                    name={stage} 
                                    stroke={COLORS[index % COLORS.length]} 
                                    strokeWidth={2} 
                                    dot={{ r: 4 }} 
                                    activeDot={{ r: 6 }} 
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Paper>

            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ height: 600, width: "100%" }}>
                    <DataGrid
                        rows={summary.map((r, i) => ({ id: i, ...r }))}
                        columns={columns}
                        rowHeight={52}
                        disableRowSelectionOnClick
                    />
                </Box>
            </Paper>

        </Box>
    );
};

export default CrmdsDailyCallingReport;
