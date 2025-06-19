document.addEventListener('DOMContentLoaded', function() {
    // Filtro de busca
    const searchInput = document.querySelector('.search-box input');
    const eventCards = document.querySelectorAll('.event-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            eventCards.forEach(card => {
                const title = card.querySelector('.event-title').textContent.toLowerCase();
                const description = card.querySelector('.event-description').textContent.toLowerCase();
                const location = card.querySelector('.event-location').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || 
                    description.includes(searchTerm) || 
                    location.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Filtros de categoria e data
    const categoryFilter = document.getElementById('category-filter');
    const dateFilter = document.getElementById('date-filter');
    
    function filterEvents() {
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedDate = dateFilter ? dateFilter.value : 'all';
        const currentDate = new Date();
        
        eventCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const eventDate = new Date(card.getAttribute('data-date'));
            
            const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            let dateMatch = true;
            
            if (selectedDate === 'upcoming') {
                dateMatch = eventDate >= currentDate;
            } else if (selectedDate === 'past') {
                dateMatch = eventDate < currentDate;
            }
            
            if (categoryMatch && dateMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    if (categoryFilter) categoryFilter.addEventListener('change', filterEvents);
    if (dateFilter) dateFilter.addEventListener('change', filterEvents);
    
    // Inicialização de tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Animação de carregamento
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.event-card, .filter-group, .search-box');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Adiciona animação inicial
    document.querySelectorAll('.event-card, .filter-group, .search-box').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });
    
    // Dispara a animação no carregamento
    window.addEventListener('load', () => {
        setTimeout(animateOnScroll, 300);
    });
    
    // Dispara a animação no scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Filtro inicial
    if (categoryFilter || dateFilter) {
        filterEvents();
    }
});
