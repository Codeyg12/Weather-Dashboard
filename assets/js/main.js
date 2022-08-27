let newRowEl = $("<tr>");
let currentWeatherData = $(".currentWeather");
let previousCities = [];

function searchHistory() {
  previousCities = JSON.parse(localStorage.getItem("search"));

  $(".recentSearches").empty()
  $(previousCities).each(function (i) {
    let locationBtn = $("<button>")
      .text(previousCities[i])
      .addClass("localBtn button is-dark ml-1 has-text-centered mt-3");
    $(".recentSearches").append(locationBtn);
  });
  $(".localBtn").click(function (e) {
    currentConditions(e.target.innerHTML);
  });
}


function updateStorage(city) {
  if (!previousCities.includes(city)) {
    previousCities.push(city);

    localStorage.setItem("search", JSON.stringify(previousCities));

    searchHistory();
  }
}

// Current weather
function currentConditions(city) {
  let apiCall =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&appid=0830fec5fefb765b207129fdb7fcdf86&units=imperial";

  $.ajax({
    url: apiCall,
    method: "GET",
  }).then(function (data) {
    console.log(data);
    $("#currentCondition").empty()
    //Creating new elements to place into table
    let cityName = data.name;

    let weatherIcon = data.weather[0].icon;
    let weatherIconEl = "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
    let tempData = data.main.temp + "℉"
    let humidData = data.main.humidity + "%"
    let windData = data.wind.speed + "MPH"

    //Appends the new elements onto the page
    
    //Grabs lat and lon for new fetch
    let lat = data.coord.lat;
    let long = data.coord.lon;

    //Uses new lat and lon for more specific answers
    fiveDayForecast(lat, long, cityName, tempData, weatherIconEl, humidData, windData);
    updateStorage(cityName);
  });
}

//Five day forecast
function fiveDayForecast(lat, long, name, temp, weather, humid, wind) {
  let apiCall =
  "https://api.openweathermap.org/data/2.5/onecall?lat=" +
  lat +
    "&lon=" +
    long +
    "&exclude=alerts,hourly,minutely&appid=0830fec5fefb765b207129fdb7fcdf86&units=imperial";
    $.ajax({
    url: apiCall,
    method: "GET",
  }).then(function (data) {
    let date = dayjs().format("MM/DD/YYYY")
    //New element for UVI
    let uviLog= data.current.uvi;
  
    let currentWeatherInfo = `
    <h2 class="subtitle has-text-centered is-size-3 has-text-black"> 
    Current Weather Conditions <img src="${weather}">
  </h2>
    <h3 class="is-size-3 has-text-centered mb-2">${name} ${date}</h3>
    <ul id="currentList">
      <li class="is-size-4 has-text-centered">Temperature: ${temp}</li>
      <li class="is-size-4 has-text-centered">Wind Speeds: ${wind}</li>
      <li class="is-size-4 has-text-centered">Humidity: ${humid}</li>
      <li class="is-size-4 has-text-centered" id="uvi">UV Index:</li>
      </ul>`
      
      currentWeatherData.html(currentWeatherInfo);
      $("#uvi").html(`UV Index: <span class="uviD"> ${uviLog}</span>`)
      
    //Color coding the block for UVI based on results
    if (uviLog < 3) {
      $(".uviD").addClass("has-background-success");
    } else if (uviLog >= 3 && uviLog < 6) {
      $(".uviD").attr("class","has-background-warning");
    } else if (uviLog >= 6 && uviLog < 8) {
      $(".uviD").attr("class","tempHigh");
    } else if (uviLog >= 8 && uviLog < 11) {
      $(".uviD").attr("class","has-text-white has-background-danger");
    } else {
      $(".uviD").attr("class","has-text-white tempSwelter");
    }
    
    

    $("#fiveDayTable").empty();
    postForecast(data);
  });
}


//Populates the results from 5 day
function postForecast(data) {
  $(data.daily).each(function (i) {
    //runs through 5 times for each day
    if (i < 5) {
      let otherRow = $("<tr>");
      let dateData = new Date(data.daily[i].dt * 1000);
      let peopleDate = dateData.toLocaleDateString();
      let daysDate = $("<td>").text(peopleDate).addClass("is-size-3");
      let forecastWeatherIcon = data.daily[i].weather[0].icon;
      let forecastIcon = $("<img>").attr(
        "src",
        "http://openweathermap.org/img/wn/" + forecastWeatherIcon + "@2x.png"
      );
      let forecastTemp = $("<td>")
        .text(data.daily[i].temp.day + "℉")
        .addClass("is-size-3");
      let forecastHumidity = $("<td>")
        .text(data.daily[i].humidity + "%")
        .addClass("is-size-3");
      let forecastWinds = $("<td>")
        .text(data.daily[i].wind_speed + "MPH")
        .addClass("is-size-3");

      //appends to table
      otherRow.append(
        daysDate,
        forecastTemp,
        forecastIcon,
        forecastHumidity,
        forecastWinds
      );
      $("#fiveDayTable").append(otherRow);
    }
  });
}

// Click listener
$("#citySelect").click(function (e) {
  e.preventDefault();
  let selectedCity = $("#city").val();
  $("#city").val("");
  currentConditions(selectedCity);
});

$("#clear").click(function () {
  localStorage.clear();
  location.reload();
});
