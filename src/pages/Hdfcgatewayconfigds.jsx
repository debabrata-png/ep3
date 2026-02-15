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
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Hdfcgatewayconfigds = () => {
  const navigate = useNavigate();

  const [configs, setconfigs] = useState([]);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");
  const [success, setsuccess] = useState("");

  const [opendialog, setopendialog] = useState(false);
  const [editmode, seteditmode] = useState(false);
  const [selectedconfig, setselectedconfig] = useState(null);

  const [showsensitive, setshowsensitive] = useState({
    apikey: false,
    responsekey: false,
  });

  const [formdata, setformdata] = useState({
    name: global1.name || "",
    user: global1.user || "",
    colid: global1.colid || "",
    institutionname: "",
    merchantid: "",
    apikey: "",
    paymentpageclientid: "hdfcmaster",
    responsekey: "",
    baseurl: "https://smartgateway.hdfcuat.bank.in",
    callbackurl: "",
    webhookurl: "",
    environment: "UAT",
    isactive: true,
    enablelogging: true,
    loggingpath: "./logs/hdfcpaymenthandler.log",
    notes: "",
  });

  useEffect(() => {
    fetchconfigs();
  }, []);

  const fetchconfigs = async () => {
    try {
      setloading(true);
      seterror("");

      const response = await ep1.post("/api/v2/hdfcgatewayds/getall", {
        colid: global1.colid
      });

      if (response.data.success) {
        setconfigs(response.data.data);
      } else {
        seterror(response.data.message || "Failed to fetch configurations");
      }
    } catch (err) {
      console.error("Error fetching configs:", err);
      seterror(err.response?.data?.message || "Failed to fetch HDFC gateway configurations");
    } finally {
      setloading(false);
    }
  };

  const handleopendialog = (config = null) => {
    if (config) {
      // Edit mode
      seteditmode(true);
      setselectedconfig(config);
      setformdata({
        name: config.name,
        user: config.user,
        colid: config.colid,
        institutionname: config.institutionname,
        merchantid: config.merchantid,
        apikey: config.apikey,
        paymentpageclientid: config.paymentpageclientid,
        responsekey: config.responsekey,
        baseurl: config.baseurl,
        callbackurl: config.callbackurl,
        webhookurl: config.webhookurl || "",
        environment: config.environment,
        isactive: config.isactive,
        enablelogging: config.enablelogging,
        loggingpath: config.loggingpath,
        notes: config.notes || "",
      });
    } else {
      // Create mode
      seteditmode(false);
      setselectedconfig(null);
      setformdata({
        name: global1.name || "",
        user: global1.user || "",
        colid: global1.colid || "",
        institutionname: "",
        merchantid: "",
        apikey: "",
        paymentpageclientid: "hdfcmaster",
        responsekey: "",
        baseurl: "https://smartgateway.hdfcuat.bank.in",
        callbackurl: "",
        webhookurl: "",
        environment: "UAT",
        isactive: true,
        enablelogging: true,
        loggingpath: "./logs/hdfcpaymenthandler.log",
        notes: "",
      });
    }
    setopendialog(true);
  };

  const handleclosedialog = () => {
    setopendialog(false);
    seteditmode(false);
    setselectedconfig(null);
    seterror("");
    setsuccess("");
  };

  const handlechange = (e) => {
    const { name, value, checked, type } = e.target;
    setformdata({
      ...formdata,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleenvironmentchange = (e) => {
    const environment = e.target.value;
    const baseurl =
      environment === "UAT"
        ? "https://smartgateway.hdfcuat.bank.in"
        : "https://smartgateway.hdfc.bank.in";

    setformdata({
      ...formdata,
      environment,
      baseurl,
    });
  };

  const handlesubmit = async () => {
    try {
      // Validation
      if (
        !formdata.colid ||
        !formdata.institutionname ||
        !formdata.merchantid ||
        !formdata.apikey ||
        !formdata.paymentpageclientid ||
        !formdata.responsekey ||
        !formdata.callbackurl
      ) {
        seterror("Please fill all required fields");
        return;
      }

      seterror("");
      setsuccess("");

      let response;

      if (editmode) {
        // Update existing config
        response = await ep1.post(
          `/api/v2/hdfcgatewayds/update?colid=${formdata.colid}`,
          formdata
        );
      } else {
        // Create new config
        response = await ep1.post("/api/v2/hdfcgatewayds/create", formdata);
      }

      if (response.data.success) {
        setsuccess(
          editmode
            ? "Configuration updated successfully"
            : "Configuration created successfully"
        );
        setTimeout(() => {
          handleclosedialog();
          fetchconfigs();
        }, 1500);
      } else {
        seterror(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Error submitting config:", err);
      seterror(
        err.response?.data?.message || "Failed to save configuration"
      );
    }
  };

  const handletoggle = async (config) => {
    try {
      const response = await ep1.post(
        `/api/v2/hdfcgatewayds/toggle?colid=${config.colid}`
      );

      if (response.data.success) {
        setsuccess(
          `Gateway ${config.isactive ? "deactivated" : "activated"} successfully`
        );
        fetchconfigs();
        setTimeout(() => setsuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error toggling config:", err);
      seterror(err.response?.data?.message || "Failed to toggle status");
      setTimeout(() => seterror(""), 3000);
    }
  };

  const handledelete = async (config) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) {
      return;
    }

    try {
      const response = await ep1.get(
        `/api/v2/hdfcgatewayds/delete?colid=${config.colid}`
      );

      if (response.data.success) {
        setsuccess("Configuration deleted successfully");
        fetchconfigs();
        setTimeout(() => setsuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error deleting config:", err);
      seterror(err.response?.data?.message || "Failed to delete configuration");
      setTimeout(() => seterror(""), 3000);
    }
  };

  const togglesensitivevisibility = (field) => {
    setshowsensitive({
      ...showsensitive,
      [field]: !showsensitive[field],
    });
  };

  const masksensitivedata = (data, show) => {
    if (show) return data;
    return data ? "••••••••••••" : "";
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HDFC Gateway Configuration
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Success/Error Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => seterror("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setsuccess("")}>
            {success}
          </Alert>
        )}

        {/* Add New Button */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleopendialog()}
          >
            Add HDFC Gateway Configuration
          </Button>
        </Box>

        {/* Loading */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading configurations...</Typography>
          </Box>
        ) : (
          <>
            {/* Configurations List */}
            {configs.length === 0 ? (
              <Paper elevation={3} sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No HDFC Gateway Configuration Found
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Click the button above to add your first configuration
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleopendialog()}
                >
                  Add Configuration
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {configs.map((config) => (
                  <Grid item xs={12} md={6} lg={4} key={config._id}>
                    <Card elevation={3}>
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" component="div">
                            {config.institutionname}
                          </Typography>
                          <Chip
                            label={config.isactive ? "Active" : "Inactive"}
                            color={config.isactive ? "success" : "default"}
                            size="small"
                          />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            College ID:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {config.colid}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Merchant ID:
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace">
                            {config.merchantid}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Page Client ID:
                          </Typography>
                          <Typography variant="body1" fontFamily="monospace">
                            {config.paymentpageclientid}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Environment:
                          </Typography>
                          <Chip
                            label={config.environment}
                            color={config.environment === "UAT" ? "warning" : "success"}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Base URL:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontFamily="monospace"
                            sx={{ wordBreak: "break-all" }}
                          >
                            {config.baseurl}
                          </Typography>
                        </Box>

                        {config.notes && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Notes:
                            </Typography>
                            <Typography variant="body2">{config.notes}</Typography>
                          </Box>
                        )}
                      </CardContent>

                      <CardActions sx={{ justifyContent: "space-between", px: 2, pb: 2 }}>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => handleopendialog(config)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handledelete(config)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={config.isactive}
                              onChange={() => handletoggle(config)}
                              color="success"
                            />
                          }
                          label={config.isactive ? "Active" : "Inactive"}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Add/Edit Dialog */}
        <Dialog
          open={opendialog}
          onClose={handleclosedialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editmode ? "Edit HDFC Gateway Configuration" : "Add HDFC Gateway Configuration"}
          </DialogTitle>

          <DialogContent dividers>
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

            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Basic Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name *"
                  name="name"
                  value={formdata.name}
                  onChange={handlechange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="User *"
                  name="user"
                  value={formdata.user}
                  onChange={handlechange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="College ID *"
                  name="colid"
                  type="number"
                  value={formdata.colid}
                  onChange={handlechange}
                  disabled={editmode}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Institution Name *"
                  name="institutionname"
                  value={formdata.institutionname}
                  onChange={handlechange}
                  required
                />
              </Grid>

              {/* HDFC Gateway Credentials */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  HDFC Gateway Credentials
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Merchant ID *"
                  name="merchantid"
                  value={formdata.merchantid}
                  onChange={handlechange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payment Page Client ID *"
                  name="paymentpageclientid"
                  value={formdata.paymentpageclientid}
                  onChange={handlechange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="API Key *"
                  name="apikey"
                  type={showsensitive.apikey ? "text" : "password"}
                  value={formdata.apikey}
                  onChange={handlechange}
                  required
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglesensitivevisibility("apikey")}
                        edge="end"
                      >
                        {showsensitive.apikey ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Response Key *"
                  name="responsekey"
                  type={showsensitive.responsekey ? "text" : "password"}
                  value={formdata.responsekey}
                  onChange={handlechange}
                  required
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={() => togglesensitivevisibility("responsekey")}
                        edge="end"
                      >
                        {showsensitive.responsekey ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>

              {/* Environment Configuration */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Environment Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Environment *"
                  name="environment"
                  value={formdata.environment}
                  onChange={handleenvironmentchange}
                  SelectProps={{ native: true }}
                >
                  <option value="UAT">UAT (Testing)</option>
                  <option value="PRODUCTION">Production (Live)</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Base URL *"
                  name="baseurl"
                  value={formdata.baseurl}
                  onChange={handlechange}
                  required
                  disabled
                />
              </Grid>

              {/* Callback URLs */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Callback URLs
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Callback URL *"
                  name="callbackurl"
                  value={formdata.callbackurl}
                  onChange={handlechange}
                  placeholder="https://yourdomain.com/api/v2/hdfcpaymentorderds/webhook"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Webhook URL (Optional)"
                  name="webhookurl"
                  value={formdata.webhookurl}
                  onChange={handlechange}
                  placeholder="https://yourdomain.com/webhook/hdfc"
                />
              </Grid>

              {/* Logging Configuration */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Logging Configuration
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formdata.enablelogging}
                      onChange={handlechange}
                      name="enablelogging"
                      color="primary"
                    />
                  }
                  label="Enable Logging"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formdata.isactive}
                      onChange={handlechange}
                      name="isactive"
                      color="success"
                    />
                  }
                  label="Active Gateway"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Logging Path"
                  name="loggingpath"
                  value={formdata.loggingpath}
                  onChange={handlechange}
                  disabled={!formdata.enablelogging}
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formdata.notes}
                  onChange={handlechange}
                  multiline
                  rows={3}
                  placeholder="Add any additional notes or comments about this configuration"
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleclosedialog} color="inherit">
              Cancel
            </Button>
            <Button onClick={handlesubmit} variant="contained" color="primary">
              {editmode ? "Update Configuration" : "Create Configuration"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Hdfcgatewayconfigds;
