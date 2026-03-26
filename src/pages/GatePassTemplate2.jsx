import React from 'react';

const Divider = () => (
    <div style={{ borderBottom: '1px dashed #555', margin: '8px 0' }} />
);

const fmtDate = (d) => d ? new Date(d).toLocaleString('en-GB') : '';

/**
 * GatePassTemplate2 - Template for Inward/Outward Gate Pass
 */
const GatePassTemplate2 = ({ 
    passData = {}, 
    instituteName, 
    instituteAddress, 
    institutePhone 
}) => {
    const base = {
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 13,
        color: '#111',
        lineHeight: 1.6
    };

    const thStyle = {
        border: '1px solid #333',
        padding: '6px 8px',
        fontWeight: 'bold',
        fontSize: 12,
        background: '#f5f5f5',
        textAlign: 'left'
    };

    const tdStyle = {
        border: '1px solid #333',
        padding: '6px 8px',
        fontSize: 12,
        verticalAlign: 'top'
    };

    const row = (label, value, label2, value2) => (
        <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 140px 1fr', gap: 0, margin: '4px 0' }}>
            <span style={{ fontWeight: 'bold' }}>{label}</span>
            <span>{value || '-'}</span>
            {label2 && <span style={{ fontWeight: 'bold' }}>{label2}</span>}
            {value2 !== undefined && <span>{value2 || '-'}</span>}
        </div>
    );

    return (
        <div style={{ ...base, padding: 40, maxWidth: 900, margin: '0 auto', border: '1px solid #eee' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{instituteName || "Institution Name"}</div>
                <div style={{ fontSize: 13 }}>
                    {instituteAddress}{instituteAddress && institutePhone ? ', ' : ''}{institutePhone ? `Phone:- ${institutePhone}` : ''}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 16, marginTop: 4, textDecoration: 'underline' }}>
                    GATE PASS ({passData.passType?.toUpperCase()})
                </div>
            </div>

            <Divider />

            {/* Pass Number & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', margin: '10px 0' }}>
                <span>Pass No: {passData.passNumber}</span>
                <span>Date: {fmtDate(passData.createdAt || new Date())}</span>
            </div>

            <Divider />

            {/* Meta Info */}
            <div style={{ margin: '10px 0' }}>
                {row('Order Number:', passData.poid, 'Order Type:', passData.orderType || (passData.npoSubType ? 'NPO' : 'PO'))}
                {row('Vendor Name:', passData.vendorName)}
                {row('DC / Invoice No:', passData.dcInvoiceNo)}
                {row('Vehicle No:', passData.vehicleNo, 'LR / Bilty No:', passData.lrNo)}
                {row('Person Name:', passData.deliveryPersonName, 'Contact No:', passData.contactNo)}
            </div>

            <Divider />

            {/* Items Table */}
            <div style={{ fontWeight: 'bold', margin: '10px 0' }}>Items Details:</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 5 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Sr.</th>
                        <th style={thStyle}>Item Name</th>
                        <th style={thStyle}>Code</th>
                        <th style={thStyle}>Expected Qty</th>
                        <th style={thStyle}>Actual Qty</th>
                        <th style={thStyle}>Unit</th>
                    </tr>
                </thead>
                <tbody>
                    {(passData.items || []).map((item, idx) => (
                        <tr key={idx}>
                            <td style={tdStyle}>{idx + 1}</td>
                            <td style={tdStyle}>{item.itemname || '-'}</td>
                            <td style={tdStyle}>{item.itemcode || '-'}</td>
                            <td style={tdStyle}>{item.expectedQuantity || '-'}</td>
                            <td style={tdStyle}>{item.deliveredQuantity || '-'}</td>
                            <td style={tdStyle}>{item.unit || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <Divider />

            <div style={{ marginTop: 10 }}>
                <strong>Remarks:</strong> {passData.remarks || '-'}
            </div>

            <Divider />

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 60, padding: '0 20px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #333', width: 150, paddingTop: 5 }}>Security Officer</div>
                    <div style={{ fontSize: 11 }}>({passData.securityName || 'Sign & Date'})</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #333', width: 150, paddingTop: 5 }}>Store In-charge</div>
                    <div style={{ fontSize: 11 }}>(Sign & Date)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #333', width: 150, paddingTop: 5 }}>Delivery Person</div>
                    <div style={{ fontSize: 11 }}>(Sign & Date)</div>
                </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: 10, marginTop: 40, color: '#888' }}>
                Generated via Campus Technology ERP System
            </div>
        </div>
    );
};

export default GatePassTemplate2;
