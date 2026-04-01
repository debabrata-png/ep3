import React, { useState, useEffect } from 'react';
import ep1 from '../api/ep1';
import { encryptData } from '../utils/encryption';
import AdminNavbar from '../components/AdminNavbar';
import global1 from './global1';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const CreateRfpds = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rfpList, setRfpList] = useState([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'

  const colid = global1.colid;

  useEffect(() => {
    fetchRfps();
    // eslint-disable-next-line
  }, []);

  const fetchRfps = async () => {
    try {
      if (!colid) return;
      const res = await ep1.get(`/api/v2/getallrfps?colid=${colid}`);
      if (res.data.success) {
        setRfpList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRfp = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      setMessageType('error');
      setMessage('Title and Description are required.');
      return;
    }

    try {
      const res = await ep1.post(`/api/v2/createrfp`, {
        colid,
        title,
        description
      });
      if (res.data.success) {
        const newRfp = res.data.data;
        setMessageType('success');
        setMessage('RFP Created successfully.');
        setTitle('');
        setDescription('');
        fetchRfps();

        // Generate the shareable link
        const baseUrl = window.location.origin;
        const payload = { colid, rfpid: newRfp._id };
        const encryptedContext = encryptData(payload);
        const link = `${baseUrl}/public/vendor-rfp?data=${encryptedContext}`;
        setGeneratedLink(link);
      }
    } catch (error) {
      setMessageType('error');
      setMessage('Error creating RFP. Please try again later.');
      console.error('Error creating RFP:', error);
    }
  };

  const copyToClipboard = (linkValue) => {
    if (linkValue) {
      navigator.clipboard.writeText(linkValue);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f7fa', minHeight: '100vh', pb: 5 }}>
      <AdminNavbar />
      
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 3 }}>
          Request For Proposal (RFP) Management
        </Typography>

        {message && (
          <Alert severity={messageType} sx={{ mb: 3 }} onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}

        <Card elevation={3} sx={{ mb: 5, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, borderBottom: '1px solid #eee', pb: 1 }}>
              Publish New RFP
            </Typography>
            
            <form onSubmit={handleCreateRfp}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="RFP Title"
                  variant="outlined"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Procurement of Lab Equipment"
                />
                
                <TextField
                  fullWidth
                  label="RFP Description & Requirements"
                  variant="outlined"
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide comprehensive details about the proposal requirements..."
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                  >
                    Create & Generate Link
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>

        {generatedLink && (
          <Alert 
            severity="success" 
            sx={{ mb: 5, p: 2, borderRadius: 2, alignItems: 'center' }}
            action={
              <Button 
                color="success" 
                variant="outlined" 
                size="small" 
                startIcon={<ContentCopyIcon />}
                onClick={() => copyToClipboard(generatedLink)}
              >
                Copy
              </Button>
            }
          >
            <Typography variant="subtitle1" fontWeight="bold">Share this link directly with Vendors:</Typography>
            <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 0.5 }}>
              {generatedLink}
            </Typography>
          </Alert>
        )}

        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: '#424242' }}>
          Your Active RFPs
        </Typography>
        
        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f0f4f8' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333', width: '40%' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Created At</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333' }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#333' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rfpList.map((rfp) => (
                <TableRow key={rfp._id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{rfp.title}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{rfp.description}</TableCell>
                  <TableCell>{new Date(rfp.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={rfp.isActive ? 'Active' : 'Inactive'} 
                      color={rfp.isActive ? 'success' : 'default'} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Copy Public Vendor Link">
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => {
                          const payload = { colid, rfpid: rfp._id };
                          const encryptedContext = encryptData(payload);
                          const link = `${window.location.origin}/public/vendor-rfp?data=${encryptedContext}`;
                          copyToClipboard(link);
                        }}
                        sx={{ textTransform: 'none' }}
                      >
                        Copy Link
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {rfpList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    <Typography variant="subtitle1">No RFPs found for this institution.</Typography>
                    <Typography variant="body2">Use the form above to publish your first RFP.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default CreateRfpds;
