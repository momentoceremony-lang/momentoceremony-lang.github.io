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
    { text: "Anniversaries", image: "Stock/hero_banner_Anniversaries.jpeg" },
    { text: "Mehndi", image: "Stock/hero_banner_Mehndi.jpeg" },
    { text: "Makeup", image: "Stock/hero_banner_makeup.jpeg" }
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
// MOBILE MENU TOGGLE (Premium Overlay & Dropdowns)
// ==========================================
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('mobile-overlay');
    
    if (menu) menu.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
    
    // Prevent background scrolling when menu is open
    if (menu && menu.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
        // Close all submenus when the main menu closes
        document.querySelectorAll('.mobile-submenu').forEach(sub => sub.classList.remove('open'));
    }
}

// Toggles nested menus inside the mobile sidebar
function toggleSubMenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    if (submenu) {
        submenu.classList.toggle('open');
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
    // 1. Check Login State IMMEDIATELY before anything else can cause an error
    checkLoginState();

    // 2. Start Hero Typing
    setTimeout(typeEffect, 1000); 

    // 3. Initialize Category Image Slideshows
    initCategorySlideshow("wedding-slideshow");
    initCategorySlideshow("birthday-slideshow");
    initCategorySlideshow("anni-slideshow");
    initCategorySlideshow("prewed-slideshow");
    initCategorySlideshow("baby-slideshow");
    initCategorySlideshow("mehndi-slideshow");
    initCategorySlideshow("makeup-slideshow");

    // 4. Initialize Custom Premium Date Pickers SAFELY (Only if the library is loaded)
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#book-start", { minDate: "today", dateFormat: "Y-m-d", altInput: true, altFormat: "F j, Y", disableMobile: true });
        flatpickr("#book-end", { minDate: "today", dateFormat: "Y-m-d", altInput: true, altFormat: "F j, Y", disableMobile: true });
    }
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
const API_BASE_URL = "https://api.momentoo.in/api/auth";

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
            localStorage.setItem('momentoToken', data.token);
            localStorage.setItem('momentoUser', JSON.stringify(data.user));
            localStorage.removeItem('isPro'); // FIXED: Ensures new customer wipes any lingering pro state
            closeModal('modal-auth');
            checkLoginState();
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
            localStorage.removeItem('isPro'); // FIXED: Ensures customer login wipes any lingering pro state
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
    
    // Target the mobile buttons
    const mobileLoginBtn = document.getElementById('mobile-login-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Clean up any existing mobile profile card to prevent duplicates on resize/reload
    const existingCard = document.getElementById('mobile-profile-card-view');
    if (existingCard) existingCard.remove();
    
    if (userString && authContainer) {
        const user = JSON.parse(userString);
        
        // Extract initials dynamically
        const nameParts = user.name.trim().split(' ');
        const initials = nameParts.length > 1 
            ? (nameParts[0][0] + nameParts[1][0]).toUpperCase() 
            : nameParts[0].substring(0, 2).toUpperCase();
        
        // 1. DESKTOP: Inject the Avatar Dropdown (Using Premium SVG Icon)
        const userIconSVG = `<svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
        
        authContainer.innerHTML = `
            <div class="nav-dropdown">
                <div class="user-avatar-badge">${userIconSVG}</div>
                <div class="nav-dropdown-content" style="right: 0; left: auto; transform: none; min-width: 160px; margin-top: 10px;">
                    ${isPro === 'true' ? `<a href="pro-dashboard.html">Dashboard</a>` : `<a href="#" onclick="openDashboard(); return false;">My Bookings</a>`}
                    <a href="#" onclick="logoutUser(); return false;" style="color: #e74c3c !important;">Logout</a>
                </div>
            </div>
        `;
        
        // 2. MOBILE: Inject the Profile Header Card at the top of the menu
        if (mobileMenu) {
            const roleText = isPro === 'true' ? 'Professional Partner' : 'Customer';
            const mobileProfileHTML = `
                <div id="mobile-profile-card-view" class="mobile-profile-card">
                    <div class="user-avatar-badge">${initials}</div>
                    <div class="mobile-profile-details">
                        <span class="mobile-profile-name">${user.name}</span>
                        <span class="mobile-profile-role">${roleText}</span>
                    </div>
                </div>
            `;
            // Insert it right after the 'X' close button
            const closeBtn = mobileMenu.querySelector('.close-menu');
            if (closeBtn) {
                closeBtn.insertAdjacentHTML('afterend', mobileProfileHTML);
            }
        }
        
        // Hide Login text link, Show Logout text link on Mobile bottom
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'flex';
        
    } else {
        // Restore standard Login button on Desktop if logged out
        if (authContainer) {
            const isLightNav = document.querySelector('.light-nav') !== null;
            const btnClass = isLightNav ? 'btn-login-light' : 'btn-login-dark';
            authContainer.innerHTML = `<button class="${btnClass} btn-login" onclick="openModal('modal-auth'); switchAuth('login');">Login</button>`;
        }
        
        // Show Login text link, Hide Logout text link on Mobile bottom
        if (mobileLoginBtn) mobileLoginBtn.style.display = 'flex';
        if (mobileLogoutBtn) mobileLogoutBtn.style.display = 'none';
    }
}

function logoutUser() {
    localStorage.removeItem('momentoToken');
    localStorage.removeItem('momentoUser');
    localStorage.removeItem('isPro'); // FIXED: Safely wipes the pro state
    window.location.reload(); 
}

function openDashboard() {
    alert("Dashboard coming soon! Here you will see your active bookings.");
}

// ==========================================
// MASTER BOOKING ENGINE & PREMIUM DROPDOWNS
// ==========================================
let currentSelectedPhotographer = null;
let bookingMap = null;
let mapMarker = null;
let currentLat = 22.5726; // Default to Kolkata
let currentLng = 88.3639;

function togglePremiumDropdown(id) {
    const target = document.getElementById(id);
    if (!target) return;
    
    document.querySelectorAll('.custom-select-options').forEach(opt => {
        if (opt.id !== id) opt.classList.remove('show');
    });
    
    target.classList.toggle('show');
}

// 1. Cascading Step 1: Select Artist Type
function selectPremiumType(event, val, element) {
    if (event) event.stopPropagation();
    
    document.getElementById('book-type-display').innerText = val;
    document.getElementById('book-type-display').style.color = "var(--primary-color)";
    document.getElementById('book-type-display').style.opacity = "1";
    document.getElementById('book-type-select').value = val;
    
    document.querySelectorAll('#type-options .custom-select-option').forEach(el => el.classList.remove('selected-option'));
    element.classList.add('selected-option');
    document.getElementById('type-options').classList.remove('show');

    // Reset downstream selections
    document.getElementById('book-category-display').innerText = "Select Event Category";
    document.getElementById('book-category-select').value = "";
    document.getElementById('book-artist-display').innerText = "Select an Artist";
    document.getElementById('book-artist-select').value = "";
    document.getElementById('artist-options').innerHTML = '';

    // Populate Categories based on Type
    populateEventCategories(val);
}

// 2. Cascading Step 2: Populate Categories
function populateEventCategories(artistType) {
    const catOptions = document.getElementById('category-options');
    catOptions.innerHTML = '';
    
    let categories = [];
    if (artistType === 'Photographer') {
        categories = ['Wedding', 'Pre-Wedding', 'Birthday', 'Anniversary', 'Baby Shoot', 'Other Event'];
    } else if (artistType === 'Makeup Artist') {
        categories = ['Bridal', 'Engagement', 'Haldi / Mehndi', 'Sangeet', 'Reception', 'Party', 'Photoshoot', 'Something Else'];
    } else if (artistType === 'Mehndi Artist') {
        categories = ['Mehndi Design', 'Other Event'];
    }

    categories.forEach(cat => {
        catOptions.innerHTML += `<div class="custom-select-option" onclick="selectPremiumCategory(event, '${cat}', this)">${cat}</div>`;
    });
}

// 3. Cascading Step 3: Select Category & Populate Artists
function selectPremiumCategory(event, val, element) {
    if (event) event.stopPropagation();

    document.getElementById('book-category-display').innerText = val;
    document.getElementById('book-category-display').style.color = "var(--primary-color)";
    document.getElementById('book-category-display').style.opacity = "1";
    document.getElementById('book-category-select').value = val;
    
    document.querySelectorAll('#category-options .custom-select-option').forEach(el => el.classList.remove('selected-option'));
    element.classList.add('selected-option');
    document.getElementById('category-options').classList.remove('show');

    // Filter artists if not locked
    if (!currentSelectedPhotographer) {
        populateArtistDropdown(document.getElementById('book-type-select').value, val);
    }
}

// 4. Cascading Step 4: Populate Artists
function populateArtistDropdown(proType, filterCategory) {
    const artistOptions = document.getElementById('artist-options');
    artistOptions.innerHTML = '';
    
    document.getElementById('book-artist-display').innerText = "Select an Artist";
    document.getElementById('book-artist-select').value = "";

    // Default to Photographer if null in DB
    let prosToShow = allPhotographers.filter(pro => (pro.proType || 'Photographer') === proType);

    if (filterCategory && filterCategory !== 'Other Event' && filterCategory !== 'Something Else') {
        prosToShow = prosToShow.filter(pro => pro.specialties && pro.specialties.includes(filterCategory));
    }

    if (prosToShow.length === 0) {
        artistOptions.innerHTML = `<div class="custom-select-option" style="opacity: 0.5;">No artists available</div>`;
    } else {
        prosToShow.forEach(pro => {
            artistOptions.innerHTML += `<div class="custom-select-option" onclick="selectPremiumArtist(event, '${pro.name}', this)">${pro.name}</div>`;
        });
    }
}

function selectPremiumArtist(event, val, element) {
    if (event) event.stopPropagation();

    document.getElementById('book-artist-display').innerText = val;
    document.getElementById('book-artist-display').style.color = "var(--primary-color)";
    document.getElementById('book-artist-display').style.opacity = "1";
    document.getElementById('book-artist-select').value = val;
    
    document.querySelectorAll('#artist-options .custom-select-option').forEach(el => el.classList.remove('selected-option'));
    element.classList.add('selected-option');
    document.getElementById('artist-options').classList.remove('show');
}

function handleBookNow(photographerName = null) {
    const userString = localStorage.getItem('momentoUser');
    if (!userString) {
        alert("Please Sign In or Create an Account to book an artist.");
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
        document.body.style.overflow = 'hidden';
        openModal('modal-auth');
        switchAuth('login');
        return;
    }

    currentSelectedPhotographer = photographerName;
    const title = document.getElementById('booking-modal-title');
    const artistContainer = document.getElementById('booking-artist-container');
    
    // Reset Form Defaults
    document.getElementById('book-start').value = "";
    document.getElementById('book-end').value = "";
    document.getElementById('book-type-display').innerText = "What kind of artist do you need?";
    document.getElementById('book-type-select').value = "";
    document.getElementById('book-category-display').innerText = "Select Event Category";
    document.getElementById('book-category-select').value = "";
    document.getElementById('category-options').innerHTML = "";
    document.getElementById('book-artist-display').innerText = "Select an Artist";
    document.getElementById('book-artist-select').value = "";
    document.getElementById('artist-options').innerHTML = "";
    
    // Reset Location UI
    document.getElementById('book-lat').value = "";
    document.getElementById('book-lng').value = "";
    document.getElementById('book-landmark').value = "";
    document.getElementById('landmark-container').style.display = "none";
    document.getElementById('btn-choose-location').innerHTML = "📍 Choose your location";
    document.getElementById('btn-choose-location').style.backgroundColor = "transparent";
    document.getElementById('btn-choose-location').style.color = "var(--primary-color)";
    
    document.getElementById('book-details').value = "";

    // CONTEXT A: Triggered directly from a specific profile
    if (photographerName) {
        title.innerText = `Requesting: ${photographerName}`;
        const pro = allPhotographers.find(p => p.name === photographerName);
        
        if (pro) {
            // Lock Artist Type
            const lockType = pro.proType || 'Photographer';
            document.getElementById('book-type-display').innerText = lockType;
            document.getElementById('book-type-select').value = lockType;
            document.getElementById('type-options').innerHTML = `<div class="custom-select-option selected-option">${lockType}</div>`;
            
            // Populate Categories for this specific artist
            populateEventCategories(lockType);
            
            // Lock Artist Name
            document.getElementById('book-artist-display').innerText = photographerName;
            document.getElementById('book-artist-select').value = photographerName;
            artistContainer.style.pointerEvents = "none";
            artistContainer.style.opacity = "0.6"; 
        }
    } 
    // CONTEXT B: Triggered generically from the Navbar
    else {
        title.innerText = "Book an Artist";
        artistContainer.style.pointerEvents = "auto";
        artistContainer.style.opacity = "1";
        
        // Restore Type Options
        document.getElementById('type-options').innerHTML = `
            <div class="custom-select-option" onclick="selectPremiumType(event, 'Photographer', this)">Photographer</div>
            <div class="custom-select-option" onclick="selectPremiumType(event, 'Makeup Artist', this)">Makeup Artist</div>
            <div class="custom-select-option" onclick="selectPremiumType(event, 'Mehndi Artist', this)">Mehndi Artist</div>
        `;
    }

    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    openModal('modal-booking');
}

// ==========================================
// INTERACTIVE MAP LOGIC (LEAFLET + GEOLOCATION)
// ==========================================
function openLocationMap() {
    // Hide booking modal temporarily, open map modal
    document.getElementById('modal-booking').style.display = 'none';
    openModal('modal-location');

    // Initialize Map only once
    if (!bookingMap) {
        setTimeout(() => {
            // Initialize with default coordinates so the map appears immediately
            bookingMap = L.map('booking-map').setView([currentLat, currentLng], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(bookingMap);

            // Add Draggable Marker
            mapMarker = L.marker([currentLat, currentLng], { draggable: true }).addTo(bookingMap);
            
            // Update coordinates when marker is dragged
            mapMarker.on('dragend', function(e) {
                const position = mapMarker.getLatLng();
                currentLat = position.lat;
                currentLng = position.lng;
            });
            
            // Update marker position if map is clicked
            bookingMap.on('click', function(e) {
                mapMarker.setLatLng(e.latlng);
                currentLat = e.latlng.lat;
                currentLng = e.latlng.lng;
            });

            // Request User's Real-Time Location
            if (navigator.geolocation) {
                // Change the button text temporarily so the user knows it is searching
                const locBtn = document.querySelector('#modal-location .btn-book-now');
                const originalText = locBtn.innerText;
                locBtn.innerText = "Finding you...";

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // Success: Update variables with exact GPS location
                        currentLat = position.coords.latitude;
                        currentLng = position.coords.longitude;
                        
                        // Smoothly "fly" the map to their real location
                        if (bookingMap) {
                            bookingMap.flyTo([currentLat, currentLng], 15);
                            mapMarker.setLatLng([currentLat, currentLng]);
                        }
                        
                        locBtn.innerText = originalText;
                    },
                    (error) => {
                        // Denied or failed: Fail gracefully and stay on default map
                        console.warn("Geolocation access denied or failed.", error);
                        locBtn.innerText = originalText;
                    },
                    // FIXED: Removed the 5-second timeout so the user has unlimited time to click "Allow"
                    { enableHighAccuracy: true, maximumAge: 0 }
                );
            }

        }, 300);
    } else {
        // If map already exists, just fix the size on reopening
        setTimeout(() => { bookingMap.invalidateSize(); }, 300);
    }
}

function confirmLocation() {
    // Save to hidden inputs
    document.getElementById('book-lat').value = currentLat;
    document.getElementById('book-lng').value = currentLng;
    
    // Update Button UI to show success
    const locBtn = document.getElementById('btn-choose-location');
    locBtn.innerHTML = "✅ Location Selected";
    locBtn.style.backgroundColor = "var(--bg-color)";
    
    // Show Landmark input
    document.getElementById('landmark-container').style.display = "block";
    
    // Close Map, Reopen Booking Form
    closeModal('modal-location');
    document.getElementById('modal-booking').style.display = 'block';
}

// Close custom dropdowns if clicked outside
window.addEventListener('click', function(event) {
    if (!event.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-options').forEach(opt => opt.classList.remove('show'));
    }
});

// ==========================================
// SUBMIT BOOKING 
// ==========================================
async function submitBooking() {
    const startDate = document.getElementById('book-start').value;
    const endDate = document.getElementById('book-end').value;
    const artistType = document.getElementById('book-type-select').value; 
    const category = document.getElementById('book-category-select').value; 
    const artistSelect = document.getElementById('book-artist-select').value; 
    const latitude = document.getElementById('book-lat').value;
    const longitude = document.getElementById('book-lng').value;
    const landmark = document.getElementById('book-landmark').value.trim();
    const details = document.getElementById('book-details').value.trim();

    if (!startDate || !endDate || !artistType || !category || !artistSelect) {
        return alert("Please fill in the dates, select an artist type, category, and choose an artist.");
    }

    if (!latitude || !longitude) {
        return alert("Please click 'Choose your location' to pin your event venue on the map.");
    }

    if (new Date(startDate) > new Date(endDate)) {
        return alert("End Date cannot be before Start Date.");
    }

    const userString = localStorage.getItem('momentoUser');
    if (!userString) return alert("Session expired. Please log in again.");
    const user = JSON.parse(userString);

    const submitBtn = document.querySelector('#modal-booking .btn-book-now');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Sending Request...";
    submitBtn.disabled = true;

    try {
        const res = await fetch('https://api.momentoo.in/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: user.id,
                photographerName: artistSelect,
                artistType: artistType,
                category: category,
                startDate: startDate,
                endDate: endDate,
                latitude: latitude,
                longitude: longitude,
                landmark: landmark,
                details: details
            })
        });

        const data = await res.json();

        if (data.success) {
            closeModal('modal-booking');
            
            document.getElementById('success-ticket-id').innerText = data.ticketId;
            openModal('modal-booking-success');
            
            // Heavy Reset on the Form
            document.getElementById('book-start').value = "";
            document.getElementById('book-end').value = "";
            document.getElementById('book-type-select').value = "";
            document.getElementById('book-type-display').innerText = "What kind of artist do you need?";
            document.getElementById('book-category-select').value = "";
            document.getElementById('book-category-display').innerText = "Select Event Category";
            document.getElementById('book-artist-select').value = "";
            document.getElementById('book-artist-display').innerText = "Select an Artist";
            
            // Location Reset
            document.getElementById('book-lat').value = "";
            document.getElementById('book-lng').value = "";
            document.getElementById('book-landmark').value = "";
            document.getElementById('landmark-container').style.display = "none";
            const locBtn = document.getElementById('btn-choose-location');
            locBtn.innerHTML = "📍 Choose your location";
            locBtn.style.backgroundColor = "transparent";
            locBtn.style.color = "var(--primary-color)";
            
            document.getElementById('book-details').value = "";
        } else {
            alert(data.error);
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
    const proType = document.getElementById('pro-reg-type').value; // Get Profession
    const otp = document.getElementById('pro-reg-otp').value;

    if (!proType) return alert("Please select your profession from the dropdown.");
    if (!otp) return alert("Please enter the 4-digit OTP.");

    try {
        const res = await fetch(`${API_BASE_URL}/pro-register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email, password, proType, otp }) // Pass proType
        });
        const data = await res.json();

        if (data.success) {
            alert("Welcome to Momento! Redirecting to your dashboard...");
            // Ensure the backend includes proType in the returned user object
            localStorage.setItem('momentoToken', data.token);
            localStorage.setItem('momentoUser', JSON.stringify(data.user));
            localStorage.setItem('isPro', 'true');
            window.location.href = "pro-dashboard.html";
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
        const res = await fetch('https://api.momentoo.in/api/photographers');
        const data = await res.json();
        
        if (data.success && data.data.length > 0) {
            allPhotographers = data.data;
            
            // Check if URL specifies a type (Photographer or Mehndi Artist)
            const urlParams = new URLSearchParams(window.location.search);
            const proTypeFilter = urlParams.get('type');
            
            let filteredPros = allPhotographers;
            
            if (proTypeFilter === 'mehndi') {
                // Filter only Mehndi Artists
                filteredPros = allPhotographers.filter(pro => pro.proType === 'Mehndi Artist');
                
                // Dynamically change the text on the page!
                const mainTitle = document.getElementById('page-main-title');
                const subTitle = document.getElementById('page-sub-title');
                if (mainTitle) mainTitle.innerText = "The Artists Behind the Art";
                if (subTitle) subTitle.innerText = "Discover the passionate professionals who bring their creativity and unique style to every stroke.";
                
            } else if (proTypeFilter === 'photographer') {
                // Filter only Photographers
                filteredPros = allPhotographers.filter(pro => pro.proType === 'Photographer' || !pro.proType); 
            }

            renderMasterPhotographerList(filteredPros); // Pass the filtered array!
            renderCategoryStacks(); 
            renderCategoryModals(); 
        }
    } catch (error) {
        console.error("Failed to load professionals from DB:", error);
    }
}

