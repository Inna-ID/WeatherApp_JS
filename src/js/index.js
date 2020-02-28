const APIKEY = 'e1df1fc3a72e0ced10d2e8bac9563a73';
const BTN_FORECAST_NOW = document.getElementById('btn_now');
const BTN_FORECAST_5 = document.getElementById('btn_forecast_5');
const BTN_FORECAST_TODAY = document.getElementById('btn_today_hourly');
const SEARCH_INPUT = document.querySelector('#city-name');
const DROP_DOWN = document.querySelector('.drop-down');
const cityListJSON = '../city.list.json';
let city = null;
let curentPlaceID = null;
let userPosition = {};
let requestedCity = {};
let msPerMinutes = 60000;
let isDayLight = true;
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
//['Sun','Mon','Tues','Wed','Thur','Fr','Sat']
const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


//dom elems
let successfulContainer = document.querySelector('.successful-container');
let errorContainer = document.querySelector('.error-container');
let forecastNowContainer = document.querySelector('.forecast_now');
let forecast5DaysContainer = document.querySelector('.forecast_five-days');
let forecastTodayContainer = document.querySelector('.forecast_today');

document.querySelector('#current-weather_form').addEventListener('submit', function(e) {
    e.preventDefault();
});


setZero = time => (
    time < 10 ? '0' + time : time
)

function setDayNightTheme(sunRiseMS, sunSetMS) {
    let ms = new Date().getTime();
    let wrapDiv = document.querySelector('.wrapper');
    isDayLight = false

    if(ms >= sunRiseMS && ms <= sunSetMS) {
        wrapDiv.classList.remove('night');
        wrapDiv.classList.add('day');
        isDayLight = true;
    } else {
        wrapDiv.classList.remove('day');
        wrapDiv.classList.add('night');
        isDayLight = false;
    }
}


function showSuccessfulLayout(elem) {
    errorContainer.style.display = 'none';
    for(let item of successfulContainer.children) {
        item.style.display = 'none';
    }
    elem.style.display = 'block';
}

function showErrorContainer(errorText) {
    successfulContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    document.querySelector('.error-text').innerText = errorText;
}

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

let weatherAnimationDiv = document.querySelector('#weather-anim');
function setWeatherConditionImg(wc, container) {
    switch(true) {
        case (wc == 'Clear') : isDayLight ? setWeatherAnimation('sunny', container) : setWeatherAnimation('moon', container); break;
        case (wc == 'Clouds') : setWeatherAnimation('cloudy', container); break;
        case (wc == 'few clouds') : isDayLight ? setWeatherAnimation('sunycloud', container) : setWeatherAnimation('mooncloud', container); break;
        case (wc == 'Drizzle') :
        case (wc == 'Rain') : setWeatherAnimation('rain', container); break;
        case (wc == 'Thunderstorm') : setWeatherAnimation('storm', container); break;
        case (wc == 'Snow') : setWeatherAnimation('snow', container); break;
        case (wc == 'Mist') : 
        case (wc == 'Smoke') : 
        case (wc == 'Haze') : 
        case (wc == 'Dust') : 
        case (wc == 'Fog') : 
        case (wc == 'Sand') : 
        case (wc == 'Squall') : 
        case (wc == 'Tornado') : setWeatherAnimation('mist', container); break;
    }
}

function setWeatherAnimation(wc, container) {
    container.className = '';
    container.className = wc
}

//////////// current weather ////////////

function fillSearchInputRequestedCity(city) {
    SEARCH_INPUT.value = city;
}

function getCity() {
    city = SEARCH_INPUT.value;
    if(!city) {
        showErrorContainer('Enter city name')
        return;
    }
    loadCurrentWeather(city);
}

function loadCurrentWeather(city) {
    fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`, {method: 'GET'} )
    .then(response => response.json())
    .then(currentWeatherLoaded)
    .catch(errorHandler)
}

function loadCurrentWeatherByID(id) {
    if(!id) {
        showErrorContainer('User coordinates not found');
        return;
    }
    fetch(`http://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${APIKEY}&units=metric`, {method: 'GET'} )
    .then(response => response.json())
    .then(currentWeatherLoaded)
    .catch(errorHandler)
}


