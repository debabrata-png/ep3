import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Grid,
    Alert,
    Snackbar,
    Divider,
    Container,
    Paper,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    Badge,
    Drawer,
    List,
} from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { Save, Menu as MenuIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import ep1 from '../api/ep1';
import global1 from './global1';
import { mainListItems, secondaryListItems } from './menucas1';

// --- Sidebar/Layout Styling (Copied from Dashmncas11.js) ---
const SidebarWidth = 250;

const AppBarStyled = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: SidebarWidth,
        width: `calc(100% - ${SidebarWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerStyled = styled(Drawer, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: SidebarWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(open ? {} : {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

const mdTheme = createTheme();

// --- Internal Form Component (Existing Logic) ---
const ConfigForm = () => { // Renamed from SchoolConfigPageds
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [formData, setFormData] = useState({
        schoolname: '',
        addressline1: '',
        addressline2: '',
        affiliationno: '',
        email: '',
        phone: '',
        telephone: '',
        logolink: '',
        schoolcode: '',
        udisecode: '',
        activetemplate: 'standard'
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await ep1.get('/api/v2/getschreportconfds', {
                params: { colid: global1.colid }
            });

            if (response.data.success && response.data.data) {
                setFormData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching school config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.schoolname) {
            showSnackbar('School Name is required', 'warning');
            return;
        }

        try {
            const response = await ep1.post(
                '/api/v2/saveschreportconfds',
                {
                    ...formData,
                    colid: global1.colid,
                    user: global1.user,
                    name: 'schreportconf'
                }
            );

            if (response.data.success) {
                showSnackbar('Configuration saved successfully', 'success');
                fetchConfig();
            }
        } catch (error) {
            console.error('Error saving config:', error);
            showSnackbar('Failed to save configuration', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                School Report Card Configuration
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom>
                Configure the school details and logo to be displayed on the report card.
            </Typography>

            <Card sx={{ mt: 3, maxWidth: 800 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6" color="primary">Basic Details</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="School Name"
                                value={formData.schoolname || ''}
                                onChange={(e) => setFormData({ ...formData, schoolname: e.target.value })}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Affiliation No."
                                value={formData.affiliationno || ''}
                                onChange={(e) => setFormData({ ...formData, affiliationno: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="School Code"
                                value={formData.schoolcode || ''}
                                onChange={(e) => setFormData({ ...formData, schoolcode: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="UDISE Code"
                                value={formData.udisecode || ''}
                                onChange={(e) => setFormData({ ...formData, udisecode: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" color="primary">Address & Contact</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 1"
                                placeholder="Street, Area"
                                value={formData.addressline1 || ''}
                                onChange={(e) => setFormData({ ...formData, addressline1: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 2"
                                placeholder="City, State, Zip"
                                value={formData.addressline2 || ''}
                                onChange={(e) => setFormData({ ...formData, addressline2: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Phone / Mobile"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Telephone"
                                value={formData.telephone || ''}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="h6" color="primary">Media & Visuals</Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Logo Image Link (URL)"
                                placeholder="https://example.com/logo.png"
                                value={formData.logolink || ''}
                                onChange={(e) => setFormData({ ...formData, logolink: e.target.value })}
                                helperText="Paste a direct link to the school logo (PNG/JPG)"
                            />
                        </Grid>

                        {formData.logolink && (
                            <Grid item xs={12}>
                                <Typography variant="caption">Preview:</Typography>
                                <Box sx={{ mt: 1, p: 2, border: '1px dashed grey', display: 'flex', justifyContent: 'center' }}>
                                    <img src={formData.logolink} alt="Logo Preview" style={{ maxHeight: 100 }} onError={(e) => e.target.style.display = 'none'} />
                                </Box>
                            </Grid>
                        )}

                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<Save />}
                                onClick={handleSave}
                            >
                                Save Configuration
                            </Button>
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// --- Main Page Component with Layout ---
const SchoolConfigPageds = () => {
    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const name = global1.name;
    // const institution = global1.institution;

    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBarStyled position="absolute" open={open}>
                    <Toolbar sx={{ pr: '24px' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer}
                            sx={{
                                marginRight: '36px',
                                ...(open && { display: 'none' }),
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography
                            component="h1"
                            variant="h6"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            School Configuration
                        </Typography>
                        <IconButton color="inherit">
                            <Badge color="inherit">
                                <Link to="/Login" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Typography variant="body1">Sign out</Typography>
                                </Link>
                            </Badge>
                        </IconButton>
                    </Toolbar>
                </AppBarStyled>
                <DrawerStyled variant="permanent" open={open}>
                    <Toolbar
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            px: [1],
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="body1"
                            color="inherit"
                            noWrap
                            sx={{ flexGrow: 1 }}
                        >
                            {name}
                        </Typography>
                        <IconButton onClick={toggleDrawer}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Toolbar>
                    <Divider />
                    <List>
                        {mainListItems({ open })}
                    </List>
                    <Divider />
                    {/* <List>{secondaryListItems}</List> */}
                </DrawerStyled>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <ConfigForm />
                        </Paper>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default SchoolConfigPageds;
