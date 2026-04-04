import React, { useState } from 'react';
import {
  Box, Button, Typography, Paper, Alert, Grid,
  Card, CardContent, Divider, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, MenuItem, FormControl, InputLabel, Select, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  Assessment, FileDownload, Search, AccountBalance, ArrowBack, CurrencyRupee,
  TableChart, Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import * as XLSX from 'xlsx';

// ── Helpers ───────────────────────────────────────
const fmt = (n = 0) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PAYMODES = ['Cash', 'UPI', 'NEFT', 'Cheque', 'PG'];

const thStyle = {
  fontWeight: 'bold', bgcolor: '#1565c0', color: '#fff', whiteSpace: 'nowrap',
};

const SummaryCard = ({ label, value, color = '#1976d2', icon }) => (
  <Card sx={{ boxShadow: 2, height: '100%' }}>
    <CardContent sx={{ textAlign: 'center', py: 2 }}>
      <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
        {icon && React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
        <Typography variant="h6" sx={{ fontWeight: 'bold', color }}>₹ {fmt(value)}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const today        = new Date().toISOString().split('T')[0];
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                       .toISOString().split('T')[0];

// ─────────────────────────────────────────────────────────────────────────────
const StudentLedgerDateRangeReportds = () => {
  const navigate = useNavigate();

  // ── Dropdown options ──────────────────────────────────────────────────────
  const [feeitemOptions,    setFeeitemOptions]    = useState([]);
  const [programOptions,    setProgramOptions]    = useState([]);
  const [academicyrOptions, setAcademicyrOptions] = useState([]);
  const [semesterOptions,   setSemesterOptions]   = useState([]);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [fromdate,     setFromdate]     = useState(firstOfMonth);
  const [todate,       setTodate]       = useState(today);
  const [regno,        setRegno]        = useState('');
  const [semester,     setSemester]     = useState('');
  const [academicyear, setAcademicyear] = useState('');
  const [programcode,  setProgramcode]  = useState('');
  const [feeitem,      setFeeitem]      = useState('');
  const [groupby,      setGroupby]      = useState('feeitem'); // 'feeitem' | 'student'

  // ── Results ───────────────────────────────────────────────────────────────
  const [reportRows,      setReportRows]      = useState([]);
  const [grandTotals,     setGrandTotals]     = useState(null);
  const [filters,         setFilters]         = useState(null);
  const [studentInfo,     setStudentInfo]     = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [activeGroupby,   setActiveGroupby]   = useState('feeitem');

  const [filtersLoaded, setFiltersLoaded] = useState(false);

  // ── Load dropdown options (called on demand, not on mount) ────────────────
  const loadFilterOptions = async () => {
    if (!global1.colid) return;        // colid not set yet
    if (filtersLoaded) return;         // already fetched
    const fetchDistinct = async (field, setter) => {
      try {
        const res = await ep1.get(
          `/api/v2/getdistinctledgervaluesds?colid=${global1.colid}&field=${field}`
        );
        if (res.data.success) setter(res.data.data || []);
      } catch (_) {}
    };
    await Promise.all([
      fetchDistinct('feeitem',      setFeeitemOptions),
      fetchDistinct('programcode',  setProgramOptions),
      fetchDistinct('academicyear', setAcademicyrOptions),
      fetchDistinct('semester',     setSemesterOptions),
    ]);
    setFiltersLoaded(true);
  };

  // ── Fetch report ──────────────────────────────────────────────────────────
  const handleGenerateReport = async () => {
    if (!fromdate || !todate) { setError('Please select both From Date and To Date'); return; }
    setLoading(true); setError(''); setReportGenerated(false);
    await loadFilterOptions(); // ensure dropdowns are populated

    try {
      let url = `/api/v2/studentledgerdaterangereportds?colid=${global1.colid}&fromdate=${fromdate}&todate=${todate}&groupby=${groupby}`;
      if (regno)        url += `&regno=${regno}`;
      if (semester)     url += `&semester=${semester}`;
      if (academicyear) url += `&academicyear=${academicyear}`;
      if (programcode)  url += `&programcode=${programcode}`;
      if (feeitem)      url += `&feeitem=${feeitem}`;

      const response = await ep1.get(url);
      if (response.data.success) {
        const data = response.data.data || [];
        setReportRows(data);
        setGrandTotals(response.data.grandTotals);
        setFilters(response.data.filters);
        setActiveGroupby(response.data.groupby || 'feeitem');

        // single-student banner
        if (regno && data.length > 0) {
          if (groupby === 'student') {
            setStudentInfo({ student: data[0].student || '', regno: data[0].regno || regno });
          } else if (data[0].students?.length > 0) {
            setStudentInfo({ student: data[0].students[0].student || '', regno });
          }
        } else {
          setStudentInfo(null);
        }
        setReportGenerated(true);
      } else { setError('Failed to generate report'); }
    } catch (err) {
      setError(err.response?.data?.message || 'Error generating report. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExportToExcel = () => {
    if (!reportRows.length) { setError('No data to export'); return; }

    let header, rows;

    if (activeGroupby === 'student') {
      header = ['Student Name', 'Reg No', 'Fee Item', 'Cash','UPI','NEFT','Cheque','PG',
                'Total (Paymode)', 'Total Due', 'Total Paid', 'Concession', 'Balance', 'Txns'];
      rows = reportRows.map(r => [
        r.student, r.regno, r.feeitem,
        r.Cash, r.UPI, r.NEFT, r.Cheque, r.PG,
        r.totalPaidByPaymode, r.totalAmount, r.totalPaid, r.totalConcession, r.totalBalance, r.txnCount,
      ]);
    } else {
      header = ['Fee Item', 'Student Name', 'Reg No', 'Cash','UPI','NEFT','Cheque','PG',
                'Total (Paymode)', 'Total Due', 'Total Paid', 'Concession', 'Balance', 'Txns'];
      rows = reportRows.map(r => [
        r.feeitem,
        r.students?.map(s => s.student).filter(Boolean).join(', ') || '',
        r.students?.map(s => s.regno).filter(Boolean).join(', ')   || '',
        r.Cash, r.UPI, r.NEFT, r.Cheque, r.PG,
        r.totalPaidByPaymode, r.totalAmount, r.totalPaid, r.totalConcession, r.totalBalance, r.txnCount,
      ]);
    }

    const meta = [
      ['STUDENT LEDGER DATE-RANGE REPORT'],
      ['Institution',    global1.name],
      ['Generated by',   global1.user],
      ['From Date',      filters?.fromdate],
      ['To Date',        filters?.todate],
      ['View',           activeGroupby === 'student' ? 'Student Wise' : 'Fee Item Wise'],
      ...(studentInfo ? [['Student', studentInfo.student], ['Reg No', studentInfo.regno]] : []),
      ...(filters?.semester     ? [['Semester',      filters.semester]]     : []),
      ...(filters?.academicyear ? [['Academic Year', filters.academicyear]] : []),
      ...(filters?.programcode  ? [['Program Code',  filters.programcode]]  : []),
      ...(filters?.feeitem      ? [['Fee Item',      filters.feeitem]]      : []),
      [''],
      header, ...rows,
      [''],
      activeGroupby === 'student'
        ? ['GRAND TOTAL','','', grandTotals?.Cash, grandTotals?.UPI, grandTotals?.NEFT, grandTotals?.Cheque, grandTotals?.PG,
           grandTotals?.totalPaidByPaymode, grandTotals?.totalAmount, grandTotals?.totalPaid,
           grandTotals?.totalConcession, grandTotals?.totalBalance, grandTotals?.txnCount]
        : ['GRAND TOTAL','','','', grandTotals?.Cash, grandTotals?.UPI, grandTotals?.NEFT, grandTotals?.Cheque, grandTotals?.PG,
           grandTotals?.totalPaidByPaymode, grandTotals?.totalAmount, grandTotals?.totalPaid,
           grandTotals?.totalConcession, grandTotals?.totalBalance, grandTotals?.txnCount],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(meta);
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger Report');
    XLSX.writeFile(wb, `LedgerReport_${fromdate}_to_${todate}.xlsx`);
  };

  // ── Shared grand total renderer ───────────────────────────────────────────
  const GrandTotalRow = ({ colSpanBefore = 1 }) => grandTotals && (
    <TableRow sx={{ bgcolor: '#e8f5e9' }}>
      <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>GRAND TOTAL</TableCell>
      {colSpanBefore > 0 && <TableCell colSpan={colSpanBefore} />}
      {PAYMODES.map(pm => (
        <TableCell key={pm} align="right" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
          ₹ {fmt(grandTotals[pm])}
        </TableCell>
      ))}
      <TableCell align="right" sx={{ fontWeight:'bold', color:'#0d47a1' }}>₹ {fmt(grandTotals.totalPaidByPaymode)}</TableCell>
      <TableCell align="right" sx={{ fontWeight:'bold' }}>₹ {fmt(grandTotals.totalAmount)}</TableCell>
      <TableCell align="right" sx={{ fontWeight:'bold', color:'#4caf50' }}>₹ {fmt(grandTotals.totalPaid)}</TableCell>
      <TableCell align="right" sx={{ fontWeight:'bold', color:'#ff9800' }}>₹ {fmt(grandTotals.totalConcession)}</TableCell>
      <TableCell align="right"
        sx={{ fontWeight:'bold', color: grandTotals.totalBalance > 0 ? '#f44336':'#4caf50' }}>
        ₹ {fmt(grandTotals.totalBalance)}
      </TableCell>
      <TableCell align="center" sx={{ fontWeight:'bold' }}>{grandTotals.txnCount}</TableCell>
    </TableRow>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3, bgcolor: '#f0f4f8', minHeight: '100vh' }}>
      <Box sx={{ mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashdashfacnew')}>Back</Button>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment sx={{ fontSize: 34, color: '#1976d2' }} />
          Student Ledger — Date Range Report
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>{global1.name}</Typography>
        <Typography variant="body2" sx={{ color: '#888' }}>
          Pivot by Paymode (Cash, UPI, NEFT, Cheque, PG)
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Report Filters</Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Dates */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" sx={{ color: '#666' }}>From Date *</Typography>
              <input type="date" value={fromdate} onChange={e => setFromdate(e.target.value)}
                style={{ display:'block', width:'100%', padding:'8px', borderRadius:4,
                         border:'1px solid #ccc', fontSize:14, marginTop:4 }} />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" sx={{ color: '#666' }}>To Date *</Typography>
              <input type="date" value={todate} onChange={e => setTodate(e.target.value)}
                style={{ display:'block', width:'100%', padding:'8px', borderRadius:4,
                         border:'1px solid #ccc', fontSize:14, marginTop:4 }} />
            </Box>
          </Grid>

          {/* Free-text Reg No */}
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant="caption" sx={{ color: '#666' }}>Reg No (optional)</Typography>
              <input type="text" value={regno} onChange={e => setRegno(e.target.value)}
                placeholder="Filter by student Reg No"
                style={{ display:'block', width:'100%', padding:'8px', borderRadius:4,
                         border:'1px solid #ccc', fontSize:14, marginTop:4 }} />
            </Box>
          </Grid>

          {/* Fee Item dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Fee Item (optional)</InputLabel>
              <Select value={feeitem} label="Fee Item (optional)" onChange={e => setFeeitem(e.target.value)}>
                <MenuItem value=""><em>All Fee Items</em></MenuItem>
                {feeitemOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Program Code dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Program Code (optional)</InputLabel>
              <Select value={programcode} label="Program Code (optional)" onChange={e => setProgramcode(e.target.value)}>
                <MenuItem value=""><em>All Programs</em></MenuItem>
                {programOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Academic Year dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Academic Year (optional)</InputLabel>
              <Select value={academicyear} label="Academic Year (optional)" onChange={e => setAcademicyear(e.target.value)}>
                <MenuItem value=""><em>All Years</em></MenuItem>
                {academicyrOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Semester dropdown */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester (optional)</InputLabel>
              <Select value={semester} label="Semester (optional)" onChange={e => setSemester(e.target.value)}>
                <MenuItem value=""><em>All Semesters</em></MenuItem>
                {semesterOptions.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* View Toggle */}
          <Grid item xs={12} sm={6} md={3} sx={{ display:'flex', alignItems:'flex-end' }}>
            <Box>
              <Typography variant="caption" sx={{ color:'#666', mb:0.5, display:'block' }}>Group By</Typography>
              <ToggleButtonGroup size="small" exclusive value={groupby} onChange={(_, v) => v && setGroupby(v)}>
                <ToggleButton value="feeitem" sx={{ gap: 0.5 }}>
                  <TableChart fontSize="small" /> Fee Item
                </ToggleButton>
                <ToggleButton value="student" sx={{ gap: 0.5 }}>
                  <Person fontSize="small" /> Student
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={async () => {
            setFiltersLoaded(false); // reset so it re-fetches
            await loadFilterOptions();
          }}>
            Load Filters
          </Button>
          <Button variant="contained" startIcon={<Search />}
            onClick={handleGenerateReport} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </Box>

        {loading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, color: '#1976d2' }}>Fetching ledger data...</Typography>
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {/* Summary Cards */}
      {reportGenerated && grandTotals && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {PAYMODES.map(pm => (
            <Grid item xs={6} sm={4} md={2} key={pm}>
              <SummaryCard label={pm} value={grandTotals[pm]}
                color={pm==='Cash'?'#2e7d32':pm==='UPI'?'#1565c0':pm==='NEFT'?'#6a1b9a':pm==='Cheque'?'#e65100':'#00838f'}
                icon={<CurrencyRupee />} />
            </Grid>
          ))}
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Total Due" value={grandTotals.totalAmount} color="#1565c0" icon={<Assessment />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Total Paid" value={grandTotals.totalPaid} color="#4caf50" icon={<AccountBalance />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Balance" value={grandTotals.totalBalance}
              color={grandTotals.totalBalance > 0 ? '#f44336' : '#4caf50'} icon={<AccountBalance />} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard label="Concession" value={grandTotals.totalConcession} color="#ff9800" icon={<CurrencyRupee />} />
          </Grid>
        </Grid>
      )}

      {/* Report Table */}
      {reportGenerated && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {activeGroupby === 'student' ? 'Ledger Summary — Student Wise' : 'Ledger Summary — Fee Item Wise'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888' }}>
                Period: {filters?.fromdate} to {filters?.todate}
                {filters?.feeitem      ? `  |  Item: ${filters.feeitem}`       : ''}
                {filters?.semester     ? `  |  Sem: ${filters.semester}`        : ''}
                {filters?.academicyear ? `  |  AY: ${filters.academicyear}`    : ''}
                {filters?.programcode  ? `  |  Prog: ${filters.programcode}`   : ''}
              </Typography>

              {/* Single student banner */}
              {studentInfo && (
                <Box sx={{ mt: 1, display:'flex', alignItems:'center', gap: 1.5, flexWrap:'wrap' }}>
                  <Chip label="Student" size="small" sx={{ bgcolor:'#1565c0', color:'#fff', fontWeight:600 }} />
                  <Typography variant="body2" sx={{ fontWeight:700, color:'#1565c0', fontSize:14 }}>
                    {studentInfo.student}
                  </Typography>
                  <Typography variant="body2" sx={{ color:'#555' }}>
                    Reg No: <strong>{studentInfo.regno}</strong>
                  </Typography>
                </Box>
              )}
            </Box>
            <Button variant="outlined" startIcon={<FileDownload />}
              onClick={handleExportToExcel} disabled={reportRows.length === 0}>
              Export Excel
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {reportRows.length === 0 ? (
            <Box sx={{ textAlign:'center', py: 5 }}>
              <Typography variant="h6" sx={{ color:'#bbb' }}>No data found for the selected filters.</Typography>
              <Typography variant="body2" sx={{ color:'#ccc', mt:1 }}>Try adjusting the date range or clearing some optional filters.</Typography>
            </Box>

          ) : activeGroupby === 'feeitem' ? (
            /* ── Fee Item Wise Table ─────────────────────────────────────────── */
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...thStyle, minWidth: 140 }}>Fee Item</TableCell>
                    <TableCell sx={{ ...thStyle, minWidth: 160 }}>Student Name</TableCell>
                    <TableCell sx={{ ...thStyle, minWidth: 120 }}>Reg No</TableCell>
                    {PAYMODES.map(pm => (
                      <TableCell key={pm} align="right" sx={{ ...thStyle, minWidth: 80 }}>{pm}</TableCell>
                    ))}
                    <TableCell align="right" sx={{ ...thStyle, bgcolor:'#0d47a1', minWidth:110 }}>Total (Paymode)</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 100 }}>Total Due</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 95 }}>Total Paid</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 95 }}>Concession</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 95 }}>Balance</TableCell>
                    <TableCell align="center" sx={{ ...thStyle, minWidth: 55 }}>Txns</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportRows.map((row, idx) => {
                    const isSingle = filters?.regno && row.students?.length > 0;
                    const nameCell = isSingle
                      ? row.students[0].student || '—'
                      : row.students?.length > 0
                        ? `${row.students.length} student${row.students.length > 1 ? 's' : ''}`
                        : '—';
                    const regnoCell = isSingle
                      ? row.students[0].regno || '—'
                      : row.students?.length > 0
                        ? row.students.slice(0,2).map(s=>s.regno).join(', ') +
                          (row.students.length > 2 ? ` (+${row.students.length - 2})` : '')
                        : '—';
                    return (
                      <TableRow key={idx} hover sx={{ bgcolor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                        <TableCell sx={{ fontWeight:600 }}>{row.feeitem || '—'}</TableCell>
                        <TableCell>
                          {isSingle
                            ? <Typography variant="body2" sx={{ fontWeight:600, color:'#1565c0' }}>{nameCell}</Typography>
                            : <Chip label={nameCell} size="small" sx={{ bgcolor:'#e3f2fd', color:'#1565c0', fontWeight:500, fontSize:11 }} />}
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: isSingle ? '#333' : '#888' }}>{regnoCell}</Typography>
                        </TableCell>
                        {PAYMODES.map(pm => (
                          <TableCell key={pm} align="right">
                            {row[pm] > 0
                              ? <Typography variant="body2" sx={{ color:'#2e7d32', fontWeight:500 }}>₹ {fmt(row[pm])}</Typography>
                              : <Typography variant="body2" sx={{ color:'#ccc' }}>—</Typography>}
                          </TableCell>
                        ))}
                        <TableCell align="right"><Typography variant="body2" sx={{ fontWeight:'bold', color:'#0d47a1' }}>₹ {fmt(row.totalPaidByPaymode)}</Typography></TableCell>
                        <TableCell align="right">₹ {fmt(row.totalAmount)}</TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ color:'#4caf50', fontWeight:500 }}>₹ {fmt(row.totalPaid)}</Typography></TableCell>
                        <TableCell align="right">
                          {row.totalConcession > 0 ? <Typography variant="body2" sx={{ color:'#ff9800' }}>₹ {fmt(row.totalConcession)}</Typography> : '—'}
                        </TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ color: row.totalBalance > 0 ? '#f44336':'#4caf50', fontWeight:500 }}>₹ {fmt(row.totalBalance)}</Typography></TableCell>
                        <TableCell align="center"><Chip label={row.txnCount} size="small" /></TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Grand Total */}
                  {grandTotals && (
                    <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                      <TableCell sx={{ fontWeight:'bold' }}>GRAND TOTAL</TableCell>
                      <TableCell colSpan={2} />
                      {PAYMODES.map(pm => <TableCell key={pm} align="right" sx={{ fontWeight:'bold', color:'#2e7d32' }}>₹ {fmt(grandTotals[pm])}</TableCell>)}
                      <TableCell align="right" sx={{ fontWeight:'bold', color:'#0d47a1' }}>₹ {fmt(grandTotals.totalPaidByPaymode)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold' }}>₹ {fmt(grandTotals.totalAmount)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold', color:'#4caf50' }}>₹ {fmt(grandTotals.totalPaid)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold', color:'#ff9800' }}>₹ {fmt(grandTotals.totalConcession)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold', color: grandTotals.totalBalance > 0 ? '#f44336':'#4caf50' }}>₹ {fmt(grandTotals.totalBalance)}</TableCell>
                      <TableCell align="center" sx={{ fontWeight:'bold' }}>{grandTotals.txnCount}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          ) : (
            /* ── Student Wise Table ──────────────────────────────────────────── */
            <TableContainer>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...thStyle, minWidth: 170 }}>Student Name</TableCell>
                    <TableCell sx={{ ...thStyle, minWidth: 120 }}>Reg No</TableCell>
                    <TableCell sx={{ ...thStyle, minWidth: 160 }}>Fee Item</TableCell>
                    {PAYMODES.map(pm => (
                      <TableCell key={pm} align="right" sx={{ ...thStyle, minWidth: 80 }}>{pm}</TableCell>
                    ))}
                    <TableCell align="right" sx={{ ...thStyle, bgcolor:'#0d47a1', minWidth:110 }}>Total (Paymode)</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 100 }}>Total Due</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 95 }}>Total Paid</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 95 }}>Concession</TableCell>
                    <TableCell align="right" sx={{ ...thStyle, minWidth: 95 }}>Balance</TableCell>
                    <TableCell align="center" sx={{ ...thStyle, minWidth: 55 }}>Txns</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportRows.map((row, idx) => (
                    <TableRow key={idx} hover sx={{ bgcolor: idx % 2 === 0 ? '#fafafa' : '#fff' }}>
                      <TableCell sx={{ fontWeight:600, color:'#1565c0' }}>{row.student || '—'}</TableCell>
                      <TableCell><Typography variant="caption" sx={{ color:'#555' }}>{row.regno || '—'}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{row.feeitem || '—'}</Typography></TableCell>
                      {PAYMODES.map(pm => (
                        <TableCell key={pm} align="right">
                          {row[pm] > 0
                            ? <Typography variant="body2" sx={{ color:'#2e7d32', fontWeight:500 }}>₹ {fmt(row[pm])}</Typography>
                            : <Typography variant="body2" sx={{ color:'#ccc' }}>—</Typography>}
                        </TableCell>
                      ))}
                      <TableCell align="right"><Typography variant="body2" sx={{ fontWeight:'bold', color:'#0d47a1' }}>₹ {fmt(row.totalPaidByPaymode)}</Typography></TableCell>
                      <TableCell align="right">₹ {fmt(row.totalAmount)}</TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color:'#4caf50', fontWeight:500 }}>₹ {fmt(row.totalPaid)}</Typography></TableCell>
                      <TableCell align="right">
                        {row.totalConcession > 0 ? <Typography variant="body2" sx={{ color:'#ff9800' }}>₹ {fmt(row.totalConcession)}</Typography> : '—'}
                      </TableCell>
                      <TableCell align="right"><Typography variant="body2" sx={{ color: row.totalBalance > 0 ? '#f44336':'#4caf50', fontWeight:500 }}>₹ {fmt(row.totalBalance)}</Typography></TableCell>
                      <TableCell align="center"><Chip label={row.txnCount} size="small" /></TableCell>
                    </TableRow>
                  ))}
                  {/* Grand Total */}
                  {grandTotals && (
                    <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                      <TableCell sx={{ fontWeight:'bold' }}>GRAND TOTAL</TableCell>
                      <TableCell colSpan={2} />
                      {PAYMODES.map(pm => <TableCell key={pm} align="right" sx={{ fontWeight:'bold', color:'#2e7d32' }}>₹ {fmt(grandTotals[pm])}</TableCell>)}
                      <TableCell align="right" sx={{ fontWeight:'bold', color:'#0d47a1' }}>₹ {fmt(grandTotals.totalPaidByPaymode)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold' }}>₹ {fmt(grandTotals.totalAmount)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold', color:'#4caf50' }}>₹ {fmt(grandTotals.totalPaid)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold', color:'#ff9800' }}>₹ {fmt(grandTotals.totalConcession)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight:'bold', color: grandTotals.totalBalance > 0 ? '#f44336':'#4caf50' }}>₹ {fmt(grandTotals.totalBalance)}</TableCell>
                      <TableCell align="center" sx={{ fontWeight:'bold' }}>{grandTotals.txnCount}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}


          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee', textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: '#aaa' }}>
              Report generated on {new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; By: {global1.user}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default StudentLedgerDateRangeReportds;
