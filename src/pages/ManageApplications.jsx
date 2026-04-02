import React, { useState, useEffect } from "react";
import {
    Container, Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, TextField, MenuItem,
    Chip, IconButton, CircularProgress, Tooltip, TablePagination
} from "@mui/material";
import {
    Visibility as ViewIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    PauseCircle as HoldIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const ManageApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const colid = global1.colid;
    const [statusFilter, setStatusFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    
    // Pagination
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            console.log("Fetching applications for colid:", colid, "baseURL:", ep1.defaults.baseURL);
            const res = await ep1.get("/api/v2/admission/applications", {
                params: { 
                    colid, 
                    status: statusFilter || undefined, 
                    programLevel: levelFilter || undefined 
                }
            });
            console.log("API Response:", res.data);
            setApplications(res.data.data || []);
        } catch (err) {
            console.error("Error fetching applications:", err);
            if (err.response) {
                console.error("Error response data:", err.response.data);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, [statusFilter, levelFilter]);

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this application?`)) return;
        
        try {
            if (action === "approve") {
                await ep1.post(`/api/v2/admission/approve/${id}`);
            } else {
                await ep1.post(`/api/v2/admission/status/${id}`, { status: action === "reject" ? "Rejected" : "Hold" });
            }
            fetchApplications();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} application`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Approved": return "success";
            case "Rejected": return "error";
            case "Hold": return "warning";
            case "Draft": return "default";
            case "Submitted": return "info";
            default: return "primary";
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Manage Admission Applications</Typography>
                    <Typography color="textSecondary">Review and process student admission forms</Typography>
                </Box>
                <Button 
                    startIcon={<RefreshIcon />} 
                    variant="outlined" 
                    onClick={fetchApplications}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    select
                    label="Filter by Status"
                    size="small"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Submitted">Submitted</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Hold">Hold</MenuItem>
                </TextField>

                <TextField
                    select
                    label="Filter by Level"
                    size="small"
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Levels</MenuItem>
                    <MenuItem value="UG">Undergraduate (UG)</MenuItem>
                    <MenuItem value="PG">Postgraduate (PG)</MenuItem>
                    <MenuItem value="PhD">PhD</MenuItem>
                    <MenuItem value="Diploma">Diploma</MenuItem>
                </TextField>
            </Paper>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>Student Name</strong></TableCell>
                            <TableCell><strong>Email / Mobile</strong></TableCell>
                            <TableCell><strong>Program</strong></TableCell>
                            <TableCell><strong>Level</strong></TableCell>
                            <TableCell><strong>Applied On</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Inst ID</strong></TableCell>
                            <TableCell align="center"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    No applications found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((app) => (
                                <TableRow key={app._id} hover>
                                    <TableCell><strong>{app.fullName}</strong></TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{app.email}</Typography>
                                        <Typography variant="caption" color="textSecondary">{app.mobileNo}</Typography>
                                    </TableCell>
                                    <TableCell>{app.program}</TableCell>
                                    <TableCell>{app.programLevel}</TableCell>
                                    <TableCell>{new Date(app.applicationDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={app.status} 
                                            size="small" 
                                            color={getStatusColor(app.status)} 
                                            variant="outlined" 
                                        />
                                    </TableCell>
                                    <TableCell align="center"><strong>{app.colid}</strong></TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => navigate(`/admission/details/${app._id}`)}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {app.status === 'Draft' || app.status === 'Submitted' || app.status === 'Hold' ? (
                                                <>
                                                    <Tooltip title="Approve">
                                                        <IconButton 
                                                            size="small" 
                                                            sx={{ color: 'green' }}
                                                            onClick={() => handleAction(app._id, "approve")}
                                                        >
                                                            <ApproveIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Hold">
                                                        <IconButton 
                                                            size="small" 
                                                            color="warning"
                                                            onClick={() => handleAction(app._id, "hold")}
                                                        >
                                                            <HoldIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Reject">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => handleAction(app._id, "reject")}
                                                        >
                                                            <RejectIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            ) : null}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={applications.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>
        </Container>
    );
};

export default ManageApplications;
