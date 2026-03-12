import React, { useState, useEffect } from "react";
import ep1 from "../api/ep1.js";
import {
    Box, Typography, Button, TextField, Paper, Grid, MenuItem, Select, FormControl, InputLabel, Chip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import global1 from "./global1.js";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const CrmdsFollowUpDueReport = () => {
    const [counselor, setCounselor] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [leads, setLeads] = useState([]);
    const [counselorsList, setCounselorsList] = useState([]);
    const [loading, setLoading] = useState(false);
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
            const res = await ep1.post("/api/v2/crmds/follow-up-due-report", { counselor, startDate, endDate, colid });
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
            "Counsellor": d.counsellor,
            "Follow-up Date": new Date(d.followupDate).toLocaleDateString(),
            "Status": d.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Follow-up Due");
        saveAs(new Blob([XLSX.write(workbook, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" }), "Follow_up_Due.xlsx");
    };

    const exportPDF = () => {
        const pdf = new jsPDF();
        pdf.text("Follow-up Due Report", 14, 20);
        autoTable(pdf, {
            startY: 30,
            head: [["Lead Name", "Mobile", "Counsellor", "Follow-up Date", "Status"]],
            body: leads.map(r => [r.leadName, r.mobile, r.counsellor, new Date(r.followupDate).toLocaleDateString(), r.status]),
            headStyles: { fillColor: [124, 58, 237] }
        });
        pdf.save("Follow_up_Due.pdf");
    };

    const columns = [
        { field: "leadName", headerName: "Lead Name", flex: 1.5 },
        { field: "mobile", headerName: "Mobile", flex: 1 },
        { field: "counsellor", headerName: "Counsellor", flex: 1.2 },
        { 
            field: "followupDate", 
            headerName: "Follow-up Date", 
            flex: 1,
            valueFormatter: (params) => new Date(params.value).toLocaleDateString()
        },
        { 
            field: "status", 
            headerName: "Status", 
            flex: 1,
            renderCell: (params) => (
                <Chip label={params.value} size="small" color="primary" variant="outlined" />
            )
        }
    ];

    return (
        <Box sx={{ p: 4, minHeight: '100vh', background: '#f8fafc' }}>
            <Box sx={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', borderRadius: 4, p: 4, mb: 4, color: 'white', boxShadow: '0 10px 30px -5px rgba(124, 58, 237, 0.4)' }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>Follow-up Due Report</Typography>
                <Typography variant="subtitle1">Manage upcoming and overdue follow-up tasks</Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
                <Grid container spacing={3} alignItems="flex-end">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Counselor</InputLabel>
                            <Select value={counselor} label="Counselor" onChange={(e) => setCounselor(e.target.value)}>
                                <MenuItem value="ALL">All Counselors</MenuItem>
                                {counselorsList.map((c, i) => <MenuItem key={i} value={c}>{c}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                        <TextField fullWidth size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={2.5}>
                        <TextField fullWidth size="small" type="date" label="End Date" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', gap: 1.5 }}>
                        <Button variant="contained" fullWidth onClick={generateReport} sx={{ bgcolor: '#7c3aed' }}>Generate</Button>
                        <Button variant="outlined" color="success" onClick={exportExcel}>Excel</Button>
                        <Button variant="outlined" color="error" onClick={exportPDF}>PDF</Button>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ borderRadius: 4, height: 600, overflow: 'hidden' }}>
                <DataGrid rows={leads.map((r, i) => ({ id: i, ...r }))} columns={columns} pagination />
            </Paper>
        </Box>
    );
};

export default CrmdsFollowUpDueReport;
