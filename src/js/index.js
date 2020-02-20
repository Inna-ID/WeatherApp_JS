const APIKEY = 'e1df1fc3a72e0ced10d2e8bac9563a73';
//const MAP_API_URL = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBu_KZxeeOWKC1tnynobv1-ef7TD-qCNiM&libraries=places'; 
const BTN_FORECAST_NOW = document.getElementById('btn_now');
const BTN_FORECAST_5 = document.getElementById('btn_forecast_5');
const SEARCH_INPUT = document.querySelector('#city-name');
const cityListJSON = '../city.list.json';
let city = null;
let curentPlaceID = null;
let userPosition = {};
let msPerMinutes = 60000;
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

//dom elems
let successfulContainer = document.querySelector('.successful-container');
let errorContainer = document.querySelector('.error-container');

function getCity() {
    city = document.getElementById('city-name').value;
    if(!city) {
        console.log('enter city name');
        return;
    }
    loadCurrentWeather(city);
}

setZero = time => (
    time < 10 ? '0' + time : time
)

function setWidDerection(deg) {
    switch(true) {
      case (deg >= 350 || deg <= 10): return 'Northern ⭣';
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


function setWeatherConditionImg(wc) {
    switch(true) {
        case (wc == 'broken clouds') : return
    }
}


function loadCurrentWeather(city) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`, {method: 'GET'} )
    .then(response => response.json())
    .then(currentWeatherLoaded)
    //.catch(error => { console.error(error) } );
    .catch(errorHandler)
}

function loadCurrentWeatherByID(id) {
    //userPosition.id = '625144'
    if(!id) {
        console.log('no user position id')
        return;
    }
    fetch(`http://api.openweathermap.org/data/2.5/weather?id=${userPosition.id}&appid=${APIKEY}&units=metric`, {method: 'GET'} )
    .then(response => response.json())
    .then(currentWeatherLoaded)
    //.catch(error => { console.error(error) } );
    .catch(errorHandler)
}

function convertToGTM0(timezone) {

}

function currentWeatherLoaded(data) {
    console.log(data);

    hideAllChilds(successfulContainer)
    document.querySelector('.forecast_now').style.display = 'block';

    const {name: city, 
        timezone,
        sys: {country, sunrise, sunset},
        main: {temp, feels_like, humidity, pressure},
        wind: {speed: windSpeed, deg: windDeg},
        weather: {0:{description: cloudiness}} } = data;

    //convert data obout sunrise and sunset in sec to ms
    let sunriseTime = new Date();
    let sunsetTime = new Date();
    sunriseTime.setTime(sunrise * 1000);
    sunsetTime.setTime(sunset * 1000);  
    
    successfulContainer.querySelector('.location .value').innerText = `${city}, ${country}`;
    successfulContainer.querySelector('.temperature .value').innerText = `${temp.toFixed(1)}°C`;
    successfulContainer.querySelector('.feels-like .value').innerText = `${feels_like.toFixed(1)}°C`;
    successfulContainer.querySelector('.humidity .value').innerText = `${humidity} %`;
    successfulContainer.querySelector('.pressure .value').innerText = `${pressure} hpa`;
    successfulContainer.querySelector('.cloudiness .value').innerText = `${cloudiness}`;
    successfulContainer.querySelector('.wind .value').innerText = `${windSpeed} m/s ${setWidDerection(windDeg)}`;
    successfulContainer.querySelector('.sunrise .value').innerText = `${setZero(sunriseTime.getHours())}:${setZero(sunriseTime.getMinutes())}`;
    successfulContainer.querySelector('.sunset .value').innerText = `${setZero(sunsetTime.getHours())}:${setZero(sunsetTime.getMinutes())}`;
}


function errorHandler(jqXHR,statusStr,errorStr) {
    //successfulContainer.classList.remove('visible');
    hideAllChilds(successfulContainer);

    errorContainer.style.display = 'block';
    document.querySelector('.error-text').innerText = 'city not found';
    console.log(statusStr+' '+errorStr);
}

BTN_FORECAST_NOW.addEventListener('click', function(e) {
    getCity();
});

//////////// forecast for 5 days

function loadForecast() {
    let cityID;
    if(userPosition.id) {
        cityID = userPosition.id;
    } else {
        cityID = '625144';
    }

    fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${cityID}&appid=${APIKEY}`,
        {method: 'GET'}
    )
    .then(response => response.json())
    .then(forecastLoaded)
    .catch(errorHandler);
}


function forecastLoaded(data) {
    //loaded temperature in kelvin
    let forecast = data.list;
    let container = document.querySelector('.forecast_five-days')
    console.log(data);

    
    //successfulContainer.classList.add('visible');
    hideAllChilds(successfulContainer)
    container.style.display = 'block';


    let day;
    forecast.forEach(function(item) {        
        console.log(`${Math.round(item.main.temp -273.15)}°C at ${item.dt_txt}`)
        // let newStr = item.dt_txt;
        // newStr = newStr.split(/-|:|\s/).filter(x => x != '');
        // newStr = newStr.join();

        console.log(item.dt_txt)
        let date = new Date(item.dt * 1000 + (new Date().getTimezoneOffset() * msPerMinutes));


        if(day != date.getDate()) {
            day = date.getDate();
            let dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            let dateDiv = document.createElement('p');
            dateDiv.className = 'date';
            dateDiv.innerText = `${date.getDate()} ${monthNames[date.getMonth()]}`;
            let hoursDiv = document.createElement('div');
            hoursDiv.className = 'hours';
            let hourDiv = document.createElement('div');
            hourDiv.className = 'hour';
            let timeDiv = document.createElement('p');
            timeDiv.className = 'time';
            timeDiv.innerText = `${setZero(date.getHours())}:${setZero(date.getMinutes())}`;

            let tempDiv = document.createElement('p');
            tempDiv.className = 'temperature';
            tempDiv.innerText =  `${Math.round(item.main.temp -273.15)}°C`;

            hourDiv.appendChild(timeDiv)
            hourDiv.appendChild(tempDiv);
            hoursDiv.appendChild(hourDiv);
            
            dayDiv.appendChild(dateDiv);
            dayDiv.appendChild(hoursDiv);
            container.appendChild(dayDiv)
        } else {
            console.log(day)
            let curDayDiv = document.querySelectorAll('.day');
            curDayDiv = curDayDiv[curDayDiv.length-1];
            let curHoursDiv = curDayDiv.querySelector('.hours');
            console.log(curHoursDiv)

            let hourDiv = document.createElement('div');
            hourDiv.className = 'hour';
            let timeDiv = document.createElement('p');
            timeDiv.className = 'time';
            timeDiv.innerText = `${setZero(date.getHours())}:${setZero(date.getMinutes())}`;
            let tempDiv = document.createElement('p');
            tempDiv.className = 'temperature';
            tempDiv.innerText =  `${Math.round(item.main.temp -273.15)}°C`;

            hourDiv.appendChild(timeDiv)
            hourDiv.appendChild(tempDiv);
            curHoursDiv.appendChild(hourDiv);
        }
    });
}

function hideAllChilds(parent) {
    errorContainer.style.display = 'none';
    for(let item of parent.children) {
        item.style.display = 'none'
    }
    
}

BTN_FORECAST_5.addEventListener('click', function(e) {
    loadForecast();
});


////////

function findUserGEOLocation() {
    if (navigator.geolocation) {
        var timeoutVal = 1000000;
        //timeout - maximum response time.
        //maximumAge - time of storage geo data in cash
        if(JSON.stringify(userPosition) != "{}") {
            findClosestToUserPlace(userPosition)
        } else {
            navigator.geolocation.getCurrentPosition(successCallBack, errorCallBack, 
                    { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 10000000 });
        }
    } else {
        console.log("Geolocation не поддерживается данным браузером");
    }
}

function successCallBack(userPos) {
    setUserPosition(userPos)
    findClosestToUserPlace();
}
function errorCallBack() {
    console.log('error')
}

function setUserPosition(userPos) {
    userPosition.lat = userPos.coords.latitude;
    userPosition.lon = userPos.coords.longitude;
    console.log("User latitude: " + userPosition.lat + "\nUser longitude: " + userPosition.lon);
}

function findClosestToUserPlace() {
    let userLat = userPosition.lat;
    let userLon = userPosition.lon;
    let cityLat;
    let cityLon;

    let request = new XMLHttpRequest();
    request.open('GET', cityListJSON);
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        let cityList = request.response;
        let minDistance = 1;
        let minDistCity;

        //vilnius
        //userLat = 54.710535;
        //userLon = 25.262938;
        for(city of cityList) {
            cityLat = city.coord.lat;
            cityLon = city.coord.lon;
            
            // latDif = Math.abs(userLat - cityLat);
            // lonDif = Math.abs(userLon - cityLon);
            latDif = userLat - cityLat;
            lonDif = userLon - cityLon;

            let coordDif = Math.sqrt( Math.pow(latDif, 2) + Math.pow(lonDif, 2) );

            if(coordDif < minDistance) {
                minDistance = coordDif;
                minDistCity = city;
                userPosition.id = city.id
            }
        }
        console.log(minDistCity)
    }
}


// on page load
findUserGEOLocation();

loadCurrentWeatherByID(userPosition.id)

////////////////////////////////////////

function autoComplete() {    
    setTimeout( () => {
        let request = new XMLHttpRequest();
        request.open('GET', cityListJSON);
        request.responseType = 'json';
        request.send();
    
        request.onload = function() {
            let cityList = request.response;

            let regExp = new RegExp(`^${SEARCH_INPUT.value}`);

            for(city of cityList) {
                if(regExp.test(city.name.toLowerCase())) {
                    console.log(city.name)
                }
            }
        }
    }, 1000)
}
SEARCH_INPUT.addEventListener('keyup', autoComplete);