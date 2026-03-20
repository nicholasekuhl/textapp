# TextApp — Project Context

## What It Is
AI-powered SMS marketing SaaS for sales agents.
Built by Nicholas Kuhl / Coverage by Kuhl.
Industry agnostic — built for any sales agent.

## Live URLs
- Production: textapp-production.up.railway.app
- GitHub: github.com/nicholaskuhl/textapp
- Supabase Project: vbfjulpregwhpcycjxaq.supabase.co

## Tech Stack
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL) with RLS
- SMS: Twilio (master account only)
- AI: Claude Sonnet (claude-sonnet-4-6)
- Hosting: Railway (24/7, auto-deploy from GitHub)
- Email: SendGrid via Supabase Auth SMTP

## Core Architecture Decisions
- Master Twilio account only — no per-user credentials
- All SMS sends use process.env.TWILIO_ACCOUNT_SID 
  and TWILIO_AUTH_TOKEN
- From number comes from user's phone_numbers table
- Campaigns = initial outreach + A/B testing only
- Dispositions = post-reply automation engine
- Buckets = user-created colored pill folders
- Sold bucket = permanent system bucket (green, locked)
- All data isolated per user via Supabase RLS
- Forwarding notifications via +15616526496
- Telnyx planned for Phase 5 SaaS switch

## Database Notes
- leads table uses 'phone' not 'phone_number'
- All tables have user_id UUID REFERENCES auth.users(id)
- RLS enabled on all tables
- All indexes use user_id as first column in composite

## Railway Environment Variables
NODE_ENV=production
SUPABASE_URL=https://vbfjulpregwhpcycjxaq.supabase.co
SUPABASE_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]
TWILIO_ACCOUNT_SID=ACfc81a909b23b6d2a12a8b3c68111fe38
TWILIO_AUTH_TOKEN=[token]
ANTHROPIC_API_KEY=[key]
APP_URL=https://textapp-production.up.railway.app
FORWARDING_NUMBER=+15616526496
ADMIN_EMAIL=nick@coveragebykuhl.com

## Users
- nick@coveragebykuhl.com — is_admin: true (primary)
- nicholas.kuhl@outlook.com — test account
- jennacarlyle737@gmail.com — test account

## What's Fully Built
### Core App
- Multi-user auth with email verification
- Password reset flow
- Terms of Service on signup
- Agent invite system
- Admin panel with user suspension
- Per-user data isolation (RLS)
- Mobile responsive

### Leads
- CSV/Excel upload with smart column mapping
- Lead deduplication on upload
- Bucket system (user-created colored pills)
- Lead cards with notes, autopilot toggle
- Disposition pills, campaign pills
- Advanced search and filter panel
- Sold/Not Sold filter
- Exclude disposition filter
- Create lead button (manual entry)
- CSV export
- Bulk selection (actions in progress)
- Copy buttons on name, phone, email

### Campaigns
- Campaign builder with drip sequences
- Day + send time scheduling per lead timezone
- Spintext support {option1|option2}
- Campaign pause on reply (verified)
- A/B testing via multiple campaigns
- Response rate per campaign

### Disposition Tags
- Create/edit/delete with 12 color picker
- Optional drip sequence per tag
- Automated actions engine:
  add/remove tags, pause/add/remove campaigns,
  send immediate text, update status,
  mark sold, mark cold, add note,
  move to bucket (in progress)

### AI Engine
- Claude Sonnet production system prompt
- Health insurance conversation flow
- Full qualification flow (8 steps)
- Ghosted lead follow-up logic
- Objection handling built in
- Compliance guardrails
- Agent name + Calendly from user profile
- Smart handoff detection (6 triggers):
  appointment confirmed, quote requested,
  complex medical, frustration detected,
  qualification complete, consecutive followups
- Colored handoff banners in conversations
- Needs Review tab
- Take Over / Mark Resolved buttons

### Conversations
- Three panel layout (sidebar/thread/details)
- Tabs: All / Unread / Recent / Starred
- Show/hide blocked toggle
- Scheduled messages with date/time picker
- Real time polling every 10 seconds
- Contact details right panel (collapsible)
- Star/favorite conversations
- Block/unblock leads
- Scheduled/Sent/Rejected sub-tabs
- AI suggestion on focus

