const zone = document.getElementById("zone");
        const yesBtn = document.getElementById("yesBtn");
        const noBtn = document.getElementById("noBtn");
        const result = document.getElementById("result");
        const hint = document.getElementById("hint");
        const yesMessage = document.getElementById("yesMessage");
        const week = document.getElementById("week");
        const bgMusic = document.getElementById("bgMusic");
        const backBtn = document.getElementById("backBtn");
        const moreBtn = document.getElementById("moreBtn");
        const landing = document.getElementById("landing");
        const startBtn = document.getElementById("startBtn");
        const mainCard = document.getElementById("mainCard");
        const moreSection = document.getElementById("moreSection");
        const moreBackBtn = document.getElementById("moreBackBtn");
        const modal = document.getElementById("modal");
        const modalIcon = document.getElementById("modalIcon");
        const modalTitle = document.getElementById("modalTitle");
        const modalBody = document.getElementById("modalBody");
        const modalClose = document.getElementById("modalClose");
        const questionTitle = document.getElementById("questionTitle");
        let audioCtx, analyser, dataArray, visualizerId;
        const playMusic = () => {
            bgMusic.volume = 0.5;
            bgMusic.loop = true;
            bgMusic.play().catch(() => { });
            
            // Audio Visualizer Setup
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioCtx.createMediaElementSource(bgMusic);
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            
            const animateVisualizer = () => {
                if (bgMusic.paused) return;
                analyser.getByteFrequencyData(dataArray);
                
                // Get average bass frequency
                let bassSum = 0;
                for(let i=0; i<10; i++) bassSum += dataArray[i];
                let avgBass = bassSum / 10;
                
                // Scale from 1 to 1.05 based on bass
                let scale = 1 + (avgBass / 255) * 0.05;
                let glow = (avgBass / 255) * 30;
                
                // Apply subtle pulsing to body background and result section
                document.body.style.boxShadow = `inset 0 0 ${glow}px rgba(255, 111, 163, 0.3)`;
                if(result.style.display === "block") {
                    result.style.transform = `scale(${scale})`;
                }
                
                visualizerId = requestAnimationFrame(animateVisualizer);
            };
            animateVisualizer();
        };

        const stopMusic = () => {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            if (visualizerId) cancelAnimationFrame(visualizerId);
            document.body.style.boxShadow = "none";
            if(result.style.display === "block") {
                result.style.transform = "scale(1)";
            }
        };

        /* ---------- CONFETTI ---------- */
        const confettiCanvas = document.getElementById("confettiCanvas");

        function resizeConfettiCanvas() {
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            confettiCanvas.width = Math.floor(window.innerWidth * dpr);
            confettiCanvas.height = Math.floor(window.innerHeight * dpr);
            confettiCanvas.style.width = "100vw";
            confettiCanvas.style.height = "100vh";
        }

        resizeConfettiCanvas();
        window.addEventListener("resize", resizeConfettiCanvas);
        window.addEventListener("orientationchange", () =>
            setTimeout(resizeConfettiCanvas, 150),
        );

        const confettiInstance = confetti.create(confettiCanvas, {
            resize: false,
            useWorker: true,
        });

        function fullScreenConfetti() {
            const end = Date.now() + 1600;

            (function frame() {
                confettiInstance({
                    particleCount: 12,
                    spread: 90,
                    startVelocity: 45,
                    ticks: 180,
                    origin: { x: Math.random(), y: Math.random() * 0.3 },
                });
                if (Date.now() < end) requestAnimationFrame(frame);
            })();

            setTimeout(() => {
                confettiInstance({
                    particleCount: 300,
                    spread: 140,
                    startVelocity: 60,
                    ticks: 220,
                    origin: { x: 0.5, y: 0.55 },
                });
            }, 300);
        }

        /* ---------- YES BUTTON GROWS ---------- */
        let yesScale = 1;
        const initialNo = { left: "62%", top: "50%" };
        function growYes() {
            yesScale = Math.min(2.2, yesScale + 0.1);
            yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
        }

        /* ---------- NO BUTTON RUNS AWAY ---------- */
        function clamp(n, min, max) {
            return Math.max(min, Math.min(max, n));
        }

        function moveNo(px, py) {
            const z = zone.getBoundingClientRect();
            const b = noBtn.getBoundingClientRect();

            let dx = b.left + b.width / 2 - px;
            let dy = b.top + b.height / 2 - py;
            let mag = Math.hypot(dx, dy) || 1;
            dx /= mag;
            dy /= mag;

            let newLeft = b.left - z.left + dx * 150;
            let newTop = b.top - z.top + dy * 150;

            newLeft = clamp(newLeft, 0, z.width - b.width);
            newTop = clamp(newTop, 0, z.height - b.height);

            noBtn.style.left = newLeft + "px";
            noBtn.style.top = newTop + "px";
            noBtn.style.transform = "none";

            // Haptic feedback on escape
            if (navigator.vibrate) navigator.vibrate(12);

            growYes();
        }

        zone.addEventListener("pointermove", (e) => {
            const b = noBtn.getBoundingClientRect();
            const d = Math.hypot(
                b.left + b.width / 2 - e.clientX,
                b.top + b.height / 2 - e.clientY,
            );
            if (d < 140) moveNo(e.clientX, e.clientY);
        });

        noBtn.addEventListener("click", (e) => e.preventDefault());

        /* ---------- YES CLICK (with micro-delays) ---------- */
        yesBtn.addEventListener("click", () => {
            zone.style.display = "none";
            hint.style.display = "none";
            week.style.display = "none";
            moreSection.style.display = "none";
            moreSection.setAttribute("aria-hidden", "true");

            // Brief cinematic pause before reveal
            questionTitle.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            questionTitle.style.opacity = "0";
            questionTitle.style.transform = "translateY(-8px)";

            setTimeout(() => {
                questionTitle.textContent = "I knew it that you will say yes!";
                questionTitle.style.opacity = "1";
                questionTitle.style.transform = "translateY(0)";
            }, 400);

            // Show result with staggered children
            setTimeout(() => {
                result.style.display = "block";
                result.classList.add("reveal");
                resizeConfettiCanvas();
                fullScreenConfetti();
            }, 600);

            // Haptic feedback
            if (navigator.vibrate) navigator.vibrate([30, 20, 30]);

            // Start music after user interaction
            playMusic();
        });

        const transitionDim = document.getElementById("transitionDim");


