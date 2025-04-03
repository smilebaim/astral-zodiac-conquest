# Astral Zodiac Conquest

A strategic game where players build and expand their zodiac-based kingdoms in a cosmic setting.

## Features

- Choose your zodiac sign and build your cosmic empire
- Strategic resource management
- Battle system with unique zodiac abilities
- Council system for alliance management
- Real-time updates using Supabase

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn-ui
- Supabase (Backend & Auth)
- React Query (Data Management)
- Framer Motion (Animations)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd astral-zodiac-conquest
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Database Schema

The application uses the following main tables:

### Kingdoms
- Stores player kingdoms and their resources
- Contains army, buildings, and research data
- Linked to user accounts and zodiac signs

### Battles
- Records battle history and outcomes
- Tracks attacker and defender information
- Stores battle results and timing

### Councils
- Manages alliances between kingdoms
- Tracks council resources and members
- Handles council roles and permissions

## Development

### Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── data/          # Static data
├── hooks/         # Custom React hooks
├── integrations/  # Third-party integrations
│   └── supabase/  # Supabase configuration
├── lib/           # Utility functions
├── pages/         # Page components
└── types/         # TypeScript type definitions
```

### Supabase Integration

The application uses Supabase for:
- User authentication
- Real-time data synchronization
- Database operations
- Row-level security

### Available Hooks

- `useKingdom`: Fetch kingdom data
- `useCreateKingdom`: Create a new kingdom
- `useUpdateKingdom`: Update kingdom data
- `useBattle`: Fetch battle data
- `useCreateBattle`: Create a new battle
- `useCouncil`: Fetch council data
- `useCreateCouncil`: Create a new council
- `useKingdomSubscription`: Subscribe to kingdom updates

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
