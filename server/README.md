# AllRentr Chat Server

WebSocket server for real-time chat functionality in AllRentr.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `server` directory with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
WS_PORT=8080
```

**Important**: The `.env` file is gitignored for security. Create it manually in the `server` directory.

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Environment Variables

- `VITE_SUPABASE_URL` or `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
- `WS_PORT`: Port for the WebSocket server (default: 8080)

## Client Configuration

In your frontend `.env` file, add:
```
VITE_WS_URL=ws://localhost:8080
```

For production, update to your WebSocket server URL:
```
VITE_WS_URL=wss://your-chat-server-domain.com
```

## Features

- Real-time messaging via WebSocket
- Typing indicators
- Read receipts
- Contact request/approval flow
- Automatic reconnection
- Message persistence in Supabase

## Security

- All connections require JWT authentication
- Users can only access conversations they're part of
- Row Level Security (RLS) policies enforced in database