/* ---------- MINI GAME ---------- */
const minigame = document.getElementById("minigame");
const gameArea = document.getElementById("gameArea");
const scoreBoard = document.getElementById("scoreBoard");
const skipGameBtn = document.getElementById("skipGameBtn");
let heartsCaught = 0;
let gameActive = false;

function spawnHeart() {
    if(!gameActive) return;
    const heart = document.createElement("div");
    heart.innerHTML = "💖";
    heart.style.position = "absolute";
    heart.style.fontSize = "32px";
    heart.style.cursor = "pointer";
    heart.style.userSelect = "none";
    heart.style.left = Math.random() * (gameArea.offsetWidth - 40) + "px";
    heart.style.top = Math.random() * (gameArea.offsetHeight - 40) + "px";
    
    heart.addEventListener("mousedown", () => {
        if(!gameActive) return;
        heart.remove();
        heartsCaught++;
        scoreBoard.textContent = `${heartsCaught} / 5`;
        if(navigator.vibrate) navigator.vibrate(20);
        
        if(heartsCaught >= 5) {
            gameActive = false;
            winGame();
        }
    });
    
    gameArea.appendChild(heart);
    
    setTimeout(() => {
        if(heart.parentNode) heart.remove();
    }, 1200);
    
    setTimeout(spawnHeart, 600);
}

function startGame() {
    landing.classList.add("envelope-open");
    transitionDim.classList.add("active");

    setTimeout(() => {
        landing.classList.add("is-hidden");
    }, 300);

    setTimeout(() => {
        minigame.classList.remove("is-off");
        minigame.classList.add("cinematic-enter");
        minigame.classList.remove("is-hidden");
        landing.classList.add("is-off");
        gameActive = true;
        heartsCaught = 0;
        scoreBoard.textContent = `0 / 5`;
        spawnHeart();
    }, 600);

    setTimeout(() => {
        transitionDim.classList.remove("active");
    }, 1000);
}

function winGame() {
    transitionDim.classList.add("active");
    setTimeout(() => {
        minigame.classList.add("is-hidden");
    }, 300);
    setTimeout(() => {
        mainCard.classList.remove("is-off");
        mainCard.classList.add("cinematic-enter");
        mainCard.classList.remove("is-hidden");
        minigame.classList.add("is-off");
    }, 600);
    setTimeout(() => {
        transitionDim.classList.remove("active");
    }, 1000);
}

// startBtn listener has been replaced
skipGameBtn.addEventListener("click", () => {
    gameActive = false;
    winGame();
});

