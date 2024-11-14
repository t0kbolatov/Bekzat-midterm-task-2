const apiKey = '4db3957be15946aeba8bdde90aae569a';
const recipeGrid = document.getElementById('recipe-grid');
const recipeDetails = document.getElementById('recipe-details');
const favoritesList = document.getElementById('favorites-list');
const searchInput = document.getElementById('search-input');
const suggestions = document.getElementById('suggestions');
const toggleFavoritesBtn = document.getElementById('toggle-favorites-btn');
const favoritesSection = document.getElementById('favorites-section');

// поиск по запросу
async function fetchRecipes(query) {
  const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${apiKey}`);
  const data = await response.json();
  displayRecipes(data.results);
}

// предложения по частичному запросу
async function fetchSuggestions(query) {
  const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&number=5&apiKey=${apiKey}`);
  const suggestionsData = await response.json();
  showSuggestions(suggestionsData);
}

// показать примеры для поиска
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
        fetchRecipes(suggestion.title);
      });
      suggestions.appendChild(suggestionItem);
    });
  } else {
    suggestions.style.display = 'none';
  }
}

function displayRecipes(recipes) {
  recipeGrid.innerHTML = '';
  recipes.forEach(recipe => {
    const recipeCard = createRecipeCard(recipe);
    recipeGrid.appendChild(recipeCard);
  });
}

function createRecipeCard(recipe) {
  const recipeCard = document.createElement('div');
  recipeCard.classList.add('recipe-card');
  recipeCard.innerHTML = `
    <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
    <h3>${recipe.title}</h3>
    <p>${recipe.summary ? recipe.summary.split('. ')[0] : 'No description available.'}</p>
  `;
  recipeCard.addEventListener('click', () => showRecipeDetails(recipe.id));
  return recipeCard;
}

async function showRecipeDetails(id) {
  const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${apiKey}`);
  const data = await response.json();

  recipeDetails.innerHTML = `
    <h2>${data.title}</h2>
    <img src="${data.image}" alt="${data.title}">
    <p><strong>Ingredients:</strong></p>
    <ul>${data.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}</ul>
    <p><strong>Instructions:</strong></p>
    <p>${data.instructions || "No instructions available."}</p>
    <p><strong>Nutrition:</strong> Calories: ${data.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 'N/A'} kcal, 
       Protein: ${data.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 'N/A'} g, 
       Fat: ${data.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 'N/A'} g
    </p>
    <button onclick="addFavorite(${data.id}, '${data.title}', '${data.image}')">Add to Favorites</button>
  `;
  recipeDetails.classList.remove('hidden');
}


function addFavorite(id, title, image) {
  const favorite = { id, title, image };
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === id)) {
    favorites.push(favorite);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  displayFavorites();
}

// любимые рецепты с хранилища 
function displayFavorites() {
  favoritesList.innerHTML = '';
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites.forEach(fav => {
    const favoriteCard = createRecipeCard(fav);
    favoritesList.appendChild(favoriteCard);
  });
}

// показать секцию с выбранными
toggleFavoritesBtn.addEventListener('click', () => {
  if (favoritesSection.classList.contains('hidden')) {
    displayFavorites(); // показать избранные при выборе
    favoritesSection.classList.remove('hidden');
    toggleFavoritesBtn.textContent = 'Hide Favorites';
  } else {
    favoritesSection.classList.add('hidden');
    toggleFavoritesBtn.textContent = 'Show Favorites';
  }
});

searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    fetchSuggestions(query);  // показать предложения
    fetchRecipes(query);      // показать карточки рецепов
  } else {
    suggestions.style.display = 'none';
    recipeGrid.innerHTML = ''; // инпут должен быть больше 3 символов
  }
});

// скрыть предложения
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.style.display = 'none';
  }
});