// Update the master renderer to accept the filtered array
function renderMasterPhotographerList(prosToRender = allPhotographers) {
    const grid = document.querySelector('#modal-all-photographers .modal-card-grid');
    if (!grid) return; 

    grid.innerHTML = ''; 

    prosToRender.forEach(pro => {
        // ... (Keep the rest of the inner HTML card generation exactly the same) ...
        const mainDisplayImg = pro.banner_url || pro.dp_url; 
        const specsText = (pro.specialties || []).join(' • ');

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
// VIEW.HTML GALLERY ENGINE (PREMIUM CAROUSEL)
// ==========================================

// Add all your stock images for each category here
const galleryData = {
    wedding: [ 'Stock/wedding-banner-1.jpeg', 'Stock/wedding-banner-2.jpeg', 'Stock/pro-shot-1.jpeg', 'Stock/pro-shot-2.jpeg', 'Stock/pro-shot-3.jpeg' ],
    prewed: [ 'Stock/prewed-banner-1.jpeg', 'Stock/prewed-banner-2.jpeg', 'Stock/prewed-shot-1.jpeg', 'Stock/prewed-shot-2.jpeg' ],
    birthday: [ 'Stock/bday-banner-1.jpeg', 'Stock/bday-banner-2.jpeg', 'Stock/bday-shot-1.jpeg', 'Stock/bday-shot-2.jpeg' ],
    baby: [ 'Stock/baby-banner-1.jpeg', 'Stock/baby-banner-2.jpeg', 'Stock/baby-shot-1.jpeg' ],
    anni: [ 'Stock/anni-banner-1.jpeg', 'Stock/anni-banner-2.jpeg', 'Stock/anni-shot-1.jpeg', 'Stock/anni-shot-2.jpeg' ],
    mehndi: [ 'Stock/mehndi-banner-1.jpeg', 'Stock/mehndi-banner-2.jpeg' ],
    makeup: [ 'Stock/makeup-banner-1.jpeg', 'Stock/makeup-banner-2.jpeg' ]
};

// Dictionary mapping database tags to beautiful display names
const categoryDisplayNames = {
    'wedding': 'Weddings',
    'prewed': 'Pre-Weddings',
    'birthday': 'Birthdays',
    'baby': 'Baby Shoots',
    'anni': 'Anniversaries',
    'mehndi': 'Mehndi',
    'makeup': 'Makeup'
};

let activeCategory = 'wedding';
let activeImageIndex = 0;
let isCategoryLoaded = false; // NEW: Tracks if thumbnails are already built

// Runs when view.html loads to check the URL (e.g. view.html?category=prewed)
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById('main-gallery-img')) {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        
        // 1. Build the dropdown UI first so it exists in the DOM
        buildGalleryDropdown();

        // 2. Load the category from the URL, or default to wedding
        if (categoryFromUrl && galleryData[categoryFromUrl]) {
            selectGalleryCategory(null, categoryFromUrl);
        } else {
            selectGalleryCategory(null, 'wedding');
        }
    }
});

