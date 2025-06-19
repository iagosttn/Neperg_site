// Sample publication data - In a real application, this would come from an API
const publications = [
    {
        id: 1,
        title: "Análise Ergonômica do Trabalho em Linhas de Produção",
        authors: "Silva, J. A.; Oliveira, M. B.; Santos, R. C.",
        abstract: "Estudo sobre a aplicação de princípios ergonômicos em ambientes industriais visando a melhoria das condições de trabalho e aumento da produtividade.",
        year: 2023,
        type: "artigo",
        typeLabel: "Artigo Científico",
        journal: "Revista Brasileira de Ergonomia",
        volume: "12",
        issue: "3",
        pages: "45-62",
        doi: "10.1234/rbe.2023.123456",
        pdfUrl: "#",
        image: "../img/publications/ergonomia-industrial.jpg"
    },
    {
        id: 2,
        title: "Ergonomia e Saúde Ocupacional: Teoria e Prática",
        authors: "Pereira, A. M. (Org.)",
        abstract: "Compilação de estudos e práticas em ergonomia aplicada à saúde ocupacional, com casos reais e soluções inovadoras.",
        year: 2022,
        type: "livro",
        typeLabel: "Livro",
        publisher: "Editora Atlas",
        isbn: "978-85-224-1234-5",
        pages: "320",
        pdfUrl: "#",
        image: "../img/publications/saude-ocupacional.jpg"
    },
    {
        id: 3,
        title: "Métodos de Análise Ergonômica Aplicados ao Setor de Serviços",
        authors: "Oliveira, M. B.; Costa, L. M.",
        abstract: "Capítulo que aborda metodologias inovadoras de análise ergonômica adaptadas ao setor de serviços.",
        year: 2023,
        type: "capitulo",
        typeLabel: "Capítulo de Livro",
        bookTitle: "Ergonomia Aplicada: Casos e Soluções",
        publisher: "Editora Saraiva",
        pages: "123-145",
        isbn: "978-85-02-12345-6",
        pdfUrl: "#",
        image: "../img/publications/setor-servicos.jpg"
    },
    {
        id: 4,
        title: "Inovação em Projetos Ergonômicos: Uma Abordagem Sistêmica",
        authors: "Almeida, C. R.",
        abstract: "Pesquisa que propõe um novo modelo de gestão de projetos ergonômicos baseado em abordagem sistêmica.",
        year: 2021,
        type: "tese",
        typeLabel: "Tese de Doutorado",
        university: "Universidade Federal de São Paulo",
        advisor: "Prof. Dr. Carlos Eduardo Menezes",
        pages: "245",
        pdfUrl: "#",
        image: "../img/publications/inovacao-ergonomica.jpg"
    },
    {
        id: 5,
        title: "Avaliação Postural em Trabalhadores de Escritório",
        authors: "Rodrigues, P. M.",
        abstract: "Análise das posturas adotadas por trabalhadores de escritório e suas implicações na saúde musculoesquelética.",
        year: 2022,
        type: "dissertacao",
        typeLabel: "Dissertação de Mestrado",
        university: "Pontifícia Universidade Católica de São Paulo",
        advisor: "Prof. Dra. Ana Lúcia de Sá",
        pages: "180",
        pdfUrl: "#",
        image: "../img/publications/avaliacao-postural.jpg"
    },
    {
        id: 6,
        title: "Impacto da Ergonomia Cognitiva na Produtividade",
        authors: "Fernandes, L. S.; Lima, R. T.",
        abstract: "Estudo sobre como a ergonomia cognitiva pode influenciar positivamente a produtividade em ambientes corporativos.",
        year: 2023,
        type: "artigo",
        typeLabel: "Artigo Científico",
        journal: "Revista de Administração Contemporânea",
        volume: "27",
        issue: "2",
        pages: "e210123",
        doi: "10.1590/1982-7849rac2023210123",
        pdfUrl: "#",
        image: "../img/publications/ergonomia-cognitiva.jpg"
    },
    {
        id: 7,
        title: "Análise Biomecânica de Movimentos Repetitivos",
        authors: "Martins, F. G.; Souza, A. P.; Lima, C. D.",
        abstract: "Estudo sobre os efeitos de movimentos repetitivos na saúde dos trabalhadores e estratégias de prevenção.",
        year: 2022,
        type: "artigo",
        typeLabel: "Artigo Científico",
        journal: "Revista Brasileira de Saúde Ocupacional",
        volume: "47",
        issue: "1",
        pages: "e12",
        doi: "10.1590/2317-6369/010000000000000012",
        pdfUrl: "#",
        image: "../img/publications/biomecanica.jpg"
    },
    {
        id: 8,
        title: "Ergonomia Aplicada ao Design de Produtos",
        authors: "Gomes, R. T.; Alves, M. P.",
        abstract: "Abordagem sobre a aplicação de princípios ergonômicos no desenvolvimento de produtos mais acessíveis e funcionais.",
        year: 2021,
        type: "livro",
        typeLabel: "Livro",
        publisher: "Editora Blucher",
        isbn: "978-85-212-0789-3",
        pages: "280",
        pdfUrl: "#",
        image: "../img/publications/design-produtos.jpg"
    }
];

