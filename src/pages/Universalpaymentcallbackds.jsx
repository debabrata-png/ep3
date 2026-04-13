import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Typography, Paper, Box, Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

const Universalpaymentcallbackds = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const s = query.get("status");
    const tid = query.get("txnid");
    
    if (s && tid) {
      setStatus(s === "SUCCESS" ? "success" : "failed");
      setTxnId(tid);
    } else {
      setStatus("error");
    }
  }, [location]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, textAlign: "center" }} elevation={3}>
        {status === "loading" && (
          <Box><CircularProgress /><Typography sx={{ mt: 2 }}>Verifying Payment status...</Typography></Box>
        )}

        {status === "success" && (
          <Box>
            <CheckCircleIcon color="success" sx={{ fontSize: 80 }} />
            <Typography variant="h4" gutterBottom color="success.main">Payment Successful!</Typography>
            <Typography variant="body1">Transaction ID: {txnId}</Typography>
            <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate("/dashdashstudnew")}>Go to Dashboard</Button>
          </Box>
        )}

        {status === "failed" && (
          <Box>
            <ErrorIcon color="error" sx={{ fontSize: 80 }} />
            <Typography variant="h4" gutterBottom color="error.main">Payment Failed</Typography>
            <Typography variant="body1">Your transaction could not be processed.</Typography>
            <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate("/paymentinitiation")}>Try Again</Button>
          </Box>
        )}

        {status === "error" && (
          <Box>
            <ErrorIcon color="warning" sx={{ fontSize: 80 }} />
            <Typography variant="h4" gutterBottom>Invalid Response</Typography>
            <Button variant="outlined" sx={{ mt: 4 }} onClick={() => navigate("/")}>Home</Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Universalpaymentcallbackds;
