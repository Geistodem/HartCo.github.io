// Firebase Configuration
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
try {
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log('Firebase auth:', auth);
} catch (error) {
    console.error('Firebase initialization error:', error);
}

// Countdown Timer for Index Page
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

// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Update Nav Based on Auth State
const loginLink = document.getElementById('loginLink');
const cartIcon = document.querySelector('.cart-icon');
firebase.auth().onAuthStateChanged(user => {
    console.log('Auth state changed:', user);
    if (user) {
        loginLink.textContent = 'Account';
        loginLink.href = 'account.html';
        cartIcon.classList.add('active');
    } else {
        loginLink.textContent = 'Login';
        loginLink.href = 'login.html';
        cartIcon.classList.remove('active');
        if (window.location.pathname.includes('account.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Login/Sign-Up Form Handling
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        console.log('Form submitted');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const isSignup = document.getElementById('formTitle').textContent === 'Sign Up';

        if (isSignup) {
            const name = document.getElementById('name').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            console.log('Attempting sign-up');
            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    console.log('Sign-up successful:', userCredential);
                    return userCredential.user.updateProfile({ displayName: name });
                })
                .then(() => {
                    console.log('Profile updated, redirecting');
                    window.location.href = 'account.html';
                })
                .catch(error => {
                    console.error('Sign-up error:', error);
                    alert(error.message);
                });
        } else {
            console.log('Attempting login');
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then(() => {
                    console.log('Login successful, redirecting');
                    window.location.href = 'account.html';
                })
                .catch(error => {
                    console.error('Login error:', error);
                    alert(error.message);
                });
        }
    });
}

// Account Page Handling
const userName = document.getElementById('userName');
const preOrdersList = document.getElementById('preOrdersList');
const logoutButton = document.getElementById('logoutButton');

if (userName && preOrdersList && logoutButton) {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            userName.textContent = user.displayName || 'User';
            db.collection('preOrders').where('userId', '==', user.uid).get()
                .then(querySnapshot => {
                    preOrdersList.innerHTML = '';
                    querySnapshot.forEach(doc => {
                        const order = doc.data();
                        const li = document.createElement('li');
                        li.textContent = `${order.itemName} - $${order.price}`;
                        preOrdersList.appendChild(li);
                    });
                })
                .catch(error => {
                    console.error('Error fetching pre-orders:', error);
                });
        }
    });

    logoutButton.addEventListener('click', () => {
        firebase.auth().signOut()
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert(error.message);
            });
    });
}

// Account Settings Handling
const updateNameForm = document.getElementById('updateNameForm');
const updateEmailForm = document.getElementById('updateEmailForm');
const updatePasswordForm = document.getElementById('updatePasswordForm');
const deleteAccountButton = document.getElementById('deleteAccountButton');

if (updateNameForm) {
    updateNameForm.addEventListener('submit', e => {
        e.preventDefault();
        const newName = document.getElementById('newName').value;
        const user = firebase.auth().currentUser;
        if (user) {
            user.updateProfile({ displayName: newName })
                .then(() => {
                    alert('Name updated successfully!');
                    userName.textContent = newName;
                })
                .catch(error => {
                    console.error('Error updating name:', error);
                    alert(error.message);
                });
        }
    });
}

if (updateEmailForm) {
    updateEmailForm.addEventListener('submit', e => {
        e.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        const user = firebase.auth().currentUser;
        if (user) {
            user.updateEmail(newEmail)
                .then(() => {
                    alert('Email updated successfully! Please log in again.');
                    firebase.auth().signOut().then(() => {
                        window.location.href = 'login.html';
                    });
                })
                .catch(error => {
                    console.error('Error updating email:', error);
                    alert(error.message);
                });
        }
    });
}

if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        if (newPassword !== confirmNewPassword) {
            alert('Passwords do not match!');
            return;
        }
        const user = firebase.auth().currentUser;
        if (user) {
            user.updatePassword(newPassword)
                .then(() => {
                    alert('Password updated successfully! Please log in again.');
                    firebase.auth().signOut().then(() => {
                        window.location.href = 'login.html';
                    });
                })
                .catch(error => {
                    console.error('Error updating password:', error);
                    alert(error.message);
                });
        }
    });
}

if (deleteAccountButton) {
    deleteAccountButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const user = firebase.auth().currentUser;
            if (user) {
                // Delete pre-orders from Firestore
                db.collection('preOrders').where('userId', '==', user.uid).get()
                    .then(querySnapshot => {
                        const batch = db.batch();
                        querySnapshot.forEach(doc => {
                            batch.delete(doc.ref);
                        });
                        return batch.commit();
                    })
                    .then(() => {
                        // Delete user account
                        return user.delete();
                    })
                    .then(() => {
                        alert('Account deleted successfully.');
                        window.location.href = 'index.html';
                    })
                    .catch(error => {
                        console.error('Error deleting account:', error);
                        alert(error.message);
                    });
            }
        }
    });
}

// Snipcart Cart Confirmation
document.addEventListener('snipcart.ready', () => {
    Snipcart.events.on('cart.confirmed', (cart) => {
        const user = firebase.auth().currentUser;
        if (user) {
            cart.items.items.forEach(item => {
                db.collection('preOrders').add({
                    userId: user.uid,
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
