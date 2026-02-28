import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import global1 from './global1';
import api from '../api/ep1';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';


const RoleSpecificReportds = () => {
    const navigate = useNavigate();
    const { role } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!global1.colid1) {
            navigate('/admin/drigable-institutions');
            return;
        }

        const fetchReportData = async () => {
            try {
                const response = await api.post('/api/v2/getrolespecificreportds', {
                    colid1: global1.colid1,
                    role: role
                });

                if (response.data.status === 'success') {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching role report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [navigate, role]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!data) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h6">No detailed data found for {role}.</Typography>
            </Box>
        );
    }

    // Formatting data for Recharts
    const formatRechartsData = (statsArray) => {
        if (!statsArray || statsArray.length === 0) return [];
        return statsArray.filter(s => s._id).map(s => ({
            name: String(s._id).toUpperCase(),
            value: s.count
        }));
    };

    const programData = formatRechartsData(data.programStats);
    const semesterData = formatRechartsData(data.semesterStats);
    const yearData = formatRechartsData(data.yearStats);
    const departmentData = formatRechartsData(data.departmentStats);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF0000', '#00FF00', '#0000FF'];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
            <Container maxWidth="xl">
                <Box mb={4}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/usermanagementreport')}
                        sx={{ mb: 2, color: 'text.secondary' }}
                    >
                        Back to Role Selection
                    </Button>
                    <Typography variant="h4" fontWeight="700" color="primary.main" sx={{ textTransform: 'capitalize' }}>
                        Institution wise Report Dashboard
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Dynamic rendering based on data received from backend */}

                    {data.programStats && programData.length > 0 && (
                        <Grid item xs={12} lg={6}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography variant="h6" align="center" gutterBottom>Distribution by Program</Typography>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <BarChart
                                            data={programData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#4caf50" name="Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    {data.programStats && programData.length === 0 && (
                        <Grid item xs={12} lg={6}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography align="center" mt={10}>No Program Data</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {data.semesterStats && semesterData.length > 0 && (
                        <Grid item xs={12} lg={6}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Typography variant="h6" align="center" gutterBottom>Distribution by Semester</Typography>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie
                                                data={semesterData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {semesterData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    {data.semesterStats && semesterData.length === 0 && (
                        <Grid item xs={12} lg={6}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography align="center" mt={10}>No Semester Data</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {data.yearStats && yearData.length > 0 && (
                        <Grid item xs={12} lg={12}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography variant="h6" align="center" gutterBottom>Distribution by Academic Year</Typography>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <BarChart
                                            data={yearData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#82ca9d" name="Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    {data.yearStats && yearData.length === 0 && (
                        <Grid item xs={12} lg={12}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography align="center" mt={10}>No Academic Year Data</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Generic Fallback for non-student roles */}
                    {data.departmentStats && departmentData.length > 0 && (
                        <Grid item xs={12}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography variant="h6" align="center" gutterBottom>Distribution by Department</Typography>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <BarChart
                                            data={departmentData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="value" fill="#8884d8" name="Count" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                    {data.departmentStats && departmentData.length === 0 && (
                        <Grid item xs={12}>
                            <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                                <CardContent sx={{ height: '100%' }}>
                                    <Typography align="center" mt={10}>No Department Data</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </Container>
        </Box>
    );
};

export default RoleSpecificReportds;
