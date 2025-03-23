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
            document.querySelector(`.nav-category[data-category="${sectionId}"]`).classList.add('active');
            
            // Hide all sections and headers
            menuSections.forEach(section => section.classList.remove('active'));
            menuHeaders.forEach(header => header.style.display = 'none');
            
            // Show menu container if it's not already visible
            menuContainer.classList.add('active');
            
            // Minimize the categories
            categoriesSection.classList.add('minimized');
            
            // Show selected section and its header
            document.getElementById(sectionId).classList.add('active');
            document.getElementById(sectionId + '-header').style.display = 'block';
            
            // Scroll to menu section
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
});