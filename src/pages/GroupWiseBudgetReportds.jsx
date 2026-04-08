import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, IconButton, Collapse, Grid, Avatar, useTheme 
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CategoryIcon from '@mui/icons-material/Category';
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
                ₹ {value.toLocaleString()}
            </Typography>
        </Box>
    </Paper>
);

const Row = ({ group }) => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const displayName = group.groupname || 'Uncategorized / Others';

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
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: group.groupname ? '#1e293b' : '#64748b' }}>
                        {displayName}
                    </Typography>
                </TableCell>
                <TableCell align="right">
                    <Chip 
                        label={`₹ ${(group.groupTotal || 0).toLocaleString()}`} 
                        sx={{ 
                            fontWeight: 700, 
                            fontSize: '0.9rem',
                            bgcolor: group.groupname ? '#dcfce7' : '#f1f5f9',
                            color: group.groupname ? '#166534' : '#475569',
                            border: '1px solid rgba(0,0,0,0.05)'
                        }} 
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 4, bgcolor: '#fcfcfc', borderLeft: '4px solid #e2e8f0' }}>
                            <Box display="flex" alignItems="center" mb={2}>
                                <CategoryIcon sx={{ fontSize: 20, mr: 1, color: '#64748b' }} />
                                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                                    Category Distribution
                                </Typography>
                            </Box>
                            <Table size="small" sx={{ mb: 2 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>Category Name</TableCell>
                                        <TableCell align="right" sx={{ color: '#64748b', fontWeight: 600 }}>Allocated Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {group.categories.map((cat, idx) => (
                                        <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell sx={{ fontSize: '0.9rem' }}>{cat.category}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                ₹ {(cat.amount || 0).toLocaleString()}
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

const GroupWiseBudgetReportds = () => {
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const res = await ep1.get(`/api/v2/getgroupwisecategorybudget?colid=${global1.colid}`);
            const items = res.data?.data?.items || [];
            // Sort by amount descending
            const sortedItems = items.sort((a, b) => b.groupTotal - a.groupTotal);
            setReportData(sortedItems);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box p={3}><Typography>Loading Group Wise Report...</Typography></Box>;

    const grandTotal = reportData.reduce((acc, curr) => acc + (curr.groupTotal || 0), 0);
    const totalGroups = reportData.length;
    const topGroup = reportData[0] ? reportData[0].groupTotal : 0;

    return (
        <Box p={4} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box mb={4}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Group Wise Budget Analysis
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700 }}>
                    Gain insights into budget distribution across different operational groups and their component categories.
                </Typography>
            </Box>

            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Grand Total Allocated" 
                        value={grandTotal} 
                        icon={<AccountBalanceIcon />} 
                        color="#3b82f6" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Primary Group Allocation" 
                        value={topGroup} 
                        icon={<TrendingUpIcon />} 
                        color="#10b981" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Active Groups" 
                        value={totalGroups} 
                        icon={<CategoryIcon />} 
                        color="#6366f1" 
                        // Overriding value format for count instead of currency if needed, but keeping currency format for now for simplicity
                    />
                </Grid>
            </Grid>

            <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#1e293b' }}>
                            <TableCell />
                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Budget Group</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Total Allocation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((group, index) => (
                            <Row key={index} group={group} />
                        ))}
                        {reportData.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <CategoryIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                                        <Typography variant="h6" color="textSecondary">No analytical data found</Typography>
                                        <Typography variant="body2" color="textSecondary">Complete budget allocations to see this report.</Typography>
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

export default GroupWiseBudgetReportds;
