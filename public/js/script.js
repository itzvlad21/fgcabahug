document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Menu Button in Hero Section
    const menuButton = document.querySelector('.hero-content button');
    menuButton.addEventListener('click', () => {
        document.querySelector('#menu').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });

    // Reservation Form Handling
    const reservationForm = document.querySelector('.reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const reservationData = {};
            formData.forEach((value, key) => {
                reservationData[key] = value;
            });

            // Show confirmation message
            alert('Thank you for your reservation! We will contact you shortly to confirm.');
            this.reset();
        });
    }

    // Contact Form Handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('#name').value,
                email: this.querySelector('#email').value,
                phone: this.querySelector('#phone').value,
                message: this.querySelector('#message').value
            };
    
            const submitBtn = this.querySelector('.submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
    
            try {
                // Send to contact submissions endpoint
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
    
                const result = await response.json();
    
                if (result.success) {
                    submitBtn.textContent = 'Message Sent!';
                    submitBtn.style.backgroundColor = '#28a745';
                    this.reset();
                    
                    // Show success message to user
                    showNotification('Message sent successfully!', 'success');
                } else {
                    throw new Error(result.error || 'Failed to send message');
                }
    
            } catch (error) {
                console.error('Submission error:', error);
                submitBtn.textContent = 'Error - Try Again';
                submitBtn.style.backgroundColor = '#dc3545';
                showNotification('Failed to send message. Please try again.', 'error');
            }
    
            // Reset button after delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                submitBtn.style.backgroundColor = '';
            }, 3000);
        });
    }

    // Scroll Animation
    const sections = document.querySelectorAll('section');
    const options = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, options);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Dynamic Year in Footer
    const yearSpan = document.querySelector('.footer-content p');
    if (yearSpan) {
        yearSpan.innerHTML = yearSpan.innerHTML.replace('2024', new Date().getFullYear());
    }

    // Menu Carousel
    const carousel = document.querySelector('.menu-carousel');
    if (carousel) {
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        const menuPages = carousel.querySelectorAll('.menu-page');
        let currentIndex = 0;

        function showPage(index) {
            menuPages.forEach((page, i) => {
                if (i === index) {
                    page.classList.remove('slide-out');
                    page.classList.add('active', 'slide-in');
                } else {
                    page.classList.remove('active', 'slide-in');
                    if (i === currentIndex) {
                        page.classList.add('slide-out');
                    }
                }
            });
            currentIndex = index;
        }

        function nextPage() {
            const nextIndex = (currentIndex + 1) % menuPages.length;
            showPage(nextIndex);
        }

        function prevPage() {
            const prevIndex = (currentIndex - 1 + menuPages.length) % menuPages.length;
            showPage(prevIndex);
        }

        nextBtn.addEventListener('click', nextPage);
        prevBtn.addEventListener('click', prevPage);

        // Optional: Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevPage();
            } else if (e.key === 'ArrowRight') {
                nextPage();
            }
        });

        // Optional: Add touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) { // Swipe left
                nextPage();
            } else if (touchEndX > touchStartX + 50) { // Swipe right
                prevPage();
            }
        });
    }
});

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

document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.recommendations-grid');
    const items = grid.innerHTML;
    
    // Duplicate items for seamless scroll
    grid.innerHTML = items + items;
    
    // Optional: Adjust scroll position on window resize
    window.addEventListener('resize', () => {
        const scrollWidth = grid.scrollWidth;
        if (grid.scrollLeft >= scrollWidth / 2) {
            grid.scrollLeft = 0;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.menu-carousel');
    if (carousel) {
        const indicators = carousel.querySelectorAll('.indicator');
        let currentIndex = 0;

        // Update indicators
        function updateIndicators(index) {
            const indicators = document.querySelectorAll('.indicator');
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('active', i === index);
            });
        }

        // Add click events to indicators
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showPage(index);
            });
        });

        // Update the existing showPage function
        function showPage(index) {
            const menuPages = carousel.querySelectorAll('.menu-page');
            menuPages.forEach((page, i) => {
                if (i === index) {
                    page.classList.remove('slide-out');
                    page.classList.add('active', 'slide-in');
                } else {
                    page.classList.remove('active', 'slide-in');
                    if (i === currentIndex) {
                        page.classList.add('slide-out');
                    }
                }
            });
            currentIndex = index;
            updateIndicators(index);
        }
    }
});

