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

//load express instance
const app = express();

app.engine('hbs', hbs({defaultLayout : 'main.hbs'}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/weather', (req, res) => {
    console.info(req.query);

    const queryParams = 
    {
        APPID: openweatherKey,
        q: req.query['city'],
        units: req.query['units']
    };

    Request.get('https://api.openweathermap.org/data/2.5/weather', 
        { qs: queryParams},
        (err, apiRes, apiBody) => {
            if (err) {
                console.info('Err: ', err);
            }

            const result = JSON.parse(apiBody);

            res.status(200);
            res.type('text/html');

            if (result['cod'] == 200)
            {
                res.render('weather', 
                {
                    cityExists: true,
                    city: result['name'],
                    weather: result['weather'],
                    tempMin: result['main']['temp_min'],
                    tempMax: result['main']['temp_max'],
                    units: getDisplayUnit(req.query['units'])
                });
            }
            else {
                //city not found
                res.render('weather',
                {
                    cityExists: false,
                    city: req.query['city']
                });
            }
        }
    );
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