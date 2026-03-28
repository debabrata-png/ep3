import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Paper, TextField, Button,
    Grid, CircularProgress, Alert, Card, CardContent, Divider,
    Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Search, Receipt, ArrowBack } from '@mui/icons-material';
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

const ViewmChallanPayment = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [fees, setFees] = useState([]);
    const [selectedFees, setSelectedFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [configs, setConfigs] = useState([]);
    const [challanConfig, setChallanConfig] = useState(null);
    const [challanTemplate, setChallanTemplate] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const colid = global1.colid;
    const token = global1.token;

    useEffect(() => {
        fetchChallanConfig();
    }, []);

    const fetchChallanConfig = async () => {
        try {
            const response = await ep1.get(`/api/v2/getchallanconfig?colid=${colid}`);
            if (response.data.status === 'Success' && response.data.data) {
                setConfigs(response.data.data);
                if (response.data.data.length > 0) {
                    setChallanConfig(response.data.data[0]);
                    fetchTemplate(response.data.data[0].configName);
                }
            }
        } catch (err) {
            console.error('Error fetching challan config:', err);
        }
    };

    const fetchTemplate = async (configName) => {
        try {
            const res = await ep1.get(`/api/v2/getChallanTemplate?colid=${colid}&configName=${configName}`);
            if (res.data.status === 'Success') {
                setChallanTemplate(res.data.data);
            } else {
                setChallanTemplate(null);
            }
        } catch (err) {
            setChallanTemplate(null);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm) return;
        setLoading(true);
        setError('');
        setStudentInfo(null);
        setFees([]);
        setSelectedFees([]);

        try {
            const res = await ep1.get('/api/v2/ds1getalluser', {
                params: { colid, search: searchTerm, limit: 1 }
            });
            if (res.data && res.data.data && res.data.data.length > 0) {
                const student = res.data.data[0];
                setStudentInfo(student);

                const feeRes = await ep1.get(`/api/v2/getfeesbycatyrpl?colid=${colid}&token=${token}&regno=${student.regno}&status=Active`);
                if (feeRes.data.status === 'Success') {
                    const activeFees = feeRes.data.data.classes
                        .filter(f => f.balance > 0)
                        .map(f => ({ ...f, payingAmount: f.balance }));
                    setFees(activeFees);
                }
            } else {
                setError('Student not found');
            }
        } catch (err) {
            setError('Error searching student');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFee = (feeId) => {
        setSelectedFees(prev => prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId]);
    };

    const handleAmountChange = (feeId, value) => {
        let numericValue = Number(value);
        if (numericValue < 0) numericValue = 0;
        setFees(fees.map(f => f._id === feeId ? { ...f, payingAmount: numericValue > f.balance ? f.balance : numericValue } : f));
    };

    const totalAmount = fees
        .filter(f => selectedFees.includes(f._id))
        .reduce((sum, f) => sum + Number(f.payingAmount || 0), 0);

    const handleGenerateChallan = async () => {
        if (selectedFees.length === 0) { alert('Please select at least one fee item'); return; }
        if (!challanConfig) { alert('Challan bank details are not configured.'); return; }

        setGenerating(true);
        try {
            const selectedItems = fees.filter(f => selectedFees.includes(f._id));
            const payref = `CHAL-${Date.now()}`;

            for (const item of selectedItems) {
                const payload = {
                    colid: parseInt(colid),
                    user: item.user,
                    year: item.academicyear,
                    programcode: item.programcode || studentInfo.programcode,
                    student: studentInfo.name,
                    regno: studentInfo.regno,
                    feegroup: item.feegroup,
                    feeitem: item.feeitem,
                    semester: item.semester,
                    feecategory: item.feecategory,
                    amount: Number(item.payingAmount),
                    paymode: 'Challan',
                    payref: payref,
                    ledgerId: item._id,
                    balance: item.balance - Number(item.payingAmount),
                    name: studentInfo.name,
                    paystatus: 'Submitted',
                    paiddate: new Date()
                };
                await ep1.post('/api/v2/generatechallanpayment', payload);
            }

            setSuccess(true);

            // Open separate printing window
            const printWindow = window.open('', '_blank');
            const printHTML = generatePrintHTML(selectedItems, payref);
            printWindow.document.write(printHTML);
            printWindow.document.close();

            // Wait for images (logo) to load before printing
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 800);

        } catch (err) {
            alert('Error generating challan: ' + err.message);
        } finally {
            setGenerating(false);
        }
    };

    const generatePrintHTML = (selectedItems, payref) => {
        const copiesCount = challanTemplate?.copies || 1; // Default to 1 instead of 3/4
        let copiesHTML = '';

        for (let i = 0; i < copiesCount; i++) {
            const copyType = i === 0 ? 'BANK COPY' : i === 1 ? 'OFFICE COPY' : i === 2 ? 'MES COPY' : 'STUDENT COPY';
            const htmlContent = challanTemplate ? renderTemplate(challanTemplate.templateHtml, {
                NAME: studentInfo?.name,
                MOBILE: studentInfo?.phone || studentInfo?.mobile || 'N/A',
                REGNO: studentInfo?.regno,
                PROGRAM: studentInfo?.programcode,
                YEAR: fees[0]?.academicyear || studentInfo?.admissionyear,
                FEE_ITEM: selectedItems.map(item => item.feeitem.toUpperCase()).join('<br/>'),
                FEE_GROUP: selectedItems[0]?.feegroup || 'N/A',
                AMOUNT: totalAmount.toLocaleString(),
                AMOUNT_WORDS: numberToWords(totalAmount),
                BANK: challanConfig?.bankName,
                ACCOUNT_NO: challanConfig?.accountNo,
                BRANCH: challanConfig?.branch,
                INSTITUTION: challanConfig?.institutionName,
                ADDRESS: challanConfig?.address,
                PAYREF: payref,
                LOGO: challanConfig?.logo ? `<img src="${challanConfig.logo.startsWith('http') ? challanConfig.logo : global1.api + '/' + challanConfig.logo}" style="max-height: 60px; display: block; margin: 0 auto 10px;" />` : '',
                DATE: dayjs().format('DD.MM.YYYY'),
                COPY_TYPE: copyType
            }) : getDefaultTemplate(i, selectedItems, payref);

            copiesHTML += `<div class="print-copy">${htmlContent}</div>`;
        }

        return `
            <html>
            <head>
                <title>Print Challan - ${studentInfo?.name}</title>
                <style>
                    body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
                    @page { 
                        size: A4 ${challanTemplate?.orientation || 'portrait'}; 
                        margin: 10mm; 
                    }
                    .print-container { 
                        width: 100%; 
                        display: flex; 
                        flex-direction: column; 
                        gap: 20px; 
                    }
                    .print-copy { 
                        width: 100%;
                        max-width: 500px; /* Matching the narrow format in Image 2 */
                        margin: 0 auto;
                        border: 1px solid #000; 
                        padding: 15px; 
                        min-height: 800px;
                        font-family: 'Segoe UI', Arial, sans-serif;
                        position: relative;
                        box-sizing: border-box;
                        background: #fff;
                    }
                    
                    /* Grid and layout */
                    .flex-between { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .header-top { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px; }
                    .institution-name { font-size: 18px; font-weight: 800; text-transform: uppercase; margin: 5px 0; }
                    .info-row { font-size: 13px; margin-bottom: 6px; }
                    .info-label { font-weight: bold; min-width: 80px; display: inline-block; }
                    
                    /* Table and formatting classes */
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
                    th, td { border: 1px solid #000; padding: 10px; text-align: left; font-size: 13px; }
                    .text-right { text-align: right; }
                    .text-center { text-align: center; }
                    .font-bold { font-weight: bold; }
                    .total-row td { background: #f9f9f9; font-weight: bold; font-size: 15px; border-top: 2px solid #000; }
                </style>
            </head>
            <body>
                <div class="print-container">${copiesHTML}</div>
            </body>
            </html>
        `;
    };

    const getDefaultTemplate = (index, selectedItems, payref) => {
        const copyType = index === 0 ? 'BANK COPY' : index === 1 ? 'OFFICE COPY' : index === 2 ? 'INSTITUTION COPY' : 'STUDENT COPY';
        return `
        <div style="font-family: Arial, sans-serif; font-size: 13px; padding: 10px;">

            <!-- Header -->
            <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 6px;">
                <span>${challanConfig?.institutionName} ®</span>
                <span>${copyType}</span>
            </div>

            <div style="text-align: center; margin-bottom: 10px;">
                ${challanConfig?.logo ? `<img src="${challanConfig.logo.startsWith('http') ? challanConfig.logo : global1.api + '/' + challanConfig.logo}" style="max-height: 50px; display: block; margin: 0 auto 6px;" />` : ''}
                <div style="font-size: 17px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">${challanConfig?.institutionName}</div>
                <div style="font-size: 12px; font-weight: bold;">${challanConfig?.address}</div>
                <div style="font-size: 13px; margin-top: 4px;"><b>Bank Name : ${challanConfig?.bankName}</b></div>
                <div style="font-size: 12px;">${challanConfig?.branch}</div>
                <div style="font-size: 20px; font-weight: 900; margin-top: 8px; letter-spacing: 1px;">${fees[0]?.academicyear || studentInfo?.admissionyear}</div>
            </div>

            <hr style="border: none; border-top: 1px solid #000; margin: 8px 0;" />

            <!-- A/C and Student ID row -->
            <table style="width: 100%; border: none; margin: 0 0 4px 0;">
                <tr>
                    <td style="border: none; padding: 4px 0; font-size: 13px; width: 50%;"><b>A/C : ${challanConfig?.accountNo}</b></td>
                    <td style="border: none; padding: 4px 0; font-size: 13px; text-align: right;"><b>Student ID : ${studentInfo?.regno}</b></td>
                </tr>
            </table>

            <!-- Receipt No and Date row -->
            <table style="width: 100%; border: none; margin: 0 0 12px 0;">
                <tr>
                    <td style="border: none; padding: 4px 0; font-size: 13px; width: 50%;"><b>Receipt No : ${payref}</b></td>
                    <td style="border: none; padding: 4px 0; font-size: 13px; text-align: right;"><b>DATE : ${dayjs().format('DD.MM.YYYY')}</b></td>
                </tr>
            </table>

            <!-- Name -->
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">
                NAME : ${studentInfo?.name.toUpperCase()}
            </div>

            <!-- Class -->
            <div style="font-size: 22px; font-weight: 900; margin-bottom: 14px; text-transform: uppercase;">
                CLASS &nbsp;&nbsp; ${studentInfo?.programcode.toUpperCase()}
            </div>

            <!-- Fee Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px 10px; text-align: left; font-size: 13px;">Details of Fees</th>
                        <th style="border: 1px solid #000; padding: 8px 10px; text-align: center; font-size: 13px; width: 120px;">Amount<br/>Rs.</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #000; padding: 14px 10px; vertical-align: top; font-size: 14px; font-weight: bold; height: 120px; letter-spacing: 1px;">
                            ${selectedItems.map(item => `<div style="margin-bottom: 6px;">${item.feeitem.toUpperCase()}</div>`).join('')}
                        </td>
                        <td style="border: 1px solid #000; padding: 14px 10px; vertical-align: top; text-align: right; font-size: 14px; font-weight: 500;">
                            ${selectedItems.map(item => `<div style="margin-bottom: 6px;">${Number(item.payingAmount).toLocaleString()}</div>`).join('')}
                        </td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #000; padding: 8px 10px; text-align: center; font-size: 13px; font-weight: bold; background: #f9f9f9;">TOTAL</td>
                        <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; font-size: 14px; font-weight: bold; background: #f9f9f9;">${totalAmount.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Amount in Words -->
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase;">
                RUPEES : &nbsp; ${numberToWords(totalAmount)}
            </div>

            <!-- Date -->
            <div style="font-size: 13px; margin-bottom: 50px;">
                <b>Date :</b> &nbsp; ${dayjs().format('DD.MM.YYYY')}
            </div>

            <!-- Signatures -->
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold;">
                <div>Depositors Signature</div>
                <div>RECEIVERS SIGNATURE</div>
            </div>

        </div>
    `;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/payment-mode-landing')} sx={{ mb: 2 }}>Back</Button>

                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Typography variant="h5" gutterBottom fontWeight="bold">Search Student for Challan</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                            <TextField fullWidth placeholder="Registration No / User ID" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Button fullWidth variant="contained" size="large" startIcon={<Search />} onClick={handleSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</Button>
                        </Grid>
                    </Grid>
                </Paper>

                {studentInfo && (
                    <Box>
                        <Card sx={{ mb: 4, borderRadius: 3, bgcolor: '#f0f7ff', borderLeft: '6px solid #1a73e8' }}>
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}><Typography variant="overline" color="textSecondary">Name</Typography><Typography variant="h6" fontWeight="bold">{studentInfo.name}</Typography></Grid>
                                    <Grid item xs={12} md={4}><Typography variant="overline" color="textSecondary">Registration No</Typography><Typography variant="h6" fontWeight="bold">{studentInfo.regno}</Typography></Grid>
                                    <Grid item xs={12} md={4}><Typography variant="overline" color="textSecondary">Program</Typography><Typography variant="h6" fontWeight="bold">{studentInfo.programcode || 'N/A'}</Typography></Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <TableContainer component={Paper} sx={{ borderRadius: 3, mb: 4 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f5f5' }}><TableRow><TableCell padding="checkbox">Select</TableCell><TableCell>Fee Item</TableCell><TableCell>Semester</TableCell><TableCell align="right">Balance</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {fees.map((fee) => (
                                        <TableRow key={fee._id} hover onClick={() => handleToggleFee(fee._id)} sx={{ cursor: 'pointer' }}>
                                            <TableCell padding="checkbox"><Checkbox checked={selectedFees.includes(fee._id)} /></TableCell>
                                            <TableCell>{fee.feeitem}</TableCell><TableCell>{fee.semester}</TableCell>
                                            <TableCell align="right">{selectedFees.includes(fee._id) ? <TextField size="small" type="number" value={fee.payingAmount} onChange={(e) => handleAmountChange(fee._id, e.target.value)} onClick={(e) => e.stopPropagation()} sx={{ width: 100 }} /> : `₹${fee.balance}`}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {selectedFees.length > 0 && (
                            <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'right', bgcolor: '#fffde7' }}>
                                <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mb={2}>
                                    <FormControl sx={{ minWidth: 250, textAlign: 'left' }}>
                                        <InputLabel>Format</InputLabel>
                                        <Select size="small" value={challanConfig ? challanConfig.configName : ''} onChange={(e) => { const s = configs.find(c => c.configName === e.target.value); if (s) { setChallanConfig(s); fetchTemplate(s.configName); } }}>
                                            {configs.map((c, i) => <MenuItem key={i} value={c.configName}>{c.configName}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Typography variant="h6" gutterBottom>Total Payable: <strong>₹{totalAmount}</strong></Typography>
                                <Button variant="contained" color="secondary" size="large" onClick={handleGenerateChallan} disabled={generating} sx={{ px: 4, borderRadius: 2 }}>{generating ? 'Processing...' : 'Generate & Print'}</Button>
                            </Paper>
                        )}
                    </Box>
                )}
            </Box>
        </Container>
    );
};

const renderTemplate = (html, data) => {
    let output = html;
    Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        output = output.replace(regex, data[key] || '');
    });
    // Cleanup remaining tags
    output = output.replace(/{{[A-Z_]+}}/g, '');
    return output;
};

export default ViewmChallanPayment;
