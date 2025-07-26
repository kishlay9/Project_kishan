// signup.js

// --- 1. INITIALIZE FIREBASE (REQUIRED FOR 'onCall' FUNCTIONS) ---
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
const functions = firebase.app().functions('asia-south1');

// Create a callable reference to your cloud function.
const createUserAccount = functions.httpsCallable('createUserAccount');

// --- 2. SIGNUP FORM LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) return;

    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Get form data
        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const mobileNumber = document.getElementById('mobile').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const signupButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = signupButton.textContent;
        signupButton.disabled = true;
        signupButton.textContent = 'Creating Account...';

        try {
            // Call the cloud function with the form data
            const result = await createUserAccount({
                firstName,
                lastName,
                mobileNumber,
                email,
                password
            });

            console.log("✅ [DEBUG] Account creation successful:", result.data);

            // Handle success
            if (result.data.success) {
                alert(result.data.message);
                // Redirect to the profile page after successful signup
                window.location.href = 'profile.html';
            } else {
                // This case is unlikely if the function throws errors correctly, but good for safety.
                throw new Error(result.data.message || 'An unknown error occurred.');
            }

        } catch (error) {
            console.error("❌ [CRITICAL ERROR] Account creation failed:", error);
            // Display a user-friendly error message
            alert(`Error creating account: ${error.message}`);
        } finally {
            // Re-enable the button
            signupButton.disabled = false;
            signupButton.textContent = originalButtonText;
        }
    });
});