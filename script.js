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

    //B is deleted
    
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
    // Initialize Baby Shoot
    initCategorySection(
        "category-baby", 
        "baby-slideshow", 
        "baby-stack", 
        "baby-title-type", 
        "baby-quote-type", 
        "Baby Shoot", 
        '"Tiny fingers, tiny toes, our love for you just grows and grows. Let us capture the pure innocence of your little one\'s first milestones."'
    );
    // Initialize Custom Premium Date Pickers (Forces custom UI on mobile)
    flatpickr("#book-start", { minDate: "today", dateFormat: "Y-m-d", altInput: true, altFormat: "F j, Y", disableMobile: true });
    flatpickr("#book-end", { minDate: "today", dateFormat: "Y-m-d", altInput: true, altFormat: "F j, Y", disableMobile: true });
    
    checkLoginState();
});

// ==========================================
// 5. AUTHENTICATION LOGIC (API INTEGRATION)
// ==========================================
// This points directly to your live Railway server
const API_BASE_URL = "https://momento-backend-production-8b55.up.railway.app/api/auth";

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

// Step 1: Send OTP to Email (With Visual Feedback & Error Handling)
async function sendOtp() {
    const email = document.getElementById('reg-email').value.trim();
    if (!email) return alert("Please enter your email address.");

    const sendBtn = document.querySelector('#register-section button');
    const originalText = sendBtn.innerText;
    sendBtn.innerText = "Sending OTP...";
    sendBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        
        if (res.ok && data.success) {
            alert("OTP sent successfully! Please check your email inbox (and spam folder).");
            switchAuth('otp');
        } else {
            alert("Server Error: " + (data.error || "Failed to send OTP"));
        }
    } catch (error) {
        console.error("Network / Fetch Error:", error);
        alert("Connection Error: Could not connect to backend server. Details: " + error.message);
    } finally {
        sendBtn.innerText = originalText;
        sendBtn.disabled = false;
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

// Login Existing User (With Debugging)
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
        
        // If server returns HTML instead of JSON, catch the exact message
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const errorText = await res.text();
            throw new Error(`Server returned HTML (Status ${res.status}): ` + errorText.substring(0, 100));
        }

        const data = await res.json();

        if (data.success) {
            alert(`Welcome back, ${data.user.name}!`);
            localStorage.setItem('momentoToken', data.token);
            localStorage.setItem('momentoUser', JSON.stringify(data.user));
            closeModal('modal-auth');
            checkLoginState();
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Login Error: " + error.message);
    }
}

// ==========================================
// 6. SESSION MANAGEMENT (KEEP USER LOGGED IN)
// ==========================================
function checkLoginState() {
    const userString = localStorage.getItem('momentoUser');
    const isPro = localStorage.getItem('isPro');
    const authContainer = document.querySelector('.auth-buttons');
    
    if (userString && authContainer) {
        const user = JSON.parse(userString);
        const firstName = user.name.split(' ')[0];
        
        if (isPro === 'true') {
            // Photographer State
            authContainer.innerHTML = `
                <span style="margin-right: 20px; font-weight: bold; color: var(--primary-color); font-family: 'Playfair Display', serif; font-size: 1.2rem; font-style: italic;">
                    Pro: ${firstName}
                </span>
                <button class="btn-signup" style="margin-right: 10px;" onclick="window.location.href='pro-dashboard.html'">Dashboard</button>
                <button class="btn-login" onclick="logoutUser()">Logout</button>
            `;
        } else {
            // Customer State
            authContainer.innerHTML = `
                <span style="margin-right: 20px; font-weight: bold; color: var(--primary-color); font-family: 'Playfair Display', serif; font-size: 1.2rem; font-style: italic;">
                    Welcome, ${firstName}
                </span>
                <button class="btn-signup" style="margin-right: 10px;" onclick="openDashboard()">My Bookings</button>
                <button class="btn-login" onclick="logoutUser()">Logout</button>
            `;
        }
    }
}

