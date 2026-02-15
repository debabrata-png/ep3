// pages/DonationReceiptsView.jsx
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
} from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';
import ep1 from '../api/ep1';
import jsPDF from 'jspdf';

// const logo = '/logo.png'; // If we use it later

const DonationReceiptsViewds = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async (filterStartDate = '', filterEndDate = '') => {
    try {
      let url = '/api/v2/getdonationreceiptsds';
      if (filterStartDate && filterEndDate) {
        url += `?startDate=${filterStartDate}&endDate=${filterEndDate}`;
      }
      const response = await ep1.get(url);
      setReceipts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setLoading(false);
    }
  };

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

  const generatePDF = (receipt) => {
    const doc = new jsPDF();

    // Helper to add text
    const addText = (text, x, y, size = 10, align = 'left', style = 'normal', color = [0, 0, 0]) => {
      doc.setFontSize(size);
      doc.setFont('helvetica', style);
      doc.setTextColor(...color);
      doc.text(text, x, y, { align });
    };

    // --- PDF CONTENT START ---

    // 1. Header
    // Note: Image handling in jsPDF requires base64 or an Image object. 
    // If the logo is at '/logo.png', we can try to add it.
    // doc.addImage('/logo.png', 'PNG', 15, 10, 25, 25); // Uncomment if logo.png is accessible and loadable this way.

    // Instead of complex image loading, we'll center the text title for now as per "matched provided image" request which usually implies visual structure.

    addText('Vyagrashila Seva Samithi', 105, 20, 18, 'center', 'bold');
    addText('(Registered Religious Trust)', 105, 28, 12, 'center');

    // 2. Receipt Label
    doc.setFillColor(0, 0, 0); // Black background
    doc.rect(140, 35, 50, 8, 'F');
    addText('DONATION RECEIPT', 165, 40, 10, 'center', 'bold', [255, 255, 255]);

    // 3. Trust Reg / PAN
    doc.setDrawColor(0);
    doc.line(20, 50, 190, 50);

    const trustRegNo = receipt.trustRegNo || 'YPR-4-00351-2025-26';
    const pan = receipt.pan || 'AAETV6768J';
    addText(`Trust Regn No: ${trustRegNo} | PAN: ${pan}`, 105, 56, 10, 'center', 'bold');

    doc.line(20, 60, 190, 60);

    // 4. Receipt Date (Right Aligned)
    const receiptDate = receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : new Date(receipt.createdAt).toLocaleDateString();
    addText(`Date: ${receiptDate}`, 190, 70, 10, 'right');

    // 5. Donor Details
    addText(`Name:`, 20, 80, 10, 'left', 'bold');
    addText(receipt.donorName, 50, 80, 10);

    if (receipt.donorMobile) {
      addText(`Mobile:`, 20, 88, 10, 'left', 'bold');
      addText(receipt.donorMobile, 50, 88, 10);
    }

    // 6. Amount
    addText(`Amount (₹):`, 20, 100, 10, 'left', 'bold');
    addText(receipt.amountReceived?.toString(), 50, 100, 10);

    addText(`In Words:`, 20, 108, 10, 'left', 'bold');
    addText(receipt.amountInWords, 50, 108, 10);

    // 7. Payment Mode
    addText(`Mode of Payment:`, 20, 120, 10, 'left', 'bold');
    let paymentText = receipt.modeOfPayment === 'bank' ? 'Online' : 'Cash';
    addText(paymentText, 60, 120, 10);

    if (receipt.modeOfPayment === 'bank' && receipt.upiId) {
      addText(`Txn ID: ${receipt.upiId}`, 20, 128, 10);
    }

    // 8. Declaration
    doc.line(20, 140, 190, 140);
    addText('Declaration: This donation has been received towards the religious/charitable purposes of the Trust.', 20, 148, 9);

    // 9. Signatory
    addText('For Vyagrashila Seva Samithi', 190, 170, 10, 'right', 'bold');
    addText('Authorized Signatory', 190, 190, 9, 'right');

    doc.save(`Donation_Receipt_${receipt.receiptNo || receipt._id}.pdf`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, color: '#4a6fa5' }}>
          Donation Receipts
        </Typography>

        {/* Date Filter */}
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
    </Box>
  );
};

export default DonationReceiptsViewds;
