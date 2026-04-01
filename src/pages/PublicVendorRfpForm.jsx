import React, { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import { useLocation } from 'react-router-dom';
import { decryptData } from '../utils/encryption';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/BusinessCenter';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';

const PublicVendorRfpForm = () => {
  const [rfpData, setRfpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [colid, setColid] = useState(null);
  const [rfpid, setRfpid] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    vendorname: '', pan: '', gst: '', address: '', state: '', city: '',
    mobileno: '', email: '', doclink: '',
    technical_title: '', technical_description: '', technical_documentlink: '',
    financial_title: '', financial_description: '', financial_amount: '', financial_documentlink: ''
  });

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const encryptedData = queryParams.get('data');

    if (encryptedData) {
      const decrypted = decryptData(encryptedData);
      if (decrypted && decrypted.colid && decrypted.rfpid) {
        setColid(decrypted.colid);
        setRfpid(decrypted.rfpid);
        fetchRfpDetails(decrypted.rfpid);
      } else {
        setErrorMsg('Invalid or expired link. Please contact the administrator.');
        setLoading(false);
      }
    } else {
      setErrorMsg('No Request Data Provided. Please use a valid RFP link.');
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [location]);

  const fetchRfpDetails = async (id) => {
    try {
      const res = await ep1.get(`/api/v2/getrfpbyid?id=${id}`);
      if (res.data.success) {
        setRfpData(res.data.data);
      } else {
        setErrorMsg('RFP not found or inactive.');
      }
    } catch (err) {
      setErrorMsg('Error fetching RFP details. Please ensure you have a valid link.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.vendorname || !formData.email || !formData.mobileno) {
      setErrorMsg('Vendor Name, Email, and Mobile No are mandatory.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        colid,
        rfpid
      };

      const res = await ep1.post(`/api/v2/submitrfp`, payload);
      if (res.data.success) {
        setSuccessMsg('Your RFP Application has been submitted successfully! The administration will contact you shortly.');
        setFormData({
          vendorname: '', pan: '', gst: '', address: '', state: '', city: '',
          mobileno: '', email: '', doclink: '',
          technical_title: '', technical_description: '', technical_documentlink: '',
          financial_title: '', financial_description: '', financial_amount: '', financial_documentlink: ''
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Submission failed. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f7f9', minHeight: '100vh', pb: 8 }}>
      <AppBar position="static" color="primary" elevation={0} sx={{ py: 1 }}>
        <Container>
          <Toolbar disableGutters>
            <BusinessIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" color="inherit" sx={{ fontWeight: 600 }}>
              Vendor Registration Portal
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 5 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Authentication Error</Typography>
            {errorMsg}
          </Alert>
        )}

        {successMsg ? (
          <Card elevation={0} sx={{ py: 8, px: 3, textAlign: 'center', borderRadius: 3, boxShadow: '0px 10px 40px -10px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 90 }} />
            </Box>
            <Typography variant="h4" gutterBottom fontWeight="bold" color="text.primary">
              Thank You!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
              {successMsg}
            </Typography>
          </Card>
        ) : (
          rfpData && (
            <>
              {/* RFP Context Display */}
              <Card elevation={1} sx={{ mb: 4, borderRadius: 3, borderLeft: '6px solid #1976d2' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.5, fontWeight: 'bold' }}>
                    Request For Proposal
                  </Typography>
                  <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" sx={{ mt: 1, color: '#2c3e50' }}>
                    {rfpData.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem' }}>
                    {rfpData.description}
                  </Typography>
                </CardContent>
              </Card>

              {/* Application Form */}
              <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <CardHeader 
                  title="Vendor Application Form" 
                  subheader="Please fill in all relevant details accurately"
                  sx={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', pt: 3, pb: 2, px: 4 }}
                  titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
                />
                
                <CardContent sx={{ p: 4 }}>
                  <form onSubmit={handleSubmit}>
                    
                    {/* 1. Vendor Information */}
                    <Box sx={{ mb: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <CorporateFareIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          1. Vendor Information
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField required fullWidth label="Vendor / Company Name" name="vendorname" value={formData.vendorname} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField required fullWidth label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField required fullWidth label="Mobile Number" name="mobileno" value={formData.mobileno} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Company Profile Link (Drive/Website)" type="url" name="doclink" value={formData.doclink} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="PAN Number" name="pan" value={formData.pan} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="GST Number" name="gst" value={formData.gst} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={2} label="Registered Address" name="address" value={formData.address} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} variant="outlined" />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* 2. Technical Requirements */}
                    <Box sx={{ mb: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <SettingsIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          2. Technical Requirements
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Technical Proposal Title" name="technical_title" value={formData.technical_title} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={4} label="Technical Details & Architecture Description" name="technical_description" value={formData.technical_description} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Technical Document Link" type="url" name="technical_documentlink" value={formData.technical_documentlink} onChange={handleChange} variant="outlined" />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* 3. Financial Requirements */}
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <AttachMoneyIcon color="primary" sx={{ mr: 1.5 }} />
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          3. Financial Requirements
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Financial Proposal Title" name="financial_title" value={formData.financial_title} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth multiline rows={4} label="Payment Terms & Pricing Breakdown" name="financial_description" value={formData.financial_description} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Estimated Commercial Amount" type="number" name="financial_amount" value={formData.financial_amount} onChange={handleChange} variant="outlined" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Detailed Financial Document Link" type="url" name="financial_documentlink" value={formData.financial_documentlink} onChange={handleChange} variant="outlined" />
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ mt: 5, pb: 2 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        size="large" 
                        fullWidth 
                        disabled={submitting}
                        sx={{ py: 2, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}
                      >
                        {submitting ? <CircularProgress size={26} color="inherit" /> : 'Submit Proposal Application'}
                      </Button>
                    </Box>
                  </form>
                </CardContent>
              </Card>
            </>
          )
        )}
      </Container>
    </Box>
  );
};

export default PublicVendorRfpForm;
