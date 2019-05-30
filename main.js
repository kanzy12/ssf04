//load node modules
const express = require('express');
const hbs = require('express-handlebars');
const Request = require('request');

//load config files
const keys = require('./keys.json');

//set tunables
const PORT = parseInt(process.argv[2] || 3000);
const openweatherKey = keys.openweatherkey;

//helper functions
var getDisplayUnit = (unitType) => {
    switch(unitType)
    {
        case 'metric':
            return 'C';
        case 'imperial':
            return 'F';
        default:
            return 'K';
    }
}

function getCityWeather(cityName, units) {
    const queryParams = 
    {
        APPID: openweatherKey,
        q: cityName,
        units: units
    };

    return new Promise((resolve, reject) => {
        Request.get('https://api.openweathermap.org/data/2.5/weather', 
            { qs: queryParams},
            (err, apiRes, apiBody) => {
                if (err) {
                    reject(err);
                }

                const result = JSON.parse(apiBody);

                if (result['cod'] == 200)
                {
                    resolve({
                        cityExists: true,
                        name: result['name'],
                        weather: result['weather'],
                        tempMin: result['main']['temp_min'],
                        tempMax: result['main']['temp_max'],
                    });
                }
                else {
                    resolve({
                        cityExists: false,
                        name: cityName
                    });
                }
            }
        );
    });
}

async function getAllCitiesWeather(citiesArray, units){
    return await Promise.all(citiesArray.map(city =>
        {
            return getCityWeather(city, units);
        }));
}

//load express instance
const app = express();

app.engine('hbs', hbs({defaultLayout : 'main.hbs'}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/weather', (req, res) => {
    let citiesString = req.query['city'];
    let citiesArray = citiesString.split(',').map(city => city.trim());
    let units = req.query['units'];

    getAllCitiesWeather(citiesArray, units).then(citiesWeather => {
        res.status(200);
        res.type('text/html');
        res.render('weather', 
        {
            cities: citiesWeather,
            units: getDisplayUnit(units)
        });
    })
    .catch(err => {
        console.info('Get All error: ', err);
    })

});

app.get(['/', '/index.html'], (req, res) => {
    res.status(200);
    res.type('text/html');
    res.render('query');
});

app.get(/.*/, express.static(__dirname + '/public'));

app.listen(PORT, () => {
    console.info(`App started on port ${PORT} at ${new Date()}`);
});