// pages/DonationReceiptForm.jsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Typography,
  Grid,
  Divider,
} from '@mui/material';
import ep1 from '../api/ep1';
import global1 from './global1';

const DonationReceiptFormds = () => {
  const [formData, setFormData] = useState({
    trustRegNo: 'YPR-4-00351-2025-26',
    pan: 'AAETV6768J',
    trustAddress: '',
    donorName: '',
    donorAddress: '',
    donorMobile: '',
    donorEmail: '',
    amountReceived: '',
    amountInWords: '',
    modeOfPayment: 'cash',
    chequeNo: '',
    bankName: '',
    chequeDate: '',
    upiId: '',
    upiDate: '',
    purposeOfDonation: 'General Fund',
    otherPurpose: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        name: global1.name,
        user: global1.user,
        colid: global1.colid
      };

      const response = await ep1.post('/api/v2/createdonationreceiptds', dataToSubmit);
      alert('Donation receipt created successfully!');
      console.log(response.data);
      // Reset form
      setFormData({
        trustRegNo: 'YPR-4-00351-2025-26',
        pan: 'AAETV6768J',
        trustAddress: '',
        donorName: '',
        donorAddress: '',
        donorMobile: '',
        donorEmail: '',
        amountReceived: '',
        amountInWords: '',
        modeOfPayment: 'cash',
        chequeNo: '',
        bankName: '',
        chequeDate: '',
        upiId: '',
        upiDate: '',
        purposeOfDonation: 'General Fund',
        otherPurpose: '',
      });
    } catch (error) {
      console.error('Error creating donation receipt:', error);
      alert('Failed to create donation receipt');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          {/* Logo Removed as per request */}
          {/* Header */}
          <Typography variant="h4" align="center" sx={{ color: '#4a6fa5', mb: 1 }}>
            Vyagrashila Seva Samithi
          </Typography>
          <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 3 }}>
            (Registered Religious Trust)
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Trust Details */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trust Registration No"
                name="trustRegNo"
                value={formData.trustRegNo}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PAN"
                name="pan"
                value={formData.pan}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Receipt Header */}
          <Typography variant="h5" align="center" sx={{ color: '#4a6fa5', mb: 3 }}>
            Donation / Contribution E-Receipt
          </Typography>

          {/* Donor Details */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4a6fa5' }}>
            Donor Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Donor Name" name="donorName" value={formData.donorName} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Donor Address" name="donorAddress" value={formData.donorAddress} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Mobile Number" name="donorMobile" value={formData.donorMobile} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Address" name="donorEmail" value={formData.donorEmail} onChange={handleChange} required type="email" />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Donation Details */}
          <Typography variant="h6" sx={{ mb: 2, color: '#4a6fa5' }}>
            Donation Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Amount Received (₹)" name="amountReceived" value={formData.amountReceived} onChange={handleChange} required type="number" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Amount in Words" name="amountInWords" value={formData.amountInWords} onChange={handleChange} required />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Mode of Payment */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Mode of Payment</FormLabel>
            <RadioGroup row name="modeOfPayment" value={formData.modeOfPayment} onChange={handleChange}>
              <FormControlLabel value="cash" control={<Radio />} label="Cash" />
              <FormControlLabel value="bank" control={<Radio />} label="Bank" />
              <FormControlLabel value="upi" control={<Radio />} label="UPI/Online" />
            </RadioGroup>
          </FormControl>

          {/* Conditional Payment Fields */}
          {formData.modeOfPayment === 'bank' && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Cheque No" name="chequeNo" value={formData.chequeNo} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Cheque Date" name="chequeDate" value={formData.chequeDate} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          )}

          {formData.modeOfPayment === 'upi' && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="UPI Transaction ID" name="upiId" value={formData.upiId} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Transaction Date" name="upiDate" value={formData.upiDate} onChange={handleChange} type="date" InputLabelProps={{ shrink: true }} />
              </Grid>
            </Grid>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Purpose of Donation */}
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel component="legend">Purpose of Donation</FormLabel>
            <RadioGroup name="purposeOfDonation" value={formData.purposeOfDonation} onChange={handleChange}>
              <FormControlLabel value="General Fund" control={<Radio />} label="General Fund" />
              <FormControlLabel value="Temple Activities" control={<Radio />} label="Temple Activities" />
              <FormControlLabel value="Charitable Services" control={<Radio />} label="Charitable Services" />
              <FormControlLabel value="Others" control={<Radio />} label="Others" />
            </RadioGroup>
          </FormControl>

          {formData.purposeOfDonation === 'Others' && (
            <TextField fullWidth label="Please Specify" name="otherPurpose" value={formData.otherPurpose} onChange={handleChange} sx={{ mb: 2 }} />
          )}

          {/* Submit Button */}
          <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ mt: 3 }}>
            Generate Receipt
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default DonationReceiptFormds;