### Notifications
- In-app bell with unread badge
- Dropdown with lead name, preview, time ago
- SMS forwarding to agent's personal cell
- Per-user toggle: SMS on/off, in-app on/off
- Personal phone field in profile settings

### Compliance
- Per-user compliance footer
- First message detection (first_message_sent flag)
- [Agency Name] placeholder auto-replaced
- Append to first message only
- Toggle enable/disable with warning
- Preview in settings

### Operations
- Scheduler running every 60 seconds on Railway
- Birthday automation
- Keyword auto-response triggers
- Scheduler health heartbeat
- Scheduler status on Stats page
- Message delivery tracking (delivered/failed)
- Daily send volume warnings
- Onboarding checklist (5 steps)
- Empty states on all pages

### Phone Numbers
- In-app search by state or area code
- Purchase via Twilio API
- Webhook auto-configured on purchase
- Carrier violations counter
- Release number with confirmation
- All numbers under master Twilio account

### Settings Pages
- Disposition Tags
- Preset Templates
- Phone Numbers (search + purchase + manage)
- Team & Invites
- Account (profile, compliance, notifications)
- Admin panel (/admin.html)

### Stats/Analytics
- Message volume chart (line)
- Lead funnel chart
- Campaign performance table
- Best times to send heatmap
- Scheduler health status
- Recent activity feed
- Delivery rate metrics

### Calendar
- Month view with appointment dots
- Day view with appointment cards
- Today's Calls section
- AI auto-books appointments from conversations
- Confirmation text sent to lead
- Calendly link sent after booking

## In Progress / Build Queue
1. File split (index.html → separate page files)
2. Buckets as colored pill folders (user-created)
3. Lead dropdown actions menu (three-dot)
4. Bulk actions on selected leads
5. Campaigns scoped to initial outreach only
6. Disposition action: move to bucket
7. Mark as Sold → auto moves to Sold bucket
8. Status auto-update system
9. Commission tracking + earnings dashboard
10. Toast notification system
11. Lead card quick actions (always visible)
12. Analytics dashboard rebuild
13. Skeleton loading screens
14. Copy buttons on lead cards
15. Remove all hardcoded personal data

## Phase 5 SaaS Checklist
### Legal
- [ ] New LLC separate from Cornerstone Legacy
- [ ] EIN for new LLC
- [ ] Attorney draft ToS + Privacy Policy
- [ ] Trademark product name

### SMS Infrastructure
- [ ] Sign up Telnyx ISV under new LLC
- [ ] Switch SMS from Twilio to Telnyx
- [ ] Twilio/Telnyx subaccounts per user
- [ ] Programmatic A2P brand registration on signup
- [ ] Programmatic A2P campaign registration
- [ ] A2P approval webhook — unlock on approval
- [ ] Block number purchasing until A2P approved

### Billing
- [ ] Stripe subscriptions
- [ ] SMS credit system with markup
- [ ] Usage tracking per user
- [ ] Billing dashboard for agents
- [ ] Failed payment handling + grace period
- [ ] Stripe webhook for subscription events

### Admin
- [ ] Super admin revenue dashboard
- [ ] Agent impersonation for support
- [ ] A2P registration status per agent
- [ ] MRR, churn, new signup metrics

### Onboarding
- [ ] Business profile fields (EIN, website, type)
- [ ] A2P registration wizard
- [ ] Welcome email sequence
- [ ] Approval pending status page

### Infrastructure
- [ ] Redis for session management
- [ ] Bull job queue for scheduler
- [ ] Sentry error monitoring
- [ ] Staging environment
- [ ] Scheduled database backups

### Features
- [ ] Google Calendar sync (optional per agent)
- [ ] Zapier webhook for lead auto-import
- [ ] Sales pipeline Kanban view
- [ ] SMS surveys / lead qualification routing
- [ ] Mobile app (React Native or PWA)
- [ ] White label option
- [ ] Team accounts (agency owner + agents)
- [ ] Global search (Command+K)
- [ ] Dark mode
- [ ] Bulk message blast feature

### Marketing
- [ ] Product website with pricing page
- [ ] Demo environment with sample data
- [ ] Referral program
- [ ] Product Hunt launch
- [ ] Outreach to insurance agent communities