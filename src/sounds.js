// ==========================================
// AUDIO LOGICA
// ==========================================

// Audio setup - Laad geluidsbestanden
let correctSound = null;
let wrongSound = null;
let timerSound = null;
let timeUpSound = null;
let alarmClockSound = null;

// Initialiseer audio bestanden
const initAudio = () => {
    try {
        correctSound = new Audio('Goed.mp3');
        wrongSound = new Audio('Fout.mp3');
        timerSound = new Audio('Timer.mp3');
        timeUpSound = new Audio('TimeUp.mp3');
        alarmClockSound = new Audio('Alarm_clock.mp3');

        console.log('🔊 Audio bestanden aangemaakt:');
        console.log('- Goed.mp3:', !!correctSound);
        console.log('- Fout.mp3:', !!wrongSound);
        console.log('- Timer.mp3:', !!timerSound);
        console.log('- TimeUp.mp3:', !!timeUpSound);
        console.log('- Alarm_clock.mp3:', !!alarmClockSound);

        // Preload de audio bestanden
        correctSound.load();
        wrongSound.load();
        timerSound.load();
        timeUpSound.load();
        alarmClockSound.load();

        // Maak Timer.mp3 loopable
        timerSound.loop = true;

        console.log('✅ Alle audio bestanden geladen');
    } catch (error) {
        console.error('❌ Audio kon niet worden geladen:', error);
    }
};

// Functie om geluid af te spelen (met error handling)
const playSound = (sound, isMuted) => {
    if (!sound || isMuted) return;

    try {
        // Pauzeer eerst als het al speelt
        sound.pause();
        // Reset naar begin
        sound.currentTime = 0;
        // Speel af (promise-based)
        const playPromise = sound.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Spel gaat door zonder geluid bij errors
                console.log('Geluid kon niet worden afgespeeld:', error);
            });
        }
    } catch (error) {
        // Spel gaat door zonder geluid bij errors
        console.log('Fout bij afspelen geluid:', error);
    }
};

// Functie om timer geluid te starten
const startTimerSound = (isMuted) => {
    if (!timerSound || isMuted) return;

    try {
        // Start Timer.mp3
        timerSound.currentTime = 0;
        const playPromise = timerSound.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Timer geluid kon niet worden afgespeeld:', error);
            });
        }

        // BELANGRIJK: Unlock TimeUp.mp3 voor iOS Safari
        // iOS Safari blokkeert audio die niet direct door gebruikersactie wordt getriggerd
        // Door TimeUp.mp3 hier kort af te spelen (en meteen te pauzeren),
        // "unlocken" we het voor later automatisch afspelen
        if (timeUpSound) {
            console.log('🔓 Unlock TimeUp.mp3 voor iOS Safari...');
            timeUpSound.volume = 0; // Tijdelijk volume op 0
            timeUpSound.play()
                .then(() => {
                    timeUpSound.pause();
                    timeUpSound.currentTime = 0;
                    timeUpSound.volume = 1; // Volume terug naar normaal
                    console.log('✅ TimeUp.mp3 unlocked voor iOS');
                })
                .catch(error => {
                    console.log('⚠️ TimeUp unlock gefaald:', error);
                    timeUpSound.volume = 1; // Volume toch terugzetten
                });
        }
    } catch (error) {
        console.log('Fout bij afspelen timer geluid:', error);
    }
};

// Functie om timer geluid te stoppen en TimeUp af te spelen
const stopTimerAndPlayTimeUp = (isMuted) => {
    console.log('🔊 stopTimerAndPlayTimeUp aangeroepen, isMuted:', isMuted);

    // Stop Timer.mp3
    if (timerSound) {
        try {
            timerSound.pause();
            timerSound.currentTime = 0;
            console.log('✓ Timer geluid gestopt');
        } catch (error) {
            console.log('Fout bij stoppen timer geluid:', error);
        }
    }

    // Speel TimeUp.mp3 af
    if (isMuted) {
        console.log('⚠️ TimeUp overgeslagen: geluid is gemute');
        return;
    }

    console.log('🔊 Probeer TimeUp.mp3 af te spelen...');
    console.log('timeUpSound bestaat:', !!timeUpSound);

    if (timeUpSound) {
        try {
            timeUpSound.pause();
            timeUpSound.currentTime = 0;
            console.log('🎵 TimeUp.mp3 play() aanroepen...');
            const playPromise = timeUpSound.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('✅ TimeUp.mp3 speelt!');
                    })
                    .catch(error => {
                        console.error('❌ TimeUp geluid kon niet worden afgespeeld:', error);
                    });
            }
        } catch (error) {
            console.error('❌ Fout bij afspelen TimeUp geluid:', error);
        }
    } else {
        console.error('❌ TimeUp geluid niet geladen! Check of TimeUp.mp3 bestaat.');
    }
};

// Functie om alarm geluid af te spelen
const playAlarmSound = (isMuted) => {
    if (!alarmClockSound || isMuted) return;

    try {
        alarmClockSound.currentTime = 0;
        const playPromise = alarmClockSound.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Alarm geluid kon niet worden afgespeeld:', error);
            });
        }
    } catch (error) {
        console.log('Fout bij afspelen alarm geluid:', error);
    }
};

// Functie om alarm geluid te stoppen
const stopAlarmSound = () => {
    if (alarmClockSound) {
        try {
            alarmClockSound.pause();
            alarmClockSound.currentTime = 0;
        } catch (error) {
            console.log('Fout bij stoppen alarm geluid:', error);
        }
    }
};

// Initialiseer audio bij laden van het script
initAudio();
