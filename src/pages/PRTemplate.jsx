import React from 'react';
import { Box } from '@mui/material';

const PRTemplate = ({ requestData, items, prNumber, instituteName, instituteAddress, institutePhone, createdByName }) => {

    const formatDate = (dateString) => {
        if (!dateString) return new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    // Data Source: items array takes precedence, fallback to requestData (single)
    const dataItems = (items && items.length > 0) ? items : [requestData];
    const prDate = dataItems[0]?.reqdate ? formatDate(dataItems[0].reqdate) : formatDate(new Date());

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
                        margin: 15px 0; 
                        width: 100%;
                    }
                    .solid-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-top: 20px;
                        margin-bottom: 20px;
                        font-size: 14px;
                    }
                    .solid-table th, .solid-table td { 
                        border: 2px solid #000; 
                        padding: 8px; 
                        text-align: left; 
                    }
                    .solid-table th {
                        font-weight: bold;
                    }
                    .center-text { text-align: center; }
                    .bold-text { font-weight: bold; }
                    .flex-row { display: flex; align-items: center; }
                    .justify-center { justify-content: center; }
                    .justify-between { justify-content: space-between; }
                    .justify-end { justify-content: flex-end; }
                    .mt-4 { margin-top: 30px; }
                    .mb-2 { margin-bottom: 15px; }
                `}
            </style>

            <div className="print-container">
                {/* Header */}
                <div className="center-text mb-2">
                    <div className="bold-text" style={{ fontSize: '1.2rem' }}>{instituteName || "People's Group"}</div>
                    <div style={{ fontSize: '1rem' }}>{instituteAddress}, Phone:- {institutePhone}</div>
                    <div className="bold-text mt-4" style={{ fontSize: '1.1rem', textDecoration: 'underline' }}>
                        Purchase Requisition
                    </div>
                </div>

                <div className="dashed-line"></div>

                {/* PR Details - Centered PR Number Row */}
                <div className="flex-row justify-center mb-2">
                    <span className="bold-text" style={{ marginRight: '10px' }}>PR Number :</span>
                    <span className="bold-text" style={{ fontSize: '1.1rem' }}>{prNumber || '---'}</span>
                </div>

                <div className="dashed-line"></div>

                <div className="flex-row mb-2">
                    <span className="bold-text" style={{ width: '100px' }}>PR Date :</span>
                    <span className="bold-text">{prDate}</span>
                </div>

                {/* Table */}
                <table className="solid-table">
                    <thead>
                        <tr>
                            <th>Sr.N.</th>
                            <th>Section Name</th>
                            <th>Item Name</th>
                            <th>Item Make</th>
                            <th>Item Quantity</th>
                            <th>Item Unit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dataItems.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item?.department || 'GENERAL'}</td>
                                <td>{item?.itemname}</td>
                                <td>{item?.make || 'LOCAL'}</td>
                                <td>{item?.quantity}</td>
                                <td>{item?.unit || 'EA'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer Elements */}
                <div className="mt-4">
                    <div className="dashed-line"></div>

                    <div className="mb-2">
                        <strong>Remark : </strong> {dataItems[0]?.description || '---'}
                    </div>

                    <div className="dashed-line"></div>
                    <div className="dashed-line"></div>

                    <div className="mt-4 mb-2">
                        <span className="bold-text">Created By:{createdByName || '---'}</span>
                    </div>

                    <div className="dashed-line"></div>

                    <div className="flex-row justify-end mt-4" style={{ paddingTop: '50px' }}>
                        <span className="bold-text">Authorised Signatory (Sign with Name and Date)</span>
                    </div>
                </div>
            </div>
        </Box>
    );
};

export default PRTemplate;
