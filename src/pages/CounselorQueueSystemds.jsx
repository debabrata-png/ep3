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
  TextField,
  MenuItem,
  Card,
  CardContent,
  Grid,
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
import * as XLSX from 'xlsx';
import ep1 from "../api/ep1";
import global1 from "./global1";

const CustomToolbar = ({ onExport }) => {
  return (
    <GridToolbarContainer sx={{ p: 1 }}>
      <GridToolbarQuickFilter debounceMs={500} />
      <Box sx={{ flexGrow: 1 }} />
      <Button
        size="small"
        onClick={onExport}
        startIcon={<RefreshIcon />}
        sx={{ mr: 1 }}
      >
        Export All (Filtered)
      </Button>
      <GridToolbarExport />
    </GridToolbarContainer>
  );
};

const CounselorQueueSystemds = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0); // 0: Waiting, 1: Attended
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [filters, setFilters] = useState({
    search: "",
    pipeline_stage: "All",
    source: "All",
    category: "All",
    startDate: "",
    endDate: "",
  });

  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchLeads(paginationModel.page, paginationModel.pageSize);
  }, [tabValue, paginationModel.page, paginationModel.pageSize]);

  const fetchMetadata = async () => {
    try {
      const [catRes, srcRes] = await Promise.all([
        ep1.get("/api/v2/getallcategoriesag1", { params: { colid: global1.colid } }),
        ep1.get("/api/v2/getallsourcesds", { params: { colid: global1.colid } }),
      ]);

      if (catRes.data.success) setCategories(catRes.data.data);
      if (srcRes.data.success) setSources(srcRes.data.data);
    } catch (err) {
      console.error("Error fetching metadata:", err);
    }
  };

  const fetchLeads = async (page = paginationModel.page, pageSize = paginationModel.pageSize) => {
    if (!global1.colid) return;

    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        user: global1.user,
        role: global1.role,
        assignedto: global1.user, // MUST be assigned to this counselor
        counselor_attendentstatus: tabValue === 0 ? "No" : "Yes", // The new field
        attendentstatus: "Yes", // CampusCounselor MUST have attended it
        landing_page_slug: "campus-enquiry-tuhw3c", // Hardcoded per requirements
        ...filters,
        page: page + 1,
        pageSize: pageSize,
      };

      const res = await ep1.get("/api/v2/getallleadsds", { params });
      if (res.data.success) {
        setLeads(res.data.data);
        setTotalRows(res.data.total || 0);
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
        counselor_email: global1.user,
      };
      const res = await ep1.post("/api/v2/markcounselorattendedds", payload);
      if (res.data.success) {
        showSnackbar("Lead marked as attended", "success");
        fetchLeads(); // Refresh list
      }
    } catch (err) {
      console.error("Error marking lead attended:", err);
      showSnackbar("Failed to update status", "error");
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {
        colid: global1.colid,
        user: global1.user,
        role: global1.role,
        assignedto: global1.user,
        counselor_attendentstatus: tabValue === 0 ? "No" : "Yes",
        attendentstatus: "Yes",
        landing_page_slug: "campus-enquiry-tuhw3c",
        ...filters,
        page: 1,
        pageSize: 10000,
      };

      const res = await ep1.get("/api/v2/getallleadsds", { params });
      if (res.data.success && res.data.data.length > 0) {
        const dataToExport = res.data.data.map(lead => ({
          Name: lead.name,
          Phone: lead.phone,
          Email: lead.email,
          Category: lead.category,
          Program: lead.program,
          Source: lead.source,
          Stage: lead.pipeline_stage,
          City: lead.city,
          State: lead.state,
          Score: lead.lead_score,
          AssignedTo: lead.assignedto,
          CounselorAttended: lead.counselor_attendentstatus || "No",
          CreatedAt: dayjs(lead.createdAt).format("DD MMM YYYY")
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Leads");
        XLSX.writeFile(wb, `Counselor_Queue_${tabValue === 0 ? "Waiting" : "Attended"}_${dayjs().format("YYYY-MM-DD")}.xlsx`);
        showSnackbar("Export successful", "success");
      } else {
        showSnackbar("No data to export", "info");
      }
    } catch (err) {
      console.error("Export error:", err);
      showSnackbar("Failed to export data", "error");
    }
    setLoading(false);
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
            Counselor Lead Queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your assigned leads and counselings
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => fetchLeads()}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters Section */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <SearchIcon size="small" sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Source"
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              >
                <MenuItem value="All">All Sources</MenuItem>
                {sources.map((s) => (
                  <MenuItem key={s._id} value={s.source_name}>{s.source_name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="All">All Categories</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c._id} value={c.category_name}>{c.category_name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Second row for Dates and Action Buttons */}
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => fetchLeads(0)}
                  sx={{ borderRadius: 2, height: 40 }}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setFilters({ search: "", pipeline_stage: "All", source: "All", category: "All", startDate: "", endDate: "" });
                    setTimeout(() => fetchLeads(0), 100);
                  }}
                  sx={{ borderRadius: 2, height: 40 }}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
            paginationMode="server"
            rowCount={totalRows}
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
            slots={{
              toolbar: () => <CustomToolbar onExport={handleExport} />
            }}
            pageSizeOptions={[10, 25, 50, 100]}
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

export default CounselorQueueSystemds;
