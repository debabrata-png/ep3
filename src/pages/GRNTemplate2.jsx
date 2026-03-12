import React from 'react';

// Helper: Convert number to words (Indian system)
const numberToWords = (num) => {
    if (!num || isNaN(num)) return 'Zero Rupees Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const n = Math.floor(num);
    const convertHundreds = (n) => {
        if (n === 0) return '';
        if (n < 20) return ones[n] + ' ';
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
        return ones[Math.floor(n / 100)] + ' Hundred ' + convertHundreds(n % 100);
    };
    if (n === 0) return 'Zero Rupees Only';
    let words = '';
    if (n >= 10000000) { words += convertHundreds(Math.floor(n / 10000000)) + 'Crore '; num %= 10000000; }
    if (n >= 100000) { words += convertHundreds(Math.floor(n / 100000)) + 'Lakh '; num %= 100000; }
    if (n >= 1000) { words += convertHundreds(Math.floor(n / 1000)) + 'Thousand '; num %= 1000; }
    if (n >= 100) { words += convertHundreds(Math.floor(n / 100)) + 'Hundred '; num %= 100; }
    words += convertHundreds(n % 100);
    return words.trim() + ' Rupees Only';
};

const Divider = () => (
    <div style={{ borderBottom: '1px dashed #555', margin: '6px 0' }} />
);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '';

/**
 * GRNTemplate2 - Matches the provided GRN format exactly.
 * Props:
 *   poData          : { poid, vendorName, ... }
 *   items           : [{ category/sectionname, itemname, type/itemmake, grnQuantity, unit, unitPrice }]
 *   grnNumber       : string
 *   extraData       : { grnDate, challanNo, challanDate, billNo, billDate, prNumber, remarks, receivedBy }
 *   instituteName   : from PR config
 *   instituteAddress: from PR config
 *   institutePhone  : from PR config
 */
const GRNTemplate2 = ({ poData = {}, items = [], grnNumber, extraData = {}, instituteName, instituteAddress, institutePhone }) => {
    const grandTotal = items.reduce((sum, item) => {
        const price = Number(item.unitPrice || 0);
        const qty = Number(item.grnQuantity ?? item.quantity ?? 0);
        return sum + (price * qty);
    }, 0);

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
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 140px 1fr', gap: 0, margin: '2px 0' }}>
            <span style={{ fontWeight: 'bold' }}>{label}</span>
            <span>{value}</span>
            {label2 && <span style={{ fontWeight: 'bold' }}>{label2}</span>}
            {value2 !== undefined && <span>{value2}</span>}
        </div>
    );

    return (
        <div style={{ ...base, padding: 40, maxWidth: 900, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>{instituteName || "Institution"}</div>
                <div style={{ fontSize: 13 }}>
                    {instituteAddress}{instituteAddress && institutePhone ? ', ' : ''}{institutePhone ? `Phone:- ${institutePhone}` : ''}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: 14, marginTop: 2 }}>Goods Receipt Note (Duplicate)</div>
            </div>

            <Divider />

            {/* GRN Number */}
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 15, margin: '6px 0' }}>
                GRN Number :&nbsp;&nbsp;&nbsp;{grnNumber || 'N/A'}
            </div>

            <Divider />

            {/* Meta Fields */}
            <div style={{ margin: '6px 0' }}>
                {row('GRN Date :', fmtDate(extraData?.grnDate) || fmtDate(new Date()), '', '')}
                {row('Challan No.:', extraData?.challanNo || '', 'Challan Date', fmtDate(extraData?.challanDate))}
                {row('Bill No.:', extraData?.billNo || '', 'Bill Date', fmtDate(extraData?.billDate))}
                {row('PO Number:', poData?.poid || extraData?.poid || '', 'PR Number', extraData?.prNumber || '')}
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 0, margin: '2px 0' }}>
                    <span style={{ fontWeight: 'bold' }}>From Vendor:</span>
                    <span>{poData?.vendorName || extraData?.vendorName || ''}</span>
                </div>
            </div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, marginBottom: 4 }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Sr.N.</th>
                        <th style={thStyle}>Section Name</th>
                        <th style={thStyle}>Item Name</th>
                        <th style={thStyle}>Item Make</th>
                        <th style={thStyle}>Rec. Item Quantity</th>
                        <th style={thStyle}>Item Unit</th>
                        <th style={thStyle}>Unit Price(Rs.)</th>
                        <th style={thStyle}>Total Amount(Rs.)</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => {
                        const price = Number(item.unitPrice || 0);
                        const qty = Number(item.grnQuantity ?? item.deliveredQuantity ?? item.quantity ?? 0);
                        const total = (price * qty).toFixed(2);
                        return (
                            <tr key={idx}>
                                <td style={tdStyle}>{idx + 1}</td>
                                <td style={tdStyle}>{item.category || item.sectionname || '-'}</td>
                                <td style={tdStyle}>{item.itemname || '-'}</td>
                                <td style={tdStyle}>{item.type || item.itemmake || item.make || '-'}</td>
                                <td style={tdStyle}>{qty}</td>
                                <td style={tdStyle}>{item.unit || '-'}</td>
                                <td style={tdStyle}>{price > 0 ? price.toFixed(2) : '-'}</td>
                                <td style={tdStyle}>{price > 0 ? total : '-'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <Divider />
            <div style={{ paddingLeft: 8 }}>
                <strong>Grant Total(Rs.):</strong> {grandTotal.toFixed(0)}
            </div>
            <Divider />
            <div style={{ paddingLeft: 8 }}>
                <strong>Grant Total(In Words):</strong> {numberToWords(grandTotal)}
            </div>
            <Divider />
            <div style={{ paddingLeft: 8 }}>
                <strong>Remark :</strong> {extraData?.remarks || '-'}
            </div>
            <Divider />
            <div style={{ paddingLeft: 8 }}>
                <strong>Received By:</strong> {extraData?.receivedBy || '-'}
            </div>
            <Divider />

            {/* Signature */}
            <div style={{ textAlign: 'right', marginTop: 40, paddingRight: 8 }}>
                Authorised Signatory (Sign with Name and Date)
            </div>
        </div>
    );
};

export default GRNTemplate2;