// About Us
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.about-slider');
    const dots = document.querySelectorAll('.about-page-dot');
    let currentSlide = 0;
    let startX;
    let currentX;
    let isDragging = false;

    // Touch events
    slider.addEventListener('touchstart', handleTouchStart);
    slider.addEventListener('touchmove', handleTouchMove);
    slider.addEventListener('touchend', handleTouchEnd);

    // Mouse events
    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mousemove', handleMouseMove);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mouseleave', handleMouseUp);

    // Pagination dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        slider.style.transition = 'none';
    }

    function handleMouseDown(e) {
        startX = e.clientX;
        isDragging = true;
        slider.style.transition = 'none';
        slider.style.cursor = 'grabbing';
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        const move = -(currentSlide * 33.333) - (diff / slider.offsetWidth * 100);
        slider.style.transform = `translateX(${move}%)`;
    }

    function handleMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.clientX;
        const diff = startX - currentX;
        const move = -(currentSlide * 33.333) - (diff / slider.offsetWidth * 100);
        slider.style.transform = `translateX(${move}%)`;
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        slider.style.transition = 'transform 0.3s ease-out';
        
        const diff = startX - currentX;
        if (Math.abs(diff) > 50) { // Minimum drag distance
            if (diff > 0 && currentSlide < 2) {
                currentSlide++;
            } else if (diff < 0 && currentSlide > 0) {
                currentSlide--;
            }
        }
        goToSlide(currentSlide);
    }

    function handleMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        slider.style.transition = 'transform 0.3s ease-out';
        slider.style.cursor = 'grab';
        
        if (currentX === undefined) return;
        
        const diff = startX - currentX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentSlide < 2) {
                currentSlide++;
            } else if (diff < 0 && currentSlide > 0) {
                currentSlide--;
            }
        }
        goToSlide(currentSlide);
    }

    function goToSlide(index) {
        currentSlide = index;
        slider.style.transform = `translateX(-${index * 33.333}%)`;
        updateDots();
    }

    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
});

//fab nav
document.addEventListener('DOMContentLoaded', function() {
    // Navbar scroll handling
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
        }
        lastScroll = currentScroll;
    });

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

    // Handle FAB menu item clicks
    document.querySelectorAll('.fab-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const href = item.getAttribute('href');
            const target = document.querySelector(href);
    
            // If it's an internal page link with a hash, scroll to section
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
    
            // Close the FAB menu
            fabMenu.classList.remove('active');
            fabMain.classList.remove('active');
    
            // For external pages or full page links, default behavior will navigate
        });
    });
});

/* staff scroll */
document.addEventListener('DOMContentLoaded', function() {
    const staffGrids = document.querySelectorAll('.staff-grid');
    
    function initializeScrolling(grid) {
        // Clone items for seamless scrolling
        const originalItems = grid.innerHTML;
        grid.innerHTML = originalItems + originalItems;
        
        // Set initial position based on direction
        const isReverse = grid.closest('.staff-scroll').classList.contains('reverse');
        if (isReverse) {
            grid.style.transform = 'translateX(calc(-100% / 2))';
        }
        
        // Start animation after a brief delay to ensure proper positioning
        setTimeout(() => {
            grid.style.animation = `${isReverse ? 'scrollRight' : 'scrollLeft'} 30s linear infinite`;
        }, 100);
        
        // Handle animation reset
        grid.addEventListener('animationend', () => {
            grid.style.animation = 'none';
            grid.offsetHeight; // Trigger reflow
            grid.style.animation = `${isReverse ? 'scrollRight' : 'scrollLeft'} 30s linear infinite`;
        });
        
        // Pause on hover
        const container = grid.closest('.staff-scroll');
        container.addEventListener('mouseenter', () => {
            grid.style.animationPlayState = 'paused';
        });
        
        container.addEventListener('mouseleave', () => {
            grid.style.animationPlayState = 'running';
        });
    }
    
    // Initialize all grids
    staffGrids.forEach(initializeScrolling);
    
    // Optional: Reset scroll position on window resize
    window.addEventListener('resize', () => {
        staffGrids.forEach(grid => {
            const isReverse = grid.closest('.staff-scroll').classList.contains('reverse');
            grid.style.transform = isReverse ? 
                'translateX(calc(-100% / 2))' : 
                'translateX(0)';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.car-slider');
    const slides = document.querySelectorAll('.car-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicatorsContainer = document.querySelector('.indicators-container');
    
    let currentIndex = 0;
    
    // Make first slide visible initially
    slides[0].classList.add('active');
    
    // Create indicators
    slides.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (index === 0) indicator.classList.add('active');
        indicator.addEventListener('click', () => goToSlide(index));
        indicatorsContainer.appendChild(indicator);
    });
    
    const indicators = document.querySelectorAll('.indicator');
    
    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.style.display = index === currentIndex ? 'block' : 'none';
            slide.classList.toggle('active', index === currentIndex);
            indicators[index].classList.toggle('active', index === currentIndex);
        });
    }
    
    // Initialize first slide
    updateSlides();
    
    function goToSlide(index) {
        currentIndex = index;
        updateSlides();
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
    }
    
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
    }
    
    // Event listeners
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
});

