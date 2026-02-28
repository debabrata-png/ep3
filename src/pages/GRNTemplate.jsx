import React from 'react';
import { Box } from '@mui/material';
import global1 from './global1';

const GRNTemplate = ({ poData, items, grnNumber, extraData = {} }) => {
    // Institute Details
    const instName = "People's Group";
    const instAddress = "Karond Bhanpur By Pass Road, Bhopal-462037";
    const instPhone = "+91-0755-4005013";

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    // Calculate Totals
    let grantTotal = 0;
    const processedItems = items.map(item => {
        const qty = item.receivedQty || 0; // Use Received Qty for GRN calculation? Or Accepted? usually GRN = Received. 
        // User image shows "Rec. Item Quantity".
        const price = item.unitPrice || 0;
        const total = qty * price;
        grantTotal += total;
        return { ...item, total, qty };
    });

    // Number to Words Converter (Simplified)
    const toWords = (amount) => {
        // Basic implementation or placeholder. 
        // Ideally use a library like 'number-to-words' but can't install new pkgs easily.
        // Returning a placeholder or simple logic.
        return `${amount} Rupees Only`; // Placeholder for now
    };

    return (
        <Box sx={{
            p: 4,
            fontFamily: '"Courier New", Courier, monospace',
            maxWidth: '100%',
            margin: 'auto',
            color: 'black',
            backgroundColor: 'white'
        }}>
            <style>
                {`
                    @media print {
                        @page { margin: 1cm; size: auto; }
                        body { -webkit-print-color-adjust: exact; }
                        .print-container { width: 100%; max-width: 100%; }
                    }
                    .dashed-line { 
                        border-bottom: 2px dashed #000; 
                        margin: 10px 0; 
                        width: 100%;
                    }
                    .solid-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 5px;
                        margin-bottom: 5px;
                        font-size: 14px;
                    }
                    .solid-table th, .solid-table td { 
                        border: 2px solid #000; 
                        padding: 6px; 
                        text-align: left; 
                        vertical-align: top;
                    }
                    .solid-table th {
                        font-weight: bold;
                    }
                    .center-text { text-align: center; }
                    .bold-text { font-weight: bold; }
                    .flex-row { display: flex; }
                    .justify-center { justify-content: center; }
                    .justify-between { justify-content: space-between; }
                    .justify-end { justify-content: flex-end; }
                    .mt-4 { margin-top: 30px; }
                    .mb-2 { margin-bottom: 5px; }
                    .underline { text-decoration: underline; }
                    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                `}
            </style>

            <div className="print-container">
                {/* Header */}
                <div className="center-text mb-2">
                    <div className="bold-text" style={{ fontSize: '1.2rem' }}>{instName}</div>
                    <div style={{ fontSize: '1rem' }}>{instAddress}, Phone:- {instPhone}</div>
                    <div className="bold-text mt-4" style={{ fontSize: '1.1rem' }}>
                        Goods Return Note
                    </div>
                </div>

                <div className="dashed-line"></div>

                {/* GRN Number Row */}
                <div className="flex-row justify-center mb-2">
                    <span className="bold-text" style={{ marginRight: '20px' }}>GRN Number :</span>
                    <span className="bold-text" style={{ fontSize: '1.1rem' }}>{grnNumber}</span>
                </div>

                <div className="dashed-line"></div>

                {/* Details Grid */}
                <div className="grid-2 mb-2">
                    <div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>GRN Date :</span> {new Date().toLocaleDateString('en-GB')}</div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>Challan No.:</span> {extraData.challanNo || '0'}</div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>Bill No.:</span> {extraData.billNo || '---'}</div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>PO Number:</span> {poData?.poid}</div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>From Vendor:</span> {poData?.vendor || poData?.vendorname}</div>
                    </div>
                    <div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>Challan Date</span> {formatDate(extraData.challanDate)}</div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>Bill Date</span> {formatDate(extraData.billDate)}</div>
                        <div className="mb-2"><span className="bold-text" style={{ width: '120px', display: 'inline-block' }}>PR Number</span> {poData?.prnumber || '0'}</div>
                    </div>
                </div>

                {/* Items Table */}
                <table className="solid-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>Sr.N.</th>
                            <th>Section Name</th>
                            <th>Item Name</th>
                            <th>Item Make</th>
                            <th>Ret. Item Quantity</th>
                            <th>Item Unit</th>
                            <th>Unit Price(Rs.)</th>
                            <th>Total Amount(Rs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processedItems.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.department || 'GENERAL'}</td>
                                <td>{item.itemname}</td>
                                <td>{item.make || 'LOCAL'}</td>
                                <td>{item.qty}</td>
                                <td>{item.unit || 'EA'}</td>
                                <td>{Number(item.unitPrice).toFixed(4)}</td>
                                <td>{Number(item.total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Totals */}
                <div className="dashed-line"></div>
                <div className="mb-2">
                    <span className="bold-text">Grant Total(Rs.) : </span> {grantTotal}
                </div>
                <div className="dashed-line"></div>

                <div className="mb-2">
                    <span className="bold-text">Grant Total(In Words) : </span> {toWords(grantTotal)}
                </div>
                <div className="dashed-line"></div>

                <div className="mb-2">
                    <span className="bold-text">Remark : </span> {extraData.deliveryNote || '---'}
                </div>
                <div className="dashed-line"></div>

                <div className="mb-2" style={{ marginTop: '20px' }}>
                    <span className="bold-text">Received By: Mr. {global1?.name || '---'}</span>
                </div>
                <div className="dashed-line"></div>

            </div>
        </Box>
    );
};

export default GRNTemplate;
