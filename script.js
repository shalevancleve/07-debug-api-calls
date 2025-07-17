// Select the search form and movie results container
const searchForm = document.getElementById('search-form');
const movieResults = document.getElementById('movie-results');

const watchlist = new Set(); // Use a Set to avoid duplicates
const watchlistContainer = document.getElementById('watchlist');
const apiKey = '19207a4b'; // Replace with your OMDb API key

// Function to fetch movies from the OMDb API
function fetchMovies(query) {

  const url = `https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`;

  // Fetch data from the API using .then() and .catch()
  fetch(url)
    .then(function(response) {
      // Check if the response was successful
      if (!response.ok) {
        // Log error details to the console
        console.error(`HTTP error! Status: ${response.status}`);
        movieResults.innerHTML = `<p class="no-results">Sorry, something went wrong. Please try again later.</p>`;
        // Stop further processing
        return;
      }
      // Parse the response as JSON
      return response.json();
    })
    .then(function(data) {
      // If there was a previous error, data will be undefined
      if (!data) return;
      // Check if the response contains movies
      if (data.Response === 'True') {
        displayMovies(data.Search);
      } else {
        movieResults.innerHTML = '<p class="no-results">No results found. Please try a different search.</p>';
      }
    })
    .catch(function(error) {
      // Log error details to the console
      console.error('Fetch error:', error);
      movieResults.innerHTML = `<p class="no-results">Sorry, something went wrong. Please check your internet connection and try again.</p>`;
    });
}

// Function to save the watchlist to local storage
function saveWatchlist() {
  localStorage.setItem('watchlist', JSON.stringify(Array.from(watchlist)));
}

// Function to load the watchlist from local storage
function loadWatchlist() {
  const storedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  storedWatchlist.forEach((movieID) => watchlist.add(movieID));
}

// Function to remove a movie from the watchlist
function removeFromWatchlist(movieID) {
  if (watchlist.has(movieID)) {
    watchlist.delete(movieID);
    saveWatchlist();
    updateWatchlistDisplay();
  }
}

// Function to update the watchlist display
async function updateWatchlistDisplay() {
  watchlistContainer.innerHTML = ''; // Clear previous watchlist

  if (watchlist.size === 0) {
    watchlistContainer.innerHTML = '<p>Your watchlist is empty. Search for movies to add!</p>';
  } else {
    // Loop through each movie in the watchlist
    watchlist.forEach(async (movieID) => {
      const url = `https://www.omdbapi.com/?i=${movieID}&apikey=${apiKey}`;
      try {
        // Fetch movie details from the API
        const response = await fetch(url);

        // Check if the response was successful
        if (!response.ok) {
          console.error(`HTTP error! Status: ${response.status}`);
          // Show a user-friendly error message in the watchlist
          const errorCard = document.createElement('div');
          errorCard.classList.add('movie-card');
          errorCard.innerHTML = `<p class="no-results">Could not load movie details. Please try again later.</p>`;
          watchlistContainer.appendChild(errorCard);
          return;
        }

        const movie = await response.json();

        const watchlistCard = document.createElement('div');
        watchlistCard.classList.add('movie-card');

        watchlistCard.innerHTML = `
          <img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">
          <div class="movie-info">
            <h3 class="movie-title">${movie.Title}</h3>
            <p class="movie-year">${movie.Year}</p>
            <button class="btn btn-remove" onclick='removeFromWatchlist("${movie.imdbID}")'>Remove</button>
          </div>
        `;

        watchlistContainer.appendChild(watchlistCard);
      } catch (error) {
        // Log error details to the console
        console.error('Fetch error:', error);
        const errorCard = document.createElement('div');
        errorCard.classList.add('movie-card');
        errorCard.innerHTML = `<p class="no-results">Sorry, something went wrong. Please check your internet connection and try again.</p>`;
        watchlistContainer.appendChild(errorCard);
      }
    });
  }
}

// Function to add a movie to the watchlist
function addToWatchlist(movie) {
  if (!watchlist.has(movie.imdbID)) {
    watchlist.add(movie.imdbID);
    saveWatchlist();
    updateWatchlistDisplay();
  }
}

// Function to handle the 'Add to Watchlist' button click
const handleAddToWatchlist = (movie) => {
  return () => addToWatchlist(movie);
};

// Function to display movies in the results section
function displayMovies(movies) {
  movieResults.innerHTML = ''; // Clear previous results

  // Loop through each movie and create a card
  movies.forEach((movie) => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    movieCard.innerHTML = `
      <img src="${movie.Poster}" alt="${movie.Title}" class="movie-poster">
      <div class="movie-info">
        <h3 class="movie-title">${movie.Title}</h3>
        <p class="movie-year">${movie.Year}</p>
        <button class="btn">Add to Watchlist</button>
      </div>
    `;

    // Add event listener to the 'Add to Watchlist' button
    movieCard.querySelector('.btn').addEventListener('click', handleAddToWatchlist(movie));

    movieResults.appendChild(movieCard);
  });
}

// Event listener for the search form submission
searchForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  const query = document.getElementById('movie-search').value.trim();
  if (query) {
    fetchMovies(query);
    document.getElementById('movie-search').value = ''; // Clear the search field
  }
});

// Load the watchlist when the page loads
window.addEventListener('load', () => {
  loadWatchlist();
  updateWatchlistDisplay();
});
