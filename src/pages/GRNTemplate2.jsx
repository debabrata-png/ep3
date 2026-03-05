import React from 'react';

const GRNTemplate2 = ({ poData, items, grnNumber, extraData }) => {
    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Goods Receipt Note (GRN)</h2>
            <p><strong>GRN Number:</strong> {grnNumber}</p>
            <p><strong>PO ID:</strong> {poData?.poid || 'N/A'}</p>

            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <p><strong>Challan No:</strong> {extraData?.challanNo || 'N/A'} | <strong>Date:</strong> {extraData?.challanDate || 'N/A'}</p>
                <p><strong>Bill No:</strong> {extraData?.billNo || 'N/A'} | <strong>Date:</strong> {extraData?.billDate || 'N/A'}</p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Item Name</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Ordered Qty</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Received Qty</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Returned Qty</th>
                        <th style={{ border: '1px solid #000', padding: '8px' }}>Unit Price</th>
                    </tr>
                </thead>
                <tbody>
                    {items && items.map((item, idx) => (
                        <tr key={idx}>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{item.itemname}</td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{item.quantity}</td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{item.receivedQty}</td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{item.returnedQty}</td>
                            <td style={{ border: '1px solid #000', padding: '8px' }}>{item.unitPrice}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div style={{ marginTop: '30px' }}>
                <strong>Delivery Note:</strong>
                <p>{extraData?.deliveryNote || 'None'}</p>
            </div>

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
                <div>____________________<br />Authorized Signature</div>
                <div>____________________<br />Store Manager</div>
            </div>
        </div>
    );
};

export default GRNTemplate2;
