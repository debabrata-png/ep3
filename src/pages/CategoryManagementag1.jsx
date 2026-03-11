import React, { useState, useEffect } from "react";
import {
    Container,
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    CircularProgress,
    Tooltip,
    Autocomplete,
    Chip
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, CloudUpload as UploadIcon, Download as DownloadIcon, FileDownload as ExportIcon } from "@mui/icons-material";
import * as XLSX from "xlsx";
import ep1 from "../api/ep1";
import global1 from "./global1";

const CategoryManagementag1 = () => {
    const [categories, setCategories] = useState([]);
    const [counselorOptions, setCounselorOptions] = useState([]);
    const [counselorLoading, setCounselorLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [formData, setFormData] = useState({
        id: "",
        category_name: "",
        category_code: "",
        education_qualification: "",
        description: "",
        counsellors: []
    });

    const fileInputRef = React.useRef(null);
    const [uploadDialog, setUploadDialog] = useState({ open: false, total: 0, current: 0, success: 0, failed: 0 });

    useEffect(() => {
        if (global1.colid) {
            fetchCategories();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await ep1.get('/api/v2/getallcategoriesag1', { params: { colid: global1.colid } });
            setCategories(res.data.data || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
            showSnackbar("Failed to fetch categories. Please try again.", "error");
        }
        setLoading(false);
    };

    const handleSearchCounselors = async (event, query) => {
        if (!query) {
            setCounselorOptions([]);
            return;
        }
        setCounselorLoading(true);
        try {
            const res = await ep1.get("/api/v2/searchusersds", {
                params: { colid: global1.colid, query },
            });
            if (res.data.success) {
                setCounselorOptions(res.data.data);
            }
        } catch (err) {
            console.error("Error searching counselors:", err);
        }
        setCounselorLoading(false);
    };

    const handleOpenDialog = (category = null) => {
        if (category) {
            // Map existing DB counsellors to the objects needed by Autocomplete
            const mappedCounsellors = (category.counsellors || []).map(c => ({
                name: c.counsellor_name,
                email: c.counsellor_email
            }));

            setFormData({
                id: category._id,
                category_name: category.category_name,
                category_code: category.category_code,
                education_qualification: category.education_qualification || "",
                description: category.description || "",
                counsellors: mappedCounsellors
            });
            setIsEditing(true);
        } else {
            setFormData({
                id: "",
                category_name: "",
                category_code: "",
                education_qualification: "",
                description: "",
                counsellors: []
            });
            setIsEditing(false);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormData({ id: "", category_name: "", category_code: "", education_qualification: "", description: "", counsellors: [] });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCounsellorsChange = (event, newValue) => {
        setFormData(prev => ({ ...prev, counsellors: newValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Format counsellors for the backend schema
        const formattedCounsellors = formData.counsellors.map(c => ({
            counsellor_name: c.name,
            counsellor_email: c.email,
            is_active: 'Yes'
        }));

        setSubmitting(true);
        try {
            if (isEditing) {
                await ep1.post('/api/v2/updatecategoryag1', {
                    id: formData.id,
                    colid: global1.colid,
                    ...formData,
                    counsellors: formattedCounsellors
                });
                showSnackbar("Category updated successfully", "success");
            } else {
                await ep1.post('/api/v2/createcategoryag1', {
                    colid: global1.colid,
                    created_by: global1.user,
                    ...formData,
                    counsellors: formattedCounsellors
                });
                showSnackbar("Category added successfully", "success");
            }
            fetchCategories();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving category:", error);
            const errorMsg = error.response?.data?.message || "Failed to save category";
            showSnackbar(errorMsg, "error");
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            await ep1.get(`/api/v2/deletecategoryag1/${id}`);
            showSnackbar("Category deleted successfully", "success");
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category:", error);
            showSnackbar(error.response?.data?.message || "Failed to delete category", "error");
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleDownloadTemplate = () => {
        const templateData = [
            {
                "Category Name": "Engineering",
                "Category Code": "ENG-101",
                "Education Qualification": "12th Pass",
                "Description": "Four year degree program"
            },
        ];
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Categories Template");
        XLSX.writeFile(wb, "Category_Import_Template.xlsx");
    };

    const handleExport = () => {
        if (categories.length === 0) {
            showSnackbar("No categories available to export.", "error");
            return;
        }
        const exportData = categories.map(cat => ({
            "Category Name": cat.category_name,
            "Category Code": cat.category_code,
            "Education Qualification": cat.education_qualification,
            "Description": cat.description,
            "Active Counsellors": (cat.counsellors || []).map(c => c.counsellor_name).join(", ")
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, "Categories_Export.xlsx");
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: "binary" });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                processBulkUpload(data);
            } catch (error) {
                console.error("Error reading excel file", error);
                showSnackbar("Error parsing the excel file. Please check format.", "error");
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = null; // reset input
    };

    const processBulkUpload = async (data) => {
        if (!data || data.length === 0) {
            showSnackbar("The uploaded file is empty.", "warning");
            return;
        }

        setUploadDialog({ open: true, total: data.length, current: 0, success: 0, failed: 0 });

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Expected columns from template
            const payload = {
                category_name: row["Category Name"],
                category_code: row["Category Code"],
                education_qualification: row["Education Qualification"],
                description: row["Description"],
                colid: global1.colid,
                created_by: global1.user,
                counsellors: [] // Defaults to empty list in bulk upload
            };

            if (!payload.category_name) {
                failedCount++;
                setUploadDialog(prev => ({ ...prev, current: i + 1, failed: failedCount }));
                continue;
            }

            try {
                await ep1.post('/api/v2/createcategoryag1', payload);
                successCount++;
            } catch (err) {
                console.error("Failed to upload row:", row, err);
                failedCount++;
            }

            setUploadDialog(prev => ({ ...prev, current: i + 1, success: successCount, failed: failedCount }));
        }

        fetchCategories();
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="600" color="primary">
                    Category Management
                </Typography>
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadTemplate}
                    >
                        Template
                    </Button>
                    <Button
                        variant="outlined"
                        color="info"
                        startIcon={<ExportIcon />}
                        onClick={handleExport}
                    >
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        component="label"
                        startIcon={<UploadIcon />}
                        sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
                    >
                        Import
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
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Category
                    </Button>
                </Box>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    {loading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Table>
                            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><strong>S NO</strong></TableCell>
                                    <TableCell><strong>Category Name</strong></TableCell>
                                    <TableCell><strong>Internal Code</strong></TableCell>
                                    <TableCell><strong>Education Qualification</strong></TableCell>
                                    <TableCell><strong>Counsellors</strong></TableCell>
                                    <TableCell><strong>Description</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.length > 0 ? (
                                    categories.map((cat, index) => (
                                        <TableRow key={cat._id} hover>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{cat.category_name}</TableCell>
                                            <TableCell>{cat.category_code}</TableCell>
                                            <TableCell>{cat.education_qualification || "N/A"}</TableCell>
                                            <TableCell>
                                                {cat.counsellors && cat.counsellors.length > 0 ? (
                                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                                        {cat.counsellors.map((c, i) => (
                                                            <Chip key={i} label={c.counsellor_name} size="small" variant="outlined" color="primary" />
                                                        ))}
                                                    </Box>
                                                ) : "None"}
                                            </TableCell>
                                            <TableCell>{cat.description || "N/A"}</TableCell>
                                            <TableCell>
                                                <Tooltip title="Edit">
                                                    <IconButton color="primary" onClick={() => handleOpenDialog(cat)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton color="error" onClick={() => handleDelete(cat._id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No categories found. Click "Add Category" to create one.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditing ? "Edit Category" : "Add New Category"}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <TextField
                            fullWidth
                            label="Category Name"
                            name="category_name"
                            value={formData.category_name}
                            onChange={handleChange}
                            required
                            margin="normal"
                            variant="outlined"
                        />
                        <TextField
                            fullWidth
                            label="Category Code (Unique)"
                            name="category_code"
                            value={formData.category_code}
                            onChange={handleChange}
                            required
                            margin="normal"
                            variant="outlined"
                            disabled={isEditing}
                            helperText={isEditing ? "Category code cannot be changed after creation" : ""}
                        />
                        <TextField
                            fullWidth
                            label="Education Qualification (e.g., After 12th)"
                            name="education_qualification"
                            value={formData.education_qualification}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                        />

                        <Autocomplete
                            multiple
                            options={counselorOptions}
                            loading={counselorLoading}
                            onInputChange={handleSearchCounselors}
                            filterOptions={(x) => x}
                            getOptionLabel={(option) => option.name ? `${option.name} (${option.email})` : option.email}
                            isOptionEqualToValue={(option, value) => option.email === value.email}
                            value={formData.counsellors}
                            onChange={handleCounsellorsChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="normal"
                                    variant="outlined"
                                    label="Assign Counsellors"
                                    placeholder="Select users"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        variant="outlined"
                                        label={option.name}
                                        {...getTagProps({ index })}
                                        color="primary"
                                        size="small"
                                    />
                                ))
                            }
                        />

                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitting}
                        >
                            {submitting ? <CircularProgress size={24} color="inherit" /> : (isEditing ? "Update" : "Save")}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Bulk Upload Progress Dialog */}
            <Dialog open={uploadDialog.open} disableEscapeKeyDown>
                <DialogTitle>Uploading Categories...</DialogTitle>
                <DialogContent>
                    <Box sx={{ minWidth: 300, py: 2 }}>
                        <Typography variant="body1" gutterBottom>
                            Processing {uploadDialog.current} of {uploadDialog.total}
                        </Typography>
                        <Typography variant="body2" color="success.main">
                            Successful: {uploadDialog.success}
                        </Typography>
                        <Typography variant="body2" color="error.main" gutterBottom>
                            Failed: {uploadDialog.failed}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <CircularProgress variant="determinate" value={uploadDialog.total > 0 ? (uploadDialog.current / uploadDialog.total) * 100 : 0} />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setUploadDialog(prev => ({ ...prev, open: false }))}
                        disabled={uploadDialog.current < uploadDialog.total}
                        color="primary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default CategoryManagementag1;
