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
    bestShots: [],
    gallery: []
};

function openCloudinaryWidget(imageType, allowMultiple) {
    let maxFiles = allowMultiple ? (imageType === 'best' ? 3 : 20) : 1;

    cloudinary.openUploadWidget({
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'camera', 'instagram'],
        multiple: allowMultiple,
        maxFiles: maxFiles,
        folder: `momento_pro/${imageType}`, // Organizes files neatly in your Cloudinary dashboard
        clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        maxFileSize: 5000000 // 5MB limit
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const secureUrl = result.info.secure_url;
            
            // Handle DP Preview
            if (imageType === 'dp') {
                uploadedImages.dp = secureUrl;
                const img = document.getElementById('preview-dp');
                img.src = secureUrl;
                img.style.display = 'block';
            } 
            // Handle Banner Preview
            else if (imageType === 'banner') {
                uploadedImages.banner = secureUrl;
                const img = document.getElementById('preview-banner');
                img.src = secureUrl;
                img.style.display = 'block';
            } 
            // Handle Best Shots Preview
            else if (imageType === 'best') {
                if(uploadedImages.bestShots.length < 3) {
                    uploadedImages.bestShots.push(secureUrl);
                    const container = document.getElementById('preview-best');
                    container.innerHTML += `<img src="${secureUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">`;
                }
            }
            // Handle Gallery Uploads
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

