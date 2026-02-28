import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  Box, Container, Grid, Paper, Typography, Avatar, Button,
  IconButton, MenuItem, Select, Chip, Stack,
  CircularProgress, Snackbar, Alert, TextField,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import EditIcon        from "@mui/icons-material/Edit";
import SaveIcon        from "@mui/icons-material/Save";
import CancelIcon      from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VerifiedIcon    from "@mui/icons-material/VerifiedUser";
import InfoIcon        from "@mui/icons-material/Info";
import ep1 from "../api/ep1";
import global1 from "./global1";
 
const theme = createTheme({
  palette: {
    primary:    { main: "#1a56db", light: "#EBF4FF", dark: "#1239a5", contrastText: "#fff" },
    background: { default: "#F0F4F8", paper: "#fff" },
    text:       { primary: "#111827", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    fontSize: 16,
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8, fontSize: "0.95rem" },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { fontSize: "0.95rem" } },
    },
  },
});
 
const flatInput = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#F3F4F6",
    borderRadius: "8px",
    fontSize: "0.97rem",
    color: "#111827",
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "2px solid #1a56db", borderRadius: "8px" },
    "&.Mui-disabled": { backgroundColor: "#F3F4F6" },
  },
  "& .MuiInputBase-input": { padding: "13px 16px", fontSize: "0.97rem" },
  "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#374151", cursor: "default" },
  "& textarea.MuiInputBase-input": { padding: "12px 16px" },
};

const flatSelect = {
  width: "100%",
  backgroundColor: "#F3F4F6",
  borderRadius: "8px",
  fontSize: "0.97rem",
  color: "#111827",
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "2px solid #1a56db" },
  "&.Mui-disabled": { backgroundColor: "#F3F4F6", opacity: 1 },
  "& .MuiSelect-select": { padding: "13px 16px", fontSize: "0.97rem" },
  "& .MuiSvgIcon-root": { color: "#9CA3AF" },
};

 
function TF({ label, name, value, onChange, type = "text", multiline = false, rows = 3, editing, xs = 12, sm = 6 }) {
  const safe = (() => {
    if (value === null || value === undefined) return "";
    if (type === "date") return value ? dayjs(value).format("YYYY-MM-DD") : "";
    return String(value);
  })();
  return (
    <Grid item xs={xs} sm={sm}>
      <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#374151", mb: 0.75 }}>{label}</Typography>
      <TextField
        fullWidth name={name} value={safe} onChange={onChange}
        type={type} disabled={!editing}
        multiline={multiline} rows={multiline ? rows : undefined}
        InputLabelProps={type === "date" ? { shrink: true } : undefined}
        placeholder={`Enter ${label}`}
        sx={flatInput}
      />
    </Grid>
  );
}

function DD({ label, name, value, onChange, options, editing, xs = 12, sm = 6 }) {
  const safe = (value !== null && value !== undefined && value !== "") ? String(value) : "";
  return (
    <Grid item xs={xs} sm={sm}>
      <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: "#374151", mb: 0.75 }}>{label}</Typography>
      <Select
        name={name} value={safe} onChange={onChange}
        disabled={!editing} displayEmpty fullWidth
        renderValue={(v) => {
          if (!v) return <span style={{ color: "#9CA3AF" }}>Select {label}</span>;
          const found = options.find(o => String(o.value) === String(v));
          return found ? found.label : v;
        }}
        sx={flatSelect}
      >
        {options.map(o => (
          <MenuItem key={o.value} value={String(o.value)}>{o.label}</MenuItem>
        ))}
      </Select>
    </Grid>
  );
}

