document.addEventListener('DOMContentLoaded', () => {
    // Page elements
    const scratchCta = document.getElementById('scratch-cta');
    const scratchCanvas = document.getElementById('scratch-canvas');
    const rewardDisplay = document.getElementById('reward-display');
    const shareModal = document.getElementById('share-modal');
    const winMessage = document.getElementById('win-message');
    const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
    const shareCountSpan = document.getElementById('share-count');
    const claimRewardBtn = document.getElementById('claim-reward-btn');
    const liveWinnerP = document.getElementById('live-winner');

    // State
    let isScratched = false;

    // Prizes
    const prizes = ["₹150", "₹500", "₹5000", "🎟️ VIP Dinner Ticket", "Retry Again"];
    const selectedPrize = prizes[Math.floor(Math.random() * prizes.length)];

    // Live winners simulation
    const fakeWinners = [
        "Amit from Delhi won ₹500!",
        "Priya from Mumbai won a VIP Dinner Ticket!",
        "Rajesh from Gujarat won ₹150!",
        "Sunita from UP won ₹5000!",
        "Anil from Rajasthan won ₹150!"
    ];
    let winnerIndex = 0;
    liveWinnerP.textContent = fakeWinners[0];
    setInterval(() => {
        winnerIndex = (winnerIndex + 1) % fakeWinners.length;
        liveWinnerP.textContent = fakeWinners[winnerIndex];
    }, 4000);

    // Setup Scratch Card
    const ctx = scratchCanvas.getContext('2d');
    const scratchImage = new Image();
    
    const initScratchCard = () => {
        rewardDisplay.innerText = selectedPrize;
        scratchImage.src = 'images/chakra-pattern.png';
        scratchImage.onload = () => {
             ctx.drawImage(scratchImage, 0, 0, scratchCanvas.width, scratchCanvas.height);
        };
    };
    
    // Use a simple tap-to-reveal instead of complex scratch logic
    scratchCta.addEventListener('click', () => {
        if (isScratched) return;
        isScratched = true;

        scratchCanvas.style.transition = 'opacity 0.8s ease-out';
        scratchCanvas.style.opacity = '0';
        
        setTimeout(() => {
            scratchCta.classList.add('hidden');
            if (selectedPrize !== 'Retry Again') {
                confetti({ particleCount: 150, spread: 180, origin: { y: 0.6 } });
                winMessage.innerText = `🎁 You’ve won ${selectedPrize}!`;
                shareModal.classList.remove('hidden');
                localStorage.setItem('userReward', selectedPrize);
            } else {
                rewardDisplay.innerText = "Better Luck Next Time!";
            }
        }, 800);
    });

    // Share logic
    let shareCount = parseInt(localStorage.getItem('shareCount')) || 0;
    shareCountSpan.innerText = shareCount;
    
    if (shareCount >= 15) {
        claimRewardBtn.disabled = false;
        claimRewardBtn.classList.remove('hidden');
        whatsappShareBtn.classList.add('hidden'); // Hide share button if already done
    }

    whatsappShareBtn.addEventListener('click', () => {
        shareCount++;
        shareCountSpan.innerText = shareCount;
        localStorage.setItem('shareCount', shareCount);

        if (shareCount >= 15) {
            claimRewardBtn.disabled = false;
            claimRewardBtn.classList.remove('hidden');
            whatsappShareBtn.classList.add('hidden');
            alert("Congratulations! You've unlocked the reward form.");
        } else {
            alert(`Shared ${shareCount} time(s). Share ${15 - shareCount} more time(s) to unlock.`);
        }

        const message = `🪔 Celebrate Azadi Ka Mahotsav!\nI just won ${selectedPrize} in a Lucky Draw by BJP Supporters!\n🎁 You can also win ₹1 Lakh or Dinner Invite!\n👉 ${window.location.origin}\nInspired by PM Modi Ji’s Digital India vision 🇮🇳`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    claimRewardBtn.addEventListener('click', () => {
        window.location.href = 'form.html';
    });

    // Initialize
    initScratchCard();
});