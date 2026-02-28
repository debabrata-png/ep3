import React, { useState, useEffect } from "react";
import {
  Container, Box, Typography, TextField, Button, Grid, Paper, Avatar, Chip,
  MenuItem, FormControl, InputLabel, Select, OutlinedInput, Checkbox, ListItemText,
  Stepper, Step, StepLabel, Divider, Alert, Snackbar, InputAdornment,
  LinearProgress, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableRow, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from "@mui/material";
import {
  EmojiPeople as MentorIcon, Person as PersonIcon, Work as WorkIcon,
  School as SchoolIcon, CheckCircle as CheckCircleIcon, ArrowBack as BackIcon,
  ArrowForward as NextIcon, LinkedIn as LinkedInIcon, Email as EmailIcon,
  Phone as PhoneIcon, Business as BusinessIcon, Star as StarIcon,
  Delete as DeleteIcon, HourglassEmpty as PendingIcon, Cancel as RejectedIcon,
  Edit as EditIcon, Category as CategoryIcon, Info as InfoIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import global1 from "./global1";

const ep1 = "http://localhost:5000";

// ─── Constants ────────────────────────────────────────────────────────────────

const AVAILABILITY_OPTIONS = [
  "Weekday Mornings", "Weekday Evenings", "Weekend Mornings",
  "Weekend Afternoons", "Flexible / On Request",
];
const SESSION_TYPES = [
  "1-on-1 Video Call", "Group Session", "Email / Chat Mentorship", "In-person (if local)",
];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const GRADUATION_YEARS = Array.from({ length: 40 }, (_, i) => 2024 - i);
const STEPS = ["Personal Info", "Professional Details", "Mentorship Preferences", "Review & Submit"];

// ─── Design Tokens ────────────────────────────────────────────────────────────

const ORANGE      = "#e65100";
const ORANGE_DARK = "#bf360c";
const ORANGE_SOFT = "#fff3e0";
const ORANGE_MID  = "#ffe0b2";
const TEXT_DARK   = "#1a1a2e";
const TEXT_MID    = "#6b6b80";
const BORDER      = "#e5e0db";

// ─── SINGLE SOURCE OF TRUTH FOR ALL FIELD SIZING ─────────────────────────────
// Every text field, select, and multi-select uses these exact values.
// INPUT_HEIGHT controls the inner padding so all boxes are identical height.

const LABEL_SIZE  = "1.05rem";   // floating label font size
const INPUT_SIZE  = "1.05rem";   // typed text font size
const INPUT_PY    = "15px";      // vertical padding inside input → consistent height
const INPUT_PX    = "14px";      // horizontal padding

// ─── Shared field sx — applied to EVERY TextField ────────────────────────────

const fieldSx = {
  "& .MuiInputLabel-root": {
    fontSize: LABEL_SIZE,
    color: TEXT_MID,
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": { color: ORANGE },
  "& .MuiInputLabel-shrink": { fontSize: "0.85rem" },          // shrunk label stays readable
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#fff",
    fontSize: INPUT_SIZE,
    minWidth: 220,
    transition: "box-shadow 0.18s",
    "& fieldset": { borderColor: "#ddd8d2", borderWidth: "1.5px" },
    "&:hover fieldset": { borderColor: ORANGE },
    "&.Mui-focused fieldset": { borderColor: ORANGE, borderWidth: "2px" },
    "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(230,81,0,0.10)" },
  },
  // Single-line inputs: fixed padding so all single-line boxes are same height
  "& .MuiOutlinedInput-input:not(textarea)": {
    py: INPUT_PY,
    px: INPUT_PX,
    fontSize: INPUT_SIZE,
    fontWeight: 500,
  },
  // Textarea: top-align text, keep horizontal padding
  "& .MuiOutlinedInput-input.MuiInputBase-inputMultiline": {
    px: INPUT_PX,
    fontSize: INPUT_SIZE,
  },
  "& .MuiFormHelperText-root": { fontSize: "0.85rem", mt: 0.6 },
};

// ─── FormControl wrapper sx (for Select) ─────────────────────────────────────

const fcSx = {
  "& .MuiInputLabel-root": {
    fontSize: LABEL_SIZE,
    color: TEXT_MID,
    fontWeight: 500,
  },
  "& .MuiInputLabel-root.Mui-focused": { color: ORANGE },
  "& .MuiInputLabel-shrink": { fontSize: "0.85rem" },
};

// ─── Select input sx ─────────────────────────────────────────────────────────

const selSx = {
  borderRadius: "10px",
  backgroundColor: "#fff",
  fontSize: INPUT_SIZE,
  fontWeight: 500,
  minWidth: 220,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd8d2", borderWidth: "1.5px" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: ORANGE },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: ORANGE, borderWidth: "2px" },
  "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(230,81,0,0.10)" },
  // Make the select value same height as text fields
  "& .MuiSelect-select": { py: INPUT_PY, px: INPUT_PX, fontSize: INPUT_SIZE, fontWeight: 500 },
};

// ─── Orange section sub-label ─────────────────────────────────────────────────

const SectionLabel = ({ children }) => (
  <Typography sx={{
    fontWeight: 800,
    fontSize: "0.82rem",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    color: ORANGE,
    borderLeft: `3px solid ${ORANGE}`,
    pl: 1.5,
    mb: 2.5,
  }}>
    {children}
  </Typography>
);

// ─── Banner ───────────────────────────────────────────────────────────────────

