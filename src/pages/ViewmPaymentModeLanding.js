import React from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, Button } from '@mui/material';
import { AccountBalance, Language, Payment, Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ViewmPaymentModeLanding = () => {
    const navigate = useNavigate();

    const paymentModes = [
        {
            title: 'Payment Gateway',
            description: 'Pay online using Credit Card, Debit Card, Net Banking, or UPI.',
            icon: <Language sx={{ fontSize: 60, color: '#1a73e8' }} />,
            path: '/online-payment', 
            bgColor: '#e8f0fe'
        },
        {
            title: 'Challan Payment',
            description: 'Generate a Challan to pay at the designated bank branch.',
            icon: <AccountBalance sx={{ fontSize: 60, color: '#f29900' }} />,
            path: '/challan-payment',
            bgColor: '#fef7e0'
        },
        {
            title: 'Counter Payment',
            description: 'Pay directly at the institution counter (Cash/UPI).',
            icon: <Payment sx={{ fontSize: 60, color: '#188038' }} />,
            path: '/dashmfeespayl',
            bgColor: '#e6f4ea'
        }
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', py: 8 }}>
            <Container maxWidth="lg">
                <Box textAlign="center" mb={6}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="800" color="primary">
                        Fee Payment Portal
                    </Typography>
                    <Typography variant="h6" color="textSecondary" sx={{ opacity: 0.8 }}>
                        Secure and easy ways to manage your academic fees
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {paymentModes.map((mode, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card 
                                sx={{ 
                                    height: '100%', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-12px)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                        '& .icon-box': {
                                            transform: 'scale(1.1)'
                                        }
                                    },
                                    borderRadius: 5,
                                    border: '1px solid #eee',
                                    overflow: 'hidden'
                                }}
                            >
                                <Box sx={{ height: 8, bgcolor: mode.icon.props.color }} />
                                <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4, bgcolor: 'white' }}>
                                    <Box 
                                        className="icon-box"
                                        sx={{ 
                                            mb: 4, 
                                            display: 'inline-flex', 
                                            p: 3, 
                                            borderRadius: '50%', 
                                            bgcolor: mode.bgColor,
                                            transition: 'transform 0.3s'
                                        }}
                                    >
                                        {mode.icon}
                                    </Box>
                                    <Typography gutterBottom variant="h5" component="h2" fontWeight="700">
                                        {mode.title}
                                    </Typography>
                                    <Typography variant="body1" color="textSecondary" mb={4} sx={{ minHeight: 60 }}>
                                        {mode.description}
                                    </Typography>
                                    <Button 
                                        variant="contained" 
                                        fullWidth 
                                        size="large"
                                        onClick={() => navigate(mode.path)}
                                        sx={{ 
                                            borderRadius: 2, 
                                            py: 1.5, 
                                            fontWeight: 'bold',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }
                                        }}
                                    >
                                        Proceed
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box textAlign="center" mt={10}>
                    <Button 
                        startIcon={<Settings />} 
                        variant="outlined"
                        color="inherit" 
                        onClick={() => navigate('/challan-config')}
                        sx={{ 
                            textTransform: 'none', 
                            color: '#5f6368',
                            borderRadius: 3,
                            borderColor: '#ddd',
                            px: 3,
                            '&:hover': {
                                borderColor: 'primary.main',
                                color: 'primary.main'
                            }
                        }}
                    >
                        Configure Challan Bank Details
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default ViewmPaymentModeLanding;
