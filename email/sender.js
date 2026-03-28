const nodemailer = require('nodemailer');

function createTransport() {
  // Supports Gmail, SendGrid SMTP, Mailgun SMTP, or any SMTP
  // Configure via environment variables
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // Generic SMTP (Gmail, Mailgun, custom)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendReportEmail({ toEmail, toName, businessName, reportUrl, reportHtml }) {
  const transporter = createTransport();
  const fromName = process.env.FROM_NAME || 'All Ways Posted';
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

  const subject = `Your Brand Presence Audit is Ready — ${businessName}`;

  const textBody = `
Hi ${toName},

Your Brand Presence Audit for ${businessName} is complete.

View your full report here:
${reportUrl}

This link will remain active for 48 hours.

---
All Ways Posted
allwaysposted.com
  `.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F2EE;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:2rem;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#121B27,#1E2B3C);border-bottom:3px solid #C4982E;border-radius:12px 12px 0 0;padding:2rem;text-align:center;">
      <div style="font-family:Arial,sans-serif;font-size:1.2rem;letter-spacing:0.12em;color:#fff;font-weight:800;text-transform:uppercase;">ALL WAYS POSTED</div>
    </div>

    <!-- Body -->
    <div style="background:#fff;padding:2.5rem;border:1px solid #E2E8F0;border-top:none;border-radius:0 0 12px 12px;">
      <h1 style="font-family:Arial,sans-serif;font-size:1.8rem;font-weight:800;color:#1E2B3C;text-transform:uppercase;margin-bottom:0.5rem;">Your Audit Is Ready</h1>
      <p style="color:#64748B;margin-bottom:1.5rem;">Hi ${toName},</p>
      <p style="color:#475569;line-height:1.6;margin-bottom:1.5rem;">
        Your <strong>Brand Presence Audit</strong> for <strong>${businessName}</strong> is complete. We've analyzed your website, social media presence, and Google visibility using publicly available data — no paid tools, just a real look at what the world sees when they look you up.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin:2rem 0;">
        <a href="${reportUrl}" style="display:inline-block;background:#C4982E;color:#121B27;font-family:Arial,sans-serif;font-size:1rem;font-weight:800;padding:1rem 2.5rem;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;">View Your Full Report →</a>
      </div>

      <p style="font-size:0.85rem;color:#94A3B8;text-align:center;">This link is active for 48 hours.</p>

      <hr style="border:none;border-top:1px solid #E2E8F0;margin:2rem 0;">

      <p style="color:#475569;line-height:1.6;margin-bottom:1rem;">
        Once you've reviewed the report, we'd love to show you how All Ways Posted handles the consistency side of what you're seeing — so your feed stays active and your brand stays visible without it eating your time.
      </p>

      <div style="text-align:center;">
        <a href="https://allwaysposted.com" style="display:inline-block;border:2px solid #C4982E;color:#C4982E;font-family:Arial,sans-serif;font-size:0.9rem;font-weight:800;padding:0.7rem 1.75rem;border-radius:50px;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;">Get 3 Free Posts</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:1.5rem;color:#94A3B8;font-size:0.78rem;">
      All Ways Posted &nbsp;·&nbsp; allwaysposted.com<br>
      <span style="font-size:0.72rem;">You received this because you requested a Brand Presence Audit.</span>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: toEmail,
    subject,
    text: textBody,
    html: htmlBody
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`Email failed to ${toEmail}:`, err.message);
    throw err;
  }
}

module.exports = { sendReportEmail };