// Builds the HTML for the dropdown menu ONLY ONCE on page load
function buildGalleryDropdown() {
    const filterContainer = document.querySelector('.gallery-filters');
    
    if (filterContainer) {
        // Strip flex classes and force left alignment
        filterContainer.className = ''; 
        filterContainer.style.margin = '0 auto 20px auto';
        filterContainer.style.textAlign = 'left';
        filterContainer.style.position = 'relative';
        filterContainer.style.zIndex = '50';
        
        // Add dynamic padding so it lines up with the image viewer on both PC and Mobile
        filterContainer.style.padding = window.innerWidth <= 850 ? '0 20px' : '0 5vw';
        
        let optionsHTML = '';
        Object.keys(galleryData).forEach(catKey => {
            // Pass 'event' so we can stop the click from breaking the menu
            optionsHTML += `<div class="custom-select-option" onclick="selectGalleryCategory(event, '${catKey}')" style="text-align: left; font-weight: bold;">${categoryDisplayNames[catKey]}</div>`;
        });

        // Inject the identical left-aligned dropdown
        filterContainer.innerHTML = `
            <div class="custom-select-wrapper" style="width: fit-content; margin: 0;" onclick="this.querySelector('.custom-select-options').classList.toggle('show')">
                <div class="custom-select-display auth-input" style="border-radius: 25px; padding: 8px 22px 8px 18px; border: 1px solid var(--accent-color); color: var(--primary-color); font-weight: bold; background: transparent; cursor: pointer; gap: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 0;">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--accent-color)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <span id="active-gallery-category-text" style="font-size: 0.95rem; margin-right: 5px;">${categoryDisplayNames[activeCategory]}</span>
                </div>
                <div class="custom-select-options" id="gallery-dropdown-options" style="width: 220px; left: 0; top: calc(100% + 5px);">
                    ${optionsHTML}
                </div>
            </div>
        `;
    }
}

