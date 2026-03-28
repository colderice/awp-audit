function gradeColor(grade) {
  if (!grade) return '#94A3B8';
  if (grade.startsWith('A')) return '#16a34a';
  if (grade.startsWith('B')) return '#65a30d';
  if (grade.startsWith('C')) return '#b45309';
  if (grade.startsWith('D')) return '#c2410c';
  return '#b91c1c';
}

function badge(status) {
  const map = {
    pass:     { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Pass' },
    warn:     { bg: '#fef9c3', color: '#b45309', border: '#fde68a', label: 'Warning' },
    fail:     { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Fail' },
    critical: { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5', label: 'Critical' },
    na:       { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0', label: 'N/A' },
    found:    { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Found' },
    missing:  { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Missing' },
    active:   { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Active' },
    inactive: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Inactive' },
    partial:  { bg: '#fef9c3', color: '#b45309', border: '#fde68a', label: 'Partial' },
    strong:   { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Strong' }
  };
  const b = map[status] || map.na;
  return `<span style="display:inline-block;padding:0.2rem 0.7rem;border-radius:50px;font-family:'Barlow Condensed',sans-serif;font-size:0.7rem;letter-spacing:0.1em;font-weight:800;text-transform:uppercase;background:${b.bg};color:${b.color};border:1px solid ${b.border};">${b.label}</span>`;
}

function row(checkName, statusKey, finding) {
  return `
    <tr>
      <td style="padding:0.9rem 1rem;border-bottom:1px solid #F1F5F9;font-size:0.9rem;background:#fff;color:#1E2B3C;font-weight:600;vertical-align:top;width:30%;">${checkName}</td>
      <td style="padding:0.9rem 1rem;border-bottom:1px solid #F1F5F9;font-size:0.9rem;background:#fff;vertical-align:top;width:15%;">${badge(statusKey)}</td>
      <td style="padding:0.9rem 1rem;border-bottom:1px solid #F1F5F9;font-size:0.85rem;background:#fff;color:#64748B;vertical-align:top;">${finding}</td>
    </tr>`;
}

function scoreBar(label, pct, grade) {
  const color = gradeColor(grade);
  return `
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.75rem;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;letter-spacing:0.08em;color:#64748B;width:200px;flex-shrink:0;text-transform:uppercase;">${label}</div>
      <div style="flex:1;background:#E2E8F0;border-radius:50px;height:8px;overflow:hidden;">
        <div style="width:${pct}%;height:100%;border-radius:50px;background:${color};"></div>
      </div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:900;width:32px;text-align:right;color:${color};">${grade}</div>
    </div>`;
}

function socialCard(platform, profile, handle) {
  const name = platform.charAt(0).toUpperCase() + platform.slice(1);
  const displayHandle = handle ? `@${handle.replace(/^@/, '')}` : 'Not provided';
  const statusKey = !handle ? 'na' : profile.exists === true ? 'found' : profile.exists === false ? 'missing' : 'warn';
  const statusLabel = !handle ? 'Not Provided' : profile.exists === true ? 'Found' : profile.exists === false ? 'Not Found' : 'Unknown';

  return `
    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:1rem;letter-spacing:0.08em;color:#1E2B3C;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.5rem;">
        <div style="width:8px;height:8px;border-radius:50%;background:#C4982E;"></div>${name}
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
        <span style="font-size:0.8rem;color:#64748B;">Handle</span>
        <span style="font-size:0.85rem;color:#475569;font-weight:500;">${displayHandle}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;">
        <span style="font-size:0.8rem;color:#64748B;">Profile Status</span>
        <span>${badge(statusKey)}</span>
      </div>
      ${profile.url ? `<div style="display:flex;justify-content:space-between;margin-bottom:0.3rem;"><span style="font-size:0.8rem;color:#64748B;">URL</span><span style="font-size:0.75rem;color:#94A3B8;">${profile.url.replace('https://', '').slice(0, 35)}...</span></div>` : ''}
    </div>`;
}

function criticalBanner(icon, title, body) {
  return `
    <div style="background:#fef2f2;border:2px solid #fca5a5;border-left:5px solid #dc2626;border-radius:10px;padding:1.25rem 1.5rem;margin-bottom:1.25rem;display:flex;align-items:flex-start;gap:1rem;">
      <div style="font-size:1.4rem;flex-shrink:0;">${icon}</div>
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:1rem;letter-spacing:0.05em;color:#b91c1c;margin-bottom:0.3rem;text-transform:uppercase;font-weight:800;">${title}</div>
        <p style="font-size:0.88rem;color:#7f1d1d;line-height:1.5;margin:0;">${body}</p>
      </div>
    </div>`;
}

function generateReport(data) {
  const s = data.scores;
  const h = data.homepage;
  const activeSocial = Object.values(data.socialProfiles).filter(p => p.exists === true).length;
  const totalSocialProvided = Object.values(data.socialHandles).filter(Boolean).length;

  // Build critical banners
  let banners = '';
  if (h.hasLoremIpsum) banners += criticalBanner('🚨', 'Lorem Ipsum Found on Live Site', 'Placeholder text was detected on the site. This is visible to visitors and search engines and actively damages credibility. Find the page(s) containing dummy copy and replace with real content immediately.');
  if (h.hasPlaceholderBrackets) banners += criticalBanner('🚨', 'Unfilled Template Placeholders Detected', 'Text like "[Your Company Name]" was found on the site. This creates legal exposure on pages like your Privacy Policy and signals to visitors that the site was never properly set up.');
  if (!h.metaDesc) banners += criticalBanner('⚠️', 'No Meta Description — Google Is Writing Your Snippet', 'Without a meta description, Google pulls whatever text it wants from the page to describe you in search results. You have zero control over your first impression in search right now.');
  if (h.ogTitle && (h.ogTitle.toLowerCase().includes('home') || /^home\s*\d*$/i.test(h.ogTitle))) banners += criticalBanner('⚠️', `Open Graph Title Reads "${h.ogTitle}"`, 'Every time your URL gets shared on social media, the link preview shows this placeholder title. Fix this in your SEO plugin settings immediately.');

  // Social rows
  const socialPlatforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok'];
  const socialCards = socialPlatforms.map(p =>
    socialCard(p, data.socialProfiles[p] || { exists: false }, data.socialHandles[p])
  ).join('');

  // Homepage social links
  const homepageSocialLinked = Object.keys(h.socialLinks || {}).length;

  // Website check rows
  const websiteRows = `
    ${row('HTTPS / SSL', data.https ? 'pass' : 'critical', data.https ? 'Site loads securely over HTTPS.' : '<strong>Site is not loading over HTTPS.</strong> This is a critical trust and ranking issue.')}
    ${row('Title Tag', !h.title ? 'critical' : 'warn', h.title ? `"${h.title}" — Review whether this accurately reflects your current positioning and services.` : '<strong>No title tag found.</strong> This is a critical SEO issue.')}
    ${row('Meta Description', !h.metaDesc ? 'critical' : 'pass', h.metaDesc ? `"${h.metaDesc.slice(0, 120)}${h.metaDesc.length > 120 ? '...' : ''}"` : '<strong>Missing.</strong> Google is auto-generating your search snippet. You have no control over how you appear in search results.')}
    ${row('H1 Tags', h.h1s.length === 1 ? 'pass' : h.h1s.length === 0 ? 'fail' : 'warn', h.h1s.length === 0 ? 'No H1 tag found on homepage.' : h.h1s.length === 1 ? `"${h.h1s[0]}"` : `<strong>${h.h1s.length} H1 tags found.</strong> Only one is recommended. Multiple H1s confuse search engines about the page topic.`)}
    ${row('H2 Structure', h.h2s.filter(t => t.trim()).length === 0 ? 'fail' : 'pass', h.h2s.filter(t => t.trim()).length === 0 ? 'No H2 tags with text content found. Section headings are missing or empty — invisible to search engines.' : `${h.h2s.filter(t => t.trim()).length} H2 tags found. Good structure.`)}
    ${row('Open Graph Tags', !h.ogTitle ? 'fail' : (h.ogTitle?.toLowerCase().includes('home') || /^home\s*\d*$/i.test(h.ogTitle || '')) ? 'critical' : 'pass', h.ogTitle ? `OG Title: "${h.ogTitle}"` : 'Missing Open Graph tags. Link previews on social media will look broken or generic.')}
    ${row('Schema Markup', h.schemas.length ? 'pass' : 'warn', h.schemas.length ? `${h.schemas.length} schema block(s) found. Good.` : 'No structured data found. Google has no machine-readable information about your business.')}
    ${row('robots.txt', data.robots.exists ? (data.robots.fullyPermissive ? 'warn' : 'pass') : 'warn', !data.robots.exists ? 'No robots.txt found.' : data.robots.fullyPermissive ? 'File exists but is fully permissive — allows all crawlers to access all pages including any low-quality content.' : 'robots.txt found and properly configured.')}
    ${row('Sitemap', data.sitemap.exists ? 'pass' : 'fail', data.sitemap.exists ? `Sitemap found. ${data.sitemap.sitemapCount ? data.sitemap.sitemapCount + ' sub-sitemaps.' : data.sitemap.urlCount + ' URLs.'} ${data.sitemap.lastMod ? 'Last modified: ' + data.sitemap.lastMod.slice(0, 10) + '.' : ''}` : 'No sitemap.xml found. Search engines are discovering your content without a roadmap.')}
    ${row('Social Links on Site', homepageSocialLinked === 0 ? 'fail' : homepageSocialLinked < 3 ? 'warn' : 'pass', homepageSocialLinked === 0 ? 'No social media links found on the homepage.' : `${homepageSocialLinked} social platform(s) linked from the homepage. ${homepageSocialLinked < totalSocialProvided ? 'Not all your profiles are linked.' : ''}`)}
    ${row('Contact Info Visible', h.phones.length ? 'pass' : 'warn', h.phones.length ? `Phone number found: ${h.phones[0]}` : 'No phone number detected on the homepage. Adding visible contact info builds trust and Google confidence.')}
    ${row('Images Without Alt Text', h.imagesWithoutAlt === 0 ? 'pass' : h.imagesWithoutAlt > 10 ? 'warn' : 'pass', `${h.imagesWithoutAlt} of ${h.totalImages} images are missing alt text.`)}
    ${row('Lorem Ipsum / Placeholder Text', h.hasLoremIpsum || h.hasPlaceholderBrackets ? 'critical' : 'pass', h.hasLoremIpsum || h.hasPlaceholderBrackets ? '<strong>Placeholder content detected on site.</strong> See critical alerts above.' : 'No placeholder text detected. Good.')}
  `;

  // Action plan items
  const immediateActions = [];
  if (h.hasLoremIpsum) immediateActions.push({ title: 'Remove Lorem Ipsum Content', body: 'Find and replace all placeholder text on live pages. This is actively hurting credibility right now.', impact: 'Critical', time: '30 min', urgent: true });
  if (h.hasPlaceholderBrackets) immediateActions.push({ title: 'Fix Template Placeholders', body: 'Replace all bracketed placeholders (e.g., "[Your Company Name]") with real content. Check Privacy Policy, Terms, and Disclaimer pages.', impact: 'Critical', time: '30 min', urgent: true });
  if (!h.metaDesc) immediateActions.push({ title: 'Write a Meta Description', body: 'One sentence that tells Google and humans exactly what you do. This controls your search snippet on every result page.', impact: 'High', time: '10 min', urgent: false });
  if (h.ogTitle && /^home\s*\d*$/i.test(h.ogTitle)) immediateActions.push({ title: `Fix Open Graph Title ("${h.ogTitle}")`, body: 'Update your SEO plugin\'s social title setting. Every share of your URL shows this broken title right now.', impact: 'High', time: '10 min', urgent: true });
  if (h.h1s.length > 1) immediateActions.push({ title: 'Fix Multiple H1 Tags', body: `${h.h1s.length} H1 tags found. Consolidate to a single, clear H1 on the homepage.`, impact: 'Medium', time: '15 min', urgent: false });
  if (!data.https) immediateActions.push({ title: 'Enable HTTPS', body: 'Your site is not loading over HTTPS. This affects trust signals, search rankings, and browser warnings.', impact: 'Critical', time: '1 hour', urgent: true });

  const monthActions = [];
  if (homepageSocialLinked < 3 && totalSocialProvided > 2) monthActions.push({ title: 'Add All Social Links to Homepage & Footer', body: 'All your social profiles should be linked from the site. Don\'t make visitors hunt for them.', impact: 'Medium', time: '30 min' });
  if (!h.schemas.length) monthActions.push({ title: 'Add Schema Markup', body: 'Install Yoast SEO or RankMath and configure LocalBusiness or Person schema. Tells Google exactly who you are and what you do.', impact: 'Medium', time: '2 hours' });
  if (h.h2s.filter(t => t.trim()).length === 0) monthActions.push({ title: 'Add Real H2 Section Headings', body: 'Every major section of your homepage should have a descriptive H2 heading. These are read by search engines and help visitors scan the page.', impact: 'Medium', time: '1 hour' });
  if (!h.phones.length) monthActions.push({ title: 'Add Phone Number to Homepage', body: 'Visible contact info in the header or above the fold builds trust and local search authority.', impact: 'Medium', time: '15 min' });
  monthActions.push({ title: 'Organize Blog Into Categories', body: 'If all posts are "Uncategorized," create topic clusters. This builds topical authority and improves internal linking.', impact: 'Medium', time: '2 hours' });

  const quarterActions = [
    { title: 'Rewrite Homepage Headline & Positioning', body: 'Make sure your homepage immediately communicates what you do, who you serve, and what they should do next. Generic copy kills conversions.', impact: 'High', time: '1 week' },
    { title: 'Build a Consistent Social Posting Schedule', body: 'Identify which 2-3 platforms matter most to your audience and establish a minimum posting cadence you can sustain.', impact: 'High', time: 'Ongoing' },
    { title: 'Set Up & Optimize Google Business Profile', body: 'If not already done, claim and complete your GBP. This is the fastest path to local visibility and trust signals.', impact: 'High', time: '2 hours' }
  ];

  function actionItem(item) {
    return `
      <div style="background:#fff;border:1px solid #E2E8F0;${item.urgent ? 'border-left:3px solid #dc2626;' : ''}border-radius:8px;padding:0.85rem 1rem;margin-bottom:0.75rem;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
        <strong style="display:block;color:${item.urgent ? '#b91c1c' : '#1E2B3C'};font-size:0.9rem;margin-bottom:0.2rem;">${item.title}</strong>
        <span style="font-size:0.85rem;color:#64748B;">${item.body}</span>
        <div style="margin-top:0.4rem;font-size:0.75rem;color:${item.impact === 'Critical' ? '#b91c1c' : item.impact === 'High' ? '#16a34a' : '#b45309'};">Impact: ${item.impact} &nbsp;|&nbsp; Effort: ${item.time}</div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Brand Presence Audit — ${data.businessName} | All Ways Posted</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#F5F2EE; color:#1E2B3C; font-family:'DM Sans',sans-serif; line-height:1.6; font-size:15px; }
  h1,h2,h3 { font-family:'Barlow Condensed',sans-serif; text-transform:uppercase; font-weight:800; line-height:1; }
  .page { max-width:960px; margin:0 auto; padding:0 2rem 4rem; }
  .section { margin-bottom:3rem; }
  .section-header { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; padding-bottom:0.75rem; border-bottom:2px solid rgba(196,152,46,0.3); }
  .section-num { background:#C4982E; color:#121B27; font-family:'Barlow Condensed',sans-serif; font-size:1rem; font-weight:900; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .social-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:1.5rem; }
  .eeat-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; margin-bottom:1.5rem; }
  .action-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
  .working-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1rem; }
  @media(max-width:640px) { .social-grid,.action-grid,.working-grid,.eeat-grid { grid-template-columns:1fr; } }
</style>
</head>
<body>

<!-- HEADER -->
<div style="background:linear-gradient(135deg,#121B27 0%,#1E2B3C 60%,#1a2f47 100%);border-bottom:3px solid #C4982E;padding:3rem;position:relative;overflow:hidden;">
  <div style="position:absolute;top:-60px;right:-60px;width:300px;height:300px;background:radial-gradient(circle,rgba(196,152,46,0.12) 0%,transparent 70%);border-radius:50%;"></div>
  <div style="max-width:960px;margin:0 auto;padding:0 2rem;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2.5rem;">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:1.3rem;letter-spacing:0.12em;color:#fff;font-weight:800;text-transform:uppercase;">ALL WAYS POSTED</div>
      <div style="background:rgba(196,152,46,0.15);border:1px solid rgba(196,152,46,0.4);padding:0.5rem 1.25rem;border-radius:50px;font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;letter-spacing:0.2em;color:#E0B44C;text-transform:uppercase;">Brand Presence Audit</div>
    </div>
    <h1 style="font-size:3.5rem;color:#fff;margin-bottom:0.5rem;">Brand Presence<br>Audit Report</h1>
    <p style="font-size:1rem;color:#CBD5E1;font-weight:400;">Live site analysis, social media inspection, and Google visibility check — no paid tools used.</p>
    <div style="display:flex;gap:2rem;margin-top:2rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,0.1);flex-wrap:wrap;">
      ${[['Business', data.businessName], ['Website', data.websiteUrl.replace(/^https?:\/\//, '')], ['Industry', data.industry], ['Audit Date', data.auditDate]].map(([l, v]) => `
        <div><div style="font-family:'Barlow Condensed',sans-serif;font-size:0.7rem;letter-spacing:0.2em;color:#C4982E;text-transform:uppercase;margin-bottom:0.25rem;">${l}</div><div style="font-size:1rem;font-weight:500;color:#fff;">${v}</div></div>`).join('')}
    </div>
  </div>
</div>

<div class="page">
<div style="padding:3rem 0;">

  <!-- CRITICAL BANNERS -->
  ${banners ? `<div style="margin-bottom:2rem;">${banners}</div>` : ''}

  <!-- KEY FINDINGS -->
  <div class="section">
    <div class="section-header">
      <div class="section-num">★</div>
      <h2 style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;color:#1E2B3C;letter-spacing:0.05em;">Key Findings at a Glance</h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2.5rem;">
      ${[
        ['Overall Score', s.overall, gradeColor(s.overall)],
        ['Active Social Platforms', activeSocial + (totalSocialProvided ? '/' + totalSocialProvided : ''), activeSocial >= totalSocialProvided * 0.8 ? '#16a34a' : '#dc2626'],
        ['Technical Issues', [!h.metaDesc, !data.https, h.hasLoremIpsum, h.hasPlaceholderBrackets, h.h1s.length !== 1, !data.sitemap.exists].filter(Boolean).length, '#b45309'],
        ['Site Reachable', data.siteReachable ? 'Yes' : 'No', data.siteReachable ? '#16a34a' : '#dc2626']
      ].map(([label, val, color]) => `
        <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:1.5rem 1.25rem;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:2.4rem;font-weight:900;color:${color};line-height:1;margin-bottom:0.4rem;">${val}</div>
          <div style="font-size:0.78rem;color:#64748B;text-transform:uppercase;letter-spacing:0.1em;font-family:'Barlow Condensed',sans-serif;">${label}</div>
        </div>`).join('')}
    </div>

    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:2rem;display:flex;align-items:center;gap:3rem;margin-bottom:2.5rem;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:6rem;font-weight:900;line-height:1;min-width:100px;text-align:center;color:${gradeColor(s.overall)};">${s.overall}</div>
      <div style="flex:1;">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;letter-spacing:0.15em;color:#A67B1B;margin-bottom:1rem;text-transform:uppercase;">Score Breakdown</div>
        ${scoreBar('Social Media Presence', s.socialPct, s.social)}
        ${scoreBar('Website Health', s.websitePct, s.website)}
        ${scoreBar('Content & Structure', s.contentPct, s.content)}
        ${scoreBar('Google Visibility', s.googlePct, s.google)}
        ${scoreBar('Brand Consistency', s.brandPct, s.brand)}
      </div>
    </div>
  </div>

  <!-- SOCIAL MEDIA -->
  <div class="section">
    <div class="section-header">
      <div class="section-num">1</div>
      <h2 style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;color:#1E2B3C;letter-spacing:0.05em;">Social Media Presence</h2>
    </div>
    <div class="social-grid">${socialCards}</div>
    ${homepageSocialLinked < totalSocialProvided && totalSocialProvided > 0 ? criticalBanner('⚠️', 'Not All Social Profiles Are Linked from Your Site', `Only ${homepageSocialLinked} of your ${totalSocialProvided} social profiles are linked from the homepage. Visitors can't find your other channels.`) : ''}
  </div>

  <!-- WEBSITE HEALTH -->
  <div class="section">
    <div class="section-header">
      <div class="section-num">2</div>
      <h2 style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;color:#1E2B3C;letter-spacing:0.05em;">Website Health Check</h2>
    </div>
    <div style="border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr>
          <th style="font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;letter-spacing:0.15em;color:#64748B;text-transform:uppercase;text-align:left;padding:0.75rem 1rem;border-bottom:2px solid #E2E8F0;background:#F1F5F9;width:30%;">Check</th>
          <th style="font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;letter-spacing:0.15em;color:#64748B;text-transform:uppercase;text-align:left;padding:0.75rem 1rem;border-bottom:2px solid #E2E8F0;background:#F1F5F9;width:15%;">Status</th>
          <th style="font-family:'Barlow Condensed',sans-serif;font-size:0.75rem;letter-spacing:0.15em;color:#64748B;text-transform:uppercase;text-align:left;padding:0.75rem 1rem;border-bottom:2px solid #E2E8F0;background:#F1F5F9;">Finding</th>
        </tr></thead>
        <tbody>${websiteRows}</tbody>
      </table>
    </div>
  </div>

  <!-- ACTION PLAN -->
  <div class="section">
    <div class="section-header">
      <div class="section-num">3</div>
      <h2 style="font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;color:#1E2B3C;letter-spacing:0.05em;">Prioritized Action Plan</h2>
    </div>
    <div class="action-grid">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;letter-spacing:0.15em;color:#A67B1B;text-transform:uppercase;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid rgba(196,152,46,0.3);">This Week</div>
        ${immediateActions.length ? immediateActions.map(actionItem).join('') : '<div style="font-size:0.9rem;color:#64748B;padding:1rem;">No critical immediate actions found. Good work!</div>'}
      </div>
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;letter-spacing:0.15em;color:#A67B1B;text-transform:uppercase;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid rgba(196,152,46,0.3);">This Month</div>
        ${monthActions.map(actionItem).join('')}
      </div>
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:0.8rem;letter-spacing:0.15em;color:#A67B1B;text-transform:uppercase;margin-bottom:1rem;padding-bottom:0.5rem;border-bottom:2px solid rgba(196,152,46,0.3);">This Quarter</div>
        ${quarterActions.map(actionItem).join('')}
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div style="background:linear-gradient(135deg,#1E2B3C 0%,#121B27 100%);border:3px solid #C4982E;border-radius:16px;padding:2.5rem;text-align:center;margin-top:3rem;">
    <h2 style="font-size:2.2rem;color:#fff;margin-bottom:1rem;">The Problem Isn't Strategy.<br>It's Consistency.</h2>
    <p style="color:#CBD5E1;font-size:1rem;max-width:560px;margin:0 auto 1.75rem;">Most businesses know what they should post. They just don't have the systems to post consistently without it falling through the cracks. That's exactly what All Ways Posted handles — so your feed stays active and your brand stays visible.</p>
    <a href="https://allwaysposted.com" style="display:inline-block;background:#C4982E;color:#121B27;font-family:'Barlow Condensed',sans-serif;font-size:1.1rem;letter-spacing:0.1em;font-weight:900;padding:1rem 2.5rem;border-radius:50px;text-decoration:none;text-transform:uppercase;">Get 3 Free Posts — See What Consistent Looks Like</a>
    <p style="margin-top:1.25rem;font-size:0.8rem;color:#94A3B8;">allwaysposted.com &nbsp;·&nbsp; No commitment required</p>
  </div>

  <!-- DISCLAIMER -->
  <div style="border-top:1px solid #E2E8F0;padding-top:2rem;margin-top:3rem;font-size:0.75rem;color:#94A3B8;line-height:1.6;">
    <strong style="color:#64748B;">About This Audit</strong><br>
    This Brand Presence Audit was conducted using publicly available data — live site analysis via HTTP requests, HTML parsing, robots.txt and sitemap inspection, and social platform profile checks. No paid tools, third-party APIs, or private data sources were used. All findings reflect what is visible to any visitor, prospect, or search engine at the time of the audit. Prepared by All Ways Posted as a complimentary service.
  </div>

</div>
</div>
</body>
</html>`;
}

module.exports = { generateReport };
