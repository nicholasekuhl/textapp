# Claude Rules — Read Before Every Task

Read and follow ALL of these rules for every
task in this session without exception.
These rules take priority over everything else.

## RULE 0: READ FILES SELECTIVELY
Read ONLY the specific files mentioned in
each task. Do not read the entire codebase
unless explicitly asked to.
Only read additional files if directly
needed to complete the specific task.

## RULE 1: NO PERSONAL OR SPECIFIC DATA
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

## RULE 2: FILE ORGANIZATION
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
- public/lead.html (lead profile page)

Shared code lives in:
- public/js/shared.js (sidebar, auth, toast,
  notifications, renderSidebar function)
- public/css/shared.css (design system,
  CSS variables)
- public/toast.js

SIDEBAR RULE:
The sidebar is rendered via renderSidebar()
in public/js/shared.js and injected into
every page. Never hardcode sidebar HTML
in individual page files. If adding new
nav items update shared.js only.

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

## RULE 3: DATABASE PERFORMANCE
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

## RULE 4: NEVER BREAK EXISTING FUNCTIONALITY
Before making any changes:
1. Read all relevant files first
2. Identify what is already working
3. Make surgical changes only
4. Never rewrite working code from scratch
5. If full rewrite needed explain why
   and wait for confirmation

## RULE 5: SQL CONFIRMATION
Never assume SQL has been run in Supabase.
When task requires database changes:
1. Output all SQL clearly labeled
2. Tell me to run it in Supabase SQL editor
3. Wait for my confirmation before writing
   any code that depends on new columns or tables

## RULE 6: MASTER TWILIO ONLY
Never add per-user Twilio credentials.
All SMS sending uses master credentials:
- process.env.TWILIO_ACCOUNT_SID
- process.env.TWILIO_AUTH_TOKEN
From number comes from user's phone_numbers
table record only.
Never read Twilio credentials from user_profiles.
FORWARDING_NUMBER = process.env.FORWARDING_NUMBER
Used only for agent notification texts.

## RULE 7: DATABASE COLUMN NAMES
The leads table uses these exact column names:
- 'phone' NOT 'phone_number'
- 'zip_code' NOT 'zip'
- 'user_id' for owner
- 'bucket_id' for bucket assignment
- 'is_sold' for sold status
- 'is_blocked' for blocked status
- 'is_cold' for cold status
- 'autopilot' for autopilot toggle
- 'first_message_sent' for compliance footer
- 'engagement_status' for ghost tracking
- 'product' NOT 'plan_type'

The conversations table has these columns:
- 'is_starred' for favorites
- 'needs_agent_review' for handoff flag
- 'handoff_reason' for handoff type
- 'consecutive_followups' for follow-up count
- 'appointment_confirmed' boolean
- 'appointment_id' FK to appointments
- 'last_inbound_at' timestamp
- 'last_outbound_at' timestamp
- 'followup_count' integer
- 'followup_stage' text
- 'scheduled_followup_at' timestamp
- 'engagement_status' text
- 'quote_push_count' integer
- 'unread_count' integer

Always verify column names before writing
queries against existing tables.

## RULE 8: VISUAL CONSISTENCY
All new UI components must use existing
CSS variables from shared.css.
Never hardcode colors, shadows, or border radius.

Always use:
- var(--color-primary) not #6366f1
- var(--shadow-md) not box-shadow: 0 4px...
- var(--radius-md) not border-radius: 10px
- var(--color-border) not #e2e8f0
- var(--color-text-secondary) not #475569
- var(--space-4) not padding: 16px

New cards: white bg, shadow-md, radius-md
New buttons: use .btn-primary or .btn-secondary
New badges: use .badge class with color modifier
New modals: use existing .modal class structure
New tables: use existing .table class structure

If a new component needs a style not in shared.css
add it to shared.css as a reusable class.
Never add one-off inline styles.

## RULE 9: AI SYSTEM PROMPT RULES
When modifying the AI system prompt in
src/controllers/messagesController.js:

Always inject known lead data BEFORE conversation
history so the AI never re-asks for info already
known:
- lead.first_name, last_name, phone
- lead.zip_code, state, email, date_of_birth
- Mark fields as 'unknown' if null

Always use agent_nickname if set, otherwise
first name from agent_name.split(' ')[0]

Never use agent full name in casual conversation.

After appointment confirmed the AI must stop
qualifying — send one closing message maximum.

AI response delay: 8-15 seconds random before
sending (already implemented — do not remove).

## RULE 10: AFTER EVERY TASK TELL ME
1. Which files were changed
2. What SQL needs to be run (if any)
3. Whether to push to GitHub now or wait

## QUICK REFERENCE — FILE LOCATIONS
Frontend pages:
- Leads: public/leads.html
- Conversations: public/conversations.html
- Campaigns: public/campaigns.html
- Stats: public/stats.html
- Calendar: public/calendar.html
- Settings: public/settings.html
- Admin: public/admin.html
- Lead profile: public/lead.html

Shared:
- JS utilities: public/js/shared.js
- CSS design system: public/css/shared.css
- Toast system: public/toast.js

Backend:
- Server entry: src/server.js
- Database: src/db.js
- Twilio helper: src/twilio.js
- Scheduler: src/scheduler.js
- Notifications: src/notifications.js
- Send limits: src/sendLimits.js
- Spintext: src/spintext.js

Routes (src/routes/):
auth.js, leads.js, messages.js, campaigns.js,
conversations.js, dispositions.js, templates.js,
tasks.js, appointments.js, phoneNumbers.js,
stats.js, notifications.js, scheduledMessages.js,
buckets.js

Controllers (src/controllers/):
One per route, same naming convention.

## QUICK REFERENCE — KEY PATTERNS

Creating a notification:
createNotification(userId, type, title, body,
  leadId, conversationId)
Types: 'inbound_message', 'hot_lead', 'lead_ghosted'

Sending SMS (always use master credentials):
sendSMS(to, body, fromNumber)
fromNumber comes from phone_numbers table

Checking business hours:
Use lead's timezone from leads.timezone
Business hours: 9am-8pm lead's local time

Engagement status values:
'active', 'ghosted_mid', 'positive_ghosted',
'dormant'

Handoff reason values:
'appointment_confirmed', 'quote_requested',
'complex_medical', 'frustration_detected',
'qualification_complete', 'consecutive_followups',
'positive_ghosted', 'unresponsive_after_followups'

Follow-up stages:
'none', 'stage1', 'stage2', 'scheduled',
'stage3', 'stage4'