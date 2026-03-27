import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import videos from './videos.js';
import shorts from './shorts.js';
import sourceCodes from './sourcecodes.js';
import projects from './projects.js';

// 1. Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDQZbFHdOsaqFy4Y8HMKN4LAUiZU8DHz30",
    authDomain: "personal-portfolio-7f4f9.firebaseapp.com",
    projectId: "personal-portfolio-7f4f9",
    storageBucket: "personal-portfolio-7f4f9.firebasestorage.app",
    messagingSenderId: "235798424",
    appId: "1:235798424:web:fa0f71ee2d7805af7975ed",
    measurementId: "G-0045BQ68V1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 2. EmailJS Configuration
const EMAILJS_PUBLIC_KEY = "fCUKPodfRQkwqAbg2";
const EMAILJS_SERVICE_ID = "service_gdvdrpy";
const EMAILJS_TEMPLATE_ID = "template_miyim35";

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initAuth(); 
    initTyping();
    initContinueLearning();
    
    // Check for URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    const searchParam = urlParams.get('search');

    renderTutorials(searchParam || '', catParam || 'all');
    renderProjects(searchParam || '', catParam || 'all');
    renderShorts();
    renderSourceCodes();
    initScrollReveal();
    initContactForm();
    initNewsletter();
    initSearch();

    // Global Auth Links Guardian
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('auth-link') || e.target.closest('.auth-link')) {
            handleAuthGuard(e);
        }
    });

    // Set initial search value if present
    if (searchParam) {
        const searchInput = document.getElementById('tutorial-search') || document.getElementById('project-search');
        if (searchInput) searchInput.value = searchParam;
    }
});

function initSearch() {
    const tutorialSearch = document.getElementById('tutorial-search');
    const projectSearch = document.getElementById('project-search');

    if (tutorialSearch) {
        tutorialSearch.addEventListener('input', (e) => renderTutorials(e.target.value));
    }
    if (projectSearch) {
        projectSearch.addEventListener('input', (e) => renderProjects(e.target.value));
    }
}

// Typing Animation
function initTyping() {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;

    new Typed('#typing-text', {
        strings: ['Web Developer', 'Front End Developer'],
        typeSpeed: 60,
        backSpeed: 40,
        loop: true,
        backDelay: 2000
    });
}


