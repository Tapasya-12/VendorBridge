import nodemailer from "nodemailer";
import { logger } from "./logger.js";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
  tls: {
    rejectUnauthorized: false, // For development purposes
  },
});

interface InvoiceEmailData {
  invoiceNumber: string;
  vendorName: string;
  totalAmount: number;
  dueDate: string | null;
  invoiceUrl: string;
}

export async function sendInvoiceEmail(
  recipientEmail: string,
  invoiceData: InvoiceEmailData
): Promise<boolean> {
  // If no SMTP credentials are configured, simulate email sending
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.info(
      { recipientEmail, invoiceNumber: invoiceData.invoiceNumber },
      "Email simulation mode: SMTP not configured. Email would have been sent."
    );
    return true;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || '"VendorBridge" <noreply@vendorbridge.com>',
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoiceNumber} from VendorBridge`,
      html: generateInvoiceEmailHtml(invoiceData),
      text: generateInvoiceEmailText(invoiceData),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(
      { recipientEmail, invoiceNumber: invoiceData.invoiceNumber, messageId: info.messageId },
      "Invoice email sent successfully"
    );
    return true;
  } catch (error) {
    logger.error(
      { error, recipientEmail, invoiceNumber: invoiceData.invoiceNumber },
      "Failed to send invoice email"
    );
    return false;
  }
}

function generateInvoiceEmailHtml(data: InvoiceEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: 600; color: #6b7280; }
    .detail-value { color: #111827; }
    .total { font-size: 20px; font-weight: bold; color: #4F46E5; }
    .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">VendorBridge</h1>
      <p style="margin: 5px 0 0 0;">Procurement Management Platform</p>
    </div>
    <div class="content">
      <h2 style="color: #111827; margin-top: 0;">New Invoice</h2>
      <p>Dear ${data.vendorName},</p>
      <p>You have received a new invoice from VendorBridge. Please find the details below:</p>
      
      <div class="invoice-details">
        <div class="detail-row">
          <span class="detail-label">Invoice Number:</span>
          <span class="detail-value">${data.invoiceNumber}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Vendor:</span>
          <span class="detail-value">${data.vendorName}</span>
        </div>
        ${data.dueDate ? `
        <div class="detail-row">
          <span class="detail-label">Due Date:</span>
          <span class="detail-value">${data.dueDate}</span>
        </div>
        ` : ''}
        <div class="detail-row" style="border-bottom: none; margin-top: 10px;">
          <span class="total">Total Amount:</span>
          <span class="total">$${data.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
      
      <center>
        <a href="${data.invoiceUrl}" class="button">View Invoice</a>
      </center>
      
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        Please review the invoice and process payment according to the terms agreed upon.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated message from VendorBridge. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} VendorBridge. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function generateInvoiceEmailText(data: InvoiceEmailData): string {
  return `
VendorBridge - New Invoice

Dear ${data.vendorName},

You have received a new invoice from VendorBridge.

Invoice Details:
- Invoice Number: ${data.invoiceNumber}
- Vendor: ${data.vendorName}
${data.dueDate ? `- Due Date: ${data.dueDate}` : ''}
- Total Amount: $${data.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}

View your invoice: ${data.invoiceUrl}

Please review the invoice and process payment according to the terms agreed upon.

---
This is an automated message from VendorBridge. Please do not reply to this email.
© ${new Date().getFullYear()} VendorBridge. All rights reserved.
  `.trim();
}
