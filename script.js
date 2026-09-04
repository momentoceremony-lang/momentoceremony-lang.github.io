// ==========================================
// 1. HERO SECTION TYPING & DYNAMIC BACKGROUND
// ==========================================
const textElement = document.getElementById("typing-text");
const bgImageElement = document.getElementById("hero-dynamic-bg");

// The services matched with their exact image file names
const serviceData = [
    { text: "Weddings", image: "Stock/hero_banner_Weddings.jpeg" },
    { text: "Pre-Weddings", image: "Stock/hero_banner_PreWeddings.jpeg" },
    { text: "Birthdays", image: "Stock/hero_banner_Birthdays.jpeg" },
    { text: "Baby Shoots", image: "Stock/hero_banner_BabyShoots.jpeg" },
    { text: "Anniversaries", image: "Stock/hero_banner_Anniversaries.jpeg" }
];

let serviceIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!textElement) return;
    const currentData = serviceData[serviceIndex];
    
    if (isDeleting) {
        textElement.textContent = currentData.text.substring(0, charIndex - 1);
        charIndex--;
    } else {
        textElement.textContent = currentData.text.substring(0, charIndex + 1);
        charIndex++;
    }

let typeSpeed = isDeleting ? 50 : 100;

    // Word finished typing - Pause longer for reading
    if (!isDeleting && charIndex === currentData.text.length) {
        typeSpeed = 3500; // Increased to 3.5 seconds 
        isDeleting = true;
    } 
    // Word finished deleting - Swap image smoothly
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        serviceIndex = (serviceIndex + 1) % serviceData.length;
        typeSpeed = 800; // Pause briefly before typing the next word
        
        // Cinematic Image Fade
        if (bgImageElement) {
            bgImageElement.style.opacity = 0; // Trigger CSS fade out
            
            setTimeout(() => {
                bgImageElement.src = serviceData[serviceIndex].image; // Swap image while dark
                bgImageElement.style.opacity = 1; // Trigger CSS fade back in
            }, 600); // Wait 600ms for the fade out to finish before swapping
        }
    }

    setTimeout(typeEffect, typeSpeed);
}

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
function toggleMobileNav() {
    const dropdown = document.getElementById('mobileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('open');
        
        // Prevent background scrolling when menu is open
        if (dropdown.classList.contains('open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}

// ==========================================
// 2. MASTER ENGINE FOR CATEGORY SECTIONS (IMAGES ONLY)
// ==========================================
function initCategorySlideshow(slideshowId) {
    const images = document.querySelectorAll(`#${slideshowId} .banner-img`);
    if(images.length > 1) {
        let currentIndex = 0;
        images[0].classList.add('active'); 

        setInterval(() => {
            const prevIndex = currentIndex;
            currentIndex = (currentIndex + 1) % images.length;
            
            // Keep the previous image completely solid in the background
            images[prevIndex].classList.remove('active');
            images[prevIndex].classList.add('last-active');
            
            // Fade the new image in on top
            images[currentIndex].classList.add('active');
            
            // After the fade finishes, silently reset the old image
            setTimeout(() => {
                images[prevIndex].classList.remove('last-active');
            }, 2000);
        }, 4000); 
    }
}


// ==========================================
// 4. INITIALIZE EVERYTHING ON PAGE LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Start Hero Typing
    setTimeout(typeEffect, 1000); 

    // Initialize Category Image Slideshows
    initCategorySlideshow("wedding-slideshow");
    initCategorySlideshow("birthday-slideshow");
    initCategorySlideshow("anni-slideshow");
    initCategorySlideshow("prewed-slideshow");
    initCategorySlideshow("baby-slideshow");

    // Initialize Custom Premium Date Pickers
    flatpickr("#book-start", { minDate: "today", dateFormat: "Y-m-d", altInput: true, altFormat: "F j, Y", disableMobile: true });
    flatpickr("#book-end", { minDate: "today", dateFormat: "Y-m-d", altInput: true, altFormat: "F j, Y", disableMobile: true });
    
    checkLoginState();
});

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
    const termsChecked = document.getElementById('pro-terms-checkbox').checked;

    if (!email) return alert("Please enter your email address.");
    
    // NEW: Stop the process if they haven't agreed to the terms
    if (!termsChecked) {
        return alert("You must read and agree to the Partner Terms & Conditions to register.");
    }

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
    
    // SAFETY CHECK: If the old modal was deleted, stop running this specific function
    if (!grid) return; 

    grid.innerHTML = ''; // Clear the dummy data

    allPhotographers.forEach(pro => {
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
                        <button class="btn-view-profile" onclick="window.location.href='profile.html?id=${pro.id}'">View Profile</button>
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


// ==========================================
// SCROLL ZOOM & SLIDE-IN EFFECT (STRONG & OPTIMIZED)
// ==========================================
let isZoomTicking = false;

window.addEventListener('scroll', () => {
    if (!isZoomTicking) {
        window.requestAnimationFrame(() => {
            
            // 1. TRIGGER THE SLIDE-IN FOR LEFT BANNERS
            const leftBanners = document.querySelectorAll('.wedding-upper-left');
            leftBanners.forEach(banner => {
                const rect = banner.getBoundingClientRect();
                // When banner enters the viewport, add the slide-in class
                if (rect.top < window.innerHeight - 100) {
                    banner.classList.add('slide-in-active');
                }
            });

            // 2. STRONGER SCROLL ZOOM FOR BANNER IMAGES
            const masks = document.querySelectorAll('.arch-photo-mask');
            masks.forEach(mask => {
                const rect = mask.getBoundingClientRect();
                
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    // Increased multiplier to 0.0004 for a highly visible zoom effect
                    let scale = 0.90 + ((window.innerHeight - rect.top) * 0.0004);
                    
                    // Cap the zoom so it doesn't get too small or too large
                    scale = Math.min(Math.max(scale, 0.95), 1.15); 
                    
                    // Apply the scale directly to the mask
                    mask.style.transform = `scale(${scale})`;
                }
            });
            
            isZoomTicking = false;
        });
        isZoomTicking = true;
    }
});

// ==========================================
// ABOUT PAGE: BACK TO TOP NAVIGATION
// ==========================================
const backToTopButton = document.getElementById("backToTopBtn");

if (backToTopButton) {
    // Show button when scrolled down 300px
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add("visible");
        } else {
            backToTopButton.classList.remove("visible");
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// WEST BENGAL MAP TIME-DRIVEN ENGINE
// ==========================================
const mapWrapper = document.getElementById('map-network-section');
const mapContainer = document.getElementById('map-container');
const mapNodes = document.querySelectorAll('.map-node');

if (mapWrapper && mapContainer) {
    let hasMapAnimated = false;
    
    // Watch for the section to appear on screen
    const mapObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !hasMapAnimated) {
            hasMapAnimated = true;
            startMapAnimation();
        }
    }, { threshold: 0.3 }); // Starts when 30% of the section is visible
    
    mapObserver.observe(mapWrapper);

    function startMapAnimation() {
        let startTimestamp = null;
        const duration = 2500; // 2.5 seconds total animation time

        function step(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            
            // Calculate progress from 0 to 1
            let progress = Math.min(elapsed / duration, 1);
            
            // Apply a smooth easing effect so it slows down elegantly at the end
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const isMobile = window.innerWidth <= 850;
            const startScale = isMobile ? 0.35 : 0.7; 
            const zoomAmount = isMobile ? 0.35 : 0.3; 
            
            const scale = startScale + (easeProgress * zoomAmount); 
            const translateY = easeProgress * -3;  
            
            mapContainer.style.transform = `scale(${scale}) translateY(${translateY}%)`;

            // Pop in images sequentially based on time progress
            mapNodes.forEach((node, index) => {
                const revealThreshold = 0.15 + (index * 0.12); 
                if (easeProgress > revealThreshold) {
                    node.classList.add('visible');
                }
            });

            // Keep looping until the 2.5 seconds are up
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        }
        
        window.requestAnimationFrame(step);
    }
}

// ==========================================
// SCROLL REVEAL ANIMATIONS FOR CATEGORIES
// ==========================================
const revealSections = document.querySelectorAll('.scroll-reveal');

if (revealSections.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // When the section comes into view
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once it has animated in so it doesn't repeat
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.05 // CHANGED: Now triggers when just 5% of the footer is visible
    });

    revealSections.forEach(section => {
        revealObserver.observe(section);
    });
}

