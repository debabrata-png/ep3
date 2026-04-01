import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import global1 from './global1';

const Dashmahoi = () => {
    return (
        <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
            <Paper elevation={0} square sx={{ borderBottom: '1px solid #e0e0e0', px: 3, pt: 2, pb: 2, backgroundColor: '#fff' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e' }}>
                    AHOI Dashboard
                </Typography>
            </Paper>

            <Box p={3}>
                <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    <Typography variant="h4" color="primary" gutterBottom>
                        Welcome, {global1.name} (AHOI)
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                        Use the menu on the left to navigate to the Requisition Approval section.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashmahoi;
