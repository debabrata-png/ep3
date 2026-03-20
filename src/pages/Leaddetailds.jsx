import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  EventNote as MeetingIcon,
  Note as NoteIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import dayjs from "dayjs";

const Leaddetailds = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [openCallDialog, setOpenCallDialog] = useState(false);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [callData, setCallData] = useState({
    duration: "",
    outcome: "",
    notes: "",
    next_followup_date: "",
  });

  const [meetingData, setMeetingData] = useState({
    duration: "",
    outcome: "",
    notes: "",
    next_followup_date: "",
  });

  const [pipelineStages, setPipelineStages] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sources, setSources] = useState([]);

  // Counselor search state for transfer
  const [counselorOptions, setCounselorOptions] = useState([]);
  const [counselorLoading, setCounselorLoading] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [transferData, setTransferData] = useState({
    new_counsellor_email: "",
    reason: ""
  });

  const [visitData, setVisitData] = useState({
    dateofvisit: "",
    location: "",
    countercounserloername: "",
    countercounserloeremail: "",
  });

  const [updateData, setUpdateData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    course_interested: "",
    source: "",
    city: "",
    state: "",
    pipeline_stage: "",
    lead_temperature: "",
    leadstatus: "",
    next_followup_date: "",
    institution: "",
    program_type: "",
    program: "",
    provissionalfeepaid: "No",
    comments: "",
  });

  // State for cascading dropdowns
  const [institutions, setInstitutions] = useState([]);
  const [programTypes, setProgramTypes] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [loadingProgramTypes, setLoadingProgramTypes] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  useEffect(() => {
    fetchLeadDetails();
    fetchPipelineStages();
    fetchOutcomes();
    fetchCategories();
    fetchSources();
  }, [id]);

  const fetchPipelineStages = async () => {
    try {
      const res = await ep1.get("/api/v2/getallpipelinestageag", {
        params: { colid: global1.colid }
      });
      if (res.data.status === "Success") {
        setPipelineStages(res.data.data.filter(item => item.isactive));
      }
    } catch (err) {
      console.error("Error fetching pipeline stages:", err);
    }
  };

  const fetchOutcomes = async () => {
    try {
      const res = await ep1.get("/api/v2/getalloutcomeag", {
        params: { colid: global1.colid }
      });
      if (res.data.status === "Success") {
        setOutcomes(res.data.data.filter(item => item.isactive));
      }
    } catch (err) {
      console.error("Error fetching outcomes:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await ep1.get("/api/v2/getallcategoriesds", {
        params: { colid: global1.colid },
      });
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSources = async () => {
    try {
      const res = await ep1.get("/api/v2/getallsourcesds", {
        params: { colid: global1.colid },
      });
      setSources(res.data.data);
    } catch (err) {
      console.error("Error fetching sources:", err);
    }
  };

  const handleSearchCounselors = async (query) => {
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

  const fetchLeadDetails = async () => {
    try {
      const res = await ep1.get(`/api/v2/getleadbyidds/${id}`);
      const leadData = res.data.data.lead;
      setLead(leadData);
      setActivities(res.data.data.activities);
      setUpdateData({
        name: leadData.name || "",
        phone: leadData.phone || "",
        email: leadData.email || "",
        category: leadData.category || "",
        course_interested: leadData.course_interested || "",
        source: leadData.source || "",
        city: leadData.city || "",
        state: leadData.state || "",
        pipeline_stage: leadData.pipeline_stage || "",
        leadstatus: leadData.leadstatus || "",
        lead_temperature: leadData.lead_temperature || "",
        next_followup_date: leadData.next_followup_date ? dayjs(leadData.next_followup_date).format("YYYY-MM-DD") : "",
        institution: leadData.institution || "",
        program_type: leadData.program_type || "",
        program: leadData.program || "",
        provissionalfeepaid: leadData.provissionalfeepaid || "No",
        countercounserloername: leadData.countercounserloername || "",
        countercounserloeremail: leadData.countercounserloeremail || "",
        dateofvisit: leadData.dateofvisit ? dayjs(leadData.dateofvisit).format("YYYY-MM-DD") : "",
        location: leadData.location || "",
        comments: leadData.comments || "",
      });

      // Pre-fetch dropdowns
      fetchInstitutions();
      if (leadData.institution) {
        fetchProgramTypes(leadData.institution);
        if (leadData.program_type) {
          fetchPrograms(leadData.institution, leadData.program_type);
        }
      }
    } catch (err) {
      console.error("Error fetching lead details:", err);
      showSnackbar("Failed to fetch lead details", "error");
    }
  };

  const fetchInstitutions = async () => {
    setLoadingInstitutions(true);
    try {
      const res = await ep1.get("/api/v2/getinstitutionsds", {
        params: { colid: global1.colid }
      });
      if (res.data.success) {
        setInstitutions(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching institutions:", err);
    }
    setLoadingInstitutions(false);
  };

  const fetchProgramTypes = async (institution) => {
    if (!institution) {
      setProgramTypes([]);
      return;
    }
    setLoadingProgramTypes(true);
    try {
      const res = await ep1.get("/api/v2/getprogramtypesds", {
        params: { colid: global1.colid, institution }
      });
      if (res.data.success) {
        setProgramTypes(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching program types:", err);
    }
    setLoadingProgramTypes(false);
  };

  const fetchPrograms = async (institution, programType) => {
    if (!institution || !programType) {
      setPrograms([]);
      return;
    }
    setLoadingPrograms(true);
    try {
      const res = await ep1.get("/api/v2/getprogramsbyfiltersds", {
        params: { colid: global1.colid, institution, program_type: programType }
      });
      if (res.data.success) {
        setPrograms(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
    setLoadingPrograms(false);
  };

  const handleLogCall = async () => {
    try {
      const payload = {
        lead_id: id,
        colid: global1.colid,
        performed_by: global1.user,
        ...callData,
      };
      await ep1.post("/api/v2/logcallactivityds", payload);
      showSnackbar("Call logged successfully", "success");
      setOpenCallDialog(false);
      fetchLeadDetails();
      setCallData({ duration: "", outcome: "", notes: "", next_followup_date: "" });
    } catch (err) {
      console.error("Error logging call:", err);
      showSnackbar("Failed to log call", "error");
    }
  };

  const handleLogMeeting = async () => {
    try {
      const payload = {
        lead_id: id,
        colid: global1.colid,
        performed_by: global1.user,
        ...meetingData,
      };
      await ep1.post("/api/v2/logmeetingactivityds", payload);
      showSnackbar("Meeting logged successfully", "success");
      setOpenMeetingDialog(false);
      fetchLeadDetails();
      setMeetingData({ duration: "", outcome: "", notes: "", next_followup_date: "" });
    } catch (err) {
      console.error("Error logging meeting:", err);
      showSnackbar("Failed to log meeting", "error");
    }
  };

  const handleUpdateLead = async () => {
    try {
      const payload = {
        ...updateData,
        updated_by: global1.user,
      };
      await ep1.post("/api/v2/updateleadds", payload, {
        params: { id },
      });
      showSnackbar("Lead updated successfully", "success");
      setOpenUpdateDialog(false);
      fetchLeadDetails();
    } catch (err) {
      console.error("Error updating lead:", err);
      showSnackbar("Failed to update lead", "error");
    }
  };

  const handleTransferLead = async () => {
    if (!transferData.new_counsellor_email) {
      showSnackbar("Please select a counselor", "error");
      return;
    }
    try {
      const payload = {
        ...transferData,
        performed_by: global1.user,
      };
      await ep1.post("/api/v2/reassignleadds", payload, {
        params: { id },
      });
      showSnackbar("Lead transferred successfully", "success");
      setOpenTransferDialog(false);
      fetchLeadDetails();
    } catch (err) {
      console.error("Error transferring lead:", err);
      showSnackbar("Failed to transfer lead", "error");
    }
  };

  const handleInstitutionVisit = async () => {
    try {
      const payload = {
        ...visitData,
        updated_by: global1.user,
      };
      await ep1.post("/api/v2/updateleadds", payload, {
        params: { id },
      });
      showSnackbar("Institution visit details updated", "success");
      setOpenVisitDialog(false);
      fetchLeadDetails();
    } catch (err) {
      console.error("Error updating visit details:", err);
      showSnackbar("Failed to update visit details", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getTemperatureColor = (temp) => {
    switch (temp) {
      case "Hot":
        return "error";
      case "Warm":
        return "warning";
      case "Cold":
        return "info";
      default:
        return "default";
    }
  };

  if (!lead) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/leadsds")} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Lead Details: {lead.name}</Typography>
        </Box>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => setOpenUpdateDialog(true)}>
          Update Lead
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Lead Info */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Lead Information
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography><strong>Name:</strong> {lead.name}</Typography>
              <Typography><strong>Email:</strong> {lead.email}</Typography>
              <Typography><strong>Phone:</strong> {lead.phone}</Typography>
              <Typography><strong>Category:</strong> {lead.category}</Typography>
              <Typography><strong>Course Interested:</strong> {lead.course_interested}</Typography>
              <Typography><strong>Source:</strong> {lead.source}</Typography>
              <Typography><strong>City:</strong> {lead.city}</Typography>
              <Typography><strong>State:</strong> {lead.state}</Typography>
              <Typography>
                <strong>Temperature:</strong>{" "}
                <Chip
                  label={lead.lead_temperature}
                  color={getTemperatureColor(lead.lead_temperature)}
                  size="small"
                />
              </Typography>
              <Typography><strong>Lead Score:</strong> {lead.lead_score}</Typography>
              <Typography><strong>Pipeline Stage:</strong> {lead.pipeline_stage}</Typography>
              <Typography><strong>Assigned To:</strong> {lead.assignedto}</Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => setOpenCallDialog(true)}
              >
                Log Call
              </Button>
              <Button
                variant="outlined"
                startIcon={<MeetingIcon />}
                onClick={() => setOpenMeetingDialog(true)}
              >
                Log Meeting
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => navigate("/leadsds")}
              >
                Send Email
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={() => setOpenTransferDialog(true)}
                sx={{ textTransform: 'none' }}
              >
                Transfer Lead
              </Button>
              <Button
                variant="contained"
                color="info"
                startIcon={<MeetingIcon />}
                onClick={() => {
                  setVisitData({
                    dateofvisit: lead.dateofvisit || "",
                    location: lead.location || "",
                    countercounserloername: lead.countercounserloername || "",
                    countercounserloeremail: lead.countercounserloeremail || "",
                  });
                  setOpenVisitDialog(true);
                }}
                sx={{ textTransform: 'none' }}
              >
                Institution Visit
              </Button>
            </Box>
          </Paper>

          {/* Notes Section - Editable if 'comments' were separate but here we might need a dedicated dialog or reuse update */}
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Lead Notes
              </Typography>
              <Button startIcon={<EditIcon />} size="small" onClick={() => {
                setUpdateData({ comments: lead.comments || "" });
                setOpenUpdateDialog(true);
                // Note: reusing update dialog but might prefer a specific one. 
                // For now, let's create a specific Notes Dialog for clarity in this view
              }}>
                Edit
              </Button>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: lead.comments ? 'text.primary' : 'text.secondary' }}>
              {lead.comments || "No notes added yet."}
            </Typography>
          </Paper>
        </Grid>

        {/* Activity Timeline */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {activity.activity_type.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(activity.activity_date).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.primary">
                            {activity.notes}
                          </Typography>
                          {activity.outcome && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <strong>Outcome:</strong> {activity.outcome}
                            </Typography>
                          )}
                          {activity.duration && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              <strong>Duration:</strong> {activity.duration} minutes
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            By: {activity.performed_by}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < activities.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
              {activities.length === 0 && (
                <ListItem>
                  <ListItemText primary="No activities yet" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Log Call Dialog */}
      <Dialog open={openCallDialog} onClose={() => setOpenCallDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Call</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={callData.duration}
              onChange={(e) => setCallData({ ...callData, duration: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Outcome"
              value={callData.outcome}
              onChange={(e) => setCallData({ ...callData, outcome: e.target.value })}
            >
              {outcomes.map((option) => (
                <MenuItem key={option._id} value={option.outcomename || option.name}>
                  {option.outcomename || option.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              value={callData.notes}
              onChange={(e) => setCallData({ ...callData, notes: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Next Follow-up Date"
              type="datetime-local"
              value={callData.next_followup_date}
              onChange={(e) => setCallData({ ...callData, next_followup_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCallDialog(false)}>Cancel</Button>
          <Button onClick={handleLogCall} variant="contained">
            Log Call
          </Button>
        </DialogActions>
      </Dialog>

      {/* Log Meeting Dialog */}
      <Dialog open={openMeetingDialog} onClose={() => setOpenMeetingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Log Meeting</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Duration (minutes)"
              type="number"
              value={meetingData.duration}
              onChange={(e) => setMeetingData({ ...meetingData, duration: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Outcome"
              value={meetingData.outcome}
              onChange={(e) => setMeetingData({ ...meetingData, outcome: e.target.value })}
            >
              {outcomes.map((option) => (
                <MenuItem key={option._id} value={option.outcomename || option.name}>
                  {option.outcomename || option.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Notes"
              value={meetingData.notes}
              onChange={(e) => setMeetingData({ ...meetingData, notes: e.target.value })}
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Next Follow-up Date"
              type="datetime-local"
              value={meetingData.next_followup_date}
              onChange={(e) => setMeetingData({ ...meetingData, next_followup_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeetingDialog(false)}>Cancel</Button>
          <Button onClick={handleLogMeeting} variant="contained">
            Log Meeting
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Lead Dialog - Expanded to match Leadsds */}
      <Dialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>Update Lead</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={updateData.name}
                onChange={(e) => setUpdateData({ ...updateData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={updateData.phone}
                onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                value={updateData.email}
                onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={updateData.category}
                onChange={(e) => setUpdateData({ ...updateData, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat.category_name}>
                    {cat.category_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Source"
                value={updateData.source}
                onChange={(e) => setUpdateData({ ...updateData, source: e.target.value })}
              >
                {sources.map((src) => (
                  <MenuItem key={src._id} value={src.source_name}>
                    {src.source_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Institution"
                value={updateData.institution || ""}
                onChange={(e) => {
                  setUpdateData({ ...updateData, institution: e.target.value, program_type: "", program: "" });
                  fetchProgramTypes(e.target.value);
                }}
                disabled={loadingInstitutions}
              >
                {institutions.map((inst, index) => (
                  <MenuItem key={index} value={inst}>
                    {inst}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Program Type"
                value={updateData.program_type || ""}
                onChange={(e) => {
                  setUpdateData({ ...updateData, program_type: e.target.value, program: "" });
                  fetchPrograms(updateData.institution, e.target.value);
                }}
                disabled={!updateData.institution || loadingProgramTypes}
              >
                {programTypes.map((type, index) => (
                  <MenuItem key={index} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Program"
                value={updateData.program || ""}
                onChange={(e) => setUpdateData({ ...updateData, program: e.target.value })}
                disabled={!updateData.program_type || loadingPrograms}
              >
                {programs.map((prog) => (
                  <MenuItem key={prog._id} value={prog.course_name}>
                    {prog.course_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Pipeline Stage"
                value={updateData.pipeline_stage}
                onChange={(e) => setUpdateData({ ...updateData, pipeline_stage: e.target.value })}
              >
                {pipelineStages.map((option) => (
                  <MenuItem key={option._id} value={option.stagename || option.name}>
                    {option.stagename || option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Outcome"
                value={updateData.leadstatus}
                onChange={(e) => setUpdateData({ ...updateData, leadstatus: e.target.value })}
              >
                {outcomes.map((option) => (
                  <MenuItem key={option._id} value={option.outcomename || option.name}>
                    {option.outcomename || option.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Temperature"
                value={updateData.lead_temperature}
                onChange={(e) => setUpdateData({ ...updateData, lead_temperature: e.target.value })}
              >
                <MenuItem value="Hot">Hot</MenuItem>
                <MenuItem value="Warm">Warm</MenuItem>
                <MenuItem value="Cold">Cold</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Next Follow-up Date"
                type="date"
                value={updateData.next_followup_date}
                onChange={(e) => setUpdateData({ ...updateData, next_followup_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Provisional Fee Paid"
                value={updateData.provissionalfeepaid}
                onChange={(e) => setUpdateData({ ...updateData, provissionalfeepaid: e.target.value })}
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lead Notes"
                value={updateData.comments}
                onChange={(e) => setUpdateData({ ...updateData, comments: e.target.value })}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenUpdateDialog(false)} size="large">Cancel</Button>
          <Button onClick={handleUpdateLead} variant="contained" size="large">
            Update Lead
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Lead Dialog */}
      <Dialog open={openTransferDialog} onClose={() => setOpenTransferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>Transfer Lead</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <Autocomplete
              options={counselorOptions}
              loading={counselorLoading}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              onInputChange={(event, newInputValue) => {
                handleSearchCounselors(newInputValue);
              }}
              onChange={(event, newValue) => {
                setTransferData({ ...transferData, new_counsellor_email: newValue ? newValue.email : "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select New Counselor"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {counselorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            <TextField
              fullWidth
              label="Reason for Transfer"
              value={transferData.reason}
              onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenTransferDialog(false)} size="large">Cancel</Button>
          <Button onClick={handleTransferLead} variant="contained" color="secondary" size="large">
            Confirm Transfer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Institution Visit Dialog */}
      <Dialog open={openVisitDialog} onClose={() => setOpenVisitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>Institution Visit / Counter Counselor</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Date of Visit"
              type="date"
              value={visitData.dateofvisit}
              onChange={(e) => setVisitData({ ...visitData, dateofvisit: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Location"
              value={visitData.location}
              onChange={(e) => setVisitData({ ...visitData, location: e.target.value })}
            />
            <Autocomplete
              options={counselorOptions}
              loading={counselorLoading}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              onInputChange={(event, newInputValue) => {
                handleSearchCounselors(newInputValue);
              }}
              onChange={(event, newValue) => {
                setVisitData({
                  ...visitData,
                  countercounserloername: newValue ? newValue.name : "",
                  countercounserloeremail: newValue ? newValue.email : ""
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Counter Counselor"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <React.Fragment>
                        {counselorLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </React.Fragment>
                    ),
                  }}
                />
              )}
            />
            <Box>
              <Typography variant="body2" color="text.secondary">Selected: {visitData.countercounserloername}</Typography>
              <Typography variant="body2" color="text.secondary">Email: {visitData.countercounserloeremail}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setOpenVisitDialog(false)} size="large">Cancel</Button>
          <Button onClick={handleInstitutionVisit} variant="contained" color="info" size="large">
            Update Visit Record
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container >
  );
};

export default Leaddetailds;
