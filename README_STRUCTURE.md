# Sinterklaas Quiz - Code Structuur

## 📁 Projectstructuur

De code is nu opgesplitst in logische modules voor betere onderhoudbaarheid:

```
sintspel/
├── index.html          # Hoofdbestand - laadt alle modules
├── src/
│   ├── questions.js    # Vragenlijst (255 vragen)
│   ├── utils.js        # Constanten en utility functies
│   ├── sounds.js       # Audio logica
│   └── app.jsx         # React hoofdcomponent
└── index.html.backup   # Backup van origineel bestand
```

## 🗂️ Bestanden

### \`index.html\`
- Bevat HTML structuur en styling
- Laadt alle dependencies (React, Tailwind, Framer Motion)
- Laadt de modules in de juiste volgorde
- Rendert de applicatie

### \`src/questions.js\`
- Bevat de volledige vragenlijst (255 vragen)
- Georganiseerd per type (Kennis, Actie, 2025, Expert, etc.)
- Elke vraag heeft: id, type, difficulty, text, answer

### \`src/utils.js\`
- **COLORS**: Kleurenpalet voor de applicatie
- **GAME_CONSTANTS**: Magic numbers en configuratie
- **swipePower**: Berekening voor swipe detectie
- **variants**: Framer Motion animatie configuratie
- **getTypeColor**: Kleuren per vraagtype
- **shuffleArray**: Array randomisatie functie

### \`src/sounds.js\`
- Audio bestanden initialisatie
- **playSound**: Speel een geluid af
- **startTimerSound**: Start timer geluid (looped)
- **stopTimerAndPlayTimeUp**: Stop timer en speel TimeUp
- **playAlarmSound**: Speel alarm geluid
- **stopAlarmSound**: Stop alarm geluid

### \`src/app.jsx\`
- Hoofdcomponent \`FlashCardQuiz\`
- Alle React state en lifecycle logic
- UI rendering
- Event handlers

## 🔄 Volgorde van laden

1. questions.js - Data eerst
2. utils.js - Utility functies
3. sounds.js - Audio setup
4. app.jsx - Hoofdcomponent

## 📝 Voordelen

✅ Betere leesbaarheid
✅ Makkelijker debuggen
✅ Simpeler uitbreiden
✅ Betere samenwerking

**v13.0** - Refactored (Dec 2025)
