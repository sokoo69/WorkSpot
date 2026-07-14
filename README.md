# WorkSpot

**Find and book co-working spaces across Bangladesh — private rooms, shared desks, meeting rooms, and conference halls, all in one place.**

A production-grade, full-stack booking platform built to demonstrate real-world engineering: role-based authorization, live availability via WebSockets, sandboxed payments, KYC-gated trust signals, and a design system built from scratch rather than a template.

🔗 **Live Demo:** 

---

## Screenshots

*(Add 3-4 screenshots or a short GIF here — Home page, Explore/filter page, Booking flow, and Dashboard are the strongest ones to lead with.)*

---

## Why This Project

Most "listing app" portfolio projects stop at CRUD — list an item, view an item, delete an item. WorkSpot goes further: it's a working two-sided marketplace where a **booker** and a **space owner** need to actually transact, trust each other, and communicate — which forced real decisions around authorization boundaries, real-time state, payment status, and identity verification, not just database schemas.

---

## Key Features

### For anyone browsing
- Search, filter (category, city, price range, capacity), and sort a live space catalog
- Publicly viewable space details — gallery, specs, reviews — no login wall on discovery
- Interactive map view alongside the standard grid/list view

### For a logged-in user
- Book a space with live conflict prevention — already-booked time slots are greyed out and rejected server-side, not just hidden client-side
- Real-time availability updates via WebSockets (Pusher) — if someone else books a slot while you're viewing the page, it updates instantly, no refresh
- Sandboxed payment flow (SSLCommerz) — a booking moves through `pending → paid → confirmed`, with a generated PDF invoice on completion
- Direct in-app chat with the space owner tied to a specific booking
- Email notifications (Resend) on booking confirmation and cancellation — fire-and-forget, so a flaky email provider never blocks a booking from completing
- Favorite spaces, leave reviews, manage upcoming/past bookings

