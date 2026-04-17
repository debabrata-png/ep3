import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as AttendIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarExport,
} from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import ep1 from "../api/ep1";
import global1 from "./global1";

const CustomToolbar = () => {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter debounceMs={500} />
      <Box sx={{ flexGrow: 1 }} />
      <GridToolbarExport />
    </GridToolbarContainer>
  );
};

const CrmQueueSystemds = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0); // 0: Waiting, 1: Attended
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchLeads();
  }, [tabValue]);

  const fetchLeads = async () => {
    if (!global1.colid) {
      console.warn("CRM Queue: colid is missing in global1. Ensure you are logged in.");
      // showSnackbar("Organization ID missing. Please log in again.", "warning");
      // return;
    }

    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        user: global1.user,
        role: global1.role,
        attendentstatus: tabValue === 0 ? "No" : "Yes",
      };
      console.log("Fetching leads with params:", params);
      const res = await ep1.get("/api/v2/getallleadsds", { params });
      if (res.data.success) {
        setLeads(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching leads:", err);
      showSnackbar("Failed to fetch leads", "error");
    }
    setLoading(false);
  };

  const handleMarkAttended = async (id) => {
    if (!window.confirm("Mark this lead as attended?")) return;

    try {
      const payload = {
        id,
        attendername: global1.name,
        attenderemail: global1.user,
      };
      const res = await ep1.post("/api/v2/markleadasattendedds", payload);
      if (res.data.success) {
        showSnackbar("Lead marked as attended", "success");
        fetchLeads(); // Refresh list
      }
    } catch (err) {
      console.error("Error marking lead attended:", err);
      showSnackbar("Failed to update status", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    {
      field: "lead_score",
      headerName: "Score",
      width: 80,
      renderCell: (params) => (
        <Chip 
          label={params.value || 0} 
          size="small" 
          color={params.value > 40 ? "error" : params.value > 20 ? "warning" : "default"} 
          sx={{ fontWeight: "bold" }}
        />
      )
    },
    {
      field: "name",
      headerName: "Name",
      width: 180,
      renderCell: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
          {params.value}
        </Typography>
      )
    },
    { field: "phone", headerName: "Phone", width: 130 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "category", headerName: "Category", width: 130 },
    { field: "program", headerName: "Program", width: 180 },
    { field: "city", headerName: "City", width: 120 },
    { field: "state", headerName: "State", width: 120 },
    { field: "source", headerName: "Source", width: 120 },
    { field: "assignedto", headerName: "Assigned To", width: 180 },
    { 
      field: "pipeline_stage", 
      headerName: "Stage", 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          size="small" 
          variant="outlined" 
          color="primary"
        />
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {tabValue === 0 && (
            <Tooltip title="Mark Attended">
              <IconButton 
                size="small" 
                color="success" 
                onClick={() => handleMarkAttended(params.row._id)}
              >
                <AttendIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="View Details">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => navigate(`/leaddetailds/${params.row._id}`)}
            >
              <ViewIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Lead Queue System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage lead arrivals and counselings in real-time
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchLeads}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider", px: 2, bgcolor: "#f8fafc" }}
        >
          <Tab label="Waiting Queue" sx={{ fontWeight: 600 }} />
          <Tab label="Attended List" sx={{ fontWeight: 600 }} />
        </Tabs>

        <Box sx={{ height: 600, width: "100%", p: 2 }}>
          <DataGrid
            rows={leads}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            density="compact"
            slots={{ toolbar: CustomToolbar }}
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            sx={{
              border: "none",
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f1f5f9",
                color: "#475569",
                fontWeight: 700,
              },
              "& .MuiDataGrid-cell:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CrmQueueSystemds;
