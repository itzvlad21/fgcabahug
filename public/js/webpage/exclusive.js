document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Image Gallery Modal
    const galleryImages = document.querySelectorAll('.gallery-image');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.querySelector('.close-modal');

    // Open Image Modal
    galleryImages.forEach(img => {
        img.addEventListener('click', function() {
            imageModal.classList.add('show');
            modalImage.src = this.src;
            modalImage.classList.add('show');
            document.body.classList.add('modal-open');
        });
    });

    // Close Image Modal
    function closeImageModal() {
        modalImage.classList.remove('show');
        setTimeout(() => {
            imageModal.classList.remove('show');
            document.body.classList.remove('modal-open');
        }, 300);
    }

    // Close button click
    closeModal.addEventListener('click', closeImageModal);
    
    // Click outside image
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });
    
    // Escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && imageModal.classList.contains('show')) {
            closeImageModal();
        }
    });

    // Video Controls
    const video = document.getElementById('shopVideo');
    
    // Auto-pause video when it scrolls out of view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting && !video.paused) {
                video.pause();
            }
        });
    }, { threshold: 0.2 });
    
    if (video) {
        observer.observe(video);
    }

    // Floating Action Button
    const fabMain = document.querySelector('.fab-main');
    const fabMenu = document.querySelector('.fab-menu');
    
    fabMain.addEventListener('click', () => {
        fabMenu.classList.toggle('active');
        fabMain.classList.toggle('active');
    });

    // Close FAB menu when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.fab-container')) {
            fabMenu.classList.remove('active');
            fabMain.classList.remove('active');
        }
    });

    // Animate elements on scroll
    function animateOnScroll() {
        const animatedElements = document.querySelectorAll('.section-header, .product-card, .gallery-item, .badge-item, .certification-content');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(element => {
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    }

    // Add CSS class for animated elements
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        .fade-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    // Initialize animations
    animateOnScroll();

    // Smooth scroll to sections
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70, // Adjust for header height
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
});