document.addEventListener('DOMContentLoaded', () => {
    const yieldForm = document.getElementById('yield-form');
    const statusIndicator = document.getElementById('yield-status');
    const yieldOutput = document.getElementById('yield-output');

    yieldForm.addEventListener('submit', (event) => {
        // 1. Prevent the form from actually submitting
        event.preventDefault();

        // 2. Hide any previous results and show the loading spinner
        yieldOutput.classList.add('hidden');
        statusIndicator.classList.remove('hidden');

        // 3. Scroll to the spinner so the user knows something is happening
        statusIndicator.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 4. Simulate a delay for the "AI" to generate the plan
        setTimeout(() => {
            // 5. Hide the spinner
            statusIndicator.classList.add('hidden');

            // 6. Show the results container
            yieldOutput.classList.remove('hidden');

            // 7. Scroll to the newly visible results
            yieldOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });

        }, 2000); // 2-second delay for simulation
    });
});