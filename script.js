import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDoc, getDocs, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

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

// 2. EmailJS Configuration
const EMAILJS_PUBLIC_KEY = "fCUKPodfRQkwqAbg2";
const EMAILJS_SERVICE_ID = "service_gdvdrpy";
const EMAILJS_TEMPLATE_ID = "template_miyim35";

// Initialize EmailJS immediately (if loaded via CDN)
if (window.emailjs) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Tell the UI script that Firebase is loaded
window.firebaseInjected = true;

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- DYNAMIC CONTENT ENGINE ---
    async function initializeDynamicContent() {
        try {
            // 1. Fetch Site Settings
            const siteSettingsRef = doc(db, 'site_content', 'settings');
            const siteSnap = await getDoc(siteSettingsRef);

            if (siteSnap.exists()) {
                const data = siteSnap.data();
                if (data.hero_title) document.getElementById('dynamic-hero-title').innerHTML = data.hero_title;
                if (data.hero_desc || data.hero_description) document.getElementById('dynamic-hero-desc').textContent = data.hero_desc || data.hero_description;
                if (data.about_title) document.getElementById('dynamic-about-title').innerHTML = data.about_title;
                if (data.about_desc) document.getElementById('dynamic-about-desc').textContent = data.about_desc;
                if (data.contact_desc) document.getElementById('dynamic-contact-desc').textContent = data.contact_desc;
                
                if (data.roles) {
                    const rolesArray = Array.isArray(data.roles) ? data.roles : [data.roles];
                    window.startTyping(rolesArray);
                } else {
                    window.startTyping(['Frontend Web Developer']);
                }
            } else {
                window.startTyping(['Frontend Web Developer', 'Freelance Web Expert', 'UI/UX Enthusiast']);
            }

            // 2. Fetch Projects
            const projectsSnap = await getDocs(collection(db, 'projects'));
            const projectsGrid = document.getElementById('dynamic-projects-grid');
            
            const validProjects = projectsSnap.docs.filter(doc => {
                const d = doc.data();
                return (d.title || d.name) && (d.description || d.desc);
            });
            
            if (validProjects.length > 0) {
                const existingTitles = Array.from(projectsGrid.querySelectorAll('h4')).map(h4 => h4.textContent.trim().toLowerCase());

                validProjects.forEach(doc => {
                    const p = doc.data();
                    const title = p.title || p.name;
                    
                    if (title && !existingTitles.includes(title.toLowerCase())) {
                        const desc = p.description || p.desc;
                        const category = p.category || "Development";
                        
                        projectsGrid.innerHTML += `
                            <div class="project-card reveal active">
                                <div class="project-img">
                                    <img src="${p.image || 'assets/logo.png'}" alt="${title}" style="${!p.image ? 'object-fit: contain; padding: 20px;' : ''}">
                                    <div class="project-overlay">
                                        <a href="${p.link || '#'}" class="overlay-link"><i class="fas fa-external-link-alt"></i></a>
                                    </div>
                                </div>
                                <div class="project-info">
                                    <span class="p-category">${category}</span>
                                    <h4>${title}</h4>
                                    <p>${desc}</p>
                                    <div class="p-links">
                                        <a href="${p.link || '#'}">Live Project <i class="fas fa-chevron-right"></i></a>
                                        <a href="${p.github || '#'}" class="github-link"><i class="fab fa-github"></i></a>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                });
            }

            // 3. Fetch Services
            const servicesSnap = await getDocs(collection(db, 'services'));
            const servicesGrid = document.getElementById('dynamic-services-grid');
            
            const validServices = servicesSnap.docs.filter(doc => {
                const d = doc.data();
                return (d.title || d.name) && (d.description || d.desc);
            });

            if (validServices.length > 0) {
                const existingServices = Array.from(servicesGrid.querySelectorAll('h4')).map(h4 => h4.textContent.trim().toLowerCase());

                validServices.forEach(doc => {
                    const s = doc.data();
                    const title = s.title || s.name;
                    
                    if (title && !existingServices.includes(title.toLowerCase())) {
                        const desc = s.description || s.desc;
                        servicesGrid.innerHTML += `
                            <div class="service-item glass reveal active">
                                <i class="${s.icon || 'fas fa-star'}"></i>
                                <h4>${title}</h4>
                                <p>${desc}</p>
                            </div>
                        `;
                    }
                });
            }

            if (window.triggerReveal) window.triggerReveal();

        } catch (error) {
            console.error("Error loading dynamic content:", error);
            window.startTyping(['Frontend Web Developer', 'Freelance Web Expert', 'UI/UX Enthusiast']);
        }
    }

    // --- INITIALIZATION ---
    initializeDynamicContent().catch(err => console.error("Firebase load error:", err));

    // --- CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = document.querySelector('#contact-form button[type="submit"]');
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
                
                // 2. Send Email Notification via EmailJS (Exhaustive matching)
                const templateParams = {
                    // Variations of Name
                    name: formData.name,
                    user_name: formData.name,
                    from_name: formData.name,
                    sender_name: formData.name,
                    
                    // Variations of Email
                    email: formData.email,
                    user_email: formData.email,
                    from_email: formData.email,
                    reply_to: formData.email,
                    
                    // Message and custom fields
                    message: formData.message,
                    message_html: formData.message,
                    db_check: "For more details, check the database."
                };

                const response = await emailjs.send(
                    EMAILJS_SERVICE_ID, 
                    EMAILJS_TEMPLATE_ID, 
                    templateParams,
                    EMAILJS_PUBLIC_KEY
                );

                console.log("Email sent successfully:", response);
                alert('Success! Your proposal has been received. I will get back to you soon.');
                contactForm.reset();
            } catch (error) {
                console.error("Form submission error detailed:", error);
                
                let errorMsg = 'Oops! Something went wrong. Please try again.';
                if (error && error.status === 422) {
                    errorMsg = `Configuration Error (422): Please check if Template ID "${EMAILJS_TEMPLATE_ID}" exists and its variables match. Error: ${error.text || 'Unprocessable Entity'}`;
                } else if (error && error.text) {
                    errorMsg = `EmailJS Error: ${error.text}`;
                }
                
                alert(errorMsg);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});
