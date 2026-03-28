# Deploy to Railway — Step by Step

## What You Need
- A Railway account (railway.app — free to start)
- A GitHub account (Railway deploys from GitHub)
- An email account for sending reports (Gmail app password OR SendGrid free)

---

## Step 1 — Push to GitHub

1. Create a new GitHub repo (private is fine)
2. In terminal, from the `audit-app` folder:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/awp-audit.git
   git push -u origin main
   ```

---

## Step 2 — Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your `awp-audit` repo
4. Railway auto-detects Node.js and deploys it

---

## Step 3 — Set Environment Variables

In Railway, go to your project → **Variables** tab, and add:

| Variable | Value |
|---|---|
| `APP_URL` | Your Railway URL (e.g. `https://awp-audit.up.railway.app`) |
| `FROM_NAME` | `All Ways Posted` |
| `FROM_EMAIL` | Your sending email address |

**For Gmail (easiest):**
| Variable | Value |
|---|---|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `your@gmail.com` |
| `SMTP_PASS` | Your Gmail App Password* |

*Create a Gmail App Password at: myaccount.google.com/apppasswords

**For SendGrid (recommended for volume):**
| Variable | Value |
|---|---|
| `SENDGRID_API_KEY` | `SG.xxxxxxxxxxxx` |

---

## Step 4 — Set Your Domain (Optional)

In Railway → Settings → Custom Domain, add your domain (e.g. `audit.allwaysposted.com`).
Update `APP_URL` to match.

---

## That's It

Visit your Railway URL and the intake form is live.
Reports are generated and emailed automatically.

---

## Local Testing

```bash
cd audit-app
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
# Visit http://localhost:3000
```