// ==========================================
// VIEW.HTML GALLERY ENGINE
// ==========================================

// Add all your stock images for each category here
const galleryData = {
    wedding: [ 'Stock/wedding-banner-1.jpeg', 'Stock/wedding-banner-2.jpeg', 'Stock/pro-shot-1.jpeg', 'Stock/pro-shot-2.jpeg', 'Stock/pro-shot-3.jpeg' ],
    prewed: [ 'Stock/prewed-banner-1.jpeg', 'Stock/prewed-banner-2.jpeg', 'Stock/prewed-shot-1.jpeg', 'Stock/prewed-shot-2.jpeg' ],
    birthday: [ 'Stock/bday-banner-1.jpeg', 'Stock/bday-banner-2.jpeg', 'Stock/bday-shot-1.jpeg', 'Stock/bday-shot-2.jpeg' ],
    baby: [ 'Stock/baby-banner-1.jpeg', 'Stock/baby-banner-2.jpeg', 'Stock/baby-shot-1.jpeg' ],
    anni: [ 'Stock/anni-banner-1.jpeg', 'Stock/anni-banner-2.jpeg', 'Stock/anni-shot-1.jpeg', 'Stock/anni-shot-2.jpeg' ]
};

let activeCategory = 'wedding';
let activeImageIndex = 0;

