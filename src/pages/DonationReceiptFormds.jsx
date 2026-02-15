import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Divider
} from '@mui/material';
import { Download, Edit, Delete, Add } from '@mui/icons-material';
import ep1 from '../api/ep1';
import jsPDF from 'jspdf';
import global1 from './global1';

const logo = '/logo.png'; // Using public folder image

// Helper function to convert number to words (Indian Numbering System)
const numToWords = (n) => {
  if (n === 0) return "";
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convert = (num) => {
    if (num < 10) return units[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + units[num % 10] : "");
    if (num < 1000) return units[Math.floor(num / 100)] + " Hundred" + (num % 100 !== 0 ? " " + convert(num % 100) : "");
    if (num < 100000) return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 !== 0 ? " " + convert(num % 1000) : "");
    if (num < 10000000) return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 !== 0 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 !== 0 ? " " + convert(num % 10000000) : "");
  };

  return convert(n) + " Only";
};

const DonationReceiptFormds = () => {
  // --- State for List View ---
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- State for Dialogs ---
  const [openDialog, setOpenDialog] = useState(false); // Controls both Create and Edit dialog
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // --- Form Data State ---
  const initialFormState = {
    trustRegNo: 'YPR-4-00351-2025-26',
    pan: 'AAETV6768J',
    receiptDate: new Date().toISOString().split('T')[0],
    donorName: '',
    donorMobile: '',
    amountReceived: '',
    amountInWords: '',
    modeOfPayment: 'cash',
    chequeNo: '',
    bankName: '',
    chequeDate: '',
    upiId: '',
    upiDate: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // --- Fetch Receipts ---
  const fetchReceipts = async (filterStartDate = '', filterEndDate = '') => {
    try {
      let url = '/api/v2/getdonationreceiptsds';
      const params = { colid: global1.colid };

      if (filterStartDate && filterEndDate) {
        params.startDate = filterStartDate;
        params.endDate = filterEndDate;
      }

      const response = await ep1.get(url, { params });
      setReceipts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // --- Apply Filters ---
  const handleFilter = () => {
    if (startDate && endDate) {
      fetchReceipts(startDate, endDate);
    } else {
      alert('Please select both start and end dates');
    }
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchReceipts();
  };

  // --- Form Handling ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let diff = { [name]: value };

    // Auto-populate Amount in Words
    if (name === 'amountReceived') {
      const amount = parseInt(value, 10);
      if (!isNaN(amount)) {
        diff.amountInWords = numToWords(amount);
      } else {
        diff.amountInWords = '';
      }
    }

    setFormData((prev) => ({ ...prev, ...diff }));
  };

  const handleOpenCreate = () => {
    setDialogMode('create');
    setFormData(initialFormState);
    setOpenDialog(true);
  };

  const handleOpenEdit = (receipt) => {
    setDialogMode('edit');
    setFormData({
      ...initialFormState,
      ...receipt,
      receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : receipt.created_at ? new Date(receipt.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setSelectedReceipt(receipt);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReceipt(null);
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        name: global1.name,
        user: global1.user,
        colid: global1.colid
      };

      if (dialogMode === 'create') {
        await ep1.post('/api/v2/createdonationreceiptds', dataToSubmit);
        alert('Donation receipt created successfully!');
      } else {
        await ep1.post('/api/v2/updatedonationreceiptds', { ...dataToSubmit, _id: selectedReceipt._id });
        alert('Donation receipt updated successfully!');
      }

      handleCloseDialog();
      fetchReceipts(startDate, endDate); // Refresh list
    } catch (error) {
      console.error('Error saving donation receipt:', error);
      alert('Failed to save donation receipt');
    }
  };

  // --- Delete Handling ---
  const handleDeleteClick = (receipt) => {
    setSelectedReceipt(receipt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReceipt) return;
    try {
      await ep1.get(`/api/v2/deletedonationreceiptds/${selectedReceipt._id}`);
      alert('Receipt deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedReceipt(null);
      fetchReceipts(startDate, endDate); // Refresh list
    } catch (error) {
      console.error('Error deleting receipt:', error);
      alert('Failed to delete receipt');
    }
  };

  // --- PDF Generation ---
  const generatePDF = async (receipt) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [210, 148] // A5 Landscape roughly
    });

    // Helper to add text
    const addText = (text, x, y, size = 10, align = 'left', style = 'normal', color = [0, 0, 0], font = 'helvetica') => {
      doc.setFontSize(size);
      doc.setFont(font, style);
      doc.setTextColor(...color);
      doc.text(String(text || ''), x, y, { align });
    };

    // --- PDF CONTENT START ---
    const width = 210;
    const height = 148;
    const margin = 10;

    // 1. Background Color (Light Green - Matching user preference)
    doc.setFillColor(193, 225, 193); // Pale Green / Tea Green
    doc.rect(0, 0, width, height, 'F');

    // 2. Outer Border
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, margin, width - 2 * margin, height - 2 * margin);

    // 3. Header
    // 3. Header
    // Logo - Adjusted position and size to align with title
    try {
      const imgParams = await new Promise((resolve) => {
        const img = new Image();
        img.src = logo;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
      if (imgParams) {
        // Logo on the left
        doc.addImage(imgParams, 'PNG', margin + 2, margin + 2, 35, 35);
      }
    } catch (e) {
      console.error("Logo load failed", e);
    }

    // Title - Left aligned next to logo
    const titleX = margin + 30; // 25 (logo width) + 2 (margin) + 3 (padding)
    addText('Vyagrashila Seva Samithi', titleX, margin + 12, 22, 'left', 'bold', [0, 0, 0], 'times');
    addText('(Registered Religious Trust)', titleX, margin + 19, 11, 'left', 'normal', [0, 0, 0], 'times');

    // Donation Receipt Label 
    doc.setFillColor(0, 0, 0); // Black background
    const boxWidth = 50;
    const boxHeight = 8;
    doc.rect(width - margin - boxWidth - 2, margin + 5, boxWidth, boxHeight, 'F');
    addText('DONATION RECEIPT', width - margin - (boxWidth / 2) - 2, margin + 10, 10, 'center', 'bold', [255, 255, 255]);

    // Receipt No
    addText(`Receipt No: ${receipt.receiptNo || '.......'}`, width - margin - 5, margin + 22, 11, 'right', 'normal', [0, 0, 0], 'times');

    // Line under Header
    let y = margin + 30;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(margin, y, width - margin, y);

    // 4. Trust Info
    const trustRegNo = receipt.trustRegNo || 'YPR-4-00351-2025-26';
    const pan = receipt.pan || 'AAETV6768J';
    y += 7;
    addText(`Trust Regn No: ${trustRegNo} | PAN: ${pan}`, margin + 5, y, 10, 'left', 'bold');

    y += 3;
    doc.line(margin, y, width - margin, y);

    // 5. Fields with Lines
    const rowHeight = 13; // Slightly improved spacing

    // Name Row
    y += 2; // padding
    const fieldLabelX = margin + 5;
    const fieldValueX = margin + 50; // Aligned start for values

    addText('Name:', fieldLabelX, y + 8, 12, 'left', 'bold');
    addText(receipt.donorName, fieldValueX, y + 8, 12, 'left', 'normal', [0, 0, 0], 'times'); // Handwriting style placeholder
    y += rowHeight;
    doc.line(margin, y, width - margin, y);

    // Amount Row
    addText('Amount:', fieldLabelX, y + 8, 12, 'left', 'bold');
    addText(`Rs. ${receipt.amountReceived}/-`, fieldValueX, y + 8, 12, 'left', 'normal', [0, 0, 0], 'times');
    y += rowHeight;
    doc.line(margin, y, width - margin, y);

    // Words Row - Label changed to match reference
    addText('(Rupees in words)', fieldLabelX, y + 8, 11, 'left', 'bold'); // Slightly smaller to fit if needed, or keep 12
    // Value for words often needs more space, italic looks good
    addText(receipt.amountInWords, fieldValueX, y + 8, 11, 'left', 'italic', [0, 0, 0], 'times');
    y += rowHeight;
    doc.line(margin, y, width - margin, y);

    // Mode of Payment
    addText('Mode of Payment :', fieldLabelX, y + 8, 11, 'left', 'bold');
    let paymentDesc = '';
    if (receipt.modeOfPayment === 'bank' || receipt.modeOfPayment === 'online') {
      paymentDesc = 'Online / ' + (receipt.upiId ? `Txn ID: ${receipt.upiId}` : '');
    } else {
      paymentDesc = 'Cash';
    }
    // Checking if we need "Cash / Online" literal text or the actual value. Reference has "Cash / Online" printed, with a tick or handwritten. 
    // Here we print the actual mode.
    addText(paymentDesc, fieldValueX, y + 8, 11, 'left', 'normal', [0, 0, 0], 'times');
    y += rowHeight;
    doc.line(margin, y, width - margin, y);

    // 6. Footer
    y += 5;
    const declarationY = y + 6;
    addText('Declaration:', margin + 5, declarationY, 10, 'left', 'bold');
    addText('This donation has been received towards the', margin + 80, declarationY, 9, 'left', 'normal', [0, 0, 0], 'times');
    addText('religious/charitable purposes of the Trust.', margin + 80, declarationY + 5, 9, 'left', 'normal', [0, 0, 0], 'times');

    // Signatory
    const signatoryY = height - margin - 15;
    addText('For Vyagrashila Seva Samithi', width - margin - 5, signatoryY, 11, 'right', 'bold', [0, 0, 0], 'times');
    addText('Authorized Signatory', width - margin - 5, signatoryY + 10, 10, 'right', 'normal', [0, 0, 0], 'times');

    doc.save(`Donation_Receipt_${receipt.receiptNo || receipt._id}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" sx={{ color: '#4a6fa5' }}>
            Donation Receipts
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{ backgroundColor: '#000' }}
          >
            Create Donation Receipt
          </Button>
        </Box>

        {/* Filter Section */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleFilter} fullWidth>
                  Filter
                </Button>
                <Button variant="outlined" onClick={handleClearFilter} fullWidth>
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Table Section */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Receipt No</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Donor Name</TableCell>
                <TableCell>Amount (₹)</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt._id}>
                  <TableCell>{receipt.receiptNo || 'N/A'}</TableCell>
                  <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{receipt.donorName}</TableCell>
                  <TableCell>{receipt.amountReceived}</TableCell>
                  <TableCell>{receipt.modeOfPayment}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEdit(receipt)}
                      title="Edit"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(receipt)}
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => generatePDF(receipt)}
                      title="Download PDF"
                    >
                      <Download />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {receipts.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No donation receipts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dialogMode === 'create' ? 'Create Donation Receipt' : 'Edit Donation Receipt'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header with Logo Preview */}
            <Grid container alignItems="center" spacing={2} sx={{ mb: 2, backgroundColor: '#cfe3d4', p: 1, borderRadius: 1 }}>
              <Grid item>
                <img src={logo} alt="Logo" style={{ height: 40, width: 40 }} />
              </Grid>
              <Grid item xs>
                <Typography variant="h6" align="center" sx={{ color: '#000', fontWeight: 'bold' }}>
                  Vyagrashila Seva Samithi
                </Typography>
              </Grid>
            </Grid>

            <TextField
              label="Receipt Date"
              name="receiptDate"
              type="date"
              value={formData.receiptDate}
              onChange={handleFormChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Donor Name"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Donor Mobile"
                  name="donorMobile"
                  value={formData.donorMobile}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Amount Received (₹)"
                  name="amountReceived"
                  type="number"
                  value={formData.amountReceived}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Amount in Words"
                  name="amountInWords"
                  value={formData.amountInWords}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  helperText="Auto-populated"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 1 }}>
              <FormLabel component="legend">Mode of Payment</FormLabel>
              <RadioGroup row name="modeOfPayment" value={formData.modeOfPayment} onChange={handleFormChange}>
                <FormControlLabel value="cash" control={<Radio />} label="Cash" />
                <FormControlLabel value="bank" control={<Radio />} label="Online/Bank" />
              </RadioGroup>
            </Box>

            {(formData.modeOfPayment === 'bank' || formData.modeOfPayment === 'online') && (
              <TextField
                label="Transaction ID / UPI Ref"
                name="upiId"
                value={formData.upiId}
                onChange={handleFormChange}
                fullWidth
              />
            )}

            <Typography variant="caption" color="textSecondary">
              Trust Regn No: {formData.trustRegNo} | PAN: {formData.pan}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'create' ? 'Generate Receipt' : 'Update Receipt'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete receipt <strong>{selectedReceipt?.receiptNo}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DonationReceiptFormds;
