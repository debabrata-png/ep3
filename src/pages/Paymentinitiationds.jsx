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
// import axios from "axios";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Paymentinitiationds = () => {
  const navigate = useNavigate();
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
    redirectUrl: `${window.location.origin}/paymentcallbackds`,
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

      const orderResponse = await ep1.post("/api/v2/paymentorderds/create", formData);

      if (!orderResponse.data.success) {
        setError(orderResponse.data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      const { paymentUrl } = orderResponse.data.data;

      if (paymentUrl) {
        window.location.href = paymentUrl;
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
            Initiate Payment
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Create New Payment
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

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Student Name"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Registration Number"
                name="regno"
                value={formData.regno}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="studentEmail"
                type="email"
                value={formData.studentEmail}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Phone"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Amount"
                name="originalAmount"
                type="number"
                value={formData.originalAmount}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  disabled={loading}
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

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Purpose"
                name="paymentPurpose"
                value={formData.paymentPurpose}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Academic Year"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Program Code"
                name="programcode"
                value={formData.programcode}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Admission Year"
                name="admissionyear"
                value={formData.admissionyear}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fee Group"
                name="feegroup"
                value={formData.feegroup}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fee Item"
                name="feeitem"
                value={formData.feeitem}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fee Category"
                name="feecategory"
                value={formData.feecategory}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Installment"
                name="installment"
                value={formData.installment}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Comments"
                name="comments"
                multiline
                rows={2}
                value={formData.comments}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Coupon Code (Optional)
              </Typography>
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Coupon Code"
                name="couponCode"
                value={formData.couponCode}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                onClick={validateCoupon}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                Apply
              </Button>
            </Grid>

            {amountBreakdown && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Amount Breakdown
                    </Typography>
                    <Typography>Original Amount: ₹{formData.originalAmount}</Typography>
                    <Typography color="success.main">Discount: -₹{amountBreakdown.discount}</Typography>
                    <Typography variant="h6" color="primary">
                      Final Amount: ₹{amountBreakdown.finalAmount}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
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

export default Paymentinitiationds;
