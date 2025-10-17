# AI Tinder (Expo + TypeScript)

A Tinder-like swipe app scaffold with Expo. Includes navigation, a Reanimated + Gesture-based swipe deck, and an AI service stub.

## Prereqs
- Node.js 20.19+ recommended (RN 0.81 requires >= 20.19.4). Use `nvm install 20 && nvm use 20`.
- Expo CLI: `npm i -g expo` (optional; `npx expo` also works)

## Install & Run
```
cd ai-tinder
npm start
# or
npm run ios
npm run android
npm run web
```

## Env
Copy `.env.example` to `.env` and fill in values as needed. Expo exposes `EXPO_PUBLIC_*` to the app at build time.

```
EXPO_PUBLIC_OPENAI_API_KEY=your_key
EXPO_PUBLIC_OPENAI_MODEL=gpt-4o-mini
```

## Structure
- `src/navigation/AppNavigator.tsx` – Tabs (Swipe, Matches, Profile) + Chat stack
- `src/screens/SwipeScreen.tsx` – Swipe deck using Reanimated + Gesture
- `src/components/SwipeCard.tsx` – Card UI
- `src/screens/MatchesScreen.tsx` – Simple list with nav to Chat
- `src/screens/ChatScreen.tsx` – Basic chat UI (canned AI response placeholder)
- `src/services/ai.ts` – AI abstraction stub

## Notes
- Reanimated configured via `babel.config.js` (plugin required).
- Gesture handler imported in `index.ts` (must be first).
- Replace sample character images/data with AI-generated content via `src/services/ai.ts`.

## Next
- Hook chat to your backend AI endpoint.
- Persist matches/chats (e.g., SQLite/Realm or backend).
- Add like/nope buttons and profile details modal.
- Add theming and onboarding.
