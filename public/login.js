// =================================================================
// 1. FIREBASE CONFIGURATION & EMULATOR CONNECTION
// =================================================================

const firebaseConfig = {
  apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg",
  authDomain: "project-kisan-new.firebaseapp.com",
  projectId: "project-kisan-new",
  storageBucket: "project-kisan-new.firebasestorage.app",
  messagingSenderId: "176046173818",
  appId: "1:176046173818:web:de8fb0e50752c8f62195c3",
  measurementId: "G-GDJE785E2N"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// --- 2. LOGIN FORM LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = loginButton.textContent;
        loginButton.disabled = true;
        loginButton.textContent = 'Logging In...';

        try {
            // Use the Firebase Auth SDK to sign the user in
            await auth.signInWithEmailAndPassword(email, password);
            
            console.log("✅ [DEBUG] Login successful!");
            // Redirect to the profile page on successful login
            window.location.href = 'profile.html';

        } catch (error) {
            console.error("❌ [CRITICAL ERROR] Login failed:", error);
            alert(`Login failed: ${error.message}`);
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = originalButtonText;
        }
    });
});