// Timeline Animation
document.addEventListener('DOMContentLoaded', function() {
    const timelineLine = document.querySelector('.timeline-line');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target === timelineLine) {
                    entry.target.classList.add('animate');
                } else {
                    // Add a delay based on the item's position
                    const index = Array.from(timelineItems).indexOf(entry.target);
                    setTimeout(() => {
                        entry.target.classList.add('animate');
                    }, index * 500); // 500ms delay between each item
                }
            }
        });
    }, {
        threshold: 0.2
    });
    
    // First animate the line
    observer.observe(timelineLine);
    
    // Then observe each timeline item
    timelineItems.forEach(item => {
        observer.observe(item);
    });
});

// Add this to your script.js
document.addEventListener('DOMContentLoaded', function() {
    const timelineLine = document.querySelector('.timeline-line');
    const timelineSection = document.querySelector('.history-section');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    // Remove old transition
    timelineLine.style.transition = 'none';

    function updateTimeline() {
        // Get timeline section boundaries
        const sectionRect = timelineSection.getBoundingClientRect();
        const sectionTop = sectionRect.top;
        const sectionHeight = sectionRect.height;
        const windowHeight = window.innerHeight;

        // Calculate how much of section is scrolled
        let scrollPercentage = 0;
        
        if (sectionTop <= windowHeight && sectionTop >= -sectionHeight) {
            // Calculate visible percentage
            scrollPercentage = Math.min(100, Math.max(0, 
                ((windowHeight - sectionTop) / (windowHeight + sectionHeight)) * 100
            ));
            
            // Update line height
            timelineLine.style.height = `${scrollPercentage}%`;
            
            // Animate timeline items
            timelineItems.forEach((item, index) => {
                const itemTop = item.getBoundingClientRect().top;
                if (itemTop < windowHeight * 0.8) {
                    item.classList.add('animate');
                } else {
                    item.classList.remove('animate');
                }
            });
        }
    }

    // Update on scroll
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateTimeline);
    });
    
    // Initial update
    updateTimeline();
});

/* filter */
document.addEventListener("DOMContentLoaded", function () {
    const filterButtons = document.querySelectorAll(".customize-selection-filter button");
    const productLists = document.querySelectorAll(".customize-selection-list");

    // Hide all product lists initially
    productLists.forEach(list => list.style.display = "none");

    // Set default active button (first one) and show its products
    if (filterButtons.length > 0) {
        filterButtons[0].classList.add("active");
        productLists[0].style.display = "flex";
    }

    filterButtons.forEach((button, index) => {
        button.addEventListener("click", function () {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove("active"));
            
            // Hide all product lists
            productLists.forEach(list => list.style.display = "none");
            
            // Add active class to the clicked button
            button.classList.add("active");
            
            // Show the corresponding product list
            productLists[index].style.display = "flex";
        });
    });
});

