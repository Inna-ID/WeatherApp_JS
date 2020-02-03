const APIKEY = 'e1df1fc3a72e0ced10d2e8bac9563a73';
const FORM_CURRENT_WEATHER = document.getElementById('current-weather_form');
let city = null;

//dom elems
let dataContainer = document.querySelector('.data-block');

function getCity() {
    city = document.getElementById('city-name').value;
    if(!city) {
        console.log('enter city name');
        return;
    }
    loadData(city)
}

setZero = time => (
    time < 10 ? '0' + time : time
)

function setWidDerection(deg) {
    switch(true) {
      case (deg >= 350 && deg <= 10): return 'Northern ⭣';
      case (deg > 10 && deg < 80): return 'Northeastern ⭩';
      case (deg >= 80 && deg <= 100): return 'Eastern ⭠';
      case (deg > 100 && deg < 170): return 'Southeastern ⭦';
      case (deg >= 170 && deg <= 190): return 'Southern ⭡';
      case (deg > 190 && deg < 260): return'Southwestern ⭧';
      case (deg >= 260 && deg <= 280): return 'Western ⭢';
      case (deg > 280 && deg < 350): return 'Northwestern ⭨';
      default: return '';
    }
}

function loadData(city) {
    $.ajax(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`,
    { 
        type:'GET', 
        dataType:'json', 
        success: dataLoaded, 
        error: errorHandler 
    }
)}

function dataLoaded(data) {
    console.log(data);
    const {name: city, 
        sys: {country, sunrise, sunset},
        main: {temp, feels_like, humidity},
        wind: {speed: windSpeed, deg: windDeg},
        clouds: {all: clouds} } = data;

    //convert data obout sunrise and sunset in sec to ms
    let sunriseTime = new Date();
    let sunsetTime = new Date();
    sunriseTime.setTime(sunrise * 1000);
    sunsetTime.setTime(sunset * 1000);    

    dataContainer.classList.add('visible');

    dataContainer.querySelector('.location span').innerText = `${city}, ${country}`;
    dataContainer.querySelector('.temperature span').innerText = `${temp}°C`;
    dataContainer.querySelector('.humidity span').innerText = `${humidity}%`;
    dataContainer.querySelector('.cloudiness span').innerText = `${clouds}%`;
    dataContainer.querySelector('.wind span').innerText = `${windSpeed}m/s, ${setWidDerection(windDeg)}`;
    dataContainer.querySelector('.sunrise span').innerText = `${setZero(sunriseTime.getHours())}:${setZero(sunriseTime.getMinutes())}:${setZero(sunriseTime.getSeconds())}`;
    dataContainer.querySelector('.sunset span').innerText = `${setZero(sunsetTime.getHours())}:${setZero(sunsetTime.getMinutes())}:${setZero(sunsetTime.getSeconds())}`;
}


function errorHandler(jqXHR,statusStr,errorStr) {
    dataContainer.classList.remove('visible');
    //dataContainer.
    console.log(statusStr+' '+errorStr);
}

FORM_CURRENT_WEATHER.addEventListener('submit', function(e) {
    e.preventDefault();
    getCity();
});