import PDFDocument from 'pdfkit';

export const generateReceipt = (transaction) => {
  const doc = new PDFDocument({ size: 'A4' });
  const buffers = [];

  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    // Save to file or return buffer
    // fs.writeFileSync(`receipts/tx_${transaction.id}.pdf`, pdfData);
  });

  doc.fontSize(20).text('BUKTI PEMBAYARAN', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Pasien: ${transaction.patient.name}`);
  doc.text(`Total: Rp ${transaction.total.toLocaleString('id-ID')}`);
  doc.text(`Tanggal: ${new Date(transaction.created_at).toLocaleString('id-ID')}`);
  doc.text(`Metode: ${transaction.payment_method}`);
  doc.end();

  return doc;
};