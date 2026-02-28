import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx"; // npm install xlsx
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  TextField,
  InputAdornment,
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
  Tooltip,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  LinearProgress,
  Divider,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  EmojiPeople as MentorIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Close as CloseIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  TrendingUp as TrendingIcon,
  ArrowBack as BackIcon,
  HourglassEmpty as PendingIcon,
  SwapHoriz as SwapIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Domain as DomainIcon,
  LocationOn as LocationIcon,
  LinkedIn as LinkedInIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  WorkOutline as WorkIcon,
  Category as CategoryIcon,
  Badge as BadgeIcon,
  Chat as ChatIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { color: "#f59e0b", bg: "#fef3c7", label: "Pending",  icon: <PendingIcon sx={{ fontSize: 13 }} /> },
  approved: { color: "#10b981", bg: "#d1fae5", label: "Approved", icon: <ApproveIcon sx={{ fontSize: 13 }} /> },
  rejected: { color: "#ef4444", bg: "#fee2e2", label: "Rejected", icon: <RejectIcon  sx={{ fontSize: 13 }} /> },
  active:   { color: "#6366f1", bg: "#e0e7ff", label: "Active",   icon: <StarIcon    sx={{ fontSize: 13 }} /> },
};

const normalizeStatus = (s = "") => s.toLowerCase();

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, sub }) => (
  <Card sx={{
    width: 350, minWidth: 350, maxWidth: 350, borderRadius: 3,
    border: `1px solid ${accent}22`, boxShadow: `0 4px 24px ${accent}18`,
    position: "relative", overflow: "hidden",
    "&:hover": { transform: "translateY(-3px)", transition: "0.2s" },
  }}>
    <Box sx={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", bgcolor: `${accent}14` }} />
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box sx={{ bgcolor: `${accent}15`, borderRadius: 2, p: 1.2, display: "flex", color: accent }}>{icon}</Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>{value}</Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 500, mt: 0.3 }}>{label}</Typography>
          {sub && <Typography variant="caption" sx={{ color: accent, fontWeight: 600 }}>{sub}</Typography>}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value }) => (
  <Box sx={{ display: "flex", gap: 2, py: 1.5, borderBottom: "1px solid #f3f4f6" }}>
    <Box sx={{ color: "#9ca3af", mt: 0.2 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "#1f2937", fontWeight: 500 }}>{value || "—"}</Typography>
    </Box>
  </Box>
);

