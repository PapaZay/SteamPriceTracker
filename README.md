# SteamPriceTracker

A web app for tracking Steam game prices, setting sale alerts, and discovering new games with AI recommendations.

## What It Does

### Price Tracking & Alerts
Add any Steam game to your watchlist and monitor its price over time with an interactive price history chart. Set custom alerts to get an email when a game drops by a specific percentage or hits any price decrease — so you never miss a sale.

### AI Game Recommendations
Powered by GPT-4.1-nano. Get personalized game recommendations based on your tracked library, or describe what you're looking for and let the AI find matches. Track a recommended game with one click directly from the results.

### Game Search
Search Steam's full catalog. Results pull from a local database first for speed, falling back to the Steam API for anything not yet indexed.

### Popular Games
The homepage surfaces Steam's current top-sellers so you can quickly add trending games to your watchlist.

### Authentication
Sign up with email/password or continue with Google or GitHub. All auth forms are protected with Cloudflare Turnstile to block bots.

## Tech Stack

**Frontend** — React, TypeScript, Tailwind CSS, Recharts
**Backend** — FastAPI, Python
**Database & Auth** — Supabase (PostgreSQL)
**AI** — OpenAI API (GPT-4.1-nano)
**Emails** — Mailjet
**Payments** — Stripe
**Infra** — AWS EC2, Nginx, GitHub Actions
