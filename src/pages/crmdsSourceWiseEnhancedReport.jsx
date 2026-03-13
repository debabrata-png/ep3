import React, { useState, useEffect, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Typography, Button, TextField, Paper, Grid
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, Cell
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

const COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#fef3c7"];

const CrmdsSourceWiseEnhancedReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [summary, setSummary] = useState([]);
    const [allStages, setAllStages] = useState([]);
    const [finalStageNames, setFinalStageNames] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef();
    const colid = global1.colid;

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await ep1.post("/api/v2/crmds/sourcewise-enhanced-report", { startDate, endDate, colid });
            if (res.data.success) {
                setSummary(res.data.summary || []);
                setAllStages(res.data.allStages || []);
                setFinalStageNames(res.data.finalStageNames || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        generateReport();
    }, []);

    const exportExcel = () => {
        if (!summary.length) return alert("No data");
        const exportData = summary.map(d => {
            const row = {
                "Source": d.source,
                "Total Leads": d.leads,
                "Admissions": d.admissions,
                "Conversion %": d.conversionPercent + "%"
            };
            allStages.forEach(stage => {
                row[stage] = d.stageCounts?.[stage] || 0;
            });
            return row;
        });
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Source Wise Enhanced");
        saveAs(new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "Source_Wise_Leads.xlsx");
    };

    const exportPDF = async () => {
        if (!summary.length) return alert("No data to export");
        const pdf = new jsPDF("p", "mm", "a4");

        pdf.setFontSize(22);
        pdf.setTextColor(67, 56, 202);
        pdf.text("Source Wise Lead Report (Enhanced)", 14, 20);
        
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
            head: [["Source", "Total Leads", "Admissions", "Conversion %", ...allStages]],
            body: summary.map(r => [
                r.source, 
                r.leads, 
                r.admissions, 
                r.conversionPercent + "%",
                ...allStages.map(stage => r.stageCounts?.[stage] || 0)
            ]),
            headStyles: { fillColor: [245, 158, 11] },
            styles: { fontSize: 8 }
        });
        pdf.save("Source_Wise_Leads.pdf");
    };

    const admissionLabel = finalStageNames.length
        ? `Admissions (${finalStageNames.join(", ")})`
        : "Admissions";

    const columns = [
        { field: "source", headerName: "Source", flex: 1.5, minWidth: 150 },
        { field: "leads", headerName: "Total Leads", flex: 1, type: 'number', minWidth: 100 },
        { field: "admissions", headerName: admissionLabel, flex: 1.2, type: 'number', minWidth: 150 },
        {
            field: "conversionPercent",
            headerName: "Conversion %",
            flex: 1,
            type: 'number',
            minWidth: 120,
            valueFormatter: (params) => (params?.value ?? 0) + "%"
        },
        ...allStages.map(stage => ({
            field: `stage_${stage}`,
            headerName: stage,
            flex: 1,
            minWidth: 110,
            type: 'number',
            valueGetter: (params) => {
                const row = params?.row || params;
                return row?.stageCounts?.[stage] || 0;
            }
        }))
    ];

    return (
        <Box sx={{ p: 4, minHeight: '100vh', background: '#f8fafc' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', borderRadius: 4, p: 4, mb: 4, color: 'white' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Source Wise Lead Report</Typography>
                <Typography variant="subtitle1">Analyze lead quality and conversions by source</Typography>
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
                        <Button variant="contained" fullWidth onClick={generateReport} sx={{ bgcolor: '#d97706' }}>Generate</Button>
                        <Button variant="outlined" color="success" onClick={exportExcel}>Excel</Button>
                        <Button variant="outlined" color="error" onClick={exportPDF}>PDF</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper ref={chartRef} sx={{ p: 4, mb: 4, borderRadius: 4, height: 500 }}>
                <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>Source Performance Visualization</Typography>
                <ResponsiveContainer>
                    <BarChart data={summary} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="source" tick={{ fontSize: 12, fontWeight: 600 }} angle={-45} textAnchor="end" interval={0} />
                        <YAxis tick={{ fontSize: 12 }} axisLine={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="leads" name="Total Leads" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                        <Bar dataKey="admissions" name="Admissions" fill="#f43f5e" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

            <Paper sx={{ borderRadius: 4, height: 500, overflow: 'hidden' }}>
                <DataGrid rows={summary.map((r, i) => ({ id: i, ...r }))} columns={columns} />
            </Paper>
        </Box>
    );
};

export default CrmdsSourceWiseEnhancedReport;