const Banner = ({ subtitle }) => (
  <Box sx={{
    background: `linear-gradient(135deg, ${ORANGE} 0%, #ff6d00 55%, #ff9100 100%)`,
    color: "#fff", py: { xs: 5, md: 6.5 }, px: 3,
    textAlign: "center", position: "relative", overflow: "hidden",
    "&::before": { content: '""', position: "absolute", top: -70, right: -70, width: 260, height: 260, borderRadius: "50%", background: "rgba(255,255,255,0.07)" },
    "&::after":  { content: '""', position: "absolute", bottom: -90, left: -50, width: 320, height: 320, borderRadius: "50%", background: "rgba(255,255,255,0.05)" },
  }}>
    <Avatar sx={{ width: 68, height: 68, bgcolor: "rgba(255,255,255,0.18)", mx: "auto", mb: 2.5, border: "2px solid rgba(255,255,255,0.35)", position: "relative", zIndex: 1 }}>
      <MentorIcon sx={{ fontSize: 38 }} />
    </Avatar>
    <Typography variant="h2" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: -1, color: "#fff", position: "relative", zIndex: 1, lineHeight: 1.1 }}>
      Mentor Registration
    </Typography>
    <Typography sx={{ opacity: 0.9, maxWidth: 520, mx: "auto", position: "relative", zIndex: 1, lineHeight: 1.7, fontSize: "1.1rem" }}>
      {subtitle}
    </Typography>
  </Box>
);

// ─── Step 1 — Personal Info ───────────────────────────────────────────────────

