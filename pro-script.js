// ==========================================
// PHOTOGRAPHER DASHBOARD LOGIC
// ==========================================

const API_BASE_URL = "https://momento-backend-production-8b55.up.railway.app/api/auth";

document.addEventListener("DOMContentLoaded", () => {
    checkProAuth();
});

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

    loadProfileData(user.id);
}

async function loadProfileData(proId) {
    try {
        const res = await fetch(`https://momento-backend-production-8b55.up.railway.app/api/pro/profile/${proId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
            const pro = data.data;
            
            if(pro.bio) document.getElementById('pro-bio').value = pro.bio;
            
            if(pro.specialties) {
                pro.specialties.forEach(spec => {
                    const cb = document.querySelector(`input[value="${spec}"]`);
                    if(cb) cb.checked = true;
                });
                updateDynamicFields(); 
            }
            
            if(pro.pricing) {
                Object.keys(pro.pricing).forEach(spec => {
                    const idSafe = spec.replace(/\s+/g, '');
                    const input = document.getElementById(`cost-${idSafe}`);
                    if(input) input.value = pro.pricing[spec];
                });
            }

            if(pro.dp_url) { uploadedImages.dp = pro.dp_url; document.getElementById('preview-dp').src = pro.dp_url; document.getElementById('preview-dp').style.display = 'block'; }
            if(pro.banner_url) { uploadedImages.banner = pro.banner_url; document.getElementById('preview-banner').src = pro.banner_url; document.getElementById('preview-banner').style.display = 'block'; }
            
            // Best Shots logic completely removed from database loader
            
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
// 5. CLOUDINARY UPLOAD WIDGET & GALLERY ENGINE
// ==========================================
const CLOUD_NAME = "uvj9mm54"; 
const UPLOAD_PRESET = "momento_preset"; 

let uploadedImages = {
    dp: "",
    banner: "",
    gallery: [] // Will now hold objects: { url: "...", category: "Wedding" }
};

// Function triggered by the Category Modal
function startGalleryUpload(category) {
    closeModal('modal-post-category');
    // Open widget, allow multiple, and pass the chosen category
    openCloudinaryWidget('gallery', true, category);
}

function openCloudinaryWidget(imageType, allowMultiple, specialtyTag = "") {
    let maxFiles = allowMultiple ? 20 : 1;
    let aspectRatio = null;

    // Set Banner and DP to exactly 1:1 ratio
    if (imageType === 'dp' || imageType === 'banner') { 
        aspectRatio = 1; 
    } 

    cloudinary.openUploadWidget({
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local'], 
        multiple: allowMultiple,
        maxFiles: maxFiles,
        cropping: true, 
        croppingAspectRatio: aspectRatio,
        showSkipCropButton: true, 
        folder: `momento_pro/${imageType}`, 
        clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        maxFileSize: 5000000,
        styles: {
            palette: {
                window: "#FAF6F3", windowBorder: "#D19A8A", tabIcon: "#5C4033", menuIcons: "#5C4033",
                textDark: "#5C4033", textLight: "#FFFFFF", link: "#D19A8A", action: "#D19A8A",      
                inactiveTabIcon: "#b5a39c", error: "#e74c3c", inProgress: "#D19A8A", complete: "#27ae60", sourceBg: "#FFFFFF"
            }
        }
    }, (error, result) => {
        if (!error && result && result.event === "success") {
            const secureUrl = result.info.secure_url;
            
            if (imageType === 'dp') {
                uploadedImages.dp = secureUrl;
                document.getElementById('preview-dp').src = secureUrl;
                document.getElementById('preview-dp').style.display = 'block';
            } 
            else if (imageType === 'banner') {
                uploadedImages.banner = secureUrl;
                document.getElementById('preview-banner').src = secureUrl;
                document.getElementById('preview-banner').style.display = 'block';
            } 
            else if (imageType === 'gallery') {
                // Save both the URL and the Category as an object
                uploadedImages.gallery.push({ url: secureUrl, category: specialtyTag });
                renderGalleryPreviews(); 
            }
        }
    });
}

function renderGalleryPreviews() {
    const container = document.getElementById('gallery-preview-container');
    container.innerHTML = ''; 
    
    if (uploadedImages.gallery.length === 0) {
        container.innerHTML = '<p style="opacity: 0.6; font-size: 0.95rem; text-align: center; padding: 20px; background: #f9f9f9; border-radius: 10px; border: 1px dashed #ccc;">No gallery images uploaded yet. Click "+ Post" at the top to add some.</p>';
        return;
    }

    uploadedImages.gallery.forEach((item, index) => {
        // Handle both old string arrays (from previous tests) and the new categorized objects safely
        const imgUrl = typeof item === 'string' ? item : item.url;
        const imgCat = typeof item === 'string' ? 'Uncategorized' : item.category;

        container.innerHTML += `
            <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; display: flex; flex-direction: column; align-items: center; position: relative;">
                <!-- Category Badge -->
                <span style="position: absolute; top: 25px; right: 25px; background: var(--accent-color); color: #0f0f10; padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">${imgCat}</span>
                
                <img src="${imgUrl}" style="width: 100%; max-height: 450px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;">
                
                <button onclick="removeGalleryImage(${index})" style="background: white; color: #e74c3c; border: 1px solid #e74c3c; padding: 10px 25px; border-radius: 25px; font-family: 'Lato', sans-serif; font-weight: bold; cursor: pointer; width: 100%; max-width: 250px; transition: 0.3s;" onmouseover="this.style.background='#e74c3c'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='#e74c3c';">🗑️ Remove Image</button>
            </div>
        `;
    });
}

function removeGalleryImage(index) {
    if (confirm("Are you sure you want to remove this image from your portfolio?")) {
        uploadedImages.gallery.splice(index, 1); 
        renderGalleryPreviews(); 
    }
}

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

    const originalText = btnElement.innerText;
    btnElement.innerText = "Saving...";
    btnElement.disabled = true;

    try {
        const res = await fetch('https://momento-backend-production-8b55.up.railway.app/api/pro/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proId: user.id, bio: bio, dp_url: uploadedImages.dp, banner_url: uploadedImages.banner,
                specialties: specialties, pricing: pricing, best_shots: {}, gallery: uploadedImages.gallery
            })
        });

        const data = await res.json();
        if (data.success) {
            btnElement.innerText = "Saved! ✓";
            btnElement.style.backgroundColor = "#27ae60"; 
            btnElement.style.borderColor = "#27ae60";
            
            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.style.backgroundColor = ""; 
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
// 6. DYNAMIC SPECIALTY ENGINE (UPDATED)
// ==========================================
function updateDynamicFields() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const pricingContainer = document.getElementById('pricing-container');
    
    // SECURE STATE: Memorize existing inputs before wiping the DOM
    const currentPricing = {};
    pricingContainer.querySelectorAll('input').forEach(input => {
        currentPricing[input.id] = input.value;
    });
    
    pricingContainer.innerHTML = '';
    // Removed bestShotsContainer logic entirely
    
    checkboxes.forEach(cb => {
        const val = cb.value;
        const idSafe = val.replace(/\s+/g, '');
        const costId = `cost-${idSafe}`;
        const existingValue = currentPricing[costId] || '';
        
        // Generate Pricing Input 
        pricingContainer.innerHTML += `
            <div class="form-group">
                <label style="color: var(--primary-color); font-weight: bold;">${val} Cost (Per Day)</label>
                <input type="number" id="${costId}" class="auth-input" placeholder="₹ Amount" value="${existingValue}">
            </div>
        `;
    });
}

// ==========================================
// 7. QUIT PLATFORM LOGIC
// ==========================================

function initiateQuit() {
    document.getElementById('modal-quit-terms').style.display = 'block';
}

async function acceptQuitTerms() {
    const userString = localStorage.getItem('momentoUser');
    if (!userString) return;
    const user = JSON.parse(userString);
    const btn = document.querySelector('#modal-quit-terms .btn-book-now');
    
    btn.innerText = "Checking Bookings...";
    btn.disabled = true;

    try {
        // 1. Check for pending bookings
        const res = await fetch(`https://momento-backend-production-8b55.up.railway.app/api/pro/check-bookings/${user.id}`);
        const data = await res.json();

        if (data.success && data.pendingCount > 0) {
            alert(`ACTION BLOCKED: You have ${data.pendingCount} active booking(s). You must complete or legally cancel all bookings before leaving the platform.`);
            document.getElementById('modal-quit-terms').style.display = 'none';
        } else {
            // 2. If clear, send OTP
            btn.innerText = "Sending OTP...";
            await fetch('https://momento-backend-production-8b55.up.railway.app/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            
            document.getElementById('modal-quit-terms').style.display = 'none';
            document.getElementById('modal-quit-otp').style.display = 'block';
        }
    } catch (error) {
        alert("Server error. Please try again.");
    } finally {
        btn.innerText = "I Accept & Wish to Proceed";
        btn.disabled = false;
    }
}

async function confirmQuit(btnElement) {
    const otp = document.getElementById('quit-otp').value.trim();
    const reason = document.getElementById('quit-reason').value.trim();
    const user = JSON.parse(localStorage.getItem('momentoUser'));

    if (!otp) return alert("Please enter the OTP to confirm deletion.");

    btnElement.innerText = "Deleting...";
    btnElement.disabled = true;

    try {
        const res = await fetch('https://momento-backend-production-8b55.up.railway.app/api/pro/quit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proId: user.id,
                email: user.email,
                proName: user.name,
                otp: otp,
                reason: reason || "No reason provided."
            })
        });

        const data = await res.json();
        
        if (data.success) {
            alert("Your account has been successfully deleted. Thank you for your time with Momento.");
            logoutPro(); // Wipes local storage and redirects to home
        } else {
            alert("Error: " + data.error);
            btnElement.innerText = "Permanently Delete Account";
            btnElement.disabled = false;
        }
    } catch (error) {
        alert("Failed to process request. Check connection.");
        btnElement.innerText = "Permanently Delete Account";
        btnElement.disabled = false;
    }
}
