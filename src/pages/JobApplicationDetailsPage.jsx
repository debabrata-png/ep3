// src/pages/JobApplicationDetailsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Stack,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const STATUS_OPTIONS = [
  "Applied",
  "Shortlisted",
  "Interviewed",
  "Selected",
  "Rejected",
  "Hired",
];

const JobApplicationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const fetchDetail = async () => {
    try {
      const res = await ep1.get("/api/v2/getapplications", {
        params: { companyemail: global1.user, colid: global1.colid },
      });
      const found = res.data.find((a) => a._id === id);
      if (found) {
        setApp(found);
        setStatus(found.status);
      } else {
        throw new Error("Application not found");
      }
    } catch (err) {
      setSnack({ open: true, severity: "error", msg: err?.message || "Error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const saveStatus = async () => {
    try {
      await ep1.post(`/api/v2/updatejobappstatus?id=${id}`, { status });
      setSnack({ open: true, msg: "Status updated", severity: "success" });
    } catch (err) {
      setSnack({ open: true, msg: "Update failed", severity: "error" });
    }
  };

  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [salaryConfig, setSalaryConfig] = useState({
    fixedComponents: {
      basicSalary: "30000",
      hra: "12000",
      conveyanceAllowance: "2000",
      medicalAllowance: "1250",
    },
    deductionComponents: {
      pf: "1800",
      esi: "500",
      incomeTax: "0",
    },
    designation: app?.jobtitle || "Software Engineer",
  });

  const handleHire = async () => {
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/hirecandidate", {
        applicationId: id,
        salaryConfig,
        colid: global1.colid,
      });

      if (res.data.success) {
        setSnack({
          open: true,
          msg: "Candidate hired! User created and salary configured.",
          severity: "success",
        });
        setHireDialogOpen(false);
        fetchDetail();
      }
    } catch (err) {
      setSnack({
        open: true,
        msg: err.response?.data?.message || "Hiring failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <CircularProgress sx={{ display: "block", m: "auto", mt: 8 }} />;
  if (!app) return null;

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            Application Details
          </Typography>

          {/* Job & Company */}
          <Box mb={2}>
            <Typography variant="h6" color="primary">
              {app.jobtitle}
            </Typography>
            <Typography>Company: {app.companyname}</Typography>
            <Typography>Email: {app.companyemail}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Candidate */}
          <Box mb={2}>
            <Typography variant="h6">Candidate</Typography>
            <Typography>Name: {app.applicantname}</Typography>
            <Typography>Email: {app.applicantemail}</Typography>
            <Typography>Phone: {app.applicantphone}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* CV Snapshot */}
          {app.studentcv && (
            <>
              <Typography variant="h6" mb={1}>
                CV Snapshot
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit,minmax(200px,1fr))"
                gap={1}
              >
                {[
                  ["Phone", app.studentcv.studentphone],
                  ["LinkedIn", app.studentcv.linkdenprofile],
                  ["GitHub", app.studentcv.githubprofile],
                  ["10th Board", app.studentcv.tenthboard],
                  ["10th Marks", app.studentcv.tenthmarks],
                  ["12th Board", app.studentcv.twelthboard],
                  ["12th Marks", app.studentcv.twelthmarks],
                  ["Program", app.studentcv.programcode],
                  ["Institute", app.studentcv.institutename],
                  ["Sem 1", app.studentcv.sem1marks],
                  ["Sem 2", app.studentcv.sem2marks],
                  ["Sem 3", app.studentcv.sem3marks],
                  ["Sem 4", app.studentcv.sem4marks],
                  ["Sem 5", app.studentcv.sem5marks],
                  ["Sem 6", app.studentcv.sem6marks],
                  ["Sem 7", app.studentcv.sem7marks],
                  ["Sem 8", app.studentcv.sem8marks],
                  ["Total CGPA", app.studentcv.totalcgpa],
                ].map(([label, val]) => (
                  <Typography key={label}>
                    <strong>{label}:</strong> {val || "—"}
                  </Typography>
                ))}
              </Box>

              <Typography mt={2} mb={1} variant="body2">
                {app.studentcv.profilesummery}
              </Typography>

              <Typography variant="h6" mt={2}>
                Skills
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {app.studentcv.skills?.map((s) => (
                  <Chip label={s} key={s} />
                ))}
              </Box>

              <Typography variant="h6" mt={2}>
                Experience
              </Typography>
              {app.studentcv.experience?.length ? (
                app.studentcv.experience.map((exp, idx) => (
                  <Accordion key={idx} elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        {exp.companyname}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        Type: {exp.exptype}
                      </Typography>
                      <Typography>{exp.desc}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography color="text.secondary">None added</Typography>
              )}

              <Typography variant="h6" mt={2}>
                Projects
              </Typography>
              {app.studentcv.projects?.length ? (
                app.studentcv.projects.map((proj, idx) => (
                  <Accordion key={idx} elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography fontWeight={600}>
                        {proj.projectname}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        Tech: {proj.technologies}
                      </Typography>
                      <Typography>{proj.desc}</Typography>
                      {proj.projectlink && (
                        <Button
                          size="small"
                          href={proj.projectlink}
                          target="_blank"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        >
                          View
                        </Button>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))
              ) : (
                <Typography color="text.secondary">None added</Typography>
              )}
            </>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Status */}
          <Box display="flex" gap={2} alignItems="center" mt={3}>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={saveStatus}>
              Save Status
            </Button>
            {status === "Selected" && (
              <Button
                variant="contained"
                color="success"
                onClick={() => setHireDialogOpen(true)}
              >
                Hire Candidate
              </Button>
            )}
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>
        </Paper>

        <Dialog
          open={hireDialogOpen}
          onClose={() => setHireDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: "bold", bgcolor: "primary.main", color: "white" }}>
            Salary Configuration & Onboarding
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Fixed Components
            </Typography>
            <Grid container spacing={2} mb={3}>
              {Object.keys(salaryConfig.fixedComponents).map((key) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={key.toUpperCase()}
                    value={salaryConfig.fixedComponents[key]}
                    onChange={(e) =>
                      setSalaryConfig({
                        ...salaryConfig,
                        fixedComponents: {
                          ...salaryConfig.fixedComponents,
                          [key]: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Deductions
            </Typography>
            <Grid container spacing={2}>
              {Object.keys(salaryConfig.deductionComponents).map((key) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    fullWidth
                    label={key.toUpperCase()}
                    value={salaryConfig.deductionComponents[key]}
                    onChange={(e) =>
                      setSalaryConfig({
                        ...salaryConfig,
                        deductionComponents: {
                          ...salaryConfig.deductionComponents,
                          [key]: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Designation"
                  value={salaryConfig.designation}
                  onChange={(e) =>
                    setSalaryConfig({ ...salaryConfig, designation: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setHireDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleHire}
              disabled={loading}
            >
              Confirm Hiring
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          <Alert severity={snack.severity}>{snack.msg}</Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default JobApplicationDetailsPage;
