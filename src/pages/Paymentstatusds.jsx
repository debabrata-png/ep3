import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ep1 from "../api/ep1";
import global1 from "./global1";

const Paymentstatusds = () => {
  const navigate = useNavigate();
  const [merchantTransactionId, setMerchantTransactionId] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckStatus = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await ep1.post(
        `/api/v2/paymentorderds/get?merchantTransactionId=${merchantTransactionId}`
      );

      if (res.data.success) {
        setOrderData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Check Payment Status
          </Typography>
          <Button color="inherit" onClick={() => navigate("/dashdashfacnew")}>
            Back to Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Check Payment Status
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <TextField
              fullWidth
              label="Transaction ID or Order ID"
              value={merchantTransactionId}
              onChange={(e) => setMerchantTransactionId(e.target.value)}
              placeholder="Enter transaction ID or order ID"
            />
            <Button
              variant="contained"
              onClick={handleCheckStatus}
              disabled={loading || !merchantTransactionId}
            >
              {loading ? "Checking..." : "Check"}
            </Button>
          </Box>

          {orderData && (
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: "grid", gap: 1 }}>
                  <Typography>
                    <strong>Order ID:</strong> {orderData.orderid}
                  </Typography>
                  <Typography>
                    <strong>Transaction ID:</strong> {orderData.merchantTransactionId}
                  </Typography>
                  <Typography>
                    <strong>Student:</strong> {orderData.student}
                  </Typography>
                  <Typography>
                    <strong>Reg No:</strong> {orderData.regno}
                  </Typography>
                  <Typography>
                    <strong>Payment Type:</strong> {orderData.paymentType}
                  </Typography>
                  <Typography>
                    <strong>Amount:</strong> ₹{orderData.amount}
                  </Typography>
                  <Typography>
                    <strong>Status:</strong> {orderData.status}
                  </Typography>
                  <Typography>
                    <strong>Date:</strong>{" "}
                    {new Date(orderData.createdAt).toLocaleString()}
                  </Typography>
                  {orderData.phonePeTransactionId && (
                    <Typography>
                      <strong>PhonePe Transaction ID:</strong>{" "}
                      {orderData.phonePeTransactionId}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Paymentstatusds;
