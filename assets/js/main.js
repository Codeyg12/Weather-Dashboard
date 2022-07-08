$(document).ready(function () {
  //sets array for user searched cities
  let previousCities = [];
  let apiKey = "0830fec5fefb765b207129fdb7fcdf86";
  let currentWeatherData = $("#currentData");
  let newRowEl = $("<tr>");
  
  //checks local for cities
  function previousSearch() {
    previousCities = JSON.parse(localStorage.getItem("previousCities"));
    $(".receentSearches").empty();
    //builds a button for every local storage item
    $(previousCities).each(function (i) {
      let locationBtn = $("<button>")
        .text(previousCities[i])
        .addClass("localBtn button is-dark ml-1 has-text-centered mt-3");
      $(".recentSearches").append(locationBtn);
    });
  }
  
  if (localStorage.getItem("previousCities") !== null) {
    previousSearch();
  }
  
  //Sets click function on city input
  $("#citySelector").click(function (event) {
    event.preventDefault();
  
    // uses the picked city to put into functions
    let cityPicked = $("#city").val();
    $("#city").val("");
  
    //checks for the indexed number in the array matching the selected city
    if (previousCities.indexOf(cityPicked) < 0) {
      previousCities.push(cityPicked);
    }
  
    //puts information into local storage
    localStorage.setItem("lastSearch", cityPicked);
    localStorage.setItem("previousCities", JSON.stringify(previousCities));
  
    //Fetching first set of information using city name
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/weather?q=" +
        cityPicked +
        "&appid=" +
        apiKey +
        "&units=imperial",
      method: "GET",
    }).then(function (data) {
      console.log(data);
  
      //Creating new elements to place into table
      let nameData = $("<td>").append(cityPicked).addClass("is-size-3");
      let weatherIcon = data.weather[0].icon;
      let weatherIconEl = $("<img>").attr(
        "src",
        "http://openweathermap.org/img/wn/" + weatherIcon + "@2x.png"
      );
      let tempData = $("<td>")
        .text(data.main.temp + "℉")
        .addClass("is-size-3");
      let humidData = $("<td>")
        .text(data.main.humidity + "%")
        .addClass("is-size-3");
      let windData = $("<td>")
        .text(data.wind.speed + "MPH")
        .addClass("is-size-3");
  
      //Appends the new elements onto the page
      newRowEl.append(nameData, tempData, weatherIconEl, humidData, windData);
      currentWeatherData.append(newRowEl);
  
      //Grabs lat and lon for new fetch
      let latitude = data.coord.lat;
      let longitude = data.coord.lon;
  
      //Uses new lat and lon for more specific answers
      grabUVIData(latitude, longitude);
      findForecast(latitude, longitude);
    });
  
    //Another fetch to using lat an dlon to get UVI
    function grabUVIData(latitude, longitude) {
      $.ajax({
        url:
          "https://api.openweathermap.org/data/2.5/onecall?lat=" +
          latitude +
          "&lon=" +
          longitude +
          "&exclude=alerts,hourly,minutely&appid=" +
          apiKey +
          "&units=imperial",
        method: "GET",
      }).then(function (data) {
        console.log(data);
  
        //New element for UVI
        let uviLog = data.current.uvi;
        let uviData = $("<td>").text(uviLog);
  
        //Color coding the block for UVI based on results
        if (uviLog < 3) {
          uviData.addClass("is-size-3 has-background-success");
        } else if (uviLog >= 3 && uviLog < 6) {
          uviData.addClass("is-size-3 has-background-warning");
        } else if (uviLog >= 6 && uviLog < 8) {
          uviData.addClass("is-size-3 tempHigh");
        } else if (uviLog >= 8 && uviLog < 11) {
          uviData.addClass("is-size-3 has-background-danger");
        } else {
          uviData.addClass("is-size-3 has-text-white tempSwelter");
        }
        newRowEl.append(uviData);
        currentWeatherData.append(newRowEl);
      });
    }
  });
  
  //uses lat and lon to get 5 day forecast
  function findForecast(latitude, longitude) {
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/onecall?lat=" +
        latitude +
        "&lon=" +
        longitude +
        "&exclude=alerts,hourly,minutely&appid=" +
        apiKey +
        "&units=imperial",
      method: "GET",
    }).then(function (data) {
      console.log(data);
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
  
  //THE FOLLOWING LINES DONT WORK YET
  //Get forecast from local
  if ("lastSearch" !== null) {
    let cityStorage = localStorage.getItem("lastSearch");
    // currentConditions(cityStorage);
  }
  
  $("#clear").click(function () {
    localStorage.clear();
    location.reload();
  });
  
  //clicking previous city button should return results
  $(document).on("click", "localBtn", function () {
    let citySelect = $(this).text();
    // currentConditions(citySelect);
  });

})


  