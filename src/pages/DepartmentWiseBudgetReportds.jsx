import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, IconButton, Collapse, Grid, Avatar, useTheme 
} from '@mui/material';
import { 
    KeyboardArrowDown as KeyboardArrowDownIcon, 
    KeyboardArrowUp as KeyboardArrowUpIcon,
    AccountBalance as AccountBalanceIcon,
    Business as BusinessIcon,
    CorporateFare as CorporateFareIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import ep1 from '../api/ep1';
import global1 from './global1';

const StatCard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        borderRadius: 2,
        height: '100%',
        borderLeft: `6px solid ${color}`,
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
    }}>
        <Avatar sx={{ bgcolor: `${color}15`, color: color, mr: 2, width: 56, height: 56 }}>
            {icon}
        </Avatar>
        <Box>
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a202c' }}>
                ₹ {(value || 0).toLocaleString()}
            </Typography>
        </Box>
    </Paper>
);

const Row = ({ item }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const displayName = item.department || 'General Administration';

    return (
        <React.Fragment>
            <TableRow 
                sx={{ 
                    '& > *': { borderBottom: 'unset' }, 
                    bgcolor: open ? '#f8fafc' : 'inherit',
                    transition: 'background-color 0.3s',
                    '&:hover': { bgcolor: '#f1f5f9' }
                }}
            >
                <TableCell width="60">
                    <IconButton 
                        size="small" 
                        onClick={() => setOpen(!open)}
                        sx={{ 
                            color: open ? theme.palette.primary.main : 'inherit',
                            transform: open ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.3s'
                        }}
                    >
                        <KeyboardArrowDownIcon />
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                        {displayName}
                    </Typography>
                </TableCell>
                <TableCell align="right">
                    <Chip 
                        label={`₹ ${(item.departmentTotal || 0).toLocaleString()}`} 
                        sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.9rem',
                            bgcolor: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }} 
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 4, bgcolor: '#fcfcfc', borderLeft: '4px solid #10b981' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CorporateFareIcon sx={{ fontSize: 20, mr: 1, color: '#64748b' }} />
                                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                                    Main Budget Records
                                </Typography>
                            </Box>
                            <Table size="small" sx={{ mb: 2 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>Budget Name</TableCell>
                                        <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>Type</TableCell>
                                        <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>Status</TableCell>
                                        <TableCell align="right" sx={{ color: '#64748b', fontWeight: 600 }}>Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(item.budgets || []).map((b, idx) => (
                                        <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell sx={{ fontSize: '0.9rem' }}>{b.budgetname}</TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem' }}>{b.budgettype}</TableCell>
                                            <TableCell>
                                                <Chip label={b.status} size="small" sx={{ fontSize: '0.7rem', height: 20 }} color={b.status === 'Approved' ? 'success' : 'default'} />
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                ₹ {(b.amount || 0).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const DepartmentWiseBudgetReportds = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await ep1.get(`/api/v2/getdepartmentwisebudget?colid=${global1.colid}`);
            const items = res.data?.data?.items || [];
            setReportData(items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box p={3}><Typography>Loading Department Wise Report...</Typography></Box>;

    const grandTotal = reportData.reduce((acc, curr) => acc + (curr.departmentTotal || 0), 0);
    const totalDepts = reportData.length;
    const topDeptTotal = reportData[0] ? reportData[0].departmentTotal : 0;

    return (
        <Box p={4} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box mb={4}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Department Wise Main Budget
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700 }}>
                    Overview of total budget allocations grouped by department. Monitor main budget records and their approval status across the entire institution.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Institution Total" 
                        value={grandTotal} 
                        icon={<AccountBalanceIcon />} 
                        color="#1d4ed8" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Top Dept. Budget" 
                        value={topDeptTotal} 
                        icon={<TrendingUpIcon />} 
                        color="#059669" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Active Departments" 
                        value={totalDepts} 
                        icon={<BusinessIcon />} 
                        color="#f59e0b" 
                    />
                </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={5} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#1e293b' }}>
                            <TableCell />
                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Department</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Total Department Budget</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((item, index) => (
                            <Row key={index} item={item} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DepartmentWiseBudgetReportds;
