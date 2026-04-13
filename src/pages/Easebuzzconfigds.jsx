import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  AppBar,
  Toolbar,
  Alert,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Easebuzzconfigds = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [configId, setConfigId] = useState(null);

  const [formData, setFormData] = useState({
    name: "Easebuzz Gateway",
    user: global1.user || "",
    colid: global1.colid || "",
    merchantid: "",
    salt: "",
    environment: "test",
    isactive: true,
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await ep1.post("/api/v2/easebuzzgatewayds/get", {
        colid: global1.colid,
      });

      if (response.data.success) {
        const data = response.data.data;
        setFormData(data);
        setConfigId(data._id);
      }
    } catch (err) {
      // Not found is fine for first time
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccess("");

      let response;
      if (configId) {
        response = await ep1.post(`/api/v2/easebuzzgatewayds/update?id=${configId}`, formData);
      } else {
        response = await ep1.post("/api/v2/easebuzzgatewayds/create", formData);
      }

      if (response.data.success) {
        setSuccess("Easebuzz credentials saved successfully");
        if (!configId) setConfigId(response.data.data._id);
      } else {
        setError(response.data.message || "Failed to save configuration");
      }
    } catch (err) {
      setError("Failed to save credentials");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Easebuzz Credentials Configuration
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }} elevation={3}>
          <Typography variant="h5" gutterBottom>Easebuzz Merchant Settings</Typography>
          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Merchant Key (Key) *" name="merchantid" value={formData.merchantid} onChange={handleChange} type="text" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Merchant Salt *" name="salt" value={formData.salt} onChange={handleChange} type="text" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Environment" name="environment" value={formData.environment} onChange={handleChange} SelectProps={{ native: true }}>
                <option value="test">Test (Sandbox)</option>
                <option value="prod">Production (Live)</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" height="100%">
                <FormControlLabel control={<Switch checked={formData.isactive} name="isactive" onChange={handleChange} />} label="Active" />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" size="large" onClick={handleSubmit} fullWidth>
                Save Easebuzz Settings
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default Easebuzzconfigds;
