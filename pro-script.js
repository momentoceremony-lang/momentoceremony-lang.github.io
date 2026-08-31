// ==========================================
// PHOTOGRAPHER DASHBOARD LOGIC
// ==========================================

const API_BASE_URL = "https://momento-backend-production-8b55.up.railway.app/api/auth";

document.addEventListener("DOMContentLoaded", () => {
    checkProAuth();
});

// 1. GATEKEEPER: Ensure only Photographers can view this page
function checkProAuth() {
    const userString = localStorage.getItem('momentoUser');
    const isPro = localStorage.getItem('isPro');

    if (!userString || isPro !== 'true') {
        alert("Unauthorized access. Redirecting to home page.");
        window.location.href = "index.html"; // Kick them out
        return;
    }

    const user = JSON.parse(userString);
    
    // Populate UI with user data
    document.getElementById('dashboard-title').innerText = `Welcome, ${user.name.split(' ')[0]}`;
    
    const nameInput = document.getElementById('pro-name');
    const phoneInput = document.getElementById('pro-phone');
    if (nameInput) nameInput.value = user.name;
    if (phoneInput) phoneInput.value = user.phone;
}

// 2. TAB SWITCHING LOGIC
function switchTab(tabName) {
    // Close the mobile menu if it is open
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.classList.contains('show-menu')) {
        sidebar.classList.remove('show-menu');
    }
    
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`tab-${tabName}`).classList.add('active-tab');
    
    // Highlight sidebar link
    event.currentTarget.classList.add('active');
}

// 3. LOGOUT
function logoutPro() {
    localStorage.removeItem('momentoToken');
    localStorage.removeItem('momentoUser');
    localStorage.removeItem('isPro');
    window.location.href = "index.html";
}

// 4. SAVE PROFILE DETAILS (Placeholder for next step)
function saveProfileDetails() {
    alert("Profile details saved securely! (Backend connection coming next)");
}

// Toggle mobile dropdown menu
function toggleProNav() {
    document.querySelector('.sidebar').classList.toggle('show-menu');
}

// ==========================================
// 5. CLOUDINARY UPLOAD WIDGET
// ==========================================

const CLOUD_NAME = "uvj9mm54"; 
const UPLOAD_PRESET = "momento_preset"; 

// We will store the uploaded URLs here before sending them to Railway
let uploadedImages = {
    dp: "",
    banner: "",
    bestShots: {}, // Now an object to map specialty to URL
    gallery: []
};

function openCloudinaryWidget(imageType, allowMultiple, specialtyTag = "") {
    let maxFiles = allowMultiple ? 20 : 1;
    let aspectRatio = null;

    // Force specific aspect ratios for UI consistency
    if (imageType === 'dp') aspectRatio = 1; // 1:1 Square
    else if (imageType === 'banner') aspectRatio = 16/9; // Wide Banner
    else if (imageType === 'best') aspectRatio = 2/3; // Vertical Card for Home Page

    cloudinary.openUploadWidget({
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'camera', 'instagram'],
        multiple: allowMultiple,
        maxFiles: maxFiles,
        cropping: true, // ENABLES CROPPING
        croppingAspectRatio: aspectRatio,
        showSkipCropButton: false, // Forces them to crop
        folder: `momento_pro/${imageType}`, 
        clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        maxFileSize: 5000000 
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const secureUrl = result.info.secure_url;
            
            if (imageType === 'dp') {
                uploadedImages.dp = secureUrl;
                const img = document.getElementById('preview-dp');
                img.src = secureUrl;
                img.style.display = 'block';
            } 
            else if (imageType === 'banner') {
                uploadedImages.banner = secureUrl;
                const img = document.getElementById('preview-banner');
                img.src = secureUrl;
                img.style.display = 'block';
            } 
            else if (imageType === 'best') {
                // Save specific specialty shot
                const idSafe = specialtyTag.replace(/\s+/g, '');
                uploadedImages.bestShots[specialtyTag] = secureUrl;
                const img = document.getElementById(`preview-best-${idSafe}`);
                img.src = secureUrl;
                img.style.display = 'block';
            }
            else if (imageType === 'gallery') {
                uploadedImages.gallery.push(secureUrl);
                alert("Image added to gallery!");
            }
        }
    });
}

function savePortfolioUrls() {
    console.log("Current Uploaded Data:", uploadedImages);
    alert("Portfolio images uploaded successfully! Next, we will connect this save button to your PostgreSQL database.");
}

