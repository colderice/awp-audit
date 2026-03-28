const axios = require('axios');
const cheerio = require('cheerio');

const TIMEOUT = 10000;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; AWP-AuditBot/1.0; +https://allwaysposted.com)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

async function fetchPage(url) {
  try {
    const start = Date.now();
    const res = await axios.get(url, { headers: HEADERS, timeout: TIMEOUT, maxRedirects: 5 });
    return { html: res.data, status: res.status, loadTime: Date.now() - start, finalUrl: res.request.res?.responseUrl || url };
  } catch (err) {
    return { html: null, status: err.response?.status || 0, error: err.message, loadTime: null };
  }
}

async function fetchText(url) {
  try {
    const res = await axios.get(url, { headers: HEADERS, timeout: TIMEOUT, responseType: 'text' });
    return { text: res.data, status: res.status };
  } catch (err) {
    return { text: null, status: err.response?.status || 0 };
  }
}

function checkHttps(url) {
  return url.startsWith('https://');
}

function parseHomepage(html, url) {
  const $ = cheerio.load(html);

  // Title
  const title = $('title').first().text().trim() || null;

  // Meta description
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || null;

  // Meta keywords
  const metaKeywords = $('meta[name="keywords"]').attr('content')?.trim() || null;

  // Canonical
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() || null;

  // OG tags
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || null;
  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || null;
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || null;

  // H1 tags
  const h1s = [];
  $('h1').each((i, el) => {
    const text = $(el).text().trim();
    if (text) h1s.push(text);
  });

  // H2 tags
  const h2s = [];
  $('h2').each((i, el) => {
    const text = $(el).text().trim();
    if (text) h2s.push(text);
  });

  // Schema JSON-LD
  const schemas = [];
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      schemas.push(JSON.parse($(el).html()));
    } catch (e) { /* skip malformed */ }
  });

  // Social links
  const socialLinks = {};
  const socialPatterns = {
    facebook: /facebook\.com\//i,
    twitter: /twitter\.com\/|x\.com\//i,
    linkedin: /linkedin\.com\//i,
    instagram: /instagram\.com\//i,
    youtube: /youtube\.com\//i,
    tiktok: /tiktok\.com\//i
  };
  $('a[href]').each((i, el) => {
    const href = $(el).attr('href') || '';
    for (const [platform, pattern] of Object.entries(socialPatterns)) {
      if (pattern.test(href) && !socialLinks[platform]) {
        socialLinks[platform] = href;
      }
    }
  });

  // Phone numbers
  const bodyText = $('body').text();
  const phones = [...new Set(bodyText.match(/\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4}/g) || [])];

  // Images without alt text
  let totalImages = 0, imagesWithoutAlt = 0;
  $('img').each((i, el) => {
    totalImages++;
    if (!$(el).attr('alt')) imagesWithoutAlt++;
  });

  // Total links
  const totalLinks = $('a').length;

  // Check for placeholder/lorem ipsum text
  const fullText = $.html().toLowerCase();
  const hasLoremIpsum = fullText.includes('lorem ipsum');
  const hasPlaceholderBrackets = /\[your company|your company name|\[website\/application/i.test($.html());

  return {
    title,
    metaDesc,
    metaKeywords,
    canonical,
    ogTitle,
    ogDesc,
    ogImage,
    h1s,
    h2s,
    schemas,
    socialLinks,
    phones,
    totalImages,
    imagesWithoutAlt,
    totalLinks,
    hasLoremIpsum,
    hasPlaceholderBrackets
  };
}

function parseRobots(text) {
  if (!text) return { exists: false, fullyPermissive: false, hasSitemap: false };
  const hasDisallow = /^Disallow:\s*\//m.test(text);
  const hasBlankDisallow = /^Disallow:\s*$/m.test(text);
  const hasSitemap = /^Sitemap:/m.test(text);
  return {
    exists: true,
    fullyPermissive: !hasDisallow || hasBlankDisallow,
    hasSitemap,
    raw: text.slice(0, 500)
  };
}

function parseSitemap(text) {
  if (!text) return { exists: false, urlCount: 0 };
  const urlCount = (text.match(/<url>/g) || []).length;
  const sitemapCount = (text.match(/<sitemap>/g) || []).length;
  const lastMod = text.match(/<lastmod>(.*?)<\/lastmod>/)?.[1] || null;
  return { exists: true, urlCount, sitemapCount, lastMod };
}

async function checkSocialProfile(platform, handle) {
  if (!handle) return { exists: false, handle: null };

  // Normalize handle
  const h = handle.replace(/^@/, '').replace(/^https?:\/\/(www\.)?[^/]+\//, '');

  const urls = {
    facebook: `https://www.facebook.com/${h}`,
    twitter: `https://twitter.com/${h}`,
    linkedin: `https://www.linkedin.com/in/${h}`,
    instagram: `https://www.instagram.com/${h}`,
    youtube: `https://www.youtube.com/@${h}`,
    tiktok: `https://www.tiktok.com/@${h}`
  };

  const url = urls[platform];
  if (!url) return { exists: false, handle: h };

  try {
    const res = await axios.get(url, {
      headers: HEADERS,
      timeout: TIMEOUT,
      maxRedirects: 3,
      validateStatus: (s) => s < 500
    });
    return {
      exists: res.status !== 404,
      handle: h,
      url,
      status: res.status
    };
  } catch (err) {
    // A connection error doesn't mean the profile doesn't exist
    return { exists: null, handle: h, url, error: err.message };
  }
}

function scoreAudit(data) {
  let scores = {
    website: 100,
    social: 100,
    content: 100,
    google: 100,
    brand: 100
  };

  // Website health deductions
  if (!data.https) scores.website -= 20;
  if (!data.homepage.metaDesc) scores.website -= 15;
  if (data.homepage.h1s.length === 0) scores.website -= 15;
  if (data.homepage.h1s.length > 1) scores.website -= 10;
  if (!data.homepage.title) scores.website -= 10;
  if (!data.robots.exists) scores.website -= 5;
  if (!data.sitemap.exists) scores.website -= 10;
  if (data.homepage.imagesWithoutAlt > 10) scores.website -= 10;
  if (!data.homepage.schemas.length) scores.website -= 5;
  if (data.homepage.hasLoremIpsum) scores.website -= 20;
  if (data.homepage.hasPlaceholderBrackets) scores.website -= 15;
  if (!data.homepage.ogTitle || data.homepage.ogTitle?.toLowerCase().includes('home')) scores.website -= 5;

  // Social deductions
  const activePlatforms = Object.values(data.socialProfiles).filter(p => p.exists).length;
  const totalPlatforms = Object.keys(data.socialProfiles).filter(k => data.socialHandles[k]).length || 3;
  scores.social = Math.round((activePlatforms / Math.max(totalPlatforms, 3)) * 100);

  // Content deductions
  if (data.homepage.h2s.filter(h => h.trim()).length === 0) scores.content -= 15;
  if (!data.homepage.metaDesc) scores.content -= 20;

  // Google deductions
  if (!data.homepage.schemas.length) scores.google -= 20;
  if (!data.sitemap.exists) scores.google -= 15;
  if (data.homepage.hasLoremIpsum) scores.google -= 25;

  // Brand deductions
  if (data.homepage.socialLinks && Object.keys(data.homepage.socialLinks).length < 2) scores.brand -= 20;
  if (!data.homepage.phones.length) scores.brand -= 10;

  // Clamp all scores
  for (const key of Object.keys(scores)) {
    scores[key] = Math.max(0, Math.min(100, scores[key]));
  }

  const overall = Math.round(
    (scores.website * 0.3 + scores.social * 0.25 + scores.content * 0.2 + scores.google * 0.15 + scores.brand * 0.1)
  );

  function toGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 73) return 'B';
    if (score >= 67) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 53) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 35) return 'D';
    return 'F';
  }

  return {
    overall: toGrade(overall),
    overallPct: overall,
    website: toGrade(scores.website),
    websitePct: scores.website,
    social: toGrade(scores.social),
    socialPct: scores.social,
    content: toGrade(scores.content),
    contentPct: scores.content,
    google: toGrade(scores.google),
    googlePct: scores.google,
    brand: toGrade(scores.brand),
    brandPct: scores.brand
  };
}