(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
Cal("init", "30min", {origin:"https://cal.com"});
  
// Important: Please add the following attributes to the element that should trigger the calendar to open upon clicking.
// `data-cal-link="fg-cabahug-trading/30min"`
// data-cal-namespace="30min"
// `data-cal-config='{"layout":"month_view"}'`
Cal.ns["30min"]("ui", {"hideEventTypeDetails":false,"layout":"month_view"});


  document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');
    const staffItems = document.querySelectorAll('.staff-item img');
    
    // Open modal
    staffItems.forEach(img => {
        img.addEventListener('click', function() {
            modal.classList.add('show');
            modalImg.src = this.src;
            modalImg.classList.add('show');
            document.body.classList.add('modal-open');
            
            // Pause all staff-scroll animations
            document.querySelectorAll('.staff-scroll .staff-grid').forEach(grid => {
                grid.style.animationPlayState = 'paused';
            });
        });
    });
    
    // Close modal functions
    function closeModal() {
        modalImg.classList.remove('show');
        setTimeout(() => {
            modal.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            // Resume all staff-scroll animations
            document.querySelectorAll('.staff-scroll .staff-grid').forEach(grid => {
                grid.style.animationPlayState = 'running';
            });
        }, 300);
    }
    
    // Close button click
    closeBtn.addEventListener('click', closeModal);
    
    // Click outside image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
});

// automatic underline
document.addEventListener('DOMContentLoaded', function() {
    // Get all sections that should be tracked
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    console.log('Found sections:', sections.length);
    console.log('Found nav links:', navLinks.length);

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px',
        threshold: 0
    };

    function highlightNavigation(entries) {
        entries.forEach(entry => {
            console.log('Section intersecting:', entry.target.id, entry.isIntersecting);
            
            if (entry.isIntersecting) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to corresponding link
                const activeId = entry.target.id;
                const correspondingLink = document.querySelector(`.nav-links a[href="#${activeId}"]`);
                
                console.log('Active section:', activeId);
                console.log('Found corresponding link:', correspondingLink);
                
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // Create the observer
    const observer = new IntersectionObserver(highlightNavigation, observerOptions);

    // Observe all sections
    sections.forEach(section => {
        console.log('Observing section:', section.id);
        observer.observe(section);
    });

    // Set initial active state
    function setInitialActive() {
        const scrollPosition = window.scrollY;
        console.log('Initial scroll position:', scrollPosition);
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            console.log('Section:', section.id, 'Top:', sectionTop, 'Height:', sectionHeight);
            
            if (scrollPosition >= sectionTop - window.innerHeight/2 && 
                scrollPosition < sectionTop + sectionHeight - window.innerHeight/2) {
                navLinks.forEach(link => link.classList.remove('active'));
                const correspondingLink = document.querySelector(`.nav-links a[href="#${section.id}"]`);
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    }

    // Set initial state on page load
    setInitialActive();

    // Add scroll event listener for debugging
    window.addEventListener('scroll', () => {
        console.log('Current scroll position:', window.scrollY);
    });
});

// Enhanced Image Comparison Slider
function initImageComparison() {
    const container = document.querySelector('.image-comparison');
    if (!container) return;
    
    const slider = container.querySelector('.comparison-slider');
    const tintedImage = container.querySelector('.comparison-image.tinted');
    const originalImage = container.querySelector('.comparison-image.original');
    
    let isSliding = false;
    let startX;
    let sliderLeft;

    function updateSliderPosition(clientX) {
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerLeft = containerRect.left;
        
        // Calculate percentage
        let percentage = ((clientX - containerLeft) / containerWidth) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100);
        
        // Update slider position
        slider.style.left = `${percentage}%`;
        
        // Update image clip path
        tintedImage.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        
        // Update label opacity based on position
        const labels = container.querySelectorAll('.slider-label');
        if (labels.length === 2) {
            const beforeLabel = labels[0];
            const afterLabel = labels[1];
            
            // Adjust opacity based on slider position
            beforeLabel.style.opacity = percentage > 50 ? 0.3 : 1;
            afterLabel.style.opacity = percentage < 50 ? 0.3 : 1;
        }
    }

    function startSliding(e) {
        e.preventDefault();
        isSliding = true;
        
        // Get start position
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        
        // Add active state
        slider.querySelector('.slider-button').classList.add('active');
        container.classList.add('sliding');
        
        // Prevent text selection while dragging
        document.body.style.userSelect = 'none';
    }

    function stopSliding() {
        if (!isSliding) return;
        
        isSliding = false;
        
        // Remove active state
        slider.querySelector('.slider-button').classList.remove('active');
        container.classList.remove('sliding');
        
        // Restore text selection
        document.body.style.userSelect = '';
    }

    function slide(e) {
        if (!isSliding) return;
        
        e.preventDefault();
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        updateSliderPosition(currentX);
    }

    // Mouse events
    slider.addEventListener('mousedown', startSliding);
    document.addEventListener('mousemove', slide);
    document.addEventListener('mouseup', stopSliding);

    // Touch events
    slider.addEventListener('touchstart', startSliding);
    document.addEventListener('touchmove', slide, { passive: false });
    document.addEventListener('touchend', stopSliding);

    // Initialize at center position
    updateSliderPosition(container.getBoundingClientRect().left + container.offsetWidth / 2);
    
    // Window resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Reset to middle on resize
            updateSliderPosition(container.getBoundingClientRect().left + container.offsetWidth / 2);
        }, 250);
    });

    // Double click to reset to center
    container.addEventListener('dblclick', () => {
        updateSliderPosition(container.getBoundingClientRect().left + container.offsetWidth / 2);
    });
}

