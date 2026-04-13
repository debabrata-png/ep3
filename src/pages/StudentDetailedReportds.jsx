import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Divider,
    Stack,
    Tooltip as MuiTooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RefreshIcon from '@mui/icons-material/Refresh';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';
import ep1 from '../api/ep1';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LabelList
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const COLORS = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#4f46e5'
];

const StudentDetailedReportds = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        programcodes: [],
        admissionyears: [],
        semesters: [],
        departments: [],
        genders: [],
        categories: []
    });

    const [filters, setFilters] = useState({
        programcode: '',
        admissionyear: '',
        semester: '',
        department: '',
        gender: '',
        category: ''
    });

    const reportRef = useRef(null);

    const fetchFilters = async (currentFilters = filters) => {
        try {
            const queryParams = new URLSearchParams({
                colid1: global1.colid,
                ...Object.fromEntries(Object.entries(currentFilters).filter(([_, v]) => v !== ''))
            }).toString();
            const response = await ep1.get(`/api/v2/getstudentfiltersds?${queryParams}`);
            if (response.data.status === 'success') {
                setFilterOptions(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching filters:", error);
        }
    };

    const fetchReportData = async (currentFilters = filters) => {
        setLoading(true);
        try {
            const payload = {
                colid1: global1.colid,
                ...currentFilters
            };

            const [reportRes, listRes] = await Promise.all([
                ep1.post('/api/v2/getstudentreportds', payload),
                ep1.post('/api/v2/getstudentlistds', payload)
            ]);

            if (reportRes.data.status === 'success') {
                setStats(reportRes.data.data);
            }
            if (listRes.data.status === 'success') {
                setStudentList(listRes.data.data);
            }
        } catch (error) {
            console.error("Error fetching report data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = async () => {
        try {
            const response = await ep1.post('/api/v2/exportstudentexcelds', {
                colid1: global1.colid,
                ...filters
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Student_Report_${new Date().getTime()}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error exporting excel:", error);
        }
    };

    useEffect(() => {
        if (!global1.colid) {
            navigate('/admin/drigable-institutions');
            return;
        }
        fetchFilters();
        fetchReportData();
    }, [navigate]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        let newFilters = { ...filters, [name]: value };

        // Hierarchy: Year -> Department -> Program -> Others
        if (name === 'admissionyear') {
            newFilters.department = '';
            newFilters.programcode = '';
            newFilters.semester = '';
            newFilters.gender = '';
            newFilters.category = '';
        } else if (name === 'department') {
            newFilters.programcode = '';
            newFilters.semester = '';
            newFilters.gender = '';
            newFilters.category = '';
        } else if (name === 'programcode') {
            newFilters.semester = '';
            newFilters.gender = '';
            newFilters.category = '';
        }

        setFilters(newFilters);
        fetchReportData(newFilters);
        fetchFilters(newFilters);
    };

    const resetFilters = () => {
        const reseted = {
            programcode: '',
            admissionyear: '',
            semester: '',
            department: '',
            gender: '',
            category: ''
        };
        setFilters(reseted);
        fetchReportData(reseted);
        fetchFilters(reseted);
    };

    const downloadPDF = async () => {
        if (!reportRef.current) return;
        
        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#f4f6f8'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = contentHeight;
            let position = 0;

            // Page 1
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
            heightLeft -= pdfHeight;

            // Subsequent pages
            while (heightLeft > 0) {
                position = heightLeft - contentHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`Student_Report_${new Date().toLocaleDateString()}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    const downloadChartImage = async (id, title) => {
        const element = document.getElementById(id);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff'
            });
            const link = document.createElement('a');
            link.download = `${title}_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error("Error downloading chart:", error);
        }
    };

    if (loading && !stats) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f4f6f8">
                <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    const renderChartCard = (title, data, type, id) => {
        const hasData = data && data.length > 0;

        return (
            <Card id={id} elevation={0} sx={{ borderRadius: 4, height: 450, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight="600" color="text.primary">
                            {title}
                        </Typography>
                        <IconButton size="small" onClick={() => downloadChartImage(id, title)}>
                            <MuiTooltip title="Download as Image">
                                <CameraAltIcon fontSize="small" color="action" />
                            </MuiTooltip>
                        </IconButton>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    {!hasData ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="text.secondary">No data available for this metric</Typography>
                        </Box>
                    ) : (
                        <ResponsiveContainer width="100%" height="90%">
                            {type === 'bar' ? (
                                <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#e2e8f0' }}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Count">
                                        <LabelList dataKey="value" position="top" style={{ fill: '#1e293b', fontWeight: 600, fontSize: 12 }} />
                                    </Bar>
                                </BarChart>
                            ) : (
                                <PieChart>
                                    <Pie
                                        data={data}
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', pt: 10, pb: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box mb={4} display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/usermanagementreport')}
                            sx={{ mb: 1, color: '#64748b', textTransform: 'none', '&:hover': { bgcolor: 'transparent', color: '#1e293b' } }}
                        >
                            Back to Reports
                        </Button>
                        <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b', mb: 1 }}>
                            Student Analytics
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Comprehensive reporting and distribution breakdown of students.
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportExcel}
                            sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b' }}
                        >
                            Export Excel
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={resetFilters}
                            sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#e2e8f0', color: '#64748b' }}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<PictureAsPdfIcon />}
                            onClick={downloadPDF}
                            sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#6366f1', '&:hover': { bgcolor: '#4f46e5' }, px: 3 }}
                        >
                            Export PDF
                        </Button>
                    </Stack>
                </Box>

                {/* Filters Row */}
                <Card elevation={0} sx={{ borderRadius: 4, mb: 4, border: '1px solid #e2e8f0' }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Year</InputLabel>
                                    <Select name="admissionyear" value={filters.admissionyear} label="Year" onChange={handleFilterChange}>
                                        <MenuItem value="">All Years</MenuItem>
                                        {filterOptions.admissionyears.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Department</InputLabel>
                                    <Select name="department" value={filters.department} label="Department" onChange={handleFilterChange}>
                                        <MenuItem value="">All Departments</MenuItem>
                                        {filterOptions.departments.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Program</InputLabel>
                                    <Select name="programcode" value={filters.programcode} label="Program" onChange={handleFilterChange}>
                                        <MenuItem value="">All Programs</MenuItem>
                                        {filterOptions.programcodes.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Semester</InputLabel>
                                    <Select name="semester" value={filters.semester} label="Semester" onChange={handleFilterChange}>
                                        <MenuItem value="">All Semesters</MenuItem>
                                        {filterOptions.semesters.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Gender</InputLabel>
                                    <Select name="gender" value={filters.gender} label="Gender" onChange={handleFilterChange}>
                                        <MenuItem value="">All Genders</MenuItem>
                                        {filterOptions.genders.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Category</InputLabel>
                                    <Select name="category" value={filters.category} label="Category" onChange={handleFilterChange}>
                                        <MenuItem value="">All Categories</MenuItem>
                                        {filterOptions.categories.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Dashboard Stats */}
                <Box ref={reportRef} sx={{ bgcolor: 'transparent', p: 1, position: 'relative' }}>
                    {/* Institutional Logo for PDF */}
                    {global1.logo && (
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
                            <img 
                                src={global1.logo} 
                                alt="Institution Logo" 
                                style={{ maxHeight: '80px', objectFit: 'contain' }}
                                crossOrigin="anonymous"
                            />
                        </Box>
                    )}

                    {loading && (
                        <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" justifyContent="center" alignItems="center" zIndex={10} bgcolor="rgba(244, 246, 248, 0.5)">
                            <CircularProgress sx={{ color: '#6366f1' }} />
                        </Box>
                    )}

                    <Grid container spacing={3}>
                        {/* Summary Card */}
                        <Grid item xs={12}>
                            <Card elevation={0} sx={{
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                                color: 'white',
                                p: 2
                            }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 3 }}>
                                        <Typography variant="h4">🎓</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Total Students Matching Filters</Typography>
                                        <Typography variant="h3" fontWeight="800">{stats?.totalStudents || 0}</Typography>
                                    </Box>
                                </Stack>
                            </Card>
                        </Grid>

                        {/* Charts */}
                        <Grid item xs={12} lg={8}>
                            {renderChartCard('Program Wise Distribution', stats?.programStats, 'bar', 'program-chart')}
                        </Grid>
                        <Grid item xs={12} lg={4}>
                            {renderChartCard('Semester Breakdown', stats?.semesterStats, 'pie', 'semester-chart')}
                        </Grid>

                        <Grid item xs={12} lg={6}>
                            {renderChartCard('Academic Year Distribution', stats?.yearStats, 'bar', 'year-chart')}
                        </Grid>
                        <Grid item xs={12} lg={6}>
                            {renderChartCard('Department Wise Distribution', stats?.departmentStats, 'bar', 'dept-chart')}
                        </Grid>

                        <Grid item xs={12} md={6}>
                            {renderChartCard('Gender Distribution', stats?.genderStats, 'pie', 'gender-chart')}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            {renderChartCard('Category Breakdown', stats?.categoryStats, 'pie', 'category-chart')}
                        </Grid>

                        {/* Data Table Section */}
                        <Grid item xs={12}>
                            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', minHeight: 400 }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="600" mb={3}>
                                        Student Records
                                    </Typography>
                                    <Box sx={{ overflowX: 'auto' }}>
                                        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', '& th, & td': { p: 2, textAlign: 'left', borderBottom: '1px solid #f1f5f9' } }}>
                                            <thead>
                                                <Box component="tr" sx={{ bgcolor: '#f8fafc' }}>
                                                    <th>Student Name</th>
                                                    <th>Reg No</th>
                                                    <th>Gender</th>
                                                    <th>Program Code</th>
                                                    <th>Academic Year</th>
                                                    <th>Category</th>
                                                    <th>Semester</th>
                                                </Box>
                                            </thead>
                                            <tbody>
                                                {studentList.length > 0 ? (
                                                    studentList.map((row, idx) => (
                                                        <tr key={idx}>
                                                            <td><Typography variant="body2" fontWeight="500">{row.name}</Typography></td>
                                                            <td><Typography variant="body2" color="text.secondary">{row.regno}</Typography></td>
                                                            <td><Typography variant="body2">{row.gender}</Typography></td>
                                                            <td><Typography variant="body2">{row.programcode}</Typography></td>
                                                            <td><Typography variant="body2">{row.admissionyear}</Typography></td>
                                                            <td><Typography variant="body2">{row.category}</Typography></td>
                                                            <td><Typography variant="body2">{row.semester}</Typography></td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} style={{ textAlign: 'center', py: 4 }}>
                                                            <Typography color="text.secondary">No records found</Typography>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default StudentDetailedReportds;
