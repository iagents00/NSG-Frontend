# NSG Intelligence - Next.js Migration

Modern, production-ready Next.js application migrated from the legacy NSG.html prototype.

## 🚀 Features

- **Gemini-Native AI**: Powered by Google Gemini 1.5 Flash via Vercel AI SDK
- **Context Caching**: Intelligent caching for system instructions to reduce latency
- **Multi-Role Support**: Consultant, Psychologist, Patient, Manager personas
- **Real-time Streaming**: Edge runtime chat with streaming responses
- **Glassmorphism UI**: Premium design with backdrop-blur and neon effects
- **State Persistence**: Zustand with localStorage for seamless role switching

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google AI API Key ([Get one here](https://aistudio.google.com/app/apikey))

## 🛠️ Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   NEXT_PUBLIC_APP_ENV=development
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 📁 Project Structure

```
NSG/
├── app/
│   ├── api/
│   │   ├── chat/          # Edge runtime chat endpoint
│   │   ├── context/       # Context cache initialization
│   │   └── files/upload/  # File upload for RAG
│   ├── chat/              # Chat page
│   ├── layout.tsx         # Root layout with Sidebar
│   └── page.tsx           # Dashboard
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx
│   ├── dashboard/
│   └── layout/
│       ├── Sidebar.tsx
│       └── DynamicIsland.tsx
├── lib/
│   └── gemini/
│       ├── cacheManager.ts       # Context caching logic
│       └── systemInstructions.ts # Role-specific prompts
├── store/
│   └── useAppStore.ts     # Zustand global state
└── data/
    └── context.ts         # Role configurations
```

## 🎨 Design System

The application uses a custom Tailwind configuration with:

- **Colors**: Navy, Slate, Deep (ultra-dark for Dynamic Island)
- **Shadows**: Glass, Sovereign, Precision, Glow, Island
- **Animations**: Fade-in-up, Slide, Breathing, Spin-process, Text-glow
- **Fonts**: Inter (sans), Plus Jakarta Sans (display), JetBrains Mono (mono)

## 🧠 AI Integration

### Context Caching

The app uses Google AI's Context Caching to store role-specific system instructions:

- **TTL**: 1 hour
- **Model**: gemini-1.5-flash-001
- **Benefit**: Reduced latency and token costs

### Chat Flow

1. User selects a role (Consultant, Psychologist, etc.)
2. App calls `/api/context` to initialize cache (Node.js runtime)
3. Cache name is stored in Zustand
4. Chat messages sent to `/api/chat` (Edge runtime) with streaming
5. Responses stream back in real-time

## 🔧 Key Technologies

- **Framework**: Next.js 16 (App Router)
- **AI**: Vercel AI SDK + @ai-sdk/google
- **State**: Zustand with persistence
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: React Chart.js 2

## 📊 Performance

- **Edge Runtime**: Chat API runs on edge for <100ms latency
- **Context Caching**: System instructions cached to skip token processing
- **Optimistic UI**: Instant feedback, no waiting for AI "thinking"
- **60fps Animations**: GPU-accelerated with `will-change-transform`

## 🚧 Roadmap

- [ ] Implement file upload with RAG (File Search)
- [ ] Add chart components with Generative UI
- [ ] Implement Settings page
- [ ] Add Files/Knowledge Base page
- [ ] Performance monitoring (Lighthouse, Core Web Vitals)
- [ ] Mobile optimization (sidebar drawer, touch gestures)

## 📝 Notes

- The legacy `NSG.html` has been renamed to `NSG_legacy.html` for reference
- Context caching requires the Google Generative AI SDK (server-side only)
- Edge runtime chat uses @ai-sdk/google for streaming

## 🤝 Contributing

This is a migration project. For questions or issues, please refer to the implementation plan.

---

**NSG Intelligence** | Deep Processing v14.6 | Powered by Google Gemini