function convertToTimeZone(timezone) {
    let localTimeZoneMS = (new Date().getTimezoneOffset() * msPerMinutes) * -1;
    let diffrence = localTimeZoneMS - (timezone * 1000);
    return diffrence;
}

function currentWeatherLoaded(data) {
    console.log(data);
    showSuccessfulLayout(forecastNowContainer);

    const {name: city, 
        timezone,
        sys: {country, sunrise, sunset},
        main: {temp, feels_like, humidity, pressure},
        wind: {speed: windSpeed, deg: windDeg},
        weather: {0:{description: weatherDescription, main: weatherCondition}} } = data;

    
    console.log(convertToTimeZone(timezone))
    var sunriseByUserTimezone = (sunrise * 1000) - convertToTimeZone(timezone);
    var sunsetByUserTimezone = (sunset * 1000) - convertToTimeZone(timezone);

    //convert data about sunrise and sunset in sec to ms
    let sunriseTime = new Date();
    let sunsetTime = new Date();
    sunriseTime.setTime(sunriseByUserTimezone);
    sunsetTime.setTime(sunsetByUserTimezone);  
    
    successfulContainer.querySelector('.location .value').innerText = `${city}, ${country}`;
    successfulContainer.querySelector('.temperature .value').innerText = `${temp.toFixed(1)}°C`;
    successfulContainer.querySelector('.feels-like .value').innerText = `${feels_like.toFixed(1)}°C`;
    successfulContainer.querySelector('.humidity .value').innerText = `${humidity} %`;
    successfulContainer.querySelector('.pressure .value').innerText = `${pressure} hpa`;
    successfulContainer.querySelector('.cloudiness .value').innerText = `${weatherDescription}`;
    successfulContainer.querySelector('.wind .value').innerText = `${windSpeed} m/s ${setWidDerection(windDeg)}`;
    successfulContainer.querySelector('.sunrise .value').innerText = `${setZero(sunriseTime.getHours())}:${setZero(sunriseTime.getMinutes())}`;
    successfulContainer.querySelector('.sunset .value').innerText = `${setZero(sunsetTime.getHours())}:${setZero(sunsetTime.getMinutes())}`;

    setDayNightTheme(sunrise * 1000, sunset * 1000);

    if(weatherDescription == 'few clouds') {
        setWeatherConditionImg('few clouds', weatherAnimationDiv); 
    } else {
        setWeatherConditionImg(weatherCondition, weatherAnimationDiv); 
    }      
}


function errorHandler(jqXHR,statusStr,errorStr) {
    showErrorContainer('City not found');
    console.log(statusStr+' '+errorStr);
}

BTN_FORECAST_NOW.addEventListener('click', function() {
    getCity();
});




//////////// forecast for 5 days ////////////

function loadForecast_5() {
    if(!requestedCity.id) {
        showErrorContainer('City not found');
        return;
    }

    fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${requestedCity.id}&appid=${APIKEY}`,
        {method: 'GET'}
    )
    .then(response => response.json())
    .then(forecast_5_Loaded)
    .catch(errorHandler);
}


function forecast_5_Loaded(data) {
    //loaded temperature in kelvin
    let forecast = data.list;  
    showSuccessfulLayout(forecast5DaysContainer)

    forecast5DaysContainer.innerHTML = '';
    let day;
    forecast.forEach(function(item) {
        let date = new Date(item.dt * 1000 + (new Date().getTimezoneOffset() * msPerMinutes));

        if(day != date.getDate()) {
            day = date.getDate();
            let dayDiv = document.createElement('div');
            dayDiv.className = 'day';
            let dateDiv = document.createElement('p');
            dateDiv.className = 'date';
            dateDiv.innerText = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
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
            forecast5DaysContainer.appendChild(dayDiv)
        } else {
            let curDayDiv = document.querySelectorAll('.forecast_five-days .day');
            curDayDiv = curDayDiv[curDayDiv.length-1];
            let curHoursDiv = curDayDiv.querySelector('.hours');
            //console.log(curHoursDiv)

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


BTN_FORECAST_5.addEventListener('click', function() {
    loadForecast_5();
});




//////////// forecast today hourly ////////////

function loadForecast_today() {
    if(!requestedCity.id) {
        showErrorContainer('City not found');
        return;
    }

    fetch(`http://api.openweathermap.org/data/2.5/forecast?id=${requestedCity.id}&appid=${APIKEY}`,
        {method: 'GET'}
    )
    .then(response => response.json())
    .then(forecast_today_Loaded)
    .catch(errorHandler);
}

