import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import ep1 from "../api/ep1";
import global1 from "./global1";

const EmployeeLedgerPage = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    amount: "",
    transactionType: "Adjustment",
    direction: "Credit",
    description: "",
  });
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  const fetchLedger = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await ep1.get("/api/v2/getsettlementdata", {
        params: { email, colid: global1.colid },
      });
      setLedger(res.data.ledgerEntries || []);
    } catch (err) {
      setSnack({ open: true, msg: "Failed to fetch ledger", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    try {
      await ep1.post("/api/v2/addledgerentry", {
        ...newEntry,
        email,
        colid: global1.colid,
        addedBy: global1.user,
      });
      setSnack({ open: true, msg: "Entry added successfully", severity: "success" });
      setOpen(false);
      fetchLedger();
    } catch (err) {
      setSnack({ open: true, msg: "Failed to add entry", severity: "error" });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Employee Financial Ledger
      </Typography>

      <Paper sx={{ p: 3, mb: 3, display: "flex", gap: 2, alignItems: "center", borderRadius: 3 }}>
        <TextField
          label="Search Employee Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={fetchLedger} disabled={!email || loading}>
          {loading ? <CircularProgress size={24} /> : "Search Ledger"}
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => setOpen(true)} disabled={!email}>
          Add Manual Entry
        </Button>
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledger.map((entry) => (
              <TableRow key={entry._id} hover>
                <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={entry.transactionType} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell>
                  <Chip
                    label={entry.direction}
                    color={entry.direction === "Credit" ? "success" : "error"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">₹{entry.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Typography variant="body2" color={entry.paymentStatus === "Paid" ? "success.main" : "warning.main"}>
                    {entry.paymentStatus}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {ledger.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                  {email ? "No records found for this employee." : "Enter an email to view ledger history."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Entry Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Add Manual Ledger Entry</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={newEntry.transactionType}
                label="Transaction Type"
                onChange={(e) => setNewEntry({ ...newEntry, transactionType: e.target.value })}
              >
                <MenuItem value="Bonus">Bonus</MenuItem>
                <MenuItem value="Fine">Fine</MenuItem>
                <MenuItem value="Adjustment">Adjustment</MenuItem>
                <MenuItem value="Advance">Advance</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Direction</InputLabel>
              <Select
                value={newEntry.direction}
                label="Direction"
                onChange={(e) => setNewEntry({ ...newEntry, direction: e.target.value })}
              >
                <MenuItem value="Credit">Credit (Company pays Employee)</MenuItem>
                <MenuItem value="Debit">Debit (Employee owes Company)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={newEntry.amount}
              onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateEntry}>
            Save Entry
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.msg}</Alert>
      </Snackbar>
    </Container>
  );
};

export default EmployeeLedgerPage;
