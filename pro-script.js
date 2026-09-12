// ==========================================
// PHOTOGRAPHER DASHBOARD LOGIC
// ==========================================

const API_BASE_URL = "https://api.momentoo.in/api/auth";

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
        const res = await fetch(`https://api.momentoo.in/api/pro/profile/${proId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
            const pro = data.data;
            
            // 1. INJECT THE CATEGORY TEXT INTO THE HEADER
            document.getElementById('dashboard-category').innerText = pro.proType || 'Photographer';
            
            if(pro.bio) document.getElementById('pro-bio').value = pro.bio;
            
            const specGroup = document.getElementById('specialties-selection-group');
            
            // 2. MEHNDI ARTIST FLOW (Single Checkbox)
            if (pro.proType === 'Mehndi Artist') {
                if (specGroup) {
                    specGroup.style.display = 'block';
                    specGroup.innerHTML = `
                        <label>Select Specialty</label>
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <label><input type="checkbox" value="Mehndi Design" onchange="updateDynamicFields()"> Mehndi Design</label>
                        </div>
                    `;
                }
            } 
            // 3. MAKEUP ARTIST FLOW (Spreadsheet Categories)
            else if (pro.proType === 'Makeup Artist') {
                if (specGroup) {
                    specGroup.style.display = 'block';
                    specGroup.innerHTML = `
                        <label>Select Occasions (Choose all that apply)</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 10px;">
                            <label><input type="checkbox" value="Bridal" onchange="updateDynamicFields()"> Bridal</label>
                            <label><input type="checkbox" value="Engagement" onchange="updateDynamicFields()"> Engagement</label>
                            <label><input type="checkbox" value="Haldi / Mehndi" onchange="updateDynamicFields()"> Haldi / Mehndi</label>
                            <label><input type="checkbox" value="Sangeet" onchange="updateDynamicFields()"> Sangeet</label>
                            <label><input type="checkbox" value="Reception" onchange="updateDynamicFields()"> Reception</label>
                            <label><input type="checkbox" value="Party" onchange="updateDynamicFields()"> Party</label>
                            <label><input type="checkbox" value="Photoshoot" onchange="updateDynamicFields()"> Photoshoot</label>
                            <label><input type="checkbox" value="Something Else" onchange="updateDynamicFields()"> Something Else</label>
                        </div>
                    `;
                }
            } 
            // 4. PHOTOGRAPHER FLOW
            else {
                if (specGroup) {
                    specGroup.style.display = 'block';
                    specGroup.innerHTML = `
                        <label>Select Specialties (Choose all that apply)</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 10px;">
                            <label><input type="checkbox" value="Wedding" onchange="updateDynamicFields()"> Wedding</label>
                            <label><input type="checkbox" value="Pre-Wedding" onchange="updateDynamicFields()"> Pre-Wedding</label>
                            <label><input type="checkbox" value="Birthday" onchange="updateDynamicFields()"> Birthday</label>
                            <label><input type="checkbox" value="Anniversary" onchange="updateDynamicFields()"> Anniversary</label>
                            <label><input type="checkbox" value="Baby Shoot" onchange="updateDynamicFields()"> Baby Shoot</label>
                        </div>
                    `;
                }
            }

            // Restore Checked Boxes
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
                    const idSafe = spec.replace(/[\s\/]+/g, ''); // Safely handles slashes
                    const input = document.getElementById(`cost-${idSafe}`);
                    if(input) input.value = pro.pricing[spec];
                });
            }

            if(pro.dp_url) { uploadedImages.dp = pro.dp_url; document.getElementById('preview-dp').src = pro.dp_url; document.getElementById('preview-dp').style.display = 'block'; }
            if(pro.banner_url) { uploadedImages.banner = pro.banner_url; document.getElementById('preview-banner').src = pro.banner_url; document.getElementById('preview-banner').style.display = 'block'; }
            
            if(pro.gallery) {
                uploadedImages.gallery = pro.gallery;
                renderGalleryPreviews();
            }

            // 5. FADE OUT AND REMOVE THE LOADER ONCE EVERYTHING IS RENDERED
            const loader = document.getElementById('dashboard-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => { loader.style.display = 'none'; }, 500);
            }
        }
    } catch (e) { 
        console.error("Failed to load profile data", e); 
        // Hide loader even if there is an error so they aren't stuck forever
        const loader = document.getElementById('dashboard-loader');
        if (loader) loader.style.display = 'none';
    }
}

// ==========================================
// MODAL POPUP LOGIC FOR DASHBOARD
// ==========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevents background scrolling
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restores background scrolling
    }
}

// Close modals when clicking the background shade
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
        document.body.style.overflow = 'auto';
    }
}

// ==========================================
// 2. TAB SWITCHING LOGIC & SPA ROUTING
// ==========================================

let backPressedOnce = false;

// When the page first loads, set the baseline history state to "overview"
window.addEventListener("DOMContentLoaded", () => {
    if (!window.location.hash) {
        window.history.replaceState({ tab: 'overview' }, "", "#overview");
    } else {
        // If they refresh the page on a specific tab, load that tab
        executeVisualTabSwitch(window.location.hash.replace('#', ''));
    }
});

// Triggered when a user clicks a sidebar menu item
function switchTab(tabName) {
    // Push the new tab to the phone's history so the back button registers it
    if (window.location.hash !== `#${tabName}`) {
        window.history.pushState({ tab: tabName }, "", `#${tabName}`);
    }
    executeVisualTabSwitch(tabName);
}