function logoutUser() {
    localStorage.removeItem('momentoToken');
    localStorage.removeItem('momentoUser');
    window.location.reload(); // Refresh the page to reset the UI
}

function openDashboard() {
    alert("Dashboard coming soon! Here you will see your active bookings.");
}

// ==========================================
// 7. BOOKING ENGINE 
// ==========================================
let currentSelectedPhotographer = "";

function handleBookNow(photographerName) {
    const userString = localStorage.getItem('momentoUser');
    
    if (userString) {
        currentSelectedPhotographer = photographerName;
        document.getElementById('booking-photographer-name').innerText = `Requesting: ${photographerName}`;
        
        // Force close ANY open modals (like the profile details window)
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        openModal('modal-booking');
    } else {
        alert("Please Sign In or Create an Account to book a photographer.");
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'hidden';
        
        openModal('modal-auth');
        switchAuth('login');
    }
}

async function submitBooking() {
    const startDate = document.getElementById('book-start').value;
    const endDate = document.getElementById('book-end').value;
    const category = document.getElementById('book-category').value;
    const details = document.getElementById('book-details').value.trim();

    if (!startDate || !endDate || !category) {
        return alert("Please fill in the dates and select an event category.");
    }

    if (new Date(startDate) > new Date(endDate)) {
        return alert("End Date cannot be before Start Date.");
    }

    const userString = localStorage.getItem('momentoUser');
    if (!userString) return alert("Session expired. Please log in again.");
    const user = JSON.parse(userString);

    const submitBtn = document.querySelector('#modal-booking .btn-book-now');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Processing...";
    submitBtn.disabled = true;

    try {
        const res = await fetch('https://momento-backend-production-8b55.up.railway.app/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: user.id,
                photographerName: currentSelectedPhotographer,
                startDate: startDate,
                endDate: endDate,
                category: category,
                details: details
            })
        });

        const data = await res.json();

        if (data.success) {
            closeModal('modal-booking');
            
            // Insert the ticket ID into our new premium modal and open it
            document.getElementById('success-ticket-id').innerText = data.ticketId;
            openModal('modal-booking-success');
            
            // Reset form
            document.getElementById('book-start').value = "";
            document.getElementById('book-end').value = "";
            document.getElementById('book-category').value = "";
            document.getElementById('book-details').value = "";
            document.getElementById('book-category-display').innerText = "Select Event Category";
            document.getElementById('book-category-display').style.color = "";
        } else {
            alert("Error: " + data.error);
        }
    } catch (error) {
        alert("Failed to submit booking. Please check your connection.");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

// ==========================================
// 8. PHOTOGRAPHER GATEWAY (PRO AUTH)
// ==========================================
const joinProBtn = document.querySelector('.btn-signup');
if(joinProBtn) {
    // If user is already logged in as a customer, don't let them open the pro modal blindly
    joinProBtn.addEventListener('click', () => {
        if (localStorage.getItem('momentoUser') && !localStorage.getItem('isPro')) {
            alert("You are currently logged in as a Customer. Please logout first to access the Photographer Portal.");
            return;
        }
        openModal('modal-pro-auth');
        switchProAuth('login');
    });
}

function openProModalFromFooter() {
    if (localStorage.getItem('momentoUser') && !localStorage.getItem('isPro')) {
        alert("You are currently logged in as a Customer. Please logout first to access the Photographer Portal.");
        return;
    }
    openModal('modal-pro-auth');
    switchProAuth('login');
}

function switchProAuth(section) {
    document.getElementById('pro-login-section').style.display = section === 'login' ? 'block' : 'none';
    document.getElementById('pro-register-section').style.display = section === 'register' ? 'block' : 'none';
    document.getElementById('pro-otp-section').style.display = section === 'otp' ? 'block' : 'none';
}

async function sendProOtp() {
    const email = document.getElementById('pro-reg-email').value.trim();
    if (!email) return alert("Please enter your email address.");

    const sendBtn = document.querySelector('#pro-register-section button');
    const originalText = sendBtn.innerText;
    sendBtn.innerText = "Sending...";
    sendBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (res.ok && data.success) {
            alert("Verification code sent to your email!");
            switchProAuth('otp');
        } else {
            alert("Error: " + (data.error || "Failed to send OTP"));
        }
    } catch (error) {
        alert("Connection Error. Please try again.");
    } finally {
        sendBtn.innerText = originalText;
        sendBtn.disabled = false;
    }
}