const StepPersonalInfo = ({ form, onChange }) => {
  const accountRows = [
    ["Reg. No.",       form.regno],
    ["Roll No.",       form.rollno],
    ["Gender",         form.gender],
    ["Role",           form.role],
    ["Program Code",   form.programcode],
    ["Admission Year", form.admissionyear],
    ["Semester",       form.semesterMeta],
    ["Section",        form.section],
    ["Mentor Status",  form.isMentor ? "Active Mentor" : ""],
  ].filter(([, v]) => v && String(v).trim() !== "");

  return (
    <Box>
       

      <Grid container spacing={3}>
{/* 
        
        {accountRows.length > 0 && (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "12px",
                bgcolor: "#fffaf6",
                border: `1.5px dashed ${ORANGE_MID}`
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  color: ORANGE,
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  fontSize: "0.78rem",
                  mb: 2
                }}
              >
                Account Information · Auto-filled · Read-only
              </Typography>

              <Grid container spacing={2.5}>
                {accountRows.map(([label, val]) => (
                  <Grid item xs={6} sm={4} md={3} key={label}>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#aaa",
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                        mb: 0.4
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: TEXT_DARK,
                        fontSize: "1rem"
                      }}
                    >
                      {val}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )} */}

        {/* Row 1 */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: ORANGE, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            sx={fieldSx}
          />
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: ORANGE, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={form.phone}
            onChange={onChange}
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: ORANGE, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={form.city}
            onChange={onChange}
            sx={fieldSx}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Country"
            name="country"
            value={form.country}
            onChange={onChange}
            sx={fieldSx}
          />
        </Grid>

        {/* Row 3 */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="LinkedIn Profile URL"
            name="linkedin"
            value={form.linkedin}
            onChange={onChange}
            placeholder="https://linkedin.com/in/yourprofile"
            sx={fieldSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkedInIcon sx={{ color: "#0077B5", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        
          <TextField
            fullWidth
            multiline
            rows={5}
            label="Short Bio"
            name="bio"
            value={form.bio}
            onChange={onChange}
            placeholder="Write a brief introduction about yourself (max 1100 characters)…"
            inputProps={{ maxLength: 1100 }}
            helperText={`${(form.bio || "").length} / 1100 characters`}
           sx={{
      ...fieldSx,
      maxWidth: 1330   // 👈 maximum width added
    }}
          />
        

      </Grid>
    </Box>
  );
};


// ─── Step 2 — Professional Details ───────────────────────────────────────────

const StepProfessionalDetails = ({ form, onChange, domains, domainsLoading }) => (
  <Box>
     

    <Grid container spacing={3}>

      {/* Row 1 */}
      {/* Row 1 */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Current Job Title"
          name="jobTitle"
          value={form.jobTitle}
          onChange={onChange}
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <WorkIcon sx={{ color: ORANGE, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Current Company / Organization"
          name="company"
          value={form.company}
          onChange={onChange}
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon sx={{ color: ORANGE, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
      </Grid>

      {/* Row 2 */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="Years of Experience"
          name="experience"
          type="number"
          value={form.experience}
          onChange={onChange}
          inputProps={{ min: 0, max: 50 }}
          sx={fieldSx}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth sx={fcSx}>
          <InputLabel>Graduation Year</InputLabel>
          <Select
            name="graduationYear"
            value={form.graduationYear}
            onChange={onChange}
            label="Graduation Year"
            sx={selSx}
            startAdornment={
              <InputAdornment position="start">
                <SchoolIcon sx={{ color: ORANGE, fontSize: 20 }} />
              </InputAdornment>
            }
          >
            {GRADUATION_YEARS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Row 3 */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Degree / Qualification"
          name="degree"
          value={form.degree}
          onChange={onChange}
          sx={fieldSx}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Department / Branch"
          name="department"
          value={form.department}
          onChange={onChange}
          sx={fieldSx}
        />
      </Grid>

      {/* Row 4 */}
      <Grid item xs={12} sm={6}>
        <FormControl
          fullWidth
          disabled={domainsLoading}
          sx={fcSx}
        >
          <InputLabel>Mentorship Domain *</InputLabel>
          <Select
            name="mentorshipDomain"
            value={form.mentorshipDomain}
            onChange={onChange}
            label="Mentorship Domain *"
            sx={selSx}
            startAdornment={
              <InputAdornment position="start">
                <CategoryIcon sx={{ color: ORANGE, fontSize: 20 }} />
              </InputAdornment>
            }
          >
            {domainsLoading ? (
              <MenuItem disabled>Loading…</MenuItem>
            ) : domains.length === 0 ? (
              <MenuItem disabled>No domains configured</MenuItem>
            ) : (
              domains.map((d) => (
                <MenuItem key={d._id || d} value={d.name || d}>
                  {d.name || d}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      </Grid>

       
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Notable Achievements / Career Highlights"
          name="achievements"
          value={form.achievements}
          onChange={onChange}
          sx={{
      ...fieldSx,
      maxWidth: 790   // 👈 maximum width added
    }}
        />
      

    </Grid>
  </Box>
);


// ─── Step 3 — Mentorship Preferences ─────────────────────────────────────────

const StepMentorshipPreferences = ({ form, onChange }) => (
  <Box>
    <Grid container spacing={3}>

      {/* Row 1: Max Students, Session Duration */}
      <Grid item xs={12} sm={6}>
        <TextField fullWidth required label="Max. Students per Month" name="maxStudents" type="number"
          value={form.maxStudents} onChange={onChange}
          inputProps={{ min: 1, max: 20 }}
          sx={fieldSx}
          InputProps={{ startAdornment: <InputAdornment position="start"><StarIcon sx={{ color: ORANGE, fontSize: 20 }} /></InputAdornment> }} />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Session Duration (minutes)"
          name="sessionDuration"
          type="number"
          value={form.sessionDuration}
          onChange={onChange}
          inputProps={{ min: 15, max: 120, step: 15 }}
          placeholder="e.g. 30, 45, 60"
          sx={fieldSx}
        />
      </Grid>

      {/* Row 2: Availability, Session Types */}
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth sx={fcSx}>
          <InputLabel>Availability *</InputLabel>
          <Select multiple name="availability" value={form.availability} onChange={onChange}
            input={<OutlinedInput label="Availability *" sx={{ borderRadius: "10px", fontSize: INPUT_SIZE }} />}
            renderValue={(sel) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, py: 0.3 }}>
                {sel.map((v) => <Chip key={v} label={v} size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: "0.85rem", height: 26 }} />)}
              </Box>
            )}
            sx={selSx}>
            {AVAILABILITY_OPTIONS.map((o) => (
              <MenuItem key={o} value={o}>
                <Checkbox checked={form.availability.includes(o)} sx={{ "&.Mui-checked": { color: ORANGE } }} />
                <ListItemText primary={o} primaryTypographyProps={{ fontSize: "1rem" }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth sx={fcSx}>
          <InputLabel>Preferred Session Types *</InputLabel>
          <Select multiple name="sessionTypes" value={form.sessionTypes} onChange={onChange}
            input={<OutlinedInput label="Preferred Session Types *" sx={{ borderRadius: "10px", fontSize: INPUT_SIZE }} />}
            renderValue={(sel) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, py: 0.3 }}>
                {sel.map((v) => <Chip key={v} label={v} size="small" sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 700, fontSize: "0.85rem", height: 26 }} />)}
              </Box>
            )}
            sx={selSx}>
            {SESSION_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                <Checkbox checked={form.sessionTypes.includes(t)} sx={{ "&.Mui-checked": { color: ORANGE } }} />
                <ListItemText primary={t} primaryTypographyProps={{ fontSize: "1rem" }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Row 3: Mentorship Goals + Semester side by side */}
       

      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required sx={fcSx}>
          <InputLabel>Semester *</InputLabel>
          <Select
            name="semester"
            value={form.semester}
            onChange={onChange}
            label="Semester *"
            sx={selSx}
            startAdornment={
              <InputAdornment position="start">
                <SchoolIcon sx={{ color: ORANGE, fontSize: 20 }} />
              </InputAdornment>
            }
          >
            {SEMESTERS.map((s) => (
              <MenuItem key={s} value={s}>{`Semester ${s}`}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
       
        <TextField fullWidth multiline rows={4} label="Mentorship Goals / Message to Students"
          name="mentorshipGoals" value={form.mentorshipGoals} onChange={onChange}
          placeholder="Describe what you hope to offer as a mentor and what students can expect…"
          sx={{
      ...fieldSx,
      maxWidth: 900   // 👈 maximum width added
    }} />
      
    </Grid>
  </Box>
);

// ─── Step 4 — Review ──────────────────────────────────────────────────────────

const RCell = ({ label, value, chipColor }) => {
  if (!value && !Array.isArray(value)) return null;
  const empty = Array.isArray(value) ? value.length === 0 : !String(value).trim();
  if (empty) return null;
  return (
    <Box>
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "#111", textTransform: "uppercase", letterSpacing: "0.8px", mb: 0.6 }}>
        {label}
      </Typography>
      {Array.isArray(value) ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
          {value.map((v) => (
            <Chip key={v} label={v} size="small" sx={{ bgcolor: chipColor?.bg || ORANGE_SOFT, color: chipColor?.fg || ORANGE, fontWeight: 700, fontSize: "0.92rem", height: 28 }} />
          ))}
        </Box>
      ) : (
        <Typography sx={{ fontSize: "1.1rem", fontWeight: 500, color: "#555", lineHeight: 1.45, wordBreak: "break-word" }}>
          {value}
        </Typography>
      )}
    </Box>
  );
};

const ReviewSectionHeader = ({ icon, title, onEdit, stepIndex }) => (
  <Box sx={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    px: 3, py: 2, borderBottom: `1px solid ${BORDER}`,
    background: `linear-gradient(90deg, ${ORANGE_SOFT} 0%, #fff 100%)`,
  }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box sx={{ width: 32, height: 32, borderRadius: "8px", bgcolor: ORANGE_MID, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {React.cloneElement(icon, { sx: { fontSize: "1.1rem", color: ORANGE } })}
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#111" }}>{title}</Typography>
    </Box>
    <Button size="small" startIcon={<EditIcon sx={{ fontSize: "0.8rem !important" }} />} onClick={() => onEdit(stepIndex)}
      sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.85rem", color: ORANGE, border: `1.5px solid ${ORANGE}`, borderRadius: "20px", px: 2, py: 0.4, "&:hover": { bgcolor: ORANGE_SOFT } }}>
      Edit
    </Button>
  </Box>
);

const StepReview = ({ form, onEdit }) => {
  const accountMeta = [
    ["Reg. No.",       form.regno],
    ["Roll No.",       form.rollno],
    ["Gender",         form.gender],
    ["Role",           form.role],
    ["Program Code",   form.programcode],
    ["Admission Year", form.admissionyear],
    ["Semester",       form.semesterMeta !== "NA" ? form.semesterMeta : ""],
    ["Section",        form.section !== "NA" ? form.section : ""],
    ["Mentor Status",  form.isMentor ? "Active Mentor" : ""],
  ].filter(([, v]) => v && String(v).trim() !== "");

  const boxSx = { fontSize: "1.05rem", color: "#424242", lineHeight: 1.65, p: 1.8, bgcolor: "#fafafa", borderRadius: "8px", border: `1px solid ${BORDER}` };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 3.5 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, color: "#111", fontSize: "1.45rem", mb: 0.5 }}>Review Your Registration</Typography>
          <Typography sx={{ color: "#616161", fontSize: "1.08rem" }}>
            Review all details carefully. Click <strong>Edit</strong> in any section to make changes.
          </Typography>
        </Box>
        <Chip icon={<CheckCircleIcon sx={{ fontSize: "0.9rem !important" }} />} label="All steps completed" size="small"
          sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: "0.85rem", height: 30, "& .MuiChip-icon": { color: "#2e7d32" } }} />
      </Box>

      {/* Personal Info */}
      <Paper elevation={0} sx={{ borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden", mb: 3 }}>
        <ReviewSectionHeader icon={<PersonIcon />} title="Personal Information" onEdit={onEdit} stepIndex={0} />
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}><RCell label="Full Name" value={`${form.firstName} ${form.lastName}`.trim()} /></Grid>
            <Grid item xs={6} sm={3}><RCell label="Email" value={form.email} /></Grid>
            <Grid item xs={6} sm={3}><RCell label="Phone" value={form.phone} /></Grid>
            <Grid item xs={6} sm={3}><RCell label="Location" value={[form.city, form.country].filter(Boolean).join(", ")} /></Grid>
            {form.linkedin && <Grid item xs={12}><RCell label="LinkedIn" value={form.linkedin} /></Grid>}
            {form.bio && (
              <Grid item xs={12}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#757575", textTransform: "uppercase", letterSpacing: "0.8px", mb: 0.6 }}>Short Bio</Typography>
                <Typography sx={boxSx}>{form.bio}</Typography>
              </Grid>
            )}
          </Grid>
          {accountMeta.length > 0 && (
            <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px dashed ${BORDER}` }}>
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: ORANGE, textTransform: "uppercase", letterSpacing: "1px", mb: 2 }}>
                Account Information
              </Typography>
              <Grid container spacing={2.5}>
                {accountMeta.map(([label, val]) => (
                  <Grid item xs={6} sm={4} md={3} key={label}><RCell label={label} value={val} /></Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Professional + Preferences */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden", height: "100%" }}>
            <ReviewSectionHeader icon={<WorkIcon />} title="Professional Details" onEdit={onEdit} stepIndex={1} />
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={6}><RCell label="Job Title" value={form.jobTitle} /></Grid>
                <Grid item xs={6}><RCell label="Company" value={form.company} /></Grid>
                <Grid item xs={6}><RCell label="Experience" value={form.experience ? `${form.experience} years` : ""} /></Grid>
                <Grid item xs={6}><RCell label="Graduation Year" value={form.graduationYear?.toString()} /></Grid>
                <Grid item xs={6}><RCell label="Degree" value={form.degree} /></Grid>
                <Grid item xs={6}><RCell label="Department" value={form.department} /></Grid>
                {form.mentorshipDomain && (
                  <Grid item xs={12}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#757575", textTransform: "uppercase", letterSpacing: "0.8px", mb: 0.6 }}>Mentorship Domain</Typography>
                    <Chip label={form.mentorshipDomain} sx={{ bgcolor: ORANGE_SOFT, color: ORANGE, fontWeight: 800, fontSize: "1.05rem", height: 32, px: 0.5 }} />
                  </Grid>
                )}
                {form.achievements && (
                  <Grid item xs={12}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#757575", textTransform: "uppercase", letterSpacing: "0.8px", mb: 0.6 }}>Achievements</Typography>
                    <Typography sx={boxSx}>{form.achievements}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden", height: "100%" }}>
            <ReviewSectionHeader icon={<MentorIcon />} title="Mentorship Preferences" onEdit={onEdit} stepIndex={2} />
            <Box sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                <Grid item xs={6}><RCell label="Max Students / Month" value={form.maxStudents?.toString()} /></Grid>
                <Grid item xs={6}><RCell label="Session Duration" value={form.sessionDuration ? `${form.sessionDuration} min` : ""} /></Grid>
                {form.availability?.length > 0 && (
                  <Grid item xs={12}><RCell label="Availability" value={form.availability} chipColor={{ bg: "#e8f5e9", fg: "#2e7d32" }} /></Grid>
                )}
                {form.sessionTypes?.length > 0 && (
                  <Grid item xs={12}><RCell label="Session Types" value={form.sessionTypes} chipColor={{ bg: "#e3f2fd", fg: "#1565c0" }} /></Grid>
                )}
                {form.semester && (
                  <Grid item xs={6}><RCell label="Semester" value={`Semester ${form.semester}`} /></Grid>
                )}
                {form.mentorshipGoals && (
                  <Grid item xs={12}>
                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#757575", textTransform: "uppercase", letterSpacing: "0.8px", mb: 0.6 }}>Message to Students</Typography>
                    <Typography sx={boxSx}>{form.mentorshipGoals}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, p: 2.5, borderRadius: "10px", bgcolor: "#fffaf5", border: `1px solid ${ORANGE_MID}` }}>
        <InfoIcon sx={{ color: ORANGE, fontSize: "1.2rem", mt: 0.1, flexShrink: 0 }} />
        <Typography sx={{ color: "#5d3a00", fontSize: "0.95rem", lineHeight: 1.6 }}>
          Once submitted, your application will be reviewed by the Alumni Relations team. You can check your approval status on this page after submission.
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Status Chip ──────────────────────────────────────────────────────────────

const StatusChip = ({ status }) => {
  const map = {
    pending:  { label: "Pending Review", color: "#f57c00", bg: "#fff3e0", icon: <PendingIcon sx={{ fontSize: 16 }} /> },
    approved: { label: "Approved",       color: "#2e7d32", bg: "#e8f5e9", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
    rejected: { label: "Rejected",       color: "#c62828", bg: "#ffebee", icon: <RejectedIcon sx={{ fontSize: 16 }} /> },
  };
  const s = map[status] || map.pending;
  return (
    <Chip icon={s.icon} label={s.label} sx={{ bgcolor: s.bg, color: s.color, fontWeight: 800, fontSize: "0.9rem", height: 32, "& .MuiChip-icon": { color: s.color } }} />
  );
};

// ─── My Application View ──────────────────────────────────────────────────────

const MyApplication = ({ application, onDelete }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(application._id);
    setDeleting(false);
    setConfirmOpen(false);
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, mb: 3, borderRadius: "14px", background: `linear-gradient(135deg, ${ORANGE} 0%, #ff6d00 100%)`, color: "#fff" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar sx={{ width: 62, height: 62, bgcolor: "rgba(255,255,255,0.2)", fontSize: "1.4rem", border: "2px solid rgba(255,255,255,0.4)" }}>
              {application.firstName?.charAt(0)}{application.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: "1.3rem", lineHeight: 1.2 }}>{application.firstName} {application.lastName}</Typography>
              <Typography sx={{ opacity: 0.88, mt: 0.4, fontSize: "1rem" }}>{application.jobTitle} · {application.company}</Typography>
              <Typography sx={{ opacity: 0.7, mt: 0.3, fontSize: "0.88rem" }}>
                Applied {new Date(application.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <StatusChip status={application.status} />
            <Button variant="outlined"
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
              onClick={() => setConfirmOpen(true)} disabled={deleting}
              sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.55)", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.1)" }, textTransform: "none", fontWeight: 700, borderRadius: "20px", fontSize: "0.95rem" }}>
              Withdraw
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden", mb: 3 }}>
        <Box sx={{ px: 3, py: 2.2, bgcolor: ORANGE_SOFT, borderBottom: `1px solid ${ORANGE_MID}` }}>
          <Typography sx={{ fontWeight: 800, color: TEXT_DARK, fontSize: "1.05rem" }}>Application Details</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableBody>
              {[
                ["Email",              application.email],
                ["Phone",              application.phone || "—"],
                ["Location",           [application.city, application.country].filter(Boolean).join(", ") || "—"],
                ["LinkedIn",           application.linkedin || "—"],
                ["Mentorship Domain",  application.mentorshipDomain || "—"],
                ["Experience",         application.experience != null ? `${application.experience} years` : "—"],
                ["Graduation Year",    application.graduationYear || "—"],
                ["Degree",             application.degree || "—"],
                ["Department",         application.department || "—"],
                ["Max Students/Month", application.maxStudents || "—"],
                ["Session Duration",   application.sessionDuration ? `${application.sessionDuration} min` : "—"],
              ].map(([label, val]) => (
                <TableRow key={label} sx={{ "&:nth-of-type(even)": { bgcolor: "#fafafa" } }}>
                  <TableCell sx={{ fontWeight: 700, color: TEXT_MID, width: "36%", fontSize: "0.95rem", borderBottom: `1px solid #f0f0f0`, py: 1.5 }}>{label}</TableCell>
                  <TableCell sx={{ fontSize: "0.97rem", color: TEXT_DARK, borderBottom: `1px solid #f0f0f0`, py: 1.5 }}>{val}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { title: "Mentorship Domain", items: application.mentorshipDomain ? [application.mentorshipDomain] : [], chipSx: { bgcolor: ORANGE_SOFT, color: ORANGE } },
          { title: "Availability",      items: application.availability,                                          chipSx: { bgcolor: "#e8f5e9", color: "#2e7d32" } },
        ].map(({ title, items, chipSx }) => (
          <Grid item xs={12} sm={6} key={title}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: `1px solid ${BORDER}`, height: "100%" }}>
              <Typography sx={{ fontWeight: 800, mb: 1.5, color: chipSx.color, fontSize: "1rem" }}>{title}</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {items?.length > 0
                  ? items.map((i) => <Chip key={i} label={i} sx={{ ...chipSx, fontWeight: 700, fontSize: "0.88rem", height: 28 }} />)
                  : <Typography sx={{ color: TEXT_MID, fontSize: "0.95rem" }}>—</Typography>}
              </Box>
            </Paper>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: `1px solid ${BORDER}` }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5, color: "#1565c0", fontSize: "1rem" }}>Session Types</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {application.sessionTypes?.length > 0
                ? application.sessionTypes.map((s) => <Chip key={s} label={s} sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 700, fontSize: "0.88rem", height: 28 }} />)
                : <Typography sx={{ color: TEXT_MID, fontSize: "0.95rem" }}>—</Typography>}
            </Box>
          </Paper>
        </Grid>
        {application.mentorshipGoals && (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: "12px", border: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontWeight: 800, mb: 1.5, color: TEXT_MID, fontSize: "1rem" }}>Message to Students</Typography>
              <Typography sx={{ color: "#333", lineHeight: 1.7, fontSize: "0.97rem" }}>{application.mentorshipGoals}</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: "14px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.15rem" }}>Withdraw Application?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "1rem" }}>
            Are you sure you want to withdraw your mentor registration? This cannot be undone and your application will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2.5, px: 3 }}>
          <Button onClick={() => setConfirmOpen(false)} sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.97rem" }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "20px", fontSize: "0.97rem" }}>
            {deleting ? "Withdrawing…" : "Yes, Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Initial Form ─────────────────────────────────────────────────────────────

const initialForm = {
  firstName: "", lastName: "", email: "", phone: "", city: "", country: "",
  linkedin: "", bio: "",
  regno: "", rollno: "", gender: "", semesterMeta: "", section: "",
  programcode: "", admissionyear: "", role: "", isMentor: false,
  jobTitle: "", company: "", experience: "",
  graduationYear: "", degree: "", department: "", expertise: [], achievements: "",
  mentorshipDomain: "",
  maxStudents: "", sessionDuration: "", availability: [], sessionTypes: [],
  mentorshipGoals: "", semester: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseName = (fullName = "") => {
  const parts = fullName.trim().split(" ");
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") || "" };
};

const safeVal = (val, fallback = "") => {
  if (val === undefined || val === null) return fallback;
  const s = String(val).trim();
  return (s === "NA" || s === "") ? fallback : s;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MentorRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params   = new URLSearchParams(location.search);

  const colid     = global1.colid || params.get("colid");
  const userid    = global1._id   || global1.id || params.get("id") || params.get("userid");
  const nameParam = global1.name  || params.get("name") || "";

  const buildFormFromUser = (u) => {
    const fullName = u.name || nameParam || "";
    const { firstName, lastName } = parseName(fullName);

    let graduationYear = "";
    if (u.admissionyear) {
      const y = parseInt(String(u.admissionyear).split("-")[0]);
      if (!isNaN(y)) graduationYear = y + 4;
    }

    const phone =
      safeVal(u.phone)  || safeVal(u.phoneno)  || safeVal(u.phoneNo) ||
      safeVal(u.mobile) || safeVal(u.mobileno) || safeVal(u.contact) || "";

    const company =
      safeVal(u.currentCompany) || safeVal(u.company)      ||
      safeVal(u.organisation)   || safeVal(u.organization) ||
      safeVal(u.employer)       || "";

    return {
      ...initialForm,
      firstName:        safeVal(u.firstName) || firstName,
      lastName:         safeVal(u.lastName)  || lastName,
      email:            safeVal(u.email)     || safeVal(u.user),
      phone,
      city:             safeVal(u.city),
      country:          safeVal(u.country),
      linkedin:         safeVal(u.linkedin),
      bio:              safeVal(u.bio),
      regno:            safeVal(u.regno),
      rollno:           safeVal(u.rollno),
      gender:           safeVal(u.gender),
      semesterMeta:     safeVal(u.semester),
      section:          safeVal(u.section),
      programcode:      safeVal(u.programcode),
      admissionyear:    safeVal(u.admissionyear),
      role:             safeVal(u.role),
      isMentor:         u.isMentor === true || u.isMentor === "true",
      jobTitle:         safeVal(u.designation) || safeVal(u.jobTitle) || safeVal(u.jobtitle),
      company,
      experience:       safeVal(u.experience) || safeVal(u.yearsofexperience) || safeVal(u.yoe),
      department:       safeVal(u.department),
      degree:           u.programcode ? `B.Tech ${u.programcode}` : safeVal(u.degree),
      graduationYear,
      mentorshipDomain: safeVal(u.mentorshipDomain) || safeVal(u.mentorshipdomain),
      expertise:        Array.isArray(u.expertise) ? u.expertise : [],
      achievements:     safeVal(u.achievements),
      maxStudents:      safeVal(u.maxStudents),
      sessionDuration:  safeVal(u.sessionDuration),
      availability:     Array.isArray(u.availability) ? u.availability : [],
      sessionTypes:     Array.isArray(u.sessionTypes) ? u.sessionTypes : [],
      mentorshipGoals:  safeVal(u.mentorshipGoals),
      semester:         safeVal(u.semester),
    };
  };

  const [activeStep,     setActiveStep]     = useState(0);
  const [form,           setForm]           = useState(() => buildFormFromUser(global1));
  const [submitting,     setSubmitting]     = useState(false);
  const [snack,          setSnack]          = useState({ open: false, msg: "", severity: "error" });
  const [domains,        setDomains]        = useState([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [view,           setView]           = useState("check");
  const [application,    setApplication]    = useState(null);

  useEffect(() => {
    const checkAndFetch = async () => {
      if (userid && colid) {
        try {
          const r = await fetch(`${ep1}/api/users/${userid}`);
          const d = await r.json();
          if (d.success && d.data) setForm(buildFormFromUser({ ...global1, ...d.data }));
        } catch { /* keep global1 */ }
      }

      setDomainsLoading(true);
      try {
        const role = global1.role || params.get("role") || "Alumni";
        const url  = colid
          ? `${ep1}/api/v2/mentors/domains?colid=${encodeURIComponent(colid)}&role=${encodeURIComponent(role)}`
          : `${ep1}/api/v2/mentors/domains`;
        const dr = await fetch(url);
        const dd = await dr.json();
        if (dd.success && Array.isArray(dd.data)) setDomains(dd.data);
      } catch { /* ignore */ } finally { setDomainsLoading(false); }

      if (!colid || !userid) { setView("form"); return; }
      try {
        const r = await fetch(`${ep1}/api/v2/mentors?colid=${encodeURIComponent(colid)}&userid=${encodeURIComponent(userid)}`);
        const d = await r.json();
        if (d.success && d.data?.length > 0) { setApplication(d.data[0]); setView("application"); }
        else setView("form");
      } catch { setView("form"); }
    };
    checkAndFetch();
  }, [colid, userid]);

  const handleChange   = (e) => { const { name, value } = e.target; setForm((p) => ({ ...p, [name]: value })); };
  const handleBack     = () => { setActiveStep((s) => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleEditStep = (i) => { setActiveStep(i);            window.scrollTo({ top: 0, behavior: "smooth" }); };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!form.firstName.trim()) return "First name is required.";
      if (!form.lastName.trim())  return "Last name is required.";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return "A valid email is required.";
    }
    if (activeStep === 1) {
      if (!form.jobTitle.trim())  return "Job title is required.";
      if (!form.company.trim())   return "Company name is required.";
      if (!form.experience)       return "Years of experience is required.";
      if (!form.mentorshipDomain) return "Please select a mentorship domain.";
    }
    if (activeStep === 2) {
      if (!form.maxStudents)         return "Please specify max students per month.";
      if (!form.availability.length) return "Select at least one availability slot.";
      if (!form.sessionTypes.length) return "Select at least one session type.";
      if (!form.semester)            return "Please select a semester.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setSnack({ open: true, msg: err, severity: "error" }); return; }
    setActiveStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!colid)  { setSnack({ open: true, msg: "College ID missing. Please re-login.",  severity: "error" }); return; }
    if (!userid) { setSnack({ open: true, msg: "User ID missing. Please re-login.",     severity: "error" }); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, userid, domains: form.mentorshipDomain ? [form.mentorshipDomain] : [] };
      const res  = await fetch(
        `${ep1}/api/v2/mentors?colid=${encodeURIComponent(colid)}&userid=${encodeURIComponent(userid)}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");
      setApplication(data.data); setView("application");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSnack({ open: true, msg: err.message || "Something went wrong.", severity: "error" });
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    try {
      const res  = await fetch(
        `${ep1}/api/v2/mentors/delete/${id}?colid=${encodeURIComponent(colid)}&userid=${encodeURIComponent(userid)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to withdraw.");
      setApplication(null); setActiveStep(0);
      setForm(buildFormFromUser(global1)); setView("form");
      setSnack({ open: true, msg: "Your application has been withdrawn successfully.", severity: "success" });
    } catch (err) {
      setSnack({ open: true, msg: err.message || "Failed to withdraw.", severity: "error" });
    }
  };

  const progress = (activeStep / (STEPS.length - 1)) * 100;

  // Loading
  if (view === "check") {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2.5 }}>
        <CircularProgress sx={{ color: ORANGE }} size={48} />
        <Typography sx={{ color: TEXT_MID, fontSize: "1.05rem" }}>Checking your registration status…</Typography>
      </Box>
    );
  }

  // Existing application
  if (view === "application" && application) {
    return (
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg, #fff8f5 0%, #fff 55%, #fff3e0 100%)", pb: 8 }}>
        <Banner subtitle="Review or withdraw your mentor registration below." />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <MyApplication application={application} onDelete={handleDelete} />
          <Button startIcon={<BackIcon />} onClick={() => navigate(-1)}
            sx={{ mt: 2, color: ORANGE, textTransform: "none", fontWeight: 700, fontSize: "1rem" }}>
            Back to Dashboard
          </Button>
        </Container>
        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: "10px", fontWeight: 700, fontSize: "0.97rem" }}>{snack.msg}</Alert>
        </Snackbar>
      </Box>
    );
  }

  // Registration form
  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(160deg, #fff8f5 0%, #fff 55%, #fff3e0 100%)", pb: 8 }}>
      <Banner subtitle="Share your expertise with the next generation. Join our Alumni Mentorship Programme and make a lasting impact." />

      <LinearProgress variant="determinate" value={progress}
        sx={{ height: 4, bgcolor: ORANGE_MID, "& .MuiLinearProgress-bar": { bgcolor: ORANGE } }} />

      <Container maxWidth={false} sx={{ mt: 5, width: "90%", mx: "auto" }}>

        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{
          mb: 5,
          "& .MuiStepLabel-label": {
            mt: "8px !important",
            fontSize: { xs: "0.78rem", sm: "0.92rem" },
            fontWeight: 500,
            whiteSpace: "normal",
            textAlign: "center",
            lineHeight: 1.3,
            color: TEXT_MID,
          },
          "& .MuiStepLabel-label.Mui-active":    { fontWeight: 800, color: ORANGE },
          "& .MuiStepLabel-label.Mui-completed": { fontWeight: 700 },
          "& .MuiStepIcon-root":                 { fontSize: "2rem" },
          "& .MuiStepIcon-root.Mui-active":      { color: ORANGE },
          "& .MuiStepIcon-root.Mui-completed":   { color: ORANGE },
          "& .MuiStepConnector-line":            { borderColor: ORANGE_MID, borderTopWidth: 2 },
        }}>
          {STEPS.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {/* Pre-fill notice */}
        {/* {activeStep === 0 && (global1.name || global1.email) && (
          <Alert severity="info" icon={<PersonIcon />}
            sx={{ mb: 3, borderRadius: "10px", fontSize: "0.97rem", border: "1px solid #b3d4f5" }}>
            Your profile details have been pre-filled from your account. Please review and update if needed.
          </Alert>
        )} */}

        {/* Form card */}
        <Paper elevation={0} sx={{ borderRadius: "16px", overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>

          {/* Card header */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 2.5, bgcolor: ORANGE_SOFT, borderBottom: `1px solid ${ORANGE_MID}`, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: ORANGE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "1rem", flexShrink: 0 }}>
              {activeStep + 1}
            </Box>
            <Typography sx={{ fontWeight: 800, color: TEXT_DARK, flex: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              {STEPS[activeStep]}
            </Typography>
            <Typography sx={{ color: TEXT_MID, flexShrink: 0, fontSize: "0.95rem", fontWeight: 500 }}>
              Step {activeStep + 1} of {STEPS.length}
            </Typography>
          </Box>

          {/* Step body */}
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            {activeStep === 0 && <StepPersonalInfo form={form} onChange={handleChange} />}
            {activeStep === 1 && <StepProfessionalDetails form={form} onChange={handleChange} domains={domains} domainsLoading={domainsLoading} />}
            {activeStep === 2 && <StepMentorshipPreferences form={form} onChange={handleChange} />}
            {activeStep === 3 && <StepReview form={form} onEdit={handleEditStep} />}
          </Box>

          <Divider sx={{ borderColor: BORDER }} />

          {/* Navigation */}
          <Box sx={{ px: { xs: 3, sm: 4 }, py: 3, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fafaf9" }}>
            <Button variant="outlined" startIcon={<BackIcon />}
              onClick={activeStep === 0 ? () => navigate(-1) : handleBack}
              sx={{ borderRadius: "10px", px: 3.5, py: 1.2, borderColor: "#ddd8d2", color: TEXT_MID, textTransform: "none", fontWeight: 700, fontSize: "1rem", "&:hover": { borderColor: ORANGE, color: ORANGE, bgcolor: ORANGE_SOFT } }}>
              {activeStep === 0 ? "Cancel" : "Back"}
            </Button>

            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" endIcon={<NextIcon />} onClick={handleNext}
                sx={{ borderRadius: "10px", px: 4.5, py: 1.2, bgcolor: ORANGE, textTransform: "none", fontWeight: 800, fontSize: "1rem", boxShadow: "0 4px 14px rgba(230,81,0,0.35)", "&:hover": { bgcolor: ORANGE_DARK } }}>
                Continue
              </Button>
            ) : (
              <Button variant="contained"
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                onClick={handleSubmit} disabled={submitting}
                sx={{ borderRadius: "10px", px: 5, py: 1.2, bgcolor: "#2e7d32", textTransform: "none", fontWeight: 800, fontSize: "1rem", boxShadow: "0 4px 14px rgba(46,125,50,0.35)", "&:hover": { bgcolor: "#1b5e20" }, "&.Mui-disabled": { bgcolor: "#a5d6a7", color: "#fff" } }}>
                {submitting ? "Submitting…" : "Submit Registration"}
              </Button>
            )}
          </Box>
        </Paper>

        {/* <Alert severity="info" icon={<MentorIcon />} sx={{ mt: 3, borderRadius: "10px", fontSize: "0.97rem" }}>
          Your profile will be reviewed by the Alumni Relations team before being published. Alumni mentors are listed in the student portal after approval.
        </Alert> */}
      </Container>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))} sx={{ borderRadius: "10px", fontWeight: 700, fontSize: "0.97rem" }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MentorRegistration;