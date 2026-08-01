const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFEngine {
  generatePDFStream(docType, shipment, company) {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    const primaryColor = '#0F172A'; // Slate-900
    const secondaryColor = '#475569'; // Slate-600
    const accentColor = '#2563EB'; // Blue-600

    // Header Block
    doc.fillColor(primaryColor).fontSize(18).text((company && company.companyName) || 'GLOBAL EXPORT CORPORATION', 40, 40, { align: 'left' });
    doc.fontSize(9).fillColor(secondaryColor).text((company && company.address && `${company.address.street}, ${company.address.city}, ${company.address.state} - ${company.address.pincode}`) || 'Export House, Business Park, Mumbai, India');
    doc.text(`IEC: ${(company && company.iec) || '1234567890'} | GSTIN: ${(company && company.gst) || '27AAAAA0000A1Z5'} | LUT: ${(company && company.lut) || 'AD270324000001X'}`);

    doc.moveDown(1);
    doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(1);

    // Title Badge
    doc.fillColor(accentColor).fontSize(14).text(docType.toUpperCase(), { align: 'center' });
    doc.moveDown(0.5);

    // Meta Grid (Invoice No, Date, Container, etc.)
    const startY = doc.y;
    doc.fontSize(9).fillColor(primaryColor);

    // Left Column
    doc.text(`Invoice No: ${shipment.invoiceNumber}`, 40, startY);
    doc.text(`Invoice Date: ${new Date(shipment.invoiceDate).toLocaleDateString()}`, 40, startY + 14);
    doc.text(`Buyer / Consignee: ${shipment.customerDetails.company}`, 40, startY + 28);
    doc.text(`Country of Destination: ${shipment.customerDetails.country}`, 40, startY + 42);

    // Right Column
    doc.text(`Container No: ${shipment.shippingDetails.containerNumber}`, 320, startY);
    doc.text(`Seal No: ${shipment.shippingDetails.sealNumber}`, 320, startY + 14);
    doc.text(`Port of Loading: ${shipment.shippingDetails.portOfLoading}`, 320, startY + 28);
    doc.text(`Port of Discharge: ${shipment.shippingDetails.portOfDischarge}`, 320, startY + 42);

    const tableStartY = startY + 70;
    doc.strokeColor('#E2E8F0').moveTo(40, tableStartY).lineTo(555, tableStartY).stroke();

    // Table Header
    let currentY = tableStartY + 10;
    doc.fillColor('#1E293B').fontSize(9).font('Helvetica-Bold');

    if (docType === 'Commercial Invoice' || docType === 'INR Invoice') {
      doc.text('No.', 40, currentY);
      doc.text('Description of Goods', 70, currentY);
      doc.text('HSN Code', 260, currentY);
      doc.text('Qty', 350, currentY, { width: 50, align: 'right' });
      doc.text(`Rate (${shipment.shippingDetails.currency})`, 410, currentY, { width: 60, align: 'right' });
      doc.text(`Amount (${docType === 'INR Invoice' ? 'INR' : shipment.shippingDetails.currency})`, 480, currentY, { width: 75, align: 'right' });
    } else if (docType === 'Packing List') {
      doc.text('No.', 40, currentY);
      doc.text('Description of Goods', 70, currentY);
      doc.text('HSN Code', 260, currentY);
      doc.text('Packages', 350, currentY, { width: 50, align: 'right' });
      doc.text('Net Wt (Kgs)', 410, currentY, { width: 60, align: 'right' });
      doc.text('Gross Wt (Kgs)', 480, currentY, { width: 75, align: 'right' });
    } else if (docType === 'VGM') {
      doc.text('Container No.', 40, currentY);
      doc.text('Size', 160, currentY);
      doc.text('Seal No.', 230, currentY);
      doc.text('Net Wt', 330, currentY);
      doc.text('Tare Wt', 400, currentY);
      doc.text('Total VGM Wt (Kgs)', 470, currentY);
    } else if (docType === 'Annexure') {
      doc.text('Declaration Under LUT Scheme (Rule 96A of CGST Rules)', 40, currentY);
    }

    currentY += 16;
    doc.strokeColor('#CBD5E1').moveTo(40, currentY).lineTo(555, currentY).stroke();
    currentY += 8;

    doc.font('Helvetica').fillColor('#334155');

    // Table Data Rows
    if (docType === 'Commercial Invoice' || docType === 'INR Invoice') {
      shipment.items.forEach((item, idx) => {
        const rate = docType === 'INR Invoice' ? (item.rate * shipment.shippingDetails.exchangeRate) : item.rate;
        const amt = docType === 'INR Invoice' ? (item.amount * shipment.shippingDetails.exchangeRate) : item.amount;

        doc.text(`${idx + 1}`, 40, currentY);
        doc.text(item.productName, 70, currentY, { width: 180 });
        doc.text(item.hsn, 260, currentY);
        doc.text(`${item.quantity} ${item.unit}`, 350, currentY, { width: 50, align: 'right' });
        doc.text(rate.toFixed(2), 410, currentY, { width: 60, align: 'right' });
        doc.text(amt.toFixed(2), 480, currentY, { width: 75, align: 'right' });
        currentY += 20;
      });
    } else if (docType === 'Packing List') {
      shipment.items.forEach((item, idx) => {
        doc.text(`${idx + 1}`, 40, currentY);
        doc.text(item.productName, 70, currentY, { width: 180 });
        doc.text(item.hsn, 260, currentY);
        doc.text(`${item.packages || 1} Box`, 350, currentY, { width: 50, align: 'right' });
        doc.text(item.netWeight.toFixed(2), 410, currentY, { width: 60, align: 'right' });
        doc.text(item.grossWeight.toFixed(2), 480, currentY, { width: 75, align: 'right' });
        currentY += 20;
      });
    } else if (docType === 'VGM') {
      doc.text(shipment.shippingDetails.containerNumber, 40, currentY);
      doc.text(shipment.shippingDetails.containerSize, 160, currentY);
      doc.text(shipment.shippingDetails.sealNumber, 230, currentY);
      doc.text(`${shipment.shippingDetails.totalNetWeight} Kgs`, 330, currentY);
      doc.text(`${(shipment.shippingDetails.vgmWeight - shipment.shippingDetails.totalGrossWeight).toFixed(2)} Kgs`, 400, currentY);
      doc.text(`${shipment.shippingDetails.vgmWeight} Kgs`, 470, currentY);
      currentY += 25;
    } else if (docType === 'Annexure') {
      doc.fontSize(10).text(`We hereby declare that export goods specified in Invoice No. ${shipment.invoiceNumber} dated ${new Date(shipment.invoiceDate).toLocaleDateString()} are exported under Letter of Undertaking (LUT No: ${(company && company.lut) || 'N/A'}) without payment of integrated tax.`, 40, currentY, { width: 500 });
      currentY += 50;
    }

    currentY += 10;
    doc.strokeColor('#0F172A').moveTo(40, currentY).lineTo(555, currentY).stroke();
    currentY += 10;

    // Totals Block
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#0F172A');
    if (docType === 'Commercial Invoice') {
      doc.text(`GRAND TOTAL (${shipment.shippingDetails.currency}):`, 320, currentY);
      doc.text(`${shipment.financials.grandTotal.toFixed(2)}`, 480, currentY, { width: 75, align: 'right' });
    } else if (docType === 'INR Invoice') {
      doc.text(`GRAND TOTAL (INR @ ${shipment.shippingDetails.exchangeRate}):`, 280, currentY);
      doc.text(`INR ${shipment.financials.grandTotalINR.toFixed(2)}`, 480, currentY, { width: 75, align: 'right' });
    } else if (docType === 'Packing List') {
      doc.text(`TOTAL PACKAGES: ${shipment.shippingDetails.totalPackages}`, 40, currentY);
      doc.text(`TOTAL GROSS WT: ${shipment.shippingDetails.totalGrossWeight} KGS`, 320, currentY);
    } else if (docType === 'VGM') {
      doc.text(`WEIGH BRIDGE: ${shipment.shippingDetails.weighBridgeName || 'Certified Weighbridge'}`, 40, currentY);
      doc.text(`TOTAL SOLAS VGM: ${shipment.shippingDetails.vgmWeight} KGS`, 320, currentY);
    }

    // Footer & Stamp/Signature
    const footerY = 700;
    doc.font('Helvetica').fontSize(8).fillColor(secondaryColor);
    doc.text(`For ${(company && company.companyName) || 'GLOBAL EXPORT CORPORATION'}`, 400, footerY);
    doc.text('Authorized Signatory', 400, footerY + 45);
    doc.text('This document is dynamically generated by Enterprise Export CRM System.', 40, footerY + 60, { align: 'center' });

    doc.end();
    return doc;
  }
}

module.exports = new PDFEngine();
