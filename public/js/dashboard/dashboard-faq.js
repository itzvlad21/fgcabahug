let allFaqCategories = [];
let currentCategoryFilter = "";
let currentSearchText = "";

// FAQ Management in Dashboard
function loadFAQManagement() {
    const container = document.getElementById('faqManagementContainer');
    const categoryFilter = document.getElementById('faqCategoryFilter');
    
    // Save current filter values
    if (categoryFilter) {
        currentCategoryFilter = categoryFilter.value;
    }
    
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
        currentSearchText = searchInput.value;
    }
    
    fetch('/api/faq')
        .then(response => response.json())
        .then(categories => {
            // Store all categories for filtering
            allFaqCategories = categories;
            
            // Populate category filter dropdown (only once)
            if (categoryFilter && categoryFilter.options.length <= 1) {
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categoryFilter.appendChild(option);
                });
            }
            
            // Restore previous filter values
            if (categoryFilter && currentCategoryFilter) {
                categoryFilter.value = currentCategoryFilter;
            }
            
            if (searchInput && currentSearchText) {
                searchInput.value = currentSearchText;
            }
            
            // Apply current filters
            filterFAQs();
        })
        .catch(error => {
            console.error('Error loading FAQ management:', error);
            container.innerHTML = '<div class="error-message">Failed to load FAQ management.</div>';
        });
}

// Filter FAQs based on selected category and search text
function filterFAQs() {
    const container = document.getElementById('faqManagementContainer');
    const categoryFilterEl = document.getElementById('faqCategoryFilter');
    const searchInputEl = document.getElementById('faqSearch');
    
    // Update current filter values
    currentCategoryFilter = categoryFilterEl ? categoryFilterEl.value : "";
    currentSearchText = searchInputEl ? searchInputEl.value.toLowerCase() : "";
    
    // Filter categories based on dropdown selection
    let filteredCategories = allFaqCategories;
    if (currentCategoryFilter) {
        filteredCategories = allFaqCategories.filter(category => 
            category.id.toString() === currentCategoryFilter
        );
    }
    
    // If search text exists, filter questions within categories
    if (currentSearchText) {
        filteredCategories = filteredCategories.map(category => {
            const filteredQuestions = category.questions.filter(question => 
                question.question.toLowerCase().includes(currentSearchText) || 
                question.answer.toLowerCase().includes(currentSearchText)
            );
            
            return {
                ...category,
                questions: filteredQuestions
            };
        }).filter(category => category.questions.length > 0);
    }
    
    // Render filtered categories
    container.innerHTML = filteredCategories.map(category => `
        <div class="faq-category" data-id="${category.id}">
            <div class="category-header">
                <h3 class="category-title">${category.name}</h3>
                <div class="category-actions">
                    <button class="action-btn" onclick="showAddQuestionModal(${category.id})">
                        <i class="fas fa-plus"></i> Add Question
                    </button>
                    <button class="action-btn edit-btn" onclick="editCategory(${category.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="questions-list">
                ${category.questions.map(q => `
                    <div class="faq-question-item" data-id="${q.id}">
                        <div class="question-content">
                            <h4 class="question-title">${q.question}</h4>
                            <p class="question-answer">${q.answer}</p>
                        </div>
                        <div class="question-actions">
                            <button class="action-btn edit-btn" onclick="editQuestion(${q.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteQuestion(${q.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Display message if no categories match filter
    if (filteredCategories.length === 0) {
        container.innerHTML = '<div class="no-results-message">No FAQ categories found matching your criteria.</div>';
    }
}

// Initialize event listeners for FAQ filters
function initializeFAQFilters() {
    const categoryFilter = document.getElementById('faqCategoryFilter');
    const searchInput = document.getElementById('faqSearch');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterFAQs);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterFAQs, 300));
    }
}

// Debounce function for search input
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

// Show add category modal
function showAddCategoryModal() {
    const modal = document.getElementById('addCategoryModal');
    modal.style.display = 'block';
}

// Show add question modal
function showAddQuestionModal(categoryId) {
    const modal = document.getElementById('addQuestionModal');
    document.getElementById('questionCategoryId').value = categoryId;
    modal.style.display = 'block';
}

// Edit category
async function editCategory(id) {
    try {
        const category = document.querySelector(`.faq-category[data-id="${id}"] .category-title`);
        const modal = document.getElementById('editCategoryModal');
        const nameInput = document.getElementById('editCategoryName');
        const idInput = document.getElementById('editCategoryId');
        
        nameInput.value = category.textContent;
        idInput.value = id;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error preparing category edit:', error);
        showToast('Failed to prepare category edit', 'error');
    }
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category and all its questions?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/faq/categories/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Update local data before refreshing UI
            allFaqCategories = allFaqCategories.filter(category => category.id !== parseInt(id));
            filterFAQs();
            showToast('Category deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete category');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to delete category', 'error');
    }
}

// Edit question
async function editQuestion(id) {
    try {
        const questionEl = document.querySelector(`.faq-question-item[data-id="${id}"]`);
        const modal = document.getElementById('editQuestionModal');
        const questionInput = document.getElementById('editQuestionText');
        const answerInput = document.getElementById('editQuestionAnswer');
        const idInput = document.getElementById('editQuestionId');
        
        questionInput.value = questionEl.querySelector('.question-title').textContent;
        answerInput.value = questionEl.querySelector('.question-answer').textContent;
        idInput.value = id;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error preparing question edit:', error);
        showToast('Failed to prepare question edit', 'error');
    }
}

