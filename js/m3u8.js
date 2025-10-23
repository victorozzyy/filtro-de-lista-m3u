document.addEventListener("DOMContentLoaded", () => {
    
    // Helper: trata tecla OK/Enter de controles remotos (Tizen, WebOS, etc.)
    function isOKKey(e) {
        return e && (
            e.key === "Enter" ||
            e.key === "NumpadEnter" ||
            e.key === "OK" ||
            e.key === "Select" ||
            e.keyCode === 13 ||
            e.which === 13 ||
            e.keyCode === 65376
        );
    }
    
    const video = document.getElementById("player");
    const channelList = document.getElementById("channelList");
    const playlistSelector = document.getElementById("playlistSelector");
    const playlistList = document.getElementById("playlistList");
    const remotePlaylistSelector = document.getElementById("remotePlaylistSelector");
    const remotePlaylistList = document.getElementById("remotePlaylistList");
    const messageArea = document.getElementById("messageArea");
    
    let lastPlayedChannelIndex = -1;
    let playlistUrls = [];
    let channelItems = [];
    let playlistItems = [];
    let remotePlaylistItems = [];
    let currentFocusIndex = -1;
    let playlistFocusIndex = -1;
    let remoteFocusIndex = -1;
    let focusIndex = 0;
    let currentView = 'buttons';
    let overlayChannels = [];
    let overlayFocusIndex = 0;
    let restoringState = false;
    let hls = null; // Instância HLS.js
    let currentChannelIndex = -1;

    // Lista de playlists remotas
    const remotePlaylistsConfig = [
      {
        name: "🏆 Esportes 1",
        description: "Canais esportivos em alta definição",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/esportes.m3u8",
        category: "Esportes"
      },{
        name: "🏆 Esportes 2",
        description: "Canais esportivos em alta definição",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_esportes.m3u",
        category: "Esportes"
      },{
        name: "🎬 Canais 24 Hs",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_24h.m3u",
        category: "Filmes e Series"
      },
      {
        name: "🎬 Canais",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/canais24h.m3u8",
        category: "Filmes"
      },
      {
        name: "🎬 Filmes1 ",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_mp4_part1.m3u",
        category: "Mp4"
      },
      {
        name: "🎬 Series1 ",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/seriesmp4.m3u8",
        category: "Mp4"
      },
      {
        name: "🎬 Filmes e Series",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/filmes-series.m3u8",
        category: "Mp4"
      },{
        name: "🎬 Filmes e Series2",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_filmes_series.m3u",
        category: "Filmes e Series"
      },
      {
        name: "🎬 Series2 mp4",
        description: "Big sequencia, series boas.",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists2/series2-mp4.m3u8",
        category: "Mp4"
      },{
        name: "🎬 Series3 mp4",
        description: "Rancho, Dexter, Suits, Justfield",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists2/series3-mp4.m3u8",
        category: "Mp4"
      },{
        name: "🎬 Filmes2 mp4",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists2/filmes2-mp4.m3u8",
        category: "Mp4"
      },{
        name: "🎬 Canais2 mp4",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/canais2.m3u8",
        category: "Mp4"
      },
      {
        name: "🎬 Mp4 1",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_mp4_part1.m3u",
        category: "Mp4"
      },{
        name: "🎬 Mp4 2",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_mp4_part2.m3u",
        category: "Mp4"
      },
      {
        name: "🎬 Mp4 3",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_mp4_part3.m3u",
        category: "Filmes"
      },
      {
        name: "🎬 Mp4 4",
        description: "Canais variados de alta qualidade",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_mp4_part4.m3u",
        category: "Filmes"
      },
      {
        name: "🎭 Educativo",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/educativo.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 Aqueles",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/aqules.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 Educativo3",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/new.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 teste",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/teste.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 Funcional00",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/teste2.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 Funcional Mp4",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/putria2.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 Funcional4 Mp4",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/putria3.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 Funcional Pov Mp4",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/putria4.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 Funcional3 Mp4",
        description: "Canais de séries, filmes e shows",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/putria.m3u8",
        category: "Pt"
      },
      {
        name: "🎭 NovoPono Instavel",
        description: "Conteúdo seguro para crianças",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists2/novopono.m3u8",
        category: "Pt"
      },
      {
        name: "👶 Desenhos",
        description: "Conteúdo seguro para crianças",
        url: "https://raw.githubusercontent.com/victorozzyy/m3uplayer-web/refs/heads/main/playlists/playlist_desenhos.m3u",
        category: "Infantil"
      }
    ];

    // Lista de playlists locais
    const availablePlaylists = [
      { name: "24 Hs", filename: "playlist_24h.m3u" },
      { name: "TV Misto", filename: "tvmisto.m3u8" },
      { name: "Filmes e Series", filename: "filmes-series.m3u8" },
      { name: "Filmes mp4 ", filename: "filmes.m3u8" },
      { name: "Esportes", filename: "esportes.m3u8" },
      { name: "Variedades", filename: "variedades.m3u8" },
      { name: "Educativo", filename: "teste.m3u8" },
      { name: "EducativoT", filename: "teste2.m3u8" },
      { name: "Top", filename: "new.m3u8" },
      { name: "Novo", filename: "novopono.m3u8" }
    ];

    const minhasListasConfig = [
      {
        name: "🔥 Minha Lista Principal",
        description: "Lista 01",
        url: "http://felas87dz.icu/get.php?username=Anonymous100&password=Hacker100&type=m3u_plus"
      },
      {
        name: "🔥 Minha 02",
        description: "Lista 02",
        url: "http://felas87dz.icu/get.php?username=ednamaria&password=366242934&type=m3u_plus"
      },
      {
        name: "🔥 Minha 03",
        description: "Lista 03",
        url: "http://felas87dz.icu/get.php?username=Diego01&password=9518484&type=m3u_plus"
      },
      {
        name: "🔥 Minha Lista 04",
        description: "Lista 04",
        url: "http://felas87dz.icu/get.php?username=854191413&password=383942274&type=m3u_plus"
      }
    ];

    // Cache para melhor performance
    const cache = {
        playlists: new Map(),
        lastAccessed: new Map()
    };

    // Debounce para navegação mais fluida
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Tratamento de erros mais robusto
    function handleError(error, context = 'Operação') {
        console.error(`[${context}] Erro:`, error);
        const userMessage = error.message || 'Erro desconhecido';
        showMessage(`❌ ${context}: ${userMessage}`, 'error');
    }

    // Validação de URL mais rigorosa
    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    // Função para debug do foco
    function debugFocus(context) {
        if (console.debug) {
            console.debug(`[${context}]`, {
                lastPlayedChannelIndex,
                currentFocusIndex,
                channelItemsLength: channelItems.length,
                currentView,
                activeElement: document.activeElement?.textContent?.substring(0, 50)
            });
        }
    }

    // ===== NOVO: SISTEMA DE PLAYER OVERLAY NATIVO =====
    
    function createPlayerOverlay() {
        let overlay = document.getElementById("nativePlayerOverlay");
        if (overlay) return overlay;
        
        overlay = document.createElement("div");
        overlay.id = "nativePlayerOverlay";
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            z-index: 10000;
            flex-direction: column;
        `;
        
        // Container do topo com info e controles
        const topBar = document.createElement("div");
        topBar.id = "playerTopBar";
        topBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
            padding: 20px;
            z-index: 10001;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const channelInfo = document.createElement("div");
        channelInfo.id = "playerChannelInfo";
        channelInfo.style.cssText = `
            color: #fff;
            font-size: 1.5em;
            font-weight: bold;
        `;
        
        const closeBtn = document.createElement("button");
        closeBtn.id = "playerCloseBtn";
        closeBtn.textContent = "✕ Fechar";
        closeBtn.style.cssText = `
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        `;
        closeBtn.onclick = closePlayerOverlay;
        
        topBar.appendChild(channelInfo);
        topBar.appendChild(closeBtn);
        
        // Vídeo player nativo
        const videoPlayer = document.createElement("video");
        videoPlayer.id = "nativeVideoPlayer";
        videoPlayer.controls = true;
        videoPlayer.autoplay = true;
        videoPlayer.style.cssText = `
            width: 100%;
            height: 100%;
            background: #000;
        `;
        
        // Botões de navegação (próximo canal)
        const bottomBar = document.createElement("div");
        bottomBar.id = "playerBottomBar";
        bottomBar.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: center;
            gap: 20px;
            padding: 20px;
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
            z-index: 10001;
        `;
        
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "⏮ Anterior";
        prevBtn.className = "player-nav-btn";
        prevBtn.style.cssText = `
            background: #333;
            color: white;
            border: 2px solid #666;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
        `;
        prevBtn.onclick = () => playPreviousChannel();
        
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "⏭ Próximo";
        nextBtn.className = "player-nav-btn";
        nextBtn.style.cssText = `
            background: #333;
            color: white;
            border: 2px solid #666;
            padding: 15px 30px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
        `;
        nextBtn.onclick = () => playNextChannel();
        
        bottomBar.appendChild(prevBtn);
        bottomBar.appendChild(nextBtn);
        
        overlay.appendChild(topBar);
        overlay.appendChild(videoPlayer);
        overlay.appendChild(bottomBar);
        document.body.appendChild(overlay);
        
        // Eventos de teclado no overlay
        overlay.addEventListener("keydown", handlePlayerKeydown);
        
        // Auto-avançar no fim do vídeo
        videoPlayer.addEventListener("ended", () => {
            console.log("🔄 Vídeo terminou, avançando para o próximo canal...");
            playNextChannel();
        });
        
        return overlay;
    }
    
    function handlePlayerKeydown(e) {
        console.log("Tecla no player:", e.key);
        
        if (e.key === "Escape" || e.key === "Backspace" || e.keyCode === 10009) {
            e.preventDefault();
            closePlayerOverlay();
        } else if (e.key === "ArrowRight" || e.keyCode === 39) {
            e.preventDefault();
            playNextChannel();
        } else if (e.key === "ArrowLeft" || e.keyCode === 37) {
            e.preventDefault();
            playPreviousChannel();
        } else if (isOKKey(e)) {
            // OK no player pode pausar/play
            const videoEl = document.getElementById("nativeVideoPlayer");
            if (videoEl) {
                if (videoEl.paused) {
                    videoEl.play();
                } else {
                    videoEl.pause();
                }
            }
        }
    }
    
    function openChannelInPlayer(url, name, channelIndex = -1) {
        try {
            if (!isValidUrl(url)) {
                throw new Error('URL do canal inválida');
            }

            console.log(`🎯 Abrindo canal no overlay: ${name}`, { url, channelIndex });
            
            const overlay = createPlayerOverlay();
            const videoEl = document.getElementById("nativeVideoPlayer");
            const infoEl = document.getElementById("playerChannelInfo");
            
            // Atualiza informações
            currentChannelIndex = channelIndex;
            lastPlayedChannelIndex = channelIndex;
            infoEl.textContent = `📺 ${name}`;
            
            // Limpa HLS anterior
            if (hls) {
                hls.destroy();
                hls = null;
            }
            
            // Detecta tipo de stream
            const isM3U8 = url.toLowerCase().includes('.m3u8');
            const isMP4 = url.toLowerCase().endsWith('.mp4');
            
            if (isM3U8 && typeof Hls !== 'undefined' && Hls.isSupported()) {
                // Usar HLS.js para streams m3u8
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                
                hls.loadSource(url);
                hls.attachMedia(videoEl);
                
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log("✅ Stream HLS carregado");
                    videoEl.play().catch(err => {
                        console.warn("Erro ao iniciar reprodução:", err);
                    });
                });
                
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error("Erro HLS:", data);
                    if (data.fatal) {
                        handleError(new Error(data.type), 'Reprodução HLS');
                    }
                });
            } else if (videoEl.canPlayType('application/vnd.apple.mpegurl') || isMP4) {
                // Suporte nativo (Safari, Smart TVs)
                videoEl.src = url;
                videoEl.play().catch(err => {
                    console.warn("Erro ao iniciar reprodução nativa:", err);
                });
            } else {
                throw new Error('Formato de vídeo não suportado');
            }
            
            // Mostra overlay
            overlay.style.display = "flex";
            currentView = 'player';
            
            // Focar no overlay para capturar teclas
            overlay.focus();
            overlay.tabIndex = 0;
            
            showMessage(`▶️ Reproduzindo: ${name}`, 'success');
            
        } catch (error) {
            handleError(error, 'Abertura do canal');
        }
    }
    
    function closePlayerOverlay() {
        const overlay = document.getElementById("nativePlayerOverlay");
        const videoEl = document.getElementById("nativeVideoPlayer");
        
        if (videoEl) {
            videoEl.pause();
            videoEl.src = "";
        }
        
        if (hls) {
            hls.destroy();
            hls = null;
        }
        
        if (overlay) {
            overlay.style.display = "none";
        }
        
        currentView = 'channels';
        
        // Retorna foco para lista de canais
        setTimeout(() => {
            if (lastPlayedChannelIndex >= 0) {
                focusLastPlayedChannel();
            } else {
                focusChannel();
            }
        }, 100);
        
        console.log("⏹️ Player fechado");
    }
    
    function playNextChannel() {
        if (currentChannelIndex >= 0 && currentChannelIndex < playlistUrls.length - 1) {
            const nextIndex = currentChannelIndex + 1;
            const nextChannel = playlistUrls[nextIndex];
            openChannelInPlayer(nextChannel.url, nextChannel.name, nextIndex);
        } else {
            showMessage("🚫 Último canal da lista", 'info');
        }
    }
    
    function playPreviousChannel() {
        if (currentChannelIndex > 0) {
            const prevIndex = currentChannelIndex - 1;
            const prevChannel = playlistUrls[prevIndex];
            openChannelInPlayer(prevChannel.url, prevChannel.name, prevIndex);
        } else {
            showMessage("🚫 Primeiro canal da lista", 'info');
        }
    }
    
    function focusLastPlayedChannel() {
        if (lastPlayedChannelIndex >= 0 && playlistUrls[lastPlayedChannelIndex]) {
            const lastChannel = playlistUrls[lastPlayedChannelIndex];
            const group = lastChannel.group;
            const channelsInGroup = playlistUrls.filter(c => c.group === group);
            showCategoryOverlay(group, channelsInGroup);
            
            requestAnimationFrame(() => {
                const targetChannelElement = overlayChannels.find(
                    el => el.dataset.url === lastChannel.url
                );
                if (targetChannelElement) {
                    setOverlayFocus(overlayChannels.indexOf(targetChannelElement));
                }
            });
        }
    }
    
    // ===== FIM DO SISTEMA DE PLAYER OVERLAY =====

    // Navegação com categorias recolhíveis otimizada
    function getVisibleNavigableItems() {
        const headers = Array.from(document.querySelectorAll(".category-header"));
        
        const visibleChannels = Array.from(document.querySelectorAll("ul.category-sublist"))
            .filter(ul => ul.style.display === "block" || ul.style.display === "")
            .flatMap(ul => Array.from(ul.querySelectorAll(".channel-item")));
        
        const allItems = [...headers, ...visibleChannels];
        
        console.log(`Itens navegáveis: ${allItems.length} (${headers.length} headers, ${visibleChannels.length} canais)`);
        
        return allItems;
    }

    function setFocusElement(el) {
        if (!el) return;
        
        document.querySelectorAll(".focused").forEach(n => n.classList.remove("focused"));
        
        el.classList.add("focused");
        el.focus();
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        channelItems = getVisibleNavigableItems();
        currentFocusIndex = channelItems.indexOf(el);
        
        console.log(`Foco aplicado em: ${el.textContent?.substring(0, 50)} (índice: ${currentFocusIndex})`);
    }

    function toggleCategory(headerEl, subListEl, focusFirstChannel = false) {
        const isOpen = subListEl.style.display === "block";
        
        subListEl.style.display = isOpen ? "none" : "block";
        headerEl.setAttribute("aria-expanded", (!isOpen).toString());

        const label = headerEl.querySelector(".cat-label");
        if (label) {
            const groupName = headerEl.dataset.group;
            label.textContent = (isOpen ? "▶ " : "▼ ") + groupName;
        }

        setTimeout(() => {
            channelItems = getVisibleNavigableItems();
            
            if (!isOpen) {
                if (focusFirstChannel) {
                    const firstChannel = subListEl.querySelector(".channel-item");
                    if (firstChannel) {
                        setFocusElement(firstChannel);
                    } else {
                        setFocusElement(headerEl);
                    }
                } else {
                    setFocusElement(headerEl);
                }
            } else {
                const focusedElement = document.querySelector('.focused');
                if (focusedElement && subListEl.contains(focusedElement)) {
                    setFocusElement(headerEl);
                }
            }
        }, 10);
    }

    // Overlay para mostrar canais por categoria
    function createOverlayElement() {
        let overlay = document.getElementById("channelOverlay");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "channelOverlay";
            overlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 1000;
                overflow-y: auto;
                padding: 20px;
                box-sizing: border-box;
            `;

            const content = document.createElement("div");
            content.id = "overlayContent";
            content.style.cssText = `
                max-width: 800px;
                margin: 0 auto;
                background: #1a1a1a;
                border-radius: 10px;
                padding: 20px;
                border: 2px solid #333;
            `;

            const header = document.createElement("div");
            header.id = "overlayHeader";
            header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #333;
            `;

            const title = document.createElement("h2");
            title.id = "overlayTitle";
            title.style.cssText = "color: #6bff6b; margin: 0; font-size: 1.5em;";

            const closeBtn = document.createElement("button");
            closeBtn.className = "overlay-close";
            closeBtn.tabIndex = 0;
            closeBtn.textContent = "✕ Fechar";
            closeBtn.style.cssText = `
                background: #ff4444;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            `;
            closeBtn.onclick = hideCategoryOverlay;
            closeBtn.onkeydown = (e) => { if (isOKKey(e)) { e.preventDefault(); hideCategoryOverlay(); } };

            const channelGrid = document.createElement("div");
            channelGrid.id = "overlayChannelGrid";
            channelGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 10px;
                max-height: 60vh;
                overflow-y: auto;
            `;

            header.appendChild(title);
            header.appendChild(closeBtn);
            content.appendChild(header);
            content.appendChild(channelGrid);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
        }
        return overlay;
    }

    function showCategoryOverlay(groupName, channels) {
        try {
            const overlay = createOverlayElement();
            const title = document.getElementById("overlayTitle");
            const grid = document.getElementById("overlayChannelGrid");

            title.textContent = `📺 ${groupName} (${channels.length} canais)`;
            
            grid.innerHTML = "";
            overlayChannels = [];

            channels.forEach((channel, index) => {
                const channelDiv = document.createElement("div");
                channelDiv.className = "overlay-channel-item";
                channelDiv.tabIndex = 0;
                channelDiv.dataset.url = channel.url;
                channelDiv.dataset.name = channel.name;
                channelDiv.style.cssText = `
                    background: #2a2a2a;
                    border: 2px solid #444;
                    border-radius: 8px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    color: white;
                `;

                channelDiv.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px; color: #6bff6b;">
                        ${channel.name} ${channel.url && channel.url.toLowerCase().endsWith(".mp4") 
                            ? `<span style="font-size: 0.8em; color: yellow;">(MP4)</span>` 
                            : ""}
                    </div>
                    <div style="font-size: 0.8em; color: #aaa;">
                        Grupo: ${channel.group}
                    </div>
                `;

                channelDiv.onclick = () => {
                    const channelIndex = playlistUrls.findIndex(ch => ch.url === channel.url);
                    openChannelInPlayer(channel.url, channel.name, channelIndex);
                };

                channelDiv.onmouseenter = () => {
                    channelDiv.style.borderColor = "#6bff6b";
                    channelDiv.style.background = "#333";
                };

                channelDiv.onmouseleave = () => {
                    if (!channelDiv.classList.contains("focused")) {
                        channelDiv.style.borderColor = "#444";
                        channelDiv.style.background = "#2a2a2a";
                    }
                };

                grid.appendChild(channelDiv);
                overlayChannels.push(channelDiv);
            });

            overlay.style.display = "block";
            currentView = 'overlay';
            overlayFocusIndex = 0;

            if (overlayChannels.length > 0) {
                setOverlayFocus(0);
            }

            const escHandler = (e) => {
                if (e.key === "Escape") {
                    hideCategoryOverlay();
                    document.removeEventListener("keydown", escHandler);
                }
            };
            document.addEventListener("keydown", escHandler);

            showMessage(`📋 Categoria ${groupName} aberta com ${channels.length} canais`, 'success');

        } catch (error) {
            handleError(error, 'Abertura de categoria');
        }
    }

    function hideCategoryOverlay() {
        const overlay = document.getElementById("channelOverlay");
        if (overlay) {
            overlay.style.display = "none";
        }
        currentView = 'channels';
        overlayChannels = [];
        overlayFocusIndex = 0;
        
        setTimeout(() => {
            const firstHeader = document.querySelector('.category-header');
            if (firstHeader) {
                setFocusElement(firstHeader);
            }
        }, 100);
    }

    function setOverlayFocus(index) {
        if (!overlayChannels.length) return;
        
        overlayChannels.forEach(item => {
            item.classList.remove("focused");
            item.style.borderColor = "#444";
            item.style.background = "#2a2a2a";
        });

        const focusedItem = overlayChannels[index];
        focusedItem.classList.add("focused");
        focusedItem.style.borderColor = "#6bff6b";
        focusedItem.style.background = "#333";
        focusedItem.focus();
        focusedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        overlayFocusIndex = index;
    }

    function moveOverlayFocus(delta) {
        if (!overlayChannels.length) return;
        
        const newIndex = (overlayFocusIndex + delta + overlayChannels.length) % overlayChannels.length;
        setOverlayFocus(newIndex);
    }

    function cachePlaylist(key, data) {
        cache.playlists.set(key, data);
        cache.lastAccessed.set(key, Date.now());
        
        if (cache.playlists.size > 10) {
            const oldest = [...cache.lastAccessed.entries()]
                .sort(([,a], [,b]) => a - b)[0][0];
            cache.playlists.delete(oldest);
            cache.lastAccessed.delete(oldest);
        }
    }

    function getCachedPlaylist(key) {
        if (cache.playlists.has(key)) {
            cache.lastAccessed.set(key, Date.now());
            return cache.playlists.get(key);
        }
        return null;
    }

    function savePlaylistState(playlistData, playlistName, playlistType) {
        try {
            const playlistState = {
                urls: playlistData,
                name: playlistName,
                type: playlistType,
                timestamp: Date.now(),
                version: "1.1"
            };
        } catch (error) {
            handleError(error, 'Salvamento de playlist');
        }
    }

    function showMessage(text, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'error' ? 'error-message' : 
                                type === 'loading' ? 'loading' : 'success-message'}`;
        messageDiv.textContent = text;
        messageDiv.setAttribute('role', 'status');
        messageDiv.setAttribute('aria-live', 'polite');
        
        messageArea.innerHTML = '';
        messageArea.appendChild(messageDiv);
        
        if (type !== 'loading') {
            setTimeout(() => {
                if (messageArea.contains(messageDiv)) {
                    messageArea.removeChild(messageDiv);
                }
            }, 5000);
        }
    }

    function checkReturnFromPlayer() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const returnFromPlayer = urlParams.get('return');
            
            if (returnFromPlayer === 'true') {
                return restorePlaylistState();
            }
        } catch (error) {
            handleError(error, 'Verificação de retorno');
        }
        return false;
    }

    function restorePlaylistState(currentChannelData) {
        try {
            if (!playlistUrls || playlistUrls.length === 0) return false;

            restoringState = true;
            updateChannelList();
            hideAllSelectors();

            if (lastPlayedChannelIndex >= 0 && lastPlayedChannelIndex < playlistUrls.length) {
                focusLastPlayedChannel();
            } else {
                focusChannel();
            }

            showMessage(`✅ Playlist restaurada`, 'success');
            return true;

        } catch (error) {
            handleError(error, 'Restauração de playlist');
            return false;
        } finally {
            restoringState = false;
        }
    }

    function showRemotePlaylistSelector() {
        hideAllSelectors();
        remotePlaylistSelector.style.display = "block";
        updateRemotePlaylistList();
        currentView = 'remote';
        
        setTimeout(() => focusFirstRemotePlaylist(), 100);
    }

    function updateRemotePlaylistList() {
        try {
            const fragment = document.createDocumentFragment();
            
            const allHeader = document.createElement("li");
            allHeader.className = "category-header";
            allHeader.setAttribute("tabindex", "0");
            allHeader.setAttribute("role", "button");
            allHeader.setAttribute("aria-expanded", "false");
            allHeader.dataset.group = "Todos os Canais";
            allHeader.innerHTML = `<strong class="cat-label">📺 Todos os Canais (${playlistUrls.length})</strong>`;
            allHeader.style.cssText = "color: #ffeb3b; padding: 15px 10px; border-bottom: 2px solid #333; cursor: pointer; background: linear-gradient(45deg, #333, #555); border-radius: 5px; margin-bottom: 5px;";
            allHeader.onclick = () => showCategoryOverlay("Todos os Canais", playlistUrls);
            fragment.appendChild(allHeader);
        
            const categories = [...new Set(remotePlaylistsConfig.map(p => p.category))];
            
            categories.forEach(category => {
                const categoryHeader = document.createElement("li");
                categoryHeader.innerHTML = `<strong>📂 ${category}</strong>`;
                categoryHeader.className = "category-header-remote";
                categoryHeader.style.cssText = "color: #6bff6b; padding: 10px 0 5px 0; border-bottom: 1px solid #333;";
                fragment.appendChild(categoryHeader);
                
                const categoryPlaylists = remotePlaylistsConfig.filter(p => p.category === category);
                categoryPlaylists.forEach(playlist => {
                    const li = document.createElement("li");
                    li.className = "remote-playlist-item";
                    li.setAttribute("tabindex", "0");
                    li.dataset.url = playlist.url;
                    li.dataset.name = playlist.name;
                    
                    li.innerHTML = `
                        <div style="margin-bottom: 5px;">
                            <strong>${playlist.name}</strong>
                        </div>
                        <div style="font-size: 0.9em; color: #ccc; margin-left: 10px;">
                            ${playlist.description}
                        </div>
                    `;
                    
                    li.onclick = () => loadRemotePlaylist(playlist.url, playlist.name);
                    fragment.appendChild(li);
                });
            });
            
            remotePlaylistList.innerHTML = "";
            remotePlaylistList.appendChild(fragment);
            
            remotePlaylistItems = Array.from(document.querySelectorAll(".remote-playlist-item"));
            showMessage(`📡 ${remotePlaylistsConfig.length} playlists remotas disponíveis`, 'success');
            
        } catch (error) {
            handleError(error, 'Atualização de playlists remotas');
        }
    }

    async function loadRemotePlaylist(url, name) {
        try {
            if (!isValidUrl(url)) {
                throw new Error('URL da playlist inválida');
            }

            const cached = getCachedPlaylist(url);
            if (cached) {
                console.log('📦 Usando playlist em cache:', name);
                playlistUrls = cached;
                playlistUrls.forEach((c, i) => c.tempId = i);
                savePlaylistState(playlistUrls, name, 'remote');
                updateChannelList();
                hideAllSelectors();
                focusChannel();
                showMessage(`✅ ${name} carregada do cache com ${playlistUrls.length} canais`, 'success');
                return;
            }

            showMessage(`📄 Carregando ${name}...`, 'loading');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const response = await fetch(url, { 
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Falha ao carregar ${name} (${response.status})`);
            }
            
            const data = await response.text();
            const parsedPlaylist = parsePlaylist(data);
            
            if (parsedPlaylist.length === 0) {
                throw new Error('Playlist vazia ou formato inválido');
            }
            
            cachePlaylist(url, parsedPlaylist);
            
            playlistUrls = parsedPlaylist;
            playlistUrls.forEach((c, i) => c.tempId = i);
            savePlaylistState(playlistUrls, name, 'remote');
            updateChannelList();
            hideAllSelectors();
            focusChannel();
            showMessage(`✅ ${name} carregada com ${playlistUrls.length} canais`, 'success');
            
        } catch (error) {
            if (error.name === 'AbortError') {
                handleError(new Error('Timeout ao carregar playlist'), `Carregamento de ${name}`);
            } else {
                handleError(error, `Carregamento de ${name}`);
            }
        }
    }

    async function detectAvailablePlaylists() {
        showMessage("🔍 Verificando playlists disponíveis...", 'loading');
        
        try {
            const promises = availablePlaylists.map(async playlist => {
                try {
                    const response = await fetch(`playlists/${playlist.filename}`, { 
                        method: 'HEAD',
                        cache: 'no-cache',
                        signal: AbortSignal.timeout(5000)
                    });
                    
                    return {
                        ...playlist,
                        available: response.ok,
                        size: response.headers.get('content-length') || 'Desconhecido'
                    };
                } catch (error) {
                    return { ...playlist, available: false };
                }
            });
            
            const results = await Promise.allSettled(promises);
            return results.map(result => 
                result.status === 'fulfilled' ? result.value : 
                { ...availablePlaylists[results.indexOf(result)], available: false }
            );
            
        } catch (error) {
            handleError(error, 'Detecção de playlists');
            return availablePlaylists.map(p => ({ ...p, available: false }));
        }
    }

    async function showPlaylistSelector() {
        hideAllSelectors();
        playlistSelector.style.display = "block";
        
        playlistList.innerHTML = "<li class='loading'>📄 Detectando playlists disponíveis...</li>";
        
        try {
            const detectedPlaylists = await detectAvailablePlaylists();
            updatePlaylistList(detectedPlaylists);
        } catch (error) {
            updatePlaylistList(availablePlaylists.map(p => ({ ...p, available: false })));
            showMessage("⚠️ Erro ao detectar playlists", 'error');
        }
        
        currentView = 'playlists';
        setTimeout(() => focusFirstPlaylist(), 100);
    }

    function hideAllSelectors() {
        playlistSelector.style.display = "none";
        remotePlaylistSelector.style.display = "none";
        hideChannelFocus();
    }

    function backToButtons() {
        hideAllSelectors();
        currentView = 'buttons';
        const buttons = document.querySelectorAll(".navigable");
        if (buttons.length) {
            focusIndex = 0;
            buttons[0].focus();
        }
    }

    function updatePlaylistList(playlists) {
        try {
            const fragment = document.createDocumentFragment();
            
            const allHeader = document.createElement("li");
            allHeader.className = "category-header";
            allHeader.setAttribute("tabindex", "0");
            allHeader.setAttribute("role", "button");
            allHeader.setAttribute("aria-expanded", "false");
            allHeader.dataset.group = "Todos os Canais";
            allHeader.innerHTML = `<strong class="cat-label">📺 Todos os Canais (${playlistUrls.length})</strong>`;
            allHeader.style.cssText = "color: #ffeb3b; padding: 15px 10px; border-bottom: 2px solid #333; cursor: pointer; background: linear-gradient(45deg, #333, #555); border-radius: 5px; margin-bottom: 5px;";
            allHeader.onclick = () => showCategoryOverlay("Todos os Canais", playlistUrls);
            fragment.appendChild(allHeader);
            
            const manualLi = document.createElement("li");
            manualLi.textContent = "✏️ Digite nome do arquivo manualmente";
            manualLi.className = "playlist-item manual-input";
            manualLi.setAttribute("tabindex", "0");
            manualLi.onclick = () => {
                const filename = prompt("Digite o nome do arquivo da playlist (ex: minha-playlist.m3u8):");
                if (filename?.trim()) {
                    loadPlaylistFromFile(filename.trim());
                }
            };
            fragment.appendChild(manualLi);
            
            const availablePlaylist = playlists.filter(p => p.available);
            const unavailablePlaylist = playlists.filter(p => !p.available);
            
            if (availablePlaylist.length > 0) {
                const headerLi = document.createElement("li");
                headerLi.innerHTML = "<strong>📂 Disponíveis:</strong>";
                headerLi.className = "section-header";
                headerLi.style.cssText = "color: #6bff6b; padding: 5px 0;";
                fragment.appendChild(headerLi);
                
                availablePlaylist.forEach(playlist => {
                    const li = document.createElement("li");
                    li.textContent = `✅ ${playlist.name} (${playlist.filename})`;
                    li.className = "playlist-item available-playlist";
                    li.setAttribute("tabindex", "0");
                    li.dataset.filename = playlist.filename;
                    li.onclick = () => loadPlaylistFromFile(playlist.filename);
                    fragment.appendChild(li);
                });
            }
            
            if (unavailablePlaylist.length > 0) {
                const headerLi = document.createElement("li");
                headerLi.innerHTML = "<strong>🔒 Indisponíveis:</strong>";
                headerLi.className = "section-header";
                headerLi.style.cssText = "color: #ff6b6b; padding: 5px 0;";
                fragment.appendChild(headerLi);
                
                unavailablePlaylist.forEach(playlist => {
                    const li = document.createElement("li");
                    li.textContent = `❌ ${playlist.name} (${playlist.filename})`;
                    li.className = "playlist-item unavailable-playlist";
                    li.setAttribute("tabindex", "0");
                    li.dataset.filename = playlist.filename;
                    li.onclick = () => {
                        if (confirm(`Arquivo ${playlist.filename} não encontrado. Tentar carregar mesmo assim?`)) {
                            loadPlaylistFromFile(playlist.filename);
                        }
                    };
                    fragment.appendChild(li);
                });
            }
            
            playlistList.innerHTML = "";
            playlistList.appendChild(fragment);
            
            playlistItems = Array.from(document.querySelectorAll(".playlist-item"));
            
            const totalAvailable = availablePlaylist.length;
            const totalFiles = playlists.length;
            showMessage(`📊 ${totalAvailable} de ${totalFiles} playlists encontradas`, 'success');
            
        } catch (error) {
            handleError(error, 'Atualização da lista de playlists');
        }
    }

    async function loadPlaylistFromFile(filename) {
        try {
            if (!filename) {
                throw new Error('Nome do arquivo não fornecido');
            }

            const cacheKey = `local_${filename}`;
            const cached = getCachedPlaylist(cacheKey);
            
            if (cached) {
                console.log('📦 Usando playlist local em cache:', filename);
                playlistUrls = cached;
                playlistUrls.forEach((c, i) => c.tempId = i);
                savePlaylistState(playlistUrls, filename, 'local');
                updateChannelList();
                hideAllSelectors();
                focusChannel();
                showMessage(`✅ ${filename} carregada do cache com ${playlistUrls.length} canais`, 'success');
                return;
            }

            showMessage(`📄 Carregando ${filename}...`, 'loading');
            
            const response = await fetch(`playlists/${filename}`, {
                cache: 'no-cache',
                signal: AbortSignal.timeout(8000)
            });
            
            if (!response.ok) {
                throw new Error(`Playlist ${filename} não encontrada (${response.status})`);
            }
            
            const data = await response.text();
            const parsedPlaylist = parsePlaylist(data);
            
            if (parsedPlaylist.length === 0) {
                throw new Error('Playlist vazia ou formato inválido');
            }
            
            cachePlaylist(cacheKey, parsedPlaylist);
            
            playlistUrls = parsedPlaylist;
            playlistUrls.forEach((c, i) => c.tempId = i);
            savePlaylistState(playlistUrls, filename, 'local');
            updateChannelList();
            hideAllSelectors();
            focusChannel();
            showMessage(`✅ ${filename} carregada com ${playlistUrls.length} canais`, 'success');
            
        } catch (error) {
            handleError(error, `Carregamento de ${filename}`);
        }
    }

    async function loadFromUrl() {
        try {
            const url = prompt("Digite a URL da playlist (.m3u8):");
            if (!url?.trim()) return;
            
            const trimmedUrl = url.trim();
            if (!isValidUrl(trimmedUrl)) {
                throw new Error('URL inválida. Use http:// ou https://');
            }

            const cached = getCachedPlaylist(trimmedUrl);
            if (cached) {
                console.log('📦 Usando playlist de URL em cache');
                playlistUrls = cached;
                playlistUrls.forEach((c, i) => c.tempId = i);
                savePlaylistState(playlistUrls, `URL: ${trimmedUrl}`, 'url');
                updateChannelList();
                hideAllSelectors();
                focusChannel();
                showMessage(`✅ Playlist carregada do cache com ${playlistUrls.length} canais`, 'success');
                return;
            }

            showMessage("📄 Carregando playlist de URL...", 'loading');
            
            const response = await fetch(trimmedUrl, {
                signal: AbortSignal.timeout(10000)
            });
            
            if (!response.ok) {
                throw new Error(`URL inválida (${response.status})`);
            }
            
            const data = await response.text();
            const parsedPlaylist = parsePlaylist(data);
            
            if (parsedPlaylist.length === 0) {
                throw new Error('Playlist vazia ou formato inválido');
            }
            
            cachePlaylist(trimmedUrl, parsedPlaylist);
            
            playlistUrls = parsedPlaylist;
            playlistUrls.forEach((c, i) => c.tempId = i);
            savePlaylistState(playlistUrls, `URL: ${trimmedUrl}`, 'url');
            updateChannelList();
            hideAllSelectors();
            focusChannel();
            showMessage(`✅ Playlist carregada com ${playlistUrls.length} canais`, 'success');
            
        } catch (error) {
            handleError(error, 'Carregamento por URL');
        }
    }

    function loadSingleChannel() {
        try {
            const url = prompt("Digite a URL do canal (.m3u8 ou .mp4):");
            if (!url?.trim()) return;
            
            const trimmedUrl = url.trim();
            if (!isValidUrl(trimmedUrl)) {
                throw new Error('URL inválida. Use http:// ou https://');
            }
            
            playlistUrls = [{ url: trimmedUrl, name: "Canal Único", group: "Único" }];
            savePlaylistState(playlistUrls, "Canal Único", 'single');
            updateChannelList();
            hideAllSelectors();
            focusChannel();
            showMessage("✅ Canal único carregado", 'success');
            
        } catch (error) {
            handleError(error, 'Canal único');
        }
    }

    function parsePlaylist(content) {
        try {
            if (!content || typeof content !== 'string') {
                throw new Error('Conteúdo da playlist inválido');
            }

            const lines = content.split(/\r?\n/).map(line => line.trim()).filter(line => line);
            const parsed = [];
            let currentName = "";
            let currentGroup = "Outros";

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                if (line.startsWith("#EXTINF")) {
                    const groupMatch = line.match(/group-title="([^"]+)"/i);
                    currentGroup = groupMatch ? groupMatch[1].trim() : "Outros";
                    
                    const commaIndex = line.lastIndexOf(",");
                    if (commaIndex !== -1) {
                        currentName = line.substring(commaIndex + 1).trim();
                    }
                    
                    if (!currentName && i + 1 < lines.length && !lines[i + 1].startsWith("http")) {
                        currentName = lines[i + 1];
                        i++;
                    }
                    
                    if (!currentName) {
                        currentName = "Canal Desconhecido";
                    }
                } else if (line.startsWith("http")) {
                    if (isValidUrl(line)) {
                        parsed.push({
                            url: line,
                            name: currentName || "Canal Desconhecido",
                            group: currentGroup || "Outros"
                        });
                    }
                    
                    currentName = "";
                    currentGroup = "Outros";
                }
            }

            console.log(`📋 Playlist parseada: ${parsed.length} canais encontrados`);
            parsed.forEach((c, i) => c.tempId = i);
            return parsed;
            
        } catch (error) {
            handleError(error, 'Parser de playlist');
            return [];
        }
    }

    function updateChannelList() {
        try {
            const fragment = document.createDocumentFragment();
            
            const allHeader = document.createElement("li");
            allHeader.className = "category-header";
            allHeader.setAttribute("tabindex", "0");
            allHeader.setAttribute("role", "button");
            allHeader.setAttribute("aria-expanded", "false");
            allHeader.dataset.group = "Todos os Canais";
            allHeader.innerHTML = `<strong class="cat-label">📺 Todos os Canais (${playlistUrls.length})</strong>`;
            allHeader.style.cssText = "color: #ffeb3b; padding: 15px 10px; border-bottom: 2px solid #333; cursor: pointer; background: linear-gradient(45deg, #333, #555); border-radius: 5px; margin-bottom: 5px;";
            allHeader.onclick = () => showCategoryOverlay("Todos os Canais", playlistUrls);
            fragment.appendChild(allHeader);
            
            if (playlistUrls.length === 0) {
                const emptyLi = document.createElement("li");
                emptyLi.textContent = "Nenhum canal disponível";
                emptyLi.style.color = "#ccc";
                fragment.appendChild(emptyLi);
                
                channelList.innerHTML = "";
                channelList.appendChild(fragment);
                return;
            }

            const grouped = {};
            playlistUrls.forEach(channel => {
                const group = channel.group || "Outros";
                if (!grouped[group]) grouped[group] = [];
                grouped[group].push(channel);
            });

            const sortedGroups = Object.keys(grouped).sort();

            sortedGroups.forEach(group => {
                const header = document.createElement("li");
                header.className = "category-header";
                header.setAttribute("tabindex", "0");
                header.setAttribute("role", "button");
                header.setAttribute("aria-expanded", "false");
                header.dataset.group = group;
                header.innerHTML = `<strong class="cat-label">📺 ${group} (${grouped[group].length} canais)</strong>`;
                header.style.cssText = "color: #6bff6b; padding: 15px 10px; border-bottom: 2px solid #333; cursor: pointer; background: linear-gradient(45deg, #1a1a1a, #2a2a2a); border-radius: 5px; margin-bottom: 5px;";

                header.onclick = () => showCategoryOverlay(group, grouped[group]);

                fragment.appendChild(header);
            });

            channelList.innerHTML = "";
            channelList.appendChild(fragment);

            channelItems = Array.from(document.querySelectorAll(".category-header"));
            currentView = 'channels';

            if (!restoringState) {
                requestAnimationFrame(() => {
                    const firstElement = channelItems[0];
                    if (firstElement) setFocusElement(firstElement);
                });
            }

            debugFocus('updateChannelList');
            
        } catch (error) {
            handleError(error, 'Atualização da lista de canais');
        }
    }

    const debouncedFocusChannel = debounce((index = 0) => {
        if (!channelItems.length) {
            channelItems = Array.from(document.querySelectorAll(".category-header"));
        }
        
        if (!channelItems.length) return;
        
        try {
            let targetIndex = index;
            
            if (lastPlayedChannelIndex >= 0 && playlistUrls[lastPlayedChannelIndex]) {
                const lastChannel = playlistUrls[lastPlayedChannelIndex];
                const categoryHeader = Array.from(channelItems).find(header => 
                    header.dataset.group === lastChannel.group
                );
                
                if (categoryHeader) {
                    targetIndex = channelItems.indexOf(categoryHeader);
                }
            }
            
            targetIndex = Math.max(0, Math.min(targetIndex, channelItems.length - 1));
            
            currentFocusIndex = targetIndex;
            currentView = 'channels';
            
            setFocusElement(channelItems[currentFocusIndex]);
            
            if (lastPlayedChannelIndex >= 0 && playlistUrls[lastPlayedChannelIndex]) {
                showMessage(`Voltando à categoria: ${playlistUrls[lastPlayedChannelIndex].group}`, 'info');
            }
            
            debugFocus('focusChannel');
            
        } catch (error) {
            handleError(error, 'Foco no canal');
        }
    }, 100);

    function focusChannel(index = 0) {
        debouncedFocusChannel(index);
    }

    function focusFirstPlaylist() {
        setTimeout(() => {
            if (playlistItems.length) {
                playlistFocusIndex = 0;
                const firstItem = playlistItems[0];
                firstItem.focus();
                firstItem.classList.add("focused");
            }
        }, 100);
    }

    function focusFirstRemotePlaylist() {
        setTimeout(() => {
            if (remotePlaylistItems.length) {
                remoteFocusIndex = 0;
                const firstItem = remotePlaylistItems[0];
                firstItem.focus();
                firstItem.classList.add("focused");
            }
        }, 100);
    }

    function hideChannelFocus() {
        channelItems.forEach(el => el.classList.remove("focused"));
        currentFocusIndex = -1;
    }

    const debouncedMoveFocus = debounce((delta) => {
        if (currentView === 'overlay') {
            moveOverlayFocus(delta);
            return;
        }
        
        if (currentView === 'channels') {
            channelItems = Array.from(document.querySelectorAll(".category-header"));
            
            if (!channelItems.length) return;

            const focused = document.querySelector('.focused') || document.activeElement;
            let currentIndex = channelItems.indexOf(focused);
            
            if (currentIndex === -1) {
                currentIndex = 0;
            }

            const newIndex = (currentIndex + delta + channelItems.length) % channelItems.length;
            
            setFocusElement(channelItems[newIndex]);
            return;
        }

        if (currentView === 'playlists' && playlistItems.length) {
            if (playlistFocusIndex >= 0) {
                playlistItems[playlistFocusIndex]?.classList.remove("focused");
            }
            playlistFocusIndex = (playlistFocusIndex + delta + playlistItems.length) % playlistItems.length;
            const item = playlistItems[playlistFocusIndex];
            if (item) {
                item.focus();
                item.classList.add("focused");
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else if (currentView === 'remote' && remotePlaylistItems.length) {
            if (remoteFocusIndex >= 0) {
                remotePlaylistItems[remoteFocusIndex]?.classList.remove("focused");
            }
            remoteFocusIndex = (remoteFocusIndex + delta + remotePlaylistItems.length) % remotePlaylistItems.length;
            const item = remotePlaylistItems[remoteFocusIndex];
            if (item) {
                item.focus();
                item.classList.add("focused");
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, 50);

    function moveFocus(delta) {
        debouncedMoveFocus(delta);
    }

    function setupKeyboardControls() {
        document.addEventListener("keydown", (e) => {
            console.log(`Tecla pressionada: ${e.key}, View atual: ${currentView}`);
            
            // Controles específicos para player overlay
            if (currentView === 'player') {
                return; // Já tratado em handlePlayerKeydown
            }
            
            // Controles específicos para overlay de categorias
            if (currentView === 'overlay') {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    moveOverlayFocus(1);
                    return;
                }
                else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    moveOverlayFocus(-1);
                    return;
                }
                else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    moveOverlayFocus(4);
                    return;
                }
                else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    moveOverlayFocus(-4);
                    return;
                }
                else if (isOKKey(e)) {
                    e.preventDefault();
                    const focusedChannel = overlayChannels[overlayFocusIndex];
                    if (focusedChannel) {
                        focusedChannel.click();
                    }
                    return;
                }
                else if (e.key === "Backspace" || e.key === "Escape" || e.keyCode === 10009) {
                    e.preventDefault();
                    hideCategoryOverlay();
                    return;
                }
            }
            
            // Navegação vertical nas listas
            if (['channels', 'playlists', 'remote'].includes(currentView)) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    moveFocus(1);
                    return;
                }
                else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    moveFocus(-1);
                    return;
                }
            }

            // Enter para ativar elementos
            if (isOKKey(e)) {
                e.preventDefault();
                const active = document.activeElement;
                
                const clickableElements = [
                    'channel-item', 'playlist-item', 'remote-playlist-item', 
                    'navigable', 'category-header'
                ];
                
                if (clickableElements.some(className => active?.classList.contains(className))) {
                    active.click();
                }
                return;
            }

            // Backspace para voltar
            if (e.key === "Backspace" || e.keyCode === 10009) {
                e.preventDefault();
                if (['playlists', 'remote'].includes(currentView)) {
                    backToButtons();
                } else if (currentView === 'channels') {
                    hideChannelFocus();
                    currentView = 'buttons';
                    const buttons = document.querySelectorAll(".navigable");
                    if (buttons.length) {
                        focusIndex = 0;
                        buttons[0].focus();
                    }
                }
                return;
            }
        });

        // Navegação horizontal nos botões
        document.addEventListener("keydown", (e) => {
            if (currentView === 'buttons' && ["ArrowRight", "ArrowLeft"].includes(e.key)) {
                e.preventDefault();
                const buttons = document.querySelectorAll(".navigable");
                if (e.key === "ArrowRight") {
                    focusIndex = (focusIndex + 1) % buttons.length;
                } else {
                    focusIndex = (focusIndex - 1 + buttons.length) % buttons.length;
                }
                buttons[focusIndex].focus();
            }
        });
    }

    function showMinhasListasSelector() {
        hideAllSelectors();
        remotePlaylistSelector.style.display = "block";
        updateMinhasListasList();
        currentView = 'minhasListas';
        setTimeout(() => focusFirstRemotePlaylist(), 100);
    }

    function updateMinhasListasList() {
        try {
            const fragment = document.createDocumentFragment();
            const header = document.createElement("li");
            header.innerHTML = "<strong>🔥 Suas Listas Fixas:</strong>";
            header.className = "section-header";
            header.style.cssText = "color: #6bff6b; padding: 10px 0;";
            fragment.appendChild(header);

            minhasListasConfig.forEach(playlist => {
                const li = document.createElement("li");
                li.className = "remote-playlist-item";
                li.setAttribute("tabindex", "0");
                li.dataset.url = playlist.url;
                li.dataset.name = playlist.name;
                li.innerHTML = `<div><strong>${playlist.name}</strong></div>
                                <div style='font-size:0.9em;color:#ccc;margin-left:10px;'>${playlist.description}</div>`;
                li.onclick = () => loadRemotePlaylist(playlist.url, playlist.name);
                fragment.appendChild(li);
            });

            remotePlaylistList.innerHTML = "";
            remotePlaylistList.appendChild(fragment);
            remotePlaylistItems = Array.from(document.querySelectorAll(".remote-playlist-item"));
            showMessage(`🔥 ${minhasListasConfig.length} listas fixas disponíveis`, 'success');
        } catch (error) {
            handleError(error, 'Atualização de Minhas Listas');
        }
    }

    function setupEventListeners() {
        const btnHome = document.getElementById("btnHome");
        if (btnHome) btnHome.addEventListener("click", () => {
            if (confirm("Voltar para a página inicial?")) {
                location.href = "index.html";
            }
        });
        
        document.getElementById("btnLoadPlaylist").addEventListener("click", showRemotePlaylistSelector);
        document.getElementById("btnMinhasListas").addEventListener("click", showMinhasListasSelector);
        const btnLocal = document.getElementById("btnLocal");
        if (btnLocal) btnLocal.addEventListener("click", showPlaylistSelector);
        document.getElementById("btnUrl").addEventListener("click", loadFromUrl);
        const btnSingle = document.getElementById("btnSingle");
        if (btnSingle) btnSingle.addEventListener("click", loadSingleChannel);
        
        document.getElementById("btnBackFromRemote").addEventListener("click", backToButtons);
        document.getElementById("btnBackFromLocal").addEventListener("click", backToButtons);
        
        document.getElementById("btnUpload").addEventListener("click", () => {
            document.getElementById("fileInput").click();
        });

        document.getElementById("fileInput").addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                const parsedPlaylist = parsePlaylist(content);
                if (parsedPlaylist.length > 0) {
                    playlistUrls = parsedPlaylist;
                    updateChannelList();
                    focusChannel();
                    showMessage(`✅ ${file.name} carregada (${parsedPlaylist.length} canais)`, 'success');
                } else {
                    showMessage(`⚠️ Nenhum canal válido encontrado em ${file.name}`, 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    function initialize() {
        try {
            console.log("🚀 M3U8 Player inicializado com player overlay nativo");
            
            setupKeyboardControls();
            setupEventListeners();
            
            const buttons = document.querySelectorAll(".navigable");
            if (buttons.length) {
                buttons[focusIndex].focus();
            }
            
            if (!checkReturnFromPlayer()) {
                playlistUrls = [];
                lastPlayedChannelIndex = -1;
                channelItems = [];
                updateChannelList();
                showMessage("💡 Selecione uma opção acima para começar", 'success');
                console.log("📄 Inicialização limpa - nenhuma playlist pré-carregada");
            } else {
                console.log("📄 Playlist restaurada após retorno do player");
            }
            
            debugFocus('Inicialização');
            
        } catch (error) {
            handleError(error, 'Inicialização');
        }
    }

    // Executar inicialização
    initialize();
    
    // Expor playlist global
    Object.defineProperty(window, "currentPlaylist", {
        get() {
            return playlistUrls;
        },
        configurable: true
    });
    
    console.log("✅ M3U8 Player com overlay nativo carregado com sucesso");
});
