const express = require('express');
const http = require('http');
// import env variables
//require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const {WebhookClient} = require('dialogflow-fulfillment');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('Server is working.')
});

app.listen(port, () => {
    console.log(`🌏 Server is running at http://localhost:${port}`)
});

let history = {city:'',date:'',time:'',weatherParameter:'',flowYN:0,data:''};

let management = require('./manageConversation');

const weatherKey = '3f2b39ee96bea5d53296ae364ac222de';

// post
app.post('/weatherBot', (req, res) => {

    dialogflowFulfillment(req,res);

});

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request,response});

    if (agent.intent === 'weatherRequest') {
        let hasCityName = agent.parameters.city !== '' || history.city !== '';
        let hasDate = agent.parameters.date !== '' || agent.parameters['date-period'] !== '' || history.date !== '';
        let hasTime = agent.parameters.time !== '' || agent.parameters['time-period'] !== '' || history.time !== '';
        let hasWeatherParameter = agent.parameters.weatherParameter[0] !== '' || history.weatherParameter !== '';

        if (!hasCityName || !hasDate || !hasTime || !hasWeatherParameter) {
            let botRes = management.botMessage(agent,history);
            history = botRes.myHis;

            let intentMap = new Map();
            intentMap.set('agreement',addRes1);
            intentMap.set('Default Welcome Intent',addRes1);
            intentMap.set('disagreement',addRes1);
            intentMap.set('weatherRequest',addRes1);

            agent.handleRequest(intentMap);

            function addRes1(agent) {
                if (botRes.message !== '') agent.add(botRes.message);
                else agent.add('Please tell me more!');
            }

        } else {
            let cityName = (agent.parameters.city !== '') ? agent.parameters.city : history.city;
            let timePoint = '';
            let hasNewDate = agent.parameters.date !== '' || agent.parameters['date-period'] !== '';
            let hasNewTime = agent.parameters.time !== '' || agent.parameters['time-period'] !== '';
            if (hasNewDate && !hasNewTime) {
                if (agent.parameters.date !== '') {
                    timePoint += agent.parameters.date.split('T')[0] + ' '+history.time;
                } else if (agent.parameters['date-period'] !== '') {
                    timePoint += agent.parameters['date-period'].startDate.split('T')[0]+' '+history.time;
                }
            } else if (hasNewDate && hasNewTime) {
                if (agent.parameters.date !== '') {
                    timePoint += agent.parameters.date.split('T')[0] + ' ';
                    if (agent.parameters.time !== '') {
                        let t = agent.parameters.time.split('T')[1].split('-')[0].split(':')[0];
                        let tt = Math.round(+t/3)*3;
                        if (tt === 24) tt = 0;
                        timePoint += tt.toString()+':00:00';
                    } else if (agent.parameters['time-period'] !== '') {
                        let t = agent.parameters['time-period'].startTime.split('T')[1].split('-')[0].split(':')[0];
                        let tt = Math.round(+t/3)*3;
                        if (tt === 24) tt = 0;
                        timePoint += tt.toString()+':00:00';
                    }
                } else if (agent.parameters['date-period'] !== '') {
                    timePoint += agent.parameters['date-period'].startDate.split('T')[0]+' ';
                    if (agent.parameters['time'] !== '') {
                        let t = agent.parameters.time.split('T')[1].split('-')[0].split(':')[0];
                        let tt = Math.round(+t/3)*3;
                        if (tt === 24) tt = 0;
                        timePoint += tt.toString()+':00:00';
                    } else if (agent.parameters['time-period'] !== '') {
                        let t = agent.parameters['time-period'].startTime.split('T')[1].split('-')[0].split(':')[0];
                        let tt = Math.round(+t/3)*3;
                        if (tt === 24) tt = 0;
                        timePoint += tt.toString()+':00:00';
                    }
                }
            } else if (!hasNewDate && hasNewTime) {
                timePoint = history.date+' ';
                if (agent.parameters['time'] !== '') {
                    let t = agent.parameters.time.split('T')[1].split('-')[0].split(':')[0];
                    let tt = Math.round(+t/3)*3;
                    if (tt === 24) tt = 0;
                    timePoint += tt.toString()+':00:00';
                } else if (agent.parameters['time-period'] !== '') {
                    let t = agent.parameters['time-period'].startTime.split('T')[1].split('-')[0].split(':')[0];
                    let tt = Math.round(+t/3)*3;
                    if (tt === 24) tt = 0;
                    timePoint += tt.toString()+':00:00';
                }
            } else if (!hasNewDate && !hasNewTime) timePoint = history.date+' '+history.time;

            let weatherParameter = (agent.parameters.weatherParameter[0] !== '') ? agent.parameters.weatherParameter[0] : history.weatherParameter;

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
                                            data = weatherRespond.list[i].weather[0].description;
                                            break;
                                    }
                                    break;
                                }
                                count += 1;
                            }
                            if (count === N-1) data = 'no data';

                             console.log('data1',data);
                             console.log('url',reqUrl);
                             console.log('city',cityName);
                             console.log('time',timePoint);
                             console.log('weather',weatherParameter);
                            //console.log(agent.parameters);

                            let botRes = management.botMessage(agent,history,data);
                            history = botRes.myHis;

                            let intentMap = new Map();
                            intentMap.set('agreement',addRes2);
                            intentMap.set('Default Welcome Intent',addRes2);
                            intentMap.set('disagreement',addRes2);
                            intentMap.set('weatherRequest',addRes2);

                            agent.handleRequest(intentMap);

                            function addRes2(agent) {
                                if (botRes.message !== '') agent.add(botRes.message);
                                else agent.add('Please tell me more!');
                            }

                            // return response.json({weather: weatherRespond.list[0].weather[0].description});
                        } catch (e) {
                            console.error(e.message);
                            return response.json({
                                fulfillmentText: 'Could not get results at this time',
                                source: 'weatherBot',
                            })
                        }
                    });
                }).on('error',(e)=>{
                console.error('Got error: ${e.message}');
                return response.json({
                    fulfillmentText: 'Could not get results at this time',
                    source: 'weatherBot',
                })
            });
        }
    } else {
        let botRes = management.botMessage(agent,history);
        history = botRes.myHis;

        let intentMap = new Map();
        intentMap.set('agreement',addRes3);
        intentMap.set('Default Welcome Intent',addRes3);
        intentMap.set('disagreement',addRes3);
        intentMap.set('weatherRequest',addRes3);

        agent.handleRequest(intentMap);

        function addRes3(agent) {
            if (botRes.message !== '') agent.add(botRes.message);
            else agent.add('Please tell me more!');
        }
    }



}

