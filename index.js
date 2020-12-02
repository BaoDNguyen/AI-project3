const express = require('express');
// will use this later to send requests
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

// post
app.post('/weatherBot', (req, res) => {

    dialogflowFulfillment(req,res);

    // const weatherKey = '3f2b39ee96bea5d53296ae364ac222de';
    // var cityName = 'London';
    //
    // const reqUrl = encodeURI(
    //     `http://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${weatherKey}`
    // );
    //
    // http.get(
    //     reqUrl,
    //     (responseFromAPI) => {
    //
    //         let completeResponse = '';
    //         responseFromAPI.on('data', (chunk) => {
    //             completeResponse += chunk;
    //         })
    //         responseFromAPI.on('end', () => {
    //             try {
    //                 const weatherRespond = JSON.parse(completeResponse);
    //                 return res.json({weather: weatherRespond.list[0].weather[0].description});
    //             } catch (e) {
    //                 console.error(e.message);
    //             }
    //         });
    //     }).on('error',(e)=>{
    //         console.error('Got error: ${e.message}')
    // });
});

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request,response});

    function sayHello(agent) {
        agent.add('respond from my code!');
    }

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent',sayHello);
    agent.handleRequest(intentMap);

}