// Delete question
async function deleteQuestion(id) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/faq/questions/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Update local data
            allFaqCategories = allFaqCategories.map(category => {
                return {
                    ...category,
                    questions: category.questions.filter(q => q.id !== parseInt(id))
                };
            });
            
            filterFAQs();
            showToast('Question deleted successfully', 'success');
        } else {
            throw new Error('Failed to delete question');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to delete question', 'error');
    }
}

// Toast notification
function showToast(message, type = 'info') {
    // Check if toast container exists, create if not
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after timeout
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Add category form submission handler
document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('categoryName');
    const name = nameInput.value.trim();
    
    if (!name) {
        showToast('Category name is required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/faq/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        if (response.ok) {
            const newCategory = await response.json();
            
            // Add to local data
            allFaqCategories.push({
                ...newCategory,
                questions: []
            });
            
            // Update dropdown
            const categoryFilter = document.getElementById('faqCategoryFilter');
            if (categoryFilter) {
                const option = document.createElement('option');
                option.value = newCategory.id;
                option.textContent = newCategory.name;
                categoryFilter.appendChild(option);
            }
            
            // Reset and close modal
            document.getElementById('addCategoryModal').style.display = 'none';
            nameInput.value = '';
            
            // Update UI
            filterFAQs();
            showToast('Category added successfully', 'success');
        } else {
            throw new Error('Failed to add category');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to add category', 'error');
    }
});

// Add question form submission handler
document.getElementById('addQuestionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const categoryId = parseInt(document.getElementById('questionCategoryId').value);
    const questionInput = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();
    
    if (!question || !answer) {
        showToast('Question and answer are required', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/faq/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoryId,
                question,
                answer
            })
        });
        
        if (response.ok) {
            const newQuestion = await response.json();
            
            // Update local data
            allFaqCategories = allFaqCategories.map(category => {
                if (category.id === categoryId) {
                    return {
                        ...category,
                        questions: [...category.questions, newQuestion]
                    };
                }
                return category;
            });
            
            // Reset and close modal
            document.getElementById('addQuestionModal').style.display = 'none';
            questionInput.value = '';
            answerInput.value = '';
            
            // Update UI
            filterFAQs();
            showToast('Question added successfully', 'success');
        } else {
            throw new Error('Failed to add question');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to add question', 'error');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const addCategoryModal = document.getElementById('addCategoryModal');
    const editCategoryModal = document.getElementById('editCategoryModal');
    const addQuestionModal = document.getElementById('addQuestionModal');
    const editQuestionModal = document.getElementById('editQuestionModal');

    // Get all close buttons
    const closeButtons = document.querySelectorAll('.close-btn');

    // Add click handlers to all close buttons
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Close all modals
            addCategoryModal.style.display = 'none';
            editCategoryModal.style.display = 'none';
            addQuestionModal.style.display = 'none';
            editQuestionModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addCategoryModal) addCategoryModal.style.display = 'none';
        if (e.target === editCategoryModal) editCategoryModal.style.display = 'none';
        if (e.target === addQuestionModal) addQuestionModal.style.display = 'none';
        if (e.target === editQuestionModal) editQuestionModal.style.display = 'none';
    });

    // Function to show add category modal
    window.showAddCategoryModal = function() {
        addCategoryModal.style.display = 'block';
    };

    // Add ESC key handler for closing modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            addCategoryModal.style.display = 'none';
            editCategoryModal.style.display = 'none';
            addQuestionModal.style.display = 'none';
            editQuestionModal.style.display = 'none';
        }
    });
    
    // Edit Category Form Submit
    document.getElementById('editCategoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('editCategoryId').value);
        const name = document.getElementById('editCategoryName').value.trim();
        
        if (!name) {
            showToast('Category name is required', 'error');
            return;
        }
        
        try {
            const response = await fetch(`/api/faq/categories/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            
            if (response.ok) {
                // Update local data
                allFaqCategories = allFaqCategories.map(category => {
                    if (category.id === id) {
                        return { ...category, name };
                    }
                    return category;
                });
                
                // Update dropdown
                const categoryFilter = document.getElementById('faqCategoryFilter');
                if (categoryFilter) {
                    Array.from(categoryFilter.options).forEach(option => {
                        if (option.value === id.toString()) {
                            option.textContent = name;
                        }
                    });
                }
                
                // Close modal
                document.getElementById('editCategoryModal').style.display = 'none';
                
                // Update UI
                filterFAQs();
                showToast('Category updated successfully', 'success');
            } else {
                throw new Error('Failed to update category');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to update category', 'error');
        }
    });
    
    // Edit Question Form Submit
    document.getElementById('editQuestionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('editQuestionId').value);
        const question = document.getElementById('editQuestionText').value.trim();
        const answer = document.getElementById('editQuestionAnswer').value.trim();
        
        if (!question || !answer) {
            showToast('Question and answer are required', 'error');
            return;
        }
        
        try {
            const response = await fetch(`/api/faq/questions/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question, answer })
            });
            
            if (response.ok) {
                // Update local data
                allFaqCategories = allFaqCategories.map(category => {
                    const updatedQuestions = category.questions.map(q => {
                        if (q.id === id) {
                            return { ...q, question, answer };
                        }
                        return q;
                    });
                    
                    return {
                        ...category,
                        questions: updatedQuestions
                    };
                });
                
                // Close modal
                document.getElementById('editQuestionModal').style.display = 'none';
                
                // Update UI
                filterFAQs();
                showToast('Question updated successfully', 'success');
            } else {
                throw new Error('Failed to update question');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Failed to update question', 'error');
        }
    });
    
    // Initialize FAQ management
    const customizationTab = document.querySelector('a[href="#customization"]');
    if (customizationTab) {
        customizationTab.addEventListener('click', function() {
            loadFAQManagement();
            initializeFAQFilters();
        });
    }
});