// Runs when view.html loads to check the URL (e.g. view.html?category=prewed)
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('main-gallery-img')) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        
        // Load the category from the URL, or default to wedding
        if (categoryFromUrl && galleryData[categoryFromUrl]) {
            filterGallery(categoryFromUrl);
        } else {
            filterGallery('wedding');
        }
    }
});

function filterGallery(category) {
    activeCategory = category;
    activeImageIndex = 0; // Reset to the first image of the new category

    // Update active state on the buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(category)) {
            btn.classList.add('active');
        }
    });

    renderGalleryImages();
}

function renderGalleryImages() {
    const images = galleryData[activeCategory];
    if (!images || images.length === 0) return;

    const mainImg = document.getElementById('main-gallery-img');
    const thumbContainer = document.getElementById('thumbnail-container');

    // Fade effect for the main image
    mainImg.style.opacity = 0;
    setTimeout(() => {
        mainImg.src = images[activeImageIndex];
        mainImg.style.opacity = 1;
    }, 200); // Waits for the image to fade out before swapping

    // Draw the small thumbnails
    thumbContainer.innerHTML = '';
    images.forEach((src, index) => {
        const thumb = document.createElement('img');
        thumb.src = src;
        if (index === activeImageIndex) {
            thumb.classList.add('active-thumb');
        }
        
        // When a thumbnail is clicked, change the main image
        thumb.onclick = () => {
            activeImageIndex = index;
            renderGalleryImages();
        };
        
        thumbContainer.appendChild(thumb);
    });
}

function prevImage() {
    const images = galleryData[activeCategory];
    activeImageIndex = (activeImageIndex - 1 + images.length) % images.length;
    renderGalleryImages();
}

function nextImage() {
    const images = galleryData[activeCategory];
    activeImageIndex = (activeImageIndex + 1) % images.length;
    renderGalleryImages();
}

// ==========================================
// GALLERY NAVIGATION: KEYBOARD & SWIPE
// ==========================================

// Desktop: Keyboard Left/Right Arrows
document.addEventListener('keydown', (e) => {
    // Only fire if the user is currently on the gallery page
    if (!document.getElementById('main-gallery-img')) return; 
    
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
});

// Mobile: Touch Swipe Detection
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener("DOMContentLoaded", () => {
    const imageWrapper = document.querySelector('.main-image-wrapper');
    
    if (imageWrapper) {
        imageWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});

        imageWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, {passive: true});
    }
});

function handleSwipe() {
    const swipeThreshold = 50; // Minimum pixel distance to register as a swipe
    
    if (touchEndX < touchStartX - swipeThreshold) {
        // Swiped Left -> Move to Next Image
        nextImage();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
        // Swiped Right -> Move to Previous Image
        prevImage();
    }
}

// ==========================================
// PREMIUM PHOTOGRAPHERS PAGE ENGINE (UPDATED)
// ==========================================

// Hook into the existing fetch cycle
document.addEventListener("DOMContentLoaded", () => {
    const premiumGrid = document.getElementById('premium-photographers-grid');
    if (premiumGrid) {
        const originalRender = renderMasterPhotographerList;
        renderMasterPhotographerList = function() {
            if (typeof originalRender === 'function') originalRender(); 
            renderPremiumPhotographersPage(allPhotographers); // Pass the full array initially
        };
    }
});

