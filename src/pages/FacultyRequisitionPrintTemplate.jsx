import React from 'react';

const Divider = () => (
    <div style={{ borderBottom: '1px dashed #555', margin: '8px 0' }} />
);

const fmtDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('en-GB') || '';
};

const FacultyRequisitionPrintTemplate = ({
    items = [],
    instituteName,
    instituteAddress,
    institutePhone,
    indentNumber = "________________",
    department = "Asst. Registrar (Admin)",
    remark = ""
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

    // Safely get a common date from items or use today
    const commonDate = items.length > 0 && items[0].reqdate ? items[0].reqdate : new Date();

    return (
        <div style={{ ...base, padding: 40, maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{instituteName || "Institution Name"}</div>
                <div style={{ fontSize: 13 }}>
                    {instituteAddress}{instituteAddress && institutePhone ? ', ' : ''}{institutePhone ? `Phone:- ${institutePhone}` : ''}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 16, marginTop: 4 }}>
                    Indent
                </div>
                <div style={{ fontSize: 14 }}>
                    Department-{department}
                </div>
            </div>

            <Divider />

            {/* Indent Number */}
            <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold', margin: '10px 0' }}>
                <span>Indent Number: {indentNumber}</span>
            </div>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', margin: '10px 0' }}>
                <span>Indent Date : {fmtDate(commonDate)}</span>
                <span>L.F.No.________</span>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 15 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Sr.No.</th>
                        <th style={thStyle}>Section Name</th>
                        <th style={thStyle}>Item Name</th>
                        <th style={thStyle}>Item Make</th>
                        <th style={thStyle}>Item Quantity</th>
                        <th style={thStyle}>Item Unit</th>
                        <th style={thStyle}>Dept. Stock (Issued)</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx}>
                            <td style={tdStyle}>{idx + 1}</td>
                            <td style={tdStyle}>{item.storename || item.section || '-'}</td>
                            <td style={tdStyle}>{item.itemname || '-'}</td>
                            <td style={tdStyle}>{item.make || 'LOCAL'}</td>
                            <td style={tdStyle}>{item.quantity || '-'}</td>
                            <td style={tdStyle}>{item.unit || 'EA'}</td>
                            <td style={tdStyle}>0</td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td style={tdStyle} colSpan="7" align="center">No items found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ marginTop: 20 }}>
                <strong>Remark :</strong> {remark}
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: 100 }}>
                <div style={{ textAlign: 'left', fontWeight: 'bold' }}>
                    Created By: ________________
                </div>
                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Verified By Sign with Name ________________
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60, fontWeight: 'bold' }}>
                Authorised Signatory (Sign with Name and Date) ________________
            </div>

        </div>
    );
};

export default FacultyRequisitionPrintTemplate;
