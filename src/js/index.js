const APIKEY = 'e1df1fc3a72e0ced10d2e8bac9563a73';
const FORM_CURRENT_WEATHER = document.getElementById('current-weather_form');
let city = null;

function getCity() {
    city = document.getElementById('city-name').value;
    if(!city) {
        console.log('enter city name');
        return;
    }
    loadData(city)
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
    let container = document.querySelector('.data-block');

        container.querySelector('.location').innerText = `${data.name}, ${data.sys.country}`
}

function errorHandler(jqXHR,statusStr,errorStr) {
    console.log(statusStr+' '+errorStr);
}

FORM_CURRENT_WEATHER.addEventListener('submit', function(e) {
    e.preventDefault();
    getCity();
});