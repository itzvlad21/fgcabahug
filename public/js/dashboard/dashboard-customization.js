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

async function loadReviews() {
    try {
        const response = await fetch('/api/reviews');
        const allReviews = await response.json();
        
        const tbody = document.getElementById('reviewsTableBody');
        const paginationContainer = document.getElementById('reviewsPagination');
        if (!tbody || !paginationContainer) return;

        // Get current filter values
        const ratingFilter = document.getElementById('ratingFilter');
        const searchInput = document.getElementById('reviewSearch');
        const selectedRating = ratingFilter ? ratingFilter.value : '';
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        // Apply filters to the complete dataset
        const filteredReviews = allReviews.filter(review => {
            const matchesRating = !selectedRating || review.rating === parseInt(selectedRating);
            const reviewText = `${review.name} ${review.review}`.toLowerCase();
            const matchesSearch = !searchTerm || reviewText.includes(searchTerm);
            return matchesRating && matchesSearch;
        });
        
        // Update pagination state
        window.paginationState.reviews.totalItems = filteredReviews.length;
        window.paginationState.reviews.totalPages = Math.ceil(
            filteredReviews.length / window.paginationState.reviews.itemsPerPage
        );
        
        // Ensure current page is valid
        if (window.paginationState.reviews.currentPage > window.paginationState.reviews.totalPages) {
            window.paginationState.reviews.currentPage = 1;
        }
        
        // Calculate pagination indices
        const startIndex = (window.paginationState.reviews.currentPage - 1) * 
                            window.paginationState.reviews.itemsPerPage;
        const endIndex = startIndex + window.paginationState.reviews.itemsPerPage;
        
        // Get only the reviews for current page
        const currentPageReviews = filteredReviews.slice(startIndex, endIndex);

        function generateStarRating(rating) {
            return Array(5).fill().map((_, i) => 
                `<i class="${i < rating ? 'fas' : 'far'} fa-star"></i>`
            ).join('');
        }

        function getServiceTypeBadgeClass(type) {
            return `service-type-badge ${type.toLowerCase()}`;
        }

        // Render current page reviews
        tbody.innerHTML = currentPageReviews.map((review) => `
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

        // Update pagination controls
        window.updatePagination('reviews', window.paginationState.reviews);

        // Attach filter handlers if they don't exist
        if (ratingFilter && !ratingFilter._hasFilterListener) {
            ratingFilter.addEventListener('change', function() {
                // Reset to first page when filtering
                window.paginationState.reviews.currentPage = 1;
                loadReviews();
            });
            ratingFilter._hasFilterListener = true;
        }

        if (searchInput && !searchInput._hasFilterListener) {
            searchInput.addEventListener('input', debounce(function() {
                // Reset to first page when filtering
                window.paginationState.reviews.currentPage = 1;
                loadReviews();
            }, 300));
            searchInput._hasFilterListener = true;
        }

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
