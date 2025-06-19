document.addEventListener('DOMContentLoaded', function() {
    // Filtro de busca
    const searchInput = document.querySelector('.search-box input');
    const publicationCards = document.querySelectorAll('.publication-card');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            publicationCards.forEach(card => {
                const title = card.querySelector('.publication-title').textContent.toLowerCase();
                const description = card.querySelector('.publication-description').textContent.toLowerCase();
                const author = card.querySelector('.publication-author').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || 
                    description.includes(searchTerm) || 
                    author.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Filtros de categoria e ano
    const categoryFilter = document.getElementById('category-filter');
    const yearFilter = document.getElementById('year-filter');
    const typeFilter = document.getElementById('type-filter');
    
    function filterPublications() {
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        const selectedYear = yearFilter ? yearFilter.value : 'all';
        const selectedType = typeFilter ? typeFilter.value : 'all';
        
        publicationCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardYear = card.getAttribute('data-year');
            const cardType = card.getAttribute('data-type');
            
            const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            const yearMatch = selectedYear === 'all' || cardYear === selectedYear;
            const typeMatch = selectedType === 'all' || cardType === selectedType;
            
            if (categoryMatch && yearMatch && typeMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    if (categoryFilter) categoryFilter.addEventListener('change', filterPublications);
    if (yearFilter) yearFilter.addEventListener('change', filterPublications);
    if (typeFilter) typeFilter.addEventListener('change', filterPublications);
    
    // Inicialização de tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Animação de carregamento
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.publication-card, .filter-group, .search-box');
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
    document.querySelectorAll('.publication-card, .filter-group, .search-box').forEach(el => {
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
});
