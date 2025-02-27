document.addEventListener('DOMContentLoaded', function() {
    // Load reviews immediately for all users
    loadNewReviews();

    // Check authentication and handle form display
    const reviewForm = document.getElementById('reviewForm');
    const reviewFormWrapper = document.querySelector('.review-form-wrapper');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
        reviewFormWrapper.innerHTML = `
            <div class="login-prompt">
                <div class="user-icon">
                    <i class="fas fa-user-circle"></i>
                </div>
                <p>Please log in to share your experience with us.<br>
                Your feedback helps us improve our services<br>
                for everyone.</p>
                <a href="login.html" class="login-button">
                    <i class="fas fa-sign-in-alt"></i> Login to Continue
                </a>
            </div>
        `;
    } else {
        initializeReviewForm();
    }

    function initializeReviewForm() {
        // Auto-populate user data
        nameInput.value = currentUser.fullName || currentUser.username;
        emailInput.value = currentUser.email;
        nameInput.readOnly = true;
        emailInput.readOnly = true;

        // Star Rating System
        const stars = document.querySelectorAll('.stars i');
        const ratingInput = document.getElementById('rating');
        let currentRating = 0;

        stars.forEach(star => {
            // Hover effect
            star.addEventListener('mouseover', function() {
                const rating = this.dataset.rating;
                highlightStars(rating);
            });

            // Click handler
            star.addEventListener('click', function() {
                currentRating = this.dataset.rating;
                ratingInput.value = currentRating;
                highlightStars(currentRating);
            });
        });

        document.querySelector('.stars').addEventListener('mouseleave', function() {
            highlightStars(currentRating);
        });

        function highlightStars(rating) {
            stars.forEach(star => {
                const starRating = star.dataset.rating;
                if (starRating <= rating) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                } else {
                    star.classList.remove('fas');
                    star.classList.add('far');
                }
            });
        }

        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Form submitted');
        
            if (!validateForm()) {
                console.log('Form validation failed');
                return;
            }
        
            const submitButton = this.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';
        
            try {
                const formData = {
                    rating: ratingInput.value,
                    name: nameInput.value,
                    email: emailInput.value,
                    serviceType: document.getElementById('serviceType').value,
                    review: document.getElementById('review').value,
                    date: new Date().toISOString()
                };
                
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
        
                const result = await response.json();
        
                if (!response.ok) {
                    throw new Error(result.error || 'Failed to submit review');
                }
        
                showNotification('Review submitted successfully!', 'success');
                reviewForm.reset();
                currentRating = 0;
                highlightStars(0);
                
                // Auto-populate user data again after form reset
                nameInput.value = currentUser.fullName || currentUser.username;
                emailInput.value = currentUser.email;
                
                // Reload reviews
                loadNewReviews();
        
            } catch (error) {
                console.error('Submission error:', error);
                showNotification(error.message || 'Failed to submit review. Please try again.', 'error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Review';
            }
        });
    }

    function validateForm() {
        if (!document.getElementById('rating').value) {
            showNotification('Please select a rating', 'error');
            return false;
        }

        const requiredFields = ['serviceType', 'review'];
        for (const field of requiredFields) {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                showNotification(`Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
                element.focus();
                return false;
            }
        }

        return true;
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    async function loadNewReviews() {
        try {
            const response = await fetch('/api/reviews');
            const reviews = await response.json();
            
            // Sort reviews by date (newest first)
            reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Count reviews by rating
            const counts = countReviewsByRating(reviews);
            
            // Update filter options with counts
            updateFilterOptions(counts);
            
            const reviewsGrid = document.querySelector('.reviews-grid');
            reviewsGrid.innerHTML = '';
    
            reviews.forEach(review => {
                const reviewCard = createReviewCard(review);
                reviewsGrid.appendChild(reviewCard);
            });
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    }
    
    function countReviewsByRating(reviews) {
        const counts = {
            total: reviews.length,
            "5": 0,
            "4": 0,
            "3": 0,
            "2": 0,
            "1": 0
        };
        
        reviews.forEach(review => {
            const rating = review.rating.toString();
            if (counts.hasOwnProperty(rating)) {
                counts[rating]++;
            }
        });
        
        return counts;
    }
    
    function updateFilterOptions(counts) {
        const starFilter = document.getElementById('starFilter');
        if (!starFilter) return;
        
        // Update option text with counts
        const options = starFilter.options;
        options[0].text = `All Ratings (${counts.total})`;
        options[1].text = `5 Stars (${counts["5"]})`;
        options[2].text = `4 Stars (${counts["4"]})`;
        options[3].text = `3 Stars (${counts["3"]})`;
        options[4].text = `2 Stars (${counts["2"]})`;
        options[5].text = `1 Star (${counts["1"]})`;
    }

    function generateStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="${i <= rating ? 'fas' : 'far'} fa-star"></i>`;
        }
        return stars;
    }
    
    function createReviewCard(review) {
        const card = document.createElement('div');
        card.className = 'review-card';
        card.dataset.date = review.date;
        
        card.innerHTML = `
            <div class="review-header">
                <div class="reviewer-info">
                    <h3>${review.name}</h3>
                    <div class="review-stars">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                <span class="service-tag">${review.serviceType}</span>
            </div>
            <p class="review-text">"${review.review}"</p>
            <span class="review-date">${formatDate(review.date)}</span>
        `;
    
        return card;
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Star filter functionality
    const starFilter = document.getElementById('starFilter');
    starFilter.addEventListener('change', function() {
        const selectedValue = this.value;
        const reviewCards = Array.from(document.querySelectorAll('.review-card'));

        if (selectedValue === 'recent') {
            // Sort by date for recent filter
            reviewCards.sort((a, b) => {
                const dateA = new Date(a.dataset.date);
                const dateB = new Date(b.dataset.date);
                return dateB - dateA;
            });
            
            const reviewsGrid = document.querySelector('.reviews-grid');
            reviewCards.forEach(card => {
                reviewsGrid.appendChild(card);
                card.style.display = 'block';
            });
        } else {
            reviewCards.forEach(card => {
                if (selectedValue === '') {
                    card.style.display = 'block';
                } else {
                    const starCount = card.querySelectorAll('.review-stars .fas').length;
                    card.style.display = (starCount === parseInt(selectedValue)) ? 'block' : 'none';
                }
            });
        }
    });

    // Mobile menu handling
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
});

function filterReviewsByStar() {
    const starFilter = document.getElementById('starFilter');
    const selectedStars = starFilter.value;
    const reviewCards = document.querySelectorAll('.review-card');

    reviewCards.forEach(card => {
        // Count the number of filled star icons
        const starCount = card.querySelectorAll('.review-stars .fas').length;
        
        // Show/hide based on filter
        if (selectedStars === '' || starCount === parseInt(selectedStars)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add event listener to star filter dropdown
document.addEventListener('DOMContentLoaded', function() {
    const starFilter = document.getElementById('starFilter');
    if (starFilter) {
        starFilter.addEventListener('change', filterReviewsByStar);
    }
});
