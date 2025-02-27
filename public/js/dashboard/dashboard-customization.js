async function deleteReview(reviewId) {
    // Confirm deletion
    const confirmed = confirm('Are you sure you want to delete this review?');
    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/reviews/${reviewId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // After deletion, check if we need to adjust the current page
            // For example, if we're on the last page and delete the last item
            const currentPage = window.paginationState.reviews.currentPage;
            const totalItems = window.paginationState.reviews.totalItems - 1; // One less after deletion
            const itemsPerPage = window.paginationState.reviews.itemsPerPage;
            const newTotalPages = Math.ceil(totalItems / itemsPerPage);
            
            // If current page is now beyond total pages, go to last page
            if (currentPage > newTotalPages && newTotalPages > 0) {
                window.paginationState.reviews.currentPage = newTotalPages;
            }
            
            // Reload reviews
            loadReviews();
            showNotification('Review deleted successfully', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to delete review', 'error');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        showNotification('Failed to delete review', 'error');
    }
}

function filterReviews() {
    const rating = document.getElementById('ratingFilter').value;
    const category = document.getElementById('categoryFilter').value;
    const searchTerm = document.getElementById('reviewSearch').value.toLowerCase();
    const rows = document.getElementById('reviewsTableBody').querySelectorAll('tr');

    rows.forEach(row => {
        const stars = row.querySelector('.star-rating').querySelectorAll('.fas').length;
        const serviceType = row.querySelector('.service-type-badge').textContent.trim().toLowerCase();
        const text = row.textContent.toLowerCase();
        
        const matchesRating = !rating || stars === parseInt(rating);
        const matchesCategory = !category || serviceType.includes(category);
        const matchesSearch = text.includes(searchTerm);

        row.style.display = matchesRating && matchesCategory && matchesSearch ? '' : 'none';
    });
}

// Initialize event listeners for all filters
function initializeReviewFilters() {
    const ratingFilter = document.getElementById('ratingFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('reviewSearch');

    if (ratingFilter) ratingFilter.addEventListener('change', filterReviews);
    if (categoryFilter) categoryFilter.addEventListener('change', filterReviews);
    if (searchInput) searchInput.addEventListener('input', filterReviews);
}

// Modify the existing loadReviews function to call initializeReviewFilters
async function loadReviews() {
    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        const tbody = document.getElementById('reviewsTableBody');
        if (!tbody) return;

        function generateStarRating(rating) {
            return Array(5).fill().map((_, i) => 
                `<i class="${i < rating ? 'fas' : 'far'} fa-star"></i>`
            ).join('');
        }

        function getServiceTypeBadgeClass(type) {
            return `service-type-badge ${type.toLowerCase()}`;
        }

        tbody.innerHTML = reviews.map((review, index) => `
            <tr>
                <td>${review.name}</td>
                <td>
                    <div class="star-rating">
                        ${generateStarRating(review.rating)}
                    </div>
                </td>
                <td>
                    <span class="${getServiceTypeBadgeClass(review.serviceType)}">
                        ${review.serviceType}
                    </span>
                </td>
                <td>
                    <div class="review-text" title="${review.review}">
                        ${review.review}
                    </div>
                </td>
                <td>
                    <span class="review-date">
                        ${new Date(review.date).toLocaleDateString()}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn delete-btn" onclick="deleteReview('${review.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Initialize all filters after loading reviews
        initializeReviewFilters();

    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Make it available globally
window.loadReviews = loadReviews;

// Utility debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// Utility function for showing notifications (if not already defined)
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
