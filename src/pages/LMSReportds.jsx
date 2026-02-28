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
import { useNavigate } from 'react-router-dom';
import global1 from './global1';
import api from '../api/ep1';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LMSReportds = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!global1.colid1) {
            navigate('/admin/drigable-institutions');
            return;
        }

        const fetchLMSData = async () => {
            try {
                const response = await api.get(`/api/v2/getlmsreportds?colid1=${global1.colid1}`);
                if (response.data.status === 'success') {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching LMS report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLMSData();
    }, [navigate]);

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
                <Typography variant="h6">No LMS data found.</Typography>
            </Box>
        );
    }

    // Formating data for Recharts
    const enrollmentsData = Array.isArray(data?.topCoursesEnrollment) ? data.topCoursesEnrollment.map(course => ({
        name: course.courseName || 'Unknown',
        enrollments: course.enrollmentCount || 0
    })) : [];

    const assignmentsData = Array.isArray(data?.monthlyAssignments) ? data.monthlyAssignments.map(item => ({
        month: `${item._id?.year || 'YYYY'}-${item._id?.month ? String(item._id.month).padStart(2, '0') : 'MM'}`,
        count: item.count || 0
    })).sort((a, b) => a.month.localeCompare(b.month)) : [];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
            <Container maxWidth="xl">
                <Box mb={4}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/drigablereport')}
                        sx={{ mb: 2, color: 'text.secondary' }}
                    >
                        Back to Dashboard
                    </Button>
                    <Typography variant="h4" fontWeight="700" color="primary.main">
                        Institution wise Report Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Total Courses: {data.totalCourses || 0}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} lg={6}>
                        <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom>Enrollments</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <BarChart
                                        data={enrollmentsData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="enrollments" fill="#8884d8" name="Enrollments" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom>Assignments Created</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <LineChart
                                        data={assignmentsData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Assignments Created" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default LMSReportds;
