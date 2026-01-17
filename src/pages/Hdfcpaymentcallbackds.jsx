import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ep1 from "../api/ep1";  // ✅ Use ep1 everywhere!
import global1 from "./global1";

const Hdfcpaymentcallbackds = () => {
  const [searchparams] = useSearchParams();
  const navigate = useNavigate();

  const merchantorderid = searchparams.get("merchantOrderId");
  const colid = searchparams.get("colid");
  const status = searchparams.get("status");
  const error = searchparams.get("error");

  const [loading, setLoading] = useState(true);
  const [paymentdata, setPaymentdata] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error) {
      setErrorMessage(`Payment Error: ${error}`);
      setLoading(false);
      return;
    }

    if (merchantorderid && colid) {
      checkpaymentstatus();
    } else {
      setErrorMessage("Invalid payment callback - missing order information");
      setLoading(false);
    }
  }, [merchantorderid, colid, error]);

  const checkpaymentstatus = async () => {
    try {
      //console.log('🔍 Checking payment status for:', merchantorderid);
      //console.log('🔗 Using backend URL:', ep1.defaults.baseURL);
      
      // ✅ Use ep1 - NO HARDCODED URLs!
      const res = await ep1.get(
        `/api/v2/hdfcpaymentorderds/get?orderid=${merchantorderid}&colid=${colid}`
      );

      //console.log('✅ Payment data received:', res.data);

      if (res.data.success) {
        setPaymentdata(res.data.data);
      } else {
        setErrorMessage(res.data.message || "Failed to fetch payment details");
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
      setErrorMessage(
        err.response?.data?.message || 
        err.message || 
        "Failed to verify payment status"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verifying Payment...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please wait while we confirm your payment
        </Typography>
      </Container>
    );
  }

  if (errorMessage) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" color="error" gutterBottom>
            Unable to Verify Payment
          </Typography>
          <Alert severity="error" sx={{ mt: 2, mb: 3 }}>
            {errorMessage}
          </Alert>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              URL Parameters:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
              merchantOrderId: {merchantorderid || 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
              colid: {colid || 'N/A'}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              status: {status || 'N/A'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate("/dashdashfacnew")}
            sx={{ mt: 3 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!paymentdata) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h5" color="text.secondary">
            Payment data not found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/dashdashfacnew")}
            sx={{ mt: 3 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  const isSuccess = paymentdata.status === "SUCCESS" || status === "SUCCESS";

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          {isSuccess ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                Payment Successful!
              </Typography>
              <Alert severity="success" sx={{ mt: 2 }}>
                Your payment has been processed successfully
              </Alert>
            </>
          ) : (
            <>
              <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" color="error" gutterBottom>
                Payment Failed
              </Typography>
              <Alert severity="error" sx={{ mt: 2 }}>
                {paymentdata.status === "FAILED" 
                  ? "Payment was declined or failed" 
                  : `Payment status: ${paymentdata.status}`}
              </Alert>
            </>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Payment Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Order ID</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {paymentdata.orderid}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {paymentdata.merchanttransactionid}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Student Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {paymentdata.student}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Registration Number</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {paymentdata.regno}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Original Amount</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              ₹{paymentdata.originalamount}
            </Typography>
          </Grid>

          {paymentdata.discount > 0 && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Discount</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500, color: 'success.main' }}>
                -₹{paymentdata.discount}
              </Typography>
            </Grid>
          )}

          {paymentdata.platformcharges > 0 && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Platform Charges</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                ₹{paymentdata.platformcharges}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Final Amount Paid</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
              ₹{paymentdata.amount}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                fontWeight: 600,
                color: isSuccess ? 'success.main' : 'error.main'
              }}
            >
              {paymentdata.status}
            </Typography>
          </Grid>

          {paymentdata.hdfctransactionid && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">HDFC Transaction ID</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {paymentdata.hdfctransactionid}
              </Typography>
            </Grid>
          )}

          {paymentdata.paymentmode && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Payment Mode</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {paymentdata.paymentmode}
              </Typography>
            </Grid>
          )}

          {paymentdata.paymentpurpose && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Payment Purpose</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {paymentdata.paymentpurpose}
              </Typography>
            </Grid>
          )}
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/dashdashfacnew")}
          >
            Go to Dashboard
          </Button>
          {isSuccess && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Hdfcpaymentcallbackds;
