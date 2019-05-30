const keys = require('./keys.json');
const Request = require('request');

const openweatherKey = keys.openweatherkey;
console.info('Key: ', openweatherKey);

const params = 
    {
        APPID: openweatherKey,
        q: 'London'
    };

Request.get('https://api.openweathermap.org/data/2.5/weather', 
    { qs: params},
    (err, apiRes, apiBody) => {
        if (err) {
            console.info('Err: ', err);
        }
        console.info(apiBody);
    }
);

