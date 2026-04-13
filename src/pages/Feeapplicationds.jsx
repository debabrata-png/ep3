import React, { useState, useEffect, useRef } from "react";
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
  CssBaseline,
  AppBar,
  Toolbar,
  Drawer,
  Divider,
  List,
  Badge,
} from "@mui/material";
import {
  createTheme,
  ThemeProvider,
  styled
} from '@mui/material/styles';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";
import { mainListItems, secondaryListItems } from "./menucas1";

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

const Feeapplicationds = () => {
  const [open, setOpen] = useState(true);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    programcode: "",
    feegroup: "",
    semester: "",
    feeeitem: "",
    academicyear: "",
    feecategory: "",
    studtype: "Regular",
    domicile: "Inside",
    feetype: "Standard",
    amount: "",
    status: "Active",
    classdate: new Date().toISOString().split('T')[0]
  });

  const fileInputRef = useRef(null);
  const toggleDrawer = () => setOpen(!open);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await ep1.post("/api/v2/getfeeapplicationds", { colid: global1.colid });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      showSnackbar("Failed to fetch data", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async () => {
    try {
      const payload = { 
        ...formData, 
        colid: global1.colid,
        name: global1.name,
        user: global1.user
      };
      let res;
      if (editMode) {
        res = await ep1.post("/api/v2/updatefeeapplicationds", { 
          ...payload, 
          id: formData._id,
          colid: global1.colid,
          name: global1.name,
          user: global1.user
        });
      } else {
        res = await ep1.post("/api/v2/createfeeapplicationds", {
          ...payload,
          colid: global1.colid,
          name: global1.name,
          user: global1.user
        });
      }

      if (res.data.success) {
        showSnackbar(editMode ? "Updated successfully" : "Created successfully");
        setOpenDialog(false);
        fetchData();
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await ep1.post("/api/v2/deletefeeapplicationds", { id, colid: global1.colid });
      if (res.data.success) {
        showSnackbar("Deleted successfully");
        fetchData();
      }
    } catch (err) {
      showSnackbar("Delete failed", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws);

        const mappedData = json.map(row => ({
          ...row,
          colid: global1.colid,
          name: global1.name,
          user: global1.user,
          classdate: row.classdate || new Date().toISOString().split('T')[0]
        }));

        const res = await ep1.post("/api/v2/bulkfeeapplicationds", {
          data: mappedData,
          colid: global1.colid,
          name: global1.name,
          user: global1.user
        });

        if (res.data.success) {
          showSnackbar("Bulk upload successful");
          fetchData();
        }
      } catch (err) {
        showSnackbar("Bulk upload failed: " + err.message, "error");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const columns = [
    { field: "programcode", headerName: "Program", width: 120 },
    { field: "feegroup", headerName: "Fee Group", width: 150 },
    { field: "feeeitem", headerName: "Fee Item", width: 150 },
    { field: "semester", headerName: "Sem", width: 80 },
    { field: "academicyear", headerName: "Year", width: 100 },
    { 
      field: "classdate", 
      headerName: "Due Date", 
      width: 130,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'NA'
    },
    { field: "amount", headerName: "Amount", width: 100, type: "number" },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => {
            setFormData(params.row);
            setEditMode(true);
            setOpenDialog(true);
          }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
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
              Application Fee Configuration
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
                color="success"
                style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    programcode: "", feegroup: "", semester: "",
                    feeeitem: "", academicyear: "", feecategory: "", studtype: "Regular",
                    domicile: "Inside", feetype: "Standard", amount: "", status: "Active",
                    classdate: new Date().toISOString().split('T')[0]
                  });
                  setOpenDialog(true);
                }}
              >
                Add 
              </Button>
              <Button
                variant="contained"
                color="success"
                style={{ padding: '5px 10px', marginRight: '4px', fontSize: '12px', height: '30px', width: '80px' }}
                onClick={() => fileInputRef.current.click()}
              >
                Bulk
              </Button>
              <Button
                variant="contained"
                color="primary"
                style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
                onClick={() => {
                  const ws = XLSX.utils.json_to_sheet(data);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Fees');
                  XLSX.writeFile(wb, "application_fees.xlsx");
                }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                color="secondary"
                style={{ padding: '5px 10px', fontSize: '12px', marginRight: '4px', height: '30px', width: '80px' }}
                onClick={fetchData}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                color="info"
                style={{ padding: '5px 10px', fontSize: '12px', height: '30px', width: '90px' }}
                onClick={() => {
                  const baseUrl = global1.backendurl || ep1.defaults.baseURL || 'http://localhost:3000';
                  window.open(`${baseUrl}/api/v2/templatefeeapplicationds`, '_blank');
                }}
              >
                Template
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={5} sx={{ p: 2, display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <DataGrid
                    rows={data}
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
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
            />

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
              <DialogTitle>{editMode ? "Edit Application Fee" : "Add Application Fee"}</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Program Code" value={formData.programcode} onChange={(e) => setFormData({...formData, programcode: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Fee Group" value={formData.feegroup} onChange={(e) => setFormData({...formData, feegroup: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Fee Item" value={formData.feeeitem} onChange={(e) => setFormData({...formData, feeeitem: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Semester" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Academic Year" value={formData.academicyear} onChange={(e) => setFormData({...formData, academicyear: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Fee Category" value={formData.feecategory} onChange={(e) => setFormData({...formData, feecategory: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField fullWidth label="Amount" type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField 
                      fullWidth 
                      label="Due Date" 
                      type="date" 
                      InputLabelProps={{ shrink: true }}
                      value={formData.classdate} 
                      onChange={(e) => setFormData({...formData, classdate: e.target.value})} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField select fullWidth label="Status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Save</Button>
              </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}>
              <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Feeapplicationds;