// Enhanced PPF Carousel
function initPPFCarousel() {
    const container = document.querySelector('.ppf-carousel');
    if (!container) return;
    
    const track = container.querySelector('.carousel-track');
    const slides = container.querySelectorAll('.carousel-slide');
    const prevBtn = container.querySelector('.carousel-btn.prev');
    const nextBtn = container.querySelector('.carousel-btn.next');
    const indicators = container.querySelectorAll('.indicator');
    
    let currentIndex = 0;
    let slideWidth = slides[0].offsetWidth;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    
    // Set initial slide position
    updateCarousel();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        slideWidth = slides[0].offsetWidth;
        updateCarousel();
    });
    
    // Navigation Buttons
    nextBtn.addEventListener('click', () => {
        if (currentIndex >= slides.length - 1) return;
        currentIndex++;
        updateCarousel();
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex <= 0) return;
        currentIndex--;
        updateCarousel();
    });
    
    // Indicator Buttons
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    // Touch controls
    slides.forEach((slide, index) => {
        // Touch events
        slide.addEventListener('touchstart', touchStart(index));
        slide.addEventListener('touchmove', touchMove);
        slide.addEventListener('touchend', touchEnd);
        
        // Mouse events
        slide.addEventListener('mousedown', touchStart(index));
        slide.addEventListener('mousemove', touchMove);
        slide.addEventListener('mouseup', touchEnd);
        slide.addEventListener('mouseleave', touchEnd);
    });
    
    function touchStart(index) {
        return function(event) {
            startPos = getPositionX(event);
            isDragging = true;
            animationID = requestAnimationFrame(animation);
        }
    }
    
    function touchMove(event) {
        if (isDragging) {
            const currentPosition = getPositionX(event);
            currentTranslate = prevTranslate + currentPosition - startPos;
        }
    }
    
    function touchEnd() {
        isDragging = false;
        cancelAnimationFrame(animationID);
        
        const movedBy = currentTranslate - prevTranslate;
        
        // If moved significantly, change slide
        if (movedBy < -100 && currentIndex < slides.length - 1) {
            currentIndex++;
        } else if (movedBy > 100 && currentIndex > 0) {
            currentIndex--;
        }
        
        updateCarousel();
    }
    
    function getPositionX(event) {
        return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    function animation() {
        if (isDragging) {
            setSliderPosition();
            requestAnimationFrame(animation);
        }
    }
    
    function setSliderPosition() {
        track.style.transform = `translateX(${currentTranslate}px)`;
    }
    
    function updateCarousel() {
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // Update button states
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        
        nextBtn.style.opacity = currentIndex === slides.length - 1 ? '0.5' : '1';
        nextBtn.style.pointerEvents = currentIndex === slides.length - 1 ? 'none' : 'auto';
        
        // Store the position after transition
        prevTranslate = -currentIndex * slideWidth;
        currentTranslate = prevTranslate;
    }
    
    // Auto-advance carousel
    let autoAdvanceTimer;
    
    function startAutoAdvance() {
        stopAutoAdvance(); // Clear any existing timer
        autoAdvanceTimer = setInterval(() => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 5000);
    }
    
    function stopAutoAdvance() {
        if (autoAdvanceTimer) {
            clearInterval(autoAdvanceTimer);
        }
    }
    
    // Start/stop auto-advance on hover
    container.addEventListener('mouseenter', stopAutoAdvance);
    container.addEventListener('mouseleave', startAutoAdvance);
    
    // Start auto-advance
    startAutoAdvance();
}