async function registerPro() {
    const name = document.getElementById('pro-reg-name').value;
    const phone = document.getElementById('pro-reg-phone').value;
    const email = document.getElementById('pro-reg-email').value;
    const password = document.getElementById('pro-reg-password').value;
    const otp = document.getElementById('pro-reg-otp').value;

    if (!otp) return alert("Please enter the 4-digit OTP.");

    try {
        const res = await fetch(`${API_BASE_URL}/pro-register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password, otp })
        });
        const data = await res.json();

        if (data.success) {
            alert("Welcome to Momento Photography! Redirecting to your dashboard...");
            localStorage.setItem('momentoToken', data.token);
            localStorage.setItem('momentoUser', JSON.stringify(data.user));
            localStorage.setItem('isPro', 'true');
            window.location.href = "pro-dashboard.html"; // Direct redirect
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Registration failed. Please check your connection.");
    }
}

async function loginPro() {
    const email = document.getElementById('pro-login-email').value;
    const password = document.getElementById('pro-login-password').value;

    if (!email || !password) return alert("Please enter email and password.");

    try {
        const res = await fetch(`${API_BASE_URL}/pro-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem('momentoToken', data.token);
            localStorage.setItem('momentoUser', JSON.stringify(data.user));
            localStorage.setItem('isPro', 'true');
            window.location.href = "pro-dashboard.html"; // Direct redirect
        } else {
            alert(data.error);
        }
    } catch (error) {
        alert("Pro Login Error: " + error.message);
    }
}

// ==========================================
// 9. DETAILED PROFILE & CUSTOM UI LOGIC
// ==========================================

function triggerBookingFromProfile() {
    // Explicitly close the profile modal first
    closeModal('modal-pro-details');
    // Add a tiny delay to ensure the browser clears the screen before opening the next
    setTimeout(() => {
        handleBookNow(currentViewedPro);
    }, 100);
}

// Custom Premium Dropdown Logic
function toggleCustomSelect() {
    document.getElementById('book-category-options').classList.toggle('show');
}

function selectCategory(val) {
    document.getElementById('book-category-display').innerText = val;
    document.getElementById('book-category-display').style.color = "var(--primary-color)";
    document.getElementById('book-category').value = val;
}

// Close custom dropdown if clicked outside
window.addEventListener('click', function(event) {
    if (!event.target.closest('.custom-select-wrapper')) {
        const options = document.getElementById('book-category-options');
        if(options) options.classList.remove('show');
    }
    
    // Existing dot-menu code...
    if (!event.target.matches('.dot-menu-icon')) {
        var dropdowns = document.getElementsByClassName("pro-dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show-dropdown')) {
                openDropdown.classList.remove('show-dropdown');
            }
        }
    }
});

// ==========================================
// 10. DYNAMIC PHOTOGRAPHER RENDERING
// ==========================================
let allPhotographers = [];

// Fetch data from database on page load
async function fetchAndRenderPhotographers() {
    try {
        const res = await fetch('https://momento-backend-production-8b55.up.railway.app/api/photographers');
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            allPhotographers = data.data;
            renderMasterPhotographerList();
            renderCategoryStacks(); 
            renderCategoryModals(); // NEW: Triggers dynamic lists for "View All Professionals"
        }
    } catch (error) {
        console.error("Failed to load photographers from DB:", error);
    }
}

