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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const Couponmanagementds = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: global1.name || "",
    user: global1.user || "",
    colid: global1.colid || 1,
    couponCode: "",
    couponName: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    maximumDiscount: 0,
    minimumOrderAmount: 0,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: "",
    usageLimit: null,
    perUserLimit: 1,
    applicablePaymentTypes: "",
    isPublic: true,
    createdBy: global1.user,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await ep1.post(
        `/api/v2/coupondsdata/getall?colid=${global1.colid}`
      );
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      // Handle error
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const res = await ep1.post("/api/v2/coupondsdata/create", formData);

      if (res.data.success) {
        setSuccess("Coupon created successfully!");
        setError("");
        setOpenDialog(false);
        fetchCoupons();
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create coupon");
      setSuccess("");
    }
  };

  const handleDelete = async (couponCode) => {
    if (window.confirm("Are you sure you want to deactivate this coupon?")) {
      try {
        await ep1.get(`/api/v2/coupondsdata/delete?couponCode=${couponCode}`);
        setSuccess("Coupon deactivated successfully!");
        fetchCoupons();
      } catch (err) {
        setError("Failed to deactivate coupon");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: global1.name || "",
      user: global1.user || "",
      colid: global1.colid || 1,
      couponCode: "",
      couponName: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maximumDiscount: 0,
      minimumOrderAmount: 0,
      validFrom: new Date().toISOString().split("T")[0],
      validTo: "",
      usageLimit: null,
      perUserLimit: 1,
      applicablePaymentTypes: "",
      isPublic: true,
      createdBy: global1.user,
    });
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Coupon Management
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h5">Coupons</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Create Coupon
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Coupon Code</TableCell>
                <TableCell>Coupon Name</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Valid From</TableCell>
                <TableCell>Valid To</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell>
                    <strong>{coupon.couponCode}</strong>
                  </TableCell>
                  <TableCell>{coupon.couponName}</TableCell>
                  <TableCell>
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {new Date(coupon.validFrom).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(coupon.validTo).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {coupon.usageCount} / {coupon.usageLimit || "∞"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={coupon.isActive ? "Active" : "Inactive"}
                      color={coupon.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(coupon.couponCode)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Create New Coupon</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coupon Code"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coupon Name"
                  name="couponName"
                  value={formData.couponName}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                    label="Discount Type"
                  >
                    <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                    <MenuItem value="FIXED">Fixed Amount</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={
                    formData.discountType === "PERCENTAGE"
                      ? "Discount (%)"
                      : "Discount (₹)"
                  }
                  name="discountValue"
                  type="number"
                  value={formData.discountValue}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Minimum Order Amount (₹)"
                  name="minimumOrderAmount"
                  type="number"
                  value={formData.minimumOrderAmount}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Maximum Discount (₹)"
                  name="maximumDiscount"
                  type="number"
                  value={formData.maximumDiscount}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valid From"
                  name="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Valid To"
                  name="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Usage Limit"
                  name="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Per User Limit"
                  name="perUserLimit"
                  type="number"
                  value={formData.perUserLimit}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Create Coupon
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Couponmanagementds;
