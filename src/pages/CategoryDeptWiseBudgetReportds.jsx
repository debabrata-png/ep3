import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Chip, IconButton, Collapse, Grid, Avatar, useTheme,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
    KeyboardArrowDown as KeyboardArrowDownIcon, 
    KeyboardArrowUp as KeyboardArrowUpIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    Category as CategoryIcon,
    Business as BusinessIcon
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
                                <BusinessIcon sx={{ fontSize: 20, mr: 1, color: '#64748b' }} />
                                <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
                                    Department-wise Breakdown
                                </Typography>
                            </Box>
                            <Table size="small" sx={{ mb: 2 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>Department Name</TableCell>
                                        <TableCell align="right" sx={{ color: '#64748b', fontWeight: 600 }}>Allocated Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(item.departments || []).map((dept, idx) => (
                                        <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                                            <TableCell sx={{ fontSize: '0.9rem' }}>{dept.department || 'General'}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                ₹ {(dept.amount || 0).toLocaleString()}
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

const CategoryDeptWiseBudgetReportds = () => {
    const [institutions, setInstitutions] = useState([]);
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [isManagement, setIsManagement] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = () => {
            const mgmt = global1.role === 'Management' || global1.ismanagement === 'true';
            setIsManagement(mgmt);
            fetchReport(mgmt);
            if (mgmt) fetchInstitutions();
        };
        checkRole();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const res = await ep1.get(`/api/v2/getinstitutionsforbudget?colid=${global1.colid}`);
            setInstitutions(res.data?.data?.items || []);
        } catch (e) {
            console.error('Error fetching institutions:', e);
        }
    };

    const fetchReport = async (mgmt, instColid = '') => {
        try {
            setLoading(true);
            const res = await ep1.get(`/api/v2/getcategorydepartmentwisebudget?colid=${global1.colid}&ismanagement=${mgmt}&searchcolid=${instColid}`);
            const items = res.data?.data?.items || [];
            setReportData(items);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleInstitutionChange = (event) => {
        const inst = event.target.value;
        setSelectedInstitution(inst);
        fetchReport(isManagement, inst);
    };


    if (loading) return <Box p={3}><Typography>Loading Category-Dept Report...</Typography></Box>;

    const grandTotal = reportData.reduce((acc, curr) => acc + (curr.categoryTotal || 0), 0);
    const totalCategories = reportData.length;
    const topCategoryTotal = reportData[0] ? reportData[0].categoryTotal : 0;

    return (
        <Box p={4} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Category-wise Department Budget
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 700 }}>
                        Deep dive into organizational spending by exploring how each budget category is distributed among departments.
                    </Typography>
                </Box>
                {isManagement && (
                    <FormControl variant="outlined" sx={{ minWidth: 250 }}>
                        <InputLabel>Select Institution (Optional)</InputLabel>
                        <Select
                            value={selectedInstitution}
                            onChange={handleInstitutionChange}
                            label="Select Institution (Optional)"
                            sx={{ borderRadius: 2, bgcolor: '#fff' }}
                        >
                            <MenuItem value=""><em>All Institutions</em></MenuItem>
                            {institutions.map((inst, idx) => (
                                <MenuItem key={idx} value={inst.colid}>{inst.institutionname}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>


            <Grid container spacing={3} mb={5}>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Total Distribution" 
                        value={grandTotal} 
                        icon={<AccountBalanceIcon />} 
                        color="#2563eb" 
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <StatCard 
                        title="Lead Category" 
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

export default CategoryDeptWiseBudgetReportds;
