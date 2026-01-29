// Funcionalidades do site Teacher Samira Nunes

document.addEventListener('DOMContentLoaded', function() {
    // Menu mobile toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const hasSubmenu = document.querySelector('.has-submenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Toggle submenu on mobile
    if (hasSubmenu) {
        const submenuLink = hasSubmenu.querySelector('a');
        submenuLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                hasSubmenu.classList.toggle('active');
            }
        });
    }
    
    // Smooth scrolling para links internos
    const navLinks = document.querySelectorAll('a[href^="#"], a[href*="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Se for um link para outra página com hash (ex: aulas-vip.html#dor)
            if (href.includes('.html#')) {
                return; // Deixa o navegador lidar com a navegação entre páginas
            }

            if (href.startsWith('#')) {
                e.preventDefault();
                
                const targetId = href;
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Fechar menu mobile após clique
                    if (navMenu.classList.contains('active')) {
                        hamburger.classList.remove('active');
                        navMenu.classList.remove('active');
                        if (hasSubmenu) hasSubmenu.classList.remove('active');
                    }
                }
            }
        });
    });
    
    // Animação de entrada das seções
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar todas as seções
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        observer.observe(section);
    });
    
    // Destacar link ativo na navegação
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remover classe active de todos os links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Adicionar classe active ao link correspondente
                const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    });
    
    // Efeito parallax suave no hero - removido para evitar sobreposição
    /*
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        
        if (hero && scrolled < hero.offsetHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
    */
    
    // Animação dos cards de bônus
    const bonusItems = document.querySelectorAll('.bonus-item');
    
    bonusItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Animação dos cards de produtos
    const produtoCards = document.querySelectorAll('.produto-card');
    
    const observerProdutos = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, { threshold: 0.1 });

    produtoCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observerProdutos.observe(card);
    });

    // Interações da Seção de Dor removidas conforme solicitação
    /*
    const painCheckboxes = document.querySelectorAll('.pain-checkbox');
    
    painCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updatePainChecklist();
        });
    });

    function updatePainChecklist() {
        const checkedBoxes = document.querySelectorAll('.pain-checkbox:checked');
        const painExplanation = document.querySelector('.pain-explanation');
        
        if (checkedBoxes.length > 0) {
            painExplanation.style.opacity = '1';
            painExplanation.style.transform = 'translateY(0)';
            
            // Adicionar efeito visual baseado no número de checkboxes marcados
            if (checkedBoxes.length >= 3) {
                painExplanation.style.backgroundColor = 'rgba(210, 180, 140, 0.1)';
                painExplanation.style.borderLeftColor = '#D2B48C';
            }
        } else {
            painExplanation.style.opacity = '0.7';
            painExplanation.style.transform = 'translateY(10px)';
            painExplanation.style.backgroundColor = 'var(--primary-gray)';
            painExplanation.style.borderLeftColor = 'var(--secondary-red)';
        }
    }
    */

    // Animação do plano em destaque
    const planCards = document.querySelectorAll('.plan-card');
    
    planCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
    });

    // Efeito de contador para a seção de autoridade
    const authorityElement = document.querySelector('.hero-conversion .authority');
    if (authorityElement) {
        const observerAuthority = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 1s ease-out';
                }
            });
        }, { threshold: 0.5 });
        
        observerAuthority.observe(authorityElement);
    }

    // Adicionar animação CSS para fadeInUp
    const fadeInUpStyles = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    const fadeInStyleSheet = document.createElement('style');
    fadeInStyleSheet.textContent = fadeInUpStyles;
    document.head.appendChild(fadeInStyleSheet);

    // Contador animado (se necessário no futuro)
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            element.textContent = Math.floor(start);
            
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    }
    
    // Validação de formulário (para futuras implementações)
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }
    
    // Lazy loading para imagens
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Botão de voltar ao topo
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--secondary-red);
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(backToTopButton);
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });
    
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Loader do Google Forms
    const googleFormIframe = document.getElementById('google-form');
    const iframeLoader = document.querySelector('.iframe-loader');

    if (googleFormIframe && iframeLoader) {
        const showIframe = () => {
            iframeLoader.style.display = 'none';
            googleFormIframe.style.opacity = '1';
        };

        googleFormIframe.addEventListener('load', showIframe);
        
        // Fallback: mostrar o iframe após 3 segundos se não carregar
        setTimeout(showIframe, 3000);
    }
});