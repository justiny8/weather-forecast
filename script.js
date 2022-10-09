// Select all required elements and assign them to variables
const cityText = $("#city");
const tempText = $("#temp");
const tempDescription = $("#tempDescription")
const humidityText = $("#humidity");
const windText = $("#wind");
const mainIcon =$("#mainIcon");
const cardsRow = $("#cardsRow");
const weatherForecast = $("#forecastRow");
const displayCard = $("#displayCard");
const uvIndexText = $("#uvIndex");
const buttonList = $("#buttonsList");
const forecastDate = {};
const forecastIcon = {};
const forecastTemp = {};
const forecastHum = {};
const forecastWind = {};
const today = moment().format('MM' + "/" + 'DD' + '/' + 'YYYY');
const APIKey = "&units=imperial&APPID=209189943a26243e19e862011b35aa5e";
const url =  "https://api.openweathermap.org/data/2.5/weather?q=";
const cities = JSON.parse(localStorage.getItem("City")) || []; // ensure that cities variable is defined so that the push method does not fail

// Run the code once the entire page is ready
$(document).ready(function (){
    var userInput = cities[cities.length - 1];
    currentWeather(userInput);
    forecast(userInput);
    savedSearch();

});

// Display current weather of a city
function currentWeather(userInput) {
    mainIcon.empty(); // empty all child elements when function is ran
    const queryURL = url + userInput + APIKey;
    fetch (queryURL, { // fetch the city that was searched
    })
        .then(function(response){
            return response.json();
        })
        .then(function (data) { // grab the weather data from the API call
            let cityInfo = data.name;
            let country = data.sys.country; 
            let temp = data.main.temp;
            let humidity = data.main.humidity;
            let wind = data.wind.speed;
            let description = data.weather[0].description;
            let lat = data.coord.lat;
            let lon = data.coord.lon;
            let icon = data.weather[0].icon;
            let uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?" + "lat=" + lat + "&lon=" + lon + "&APPID=209189943a26243e19e862011b35aa5e"; // create uv index API url from the lat & lon data
            let mainImage = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + icon + "@2x.png"); // create image URL via https://openweathermap.org/weather-conditions
            mainIcon.append(mainImage);
            cityText.text(cityInfo + ", " + country + " " + today);
            tempText.text("Temperature: " + Math.round(temp) + " ºF"); // Round the temperature for readability
            tempDescription.text(description);
            humidityText.text("Humidity: " + humidity + " %");
            windText.text("Wind Speed: " + wind + " MPH");
            
            fetch (uvIndexURL, { // fetch UV index from uvIndexURL
            })
                .then(function (response) {
                    return response.json();
                })
                .then(function(uvIndex){
                    let uv = uvIndex.value; // grab UV index value from API call
                    let uvAlert = "";
                    if (uv <= 3) { // UV minimal
                        uvAlert = "green";
                    } else if (uv >= 3 & uv <= 6) { // UV moderate
                        uvAlert = "yellow";
                    } else if (uv >= 6 & uv <= 8) { // UV High
                        uvAlert = "orange";
                    } else {
                        uvAlert = "red"; // UV Very High
                    }
                    uvIndexText.empty();
                    const uvText = $("<p>").attr("class", "card-text").text("UV Index: ");
                    uvText.append($("<span>").attr("class", "uvindex").attr("style", ("background-color: " + uvAlert)).text(uv))
                    uvIndexText.append(uvText);
                    displayCard.attr("style", "display: flex; width: 95%;");
            });
        });
}

// Function for creating the 5 day forcast cards
function forecast (userInput) {
    weatherForecast.empty(); // empty all child elements when function is ran
    cardsRow.empty();
    const fiveDayForecast = $("<h2>").attr("class", "forecast").text("5-Day Forecast: ");
    const forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + userInput + "&units=imperial&APPID=209189943a26243e19e862011b35aa5e"; // Forecast API URL
    
    fetch(forecastURL, {
    })
        .then(function (response) {
            return response.json();
        })
        .then(function(data){ 
            for (let i = 0; i < data.list.length; i += 8){
                
                forecastDate[i] = data.list[i].dt_txt; // Grab the forecast data from API call
                forecastIcon[i] = data.list[i].weather[0].icon;
                forecastTemp[i] = data.list[i].main.temp;
                forecastWind[i] = data.list[i].wind.speed;
                forecastHum[i] = data.list[i].main.humidity;  

                let addCol = $("<div>").attr("class", "col-2"); // add new column div
                cardsRow.append(addCol);

                let addCard = $("<div>").attr("class", "card text-white bg-info mb-3"); // add card div into column
                addCard.attr("style", "max-width: 18rem;")
                addCol.append(addCard);

                let cardBody = $("<div>").attr("class", "card-body"); // add card body div to card
                addCard.append(cardBody);

                let cardDate = $("<h5>").attr("class", "card-title").text(moment(forecastDate[i]).format("MMM Do")); // add date info to card body
                cardBody.append(cardDate);

                let cardImage = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + forecastIcon[i] + "@2x.png"); // add weather icon to card body
                cardBody.append(cardImage);

                let cardTemp = $("<p>").attr("class", "card-text").text("Temp: " + Math.round(forecastTemp[i]) + "ºF"); // Round the temperature value for readability, add to card body
                cardBody.append(cardTemp);

                let cardWind = $("<p>").attr("class", "card-text").text("Wind: " + forecastWind[i] + " MPH"); // add Wind speed to card body
                cardBody.append(cardWind);

                let cardHum = $("<p>").attr("class", "card-text").text("Humidity: " + forecastHum[i] + " %"); // add humidity info to card body
                cardBody.append(cardHum);

                weatherForecast.append(fiveDayForecast); // add 5 day forecast to weatherForecast section
                };
            })
}

// Stored the cities
function storeSearch (userInput) {
    var userInput = $("#searchCity").val().trim().toLowerCase();
    var containsCity = false;

    if (cities != null) {

		$(cities).each(function(i) { // check to see if the stored data has the searched city
			if (cities[i] === userInput) {
				containsCity = true;
			}
		});
	}

	if (containsCity === false) { // if the city does not exist in storage, save the city
        cities.push(userInput);
	}

	localStorage.setItem("City", JSON.stringify(cities));
}

// Display saved city 
function savedSearch () {
    buttonList.empty() // empty all child elements when function is ran
    for (var i = 0; i < cities.length; i ++) {
        var newButton = $("<button>").attr("type", "button").attr("class","savedBtn btn btn-secondary btn-lg btn-block"); // button variable for cities
        newButton.attr("data-name", cities[i])
        newButton.text(cities[i]); // add city to button text
        buttonList.prepend(newButton); // add searched city to the button list
    }
    $(".savedBtn").on("click", function(event){ // event listener for when a saved button is clicked
        event.preventDefault();
        var userInput = $(this).data("name");
        currentWeather(userInput); // pull the current weather and forecast when a saved city button is clicked
        forecast(userInput);
    })
}

// event listener for clicking search key
$(".btn").on("click", function (event){
    event.preventDefault();
    if ($("#searchCity").val() === "") { // alert user if no text was detected in search
    alert("Please enter a valid city to view its current weather.");
    } else
    var userInput = $("#searchCity").val().trim().toLowerCase();
    currentWeather(userInput); // pull current weather and forecast data after city search
    forecast(userInput);
    storeSearch(); // store the searched city
    savedSearch(); // add the searched city to the button list
    $("#searchCity").val(""); // empty the search bar
})
