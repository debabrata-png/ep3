import React, { useState, useEffect, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Typography, Button, MenuItem, TextField, Paper, Grid, FormControl, InputLabel, Select, Card
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Cell, LabelList, PieChart, Pie, Legend
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

const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#06b6d4"];

const CrmdsLeadStatusStageReport = () => {
    const [counselor, setCounselor] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summary, setSummary] = useState([]);
    const [counselorsList, setCounselorsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef();
    const colid = global1.colid;

    const loadCounselors = async () => {
        try {
            const res = await ep1.post("/api/v2/crmds/get-counsellors", { colid });
            if (res.data.success) {
                setCounselorsList(res.data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await ep1.post("/api/v2/crmds/lead-status-stage-report", {
                counselor,
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
        loadCounselors();
        generateReport();
    }, []);

    const exportExcel = () => {
        if (!summary.length) return alert("No data to export");
        const exportData = summary.map(d => ({
            "Pipeline Stage": d.pipelineStage,
            "No. of Leads": d.noOfLeads,
            "Counsellor Name": d.counsellorName
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Lead Status Stage Wise");
        const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([buffer], { type: "application/octet-stream" }), "Lead_Status_Stage_Report.xlsx");
    };

    const exportPDF = async () => {
        if (!summary.length) return alert("No data to export");
        const pdf = new jsPDF("p", "mm", "a4");

        pdf.setFontSize(22);
        pdf.setTextColor(67, 56, 202);
        pdf.text("Lead Status (Stage Wise) Report", 14, 20);
        pdf.setFontSize(11);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        pdf.text(`Total Entries: ${summary.length}`, 14, 34);

        let currentY = 40;

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
            head: [["Pipeline Stage", "No. of Leads", "Counsellor Name"]],
            body: summary.map(r => [r.pipelineStage, r.noOfLeads, r.counsellorName]),
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [67, 56, 202], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 247, 255] },
            margin: { left: 14, right: 14 }
        });

        pdf.save("Lead_Status_Stage_Report.pdf");
    };

    const columns = [
        { field: "pipelineStage", headerName: "Pipeline Stage", flex: 1.5 },
        { field: "noOfLeads", headerName: "No. of Leads", flex: 1, type: 'number', align: 'left', headerAlign: 'left' },
        { field: "counsellorName", headerName: "Counsellor Name", flex: 1.2 }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: 4, p: 4, mb: 4, color: 'white',
                display: 'flex', alignItems: 'center', gap: 3,
                boxShadow: '0 10px 30px -5px rgba(79, 70, 229, 0.4)'
            }}>
                <FilterAltIcon sx={{ fontSize: 48, opacity: 0.9 }} />
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>
                        Lead Status Report (Stage Wise)
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.8, fontWeight: 500 }}>
                        Track lead distribution across various pipeline stages by counselor
                    </Typography>
                </Box>
            </Box>

            {/* Filters */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="counselor-select">Select Counselor</InputLabel>
                            <Select
                                labelId="counselor-select"
                                value={counselor}
                                label="Select Counselor"
                                onChange={(e) => setCounselor(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="ALL">All Counselors</MenuItem>
                                {counselorsList.map((c, i) => (
                                    <MenuItem key={i} value={c}>{c}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                        <TextField
                            fullWidth size="small" type="date" label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                        <TextField
                            fullWidth size="small" type="date" label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="contained" fullWidth onClick={generateReport} disabled={loading}
                            sx={{
                                borderRadius: 2.5, fontWeight: 700, textTransform: 'none', py: 1,
                                bgcolor: '#4f46e5', '&:hover': { bgcolor: '#4338ca' },
                                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                            }}
                        >
                            {loading ? "Generating..." : "Generate"}
                        </Button>
                        <Button
                            variant="outlined" color="success" onClick={exportExcel}
                            startIcon={<DownloadIcon />}
                            sx={{
                                borderRadius: 2.5, fontWeight: 600, textTransform: 'none',
                                px: 3, borderColor: '#10b981', color: '#10b981',
                                '&:hover': { borderColor: '#059669', bgcolor: '#ecfdf5' }
                            }}
                        >
                            Excel
                        </Button>
                        <Button
                            variant="outlined" color="error" onClick={exportPDF}
                            startIcon={<PictureAsPdfIcon />}
                            sx={{
                                borderRadius: 2.5, fontWeight: 600, textTransform: 'none',
                                px: 3, borderColor: '#f43f5e', color: '#f43f5e',
                                '&:hover': { borderColor: '#e11d48', bgcolor: '#fff1f2' }
                            }}
                        >
                            PDF
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={4}>
                {/* Graph */}
                <Grid item xs={12} lg={7}>
                    <Paper ref={chartRef} elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', height: 500 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 4 }}>
                            Stage Distribution Visualization
                        </Typography>
                        <Box sx={{ width: "100%", height: 380 }}>
                            <ResponsiveContainer>
                                <BarChart data={summary} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="pipelineStage"
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                        tickLine={false}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                    />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="noOfLeads" radius={[6, 6, 0, 0]} maxBarSize={50} isAnimationActive={false}>
                                        <LabelList dataKey="noOfLeads" position="top" style={{ fill: '#475569', fontWeight: 800, fontSize: 12 }} />
                                        {summary.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Data Table */}
                <Grid item xs={12} lg={5}>
                    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', overflow: 'hidden', height: 500 }}>
                        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                                Stage Summary Details
                            </Typography>
                        </Box>
                        <Box sx={{ height: 420, width: "100%", bgcolor: '#ffffff' }}>
                            <DataGrid
                                rows={summary.map((r, i) => ({ id: i, ...r }))}
                                columns={columns}
                                rowHeight={52}
                                hideFooter={summary.length < 10}
                                disableRowSelectionOnClick
                                sx={{
                                    border: 'none',
                                    '& .MuiDataGrid-columnHeaders': { bgcolor: '#f8fafc', color: '#475569', fontWeight: 700 },
                                    '& .MuiDataGrid-cell': { borderBottom: '1px solid #f1f5f9', color: '#334155' },
                                    '& .MuiDataGrid-row:hover': { bgcolor: '#f8fafc' },
                                }}
                            />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CrmdsLeadStatusStageReport;
