import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const FinalSettlementPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [settlementData, setSettlementData] = useState({
    amount: 0,
    settlementFormat: "Release",
    description: "",
  });
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const fetchSettlementSummary = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getsettlementdata", {
        params: { email, colid: global1.colid },
      });
      setData(res.data);
      setSettlementData({ ...settlementData, amount: res.data.summary.netBalance });
    } catch (err) {
      setSnack({ open: true, msg: "Failed to fetch summary", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const processSettlement = async () => {
    try {
      await ep1.post("/api/v2/processfinalsettlement", {
        ...settlementData,
        email,
        colid: global1.colid,
        addedBy: global1.user,
      });
      setSnack({ open: true, msg: "Settlement processed and user status updated", severity: "success" });
      fetchSettlementSummary();
    } catch (err) {
      setSnack({ open: true, msg: "Settlement failed", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Final Settlement Process
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, display: "flex", gap: 2 }}>
        <TextField
          label="Employee Email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={fetchSettlementSummary} disabled={loading || !email}>
          Calculate Settlement
        </Button>
      </Paper>

      {data && (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, bgcolor: "success.light", color: "white" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingUpIcon />
                  <Typography variant="h6">Total Payable</Typography>
                </Stack>
                <Typography variant="h4">₹{data.summary.totalPayable.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, bgcolor: "error.light", color: "white" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TrendingDownIcon />
                  <Typography variant="h6">Total Receivable</Typography>
                </Stack>
                <Typography variant="h4">₹{data.summary.totalReceivable.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, bgcolor: "primary.main", color: "white" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccountBalanceWalletIcon />
                  <Typography variant="h6">Net Balance</Typography>
                </Stack>
                <Typography variant="h4">₹{data.summary.netBalance.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Ledger History Table */}
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Direction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.ledgerEntries.map((e) => (
                    <TableRow key={e._id}>
                      <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                      <TableCell>{e.transactionType}</TableCell>
                      <TableCell>{e.description}</TableCell>
                      <TableCell align="right">₹{e.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={e.direction} size="small" color={e.direction === "Credit" ? "success" : "error"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Settlement Action */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Process Exit & Settlement
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Settlement Format</InputLabel>
                    <Select
                      value={settlementData.settlementFormat}
                      label="Settlement Format"
                      onChange={(e) => setSettlementData({ ...settlementData, settlementFormat: e.target.value })}
                    >
                      <MenuItem value="Release">Release Letter Format</MenuItem>
                      <MenuItem value="Resignation">Resignation Format</MenuItem>
                      <MenuItem value="Termination">Termination Format</MenuItem>
                      <MenuItem value="Retirement">Retirement Format</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Final Amount to Settle"
                    type="number"
                    fullWidth
                    value={settlementData.amount}
                    onChange={(e) => setSettlementData({ ...settlementData, amount: e.target.value })}
                    helperText="Positive if company pays employee, Negative if employee pays company"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Final Remarks"
                    fullWidth
                    value={settlementData.description}
                    onChange={(e) => setSettlementData({ ...settlementData, description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" color="primary" size="large" onClick={processSettlement}>
                    Post Final Settlement & Deactivate User
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default FinalSettlementPage;
