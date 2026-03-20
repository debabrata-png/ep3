import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Kommunosettingsds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    smeId: "",
    accessToken: "",
    accessKey: "",
    pilotNumber: "",
    baseUrl: "https://api.kommuno.com",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getkommunosettingsds", {
        params: { colid: global1.colid },
      });
      if (res.data.success && res.data.data) {
        setFormData({
          smeId: res.data.data.smeId || "",
          accessToken: res.data.data.accessToken || "",
          accessKey: res.data.data.accessKey || "",
          pilotNumber: res.data.data.pilotNumber || "",
          baseUrl: res.data.data.baseUrl || "https://api.kommuno.com",
        });
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      // It's okay if settings don't exist yet
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        colid: global1.colid,
        user: global1.user, // Admin user who saves this
      };
      await ep1.post("/api/v2/savekommunosettingsds", payload);
      showSnackbar("Settings saved successfully", "success");
    } catch (err) {
      console.error("Error saving settings:", err);
      showSnackbar("Failed to save settings", "error");
    }
    setLoading(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={() => navigate("/dashboardcrmds")}
          sx={{
            mr: 2,
            bgcolor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            "&:hover": { bgcolor: "#f8fafc" }
          }}
        >
          <BackIcon sx={{ color: "#1e293b" }} />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Kommuno API Settings
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SME ID"
                  variant="outlined"
                  value={formData.smeId}
                  onChange={(e) => setFormData({ ...formData, smeId: e.target.value })}
                  required
                  placeholder="e.g. 10001001"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Access Key"
                  variant="outlined"
                  value={formData.accessKey}
                  onChange={(e) => setFormData({ ...formData, accessKey: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Access Token"
                  variant="outlined"
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pilot Number"
                  variant="outlined"
                  value={formData.pilotNumber}
                  onChange={(e) => setFormData({ ...formData, pilotNumber: e.target.value })}
                  required
                  placeholder="e.g. +91XXXXXXXXXX"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Base URL"
                  variant="outlined"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  required
                  placeholder="https://api.kommuno.com"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    sx={{
                      bgcolor: "#1565c0",
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "#0d47a1" }
                    }}
                  >
                    {loading ? "Saving..." : "Save Settings"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchSettings}
                    disabled={loading}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      <Box sx={{ mt: 4 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          These settings enable the "Click to Call" feature across the CRM. Each institution (Colid) can have its own Kommuno configuration.
        </Alert>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Kommunosettingsds;
