// Menu Mobile
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    let navItems = [];
    
    // Verificar se os elementos existem
    if (menuToggle && navLinks) {
        // Atualizar a lista de itens do menu após o carregamento do DOM
        navItems = document.querySelectorAll('.nav-links a');
        
        // Função para abrir o menu
        function openMenu() {
            menuToggle.setAttribute('aria-expanded', 'true');
            menuToggle.setAttribute('aria-label', 'Fechar menu');
            document.body.style.overflow = 'hidden';
            menuToggle.classList.add('active');
            navLinks.classList.add('active');
            document.documentElement.classList.add('menu-open');
            // Focar no primeiro item do menu quando aberto
            if (navItems.length > 0) {
                navItems[0].focus();
            }
        }
        
        // Função para fechar o menu
        function closeMenu() {
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Abrir menu');
            document.body.style.overflow = '';
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.documentElement.classList.remove('menu-open');
            // Retornar o foco para o botão do menu
            menuToggle.focus();
        }
        
        // Alternar menu mobile
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                closeMenu();
            } else {
                openMenu();
            }
        });
        
        // Fechar menu ao clicar em um item
        navItems.forEach(item => {
            item.addEventListener('click', closeMenu);
            
            // Adicionar gerenciamento de teclado para os itens do menu
            item.addEventListener('keydown', function(e) {
                // Fechar o menu ao pressionar Esc
                if (e.key === 'Escape') {
                    closeMenu();
                }
                
                // Navegação por teclado no menu
                if (e.key === 'Tab') {
                    const currentIndex = Array.from(navItems).indexOf(e.target);
                    
                    // Se estiver no último item e pressionar Tab, voltar para o primeiro
                    if (!e.shiftKey && currentIndex === navItems.length - 1) {
                        e.preventDefault();
                        navItems[0].focus();
                    }
                    // Se estiver no primeiro item e pressionar Shift+Tab, ir para o último
                    else if (e.shiftKey && currentIndex === 0) {
                        e.preventDefault();
                        navItems[navItems.length - 1].focus();
                    }
                }
            });
        });
        
        // Fechar menu ao pressionar Esc
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMenu();
            }
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Prevenir que o clique no menu feche imediatamente
        navLinks.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

// Scroll suave para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Header fixo e mudança de cor no scroll
const header = document.querySelector('.header');
let lastScroll = 0;

// Função para atualizar o menu ativo com base na posição de rolagem
function updateActiveMenu() {
    const scrollPosition = window.scrollY + 100;
    const sections = document.querySelectorAll('section[id]');
    let foundActive = false;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Remover a classe 'active' de todos os links
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
            });
            
            // Adicionar a classe 'active' ao link correspondente
            const activeLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                foundActive = true;
            }
        }
    });
    
    // Se nenhuma seção estiver ativa, manter o link da página atual ativo
    if (!foundActive) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
}

// Atualizar o menu ativo ao carregar a página
document.addEventListener('DOMContentLoaded', updateActiveMenu);

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Adicionar sombra ao header quando rolar a página
    if (currentScroll > 50) {
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        header.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        header.style.boxShadow = 'none';
        header.style.background = 'var(--white)';
    }
    
    // Atualizar o menu ativo
    updateActiveMenu();
    
    lastScroll = currentScroll;
    
    // Esconder/mostrar header ao rolar
    if (currentScroll <= 0) {
        header.style.top = '0';
        return;
    }
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        // Rolar para baixo
        header.style.top = '-100px';
    } else {
        // Rolar para cima
        header.style.top = '0';
    }
    
    lastScroll = currentScroll;
});

// Animar elementos ao rolar a página
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature, .highlight-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Botão Voltar ao Topo
const backToTopButton = document.querySelector('.back-to-top');
if (backToTopButton) {
    // Mostrar/ocultar botão ao rolar a página
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Rolar suavemente para o topo
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        // Focar no cabeçalho para acessibilidade
        const header = document.querySelector('header');
        if (header) {
            header.setAttribute('tabindex', '-1');
            header.focus();
        }
    });
}

// Login Modal
const loginModal = document.getElementById('loginModal');
const loginBtn = document.getElementById('loginBtn');
const closeModal = document.querySelector('.close-modal');
const loginForm = document.getElementById('loginForm');

// Open modal when login button is clicked
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    });
}

// Close modal when X is clicked
if (closeModal) {
    closeModal.addEventListener('click', () => {
        loginModal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    });
}

// Close modal when clicking outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
});

// Handle form submission
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;
        
        // Here you would typically send this data to your server
        console.log('Login attempt with:', { email, remember });
        
        // For demo purposes, just close the modal after a short delay
        setTimeout(() => {
            loginModal.classList.remove('active');
            document.body.style.overflow = ''; // Re-enable scrolling
            alert('Login functionality will be implemented here.');
            loginForm.reset();
        }, 500);
    });
}

// Adicionar estilos iniciais
window.addEventListener('DOMContentLoaded', () => {
    const features = document.querySelectorAll('.feature');
    const highlightCards = document.querySelectorAll('.highlight-card');
    
    features.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(30px)';
        feature.style.transition = `opacity 0.5s ease ${index * 0.2}s, transform 0.5s ease ${index * 0.2}s`;
    });
    
    highlightCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.5s ease ${index * 0.2}s, transform 0.5s ease ${index * 0.2}s`;
    });
    
    // Iniciar animação
    setTimeout(animateOnScroll, 500);
});

// Adicionar evento de scroll para animação
window.addEventListener('scroll', animateOnScroll);

// Carregar mais publicações (exemplo)
const loadMoreBtn = document.querySelector('.load-more');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        // Simular carregamento de mais publicações
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.textContent = 'Carregando...';
        loadMoreBtn.parentNode.replaceChild(loading, loadMoreBtn);
        
        // Simular atraso de carregamento
        setTimeout(() => {
            // Aqui você pode adicionar a lógica para carregar mais publicações
            loading.remove();
            alert('Mais publicações carregadas!');
        }, 1000);
    });
}
