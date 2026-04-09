import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, IconButton, Collapse, Grid, Avatar, useTheme 
} from '@mui/material';
import { 
    KeyboardArrowDown as KeyboardArrowDownIcon, 
    KeyboardArrowUp as KeyboardArrowUpIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    Category as CategoryIcon
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
    const displayName = item.category || 'Uncategorized';

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
                        label={`₹ ${(item.categoryTotal || 0).toLocaleString()}`} 
                        sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.9rem',
                            bgcolor: '#dcfce7',
                            color: '#166534',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }} 
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 4, bgcolor: '#fcfcfc', borderLeft: '4px solid #3b82f6' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <AccountBalanceIcon sx={{ fontSize: 20, mr: 1, color: '#64748b' }} />
                                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                                    Group Breakdown
                                </Typography>
                            </Box>
                            <Table size="small" sx={{ mb: 2 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>Group Name</TableCell>
                                        <TableCell align="right" sx={{ color: '#64748b', fontWeight: 600 }}>Allocated Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(item.groups || []).map((grp, idx) => (
                                        <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell sx={{ fontSize: '0.9rem' }}>{grp.groupname || 'Unspecified Group'}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                ₹ {(grp.amount || 0).toLocaleString()}
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

const CategoryWiseBudgetReportds = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await ep1.get(`/api/v2/getcategorywisebudget?colid=${global1.colid}`);
            const items = res.data?.data?.items || [];
            setReportData(items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box p={3}><Typography>Loading Category Wise Report...</Typography></Box>;

    const grandTotal = reportData.reduce((acc, curr) => acc + (curr.categoryTotal || 0), 0);
    const totalCategories = reportData.length;
    const topCategoryTotal = reportData[0] ? reportData[0].categoryTotal : 0;

    return (
        <Box p={4} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box mb={4}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Category Wise Budget Analysis
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700 }}>
                    Analyze budget allocations across various expense categories, revealing higher-level spending patterns across all organizational units.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Allocated" 
                        value={grandTotal} 
                        icon={<AccountBalanceIcon />} 
                        color="#2563eb" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Primary Category" 
                        value={topCategoryTotal} 
                        icon={<TrendingUpIcon />} 
                        color="#059669" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Active Categories" 
                        value={totalCategories} 
                        icon={<CategoryIcon />} 
                        color="#7c3aed" 
                    />
                </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#0f172a' }}>
                            <TableCell />
                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Expense Category</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Total Allocation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((item, index) => (
                            <Row key={index} item={item} />
                        ))}
                        {reportData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <CategoryIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                                        <Typography variant="h6" color="textSecondary">No data available for this report</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CategoryWiseBudgetReportds;