// DOM Elements
const publicationGrid = document.getElementById('publicationGrid');
const searchInput = document.getElementById('searchInput');
const yearFilter = document.getElementById('yearFilter');
const typeFilter = document.getElementById('typeFilter');
const sortBy = document.getElementById('sortBy');
const publicationModal = document.getElementById('publicationModal');
const publicationDetails = document.getElementById('publicationDetails');
const closeModal = document.querySelector('.close-modal');

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Choices.js for multiple select
    if (yearFilter) {
        new Choices(yearFilter, {
            removeItemButton: true,
            searchEnabled: false,
            itemSelectText: '',
            placeholder: true,
            placeholderValue: 'Selecione os anos'
        });
    }

    // Load initial publications
    displayPublications(publications);
    
    // Add event listeners
    if (searchInput) searchInput.addEventListener('input', filterPublications);
    if (typeFilter) typeFilter.addEventListener('change', filterPublications);
    if (yearFilter) yearFilter.addEventListener('change', filterPublications);
    if (sortBy) sortBy.addEventListener('change', filterPublications);
    if (closeModal) closeModal.addEventListener('click', () => publicationModal.style.display = 'none');
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === publicationModal) {
            publicationModal.style.display = 'none';
        }
    });
});

// Display publications in the grid
function displayPublications(publicationsToShow) {
    if (!publicationGrid) return;
    
    if (publicationsToShow.length === 0) {
        publicationGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>Nenhuma publicação encontrada</h3>
                <p>Tente ajustar os filtros de pesquisa</p>
            </div>
        `;
        return;
    }
    
    publicationGrid.innerHTML = publicationsToShow.map(pub => `
        <div class="publication-item" data-id="${pub.id}">
            <div class="publication-image">
                <img src="${pub.image}" alt="${pub.title}" onerror="this.src='../img/placeholder-publication.jpg'">
            </div>
            <div class="publication-content">
                <span class="publication-type">${pub.typeLabel}</span>
                <h3 class="publication-title">${pub.title}</h3>
                <p class="publication-authors">${pub.authors}</p>
                <div class="publication-meta">
                    <span class="publication-year">${pub.year}</span>
                    <div class="publication-actions">
                        <button class="btn-doi" data-doi="${pub.doi || ''}" ${!pub.doi ? 'disabled' : ''}>
                            <i class="fas fa-link"></i> DOI
                        </button>
                        <button class="btn-download" data-pdf="${pub.pdfUrl}" ${!pub.pdfUrl ? 'disabled' : ''}>
                            <i class="fas fa-download"></i> PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add click event to publication items
    document.querySelectorAll('.publication-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking on buttons inside the card
            if (e.target.closest('.btn-download, .btn-doi')) {
                e.stopPropagation();
                return;
            }
            
            const pubId = parseInt(item.getAttribute('data-id'));
            const publication = publications.find(p => p.id === pubId);
            if (publication) {
                showPublicationDetails(publication);
            }
        });
    });
    
    // Add click events to DOI and Download buttons
    document.querySelectorAll('.btn-doi').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const doi = btn.getAttribute('data-doi');
            if (doi) {
                window.open(`https://doi.org/${doi}`, '_blank');
            }
        });
    });
    
    document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const pdfUrl = btn.getAttribute('data-pdf');
            if (pdfUrl) {
                window.open(pdfUrl, '_blank');
            }
        });
    });
}

