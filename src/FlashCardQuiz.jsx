import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCard } from './components/QuestionCard.jsx';
import { AnswerCard } from './components/AnswerCard.jsx';
import { VRAGEN } from './questions.js';
import { UI_TEKSTEN } from './strings.js';
import {
    shuffleArray,
    createWeightedPool,
    swipeConfidenceThreshold,
    swipePower,
    variants
} from './utils.js';
import {
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
} from './sounds.js';

export function FlashCardQuiz() {
            // DEBUG: Log dat component mount
            console.log('🔍 FlashCardQuiz component is mounting!');
            console.log('🔍 VRAGEN loaded:', VRAGEN?.length, 'questions');

            // ==========================================
            // SMART QUESTION TRACKING SYSTEEM
            // Vragen herhalen pas na alle 255 vragen
            // Persisteert via localStorage, ook na refresh
            // ==========================================

            // Laad getoonde vraag IDs uit localStorage
            const [shownQuestionIds, setShownQuestionIds] = useState(() => {
                try {
                    const saved = localStorage.getItem('sintspel-shown-questions');
                    const ids = saved ? JSON.parse(saved) : [];
                    console.log(`📚 ${ids.length} vragen al getoond`);
                    return ids;
                } catch (error) {
                    console.log('⚠️ Kan localStorage niet laden');
                    return [];
                }
            });

            // Genereer vragenpool: alleen ongetoonde vragen (of reset als alles getoond is)
            const generateQuestionPool = (shownIds) => {
                const totalQuestions = VRAGEN.length;

                // Als alle 255 vragen getoond zijn, reset en begin opnieuw
                if (shownIds.length >= totalQuestions) {
                    console.log('🔄 Alle 255 vragen zijn geweest! Start nieuwe ronde.');
                    try {
                        localStorage.setItem('sintspel-shown-questions', JSON.stringify([]));
                    } catch (error) {
                        console.log('⚠️ Kan localStorage niet updaten');
                    }
                    return shuffleArray(VRAGEN);
                }

                // Filter ongetoonde vragen en shuffle ze
                const unshownQuestions = VRAGEN.filter(q => !shownIds.includes(q.id));
                console.log(`✨ ${unshownQuestions.length} ongetoonde vragen beschikbaar van ${totalQuestions}`);
                return shuffleArray(unshownQuestions);
            };

            // Question pool state - bevat alleen ongetoonde vragen
            const [questionPool, setQuestionPool] = useState(() => generateQuestionPool(shownQuestionIds));

            // Player System State - MOET voor weightedPool gedefinieerd worden!
            const [players, setPlayers] = useState([]); // Array van {name, age, score}
            const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0); // Huidige speler (0-based index)

            // Weighted pool per speler - 1x gegenereerd per speler
            // Dit voorkomt herhalingen EN past difficulty aan op basis van leeftijd
            const weightedPool = useMemo(() => {
                // Geen players? Gebruik originele pool
                if (players.length === 0) {
                    return questionPool;
                }

                // Bounds check
                if (currentPlayerIndex < 0 || currentPlayerIndex >= players.length) {
                    return questionPool;
                }

                // Haal leeftijd van huidige speler op
                const currentPlayer = players[currentPlayerIndex];
                const playerAge = currentPlayer?.age;

                // Genereer weighted pool voor deze speler
                const weighted = createWeightedPool(questionPool, playerAge);

                console.log(`🎯 Weighted pool voor ${currentPlayer.name} (${playerAge} jaar): ${weighted.length} vragen`);

                return weighted;
            }, [questionPool, players, currentPlayerIndex]);

            // ==========================================
            // DEVELOPMENT MODE - SMOKE TEST
            // Detecteert vroeg als age-based weighting niet werkt
            // ==========================================
            useEffect(() => {
                if (import.meta.env.DEV) {
                    // Run smoke test on mount to verify age-based weighting works
                    const youngPool = createWeightedPool(VRAGEN, 8);
                    const adultPool = createWeightedPool(VRAGEN, 25);

                    const youngEasy = youngPool.filter(q => q.difficulty === 'easy').length;
                    const adultEasy = adultPool.filter(q => q.difficulty === 'easy').length;

                    const youngEasyPercent = youngEasy / youngPool.length;
                    const adultEasyPercent = adultEasy / adultPool.length;

                    if (youngEasyPercent <= adultEasyPercent) {
                        console.error('❌ AGE-BASED WEIGHTING NOT WORKING!');
                        console.error(`   Young child (8): ${(youngEasyPercent * 100).toFixed(1)}% easy questions`);
                        console.error(`   Adult (25): ${(adultEasyPercent * 100).toFixed(1)}% easy questions`);
                        console.error('   Expected: Young child should have MORE easy questions than adult');
                    } else if (youngEasyPercent < 0.60 || youngEasyPercent > 0.80) {
                        console.warn('⚠️ Age-based weighting may be incorrect');
                        console.warn(`   Young child (8): ${(youngEasyPercent * 100).toFixed(1)}% easy (expected ~70%)`);
                    } else {
                        console.log('✅ Age-based weighting smoke test passed');
                        console.log(`   Young: ${(youngEasyPercent * 100).toFixed(1)}% easy, Adult: ${(adultEasyPercent * 100).toFixed(1)}% easy`);
                    }
                }
            }, []); // Only run once on mount

            const [[page, direction], setPage] = useState([0, 0]);
            const [score, setScore] = useState(0); // Score teller: 0, 1, 2, of 3
            const [showTransition, setShowTransition] = useState(null); // 'wrong' of 'success'
            const [isFlipped, setIsFlipped] = useState(false); // Flip state voor de kaart
            const [timeLeft, setTimeLeft] = useState(null); // Timer countdown
            const [timerActive, setTimerActive] = useState(false); // Of timer actief is
            const [showWelcome, setShowWelcome] = useState(true); // Welkomstscherm bij opstarten

            // Player System State (players en currentPlayerIndex zijn al eerder gedefinieerd)
            const [showPlayerRegistration, setShowPlayerRegistration] = useState(false); // Speler registratie scherm
            const [playerName, setPlayerName] = useState(''); // Tijdelijke input voor naam
            const [playerAge, setPlayerAge] = useState(''); // Tijdelijke input voor leeftijd
            const [showAddPlayerForm, setShowAddPlayerForm] = useState(false); // Toon/verberg formulier voor nieuwe speler

            // Winner Selection State (Fase 3)
            const [showWinnerSelection, setShowWinnerSelection] = useState(false); // Winnaar selectie scherm
            const [showFinalWinners, setShowFinalWinners] = useState(false); // Finaal winnaar scherm
            const [sinterklaasWinner, setSinterklaasWinner] = useState(null); // Winnaar met pakje
            const [slimmePieten, setSlimmePieten] = useState([]); // Hoogste score winnaars (kan meerdere zijn)

            // Game Alarm State
            const [alarmMaxTime, setAlarmMaxTime] = useState(10); // Maximale tijd in minuten (default 10)
            const [alarmTimeLeft, setAlarmTimeLeft] = useState(null); // Actuele countdown in seconden
            const [alarmActive, setAlarmActive] = useState(false); // Of de wekker loopt
            const [alarmPaused, setAlarmPaused] = useState(false); // Pauze status
            const [alarmTriggered, setAlarmTriggered] = useState(false); // Of het alarm is afgegaan
            const [gameLocked, setGameLocked] = useState(false); // Spel vergrendeld na alarm
            const [showAlarmQuestion, setShowAlarmQuestion] = useState(true); // Toon vraag om wekker te gebruiken
            const [alarmEnabled, setAlarmEnabled] = useState(false); // Of de gebruiker de wekker wil gebruiken
            const [showAlarmMinimized, setShowAlarmMinimized] = useState(false); // Of de wekker als icoon getoond moet worden

            // Mute state - laad voorkeur uit localStorage
            const [isMuted, setIsMuted] = useState(() => {
                try {
                    const saved = localStorage.getItem('sintspel-muted');
                    return saved === 'true';
                } catch (error) {
                    return false;
                }
            });

            // Bewaar mute voorkeur in localStorage en pauzeer audio bij mute
            useEffect(() => {
                try {
                    localStorage.setItem('sintspel-muted', isMuted);

                    // Pauzeer alle audio als we muten
                    if (isMuted) {
                        if (correctSound) correctSound.pause();
                        if (wrongSound) wrongSound.pause();
                        if (timerSound) timerSound.pause();
                        if (timeUpSound) timeUpSound.pause();
                        if (alarmClockSound) alarmClockSound.pause();
                    }
                } catch (error) {
                    console.log('LocalStorage niet beschikbaar');
                }
            }, [isMuted]);

            // Toggle mute functie
            const toggleMute = () => {
                setIsMuted(!isMuted);
            };

            // Smart vraag selectie op basis van leeftijd en moeilijkheid
            const getQuestionForPlayer = useCallback(() => {
                // Gebruik weighted pool (die automatisch fallback naar questionPool doet als geen players)
                if (weightedPool.length === 0) return null;

                // Ga sequentieel door de weighted pool
                // De pool is:
                // - Voor single player: gewoon geshuffled
                // - Voor multiplayer: weighted op basis van leeftijd huidige speler
                const questionIndex = Math.abs(page % weightedPool.length);
                return weightedPool[questionIndex];
            }, [weightedPool, page]);

            // Zorg dat we oneindig door de vragen kunnen loopen
            // useMemo zorgt dat de vraag NIET verandert bij elke re-render
            const currentQuestion = useMemo(() => {
                return getQuestionForPlayer();
            }, [getQuestionForPlayer]);

            // Mark vraag als getoond wanneer deze wordt weergegeven
            useEffect(() => {
                if (currentQuestion && !shownQuestionIds.includes(currentQuestion.id)) {
                    const newShownIds = [...shownQuestionIds, currentQuestion.id];

                    // Check of we alle vragen hebben gehad
                    if (newShownIds.length >= VRAGEN.length) {
                        console.log('🎉 Alle 255 vragen zijn nu getoond! Volgende keer start een nieuwe ronde.');
                        // Reset gebeurt bij volgende mount/refresh via generateQuestionPool
                    }

                    setShownQuestionIds(newShownIds);
                    try {
                        localStorage.setItem('sintspel-shown-questions', JSON.stringify(newShownIds));
                        console.log(`✅ Vraag ${currentQuestion.id} gemarkeerd als getoond (${newShownIds.length}/${VRAGEN.length})`);
                    } catch (error) {
                        console.log('⚠️ Kan localStorage niet updaten');
                    }
                }
            }, [currentQuestion, shownQuestionIds]);

            // Regenereer pool als alle vragen in huidige pool zijn getoond (mid-sessie refresh)
            useEffect(() => {
                // Check of alle vragen in de huidige pool getoond zijn
                const allPoolQuestionsShown = questionPool.every(q => shownQuestionIds.includes(q.id));

                if (allPoolQuestionsShown && shownQuestionIds.length < VRAGEN.length) {
                    // Alle vragen in pool zijn getoond, maar er zijn nog ongetoonde vragen over
                    console.log('🔄 Pool uitgeput, regenereren met resterende vragen...');
                    const newPool = generateQuestionPool(shownQuestionIds);
                    setQuestionPool(newPool);
                } else if (shownQuestionIds.length >= VRAGEN.length && questionPool.length === VRAGEN.length) {
                    // Alle 255 vragen zijn getoond, reset alles voor nieuwe ronde
                    console.log('🔄 Alle vragen getoond! Reset voor nieuwe ronde.');
                    setShownQuestionIds([]);
                    try {
                        localStorage.setItem('sintspel-shown-questions', JSON.stringify([]));
                    } catch (error) {
                        console.log('⚠️ Kan localStorage niet updaten');
                    }
                    setQuestionPool(shuffleArray(VRAGEN));
                }
            }, [shownQuestionIds, questionPool]);

            // Reset flip en timer bij nieuwe vraag
            useEffect(() => {
                setIsFlipped(false);
                setTimerActive(false);
                setTimeLeft(null);
                // Stop timer geluid als het nog speelt
                if (timerSound) {
                    try {
                        timerSound.pause();
                        timerSound.currentTime = 0;
                    } catch (error) {
                        console.log('Fout bij stoppen timer geluid:', error);
                    }
                }

                // Cleanup: stop audio bij component unmount
                return () => {
                    if (timerSound) {
                        try {
                            timerSound.pause();
                            timerSound.currentTime = 0;
                        } catch (error) {
                            console.log('Cleanup: Fout bij stoppen timer geluid:', error);
                        }
                    }
                };
            }, [page]);

            // Timer countdown logica
            useEffect(() => {
                if (timerActive && timeLeft !== null && timeLeft > 0) {
                    const timer = setTimeout(() => {
                        setTimeLeft(timeLeft - 1);
                    }, 1000);
                    return () => clearTimeout(timer);
                } else if (timerActive && timeLeft === 0) {
                    console.log('⏰ Timer bereikt 0! Speel TimeUp geluid...');
                    setTimerActive(false);
                    // Stop Timer.mp3 en speel TimeUp.mp3 af
                    stopTimerAndPlayTimeUp(isMuted);
                }
                // Note: Audio cleanup wordt afgehandeld in de page useEffect (regel 262-288)
                // om te voorkomen dat het geluid elke seconde wordt gestopt
            }, [timerActive, timeLeft, isMuted]);

            // Game Alarm countdown logica - loopt door ongeacht navigatie
            useEffect(() => {
                if (alarmActive && !alarmPaused && alarmTimeLeft !== null && alarmTimeLeft > 0) {
                    const alarmTimer = setTimeout(() => {
                        setAlarmTimeLeft(alarmTimeLeft - 1);
                    }, 1000);
                    return () => clearTimeout(alarmTimer);
                } else if (alarmActive && !alarmPaused && alarmTimeLeft === 0) {
                    // ALARM AFGEGAAN!
                    setAlarmActive(false);
                    setAlarmTriggered(true);
                    setGameLocked(true);
                    playAlarmSound(isMuted);
                }

                // Cleanup: stop alarm audio bij unmount
                return () => {
                    if (alarmClockSound) {
                        try {
                            alarmClockSound.pause();
                            alarmClockSound.currentTime = 0;
                        } catch (error) {
                            console.log('Cleanup: Fout bij stoppen alarm geluid:', error);
                        }
                    }
                };
            }, [alarmActive, alarmPaused, alarmTimeLeft, isMuted]);

            // Functie om game alarm te starten
            const startGameAlarm = () => {
                // Bereken random tijd tussen (max - 2 min) en max
                const maxSeconds = alarmMaxTime * 60;
                const minSeconds = Math.max(maxSeconds - 120, 60); // Minimaal 2 minuten minder, maar nooit onder 1 min

                // Random tijd tussen min en max
                const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;

                setAlarmTimeLeft(randomSeconds);
                setAlarmActive(true);
                setAlarmPaused(false);
                setAlarmTriggered(false);

                // BELANGRIJK: Unlock Alarm_clock.mp3 voor iOS Safari
                // iOS Safari blokkeert audio die niet direct door gebruikersactie wordt getriggerd
                // Door Alarm_clock.mp3 hier kort af te spelen (en meteen te pauzeren),
                // "unlocken" we het voor later automatisch afspelen
                if (alarmClockSound && !isMuted) {
                    console.log('🔓 Unlock Alarm_clock.mp3 voor iOS Safari...');
                    alarmClockSound.volume = 0; // Tijdelijk volume op 0
                    alarmClockSound.play()
                        .then(() => {
                            alarmClockSound.pause();
                            alarmClockSound.currentTime = 0;
                            alarmClockSound.volume = 1; // Volume terug naar normaal
                            console.log('✅ Alarm_clock.mp3 unlocked voor iOS');
                        })
                        .catch(error => {
                            console.log('⚠️ Alarm unlock gefaald:', error);
                            alarmClockSound.volume = 1; // Volume toch terugzetten
                        });
                }
            };

            // Functie om game alarm te pauzeren
            const pauseGameAlarm = () => {
                setAlarmPaused(true);
                stopAlarmSound(); // Stop geluid als het speelt
            };

            // Functie om game alarm te hervatten
            const resumeGameAlarm = () => {
                setAlarmPaused(false);
            };

            // Functie om game alarm te resetten
            const resetGameAlarm = () => {
                setAlarmActive(false);
                setAlarmPaused(false);
                setAlarmTimeLeft(null);
                setAlarmTriggered(false);
                setGameLocked(false);
                stopAlarmSound();
            };

            // Functie om game alarm te stoppen (zonder alarm)
            const stopGameAlarm = () => {
                setAlarmActive(false);
                setAlarmPaused(false);
                setAlarmTimeLeft(null);
                stopAlarmSound();
            };

            // Functie om "Ja" te kiezen (wekker gebruiken)
            const handleAlarmYes = () => {
                setShowAlarmQuestion(false);
                setAlarmEnabled(true);
                setShowAlarmMinimized(false);
            };

            // Functie om "Nee" te kiezen (wekker niet gebruiken)
            const handleAlarmNo = () => {
                setShowAlarmQuestion(false);
                setAlarmEnabled(false);
                setShowAlarmMinimized(true);
            };

            // Functie om wekker te heropenen vanuit icoon
            const handleAlarmReopen = () => {
                setShowAlarmMinimized(false);
                setAlarmEnabled(true);
            };

            // Functie om naar volgende/vorige te gaan
            const paginate = useCallback((newDirection) => {
                setPage((prev) => [prev[0] + newDirection, newDirection]);
            }, []);

            // Handler voor flip
            const handleFlip = () => {
                if (gameLocked) return; // Spel vergrendeld - geen actie
                if (!currentQuestion) return; // Safety check

                setIsFlipped(prev => {
                    const newFlipped = !prev;
                    // Start timer als vraag een timeLimit heeft en we flippen naar antwoord
                    if (!prev && currentQuestion.timeLimit) {
                        setTimeLeft(currentQuestion.timeLimit);
                        setTimerActive(true);
                        // Start Timer.mp3 loop
                        startTimerSound(isMuted);
                    }
                    return newFlipped;
                });
            };

            // Handler voor GOED antwoord
            const handleCorrect = () => {
                if (gameLocked) return; // Spel vergrendeld - geen actie

                // Speel "Goed" geluid af - direct voor snelle feedback
                playSound(correctSound, isMuted);

                // Stop timer geluid als het nog speelt
                if (timerSound) {
                    try {
                        timerSound.pause();
                        timerSound.currentTime = 0;
                    } catch (error) {
                        console.log('Fout bij stoppen timer geluid:', error);
                    }
                }

                // Update score van huidige speler (indien player systeem actief)
                if (players.length > 0) {
                    const updatedPlayers = [...players];
                    updatedPlayers[currentPlayerIndex].score += 1;
                    setPlayers(updatedPlayers);
                }

                const newScore = score + 1;

                if (newScore === 3) {
                    // 3 goed! Toon success scherm
                    setShowTransition('success');
                } else {
                    // Nog niet 3, ga direct naar volgende vraag (snelle response)
                    setScore(newScore);
                    setIsFlipped(false); // Reset flip
                    paginate(1); // Direct, zonder delay voor betere responsiviteit
                }
            };

            // Handler voor FOUT antwoord
            const handleWrong = () => {
                if (gameLocked) return; // Spel vergrendeld - geen actie

                // Speel "Fout" geluid af - direct voor snelle feedback
                playSound(wrongSound, isMuted);

                // Stop timer geluid als het nog speelt
                if (timerSound) {
                    try {
                        timerSound.pause();
                        timerSound.currentTime = 0;
                    } catch (error) {
                        console.log('Fout bij stoppen timer geluid:', error);
                    }
                }

                setShowTransition('wrong');
            };

            // Handler voor "Volgende speler" knop
            const handleNextPlayer = () => {
                setShowTransition(null);
                setScore(0);
                setIsFlipped(false);

                // Roteer naar volgende speler (circularisch) met functional update
                if (players.length > 0) {
                    setCurrentPlayerIndex(prev => (prev + 1) % players.length);
                }

                paginate(1);
            };

            // Toetsenbord bediening (Pijltjes en Spatie voor flip)
            useEffect(() => {
                const handleKeyDown = (e) => {
                    if (showTransition || gameLocked) return; // Geen toetsenbord tijdens transition of als spel locked is

                    if (e.key === 'ArrowLeft') {
                        paginate(-1);
                    } else if (e.key === 'ArrowRight') {
                        paginate(1);
                    } else if (e.key === ' ') {
                        e.preventDefault();
                        handleFlip();
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [paginate, showTransition, isFlipped, gameLocked, handleFlip]);

            // WELKOMSTSCHERM - INSTRUCTIES
            if (showWelcome) {
                return (
                    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-screen bg-[#8B1538] text-white py-8 px-4 md:p-6 relative overflow-auto">
                        <div className="max-w-2xl w-full bg-[#F5E6D3] text-[#3E2723] rounded-3xl shadow-2xl p-4 md:p-6 border-4 border-[#D4A574]">
                            {/* Titel */}
                            <div className="text-center mb-3">
                                <p className="text-base md:text-lg text-[#8B1538] mb-1 leading-snug">
                                    Welkom bij de
                                </p>
                                <h1 className="text-3xl md:text-4xl font-bold text-[#8B1538] leading-tight">
                                    Sinterklaas Quiz
                                </h1>
                            </div>

                            {/* Instructies */}
                            <div className="space-y-2 mb-3">
                                <div>
                                    <h2 className="text-lg md:text-xl font-bold text-[#A0253B] mb-2 flex items-center justify-center gap-2">
                                        <span className="text-2xl">🎁</span>
                                        <span>HOE SPEEL JE?</span>
                                    </h2>
                                    <ul className="space-y-1.5 text-sm md:text-base text-[#3E2723] leading-relaxed">
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#A0253B] font-bold text-lg flex-shrink-0">•</span>
                                            <span>Een pakje met wekker erin gaat rond</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#A0253B] font-bold text-lg flex-shrink-0">•</span>
                                            <span>Beantwoord de vragen</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#A0253B] font-bold text-lg flex-shrink-0">•</span>
                                            <span><strong>GOED</strong>? Ga door (max 3)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#A0253B] font-bold text-lg flex-shrink-0">•</span>
                                            <span><strong>FOUT</strong> of 3 goed? Geef pakje door naar <strong>LINKS</strong></span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#A0253B] font-bold text-lg flex-shrink-0">•</span>
                                            <span>Vraag niet geschikt voor een deelnemer? Swipe links</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#A0253B] font-bold text-lg flex-shrink-0">•</span>
                                            <span>Wie het pakje heeft als de wekker afgaat, <strong>WINT!</strong> 🎉</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-[#D4A574] bg-opacity-40 rounded-xl p-3 border-2 border-[#8B6F47] shadow-md">
                                    <h2 className="text-base md:text-lg font-bold text-[#A0253B] mb-1 flex items-center justify-center gap-2">
                                        <span className="text-2xl">⏰</span>
                                        <span>WEKKER</span>
                                    </h2>
                                    <p className="text-xs md:text-sm text-[#3E2723] text-center leading-relaxed font-medium">
                                        Geen wekker in je pakje?<br/>
                                        Gebruik de wekker in deze app!
                                    </p>
                                </div>
                            </div>

                            {/* Start knop */}
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        setShowWelcome(false);
                                        setShowPlayerRegistration(true);
                                    }}
                                    className="w-full px-6 py-3 bg-[#A0253B] text-white rounded-xl font-bold text-base md:text-lg shadow-2xl hover:bg-[#8B1538] transition-all transform hover:scale-105"
                                >
                                    🎮 Voeg spelers toe!
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            // PLAYER REGISTRATION SCHERM
            if (showPlayerRegistration) {
                const handleAddPlayer = () => {
                    if (playerName.trim() && playerAge && parseInt(playerAge) > 0) {
                        setPlayers([...players, {
                            name: playerName.trim(),
                            age: parseInt(playerAge),
                            score: 0
                        }]);
                        setPlayerName('');
                        setPlayerAge('');
                        setShowAddPlayerForm(false); // Verberg formulier na toevoegen
                    }
                };

                const toggleAddPlayerForm = () => {
                    setShowAddPlayerForm(!showAddPlayerForm);
                };

                const handleRemovePlayer = (index) => {
                    setPlayers(players.filter((_, i) => i !== index));
                };

                const handleStartGame = () => {
                    if (players.length >= 2) {
                        setShowPlayerRegistration(false);
                        setCurrentPlayerIndex(0);
                        setIsFlipped(false); // Reset card to show question side
                    }
                };

                return (
                    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-screen bg-[#8B1538] text-white py-8 px-4 md:p-6 relative overflow-auto">
                        <div className="w-full max-w-2xl">
                            <div className="bg-[#F5E6D3] rounded-2xl shadow-2xl p-4 md:p-6 border-4 border-[#D4A574]">

                                {/* Titel */}
                                <div className="text-center mb-3">
                                    <div className="text-3xl mb-1">👥</div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#8B1538] mb-1">
                                        Spelers Beheren
                                    </h1>
                                    <p className="text-sm text-[#3E2723]">
                                        {players.length === 0 ? 'Voeg minimaal 2 spelers toe om te beginnen' : 'Beheer je spelers en start het spel'}
                                    </p>
                                </div>

                                {/* Knop om formulier te tonen/verbergen */}
                                {!showAddPlayerForm && (
                                    <div className="mb-3">
                                        <button
                                            onClick={toggleAddPlayerForm}
                                            className="w-full px-6 py-3 bg-[#6B8E23] text-white rounded-lg font-bold text-lg shadow-lg hover:bg-[#556B1D] transition-all"
                                        >
                                            ➕ Speler Toevoegen
                                        </button>
                                    </div>
                                )}

                                {/* Formulier - Conditioneel getoond */}
                                {showAddPlayerForm && (
                                    <div className="mb-3 space-y-2 bg-white rounded-lg p-3 border-2 border-[#6B8E23]">
                                        <div>
                                            <label htmlFor="player-name-input" className="block text-sm font-bold text-[#8B1538] mb-1">Naam:</label>
                                            <input
                                                id="player-name-input"
                                                type="text"
                                                value={playerName}
                                                onChange={(e) => setPlayerName(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                                                placeholder="Bijv. Anna"
                                                className="w-full px-3 py-2 rounded-lg border-2 border-[#D4A574] text-[#3E2723] focus:outline-none focus:border-[#8B1538]"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="player-age-input" className="block text-sm font-bold text-[#8B1538] mb-1">Leeftijd:</label>
                                            <input
                                                id="player-age-input"
                                                type="number"
                                                value={playerAge}
                                                onChange={(e) => setPlayerAge(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                                                placeholder="Bijv. 12"
                                                min="1"
                                                max="99"
                                                className="w-full px-3 py-2 rounded-lg border-2 border-[#D4A574] text-[#3E2723] focus:outline-none focus:border-[#8B1538]"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAddPlayer}
                                                className="flex-1 px-6 py-3 bg-[#6B8E23] text-white rounded-lg font-bold text-lg shadow-lg hover:bg-[#556B1D] transition-all"
                                                aria-label="Voeg speler toe aan de lijst"
                                            >
                                                ✓ Toevoegen
                                            </button>
                                            <button
                                                onClick={toggleAddPlayerForm}
                                                className="px-6 py-3 bg-[#8B6F47] text-white rounded-lg font-bold text-lg shadow-lg hover:bg-[#6B5637] transition-all"
                                            >
                                                ✕ Annuleren
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Spelers Lijst - Alle spelers scrollbaar */}
                                {players.length > 0 && (
                                    <div className="mb-3">
                                        <h3 className="text-base font-bold text-[#8B1538] mb-2">
                                            Spelers ({players.length}):
                                        </h3>
                                        <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-2">
                                            {players.map((player, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border-2 border-[#D4A574]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-bold text-[#A0253B]">
                                                            {index + 1}.
                                                        </span>
                                                        <div>
                                                            <div className="font-bold text-[#3E2723]">
                                                                {player.name}
                                                            </div>
                                                            <div className="text-xs text-[#8B6F47]">
                                                                {player.age} jaar
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemovePlayer(index)}
                                                        className="px-2 py-1 bg-[#A0253B] text-white rounded-lg font-bold hover:bg-[#8B1538] transition-all text-lg"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Start Game Button */}
                                <div className="text-center">
                                    {players.length >= 2 ? (
                                        <button
                                            onClick={handleStartGame}
                                            className="w-full px-6 py-3 bg-[#A0253B] text-white rounded-xl font-bold text-lg shadow-2xl hover:bg-[#8B1538] transition-all transform hover:scale-105"
                                        >
                                            🎮 Start het Spel!
                                        </button>
                                    ) : (
                                        <div className="text-center text-[#8B6F47] font-bold text-sm">
                                            Voeg minimaal 2 spelers toe om te beginnen
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // GAME ALARM TRIGGERED - FULLSCREEN OVERLAY
            if (alarmTriggered) {
                const handleStopGame = () => {
                    // Stop alarm en ga naar winnaar selectie
                    setAlarmTriggered(false);
                    setAlarmActive(false);
                    setGameLocked(false);
                    setShowWinnerSelection(true);
                };

                return (
                    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#A0253B] text-white p-8 relative">
                        {/* Knipperende achtergrond animatie */}
                        <div className="absolute inset-0 bg-[#8B1538] animate-pulse opacity-50"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="text-9xl mb-8 animate-bounce">⏰</div>
                            <h1 className="text-6xl md:text-7xl font-bold mb-6 text-center drop-shadow-2xl animate-pulse">
                                TIJD IS OM!
                            </h1>
                            <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center drop-shadow-xl">
                                WIE HEEFT HET PAKJE? 🎁
                            </h2>

                            {/* Toon Stop Spel knop als players actief zijn */}
                            {players.length > 0 ? (
                                <button
                                    className="px-12 py-6 bg-[#6B8E23] text-white rounded-full font-bold text-2xl shadow-2xl hover:bg-[#556B1D] transition-all transform hover:scale-105"
                                    onClick={handleStopGame}
                                >
                                    🏆 Stop Spel & Kies Winnaar
                                </button>
                            ) : (
                                <button
                                    className="px-12 py-6 bg-[#F5E6D3] text-[#8B1538] rounded-full font-bold text-2xl shadow-2xl hover:bg-[#FAF0E6] transition-all transform hover:scale-105"
                                    onClick={resetGameAlarm}
                                >
                                    Reset Wekker
                                </button>
                            )}
                        </div>
                    </div>
                );
            }

            // WINNAAR SELECTIE SCHERM (Fase 3)
            if (showWinnerSelection) {
                const handleSelectWinner = (playerIndex) => {
                    // Bounds check
                    if (playerIndex < 0 || playerIndex >= players.length) return;

                    // Stel winnaar in
                    setSinterklaasWinner(players[playerIndex].name);

                    // Bereken Slimme Piet(en) - alle spelers met hoogste score
                    // Empty array check: als geen players, skip
                    if (players.length === 0) {
                        setSlimmePieten([]);
                    } else {
                        const highestScore = Math.max(...players.map(p => p.score));
                        const topPlayers = players.filter(p => p.score === highestScore);
                        setSlimmePieten(topPlayers.map(p => p.name));
                    }

                    // Ga naar finaal winnaar scherm
                    setShowWinnerSelection(false);
                    setShowFinalWinners(true);
                };

                return (
                    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-screen bg-[#A0253B] text-white py-8 px-4 md:p-6 relative overflow-auto">
                        <div className="w-full max-w-2xl">
                            <div className="bg-[#F5E6D3] rounded-2xl shadow-2xl p-4 md:p-6 border-4 border-[#D4A574]">

                                {/* Titel */}
                                <div className="text-center mb-4">
                                    <div className="text-4xl mb-2">🎁</div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-[#8B1538] mb-1">
                                        Wie Heeft Het Pakje?
                                    </h1>
                                    <p className="text-sm text-[#3E2723]">
                                        Klik op de speler die het pakje heeft
                                    </p>
                                </div>

                                {/* Spelers Lijst */}
                                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                                    {players.map((player, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSelectWinner(index)}
                                            className="w-full flex items-center justify-between bg-white hover:bg-[#FAF0E6] rounded-xl p-3 border-2 border-[#D4A574] shadow-lg transition-all transform hover:scale-105"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">👤</span>
                                                <div className="text-left">
                                                    <div className="font-bold text-[#3E2723] text-lg">
                                                        {player.name}
                                                    </div>
                                                    <div className="text-xs text-[#8B6F47]">
                                                        Score: {player.score} punten
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-2xl">🎁</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }

            // FINAAL WINNAAR SCHERM (Fase 3)
            if (showFinalWinners) {
                const handlePlayAgain = () => {
                    // Reset game voor nieuwe ronde - ga naar spelers scherm
                    setShowFinalWinners(false);
                    setSinterklaasWinner(null);
                    setSlimmePieten([]);
                    setShowPlayerRegistration(true);
                    setScore(0);
                    setCurrentPlayerIndex(0);
                    // Reset player scores maar behoud spelers
                    const resetPlayers = players.map(p => ({...p, score: 0}));
                    setPlayers(resetPlayers);
                };

                return (
                    <div className="flex flex-col items-center justify-center min-h-[100dvh] w-screen bg-gradient-to-b from-[#6B8E23] to-[#556B1D] text-white py-8 px-4 md:p-6 overflow-auto">
                        <div className="text-4xl mb-2 animate-bounce">🏆</div>

                        <h1 className="text-2xl md:text-3xl font-bold mb-3 text-center drop-shadow-2xl">
                            DE WINNAARS!
                        </h1>

                        {/* De Sinterklaas Winnaar */}
                        <div className="bg-white text-[#8B1538] rounded-2xl p-3 mb-2 w-full max-w-lg shadow-2xl">
                            <div className="text-center">
                                <div className="text-3xl mb-1">🎅</div>
                                <h2 className="text-base font-bold mb-1">DE SINTERKLAAS</h2>
                                <p className="text-xs text-[#8B6F47] mb-1">(Heeft het pakje!)</p>
                                <div className="text-xl font-bold text-[#A0253B]">
                                    {sinterklaasWinner}
                                </div>
                            </div>
                        </div>

                        {/* Slimme Piet Winnaar(s) */}
                        <div className="bg-white text-[#8B1538] rounded-2xl p-3 mb-3 w-full max-w-lg shadow-2xl">
                            <div className="text-center">
                                <div className="text-3xl mb-1">🧠</div>
                                <h2 className="text-base font-bold mb-1">
                                    {slimmePieten.length > 1 ? 'SLIMME PIETEN' : 'SLIMME PIET'}
                                </h2>
                                <p className="text-xs text-[#8B6F47] mb-1">(Meeste vragen goed!)</p>
                                <div className="text-xl font-bold text-[#6B8E23]">
                                    {slimmePieten.join(' & ')}
                                </div>
                                <div className="text-sm text-[#8B6F47] mt-1">
                                    {players.find(p => p.name === slimmePieten[0])?.score || 0} punten
                                </div>
                            </div>
                        </div>

                        {/* Speel Opnieuw Button */}
                        <button
                            onClick={handlePlayAgain}
                            className="px-6 py-3 bg-[#F5E6D3] text-[#8B1538] rounded-full font-bold text-base shadow-2xl hover:bg-[#FAF0E6] transition-all transform hover:scale-105"
                        >
                            🎮 Speel Opnieuw
                        </button>
                    </div>
                );
            }

            // TRANSITION SCHERMEN
            if (showTransition === 'wrong') {
                return (
                    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#8B1538] text-white p-8">
                        <div className="text-9xl mb-8 animate-bounce">🎁</div>
                        <h1 className="text-5xl font-bold mb-4 text-center">GEEF HET PAKJE DOOR</h1>
                        <h2 className="text-3xl font-bold mb-8 text-center">NAAR LINKS</h2>
                        <button
                            className="px-12 py-6 bg-[#F5E6D3] text-[#8B1538] rounded-full font-bold text-2xl shadow-2xl hover:bg-[#FAF0E6] transition"
                            onClick={handleNextPlayer}
                        >
                            Volgende speler
                        </button>
                    </div>
                );
            }

            if (showTransition === 'success') {
                return (
                    <div className="flex flex-col items-center justify-center h-screen w-screen bg-[#6B8E23] text-white p-8">
                        <div className="text-9xl mb-8 animate-bounce">🎉</div>
                        <h1 className="text-5xl font-bold mb-4 text-center">JE HEBT ER 3 GOED!</h1>
                        <h2 className="text-3xl font-bold mb-2 text-center">GEEF HET PAKJE DOOR NAAR LINKS!</h2>
                        <p className="text-xl mb-6 text-center opacity-90">(en pak wat lekkers als bonus)</p>
                        <button
                            className="px-12 py-6 bg-[#F5E6D3] text-[#6B8E23] rounded-full font-bold text-2xl shadow-2xl hover:bg-[#FAF0E6] transition"
                            onClick={handleNextPlayer}
                        >
                            Volgende speler
                        </button>
                    </div>
                );
            }

            // NORMAAL SPEL SCHERM
            return (
                <div className="flex flex-col items-center justify-center h-screen w-screen font-sans relative overflow-hidden" style={{position: 'relative', zIndex: 1}}>

                {/* Mute/Unmute knop linksonder */}
                <button
                    onClick={toggleMute}
                    className="fixed bottom-4 left-4 z-30 bg-[#F5E6D3] text-[#8B1538] rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-2xl hover:bg-[#FAF0E6] transition-all transform hover:scale-110 border-4 border-[#D4A574]"
                    aria-label={isMuted ? 'Geluid aanzetten' : 'Geluid uitzetten'}
                >
                    <span className="text-3xl md:text-4xl">
                        {isMuted ? '🔇' : '🔊'}
                    </span>
                </button>

                {/* Kies Winnaar knop rechtsboven - alleen als players actief zijn */}
                {players.length > 0 && (
                    <button
                        onClick={() => {
                            setAlarmActive(false);
                            setAlarmTriggered(false);
                            setGameLocked(false);
                            setShowWinnerSelection(true);
                        }}
                        className="fixed top-4 right-4 z-30 bg-[#6B8E23] text-white rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-2xl hover:bg-[#556B1D] transition-all transform hover:scale-110 border-4 border-[#D4A574]"
                        aria-label="Stop spel en kies winnaar"
                    >
                        <span className="text-3xl md:text-4xl">
                            🏆
                        </span>
                    </button>
                )}

                {/* Cadeau icoon en Titel */}
                <div className="absolute top-4 flex flex-col items-center">
                    <div className="text-5xl md:text-6xl mb-2">🎁</div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[#F5E6D3] tracking-wide px-4 text-center drop-shadow-lg leading-tight">
                        Sinterklaas<br/>Quiz
                    </h1>
                </div>

                {/* --- DE KAART (Met 3D Flip) --- */}
                <div className="relative w-[94%] max-w-lg h-auto flex items-center justify-center mt-6">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">

                    <motion.div
                        key={page}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) {
                            paginate(1);
                        } else if (swipe > swipeConfidenceThreshold) {
                            paginate(-1);
                        }
                        }}
                        className="absolute w-full cursor-grab active:cursor-grabbing"
                    >
                        {/* Flip Card Container */}
                        <div className="flip-card w-full min-h-[420px]">
                            <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>

                                {/* VOORKANT VAN DE KAART */}
                                <div className="flip-card-front">
                                    <QuestionCard
                                        question={currentQuestion}
                                        player={players.length > 0 ? players[currentPlayerIndex] : null}
                                        onFlip={handleFlip}
                                    />
                                </div>

                                {/* ACHTERKANT VAN DE KAART */}
                                <div className="flip-card-back">
                                    <AnswerCard
                                        question={currentQuestion}
                                        score={score}
                                        timeLeft={timeLeft}
                                        timerActive={timerActive}
                                        onCorrect={handleCorrect}
                                        onWrong={handleWrong}
                                        onNext={null}
                                        onFlip={handleFlip}
                                    />
                                </div>

                            </div>
                        </div>

                    </motion.div>
                    </AnimatePresence>
                </div>

                {/* WEKKER SECTIE */}

                {/* Vraag dialog - Centraal popup */}
                {showAlarmQuestion && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                        <div className="bg-[#F5E6D3] rounded-2xl shadow-2xl p-6 md:p-8 border-4 border-[#D4A574] max-w-md w-full">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">⏰</div>
                                <h3 className="text-xl md:text-2xl font-bold text-[#8B1538] mb-4">
                                    Wil je de wekker op je telefoon gebruiken?
                                </h3>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={handleAlarmYes}
                                    className="px-8 py-4 bg-[#6B8E23] text-white rounded-xl font-bold text-lg shadow-xl hover:bg-[#556B1D] transition-all transform hover:scale-105"
                                >
                                    Ja
                                </button>
                                <button
                                    onClick={handleAlarmNo}
                                    className="px-8 py-4 bg-[#A0253B] text-white rounded-xl font-bold text-lg shadow-xl hover:bg-[#8B1538] transition-all transform hover:scale-105"
                                >
                                    Nee
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Klein icoon om wekker te heropenen (rechtsonder) */}
                {showAlarmMinimized && (
                    <button
                        onClick={handleAlarmReopen}
                        className="fixed bottom-4 right-4 z-40 bg-[#F5E6D3] text-[#8B1538] rounded-full w-14 h-14 md:w-16 md:h-16 flex items-center justify-center shadow-2xl hover:bg-[#FAF0E6] transition-all transform hover:scale-110 border-4 border-[#D4A574]"
                        aria-label="Open wekker"
                    >
                        <span className="text-3xl md:text-4xl">⏰</span>
                    </button>
                )}

                {/* Volledige wekker - Onderaan over volle breedte */}
                {alarmEnabled && !showAlarmMinimized && (
                    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5E6D3] shadow-2xl p-4 md:p-6 border-t-4 border-[#D4A574]">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg md:text-xl font-bold text-[#8B1538]">⏰ WEKKER</h3>
                                <button
                                    onClick={() => setShowAlarmMinimized(true)}
                                    className="px-3 py-1 bg-[#8B6F47] text-white rounded-lg font-bold text-sm shadow-lg hover:bg-[#7A5F3C] transition-all"
                                >
                                    Minimaliseer
                                </button>
                            </div>

                            {/* Als wekker NIET actief - Toon instelling en START knop */}
                            {!alarmActive && !alarmTriggered && (
                                <div className="flex flex-col gap-4">
                                    <div className="w-full">
                                        <label className="block text-sm font-bold text-[#8B6F47] mb-2 text-center">
                                            Max. tijd (minuten):
                                        </label>

                                        {/* Snelkeuze knoppen */}
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-3">
                                            {[1, 3, 5, 10, 15, 20].map(mins => (
                                                <button
                                                    key={mins}
                                                    onClick={() => setAlarmMaxTime(mins)}
                                                    className={`px-3 py-2 rounded-lg font-bold text-base transition-all ${
                                                        alarmMaxTime === mins
                                                            ? 'bg-[#A0253B] text-white shadow-lg scale-105'
                                                            : 'bg-[#D4A574] text-[#3E2723] hover:bg-[#C49564]'
                                                    }`}
                                                >
                                                    {mins}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Handmatige aanpassing met +/- knoppen */}
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => setAlarmMaxTime(Math.max(1, alarmMaxTime - 1))}
                                                disabled={alarmMaxTime <= 1}
                                                className={`px-4 py-3 bg-[#8B6F47] text-white rounded-lg font-bold text-xl shadow-lg transition-all ${
                                                    alarmMaxTime <= 1
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : 'hover:bg-[#7A5F3C] hover:scale-105'
                                                }`}
                                                aria-label={alarmMaxTime <= 1 ? 'Minimum bereikt: 1 minuut' : 'Verlaag tijd met 1 minuut'}
                                                title={alarmMaxTime <= 1 ? 'Minimum: 1 minuut' : 'Verlaag met 1 minuut'}
                                            >
                                                −
                                            </button>
                                            <div className="px-6 py-3 bg-white border-2 border-[#D4A574] rounded-lg text-[#3E2723] font-bold text-3xl min-w-[100px] text-center">
                                                {alarmMaxTime}
                                            </div>
                                            <button
                                                onClick={() => setAlarmMaxTime(Math.min(60, alarmMaxTime + 1))}
                                                disabled={alarmMaxTime >= 60}
                                                className={`px-4 py-3 bg-[#8B6F47] text-white rounded-lg font-bold text-xl shadow-lg transition-all ${
                                                    alarmMaxTime >= 60
                                                        ? 'opacity-40 cursor-not-allowed'
                                                        : 'hover:bg-[#7A5F3C] hover:scale-105'
                                                }`}
                                                aria-label={alarmMaxTime >= 60 ? 'Maximum bereikt: 60 minuten' : 'Verhoog tijd met 1 minuut'}
                                                title={alarmMaxTime >= 60 ? 'Maximum: 60 minuten (1 uur)' : 'Verhoog met 1 minuut'}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="text-sm text-[#8B6F47] mt-3 text-center">
                                            De wekker gaat af tussen {Math.max(alarmMaxTime - 2, 1)} en {alarmMaxTime} minuten.
                                        </p>

                                        {/* Limiet feedback */}
                                        {(alarmMaxTime <= 1 || alarmMaxTime >= 60) && (
                                            <p className="text-xs text-[#A0253B] mt-2 text-center font-semibold">
                                                {alarmMaxTime <= 1
                                                    ? '⚠️ Minimum bereikt: Minimaal 1 minuut nodig'
                                                    : '⚠️ Maximum bereikt: Max. 60 minuten (1 uur) voor beste ervaring'}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={startGameAlarm}
                                        className="w-full px-8 py-4 bg-[#A0253B] text-white rounded-xl font-bold text-lg shadow-xl hover:bg-[#8B1538] transition-all transform hover:scale-105"
                                    >
                                        🚀 START WEKKER
                                    </button>
                                </div>
                            )}

                            {/* Als wekker ACTIEF - Toon timer en controle knoppen */}
                            {alarmActive && !alarmTriggered && alarmTimeLeft !== null && (
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    {/* Timer display - altijd zichtbaar */}
                                    <div className="flex-1 text-center">
                                        <div className={`inline-block px-6 py-4 rounded-lg font-bold shadow-xl border-2 transition-all ${
                                            alarmTimeLeft <= 30
                                                ? 'bg-[#A0253B] text-white border-[#A0253B] text-4xl md:text-5xl animate-pulse scale-110'
                                                : alarmTimeLeft <= 60
                                                ? 'bg-[#A0253B] text-white border-[#A0253B] text-3xl md:text-4xl'
                                                : 'bg-[#6B8E23] text-white border-[#6B8E23] text-2xl md:text-3xl'
                                        }`}>
                                            ⏰ {Math.floor(alarmTimeLeft / 60)}:{String(alarmTimeLeft % 60).padStart(2, '0')}
                                        </div>
                                    </div>

                                    {/* Controle knoppen */}
                                    <div className="flex gap-3">
                                        {!alarmPaused ? (
                                            <button
                                                onClick={pauseGameAlarm}
                                                className="px-4 py-3 bg-[#D4A574] text-gray-900 rounded-lg font-bold text-sm md:text-base shadow-lg hover:bg-[#C4956A] transition-all"
                                            >
                                                ⏸️ Pauzeer
                                            </button>
                                        ) : (
                                            <button
                                                onClick={resumeGameAlarm}
                                                className="px-4 py-3 bg-[#6B8E23] text-white rounded-lg font-bold text-sm md:text-base shadow-lg hover:bg-[#556B1D] transition-all"
                                            >
                                                ▶️ Hervat
                                            </button>
                                        )}
                                        <button
                                            onClick={resetGameAlarm}
                                            className="px-4 py-3 bg-[#8B6F47] text-white rounded-lg font-bold text-sm md:text-base shadow-lg hover:bg-[#7A5F3C] transition-all"
                                        >
                                            🔄 Reset
                                        </button>
                                        <button
                                            onClick={stopGameAlarm}
                                            className="px-4 py-3 bg-[#A0253B] text-white rounded-lg font-bold text-sm md:text-base shadow-lg hover:bg-[#8B1538] transition-all"
                                        >
                                            ⏹️ Stop
                                        </button>
                                    </div>

                                    {alarmPaused && (
                                        <p className="text-sm md:text-base text-[#A0253B] font-bold">
                                            ⏸️ GEPAUZEERD
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <p className="mt-8 text-[#F5E6D3] text-xs md:text-sm font-medium drop-shadow">
                    Tip: Gebruik pijltjestoetsen, spatiebalk of swipe!
                </p>
                </div>
            );
        }