// Handles the actual visual hiding/showing of elements
function executeVisualTabSwitch(tabName) {
    // Close the mobile menu if it is open
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('show-menu')) {
        sidebar.classList.remove('show-menu');
    }
    
    // Safety feature: Close any open pop-up modals when navigating tabs
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
    
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active-tab');
    });
    
    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
    });

    // Show selected tab
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active-tab');
    
    // Highlight sidebar link
    const targetLink = document.querySelector(`.sidebar-menu li[onclick="switchTab('${tabName}')"]`);
    if (targetLink) targetLink.classList.add('active');
}

// ==========================================
// NATIVE APP BACK BUTTON INTERCEPTOR
// ==========================================
window.addEventListener('popstate', function(event) {
    const hash = window.location.hash.replace('#', '');
    
    // If there is no hash or we are on the main 'overview' tab
    if (!hash || hash === 'overview') {
        if (!backPressedOnce) {
            // FIRST BACK PRESS: Intercept it, stay on overview, and show the warning toast
            backPressedOnce = true;
            
            // Push overview back into history to prevent the browser from actually exiting
            window.history.pushState({ tab: 'overview' }, "", "#overview");
            executeVisualTabSwitch('overview');
            
            // Create a native-looking Android toast notification
            const toast = document.createElement('div');
            toast.innerText = "Press back again to exit";
            toast.style.cssText = "position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: white; padding: 12px 24px; border-radius: 25px; z-index: 9999; font-family: 'Lato', sans-serif; font-size: 0.95rem; opacity: 0; transition: opacity 0.3s ease;";
            document.body.appendChild(toast);
            
            // Fade the toast in
            requestAnimationFrame(() => toast.style.opacity = '1');
            
            // Reset the double-tap requirement after 2 seconds
            setTimeout(() => {
                backPressedOnce = false;
                toast.style.opacity = '0';
                setTimeout(() => { if (document.body.contains(toast)) toast.remove(); }, 300);
            }, 2000);
            
        } else {
            // SECOND BACK PRESS (within 2 seconds): Actually exit the dashboard
            window.location.href = "index.html"; 
        }
    } else {
        // If they are on a different tab (e.g., Portfolio), just visually switch back to it
        executeVisualTabSwitch(hash);
    }
});

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

// Function to dynamically populate and open the category selection modal
function openCategoryModal() {
    const checkedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    const buttonContainer = document.getElementById('dynamic-category-buttons');
    
    // Clear out any old buttons
    buttonContainer.innerHTML = '';

    // Safety check: Ensure they have at least one category selected
    if (checkedBoxes.length === 0) {
        alert("Please select at least one Specialty in your 'My Profile' tab first.");
        return;
    }

    // Generate a premium button for each selected category
    checkedBoxes.forEach(cb => {
        const val = cb.value;
        buttonContainer.innerHTML += `
            <button onclick="startGalleryUpload('${val}')" 
                    style="background: var(--accent-color); color: #0f0f10; border: none; padding: 14px 20px; border-radius: 15px; font-family: 'Lato', sans-serif; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 100%; transition: transform 0.2s ease;">
                ${val}
            </button>
        `;
    });

    // Open the modal
    openModal('modal-post-category');
}

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
        const imgUrl = typeof item === 'string' ? item : item.url;
        const imgCat = typeof item === 'string' ? 'Uncategorized' : item.category;

        container.innerHTML += `
            <div style="background: white; padding: 15px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; display: flex; flex-direction: column; align-items: center; position: relative;">
                <!-- Category Badge -->
                <span style="position: absolute; top: 25px; right: 25px; background: var(--accent-color); color: #0f0f10; padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold; z-index: 10; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">${imgCat}</span>
                
                <!-- UPDATED: object-fit: contain, dark background, cursor pointer, and onclick event -->
                <img src="${imgUrl}" onclick="openFullscreen('${imgUrl}')" style="width: 100%; height: 450px; object-fit: contain; background: transparent; border-radius: 8px; margin-bottom: 15px; cursor: pointer; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                
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
        const idSafe = val.replace(/[\s\/]+/g, ''); // Identical regex to match the inputs
        const costInput = document.getElementById(`cost-${idSafe}`);
        if(costInput && costInput.value) pricing[val] = costInput.value;
    });

    if (!uploadedImages.dp) return alert("You must upload a Display Picture (DP) to save your profile.");

    const originalText = btnElement.innerText;
    btnElement.innerText = "Saving...";
    btnElement.disabled = true;

    try {
        const res = await fetch('https://api.momentoo.in/api/pro/profile', {
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
    
    checkboxes.forEach(cb => {
        const val = cb.value;
        // Strip spaces AND special characters (like slashes) for a safe HTML ID
        const idSafe = val.replace(/[\s\/]+/g, '');
        const costId = `cost-${idSafe}`;
        const existingValue = currentPricing[costId] || '';
        
        // Generate Pricing Input 
        pricingContainer.innerHTML += `
            <div class="form-group">
                <label style="color: var(--primary-color); font-weight: bold;">${val} (Starting Cost)</label>
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
        const res = await fetch(`https://api.momentoo.in/api/pro/check-bookings/${user.id}`);
        const data = await res.json();

        if (data.success && data.pendingCount > 0) {
            alert(`ACTION BLOCKED: You have ${data.pendingCount} active booking(s). You must complete or legally cancel all bookings before leaving the platform.`);
            document.getElementById('modal-quit-terms').style.display = 'none';
        } else {
            // 2. If clear, send OTP
            btn.innerText = "Sending OTP...";
            await fetch('https://api.momentoo.in/api/auth/send-otp', {
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
        const res = await fetch('https://api.momentoo.in/api/pro/quit', {
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

// ==========================================
// BACK TO TOP BUTTON LOGIC
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
