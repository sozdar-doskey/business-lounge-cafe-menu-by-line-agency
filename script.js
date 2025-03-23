document.addEventListener('DOMContentLoaded', function() {
    const categories = document.querySelectorAll('.category');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuHeaders = document.querySelectorAll('.menu-header');
    const backButtons = document.querySelectorAll('.back-to-top');
    const categoriesSection = document.querySelector('.categories');
    const menuContainer = document.querySelector('.menu-container');
    
    // Function to scroll to element
    function scrollToElement(element) {
        window.scrollTo({
            top: element.offsetTop - 20,
            behavior: 'smooth'
        });
    }
    
    // Category click handler
    categories.forEach(category => {
        category.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            
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
    
    // Back to categories button handler
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
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
});