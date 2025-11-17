document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Mobile navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on links
        const navMenuLinks = document.querySelectorAll('.nav-menu a');
        navMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
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
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter items
            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                if (filter === 'all' || itemCategory === filter) {
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
    const header = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;
    
    if (header) {
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
    }
    
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

// Demo Application Functions
function showDemoDetails(appType) {
    const demoDetails = {
        schools: {
            title: "Schools Management Portal",
            description: "A comprehensive educational institution management system featuring student enrollment, teacher management, course scheduling, and analytics dashboard. Built with Angular 18 and Module Federation for scalable micro-frontend architecture.",
            features: [
                "Student Information System (SIS)",
                "Teacher & Staff Management",
                "Course & Schedule Management",
                "Attendance Tracking",
                "Grade Management",
                "Parent Portal Integration",
                "Analytics & Reporting",
                "Multi-tenant Architecture"
            ],
            tech: ["Angular 18", "TypeScript", "Module Federation", "RxJS", "Angular Material", "Chart.js", "Azure Active Directory", "RESTful APIs"],
            status: "Live and fully functional",
            demoUrl: "https://schools.buildaq.com"
        },
        healthcare: {
            title: "Healthcare Management System",
            description: "Advanced healthcare facility management platform with patient records, appointment scheduling, telemedicine integration, and AI-powered diagnostics support.",
            features: [
                "Electronic Health Records (EHR)",
                "Patient Registration & Management",
                "Appointment Scheduling",
                "Telemedicine Integration",
                "Prescription Management",
                "Laboratory Information System",
                "Billing & Insurance",
                "AI-Assisted Diagnostics"
            ],
            tech: ["Angular", "Node.js", "MongoDB", "Socket.io", "FHIR", "Machine Learning", "Azure Health Bot", "Secure Messaging"],
            status: "In Development - Q2 2025",
            demoUrl: null
        },
        realestate: {
            title: "Real Estate Management Portal",
            description: "Modern property management platform featuring virtual property tours, CRM integration, market analytics, and automated property valuation models.",
            features: [
                "Property Listing Management",
                "3D Virtual Tours",
                "CRM & Lead Management",
                "Market Analytics Dashboard",
                "Automated Valuation Models",
                "Document Management",
                "Financial Reporting",
                "Mobile Apps for Agents"
            ],
            tech: ["React", "Three.js", "Python", "TensorFlow", "PostgreSQL", "GIS Integration", "Stripe Payments", "AWS Services"],
            status: "Planning Phase - Q3 2025",
            demoUrl: null
        }
    };

    const details = demoDetails[appType];
    if (!details) return;

    // Create modal HTML
    const modalHTML = `
        <div class="demo-modal-overlay" onclick="closeDemoModal()">
            <div class="demo-modal" onclick="event.stopPropagation()">
                <div class="demo-modal-header">
                    <h2>${details.title}</h2>
                    <button class="modal-close-btn" onclick="closeDemoModal()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="demo-modal-content">
                    <div class="demo-modal-description">
                        <p>${details.description}</p>
                        <div class="demo-status">
                            <strong>Status:</strong> <span class="status-text">${details.status}</span>
                        </div>
                    </div>
                    
                    <div class="demo-modal-section">
                        <h3>Key Features</h3>
                        <ul class="feature-list">
                            ${details.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="demo-modal-section">
                        <h3>Technology Stack</h3>
                        <div class="tech-grid">
                            ${details.tech.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                        </div>
                    </div>
                    
                    ${details.demoUrl ? `
                        <div class="demo-modal-actions">
                            <a href="${details.demoUrl}" target="_blank" class="demo-btn primary">
                                <i data-lucide="external-link"></i>
                                <span>Launch Demo</span>
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize icons in modal
    lucide.createIcons();
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Track demo interaction
    if (typeof gtag !== 'undefined') {
        gtag('event', 'demo_details_view', {
            'demo_type': appType,
            'event_category': 'demo_interaction'
        });
    }
}

function closeDemoModal() {
    const modal = document.querySelector('.demo-modal-overlay');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Handle demo launch clicks
function trackDemoLaunch(appType, url) {
    // Track demo launch
    if (typeof gtag !== 'undefined') {
        gtag('event', 'demo_launch', {
            'demo_type': appType,
            'demo_url': url,
            'event_category': 'demo_interaction'
        });
    }
    
    // Open in new tab
    window.open(url, '_blank');
}

// Add modal styles dynamically
const demoModalStyles = `
<style>
.demo-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.demo-modal {
    background: white;
    border-radius: 20px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from { 
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }
    to { 
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.demo-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem 2rem 1rem 2rem;
    border-bottom: 1px solid #e2e8f0;
}

.demo-modal-header h2 {
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 700;
}

.modal-close-btn {
    background: none;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    transition: background 0.3s ease;
}

.modal-close-btn:hover {
    background: #f1f5f9;
    color: #334155;
}

.demo-modal-content {
    padding: 2rem;
}

.demo-modal-description p {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.demo-status {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid #667eea;
}

.demo-status .status-text {
    color: #667eea;
    font-weight: 600;
}

.demo-modal-section {
    margin-bottom: 2rem;
}

.demo-modal-section h3 {
    color: #1e293b;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1rem;
}

.feature-list {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
}

.feature-list li {
    padding: 0.5rem 0;
    color: #64748b;
    position: relative;
    padding-left: 1.5rem;
}

.feature-list li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #10b981;
    font-weight: bold;
}

.tech-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tech-badge {
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
    color: #667eea;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    border: 1px solid rgba(102, 126, 234, 0.2);
}

.demo-modal-actions {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: center;
}

@media (max-width: 768px) {
    .demo-modal {
        width: 95%;
        margin: 1rem;
    }
    
    .demo-modal-header,
    .demo-modal-content {
        padding: 1.5rem;
    }
    
    .feature-list {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Add styles to head
if (!document.querySelector('#demo-modal-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'demo-modal-styles';
    styleElement.innerHTML = demoModalStyles;
    document.head.appendChild(styleElement);
}