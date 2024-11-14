const apiKey = 'ad127b3eeb260356c769408c899710d0';
const movieGrid = document.getElementById('movie-grid');
const movieDetails = document.getElementById('movie-details');
const watchlistList = document.getElementById('watchlist-list');
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');
const toggleWatchlistBtn = document.getElementById('toggle-watchlist-btn');
const watchlistSection = document.getElementById('watchlist-section');
const sortSelect = document.getElementById('sort-select');

async function fetchMovies(query, sort) {
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&sort_by=${sort}&api_key=${apiKey}`);
  const data = await response.json();
  displayMovies(data.results);
}

async function fetchSuggestions(query) {
  const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}&api_key=${apiKey}`);
  const suggestionsData = await response.json();
  showSuggestions(suggestionsData.results);
}

function showSuggestions(suggestionsData) {
  suggestions.innerHTML = '';
  if (suggestionsData.length) {
    suggestions.style.display = 'block';
    suggestionsData.forEach(suggestion => {
      const suggestionItem = document.createElement('div');
      suggestionItem.textContent = suggestion.title;
      suggestionItem.addEventListener('click', () => {
        searchInput.value = suggestion.title;
        suggestions.style.display = 'none';
        fetchMovies(suggestion.title, sortSelect.value);
      });
      suggestions.appendChild(suggestionItem);
    });
  } else {
    suggestions.style.display = 'none';
  }
}

function displayMovies(movies) {
  movieGrid.innerHTML = '';
  movies.forEach(movie => {
    const movieCard = createMovieCard(movie);
    movieGrid.appendChild(movieCard);
  });
}

function createMovieCard(movie) {
  const movieCard = document.createElement('div');
  movieCard.classList.add('movie-card');
  movieCard.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
    <h3>${movie.title}</h3>
    <p>Release Date: ${movie.release_date}</p>
  `;
  movieCard.addEventListener('click', () => showMovieDetails(movie.id));
  return movieCard;
}

async function showMovieDetails(id) {
  const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos`);
  const data = await response.json();

  movieDetails.innerHTML = `
    <h2>${data.title}</h2>
    <p><strong>Synopsis:</strong> ${data.overview}</p>
    <p><strong>Rating:</strong> ${data.vote_average} | <strong>Runtime:</strong> ${data.runtime} minutes</p>
    <p><strong>Cast:</strong> ${data.credits.cast.slice(0, 5).map(cast => cast.name).join(', ')}</p>
    <button onclick="addToWatchlist(${data.id}, '${data.title}', '${data.poster_path}')">Add to Watchlist</button>
  `;
  movieDetails.classList.remove('hidden');
}

function addToWatchlist(id, title, poster_path) {
  const watchlistItem = { id, title, poster_path };
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  if (!watchlist.some(item => item.id === id)) {
    watchlist.push(watchlistItem);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }
  displayWatchlist();
}

function displayWatchlist() {
  watchlistList.innerHTML = '';
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  watchlist.forEach(movie => {
    const movieCard = createMovieCard(movie);
    watchlistList.appendChild(movieCard);
  });
}

toggleWatchlistBtn.addEventListener('click', () => {
  if (watchlistSection.classList.contains('hidden')) {
    displayWatchlist(); 
    watchlistSection.classList.remove('hidden');
    toggleWatchlistBtn.textContent = 'Hide Watchlist';
  } else {
    watchlistSection.classList.add('hidden');
    toggleWatchlistBtn.textContent = 'Show Watchlist';
  }
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    fetchSuggestions(query);  // авто предложения
    fetchMovies(query, sortSelect.value);  // карточки фильмов
  } else {
    suggestions.style.display = 'none';
    movieGrid.innerHTML = ''; // нужно ввести минимум 3 символа
  }
});

// пересортировка фильмов
sortSelect.addEventListener('change', () => {
  const query = searchInput.value.trim();
  if (query) fetchMovies(query, sortSelect.value);
});

// скрыть содержимое
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.style.display = 'none';
  }
});
