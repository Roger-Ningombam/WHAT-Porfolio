// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Global variables
let scene, camera, renderer, particles;
let mouseX = 0, mouseY = 0;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initGSAP();
    initNavigation();
    initContactForm();
    initParticleInteraction();
});

// Three.js Hero Background Animation
// Three.js Hero Background Animation
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create particle system
    createParticleSystem();
    
    // createFloatingShapes(); // REMOVED: This line is now removed to hide the geometric shapes.

    // Position camera
    camera.position.z = 5;

    // Start animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Mouse movement tracking
    document.addEventListener('mousemove', onMouseMove);
}

function createParticleSystem() {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
        velocityArray[i] = (Math.random() - 0.5) * 0.02;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocityArray, 3));
    
    // Create shader material for particles
    const particlesMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            attribute vec3 velocity;
            uniform float time;
            varying float vDistance;
            
            void main() {
                vec3 pos = position;
                pos.x += sin(time + position.y * 0.1) * 0.5;
                pos.y += cos(time + position.x * 0.1) * 0.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // MODIFIED: Replaced distance-based size with a small, fixed size for consistency.
                gl_PointSize = 2.0; 
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            varying float vDistance;
            
            void main() {
                vec3 color = mix(color1, color2, sin(vDistance * 0.1) * 0.5 + 0.5);
                
                // This part makes the square points appear circular and soft
                float strength = distance(gl_PointCoord, vec2(0.5));
                strength = 1.0 - strength;
                strength = pow(strength, 3.0);
                
                gl_FragColor = vec4(color, strength * 0.8);
            }
        `,
        uniforms: {
            time: { value: 0 },
            color1: { value: new THREE.Color('#64ffda') },
            color2: { value: new THREE.Color('#bb86fc') }
        },
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
}

// You can now safely delete the entire createFloatingShapes() function if you wish, as it's no longer being called.

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    if (particles) {
        particles.material.uniforms.time.value = time;
        particles.rotation.y = time * 0.05;
        
        // Mouse interaction
        particles.rotation.x += (mouseY * 0.0001 - particles.rotation.x) * 0.05;
        particles.rotation.y += (mouseX * 0.0001 - particles.rotation.y) * 0.05;
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouseX = event.clientX - window.innerWidth / 2;
    mouseY = event.clientY - window.innerHeight / 2;
}

// GSAP Animations
function initGSAP() {
    // Hero section animations
    const heroTl = gsap.timeline();
    
    heroTl.to('.hero-title', { duration: 1, opacity: 1, y: 0, ease: "power3.out" })
          .to('.hero-description', { duration: 0.8, opacity: 1, y: 0, ease: "power3.out" }, "-=0.5")
          .to('.hero-buttons', { duration: 0.8, opacity: 1, y: 0, ease: "power3.out" }, "-=0.3");

    // About section animations
    // ADD THIS NEW, CORRECTED CODE
    gsap.from('.about .grid-box', { // Targets all grid boxes in the about section
        scrollTrigger: {
            trigger: '.about-grid-asymmetric', // The new grid container
            start: 'top 80%',
            toggleActions: 'play none none reverse',
        },
        duration: 0.3,
        opacity: 0,
        y: 50, // Animate up from 50px below
        ease: 'power3.out', // This animates each box 0.2s after the previous one
    });
    // Services cards animation
    gsap.utils.toArray('.service-card').forEach((card, index) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.5,
            opacity: 1,
            y: 0,
            ease: "power3.out",
            delay: index * 0.1
        });
    });

    // Project cards animation
    gsap.utils.toArray('.project-card').forEach((card, index) => {
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            duration: 0.5,
            opacity: 1,
            y: 0,
            ease: "power3.out",
            delay: index * 0.15
        });
    });

    // Contact section animations
    gsap.to('.contact-info', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        opacity: 1,
        x: 0,
        ease: "power3.out"
    });

    gsap.to('.contact-form-container', {
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        },
        duration: 0.8,
        opacity: 1,
        x: 0,
        ease: "power3.out",
        delay: 0.3
    });

    // Navbar background on scroll
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {className: 'scrolled', targets: '.navbar'}
    });

    // Parallax effect for floating card
    gsap.to('.floating-card', {
        scrollTrigger: {
            trigger: '.about',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        y: -50,
        ease: "none"
    });
}
function initGridHoverEffect() {
    const gridBoxes = document.querySelectorAll('.grid-box');

    gridBoxes.forEach(box => {
        box.addEventListener('mousemove', e => {
            // Get the position of the box relative to the viewport
            const rect = box.getBoundingClientRect();

            // Calculate the mouse position relative to the box's top-left corner
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set the CSS custom properties on the box element
            box.style.setProperty('--mouse-x', `${x}px`);
            box.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Call this function inside your main DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    // ... all your other init functions (initThreeJS, initGSAP, etc.)
    initGridHoverEffect(); // Add this line
});
// Navigation functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation highlighting
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// Contact form functionality
function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            project: formData.get('project'),
            message: formData.get('message')
        };
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            // Reset form
            form.reset();
            
            // Show success message
            submitBtn.innerHTML = '<span>Message Sent!</span>';
            submitBtn.style.background = 'linear-gradient(135deg, #27ca3f 0%, #2dd85a 100%)';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
            
            // Show success notification
            showNotification('Message sent successfully!', 'success');
        }, 2000);
    });
    
    // Form field animations
    const formInputs = form.querySelectorAll('input, select, textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

// Particle interaction on mouse move
function initParticleInteraction() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.opacity = '0.6';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Resize canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle system for mouse interaction
    const interactiveParticles = [];
    
    function createInteractiveParticle(x, y) {
        return {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            decay: Math.random() * 0.02 + 0.01,
            size: Math.random() * 3 + 1
        };
    }
    
    function updateInteractiveParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = interactiveParticles.length - 1; i >= 0; i--) {
            const particle = interactiveParticles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                interactiveParticles.splice(i, 1);
                continue;
            }
            
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.beginPath();
            
            // Create gradient for particle
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, '#64ffda');
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        if (interactiveParticles.length > 0) {
            animationId = requestAnimationFrame(updateInteractiveParticles);
        }
    }
    
    // Mouse move event for interactive particles
    document.addEventListener('mousemove', function(e) {
        // Only create particles occasionally to avoid performance issues
        if (Math.random() > 0.7) {
            interactiveParticles.push(createInteractiveParticle(e.clientX, e.clientY));
            
            if (interactiveParticles.length === 1) {
                updateInteractiveParticles();
            }
        }
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? 'rgba(39, 202, 63, 0.9)' : 'rgba(100, 255, 218, 0.9)',
        color: '#0a0a0f',
        borderRadius: '8px',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1.02,
                ease: "power2.out"
            });
        });
        
        card.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.3,
                scale: 1,
                ease: "power2.out"
            });
        });
    });
});

// Project card hover effects with enhanced interactivity
document.addEventListener('DOMContentLoaded', function() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const preview = card.querySelector('.project-preview');
        
        card.addEventListener('mouseenter', function() {
            gsap.to(this, {
                duration: 0.4,
                y: -10,
                ease: "power2.out"
            });
            
            // Animate preview elements based on type
            const previewType = preview.className.split(' ')[1];
            animatePreview(preview, previewType, true);
        });
        
        card.addEventListener('mouseleave', function() {
            gsap.to(this, {
                duration: 0.4,
                y: 0,
                ease: "power2.out"
            });
            
            // Reset preview animation
            const previewType = preview.className.split(' ')[1];
            animatePreview(preview, previewType, false);
        });
    });
});

function animatePreview(preview, type, isHover) {
    const duration = 0.6;
    const ease = "power2.out";
    
    switch(type) {
        case 'saas-preview':
            const chartArea = preview.querySelector('.chart-area');
            const statCards = preview.querySelectorAll('.stat-card');
            
            if (isHover) {
                gsap.to(chartArea, { duration, scaleY: 1.1, ease });
                gsap.to(statCards, { duration, y: -5, stagger: 0.1, ease });
            } else {
                gsap.to(chartArea, { duration, scaleY: 1, ease });
                gsap.to(statCards, { duration, y: 0, stagger: 0.1, ease });
            }
            break;
            
        case 'landing-preview':
            const heroSection = preview.querySelector('.hero-section');
            const contentBlocks = preview.querySelectorAll('.content-block');
            
            if (isHover) {
                gsap.to(heroSection, { duration, scaleX: 1.05, ease });
                gsap.to(contentBlocks, { duration, x: 10, stagger: 0.1, ease });
            } else {
                gsap.to(heroSection, { duration, scaleX: 1, ease });
                gsap.to(contentBlocks, { duration, x: 0, stagger: 0.1, ease });
            }
            break;
            
        case 'cafe-preview':
            const menuItems = preview.querySelectorAll('.menu-item');
            
            if (isHover) {
                gsap.to(menuItems, { duration, scale: 1.05, stagger: 0.1, ease });
            } else {
                gsap.to(menuItems, { duration, scale: 1, stagger: 0.1, ease });
            }
            break;
            
        case 'ecom-preview':
            const productCards = preview.querySelectorAll('.product-card');
            
            if (isHover) {
                gsap.to(productCards, { duration, rotateY: 5, stagger: 0.1, ease });
            } else {
                gsap.to(productCards, { duration, rotateY: 0, stagger: 0.1, ease });
            }
            break;
    }
}

// Enhanced scroll indicator animation
gsap.to('.scroll-line', {
    duration: 2,
    height: '50px',
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut"
});

// Typewriter effect for hero title (optional enhancement)
function typewriterEffect() {
    const titleLines = document.querySelectorAll('.title-line');
    
    titleLines.forEach((line, index) => {
        const text = line.textContent;
        line.textContent = '';
        line.style.opacity = '1';
        
        for (let i = 0; i < text.length; i++) {
            setTimeout(() => {
                line.textContent += text.charAt(i);
            }, (index * 1000) + (i * 50));
        }
    });
}

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Add CSS for active nav links
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--accent-primary) !important;
    }
    
    .nav-link.active::after {
        width: 100% !important;
    }
    
    .navbar.scrolled {
        background: rgba(10, 10, 15, 0.95) !important;
        backdrop-filter: blur(30px) !important;
    }
    
    .form-group.focused label {
        color: var(--accent-primary);
        transform: translateY(-2px);
        transition: all 0.3s ease;
    }
    
    .notification {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from { transform: translateX(400px); }
        to { transform: translateX(0); }
    }
    
    /* Enhanced hover effects */
    .skill-item:hover {
        transform: translateY(-3px) !important;
        box-shadow: 0 10px 30px rgba(100, 255, 218, 0.2) !important;
    }
    
    .contact-item:hover {
        transform: translateY(-2px);
        border-color: var(--accent-primary);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);