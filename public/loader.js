(function() {
    // Extract the API key from the script tag
    const scriptTag = document.querySelector('script[data-api-key]');
    const apiKey = scriptTag.getAttribute('data-api-key');
    const serverUrl = '%%SERVER_URL%%'; // This will be dynamically replaced when served

    if (!apiKey) {
        console.error('GPTOptimizely Error: API key is missing.');
        return;
    }

    // Define the function to inject HTML content
    function injectHtml(htmlContent, idParent) {
        const parentElement = document.getElementById(idParent);
        if (parentElement) {
            parentElement.innerHTML = htmlContent;
            console.log(`GPTOptimizely Success: HTML content injected into ${idParent}.`);
        } else {
            console.error(`GPTOptimizely Error: Parent element with ID ${idParent} not found.`);
        }
    }

    // Define the function to track clicks
    function trackClicks(idClick, version) {
        const clickableElement = document.getElementById(idClick);
        if (clickableElement) {
            clickableElement.addEventListener('click', () => {
                // Here you would send the click data to your server
                fetch(`${serverUrl}/api/tests/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        apiKey,
                        version,
                        clicked: true
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to send click data.');
                    }
                    console.log('GPTOptimizely Success: Click data sent successfully.');
                })
                .catch(error => {
                    console.error('GPTOptimizely Tracking Error:', error.message, error.stack);
                });
            });
            console.log(`GPTOptimizely Success: Click tracking added to ${idClick}.`);
        } else {
            console.error(`GPTOptimizely Error: Clickable element with ID ${idClick} not found.`);
        }
    }

    function waitForElement(id, callback) {
        const interval = setInterval(() => {
            const element = document.getElementById(id);
            if (element) {
                clearInterval(interval);
                callback();
            }
        }, 100);
    }

    // Fetch A/B test configuration from the server
    fetch(`${serverUrl}/api/tests/config?apiKey=${apiKey}&path=${encodeURIComponent(window.location.pathname)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch A/B test configuration.');
            }
            return response.json();
        })
        .then(data => {
            data.forEach((config) => {
                const { idParent, idClick, htmlContent, version } = config;
                waitForElement(idParent, () => {
                    // Inject the HTML content into the specified element
                    injectHtml(htmlContent, idParent);
                    // Track clicks on the specified element
                    trackClicks(idClick, version);
                });
            });
        })
        .catch(error => {
            console.error('GPTOptimizely Error:', error.message, error.stack);
        });
})();