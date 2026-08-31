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
                renderGalleryPreviews(); // Updates the UI instantly
            }
        }
    });
}

function renderGalleryPreviews() {
    const container = document.getElementById('gallery-preview-container');
    container.innerHTML = ''; // Clear current view
    
    if (uploadedImages.gallery.length === 0) {
        container.innerHTML = '<p style="opacity: 0.6; font-size: 0.9rem; padding: 10px;">No gallery images uploaded yet.</p>';
        return;
    }

    // Generate a thumbnail with a red 'X' delete button for every image
    uploadedImages.gallery.forEach((url, index) => {
        container.innerHTML += `
            <div style="position: relative; min-width: 120px; flex-shrink: 0;">
                <img src="${url}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <span onclick="removeGalleryImage(${index})" style="position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border-radius: 50%; width: 25px; height: 25px; text-align: center; line-height: 25px; cursor: pointer; font-size: 14px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">✕</span>
            </div>
        `;
    });
}

function removeGalleryImage(index) {
    uploadedImages.gallery.splice(index, 1); // Removes it from the master array
    renderGalleryPreviews(); // Re-draws the UI
}

async function savePortfolioUrls() {
    const userString = localStorage.getItem('momentoUser');
    if (!userString) return alert("Session expired. Please log in again.");
    const user = JSON.parse(userString);

    // 1. Gather Bio
    const bio = document.getElementById('pro-bio').value;

    // 2. Gather Specialties & Pricing
    const specialties = [];
    const pricing = {};
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        const val = cb.value;
        specialties.push(val);
        const idSafe = val.replace(/\s+/g, '');
        const costInput = document.getElementById(`cost-${idSafe}`);
        if(costInput && costInput.value) {
            pricing[val] = costInput.value;
        }
    });

    if (!uploadedImages.dp) return alert("You must upload a Display Picture (DP) to save your profile.");

    try {
        const saveBtn = document.querySelector('.btn-book-now');
        saveBtn.innerText = "Saving to Server...";
        saveBtn.disabled = true;

        const res = await fetch('https://momento-backend-production-8b55.up.railway.app/api/pro/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proId: user.id,
                bio: bio,
                dp_url: uploadedImages.dp,
                banner_url: uploadedImages.banner,
                specialties: specialties,
                pricing: pricing,
                best_shots: uploadedImages.bestShots,
                gallery: uploadedImages.gallery
            })
        });

        const data = await res.json();
        if (data.success) {
            alert("Profile successfully published! You are now live on Momento.");
        } else {
            alert("Error saving profile: " + data.error);
        }
        
        saveBtn.innerText = "Save Portfolio";
        saveBtn.disabled = false;
    } catch (error) {
        alert("Failed to connect to server. Please try again.");
    }
}

// ==========================================
// 6. DYNAMIC SPECIALTY ENGINE
// ==========================================
function updateDynamicFields() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const pricingContainer = document.getElementById('pricing-container');
    const bestShotsContainer = document.getElementById('dynamic-best-shots');
    
    pricingContainer.innerHTML = '';
    bestShotsContainer.innerHTML = '';
    
    checkboxes.forEach(cb => {
        const val = cb.value;
        const idSafe = val.replace(/\s+/g, '');
        
        // 1. Generate Pricing Input
        pricingContainer.innerHTML += `
            <div class="form-group">
                <label style="color: var(--accent-color);">${val} Cost (Per Day)</label>
                <input type="number" id="cost-${idSafe}" class="auth-input" placeholder="₹ Amount">
            </div>
        `;
        
        // 2. Generate Best Shot Upload Card for the 3D Animation
        bestShotsContainer.innerHTML += `
            <div class="upload-card">
                <h3>Best Shot: ${val}</h3>
                <p>Displays in the ${val} 3D animation on the home page.</p>
                <img id="preview-best-${idSafe}" src="${uploadedImages.bestShots[val] || ''}" style="${uploadedImages.bestShots[val] ? 'display:block;' : 'display:none;'} width: 100px; height: 140px; border-radius: 8px; margin: 15px auto; object-fit: cover; border: 2px solid var(--accent-color);">
                <button class="btn-view-all" onclick="openCloudinaryWidget('best', false, '${val}')">Upload ${val} Shot</button>
            </div>
        `;
    });
}
