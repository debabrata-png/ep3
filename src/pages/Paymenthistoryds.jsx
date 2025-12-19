import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  AppBar,
  Toolbar,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1"
import global1 from "./global1";

const Paymenthistoryds = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    paymentType: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      let url = `/api/v2/paymentorderds/getall?colid=${global1.colid}`;

      if (filters.status) url += `&status=${filters.status}`;
      if (filters.paymentType) url += `&paymentType=${filters.paymentType}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;

      const res = await ep1.post(url);

      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.log("Error fetching payments");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "SUCCESS":
        return "success";
      case "FAILED":
        return "error";
      case "PENDING":
        return "warning";
      case "INITIATED":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Payment History
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filter Payments
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SUCCESS">Success</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="INITIATED">Initiated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  name="paymentType"
                  value={filters.paymentType}
                  onChange={handleFilterChange}
                  label="Payment Type"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SEMESTER_FEE">Semester Fee</MenuItem>
                  <MenuItem value="EXAM_FEE">Exam Fee</MenuItem>
                  <MenuItem value="ADMISSION_FEE">Admission Fee</MenuItem>
                  <MenuItem value="HOSTEL_FEE">Hostel Fee</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchPayments}
                sx={{ height: "56px" }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Student</TableCell>
                <TableCell>Reg No</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{payment.orderid}</TableCell>
                  <TableCell>{payment.studentName}</TableCell>
                  <TableCell>{payment.regno}</TableCell>
                  <TableCell>{payment.paymentType}</TableCell>
                  <TableCell>₹{payment.amount}</TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {payments.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Typography variant="body1" color="textSecondary">
              No payments found
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
};

export default Paymenthistoryds;