// Filter publications based on search and filters
function filterPublications() {
    let filtered = [...publications];
    
    // Filter by search term
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(pub => 
            pub.title.toLowerCase().includes(searchTerm) || 
            pub.authors.toLowerCase().includes(searchTerm) ||
            pub.abstract.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by type
    const selectedType = typeFilter.value;
    if (selectedType !== 'all') {
        filtered = filtered.filter(pub => pub.type === selectedType);
    }
    
    // Filter by year (multiple selection)
    const selectedYears = Array.from(yearFilter.selectedOptions).map(opt => parseInt(opt.value));
    if (selectedYears.length > 0) {
        filtered = filtered.filter(pub => selectedYears.includes(pub.year));
    }
    
    // Sort results
    const sortValue = sortBy.value;
    filtered.sort((a, b) => {
        switch (sortValue) {
            case 'recent':
                return b.year - a.year;
            case 'oldest':
                return a.year - b.year;
            case 'title-asc':
                return a.title.localeCompare(b.title);
            case 'title-desc':
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });
    
    displayPublications(filtered);
}

// Show publication details in modal
function showPublicationDetails(publication) {
    if (!publicationModal || !publicationDetails) return;
    
    // Generate publication details HTML
    let detailsHTML = `
        <div class="publication-detail">
            <div class="publication-header">
                <span class="publication-type">${publication.typeLabel}</span>
                <h2>${publication.title}</h2>
                <p class="publication-authors">${publication.authors}</p>
                <div class="publication-meta">
                    <span class="publication-year">${publication.year}</span>
                </div>
            </div>
            
            <div class="publication-body">
                <div class="publication-image">
                    <img src="${publication.image}" alt="${publication.title}" onerror="this.src='../img/placeholder-publication.jpg'">
                </div>
                
                <div class="publication-info">
                    <h3>Resumo</h3>
                    <p>${publication.abstract}</p>
                    
                    <div class="publication-details">
                        ${publication.journal ? `
                            <div class="detail-row">
                                <span class="detail-label">Periódico:</span>
                                <span class="detail-value">${publication.journal}</span>
                            </div>
                        ` : ''}
                        
                        ${publication.volume ? `
                            <div class="detail-row">
                                <span class="detail-label">Volume:</span>
                                <span class="detail-value">${publication.volume}${publication.issue ? `(${publication.issue})` : ''}</span>
                            </div>
                        ` : ''}
                        
                        ${publication.pages ? `
                            <div class="detail-row">
                                <span class="detail-label">Páginas:</span>
                                <span class="detail-value">${publication.pages}</span>
                            </div>
                        ` : ''}
                        
                        ${publication.doi ? `
                            <div class="detail-row">
                                <span class="detail-label">DOI:</span>
                                <a href="https://doi.org/${publication.doi}" target="_blank" class="detail-value">${publication.doi}</a>
                            </div>
                        ` : ''}
                        
                        ${publication.publisher ? `
                            <div class="detail-row">
                                <span class="detail-label">Editora:</span>
                                <span class="detail-value">${publication.publisher}</span>
                            </div>
                        ` : ''}
                        
                        ${publication.isbn ? `
                            <div class="detail-row">
                                <span class="detail-label">ISBN:</span>
                                <span class="detail-value">${publication.isbn}</span>
                            </div>
                        ` : ''}
                        
                        ${publication.university ? `
                            <div class="detail-row">
                                <span class="detail-label">${publication.type === 'tese' ? 'Universidade:' : 'Instituição:'}</span>
                                <span class="detail-value">${publication.university}</span>
                            </div>
                        ` : ''}
                        
                        ${publication.advisor ? `
                            <div class="detail-row">
                                <span class="detail-label">Orientador:</span>
                                <span class="detail-value">${publication.advisor}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="publication-actions">
                        ${publication.pdfUrl ? `
                            <a href="${publication.pdfUrl}" class="btn-download" target="_blank">
                                <i class="fas fa-download"></i> Baixar PDF
                            </a>
                        ` : ''}
                        
                        ${publication.doi ? `
                            <a href="https://doi.org/${publication.doi}" class="btn-doi" target="_blank">
                                <i class="fas fa-external-link-alt"></i> Ver publicação
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    publicationDetails.innerHTML = detailsHTML;
    publicationModal.style.display = 'block';
    
    // Scroll to top of modal
    publicationModal.scrollTo(0, 0);
}
