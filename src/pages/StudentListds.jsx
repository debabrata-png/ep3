import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  MenuItem,
  Grid,
  Button,
  CircularProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Download } from "@mui/icons-material";
import * as XLSX from "xlsx";
import ep1 from '../api/ep1';
import global1 from './global1';

const StudentListds = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20
  });
  const [totalRows, setTotalRows] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    programcode: '',
    semester: '',
    section: '',
    admissionyear: '',
    search: ''
  });

  // Filter options from database
  const [filterOptions, setFilterOptions] = useState({
    programcodes: [],
    semesters: [],
    sections: [],
    academicyears: []
  });

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await ep1.get('/api/v2/getstudentfilteroptions', {
          params: { colid: global1.colid }
        });
        if (response.data.status === 'Success') {
          setFilterOptions(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    if (global1.colid) {
      fetchFilterOptions();
    }
  }, []);

  // Fetch students
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await ep1.get('/api/v2/getfilteredstudentsds', {
        params: {
          colid: global1.colid,
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
          ...filters
        }
      });

      if (response.data.status === 'Success') {
        setStudents(response.data.data);
        setTotalRows(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (global1.colid) {
      fetchStudents();
    }
  }, [paginationModel, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  const handleClearFilters = () => {
    setFilters({
      programcode: '',
      semester: '',
      section: '',
      admissionyear: '',
      search: ''
    });
  };

  const handleExport = async () => {
    try {
      const response = await ep1.get('/api/v2/getfilteredstudentsds', {
        params: {
          colid: global1.colid,
          // Fetch all for export
          limit: 10000,
          ...filters
        }
      });

      if (response.data.status === 'Success' && response.data.data.length > 0) {
        const ws = XLSX.utils.json_to_sheet(response.data.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "students_export.xlsx");
      } else {
        alert("No data to export");
      }
    } catch (error) {
      console.error('Error exporting students:', error);
      alert("Error exporting data");
    }
  };

  // Define columns for all fields except password, comments, colid, lastlogin
  const columns = [
    { field: 'regno', headerName: 'Reg No', width: 130 },
    { field: 'rollno', headerName: 'Roll No', width: 130 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'role', headerName: 'Role', width: 100 },
    { field: 'programcode', headerName: 'Program', width: 110 },
    { field: 'admissionyear', headerName: 'Academic Year', width: 130 },
    { field: 'semester', headerName: 'Semester', width: 90 },
    { field: 'section', headerName: 'Section', width: 90 },
    { field: 'gender', headerName: 'Gender', width: 90 },
    { field: 'department', headerName: 'Department', width: 130 },
    { field: 'category', headerName: 'Category', width: 100 },
    { field: 'quota', headerName: 'Quota', width: 100 },
    { field: 'fathername', headerName: 'Father Name', width: 160 },
    { field: 'mothername', headerName: 'Mother Name', width: 160 },
    { field: 'dob', headerName: 'DOB', width: 110 },
    { field: 'address', headerName: 'Address', width: 200 },
    { field: 'eligibilityname', headerName: 'Eligibility', width: 130 },
    { field: 'degree', headerName: 'Degree', width: 100 },
    { field: 'minorsub', headerName: 'Minor Subject', width: 130 },
    { field: 'vocationalsub', headerName: 'Vocational Subject', width: 150 },
    { field: 'mdcsub', headerName: 'MDC Subject', width: 130 },
    { field: 'othersub', headerName: 'Other Subject', width: 130 },
    { field: 'merit', headerName: 'Merit', width: 100 },
    { field: 'obtain', headerName: 'Marks Obtained', width: 130, type: 'number' },
    { field: 'bonus', headerName: 'Bonus', width: 90, type: 'number' },
    { field: 'weightage', headerName: 'Weightage', width: 110, type: 'number' },
    { field: 'ncctype', headerName: 'NCC Type', width: 110 },
    { field: 'isdisabled', headerName: 'Disabled', width: 100 },
    { field: 'scholarship', headerName: 'Scholarship', width: 120 },
    { field: 'photo', headerName: 'Photo', width: 100 },
    { field: 'user', headerName: 'User', width: 180 },
    { field: 'addedby', headerName: 'Added By', width: 180 },
    { field: 'status1', headerName: 'Status 1', width: 100 },
    { field: 'status', headerName: 'Status', width: 80, type: 'number' },
    { field: 'srno', headerName: 'Sr No', width: 80, type: 'number' }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>

        {/* Back to Dashboard Button */}
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashmncas11admin')}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<Download />}
            onClick={handleExport}
            sx={{ ml: 2 }}
          >
            Export
          </Button>
        </Box>
        <Typography variant="h4" gutterBottom>
          Student List
        </Typography>

        {/* Filter Section */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                fullWidth
                label="Program Code"
                value={filters.programcode}
                onChange={(e) => handleFilterChange('programcode', e.target.value)}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.programcodes.map((code) => (
                  <MenuItem key={code} value={code}>
                    {code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                fullWidth
                label="Semester"
                value={filters.semester}
                onChange={(e) => handleFilterChange('semester', e.target.value)}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.semesters.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                fullWidth
                label="Section"
                value={filters.section}
                onChange={(e) => handleFilterChange('section', e.target.value)}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.sections.map((sec) => (
                  <MenuItem key={sec} value={sec}>
                    {sec}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                select
                fullWidth
                label="Academic Year"
                value={filters.admissionyear}
                onChange={(e) => handleFilterChange('admissionyear', e.target.value)}
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {filterOptions.academicyears.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <TextField
                fullWidth
                label="Search"
                placeholder="Name, Reg No, Roll No, Email"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
        </Box>

        {/* Data Grid */}
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={students}
            columns={columns}
            loading={loading}
            getRowId={(row) => row._id}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50, 100]}
            rowCount={totalRows}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                padding: '8px',
              },
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default StudentListds;