/* ─── Section Block ─────────────────────────────────────────────────────── */
function Section({ title, children }) {
  return (
    <Box sx={{ mb: 5 }}>
      {/* Full-width heading row — clearly separated */}
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        mb: 3,
      }}>
        <Box sx={{ width: 4, height: 26, bgcolor: "#1a56db", borderRadius: 2, flexShrink: 0 }} />
        <Typography sx={{ fontSize: "1.15rem", fontWeight: 700, color: "#111827", letterSpacing: "0.01em" }}>
          {title}
        </Typography>
        <Box sx={{ flex: 1, height: "1px", bgcolor: "#E5E7EB", ml: 1 }} />
      </Box>
      <Grid container spacing={2.5}>
        {children}
      </Grid>
    </Box>
  );
}
export default function ProfilePage() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form,    setForm]    = useState({});
  const [snack,   setSnack]   = useState({ open: false, text: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const stored = localStorage.getItem("currentUser");
      if (!stored) { navigate("/"); return; }
      const { _id } = JSON.parse(stored);
      const colid = global1.colid;
      const res  = await ep1.get(`/api/v2/users/${_id}?colid=${colid}`);
      const json = res.data;
      if (json.success) { setUser(json.data); setForm(json.data); }
      else notify("Failed to load profile", "error");
    } catch { notify("Error loading profile", "error"); }
    finally { setLoading(false); }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const onSave = async () => {
    try {
      const colid = global1.colid;
      const res  = await ep1.post("/api/v2/user/edit", { ...form, _id: user._id, colid });
      const json = res.data;
      if (json.success) {
        const updated = json.user || json.data || form;
        setUser(updated); setForm(updated);
        const s = JSON.parse(localStorage.getItem("currentUser") || "{}");
        localStorage.setItem("currentUser", JSON.stringify({ ...s, ...updated }));
        setEditing(false);
        notify("Profile updated successfully!", "success");
      } else notify(json.message || "Update failed", "error");
    } catch { notify("Error saving profile", "error"); }
  };

  const notify = (text, severity = "success") => setSnack({ open: true, text, severity });

  if (loading) return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#F0F4F8" }}>
        <CircularProgress size={50} sx={{ color: "#1a56db" }} />
      </Box>
    </ThemeProvider>
  );
 
  const genderVal = (() => {
    const v = String(form.gender || "");
    return ["Male","Female","Other","Prefer not to say"].includes(v) ? v : "";
  })();
  const roleVal = (() => {
    const v = String(form.role || "");
    return ["Student","Faculty","Alumni","Admin"].includes(v) ? v : "";
  })();
  const statusVal = (() => {
    const v = form.status;
    if (v === 1 || v === "1" || String(v).toLowerCase() === "active")   return "1";
    if (v === 0 || v === "0" || String(v).toLowerCase() === "inactive") return "0";
    return "";
  })();
  const mentorVal = (form.isMentor === true || form.isMentor === "true" || form.isMentor === "Yes") ? "true" : "false";
  const disabilityVal = (() => {
    const v = form.isdisabled;
    if (v === true  || v === 1 || String(v).toLowerCase() === "yes") return "Yes";
    if (v === false || v === 0 || String(v).toLowerCase() === "no")  return "No";
    return "";
  })();

  const T = (props) => <TF onChange={onChange} editing={editing} {...props} />;
  const D = (props) => <DD onChange={onChange} editing={editing} {...props} />;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#F0F4F8" }}>
        <Container maxWidth={false} sx={{ width: "90%", py: 4, px: { xs: 2, sm: 3 }, mx: "auto" }}>
          <Paper sx={{
            borderRadius: 3,
            boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            mb: 3,
            overflow: "hidden",
          }}>
            <Box sx={{ px: { xs: 3, sm: 4 }, py: 3, display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <Avatar src={user?.photo}
                  sx={{ width: 80, height: 80, bgcolor: "#1a56db", fontSize: "2rem", fontWeight: 700, border: "3px solid #EBF4FF", boxShadow: "0 2px 10px rgba(26,86,219,0.25)" }}>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                {editing && (
                  <IconButton component="label" size="small"
                    sx={{ position: "absolute", bottom: 0, right: 0, bgcolor: "#1a56db", color: "#fff", border: "2px solid #fff", width: 26, height: 26, "&:hover": { bgcolor: "#1239a5" } }}>
                    <PhotoCameraIcon sx={{ fontSize: "0.78rem" }} />
                    <input type="file" accept="image/*" hidden />
                  </IconButton>
                )}
              </Box>

              {/* Name / email / chips */}
              <Box sx={{ flexGrow: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" mb={0.35}>
                  <Typography sx={{ fontSize: "1.35rem", fontWeight: 700, color: "#111827" }}>
                    {user?.name}
                  </Typography>
                  {(user?.status === 1 || user?.status === "Active") }
                </Stack>
                <Typography sx={{ fontSize: "0.95rem", color: "#6B7280", mb: 1 }}>
                  {user?.email}
                </Typography>
                <Stack direction="row" spacing={0.75} flexWrap="wrap">
                  {user?.role       && <Chip label={user.role}       size="small" color="primary" sx={{ fontWeight: 600, fontSize: "0.82rem" }} />}
                  {user?.regno      && <Chip label={user.regno}      size="small" variant="outlined" color="primary" sx={{ fontSize: "0.82rem" }} />}
                </Stack>
              </Box>
 
              {!editing ? (
                <Button variant="contained" startIcon={<EditIcon />}
                  disableElevation onClick={() => setEditing(true)}
                  sx={{ bgcolor: "#1a56db", "&:hover": { bgcolor: "#1239a5" }, px: 3 }}>
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button variant="outlined" startIcon={<CancelIcon />}
                    onClick={() => { setEditing(false); setForm(user); }}
                    sx={{ borderColor: "#D1D5DB", color: "#6B7280" }}>
                    Cancel
                  </Button>
                  <Button variant="contained" disableElevation startIcon={<SaveIcon />}
                    onClick={onSave}
                    sx={{ bgcolor: "#15803d", "&:hover": { bgcolor: "#166534" } }}>
                    Save Changes
                  </Button>
                </Stack>
              )}
            </Box>

            {/* Edit notice */}
            {editing && (
              <Box sx={{ px: 4, py: 1.1, bgcolor: "#EBF4FF", borderTop: "1px solid #BFDBFE", display: "flex", alignItems: "center", gap: 1 }}>
                <InfoIcon sx={{ fontSize: "1rem", color: "#1a56db" }} />
                <Typography sx={{ fontSize: "0.9rem", color: "#1a56db", fontWeight: 600 }}>
                  Edit mode active — all fields are editable. Click Save Changes when done.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* ── Fields Card ── */}
          <Paper sx={{ borderRadius: 3, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", px: { xs: 3, sm: 5 }, py: 4 }}>

            {/* ── 1. Account Information ── */}
            <Section title="Account Information">
              <T label="Full Name"        name="name"     value={form.name}     xs={12} sm={6} />
              <T label="Email Address"    name="email"    value={form.email}    xs={12} sm={6} />
              <T label="User (Login ID)"  name="user"     value={form.user}     xs={12} sm={6} />
              <T label="Password"         name="password" value={form.password} xs={12} sm={6} />
              <D label="Role"             name="role"     value={roleVal}       xs={12} sm={6}
                options={[
                  { value: "Student", label: "Student" },
                  { value: "Faculty", label: "Faculty" },
                  { value: "Alumni",  label: "Alumni"  },
                  { value: "Admin",   label: "Admin"   },
                ]}
              />
              <D label="Account Status" name="status" value={statusVal} xs={12} sm={6}
                options={[
                  { value: "1", label: "Active"   },
                  { value: "0", label: "Inactive" },
                ]}
              />
            </Section>

            {/* ── 2. Personal Information ── */}
            <Section title="Personal Information">
              <T label="Phone Number"     name="phone"      value={form.phone}      xs={12} sm={6} />
              <T label="WhatsApp Number"  name="wpno"       value={form.wpno}       xs={12} sm={6} />
              <D label="Gender"           name="gender"     value={genderVal}       xs={12} sm={6}
                options={[
                  { value: "Male",              label: "Male"             },
                  { value: "Female",            label: "Female"           },
                  { value: "Other",             label: "Other"            },
                  { value: "Prefer not to say", label: "Prefer not to say"},
                ]}
              />
              <T label="Blood Group"      name="bloodgroup" value={form.bloodgroup} xs={12} sm={6} />
              <T label="Date of Birth"    name="dob"        value={form.dob}        type="date" xs={12} sm={6} />
              <T label="Father's Name"    name="fathername" value={form.fathername} xs={12} sm={6} />
              <T label="Mother's Name"    name="mothername" value={form.mothername} xs={12} sm={6} />
              <T label="Aadhaar Number"   name="adhaarno"   value={form.adhaarno}   xs={12} sm={6} />
              <T label="Annual Income"    name="income"     value={form.income}     xs={12} sm={6} />
              <T label="Category"         name="category"   value={form.category}   xs={12} sm={6} />
              <T label="Quota"            name="quota"      value={form.quota}      xs={12} sm={6} />
              <D label="Disability Status" name="isdisabled" value={disabilityVal}  xs={12} sm={6}
                options={[
                  { value: "No",  label: "No"  },
                  { value: "Yes", label: "Yes" },
                ]}
              />
              <T 
  label="Residential Address"
  name="address"
  value={form.address}
  multiline
  rows={3}
  xs={12}
  sm={12}
  sx={{
    width: "100%",
    maxWidth: 900    
  }}
/>
            </Section>

            {/* ── 3. Academic Information ── */}
            <Section title="Academic Information">
              <T label="Registration No"    name="regno"           value={form.regno}           xs={12} sm={6} />
              <T label="Roll No"            name="rollno"          value={form.rollno}          xs={12} sm={6} />
              <T label="Department"         name="department"      value={form.department}      xs={12} sm={6} />
              <T label="Program Code"       name="programcode"     value={form.programcode}     xs={12} sm={6} />
              <T label="Admission Year"     name="admissionyear"   value={form.admissionyear}   xs={12} sm={6} />
              <T label="Semester"           name="semester"        value={form.semester}        xs={12} sm={6} />
              <T label="Section"            name="section"         value={form.section}         xs={12} sm={6} />
              <T label="College ID"         name="colid"           value={form.colid}           xs={12} sm={6} />
              <T label="ABC ID"             name="abcid"           value={form.abcid}           xs={12} sm={6} />
              <T label="Joining Date"       name="joiningdate"     value={form.joiningdate}     type="date" xs={12} sm={6} />
              <T label="Degree"             name="degree"          value={form.degree}          xs={12} sm={6} />
              <T label="Merit"              name="merit"           value={form.merit}           xs={12} sm={6} />
              <T label="Minor Subject"      name="minorsub"        value={form.minorsub}        xs={12} sm={6} />
              <T label="Vocational Subject" name="vocationalsub"   value={form.vocationalsub}   xs={12} sm={6} />
              <T label="CBSE No"            name="cbseno"          value={form.cbseno}          xs={12} sm={6} />
              <T label="Eligibility Name"   name="eligibilityname" value={form.eligibilityname} xs={12} sm={6} />
            </Section>

            {/* ── 4. Professional & Other ── */}
            <Section title="Professional & Other">
              <T label="Designation"           name="designation"      value={form.designation}      xs={12} sm={6} />
              <T label="Current Company"       name="currentCompany"   value={form.currentCompany}   xs={12} sm={6} />
              <T label="Mentorship Domain"     name="mentorshipDomain" value={form.mentorshipDomain} xs={12} sm={6} />
              <D label="Registered as Mentor?" name="isMentor"         value={mentorVal}             xs={12} sm={6}
                options={[
                  { value: "false", label: "No"  },
                  { value: "true",  label: "Yes" },
                ]}
              />
              <T label="NCC Type"   name="ncctype"     value={form.ncctype}     xs={12} sm={6} />
              <T label="Scholarship" name="scholarship" value={form.scholarship} xs={12} sm={6} />
              <T label="Last Login"  name="lastLogin"   value={form.lastLogin}   xs={12} sm={6} />
            </Section>

          </Paper>
        </Container>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2, fontWeight: 600, fontSize: "0.95rem" }}>
          {snack.text}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}