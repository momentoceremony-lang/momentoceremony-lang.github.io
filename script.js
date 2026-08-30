// ==========================================
// 1. HERO SECTION TYPING ANIMATION
// ==========================================
const textElement = document.getElementById("typing-text");
const services = ["Weddings", "Pre-Weddings", "Baby Photo Shoots", "Birthdays", "Anniversaries"];
let serviceIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!textElement) return;
    const currentService = services[serviceIndex];
    
    if (isDeleting) {
        textElement.textContent = currentService.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentService.substring(0, charIndex + 1);
        charIndex++;
    }

    let typeSpeed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentService.length) {
        typeSpeed = 2000; 
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        serviceIndex = (serviceIndex + 1) % services.length;
        typeSpeed = 500; 
    }

    setTimeout(typeEffect, typeSpeed);
}

// ==========================================
// 2. MASTER ENGINE FOR CATEGORY SECTIONS
// ==========================================
// This single function handles the Slideshow, Flipper, and Typing for ANY category
function initCategorySection(sectionId, slideshowId, stackId, titleId, quoteId, titleText, quoteText) {
    
    // A. SILK FADE SLIDER
    const images = document.querySelectorAll(`#${slideshowId} .banner-img`);
    if(images.length > 0) {
        let currentIndex = 0;
        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 4000); 
    }

    // B. 3D CARD FLIPPER
    const stack = document.getElementById(stackId);
    if(stack) {
        const cards = Array.from(stack.querySelectorAll('.stack-card'));
        let isHovering = false;

        stack.addEventListener('mouseenter', () => isHovering = true);
        stack.addEventListener('mouseleave', () => isHovering = false);

        setInterval(() => {
            if (isHovering) return; 
            cards.forEach(card => {
                let currentPos = parseInt(card.getAttribute('data-pos'));
                let newPos = currentPos - 1;
                if (newPos < 0) { newPos = cards.length - 1; }
                card.setAttribute('data-pos', newPos);
            });
        }, 3000); 
    }

    // C. SCROLL OBSERVER & TYPING TEXT
    const section = document.getElementById(sectionId);
    const titleEl = document.getElementById(titleId);
    const quoteEl = document.getElementById(quoteId);
    let typingStarted = false;

    function typeText(element, text, speed, callback) {
        if(!element) return;
        let i = 0;
        element.innerHTML = "";
        function typeWriter() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, speed);
            } else if (callback) {
                callback();
            }
        }
        typeWriter();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !typingStarted) {
                typingStarted = true;
                typeText(titleEl, titleText, 100, () => {
                    typeText(quoteEl, quoteText, 40);
                });
            }
        });
    }, { threshold: 0.4 }); 

    if(section && titleEl && quoteEl) {
        observer.observe(section);
    }
}

// ==========================================
// 3. MODAL POPUP LOGIC
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; 
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        document.body.style.overflow = 'auto';
    }
}

// ==========================================
// 4. INITIALIZE EVERYTHING ON PAGE LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Start Hero Typing
    setTimeout(typeEffect, 1000); 

    // Initialize Wedding Section
    initCategorySection(
        "category-wedding", 
        "wedding-slideshow", 
        "wedding-stack", 
        "wedding-title-type", 
        "wedding-quote-type", 
        "Weading", 
        '"Because every love story is beautiful, but yours should be a masterpiece. Let us freeze your fleeting moments into eternal memories."'
    );

    // Initialize Birthday Section
    initCategorySection(
        "category-birthday", 
        "birthday-slideshow", 
        "birthday-stack", 
        "birthday-title-type", 
        "birthday-quote-type", 
        "Birthdays", 
        '"Every year is a new chapter in your story. Let us capture the joy, the laughter, and the magic of your special day."'
    );
    // Initialize Anniversaries
    initCategorySection(
        "category-anni", 
        "anni-slideshow", 
        "anni-stack", 
        "anni-title-type", 
        "anni-quote-type", 
        "Anniversaries", 
        '"Milestones of love, celebrated in style. We reflect the depth and beauty of your enduring bond."'
    );
    // Initialize Pre-Weddings
    initCategorySection(
        "category-prewed", 
        "prewed-slideshow", 
        "prewed-stack", 
        "prewed-title-type", 
        "prewed-quote-type", 
        "Pre-Weddings", 
        '"Before the vows, there is the romance. Let us capture the pure excitement of your journey together."'
    );
});

// ==========================================
// 5. AUTHENTICATION LOGIC (API INTEGRATION)
// ==========================================
// This points directly to your live Railway server
const API_BASE_URL = "https://momento-backend-production-182a.up.railway.app/api/auth";

// Open Auth Modal when "Sign In" is clicked in Navbar
const signInBtn = document.querySelector('.btn-login');
if(signInBtn) {
    signInBtn.addEventListener('click', () => {
        openModal('modal-auth');
        switchAuth('login');
    });
}

// Toggle between Login, Register, and OTP screens
function switchAuth(section) {
    document.getElementById('login-section').style.display = section === 'login' ? 'block' : 'none';
    document.getElementById('register-section').style.display = section === 'register' ? 'block' : 'none';
    document.getElementById('otp-section').style.display = section === 'otp' ? 'block' : 'none';
}

// Step 1: Send OTP to Email
async function sendOtp() {
    const email = document.getElementById('reg-email').value;
    if(!email) return alert("Please enter your email address.");

    try {
        const res = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        
        if (data.success) {
            alert("OTP sent to your email!");
            switchAuth('otp');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Error sending OTP. Please try again.");
    }
}

// Step 2: Verify OTP and Register
async function registerUser() {
    const name = document.getElementById('reg-name').value;
    const phone = document.getElementById('reg-phone').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const otp = document.getElementById('reg-otp').value;

    if(!otp) return alert("Please enter the 4-digit OTP.");

    try {
        const res = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password, otp })
        });
        const data = await res.json();

        if (data.success) {
            alert("Registration successful! Welcome to Momento.");
            // Store session securely in browser
            localStorage.setItem('momentoToken', data.token);
            localStorage.setItem('momentoUser', JSON.stringify(data.user));
            closeModal('modal-auth');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Registration failed. Please check your connection.");
    }
}

// Login Existing User
async function loginUser() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if(!email || !password) return alert("Please enter email and password.");

    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            alert(`Welcome back, ${data.user.name}!`);
            // Store session securely in browser
            localStorage.setItem('momentoToken', data.token);
            localStorage.setItem('momentoUser', JSON.stringify(data.user));
            closeModal('modal-auth');
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Login failed. Please check your connection.");
    }
}
