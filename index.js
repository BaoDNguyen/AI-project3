const express = require('express');
// will use this later to send requests
const http = require('http');
// import env variables
//require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const dialogflow_fulfillment = require('dialogflow-fulfillment');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('Server is working.')
});

app.listen(port, () => {
    console.log(`🌏 Server is running at http://localhost:${port}`)
});

// app.post('/weatherBot', (req, res) => {
//
//     const weatherKey = '3f2b39ee96bea5d53296ae364ac222de';
//     var cityName = 'London';
//
//     const reqUrl = encodeURI(
//         `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherKey}`
//     );
//
//     http.get(
//         reqUrl,
//         (responseFromAPI) => {
//
//             let completeResponse = '';
//             responseFromAPI.on('data', (chunk) => {
//                 completeResponse += chunk;
//             })
//             responseFromAPI.on('end', () => {
//                 try {
//                     const weatherRespond = JSON.parse(completeResponse);
//                     return res.json({weather: weatherRespond.list[0].weather[0].description});
//                 } catch (e) {
//                     console.error(e.message);
//                 }
//             });
//         }).on('error',(e)=>{
//             console.error('Got error: ${e.message}')
//     });
// });

app.post('/weatherBot',(req,res)=>{
    const agent = new dialogflow_fulfillment.WebhookClient({
       request: req,
       response: res,
    });

    function greeting (agent) {
        agent.add('hello from Bao!');
    }

    let intentMap = new Map();

    intentMap.set('Default Welcome Intent',greeting);

    agent.handleRequest(intentMap);

});

