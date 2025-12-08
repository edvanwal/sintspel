# useReducer Migration Guide

## Probleem
De component had 23 useState hooks, wat leidde tot:
- ❌ Moeilijk te volgen state updates
- ❌ Veel losse setState calls verspreid door code
- ❌ Lastig te testen
- ❌ State updates kunnen inconsistent zijn

## Oplossing
Gebruik useReducer voor gerelateerde state groepen.

## Status: 🚧 In Progress

### ✅ Gedaan
1. **Reducers gemaakt** (`src/reducers.js`):
   - `gameReducer`: score, showTransition, isFlipped, timeLeft, timerActive
   - `alarmReducer`: alle alarm/wekker gerelateerde state (9 items)

2. **Reducers geïntegreerd** in app.jsx:
   ```javascript
   // Voor: 14 useState hooks
   const [score, setScore] = useState(0);
   const [showTransition, setShowTransition] = useState(null);
   const [isFlipped, setIsFlipped] = useState(false);
   // ... etc

   // Na: 2 useReducer hooks
   const [gameState, gameDispatch] = useReducer(gameReducer, gameInitialState);
   const [alarmState, alarmDispatch] = useReducer(alarmReducer, alarmInitialState);
   ```

### 🚧 TODO (Volgende Stap)
De setState calls moeten vervangen worden door dispatch actions:

#### Game State Updates

**Score updates:**
```javascript
// Voor:
setScore(score + 1);
setScore(0);

// Na:
gameDispatch({ type: 'INCREMENT_SCORE' });
gameDispatch({ type: 'RESET_SCORE' });
```

**Transition updates:**
```javascript
// Voor:
setShowTransition('success');
setShowTransition('wrong');
setShowTransition(null);

// Na:
gameDispatch({ type: 'SET_TRANSITION', payload: 'success' });
gameDispatch({ type: 'SET_TRANSITION', payload: 'wrong' });
gameDispatch({ type: 'SET_TRANSITION', payload: null });
```

**Flip updates:**
```javascript
// Voor:
setIsFlipped(!isFlipped);
setIsFlipped(false);

// Na:
gameDispatch({ type: 'FLIP_CARD' });
gameDispatch({ type: 'RESET_FLIP' });
```

**Timer updates:**
```javascript
// Voor:
setTimeLeft(10);
setTimerActive(true);
setTimeLeft(timeLeft - 1);
setTimerActive(false);
setTimeLeft(null);

// Na:
gameDispatch({ type: 'START_TIMER', payload: 10 });
gameDispatch({ type: 'TICK_TIMER' });
gameDispatch({ type: 'STOP_TIMER' });
gameDispatch({ type: 'RESET_TIMER' });
```

#### Alarm State Updates

**Max time:**
```javascript
// Voor:
setAlarmMaxTime(10);

// Na:
alarmDispatch({ type: 'SET_MAX_TIME', payload: 10 });
```

**Start/Stop:**
```javascript
// Voor:
setAlarmTimeLeft(randomSeconds);
setAlarmActive(true);
setAlarmPaused(false);
setAlarmTriggered(false);

// Na:
alarmDispatch({ type: 'START_ALARM', payload: randomSeconds });
```

**Countdown:**
```javascript
// Voor:
setAlarmTimeLeft(alarmTimeLeft - 1);

// Na:
alarmDispatch({ type: 'TICK_ALARM' });
```

**Control:**
```javascript
// Voor:
setAlarmPaused(true);
setAlarmPaused(false);

// Na:
alarmDispatch({ type: 'PAUSE_ALARM' });
alarmDispatch({ type: 'RESUME_ALARM' });
```

**Reset:**
```javascript
// Voor:
setAlarmActive(false);
setAlarmPaused(false);
setAlarmTimeLeft(null);
setAlarmTriggered(false);
setGameLocked(false);

// Na:
alarmDispatch({ type: 'RESET_ALARM' });
```

**Trigger:**
```javascript
// Voor:
setAlarmActive(false);
setAlarmTriggered(true);
setGameLocked(true);

// Na:
alarmDispatch({ type: 'TRIGGER_ALARM' });
```

**UI States:**
```javascript
// Voor:
setShowAlarmQuestion(false);
setAlarmEnabled(true);
setShowAlarmMinimized(false);

// Na:
alarmDispatch({ type: 'ENABLE_ALARM' });
alarmDispatch({ type: 'DISABLE_ALARM' });
alarmDispatch({ type: 'MINIMIZE_ALARM' });
alarmDispatch({ type: 'SHOW_ALARM' });
```

## Locaties die geüpdatet moeten worden

Zoek in `src/app.jsx` naar:
- `setScore` (5 locaties)
- `setShowTransition` (4 locaties)
- `setIsFlipped` (4 locaties)
- `setTimeLeft` (3 locaties)
- `setTimerActive` (3 locaties)
- `setAlarmMaxTime` (6 locaties)
- `setAlarmTimeLeft` (2 locaties)
- `setAlarmActive` (5 locaties)
- `setAlarmPaused` (4 locaties)
- `setAlarmTriggered` (3 locaties)
- `setGameLocked` (3 locaties)
- `setShowAlarmQuestion` (2 locaties)
- `setAlarmEnabled` (2 locaties)
- `setShowAlarmMinimized` (4 locaties)

## Voordelen na migratie

✅ **Betere leesbaarheid**: State logic is centraal
✅ **Makkelijker testen**: Reducers zijn pure functies
✅ **Atomische updates**: Meerdere state changes in één actie
✅ **Beter debuggen**: Actions zijn benoemd en traceerbaar
✅ **Voorkomt bugs**: Geen vergeten setState calls
✅ **Consistentie**: State updates volgen vaste patronen

## Testing

Na migratie, test:
1. ✅ Score tellen werkt (0 → 1 → 2 → 3)
2. ✅ Flip animatie werkt
3. ✅ Timer countdown werkt
4. ✅ Alarm start/pause/reset werkt
5. ✅ Alle transitions werken (wrong/success)

## Stats

- **Van**: 23 useState hooks → **Naar**: ~9 useState + 2 useReducer
- **Reductie**: 14 states gecombineerd in reducers (60% minder)
- **Complexity**: Significant lager
