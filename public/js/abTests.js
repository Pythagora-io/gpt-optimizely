document.addEventListener('DOMContentLoaded', function() {
    console.log("A/B Tests Management Page Loaded");

    // Event listener for toggling test status
    document.querySelectorAll('.toggle-test-status').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const csrfTokenElement = document.getElementById('csrfToken');
            if (!csrfTokenElement) {
                console.log("CSRF token not found. User might not be logged in.");
                return;
            }

            const testId = this.dataset.testid;
            if (!testId) {
                console.error("Test ID not found on button.");
                return;
            }

            const csrfToken = csrfTokenElement.value;

            fetch(`/tests/${testId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ testStatus: this.dataset.status === 'Running' ? 'Stopped' : 'Running' }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const newStatus = data.testStatus;
                    this.dataset.status = newStatus;
                    this.classList.remove('btn-success', 'btn-danger');
                    this.classList.add(newStatus === 'Running' ? 'btn-danger' : 'btn-success');
                    this.textContent = newStatus === 'Running' ? 'Stop' : 'Start';
                    const statusElement = this.closest('.card-body').querySelector('.card-text');
                    if (statusElement) {
                        statusElement.textContent = `Status: ${newStatus}`;
                    }
                } else {
                    console.error('Failed to toggle test status:', data.message);
                }
            })
            .catch(error => {
                console.error('Error toggling test status:', error.message, error.stack);
            });
        });
    });

    // Functionality for adding page paths on the A/B Tests Management page
    function addPagePathFunctionality() {
        const addPagePathButton = document.getElementById('addPagePath');
        if (addPagePathButton) {
            addPagePathButton.addEventListener('click', function() {
                const pagePathsContainer = document.getElementById('pagePaths');
                if (pagePathsContainer) {
                    const newInput = document.createElement('input');
                    newInput.type = 'text';
                    newInput.className = 'form-control mb-2';
                    newInput.name = 'pagePaths[]';
                    pagePathsContainer.appendChild(newInput);
                    console.log('Added new page path input field.');
                } else {
                    console.error('Page paths container not found.');
                }
            });
        } else {
            console.error('Add page path button not found.');
        }
    }

    // Check if we're on the A/B Tests Management page to add page paths
    if (document.getElementById('testsList')) {
        addPagePathFunctionality();
    } else {
        console.log("Not on A/B Tests Management page, skipping A/B test-specific operations.");
    }
});