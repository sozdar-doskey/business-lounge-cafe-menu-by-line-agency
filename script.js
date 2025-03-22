document.addEventListener('DOMContentLoaded', function() {
    const categories = document.querySelectorAll('.category');
    const menuSections = document.querySelectorAll('.menu-section');
    const menuHeaders = document.querySelectorAll('.menu-header');
    const backButtons = document.querySelectorAll('.back-to-top');
    const categoriesSection = document.querySelector('.categories');
    
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
            
            // Show selected section and its header
            document.getElementById(sectionId).classList.add('active');
            document.getElementById(sectionId + '-header').style.display = 'block';
            
            // Scroll to menu section
            scrollToElement(document.getElementById(sectionId + '-header'));
        });
    });
    
    // Back to categories button handler
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
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


});