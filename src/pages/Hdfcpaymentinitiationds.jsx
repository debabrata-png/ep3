import React, { useState } from "react";
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
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Hdfcpaymentinitiationds = () => {
  const navigate = useNavigate();
  
  // ✅ Extract backend URL from ep1.js config
  const backendURL = ep1.defaults.baseURL;
  
  // ✅ Get frontend URL from window.location
  const frontendURL = window.location.origin;

  const [formData, setFormData] = useState({
    name: global1.name || "",
    user: global1.user || "",
    colid: global1.colid || 1,
    studentName: "",
    regno: "",
    studentEmail: "",
    studentPhone: "",
    originalAmount: "",
    paymentType: "SEMESTER_FEE",
    paymentPurpose: "",
    academicYear: "2024-25",
    semester: "",
    course: "",
    department: "",
    programcode: "",
    admissionyear: "",
    couponCode: "",
    feegroup: "",
    feeitem: "",
    feecategory: "",
    installment: "",
    // ✅ Dynamic URLs - sent to backend
    frontendCallbackUrl: `${frontendURL}/hdfcpaymentcallbackds`,
    backendReturnUrl: `${backendURL}/api/v2/hdfcpaymentorderds/return`,
    comments: "",
    notes: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [amountBreakdown, setAmountBreakdown] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateCoupon = async () => {
    if (!formData.couponCode || !formData.originalAmount || !formData.regno) {
      setError("Please fill regno and amount before applying coupon");
      return;
    }

    try {
      const res = await ep1.post(
        `/api/v2/coupondsdata/validate?couponCode=${formData.couponCode}&colid=${formData.colid}&regno=${formData.regno}&orderAmount=${formData.originalAmount}&paymentType=${formData.paymentType}&course=${formData.course}&department=${formData.department}&semester=${formData.semester}&programcode=${formData.programcode}`
      );

      if (res.data.success) {
        setAmountBreakdown(res.data.data);
        setSuccess("Coupon applied successfully!");
        setError("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid coupon");
      setAmountBreakdown(null);
      setSuccess("");
    }
  };

  const handleInitiatePayment = async () => {
    if (!formData.studentName || !formData.regno || !formData.studentEmail ||
        !formData.studentPhone || !formData.originalAmount) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ✅ Send request to HDFC payment order endpoint with dynamic URLs
      const orderResponse = await ep1.post("/api/v2/hdfcpaymentorderds/create", formData);

      if (!orderResponse.data.success) {
        setError(orderResponse.data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      const { paymenturl } = orderResponse.data.data;

      if (paymenturl) {
        // Redirect to HDFC payment page
        window.location.href = paymenturl;
      } else {
        setError("Failed to get payment URL from server");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Initiate HDFC Payment
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Create New HDFC Payment
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

          <Grid container spacing={2}>
            {/* Student Details */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Student Name *"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Registration Number *"
                name="regno"
                value={formData.regno}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                name="studentEmail"
                type="email"
                value={formData.studentEmail}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone *"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount (INR) *"
                name="originalAmount"
                type="number"
                value={formData.originalAmount}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Payment Details */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  label="Payment Type"
                >
                  <MenuItem value="SEMESTER_FEE">Semester Fee</MenuItem>
                  <MenuItem value="EXAM_FEE">Exam Fee</MenuItem>
                  <MenuItem value="ADMISSION_FEE">Admission Fee</MenuItem>
                  <MenuItem value="HOSTEL_FEE">Hostel Fee</MenuItem>
                  <MenuItem value="LIBRARY_FEE">Library Fee</MenuItem>
                  <MenuItem value="REGISTRATION_FEE">Registration Fee</MenuItem>
                  <MenuItem value="FINE">Fine</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Purpose"
                name="paymentPurpose"
                value={formData.paymentPurpose}
                onChange={handleChange}
              />
            </Grid>

            {/* Coupon Code */}
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Coupon Code (Optional)"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={validateCoupon}
                sx={{ height: '56px' }}
              >
                Apply
              </Button>
            </Grid>

            {/* Amount Breakdown */}
            {amountBreakdown && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Amount Breakdown
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography>Original Amount: ₹{formData.originalAmount}</Typography>
                    <Typography color="success.main">Discount: -₹{amountBreakdown.discount}</Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Final Amount: ₹{amountBreakdown.finalAmount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleInitiatePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </>
  );
};

export default Hdfcpaymentinitiationds;