function forecast_today_Loaded(data) {
    console.log(data)
    //loaded temperature in kelvin
    let forecast = data.list;
    showSuccessfulLayout(forecastTodayContainer)    
    forecastTodayContainer.innerHTML = '';

    let todayDate = new Date();
    let todayDay = todayDate.getDate();

    let dayDiv = document.createElement('div');
    dayDiv.className = 'day';
    let dateDiv = document.createElement('p');
    dateDiv.className = 'date';
    dateDiv.innerText = `${dayNames[todayDate.getDay()]}, ${todayDay} ${monthNames[todayDate.getMonth()]}`;
    let hoursDiv = document.createElement('div');
    hoursDiv.className = 'hours';

    forecast.forEach(function(item) {
        let date = new Date(item.dt * 1000 + (new Date().getTimezoneOffset() * msPerMinutes));
        if(todayDay == date.getDate() || (date.getDate() == todayDay+1 && date.getHours() == 0) ) {

            let hourDiv = document.createElement('div');
            hourDiv.className = 'hour';
            let timeDiv = document.createElement('p');
            timeDiv.className = 'time';
            timeDiv.innerText = `${setZero(date.getHours())}:${setZero(date.getMinutes())}`;

            let tempDiv = document.createElement('p');
            tempDiv.className = 'temperature';
            tempDiv.innerText =  `${Math.round(item.main.temp -273.15)}°C`;
            let windDiv = document.createElement('p');
            windDiv.className = 'wind';
            windDiv.innerText = `${Math.round(item.wind.speed)} m/s ${setWidDerection(item.wind.deg)}`;

            let iconBlockDiv = document.createElement('div');
            iconBlockDiv.className = 'weather-icon_block';
            let iconDiv = document.createElement('div');
            //conditionDiv.innerText = `${item.weather[0].description}`;
            iconBlockDiv.appendChild(iconDiv);


            hourDiv.appendChild(timeDiv)
            hourDiv.appendChild(iconBlockDiv)
            hourDiv.appendChild(tempDiv);
            hourDiv.appendChild(windDiv);
            
            hoursDiv.appendChild(hourDiv);            
            dayDiv.appendChild(dateDiv);

            if(item.weather[0].description == 'few clouds') {
                setWeatherConditionImg('few clouds', iconDiv); 
            } else {
                setWeatherConditionImg(item.weather[0].main, iconDiv); 
            }
 
        } else {
            return;
        }
        dayDiv.appendChild(hoursDiv);
        forecastTodayContainer.appendChild(dayDiv)


    })
}

BTN_FORECAST_TODAY.addEventListener('click', function() {
    loadForecast_today();
});

function errorHandler(jqXHR,statusStr,errorStr) {
    showErrorContainer('no data');
    console.log(statusStr+' '+errorStr);
}


//////// User geo location ////////

function findUserGEOLocation() {
    if (navigator.geolocation) {
        var timeoutVal = 1000000;
        //timeout - maximum response time.
        //maximumAge - time of storage geo data in cash
        if(JSON.stringify(userPosition) != "{}") {
            findClosestToUserPlace(userPosition)
        } else {
            navigator.geolocation.getCurrentPosition(successCallBackGEO, errorCallBack, 
                    { enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 10000000 });
        }
    } else {
        console.log("Geolocation не поддерживается данным браузером");
    }
}