// Inject profiles into the "Our Photographers" Master Modal
function renderMasterPhotographerList() {
    const grid = document.querySelector('#modal-all-photographers .modal-card-grid');
    grid.innerHTML = ''; // Clear the dummy data

    allPhotographers.forEach(pro => {
        // FIX: Now strictly uses the Banner Image, falling back to DP if missing
        const mainDisplayImg = pro.banner_url || pro.dp_url; 
        const specsText = pro.specialties.join(' • ');

        const cardHTML = `
            <div class="modal-card-item">
                <div class="pro-card" onclick="viewProProfile('${pro.id}')" style="cursor: pointer;">
                    <img src="${mainDisplayImg}" class="best-shot" alt="Banner">
                    <div class="dp-wrapper"><img src="${pro.dp_url}" class="pro-dp" alt="DP"></div>
                    <div class="dp-overlay-text"><p>🏆 ${specsText}</p></div>
                </div>
                <div class="modal-card-details">
                    <h3>${pro.name}</h3>
                    <div class="btn-group">
                        <button class="btn-view-profile" onclick="viewProProfile('${pro.id}')">View Profile</button>
                        <button class="btn-book-now" onclick="handleBookNow('${pro.name}')">Book Now</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });
}

// NEW: Inject Dynamic Cards into Wedding, Birthday, Anni, Pre-Wed Modals
function renderCategoryModals() {
    const categories = [
        { modalId: 'modal-wedding', name: 'Wedding' },
        { modalId: 'modal-birthday', name: 'Birthday' },
        { modalId: 'modal-anni', name: 'Anniversary' },
        { modalId: 'modal-prewed', name: 'Pre-Wedding' },
        { modalId: 'modal-baby', name: 'Baby Shoot' }
    ];

    categories.forEach(cat => {
        const grid = document.querySelector(`#${cat.modalId} .modal-card-grid`);
        if (!grid) return;
        
        // Find pros who actually selected this specific specialty
        const prosInCat = allPhotographers.filter(pro => 
            pro.specialties && pro.specialties.includes(cat.name)
        );
        
        grid.innerHTML = ''; // Erase the dummy HTML cards

        if (prosInCat.length === 0) {
            grid.innerHTML = '<p style="opacity:0.6; padding: 20px; text-align: center; width: 100%;">No professionals available for this category yet.</p>';
            return;
        }
        
        prosInCat.forEach(pro => {
            // Uses the specific 'Best Shot' for this category, so a Wedding shot shows in the Wedding modal
            const displayImg = (pro.best_shots && pro.best_shots[cat.name]) ? pro.best_shots[cat.name] : (pro.banner_url || pro.dp_url);
            const specsText = pro.specialties.join(' • ');

            const cardHTML = `
                <div class="modal-card-item">
                    <div class="pro-card" onclick="viewProProfile('${pro.id}')" style="cursor: pointer;">
                        <img src="${displayImg}" class="best-shot" alt="Shot">
                        <div class="dp-wrapper"><img src="${pro.dp_url}" class="pro-dp" alt="DP"></div>
                        <div class="dp-overlay-text"><p>🏆 ${specsText}</p></div>
                    </div>
                    <div class="modal-card-details">
                        <h3>${pro.name}</h3>
                        <div class="btn-group">
                            <button class="btn-view-profile" onclick="viewProProfile('${pro.id}')">View Profile</button>
                            <button class="btn-book-now" onclick="handleBookNow('${pro.name}')">Book Now</button>
                        </div>
                    </div>
                </div>
            `;
            grid.innerHTML += cardHTML;
        });
    });
}

