document.addEventListener("DOMContentLoaded", function () {
  // DOM elements
  const searchInput = document.getElementById("gameSearch");
  const likedGamesBtn = document.getElementById("likedGamesBtn");
  const gameCards = document.querySelectorAll(".game-card");
  const categoryDropdown = document.getElementById("categoryDropdown");
  const themeToggle = document.getElementById("themeToggle");
  const filterRibbon = document.getElementById("filterRibbon");
  const emptyState = document.getElementById("emptyState");
  const notification = document.getElementById("notification");
  const notificationText = document.getElementById("notificationText");
  const recentlyPlayedGames = document.getElementById("recentlyPlayedGames");
  const gamesPlayedCount = document.getElementById("gamesPlayedCount");
  const gamesGallery = document.getElementById("gamesGallery");
  
  // Fixed dropdown behavior by adding click handler to the category button
  const categoryButton = document.querySelector('.category button');
  const dropdown = document.getElementById('categoryDropdown');
  let isDropdownOpen = false;
  
  categoryButton.addEventListener('click', function(e) {
    e.stopPropagation();
    
    if (isDropdownOpen) {
      dropdown.style.display = 'none';
      isDropdownOpen = false;
    } else {
      dropdown.style.display = 'flex';
      isDropdownOpen = true;
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.category') && isDropdownOpen) {
      dropdown.style.display = 'none';
      isDropdownOpen = false;
    }
  });
  
  // Keep dropdown open when hovering over it
  dropdown.addEventListener('mouseenter', function() {
    isDropdownOpen = true;
    dropdown.style.display = 'flex';
  });
  
  // Load and display custom games
  function loadCustomGames() {
    const customGames = JSON.parse(localStorage.getItem('customGames')) || [];
    
    // If there are custom games, add them to the gallery
    if (customGames.length > 0) {
      customGames.forEach(game => {
        // Create game card element
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.setAttribute('data-title', game.title);
        gameCard.setAttribute('data-category', game.category);
        gameCard.setAttribute('data-game-link', game.link || '#');
        
        // Create card HTML structure with play button
        gameCard.innerHTML = `
          <span class="like-btn" aria-label="Like this game">
            <i class="far fa-heart"></i>
          </span>
          <div class="play-btn" aria-label="Play this game">
            <i class="fas fa-play-circle"></i>
          </div>
          <img src="${game.image}" alt="${game.title}">
          <div class="game-info">
            <h3>${game.title}</h3>
            <p class="game-category"><i class="${getCategoryIcon(game.category)}"></i> ${game.category}</p>
            <div class="game-rating">
              ${generateRatingStars(game.rating)}
            </div>
          </div>
        `;
        
        // Add to games gallery
        gamesGallery.appendChild(gameCard);
      });
      
      // Refresh category filters to include new games
      populateCategories();
    }
  }
  
  // Helper function to generate star rating HTML
  function generateRatingStars(rating) {
    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fas fa-star"></i>';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    
    // Fill remaining with empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="far fa-star"></i>';
    }
    
    return starsHtml;
  }
  
  // Load user stats
  function loadUserStats() {
    const gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || [];
    gamesPlayedCount.textContent = gamesPlayed.length;
    
    // Load recently played games
    const recentGames = gamesPlayed.slice(0, 3);
    
    if (recentGames.length > 0) {
      document.querySelector('.empty-recent').style.display = 'none';
      recentlyPlayedGames.innerHTML = '';
      
      recentGames.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'featured-game';
        gameElement.setAttribute('data-game-link', game.link);
        
        // Find the corresponding game card to get the image
        const gameCard = Array.from(document.querySelectorAll('.game-card')).find(card => 
          card.getAttribute('data-title') === game.title);
        
        const imgSrc = gameCard ? 
          gameCard.querySelector('img').getAttribute('src') : 
          'assets/default.jpg';
        
        gameElement.innerHTML = `
          <img src="${imgSrc}" alt="${game.title}">
          <div class="featured-game-info">
            <div class="featured-game-title">${game.title}</div>
            <div class="featured-game-played">Played ${timeAgo(game.lastPlayed)}</div>
          </div>
        `;
        
        recentlyPlayedGames.appendChild(gameElement);
      });
      
      // Make sure to add click handlers to the dynamically created games
      attachClickHandlersToRecentGames();
    }
  }
  
  // Helper function to format time ago
  function timeAgo(timestamp) {
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    
    let interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + " day" + (interval > 1 ? "s" : "") + " ago";
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + " hour" + (interval > 1 ? "s" : "") + " ago";
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + " minute" + (interval > 1 ? "s" : "") + " ago";
    }
    
    return "just now";
  }
  
  // Update game played stats
  function recordGamePlayed(title, link) {
    const gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || [];
    
    // Remove if already in the list
    const existingIndex = gamesPlayed.findIndex(g => g.title === title);
    if (existingIndex !== -1) {
      gamesPlayed.splice(existingIndex, 1);
    }
    
    // Add to the beginning of the array
    gamesPlayed.unshift({
      title: title,
      link: link,
      lastPlayed: Date.now()
    });
    
    localStorage.setItem('gamesPlayed', JSON.stringify(gamesPlayed));
    
    // Update stats display
    loadUserStats();
  }
  
  // Function to open a game by its link
  function openGameLink(title, link) {
    if (!link || link === '#') return;
    
    recordGamePlayed(title, link);
    showNotification(`Opening ${title}...`);
    
    try {
      // Open link in new tab if it's a URL
      if (link.startsWith('http')) {
        const newWindow = window.open(link, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup was blocked, try direct navigation
          window.location.href = link;
        }
      } else {
        window.location.href = link;
      }
    } catch (e) {
      console.error("Error opening game link:", e);
      // Fallback to direct navigation
      window.location.href = link;
    }
  }
  
  // Add click handlers to all game cards
  function setupAllGameClickHandlers() {
    // Remove any existing event listeners first (clean slate)
    document.querySelectorAll('.game-card').forEach(card => {
      const clone = card.cloneNode(true);
      card.parentNode.replaceChild(clone, card);
    });
    
    document.querySelectorAll('.featured-game').forEach(game => {
      const clone = game.cloneNode(true);
      game.parentNode.replaceChild(clone, game);
    });
    
    // Set up all game cards
    document.querySelectorAll('.game-card').forEach(card => {
      const gameLink = card.getAttribute('data-game-link') || '#';
      const gameTitle = card.getAttribute('data-title');
      
      // Add play button if not already present
      if (!card.querySelector('.play-btn')) {
        const playBtn = document.createElement('div');
        playBtn.className = 'play-btn';
        playBtn.setAttribute('aria-label', 'Play this game');
        playBtn.innerHTML = '<i class="fas fa-play-circle"></i>';
        card.appendChild(playBtn);
      }
      
      // Set up like button
      const likeBtn = card.querySelector('.like-btn');
      if (likeBtn) {
        likeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          
          const icon = this.querySelector('i');
          const isLiked = icon.classList.contains('fas');
          
          if (isLiked) {
            icon.classList.replace('fas', 'far');
            showNotification('Game removed from your liked games');
          } else {
            icon.classList.replace('far', 'fas');
            icon.classList.add('fa-beat');
            showNotification('Game added to your liked games');
            
            setTimeout(() => {
              icon.classList.remove('fa-beat');
            }, 1000);
          }
          
          this.classList.toggle("liked");
          saveLikedGames();
        });
      }
      
      // Set up play button
      const playBtn = card.querySelector('.play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          openGameLink(gameTitle, gameLink);
        });
      }
      
      // Set up the entire card click
      card.addEventListener('click', function(e) {
        // Skip if click was on like button
        if (e.target.closest('.like-btn')) return;
        
        // Skip if click was on play button (already handled)
        if (e.target.closest('.play-btn')) return;
        
        // Otherwise, open the game link
        openGameLink(gameTitle, gameLink);
      });
    });
    
    // Set up featured games
    document.querySelectorAll('.featured-game').forEach(game => {
      const link = game.getAttribute('data-game-link') || '#';
      const title = game.querySelector('.featured-game-title')?.textContent;
      
      game.style.cursor = 'pointer';
      
      // Add play button if not already present
      if (!game.querySelector('.play-btn')) {
        const playBtn = document.createElement('div');
        playBtn.className = 'play-btn featured-play-btn';
        playBtn.setAttribute('aria-label', 'Play this game');
        playBtn.innerHTML = '<i class="fas fa-play-circle"></i>';
        game.appendChild(playBtn);
      }
      
      // Set up play button
      const playBtn = game.querySelector('.play-btn');
      if (playBtn) {
        playBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          if (title) openGameLink(title, link);
        });
      }
      
      // Set up the entire card click
      game.addEventListener('click', function(e) {
        // Skip if click was on play button (already handled)
        if (e.target.closest('.play-btn')) return;
        
        // Otherwise, open the game link
        if (title) openGameLink(title, link);
      });
    });
  }
  
  // Theme management
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
  
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? 
      '<i class="fas fa-sun"></i>' : 
      '<i class="fas fa-moon"></i>';
  });
  
  // Notification function - only show for important interactions
  function showNotification(message) {
    // Only show notifications for important actions
    if (message.includes("Opening") || 
        message.includes("added to your liked games") || 
        message.includes("removed from your liked games")) {
      
      notificationText.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }
  }
  
  // Search functionality with debounce
  let searchTimeout;
  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
      const value = searchInput.value.toLowerCase().trim();
      let foundGames = 0;
      
      document.querySelectorAll(".game-card").forEach(card => {
        const title = card.getAttribute("data-title").toLowerCase();
        const category = card.getAttribute("data-category").toLowerCase();
        const isVisible = title.includes(value) || category.includes(value);
        
        card.style.display = isVisible ? "block" : "none";
        if (isVisible) foundGames++;
      });
      
      // Show empty state if no games found
      emptyState.style.display = foundGames > 0 ? "none" : "block";
    }, 300);
  });
  
  // Function to save liked games
  function saveLikedGames() {
    const likedGames = [];
    document.querySelectorAll('.game-card').forEach(card => {
      const icon = card.querySelector('.like-btn i');
      if (icon.classList.contains('fas')) {
        likedGames.push(card.getAttribute('data-title'));
      }
    });
    localStorage.setItem('likedGames', JSON.stringify(likedGames));
  }
  
  // Function to load liked games
  function loadLikedGames() {
    const likedGames = JSON.parse(localStorage.getItem('likedGames')) || [];
    document.querySelectorAll('.game-card').forEach(card => {
      const title = card.getAttribute('data-title');
      const likeBtn = card.querySelector('.like-btn');
      if (likeBtn) {
        const icon = likeBtn.querySelector('i');
        
        if (likedGames.includes(title)) {
          icon.classList.replace('far', 'fas');
          likeBtn.classList.add('liked');
        }
      }
    });
  }
  
  // Populate categories dropdown and filter ribbon
  function populateCategories() {
    // Clear existing categories
    categoryDropdown.innerHTML = '';
    
    // Keep "All Games" filter but remove other category filters
    const allGamesFilter = document.querySelector('.filter-chip[data-filter="all"]');
    const filterChips = document.querySelectorAll('.filter-chip:not([data-filter="all"])');
    filterChips.forEach(chip => chip.remove());
    
    // Collect all unique categories from game cards
    const uniqueCategories = new Set();
    document.querySelectorAll('.game-card').forEach(card => {
      const cat = card.getAttribute("data-category");
      uniqueCategories.add(cat);
    });
    
    // Create category dropdown options
    uniqueCategories.forEach(category => {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = category;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        isDropdownOpen = false;
        dropdown.style.display = 'none';
        filterByCategory(category);
      });
      categoryDropdown.appendChild(link);
      
      // Also add to filter ribbon
      const chipIcon = getCategoryIcon(category);
      const chip = document.createElement("div");
      chip.className = "filter-chip";
      chip.setAttribute("data-filter", category);
      chip.innerHTML = `<i class="${chipIcon}"></i> ${category}`;
      chip.addEventListener("click", () => {
        filterByCategory(category);
      });
      filterRibbon.appendChild(chip);
    });
  }
  
  // Get appropriate icon for category
  function getCategoryIcon(category) {
    const icons = {
      "2D": "fas fa-chess-board",
      "3D": "fas fa-cube",
      "Quiz": "fas fa-question-circle",
      "Racing": "fas fa-car",
      "Adventure": "fas fa-mountain",
      "Action": "fas fa-bolt",
      "RPG": "fas fa-hat-wizard",
      "Strategy": "fas fa-chess",
      "Puzzle": "fas fa-puzzle-piece"
    };
    
    return icons[category] || "fas fa-gamepad";
  }
  
  // Liked Games Filter
  likedGamesBtn.addEventListener("click", function (e) {
    e.preventDefault();
    
    // Update active filter
    document.querySelectorAll('.filter-chip').forEach(chip => 
      chip.classList.remove('active'));
    
    let foundLiked = 0;
    document.querySelectorAll('.game-card').forEach(card => {
      const icon = card.querySelector('.like-btn i');
      const isLiked = icon && icon.classList.contains('fas');
      card.style.display = isLiked ? "block" : "none";
      if (isLiked) foundLiked++;
    });
    
    // Show empty state if no liked games found
    emptyState.style.display = foundLiked > 0 ? "none" : "block";
    
    if (foundLiked === 0) {
      emptyState.querySelector('h3').textContent = 'No liked games yet';
      emptyState.querySelector('p').textContent = 'Like some games to see them here';
      emptyState.querySelector('i').className = 'fas fa-heart-broken';
    }
  });
  
  // Filter function
  function filterByCategory(category) {
    // Update active class in filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      if (chip.getAttribute('data-filter') === category || 
         (chip.getAttribute('data-filter') === 'all' && category === 'all')) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });
    
    // Filter cards
    let visibleCount = 0;
    document.querySelectorAll('.game-card').forEach(card => {
      if (category === 'all') {
        card.style.display = "block";
        visibleCount++;
      } else {
        const cardCat = card.getAttribute("data-category");
        card.style.display = cardCat === category ? "block" : "none";
        if (cardCat === category) visibleCount++;
      }
    });
    
    // Show empty state if needed
    emptyState.style.display = visibleCount > 0 ? "none" : "block";
    
    // Reset empty state text if we're showing it
    if (visibleCount === 0) {
      emptyState.querySelector('h3').textContent = 'No games found';
      emptyState.querySelector('p').textContent = 'Try changing your search criteria';
      emptyState.querySelector('i').className = 'fas fa-search';
    }
  }
  
  // Card hover effect
  const gameCardsContainer = document.getElementById('gamesGallery');
  
  gameCardsContainer.addEventListener('mouseover', function(e) {
    const card = e.target.closest('.game-card');
    if (card && !card.classList.contains('hovered')) {
      card.classList.add('hovered');
    }
  });
  
  gameCardsContainer.addEventListener('mouseout', function(e) {
    const card = e.target.closest('.game-card');
    if (card) {
      card.classList.remove('hovered');
    }
  });
  
  // Add keyboard navigation for accessibility
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isDropdownOpen) {
      dropdown.style.display = 'none';
      isDropdownOpen = false;
    }
  });
  
  // Add "Add Game" button to the navbar
  function addGameButton() {
    const navbar = document.querySelector('.navbar');
    const addGameLink = document.createElement('a');
    addGameLink.href = 'game.html';
    addGameLink.innerHTML = '<i class="fas fa-plus-circle"></i> Add Game';
    navbar.appendChild(addGameLink);
  }
  
  // Initialize
  addGameButton();
  loadCustomGames();
  setupAllGameClickHandlers();
  loadLikedGames();
  loadUserStats();
  
  // Set "All Games" filter as default active
  document.querySelector('.filter-chip[data-filter="all"]').classList.add('active');
  document.querySelector('.filter-chip[data-filter="all"]').addEventListener('click', () => {
    filterByCategory('all');
  });
  
  // Initialize the page with all games
  filterByCategory('all');
  
  // Add CSS for the play button
  document.addEventListener('DOMContentLoaded', function() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      .game-card {
        position: relative;
      }
      .play-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(231, 76, 60, 0.8);
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
        z-index: 10;
        cursor: pointer;
      }
      .play-btn i {
        font-size: 28px;
      }
      .game-card:hover .play-btn {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.1);
      }
      .play-btn:hover {
        background-color: rgba(231, 76, 60, 1);
        transform: translate(-50%, -50%) scale(1.2) !important;
      }
      .featured-play-btn {
        width: 40px;
        height: 40px;
      }
      .featured-play-btn i {
        font-size: 20px;
      }
    `;
    document.head.appendChild(styleSheet);
  });
  
  // Replace setupExistingGameCards and setupFeaturedGames with the centralized function
  // These functions are now kept for backward compatibility
  function setupExistingGameCards() {
    // This function is kept for backward compatibility
    // All functionality has been moved to setupAllGameClickHandlers
    console.log("Using setupAllGameClickHandlers instead");
  }
  
  function setupFeaturedGames() {
    // This function is kept for backward compatibility
    // All functionality has been moved to setupAllGameClickHandlers
    console.log("Using setupAllGameClickHandlers instead");
  }
  
  function attachClickHandlersToRecentGames() {
    // Update the recently played games in setupAllGameClickHandlers
    setupAllGameClickHandlers();
  }
});
