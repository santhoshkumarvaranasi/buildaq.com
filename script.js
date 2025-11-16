// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletterForm');
    const emailInput = document.getElementById('emailInput');
    const successMessage = document.getElementById('successMessage');
    
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate email
        const email = emailInput.value.trim();
        if (!isValidEmail(email)) {
            showFormError('Please enter a valid email address');
            return;
        }
        
        // Simulate API call
        submitNewsletter(email);
    });
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        if (!data.name || !data.email || !data.subject || !data.message) {
            showFormError('Please fill in all required fields');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            showFormError('Please enter a valid email address');
            return;
        }
        
        // Simulate API call
        submitContactForm(data);
    });
    
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.service-card, .feature-item, .stat-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Counter animation for stats
    const animateCounters = () => {
        document.querySelectorAll('.stat-number').forEach(counter => {
            const target = counter.textContent;
            const isPercentage = target.includes('%');
            const isTime = target.includes('/');
            
            if (isPercentage || isTime) return; // Skip non-numeric stats
            
            const count = parseInt(target.replace(/\D/g, ''));
            let current = 0;
            const increment = count / 30; // Animation duration
            
            const updateCounter = () => {
                if (current < count) {
                    current += increment;
                    counter.textContent = Math.ceil(current) + '+';
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        });
    };
    
    // Trigger counter animation when stats section is visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                statsObserver.unobserve(entry.target);
            }
        });
    });
    
    const statsSection = document.querySelector('.stats-grid');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroContent = document.querySelector('.hero-content');
        if (heroContent && scrolled < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
    });
    
    // Add loading animation to buttons
    document.querySelectorAll('.submit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                this.style.pointerEvents = 'none';
                
                // Remove loading state after 2 seconds
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.style.pointerEvents = 'auto';
                }, 2000);
            }
        });
    });
});

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormError(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
        animation: shake 0.5s ease-in-out;
    `;
    
    // Remove existing error messages
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    
    // Add error message
    const form = document.activeElement.closest('form');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

function submitNewsletter(email) {
    // Simulate API call
    console.log('Newsletter subscription:', email);
    
    // Show success message
    const form = document.querySelector('.newsletter-form');
    const success = document.getElementById('successMessage');
    
    form.style.display = 'none';
    success.style.display = 'flex';
    
    // Track event (replace with actual analytics)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: 'header_newsletter'
        });
    }
}

function submitContactForm(data) {
    // Simulate API call
    console.log('Contact form submission:', data);
    
    // Show success message
    showSuccessMessage('Thank you for your message! We\'ll get back to you soon.');
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // Track event (replace with actual analytics)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_form_submit', {
            event_category: 'engagement',
            event_label: 'contact_page'
        });
    }
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.innerHTML = `
        <i data-lucide="check-circle"></i>
        <span>${message}</span>
    `;
    successDiv.style.cssText = `
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        animation: slideInUp 0.5s ease-out;
    `;
    
    // Remove existing messages
    document.querySelectorAll('.form-success, .form-error').forEach(el => el.remove());
    
    // Add success message
    const form = document.getElementById('contactForm');
    form.parentNode.insertBefore(successDiv, form);
    
    // Initialize icon
    lucide.createIcons();
    
    // Remove success message after 7 seconds
    setTimeout(() => successDiv.remove(), 7000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .submit-btn.loading {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .submit-btn.loading span {
        opacity: 0.5;
    }
    
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }
    
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);