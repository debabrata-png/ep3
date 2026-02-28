const { jsPDF } = require("jspdf");
const fs = require('fs');

const doc = new jsPDF('p', 'pt', 'a4');

const drawIcon = (doc, type, x, y) => {
    const r = 5.5;
    doc.setLineWidth(0.8);
    doc.setDrawColor(0);
    doc.circle(x, y - 1, r, 'S');

    doc.setFillColor(0);

    if (type === 'location') {
        doc.circle(x, y - 2.5, 2.2, 'F');
        doc.triangle(x - 2.1, y - 2, x + 2.1, y - 2, x, y + 2, 'F');
        doc.setFillColor(255);
        doc.circle(x, y - 2.5, 0.8, 'F');
        doc.setFillColor(0);
    } else if (type === 'email') {
        doc.rect(x - 3.5, y - 3, 7, 4.5, 'F');
        doc.setDrawColor(255);
        doc.setLineWidth(0.6);
        doc.line(x - 3.5, y - 3, x, y - 0.5);
        doc.line(x + 3.5, y - 3, x, y - 0.5);
        doc.setDrawColor(0);
    } else if (type === 'telephone' || type === 'phone') {
        doc.rect(x - 2.5, y - 1, 5, 2.5, 'F');
        doc.rect(x - 1, y - 2, 2, 1, 'F');
        doc.setLineWidth(1.2);
        doc.line(x - 2, y - 2, x + 2, y - 2);
        doc.circle(x - 2, y - 2, 0.8, 'F');
        doc.circle(x + 2, y - 2, 0.8, 'F');
        doc.setFillColor(255);
        doc.circle(x, y + 0.3, 0.5, 'F');
        doc.setFillColor(0);
    } else if (type === 'mobile') {
        doc.roundedRect(x - 2, y - 3.5, 4, 7, 0.8, 0.8, 'F');
        doc.setFillColor(255);
        doc.rect(x - 1.5, y - 2.2, 3, 4.5, 'F');
        doc.circle(x, y + 2.8, 0.3, 'F');
        doc.setFillColor(0);
    }
};

drawIcon(doc, 'location', 50, 50);
drawIcon(doc, 'email', 50, 80);
drawIcon(doc, 'telephone', 50, 110);
drawIcon(doc, 'mobile', 50, 140);

const pdfData = doc.output('arraybuffer');
fs.writeFileSync('d:/Campus_technology/ep3-main/test_icons.pdf', Buffer.from(pdfData));
console.log("PDF generated at test_icons.pdf");