// INJECT DYNAMIC 3D CARDS ON HOMEPAGE & START ANIMATION
function renderCategoryStacks() {
    const categories = [
        { id: 'wedding-stack', name: 'Wedding' },
        { id: 'birthday-stack', name: 'Birthday' },
        { id: 'anni-stack', name: 'Anniversary' },
        { id: 'prewed-stack', name: 'Pre-Wedding' },
        { id: 'baby-stack', name: 'Baby Shoot' }
    ];

    categories.forEach(cat => {
        const stack = document.getElementById(cat.id);
        if (!stack) return;
        
        // Find pros who selected this specialty AND uploaded a "Best Shot" for it
        const prosInCat = allPhotographers.filter(pro => 
            pro.specialties && pro.specialties.includes(cat.name) && 
            pro.best_shots && pro.best_shots[cat.name]
        );
        
        if (prosInCat.length > 0) {
            stack.innerHTML = ''; // Erase the dummy HTML images
            
            // Inject up to 3 dynamic cards
            prosInCat.slice(0, 3).forEach((pro, index) => {
                stack.innerHTML += `
                    <div class="pro-card stack-card" data-pos="${index}" onclick="viewProProfile('${pro.id}')" style="cursor: pointer;">
                        <img src="${pro.best_shots[cat.name]}" class="best-shot" alt="${cat.name} Shot">
                        <div class="dp-wrapper"><img src="${pro.dp_url}" class="pro-dp" alt="DP"></div>
                        <div class="dp-overlay-text"><p>🏆 ${pro.name.split(' ')[0]}</p></div>
                    </div>
                `;
            });

            // START 3D ANIMATION ONLY IF THERE ARE 2 OR MORE CARDS
            if (prosInCat.length > 1) {
                let isHovering = false;
                stack.addEventListener('mouseenter', () => isHovering = true);
                stack.addEventListener('mouseleave', () => isHovering = false);

                // Ensure we don't accidentally start multiple intervals
                if (stack.dataset.intervalId) clearInterval(stack.dataset.intervalId);

                stack.dataset.intervalId = setInterval(() => {
                    if (isHovering) return;
                    
                    // We must query the cards INSIDE the interval so it reads the live dynamic ones
                    const activeCards = Array.from(stack.querySelectorAll('.stack-card'));
                    
                    activeCards.forEach(card => {
                        let currentPos = parseInt(card.getAttribute('data-pos'));
                        let newPos = currentPos - 1;
                        if (newPos < 0) { newPos = activeCards.length - 1; }
                        card.setAttribute('data-pos', newPos);
                    });
                }, 3000); // Rotates every 3 seconds
            }
        }
    });
}

// Update the Detailed Profile view when "View Profile" is clicked
function viewProProfile(proId) {
    const pro = allPhotographers.find(p => p.id == proId);
    if (!pro) return;

    currentViewedPro = pro.name;
    
    // Inject Dynamic Data into Detailed Profile Modal
    document.getElementById('detail-pro-name').innerText = pro.name;
    document.querySelector('#modal-pro-details .pro-details-dp').src = pro.dp_url;
    document.querySelector('#modal-pro-details .pro-banner-img').src = pro.banner_url || pro.dp_url;
    document.querySelector('#modal-pro-details p:nth-of-type(1)').innerText = pro.specialties.join(' • ');
    document.querySelector('#modal-pro-details p:nth-of-type(2)').innerText = pro.bio || "This professional is currently updating their bio.";

    // Inject Dynamic Gallery
    const galleryGrid = document.querySelector('.pro-gallery-grid');
    galleryGrid.innerHTML = '';
    
    // Add Best Shots first, then standard gallery
    const allGalleryImgs = [...Object.values(pro.best_shots), ...pro.gallery];
    
    if (allGalleryImgs.length > 0) {
        allGalleryImgs.forEach(imgUrl => {
            galleryGrid.innerHTML += `<img src="${imgUrl}" alt="Gallery Image">`;
        });
    } else {
        galleryGrid.innerHTML = '<p style="opacity:0.6;">No portfolio images uploaded yet.</p>';
    }

    // Close all other modals and open details
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    openModal('modal-pro-details');
}

// Trigger the fetch exactly when the page loads
document.addEventListener("DOMContentLoaded", () => {
    fetchAndRenderPhotographers();
});

// ==========================================
// 11. SMART CONTACT LINKS
// ==========================================
function handlePhoneClick(event, phoneNumber) {
    event.preventDefault(); // Prevents the page from jumping to the top
    
    // Detect if the user is on a mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Opens the native phone dialer on mobile
        window.location.href = 'tel:' + phoneNumber;
    } else {
        // Copies to clipboard on desktop
        navigator.clipboard.writeText(phoneNumber).then(() => {
            alert("Phone number copied to clipboard: " + phoneNumber);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
}
