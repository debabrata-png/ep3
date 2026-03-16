import React, { useState, useEffect, useRef } from "react";
import {
    Box, Card, CardContent, Typography, TextField, Button, Grid,
    Autocomplete, Avatar, List, ListItem, ListItemAvatar, ListItemText,
    Chip, Divider, IconButton, Paper, CircularProgress, Alert, Switch,
    FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions,
    Stack, Tooltip
} from "@mui/material";
import {
    Search, Person, History, ReportProblem, Edit, Delete, Save,
    CheckCircle, ErrorOutline, Info
} from "@mui/icons-material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const HostelStudentRemarksds = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [remarks, setRemarks] = useState([]);
    const [fetchingRemarks, setFetchingRemarks] = useState(false);
    const [newRemark, setNewRemark] = useState("");
    const [isRedFlag, setIsRedFlag] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "success" });
    const [saving, setSaving] = useState(false);

    // Debounced search for students
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.length > 2) {
                searchStudents();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const searchStudents = async () => {
        try {
            setLoading(true);
            const res = await ep1.get(`/api/v2/ds1getalluser`, {
                params: {
                    colid: global1.colid,
                    search: searchTerm,
                    role: "Student",
                    limit: 10
                }
            });
            setStudents(res.data.data || []);
        } catch (err) {
            console.error("Error searching students:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRemarks = async (regno) => {
        try {
            setFetchingRemarks(true);
            const res = await ep1.get(`/api/v2/hostelstudremarks/get`, {
                params: {
                    regno: regno,
                    colid: global1.colid
                }
            });
            setRemarks(res.data.data || []);
        } catch (err) {
            console.error("Error fetching remarks:", err);
            showMsg("Failed to load remarks", "error");
        } finally {
            setFetchingRemarks(false);
        }
    };

    const handleSelectStudent = (event, student) => {
        setSelectedStudent(student);
        if (student) {
            fetchRemarks(student.regno);
        } else {
            setRemarks([]);
        }
    };

    const showMsg = (text, type = "success") => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: "", type: "success" }), 5000);
    };

    const handleAddRemark = async () => {
        if (!newRemark.trim()) {
            showMsg("Please enter a remark", "warning");
            return;
        }

        try {
            setSaving(true);
            await ep1.post(`/api/v2/hostelstudremarks/create`, {
                name: global1.name || global1.user,
                user: global1.user,
                colid: global1.colid,
                student: selectedStudent.name,
                regno: selectedStudent.regno,
                remarks: newRemark,
                isredflag: isRedFlag
            });

            showMsg("Remark added successfully");
            setNewRemark("");
            setIsRedFlag(false);
            fetchRemarks(selectedStudent.regno);
        } catch (err) {
            console.error("Error adding remark:", err);
            showMsg("Failed to add remark", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteRemark = async (id) => {
        if (!window.confirm("Delete this remark?")) return;

        try {
            await ep1.post(`/api/v2/hostelstudremarks/delete`, { id, colid: global1.colid });
            showMsg("Remark deleted");
            fetchRemarks(selectedStudent.regno);
        } catch (err) {
            showMsg("Delete failed", "error");
        }
    };

    const toggleRedFlag = async (remark) => {
        try {
            await ep1.post(`/api/v2/hostelstudremarks/update/${remark._id}`, {
                isredflag: !remark.isredflag,
                colid: global1.colid
            });
            fetchRemarks(selectedStudent.regno);
        } catch (err) {
            showMsg("Update failed", "error");
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom sx={{ mb: 4 }}>
                Hostel Student Remarks
            </Typography>

            <Grid container spacing={3}>
                {/* Search Section */}
                <Grid item xs={12} md={5}>
                    <Card sx={{ borderRadius: 4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
                                <Search color="primary" /> Find Student
                            </Typography>

                            <Autocomplete
                                fullWidth
                                options={students}
                                getOptionLabel={(option) => `${option.name} (${option.regno})`}
                                onInputChange={(e, value) => setSearchTerm(value)}
                                onChange={handleSelectStudent}
                                loading={loading}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Search by Name or Regno"
                                        placeholder="Start typing..."
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <React.Fragment>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </React.Fragment>
                                            ),
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                        <Typography variant="body1" fontWeight="600">{option.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{option.regno} | {option.department}</Typography>
                                    </Box>
                                )}
                            />

                            {selectedStudent && (
                                <Fade in={!!selectedStudent}>
                                    <Box sx={{ mt: 4, p: 2, bgcolor: "primary.50", borderRadius: 3, border: "1px solid", borderColor: "primary.100" }}>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main" }}>
                                                {selectedStudent.name[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight="bold">{selectedStudent.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">Regno: {selectedStudent.regno}</Typography>
                                                <Typography variant="body2" color="text.secondary">Dept: {selectedStudent.department}</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Fade>
                            )}
                        </CardContent>
                    </Card>

                    {selectedStudent && (
                        <Card sx={{ mt: 3, borderRadius: 4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>Add Remark</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Enter remark details..."
                                    value={newRemark}
                                    onChange={(e) => setNewRemark(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={isRedFlag}
                                                onChange={(e) => setIsRedFlag(e.target.checked)}
                                                color="error"
                                            />
                                        }
                                        label={<Typography color={isRedFlag ? "error" : "text.primary"}>Red Flag Case</Typography>}
                                    />
                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        onClick={handleAddRemark}
                                        disabled={saving}
                                        sx={{ borderRadius: 2, px: 4 }}
                                    >
                                        {saving ? "Saving..." : "Save Remark"}
                                    </Button>
                                </Box>
                                {msg.text && (
                                    <Alert severity={msg.type} sx={{ mt: 2 }}>
                                        {msg.text}
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </Grid>

                {/* Remarks Feed Section */}
                <Grid item xs={12} md={7}>
                    <Card sx={{ borderRadius: 4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", minHeight: "70vh" }}>
                        <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                                <Typography variant="h6" fontWeight="600" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <History color="primary" /> Remarks History
                                </Typography>
                                {fetchingRemarks && <CircularProgress size={20} />}
                            </Box>

                            <Divider sx={{ mb: 2 }} />

                            {!selectedStudent ? (
                                <Box sx={{ textAlign: "center", py: 10 }}>
                                    <Info sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                                    <Typography color="text.secondary">Select a student to view remarks history</Typography>
                                </Box>
                            ) : remarks.length === 0 && !fetchingRemarks ? (
                                <Box sx={{ textAlign: "center", py: 10 }}>
                                    <CheckCircle sx={{ fontSize: 60, color: "success.light", mb: 2, opacity: 0.5 }} />
                                    <Typography color="text.secondary">No remarks found for this student.</Typography>
                                </Box>
                            ) : (
                                <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                                    {remarks.map((remark, index) => (
                                        <React.Fragment key={remark._id}>
                                            <ListItem
                                                alignItems="flex-start"
                                                sx={{
                                                    mb: 2,
                                                    borderRadius: 3,
                                                    bgcolor: remark.isredflag ? "rgba(239, 68, 68, 0.04)" : "transparent",
                                                    border: "1px solid",
                                                    borderColor: remark.isredflag ? "error.100" : "divider",
                                                    transition: "all 0.2s",
                                                    "&:hover": {
                                                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
                                                    }
                                                }}
                                                secondaryAction={
                                                    <Stack spacing={1}>
                                                        <Tooltip title={remark.isredflag ? "Unmark Red Flag" : "Mark Red Flag"}>
                                                            <IconButton
                                                                size="small"
                                                                color={remark.isredflag ? "error" : "default"}
                                                                onClick={() => toggleRedFlag(remark)}
                                                            >
                                                                <ReportProblem fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <IconButton size="small" edge="end" color="error" onClick={() => handleDeleteRemark(remark._id)}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                }
                                            >
                                                <ListItemAvatar>
                                                    <Avatar sx={{ bgcolor: remark.isredflag ? "error.main" : "primary.main" }}>
                                                        {remark.student[0]}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                                            <Typography fontWeight="bold">{remark.student}</Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {(() => {
                                                                    if (remark.createdAt) return new Date(remark.createdAt).toLocaleDateString();
                                                                    try {
                                                                        // Fallback to extracting from _id if it's a valid hex string
                                                                        return new Date(parseInt(remark._id.substring(0, 8), 16) * 1000).toLocaleDateString();
                                                                    } catch (e) {
                                                                        return "N/A";
                                                                    }
                                                                })()}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            <Typography variant="body1" color="text.primary" sx={{ my: 1, whiteSpace: "pre-wrap" }}>
                                                                {remark.remarks}
                                                            </Typography>
                                                            {remark.isredflag && (
                                                                <Chip
                                                                    icon={<ReportProblem sx={{ fontSize: "16px !important" }} />}
                                                                    label="RED FLAG CASE"
                                                                    size="small"
                                                                    color="error"
                                                                    sx={{ fontWeight: "bold", height: 20 }}
                                                                />
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

// Add Fade component for animations
const Fade = ({ children, in: inProp }) => {
    return (
        <Box sx={{
            opacity: inProp ? 1 : 0,
            transform: inProp ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.3s ease-out"
        }}>
            {children}
        </Box>
    );
};

export default HostelStudentRemarksds;
