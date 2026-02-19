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
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Programmasterds = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    category: "",
    course_code: "",
    course_name: "",
    institution: "",
    program_type: "",
    duration: "",
    eligibility: "",
    total_seats: "",
    total_fee: "",
    application_fee: "",
    first_installment: "",
    installments: "",
    brochure_url: "",
    syllabus_url: "",
    placement_highlights: "",
    faculty_info: "",
    accreditation: "",
  });

  useEffect(() => {
    fetchPrograms();
    fetchCategories();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await ep1.get("/api/v2/getallprogramsds", {
        params: { colid: global1.colid },
      });
      setPrograms(res.data.data);
    } catch (err) {
      console.error("Error fetching programs:", err);
      showSnackbar("Failed to fetch programs", "error");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcategoriesds", {
        params: { colid: global1.colid },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Category: "",
        "Program Code": "",
        "Program Name": "",
        Institution: "",
        "Program Type": "",
        "Total Seats": "",
        Duration: "",
        Eligibility: "",
        "Total Fee": "",
        "Application Fee": "",
        "First Installment": "",
        Installments: "",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "program_master_template.xlsx");
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
    // Reset file input
    e.target.value = null;
  };

  const processBulkUpload = async (data) => {
    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        const payload = {
          category: row["Category"],
          course_code: row["Program Code"],
          course_name: row["Program Name"],
          institution: row["Institution"],
          program_type: row["Program Type"],
          total_seats: Number(row["Total Seats"]) || 0,
          duration: row["Duration"],
          eligibility: row["Eligibility"],
          fee_structure: {
            total_fee: Number(row["Total Fee"]) || 0,
            application_fee: Number(row["Application Fee"]) || 0,
            first_installment: Number(row["First Installment"]) || 0,
            installments: Number(row["Installments"]) || 0,
          },
          colid: global1.colid,
          created_by: global1.user,
        };

        if (!payload.category || !payload.course_code || !payload.course_name) {
          console.warn("Skipping invalid row:", row);
          errorCount++;
          continue;
        }

        await ep1.post("/api/v2/createprogrammasterds", payload);
        successCount++;
      } catch (err) {
        console.error("Error uploading row:", row, err);
        errorCount++;
      }
    }

    if (successCount > 0) {
      fetchPrograms();
      showSnackbar(`Successfully uploaded ${successCount} programs. ${errorCount > 0 ? `Failed: ${errorCount}` : ""}`, "success");
    } else {
      showSnackbar(`Upload failed. Success: ${successCount}, Failed: ${errorCount}`, "error");
    }
  };


  const handleOpenDialog = (program = null) => {
    if (program) {
      setEditMode(true);
      setCurrentProgram(program);
      setFormData({
        category: program.category,
        course_code: program.course_code,
        course_name: program.course_name,
        institution: program.institution || "",
        program_type: program.program_type || "",
        total_seats: program.total_seats || "",
        duration: program.duration || "",
        eligibility: program.eligibility || "",
        total_fee: program.fee_structure?.total_fee || "",
        application_fee: program.fee_structure?.application_fee || "",
        first_installment: program.fee_structure?.first_installment || "",
        installments: program.fee_structure?.installments || "",
        brochure_url: program.brochure_url || "",
        syllabus_url: program.syllabus_url || "",
        placement_highlights: program.placement_highlights || "",
        faculty_info: program.faculty_info || "",
        accreditation: program.accreditation || "",
      });
    } else {
      setEditMode(false);
      setCurrentProgram(null);
      setFormData({
        category: "",
        course_code: "",
        course_name: "",
        institution: "",
        program_type: "",
        total_seats: "",
        duration: "",
        eligibility: "",
        total_fee: "",
        application_fee: "",
        first_installment: "",
        installments: "",
        brochure_url: "",
        syllabus_url: "",
        placement_highlights: "",
        faculty_info: "",
        accreditation: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        category: formData.category,
        course_code: formData.course_code,
        course_name: formData.course_name,
        institution: formData.institution,
        program_type: formData.program_type,
        total_seats: Number(formData.total_seats),
        duration: formData.duration,
        eligibility: formData.eligibility,
        fee_structure: {
          total_fee: Number(formData.total_fee),
          application_fee: Number(formData.application_fee),
          first_installment: Number(formData.first_installment),
          installments: Number(formData.installments),
        },
        brochure_url: formData.brochure_url,
        syllabus_url: formData.syllabus_url,
        placement_highlights: formData.placement_highlights,
        faculty_info: formData.faculty_info,
        accreditation: formData.accreditation,
        colid: global1.colid,
        created_by: global1.user,
      };

      if (editMode) {
        await ep1.post("/api/v2/updateprogrammasterds", payload, {
          params: { id: currentProgram._id },
        });
        showSnackbar("Program updated successfully", "success");
      } else {
        await ep1.post("/api/v2/createprogrammasterds", payload);
        showSnackbar("Program created successfully", "success");
      }

      fetchPrograms();
      handleCloseDialog();
    } catch (err) {
      console.error("Error saving program:", err);
      showSnackbar("Failed to save program", "error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this program?")) {
      try {
        await ep1.get(`/api/v2/deleteprogrammasterds/${id}`);
        showSnackbar("Program deleted successfully", "success");
        fetchPrograms();
      } catch (err) {
        console.error("Error deleting program:", err);
        showSnackbar("Failed to delete program", "error");
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const columns = [
    { field: "category", headerName: "Category", width: 150 },
    { field: "course_code", headerName: "Program Code", width: 120 },
    { field: "course_name", headerName: "Program Name", width: 200 },
    { field: "institution", headerName: "Institution", width: 150 },
    { field: "program_type", headerName: "Program Type", width: 130 },
    { field: "total_seats", headerName: "Total Seats", width: 100 },
    { field: "duration", headerName: "Duration", width: 100 },
    { field: "eligibility", headerName: "Eligibility", width: 150 },
    {
      field: "total_fee",
      headerName: "Total Fee",
      width: 120,
      valueGetter: (params) => params.row.fee_structure?.total_fee,
      valueFormatter: (params) => {
        if (params.value == null) {
          return "";
        }
        return `₹${params.value.toLocaleString()}`;
      },
    },
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
    <Container maxWidth="xl" sx={{ mt: 6, mb: 6 }}>
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
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>Program Master</Typography>
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
            Add Program
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 600, width: "100%", borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <DataGrid
          rows={programs}
          columns={columns}
          getRowId={(row) => row._id}
          slots={{ toolbar: GridToolbar }}
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

      {/* Program Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? "Edit Program" : "Add Program"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat.category_name}>
                  {cat.category_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Program Code"
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Program Name"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            />
            <TextField
              fullWidth
              label="Program Type"
              value={formData.program_type}
              onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
            />
            <TextField
              fullWidth
              label="Total Sanctioned Seats"
              type="number"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
            />
            <TextField
              fullWidth
              label="Duration (e.g., 3 Years)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
            <TextField
              fullWidth
              label="Eligibility (e.g., 12th Pass)"
              value={formData.eligibility}
              onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
            />
            <Typography variant="h6">Fee Structure</Typography>
            <TextField
              fullWidth
              label="Total Fee"
              type="number"
              value={formData.total_fee}
              onChange={(e) => setFormData({ ...formData, total_fee: e.target.value })}
            />
            <TextField
              fullWidth
              label="Application Fee"
              type="number"
              value={formData.application_fee}
              onChange={(e) => setFormData({ ...formData, application_fee: e.target.value })}
            />
            <TextField
              fullWidth
              label="First Installment"
              type="number"
              value={formData.first_installment}
              onChange={(e) => setFormData({ ...formData, first_installment: e.target.value })}
            />
            <TextField
              fullWidth
              label="Number of Installments"
              type="number"
              value={formData.installments}
              onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
            />
            <TextField
              fullWidth
              label="Brochure URL"
              value={formData.brochure_url}
              onChange={(e) => setFormData({ ...formData, brochure_url: e.target.value })}
            />
            <TextField
              fullWidth
              label="Syllabus URL"
              value={formData.syllabus_url}
              onChange={(e) => setFormData({ ...formData, syllabus_url: e.target.value })}
            />
            <TextField
              fullWidth
              label="Placement Highlights"
              value={formData.placement_highlights}
              onChange={(e) => setFormData({ ...formData, placement_highlights: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Faculty Info"
              value={formData.faculty_info}
              onChange={(e) => setFormData({ ...formData, faculty_info: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Accreditation"
              value={formData.accreditation}
              onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? "Update" : "Create"}
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

export default Programmasterds;
