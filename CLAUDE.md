# Claude Rules — Read Before Every Task

Read and follow ALL of these rules for every
task in this session without exception.
These rules take priority over everything else.

## RULE 1: READ FILES SELECTIVELY
Read ONLY the specific files mentioned in
each task. Do not read the entire codebase
unless explicitly asked to.
Only read additional files if directly
needed to complete the specific task.

## RULE 2: NO PERSONAL OR SPECIFIC DATA
Never use specific real names, company names,
vendor names, or personal data anywhere in
the codebase as placeholder, example, or
default values.

BANNED — never appear anywhere in code:
- "Dynasty", "Redmedia", "Gold Bars", "30 EXL"
- "Nick Kuhl", "Nicholas Kuhl", "Nick"
- "Coverage by Kuhl", "Cornerstone Legacy Group"
- Any email containing "kuhl" or "coveragebykuhl"
- "+15614805670", "+15616526496"
- "USHA", "USHealth", "US Health Advisors"
- "Vanessa" as a default agent name

REPLACE ALL with generic versions:
- Campaign names: "My First Campaign",
  "Follow Up Sequence", "Outreach Campaign A"
- Disposition tags: "Hot Lead",
  "Not Interested", "Callback Requested"
- Agent name: "Your Name"
- Agency name: "Your Agency Name"
- Email: "you@youragency.com"
- Phone: "+1 (555) 000-0000"
- Bucket names: "New Leads", "My Bucket"
- Sample lead names: "Jane Smith", "John Doe",
  "Sarah Johnson", "Mike Williams"
- Sample phone: "+1 (555) 000-0001"
- Sample email: "jane.smith@email.com"

## RULE 3: FILE ORGANIZATION
The public/ directory is split into separate
page files. Never create a monolithic index.html.

Existing page files:
- public/leads.html
- public/conversations.html
- public/campaigns.html
- public/stats.html
- public/calendar.html
- public/settings.html
- public/admin.html
- public/login.html
- public/signup.html

Shared code lives in:
- public/js/shared.js
- public/css/shared.css

ADDING TO EXISTING FILES:
Add to existing page file if feature belongs
to that page and adds under 200 lines.

CREATING NEW FILES:
Create new file if feature:
- Is a full page experience
- Has its own navigation entry
- Would make existing file exceed 1000 lines
- Serves a completely different workflow

FILE SIZE LIMIT:
If any file exceeds 1000 lines tell me
what needs splitting before proceeding.

NEVER duplicate shared code across files.

## RULE 4: DATABASE PERFORMANCE
Whenever adding a new table or column used
in WHERE, ORDER BY, or JOIN, automatically
add the appropriate index in the same SQL block.

Always use this pattern:
CREATE INDEX IF NOT EXISTS idx_[table]_[column]
  ON [table](user_id, [column]);

Always:
- Use IF NOT EXISTS
- Put user_id first in composite indexes
- Add indexes in same block as CREATE/ALTER TABLE

Standard indexes to always add:
- Every foreign key column
- Every filter column (status, is_sold, etc)
- Every sort column (created_at, scheduled_at)
- Every lookup column (phone, email, twilio_sid)

## RULE 5: NEVER BREAK EXISTING FUNCTIONALITY
Before making any changes:
1. Read all relevant files first
2. Identify what is already working
3. Make surgical changes only
4. Never rewrite working code from scratch
5. If full rewrite needed explain why and
   wait for confirmation before proceeding

## RULE 6: SQL CONFIRMATION
Never assume SQL has been run in Supabase.
When task requires database changes:
1. Output all SQL clearly labeled
2. Tell me to run it in Supabase SQL editor
3. Wait for my confirmation before writing
   any code that depends on new columns or tables

## RULE 7: MASTER TWILIO ONLY
Never add per-user Twilio credentials.
All SMS sending uses master credentials:
- process.env.TWILIO_ACCOUNT_SID
- process.env.TWILIO_AUTH_TOKEN
From number comes from user's phone_numbers
table record only.
Never read Twilio credentials from user_profiles.

## RULE 8: DATABASE COLUMN NAMES
The leads table uses these exact column names:
- 'phone' NOT 'phone_number'
- 'user_id' for owner
- 'bucket_id' for bucket assignment
- 'is_sold' for sold status
- 'is_blocked' for blocked status
- 'is_cold' for cold status
- 'autopilot' for autopilot toggle
Always verify column names before writing
queries against existing tables.

## RULE 9: AFTER EVERY TASK TELL ME
1. Which files were changed
2. What SQL needs to be run (if any)
3. Whether to push to GitHub now or wait

## QUICK REFERENCE
- Leads page: public/leads.html
- Conversations: public/conversations.html
- Campaigns: public/campaigns.html
- Stats: public/stats.html
- Calendar: public/calendar.html
- Settings: public/settings.html
- Admin: public/admin.html
- Shared JS: public/js/shared.js
- Shared CSS: public/css/shared.css
- Main server: src/server.js
- Database: src/db.js
- Twilio helper: src/twilio.js
- Scheduler: src/scheduler.js
- Auth routes: src/routes/auth.js
- Lead routes: src/routes/leads.js
- Message routes: src/routes/messages.js
- Campaign routes: src/routes/campaigns.js
- Conversation routes: src/routes/conversations.js
- Phone number routes: src/routes/phoneNumbers.js
- Notifications: src/notifications.js

---

# TextApp — Project Context

## What It Is
AI-powered SMS marketing SaaS for sales agents.
Industry agnostic — built for any sales agent.

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
- Telnyx planned for Phase 5 SaaS switch

## Database Notes
- leads table uses 'phone' not 'phone_number'
- All tables have user_id UUID REFERENCES auth.users(id)
- RLS enabled on all tables
- All indexes use user_id as first column in composite

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
- Full qualification flow (8 steps)
- Ghosted lead follow-up logic
- Objection handling built in
- Compliance guardrails
- Agent name + Calendly from user profile
- Smart handoff detection (6 triggers)
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
1. Buckets as colored pill folders (user-created)
2. Lead dropdown actions menu (three-dot)
3. Bulk actions on selected leads
4. Campaigns scoped to initial outreach only
5. Disposition action: move to bucket
6. Mark as Sold → auto moves to Sold bucket
7. Status auto-update system
8. Commission tracking + earnings dashboard
9. Toast notification system
10. Lead card quick actions (always visible)
11. Analytics dashboard rebuild
12. Skeleton loading screens
13. Remove all hardcoded personal data

## Phase 5 SaaS Checklist
- Telnyx ISV + subaccounts per user
- Programmatic A2P brand/campaign registration
- Stripe subscriptions + SMS credit system
- Super admin revenue dashboard
- Agent impersonation for support
- Redis + Bull job queue
- Sentry error monitoring
- Staging environment
- Google Calendar sync
- Zapier webhook for lead auto-import
- Sales pipeline Kanban view
- Mobile app (React Native or PWA)
- White label option
- Team accounts (agency owner + agents)
- Global search (Command+K)
- Dark mode
- Bulk message blast feature
- Product website with pricing page
