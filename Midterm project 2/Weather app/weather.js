const apiKey = '72fc0ab1f30fc3af566f5af23448173a';
let isCelsius = true;

document.getElementById('search-input').addEventListener('input', autoSuggest);
document.getElementById('location-btn').addEventListener('click', getLocationWeather);
document.getElementById('unit-toggle').addEventListener('click', toggleUnit);

function autoSuggest() {
  const query = document.getElementById('search-input').value;
  if (query.length < 3) {
    document.getElementById('suggestions').classList.add('hidden');
    return;
  }
  fetch(`https://api.openweathermap.org/data/2.5/find?q=${query}&type=like&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const suggestions = document.getElementById('suggestions');
      suggestions.innerHTML = '';
      data.list.forEach(city => {
        const div = document.createElement('div');
        div.textContent = city.name;
        div.addEventListener('click', () => {
          fetchWeather(city.name);
          suggestions.classList.add('hidden');
        });
        suggestions.appendChild(div);
      });
      suggestions.classList.remove('hidden');
    });
}

function fetchWeather(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
    .then(response => response.json())
    .then(displayCurrentWeather);
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
    .then(response => response.json())
    .then(displayForecast);
}

function displayCurrentWeather(data) {
  document.getElementById('city-name').textContent = data.name;
  document.getElementById('temperature').textContent = `${data.main.temp}°${isCelsius ? 'C' : 'F'}`;
  document.getElementById('weather-condition').textContent = data.weather[0].description;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('wind-speed').textContent = `Wind Speed: ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}`;
  document.getElementById('weather-icon').src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  document.getElementById('current-weather').classList.remove('hidden');
}

function displayForecast(data) {
  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.innerHTML = '';
  
  // сортирую прогноз чтобы у меня был лишь один прогноз на день
  const forecastByDate = {};

  data.list.forEach(day => {
    const date = new Date(day.dt * 1000).toLocaleDateString(); // привожу дату в читабельную форму так как в эйпиай дата дается по другому
    if (!forecastByDate[date]) {
      forecastByDate[date] = day; 
    }
  });

  
  const uniqueDates = Object.values(forecastByDate);

  uniqueDates.slice(0, 5).forEach(day => {
    const div = document.createElement('div');
    div.classList.add('forecast-day');
    div.innerHTML = `
      <h3>${new Date(day.dt * 1000).toLocaleDateString()}</h3>
      <img src="http://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="Weather icon">
      <p>${day.main.temp_min}°${isCelsius ? 'C' : 'F'} / ${day.main.temp_max}°${isCelsius ? 'C' : 'F'}</p>
      <p>${day.weather[0].description}</p>
    `;
    forecastContainer.appendChild(div);
  });

  document.getElementById('forecast').classList.remove('hidden');
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
        .then(response => response.json())
        .then(displayCurrentWeather);
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
        .then(response => response.json())
        .then(displayForecast);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function toggleUnit() {
  isCelsius = !isCelsius;
  const city = document.getElementById('city-name').textContent;
  if (city) fetchWeather(city);
}
