import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    CircularProgress,
    Container,
    Button,
    useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';
import api from '../api/ep1';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const UserManagementReportds = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!global1.colid1) {
            navigate('/admin/drigable-institutions');
            return;
        }

        const fetchReportData = async () => {
            try {
                const response = await api.get(`/api/v2/getusermanagementreportds?colid1=${global1.colid1}`);
                if (response.data.status === 'success') {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching user report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReportData();
    }, [navigate]);

    const handleRoleClick = (role) => {
        navigate(`/rolespecificreport/${encodeURIComponent(role)}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!data || !data.roleStats) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h6">No data found.</Typography>
            </Box>
        );
    }

    // Prepare Chart Data for Recharts
    const validRoles = data.roleStats.filter(r => r.role); // protect against null roles

    const rechartsData = validRoles.map(r => ({
        name: r.role.toUpperCase(),
        value: r.count
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#8884d8', '#82ca9d'];


    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header */}
                <Box mb={4}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/drigablereport')}
                        sx={{ mb: 2, color: 'text.secondary' }}
                    >
                        Back to Dashboard
                    </Button>
                    <Typography variant="h4" fontWeight="700" color="primary.main">
                        User Management Report
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Total Users: {data.totalUsers}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {/* Graph Section */}
                    <Grid item xs={12} lg={8}>
                        <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                            <CardContent sx={{ height: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={rechartsData}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" fill="#1976d2" name="User Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} lg={4}>
                        <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                            <CardContent sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Box height="300px" width="100%">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={rechartsData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                            >
                                                {rechartsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Role Cards Section */}
                    <Grid item xs={12}>
                        <Typography variant="h5" fontWeight="600" mb={3} mt={2}>
                            Detailed Role Reports
                        </Typography>
                        <Grid container spacing={3}>
                            {validRoles.map((stat, index) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <Card
                                        elevation={1}
                                        sx={{
                                            borderRadius: 3,
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[4] },
                                            borderLeft: `6px solid ${theme.palette.primary.main}`
                                        }}
                                    >
                                        <CardActionArea onClick={() => handleRoleClick(stat.role)}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
                                                    {stat.role}
                                                </Typography>
                                                <Typography variant="h4" color="primary.main" mt={1}>
                                                    {stat.count}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Registered Users
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default UserManagementReportds;
