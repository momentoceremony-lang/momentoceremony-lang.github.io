// ==========================================
// PHOTOGRAPHER DASHBOARD LOGIC
// ==========================================

const API_BASE_URL = "https://momento-backend-production-8b55.up.railway.app/api/auth";

document.addEventListener("DOMContentLoaded", () => {
    checkProAuth();
});

// 1. GATEKEEPER & DATA LOADER
function checkProAuth() {
    const userString = localStorage.getItem('momentoUser');
    const isPro = localStorage.getItem('isPro');

    if (!userString || isPro !== 'true') {
        alert("Unauthorized access. Redirecting to home page.");
        window.location.href = "index.html"; 
        return;
    }

    const user = JSON.parse(userString);
    document.getElementById('dashboard-title').innerText = `Welcome, ${user.name.split(' ')[0]}`;
    if (document.getElementById('pro-name')) document.getElementById('pro-name').value = user.name;
    if (document.getElementById('pro-phone')) document.getElementById('pro-phone').value = user.phone;

    // Load saved data from database
    loadProfileData(user.id);
}

async function loadProfileData(proId) {
    try {
        const res = await fetch(`https://momento-backend-production-8b55.up.railway.app/api/pro/profile/${proId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
            const pro = data.data;
            
            // Restore Bio
            if(pro.bio) document.getElementById('pro-bio').value = pro.bio;
            
            // Restore Specialties & trigger dynamic inputs
            if(pro.specialties) {
                pro.specialties.forEach(spec => {
                    const cb = document.querySelector(`input[value="${spec}"]`);
                    if(cb) cb.checked = true;
                });
                updateDynamicFields(); 
            }
            
            // Restore Pricing
            if(pro.pricing) {
                Object.keys(pro.pricing).forEach(spec => {
                    const idSafe = spec.replace(/\s+/g, '');
                    const input = document.getElementById(`cost-${idSafe}`);
                    if(input) input.value = pro.pricing[spec];
                });
            }

            // Restore Uploaded Images to memory and UI
            if(pro.dp_url) { uploadedImages.dp = pro.dp_url; document.getElementById('preview-dp').src = pro.dp_url; document.getElementById('preview-dp').style.display = 'block'; }
            if(pro.banner_url) { uploadedImages.banner = pro.banner_url; document.getElementById('preview-banner').src = pro.banner_url; document.getElementById('preview-banner').style.display = 'block'; }
            if(pro.best_shots) {
                uploadedImages.bestShots = pro.best_shots;
                Object.keys(pro.best_shots).forEach(spec => {
                    const idSafe = spec.replace(/\s+/g, '');
                    const img = document.getElementById(`preview-best-${idSafe}`);
                    if(img) { img.src = pro.best_shots[spec]; img.style.display = 'block'; }
                });
            }
            if(pro.gallery) {
                uploadedImages.gallery = pro.gallery;
                renderGalleryPreviews();
            }
        }
    } catch (e) { 
        console.error("Failed to load profile data", e); 
    }
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

    // Set aspect ratios only for specific UI elements. Gallery remains free-form.
    if (imageType === 'dp') { aspectRatio = 1; } 
    else if (imageType === 'banner') { aspectRatio = 16/9; } 
    else if (imageType === 'best') { aspectRatio = 2/3; }

    cloudinary.openUploadWidget({
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local'], 
        multiple: allowMultiple,
        maxFiles: maxFiles,
        
        // Force the crop screen to appear, but always allow the user to skip it
        cropping: true, 
        croppingAspectRatio: aspectRatio,
        showSkipCropButton: true, 
        
        folder: `momento_pro/${imageType}`, 
        clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        maxFileSize: 5000000,
        
        // Premium Theming: Recolor the widget to match Momento exactly
        styles: {
            palette: {
                window: "#FAF6F3",       
                windowBorder: "#D19A8A", 
                tabIcon: "#5C4033",      
                menuIcons: "#5C4033",
                textDark: "#5C4033",
                textLight: "#FFFFFF",
                link:  "#D19A8A",
                action:  "#D19A8A",      
                inactiveTabIcon: "#b5a39c",
                error: "#e74c3c",
                inProgress: "#D19A8A",
                complete: "#27ae60",
                sourceBg: "#FFFFFF"
            },
            fonts: {
                default: null,
                "'Lato', sans-serif": {
                    url: "https://fonts.googleapis.com/css?family=Lato",
                    active: true
                }
            }
        }
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
                const idSafe = specialtyTag.replace(/\s+/g, '');
                uploadedImages.bestShots[specialtyTag] = secureUrl;
                const img = document.getElementById(`preview-best-${idSafe}`);
                img.src = secureUrl;
                img.style.display = 'block';
            }
            else if (imageType === 'gallery') {
                uploadedImages.gallery.push(secureUrl);
                renderGalleryPreviews(); 
            }
        }
    });
}

function renderGalleryPreviews() {
    const container = document.getElementById('gallery-preview-container');
    container.innerHTML = ''; // Clear current view
    
    if (uploadedImages.gallery.length === 0) {
        container.innerHTML = '<p style="opacity: 0.6; font-size: 0.95rem; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 10px; border: 1px dashed #ccc;">No gallery images uploaded yet. Click "+ Post" at the top to add some.</p>';
        return;
    }

    // Generate a premium full-width card with a proper remove button
    uploadedImages.gallery.forEach((url, index) => {
        container.innerHTML += `
            <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; display: flex; flex-direction: column; align-items: center;">
                <img src="${url}" style="width: 100%; max-height: 450px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
                <button onclick="removeGalleryImage(${index})" style="background: white; color: #e74c3c; border: 1px solid #e74c3c; padding: 10px 25px; border-radius: 25px; font-family: 'Lato', sans-serif; font-weight: bold; cursor: pointer; width: 100%; max-width: 250px;">🗑️ Remove Image</button>
            </div>
        `;
    });
}

function removeGalleryImage(index) {
    // Premium safety confirmation prompt
    const confirmDelete = confirm("Are you sure you want to remove this image from your portfolio?");
    
    if (confirmDelete) {
        uploadedImages.gallery.splice(index, 1); // Removes it from the master array
        renderGalleryPreviews(); // Re-draws the UI
    }
}


// UPGRADED SAVE FUNCTION WITH BUTTON ANIMATION
async function savePortfolioUrls(btnElement) {
    const userString = localStorage.getItem('momentoUser');
    if (!userString) return alert("Session expired. Please log in again.");
    const user = JSON.parse(userString);

    const bio = document.getElementById('pro-bio').value;
    const specialties = [];
    const pricing = {};
    
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        const val = cb.value;
        specialties.push(val);
        const idSafe = val.replace(/\s+/g, '');
        const costInput = document.getElementById(`cost-${idSafe}`);
        if(costInput && costInput.value) pricing[val] = costInput.value;
    });

    if (!uploadedImages.dp) return alert("You must upload a Display Picture (DP) to save your profile.");

    // Button Animation Start
    const originalText = btnElement.innerText;
    btnElement.innerText = "Saving...";
    btnElement.disabled = true;

    try {
        const res = await fetch('https://momento-backend-production-8b55.up.railway.app/api/pro/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proId: user.id, bio: bio, dp_url: uploadedImages.dp, banner_url: uploadedImages.banner,
                specialties: specialties, pricing: pricing, best_shots: uploadedImages.bestShots, gallery: uploadedImages.gallery
            })
        });

        const data = await res.json();
        if (data.success) {
            // Success Animation
            btnElement.innerText = "Saved! ✓";
            btnElement.style.backgroundColor = "#27ae60"; // Success Green
            btnElement.style.borderColor = "#27ae60";
            
            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.backgroundColor = ""; // Reset to default CSS
                btnElement.style.borderColor = "";
                btnElement.disabled = false;
            }, 3000);
        } else {
            alert("Error saving profile: " + data.error);
            btnElement.innerText = originalText;
            btnElement.disabled = false;
        }
    } catch (error) {
        alert("Failed to connect to server.");
        btnElement.innerText = originalText;
        btnElement.disabled = false;
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