async function runAudit(url, socialHandles = {}) {
  console.log(`Crawling ${url}...`);

  const baseUrl = new URL(url).origin;

  // Run all fetches in parallel
  const [
    homepageResult,
    robotsResult,
    sitemapResult
  ] = await Promise.all([
    fetchPage(url),
    fetchText(`${baseUrl}/robots.txt`),
    fetchText(`${baseUrl}/sitemap.xml`).then(r =>
      r.text ? r : fetchText(`${baseUrl}/sitemap_index.xml`)
    )
  ]);

  const https = checkHttps(url);
  const homepage = homepageResult.html
    ? parseHomepage(homepageResult.html, url)
    : { title: null, metaDesc: null, h1s: [], h2s: [], schemas: [], socialLinks: {}, phones: [], totalImages: 0, imagesWithoutAlt: 0, hasLoremIpsum: false, hasPlaceholderBrackets: false };

  const robots = parseRobots(robotsResult.text);
  const sitemap = parseSitemap(sitemapResult.text);

  // Check social profiles
  const socialPlatforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'tiktok'];
  const socialProfileChecks = await Promise.all(
    socialPlatforms.map(p => checkSocialProfile(p, socialHandles[p]))
  );
  const socialProfiles = {};
  socialPlatforms.forEach((p, i) => { socialProfiles[p] = socialProfileChecks[i]; });

  // Count active platforms
  const activePlatforms = Object.values(socialProfiles).filter(p => p.exists === true).length;

  const auditData = {
    url,
    baseUrl,
    https,
    homepage,
    robots,
    sitemap,
    socialHandles,
    socialProfiles,
    activePlatforms,
    loadTime: homepageResult.loadTime,
    siteReachable: !!homepageResult.html
  };

  auditData.scores = scoreAudit(auditData);

  return auditData;
}

module.exports = { runAudit };
