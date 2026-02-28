import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Avatar,
    CircularProgress,
    Container,
    alpha,
    useTheme
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';
import api from '../api/ep1'; // Ensure this matches existing API setup

const DrigableInstitutionSelectionds = () => {
    const [institutions, setInstitutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        fetchInstitutions();
    }, []);

    const fetchInstitutions = async () => {
        try {
            const adminColId = global1.colid;
            if (!adminColId) {
                console.error("Admin ColID not found in global1");
                setLoading(false);
                return;
            }

            const response = await api.get(`/api/v2/checkinstitutionsds?colid=${adminColId}`);
            if (response.data.status === 'success') {
                setInstitutions(response.data.data.institutions);
            }
        } catch (error) {
            console.error("Error fetching institutions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVisit = (institution) => {
        // Set colid1 for Drigable reports
        global1.colid1 = institution.colid;
        navigate('/drigablereport');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f4f6f8',
            py: 6
        }}>
            <Container maxWidth="xl">
                <Box mb={4}>
                    <Typography
                        variant="h4"
                        fontWeight="700"
                        color="primary.main"
                        gutterBottom
                    >
                        Drigable Reports - Select Institution
                    </Typography>
                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                    >
                        Please select an institution to view its detailed reports and analytics.
                    </Typography>
                </Box>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress size={60} thickness={4} />
                    </Box>
                ) : institutions.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <Typography variant="h6" color="text.secondary">
                            No institutions found.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {institutions.map((inst, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={inst._id || index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: theme.shadows[10],
                                            borderColor: 'primary.main',
                                            '& .MuiAvatar-root': {
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                transform: 'scale(1.1)'
                                            },
                                            '& .arrow-icon': {
                                                transform: 'translateX(4px)',
                                                color: 'primary.main'
                                            }
                                        }
                                    }}
                                >
                                    <CardActionArea
                                        onClick={() => handleVisit(inst)}
                                        sx={{ p: 2, height: '100%' }}
                                    >
                                        <CardContent>
                                            <Box display="flex" alignItems="center" mb={2}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                        color: 'primary.main',
                                                        width: 56,
                                                        height: 56,
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                >
                                                    <BusinessIcon fontSize="medium" />
                                                </Avatar>
                                                <Box ml={2} flex={1}>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        fontWeight="bold"
                                                        sx={{ textTransform: 'uppercase', letterSpacing: 1 }}
                                                    >
                                                        {inst.institutioncode || 'NA'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Typography
                                                variant="h6"
                                                fontWeight="600"
                                                gutterBottom
                                                sx={{
                                                    minHeight: 64,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {inst.institutionname}
                                            </Typography>

                                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {inst.district}, {inst.state}
                                                </Typography>
                                                <ArrowForwardIosIcon
                                                    className="arrow-icon"
                                                    sx={{
                                                        fontSize: 16,
                                                        color: 'text.disabled',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                />
                                            </Box>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default DrigableInstitutionSelectionds;
