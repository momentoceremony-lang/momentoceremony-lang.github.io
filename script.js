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
