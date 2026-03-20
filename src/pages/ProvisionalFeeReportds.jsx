import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  CssBaseline,
  AppBar,
  Toolbar,
  Drawer,
  Divider,
  List,
  Badge,
  Grid,
} from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  styled
} from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { mainListItems, secondaryListItems } from "./menucas1";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

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

const ProvisionalFeeReportds = () => {
  const [open, setOpen] = useState(true);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const toggleDrawer = () => setOpen(!open);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getprovisionalfeeleadsds", {
        params: { colid: global1.colid }
      });
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      setSnackbar({ open: true, message: "Failed to fetch report", severity: "error" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(leads);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, "provisional_fee_report.xlsx");
  };

  const columns = [
    { field: "name", headerName: "Student Name", width: 200, flex: 1 },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "institution", headerName: "Institution", width: 180 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "source", headerName: "Source", width: 130 },
    { 
      field: "dateofvisit", 
      headerName: "Date of Visit", 
      width: 150,
      valueFormatter: (params) => params.value ? dayjs(params.value).format("DD/MM/YYYY") : "NA"
    },
    { field: "location", headerName: "Location", width: 150 },
    { field: "countercounserloername", headerName: "Counter Counselor", width: 180 },
    { field: "assignedto", headerName: "Assigned To", width: 180 },
  ];

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
            <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              Provisional Fee Report
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
            <Typography component="h1" variant="body1" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              {global1.name}
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
          <List>{secondaryListItems}</List>
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
          <Container maxWidth="100%" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" marginBottom={4} marginTop={2}>
              <Button
                variant="contained"
                color="primary"
                style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '80px' }}
                onClick={fetchLeads}
              >
                Refresh
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <DataGrid
                    rows={leads}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    autoHeight
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    disableRowSelectionOnClick
                  />
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default ProvisionalFeeReportds;
