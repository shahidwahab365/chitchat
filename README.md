# ChitChaat

ChitChaat is a real-time messaging and calling application built with Next.js, Supabase, Clerk, and LiveKit. It supports private chats, contact management, notifications, file and voice-note messaging, and direct audio/video calls with realtime signaling.

## Features

- Real-time one-to-one messaging
- Audio and video calls powered by LiveKit
- Call signaling with ringing, accepted, close, and missed call states
- Contact search, invitations, pending requests, and connections
- Online presence indicators
- File attachments with upload progress
- Voice note recording and playback
- Message previews and downloads for stored attachments
- Notifications for contact and messaging activity
- Authenticated app shell with Clerk
- Supabase-backed data, storage, realtime, and presence
- Responsive, theme-aware interface with reusable UI primitives

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Auth:** Clerk
- **Database and Realtime:** Supabase
- **Calling:** LiveKit
- **State and Data:** Zustand, TanStack Query
- **UI:** Tailwind CSS, Radix UI, Base UI, Lucide icons
- **Forms and Validation:** TanStack Form, Zod
- **Media:** LiveKit Components, react-voice-visualizer, TUS uploads

## Project Structure

```text
src/
  app/             Next.js routes, layouts, API handlers, and webhooks
  components/      Chat, calls, network, notifications, and UI components
  constants/       Shared routes, environment accessors, images, and sounds
  hooks/           React Query hooks and reusable browser hooks
  lib/             Shared utilities and Supabase client setup
  providers/       App-level providers for Supabase, theme, and query client
  services/        Supabase and LiveKit service functions
  store/           Zustand stores for call state and online users
  types/           Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- Supabase project
- Clerk application
- LiveKit project or self-hosted LiveKit instance

### Installation

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

If `.env.example` is not available yet, create `.env.local` manually using the variables below.

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOKS_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app?tab=chat
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/app?tab=chat

NEXT_PUBLIC_STORAGE_BUCKET_NAME=
NEXT_PUBLIC_STORAGE_VOICE_NOTE_BUCKET_NAME=
NEXT_PUBLIC_PROJECT_ID=

NEXT_PUBLIC_LIVEKIT_URL=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

Do not commit real `.env` values. Keep service role keys, Clerk secrets, and LiveKit secrets private.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Call Flow

ChitChaat uses Supabase Realtime for call signaling and LiveKit for the media session.

1. The caller starts an audio or video call.
2. A LiveKit room name is created and broadcast to the callee through Supabase Realtime.
3. The caller stays in the ringing state and does not join LiveKit immediately.
4. The callee receives the room name and sees the incoming call UI.
5. When the callee accepts, both users request their own LiveKit token for the same room name.
6. LiveKit connects both participants into the shared media room.

This keeps signaling and media connection separate: the room is prepared during ringing, while LiveKit connection starts only after acceptance.

## Core Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Webhooks and API Routes

- `src/app/api/webhooks/clerk/route.ts` handles Clerk user events.
- `src/app/api/webhooks/livekit/route.ts` handles LiveKit webhook events.
- `src/app/api/token/live-kit/route.ts` creates LiveKit access tokens.

## Notes

- Supabase Realtime channels are used for messages, calls, notifications, and presence.
- Supabase Storage is used for attachments and voice notes.
- Clerk session tokens are used to authenticate Supabase realtime subscriptions.
- Call state is coordinated through the `use-call-rnd` Zustand store.

