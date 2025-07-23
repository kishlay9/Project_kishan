document.addEventListener('DOMContentLoaded', () => {
    // Select all the clickable link elements that wrap the feature cards
    const featureCardLinks = document.querySelectorAll('.features-grid-5 .feature-card-link');

    // Loop through each of the card links to add the click functionality
    featureCardLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            
            // Step 1: Prevent the browser from immediately navigating to the new page.
            event.preventDefault();

            // Store the URL we want to go to later.
            const destinationUrl = this.href;

            // Remove the 'active-card' class from any other card that might have it.
            featureCardLinks.forEach(otherLink => {
                if (otherLink !== this) {
                    otherLink.classList.remove('active-card');
                }
            });

            // Step 2: Add the 'active-card' class to the specific card that was just clicked.
            // This will trigger the CSS enlargement and color-change animation.
            this.classList.add('active-card');

            // Step 3: Wait for the animation to finish.
            // Our CSS transition is 400ms, so we wait for that long.
            setTimeout(() => {
                // Step 4: Manually navigate to the stored URL.
                window.location.href = destinationUrl;
            }, 400); // 400 milliseconds = 0.4 seconds

        });
    });
});