// Initialize Contact Form
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    if (window.emailjs) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.querySelector('#contact-form button[type="submit"]');
        if (!submitBtn) return;

        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            timestamp: serverTimestamp()
        };
        
        try {
            // 1. Save to Firebase Firestore
            await addDoc(collection(db, 'portfolio_inquiries'), formData);
            
            // 2. Send Email Notification via EmailJS
            const templateParams = {
                name: formData.name,
                user_name: formData.name,
                from_name: formData.name,
                sender_name: formData.name,
                email: formData.email,
                user_email: formData.email,
                from_email: formData.email,
                reply_to: formData.email,
                message: formData.message,
                message_html: formData.message,
                db_check: "For more details, check the database."
            };

            if (window.emailjs) {
                await emailjs.send(
                    EMAILJS_SERVICE_ID, 
                    EMAILJS_TEMPLATE_ID, 
                    templateParams,
                    EMAILJS_PUBLIC_KEY
                );
            }

            alert('Success! Your proposal has been received. I will get back to you soon.');
            contactForm.reset();
        } catch (error) {
            console.error("Form submission error:", error);
            alert('Oops! Something went wrong. Please try again.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Theme Management
function initTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark for premium feel
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        const activeTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = activeTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (!icon) return;

    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Auth Management
function initAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    // Monitor Auth State
    onAuthStateChanged(auth, (user) => {
        const isProtectedPage = window.location.pathname.includes('dashboard.html');
        const loginPage = window.location.pathname.includes('login.html');
        const signupPage = window.location.pathname.includes('signup.html');

        if (user) {
            // User is signed in
            if (loginPage || signupPage) {
                window.location.href = 'dashboard.html';
            }
            if (document.getElementById('user-name')) {
                document.getElementById('user-name').textContent = `Welcome, ${user.displayName || user.email.split('@')[0]}!`;
            }
            
            // Show progress for this specific user
            initContinueLearning(user);
        } else {
            // User is signed out
            const homeNotice = document.getElementById('continue-notice');
            if (homeNotice) homeNotice.style.display = 'none';

            if (isProtectedPage) {
                window.location.href = 'login.html';
            }
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;
            const btn = loginForm.querySelector('button');
            
            try {
                btn.disabled = true;
                btn.textContent = 'Logging in...';
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Login error:", error);
                alert(error.message);
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = signupForm.querySelector('input[type="text"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            const btn = signupForm.querySelector('button');

            try {
                btn.disabled = true;
                btn.textContent = 'Creating Account...';
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName: name });
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Signup error:", error);
                if (error.code === 'auth/email-already-in-use') {
                    alert('This email is already registered! Please login instead. 🚀');
                } else {
                    alert(error.message);
                }
                btn.disabled = false;
                btn.textContent = 'Sign Up';
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                window.location.href = '../index.html';
            } catch (error) {
                console.error("Logout error:", error);
            }
        });
    }
}

// Mobile Menu
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking links
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Rendering Logic
function renderTutorials(filterText = '', category = 'all') {
    const homeContainer = document.getElementById('latest-tutorials-grid');
    const listContainer = document.getElementById('tutorials-listing');
    const container = homeContainer || listContainer;
    
    if (!container) return;

    const isSubpage = window.location.pathname.includes('/pages/');
    
    let filteredVideos = videos;
    if (filterText) {
        filteredVideos = filteredVideos.filter(v => 
            v.title.toLowerCase().includes(filterText.toLowerCase()) || 
            v.description.toLowerCase().includes(filterText.toLowerCase())
        );
    }
    
    // Limit to 3 on home page
    if (homeContainer) filteredVideos = filteredVideos.slice(0, 3);

    container.innerHTML = filteredVideos.map(video => `
        <div class="project-card reveal">
            <div class="project-img">
                <iframe src="https://www.youtube.com/embed/${video.youtubeId}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>
            </div>
            <div class="project-info">
                <h4>${video.title}</h4>
                <p>${video.description.substring(0, 100)}...</p>
                <a href="${isSubpage ? '' : 'pages/'}tutorial-lesson.html?v=${video.youtubeId}" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center;" onclick="saveProgress('${video.youtubeId}', '${video.title}')">Start Learning</a>
            </div>
        </div>
    `).join('');
    
    initScrollReveal();
}


function renderProjects(filterText = '', category = 'all') {
    const container = document.getElementById('dynamic-projects-grid');
    if (!container) return;

    let filteredProjects = projects;
    if (category && category !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (filterText) {
        filteredProjects = filteredProjects.filter(p => 
            p.title.toLowerCase().includes(filterText.toLowerCase()) || 
            p.description.toLowerCase().includes(filterText.toLowerCase()) ||
            p.category.toLowerCase().includes(filterText.toLowerCase())
        );
    }

    container.innerHTML = filteredProjects.map(project => `
        <div class="project-card reveal">
            <div class="project-img">
                <img src="${project.image.startsWith('assets') ? (window.location.pathname.includes('/pages/') ? '../' : '') + project.image : project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="project-overlay">
                    <a href="${project.liveLink}" target="_blank" class="overlay-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
            </div>
            <div class="project-info">
                <span class="p-category" style="background: var(--primary-glow); color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">${project.category}</span>
                <h4 style="margin-top: 10px;">${project.title}</h4>
                <p>${project.description}</p>
                <div class="p-links" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                    <a href="${project.liveLink}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;">Live Demo</a>
                    <a href="${project.githubLink}" target="_blank" style="color: var(--text-main); font-size: 1.2rem;"><i class="fab fa-github"></i></a>
                </div>
            </div>
        </div>
    `).join('');

    initScrollReveal();
}

// Learning Progress
window.saveProgress = function(id, title) {
    const user = auth.currentUser;
    if (user) {
        localStorage.setItem(`progress_${user.uid}`, JSON.stringify({ id, title, time: Date.now() }));
    }
};

function initContinueLearning(user) {
    if (!user) return;
    const homeNotice = document.getElementById('continue-notice');
    const data = JSON.parse(localStorage.getItem(`progress_${user.uid}`));

    if (data && homeNotice) {
        homeNotice.style.display = 'block';
        homeNotice.innerHTML = `
            <div class="glass" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">CONTINUE LEARNING</span>
                    <h4 style="margin-top: 5px;">${data.title}</h4>
                </div>
                <a href="pages/tutorial-lesson.html?v=${data.id}" class="btn btn-primary" style="padding: 0.6rem 1.2rem;">Resume</a>
            </div>
        `;
    }
}

function renderSourceCodes() {
    const container = document.getElementById('source-code-grid');
    if (!container) return;

    container.innerHTML = sourceCodes.map(code => `
        <div class="source-card glass reveal">
            <div style="margin-bottom: 1.5rem; font-size: 2rem; color: var(--primary);">
                <i class="fas fa-file-code"></i>
            </div>
            <h4>${code.project}</h4>
            <p style="margin: 1rem 0 2rem; color: var(--text-muted);">${code.description}</p>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <a href="${code.downloadLink}" class="btn btn-primary auth-link" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">Download</a>
                <a href="${code.githubRepo}" target="_blank" class="auth-link" style="color: var(--text-main); font-size: 1.2rem;"><i class="fab fa-github"></i></a>
            </div>
        </div>
    `).join('');
    
    initScrollReveal();
}

function renderShorts() {
    const container = document.getElementById('shorts-container');
    if (!container || !shorts) return;

    container.innerHTML = shorts.map(short => `
        <div class="short-card reveal">
            <iframe src="https://www.youtube.com/embed/${short.youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    `).join('');
    
    initScrollReveal();
}

function initNewsletter() {
    const form = document.getElementById('subscribe-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        
        btn.disabled = true;
        btn.innerText = 'Subscribing...';
        
        setTimeout(() => {
            const container = form.closest('.contact-card');
            if (container) {
                container.innerHTML = `
                    <div class="reveal" style="text-align: center;">
                        <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary); margin-bottom: 1.5rem;"></i>
                        <h3 style="margin-bottom: 0.5rem;">Welcome to <span class="gradient-text">webwithaditya</span>! 🚀</h3>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">You're officially on the list. Now, let's connect on other platforms!</p>
                        <div style="display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap;">
                            <a href="https://t.me/webwithaditya" target="_blank" class="btn btn-glass" style="border-color: #0088cc; color: #0088cc;">
                                <i class="fab fa-telegram"></i> Telegram
                            </a>
                            <a href="https://youtube.com/@webwithaditya" target="_blank" class="btn btn-glass" style="border-color: #ff0000; color: #ff0000;">
                                <i class="fab fa-youtube"></i> YouTube
                            </a>
                            <a href="https://instagram.com/webwithaditya" target="_blank" class="btn btn-glass" style="border-color: #e4405f; color: #e4405f;">
                                <i class="fab fa-instagram"></i> Instagram
                            </a>
                        </div>
                    </div>
                `;
                initScrollReveal();
            }
        }, 1500);
    });
}

// Scroll Reveal
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
