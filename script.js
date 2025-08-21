document.addEventListener('DOMContentLoaded', function() {
    const categories = document.querySelectorAll('.category');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuHeaders = document.querySelectorAll('.menu-header');
    const backButtons = document.querySelectorAll('.back-to-top');
    const categoriesSection = document.querySelector('.categories');
    const menuContainer = document.querySelector('.menu-container'); 
    
    // Navbar functionality
    const navbar = document.querySelector('.navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navCategories = document.querySelectorAll('.nav-category');
    
    // Floating back to top button functionality
    const floatingBackToTop = document.getElementById('floating-back-to-top');
    
    // Show/hide floating back to top button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            floatingBackToTop.classList.add('visible');
        } else {
            floatingBackToTop.classList.remove('visible');
        }
        
        // Also handle navbar scroll effect
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Floating back to top button click handler with cubic-bezier easing for smoother animation
    floatingBackToTop.addEventListener('click', function() {
        const startPosition = window.pageYOffset;
        const duration = 1000; // ms - adjust for slower/faster animation
        let startTime = null;
        
        // Cubic-bezier easing function for a more natural deceleration
        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }
        
        function animateScroll(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);
            
            window.scrollTo(0, startPosition * (1 - easeProgress));
            
            if (timeElapsed < duration) {
                window.requestAnimationFrame(animateScroll);
            }
        }
        
        window.requestAnimationFrame(animateScroll);
    });
    
    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Nav menu category click handler
    navCategories.forEach(navLink => {
        navLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Close mobile menu if open
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
            
            const categoryName = this.getAttribute('data-category');
            
            // Find and simulate click on the corresponding category
            const categoryElement = document.querySelector(`.category[data-section="${categoryName}"]`);
            if (categoryElement) {
                categoryElement.click();
            }
        });
    });
    
    // Home link click handler
    const homeLink = document.querySelector('.nav-link:not(.nav-category):not(.nav-location)');
    if (homeLink) {
        homeLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Hide menu container
            menuContainer.classList.remove('active');
            
            // Hide all sections and headers
            menuSections.forEach(section => section.classList.remove('active'));
            menuHeaders.forEach(header => header.style.display = 'none');
            
            // Restore categories to full size
            categoriesSection.classList.remove('minimized');
            
            // Scroll to top of page
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }
    
    // About Us link click handler
    const aboutUsLink = document.querySelector('.nav-link[href="#about-us"]');
    if (aboutUsLink) {
        aboutUsLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Hide menu container
            menuContainer.classList.remove('active');
            
            // Hide all sections and headers
            menuSections.forEach(section => section.classList.remove('active'));
            menuHeaders.forEach(header => header.style.display = 'none');
            
            // Restore categories to full size
            categoriesSection.classList.remove('minimized');
            
            // Scroll to About Us section
            const aboutUsSection = document.getElementById('about-us');
            if (aboutUsSection) {
                scrollToElement(aboutUsSection);
            }
            
            // Close mobile menu if open
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }
    
    // Function to scroll to element
    function scrollToElement(element) {
        window.scrollTo({
            top: element.offsetTop - 90, // Adjust for navbar height
            behavior: 'smooth'
        });
    }
    
    // Original category click handler
    categories.forEach(category => {
        category.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            const navCategory = document.querySelector(`.nav-category[data-category="${sectionId}"]`);
            if (navCategory) {
                navCategory.classList.add('active');
            }
            
            // Hide all sections and headers
            menuSections.forEach(section => section.classList.remove('active'));
            menuHeaders.forEach(header => header.style.display = 'none');
            
            // Show menu container for ALL categories (removing special handling)
            menuContainer.classList.add('active');
            
            // Minimize the categories
            categoriesSection.classList.add('minimized');
            
            // Show selected section and its header
            const selectedSection = document.getElementById(sectionId);
            const selectedHeader = document.getElementById(sectionId + '-header');
            
            if (selectedSection) {
                selectedSection.classList.add('active');
            }
            
            if (selectedHeader) {
                selectedHeader.style.display = 'block';
            }
            
            // Handle the drinks category - show the first subcategory content by default
            if (sectionId === 'drinks') {
                // Find all subcategory contents and hide them
                const subcategoryContents = document.querySelectorAll('.subcategory-content');
                subcategoryContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                // Get the first subcategory button and content
                const firstSubcategoryBtn = document.querySelector('.subcategory-btn');
                const firstSubcategoryContent = document.getElementById(firstSubcategoryBtn.getAttribute('data-target'));
                
                // Activate the first subcategory button
                const subcategoryBtns = document.querySelectorAll('.subcategory-btn');
                subcategoryBtns.forEach(btn => btn.classList.remove('active'));
                firstSubcategoryBtn.classList.add('active');
                
                // Show the first subcategory content
                if (firstSubcategoryContent) {
                    firstSubcategoryContent.style.display = 'block';
                    firstSubcategoryContent.classList.add('active');
                }
            } else {
                // For other categories, ensure all subcategory contents are hidden
                const subcategoryContents = document.querySelectorAll('.subcategory-content');
                subcategoryContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
            }
            
            // Scroll to menu container for all categories
            scrollToElement(menuContainer);
        });
    });
    
    // Back to categories button handler (keep original functionality)
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            homeLink.classList.add('active');
            
            // Hide the menu container
            menuContainer.classList.remove('active');
            
            // Hide all sections and headers
            menuSections.forEach(section => section.classList.remove('active'));
            menuHeaders.forEach(header => header.style.display = 'none');
            
            // Restore the categories to full size
            categoriesSection.classList.remove('minimized');
            
            // Scroll back to categories
            scrollToElement(categoriesSection);
        });
    });
    
    // Animation for menu items on scroll
    const menuItems = document.querySelectorAll('.menu-item');
    
    function checkScroll() {
        menuItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (itemTop < windowHeight * 0.9) {
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            }
        });
    }
    
    // Set initial state for animation
    menuItems.forEach(item => {
        item.style.opacity = "0";
        item.style.transform = "translateY(20px)";
        item.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    
    // Check on scroll and initial load
    window.addEventListener('scroll', checkScroll);
    checkScroll();
    
    // Lightbox functionality for menu item images
    function setupLightbox() {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        
        const lightboxContent = document.createElement('div');
        lightboxContent.className = 'lightbox-content';
        
        const lightboxImage = document.createElement('img');
        lightboxImage.className = 'lightbox-image';
        
        const lightboxCaption = document.createElement('div');
        lightboxCaption.className = 'lightbox-caption';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'lightbox-close';
        closeButton.innerHTML = '×';
        
        lightboxContent.appendChild(lightboxImage);
        lightboxContent.appendChild(lightboxCaption);
        lightbox.appendChild(lightboxContent);
        lightbox.appendChild(closeButton);
        document.body.appendChild(lightbox);
        
        // Wrap all menu item images in a container for better styling
        document.querySelectorAll('.menu-item-image').forEach(img => {
            // Skip if already wrapped
            if (img.parentElement.classList.contains('menu-item-image-container')) return;
            
            const container = document.createElement('div');
            container.className = 'menu-item-image-container';
            img.parentNode.insertBefore(container, img);
            container.appendChild(img);
            
            // Get menu item title only
            const menuItem = img.closest('.menu-item');
            const title = menuItem.querySelector('.menu-item-title').textContent;
            
            // Add click handler
            container.addEventListener('click', function() {
                lightboxImage.src = img.src;
                lightboxCaption.innerHTML = `<h3>${title}</h3>`; // Only show title
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        closeButton.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close lightbox with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
        
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Initialize lightbox
    setupLightbox();
    
    // Add no-scroll class for body
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .no-scroll {
                overflow: hidden;
            }
        </style>
    `);

    // Subcategory navigation
    function setupSubcategoryNavigation() {
        const subcategoryBtns = document.querySelectorAll('.subcategory-btn');
        const subcategoryContents = document.querySelectorAll('.subcategory-content');
        
        subcategoryBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Create ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('btn-ripple');
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
                
                // Update active button
                subcategoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show selected subcategory
                const targetId = this.getAttribute('data-target');
                subcategoryContents.forEach(content => {
                    content.classList.remove('active');
                    
                    // Add animation classes
                    content.classList.remove('fadeInAnimation');
                    content.style.display = 'none';
                });
                
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    // Set display to block first, then add animation class
                    targetContent.style.display = 'block';
                    
                    // Force reflow for animation to work
                    void targetContent.offsetWidth;
                    
                    targetContent.classList.add('active', 'fadeInAnimation');
                }
                
                // Scroll to top of subcategory on mobile
                if (window.innerWidth <= 768) {
                    const subcategoryTitle = targetContent.querySelector('.subcategory-title');
                    if (subcategoryTitle) {
                        subcategoryTitle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                }
            });
        });
    }

    // Initialize subcategory navigation after DOM is loaded
    setupSubcategoryNavigation();

    // Add this style for fade in animation
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .fadeInAnimation {
                animation: fadeInSubcategory 0.5s ease forwards;
            }
            
            @keyframes fadeInSubcategory {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .btn-ripple {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0);
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple {
                to {
                    transform: translate(-50%, -50%) scale(2);
                    opacity: 0;
                }
            }
        </style>
    `);

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResultsOverlay = document.getElementById('searchResultsOverlay');
    const searchResultsContent = document.getElementById('searchResultsContent');
    const closeSearchResults = document.getElementById('closeSearchResults');
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    // Function to collect menu items data from the DOM
    function collectMenuItemsData() {
        const menuItems = document.querySelectorAll('.menu-item');
        const menuItemsData = [];
        
        menuItems.forEach(item => {
            // Get the menu section this item belongs to
            const menuSection = item.closest('.menu-section');
            const categoryId = menuSection ? menuSection.id : '';
            
            // Get category name (cleaner format)
            const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
            
            // Get subcategory if available
            const subcategoryContent = item.closest('.subcategory-content');
            const subcategoryTitle = subcategoryContent ? 
                subcategoryContent.querySelector('.subcategory-title').textContent : '';
            
            // Get item details
            const title = item.querySelector('.menu-item-title').textContent;
            const description = item.querySelector('.menu-item-description') ? 
                item.querySelector('.menu-item-description').textContent : '';
            const price = item.querySelector('.menu-item-price').textContent;
            const imageSrc = item.querySelector('.menu-item-image') ? 
                item.querySelector('.menu-item-image').src : '';
            
            menuItemsData.push({
                title,
                description,
                price,
                imageSrc,
                category: categoryName,
                subcategory: subcategoryTitle,
                element: item
            });
        });
        
        return menuItemsData;
    }
    
    // Function to perform search
    function performSearch(query) {
        // Normalize search query (lowercase, trim)
        query = query.toLowerCase().trim();
        
        // Don't search for very short queries
        if (query.length < 2) {
            return [];
        }
        
        const menuItemsData = collectMenuItemsData();
        return menuItemsData.filter(item => {
            return (
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                item.subcategory.toLowerCase().includes(query)
            );
        });
    }
    
    // Function to reset search state
    function resetSearch() {
        searchInput.value = '';
        searchResultsOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        document.body.style.overflow = ''; // Ensure scrolling is restored
    }
    
    // Function to navigate to a menu item
    function navigateToMenuItem(item) {
        // Find the category for this item
        const categoryId = item.category.toLowerCase();
        const categoryElement = document.querySelector(`.category[data-section="${categoryId}"]`);
        
        if (categoryElement) {
            // First show the appropriate category
            const sectionId = categoryElement.getAttribute('data-section');
            
            // Reset all sections first
            menuSections.forEach(section => section.classList.remove('active'));
            menuHeaders.forEach(header => header.style.display = 'none');
            
            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            const navCategory = document.querySelector(`.nav-category[data-category="${sectionId}"]`);
            if (navCategory) {
                navCategory.classList.add('active');
            }
            
            // Show menu container
            menuContainer.classList.add('active');
            
            // Minimize categories
            categoriesSection.classList.add('minimized');
            
            // Show selected section and header
            const selectedSection = document.getElementById(sectionId);
            const selectedHeader = document.getElementById(sectionId + '-header');
            
            if (selectedSection) {
                selectedSection.classList.add('active');
            }
            
            if (selectedHeader) {
                selectedHeader.style.display = 'block';
            }
            
            // For drinks category, ensure correct subcategory is active
            if (sectionId === 'drinks' && item.subcategory) {
                // Find the appropriate subcategory based on the item
                const subcategoryContents = document.querySelectorAll('.subcategory-content');
                
                // Hide all subcategories first
                subcategoryContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                // Find and activate the correct subcategory if possible
                const subcategoryContent = item.element.closest('.subcategory-content');
                if (subcategoryContent) {
                    const subcategoryId = subcategoryContent.id;
                    const targetContent = document.getElementById(subcategoryId);
                    const subcategoryBtn = document.querySelector(`.subcategory-btn[data-target="${subcategoryId}"]`);
                    
                    if (targetContent) {
                        // Update UI for subcategory buttons
                        const subcategoryBtns = document.querySelectorAll('.subcategory-btn');
                        subcategoryBtns.forEach(btn => btn.classList.remove('active'));
                        if (subcategoryBtn) {
                            subcategoryBtn.classList.add('active');
                        }
                        
                        // Display the correct subcategory
                        targetContent.style.display = 'block';
                        targetContent.classList.add('active', 'fadeInAnimation');
                    }
                }
            }
            
            // Short delay to ensure sections are displayed before scrolling
            setTimeout(() => {
                // Scroll to the item with smooth behavior
                item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Highlight the item
                item.element.classList.add('highlight-item');
                setTimeout(() => {
                    item.element.classList.remove('highlight-item');
                }, 2000);
            }, 300);
        }
    }
    
    // Improve click event handling for search results
    function displaySearchResults(results) {
        searchResultsContent.innerHTML = '';
        
        if (results.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
            
            results.forEach(item => {
                const resultElement = document.createElement('div');
                resultElement.className = 'search-result-item';
                
                resultElement.innerHTML = `
                    ${item.imageSrc ? `<img src="${item.imageSrc}" alt="${item.title}" class="search-result-image">` : ''}
                    <div class="search-result-info">
                        <div class="search-result-title">${item.title}</div>
                        <div class="search-result-category">${item.category}${item.subcategory ? ' - ' + item.subcategory : ''}</div>
                        <div class="search-result-price">${item.price}</div>
                    </div>
                `;
                
                // Store the item data on the element for access when clicked
                resultElement.dataset.itemData = JSON.stringify({
                    category: item.category,
                    subcategory: item.subcategory
                });
                
                // Create reference to the DOM element
                const itemElement = item.element;
                
                // Add click handler
                resultElement.addEventListener('click', function() {
                    // First reset search and close overlay
                    resetSearch();
                    
                    // Use a longer timeout to ensure overlay is fully closed
                    setTimeout(() => {
                        // Navigate to the item if it exists in the DOM
                        if (itemElement && document.body.contains(itemElement)) {
                            navigateToMenuItem(item);
                        } else {
                            // If element reference is lost, rebuild the items data and try again
                            const menuItemsData = collectMenuItemsData();
                            const matchingItem = menuItemsData.find(menuItem => 
                                menuItem.title === item.title && 
                                menuItem.category === item.category &&
                                menuItem.subcategory === item.subcategory
                            );
                            
                            if (matchingItem) {
                                navigateToMenuItem(matchingItem);
                            }
                        }
                    }, 300); // Longer delay to ensure overlay is fully closed
                });
                
                searchResultsContent.appendChild(resultElement);
            });
        }
    }
    
    // Search input event handlers
    searchBtn.addEventListener('click', function() {
        const query = searchInput.value;
        
        if (query.length >= 2) {
            // Always get fresh data for each search
            const results = performSearch(query);
            displaySearchResults(results);
            searchResultsOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value;
            
            if (query.length >= 2) {
                // Always get fresh data for each search
                const results = performSearch(query);
                displaySearchResults(results);
                searchResultsOverlay.classList.add('active');
                document.body.classList.add('no-scroll');
            }
        }
    });
    
    // Close search results
    closeSearchResults.addEventListener('click', function() {
        resetSearch();
    });
    
    // Close search results when clicking outside
    searchResultsOverlay.addEventListener('click', function(e) {
        if (e.target === searchResultsOverlay) {
            resetSearch();
        }
    });
    
    // Close search results with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchResultsOverlay.classList.contains('active')) {
            resetSearch();
        }
    });
    
    // Improve click event handling for search results
   

    // Add styles for highlighted items
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            @keyframes highlightPulse {
                0%, 100% {
                    box-shadow: 0 0 0 2px var(--primary-color);
                    transform: scale(1);
                }
                50% {
                    box-shadow: 0 0 20px 2px var(--primary-color);
                    transform: scale(1.03);
                }
            }
            
            .highlight-item {
                animation: highlightPulse 1.5s ease;
                position: relative;
                z-index: 2;
            }
        </style>
    `);
});
// ====== CONFIG ======
const SHEET_URL = window.SHEET_URL || ""; // if Step 2 used a const, keep that value
// If you already pasted a concrete CSV URL earlier, keep it:
//// const SHEET_URL = "PASTE-YOUR-PUBLISHED-CSV-LINK-HERE";

// ====== STATE ======
const state = {
  items: [],
  cart: JSON.parse(localStorage.getItem("cart") || "{}"), // persist across refreshes
};

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const menuEl      = $("#menu");
const searchEl    = $("#search");
const categoriesEl= $("#categories");
const cartBtn     = $("#cartBtn");
const cartPanel   = $("#cartPanel");
const closeCart   = $("#closeCart");
const cartItems   = $("#cartItems");
const subtotalEl  = $("#subtotal");
const checkoutBtn = $("#checkoutBtn");

// ====== DATA LOADING ======
async function loadItems() {
  if (!SHEET_URL) {
    // Fallback demo (if you haven’t wired the sheet yet)
    state.items = [
      { id:"latte", name:"Caffè Latte", price:3.5, img:"https://images.unsplash.com/photo-1504754524776-8f4f37790ca0", category:"Coffee", desc:"Velvety espresso with steamed milk." },
      { id:"americano", name:"Americano", price:2.5, img:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085", category:"Coffee", desc:"Espresso + hot water." },
      { id:"croissant", name:"Butter Croissant", price:2.0, img:"https://images.unsplash.com/photo-1526318472351-c75fcf070305", category:"Bakery", desc:"Flaky, buttery layers." },
      { id:"brownie", name:"Chocolate Brownie", price:2.2, img:"https://images.unsplash.com/photo-1606313564200-e75d5e30476b", category:"Dessert", desc:"Rich cocoa goodness." },
    ];
    return;
  }
  const res  = await fetch(SHEET_URL);
  const text = await res.text();
  const rows = text.split("\n").map(r => r.split(","));
  const headers = rows.shift().map(h => h.trim().toLowerCase());
  state.items = rows
    .filter(r => r.length > 1)
    .map(r => {
      const obj = {};
      headers.forEach((h,i) => obj[h] = (r[i] || "").trim());
      obj.price = parseFloat(obj.price || "0");
      obj.category = obj.category || obj.cat || "";
      obj.img = obj.img || "";
      return obj;
    });
}

// ====== HELPERS ======
const getQty = (id) => state.cart[id] || 0;
function setQty(id, qty) {
  if (qty <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = qty;
  }
  persistCart();
  updateCartBadge();
  drawCart();
}
function addOne(id) { setQty(id, getQty(id) + 1); }
function subOne(id) { setQty(id, getQty(id) - 1); }

function persistCart() {
  localStorage.setItem("cart", JSON.stringify(state.cart));
}

function currency(n) { return "$" + (Number(n)||0).toFixed(2); }

// ====== UI: CATEGORIES ======
function drawCategories() {
  const cats = [...new Set(state.items.map(i => i.category).filter(Boolean))];
  categoriesEl.innerHTML = [`<button data-cat="All">All</button>`]
    .concat(cats.map(c => `<button data-cat="${c}">${c}</button>`))
    .join("");

  categoriesEl.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    const sel = e.target.dataset.cat;
    renderMenu(searchEl.value.trim(), sel === "All" ? "" : sel);
  }, { once: true }); // attach once to avoid duplicates
}

// ====== UI: MENU CARDS (Talabat style) ======
function cardControlsHTML(item) {
  const qty = getQty(item.id);
  if (!qty) {
    // Show "Add to cart" wide button
    return `
      <button class="btn btn-wide" data-add="${item.id}">
        Add to cart
      </button>
    `;
  }
  // Show stepper when item is in cart
  return `
    <div class="stepper">
      <button class="pill" data-sub="${item.id}">−</button>
      <div class="qty">${qty}</div>
      <button class="pill" data-add="${item.id}">+</button>
    </div>
  `;
}

function renderMenu(q = "", cat = "") {
  const term = q.toLowerCase();
  const filtered = state.items.filter(i =>
    (cat ? i.category === cat : true) &&
    (i.name?.toLowerCase().includes(term) || i.desc?.toLowerCase().includes(term))
  );

  if (!filtered.length) {
    menuEl.innerHTML = `<div class="placeholder">No items match your search.</div>`;
    return;
  }

  menuEl.innerHTML = filtered.map(i => `
    <article class="card">
      <img src="${i.img}" alt="${i.name}" loading="lazy">
      <div class="pad">
        <div class="row">
          <strong>${i.name || ""}</strong>
          <span class="price">${currency(i.price)}</span>
        </div>
        <div class="muted">${i.category || ""} • ${i.desc || ""}</div>
        <div class="options">
          ${cardControlsHTML(i)}
          ${getQty(i.id) ? `<span class="badge">${getQty(i.id)}</span>` : ""}
        </div>
      </div>
    </article>
  `).join("");

  // Attach button handlers
  $$("#menu [data-add]").forEach(b => b.addEventListener("click", () => addOne(b.dataset.add)));
  $$("#menu [data-sub]").forEach(b => b.addEventListener("click", () => subOne(b.dataset.sub)));
}

const SELECTOR_CARD = ".card, .menu-card, .product-card";
const SELECTOR_TITLE = "h3, h4, .title, .card-title";
const SELECTOR_PRICE = ".price, .badge, .price-badge"; // optional, best-effort parse

const cart = JSON.parse(localStorage.getItem("cart") || "{}");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function getIdFor(el) {
  // Prefer explicit data-id on the card. If missing, slugify the title text.
  const explicit = el.getAttribute("data-id");
  if (explicit) return explicit;
  const t = (el.querySelector(SELECTOR_TITLE)?.textContent || "item").trim().toLowerCase();
  return t.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function getPriceFor(el) {
  // Try to parse a number from a price element like "4500 IQD" or "$5.00"
  const node = el.querySelector(SELECTOR_PRICE);
  if (!node) return null;
  const raw = node.textContent;
  const m = raw.replace(/,/g, "").match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function currency(n) {
  // Keep simple dollars if you don't use totals; adapt to IQD if you like
  if (n == null) return "";
  return "$" + n.toFixed(2);
}

function qtyOf(id) {
  return cart[id] || 0;
}

function setQty(id, q) {
  if (q <= 0) delete cart[id];
  else cart[id] = q;
  saveCart();
  // Re-render steppers in cards
  document.querySelectorAll(SELECTOR_CARD).forEach(drawControlsIntoCard);
  // Re-draw cart panel if you have one
  if (typeof drawCart === "function") drawCart();
}

function addOne(id) { setQty(id, qtyOf(id) + 1); }
function subOne(id) { setQty(id, qtyOf(id) - 1); }

function controlsHTML(id) {
  const qty = qtyOf(id);
  if (!qty) {
    return `<button class="btn btn-wide" data-add="${id}">Add to cart</button>`;
  }
  return `
    <div class="stepper">
      <button class="pill" data-sub="${id}">−</button>
      <div class="qty">${qty}</div>
      <button class="pill" data-add="${id}">+</button>
    </div>
  `;
}

function drawControlsIntoCard(cardEl) {
  const id = getIdFor(cardEl);

  // Make/locate a container at the bottom of the card for our controls
  let slot = cardEl.querySelector(".options");
  if (!slot) {
    slot = document.createElement("div");
    slot.className = "options";
    // try to put under the last text block; fallback to card end
    (cardEl.querySelector(".pad") || cardEl).appendChild(slot);
  }
  slot.innerHTML = controlsHTML(id);

  // Wire events
  slot.querySelectorAll("[data-add]").forEach(b => {
    b.onclick = () => addOne(b.getAttribute("data-add"));
  });
  slot.querySelectorAll("[data-sub]").forEach(b => {
    b.onclick = () => subOne(b.getAttribute("data-sub"));
  });
}

function updateCartBadge() {
  const totalQty = Object.values(cart).reduce((a,b)=>a+b,0);
  const btn = document.querySelector("#cartBtn");
  if (btn) btn.textContent = `Cart (${totalQty})`;
}

// OPTIONAL: basic cart panel if you already have #cartItems/#subtotal in your HTML
function drawCart() {
  const itemsEl = document.querySelector("#cartItems");
  const subtotalEl = document.querySelector("#subtotal");
  if (!itemsEl) return;

  const cards = Array.from(document.querySelectorAll(SELECTOR_CARD));
  const lines = Object.entries(cart);
  if (!lines.length) {
    itemsEl.innerHTML = `<div class="muted">Your cart is empty.</div>`;
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    return;
  }

  let subtotal = 0;
  itemsEl.innerHTML = lines.map(([id, qty]) => {
    // Find the matching card for price/title if available
    const card = cards.find(el => getIdFor(el) === id);
    const name = card?.querySelector(SELECTOR_TITLE)?.textContent?.trim() || id;
    const price = getPriceFor(card);
    const line = price ? price * qty : 0;
    subtotal += line;
    return `
      <div class="row">
        <div style="flex:1">
          <strong>${name}</strong>
          ${price ? `<div class="muted">${currency(price)} each</div>` : ""}
        </div>
        <div class="stepper">
          <button class="pill" data-sub="${id}">−</button>
          <div class="qty">${qty}</div>
          <button class="pill" data-add="${id}">+</button>
        </div>
        ${price ? `<div style="width:72px; text-align:right">${currency(line)}</div>` : ""}
      </div>
    `;
  }).join("");

  if (subtotalEl) subtotalEl.textContent = currency(subtotal);
