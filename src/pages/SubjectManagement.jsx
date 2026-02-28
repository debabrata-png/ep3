import React, { useState, useEffect } from "react";
import ep1 from "../api/ep1";
import global1 from "./global1";

import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  Chip,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  CircularProgress,
  Stack,
  Tooltip,
  Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CodeIcon from "@mui/icons-material/Code";
import SubjectIcon from "@mui/icons-material/Subject";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

// ── Shared sizing constants ────────────────────────────────────────────────
const INPUT_FONT_SIZE = "1.05rem";
const INPUT_HEIGHT = 56; // px — every input/select will match this

const theme = createTheme({
  palette: {
    primary: { main: "#1a56db", light: "#4d7de8", dark: "#0e3fa3", contrastText: "#fff" },
    secondary: { main: "#0369a1" },
    background: { default: "#f0f4f9", paper: "#ffffff" },
    text: { primary: "#111827", secondary: "#6b7280" },
    divider: "#e5e9f2",
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h4: { fontWeight: 800, letterSpacing: "-0.5px" },
    h5: { fontWeight: 700, letterSpacing: "-0.3px" },
    h6: { fontWeight: 700 },
    body1: { fontSize: "1rem" },
    body2: { fontSize: "0.95rem" },
    overline: { fontSize: "0.8rem", fontWeight: 700, letterSpacing: "1.2px" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05), 0 4px 24px rgba(15,23,42,0.06)",
          border: "1px solid #e5e9f2",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          fontSize: "1rem",
          borderRadius: 8,
          padding: "11px 26px",
        },
        contained: {
          boxShadow: "0 1px 3px rgba(26,86,219,0.3), 0 4px 12px rgba(26,86,219,0.15)",
          "&:hover": { boxShadow: "0 2px 8px rgba(26,86,219,0.4), 0 6px 20px rgba(26,86,219,0.2)" },
        },
      },
    },
    // Uniform text field — height + font locked globally
    MuiTextField: {
      defaultProps: { variant: "outlined", size: "medium" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            fontSize: INPUT_FONT_SIZE,
            minHeight: INPUT_HEIGHT,
            backgroundColor: "#fafbfc",
            "&.Mui-focused": { backgroundColor: "#fff" },
            "& fieldset": { borderColor: "#e5e7eb" },
            "&:hover fieldset": { borderColor: "#93c5fd" },
            "&.Mui-focused fieldset": { borderColor: "#1a56db", borderWidth: 2 },
          },
          "& .MuiInputLabel-root": { fontSize: INPUT_FONT_SIZE },
          "& .MuiInputLabel-shrink": { fontSize: "0.9rem" },
          "& .MuiFormHelperText-root": { fontSize: "0.82rem" },
        },
      },
    },
    // Uniform FormControl / Select — same height + font
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: INPUT_FONT_SIZE,
          minHeight: INPUT_HEIGHT,
          backgroundColor: "#fafbfc",
          "&.Mui-focused": { backgroundColor: "#fff" },
          "& fieldset": { borderColor: "#e5e7eb" },
          "&:hover fieldset": { borderColor: "#93c5fd" },
          "&.Mui-focused fieldset": { borderColor: "#1a56db", borderWidth: 2 },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { fontSize: INPUT_FONT_SIZE },
        shrink: { fontSize: "0.9rem" },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { fontSize: INPUT_FONT_SIZE, minHeight: `${INPUT_HEIGHT - 16}px` },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { fontSize: INPUT_FONT_SIZE },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-head": {
            backgroundColor: "#f0f6ff",
            color: "#1a56db",
            fontWeight: 700,
            fontSize: "0.82rem",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            borderBottom: "2px solid #dce8f5",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "#f8faff" },
          "&:last-child td": { borderBottom: 0 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: "0.95rem", borderColor: "#f3f6fb", padding: "14px 18px" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.85rem" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { fontSize: "0.95rem", borderRadius: 8 },
      },
    },
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────
const getInitialForm = () => ({
  name: "",
  user: "",
  colid: global1.colid,
  subjectName: "",
  fullName: "",
  programName: "",
});

