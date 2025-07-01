document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const videoGrid = document.getElementById('video-grid');
  const videoPlayerContainer = document.getElementById('video-player-container');
  const videoPlayer = document.getElementById('video-player');
  const closeBtn = document.getElementById('close-btn');
  const videoTitle = document.getElementById('video-title');
  const videoViews = document.getElementById('video-views');
  const videoDuration = document.getElementById('video-duration');
  const sectionTitle = document.getElementById('section-title');

  // Initial load with default search
  searchVideos('trending');

  // Search functionality
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      searchVideos(query);
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        searchVideos(query);
      }
    }
  });

  // Close video player
  closeBtn.addEventListener('click', () => {
    videoPlayerContainer.style.display = 'none';
    videoPlayer.pause();
    videoPlayer.src = '';
  });

  // Function to search videos
  function searchVideos(query) {
    sectionTitle.textContent = `Results for: ${query}`;
    videoGrid.innerHTML = '<div class="loading">Loading videos...</div>';
    
    fetch(`/api/search?query=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        if (data.status && data.result.length > 0) {
          displayVideos(data.result);
        } else {
          videoGrid.innerHTML = '<div class="no-results">No videos found. Try a different search.</div>';
        }
      })
      .catch(error => {
        console.error('Error:', error);
        videoGrid.innerHTML = '<div class="error">Failed to load videos. Please try again later.</div>';
      });
  }

  // Function to display videos in grid
  function displayVideos(videos) {
    videoGrid.innerHTML = '';
    
    videos.forEach(video => {
      if (!video.title) return; // Skip if no title
      
      const videoCard = document.createElement('div');
      videoCard.className = 'video-card';
      
      videoCard.innerHTML = `
        <img src="${video.thumb || 'assets/placeholder.jpg'}" alt="${video.title}" class="video-thumbnail">
        <div class="video-info">
          <h4>${video.title}</h4>
          <div class="video-meta">
            <span>${video.views}</span>
            <span>${video.duration}</span>
          </div>
        </div>
      `;
      
      videoCard.addEventListener('click', () => playVideo(video));
      videoGrid.appendChild(videoCard);
    });
  }

  // Function to play selected video
  function playVideo(video) {
    fetch(`/api/video?url=${encodeURIComponent(video.link)}`)
      .then(response => response.json())
      .then(data => {
        if (data.status && data.result.url) {
          videoTitle.textContent = data.result.title || video.title;
          videoViews.textContent = data.result.views || video.views;
          videoDuration.textContent = data.result.duration || video.duration;
          videoPlayer.src = data.result.url;
          videoPlayerContainer.style.display = 'flex';
        } else {
          alert('Failed to load video. Please try another one.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while loading the video.');
      });
  }
});