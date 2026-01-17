import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  TextField,
  Grid,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Hdfcpaymenthistoryds = () => {
  const navigate = useNavigate();

  const [orders, setorders] = useState([]);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");
  const [page, setpage] = useState(0);
  const [rowsperpage, setrowsperpage] = useState(10);
  const [totalcount, settotalcount] = useState(0);

  const [filters, setfilters] = useState({
    colid: global1.colid || 1,
    regno: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchorders();
  }, [page, rowsperpage]);

  const fetchorders = async () => {
    try {
      setloading(true);
      seterror("");

      const response = await ep1.post("/api/v2/hdfcpaymentorderds/getall", {
        ...filters,
        page: page + 1,
        limit: rowsperpage,
      });

      if (response.data.success) {
        setorders(response.data.data);
        settotalcount(response.data.totalcount);
      } else {
        seterror(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      seterror(err.response?.data?.message || "Failed to fetch payment history");
    } finally {
      setloading(false);
    }
  };

  const handlechangepage = (event, newpage) => {
    setpage(newpage);
  };

  const handlechangerowsperpage = (event) => {
    setrowsperpage(parseInt(event.target.value, 10));
    setpage(0);
  };

  const handlefilterchange = (e) => {
    const { name, value } = e.target;
    setfilters({ ...filters, [name]: value });
  };

  const handlesearch = () => {
    setpage(0);
    fetchorders();
  };

  const handleclearfilters = () => {
    setfilters({
      colid: global1.colid || 1,
      regno: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setpage(0);
  };

  const getstatuschip = (status) => {
    const statuscolors = {
      SUCCESS: "success",
      FAILED: "error",
      PENDING: "warning",
      INITIATED: "info",
      CANCELLED: "default",
      EXPIRED: "default",
    };

    return (
      <Chip
        label={status}
        color={statuscolors[status] || "default"}
        size="small"
      />
    );
  };

  const formatdate = (datestring) => {
    if (!datestring) return "-";
    return new Date(datestring).toLocaleString("en-IN");
  };

  const formatamount = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            HDFC Payment History
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* Filters */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filter Orders
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Registration Number"
                  name="regno"
                  value={filters.regno}
                  onChange={handlefilterchange}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={filters.status}
                  onChange={handlefilterchange}
                  size="small"
                  SelectProps={{ native: true }}
                >
                  <option value="">All</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                  <option value="INITIATED">Initiated</option>
                  <option value="CANCELLED">Cancelled</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handlefilterchange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handlefilterchange}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handlesearch}
                  sx={{ height: "40px" }}
                >
                  Search
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleclearfilters}
                  sx={{ height: "40px" }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading */}
          {loading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Loading payment history...</Typography>
            </Box>
          ) : (
            <>
              {/* Orders Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                      <TableCell><strong>Order ID</strong></TableCell>
                      <TableCell><strong>Student</strong></TableCell>
                      <TableCell><strong>Reg No</strong></TableCell>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell><strong>Payment Type</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="text.secondary" py={4}>
                            No payment orders found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order._id} hover>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {order.orderid}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.student}</TableCell>
                          <TableCell>{order.regno}</TableCell>
                          <TableCell>
                            <Typography fontWeight="bold" color="primary">
                              {formatamount(order.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>{order.paymenttype}</TableCell>
                          <TableCell>{getstatuschip(order.status)}</TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatdate(order.createdAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/hdfcpaymentcallbackds?merchantOrderId=${order.orderid}&colid=${order.colid}&status=${order.status}`)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={totalcount}
                page={page}
                onPageChange={handlechangepage}
                rowsPerPage={rowsperpage}
                onRowsPerPageChange={handlechangerowsperpage}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </>
          )}

          {/* Refresh Button */}
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchorders}
            >
              Refresh
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default Hdfcpaymenthistoryds;
