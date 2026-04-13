import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container, 
  Alert, 
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from '../api/ep1';
import global1 from './global1';

const UniversalTestInitiationds = () => {
  const [formData, setFormData] = useState({
    studentname: 'Test Student',
    regno: 'TEST001',
    amount: '1.00',
    email: 'test@example.com',
    phone: '9999999999',
    paymentpurpose: 'Testing Gateway Integration'
  });

  const [gateways, setGateways] = useState([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingGateways, setFetchingGateways] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      setFetchingGateways(true);
      const response = await axios.post('/api/v2/pgmasterds/getall', { colid: global1.colid });
      if (response.data.success) {
        setGateways(response.data.data.filter(g => g.isactive));
      }
    } catch (err) {
      console.error('Error fetching gateways:', err);
      setError('Failed to load payment gateways');
    } finally {
      setFetchingGateways(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInitiate = async () => {
    if (!selectedGatewayId) {
      setError('Please select a payment gateway');
      return;
    }

    const selectedGateway = gateways.find(g => g._id === selectedGatewayId);
    if (!selectedGateway || !selectedGateway.api) {
      setError('Selected gateway configuration is invalid (missing API endpoint)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        colid: global1.colid,
        gatewayname: selectedGateway.gatwayname,
        accountno: selectedGateway.accountno,
        paymenttype: 'TEST',
        user: 'ADMIN_TEST',
        frontendcallbackurl: window.location.origin + '/universalpaymentcallbackds'
      };

      // Call the dynamic API from the gateway configuration
      const response = await axios.post(selectedGateway.api, payload);

      if (response.data.success && response.data.data.paymenturl) {
        window.location.href = response.data.data.paymenturl;
      } else {
        throw new Error(response.data.message || 'Failed to get payment URL');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom align="center" color="primary">
          Universal Payment Test Initiation
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Select a gateway and enter details to verify the transaction flow.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" noValidate sx={{ mt: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="gateway-label">Select Payment Gateway</InputLabel>
            <Select
              labelId="gateway-label"
              value={selectedGatewayId}
              label="Select Payment Gateway"
              onChange={(e) => setSelectedGatewayId(e.target.value)}
              disabled={fetchingGateways}
            >
              {fetchingGateways ? (
                <MenuItem disabled>Loading gateways...</MenuItem>
              ) : (
                gateways.map((g) => (
                  <MenuItem key={g._id} value={g._id}>
                    {g.gatwayname} ({g.accountname} - {g.environment})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            required
            fullWidth
            name="studentname"
            label="Student Name"
            value={formData.studentname}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="regno"
            label="Registration No"
            value={formData.regno}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="amount"
            label="Amount (INR)"
            type="number"
            value={formData.amount}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="phone"
            label="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="paymentpurpose"
            label="Payment Purpose"
            value={formData.paymentpurpose}
            onChange={handleChange}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleInitiate}
            disabled={loading || fetchingGateways}
            sx={{ mt: 3, mb: 2, height: 50 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Initiate Payment'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="textSecondary" display="block">
            Note: This will call the specific initiation API registered in the Gateway Master and create a history record.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default UniversalTestInitiationds;