// ── Component ──────────────────────────────────────────────────────────────
export default function SubjectManagement() {
  const colid = global1.colid;
  const [subjects, setSubjects] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [form, setForm] = useState(getInitialForm());
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubjects = async () => {
    setFetchLoading(true);
    try {
      const res = await ep1.get("/api/v2/subjects", { params: { colid } });
      setSubjects(res.data.data || []);
    } catch {
      setError("Failed to fetch subjects.");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchPrograms = async () => {
    setProgramsLoading(true);
    try {
      const res = await ep1.get("/api/v2/formMetadata", { params: { colid } });
      if (res.data.success) {
        const progs = (res.data.programs || []).map((p) => p.program).filter(Boolean);
        setProgramOptions([...new Set(progs)]);
      }
    } catch {
      console.error("Failed to fetch programs");
    } finally {
      setProgramsLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); fetchPrograms(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(""); setSuccess("");
    try {
      if (editId) {
        await ep1.put(`/api/v2/subjects/${editId}`, form);
        setSuccess("Subject record updated successfully.");
      } else {
        await ep1.post("/api/v2/subjects", form);
        setSuccess("Subject record created successfully.");
      }
      setForm(getInitialForm());
      setEditId(null);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.error || "Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setForm({
      name: subject.name || "",
      user: subject.user || "",
      colid: subject.colid || "",
      subjectName: subject.subjectName || "",
      fullName: subject.fullName || "",
      programName: subject.programName || "",
    });
    setEditId(subject._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject? This action cannot be undone.")) return;
    try {
      await ep1.delete(`/api/v2/subjects/${id}`);
      setSuccess("Subject record deleted successfully.");
      fetchSubjects();
    } catch {
      setError("Failed to delete subject. Please try again.");
    }
  };

  const handleCancel = () => { setForm(getInitialForm()); setEditId(null); setError(""); setSuccess(""); };

  const filtered = subjects.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.subjectName?.toLowerCase().includes(q) ||
      s.programName?.toLowerCase().includes(q) ||
      s.fullName?.toLowerCase().includes(q) ||
      String(s.colid)?.includes(q)
    );
  });

  // Shared sx for FormControl selects so they match TextField height exactly
  const selectRootSx = {
    "& .MuiOutlinedInput-root": {
      minHeight: INPUT_HEIGHT,
      fontSize: INPUT_FONT_SIZE,
      backgroundColor: "#fafbfc",
      "&.Mui-focused": { backgroundColor: "#fff" },
      "& fieldset": { borderColor: "#e5e7eb" },
      "&:hover fieldset": { borderColor: "#93c5fd" },
      "&.Mui-focused fieldset": { borderColor: "#1a56db", borderWidth: 2 },
    },
    "& .MuiInputLabel-root": { fontSize: INPUT_FONT_SIZE },
    "& .MuiInputLabel-shrink": { fontSize: "0.9rem" },
    "& .MuiFormHelperText-root": { fontSize: "0.82rem" },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 4 }}>
        <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* ── Page Hero (no AppBar) ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  background: "linear-gradient(135deg, #1a56db 0%, #0e3fa3 100%)",
                  boxShadow: "0 4px 16px rgba(26,86,219,0.3)",
                  borderRadius: "14px",
                }}
              >
                <MenuBookIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" } }}>
                  Subject Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: "1rem" }}>
                  Create and manage subjects across college programs
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Chip
                icon={<SchoolIcon />}
                label={`College ID: ${colid}`}
                sx={{
                  bgcolor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8",
                  fontWeight: 700, fontSize: "0.88rem", fontFamily: "monospace",
                  height: 36, "& .MuiChip-icon": { color: "#1d4ed8" },
                }}
              />
              <Chip
                label={`${subjects.length} Subject${subjects.length !== 1 ? "s" : ""}`}
                sx={{
                  bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534",
                  fontWeight: 700, fontSize: "0.88rem", height: 36,
                }}
              />
            </Stack>
          </Box>

          {/* ── Form Card ── */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              {editId ? "Editing Record" : "New Record"}
            </Typography>

            <Paper elevation={0}>
              {/* Card header */}
              <Box sx={{ px: 3.5, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fafcff" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: "1.15rem" }}>
                    {editId ? "Edit Subject" : "Add Subject"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: "0.95rem" }}>
                    {editId ? "Modify the details of the selected subject record" : "Fill in the fields below to register a new subject"}
                  </Typography>
                </Box>
                <Chip
                  label={editId ? "Editing" : "New"}
                  size="small"
                  sx={editId
                    ? { bgcolor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", fontWeight: 700, fontSize: "0.85rem" }
                    : { bgcolor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontWeight: 700, fontSize: "0.85rem" }}
                />
              </Box>

              {/* Alerts */}
              {error && (
                <Box sx={{ px: 3.5, pt: 2.5 }}>
                  <Alert severity="error" icon={<ErrorOutlineIcon />} onClose={() => setError("")}>{error}</Alert>
                </Box>
              )}
              {success && (
                <Box sx={{ px: 3.5, pt: 2.5 }}>
                  <Alert
                    severity="info"
                    icon={<CheckCircleOutlineIcon />}
                    onClose={() => setSuccess("")}
                    sx={{ bgcolor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", "& .MuiAlert-icon": { color: "#1d4ed8" } }}
                  >
                    {success}
                  </Alert>
                </Box>
              )}

              {/* Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ px: 3.5, pt: 3, pb: 4 }}>

                {/* Section: Record Metadata */}
                <Typography variant="overline" color="text.secondary" sx={{ display: "block", pb: 1.5, borderBottom: "1px solid", borderColor: "divider", mb: 2.5 }}>
                  Record Metadata
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3.5 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Added By"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Anita Sharma"
                      helperText="Full name of the person adding this record"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeOutlinedIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="User Account"
                      name="user"
                      value={form.user}
                      onChange={handleChange}
                      placeholder="e.g. anita@college.edu"
                      helperText="Email address or system username"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircleOutlinedIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Section: Subject Details */}
                <Typography variant="overline" color="text.secondary" sx={{ display: "block", pb: 1.5, borderBottom: "1px solid", borderColor: "divider", mb: 2.5 }}>
                  Subject Details
                </Typography>
                <Grid container spacing={3}>
                  {/* Program dropdown */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required sx={selectRootSx}>
                      <InputLabel>Program</InputLabel>
                      <Select
                        name="programName"
                        value={form.programName}
                        onChange={handleChange}
                        label="Program"
                        startAdornment={
                          <InputAdornment position="start">
                            <CategoryOutlinedIcon sx={{ color: "text.secondary", fontSize: 22, ml: 0.5 }} />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="" disabled>
                          {programsLoading ? "Loading programs…" : "Select a program"}
                        </MenuItem>
                        {programOptions.map((p) => (
                          <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                      </Select>
                      {!programsLoading && programOptions.length === 0 && (
                        <FormHelperText>No programs found for this college ID</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Subject Code */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      label="Subject Code"
                      name="subjectName"
                      value={form.subjectName}
                      onChange={handleChange}
                      placeholder="e.g. CS-301"
                      helperText="Short identifier or course code"
                      inputProps={{ style: { fontFamily: "monospace", fontWeight: 600 } }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Full Name */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Subject Name"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Introduction to Data Structures and Algorithms"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubjectIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
                  {editId && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<CancelOutlinedIcon />}
                      onClick={handleCancel}
                      sx={{ color: "text.secondary", borderColor: "#d1d5db", "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" } }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading
                      ? <CircularProgress size={20} sx={{ color: "rgba(255,255,255,0.7)" }} />
                      : editId ? <SaveOutlinedIcon /> : <AddCircleOutlineIcon />}
                  >
                    {loading ? (editId ? "Saving…" : "Adding…") : editId ? "Save Changes" : "Add Subject"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* ── Table Card ── */}
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
              Records
            </Typography>

            <Paper elevation={0}>
              {/* Card header */}
              <Box sx={{ px: 3.5, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fafcff" }}>
                <Box>
                  <Typography variant="h6" sx={{ fontSize: "1.15rem" }}>Subject Registry</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: "0.95rem" }}>
                    All subjects registered under this college
                  </Typography>
                </Box>
              </Box>

              {/* Toolbar */}
              <Box sx={{ px: 3.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2, bgcolor: "#fafbfc", borderBottom: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ fontSize: "0.95rem" }}>
                      Total Records
                    </Typography>
                    <Chip
                      label={filtered.length}
                      size="small"
                      sx={{ bgcolor: "#f3f4f6", fontWeight: 700, fontFamily: "monospace", fontSize: "0.88rem", height: 28 }}
                    />
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
                  <Chip
                    size="small"
                    icon={<SchoolIcon />}
                    label={`College: ${colid}`}
                    sx={{
                      bgcolor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8",
                      fontWeight: 700, fontFamily: "monospace", fontSize: "0.85rem", height: 30,
                      "& .MuiChip-icon": { color: "#1d4ed8" },
                    }}
                  />
                </Stack>

                {/* Search — same height as form inputs */}
                <TextField
                  placeholder="Search subjects, programs…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    width: 300,
                    "& .MuiOutlinedInput-root": {
                      minHeight: INPUT_HEIGHT,
                      fontSize: INPUT_FONT_SIZE,
                      bgcolor: "#fff",
                      "& fieldset": { borderColor: "#e5e7eb" },
                      "&:hover fieldset": { borderColor: "#93c5fd" },
                      "&.Mui-focused fieldset": { borderColor: "#1a56db", borderWidth: 2 },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: "text.secondary", fontSize: 22 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Table / States */}
              {fetchLoading ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 2 }}>
                  <CircularProgress size={36} thickness={3} />
                  <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>Loading records…</Typography>
                </Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 10, gap: 1.5 }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: "#f0f6ff", borderRadius: "14px" }}>
                    <InboxIcon sx={{ color: "#1a56db", fontSize: 30 }} />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "1.1rem" }}>
                    No subjects found
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "0.95rem" }}>
                    {searchTerm ? "Try adjusting your search query." : "Add a subject using the form above."}
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: 50 }}>S/N</TableCell>
                        {/* <TableCell>College ID</TableCell> */}
                        <TableCell>Program</TableCell>
                        <TableCell>Subject Code</TableCell>
                        <TableCell>Full Name</TableCell>
                        <TableCell>Added By</TableCell>
                        <TableCell>User Account</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filtered.map((s, idx) => (
                        <TableRow key={s._id}>
                          <TableCell>
                            <Typography sx={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#c4c9d4", fontWeight: 600 }}>
                              {String(idx + 1).padStart(2, "0")}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={s.programName || "—"} size="small"
                              sx={{ bgcolor: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", fontWeight: 600, fontSize: "0.85rem" }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontFamily: "monospace", fontWeight: 600, fontSize: "0.95rem", color: "#111827" }}>
                              {s.subjectName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 500 }}>
                              {s.fullName || <span style={{ color: "#d1d5db" }}>—</span>}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {s.name || <span style={{ color: "#d1d5db" }}>—</span>}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontFamily: "monospace", fontSize: "0.9rem", color: "#6b7280" }}>
                              {s.user || <span style={{ color: "#d1d5db" }}>—</span>}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title="Edit subject">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<EditOutlinedIcon />}
                                  onClick={() => handleEdit(s)}
                                  sx={{
                                    bgcolor: "#f0f7ff", borderColor: "#bfdbfe", color: "#1d4ed8",
                                    fontSize: "0.88rem", fontWeight: 600,
                                    "&:hover": { bgcolor: "#dbeafe", borderColor: "#93c5fd" },
                                  }}
                                >
                                  Edit
                                </Button>
                              </Tooltip>
                              <Tooltip title="Delete subject">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<DeleteOutlineIcon />}
                                  onClick={() => handleDelete(s._id)}
                                  sx={{
                                    bgcolor: "#fef2f2", borderColor: "#fecaca", color: "#b91c1c",
                                    fontSize: "0.88rem", fontWeight: 600,
                                    "&:hover": { bgcolor: "#fee2e2", borderColor: "#fca5a5" },
                                  }}
                                >
                                  Delete
                                </Button>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Box>

        </Container>
      </Box>
    </ThemeProvider>
  );
}