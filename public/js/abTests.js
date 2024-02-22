document.addEventListener('DOMContentLoaded', function() {
    console.log('A/B Tests Management Page Loaded');

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

    document.querySelectorAll('.toggle-test-status').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const testId = this.dataset.testid;
            const currentStatus = this.dataset.status;
            fetch(`/tests/${testId}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': document.getElementById('csrfToken').value
                },
                body: JSON.stringify({ testStatus: currentStatus === 'Running' ? 'Stopped' : 'Running' }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const newStatus = data.testStatus;
                    this.dataset.status = newStatus;
                    this.classList.toggle('btn-success', newStatus === 'Stopped');
                    this.classList.toggle('btn-danger', newStatus === 'Running');
                    this.textContent = newStatus === 'Running' ? 'Stop' : 'Start';
                    console.log(`Test status updated to: ${newStatus}`);
                    this.closest('.card-body').querySelector('.card-text').textContent = `Status: ${newStatus}`;
                } else {
                    console.error('Failed to toggle test status.');
                }
            })
            .catch(error => {
                console.error('Error toggling test status:', error.message, error.stack);
            });
        });
    });
});