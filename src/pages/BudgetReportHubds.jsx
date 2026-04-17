import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Grid, Card, CardContent, CardActionArea, 
    Avatar, Button, Divider, Paper
} from '@mui/material';
import { 
    Assessment as AssessmentIcon,
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    Business as BusinessIcon,
    AccountBalance as AccountBalanceIcon,
    ArrowForward as ArrowForwardIcon,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import global1 from './global1';

const ReportCard = ({ title, description, icon, path, color }) => {
    const navigate = useNavigate();
    return (
        <Card sx={{ 
            height: '100%', 
            borderRadius: 4, 
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: `0 20px 25px -5px ${color}22, 0 8px 10px -6px ${color}22`,
                borderColor: color
            },
            border: '1px solid #e2e8f0'
        }}>
            <CardActionArea onClick={() => navigate(path)} sx={{ height: '100%', p: 1 }}>
                <CardContent sx={{ p: 3 }}>
                    <Avatar sx={{ 
                        bgcolor: `${color}15`, 
                        color: color, 
                        width: 64, 
                        height: 64, 
                        mb: 3,
                        borderRadius: 3
                    }}>
                        {icon}
                    </Avatar>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: '#1e293b' }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6, minHeight: 48 }}>
                        {description}
                    </Typography>
                    <Box display="flex" alignItems="center" color={color} sx={{ fontWeight: 700 }}>
                        View Report <ArrowForwardIcon sx={{ ml: 1, fontSize: 18 }} />
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const BudgetReportHubds = () => {
    const navigate = useNavigate();

    const reports = [
        {
            title: "Department Analysis",
            description: "Detailed breakdown of budget allocations and types across all departments.",
            icon: <BusinessIcon sx={{ fontSize: 32 }} />,
            path: "/DepartmentWiseBudgetReportds",
            color: "#3b82f6"
        },
        {
            title: "Category Breakdown",
            description: "High-level view of spending distributed by expense categories.",
            icon: <PieChartIcon sx={{ fontSize: 32 }} />,
            path: "/CategoryWiseBudgetReportds",
            color: "#10b981"
        },
        {
            title: "Group Summary",
            description: "Analyze budgets aggregated by higher-level organizational groups.",
            icon: <BarChartIcon sx={{ fontSize: 32 }} />,
            path: "/GroupWiseBudgetReportds",
            color: "#8b5cf6"
        },
        {
            title: "Institution Category",
            description: "Compare category-wise spending across all registered institutions.",
            icon: <AccountBalanceIcon sx={{ fontSize: 32 }} />,
            path: "/BudgetInstitutionCategoryReportds",
            color: "#f59e0b"
        },
        {
            title: "Institution Group Analysis",
            description: "Deep dive into specific group/category combinations across campuses.",
            icon: <AssessmentIcon sx={{ fontSize: 32 }} />,
            path: "/BudgetInstitutionGroupCategoryReportds",
            color: "#ef4444"
        },
        {
            title: "Category-Dept Analysis",
            description: "Deep dive into category-wise spending with a department breakdown.",
            icon: <BusinessIcon sx={{ fontSize: 32 }} />,
            path: "/CategoryDeptWiseBudgetReportds",
            color: "#6366f1"
        }
    ];

    return (
        <Box p={6} sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
            {/* Header */}
            <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.025em', mb: 1 }}>
                        Insights & Analytics
                    </Typography>
                    <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 500 }}>
                        Analyze your financial data across departments, categories, and institutions.
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<DashboardIcon />}
                    onClick={() => navigate('/budgetdashboardds')}
                    sx={{ 
                        borderRadius: 3, 
                        px: 3, 
                        py: 1, 
                        fontWeight: 700, 
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                    }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Divider sx={{ mb: 6 }} />

            {/* Stats Overview (Optional Placeholder) */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: '#64748b' }}>Current Campus</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{global1.insname || 'Main Campus'}</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: '#64748b' }}>Active Period</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>2026-27 Financial Year</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: '#64748b' }}>Reporting Status</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#22c55e' }}>Real-time Sync</Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Reports Grid */}
            <Grid container spacing={4}>
                {reports.map((report, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <ReportCard {...report} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default BudgetReportHubds;