// Initialize service card animations
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (serviceCards.length === 0) return;
    
    // Intersection Observer for scroll animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // Observe all service cards
    serviceCards.forEach(card => {
        observer.observe(card);
        
        // Add hover animation for features
        const features = card.querySelectorAll('.service-features li');
        features.forEach((feature, index) => {
            feature.style.transitionDelay = `${index * 0.1}s`;
        });
    });
}

// Initialize benefit cards animations
function initBenefitCards() {
    const benefitCards = document.querySelectorAll('.benefit-card');
    
    if (benefitCards.length === 0) return;
    
    // Intersection Observer for scroll animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered animation
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 150);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });
    
    // Observe all benefit cards
    benefitCards.forEach(card => {
        observer.observe(card);
    });
}

// Initialize CTA section animation
function initCTASection() {
    const ctaSection = document.querySelector('.showcase-cta');
    
    if (!ctaSection) return;
    
    // Intersection Observer for scroll animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });
    
    // Observe CTA section
    observer.observe(ctaSection);
}

// Add hover effect to buttons
function initButtonEffects() {
    const buttons = document.querySelectorAll('.learn-more-btn, .cta-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const x = e.pageX - button.offsetLeft;
            const y = e.pageY - button.offsetTop;
            
            button.style.setProperty('--x', `${x}px`);
            button.style.setProperty('--y', `${y}px`);
        });
    });
}

// Initialize all car-showcase components
document.addEventListener('DOMContentLoaded', function() {
    // Add animation class to section
    const showcaseSection = document.getElementById('car-showcase');
    if (showcaseSection) {
        setTimeout(() => {
            showcaseSection.classList.add('loaded');
        }, 300);
    }
    
    // Initialize all components
    initImageComparison();
    initPPFCarousel();
    initServiceCards();
    initBenefitCards();
    initCTASection();
    initButtonEffects();
    
    // Lazy load images for better performance
    const images = document.querySelectorAll('#car-showcase img');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            if (img.getAttribute('data-src')) {
                imageObserver.observe(img);
            }
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        images.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
        });
    }
});

// Video Modal Functionality
function initVideoModal() {
    // Get modal elements
    const videoModal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const closeBtn = document.querySelector('.close-video-modal');
    const videoContainers = document.querySelectorAll('.service-video-container');
    
    if (!videoModal || !modalVideo || !closeBtn || !videoContainers.length) return;
    
    // Function to open modal with video
    function openVideoModal(videoSrc) {
        // Set video source
        modalVideo.querySelector('source').src = videoSrc;
        modalVideo.load(); // Need to reload after changing source
        
        // Show modal with animation
        videoModal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Trigger reflow for animation
        void videoModal.offsetWidth;
        
        // Start animation
        videoModal.classList.add('show');
        
        // Play video after modal animation completes
        setTimeout(() => {
            try {
                modalVideo.play();
            } catch (e) {
                console.warn('Auto-play failed. User interaction may be required.', e);
            }
        }, 400);
    }
    
    // Function to close modal
    function closeVideoModal() {
        // Pause video
        modalVideo.pause();
        
        // Hide modal with animation
        videoModal.classList.remove('show');
        
        // Remove modal after animation completes
        setTimeout(() => {
            videoModal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Clear video source to stop downloading
            modalVideo.querySelector('source').src = '';
            modalVideo.load();
        }, 300);
    }
    
    // Add click event to video containers
    videoContainers.forEach(container => {
        container.addEventListener('click', function() {
            const videoData = this.querySelector('.video-data');
            if (videoData) {
                const videoSrc = videoData.getAttribute('data-video-src');
                if (videoSrc) {
                    openVideoModal(videoSrc);
                }
            }
        });
    });
    
    // Close button click
    closeBtn.addEventListener('click', closeVideoModal);
    
    // Background click to close
    videoModal.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // ESC key to close
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal.classList.contains('show')) {
            closeVideoModal();
        }
    });
    
    // Handle video end
    modalVideo.addEventListener('ended', function() {
        // Optional: close modal when video ends
        // closeVideoModal();
        
        // Or just show a replay button
        this.controls = true;
    });
}


// Add to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    initVideoModal();
    initImageComparison();
});

