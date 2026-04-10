import React, { useState, useEffect } from 'react';
import {
  Box, Button, Typography, Paper, Tooltip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Task as TaskIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useSnackbar } from 'notistack';
import ep1 from '../api/ep1';
import global1 from './global1';

const DepartmentIndentds = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    departmentname: '',
    institution: '',
    institutionshort: '',
    hoiapprovername: '',
    hoiapproveruserid: '',
    ahoiapprovername: '',
    ahoiapproveruserid: '',
    creatorname: '',
    creatoruserid: '',
    colid: '',
    status: 'Active'
  });
  const [selectedId, setSelectedId] = useState(null);

  const { colid, user, name } = global1;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await ep1.post('/api/v2/getdepartmentindentds', { colid });
      if (response.data.success) {
        setRows(response.data.data.map((item, index) => ({ ...item, id: item._id || index })));
      }
    } catch (error) {
      enqueueSnackbar('Failed to fetch data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditMode(true);
      setSelectedId(item._id);
      setFormData({
        ahoiapproveruserid: item.ahoiapproveruserid || '',
        remarks: item.remarks || '',
        creatorname: item.creatorname || '',
        creatoruserid: item.creatoruserid || '',
        colid: item.colid || '',
        status: item.status || 'Pending'
      });
    } else {
      setEditMode(false);
      setFormData({
        departmentname: '',
        institution: '',
        institutionshort: '',
        hoiapprovername: '',
        hoiapproveruserid: '',
        ahoiapprovername: '',
        ahoiapproveruserid: '',
        remarks: '',
        creatorname: name,
        creatoruserid: user,
        colid: colid,
        status: 'Active'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        user: user, // System mandatory user from session
        name: name, // System mandatory name from session
        colid: colid // System mandatory colid from session
      };

      if (editMode) {
        await ep1.post('/api/v2/updatedepartmentindentds', { ...payload, id: selectedId });
        enqueueSnackbar('Updated successfully', { variant: 'success' });
      } else {
        await ep1.post('/api/v2/adddepartmentindentds', payload);
        enqueueSnackbar('Added successfully', { variant: 'success' });
      }
      handleClose();
      fetchData();
    } catch (error) {
      enqueueSnackbar('Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await ep1.post('/api/v2/deletedepartmentindentds', { id });
        enqueueSnackbar('Deleted successfully', { variant: 'success' });
        fetchData();
      } catch (error) {
        enqueueSnackbar('Delete failed', { variant: 'error' });
      }
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      try {
        setLoading(true);
        await ep1.post('/api/v2/bulkdepartmentindentds', {
          data,
          colid,
          user,
          name: name
        });
        enqueueSnackbar('Bulk upload successful', { variant: 'success' });
        fetchData();
      } catch (error) {
        enqueueSnackbar('Bulk upload failed', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [{
      departmentname: 'CSE',
      institution: 'Example University',
      institutionshort: 'EU',
      creatorname: name,
      creatoruserid: user,
      hoiapprovername: 'Approver Name',
      hoiapproveruserid: 'approver@email.com',
      ahoiapprovername: 'Asst. Approver',
      ahoiapproveruserid: 'asst@email.com',
      remarks: 'Sample bulk upload',
      status: 'Active'
    }];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "department_indent_template.xlsx");
  };

  const exportData = () => {
    if (rows.length === 0) {
      enqueueSnackbar('No data to export', { variant: 'info' });
      return;
    }

    const exportRows = rows.map(r => ({
      'Name': r.name,
      'Department': r.departmentname,
      'Institution': r.institution,
      'Creator Name': r.creatorname,
      'Creator ID': r.creatoruserid,
      'HOI Approver': r.hoiapprovername,
      'Assistant HOI': r.ahoiapprovername,
      'Status': r.status,
      'Remarks': r.remarks
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Department Indents");
    XLSX.writeFile(wb, "department_indents_export.xlsx");
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'departmentname', headerName: 'Department', width: 150 },
    { field: 'institution', headerName: 'Institution', width: 150 },
    {
      field: 'status', headerName: 'Status', width: 120, renderCell: (params) => (
        <Typography variant="body2" sx={{
          color: params.value === 'Pending' ? 'orange' : 'green',
          fontWeight: 'bold'
        }}>
          {params.value}
        </Typography>
      )
    },
    { field: 'creatorname', headerName: 'Creator', width: 150 },
    { field: 'creatoruserid', headerName: 'Creator ID', width: 200 },
    { field: 'hoiapprovername', headerName: 'HOI Approver', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleOpen(params.row)} color="primary" size="small">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row._id)} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">Department Indent Management</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{ borderRadius: 20 }}
            >
              Add New
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<FileUploadIcon />}
              sx={{ borderRadius: 20 }}
            >
              Bulk Upload
              <input type="file" hidden accept=".xlsx, .xls" onChange={handleBulkUpload} />
            </Button>
            <Tooltip title="Download Template">
              <IconButton onClick={downloadTemplate} color="info">
                <TaskIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Data">
              <IconButton onClick={exportData} color="success">
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#ecf0f1',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: '#f8f9fa',
              },
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
            }}
          />
        </Box>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          {editMode ? 'Edit Department Indent' : 'Add New Department Indent'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Creator Name" name="creatorname" value={formData.creatorname} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Creator User ID" name="creatoruserid" value={formData.creatoruserid} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Department Name" name="departmentname" value={formData.departmentname} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Institution" name="institution" value={formData.institution} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Institution Short Name" name="institutionshort" value={formData.institutionshort} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="HOI Approver Name" name="hoiapprovername" value={formData.hoiapprovername} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="HOI Approver User ID" name="hoiapproveruserid" value={formData.hoiapproveruserid} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="AHOI Approver Name" name="ahoiapprovername" value={formData.ahoiapprovername} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="AHOI Approver User ID" name="ahoiapproveruserid" value={formData.ahoiapproveruserid} onChange={handleInputChange} margin="dense" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Remarks" name="remarks" value={formData.remarks} onChange={handleInputChange} margin="dense" multiline rows={3} />
            </Grid>
            {editMode && (
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth 
                  select 
                  label="Status" 
                  name="status" 
                  value={formData.status} 
                  onChange={handleInputChange} 
                  margin="dense"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentIndentds;
