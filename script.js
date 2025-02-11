
document.addEventListener('DOMContentLoaded', () => {
    // Configurazione iniziale
    const imageGrid = document.getElementById('imageGrid');
    const API_KEY = 'IWHotYQchQ1a9NEXG1QAAz5tVOuO86cSRqyJ2bgDC2ZqC0TFFmqe9rUG';
    let currentPage = 1;
    let isLoading = false;
    let currentQuery = '';
    let currentType = 'photos';
    
    // Funzioni per il recupero dei contenuti da API
    async function fetchContent(query = '', page = 1, type = 'photos') {
        let url = type === 'photos' 
            ? query ? `https://api.pexels.com/v1/search?query=${query}&per_page=15&page=${page}`
                   : `https://api.pexels.com/v1/curated?per_page=15&page=${page}`
            : query ? `https://api.pexels.com/videos/search?query=${query}&per_page=15&page=${page}`
                   : `https://api.pexels.com/videos/popular?per_page=15&page=${page}`;
            
        const response = await fetch(url, {
            headers: { 'Authorization': API_KEY }
        });
        const data = await response.json();
        return type === 'photos' ? data.photos : data.videos;
    }

    // Visualizzazione dei contenuti nella griglia
    async function displayContent(query = '', reset = false, type = 'photos') {
        if (reset) {
            imageGrid.innerHTML = '';
            currentPage = 1;
        }
        
        isLoading = true;
        currentQuery = query;
        currentType = type;
        const content = await fetchContent(query, currentPage, type);
        
        content.forEach(item => {
            const card = document.createElement('div');
            card.className = 'image-card';
            
            if (type === 'photos') {
                const img = document.createElement('img');
                img.src = item.src.large;
                img.alt = item.photographer;
                card.appendChild(img);
            } else {
                const video = document.createElement('video');
                video.src = item.video_files[0].link;
                video.poster = item.image;
                video.controls = true;
                card.appendChild(video);
            }

            const info = document.createElement('div');
            info.className = 'image-info';
            info.innerHTML = `
                <div class="photographer">${type === 'photos' ? item.photographer : item.user.name}</div>
                <div class="image-actions">
                    <button class="action-btn download">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <div class="action-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="action-icon">
                        <i class="fas fa-bookmark"></i>
                    </div>
                </div>
            `;
            card.appendChild(info);

            info.querySelector('.image-actions').addEventListener('click', e => {
                e.stopPropagation();
            });

            info.querySelector('.download').addEventListener('click', e => {
                e.preventDefault();
                window.open(type === 'photos' ? item.src.original : item.video_files[0].link, '_blank');
            });
            
            card.addEventListener('click', () => {
                if (type === 'photos') {
                    showPhotoModal(item);
                } else {
                    showVideoModal(item);
                }
            });
            
            imageGrid.appendChild(card);
        });
        
        isLoading = false;
        currentPage++;
    }

    // Gestione del modal per le foto
    function showPhotoModal(photo) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <span class="close-modal">&times;</span>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="photographer-info">
                        <h3>${photo.photographer}</h3>
                        <button class="modal-follow-btn">Segui</button>
                    </div>
                </div>
                <img src="${photo.src.large}" alt="${photo.photographer}" class="modal-media">
                <div class="modal-info">
                    <div class="photographer-info">
                        <div class="photographer-name">${photo.photographer}</div>
                    </div>
                    <div class="modal-actions">
                        <div class="download-container">
                            <button class="modal-button download-button">Download</button>
                            <div class="quality-options">
                                <div class="quality-option" data-url="${photo.src.original}">Original</div>
                                <div class="quality-option" data-url="${photo.src.large}">Large</div>
                                <div class="quality-option" data-url="${photo.src.medium}">Medium</div>
                            </div>
                        </div>
                        <button class="modal-button favorite-button">
                            <i class="fas fa-heart"></i> Add to Favorites
                        </button>
                    </div>
                    <div class="social-share">
                        <div class="social-button"><i class="fab fa-facebook-f"></i></div>
                        <div class="social-button"><i class="fab fa-twitter"></i></div>
                        <div class="social-button"><i class="fab fa-pinterest"></i></div>
                    </div>
                </div>
                <div class="related-content"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
        };
        
        const downloadBtn = modal.querySelector('.download-button');
        const qualityOptions = modal.querySelector('.quality-options');
        downloadBtn.onclick = () => {
            qualityOptions.classList.toggle('show');
        };
        
        qualityOptions.querySelectorAll('.quality-option').forEach(option => {
            option.onclick = () => {
                window.open(option.dataset.url, '_blank');
                qualityOptions.classList.remove('show');
            };
        });
        
        fetchContent(photo.photographer, 1, 'photos').then(photos => {
            const relatedContent = modal.querySelector('.related-content');
            photos.slice(0, 6).forEach(relatedPhoto => {
                const card = document.createElement('div');
                card.className = 'image-card';
                const thumb = document.createElement('img');
                thumb.src = relatedPhoto.src.medium;
                thumb.alt = relatedPhoto.photographer;
                
                const info = document.createElement('div');
                info.className = 'image-info';
                info.innerHTML = `
                    <div class="photographer">${relatedPhoto.photographer}</div>
                    <div class="image-actions">
                        <button class="action-btn download">
                            <i class="fas fa-download"></i> Download
                        </button>
                        <div class="action-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="action-icon">
                            <i class="fas fa-bookmark"></i>
                        </div>
                    </div>
                `;
                
                card.appendChild(thumb);
                card.appendChild(info);
                
                card.onclick = (e) => {
                    if (!e.target.closest('.image-actions')) {
                        e.stopPropagation();
                        modal.remove();
                        showPhotoModal(relatedPhoto);
                    }
                };
                
                info.querySelector('.download').onclick = (e) => {
                    e.stopPropagation();
                    window.open(relatedPhoto.src.original, '_blank');
                };
                
                relatedContent.appendChild(card);
            });
        });
    }

    // Gestione del modal per i video
    function showVideoModal(video) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <span class="close-modal">&times;</span>
            <div class="modal-content">
                <video src="${video.video_files[0].link}" controls class="modal-media" autoplay></video>
                <div class="modal-info">
                    <h3>${video.user.name}</h3>
                    <div class="modal-actions">
                        <button class="modal-button download-button">Download</button>
                        <button class="modal-button favorite-button">
                            <i class="fas fa-heart"></i> Add to Favorites
                        </button>
                    </div>
                    <div class="social-share">
                        <div class="social-button"><i class="fab fa-facebook-f"></i></div>
                        <div class="social-button"><i class="fab fa-twitter"></i></div>
                        <div class="social-button"><i class="fab fa-pinterest"></i></div>
                    </div>
                </div>
                <div class="related-content"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        modal.querySelector('.close-modal').onclick = () => {
            modal.remove();
        };
        
        modal.querySelector('.download-button').onclick = () => {
            window.open(video.video_files[0].link, '_blank');
        };
        
        fetchContent(video.user.name, 1, 'videos').then(videos => {
            const relatedContent = modal.querySelector('.related-content');
            videos.slice(0, 6).forEach(relatedVideo => {
                const thumb = document.createElement('div');
                thumb.style.backgroundImage = `url(${relatedVideo.image})`;
                thumb.style.backgroundSize = 'cover';
                thumb.style.height = '150px';
                relatedContent.appendChild(thumb);
            });
        });
    }

    // Gestione scroll infinito
    function handleScroll() {
        if (isLoading) return;
        
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 800) {
            displayContent(currentQuery, false, currentType);
        }
    }

    // Gestione click sul fotografo
    function handlePhotographerClick(photographer) {
        document.querySelector('.modal').remove();
        displayContent(photographer, true, 'photos');
    }

    window.addEventListener('scroll', handleScroll);
    displayContent();

    // Gestione ricerca
    const searchInputs = document.querySelectorAll('input[type="text"]');
    const contentTypeSelect = document.getElementById('contentType');
    
    function handleSearch(query) {
        const contentType = contentTypeSelect.value;
        displayContent(query, true, contentType);
    }

    searchInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch(input.value);
            }
        });
    });

    document.querySelectorAll('.search-bar-hero button').forEach(button => {
        button.addEventListener('click', () => {
            const input = button.previousElementSibling;
            handleSearch(input.value);
        });
    });
});
