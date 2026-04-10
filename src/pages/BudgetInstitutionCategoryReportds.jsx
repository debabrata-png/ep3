import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
    TableHead, TableRow, Grid, Avatar, useTheme, FormControl, InputLabel, 
    Select, MenuItem, Button, Card, CardContent
} from '@mui/material';
import { 
    AccountBalance as AccountBalanceIcon,
    Category as CategoryIcon,
    Download as DownloadIcon,
    Business as BusinessIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
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

const BudgetInstitutionCategoryReportds = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await ep1.get(`/api/v2/getdistinctbudgetcategories?colid=${global1.colid}`);
            setCategories(res.data?.data?.items || []);
        } catch (e) {
            console.error('Error fetching categories:', e);
        }
    };

    const fetchReport = async (category) => {
        if (!category) return;
        try {
            setLoading(true);
            const res = await ep1.get(`/api/v2/getinstitutioncategorybudget?colid=${global1.colid}&category=${category}`);
            setReportData(res.data?.data?.items || []);
        } catch (e) {
            console.error('Error fetching report:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (event) => {
        const cat = event.target.value;
        setSelectedCategory(cat);
        fetchReport(cat);
    };

    const handleExportExcel = () => {
        if (reportData.length === 0) return;
        
        const dataToExport = reportData.map(item => ({
            'Institution': item.institution,
            'Category': selectedCategory,
            'Allocated Amount (₹)': item.amount
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        
        XLSX.writeFile(workbook, `Institution_Budget_${selectedCategory}_${new Date().toLocaleDateString()}.xlsx`);
    };

    const grandTotal = reportData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalInstitutions = reportData.length;

    return (
        <Box p={4} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
            <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#0f172a' }}>
                        Institution-wise Budget Analysis
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        View budget allocations across different institutions for a specific expenditure category.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<DownloadIcon />}
                    onClick={handleExportExcel}
                    disabled={reportData.length === 0}
                    sx={{ borderRadius: 2, px: 3, py: 1.5, fontWeight: 700, textTransform: 'none' }}
                >
                    Export to Excel
                </Button>
            </Box>

            <Card sx={{ mb: 4, borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Select Category</InputLabel>
                                <Select
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                    label="Select Category"
                                    sx={{ borderRadius: 2 }}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {categories.map((cat, idx) => (
                                        <MenuItem key={idx} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard 
                                title="Category Total" 
                                value={grandTotal} 
                                icon={<AccountBalanceIcon />} 
                                color="#2563eb" 
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <StatCard 
                                title="Institutions" 
                                value={totalInstitutions} 
                                icon={<BusinessIcon />} 
                                color="#7c3aed" 
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#0f172a' }}>
                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Institution Name</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Category</TableCell>
                            <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, fontSize: '1rem', py: 2 }}>Allocated Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reportData.map((item, index) => (
                            <TableRow key={index} sx={{ '&:hover': { bgcolor: '#f1f5f9' }, transition: 'background-color 0.2s' }}>
                                <TableCell>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                        {item.institution}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                                        {selectedCategory}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#2563eb' }}>
                                        ₹ {(item.amount || 0).toLocaleString()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                        {reportData.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <Box display="flex" flexDirection="column" alignItems="center">
                                        <CategoryIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                                        <Typography variant="h6" color="textSecondary">
                                            {selectedCategory ? 'No data available for this category' : 'Please select a category to view the report'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                    <Typography variant="h6" color="textSecondary">Loading analysis...</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BudgetInstitutionCategoryReportds;
