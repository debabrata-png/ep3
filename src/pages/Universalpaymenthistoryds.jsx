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
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Universalpaymenthistoryds = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    gatewayname: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await ep1.post("/api/v2/universalpaymentgatewayds/getallhistory", {
        colid: global1.colid,
        ...filters
      });

      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
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
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Unified Payment History
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Filter Transactions
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="SUCCESS">Success</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="INITIATED">Initiated</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Gateway</InputLabel>
                <Select
                  name="gatewayname"
                  value={filters.gatewayname}
                  onChange={handleFilterChange}
                  label="Gateway"
                >
                  <MenuItem value="">All Gateways</MenuItem>
                  <MenuItem value="Easebuzz">Easebuzz</MenuItem>
                  <MenuItem value="HDFC">HDFC</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                fullWidth
                size="small"
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
                size="small"
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
                sx={{ height: "40px", textTransform: 'none' }}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student Info</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Transaction IDs</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Gateway</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {payment.studentname}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        ID: {payment.regno}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        Order: {payment.orderid}
                      </Typography>
                      {payment.txnid && (
                        <Typography variant="caption" color="textSecondary">
                          TXN: {payment.txnid}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{payment.gatewayname}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {payment.accountno}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      ₹{parseFloat(payment.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status}
                        color={getStatusColor(payment.status)}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && payments.length === 0 && (
            <Box sx={{ textAlign: "center", py: 10 }}>
              <Typography variant="body1" color="textSecondary">
                No transactions found for the selected criteria.
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </>
  );
};

export default Universalpaymenthistoryds;
