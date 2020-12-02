const express = require('express');

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

let history = {city:'',timePoint:'',weatherParameter:'',flowYN:0};

let management = require('./manageConversation');

// post
app.post('/weatherBot', (req, res) => {

    dialogflowFulfillment(req,res);

});

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request,response});

    let botRes = management.botMessage(agent,history);

    function addRes(agent) {
        if (botRes.message !== '') agent.add(botRes.message);
        else agent.add('Please tell me more!');
    }

    let intentMap = new Map();
    intentMap.set('agreement',addRes);
    intentMap.set('Default Welcome Intent',addRes);
    intentMap.set('disagreement',addRes);
    intentMap.set('weatherRequest',addRes);

    agent.handleRequest(intentMap);

}

