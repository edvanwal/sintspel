// ==========================================
// UI TEKSTEN CONSTANTS
// ==========================================
// Alle gebruikersgerichte teksten op één plek voor:
// - Makkelijk onderhoud
// - Consistentie
// - Toekomstige i18n support

const UI_TEKSTEN = {
    // Algemeen
    TITEL: '🎅 SINTERKLAAS QUIZ 🎁',
    TIP_BESTURING: 'Tip: Gebruik pijltjestoetsen, spatiebalk of swipe!',

    // Speler info
    BEURT_VAN: 'Beurt van:',
    SCORE_LABEL: 'Score:',
    PUNTEN: 'punten',

    // Vraag/Antwoord
    BEKIJK_ANTWOORD: 'Bekijk antwoord',
    ANTWOORD_LABEL: 'Antwoord:',
    GOED_KNOP: '✅ Goed',
    FOUT_KNOP: '❌ Fout',
    VOLGENDE_SPELER: 'Volgende speler ➜',

    // Score
    SCORE_FORMAT: (correct, totaal) => `${correct}/${totaal} goed`,

    // Spel uitleg
    HOE_SPEEL_JE: 'HOE SPEEL JE?',
    UITLEG_PAKJE: 'Een pakje met wekker erin gaat rond',
    UITLEG_VRAGEN: 'Beantwoord de vragen',
    UITLEG_GOED: 'GOED? Ga door (max 3)',
    UITLEG_FOUT: 'FOUT of 3 goed? Geef pakje door naar LINKS',
    UITLEG_SWIPE: 'Vraag niet geschikt voor een deelnemer? Swipe links',
    UITLEG_WINNAAR: 'Wie het pakje heeft als de wekker afgaat, WINT!',
    START_SPEL: 'START HET SPEL!',

    // Speler registratie
    VOEG_SPELERS_TOE: 'Voeg minimaal 2 spelers toe',
    NAAM_LABEL: 'Naam:',
    NAAM_PLACEHOLDER: 'Naam van speler',
    LEEFTIJD_LABEL: 'Leeftijd:',
    LEEFTIJD_PLACEHOLDER: 'Leeftijd',
    VOEG_SPELER_TOE: 'Voeg speler toe',
    ANNULEER: 'Annuleer',
    NIEUWE_SPELER: '+ Nieuwe speler',
    SPELERS_TOEGEVOEGD: (aantal) => `${aantal} spelers toegevoegd`,
    START_MET_SPELERS: (aantal) => `Start met ${aantal} spelers`,

    // Transities
    FOUT_TITEL: 'HELAAS!',
    FOUT_BERICHT: 'Je antwoord was niet helemaal correct',
    GEEF_PAKJE_DOOR: 'GEEF HET PAKJE DOOR',
    NAAR_LINKS: 'NAAR LINKS',
    DRIE_GOED_TITEL: 'JE HEBT ER 3 GOED!',
    DRIE_GOED_BERICHT: 'GEEF HET PAKJE DOOR NAAR LINKS!',

    // Winnaar selectie
    TIJD_OM_TE_KIEZEN: 'TIJD OM TE KIEZEN!',
    WIE_KRIJGT_PAKJE: 'Wie heeft het pakje als de wekker afging?',
    KIES_WINNAAR: 'Kies de winnaar:',
    BEVESTIG_KEUZE: 'BEVESTIG KEUZE',

    // Winnaars
    GEFELICITEERD: 'GEFELICITEERD!',
    DE_SINTERKLAAS: 'DE SINTERKLAAS',
    PAKJE_GEWONNEN: '(Heeft het pakje!)',
    SLIMME_PIETEN_TITEL: 'DE SLIMME PIETEN',
    SLIMME_PIETEN_BESCHRIJVING: '(Meeste vragen goed!)',
    SPEEL_OPNIEUW: 'SPEEL OPNIEUW',

    // Wekker
    WEKKER_TITEL: '⏰ WEKKER',
    WEKKER_VRAAG: 'Wil je de wekker op je telefoon gebruiken?',
    WEKKER_UITLEG: 'De wekker gaat op een willekeurige tijd af (onbekend voor iedereen).',
    JA: 'Ja',
    NEE: 'Nee',
    MAX_TIJD_LABEL: 'Max. tijd (minuten):',
    START_WEKKER: '🚀 START WEKKER',
    MINIMALISEER: 'Minimaliseer',
    PAUZEER: '⏸️ Pauzeer',
    HERVAT: '▶️ Hervat',
    RESET: '🔄 Reset',
    STOP: '⏹️ Stop',
    GEPAUZEERD: '⏸️ GEPAUZEERD',
    WEKKER_INFO: (min, max) => `De wekker gaat af tussen ${min} en ${max} minuten.`,

    // Wekker validatie
    MIN_BEREIKT: '⚠️ Minimum bereikt: Minimaal 1 minuut nodig',
    MAX_BEREIKT: '⚠️ Maximum bereikt: Max. 60 minuten (1 uur) voor beste ervaring',
    VERLAAG_TIJD: 'Verlaag tijd met 1 minuut',
    VERHOOG_TIJD: 'Verhoog met 1 minuut',
    MIN_TOOLTIP: 'Minimum: 1 minuut',
    MAX_TOOLTIP: 'Maximum: 60 minuten (1 uur)',
    MIN_ARIA: 'Minimum bereikt: 1 minuut',
    MAX_ARIA: 'Maximum bereikt: 60 minuten',

    // Wekker afgegaan
    TIJD_IS_OM: 'DE TIJD IS OM!',
    WEKKER_AFGEGAAN: 'De wekker is afgegaan! 🔔',
    KIES_WINNAAR_NU: 'Kies nu wie het pakje heeft',

    // Aria labels
    ARIA_OPEN_WEKKER: 'Open wekker',
    ARIA_BEKIJK_ANTWOORD: 'Bekijk het antwoord op de vraag',
    ARIA_ANTWOORD_FOUT: 'Antwoord was fout',
    ARIA_ANTWOORD_GOED: 'Antwoord was goed',
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI_TEKSTEN };
}
