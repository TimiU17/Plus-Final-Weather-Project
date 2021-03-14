// openweathermap.org API key
const apiKey = "a9abed235905509970fa4b0a3e21feb8";

// "celsiusTemperature" will be updated during each call to "displayWeatherCondition"
let degrees = document.querySelector(".temperature");
let celsiusTemperature = parseInt(degrees.textContent);

let fahrenheitLink = document.querySelector("#fahrenheit-link");
fahrenheitLink.addEventListener("click", displayFahrenheit);

let celsiusLink = document.querySelector("#celsius-link");
celsiusLink.addEventListener("click", displayCelsius);

function updateForecastFormat() {
  const forecastDegrees = document.querySelectorAll(".row3 .degrees");
  for (const degree of forecastDegrees) {
    const celsiusTemperature = degree.getAttribute('celsius');
    const degreeFormat = degree.textContent.substr(-1); // "C" or "F"
    if (document.querySelector("#celsius-link.active") && degreeFormat === 'F') {
      // Celsius format active, but forecast in Fahrenheit format => convert it to Celsius
      degree.textContent = Math.round(celsiusTemperature) + ' °C';
    }
    if (document.querySelector("#fahrenheit-link.active") && degreeFormat === 'C') {
      // Fahrenheit format active, but forecast in Celsius format => convert it to Fahrenheit
      const fahrenheiTemperature = (celsiusTemperature * 9) / 5 + 32;
      degree.textContent = Math.round(fahrenheiTemperature) + ' °F';
    }
  }
}

function displayFahrenheit(event) {
  if (event) {
    event.preventDefault();
  }
  celsiusLink.classList.remove("active");
  fahrenheitLink.classList.add("active");
  let fahrenheiTemperature = (celsiusTemperature * 9) / 5 + 32;
  let degrees = document.querySelector(".temperature");
  degrees.innerHTML = `${Math.round(fahrenheiTemperature)}°`;
  updateForecastFormat();
}

function displayCelsius(event) {
  if (event) {
    event.preventDefault();
  }
  celsiusLink.classList.add("active");
  fahrenheitLink.classList.remove("active");
  let degrees = document.querySelector(".temperature");
  degrees.innerHTML = `${Math.round(celsiusTemperature)}°`;
  updateForecastFormat();
}

// british date format
function getDaySuffix(day) {
  if (day % 10 == 1 && day !== 11) {
    return "st";
  } else if (day % 10 == 2 && day != 12) {
    return "nd";
  } else if (day % 10 == 3 && day != 13) {
    return "rd";
  } else {
    return "th";
  }
}

function getDayOfWeek(date) {

  return date.toLocaleString('en-us', {  weekday: 'short' });
}

function formatDate(date) {
  let hours = date.getHours();
  if (hours < 10) {
    hours = `0${hours}`;
  }
  let minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  let day = getDayOfWeek(date);

  let currentDayNth = currentTime.getDate() + getDaySuffix(currentTime.getDate());
  let monthsIndex = date.getMonth();
  let months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  let month = months[monthsIndex];
  let currentYear = date.getFullYear();
  let formattedDate = `${day}, ${month} ${currentDayNth}<br>${hours}:${minutes} ${currentYear}`;
  return formattedDate;
}

let date = document.querySelector(".date");
let currentTime = new Date();
date.innerHTML = formatDate(currentTime);


function processForecast(response) {
  let dailyTempMax = {};
  for (const item of response.data.list) {
    const day = item.dt_txt.substr(0, 10);
    const tempMax = item.main.temp_max;
    if (!dailyTempMax[day]) {
      // first "tempMax" for this day
      dailyTempMax[day] = tempMax;
    } else {
      // new "tempMax" for this day => keep the highest one
      dailyTempMax[day] = Math.max(dailyTempMax[day], tempMax);
    }
  }

  let forecastHtml = '';
  const finalFiveDays = Object.keys(dailyTempMax).slice(-5);
  for (const day of finalFiveDays) {
    const tempMax = dailyTempMax[day];
    // get the weekday name
    const dayOfWeek = getDayOfWeek(new Date(day));
    forecastHtml += '<div class="col">' + dayOfWeek + '</br><span class="degrees" celsius="' + tempMax + '">' + parseInt(tempMax) + ' °C</span></div>';
  }
  // update the 5-day forecast HTML, and then its temperature format
  document.querySelector('.row3').innerHTML = forecastHtml;
  updateForecastFormat();
}

// temperature, city and details
function displayWeatherCondition(response) {
  document.querySelector(".city").innerHTML = response.data.name;

  // update the temperature and display it in the currently-active format (C/F)
  celsiusTemperature = response.data.main.temp;
  if (document.querySelector("#celsius-link.active")) {
    displayCelsius();
  } else {
    displayFahrenheit();
  }

  document.querySelector("#humidity").innerHTML = `Humidity: ${response.data.main.humidity}%`;
  document.querySelector("#wind").innerHTML = `Wind: ${Math.round(response.data.wind.speed)}km/h`;
  document.querySelector("#description").innerHTML = `State: ${response.data.weather[0].description}`;
  document.querySelector("#real_feel").innerHTML = `Feels like: ${Math.round(response.data.main.feels_like)}`;
  let iconElement = document.querySelector(".icon");
  iconElement.setAttribute("src",`http://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`);
  

  let backgroundDiv = document.querySelector(".container");
  if (response.data.main.temp > 15) {
    backgroundDiv.style.backgroundImage = 'url("summer.png")';
    document.querySelector(".quote").innerHTML = `This is just like winter,<br> except it's about 30 degrees warmer.`;
  } else if (response.data.main.temp > 0) {
    backgroundDiv.style.backgroundImage = 'url("default.png")';
    document.querySelector(".quote").innerHTML = `Beginning to smell a lot like spring.<br>Time to welcome the mosquitoes`;
  } else {
    backgroundDiv.style.backgroundImage = 'url("winter.png")';
    document.querySelector(".quote").innerHTML = `This looks like a good week</br>to stay inside and be a potato.`;
  }

  // make another request to get the 5-day forecast
  
  let apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${response.data.name}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(processForecast);
}

function searchCity(city) {
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(displayWeatherCondition);
}

function handleSubmit(event) {
  event.preventDefault();
  let city = document.querySelector(".search_button").value;
  searchCity(city);
}

// current location
function searchLocation(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  axios.get(apiUrl).then(displayWeatherCondition);
}

function getCurrentLocation(event) {
  if (event) {
    event.preventDefault();
  }
  navigator.geolocation.getCurrentPosition(searchLocation);
}

let searchForm = document.querySelector("#search_form");
searchForm.addEventListener("submit", handleSubmit);

let currentLocationButton = document.querySelector(".fa-map-marker-alt");
currentLocationButton.addEventListener("click", getCurrentLocation);