function renderPremiumPhotographersPage(photographersToRender) {
    const grid = document.getElementById('premium-photographers-grid');
    if (!grid) return;

    grid.innerHTML = ''; 
    
    if (!photographersToRender || photographersToRender.length === 0) {
        grid.innerHTML = '<p style="text-align: center; width: 100%; grid-column: 1 / -1; opacity: 0.6; font-size: 1.1rem; padding: 40px 0;">No professionals found matching your search.</p>';
        return;
    }

    photographersToRender.forEach((pro) => {
        const displayImg = pro.banner_url || pro.dp_url; 
        const specsText = pro.specialties.join(' • ');
        const bioText = pro.bio || "This professional is currently updating their bio. View their portfolio to see their distinct photography style.";

        const cardHTML = `
            <div class="premium-pro-card">
                <!-- FIXED: Clicking the banner now routes to the new page -->
                <div class="pro-card-header" style="cursor: pointer;" onclick="window.location.href='profile.html?id=${pro.id}'">
                    <img src="${displayImg}" class="pro-card-banner" alt="Banner">
                    <div class="pro-card-dp-wrapper">
                        <img src="${pro.dp_url}" alt="DP">
                    </div>
                </div>
                
                <div class="pro-card-body">
                    <h3 class="pro-card-name">${pro.name}</h3>
                    <p class="pro-card-specs">${specsText}</p>
                    <p class="pro-card-bio">${bioText}</p>
                    
                    <div class="pro-card-actions">
                        <!-- FIXED: Clicking the button now routes to the new page -->
                        <button class="btn-view-profile" onclick="window.location.href='profile.html?id=${pro.id}'">View Profile</button>
                        <button class="btn-book-now" onclick="handleBookNow('${pro.name}')">Book Now</button>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += cardHTML;
    });

    // SET UP SCROLL ANIMATION OBSERVER
    const cards = grid.querySelectorAll('.premium-pro-card');
    
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 }); 

    cards.forEach(card => cardObserver.observe(card));
}

// Active Search Filter Function
function filterPhotographers() {
    const searchInput = document.getElementById('pro-search-bar');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    
    const filteredPros = allPhotographers.filter(pro => {
        // Search by Name
        const matchesName = pro.name.toLowerCase().includes(query);
        // Search by Specialty (e.g., "Wedding", "Birthday")
        const matchesSpecialty = pro.specialties.some(spec => spec.toLowerCase().includes(query));
        
        return matchesName || matchesSpecialty;
    });

    renderPremiumPhotographersPage(filteredPros);
}

// ==========================================
// DEDICATED PROFILE PAGE LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Check if we are on profile.html
    if (document.getElementById('page-name')) {
        const urlParams = new URLSearchParams(window.location.search);
        const proId = urlParams.get('id');
        if (proId) loadDedicatedProfile(proId);
    }
});

async function loadDedicatedProfile(proId) {
    try {
        const res = await fetch(`https://momento-backend-production-8b55.up.railway.app/api/pro/profile/${proId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
            const pro = data.data;
            
            // Populate Data
            document.getElementById('page-name').innerText = pro.name;
            document.getElementById('page-specs').innerText = (pro.specialties || []).join(' • ');
            document.getElementById('page-bio').innerText = pro.bio || "This professional is currently updating their bio. View their portfolio to see their distinct photography style.";
            document.getElementById('page-dp').src = pro.dp_url;
            document.getElementById('page-banner').src = pro.banner_url || pro.dp_url;
            
            // Setup Book Button
            document.getElementById('page-book-btn').onclick = () => handleBookNow(pro.name);
            
            // Populate Gallery
            const galleryGrid = document.getElementById('page-gallery');
            galleryGrid.innerHTML = '';
            const allGalleryImgs = [...Object.values(pro.best_shots || {}), ...(pro.gallery || [])];
            
            if (allGalleryImgs.length > 0) {
                allGalleryImgs.forEach(imgUrl => {
                    // Added the new portfolio-img-anim class here
                    galleryGrid.innerHTML += `<img src="${imgUrl}" alt="Gallery Image" class="portfolio-img-anim">`;
                });

                // SET UP SCROLL ANIMATION OBSERVER FOR PORTFOLIO IMAGES
                const galleryImages = galleryGrid.querySelectorAll('.portfolio-img-anim');
                
                const imgObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('scroll-visible');
                            observer.unobserve(entry.target); 
                        }
                    });
                }, { threshold: 0.1 }); 

                galleryImages.forEach(img => imgObserver.observe(img));

            } else {
                galleryGrid.innerHTML = '<p style="opacity:0.6;">No portfolio images uploaded yet.</p>';
            }
        }
    } catch (error) {
        console.error("Failed to load profile:", error);
        document.getElementById('page-name').innerText = "Profile Not Found";
    }
}

// Native Mobile Web Share API + Desktop Clipboard Fallback
function shareProfile() {
    const profileUrl = window.location.href;
    const proName = document.getElementById('page-name').innerText;
    
    if (navigator.share) {
        navigator.share({
            title: `${proName} | Momento Photography`,
            text: `Check out ${proName}'s photography portfolio on Momento!`,
            url: profileUrl
        }).catch((error) => console.log('Error sharing', error));
    } else {
        // Fallback for desktop browsers
        navigator.clipboard.writeText(profileUrl).then(() => {
            alert("Profile link copied to clipboard!");
        });
    }
}
