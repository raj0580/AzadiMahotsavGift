// =========================================================================
// === ACTION REQUIRED: PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE ===
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqoN7rA8ql_iJfGpcZGhKuFi5tGSPbXAc",
  authDomain: "story-website-afab7.firebaseapp.com",
  databaseURL: "https://story-website-afab7-default-rtdb.firebaseio.com",
  projectId: "story-website-afab7",
  storageBucket: "story-website-afab7.firebasestorage.app",
  messagingSenderId: "207838308502",
  appId: "1:207838308502:web:fa12c413c45207f0bdbab7"
};
// =========================================================================

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    let translations = {};
    const elements = {
        initialPopup: document.getElementById('initial-popup'), initialForm: document.getElementById('initial-form'), languageSelect: document.getElementById('language-select'), stateSelect: document.getElementById('state-select'), mainContainer: document.getElementById('main-container'), spinButton: document.getElementById('spin-button'), spinner: document.getElementById('spinner'), spinsLeftText: document.getElementById('spins-left'), winPopup: document.getElementById('win-popup'), winForm: document.getElementById('win-form'), winMessage: document.getElementById('win-message'), taskSection: document.getElementById('task-section'), bonusSection: document.getElementById('bonus-section'), whatsappStoryButton: document.getElementById('whatsapp-story-button'), shareFriendsButton: document.getElementById('share-friends-button'), task1Container: document.getElementById('task-1-container'), task2Container: document.getElementById('task-2-container'), gameSection: document.getElementById('game-section'), hypeSection: document.getElementById('hype-section'), modiWinImage: document.getElementById('modi-win-image'), participantsCount: document.getElementById('participants-count'), rewardsTotal: document.getElementById('rewards-total'), leaderboardList: document.getElementById('leaderboard-list'), progressBarInner: document.getElementById('progress-bar-inner'), progressText: document.getElementById('progress-text')
    };

    const config = {
        prizes: [
            { name: "₹150", icon: "images/prize_1.png" }, { name: "₹5000", icon: "images/prize_2.png" }, { name: "Meet Modi", icon: "images/prize_3.png" }, { name: "₹200", icon: "images/prize_4.png" }, { name: "₹1000", icon: "images/prize_5.png" }, { name: "₹500", icon: "images/prize_6.png" }
        ],
        spinsAllowed: 2, requiredClicks: 10
    };
    let state = {
        spinsLeft: config.spinsAllowed, isSpinning: false, shareClicks: 0,
        // === FIXED: Variable to reliably store the winning prize ===
        currentWinningPrize: null
    };
    let stats = { participants: 145234, rewards: 789450 };
    const fakeData = {
        names: ["Rohan S.", "Priya K.", "Amit P.", "Sneha V.", "Vikram N.", "Anjali G."],
        cities: ["Mumbai", "Delhi", "Bangalore", "Kolkata", "Chennai", "Pune", "Hyderabad"],
        prizes: ["₹150", "₹200", "₹500", "₹1000", "₹5000"]
    };

    function startHype() {
        setInterval(() => {
            stats.participants += Math.floor(Math.random() * 3) + 1;
            stats.rewards += (Math.floor(Math.random() * 5) + 1) * 10;
            elements.participantsCount.textContent = stats.participants.toLocaleString('en-IN');
            elements.rewardsTotal.textContent = stats.rewards.toLocaleString('en-IN');
        }, 3000);
        setInterval(() => {
            const list = elements.leaderboardList;
            if (list.children.length >= 5) { list.removeChild(list.lastChild); }
            const newWinner = document.createElement('li');
            const randomName = fakeData.names[Math.floor(Math.random() * fakeData.names.length)];
            const randomCity = fakeData.cities[Math.floor(Math.random() * fakeData.cities.length)];
            const randomPrize = fakeData.prizes[Math.floor(Math.random() * fakeData.prizes.length)];
            newWinner.innerHTML = `<span>${randomName} from ${randomCity}</span><span class="prize">${randomPrize}</span>`;
            list.insertBefore(newWinner, list.firstChild);
        }, 4500);
    }

    async function setLanguage(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error(`Language file error: ${lang}`);
            translations = await response.json();
            document.querySelectorAll('[data-i18n]').forEach(elem => {
                const key = elem.getAttribute('data-i18n');
                if (key.startsWith('[placeholder]')) {
                    const pKey = key.substring(13);
                    if (translations[pKey]) elem.placeholder = translations[pKey];
                } else if (translations[key]) {
                    elem.innerHTML = translations[key];
                }
            });
            document.documentElement.lang = lang;
        } catch (error) { console.error(error); }
    }

    function initialize() {
        const savedLang = localStorage.getItem('userLanguage');
        const savedState = localStorage.getItem('userState');
        if (savedLang && savedState) {
            elements.mainContainer.style.display = 'block';
            setLanguage(savedLang);
            populateWheel();
            updateSpinsDisplay();
            startHype();
        } else {
            setLanguage('en');
            elements.initialPopup.classList.add('visible');
        }
    }

    elements.initialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const lang = elements.languageSelect.value;
        const st = elements.stateSelect.value;
        localStorage.setItem('userLanguage', lang);
        localStorage.setItem('userState', st);
        elements.initialPopup.classList.remove('visible');
        elements.mainContainer.style.display = 'block';
        await setLanguage(lang);
        populateWheel();
        updateSpinsDisplay();
        startHype();
    });

    elements.spinButton.addEventListener('click', handleSpin);
    elements.winForm.addEventListener('submit', handleWinFormSubmit);
    elements.whatsappStoryButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(e.currentTarget.href, '_blank');
        elements.task1Container.style.display = 'none';
        elements.task2Container.style.display = 'block';
    });
    elements.shareFriendsButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.shareClicks >= config.requiredClicks) return;
        state.shareClicks++;
        const progressPercentage = (state.shareClicks / config.requiredClicks) * 100;
        elements.progressBarInner.style.width = `${progressPercentage}%`;
        elements.progressText.textContent = `${state.shareClicks}/${config.requiredClicks}`;
        window.open(e.currentTarget.href, '_blank');
        if (state.shareClicks >= config.requiredClicks) {
            e.currentTarget.classList.add('disabled');
            e.currentTarget.textContent = "Reward Unlocked!";
            setTimeout(() => {
                alert(translations.alert_reward_processed);
                elements.taskSection.style.display = 'none';
                elements.bonusSection.style.display = 'block';
            }, 500);
        }
    });

    function populateWheel() {
        elements.spinner.innerHTML = '';
        const segCount = config.prizes.length;
        const degPerSeg = 360 / segCount;
        config.prizes.forEach((prize, index) => {
            const segment = document.createElement('div');
            segment.className = 'segment';
            segment.style.transform = `rotate(${index * degPerSeg}deg)`;
            const prizeIcon = document.createElement('img');
            prizeIcon.src = prize.icon;
            prizeIcon.alt = prize.name;
            prizeIcon.className = 'prize-icon';
            segment.appendChild(prizeIcon);
            elements.spinner.appendChild(segment);
        });
    }

    function handleSpin() {
        if (state.isSpinning || state.spinsLeft <= 0) return;
        state.isSpinning = true;
        state.spinsLeft--;
        updateSpinsDisplay();
        elements.spinButton.classList.add('disabled');
        const winningIndex = Math.floor(Math.random() * config.prizes.length);
        const winningPrize = config.prizes[winningIndex];
        const degPerSeg = 360 / config.prizes.length;
        const currentTransform = window.getComputedStyle(elements.spinner).transform;
        let currentRotation = 0;
        if (currentTransform !== 'none') {
            const values = currentTransform.split('(')[1].split(')')[0].split(',');
            currentRotation = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI));
        }
        const rotation = (360 * 5) - (currentRotation % 360) + (360 - (winningIndex * degPerSeg) - (degPerSeg / 2));
        elements.spinner.style.transition = 'transform 6s cubic-bezier(0.25, 0.1, 0.25, 1)';
        elements.spinner.style.transform = `rotate(${currentRotation + rotation}deg)`;
        setTimeout(() => {
            state.isSpinning = false;
            elements.spinButton.classList.remove('disabled');
            // === FIXED: Securely store the prize object ===
            state.currentWinningPrize = winningPrize;
            showWinPopup();
        }, 6500);
    }

    function updateSpinsDisplay() {
        elements.spinsLeftText.textContent = state.spinsLeft;
    }

    function showWinPopup() {
        if (!state.currentWinningPrize) return; // Safety check
        const prize = state.currentWinningPrize;
        elements.winMessage.textContent = `You've won: ${prize.name}!`;
        if (prize.name === "Meet Modi") {
            elements.modiWinImage.style.display = 'block';
        } else {
            elements.modiWinImage.style.display = 'none';
        }
        elements.winPopup.classList.add('visible');
        setupShareButtons(prize.name);
    }

    function handleWinFormSubmit(e) {
        e.preventDefault();
        // === FIXED: Use the securely stored prize name, no more errors ===
        if (!state.currentWinningPrize) {
            alert("An error occurred. Please try again.");
            return;
        }
        const prizeWonText = state.currentWinningPrize.name;
        const winnerData = {
            name: document.getElementById('winner-name').value,
            mobile: document.getElementById('winner-mobile').value,
            prize: prizeWonText,
            state: localStorage.getItem('userState'),
            timestamp: new Date().toISOString()
        };
        database.ref('winners/' + winnerData.mobile + '_' + Date.now()).set(winnerData)
            .then(() => {
                alert(translations.alert_details_saved);
                elements.winPopup.classList.remove('visible');
                elements.gameSection.style.display = 'none';
                elements.hypeSection.style.display = 'none';
                elements.taskSection.style.display = 'block';
            })
            .catch((error) => {
                console.error("Firebase save error:", error);
                alert(translations.alert_save_error);
            });
    }

    function setupShareButtons(prizeName) {
        const shareMsg = encodeURIComponent(`I just won ${prizeName} in the Independence Day event! You can try your luck too! Join here: ${window.location.href}`);
        if (elements.whatsappStoryButton) {
            elements.whatsappStoryButton.href = `https://wa.me/?text=${shareMsg}`;
        }
        if (elements.shareFriendsButton) {
            elements.shareFriendsButton.href = `https://wa.me/?text=${shareMsg}`;
        }
        const bonusMsg = encodeURIComponent(`🔥 BIGGEST REWARD! 🔥 Share with 25 friends to win ₹50,000 + Dinner with PM Modi! Join now: ${window.location.href}`);
        if (elements.bonusShareButton) {
            elements.bonusShareButton.href = `https://wa.me/?text=${bonusMsg}`;
        }
    }

    initialize();
});