// ─── Status Select ────────────────────────────────────────────────────────────
const StatusSelect = ({ mentor, onUpdate }) => {
  const current = normalizeStatus(mentor.status);
  const sc      = STATUS_CONFIG[current] || STATUS_CONFIG.pending;
  return (
    <FormControl size="small" variant="outlined" sx={{ minWidth: 140 }}>
      <Select
        value={current}
        onChange={(e) => { if (e.target.value !== current) onUpdate(mentor, e.target.value); }}
        sx={{
          borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
          color: sc.color, bgcolor: sc.bg, border: `1.5px solid ${sc.color}55`,
          "& .MuiOutlinedInput-notchedOutline": { border: "none" },
          "& .MuiSelect-icon": { color: sc.color },
          "&:hover": { bgcolor: sc.bg, opacity: 0.85 }, px: 0.5,
        }}
        renderValue={(val) => {
          const s = STATUS_CONFIG[val] || STATUS_CONFIG.pending;
          return <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>{s.icon}{s.label}</Box>;
        }}
      >
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <MenuItem key={key} value={key}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ color: cfg.color, display: "flex" }}>{cfg.icon}</Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// ─── Domain Configuration Dialog ─────────────────────────────────────────────
const DomainConfigDialog = ({ open, onClose, configuredDomains, onSave }) => {
  const [domains,   setDomains]   = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [newDesc,   setNewDesc]   = useState("");
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    if (open) setDomains(configuredDomains.map((d) => ({ ...d })));
  }, [open, configuredDomains]);

  const handleAdd = () => {
    const trimmed = newDomain.trim();
    if (!trimmed) return;
    if (domains.find((d) => d.name.toLowerCase() === trimmed.toLowerCase())) return;
    setDomains((prev) => [...prev, { name: trimmed, description: newDesc.trim(), enabled: true, id: Date.now().toString() }]);
    setNewDomain(""); setNewDesc("");
  };

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(domains); onClose(); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <Box sx={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <DomainIcon sx={{ color: "#f59e0b", fontSize: 28 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: "white", fontWeight: 800 }}>Domain Configuration</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Manage allowed domains for mentor registration</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.5)" }}><CloseIcon /></IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e5e7eb" }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: "#374151", mb: 1.5 }}>Add New Domain</Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <TextField size="small" placeholder="Domain name (e.g. Technology)" value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              sx={{ flex: 2, minWidth: 160 }} />
            <TextField size="small" placeholder="Short description (optional)" value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)} sx={{ flex: 3, minWidth: 180 }} />
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} disabled={!newDomain.trim()}
              sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}>
              Add
            </Button>
          </Box>
        </Paper>
        <Typography variant="body2" sx={{ fontWeight: 700, color: "#374151", mb: 1 }}>
          Configured Domains ({domains.length})
        </Typography>
        {domains.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4, color: "#9ca3af" }}>
            <DomainIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2">No domains configured yet. Add one above.</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ border: "1px solid #e5e7eb", borderRadius: 2, overflow: "hidden" }}>
            {domains.map((domain, idx) => (
              <React.Fragment key={domain.id}>
                {idx > 0 && <Divider />}
                <ListItem sx={{ py: 1.5, bgcolor: domain.enabled ? "white" : "#f9fafb", opacity: domain.enabled ? 1 : 0.65 }}>
                  <Box sx={{ mr: 1.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: domain.enabled ? "#10b981" : "#d1d5db" }} />
                  </Box>
                  <ListItemText
                    primary={<Typography variant="body2" sx={{ fontWeight: 700, color: "#1f2937" }}>{domain.name}</Typography>}
                    secondary={domain.description || "No description"}
                  />
                  <ListItemSecondaryAction sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Tooltip title={domain.enabled ? "Disable" : "Enable"}>
                      <Switch size="small" checked={domain.enabled}
                        onChange={() => setDomains((prev) => prev.map((d) => d.id === domain.id ? { ...d, enabled: !d.enabled } : d))}
                        sx={{ "& .MuiSwitch-thumb": { bgcolor: domain.enabled ? "#10b981" : "#9ca3af" } }} />
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" onClick={() => setDomains((prev) => prev.filter((d) => d.id !== domain.id))} sx={{ color: "#ef4444" }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 600 }}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" }, textTransform: "none", fontWeight: 700, borderRadius: "20px", px: 3 }}>
          {saving ? "Saving…" : "Save Configuration"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Chat History Download Button
//
// API CONTRACT:
//   GET /api/chat/history?userId1=<mentor._id>&colid=<colid>
//
//   - ONLY mentor._id is sent as the user identifier (userId1).
//   - No userId2 is sent — the backend returns all messages where
//     userId1 appears as sender OR receiver.
//   - Client then re-filters rows: senderId === mentorId OR receiverId === mentorId
//     to guarantee correctness even if the API returns extra data.
//
// OUTPUT: Always .xlsx — no CSV path exists.
// ─────────────────────────────────────────────────────────────────────────────
const ChatDownloadButton = ({ mentor, colid, onSuccess, onError, compact = true }) => {
  const [loading, setLoading] = useState(false);

  // The ONLY identifier sent to the API — the mentor's MongoDB _id
  const mentorId   = mentor._id;
  const mentorName = mentor.firstName
    ? `${mentor.firstName} ${mentor.lastName ?? ""}`.trim()
    : mentor.name ?? "mentor";

  const handleDownload = async () => {
    setLoading(true);
    try {
      // ── API CALL ──────────────────────────────────────────────────────────
      // Dedicated admin endpoint that queries by BOTH mentorId and colid.
      // This finds all messages where mentor is sender OR receiver,
      // scoped to the correct institution — matching exactly how sendMessage saves data.
      const res      = await ep1.get(`/api/v2/chat/mentor-history?mentorId=${mentorId}&colid=${colid}`);
      const messages = res.data?.data || res.data || [];

      if (!Array.isArray(messages) || messages.length === 0) {
        onError?.(`No chat history found for ${mentorName}.`);
        return;
      }

      // ── CLIENT-SIDE FILTER ────────────────────────────────────────────────
      // Keep only messages where this mentor is the sender OR the receiver.
      // String() cast handles ObjectId vs string mismatches from MongoDB.
      const relevant = messages.filter(
        (msg) =>
          String(msg.senderId)   === String(mentorId) ||
          String(msg.receiverId) === String(mentorId)
      );

      if (relevant.length === 0) {
        onError?.(`No messages found involving ${mentorName}.`);
        return;
      }

      // ── BUILD WORKSHEET DATA ──────────────────────────────────────────────
      // Required columns only: Sender Name | Receiver Name | Date (YYYY-MM-DD)
      const HEADERS = ["Sender Name", "Receiver Name", "Date"];

      const dataRows = relevant.map((msg) => {
        // Prefer timestamp field; fall back to createdAt
        const raw  = msg.timestamp || msg.createdAt;
        // toISOString().slice(0,10) → "YYYY-MM-DD" (UTC, locale-neutral)
        const date = raw ? new Date(raw).toISOString().slice(0, 10) : "";

        return [
          msg.senderName   ?? "",
          msg.receiverName ?? "",
          date,
        ];
      });

      // ── CREATE WORKBOOK VIA SHEETJS ───────────────────────────────────────
      const wb     = XLSX.utils.book_new();
      const wsData = [HEADERS, ...dataRows];
      const ws     = XLSX.utils.aoa_to_sheet(wsData);

      // Auto-fit column widths
      ws["!cols"] = HEADERS.map((header, ci) => ({
        wch: Math.max(header.length, ...dataRows.map((r) => String(r[ci] ?? "").length)) + 4,
      }));

      // Header row: bold white on navy blue
      const HEADER_STYLE = {
        font:      { bold: true, color: { rgb: "FFFFFF" }, sz: 11, name: "Arial" },
        fill:      { fgColor: { rgb: "1E3A5F" }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border:    { bottom: { style: "medium", color: { rgb: "0EA5E9" } } },
      };
      // Alternating row shading
      const ROW_ODD  = {
        font:      { sz: 10, name: "Arial", color: { rgb: "1F2937" } },
        fill:      { fgColor: { rgb: "FFFFFF" }, patternType: "solid" },
        alignment: { horizontal: "left", vertical: "center" },
      };
      const ROW_EVEN = {
        font:      { sz: 10, name: "Arial", color: { rgb: "1F2937" } },
        fill:      { fgColor: { rgb: "EFF6FF" }, patternType: "solid" },
        alignment: { horizontal: "left", vertical: "center" },
      };

      wsData.forEach((row, ri) => {
        row.forEach((_, ci) => {
          const ref = XLSX.utils.encode_cell({ r: ri, c: ci });
          if (!ws[ref]) return;
          ws[ref].s = ri === 0 ? HEADER_STYLE : ri % 2 === 1 ? ROW_ODD : ROW_EVEN;
        });
      });

      // Freeze header row
      ws["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2", activePane: "bottomLeft" };

      XLSX.utils.book_append_sheet(wb, ws, "Chat History");

      // ── DOWNLOAD AS .xlsx ─────────────────────────────────────────────────
      const safeName = mentorName.replace(/\s+/g, "_").toLowerCase();
      const today    = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `chat_history_${safeName}_${today}.xlsx`);

      onSuccess?.(`Excel report downloaded — ${relevant.length} messages for ${mentorName}.`);
    } catch (err) {
      console.error("Chat history download error:", err);
      onError?.("Failed to generate Excel report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Compact icon button (used in table Actions column) ────────────────────
  if (compact) {
    return (
      <Tooltip title="Download Chat History (.xlsx)">
        <span>
          <IconButton
            size="small"
            onClick={handleDownload}
            disabled={loading}
            sx={{
              color: "#0ea5e9",
              "&:hover": { bgcolor: "#e0f2fe" },
              "&.Mui-disabled": { color: "#cbd5e1" },
            }}
          >
            {loading
              ? <CircularProgress size={16} sx={{ color: "#0ea5e9" }} />
              : <FileDownloadIcon fontSize="small" />}
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  // ── Full button (used inside the detail dialog header) ────────────────────
  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={loading ? <CircularProgress size={14} sx={{ color: "#0ea5e9" }} /> : <ChatIcon />}
      onClick={handleDownload}
      disabled={loading}
      sx={{
        color: "#0ea5e9", borderColor: "#7dd3fc",
        textTransform: "none", fontWeight: 700, borderRadius: "20px", px: 2,
        "&:hover": { bgcolor: "#e0f2fe", borderColor: "#0ea5e9" },
        "&.Mui-disabled": { color: "#94a3b8", borderColor: "#e2e8f0" },
      }}
    >
      {loading ? "Downloading…" : "Chat History (.xlsx)"}
    </Button>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const MentorManagement = () => {
  const navigate = useNavigate();
  const [mentors,           setMentors]          = useState([]);
  const [filtered,          setFiltered]         = useState([]);
  const [loading,           setLoading]          = useState(false);
  const [search,            setSearch]           = useState("");
  const [statusFilter,      setStatusFilter]     = useState("All");
  const [domainFilter,      setDomainFilter]     = useState("All");
  const [dateFrom,          setDateFrom]         = useState("");
  const [dateTo,            setDateTo]           = useState("");
  const [page,              setPage]             = useState(0);
  const [rowsPerPage]                            = useState(8);
  const [selectedMentor,    setSelectedMentor]   = useState(null);
  const [viewOpen,          setViewOpen]         = useState(false);
  const [confirmDialog,     setConfirmDialog]    = useState({ open: false, mentor: null, action: null });
  const [snack,             setSnack]            = useState({ open: false, msg: "", severity: "success" });
  const [domainConfigOpen,  setDomainConfigOpen] = useState(false);
  const [configuredDomains, setConfiguredDomains]= useState([]);

  const colid = global1.colid;
  const role  = global1.role;
  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  useEffect(() => { fetchDomains();  }, []);
  useEffect(() => { fetchMentors(); }, []);

  const fetchDomains = async () => {
    try {
      const res = await ep1.get(`/api/v2/mentors/domains?colid=${colid}&role=${role}`);
      setConfiguredDomains(res.data.data || []);
    } catch (err) { console.error("Error fetching domains:", err); }
  };

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res  = await ep1.get(`/api/v2/mentors?colid=${colid}&role=${role}`);
      const list = (res.data.data || []).map((m) => ({ ...m, domain: m.mentorshipDomain || m.domain }));
      setMentors(list);
      setFiltered(list);
    } catch (err) {
      console.error("Error fetching mentors:", err);
      showSnack("Failed to load mentors. Please try again.", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let result = [...mentors];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) => m.name?.toLowerCase().includes(q)   || m.email?.toLowerCase().includes(q) ||
               m.domain?.toLowerCase().includes(q) || m.company?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All")
      result = result.filter((m) => normalizeStatus(m.status) === normalizeStatus(statusFilter));
    if (domainFilter !== "All")
      result = result.filter((m) => m.domain === domainFilter);
    if (dateFrom) {
      const from = new Date(dateFrom); from.setHours(0, 0, 0, 0);
      result = result.filter((m) => { const d = new Date(m.createdAt || m.appliedDate || m.registeredAt); return !isNaN(d) && d >= from; });
    }
    if (dateTo) {
      const to = new Date(dateTo); to.setHours(23, 59, 59, 999);
      result = result.filter((m) => { const d = new Date(m.createdAt || m.appliedDate || m.registeredAt); return !isNaN(d) && d <= to; });
    }
    setFiltered(result); setPage(0);
  }, [search, statusFilter, domainFilter, dateFrom, dateTo, mentors]);

  const uniqueDomains = new Set([
    ...mentors.map((m) => m.domain).filter(Boolean),
    ...(configuredDomains || []).map((d) => d.name || d).filter(Boolean),
  ]);
  const domains = ["All", ...Array.from(uniqueDomains).sort()];

  const exportToExcel = () => {
    try {
      const headers = ["Name","Email","Phone","Domain","Company","Designation","Experience (yrs)","Availability","Status","Graduation Year","Applied Date"];
      const rows = filtered.map((m) => {
        const name  = m.firstName ? `${m.firstName} ${m.lastName ?? ""}`.trim() : m.name ?? "";
        const date  = m.createdAt || m.appliedDate || m.registeredAt
          ? new Date(m.createdAt || m.appliedDate || m.registeredAt).toLocaleDateString() : "";
        const avail = Array.isArray(m.availability) ? m.availability.join("; ") : m.availability ?? "";
        return [name, m.email ?? "", m.phone ?? "", m.domain ?? m.expertise?.join("; ") ?? "",
                m.company ?? "", m.jobTitle ?? m.designation ?? "", m.experience ?? "",
                avail, m.status ?? "", m.graduationYear ?? m.yearOfPassout ?? "", date];
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws["!cols"] = headers.map((h, ci) => ({ wch: Math.max(h.length, ...rows.map((r) => String(r[ci] ?? "").length)) + 4 }));
      XLSX.utils.book_append_sheet(wb, ws, "Mentors");
      XLSX.writeFile(wb, `mentor_registrations_${new Date().toISOString().slice(0, 10)}.xlsx`);
      showSnack(`Exported ${filtered.length} mentor records successfully!`);
    } catch (err) {
      console.error("Export error:", err);
      showSnack("Export failed. Please try again.", "error");
    }
  };

  const handleSaveDomains = async (d) => {
    try {
      await ep1.post(`/api/v2/mentors/domains?colid=${colid}&role=${role}`, { domains: d });
      setConfiguredDomains(d);
      showSnack("Domain configuration saved successfully!");
    } catch (err) {
      console.error("Domain save error:", err);
      showSnack("Failed to save domain configuration.", "error");
    }
  };

  const handleStatusUpdate = async (mentor, newStatus) => {
    try {
      setLoading(true);
      await ep1.post(`/api/v2/mentors/update/${mentor._id}?colid=${colid}&role=${role}`, { status: newStatus });
      setMentors((prev) => prev.map((m) => m._id === mentor._id ? { ...m, status: newStatus } : m));
      showSnack(`${mentor.firstName ?? mentor.name}'s status updated to ${newStatus}`, newStatus === "rejected" ? "warning" : "success");
    } catch (err) {
      console.error("Error updating status:", err);
      showSnack("Status update failed. Please try again.", "error");
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, mentor: null, action: null });
      if (viewOpen) setSelectedMentor((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const requestStatusChange = (mentor, newStatus) => setConfirmDialog({ open: true, mentor, action: newStatus });

  const stats = {
    total:    mentors.length,
    pending:  mentors.filter((m) => normalizeStatus(m.status) === "pending").length,
    approved: mentors.filter((m) => ["approved","active"].includes(normalizeStatus(m.status))).length,
    rejected: mentors.filter((m) => normalizeStatus(m.status) === "rejected").length,
  };

  const avatarColor = (name = "") => {
    const colors = ["#6366f1","#ec4899","#f59e0b","#10b981","#3b82f6","#e65100"];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const totalPages  = Math.ceil(filtered.length / rowsPerPage);
  const paginated   = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const actionColor = (a) => a === "rejected" ? "#ef4444" : a === "pending" ? "#f59e0b" : "#10b981";
  const actionLabel = (a) => ({ approved:"Approve", rejected:"Reject", active:"Mark Active", pending:"Set Pending" }[a] || a);
  const clearDateFilters = () => { setDateFrom(""); setDateTo(""); };

  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    if (page <= 3)              return [0,1,2,3,4,"...",totalPages-1];
    if (page >= totalPages - 4) return [0,"...",totalPages-5,totalPages-4,totalPages-3,totalPages-2,totalPages-1];
    return [0,"...",page-1,page,page+1,"...",totalPages-1];
  };

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <Box sx={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "white", px: { xs: 2, md: 4 }, py: 2.5,
        display: "flex", alignItems: "center", gap: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)", flexWrap: "wrap",
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { color: "white" } }}>
          <BackIcon />
        </IconButton>
        <MentorIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>Mentor Management</Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>Review, approve and track alumni mentors</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setDomainConfigOpen(true)}
            sx={{ color: "#a5b4fc", borderColor: "rgba(165,180,252,0.4)", textTransform: "none", fontWeight: 700, borderRadius: "20px", px: 2,
                  "&:hover": { bgcolor: "rgba(165,180,252,0.1)", borderColor: "#a5b4fc" } }}>
            Configure Domains
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToExcel}
            sx={{ bgcolor: "#10b981", "&:hover": { bgcolor: "#059669" }, textTransform: "none", fontWeight: 700,
                  borderRadius: "20px", px: 2, boxShadow: "0 4px 12px rgba(16,185,129,0.35)" }}>
            Export Excel
          </Button>
          <Badge badgeContent={stats.pending} color="warning">
            <Chip label="Pending Reviews"
              sx={{ bgcolor: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 700, border: "1px solid rgba(245,158,11,0.3)" }} />
          </Badge>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {/* ── Stats ── */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, mb: 4, justifyContent: "center" }}>
          {[
            { icon: <GroupIcon />,   label: "Total Registrations", value: stats.total,    accent: "#6366f1", sub: "All time" },
            { icon: <PendingIcon />, label: "Pending Review",       value: stats.pending,  accent: "#f59e0b", sub: "Needs attention" },
            { icon: <ApproveIcon />, label: "Active Mentors",       value: stats.approved, accent: "#10b981", sub: "Onboarded" },
            { icon: <RejectIcon />,  label: "Rejected",             value: stats.rejected, accent: "#ef4444", sub: "Not approved" },
          ].map((c, i) => <StatCard key={i} {...c} />)}
        </Box>

        {/* ── Filters ── */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: "1px solid #e5e7eb",
            display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField size="small" placeholder="Search by name, email, domain…" value={search}
            onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 220 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9ca3af", fontSize: 20 }} /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status">
              {["All","pending","approved","active","rejected"].map((s) => (
                <MenuItem key={s} value={s}>{s === "All" ? "All" : STATUS_CONFIG[s]?.label ?? s}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Domain</InputLabel>
            <Select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} label="Domain">
              {domains.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <CalendarIcon sx={{ color: "#9ca3af", fontSize: 20 }} />
            <TextField size="small" type="date" label="From" value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }}
              inputProps={{ max: dateTo || undefined }} />
            <Typography variant="body2" sx={{ color: "#9ca3af" }}>–</Typography>
            <TextField size="small" type="date" label="To" value={dateTo}
              onChange={(e) => setDateTo(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: 150 }}
              inputProps={{ min: dateFrom || undefined }} />
            {(dateFrom || dateTo) && (
              <Tooltip title="Clear date filter">
                <IconButton size="small" onClick={clearDateFilters} sx={{ color: "#ef4444" }}><CloseIcon fontSize="small" /></IconButton>
              </Tooltip>
            )}
          </Box>
          <Typography variant="body2" sx={{ color: "#6b7280", ml: "auto" }}>
            Showing <strong>{filtered.length}</strong> of <strong>{mentors.length}</strong> mentors
          </Typography>
        </Paper>

        {(dateFrom || dateTo) && (
          <Box sx={{ mb: 2 }}>
            <Chip icon={<CalendarIcon sx={{ fontSize: 14 }} />}
              label={`Date filter: ${dateFrom || "Any"} → ${dateTo || "Any"}`}
              onDelete={clearDateFilters} size="small"
              sx={{ bgcolor: "#ede9fe", color: "#6366f1", fontWeight: 600, border: "1px solid #c4b5fd" }} />
          </Box>
        )}

        {/* ── Table ── */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {["Mentor","Domain / Company","Experience","Availability","Applied Date","Status","Actions"].map((h) => (
                    <TableCell key={h} sx={{ bgcolor: "#f8fafc", fontWeight: 700, color: "#374151", fontSize: "0.75rem",
                        textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid #e5e7eb", py: 1.8 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <MentorIcon sx={{ fontSize: 48, color: "#d1d5db", mb: 1 }} />
                      <Typography variant="body2" color="textSecondary">No mentor registrations found</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginated.map((mentor) => {
                  const rawDate = mentor.createdAt || mentor.appliedDate || mentor.registeredAt;
                  const fmtDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
                  return (
                    <TableRow key={mentor._id}
                      sx={{ "&:hover": { bgcolor: "#f9fafb" }, transition: "0.15s", borderBottom: "1px solid #f3f4f6" }}>

                      {/* Mentor */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: avatarColor(mentor.firstName ?? mentor.name ?? ""), width: 40, height: 40, fontSize: "0.95rem", fontWeight: 700 }}>
                            {(mentor.firstName ?? mentor.name ?? "?").charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827" }}>
                              {mentor.firstName ? `${mentor.firstName} ${mentor.lastName ?? ""}`.trim() : mentor.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#6b7280" }}>{mentor.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Domain / Company */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#1f2937" }}>
                          {mentor.domain ?? (mentor.expertise?.[0] || "—")}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          {mentor.jobTitle ?? mentor.designation} @ {mentor.company}
                        </Typography>
                      </TableCell>

                      {/* Experience */}
                      <TableCell>
                        <Chip label={`${mentor.experience || "—"} yrs`} size="small"
                          sx={{ bgcolor: "#eff6ff", color: "#3b82f6", fontWeight: 700, fontSize: "0.72rem" }} />
                      </TableCell>

                      {/* Availability */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#374151" }}>
                          {Array.isArray(mentor.availability) ? mentor.availability[0] ?? "—" : mentor.availability || "—"}
                        </Typography>
                      </TableCell>

                      {/* Applied Date */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
                          <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.78rem" }}>{fmtDate}</Typography>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <StatusSelect mentor={mentor} onUpdate={requestStatusChange} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>

                          {/* View details */}
                          <Tooltip title="View Details">
                            <IconButton size="small"
                              onClick={() => { setSelectedMentor(mentor); setViewOpen(true); }}
                              sx={{ color: "#6366f1", "&:hover": { bgcolor: "#ede9fe" } }}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          
                          <ChatDownloadButton
                            mentor={mentor}
                            colid={colid}
                            onSuccess={(msg) => showSnack(msg, "success")}
                            onError={(msg)   => showSnack(msg, "error")}
                            compact={true}
                          />

                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5, py: 2,
                borderTop: "1px solid #f3f4f6", flexWrap: "wrap" }}>
              <Button size="small" disabled={page === 0} onClick={() => setPage(page - 1)}
                sx={{ textTransform: "none", fontWeight: 600, color: "#6366f1", borderRadius: "8px", px: 1.5,
                      "&:disabled": { color: "#d1d5db" } }}>← Prev</Button>
              {getPageNumbers().map((p, idx) =>
                p === "..." ? (
                  <Typography key={`e${idx}`} variant="body2" sx={{ px: 0.5, color: "#9ca3af" }}>…</Typography>
                ) : (
                  <Button key={p} size="small" onClick={() => setPage(p)}
                    sx={{ minWidth: 36, height: 36, fontWeight: 700, borderRadius: "8px", fontSize: "0.82rem",
                          ...(page === p
                            ? { bgcolor: "#6366f1", color: "white", "&:hover": { bgcolor: "#4f46e5" } }
                            : { color: "#374151", "&:hover": { bgcolor: "#f3f4f6" } }) }}>
                    {p + 1}
                  </Button>
                )
              )}
              <Button size="small" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}
                sx={{ textTransform: "none", fontWeight: 600, color: "#6366f1", borderRadius: "8px", px: 1.5,
                      "&:disabled": { color: "#d1d5db" } }}>Next →</Button>
              <Typography variant="caption" sx={{ color: "#9ca3af", ml: 1 }}>
                Page {page + 1} of {totalPages}
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>

      {/* ── View Details Dialog ── */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "visible" } }}>
        {selectedMentor && (() => (
          <>
            <Box sx={{ background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)", p: 3,
                display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Avatar sx={{ bgcolor: avatarColor(selectedMentor.firstName ?? selectedMentor.name ?? ""),
                  width: 60, height: 60, fontSize: "1.5rem", fontWeight: 800, border: "3px solid rgba(255,255,255,0.2)" }}>
                {(selectedMentor.firstName ?? selectedMentor.name ?? "?").charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ color: "white", fontWeight: 800 }}>
                  {selectedMentor.firstName ? `${selectedMentor.firstName} ${selectedMentor.lastName ?? ""}`.trim() : selectedMentor.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.65)" }}>
                  {selectedMentor.jobTitle ?? selectedMentor.designation} @ {selectedMentor.company}
                </Typography>
                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <StatusSelect mentor={selectedMentor} onUpdate={(m, s) => { setViewOpen(false); requestStatusChange(m, s); }} />
                  {/* Chat download also available in dialog — same mentorId-only logic */}
                  <ChatDownloadButton
                    mentor={selectedMentor}
                    colid={colid}
                    onSuccess={(msg) => showSnack(msg, "success")}
                    onError={(msg)   => showSnack(msg, "error")}
                    compact={false}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setViewOpen(false)} sx={{ color: "rgba(255,255,255,0.5)" }}><CloseIcon /></IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              {selectedMentor.bio && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e5e7eb" }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>About</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: "#374151", lineHeight: 1.7 }}>{selectedMentor.bio}</Typography>
                </Paper>
              )}
              <DetailRow icon={<EmailIcon fontSize="small" />}      label="Email"             value={selectedMentor.email} />
              <DetailRow icon={<PhoneIcon fontSize="small" />}      label="Phone"             value={selectedMentor.phone} />
              <DetailRow icon={<BusinessIcon fontSize="small" />}   label="Company"           value={`${selectedMentor.jobTitle ?? selectedMentor.designation ?? ""} @ ${selectedMentor.company ?? ""}`} />
              <DetailRow icon={<SchoolIcon fontSize="small" />}     label="Degree"            value={selectedMentor.degree} />
              <DetailRow icon={<SchoolIcon fontSize="small" />}     label="Graduation Year"   value={selectedMentor.graduationYear ?? selectedMentor.yearOfPassout} />
              <DetailRow icon={<WorkIcon fontSize="small" />}       label="Department"        value={selectedMentor.department} />
              <DetailRow icon={<TrendingIcon fontSize="small" />}   label="Experience"        value={selectedMentor.experience ? `${selectedMentor.experience} years` : null} />
              <DetailRow icon={<MentorIcon fontSize="small" />}     label="Mentorship Domain" value={selectedMentor.mentorshipDomain ?? selectedMentor.domain} />
              <DetailRow icon={<CategoryIcon fontSize="small" />}   label="Domains"           value={Array.isArray(selectedMentor.domains) ? selectedMentor.domains.join(", ") : selectedMentor.domains} />
              <DetailRow icon={<BadgeIcon fontSize="small" />}      label="Semester"          value={selectedMentor.semester} />
              <DetailRow icon={<PeopleIcon fontSize="small" />}     label="Max Students"      value={selectedMentor.maxStudents} />
              <DetailRow icon={<AccessTimeIcon fontSize="small" />} label="Session Duration"  value={selectedMentor.sessionDuration ? `${selectedMentor.sessionDuration} mins` : null} />
              <DetailRow icon={<GroupIcon fontSize="small" />}      label="Session Types"     value={Array.isArray(selectedMentor.sessionTypes) ? selectedMentor.sessionTypes.join(", ") : selectedMentor.sessionTypes} />
              <DetailRow icon={<PersonAddIcon fontSize="small" />}  label="Availability"      value={Array.isArray(selectedMentor.availability) ? selectedMentor.availability.join(", ") : selectedMentor.availability} />
              <DetailRow icon={<LocationIcon fontSize="small" />}   label="City"              value={selectedMentor.city} />
              <DetailRow icon={<LocationIcon fontSize="small" />}   label="Country"           value={selectedMentor.country} />
              <DetailRow icon={<LinkedInIcon fontSize="small" />}   label="LinkedIn"          value={selectedMentor.linkedin} />
              <DetailRow icon={<CalendarIcon fontSize="small" />}   label="Applied Date"
                value={(selectedMentor.createdAt || selectedMentor.appliedDate || selectedMentor.registeredAt)
                  ? new Date(selectedMentor.createdAt || selectedMentor.appliedDate || selectedMentor.registeredAt)
                      .toLocaleDateString("en-IN", { day:"2-digit", month:"long", year:"numeric" })
                  : null} />

              {selectedMentor.expertise?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Areas of Expertise</Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                    {selectedMentor.expertise.map((s) => (
                      <Chip key={s} label={s} size="small" sx={{ bgcolor: "#ede9fe", color: "#6366f1", fontWeight: 600 }} />
                    ))}
                  </Box>
                </Box>
              )}
              {selectedMentor.achievements && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Achievements</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: "#374151", lineHeight: 1.7 }}>{selectedMentor.achievements}</Typography>
                </Box>
              )}
              {selectedMentor.mentorshipGoals && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Mentorship Goals</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5, color: "#374151", lineHeight: 1.7 }}>{selectedMentor.mentorshipGoals}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setViewOpen(false)} sx={{ textTransform: "none", fontWeight: 600 }}>Close</Button>
            </DialogActions>
          </>
        ))()}
      </Dialog>

      {/* ── Confirm Status Dialog ── */}
      <Dialog open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, mentor: null, action: null })}
        PaperProps={{ sx: { borderRadius: 3, maxWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <SwapIcon sx={{ color: actionColor(confirmDialog.action) }} />
          Change Status to "{STATUS_CONFIG[confirmDialog.action]?.label ?? confirmDialog.action}"?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary">
            {confirmDialog.action === "approved"
              ? `${confirmDialog.mentor?.firstName ?? confirmDialog.mentor?.name} will be onboarded as a mentor and can begin accepting mentee requests.`
              : confirmDialog.action === "rejected"
              ? `${confirmDialog.mentor?.firstName ?? confirmDialog.mentor?.name}'s application will be rejected.`
              : confirmDialog.action === "active"
              ? `${confirmDialog.mentor?.firstName ?? confirmDialog.mentor?.name} will be marked as an active mentor.`
              : `Status will be updated to "${confirmDialog.action}".`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDialog({ open: false, mentor: null, action: null })}
            sx={{ textTransform: "none", fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={() => handleStatusUpdate(confirmDialog.mentor, confirmDialog.action)}
            sx={{ bgcolor: actionColor(confirmDialog.action), "&:hover": { filter: "brightness(0.9)" },
                  textTransform: "none", fontWeight: 700, borderRadius: "20px", px: 3 }}>
            {actionLabel(confirmDialog.action)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Domain Configuration Dialog ── */}
      <DomainConfigDialog
        open={domainConfigOpen}
        onClose={() => setDomainConfigOpen(false)}
        configuredDomains={configuredDomains}
        onSave={handleSaveDomains}
      />

      {/* ── Snackbar ── */}
      <Snackbar open={snack.open} autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MentorManagement;