document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        const navLinksList = document.querySelectorAll('.nav-links a');
        navLinksList.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Forms now use Formspree - AJAX submission to stay on page
    // Newsletter form with AJAX
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[name="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            if (!isValidEmail(emailInput.value.trim())) {
                alert('Please enter a valid email address');
                return false;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<span>Subscribing...</span>';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Track successful newsletter signup
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'newsletter_signup', {
                            event_category: 'engagement',
                            event_label: 'header_newsletter',
                            value: 1
                        });
                    }
                    
                    // Show success message
                    this.innerHTML = `
                        <div style="text-align: center; padding: 2rem; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.3);">
                            <div style="font-size: 2rem; color: #22c55e; margin-bottom: 1rem;">✓</div>
                            <h3 style="color: #22c55e; margin-bottom: 0.5rem;">Thank you for subscribing!</h3>
                            <p style="color: #666; margin: 0;">We'll keep you updated with our latest news and insights.</p>
                        </div>
                    `;
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                alert('Something went wrong. Please try again later.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Contact form with AJAX
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = this.querySelector('input[name="name"]').value.trim();
            const email = this.querySelector('input[name="email"]').value.trim();
            const message = this.querySelector('textarea[name="message"]').value.trim();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            if (!name || !email || !message) {
                alert('Please fill in all required fields');
                return false;
            }
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address');
                return false;
            }
            
            // Show loading state
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;
            
            try {
                const formData = new FormData(this);
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    // Track successful contact form submission
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'contact_form_submit', {
                            event_category: 'engagement',
                            event_label: 'contact_page',
                            value: 1
                        });
                    }
                    
                    // Show success message
                    this.innerHTML = `
                        <div style="text-align: center; padding: 3rem; background: rgba(34, 197, 94, 0.1); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.3);">
                            <div style="font-size: 3rem; color: #22c55e; margin-bottom: 1rem;">✓</div>
                            <h3 style="color: #22c55e; margin-bottom: 1rem;">Message Sent Successfully!</h3>
                            <p style="color: #666; margin-bottom: 2rem; line-height: 1.6;">Thank you for reaching out to BuildAQ. We've received your message and will get back to you within 24 hours.</p>
                            <button onclick="location.reload()" style="background: #22c55e; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500;">Send Another Message</button>
                        </div>
                    `;
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                alert('Something went wrong. Please try again later.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Portfolio filtering
    const filterButtons = document.querySelectorAll('.portfolio-filter');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            portfolioItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
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
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
    
    // Skill bar animations
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillFills = entry.target.querySelectorAll('.skill-fill');
                skillFills.forEach(fill => {
                    const skill = fill.getAttribute('data-skill');
                    setTimeout(() => {
                        fill.style.width = skill + '%';
                    }, 200);
                });
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    
    const techSection = document.querySelector('.tech-stack');
    if (techSection) {
        skillObserver.observe(techSection);
    }
    
    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        
        lastScrollY = currentScrollY;
    });
    
    // Enhanced Analytics Tracking
    if (typeof gtag !== 'undefined') {
        // Track scroll depth
        let scrollDepth = 0;
        window.addEventListener('scroll', () => {
            const currentDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            // Track 25%, 50%, 75%, 100% scroll milestones
            if (currentDepth >= 25 && scrollDepth < 25) {
                gtag('event', 'scroll', { 'percent_scrolled': 25 });
                scrollDepth = 25;
            } else if (currentDepth >= 50 && scrollDepth < 50) {
                gtag('event', 'scroll', { 'percent_scrolled': 50 });
                scrollDepth = 50;
            } else if (currentDepth >= 75 && scrollDepth < 75) {
                gtag('event', 'scroll', { 'percent_scrolled': 75 });
                scrollDepth = 75;
            } else if (currentDepth >= 90 && scrollDepth < 90) {
                gtag('event', 'scroll', { 'percent_scrolled': 100 });
                scrollDepth = 90;
            }
        });
        
        // Track section views
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionName = entry.target.id || entry.target.className.split(' ')[0];
                    gtag('event', 'section_view', {
                        'section_name': sectionName,
                        'event_category': 'engagement'
                    });
                }
            });
        }, { threshold: 0.5 });
        
        // Observe main sections
        document.querySelectorAll('section[id], .hero, .services, .portfolio, .tech-stack, .about, .contact').forEach(section => {
            sectionObserver.observe(section);
        });
        
        // Track time on page
        let startTime = Date.now();
        let timeTracked = false;
        
        // Track 30 seconds, 1 minute, 3 minutes engagement
        setTimeout(() => {
            if (!timeTracked) {
                gtag('event', 'timing_complete', {
                    'name': 'time_on_page',
                    'value': 30000,
                    'event_category': 'engagement'
                });
            }
        }, 30000);
        
        setTimeout(() => {
            if (!timeTracked) {
                gtag('event', 'timing_complete', {
                    'name': 'time_on_page',
                    'value': 60000,
                    'event_category': 'engagement'
                });
            }
        }, 60000);
        
        setTimeout(() => {
            if (!timeTracked) {
                gtag('event', 'timing_complete', {
                    'name': 'time_on_page',
                    'value': 180000,
                    'event_category': 'engagement'
                });
                timeTracked = true;
            }
        }, 180000);
    }
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}