document.querySelectorAll('.view-results').forEach(button => {
    button.addEventListener('click', function() {
        const testId = this.dataset.testid;
        window.location.href = `/tests/${testId}/results`;
    });
});