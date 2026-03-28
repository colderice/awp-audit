const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { runAudit } = require('./audit/crawler');
const { generateReport } = require('./audit/report-generator');
const { sendReportEmail } = require('./email/sender');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory report store (reports live for 48 hours)
const reportStore = new Map();

// Clean up old reports every hour
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of reportStore.entries()) {
    if (now - data.createdAt > 48 * 60 * 60 * 1000) {
      reportStore.delete(id);
    }
  }
}, 60 * 60 * 1000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Serve intake form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Run audit
app.post('/audit', async (req, res) => {
  const {
    businessName,
    websiteUrl,
    industry,
    firstName,
    email,
    facebook,
    linkedin,
    twitter,
    instagram,
    youtube,
    tiktok
  } = req.body;

  // Basic validation
  if (!businessName || !websiteUrl || !email) {
    return res.status(400).json({ error: 'Business name, website URL, and email are required.' });
  }

  // Normalize URL
  let url = websiteUrl.trim();
  if (!url.startsWith('http')) url = 'https://' + url;

  const socialHandles = { facebook, linkedin, twitter, instagram, youtube, tiktok };

  const reportId = uuidv4();

  // Run audit sync with the request so we can return the ID after it's built
  try {
    console.log(`[${reportId}] Starting audit for ${url}`);

    const auditData = await runAudit(url, socialHandles);
    auditData.businessName = businessName;
    auditData.websiteUrl = url;
    auditData.industry = industry || 'Not specified';
    auditData.auditDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const reportHtml = generateReport(auditData);

    // Store report
    reportStore.set(reportId, {
      html: reportHtml,
      businessName,
      createdAt: Date.now()
    });

    const reportUrl = `${process.env.APP_URL || 'http://localhost:' + PORT}/report/${reportId}`;

    // Return immediately to frontend so they can view it
    res.json({ reportId, message: 'Audit complete. Redirecting...' });

    // Send email async as a backup, don't await it so it doesn't hold up the UI
    sendReportEmail({
      toEmail: email,
      toName: firstName || businessName,
      businessName,
      reportUrl,
      reportHtml
    }).then(() => {
      console.log(`[${reportId}] Audit complete. Report emailed to ${email}`);
    }).catch(err => {
      console.error(`[${reportId}] Email failed but report was generated:`, err.message);
    });

  } catch (err) {
    console.error(`[${reportId}] Audit failed:`, err.message);
    res.status(500).json({ error: 'Failed to generate audit. Please check the URL and try again.' });
  }
});

// ── View report by ID
app.get('/report/:id', (req, res) => {
  const report = reportStore.get(req.params.id);
  if (!report) {
    return res.status(404).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:4rem;">
        <h2>Report Not Found</h2>
        <p>This report has expired or doesn't exist. Reports are available for 48 hours.</p>
        <a href="/">Request a new audit</a>
      </body></html>
    `);
  }
  res.send(report.html);
});

app.listen(PORT, () => {
  console.log(`AWP Audit Tool running on port ${PORT}`);
});
