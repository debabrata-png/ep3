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
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PurchaseReportds = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!global1.colid1) {
            navigate('/admin/drigable-institutions');
            return;
        }

        const fetchPurchaseData = async () => {
            try {
                const response = await api.get(`/api/v2/getpurchasereportds?colid1=${global1.colid1}`);
                if (response.data.status === 'success') {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching Purchase report:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchaseData();
    }, [navigate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!data || !data.summary) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography variant="h6">No Purchase data found.</Typography>
            </Box>
        );
    }

    // Format Recharts data
    const summaryData = data.summary.map(s => ({
        name: s.category,
        count: s.count
    }));

    const COLORS = ['#FF8042', '#0088FE', '#00C49F', '#FFBB28', '#AF19FF'];

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
                        Overview of procurement pipelines and requests.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom>Transaction Volume</Typography>
                                <Box height="300px" width="100%">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={summaryData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="count" name="Activity Count">
                                                {summaryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card elevation={2} sx={{ borderRadius: 4, height: '400px', p: 2 }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" gutterBottom>Transaction Distribution</Typography>
                                <Box height="300px" width="100%">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={summaryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="count"
                                                nameKey="name"
                                            >
                                                {summaryData.map((entry, index) => (
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
                </Grid>
            </Container>
        </Box>
    );
};

export default PurchaseReportds;
