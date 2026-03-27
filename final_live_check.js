import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import videos from './videos.js';
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
    initAuth(); // New Auth initialization
    renderTutorials();
    renderProjects();
    renderSourceCodes();
    initScrollReveal();
    initContactForm();
});

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
        } else {
            // User is signed out
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
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            const btn = signupForm.querySelector('button');

            try {
                btn.disabled = true;
                btn.textContent = 'Creating Account...';
                await createUserWithEmailAndPassword(auth, email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Signup error:", error);
                alert(error.message);
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
function renderTutorials() {
    const homeContainer = document.getElementById('latest-tutorials-grid');
    const listContainer = document.getElementById('tutorials-listing');
    const container = homeContainer || listContainer;
    
    if (!container) return;

    const isSubpage = window.location.pathname.includes('/pages/');

    container.innerHTML = videos.map(video => `
        <div class="project-card reveal">
            <div class="project-img">
                <iframe src="https://www.youtube.com/embed/${video.youtubeId}" frameborder="0" allowfullscreen style="width:100%; height:100%;"></iframe>
            </div>
            <div class="project-info">
                <h4>${video.title}</h4>
                <p>${video.description}</p>
                <a href="${isSubpage ? '' : 'pages/'}tutorial-lesson.html?v=${video.youtubeId}" class="btn btn-primary" style="width: 100%; text-align: center; justify-content: center;">Start Learning</a>
            </div>
        </div>
    `).join('');
    
    initScrollReveal();
}


function renderProjects() {
    const container = document.getElementById('dynamic-projects-grid');
    if (!container) return;

    container.innerHTML = projects.map(project => `
        <div class="project-card reveal">
            <div class="project-img">
                <img src="${project.image.startsWith('assets') ? (window.location.pathname.includes('/pages/') ? '../' : '') + project.image : project.image}" alt="${project.title}" style="width: 100%; height: 100%; object-fit: cover;">
                <div class="project-overlay">
                    <a href="${project.liveLink}" target="_blank" class="overlay-link"><i class="fas fa-external-link-alt"></i></a>
                </div>
            </div>
            <div class="project-info">
                <span class="p-category">${project.category}</span>
                <h4>${project.title}</h4>
                <p>${project.description}</p>
                <div class="p-links">
                    <a href="${project.liveLink}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.85rem;">Live Demo</a>
                    <a href="${project.githubLink}" target="_blank" class="github-link"><i class="fab fa-github"></i> Source</a>
                </div>
            </div>
        </div>
    `).join('');

    initScrollReveal();
}

function renderSourceCodes() {
    const container = document.getElementById('source-code-grid');
    if (!container) return;

    container.innerHTML = sourceCodes.map(code => `
        <div class="source-card glass reveal" style="padding: 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; margin-bottom: 15px;">
            <div>
                <h4 style="margin: 0;">${code.project}</h4>
                <p style="font-size: 0.8rem; color: #94a3b8; margin: 5px 0 0;">${code.description}</p>
            </div>
            <a href="${code.downloadLink}" class="btn btn-primary btn-sm" style="padding: 8px 15px; font-size: 0.8rem;">Download</a>
        </div>
    `).join('');
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
