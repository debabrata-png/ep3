import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  PersonAdd as AddCounsellorIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Categoryds = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCounsellorDialog, setOpenCounsellorDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef(null);

  // User Search State
  const [userOptions, setUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    category_name: "",
    category_code: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcategoriesds", {
        params: { colid: global1.colid },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      showSnackbar("Failed to fetch categories", "error");
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        "Category Name": "",
        "Category Code": "",
        Description: "",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "category_template.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      processBulkUpload(data);
    };
    reader.readAsBinaryString(file);
    e.target.value = null;
  };

  const processBulkUpload = async (data) => {
    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        const payload = {
          category_name: row["Category Name"],
          category_code: row["Category Code"],
          description: row["Description"],
          colid: global1.colid,
          created_by: global1.user,
        };

        if (!payload.category_name || !payload.category_code) {
          console.warn("Skipping invalid row:", row);
          errorCount++;
          continue;
        }

        await ep1.post("/api/v2/createcategoryds", payload);
        successCount++;
      } catch (err) {
        console.error("Error uploading row:", row, err);
        errorCount++;
      }
    }

    if (successCount > 0) {
      fetchCategories();
      showSnackbar(`Successfully uploaded ${successCount} categories. ${errorCount > 0 ? `Failed: ${errorCount}` : ""}`, "success");
    } else {
      showSnackbar(`Upload failed. Success: ${successCount}, Failed: ${errorCount}`, "error");
    }
  };


  const handleSearchUsers = async (query) => {
    if (!query) {
      setUserOptions([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const res = await ep1.get("/api/v2/searchusersds", {
        params: { query, colid: global1.colid }
      });
      setUserOptions(res.data.data);
    } catch (err) {
      console.error("Error searching users:", err);
    }
    setLoadingUsers(false);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditMode(true);
      setCurrentCategory(category);
      setFormData({
        category_name: category.category_name,
        category_code: category.category_code,
        description: category.description || "",
      });
    } else {
      setEditMode(false);
      setCurrentCategory(null);
      setFormData({
        category_name: "",
        category_code: "",
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      category_name: "",
      category_code: "",
      description: "",
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        colid: global1.colid,
        created_by: global1.user,
      };

      if (editMode) {
        await ep1.post("/api/v2/updatecategoryds", payload, {
          params: { id: currentCategory._id },
        });
        showSnackbar("Category updated successfully", "success");
      } else {
        await ep1.post("/api/v2/createcategoryds", payload);
        showSnackbar("Category created successfully", "success");
      }

      fetchCategories();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving category:", err);
      showSnackbar("Failed to save category", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await ep1.get(`/api/v2/deletecategoryds/${id}`);
        showSnackbar("Category deleted successfully", "success");
        fetchCategories();
      } catch (err) {
        console.error("Error deleting category:", err);
        showSnackbar("Failed to delete category", "error");
      }
    }
  };

  const handleOpenCounsellorDialog = (category) => {
    setCurrentCategory(category);
    setSelectedUser(null);
    setUserOptions([]);
    setOpenCounsellorDialog(true);
  };

  const handleAddCounsellor = async () => {
    if (!selectedUser) {
      showSnackbar("Please select a user", "warning");
      return;
    }
    try {
      await ep1.post("/api/v2/addcounsellortocategoryds", {
        counsellor_name: selectedUser.name,
        counsellor_email: selectedUser.email,
        id: currentCategory._id
      });
      showSnackbar("Counsellor added successfully", "success");
      fetchCategories();
      setOpenCounsellorDialog(false);
    } catch (err) {
      console.error("Error adding counsellor:", err);
      showSnackbar("Failed to add counsellor", "error");
    }
  };

  const handleRemoveCounsellor = async (categoryId, counsellorEmail) => {
    if (window.confirm("Remove this counsellor from category?")) {
      try {
        // Updated to use POST and send email in body
        await ep1.post(`/api/v2/removecounsellorfromcategoryds/${categoryId}`, {
          counsellor_email: counsellorEmail
        });
        showSnackbar("Counsellor removed successfully", "success");
        fetchCategories();
      } catch (err) {
        console.error("Error removing counsellor:", err);
        showSnackbar("Failed to remove counsellor", "error");
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    { field: "category_name", headerName: "Category Name", width: 200 },
    { field: "category_code", headerName: "Category Code", width: 150 },
    {
      field: "counsellors",
      headerName: "Counsellors",
      width: 400,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: 'center', height: '100%' }}>
          {params.row.counsellors?.map((counsellor, idx) => (
            <Chip
              key={idx}
              label={counsellor.counsellor_name}
              size="small"
              onDelete={() => handleRemoveCounsellor(params.row._id, counsellor.counsellor_email)}
              sx={{
                bgcolor: "#e0f2fe",
                color: "#0284c7",
                fontWeight: 500,
                "& .MuiChip-deleteIcon": { color: "#0284c7", "&:hover": { color: "#0369a1" } }
              }}
            />
          ))}
          <IconButton
            size="small"
            onClick={() => handleOpenCounsellorDialog(params.row)}
            sx={{
              bgcolor: "#f0fdf4",
              color: "#16a34a",
              "&:hover": { bgcolor: "#dcfce7" }
            }}
          >
            <AddCounsellorIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    { field: "description", headerName: "Description", width: 300 },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={() => handleOpenDialog(params.row)}
            sx={{ color: "#3b82f6", bgcolor: "rgba(59, 130, 246, 0.1)", "&:hover": { bgcolor: "rgba(59, 130, 246, 0.2)" } }}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row._id)}
            sx={{ color: "#ef4444", bgcolor: "rgba(239, 68, 68, 0.1)", "&:hover": { bgcolor: "rgba(239, 68, 68, 0.2)" } }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => navigate("/dashboardcrmds")}
            sx={{
              mr: 2,
              bgcolor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              "&:hover": { bgcolor: "#f8fafc" }
            }}
          >
            <BackIcon sx={{ color: "#1e293b" }} />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
            Category & Counsellor Management
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            sx={{
              borderColor: "#1565c0",
              color: "#1565c0",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#0d47a1", bgcolor: "rgba(21, 101, 192, 0.04)" }
            }}
          >
            Download Template
          </Button>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            sx={{
              bgcolor: "#2e7d32",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
              "&:hover": { bgcolor: "#1b5e20" }
            }}
          >
            Bulk Upload
            <input
              type="file"
              hidden
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              bgcolor: "#1565c0",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(21, 101, 192, 0.2)",
              "&:hover": { bgcolor: "#0d47a1" }
            }}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: "100%", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <DataGrid
          rows={categories}
          columns={columns}
          getRowId={(row) => row._id}
          slots={{ toolbar: GridToolbar }}
          rowHeight={80}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f8fafc",
              color: "#475569",
              fontWeight: 600,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f8fafc",
            },
          }}
        />
      </Paper>

      {/* Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={formData.category_name}
            onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Category Code"
            value={formData.category_code}
            onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Counsellor Dialog */}
      <Dialog open={openCounsellorDialog} onClose={() => setOpenCounsellorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Counsellor to {currentCategory?.category_name}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Autocomplete
            options={userOptions}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            loading={loadingUsers}
            value={selectedUser}
            onChange={(event, newValue) => setSelectedUser(newValue)}
            onInputChange={(event, newInputValue) => {
              handleSearchUsers(newInputValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search User"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCounsellorDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCounsellor} variant="contained" disabled={!selectedUser}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default Categoryds;