function successCallBackGEO(userPos) {
    setUserCoordinates(userPos)
    findClosestToUserPlace();
}
function errorCallBack() {
    console.log('error')
}

function setUserCoordinates(userPos) {
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


        for(city of cityList) {
            cityLat = city.coord.lat;
            cityLon = city.coord.lon;            
            // latDif = Math.abs(userLat - cityLat);
            // lonDif = Math.abs(userLon - cityLon);
            latDif = userLat - cityLat;
            lonDif = userLon - cityLon;

            //find the distance between user coords and city(place) coords from the city list
            //by the Pythagorean theorem
            let distance = Math.sqrt( Math.pow(latDif, 2) + Math.pow(lonDif, 2) );

            if(distance < minDistance) {
                minDistance = distance;
                userPosition.city = city.name;
                userPosition.id = city.id;
                userPosition.country = city.country;
                // also set user position credentials for request city
                requestedCity.id = city.id;
                requestedCity.name = city.name;
            }
        }

        fillSearchInputRequestedCity(`${userPosition.city}, ${userPosition.country}`);
        loadCurrentWeatherByID(userPosition.id);
        console.log(userPosition)
    }
}

// on page load
findUserGEOLocation();




///////////////////  Auto Complete  /////////////////////

function autoComplete(curSym) {
    let request = new XMLHttpRequest();
    request.open('GET', cityListJSON);
    request.responseType = 'json';
    request.send();

    request.onload = function() {
        let cityList = request.response;
        let searchValue = SEARCH_INPUT.value.toLowerCase();
        let regExp = new RegExp(`^${searchValue}`);

        let fitCities = [];
        for(city of cityList) {
            
            if(searchValue != SEARCH_INPUT.value.toLowerCase()) {
                return;
            }
            if(regExp.test(city.name.toLowerCase())) {
                fitCities.push(city)
            }
        }

        // sort fitted cities by alphabet
        fitCities.sort(function(a,b) {
            var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
            if (nameA < nameB) {
                //sort by increase
                return -1
            }  
            if (nameA > nameB) {
                return 1
            }            
            return 0 // no sort
        })

        // clear offered cities
        DROP_DOWN.innerHTML = '';
        
        //the first 10 fitted and sorted cities
        fitCities.slice(0, 10).forEach( (city) => {
            fillDropDown(city.id, city.name, city.country)
        })
    }
}

function fillDropDown(id, city, country) {
    let ddItem = document.createElement('div');  
    ddItem.className = 'dd-item';
    ddItem.dataset.id = id;
    ddItem.innerText = `${city}, ${country}`;
    DROP_DOWN.appendChild(ddItem);

    if(!DROP_DOWN.classList.contains('show')) {
        DROP_DOWN.className += ' show';
    } 
}

SEARCH_INPUT.addEventListener('keyup', function() {
    let curSym = SEARCH_INPUT.value;
    if(SEARCH_INPUT.value.length < 3) {
        return;
    }
    
    autoComplete(curSym);
});

SEARCH_INPUT.addEventListener('focusin', function(e) {
    e.target.value = '';
    DROP_DOWN.className += ' show';
})

SEARCH_INPUT.addEventListener('focusout', function(e) {
    if(requestedCity.name) {
        e.target.value = requestedCity.name;
    }    
})

document.addEventListener('click', function(e) {
    // если элемент по которому кликнули не search-block или его дочерние элементы, то скрыть дроп даун
    if(e.target.parentElement !== DROP_DOWN && e.target != SEARCH_INPUT) {
        DROP_DOWN.classList.remove('show');
    }
})

DROP_DOWN.addEventListener('click', function(e) {
    if(!e.target.dataset.id) {
        return;
    }
    requestedCity.id = e.target.dataset.id;
    requestedCity.name = e.target.innerText;

    loadCurrentWeatherByID(requestedCity.id);
    e.target.parentElement.classList.remove('show');
    fillSearchInputRequestedCity(requestedCity.name);
})