document.addEventListener('DOMContentLoaded', () => {
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackMessage = document.getElementById('feedbackMessage');

    // For Azure Static Web Apps, use a relative path for API calls
    const azureFunctionApiUrl = '/api/submitFeedback';

    feedbackForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        feedbackMessage.textContent = 'Submitting feedback...';
        feedbackMessage.className = ''; // Clear previous styles

        const isClearRadio = feedbackForm.querySelector('input[name="isClear"]:checked');
        const suggestionsTextarea = document.getElementById('suggestions');

        if (!isClearRadio) {
            feedbackMessage.textContent = 'Please select whether the resume was clear.';
            feedbackMessage.className = 'error';
            return;
        }

        const feedbackData = {
            isClear: isClearRadio.value === 'true',
            suggestions: suggestionsTextarea.value || '' // Ensure it's an empty string if null/undefined
        };

        try {
            const response = await fetch(azureFunctionApiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            });

            if (response.ok) {
                const result = await response.json();
                feedbackMessage.textContent = result.message || 'Feedback submitted successfully!';
                feedbackMessage.className = 'success';
                feedbackForm.reset(); // Clear the form
            } else {
                let errorText = 'Unknown error';
                try {
                    const errorResult = await response.json();
                    errorText = errorResult.message || `Error: ${response.status} ${response.statusText}`;
                } catch (jsonError) {
                    // If response is not JSON (e.g., 404 HTML page, 500 plain text)
                    errorText = `Error: ${response.status} ${response.statusText}. Could not parse response.`;
                }
                feedbackMessage.textContent = `Submission failed: ${errorText}`;
                feedbackMessage.className = 'error';
            }
        } catch (error) {
            console.error('Network error:', error);
            feedbackMessage.textContent = `Network error: ${error.message || 'Could not reach the server.'}`;
            feedbackMessage.className = 'error';
        }
    });
});