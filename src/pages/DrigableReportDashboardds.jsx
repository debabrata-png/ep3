import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea,
    Avatar,
    Container,
    alpha,
    useTheme,
    Button
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';

const DrigableReportDashboardds = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [colid1, setColid1] = useState(null);

    useEffect(() => {
        // Enforce institution selection
        if (!global1.colid1) {
            navigate('/admin/drigable-institutions');
        } else {
            setColid1(global1.colid1);
        }
    }, [navigate]);

    const reportModules = [
        {
            title: 'User Management Report',
            description: 'Analyze users by roles, programs, semesters, and academic years.',
            icon: <GroupIcon fontSize="large" />,
            route: '/usermanagementreport',
            color: theme.palette.primary.main
        },
        {
            title: 'LMS Report',
            description: 'Analytics for courses, enrollments, and assignments.',
            icon: <MenuBookIcon fontSize="large" />,
            route: '/lmsreport',
            color: theme.palette.info.main
        },
        {
            title: 'Purchase Module Report',
            description: 'Track purchase requisitions, orders, and overall expenses.',
            icon: <ShoppingCartIcon fontSize="large" />,
            route: '/purchasereport',
            color: theme.palette.success.main
        }
    ];

    const handleNavigate = (route) => {
        navigate(route);
    };

    if (!colid1) return null;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/admin/drigable-institutions')}
                            sx={{ mb: 2, color: 'text.secondary' }}
                        >
                            Back to Institutions
                        </Button>
                        <Typography variant="h4" fontWeight="700" color="primary.main">
                            Institution wise Report Dashboard
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Institution ID: {colid1}
                        </Typography>
                    </Box>
                </Box>

                {/* Cards Section */}
                <Grid container spacing={4}>
                    {reportModules.map((module, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 4,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    height: '100%',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: theme.shadows[10],
                                        borderColor: module.color,
                                        '& .MuiAvatar-root': {
                                            bgcolor: module.color,
                                            color: 'white',
                                            transform: 'scale(1.1)'
                                        },
                                        '& .arrow-icon': {
                                            transform: 'translateX(4px)',
                                            color: module.color
                                        }
                                    }
                                }}
                            >
                                <CardActionArea
                                    onClick={() => handleNavigate(module.route)}
                                    sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(module.color, 0.1),
                                            color: module.color,
                                            width: 72,
                                            height: 72,
                                            mb: 3,
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {module.icon}
                                    </Avatar>

                                    <Typography variant="h5" fontWeight="600" gutterBottom>
                                        {module.title}
                                    </Typography>

                                    <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1, mb: 3 }}>
                                        {module.description}
                                    </Typography>

                                    <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
                                        <Typography variant="button" color="text.secondary" fontWeight="bold">
                                            View Report
                                        </Typography>
                                        <ArrowForwardIosIcon
                                            className="arrow-icon"
                                            sx={{ fontSize: 16, color: 'text.disabled', transition: 'all 0.3s ease' }}
                                        />
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default DrigableReportDashboardds;
