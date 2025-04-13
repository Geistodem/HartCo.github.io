// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA8cadJkRLEXIzLJ1cFAAEsQONE_Y1yeKQ",
    authDomain: "hart-co-clothing.firebaseapp.com",
    projectId: "hart-co-clothing",
    storageBucket: "hart-co-clothing.firebasestorage.app",
    messagingSenderId: "340063171574",
    appId: "1:340063171574:web:25a5a7104b95c2503e4dd7",
    measurementId: "G-GWXVQ15RQN"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    // Hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    // Active page (with normalized URLs)
    document.querySelectorAll('nav a').forEach(link => {
        const linkPath = new URL(link.href).pathname;
        const currentPath = new URL(window.location.href).pathname;
        if (linkPath === currentPath) {
            link.classList.add('active');
        }
    });

    // Countdown timer (with minutes)
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
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            countdownElement.textContent = `${days}d ${hours}h ${minutes}m to launch!`;
            setTimeout(updateCountdown, 1000);
        };
        updateCountdown();
    }

    // Handle authentication state (with null check)
    const loginLink = document.getElementById('loginLink');
    auth.onAuthStateChanged(user => {
        if (loginLink) {
            if (user) {
                loginLink.textContent = 'Account';
                loginLink.href = 'account.html';
            } else {
                loginLink.textContent = 'Login';
                loginLink.href = 'login.html';
            }
        }

        // Protect account page
        if (window.location.pathname.includes('account.html') && !user) {
            window.location.href = 'login.html';
        }

        // Update account page with user info
        if (window.location.pathname.includes('account.html') && user) {
            document.getElementById('userName').textContent = user.displayName || 'User';
            loadUserPreOrders(user.uid);
        }
    });

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

        // Limit pre-orders to 50
        Snipcart.events.on('item.adding', (item) => {
            return db.collectionGroup('preOrders').get()
                .then(snapshot => {
                    if (snapshot.size >= 50) {
                        alert('Sorry, we’ve reached our 50 pre-order limit!');
                        throw new Error('Pre-order limit reached');
                    }
                });
        });
    });

    // Require login to add items to cart (with debouncing)
    const addToCartButtons = document.querySelectorAll('.snipcart-add-item');
    addToCartButtons.forEach(button => {
        let isProcessing = false;
        button.addEventListener('click', (e) => {
            if (isProcessing) return;
            isProcessing = true;
            setTimeout(() => { isProcessing = false; }, 1000);
            if (!auth.currentUser) {
                e.preventDefault();
                alert('Please log in to add items to your cart.');
                window.location.href = 'login.html';
            }
        });
    });

    // Login/Signup form handling (with password length validation)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            if (name && confirmPassword) {
                // Sign-up
                if (password !== confirmPassword) {
                    alert('Passwords do not match.');
                    return;
                }
                if (password.length < 6) {
                    alert('Password must be at least 6 characters long.');
                    return;
                }
                auth.createUserWithEmailAndPassword(email, password)
                    .then(userCredential => {
                        return userCredential.user.updateProfile({ displayName: name });
                    })
                    .then(() => {
                        window.location.href = 'account.html';
                    })
                    .catch(error => {
                        alert(error.message);
                    });
            } else {
                // Login
                auth.signInWithEmailAndPassword(email, password)
                    .then(() => {
                        window.location.href = 'account.html';
                    })
                    .catch(error => {
                        alert(error.message);
                    });
            }
        });
    }

    // Logout (with error handling)
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    alert('Error signing out: ' + error.message);
                });
        });
    }
});

// Load user's pre-orders from Firestore (with loading state and error handling)
function loadUserPreOrders(uid) {
    const preOrdersList = document.getElementById('preOrdersList');
    if (!preOrdersList) return;

    preOrdersList.innerHTML = '<p>Loading...</p>';
    db.collection('users').doc(uid).collection('preOrders').get()
        .then(querySnapshot => {
            preOrdersList.innerHTML = '';
            if (querySnapshot.empty) {
                preOrdersList.innerHTML = '<p>No pre-orders yet.</p>';
                return;
            }
            querySnapshot.forEach(doc => {
                const order = doc.data();
                const li = document.createElement('li');
                li.textContent = `${order.itemName} - $${order.price}`;
                preOrdersList.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Error loading pre-orders:', error);
            preOrdersList.innerHTML = '<p>Error loading pre-orders.</p>';
        });
}

// Save pre-order to Firestore when Snipcart order is confirmed (with error handling)
document.addEventListener('snipcart.ready', () => {
    Snipcart.events.on('cart.confirmed', (cart) => {
        const user = auth.currentUser;
        if (user) {
            cart.items.items.forEach(item => {
                db.collection('users').doc(user.uid).collection('preOrders').add({
                    itemName: item.name,
                    price: item.price,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(error => {
                    console.error('Error saving pre-order:', error);
                });
            });
        }
    });
});
