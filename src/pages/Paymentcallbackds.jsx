import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import ep1 from "../api/ep1"
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import global1 from "./global1";

const Paymentcallbackds = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [status, setStatus] = useState("checking");
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      // Get merchantOrderId from URL
      const merchantOrderId = searchParams.get("merchantOrderId");
      const colid = searchParams.get("colid") || global1.colid;



      if (!merchantOrderId) {
        setError("Transaction ID not found in URL");
        setStatus("error");
        return;
      }

      // Get payment order from backend

      const orderResponse = await ep1.get(
        `/api/v2/paymentorderds/get?orderid=${merchantOrderId}&colid=${colid}`
      );



      if (!orderResponse.data.success) {
        setError("Payment order not found");
        setStatus("error");
        return;
      }

      const order = orderResponse.data.data;

      // Check payment status with PhonePe
      await verifyPaymentWithPhonePe(order);

    } catch (err) {
      console.error("Error checking payment status:", err);
      setError(err.response?.data?.message || err.message || "Failed to verify payment status");
      setStatus("error");
    }
  };

  const verifyPaymentWithPhonePe = async (order) => {
    try {


      // Call backend to check status
      const statusCheckResponse = await ep1.get(
        `/api/v2/paymentorderds/checkstatus?merchantOrderId=${order.orderid}&colid=${order.colid}`
      );



      if (!statusCheckResponse.data.success) {
        setError("Failed to check status");
        setStatus("error");
        return;
      }

      const { status: paymentStatus, details } = statusCheckResponse.data.data;

      if (paymentStatus === "SUCCESS") {
        setStatus("success");
        setPaymentData({
          ...order,
          transactionId: details.transactionId || order.phonePeOrderId,
          paymentMode: details.paymentInstrument?.type || "Online",
        });
      } else if (paymentStatus === "FAILED") {
        setStatus("failed");
        setError(details.message || "Payment failed");
      } else {
        // Still pending
        setStatus("pending");
        setPaymentData(order);
      }

    } catch (err) {
      console.error('Error verifying with PhonePe:', err);
      setError(err.response?.data?.message || err.message || "Failed to verify payment with PhonePe");
      setStatus("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        {status === "checking" && (
          <>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Verifying Payment Status...
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Please wait while we confirm your payment
            </Typography>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircleIcon sx={{ fontSize: 80, color: "success.main" }} />
            <Typography variant="h4" sx={{ mt: 2, color: "success.main" }}>
              Payment Successful!
            </Typography>
            {paymentData && (
              <Box sx={{ mt: 3, textAlign: "left" }}>
                <Typography>
                  <strong>Order ID:</strong> {paymentData.orderid}
                </Typography>
                <Typography>
                  <strong>Transaction ID:</strong> {paymentData.transactionId}
                </Typography>
                <Typography>
                  <strong>Amount Paid:</strong> ₹{paymentData.amount}
                </Typography>
                <Typography>
                  <strong>Payment Mode:</strong> {paymentData.paymentMode}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => navigate("/dashdashfacnew")}
            >
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: "error.main" }} />
            <Typography variant="h4" sx={{ mt: 2, color: "error.main" }}>
              Payment Failed
            </Typography>
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => navigate("/dashboardds")}
            >
              Try Again
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Payment Pending
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Your payment is being processed
            </Typography>
            <Button
              variant="outlined"
              sx={{ mt: 3 }}
              onClick={checkPaymentStatus}
            >
              Check Again
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <ErrorIcon sx={{ fontSize: 80, color: "warning.main" }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Unable to Verify Payment
            </Typography>
            <Alert severity="warning" sx={{ mt: 3 }}>
              {error}
            </Alert>
            <Typography variant="body2" sx={{ mt: 2 }} color="textSecondary">
              URL Parameters: {location.search || "None"}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ display: "block" }}>
                merchantOrderId: {searchParams.get("merchantOrderId") || "Not found"}
              </Typography>
              <Typography variant="caption" sx={{ display: "block" }}>
                colid: {searchParams.get("colid") || "Not found"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              sx={{ mt: 3 }}
              onClick={() => navigate("/dashboardds")}
            >
              Go to Dashboard
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Paymentcallbackds;
