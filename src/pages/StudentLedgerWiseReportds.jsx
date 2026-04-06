import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Alert, Grid,
  Card, CardContent, Divider, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, MenuItem, FormControl, InputLabel, Select,
} from '@mui/material';
import {
  Assessment, FileDownload, Search, AccountBalance, ArrowBack, CurrencyRupee,
  ReceiptLong, People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

// ── Helpers ───────────────────────────────────────
const fmt = (n = 0) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const thStyle = {
  fontWeight: 'bold', bgcolor: '#1565c0', color: '#fff', whiteSpace: 'nowrap',
};

const SummaryCard = ({ label, value, color = '#1976d2', icon }) => (
  <Card sx={{ boxShadow: 2, height: '100%', borderRadius: 2 }}>
    <CardContent sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="caption" sx={{ color: '#666', mb: 0.5, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {icon && React.cloneElement(icon, { sx: { color, fontSize: 18 } })}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color }}>₹ {fmt(value)}</Typography>
      </Box>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────────────────────────────────────────
const StudentLedgerWiseReportds = () => {
  const navigate = useNavigate();

  // ── Dropdown options ──────────────────────────────────────────────────────
  const [feeitemOptions, setFeeitemOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [academicyrOptions, setAcademicyrOptions] = useState([]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [academicyear, setAcademicyear] = useState('');
  const [programcode, setProgramcode] = useState('');
  const [feeitem, setFeeitem] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ── Results ───────────────────────────────────────────────────────────────
  const [reportRows, setReportRows] = useState([]);
  const [grandTotals, setGrandTotals] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // ── Load dropdown options on component mount ──────────────────────────────
  useEffect(() => {
    if (global1.colid) {
      loadFilterOptions();
    }
  }, []);

  const loadFilterOptions = async () => {
    if (!global1.colid) return;
    try {
      const fetchDistinct = async (field) => {
        const res = await ep1.get(`/api/v2/getdistinctledgervaluesds?colid=${global1.colid}&field=${field}`);
        return res.data.success ? (res.data.data || []) : [];
      };

      const [items, progs, years] = await Promise.all([
        fetchDistinct('feeitem'),
        fetchDistinct('programcode'),
        fetchDistinct('academicyear'),
      ]);

      setFeeitemOptions(items);
      setProgramOptions(progs);
      setAcademicyrOptions(years);
      setFiltersLoaded(true);
    } catch (err) {
      console.error('Error loading filters:', err);
      setError('Failed to load filter options');
    }
  };

  // ── Fetch report ──────────────────────────────────────────────────────────
  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setReportGenerated(false);

    try {
      let url = `/api/v2/studentledgerwisereportds?colid=${global1.colid}`;
      if (academicyear) url += `&academicyear=${encodeURIComponent(academicyear)}`;
      if (programcode) url += `&programcode=${encodeURIComponent(programcode)}`;
      if (feeitem) url += `&feeitem=${encodeURIComponent(feeitem)}`;
      if (fromDate) url += `&fromdate=${fromDate}`;
      if (toDate) url += `&todate=${toDate}`;

      const response = await ep1.get(url);
      if (response.data.success) {
        setReportRows(response.data.data || []);
        setGrandTotals(response.data.grandTotals);
        setReportGenerated(true);
        if (response.data.data.length === 0) {
          setError('No records found for the selected filters.');
        }
      } else {
        setError('Failed to generate report');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExportToExcel = () => {
    if (!reportRows.length) return;

    const header = [
      'Student Name', 'Reg No', 'Program', 'Year', 'Fee Item',
      'Actual Amount', 'Paid Amount', 'Cash', 'UPI', 'Cheque', 'Card', 'PG', 'NEFT',
      'Balance', 'Status'
    ];

    const rows = reportRows.map(r => [
      r.student, r.regno, r.programcode, r.academicyear, r.feeitem,
      r.amount, r.paid, r.cash, r.upi, r.cheque, r.card, r.pg, r.neft,
      r.balance, r.status
    ]);

    const summaryRows = [
      [],
      ['GRAND TOTAL', '', '', '', '', 
       grandTotals.totalAmount, grandTotals.totalPaid, 
       grandTotals.totalCash, grandTotals.totalUPI, grandTotals.totalCheque, 
       grandTotals.totalCard, grandTotals.totalPG, grandTotals.totalNEFT,
       grandTotals.totalBalance, '']
    ];

    const meta = [
      ['STUDENT LEDGER WISE REPORT'],
      ['Institution', global1.name],
      ['Generated On', new Date().toLocaleString('en-IN')],
      ['Filters:', `Program: ${programcode || 'All'}, Year: ${academicyear || 'All'}, Item: ${feeitem || 'All'}, From: ${fromDate || 'N/A'}, To: ${toDate || 'N/A'}`],
      [],
      header,
      ...rows,
      ...summaryRows
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(meta);
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger Report');
    XLSX.writeFile(wb, `StudentLedgerWiseReport_${new Date().getTime()}.xlsx`);
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#f4f7fa', minHeight: '100vh' }}>
      <Box sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashdashfacnew')}>Back</Button>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReceiptLong sx={{ fontSize: 36, color: '#1976d2' }} />
          Student Ledger — Wise Report
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
          {global1.name} | Advanced Filters with Date Range
        </Typography>
      </Box>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Program Code</InputLabel>
              <Select value={programcode} label="Program Code" onChange={e => setProgramcode(e.target.value)}>
                <MenuItem value=""><em>All Programs</em></MenuItem>
                {programOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Academic Year</InputLabel>
              <Select value={academicyear} label="Academic Year" onChange={e => setAcademicyear(e.target.value)}>
                <MenuItem value=""><em>All Years</em></MenuItem>
                {academicyrOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Fee Item</InputLabel>
              <Select value={feeitem} label="Fee Item" onChange={e => setFeeitem(e.target.value)}>
                <MenuItem value=""><em>All Fee Items</em></MenuItem>
                {feeitemOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>From Date</InputLabel>
              <Box component="input" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1, width: '100%', mt: 0.5 }} />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>To Date</InputLabel>
              <Box component="input" type="date" value={toDate} onChange={e => setToDate(e.target.value)} sx={{ p: 1, border: '1px solid #ccc', borderRadius: 1, width: '100%', mt: 0.5 }} />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" fullWidth startIcon={<Search />} onClick={handleGenerateReport} disabled={loading} sx={{ py: 1, borderRadius: 2 }}>
                {loading ? 'Processing...' : 'Generate'}
              </Button>
              <Button variant="outlined" onClick={() => { 
                setProgramcode(''); setAcademicyear(''); setFeeitem(''); 
                setFromDate(''); setToDate('');
              }} sx={{ borderRadius: 2 }}>Reset</Button>
            </Box>
          </Grid>
        </Grid>

        {loading && <LinearProgress sx={{ mt: 3, borderRadius: 1 }} />}
        {error && <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
      </Paper>

      {/* Summary Cards */}
      {reportGenerated && grandTotals && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4} md={2.4}>
            <SummaryCard label="Total Amount" value={grandTotals.totalAmount} color="#1565c0" icon={<Assessment />} />
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <SummaryCard label="Total Paid" value={grandTotals.totalPaid} color="#2e7d32" icon={<AccountBalance />} />
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <SummaryCard label="Total Balance" value={grandTotals.totalBalance} color={grandTotals.totalBalance > 0 ? '#d32f2f' : '#2e7d32'} icon={<CurrencyRupee />} />
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <SummaryCard label="Total Concession" value={grandTotals.totalConcession} color="#ed6c02" icon={<Assessment />} />
          </Grid>
          <Grid item xs={12} sm={4} md={2.4}>
            <SummaryCard label="Student Count" value={reportRows.length} color="#9c27b0" icon={<People />} />
          </Grid>

          {/* Paymode Breakdown Row */}
          <Grid item xs={6} sm={2} md={2}>
            <SummaryCard label="Cash" value={grandTotals.totalCash} color="#4caf50" />
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <SummaryCard label="UPI / PG" value={grandTotals.totalUPI + grandTotals.totalPG} color="#0288d1" />
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <SummaryCard label="NEFT" value={grandTotals.totalNEFT} color="#7b1fa2" />
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <SummaryCard label="Cheque" value={grandTotals.totalCheque} color="#f57c00" />
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <SummaryCard label="Card" value={grandTotals.totalCard} color="#455a64" />
          </Grid>
        </Grid>
      )}

      {/* Report Table */}
      {reportGenerated && reportRows.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Generated Report Details</Typography>
            <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportToExcel} color="success" sx={{ borderRadius: 2 }}>
              Export Excel
            </Button>
          </Box>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={thStyle}>Student Name</TableCell>
                  <TableCell sx={thStyle}>Reg No</TableCell>
                  <TableCell sx={thStyle}>Fee Item</TableCell>
                  <TableCell align="right" sx={thStyle}>Amount</TableCell>
                  <TableCell align="right" sx={thStyle}>Paid</TableCell>
                  <TableCell align="right" sx={thStyle}>Balance</TableCell>
                  <TableCell sx={thStyle}>Status</TableCell>
                  <TableCell align="right" sx={{...thStyle, bgcolor: '#455a64'}}>Cash</TableCell>
                  <TableCell align="right" sx={{...thStyle, bgcolor: '#455a64'}}>UPI/PG</TableCell>
                  <TableCell align="right" sx={{...thStyle, bgcolor: '#455a64'}}>NEFT</TableCell>
                  <TableCell align="right" sx={{...thStyle, bgcolor: '#455a64'}}>Cheque</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportRows.map((r, i) => (
                  <TableRow key={r._id || i} hover sx={{ '&:nth-of-type(even)': { bgcolor: '#fafafa' } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#1565c0' }}>{r.student}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{r.regno}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{r.feeitem}</TableCell>
                    <TableCell align="right">₹ {fmt(r.amount)}</TableCell>
                    <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>₹ {fmt(r.paid)}</TableCell>
                    <TableCell align="right" sx={{ color: r.balance > 0 ? '#d32f2f' : '#2e7d32', fontWeight: 700 }}>₹ {fmt(r.balance)}</TableCell>
                    <TableCell>
                      <Chip label={r.status} size="small" color={r.status === 'Full Payment' ? 'success' : 'error'} variant="soft" sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#666' }}>{r.cash > 0 ? fmt(r.cash) : '—'}</TableCell>
                    <TableCell align="right" sx={{ color: '#666' }}>{(r.upi + r.pg) > 0 ? fmt(r.upi + r.pg) : '—'}</TableCell>
                    <TableCell align="right" sx={{ color: '#666' }}>{r.neft > 0 ? fmt(r.neft) : '—'}</TableCell>
                    <TableCell align="right" sx={{ color: '#666' }}>{r.cheque > 0 ? fmt(r.cheque) : '—'}</TableCell>
                  </TableRow>
                ))}
                {/* Grand Total Row */}
                {grandTotals && (
                  <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>GRAND TOTAL</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>₹ {fmt(grandTotals.totalAmount)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>₹ {fmt(grandTotals.totalPaid)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: grandTotals.totalBalance > 0 ? '#d32f2f' : '#2e7d32' }}>₹ {fmt(grandTotals.totalBalance)}</TableCell>
                    <TableCell colSpan={5} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {reportGenerated && reportRows.length === 0 && !loading && (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" color="textSecondary">No data found matching your selection.</Typography>
          <Typography variant="body2" color="textSecondary">Try adjusting your filters or checking a different duration.</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default StudentLedgerWiseReportds;
