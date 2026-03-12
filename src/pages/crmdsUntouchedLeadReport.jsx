import React, { useState, useEffect, useRef } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Typography, Button, TextField, Paper, Grid, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
    PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend
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

const COLORS = ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#fff1f2"];

const CrmdsUntouchedLeadReport = () => {
    const [counselor, setCounselor] = useState("ALL");
    const [leads, setLeads] = useState([]);
    const [counselorsList, setCounselorsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const chartRef = useRef();
    const colid = global1.colid;

    const loadCounselors = async () => {
        try {
            const res = await ep1.post("/api/v2/crmds/get-counsellors", { colid });
            if (res.data.success) setCounselorsList(res.data.data);
        } catch (err) { console.error(err); }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            const res = await ep1.post("/api/v2/crmds/untouched-leads-report", { counselor, colid });
            if (res.data.success) setLeads(res.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        loadCounselors();
        generateReport();
    }, []);

    const exportExcel = () => {
        if (!leads.length) return alert("No data");
        const exportData = leads.map(d => ({
            "Lead Name": d.leadName,
            "Mobile": d.mobile,
            "Assigned Counsellor": d.assignedCounsellor,
            "Days Pending": d.daysPending
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Untouched Leads");
        saveAs(new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "Untouched_Leads.xlsx");
    };

    const exportPDF = async () => {
        if (!leads.length) return alert("No data");
        const pdf = new jsPDF("p", "mm", "a4");
        
        pdf.setFontSize(20);
        pdf.setTextColor(225, 29, 72);
        pdf.text("Untouched Lead Report", 14, 20);
        pdf.setFontSize(10);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

        let currentY = 35;

        if (chartRef.current) {
            // Wait for any potential rendering/animations
            await new Promise(resolve => setTimeout(resolve, 800));
            const canvas = await html2canvas(chartRef.current, { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });
            const imgData = canvas.toDataURL("image/png");
            const pdfWidth = pdf.internal.pageSize.getWidth() - 28;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, "PNG", 14, currentY, pdfWidth, imgHeight);
            currentY += imgHeight + 10;
        }

        autoTable(pdf, {
            startY: currentY,
            head: [["Lead Name", "Mobile", "Assigned Counsellor", "Days Pending"]],
            body: leads.map(r => [r.leadName, r.mobile, r.assignedCounsellor, r.daysPending]),
            headStyles: { fillColor: [225, 29, 72] },
            alternateRowStyles: { fillColor: [255, 241, 242] }
        });
        pdf.save("Untouched_Leads.pdf");
    };

    const columns = [
        { field: "leadName", headerName: "Lead Name", flex: 1.5 },
        { field: "mobile", headerName: "Mobile", flex: 1 },
        { field: "assignedCounsellor", headerName: "Assigned Counsellor", flex: 1.2 },
        { 
            field: "daysPending", 
            headerName: "Days Pending", 
            flex: 1,
            cellClassName: (params) => params.value > 7 ? 'critical-pending' : ''
        }
    ];

    // Chart data: Distribution of pending days
    const bins = { "1-3 Days": 0, "4-7 Days": 0, "7+ Days": 0 };
    leads.forEach(l => {
        if (l.daysPending <= 3) bins["1-3 Days"]++;
        else if (l.daysPending <= 7) bins["4-7 Days"]++;
        else bins["7+ Days"]++;
    });
    const chartData = Object.keys(bins).map(k => ({ name: k, value: bins[k] }));

    return (
        <Box sx={{ p: 4, minHeight: '100vh', background: '#f8fafc' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)', borderRadius: 4, p: 4, mb: 4, color: 'white', boxShadow: '0 10px 30px -5px rgba(225, 29, 72, 0.4)' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Untouched Lead Report</Typography>
                <Typography variant="subtitle1">Identify leads that haven't been contacted yet</Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Counselor</InputLabel>
                            <Select value={counselor} label="Counselor" onChange={(e) => setCounselor(e.target.value)}>
                                <MenuItem value="ALL">All Counselors</MenuItem>
                                {counselorsList.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="contained" fullWidth onClick={generateReport} sx={{ bgcolor: '#e11d48' }}>Generate</Button>
                        <Button variant="outlined" color="success" onClick={exportExcel}>Excel</Button>
                        <Button variant="outlined" color="error" onClick={exportPDF}>PDF</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                    <Paper ref={chartRef} sx={{ p: 4, borderRadius: 4, height: 500 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Age Distribution</Typography>
                        <ResponsiveContainer>
                            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                                <Pie 
                                    data={chartData} 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    isAnimationActive={false}
                                >
                                    {chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ borderRadius: 4, height: 500, overflow: 'hidden' }}>
                        <DataGrid rows={leads.map((r, i) => ({ id: r._id || i, ...r }))} columns={columns} pagination />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default CrmdsUntouchedLeadReport;
