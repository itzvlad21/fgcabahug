document.addEventListener('DOMContentLoaded', function() {
    const faqContainer = document.getElementById('faqContainer');
    const searchInput = document.getElementById('faqSearch');
    const filterContainer = document.querySelector('.filter-container');
    let faqData = []; // Store the original FAQ data
    let activeCategory = 'all'; // Track the currently active category
    
    // Load FAQ data
    async function loadFAQs() {
        try {
            const response = await fetch('/api/faq');
            faqData = await response.json();
            
            // Create category filters
            createCategoryFilters(faqData);
            
            // Render the FAQs
            renderFAQs(faqData);
        } catch (error) {
            console.error('Error loading FAQs:', error);
            faqContainer.innerHTML = `
                <div class="error-message">
                    Failed to load FAQ content. Please try again later.
                </div>
            `;
        }
    }

    // Create category filter buttons
    function createCategoryFilters(categories) {
        // Clear existing filters except "All"
        const allFilter = filterContainer.querySelector('[data-category="all"]');
        filterContainer.innerHTML = '';
        filterContainer.appendChild(allFilter);
        
        // Add a button for each category
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'category-filter';
            button.setAttribute('data-category', category.id);
            button.textContent = category.name;
            filterContainer.appendChild(button);
        });
        
        // Add event listeners to category buttons
        const filterButtons = document.querySelectorAll('.category-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update active category
                activeCategory = button.getAttribute('data-category');
                
                // Apply filters
                applyFilters();
            });
        });
    }

    // Render FAQ content
    function renderFAQs(categories) {
        faqContainer.innerHTML = categories.map(category => `
            <div class="faq-category" data-category-id="${category.id}">
                <h2 class="category-title">${category.name}</h2>
                ${category.questions.map(q => `
                    <div class="faq-item">
                        <div class="faq-question">
                            <span>${q.question}</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer">
                            <div class="faq-answer-content">
                                ${q.answer}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');

        // Initialize accordion functionality
        initializeAccordions();
    }

    // Apply both category and search filters
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const faqCategories = document.querySelectorAll('.faq-category');
        const faqItems = document.querySelectorAll('.faq-item');
        
        // Handle category filtering
        faqCategories.forEach(category => {
            const categoryId = category.getAttribute('data-category-id');
            const shouldShowCategory = activeCategory === 'all' || activeCategory === categoryId;
            
            category.style.display = shouldShowCategory ? 'block' : 'none';
        });
        
        // Handle search filtering
        if (searchTerm) {
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question span').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer-content').textContent.toLowerCase();
                const matches = question.includes(searchTerm) || answer.includes(searchTerm);
                
                item.style.display = matches ? 'block' : 'none';
            });
            
            // Show/hide categories based on visible questions
            faqCategories.forEach(category => {
                if (category.style.display !== 'none') { // Skip already hidden categories
                    const hasVisibleQuestions = [...category.querySelectorAll('.faq-item')]
                        .some(item => item.style.display !== 'none');
                    category.style.display = hasVisibleQuestions ? 'block' : 'none';
                }
            });
        }
    }

    // Initialize accordion functionality
    function initializeAccordions() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const isOpen = question.classList.contains('active');
                
                // Close all other answers
                faqQuestions.forEach(q => {
                    if (q !== question) {
                        q.classList.remove('active');
                        q.nextElementSibling.style.maxHeight = '0';
                    }
                });
                
                // Toggle current answer
                question.classList.toggle('active');
                if (!isOpen) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = '0';
                }
            });
        });
    }

    // Search functionality
    searchInput.addEventListener('input', applyFilters);

    // Initialize
    loadFAQs();
});
