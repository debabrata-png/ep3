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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];

const CrmdsCounsellorPerformanceReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summary, setSummary] = useState([]);
    const [allStages, setAllStages] = useState([]);
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
                setAllStages(res.data.allStages || []);
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
                "Counsellor": d.counsellor,
                "Total Leads": d.totalLeads
            };
            allStages.forEach(stage => {
                row[stage] = d.stageCounts?.[stage] || 0;
            });
            return row;
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Counsellor Performance");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Counsellor_Performance_Report.xlsx");
    };

    const exportPDF = async () => {
        if (!summary.length) return alert("No data to export");
        const pdf = new jsPDF("l", "mm", "a4"); // Landscape for wide table

        pdf.setFontSize(18);
        pdf.setTextColor(37, 99, 235);
        pdf.text("Counsellor Performance Report", 14, 20);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 27);

        let currentY = 35;

        if (chartRef.current) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 14, currentY, pdfWidth, Math.min(imgHeight, 80));
            currentY += Math.min(imgHeight, 80) + 10;
        }

        const head = [["Counsellor", "Total Leads", ...allStages]];
        const body = summary.map(r => [
            r.counsellor, r.totalLeads,
            ...allStages.map(stage => r.stageCounts?.[stage] || 0)
        ]);

        autoTable(pdf, {
            startY: currentY,
            head,
            body,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [37, 99, 235], textColor: 255 },
            alternateRowStyles: { fillColor: [239, 246, 255] },
            margin: { left: 14, right: 14 }
        });

        pdf.save("Counsellor_Performance_Report.pdf");
    };

    // Dynamic columns: Counsellor + Total Leads + one column per stage
    const columns = [
        { field: "counsellor", headerName: "Counsellor", flex: 1.5, minWidth: 180 },
        { field: "totalLeads", headerName: "Total Leads", flex: 0.8, type: 'number', align: 'center', headerAlign: 'center', minWidth: 100 },
        ...allStages.map((stage, idx) => ({
            field: `stage_${stage}`,
            headerName: stage,
            flex: 0.8,
            minWidth: 110,
            type: 'number',
            align: 'center',
            headerAlign: 'center',
            valueGetter: (params) => {
                const row = params?.row || params;
                return row?.stageCounts?.[stage] || 0;
            },
            renderCell: (params) => {
                const val = params.row?.stageCounts?.[stage] || 0;
                return val > 0 ? (
                    <Box sx={{
                        bgcolor: COLORS[idx % COLORS.length] + '22',
                        color: COLORS[idx % COLORS.length],
                        borderRadius: 1, px: 1.5, py: 0.3,
                        fontWeight: 700, fontSize: 13
                    }}>{val}</Box>
                ) : <span style={{ color: '#94a3b8' }}>0</span>;
            }
        }))
    ];

    // Chart data: show top stages across all counsellors
    const chartData = summary.slice(0, 12).map(row => {
        const dataPoint = { counsellor: (row.counsellor || '').split('@')[0], totalLeads: row.totalLeads };
        allStages.forEach(stage => {
            dataPoint[stage] = row.stageCounts?.[stage] || 0;
        });
        return dataPoint;
    });

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
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
                        Stage-wise lead distribution per counsellor
                    </Typography>
                </Box>
            </Box>

            {/* Filters */}
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

            {/* Bar chart - top 4 stages */}
            {summary.length > 0 && allStages.length > 0 && (
                <Paper ref={chartRef} elevation={0} sx={{ p: 4, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', height: 460 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3 }}>
                        Stage-wise Performance by Counsellor
                    </Typography>
                    <Box sx={{ width: "100%", height: 360 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 70 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="counsellor" angle={-40} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="top" height={36} />
                                <Bar dataKey="totalLeads" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={false} name="Total" />
                                {allStages.slice(0, 4).map((stage, idx) => (
                                    <Bar key={stage} dataKey={stage} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} isAnimationActive={false} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Paper>
            )}

            {/* Dynamic Table */}
            <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0' }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Performance Details Table
                        {allStages.length > 0 && (
                            <Typography component="span" variant="body2" sx={{ ml: 1, color: '#64748b' }}>
                                ({allStages.length} pipeline stages)
                            </Typography>
                        )}
                    </Typography>
                </Box>
                <Box sx={{ width: "100%", bgcolor: '#ffffff', overflowX: 'auto' }}>
                    <DataGrid
                        rows={summary.map((r, i) => ({ id: i, ...r }))}
                        columns={columns}
                        rowHeight={52}
                        autoHeight
                        disableRowSelectionOnClick
                        sx={{
                            border: 'none', minWidth: 600,
                            '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 700 },
                            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9' },
                            '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default CrmdsCounsellorPerformanceReport;
