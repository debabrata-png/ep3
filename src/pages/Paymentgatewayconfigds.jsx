import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Paymentgatewayconfigds = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: global1.name || "",
    user: global1.user || "",
    colid: global1.colid || 1,
    institutionname: "",
    marchentid: "",
    saltkey: "",
    saltindex: "",
    callbackurl: "",
    webhookurl: "",
    environment: "UAT",
    isTSP: false,
    tspClientId: "",
    tspClientSecret: "",
    tspClientVersion: "1",
    notes: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingConfig, setExistingConfig] = useState(null);

  useEffect(() => {
    fetchExistingConfig();
  }, []);

  const fetchExistingConfig = async () => {
    try {
      const res = await ep1.post(`/api/v2/paymentgatewayds/get?colid=${global1.colid}`);
      if (res.data.success) {
        setExistingConfig(res.data.data);
        setFormData({ ...formData, ...res.data.data });
      }
    } catch (err) {
      // No existing config found
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
      const endpoint = existingConfig
        ? `/api/v2/paymentgatewayds/update?colid=${global1.colid}`
        : "/api/v2/paymentgatewayds/create";

      const res = await ep1.post(endpoint, formData);

      if (res.data.success) {
        setSuccess(
          existingConfig
            ? "Configuration updated successfully!"
            : "Configuration created successfully!"
        );
        setError("");
        fetchExistingConfig();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
      setSuccess("");
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Payment Gateway Configuration
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {existingConfig ? "Update" : "Setup"} PhonePe Payment Gateway
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Institution Name"
                name="institutionname"
                value={formData.institutionname}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Merchant ID"
                name="marchentid"
                value={formData.marchentid}
                onChange={handleChange}
                required
                helperText="For TSP: Use end merchant MID (e.g., TSPEPAATHSALAUAT)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Callback URL"
                name="callbackurl"
                value={formData.callbackurl}
                onChange={handleChange}
                placeholder={`${window.location.origin}/paymentcallbackds`}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Webhook URL"
                name="webhookurl"
                value={formData.webhookurl}
                onChange={handleChange}
                placeholder="https://yourdomain.com/api/v2/paymentorderds/webhook"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Environment</InputLabel>
                <Select
                  name="environment"
                  value={formData.environment}
                  onChange={handleChange}
                  label="Environment"
                >
                  <MenuItem value="UAT">UAT (Testing)</MenuItem>
                  <MenuItem value="PRODUCTION">Production</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isTSP}
                    onChange={handleChange}
                    name="isTSP"
                  />
                }
                label="TSP (Technology Service Provider) Account"
              />
            </Grid>

            {formData.isTSP && (
              <>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    TSP accounts require additional authentication headers. Enter
                    your TSP credentials below.
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="TSP Client ID"
                    name="tspClientId"
                    value={formData.tspClientId}
                    onChange={handleChange}
                    placeholder="e.g., TSPEPAATHSALAUAT_2512011..."
                    required={formData.isTSP}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="TSP Client Secret"
                    name="tspClientSecret"
                    value={formData.tspClientSecret && formData.saltkey}
                    onChange={handleChange}
                    placeholder="Your TSP client secret"
                    required={formData.isTSP}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="TSP Client Version"
                    name="tspClientVersion"
                    value={formData.tspClientVersion && formData.saltindex}
                    onChange={handleChange}
                    placeholder="1"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                onClick={handleSubmit}
              >
                {existingConfig ? "Update Configuration" : "Save Configuration"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {formData.isTSP && (
          <Paper elevation={3} sx={{ p: 4, mt: 3, bgcolor: "#f5f5f5" }}>
            <Typography variant="h6" gutterBottom>
              TSP Configuration Guide
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>For UAT Testing:</strong>
            </Typography>
            <Typography variant="body2" component="div">
              • Merchant ID: TSPEPAATHSALAUAT
              <br />
              • TSP Client ID: TSPEPAATHSALAUAT_2512011...
              <br />
              • TSP Client Secret: YzE2YmRmNTMtYjdkMS00NmU0LWJiM2YtNDhkYTE2NjQ5NTFl
              <br />
              • Salt Key: Same as Client Secret
              <br />
              • Salt Index: 1<br />
              • Client Version: 1
            </Typography>
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Paymentgatewayconfigds;
