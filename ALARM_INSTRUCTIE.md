# 🔔 Alarm Geluid Bestand Nodig

## Bestand dat toegevoegd moet worden:

**Bestandsnaam:** `Alarm_clock.mp3`

**Locatie:** Root directory van het project (naast de andere .mp3 bestanden)

```
/home/user/sintspel/
├── index.html
├── Goed.mp3
├── Fout.mp3
├── Timer.mp3
├── TimeUp.mp3
└── Alarm_clock.mp3  ← DIT BESTAND TOEVOEGEN
```

## Beschrijving:

Dit is het geluid dat wordt afgespeeld wanneer de game-wekker afgaat. Het moet een duidelijk alarm/wekker geluid zijn dat aangeeft dat de tijd om is.

## Vereisten:

- Format: MP3
- Lengte: 3-10 seconden
- Type: Alarm/wekker geluid (bijv. klassiek wekkergeluid, bel, sirene, etc.)
- Volume: Ongeveer hetzelfde niveau als de andere geluidsbestanden

## Gebruik in de app:

Het bestand wordt automatisch geladen bij het starten van de app en afgespeeld wanneer:
- De game-wekker 0:00 bereikt
- De wekker niet op pauze staat
- De mute functie niet is ingeschakeld

## Fallback:

Als het bestand niet bestaat, zal de app gewoon doorgaan zonder geluid. Er zal alleen een console waarschuwing verschijnen, maar de functionaliteit blijft werken.