### For a space owner (any user becomes one the moment they list a space — no separate signup)
- Full CRUD on their own listings, enforced server-side (an owner cannot delete or view another owner's private management data, even via direct API calls)
- A "Booking Requests" view showing exactly who booked their space and how to reach them (contact info is relationship-scoped — never exposed on public pages)
- Revenue and occupancy analytics scoped to their own spaces
- Optional KYC verification (NID submission → admin review → "Verified" badge) — a real trust signal, not an automatic one based on activity

### For an admin
- One unified `/dashboard` — no separate admin panel to navigate to; admin capabilities appear as additional tabs on the same page every user sees
- Platform-wide analytics: user growth, booking conversion, category distribution
- User and space moderation with cascade-safe deletes (deleting a user removes their listings; an admin cannot delete another admin, and cannot delete themself)
- KYC review queue — approve/reject verification requests with a reason, which triggers an email to the applicant

### Cross-cutting
- Full Bangla/English UI toggle
- WCAG-conscious: keyboard-navigable, visible focus states, `prefers-reduced-motion` respected
- Zero placeholder/lorem-ipsum content — every seed listing, testimonial, and FAQ entry is written for this specific product and market

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Single codebase for frontend + backend, server components for data-heavy pages |
| Language | TypeScript (strict) | Type safety across API boundaries and MongoDB documents |
| Styling | Tailwind CSS | Custom design tokens (a 3-color palette + neutrals) rather than a component library's defaults |
| Charts | Recharts | Dashboard analytics, revenue/occupancy visualizations |
| Database | MongoDB Atlas | Document model fits the variable shape of space listings/amenities well |
| Auth | Better Auth (JWT plugin, EdDSA/JWKS) | Modern session handling without hand-rolling JWT signing or password hashing |
| Real-time | Pusher (Channels) | Live slot availability + owner↔booker chat, no polling |
| Payments | SSLCommerz (sandbox) | Bangladesh-native payment gateway, tested end-to-end in sandbox mode |
| Email | Resend | Transactional email for booking and KYC events |
| i18n | next-intl | Full Bangla/English routing and translation |
| Forms/validation | react-hook-form + Zod | Shared validation logic between client UX and API safety |

---

## Architecture Notes

**Authorization is enforced at every layer, not just the UI.** Every "can this user do X" check exists twice: once to drive what's shown in the interface, and again inside the API route itself. Hiding a delete button is not access control — the delete endpoint independently verifies ownership (or admin role) before touching the database. This was deliberately audited and tightened during development rather than assumed correct.

**Roles are minimal by design.** There are only two roles in the system — `user` and `admin`. There's no separate "owner" account type: any user becomes the de facto owner of a space the moment they create one, and `/spaces/manage` simply scopes to `ownerId === current user`. This avoids a whole class of role-sync bugs that a three-tier system would introduce for little real benefit.

**The admin experience is not a separate app.** Early in development, admin functionality lived at a separate `/admin` route. It was deliberately merged into the same `/dashboard` every user sees, with admin-only tabs rendered conditionally — closer to how tools like GitHub or Vercel actually structure account vs. org-level views, and it removes an entire category of "which URL am I supposed to be on" navigation bugs.

**Trust signals are earned, not inferred.** A "Verified" badge is not calculated from a rating average or listing count — it only appears after a real admin approves a submitted KYC request. This was a deliberate product decision: an automatic badge based on activity is a vanity metric; a reviewed one is an actual trust signal.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (this project only connects to a cloud `mongodb+srv://` URI — no local MongoDB setup is supported)
- Accounts (free tiers work) for: Better Auth (self-hosted, no external account needed), Pusher, Resend, and SSLCommerz sandbox

### Installation

```bash
git clone <this-repo-url>
cd workspot
npm install
```

### Environment variables

Copy `.env.local.example` to `.env.local` and fill in your own values:

```bash
cp .env.local.example .env.local
```

See `.env.local.example` for the full list — it's kept in sync with everything the app actually reads, grouped by which feature each variable belongs to (core, payments, real-time, email, i18n).

### Seed the database

```bash
npm run seed
```

This creates a demo user, an admin user, ~20 realistic space listings across Dhaka, Chittagong, and Sylhet, and sample bookings — so the app isn't empty on first load.

### Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| User (Demo) | `demo@workspot.com` | `Demo@1234` |
| Admin | `admin@workspot.com` | `Admin@1234` |

A "Demo Login" button on the login page signs in as the demo user instantly, no typing required.

---

## Roles & Permissions

| Capability | Anonymous | User | Admin |
|---|:---:|:---:|:---:|
| Browse & search spaces | ✅ | ✅ | ✅ |
| Book a space | ❌ | ✅ | ✅ |
| List a space (become an owner) | ❌ | ✅ | ✅ |
| Manage/delete own spaces | ❌ | ✅ | ✅ |
| Submit KYC verification | ❌ | ✅ | ✅ |
| View/manage all users | ❌ | ❌ | ✅ |
| Delete any space | ❌ | ❌ | ✅ |
| Approve/reject KYC requests | ❌ | ❌ | ✅ |
| Platform-wide analytics | ❌ | ❌ | ✅ |

---

## Project Structure

```
src/
  app/            # Next.js App Router — pages + API routes
  components/     # Reusable UI (layout, cards, forms, dashboard widgets)
  lib/            # Auth config, DB connection, email/Pusher helpers
  models/         # Mongoose schemas (Space, Booking, VerificationRequest)
  types/          # Shared TypeScript types
scripts/
  seed.ts         # Database seeding script
```

---

## What's Built vs. What's Planned

This project was scoped in phases, building the required core first, then layering on production-style features:

- ✅ Core booking platform (auth, listings, search/filter, booking, reviews)
- ✅ Role-based dashboard with admin moderation tools
- ✅ Real-time availability and chat (Pusher)
- ✅ Sandboxed payments and PDF invoicing (SSLCommerz)
- ✅ KYC verification flow with admin review queue
- ✅ Bangla/English internationalization
- 🔜 Recurring bookings / waitlist for fully-booked slots (not yet built)

---

## Author

**Shawon** — Full-Stack Developer
🌐 [saykot.dev](https://saykot.dev)
💻 [github.com/sokoo69](https://github.com/sokoo69)
✉️ contact@saykot.dev

Built as a technical assessment project, extended well past the original scope as a demonstration of production-level engineering practices: server-side authorization, real-time systems, and payment integration on top of a genuinely reusable component architecture.