// Handles the logic when a user actually clicks a category in the list
function selectGalleryCategory(event, category) {
    if (event) {
        event.stopPropagation(); // Prevents the browser from destroying the menu mid-click
    }
    
    activeCategory = category;
    activeImageIndex = 0; 
    isCategoryLoaded = false; // Forces the thumbnail bar to rebuild for the new category
    
    // Smoothly update just the text inside the button
    const textSpan = document.getElementById('active-gallery-category-text');
    if (textSpan) {
        textSpan.innerText = categoryDisplayNames[category];
    }

    // Force the dropdown to close
    const optionsBox = document.getElementById('gallery-dropdown-options');
    if (optionsBox) {
        optionsBox.classList.remove('show');
    }

    // Fetch the new photos
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
    }, 200);

    // ONLY rebuild the HTML thumbnails if the category actually changed
    // This stops the scroll bar from violently resetting to zero on every swipe
    if (!isCategoryLoaded) {
        thumbContainer.innerHTML = '';
        images.forEach((src, index) => {
            const thumb = document.createElement('img');
            thumb.src = src;
            thumb.onclick = () => {
                activeImageIndex = index;
                renderGalleryImages();
            };
            thumbContainer.appendChild(thumb);
        });
        isCategoryLoaded = true;
    }

    // Update the active class and smoothly scroll the row!
    const allThumbs = thumbContainer.querySelectorAll('img');
    allThumbs.forEach((thumb, index) => {
        if (index === activeImageIndex) {
            thumb.classList.add('active-thumb');
            
            // The magic line: slides the container so the active thumb is always in the exact middle of the screen!
            thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            
        } else {
            thumb.classList.remove('active-thumb');
        }
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
        // Accept the filtered array from the fetch function
        renderMasterPhotographerList = function(prosToRender = allPhotographers) {
            if (typeof originalRender === 'function') originalRender(prosToRender); 
            // Pass that filtered array to the page builder
            renderPremiumPhotographersPage(prosToRender); 
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
    
    // Ensure we only search within the CURRENTLY loaded type
    const urlParams = new URLSearchParams(window.location.search);
    const proTypeFilter = urlParams.get('type');
    
    let basePros = allPhotographers;
    if (proTypeFilter === 'mehndi') {
        basePros = allPhotographers.filter(pro => pro.proType === 'Mehndi Artist');
    } else if (proTypeFilter === 'photographer') {
        basePros = allPhotographers.filter(pro => pro.proType === 'Photographer' || !pro.proType);
    }
    
    const filteredPros = basePros.filter(pro => {
        const matchesName = pro.name.toLowerCase().includes(query);
        const matchesSpecialty = pro.specialties && pro.specialties.some(spec => spec.toLowerCase().includes(query));
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

// Global variable to hold the currently viewed photographer's gallery
let currentProfileGallery = []; 

async function loadDedicatedProfile(proId) {
    try {
        const res = await fetch(`https://api.momentoo.in/api/pro/profile/${proId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
            const pro = data.data;
            
            // Populate Basic Data
            document.getElementById('page-name').innerText = pro.name;
            document.getElementById('page-specs').innerText = (pro.specialties || []).join(' • ');
            document.getElementById('page-bio').innerText = pro.bio || "This professional is currently updating their bio. View their portfolio to see their distinct photography style.";
            document.getElementById('page-dp').src = pro.dp_url;
            document.getElementById('page-banner').src = pro.banner_url || pro.dp_url;
            
            document.getElementById('page-book-btn').onclick = () => handleBookNow(pro.name);
            
            // Store the gallery globally so our filter function can use it
            currentProfileGallery = pro.gallery || [];
            
            // Migrate any old "Best Shots" into the new gallery format so old images aren't lost
            if (pro.best_shots) {
                Object.entries(pro.best_shots).forEach(([cat, url]) => {
                    currentProfileGallery.unshift({ url: url, category: cat });
                });
            }
            
            // Render the gallery initially showing 'All' categories
            renderProfileGallery('All');
        }
    } catch (error) {
        console.error("Failed to load profile:", error);
        document.getElementById('page-name').innerText = "Profile Not Found";
    }
}

// NEW: Dynamic Category Filtering Function (Left-Aligned Dropdown)
function renderProfileGallery(filterCategory) {
    const galleryGrid = document.getElementById('page-gallery');
    const filterContainer = document.getElementById('profile-gallery-filters');
    
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';

    if (filterContainer) {
        filterContainer.innerHTML = '';
        filterContainer.className = ''; 
        // Force left alignment and push the images down slightly
        filterContainer.style.margin = '0 0 25px 0';
        filterContainer.style.textAlign = 'left';
        filterContainer.style.position = 'relative';
        filterContainer.style.zIndex = '50';
    }

    if (!currentProfileGallery || currentProfileGallery.length === 0) {
        galleryGrid.innerHTML = '<p style="opacity:0.6;">No portfolio images uploaded yet.</p>';
        return;
    }

    // 1. Build Premium Left-Aligned Dropdown
    if (filterContainer) {
        const uniqueCategories = new Set();
        uniqueCategories.add('All');
        
        currentProfileGallery.forEach(item => {
            const cat = typeof item === 'string' ? 'Uncategorized' : (item.category || 'Uncategorized');
            uniqueCategories.add(cat);
        });

        // Only show the filter if there is more than just 1 category
        if (uniqueCategories.size > 1) {
            let optionsHTML = '';
            uniqueCategories.forEach(cat => {
                optionsHTML += `<div class="custom-select-option" onclick="renderProfileGallery('${cat}')" style="text-align: left; font-weight: bold;">${cat}</div>`;
            });

            filterContainer.innerHTML = `
                <div class="custom-select-wrapper" style="width: fit-content; margin: 0;" onclick="this.querySelector('.custom-select-options').classList.toggle('show')">
                    
                    <!-- The Main Button (Icon + Active Category) -->
                    <div class="custom-select-display auth-input" style="border-radius: 25px; padding: 8px 22px 8px 18px; border: 1px solid var(--accent-color); color: var(--primary-color); font-weight: bold; background: transparent; cursor: pointer; gap: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 0;">
                        <!-- Premium Funnel/Filter Icon -->
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--accent-color)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        <span style="font-size: 0.95rem; margin-right: 5px;">${filterCategory}</span>
                    </div>

                    <!-- The Hidden Dropdown Menu (Aligned Left) -->
                    <div class="custom-select-options" style="width: 220px; left: 0; top: calc(100% + 5px);">
                        ${optionsHTML}
                    </div>
                    
                </div>
            `;
        }
    }

    // 2. Filter and Render Images
    const filteredImages = currentProfileGallery.filter(item => {
        if (filterCategory === 'All') return true;
        const cat = typeof item === 'string' ? 'Uncategorized' : (item.category || 'Uncategorized');
        return cat === filterCategory;
    });

    if (filteredImages.length === 0) {
        galleryGrid.innerHTML = '<p style="opacity:0.6;">No images found for this category.</p>';
        return;
    }

    filteredImages.forEach(item => {
        const imgUrl = typeof item === 'string' ? item : item.url;
        // Added cursor: pointer and the onclick event passing the specific imgUrl
        galleryGrid.innerHTML += `<img src="${imgUrl}" alt="Gallery Image" class="portfolio-img-anim" style="cursor: pointer;" onclick="openFullscreen('${imgUrl}')">`;
    });

    // 3. Re-attach Scroll Observer
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

// ==========================================
// FULLSCREEN LIGHTBOX LOGIC
// ==========================================
function openFullscreen(imageSrc) {
    // Inject the specific image source into the fullscreen modal
    document.getElementById('fullscreen-img-display').src = imageSrc;
    
    // Show the modal and stop background scrolling
    document.getElementById('modal-fullscreen-image').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeFullscreen() {
    document.getElementById('modal-fullscreen-image').style.display = 'none';
    document.body.style.overflow = 'auto';
    // Clear the src so it doesn't flash the old image next time it opens
    setTimeout(() => {
        document.getElementById('fullscreen-img-display').src = "";
    }, 300);
}
