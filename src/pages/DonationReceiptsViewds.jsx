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

    // Logo removed

    doc.setFont('helvetica');

    doc.setFontSize(20);
    doc.setTextColor(74, 111, 165);
    doc.text('Vyagrashila Seva Samithi', 105, 30, { align: 'center' }); // Moved up from 70
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('(Registered Religious Trust)', 105, 38, { align: 'center' }); // Moved up from 78

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    // Using hardcoded values/receipt values. Since form sends them, receipt.trustRegNo is good.
    // If undefined (old receipts), fallback to the new hardcoded values as this is the new standard.
    const trustRegNo = receipt.trustRegNo || 'YPR-4-00351-2025-26';
    const pan = receipt.pan || 'AAETV6768J';
    // Trust Address removed
    // const trustAddress = receipt.trustAddress || '';

    doc.text(`Trust Regn. No: ${trustRegNo} | PAN: ${pan}`, 105, 48, { align: 'center' }); // Moved up and centered
    // Address removed from PDF
    // Removed Phone/Email line as requested
    // Phone/Email removed from PDF

    doc.setFontSize(16);
    doc.setTextColor(74, 111, 165);
    doc.text('Donation / Contribution E-Receipt', 105, 65, { align: 'center' }); // Moved up from 115
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt No: ${receipt.receiptNo || 'Auto-generated'}`, 20, 75); // Moved up from 125
    doc.text(`Date: ${new Date(receipt.createdAt).toLocaleDateString()}`, 20, 81); // Moved up from 131

    doc.setFontSize(12);
    doc.setTextColor(74, 111, 165);
    doc.text('Donor Details', 20, 93); // Moved up from 143
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${receipt.donorName}`, 20, 101); // Moved up from 151
    doc.text(`Address: ${receipt.donorAddress}`, 20, 107); // Moved up from 157
    doc.text(`Mobile: ${receipt.donorMobile} | Email: ${receipt.donorEmail}`, 20, 113); // Moved up from 163

    doc.setFontSize(12);
    doc.setTextColor(74, 111, 165);
    doc.text('Donation Details', 20, 125); // Moved up from 175
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Amount Received: ${receipt.amountReceived}`, 20, 133); // Moved up from 183
    doc.text(`In Words: ${receipt.amountInWords}`, 20, 139); // Moved up from 189

    let paymentText = `Mode of Payment: ${receipt.modeOfPayment.toUpperCase()}`;
    if (receipt.modeOfPayment === 'bank') {
      paymentText += ` (Cheque No: ${receipt.chequeNo}, Bank: ${receipt.bankName}, Date: ${receipt.chequeDate})`;
    } else if (receipt.modeOfPayment === 'upi') {
      paymentText += ` (Txn ID: ${receipt.upiId}, Date: ${receipt.upiDate})`;
    }
    doc.text(paymentText, 20, 145, { maxWidth: 170 }); // Moved up from 195

    const purpose = receipt.purposeOfDonation === 'Others' ? receipt.otherPurpose : receipt.purposeOfDonation;
    doc.text(`Purpose of Donation: ${purpose}`, 20, 157); // Moved up from 207

    doc.setFontSize(12);
    doc.setTextColor(74, 111, 165);
    doc.text('Declaration', 20, 169); // Moved up from 219
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('This donation has been received towards the', 20, 177); // Moved up from 227
    doc.text('religious/charitable purposes of the Trust.', 20, 183); // Moved up from 233
    doc.text('(If registered under 80G: Donations are eligible for', 20, 195); // Moved up from 245
    doc.text('deduction under section 80G of the Income Tax Act, 1961.)', 20, 201); // Moved up from 251

    doc.text('For Vyagrashila Seva Samithi', 20, 230); // Moved up from 271
    doc.text('Authorized Signatory: ___________________________', 20, 240); // Moved up from 281
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('*This is a digitally generated receipt and does not require a', 20, 255); // Moved up from 290
    doc.text('physical signature.*', 20, 260); // Moved up from 295

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
                <TableCell>Purpose</TableCell>
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
                    {receipt.purposeOfDonation === 'Others'
                      ? receipt.otherPurpose
                      : receipt.purposeOfDonation}
                  </TableCell>
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
                  <TableCell colSpan={7} align="center">
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
