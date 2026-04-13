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
  Card,
  CardContent,
  CardActions,
  Divider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Pgmasterconfigds = () => {
  const navigate = useNavigate();

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const [formData, setFormData] = useState({
    name: global1.name || "",
    user: global1.user || "",
    colid: global1.colid || "",
    gatwayname: "",
    accountno: "",
    accountname: "",
    api: "",
    isactive: true,
    environment: "UAT",
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await ep1.post("/api/v2/pgmasterds/getall", {
        colid: global1.colid,
      });

      if (response.data.success) {
        setConfigs(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch configurations");
      }
    } catch (err) {
      setError("Failed to fetch gateway configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (config = null) => {
    if (config) {
      setEditMode(true);
      setSelectedConfig(config);
      setFormData({
        ...config,
      });
    } else {
      setEditMode(false);
      setSelectedConfig(null);
      setFormData({
        name: global1.name || "",
        user: global1.user || "",
        colid: global1.colid || "",
        gatwayname: "",
        accountno: "",
        accountname: "",
        api: "",
        isactive: true,
        environment: "UAT",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError("");
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
      if (!formData.gatwayname) {
        setError("Gateway Name is required");
        return;
      }

      let response;
      if (editMode) {
        response = await ep1.post(`/api/v2/pgmasterds/update?id=${selectedConfig._id}`, formData);
      } else {
        response = await ep1.post("/api/v2/pgmasterds/create", formData);
      }

      if (response.data.success) {
        setSuccess("Configuration saved successfully");
        fetchConfigs();
        handleCloseDialog();
      } else {
        setError(response.data.message || "Failed to save configuration");
      }
    } catch (err) {
      setError("Failed to save configuration");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this gateway?")) {
      try {
        const response = await ep1.get(`/api/v2/pgmasterds/delete?id=${id}`);
        if (response.data.success) {
          fetchConfigs();
          setSuccess("Deleted successfully");
        }
      } catch (err) {
        setError("Failed to delete configuration");
      }
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Payment Gateway Master
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Gateway
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {configs.map((config) => (
              <Grid item xs={12} md={4} key={config._id}>
                <Card elevation={3}>
                  <CardContent>
                    <Typography variant="h6">{config.gatwayname}</Typography>
                    <Typography color="textSecondary">Acc: {config.accountno}</Typography>
                    <Typography color="textSecondary">Env: {config.environment}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, wordBreak: 'break-all' }}>
                      API: {config.api}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(config)} color="primary"><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(config._id)} color="error"><DeleteIcon /></IconButton>
                    </Box>
                    <Switch checked={config.isactive} disabled />
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? "Edit Gateway" : "Add Gateway"}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Gateway Name *" name="gatwayname" value={formData.gatwayname} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Account Number" name="accountno" value={formData.accountno} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Account Name" name="accountname" value={formData.accountname} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Initiation API Endpoint" name="api" value={formData.api} onChange={handleChange} placeholder="/api/v2/universalpaymentgatewayds/create" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Environment" name="environment" value={formData.environment} onChange={handleChange} SelectProps={{ native: true }}>
                  <option value="UAT">UAT</option>
                  <option value="PRODUCTION">PRODUCTION</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel control={<Switch checked={formData.isactive} name="isactive" onChange={handleChange} />} label="Active" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Pgmasterconfigds;
