document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const heroSearchInput = document.getElementById('hero-search-input');
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const videoGrid = document.getElementById('video-grid');
  const videoPlayerOverlay = document.getElementById('video-player-overlay');
  const videoPlayer = document.getElementById('video-player');
  const closeBtn = document.getElementById('close-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const videoTitle = document.getElementById('video-title');
  const videoViews = document.getElementById('video-views');
  const videoDuration = document.getElementById('video-duration');
  const videoQuality = document.getElementById('video-quality');
  const sectionTitle = document.getElementById('section-title');
  const viewMore = document.getElementById('view-more');
  const homeLink = document.getElementById('home-link');
  const trendingLink = document.getElementById('trending-link');
  const categoriesLink = document.getElementById('categories-link');

  // State
  let currentSearchQuery = 'trending';
  let isLoading = false;

  // Initialize the app
  init();

  function init() {
    // Load initial videos
    searchVideos(currentSearchQuery);
    
    // Set up event listeners
    setupEventListeners();
  }

  function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', handleSearch);
    heroSearchBtn.addEventListener('click', handleHeroSearch);
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
    
    heroSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleHeroSearch();
    });

    // Video player controls
    closeBtn.addEventListener('click', closeVideoPlayer);
    fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Navigation
    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      currentSearchQuery = 'trending';
      sectionTitle.textContent = 'Featured Videos';
      searchVideos(currentSearchQuery);
      setActiveNav(homeLink);
    });

    trendingLink.addEventListener('click', (e) => {
      e.preventDefault();
      currentSearchQuery = 'trending';
      sectionTitle.textContent = 'Trending Videos';
      searchVideos(currentSearchQuery);
      setActiveNav(trendingLink);
    });

    categoriesLink.addEventListener('click', (e) => {
      e.preventDefault();
      currentSearchQuery = 'popular';
      sectionTitle.textContent = 'Popular Categories';
      searchVideos(currentSearchQuery);
      setActiveNav(categoriesLink);
    });

    viewMore.addEventListener('click', () => {
      // In a real app, this would load more videos
      alert('View more functionality would load additional videos in a real implementation.');
    });

    // Handle clicks outside video player to close it
    videoPlayerOverlay.addEventListener('click', (e) => {
      if (e.target === videoPlayerOverlay) {
        closeVideoPlayer();
      }
    });
  }

  function setActiveNav(activeElement) {
    document.querySelectorAll('.main-nav a').forEach(link => {
      link.classList.remove('active');
    });
    activeElement.classList.add('active');
  }

  function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
      currentSearchQuery = query;
      sectionTitle.textContent = `Results for: ${query}`;
      searchVideos(query);
    }
  }

  function handleHeroSearch() {
    const query = heroSearchInput.value.trim();
    if (query) {
      currentSearchQuery = query;
      sectionTitle.textContent = `Results for: ${query}`;
      searchInput.value = query;
      searchVideos(query);
    }
  }

  // Function to search videos
  async function searchVideos(query) {
    if (isLoading) return;
    
    isLoading = true;
    showLoadingState();
    
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.status && data.result && data.result.length > 0) {
        displayVideos(data.result);
      } else {
        showNoResults();
      }
    } catch (error) {
      console.error('Error:', error);
      showErrorState();
    } finally {
      isLoading = false;
    }
  }

  function showLoadingState() {
    videoGrid.innerHTML = `
      <div class="skeleton-loading">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-meta"></div>
      </div>
      <div class="skeleton-loading">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-meta"></div>
      </div>
      <div class="skeleton-loading">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-meta"></div>
      </div>
      <div class="skeleton-loading">
        <div class="skeleton-thumbnail"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-meta"></div>
      </div>
    `;
  }

  function showNoResults() {
    videoGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-video-slash"></i>
        <h4>No videos found</h4>
        <p>Try a different search term</p>
      </div>
    `;
  }

  function showErrorState() {
    videoGrid.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h4>Failed to load videos</h4>
        <p>Please try again later</p>
        <button class="retry-btn" id="retry-btn">Retry</button>
      </div>
    `;
    
    document.getElementById('retry-btn').addEventListener('click', () => {
      searchVideos(currentSearchQuery);
    });
  }

  // Function to display videos in grid
  function displayVideos(videos) {
    videoGrid.innerHTML = '';
    
    videos.forEach(video => {
      if (!video.title || !video.link) return; // Skip invalid videos
      
      const videoCard = document.createElement('div');
      videoCard.className = 'video-card';
      
      // Use a placeholder if thumbnail is not available
      const thumbnail = video.thumb || 'assets/placeholder.jpg';
      
      videoCard.innerHTML = `
        <img src="${thumbnail}" alt="${video.title}" class="video-thumbnail">
        <div class="video-quality">${video.quality || 'HD'}</div>
        <div class="video-duration">${video.duration || 'N/A'}</div>
        <div class="video-info">
          <h4>${video.title}</h4>
          <div class="video-meta">
            <span><i class="fas fa-eye"></i> ${video.views || 'N/A'}</span>
          </div>
        </div>
      `;
      
      videoCard.addEventListener('click', () => playVideo(video));
      videoGrid.appendChild(videoCard);
    });
  }

  // Function to play selected video
  async function playVideo(video) {
    showVideoLoading();
    
    try {
      const response = await fetch(`/api/video?url=${encodeURIComponent(video.link)}`);
      const data = await response.json();
      
      if (data.status && data.result.url) {
        displayVideoPlayer(data.result, video);
      } else {
        showVideoError();
      }
    } catch (error) {
      console.error('Error:', error);
      showVideoError();
    }
  }

  function showVideoLoading() {
    videoPlayerOverlay.classList.add('active');
    videoPlayer.innerHTML = 'Loading video...';
    videoTitle.textContent = 'Loading...';
    videoViews.textContent = 'Loading views...';
    videoDuration.textContent = 'Loading duration...';
    videoQuality.textContent = 'Loading quality...';
  }

  function displayVideoPlayer(videoData, originalVideo) {
    videoTitle.textContent = videoData.title || originalVideo.title || 'Untitled Video';
    videoViews.textContent = videoData.views || originalVideo.views || 'Views not available';
    videoDuration.textContent = videoData.duration || originalVideo.duration || 'Duration not available';
    videoQuality.textContent = videoData.quality || originalVideo.quality || 'Quality not available';
    
    videoPlayer.src = videoData.url;
    videoPlayer.load();
    
    // When enough data is loaded, play the video
    videoPlayer.addEventListener('canplay', function() {
      videoPlayer.play().catch(e => {
        console.error('Autoplay prevented:', e);
        // Show play button or handle autoplay restriction
      });
    }, { once: true });
  }

  function showVideoError() {
    videoPlayerOverlay.classList.add('active');
    videoPlayer.innerHTML = 'Failed to load video. Please try another one.';
    videoTitle.textContent = 'Error';
    videoViews.textContent = 'N/A';
    videoDuration.textContent = 'N/A';
    videoQuality.textContent = 'N/A';
  }

  function closeVideoPlayer() {
    videoPlayerOverlay.classList.remove('active');
    videoPlayer.pause();
    videoPlayer.removeAttribute('src');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      videoPlayer.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  // Handle fullscreen change
  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
  });
});