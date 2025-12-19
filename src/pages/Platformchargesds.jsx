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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Platformchargesds = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: global1.name || "",
    user: global1.user || "",
    colid: global1.colid || 1,
    institutionname: "",
    chargetype: "Fixed",
    fixedcharge: 0,
    percentagecharge: 0,
    minimumcharge: 0,
    maximumcharge: 0,
    gstApplicable: true,
    gstPercentage: 18,
    chargeBearer: "STUDENT",
    notes: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingConfig, setExistingConfig] = useState(null);
  const [calculatedCharges, setCalculatedCharges] = useState(null);
  const [testAmount, setTestAmount] = useState(5000);

  useEffect(() => {
    fetchExistingConfig();
  }, []);

  const fetchExistingConfig = async () => {
    try {
      const res = await ep1.post(`/api/v2/platformchargesds/get?colid=${global1.colid}`);
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

  const handleCalculate = async () => {
    try {
      const res = await ep1.post(
        `/api/v2/platformchargesds/calculate?colid=${global1.colid}&amount=${testAmount}`
      );
      if (res.data.success) {
        setCalculatedCharges(res.data.data);
      }
    } catch (err) {
      setError("Failed to calculate charges");
    }
  };

  const handleSubmit = async () => {
    try {
      const endpoint = existingConfig
        ? `/api/v2/platformchargesds/update?colid=${global1.colid}`
        : "/api/v2/platformchargesds/create";

      const res = await ep1.post(endpoint, formData);

      if (res.data.success) {
        setSuccess(
          existingConfig
            ? "Charges updated successfully!"
            : "Charges configured successfully!"
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
            Platform Charges Configuration
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            {existingConfig ? "Update" : "Setup"} Platform Charges
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

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Charge Type</InputLabel>
                <Select
                  name="chargetype"
                  value={formData.chargetype}
                  onChange={handleChange}
                  label="Charge Type"
                >
                  <MenuItem value="Fixed">Fixed Amount</MenuItem>
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="Hybrid">Hybrid (Fixed + Percentage)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {(formData.chargetype === "Fixed" ||
              formData.chargetype === "Hybrid") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fixed Charge (₹)"
                  name="fixedcharge"
                  type="number"
                  value={formData.fixedcharge}
                  onChange={handleChange}
                />
              </Grid>
            )}

            {(formData.chargetype === "Percentage" ||
              formData.chargetype === "Hybrid") && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Percentage Charge (%)"
                  name="percentagecharge"
                  type="number"
                  value={formData.percentagecharge}
                  onChange={handleChange}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Charge (₹)"
                name="minimumcharge"
                type="number"
                value={formData.minimumcharge}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Charge (₹)"
                name="maximumcharge"
                type="number"
                value={formData.maximumcharge}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.gstApplicable}
                    onChange={handleChange}
                    name="gstApplicable"
                  />
                }
                label="GST Applicable"
              />
            </Grid>

            {formData.gstApplicable && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GST Percentage (%)"
                  name="gstPercentage"
                  type="number"
                  value={formData.gstPercentage}
                  onChange={handleChange}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Charge Bearer</InputLabel>
                <Select
                  name="chargeBearer"
                  value={formData.chargeBearer}
                  onChange={handleChange}
                  label="Charge Bearer"
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="INSTITUTION">Institution</MenuItem>
                  <MenuItem value="SHARED">Shared</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={2}
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
                {existingConfig ? "Update Charges" : "Save Charges"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {existingConfig && (
          <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Charge Calculator
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Test Amount (₹)"
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCalculate}
                >
                  Calculate Charges
                </Button>
              </Grid>
            </Grid>

            {calculatedCharges && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1">
                  <strong>Original Amount:</strong> ₹
                  {calculatedCharges.originalAmount}
                </Typography>
                <Typography variant="body1">
                  <strong>Base Charge:</strong> ₹{calculatedCharges.baseCharge}
                </Typography>
                <Typography variant="body1">
                  <strong>GST Amount:</strong> ₹{calculatedCharges.gstAmount}
                </Typography>
                <Typography variant="body1">
                  <strong>Total Charge:</strong> ₹{calculatedCharges.totalCharge}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  <strong>Final Amount:</strong> ₹{calculatedCharges.finalAmount}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      </Container>
    </>
  );
};

export default Platformchargesds;
