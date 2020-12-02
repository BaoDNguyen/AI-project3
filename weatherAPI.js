const weatherKey = '3f2b39ee96bea5d53296ae364ac222de';
const http = require('http');

function getWeatherInfo(cityName,timePoint,weatherParameter) {
    const reqUrl = encodeURI(
        `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherKey}`
    );

    let data;

    http.get(
        reqUrl,
        (responseFromAPI) => {

            let completeResponse = '';
            responseFromAPI.on('data', (chunk) => {
                completeResponse += chunk;
            })
            responseFromAPI.on('end', () => {
                try {
                    const weatherRespond = JSON.parse(completeResponse);
                    let N = weatherRespond.list.length;
                    let count = -1;
                    for (let i = 0; i < N; i++) {
                        if (weatherRespond.list[i].dt_txt === timePoint) {
                            switch (weatherParameter) {
                                case 'temperature':
                                    data = weatherRespond.list[i].main.temp;
                                    break;
                                case 'maximum temperature':
                                    data = weatherRespond.list[i].main.temp_max;
                                    break;
                                case 'minimum temperature':
                                    data = weatherRespond.list[i].main.temp_min;
                                    break;
                                case 'humidity':
                                    data = weatherRespond.list[i].main.humidity;
                                    break;
                                case 'weather':
                                    data = weatherRespond.list[i].weather.description;
                                    break;
                            }
                            break;
                        }
                        count += 1;
                    }
                    if (count === N-1) data = 'no data';

                    // return response.json({weather: weatherRespond.list[0].weather[0].description});
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error',(e)=>{
        console.error('Got error: ${e.message}')
    });

    return data;
}

module.exports.getWeatherInfo = getWeatherInfo;