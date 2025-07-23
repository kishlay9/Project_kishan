document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevents the default form submission

            // Here you would typically add form validation logic.
            // For example, check if password is strong enough, email is valid etc.
            
            // This is a placeholder for when you integrate a backend.
            // You would collect the form data and send it to your server.
            console.log('Signup form submitted');
            console.log('First Name:', document.getElementById('first-name').value);
            console.log('Email:', document.getElementById('email').value);

            alert('Account creation form submitted successfully! (This is a frontend demo)');
            
            // Optional: Redirect the user to the login page after they sign up.
            // setTimeout(() => {
            //    window.location.href = 'login.html';
            // }, 1000);
        });
    }
});