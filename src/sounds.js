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
    const audioBestandenPaden = {
        correct: 'Goed.mp3',
        wrong: 'Fout.mp3',
        timer: 'Timer.mp3',
        timeUp: 'TimeUp.mp3',
        alarm: 'Alarm_clock.mp3'
    };

    console.log('🔊 Audio bestanden initialiseren...');

    // Laad elk audio bestand afzonderlijk met error handling
    Object.entries(audioBestandenPaden).forEach(([naam, pad]) => {
        try {
            const audio = new Audio(pad);

            // Error handler voor als het bestand niet kan laden
            audio.onerror = () => {
                console.error(`❌ Kan ${naam} geluid niet laden: ${pad}`);
            };

            // Success handler
            audio.onloadeddata = () => {
                console.log(`✅ ${naam} geluid geladen: ${pad}`);
            };

            // Preload het bestand
            audio.load();

            // Wijs toe aan de juiste variabele
            switch(naam) {
                case 'correct':
                    correctSound = audio;
                    break;
                case 'wrong':
                    wrongSound = audio;
                    break;
                case 'timer':
                    timerSound = audio;
                    timerSound.loop = true; // Maak loopable
                    break;
                case 'timeUp':
                    timeUpSound = audio;
                    break;
                case 'alarm':
                    alarmClockSound = audio;
                    break;
            }
        } catch (error) {
            console.error(`❌ Fout bij initialiseren van ${naam} (${pad}):`, error);
        }
    });

    console.log('✅ Audio initialisatie voltooid');
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

// ES6 Exports
export {
    correctSound,
    wrongSound,
    timerSound,
    timeUpSound,
    alarmClockSound,
    playSound,
    startTimerSound,
    stopTimerAndPlayTimeUp,
    playAlarmSound,
    stopAlarmSound
};