startBtn.addEventListener('click', startGame);

        backBtn.addEventListener("click", () => {
            result.style.display = "none";
            result.classList.remove("reveal");
            zone.style.display = "block";
            hint.style.display = "block";
            week.style.display = "block";
            questionTitle.innerHTML = "Will you be my valentine?";
            questionTitle.style.opacity = "1";
            questionTitle.style.transform = "none";
            moreSection.style.display = "none";
            moreSection.setAttribute("aria-hidden", "true");

            yesScale = 1;
            yesBtn.style.transform = "translateY(-50%) scale(1)";
            noBtn.style.left = initialNo.left;
            noBtn.style.top = initialNo.top;
            noBtn.style.transform = "translateY(-50%)";

            stopMusic();
        });

        moreBtn.addEventListener("click", () => {
            result.style.display = "none";
            moreSection.style.display = "block";
            moreSection.setAttribute("aria-hidden", "false");
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        moreBackBtn.addEventListener("click", () => {
            moreSection.style.display = "none";
            moreSection.setAttribute("aria-hidden", "true");
            result.style.display = "block";
        });

        document.querySelectorAll(".more-card").forEach((card) => {
            card.addEventListener("click", () => {
                const type = card.getAttribute("data-card");
                if (type === "why") {
                    modalIcon.textContent = "💗";
                    modalTitle.textContent = "Why I Love You";
                    modalBody.textContent =
                        "Because you listen to me like my words matter. Because you make me feel safe being completely, unapologetically myself. Because you're the person I want to tell everything to—the big dreams and the tiny worries. And because every moment with you feels like coming home. 🏡💕";
                } else if (type === "like") {
                    modalIcon.textContent = "✨";
                    modalTitle.textContent = "Things I Adore About You";
                    modalBody.textContent =
                        "Your radiant laugh that lights up every room you enter. The gentle way you care about people and make them feel valued. How you find beauty in small things and make me see the world through kinder eyes. And the way you made me believe in love when I wasn't sure I would. You're everything, really. 🌟💕";
                } else if (type === "cute") {
                    modalIcon.textContent = "🎁";
                    modalTitle.textContent = "A Little Secret Just for You";
                    modalBody.textContent =
                        "I love you beyond words and reason. You're my favorite chapter, my sweetest memory, and my brightest tomorrow. So here's a little box overflowing with all the love my heart can hold—one promise for every moment we'll share together. 💕✨🎁";
                } else if (type === "memories") {
                    moreSection.style.display = "none";
                    document.getElementById("memorySection").style.display = "block";
                    return;
                }

                modal.classList.add("open");
                modal.setAttribute("aria-hidden", "false");
            });
        });

        const memoryBackBtn = document.getElementById("memoryBackBtn");
        if (memoryBackBtn) {
            memoryBackBtn.addEventListener("click", () => {
                document.getElementById("memorySection").style.display = "none";
                moreSection.style.display = "block";
            });
        }

        function closeModal() {
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
        }

        modalClose.addEventListener("click", closeModal);
        modal.addEventListener("click", (event) => {
            if (event.target === modal) closeModal();
        });

        /* ---------- VALENTINE WEEK CALCULATOR ---------- */
        const weekGrid = document.getElementById("weekGrid");
        const weekNote = document.getElementById("weekNote");

        const valentineWeek = [
            {
                date: "07/02/2026",
                label: "💍 Propose Day",
                desc: "A gentle promise of how much you mean to me.",
            },
            {
                date: "08/02/2026",
                label: "🍫 Chocolate Day",
                desc: "Sweet moments, just like you.",
            },
            {
                date: "09/02/2026",
                label: "🧸 Teddy Day",
                desc: "A soft reminder that you’re always hugged in my heart.",
            },
            {
                date: "10/02/2026",
                label: "🤝 Promise Day",
                desc: "I’ll keep choosing you, every day.",
            },
            {
                date: "11/02/2026",
                label: "🤗 Hug Day",
                desc: "Safe, warm, and right where I belong.",
            },
            {
                date: "12/02/2026",
                label: "💋 Kiss Day",
                desc: "A quiet kiss for a thousand feelings.",
            },
            {
                date: "14/02/2026",
                label: "❤️ Valentine’s Day",
                desc: "You’re my favorite part of every day.",
            },
        ];

        function getTodayKey() {
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, "0");
            const mm = String(now.getMonth() + 1).padStart(2, "0");
            const yyyy = now.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        }

        function renderValentineWeek() {
            const todayKey = getTodayKey();
            let activeFound = false;

            weekGrid.innerHTML = "";

            valentineWeek.forEach((day) => {
                const item = document.createElement("div");
                item.className = "day";
                item.innerHTML = `<strong>${day.label}</strong><small>${day.date.replace("-", " ")}</small>`;

                if (day.date === todayKey) {
                    item.classList.add("active");
                    weekNote.textContent = day.desc;
                    activeFound = true;
                }

                weekGrid.appendChild(item);
            });

            if (!activeFound) {
                weekNote.textContent = "Valentine Week is coming soon 💖";
            }
        }

        renderValentineWeek();
        setInterval(renderValentineWeek, 60 * 60 * 1000); // refresh hourly