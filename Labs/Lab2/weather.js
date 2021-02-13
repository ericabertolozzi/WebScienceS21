if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(currentWeather);
  } else {
    alert("Geolocation is not supported by this browser.");
}

function currentWeather(position) {
var lat = position.coords.latitude;
var long = position.coords.longitude;


$.getJSON(
  "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&APPID=68a01e80027a3c2fe93cc100dc4e0a80&units=imperial",
  function(data) {
      document.getElementById('city').innerHTML ="<b>"+ data.name +" "+ "Weather"+"</b>"
      document.getElementById('temp').innerHTML = data.main.temp+ "&deg;F"
      document.getElementById('feelslike').innerHTML ="Feels Like"+" "+ data.main.feels_like+ "&deg;F"
      document.getElementById('weatherdescription').innerHTML = data.weather[0].description;
  }
);
}