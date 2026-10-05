# HAQEX – Courier & Logistics Platform Frontend

HAQEX is a modern courier and logistics management platform built with Next.js. It provides a customer-facing shipping experience, courier operations workflows, and admin dashboards for monitoring logistics activity, payments, analytics, and user operations.

## Overview

This frontend app includes:

- Public marketing pages for the logistics brand
- Shipment tracking and status management
- Customer shipment creation and payment flow
- Courier dashboard with shipment history and delivery workflow
- Admin analytics, users, hubs, reports, and finance monitoring
- Authentication and role-based access control
- Responsive UI using Next.js, React, TypeScript, and Tailwind CSS

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui style components
- TanStack React Query
- Recharts for analytics dashboards
- Google OAuth integration
- Zod validation

## Project Structure

```bash
src/
├── app/                  # App router pages and route groups
│   ├── (public)/         # Marketing, auth, payment, tracking pages
│   ├── (dashboard)/      # Customer, courier, and admin dashboards
│   └── layout.tsx
├── components/           # Reusable UI and dashboard components
├── hooks/                # Data fetching and custom hooks
├── lib/                  # Shared utilities and helpers
├── providers/            # App providers
├── types/                # Type definitions
├── validation/           # Zod schemas and validation
└── api/                  # API clients and service helpers
```

## Prerequisites

- Node.js 20+
- npm
- A running backend API for shipment, auth, and payment data

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ZisanUlHaque/HAQEX.git
cd courier-and-logistics-platform-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Update `.env` with your project values:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Running the App

### Development mode

```bash
npm run dev
```

Then open: http://localhost:3000

### Production build

```bash
npm run build
npm run start
```

## Available Scripts

```bash
npm run dev      # Start the Next.js development server
npm run build    # Create a production build
npm run start    # Run the production build
npm run lint     # Run Biome lint checks
npm run format   # Format the project with Biome
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend API |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID used for login |

## Notes

- This repository is the frontend application only.
- A compatible backend API must be running for customer, courier, and admin data to be available.
- The project uses route groups and role-based app structure for customer, courier, and admin experiences.

## License

This project is currently for educational and assignment use.
