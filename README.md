# 🎁 Sinterklaas Quiz

Een interactieve quiz-game voor de hele familie tijdens Sinterklaas! Met 255 vragen over Sinterklaas, Nederland, en de Kerstman.

![Version](https://img.shields.io/badge/version-14.0-blue)
![Tests](https://img.shields.io/badge/tests-126%20passing-success)
![Build](https://img.shields.io/badge/build-passing-success)

## ✨ Features

- 🎯 **255 vragen** verdeeld over verschillende categorieën
- 👥 **Multiplayer support** met score tracking
- ⏰ **Timer functionaliteit** voor extra spanning
- 🔊 **Geluid effecten** (kan gedempt worden)
- 📱 **Responsive design** - werkt op desktop, tablet en mobiel
- 🎨 **Smooth animaties** met Framer Motion
- 💾 **Progress tracking** via localStorage

## 🚀 Quick Start

### Development

```bash
# Installeer dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Run tests
npm test

# Run tests in CI mode
npm run test:run

# Check code quality
npm run lint
```

### Production Build

```bash
# Build voor productie
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
sintspel/
├── src/
│   ├── components/          # React componenten
│   │   ├── QuestionCard.jsx
│   │   ├── AnswerCard.jsx
│   │   ├── PlayerInfo.jsx
│   │   └── ... (meer componenten)
│   ├── FlashCardQuiz.jsx    # Hoofd component
│   ├── main.jsx             # Entry point
│   ├── questions.js         # 255 quiz vragen
│   ├── utils.js             # Utility functies
│   ├── strings.js           # UI teksten
│   ├── sounds.js            # Audio logica
│   └── reducers.js          # State reducers
├── tests/                   # Unit tests (126 tests)
├── public/                  # Static assets
└── dist/                    # Build output (generated)
```

## 🧪 Testing

Het project heeft **126 passing tests** met focus op:

- ✅ Utility functies (shuffling, color mapping, etc.)
- ✅ Player management
- ✅ Alarm system
- ✅ localStorage persistence

```bash
# Run tests in watch mode
npm test

# Run tests once (CI)
npm run test:run

# Generate coverage report
npm run test:coverage

# Interactive test UI
npm run test:ui
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Framer Motion** - Animations
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code quality
- **Husky** - Git hooks
- **Tailwind CSS** - Styling (via CDN)

## 🔒 Quality Assurance

Het project heeft meerdere beveiligingslagen tegen breaking changes:

1. **Pre-commit hooks** - Automatische lint & test checks voor elke commit
2. **GitHub Actions CI/CD** - Geautomatiseerde tests op PRs
3. **ESLint** - Code quality checks (14 warnings, 0 errors)

## 📝 Development Workflow

```bash
# Maak een nieuwe branch
git checkout -b feature/mijn-feature

# Maak changes en commit
# (pre-commit hook draait automatisch lint + tests)
git commit -m "feat: nieuwe feature"

# Push naar remote
git push origin feature/mijn-feature
```

## 🎮 Game Modes

### Single Player
- Swipe door de vragen met pijltjestoetsen of touch gestures
- Druk op spatie om antwoord te bekijken
- Houd score bij

### Multiplayer
- Voeg spelers toe in het startscherm
- Automatische rotatie tussen spelers
- Score tracking per speler
- Winnaar selectie

### Timer Mode
- Optionele timer per vraag
- Alarm functie voor extra spanning
- Audio feedback bij juiste/foute antwoorden

## 🚢 Deployment

### Netlify / Vercel

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables (optioneel)
# Geen environment variables nodig voor basis deployment
```

### Manual Deployment

```bash
# Build het project
npm run build

# Upload de dist/ folder naar je hosting provider
```

## 🎨 Toekomstige Thema's

De architectuur is voorbereid voor eenvoudige thema-varianten:

- 🎄 **Kerst Quiz** - December thema
- 🐰 **Paas Quiz** - Pasen thema
- 🎃 **Halloween Quiz** - Oktober thema

Elk thema kan zijn eigen:
- Kleuren schema
- Vragenset
- UI teksten
- Emoji's en styling

## 📊 Performance

- **Bundle size**: 338KB (107KB gzipped)
- **First load**: < 1s op 4G
- **Lighthouse score**: 90+ (performance)

## 🤝 Contributing

1. Clone de repository
2. Maak een feature branch
3. Maak je changes
4. Run `npm test` en `npm run lint`
5. Commit met beschrijvende message
6. Push en maak een PR

## 📄 License

Private project - All rights reserved

## 🙋 Support

Voor vragen of problemen, open een issue in de GitHub repository.

---

**Gemaakt met ❤️ voor Sinterklaas 2024**
