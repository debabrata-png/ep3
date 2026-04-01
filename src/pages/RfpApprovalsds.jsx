import React, { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import AdminNavbar from '../components/AdminNavbar';
import global1 from './global1';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LinkIcon from '@mui/icons-material/Link';

const RfpApprovalsds = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'price_asc', 'price_desc'
  const colid = global1.colid;

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, [sortOrder]);

  const fetchSubmissions = async () => {
    if (!colid) return;
    try {
      setLoading(true);
      const res = await ep1.get(`/api/v2/getallrfpsubmissions?colid=${colid}&sort=${sortOrder}`);
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      if (window.confirm('Are you sure you want to approve this vendor application? The vendor will be added to the main records.')) {
        const payload = {
          name: global1.name,
          user: global1.user,
          colid: global1.colid
        };
        const res = await ep1.post(`/api/v2/approverfpsubmission?id=${id}`, payload);
        if (res.data.success) {
          alert('Submission Approved Successfully!');
          fetchSubmissions();
        } else {
          alert(res.data.message || 'Error approving submission');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Approval failed.');
    }
  };

  const handleReject = async (id) => {
    try {
      if (window.confirm('Are you sure you want to REJECT this application?')) {
        const res = await ep1.post(`/api/v2/rejectrfpsubmission?id=${id}`);
        if (res.data.success) {
          alert('Submission Rejected.');
          fetchSubmissions();
        } else {
          alert(res.data.message || 'Error rejecting submission');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Rejection failed.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f0f2f5', minHeight: '100vh', pb: 8 }}>
      <AdminNavbar />

      <Container maxWidth="xl" sx={{ mt: 5 }}>
        
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              Vendor Request for Proposal (RFP) Approvals
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Review public vendor RFP submissions and approve them to add to main Vendor Masters.
            </Typography>
            <Divider sx={{ mt: 2, mb: { xs: 2, sm: 0 }, borderBottomWidth: 3, width: '100px', borderColor: '#1976d2', borderRadius: 2 }} />
          </Box>

          <FormControl sx={{ minWidth: 200 }} size="small" variant="outlined">
            <InputLabel id="sort-select-label">Sort Submissions</InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortOrder}
              label="Sort Submissions"
              onChange={(e) => setSortOrder(e.target.value)}
              sx={{ backgroundColor: '#fff' }}
            >
              <MenuItem value="newest">Recent First (Default)</MenuItem>
              <MenuItem value="price_asc">Price: Low to High</MenuItem>
              <MenuItem value="price_desc">Price: High to Low</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 10 }}>
            <CircularProgress size={50} />
          </Box>
        ) : submissions.length === 0 ? (
          <Alert severity="info" sx={{ p: 3, fontSize: '1.1rem' }}>
            No Vendor Submissions found at the moment.
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {submissions.map((sub, i) => (
              <Grid item xs={12} key={i}>
                <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  
                  {/* Header */}
                  <CardHeader
                    sx={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', pt: 3, px: 4 }}
                    title={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="overline" color="text.secondary" fontWeight="bold">RFP Reference</Typography>
                          <Typography variant="h5" fontWeight="bold">{sub.rfpid ? sub.rfpid.title : 'Unknown RFP'}</Typography>
                        </Box>
                        <Chip
                          label={sub.status.toUpperCase()}
                          color={getStatusColor(sub.status)}
                          sx={{ fontWeight: 'bold', fontSize: '0.9rem', px: 1, py: 2, borderRadius: 2 }}
                        />
                      </Box>
                    }
                  />

                  {/* Body Details */}
                  <CardContent sx={{ p: 0 }}>
                    <Grid container>
                      
                      {/* Vendor Info Details */}
                      <Grid item xs={12} md={4} sx={{ p: 4, borderRight: { md: '1px solid #eaeaea' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <BusinessIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" fontWeight="bold" color="primary">Vendor Identification</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          <Typography variant="body2"><Box component="span" fontWeight="bold">Company:</Box> {sub.vendorname || sub.name}</Typography>
                          <Typography variant="body2"><Box component="span" fontWeight="bold">Email:</Box> {sub.email || sub.user}</Typography>
                          <Typography variant="body2"><Box component="span" fontWeight="bold">Mobile No:</Box> {sub.mobileno}</Typography>
                          <Typography variant="body2"><Box component="span" fontWeight="bold">GST/PAN:</Box> {sub.gst || 'N/A'} / {sub.pan || 'N/A'}</Typography>
                          
                          {(sub.city || sub.state) && (
                            <Typography variant="body2"><Box component="span" fontWeight="bold">Location:</Box> {sub.city}, {sub.state}</Typography>
                          )}
                          
                          {sub.doclink && (
                            <Box sx={{ mt: 1 }}>
                               <Button 
                                variant="outlined" 
                                size="small" 
                                startIcon={<LinkIcon />} 
                                href={sub.doclink} 
                                target="_blank"
                                sx={{ textTransform: 'none' }}
                               >
                                View Company Profile
                               </Button>
                            </Box>
                          )}
                        </Box>
                      </Grid>

                      {/* Technical Info */}
                      <Grid item xs={12} md={4} sx={{ p: 4, borderRight: { md: '1px solid #eaeaea' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <SettingsIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" fontWeight="bold" color="primary">Technical Proposal</Typography>
                        </Box>
                        
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
                           {sub.technical_title || 'N/A'}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic', minHeight: '60px' }}>
                          "{sub.technical_description || 'No detailed technical explanation provided.'}"
                        </Typography>

                        {sub.technical_documentlink && (
                          <Button 
                            variant="text" 
                            size="small" 
                            startIcon={<LinkIcon />} 
                            href={sub.technical_documentlink} 
                            target="_blank"
                            sx={{ textTransform: 'none' }}
                          >
                            Open Technical Document
                          </Button>
                        )}
                      </Grid>

                      {/* Financial Info */}
                      <Grid item xs={12} md={4} sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="h6" fontWeight="bold" color="primary">Financial Quotation</Typography>
                        </Box>
                        
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary" gutterBottom>
                           {sub.financial_title || 'N/A'}
                        </Typography>
                        
                        <Typography variant="body1" fontWeight="bold" color="success.main" sx={{ mb: 1, fontSize: '1.2rem' }}>
                           {sub.financial_amount ? `₹ ${sub.financial_amount}` : 'Amount Not Disclosed'}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                          "{sub.financial_description || 'No direct pricing breakdown provided.'}"
                        </Typography>

                        {sub.financial_documentlink && (
                          <Button 
                            variant="text" 
                            size="small" 
                            startIcon={<LinkIcon />} 
                            href={sub.financial_documentlink} 
                            target="_blank"
                            color="success"
                            sx={{ textTransform: 'none' }}
                          >
                            Open Financial Document
                          </Button>
                        )}
                      </Grid>

                    </Grid>
                  </CardContent>
                  
                  {/* Actions Area */}
                  {sub.status === 'Pending' && (
                    <CardActions sx={{ backgroundColor: '#fcfcfc', borderTop: '1px solid #eaeaea', p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                       <Button 
                         variant="outlined" 
                         color="error" 
                         startIcon={<CancelOutlinedIcon />} 
                         onClick={() => handleReject(sub._id)}
                         sx={{ px: 3, fontWeight: 'bold' }}
                       >
                         Reject Vendor
                       </Button>
                       <Button 
                         variant="contained" 
                         color="success" 
                         startIcon={<CheckCircleOutlineIcon />} 
                         onClick={() => handleApprove(sub._id)}
                         sx={{ px: 4, fontWeight: 'bold' }}
                       >
                         Approve Application
                       </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default RfpApprovalsds;
