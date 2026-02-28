
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
    Alert,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Edit, Delete, Add, Upload, ArrowBack } from "@mui/icons-material";
import ep1 from "../api/ep1";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import global1 from "./global1";
import AddRoleListds from './AddRoleListds'; // Import the specific Add Modal
import EditRoleListds from './EditRoleListds'; // Import Edit Modal

const ViewPurchaseUserAddds = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [openAddRole, setOpenAddRole] = useState(false);

    // Edit State
    const [openEditRole, setOpenEditRole] = useState(false);
    const [editUser, setEditUser] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState(""); // Add Role Filter

    // ✅ DEFINE PURCHASE ROLES (Must match AddRoleListds)
    const purchaseRoles = [
        { value: 'PE', label: 'Purchase Executive' },
        { value: 'SPE', label: 'Sr. Purchase Executive' },
        { value: 'OE', label: 'Office Executive' }
    ];

    // DataGrid pagination
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 20,
    });
    const [rowCount, setRowCount] = useState(0);
    const [filterModel, setFilterModel] = useState({ items: [] });

    // Fetch users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            if (!global1.colid) {
                setError("College ID (colid) is missing. Please log in again.");
                setLoading(false);
                return;
            }

            const params = {
                colid: global1.colid,
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
                ...(search && { search }),
                ...(departmentFilter && { department: departmentFilter }),
                ...(roleFilter && { role: roleFilter }), // Add Role Filter params
            };

            // ✅ ADD COLUMN FILTERS FROM DATAGRID
            if (filterModel.items && filterModel.items.length > 0) {
                filterModel.items.forEach((filter) => {
                    if (filter.value) {
                        params[filter.field] = filter.value;
                    }
                });
            }

            // ✅ CALL NEW BACKEND ENDPOINT
            const res = await ep1.get("/api/v2/ds1getpurchaseusers", { params });

            setUsers(res.data.data || []);
            setRowCount(res.data.pagination?.total || 0);
        } catch (err) {
            console.error("❌ Error fetching users:", err);
            setError(err.response?.data?.message || "Error fetching users");
        } finally {
            setLoading(false);
        }
    }, [paginationModel, search, departmentFilter, roleFilter, filterModel]); // Add roleFilter dependency

    useEffect(() => {
        if (global1.colid) {
            fetchUsers();
        } else {
            setError("College ID is missing. Please log in.");
        }
    }, [fetchUsers]);

    // Reset pagination when filters change - REMOVED (Handled in onChange)

    // Delete user
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await ep1.get(`/api/v2/ds1deleteuser?id=${id}`);
            setMessage("User deleted successfully");
            fetchUsers();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting user");
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        try {
            const idsString = selectedIds.join(",");
            await ep1.get(`/api/v2/ds1bulkdeleteuser?ids=${idsString}`);
            setMessage(`${selectedIds.length} users deleted successfully`);
            setSelectedIds([]);
            setDeleteDialog(false);
            fetchUsers();
            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting users");
        }
    };

    // Handle Edit
    const handleEdit = (user) => {
        setEditUser(user);
        setOpenEditRole(true);
    };

    // ✅ Export to Excel
    const handleExport = () => {
        try {
            const ws = XLSX.utils.json_to_sheet(users);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Users");
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const data = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(data, "purchase_users_export.xlsx");
        } catch (error) {
            console.error("Export failed:", error);
            setError("Failed to export data");
        }
    };

    // DataGrid columns
    const columns = [
        { field: "name", headerName: "Name", width: 180 },
        { field: "email", headerName: "Email", width: 220 },
        { field: "phone", headerName: "Phone", width: 130 },
        { field: "role", headerName: "Role", width: 150 },
        { field: "department", headerName: "Department", width: 150 },
        { field: "password", headerName: "Password", width: 150 },
        { field: "gender", headerName: "Gender", width: 100 },
        { field: "category", headerName: "Category", width: 100 },
        {
            field: "lastlogin",
            headerName: "Last Login",
            width: 180,
            valueGetter: (params) => {
                // Fix for DataGrid v6 valueGetter signature (params.value is not available directly on params in v5, but v6 is usually (value, row))
                // However, providing a safe check:
                const val = params.value || params.row?.lastlogin;
                if (!val) return "N/A";
                try {
                    return new Date(val).toLocaleString();
                } catch {
                    return "Invalid Date";
                }
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Tooltip title="Edit User">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(params.row)} // Open Edit Modal
                            sx={{ mr: 1 }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(params.row._id)}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </>
            ),
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h4">Purchase User Management</Typography>
            </Box>

            {/* Success/Error Messages */}
            {message && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>
                    {message}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Actions Bar */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenAddRole(true)} // Open AddRoleListds
                    >
                        Add User
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<Upload />}
                        onClick={handleExport}
                    >
                        Export to Excel
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={fetchUsers}
                    >
                        Refresh
                    </Button>
                    {selectedIds.length > 0 && (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => setDeleteDialog(true)}
                        >
                            Delete Selected ({selectedIds.length})
                        </Button>
                    )}
                </Stack>

                {/* Filters */}
                <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                    <TextField
                        label="Search"
                        placeholder="Name, Email, Phone"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPaginationModel(prev => ({ ...prev, page: 0 }));
                        }}
                        size="small"
                        sx={{ minWidth: 250 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Role</InputLabel>
                        <Select
                            value={roleFilter}
                            label="Role"
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setPaginationModel(prev => ({ ...prev, page: 0 }));
                            }}
                        >
                            <MenuItem value="">All Roles</MenuItem>
                            {purchaseRoles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>


                    <TextField
                        label="Department"
                        placeholder="Department"
                        value={departmentFilter}
                        onChange={(e) => {
                            setDepartmentFilter(e.target.value);
                            setPaginationModel(prev => ({ ...prev, page: 0 }));
                        }}
                        size="small"
                        sx={{ minWidth: 200 }}
                    />

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSearch("");
                            setDepartmentFilter("");
                            setRoleFilter("");
                        }}
                    >
                        Clear Filters
                    </Button>
                </Stack>
            </Paper>

            {/* DataGrid */}
            <Paper sx={{ height: 600, width: "100%" }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    pageSizeOptions={[10, 20, 50, 100]}
                    paginationModel={paginationModel}
                    paginationMode="server"
                    onPaginationModelChange={setPaginationModel}
                    rowCount={rowCount}
                    checkboxSelection
                    disableRowSelectionOnClick
                    filterMode="server"
                    filterModel={filterModel}
                    onFilterModelChange={(newModel) => {
                        setFilterModel(newModel);
                        setPaginationModel({ ...paginationModel, page: 0 });
                    }}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedIds(newSelection);
                    }}
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                    sx={{
                        "& .MuiDataGrid-cell": {
                            borderRight: "1px solid #e0e0e0",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#f5f5f5",
                            borderBottom: "2px solid #1976d2",
                        },
                    }}
                />
            </Paper>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Confirm Bulk Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete {selectedIds.length} users? This
                    action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleBulkDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Role Modal */}
            <AddRoleListds
                open={openAddRole}
                handleClose={() => setOpenAddRole(false)}
                fetchViewPage={fetchUsers}
            />

            {/* Edit Role Modal */}
            <EditRoleListds
                open={openEditRole}
                handleClose={() => {
                    setOpenEditRole(false);
                    setEditUser(null);
                }}
                fetchViewPage={fetchUsers}
                editUser={editUser}
            />

        </Container>
    );
};

export default ViewPurchaseUserAddds;
