# NEPERG - Núcleo de Pesquisa e Extensão em Ergonomia

![NEPERG Logo](img/logo-neperg.png)

Bem-vindo ao repositório oficial do site do Núcleo de Pesquisa e Extensão em Ergonomia (NEPERG) da UNESP. Este projeto representa uma modernização completa do site, com foco em usabilidade, design responsivo e experiência do usuário aprimorada.

## Visão Geral

O NEPERG é um núcleo de pesquisa dedicado ao estudo da Ergonomia da Atividade, promovendo pesquisas inovadoras e soluções práticas para melhorar as condições de trabalho. Este site foi desenvolvido para refletir a excelência e o profissionalismo do núcleo, fornecendo uma plataforma acessível e informativa para estudantes, pesquisadores e parceiros.

## Recursos Principais

- **Design Responsivo**
  - Layout adaptável para todos os dispositivos (desktop, tablet e mobile)
  - Navegação otimizada para diferentes tamanhos de tela

- **Navegação Intuitiva**
  - Menu principal de fácil acesso
  - Estrutura de informações clara e organizada
  - Links rápidos para seções importantes

- **Páginas Principais**
  - **Início**: Apresentação do NEPERG e destaques
  - **Rede Temática em Extensão**: Informações sobre projetos de extensão
  - **Sobre Nós**: Missão, visão e histórico do núcleo
  - **Nossa Equipe**: Perfis dos pesquisadores e colaboradores
  - **Equipamentos**: Descrição da infraestrutura disponível
  - **Publicações**: Produção científica com filtros avançados
  - **Notícias**: Atualizações e notícias relevantes
  - **Eventos**: Calendário de eventos e destaques
  - **Contato**: Formulário de contato e localização

- **Otimização**
  - Carregamento rápido de páginas
  - Código limpo e bem estruturado
  - Boas práticas de SEO

## Estrutura do Projeto

```
neperg-site/
├── css/
│   ├── style.css               # Estilos principais
│   └── style-backup.css        # Backup dos estilos
├── js/
│   ├── main.js                 # JavaScript principal
│   └── publications.js         # Lógica das publicações
├── eventos/
│   ├── css/                   # Estilos específicos de eventos
│   ├── js/                     # Scripts de eventos
│   └── index.html              # Página de eventos
├── publicacoes/
│   ├── css/                   # Estilos específicos de publicações
│   ├── js/                     # Scripts de publicações
│   └── index.html              # Página de publicações
├── img/                        # Imagens e recursos visuais
├── index.html                   # Página inicial
├── sobre.html                   # Página Sobre Nós
├── equipe.html                  # Página da Equipe
├── equipamentos.html            # Página de Equipamentos
├── noticias.html                # Página de Notícias
├── contato.html                 # Página de Contato
├── rede-tematica.html           # Página da Rede Temática
└── README.md                    # Documentação
```

## Como Executar o Projeto

### Pré-requisitos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Git (opcional, para clonar o repositório)

### Instalação Local

1. Clone o repositório:
   ```bash
   git clone https://github.com/iagosttn/Neperg_site.git
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd Neperg_site
   ```

3. Abra o arquivo `index.html` no seu navegador preferido.

## Tecnologias Utilizadas

- **Frontend**
  - HTML5 semântico
  - CSS3 (Flexbox e Grid Layout)
  - JavaScript Vanilla
  - [Font Awesome](https://fontawesome.com/) - Ícones
  - [Google Fonts](https://fonts.google.com/) - Tipografia

- **Ferramentas**
  - Git - Controle de versão
  - Visual Studio Code - Editor de código

## Personalização

### Cores

As cores principais podem ser alteradas no arquivo `css/style.css`. Procure pelas variáveis CSS no início do arquivo:

```css
:root {
    --primary-color: #0056b3;
    --secondary-color: #003366;
    --accent-color: #ff6b35;
    --light-color: #f8f9fa;
    --dark-color: #343a40;
    --text-color: #333;
    --text-light: #6c757d;
    --white: #ffffff;
}
```

### Conteúdo

- Edite os arquivos HTML para modificar o conteúdo textual
- Atualize as imagens na pasta `img/`
- Ajuste os estilos em `css/style.css`

### Páginas

Cada página principal tem seu próprio arquivo HTML e pode ser personalizada individualmente.

## Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Adicione suas mudanças (`git add .`)
4. Comite suas mudanças (`git commit -m 'Add some AmazingFeature'`)
5. Faça o Push da Branch (`git push origin feature/AmazingFeature`)
6. Abra um Pull Request

## Contato

- **Email**: [contato@neperg.unesp.br](mailto:contato@neperg.unesp.br)
- **Site**: [https://neperg.unesp.br](https://neperg.unesp.br)
- **Localização**: UNESP - Campus de Presidente Prudente

---

Desenvolvido com ❤️ pelo NEPERG - Núcleo de Pesquisa e Extensão em Ergonomia da FCT/UNESP
