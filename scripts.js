document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Active page
    document.querySelectorAll('nav a').forEach(link => {
        if (link.href === window.location.href) {
            link.classList.add('active');
        }
    });

    // Countdown timer
    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        const launchDate = new Date('2025-04-30T23:59:59').getTime();
        const updateCountdown = () => {
            const now = new Date().getTime();
            const timeLeft = launchDate - now;
            if (timeLeft <= 0) {
                countdownElement.textContent = 'Launch Day!';
                return;
            }
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            countdownElement.textContent = `${days}d ${hours}h to launch!`;
            setTimeout(updateCountdown, 1000);
        };
        updateCountdown();
    }
});