document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const colorDisplay = document.getElementById('colorDisplay');
    const colorValue = document.getElementById('colorValue');
    const redSlider = document.getElementById('redSlider');
    const greenSlider = document.getElementById('greenSlider');
    const blueSlider = document.getElementById('blueSlider');
    const redValue = document.getElementById('redValue');
    const greenValue = document.getElementById('greenValue');
    const blueValue = document.getElementById('blueValue');

    function updateColor(e) {
        const color = e.target.value;
        colorDisplay.style.backgroundColor = color;
        colorValue.textContent = color.toUpperCase();
        
        // Update RGB sliders
        const r = parseInt(color.substr(1,2), 16);
        const g = parseInt(color.substr(3,2), 16);
        const b = parseInt(color.substr(5,2), 16);
        
        redSlider.value = r;
        greenSlider.value = g;
        blueSlider.value = b;
        
        redValue.textContent = r;
        greenValue.textContent = g;
        blueValue.textContent = b;
    }

    function updateFromSliders() {
        const r = parseInt(redSlider.value);
        const g = parseInt(greenSlider.value);
        const b = parseInt(blueSlider.value);
        
        const color = '#' + 
            r.toString(16).padStart(2, '0') + 
            g.toString(16).padStart(2, '0') + 
            b.toString(16).padStart(2, '0');
        
        colorPicker.value = color;
        colorDisplay.style.backgroundColor = color;
        colorValue.textContent = color.toUpperCase();
        
        redValue.textContent = r;
        greenValue.textContent = g;
        blueValue.textContent = b;
    }

    colorPicker.addEventListener('input', updateColor);
    redSlider.addEventListener('input', updateFromSliders);
    greenSlider.addEventListener('input', updateFromSliders);
    blueSlider.addEventListener('input', updateFromSliders);

    // Initial color update
    updateColor({ target: colorPicker });
});

document.addEventListener('DOMContentLoaded', function() {
    const brandButtons = document.querySelectorAll('.brand-button');
    const brandSections = document.querySelectorAll('.brand-section');

    brandButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and sections
            brandButtons.forEach(btn => btn.classList.remove('active'));
            brandSections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked button and corresponding section
            button.classList.add('active');
            const brandId = button.dataset.brand;
            document.getElementById(brandId).classList.add('active');
        });
    });
});

// Load reviews into staff showcase
async function loadShowcaseReviews() {
    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        // Get the reviews grid
        const reviewsGrid = document.querySelector('.staff-scroll .reviews-grid');
        if (!reviewsGrid) return;

        // Take only the first 6 reviews
        const showcaseReviews = reviews.slice(0, 6);
        
        // Clear existing content
        reviewsGrid.innerHTML = '';

        // Add reviews
        showcaseReviews.forEach(review => {
            const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
            
            const reviewCard = document.createElement('div');
            reviewCard.className = 'staff-item review-card clickable';
            reviewCard.innerHTML = `
                <div class="review-header">
                    <span class="review-author">${review.name}</span>
                    <span class="service-tag">${review.serviceType}</span>
                </div>
                <div class="review-stars">${stars}</div>
                <p class="review-text">"${review.review}"</p>
                <span class="review-date">${formatReviewDate(review.date)}</span>
            `;
            
            // Add click event listener to redirect to reviews.html
            reviewCard.addEventListener('click', () => {
                window.location.href = 'review.html';
            });
            
            reviewsGrid.appendChild(reviewCard);
        });

        // Clone reviews for infinite scroll if needed
        const reviews2 = reviewsGrid.cloneNode(true);
        reviewsGrid.appendChild(reviews2.children[0]);

    } catch (error) {
        console.error('Error loading showcase reviews:', error);
    }
}


// Format date helper
function formatReviewDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// Call this when the document loads
document.addEventListener('DOMContentLoaded', function() {
    // ... existing DOMContentLoaded code ...
    loadShowcaseReviews();
});

document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const indicators = document.querySelectorAll('.indicator');
    
    let currentIndex = 0;
    
    function updateCarousel() {
        // Update slide position
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update indicators
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
        
        // Update button states
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentIndex === slides.length - 1 ? '0.5' : '1';
    }
    
    function nextSlide() {
        if (currentIndex < slides.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    }
    
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    }
    
    // Button click handlers
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Indicator click handlers
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
        });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
    
    // Touch events
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) nextSlide();
        if (touchEndX > touchStartX + 50) prevSlide();
    });
    
    // Auto-advance (optional)
    setInterval(nextSlide, 5000);
});
