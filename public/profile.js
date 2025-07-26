// profile.js

// --- 1. INITIALIZE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyC4Aeebs6yLYHq-ZlDDMpUcTwvCYX48KRg",
  authDomain: "project-kisan-new.firebaseapp.com",
  projectId: "project-kisan-new",
  storageBucket: "project-kisan-new.firebasestorage.app",
  messagingSenderId: "176046173818",
  appId: "1:176046173818:web:de8fb0e50752c8f62195c3",
  measurementId: "G-GDJE785E2N"
};


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const functions = firebase.app().functions('asia-south1');

// Create callable reference
const getUserProfile = functions.httpsCallable('getUserProfile');

// --- 2. PROFILE PAGE LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading-profile');
    const profileDiv = document.getElementById('profile-content');
    const logoutButton = document.getElementById('logout-button');

    // Listen for authentication state changes
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in. Let's get their profile.
            console.log("✅ [DEBUG] User is logged in, fetching profile...");
            try {
                const result = await getUserProfile();
                const profileData = result.data;
                
                console.log("✅ [DEBUG] Profile data received:", profileData);

                // Populate the UI
                document.getElementById('welcome-message').textContent = `Welcome, ${profileData.firstName}!`;
                document.getElementById('profile-email').textContent = profileData.email;
                document.getElementById('profile-mobile').textContent = profileData.mobileNumber;

                // Show profile content and hide loader
                loadingDiv.classList.add('hidden');
                profileDiv.classList.remove('hidden');

            } catch (error) {
                console.error("❌ [CRITICAL ERROR] Could not fetch profile:", error);
                loadingDiv.innerHTML = `<p>Error loading profile: ${error.message}</p>`;
            }
        } else {
            // User is signed out. Redirect to login page.
            console.log("User is not logged in. Redirecting to login.html");
            window.location.href = 'login.html';
        }
    });

    // Handle logout
    logoutButton.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
            await auth.signOut();
            console.log("User signed out successfully.");
            // The onAuthStateChanged listener will automatically redirect to the login page.
        } catch (error) {
            console.error("Error signing out:", error);
            alert("Error signing out. Please try again.");
        }
    });
});