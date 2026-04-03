import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, TextField, Button,
    Grid, CircularProgress, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Tooltip
} from '@mui/material';
import { Search, Print, ArrowBack, Refresh } from '@mui/icons-material';
import ep1 from '../api/ep1';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';

// --- Utility: Amount in Words ---
const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
        if (n < 20) return a[n];
        const s = n.toString();
        if (s.length === 2) return b[s[0]] + (s[1] !== '0' ? ' ' + a[s[1]] : '');
        if (s.length === 3) return a[s[0]] + ' Hundred' + (s.substring(1) !== '00' ? ' and ' + inWords(parseInt(s.substring(1))) : '');
        if (s.length < 6) return inWords(parseInt(s.substring(0, s.length - 3))) + ' Thousand' + (s.substring(s.length - 3) !== '000' ? ' ' + inWords(parseInt(s.substring(s.length - 3))) : '');
        if (s.length < 8) return inWords(parseInt(s.substring(0, s.length - 5))) + ' Lakh' + (s.substring(s.length - 5) !== '00000' ? ' ' + inWords(parseInt(s.substring(s.length - 5))) : '');
        return '';
    };
    return num ? inWords(num) + ' Only' : '';
};

const ViewmChallanHistory = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [challanConfigs, setChallanConfigs] = useState([]);
    const [challanTemplates, setChallanTemplates] = useState({});

    const colid = global1.colid;

    useEffect(() => {
        fetchHistory();
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await ep1.get(`/api/v2/getchallanconfig?colid=${colid}`);
            if (res.data.status === 'Success') {
                setChallanConfigs(res.data.data);
                // Fetch templates for each config for reprinting
                res.data.data.forEach(config => {
                    fetchTemplate(config.configName);
                });
            }
        } catch (err) {
            console.error('Error fetching configs:', err);
        }
    };

    const fetchTemplate = async (configName) => {
        try {
            const res = await ep1.get(`/api/v2/getChallanTemplate?colid=${colid}&configName=${configName}`);
            if (res.data.status === 'Success') {
                setChallanTemplates(prev => ({ ...prev, [configName]: res.data.data }));
            }
        } catch (err) {
            console.error(`Error fetching template for ${configName}:`, err);
        }
    };

    const fetchHistory = async (search = '') => {
        setLoading(true);
        try {
            const res = await ep1.get(`/api/v2/getchallanhistoryds?colid=${colid}&search=${search}`);
            if (res.data.status === 'Success') {
                setHistory(res.data.data);
            }
        } catch (err) {
            setError('Error fetching history');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchHistory(searchTerm);
    };

    const handleReprint = (record) => {
        // Reuse printing logic
        const config = challanConfigs[0] || {}; // Fallback to first config
        const template = challanTemplates[config.configName] || null;

        const printWindow = window.open('', '_blank');
        const printHTML = generatePrintHTML(record, config, template);
        printWindow.document.write(printHTML);
        printWindow.document.close();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 800);
    };

    const generatePrintHTML = (record, config, template) => {
        const copiesCount = template?.copies || 1;
        let copiesHTML = '';

        for (let i = 0; i < copiesCount; i++) {
            const copyType = i === 0 ? 'BANK COPY' : i === 1 ? 'OFFICE COPY' : i === 2 ? 'MES COPY' : 'STUDENT COPY';
            
            const data = {
                NAME: record.name.toUpperCase(),
                MOBILE: record.regno || 'N/A',
                REGNO: record.regno,
                PROGRAM: record.programcode,
                YEAR: record.academicyear,
                FEE_ITEM: record.feeitem.toUpperCase(),
                FEE_GROUP: record.feegroup || 'N/A',
                AMOUNT: record.balance.toLocaleString(), // Using balance as payable amount at time of issuance
                AMOUNT_WORDS: numberToWords(record.balance),
                BANK: config?.bankName,
                ACCOUNT_NO: config?.accountNo,
                BRANCH: config?.branch,
                INSTITUTION: config?.institutionName,
                ADDRESS: config?.address,
                PAYREF: record.challanNo,
                LOGO: config?.logo ? `<img src="${config.logo.startsWith('http') ? config.logo : global1.api + '/' + config.logo}" style="max-height: 60px; display: block; margin: 0 auto 10px;" />` : '',
                DATE: dayjs(record.challanDate).format('DD.MM.YYYY'),
                COPY_TYPE: copyType
            };

            const htmlContent = template ? renderTemplate(template.templateHtml, data) : getDefaultTemplate(i, record, config, data);
            copiesHTML += `<div class="print-copy">${htmlContent}</div>`;
        }

        return `
            <html>
            <head>
                <title>Reprint Challan - ${record.name}</title>
                <style>
                    body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
                    @page { size: A4 ${template?.orientation || 'portrait'}; margin: 10mm; }
                    .print-container { width: 100%; display: flex; flex-direction: column; gap: 20px; }
                    .print-copy { 
                        width: 100%; max-width: 500px; margin: 0 auto;
                        border: 1px solid #000; padding: 15px; 
                        min-height: 800px; font-family: sans-serif;
                        box-sizing: border-box; background: #fff;
                    }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                    th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 13px; }
                </style>
            </head>
            <body>
                <div class="print-container">${copiesHTML}</div>
            </body>
            </html>
        `;
    };

    const renderTemplate = (html, data) => {
        let output = html;
        Object.keys(data).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            output = output.replace(regex, data[key] || '');
        });
        output = output.replace(/{{[A-Z_]+}}/g, '');
        return output;
    };

    const getDefaultTemplate = (index, record, config, data) => {
        return `
            <div style="text-align: center;">
                <h2>${config.institutionName}</h2>
                <p>${config.address}</p>
                <hr/>
                <h3>${data.COPY_TYPE}</h3>
                <table style="width: 100%; border: none;">
                    <tr><td><b>Challan No:</b> ${record.challanNo}</td><td style="text-align: right;"><b>Date:</b> ${data.DATE}</td></tr>
                    <tr><td><b>Name:</b> ${record.name}</td><td style="text-align: right;"><b>ID:</b> ${record.regno}</td></tr>
                </table>
                <br/>
                <table>
                    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
                    <tbody>
                        <tr><td>${record.feeitem} (${record.semester})</td><td>${record.balance.toLocaleString()}</td></tr>
                        <tr style="font-weight: bold;"><td>TOTAL</td><td>${record.balance.toLocaleString()}</td></tr>
                    </tbody>
                </table>
                <p style="text-align: left;"><b>Amount in Words:</b> ${data.AMOUNT_WORDS}</p>
                <br/><br/>
                <div style="display: flex; justify-content: space-between;">
                    <span>Depositor</span><span>Auth. Signatory</span>
                </div>
            </div>
        `;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/challan-payment')}>Back to Generation</Button>
                <Typography variant="h5" fontWeight="bold">Issued Challan History</Typography>
                <Button startIcon={<Refresh />} onClick={() => fetchHistory()}>Refresh</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <TextField 
                            fullWidth 
                            placeholder="Search by Name, Reg No, or Challan No" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button fullWidth variant="contained" startIcon={<Search />} onClick={handleSearch} disabled={loading}>Search</Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell>Challan No</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Student Name</TableCell>
                            <TableCell>Reg No</TableCell>
                            <TableCell>Fee Item</TableCell>
                            <TableCell align="right">Actual</TableCell>
                            <TableCell align="right">Paid</TableCell>
                            <TableCell align="right">Balance</TableCell>
                            <TableCell align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={9} align="center"><CircularProgress size={24} sx={{ my: 2 }} /></TableCell></TableRow>
                        ) : history.length === 0 ? (
                            <TableRow><TableCell colSpan={9} align="center">No history found</TableCell></TableRow>
                        ) : history.map((row) => (
                            <TableRow key={row._id} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{row.challanNo}</TableCell>
                                <TableCell>{dayjs(row.challanDate).format('DD/MM/YYYY')}</TableCell>
                                <TableCell sx={{ textTransform: 'uppercase' }}>{row.name}</TableCell>
                                <TableCell>{row.regno}</TableCell>
                                <TableCell>{row.feeitem}</TableCell>
                                <TableCell align="right">₹{row.actualAmount?.toLocaleString()}</TableCell>
                                <TableCell align="right">₹{row.paidAmount?.toLocaleString()}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹{row.balance?.toLocaleString()}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Reprint">
                                        <IconButton color="primary" onClick={() => handleReprint(row)}><Print /></IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default ViewmChallanHistory;
