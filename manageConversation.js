const weatherAPI = require('./weatherAPI');

function botMessage (agent,history) {

    let message = '';
    let flowYN = history.flowYN;
    let myHis = history;

    let cityName = history.city;
    let timePoint = history.timePoint;
    let weatherParameter = history.weatherParameter;

    let data;

    let intent = agent.intent;

    let askCity = [
        'Which city do you want to get weather information?',
        'Please tell me the city that you want to access weather information',
        'which is the city in your interest?',
        'Please give me name of the city',
    ];

    let askTime = [
        'Can you provide me what time you need to know the weather for?',
        'Do you want to know the weather in the morning, in the afternoon, in the evening, or at night?',
        'What time? Please!',
        'I need a time/hour to request my weather API',
    ];

    let askDate = [
        'Which date do you want to get weather data?',
        'Please specify the time for me to look up to my weather API to get information on that date.',
        'When is the date that you want to access its weather data?',
        'Please tell me the date that you want to request data for.',
    ];

    let askWeatherParameter = [
      'Which information do you want to know: weather, temperature, or humidity?',
      'Do you want to know temperature, humidity, or the weather?',
      'Please specify the information that you want to know: weather, temperature, or humidity?',
      'Please tell me which parameter you want to request: weather, temperature, or humidity?',
    ];

    let askCheck = [
        'Please check whether you type the information correctly or not?',
        'Do you type the information correctly?',
        'Are you sure that you provide correct information?',
        'Please double check the information again! Is it correct?',
    ];

    // find date original
    let d = new Date();
    let currentDateArr = d.toDateString().split(' ');
    let month = new Map();
    month.set('01','Jan');
    month.set('02','Feb');
    month.set('03','Mar');
    month.set('04','Apr');
    month.set('05','May');
    month.set('06','Jun');
    month.set('07','Jul');
    month.set('08','Aug');
    month.set('09','Sep');
    month.set('10','Oct');
    month.set('11','Nov');
    month.set('12','Dec');
    let daysInMonth = new Map();
    daysInMonth.set('Jan',31);
    if (+currentDateArr[3]%4===0) daysInMonth.set('Feb',29);
    else daysInMonth.set('Feb',28);
    daysInMonth.set('Mar',31);
    daysInMonth.set('Apr',30);
    daysInMonth.set('May',31);
    daysInMonth.set('Jun',30);
    daysInMonth.set('Jul',31);
    daysInMonth.set('Aug',31);
    daysInMonth.set('Sep',30);
    daysInMonth.set('Oct',31);
    daysInMonth.set('Nov',30);
    daysInMonth.set('Dec',31);
    let dayArr = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    let dayMap = new Map();
    dayMap.set('Mon',0);
    dayMap.set('Tue',1);
    dayMap.set('Wed',2);
    dayMap.set('Thu',3);
    dayMap.set('Fri',4);
    dayMap.set('Sat',5);
    dayMap.set('Sun',6);

    try {
        switch (intent) {
            // greet
            case 'Default Welcome Intent':
                message = 'Welcome to Weather Assistant! How can I help you?';
                break;

            // try to get information
            case 'weatherRequest':
                let parameters = agent.parameters;
                // city first
                if (parameters.city !== '') cityName = parameters.city;
                else if (cityName === '') message = askCity[Math.floor(Math.random()*askCity.length)];
                // time next
                if (message === '') {
                    if (parameters['date'] !== '') {
                        timePoint = '';
                        timePoint += parameters['date'].split('T')[0] + ' ';
                        if (parameters.time !== '') {
                            let t = parameters.time.split('T')[1].split('-')[0].split(':')[0];
                            let tt = Math.round(+t/3)*3;
                            if (tt === 24) tt = 0;
                            timePoint += tt.toString()+':00:00';
                        } else if (parameters['time-period'] !== '') {
                            let t = parameters['time-period'].startTime.split('T')[1].split('-')[0].split(':')[0];
                            let tt = Math.round(+t/3)*3;
                            if (tt === 24) tt = 0;
                            timePoint += tt.toString()+':00:00';
                        } else message = askTime[Math.floor(Math.random()*askTime.length)];
                    } else if (parameters['date-period'] !== '') {
                        timePoint = '';
                        timePoint += parameters['date-period'].startDate.split('T')[0]+' ';
                        if (parameters['time'] !== '') {
                            let t = parameters.time.split('T')[1].split('-')[0].split(':')[0];
                            let tt = Math.round(+t/3)*3;
                            if (tt === 24) tt = 0;
                            timePoint += tt.toString()+':00:00';
                        } else if (parameters['time-period'] !== '') {
                            let t = parameters['time-period'].startTime.split('T')[1].split('-')[0].split(':')[0];
                            let tt = Math.round(+t/3)*3;
                            if (tt === 24) tt = 0;
                            timePoint += tt.toString()+':00:00';
                        } else message = askTime[Math.floor(Math.random()*askTime.length)];
                    } else if (timePoint === '') message = askDate[Math.floor(Math.random()*askDate.length)];
                }
                // final is weather parameters
                if (message === '') {
                    if (parameters.weatherParameter !== '') weatherParameter = parameters.weatherParameter;
                    else if (weatherParameter === '') message = askWeatherParameter[Math.floor(Math.random()*askWeatherParameter.length)];
                }
                // enough information
                if (message === '') {
                    data = weatherAPI.getWeatherInfo(cityName,timePoint,weatherParameter);
                    if (data) {
                        if (data !== 'no data') {
                            // find date original
                            let tArr = timePoint.split(' ');
                            let dDate = 0;
                            if (month.get(tArr[0].split('-')[1]) === currentDateArr[1]) dDate = (+tArr[0].split('-')[2]) - (+currentDateArr[2]);
                            else dDate = (+tArr[0].split('-')[2]) + (+daysInMonth.get(currentDateArr[1])) - (+currentDateArr[2]);
                            let dR = dayArr[dayMap.get(currentDateArr[0])+dDate];
                            let resDate = (dayMap.get(currentDateArr[0])+dDate <=6) ? 'this '+dR : 'next '+dR;
                            // find time original
                            let resTime = timePoint.split(' ')[1].split(':')[0];

                            message = 'Can I verify information before querying data? You want to know '+weatherParameter+' in '+cityName+' on '+resDate+' at around '+resTime+' o\'clock, correct?';
                            myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:10};  // open flow 10

                        } else {
                            message = 'Our weather API is a 5 day weather forecast (from today). Is your request time in this range?';
                            // open flow 100
                            myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:100};
                        }
                    } else {
                        message = askCheck[Math.floor(Math.random()*askCheck.length)];
                        // open flow 1000
                        myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:1000};
                    }
                }
                break;

            // verify information
            case 'agreement':
                if (flowYN === 10) { // flow 10: verify all info => correct?
                    data = weatherAPI.getWeatherInfo(cityName,timePoint,weatherParameter);
                    // find date original
                    let tArr = timePoint.split(' ');
                    let dDate = 0;
                    if (month.get(tArr[0].split('-')[1]) === currentDateArr[1]) dDate = (+tArr[0].split('-')[2]) - (+currentDateArr[2]);
                    else dDate = (+tArr[0].split('-')[2]) + (+daysInMonth.get(currentDateArr[1])) - (+currentDateArr[2]);
                    let dR = dayArr[dayMap.get(currentDateArr[0])+dDate];
                    let resDate = (dayMap.get(currentDateArr[0])+dDate <=6) ? 'this '+dR : 'next '+dR;
                    // find time original
                    let resTime = timePoint.split(' ')[1].split(':')[0];
                    // appropriate message
                    switch (weatherParameter) {
                        case 'temperature':
                            data = Math.floor(data-273);
                            message = 'The temperature in '+cityName+' on '+resDate+' at around '+resTime+' is '+data.toString()+' degree Celsius';
                            break;
                        case 'maximum temperature':
                            data = Math.floor(data-273);
                            message = 'The maximum temperature in '+cityName+' on '+resDate+' at around '+resTime+' is '+data.toString()+' degree Celsius';
                            break;
                        case 'minimum temperature':
                            data = Math.floor(data-273);
                            message = 'The minimum temperature in '+cityName+' on '+resDate+' at around '+resTime+' is '+data.toString()+' degree Celsius';
                            break;
                        case 'humidity':
                            message = 'The humidity in '+cityName+' on '+resDate+' at around '+resTime+' is '+data.toString()+'%';
                            break;
                        case 'weather':
                            message = 'The weather in '+cityName+' on '+resDate+' at around '+resTime+' is '+data;
                            break;
                    }
                    myHis = {city:'',timePoint:'',weatherParameter:'',flowYN:0}; // back to flow 0
                }
                if (flowYN === 100) { // flow 100: correct time range?
                    message = 'There must be something wrong! Do you type your city correctly?';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:101};   // open flow 101
                }
                if (flowYN === 101) {  // flow 101: correct city?
                    message = 'What is about the weather\'s information? Is it in one of the following factors: weather, temperature, and humidity?';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:102}; // open flow 102
                }
                if (flowYN === 102) {  // flow 102: correct weather parameter?
                    message = 'There maybe some problems with my free weather API. Please retry the process again!';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:0};  // back to flow 0 - end flow
                }
                if (flowYN === 200) {  // flow 200: request another day?
                    message = askDate[Math.floor(Math.random()*askDate.length)];
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:0};  // end flow
                }
                if (flowYN === 1000) {  // flow 1000: check info => correct?
                    message = 'Our weather API is a 5 day weather forecast (from today). Is your request time in this range?';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:100};  // come to flow 100
                }
                break;

            // verify information
            case 'disagreement':
                if (flowYN === 10) { // flow 10: verify all info => correct?
                    message = 'Please update the information!';
                }
                if (flowYN === 100) {  // flow 100: correct time range?
                    message = 'Do you want to request weather information on another day?';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:200}; // open flow 200
                }
                if (flowYN === 101) {  // flow 101: correct city?
                    message = 'Please update the city name!';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:0};  // back to flow 0 - end flow
                }
                if (flowYN === 102) { // flow 102: correct weather parameter?
                    message = 'Please update the weather factor that you want to know!';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:0};  // back to flow 0 - end flow
                }
                if (flowYN === 200) {  // flow 200: request another day?
                    message = 'We are so sorry for the limitation of our services! If you have another request, please ask!';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:0};  // end flow
                }
                if (flowYN === 1000) {
                    message = 'Please update the information!';
                    myHis = {city:cityName,timePoint:timePoint,weatherParameter:weatherParameter,flowYN:0};  // end flow
                }
                break;
        }
    } catch (e) {
        message = 'Please ensure you provide correct information as following: one city, one time point, and one weather factor (one from weather description, temperature, or humidity). I will reset the process.';
        myHis = {city:'',timePoint:'',weatherParameter:'',flowYN:0};
    }

    console.log('data:',data);

    return {message: message, myHis: myHis};

}

module.exports.botMessage = botMessage;