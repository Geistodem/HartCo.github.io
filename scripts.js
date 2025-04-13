// Simple SHA-256 hash (for demo only)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

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

    // Login system
    const loginLink = document.getElementById('loginLink');
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        loginLink.textContent = 'Account';
        loginLink.href = 'account.html';
    } else {
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
    }

    // Protect account page only
    if (window.location.pathname.includes('account.html') && !loggedInUser) {
        window.location.href = 'login.html';
    }

    // Cart icon visibility
    const cartIcons = document.querySelectorAll('.cart-icon');
    const updateCartVisibility = () => {
        const cartCount = parseInt(document.querySelector('.snipcart-items-count')?.textContent || '0', 10);
        cartIcons.forEach(icon => {
            if (cartCount > 0) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });
    };

    // Initial check
    updateCartVisibility();

    // Listen for Snipcart events
    document.addEventListener('snipcart.ready', () => {
        Snipcart.events.on('cart.confirmed', () => {
            updateCartVisibility();
        });
        Snipcart.events.on('item.added', () => {
            updateCartVisibility();
        });
        Snipcart.events.on('item.removed', () => {
            updateCartVisibility();
        });
    });

    // Add login check for adding items to cart
    const addToCartButtons = document.querySelectorAll('.snipcart-add-item');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!loggedInUser) {
                e.preventDefault(); // Stop Snipcart action
                alert('Please log in to add items to your cart.');
                window.location.href = 'login.html';
            }
            // If logged in, Snipcart will handle the add-to-cart action
        });
    });
});
