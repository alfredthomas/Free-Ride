/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-use-before-define */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const https = require('https');
//const DatabaseHelper = require('./database_helper');
//const databaseHelper = new DatabaseHelper();


// 1. Handlers ===================================================================================

const LaunchHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const responseBuilder = handlerInput.responseBuilder;

        const requestAttributes = attributesManager.getRequestAttributes();
        const speechOutput = `${requestAttributes.t('WELCOME')} ${requestAttributes.t('HELP')}`;
        return responseBuilder
            .speak(speechOutput)
            .reprompt(speechOutput)
            .getResponse();
    },
};

// const InProgressRecommendationIntent = {
//     canHandle(handlerInput) {
//       const request = handlerInput.requestEnvelope.request;
  
//       return request.type === 'IntentRequest'
//         && request.intent.name === 'RecommendationIntent'
//         && request.dialogState !== 'COMPLETED';
//     },
//     handle(handlerInput) {
//       const currentIntent = handlerInput.requestEnvelope.request.intent;
//       let prompt = '';
  
//       for (const slotName of Object.keys(handlerInput.requestEnvelope.request.intent.slots)) {
//         const currentSlot = currentIntent.slots[slotName];
//         if (currentSlot.confirmationStatus !== 'CONFIRMED'
//                   && currentSlot.resolutions
//                   && currentSlot.resolutions.resolutionsPerAuthority[0]) {
//           if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
//             if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
//               prompt = 'Which would you like';
//               const size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
  
//               currentSlot.resolutions.resolutionsPerAuthority[0].values
//                 .forEach((element, index) => {
//                   prompt += ` ${(index === size - 1) ? ' or' : ' '} ${element.value.name}`;
//                 });
  
//               prompt += '?';
  
//               return handlerInput.responseBuilder
//                 .speak(prompt)
//                 .reprompt(prompt)
//                 .addElicitSlotDirective(currentSlot.name)
//                 .getResponse();
//             }
//           } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_NO_MATCH') {
//             if (requiredSlots.indexOf(currentSlot.name) > -1) {
//               prompt = `What ${currentSlot.name} are you looking for`;
  
//               return handlerInput.responseBuilder
//                 .speak(prompt)
//                 .reprompt(prompt)
//                 .addElicitSlotDirective(currentSlot.name)
//                 .getResponse();
//                 }
//             }
//             }
//     }
//     return handlerInput.responseBuilder
//     .addDelegateDirective(currentIntent)
//     .getResponse();
//     },
// };

// const SetStopHandler = {
//     canHandle(handlerInput) {
//         const request = handlerInput.requestEnvelope.request;

//         return request.type === 'IntentRequest' && request.intent.name === 'SetRouteIntent';
//     },
//     handle(handlerInput) {
//         const request = handlerInput.requestEnvelope.request;
//         const responseBuilder = handlerInput.responseBuilder;
//         var output = "Please say the number for the route you would you like to take? ";
//         for(var i = 0; i< data.routes.length; i++)
//         {
//             output+= `${(i+1)}. ${routes[i].name},`; 
//         }

//         return responseBuilder.speak(output).reprompt(output).getResponse();
//     },
// };

const ETAHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'ETAIntent';
    },
    handle(handlerInput) {
        return new Promise((resolve) => {
            getETA((timeInSec, timeString) => {
                if(timeInSec.length == 0)
                {
                    resolve(handlerInput.responseBuilder.speak(NO_ETA).getResponse());
                }
                else
                {
                const speechOutput = `The next ${data.routes[data.routeID].name} route bus for the 
                ${data.stops[data.routeID][data.stopID].name} will arrive at 
                ${timeString[0]} which is ${formatTime(timeInSec[0])} from now`;
                resolve(handlerInput.responseBuilder.speak(speechOutput).getResponse());
                }
            });
            // resolve(handlerInput.responseBuilder.speak('hi').getResponse());
        });
    },
};

const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const responseBuilder = handlerInput.responseBuilder;

        const requestAttributes = attributesManager.getRequestAttributes();
        return responseBuilder
            .speak(requestAttributes.t('HELP'))
            .reprompt(requestAttributes.t('HELP'))
            .getResponse();
    },
};

const StopHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'IntentRequest'
            && (request.intent.name === 'AMAZON.NoIntent'
            || request.intent.name === 'AMAZON.CancelIntent'
            || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const responseBuilder = handlerInput.responseBuilder;

        const requestAttributes = attributesManager.getRequestAttributes();
        return responseBuilder
            .speak(requestAttributes.t('STOP'))
            .getResponse();
    },
};

const SessionEndedHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;

        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        console.log(` Original request was ${JSON.stringify(request, null, 2)}\n`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

const FallbackHandler = {

  // 2018-May-01: AMAZON.FallackIntent is only currently available in en-US locale.

  //              This handler will not be triggered except in that locale, so it can be

  //              safely deployed for any locale.

  canHandle(handlerInput) {

    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest'

      && request.intent.name === 'AMAZON.FallbackIntent';

  },

  handle(handlerInput) {

    return handlerInput.responseBuilder

      .speak(FALLBACK_MESSAGE)

      .reprompt(FALLBACK_REPROMPT)

      .getResponse();

  },

};


// 2. Constants ==================================================================================

const languageStrings = {
    en: {
        translation: {
            WELCOME: 'Welcome to Presidigo!',
            ABOUT: 'nope',
            HELP: 'Say set stop, to set the stop to watch, or say ETA for the next bus arrival time',
            STOP: 'Okay, thanks for using me!',
        },
    },
    // , 'de-DE': { 'translation' : { 'TITLE'   : "Local Helfer etc." } }
};
const data = {
    routes:[
        {
            name: 'Presidio Hills',
            id: 673,
            pattern_id: 1012,
        },
        {
            name: 'Crissy Field',
            id: 689,
            pattern_id: 9937,
        },
        {
            name: 'Downtown',
            id: 66,
            pattern_id: 240,
        }
    ],
    stops:[
        [
            {
                name: 'Presidio Transit Center',
                id: 31734,
            },
            {
                name: 'Pershing Square',
                id: 382971,
            },
            {
                name: 'Inspiration Point',
                id: 31823,
            },
            {
                name: 'East Washington (outbound)',
                id: 382972,
            },
            {
                name: 'West Washington (outbound)',
                id: 382973,
            },
            {
                name: 'Rob Hill Campground',
                id: 382974,
            },
            {
                name: 'Harrison Blvd / Kobbe Ave',
                id: 1681820,
            },
            {
                name: 'Coastal Trail',
                id: 382975,
            },
            {
                name: '25th Ave',
                id: 31792,
            },
            {
                name: 'Baker Beach',
                id: 31793,
            },
            {
                name: 'Stilwell Rd',
                id: 31794,
            },
            {
                name: 'Pershing Dr',
                id: 31795,
            },
            {
                name: '31796-Caulfield Cut',
                id: 1713926,
            },
            {
                name: 'Public Health Services District',
                id: 268755,
            },
            {
                name: 'Presidio Landmark',
                id: 268759,
            },
            {
                name: 'Building 1450',
                id: 268762,
            },
            {
                name: 'West Washington (inbound)',
                id: 31808,
            },
            {
                name: 'East Washington (inbound)',
                id: 31795,
            },
            {
                name: 'Deems Road',
                id: 31795,
            },
            {
                name: 'Officer\'s Club',
                id: 31795,
            },
        ],
        [
            {
                name: 'Presidio Transit Center',
                id: 3939877,
            },
            {
                name: 'Montgomery St',
                id: 345850,
            },
            {
                name: 'Golden Gate Club',
                id: 377709,
            },
            {
                name: 'Park Blvd',
                id: 61151,
            },
            {
                name: 'Kobbe Ave',
                id: 31764,
            },
            {
                name: 'Presidio Institute',
                id: 505839,
            },
            {
                name: 'Fort Scott',
                id: 31766,
            },
            {
                name: 'Log Cabin',
                id: 31768,
            },
            {
                name: 'Golden Gate Overlook',
                id: 268736,
            },
            {
                name: 'Golden Gate West',
                id: 268740,
            },
            {
                name: 'Golden Gate Bridge',
                id: 31770,
            },
            {
                name: 'Pilot\'s Row',
                id: 382958,
            },
            {
                name: 'Lendrum Ct',
                id: 382959,
            },
            {
                name: 'Storey Ave',
                id: 382960,
            },
            {
                name: 'Cavlary Stables',
                id: 380160,
            },
            {
                name: 'Stilwell Hall',
                id: 382961,
            },
            {
                name: 'Bldg 640',
                id: 642965,
            },
            {
                name: 'Crissy Field Marsh',
                id: 382962,
            },
            {
                name: 'Crissy Field Center',
                id: 382963,
            },
            {
                name: 'Girard Rd',
                id: 382967,
            },
            {
                name: 'Presidio Community YMCA (inbound)',
                id: 31986,
            },
        ],
        [
            {
                name: 'Presidio Transit Center',
                id: 31734,
            },
            {
                name: 'Presidio Community YMCA (outbound)',
                id: 31925,
            },
            {
                name: 'Tides Converge (outbound)',
                id: 31928,
            },
            {
                name: 'Letterman Digital Arts Center',
                id: 31930,
            },
            {
                name: 'Lombard Gate',
                id: 31933,
            },
            {
                name: 'Van Ness & Union (Drop Off)',
                id: 41492,
            },
            {
                name: 'Drumm & California (Embarcadero BART Drop Off)',
                id: 1725020,
            },
            {
                name: 'Main & Howard (Transbay Terminal)',
                id: 31955,
            },
            {
                name: 'Drumm & California (Embarcadero BART Pick Up)',
                id: 839326,
            },
            {
                name: 'Van Ness & Union (Pick Up)',
                id: 41520,
            },
            {
                name: 'Letterman Digital Arts Center',
                id: 31980,
            },
            {
                name: 'Tides Converge (inbound)',
                id: 31983,
            },
            {
                name: 'Presidio Community YMCA (inbound)',
                id: 31986,
            },
        ],

    ],
    
    stopID: 10,
    routeID: 0,
};

const SKILL_NAME = 'Free Ride';
const FALLBACK_MESSAGE = `The ${SKILL_NAME} skill can\'t help you with that.  It can help you track your next bus if you say next bus. What can I help you with?`;
const FALLBACK_REPROMPT = 'What can I help you with?';
const NO_ETA = 'Sorry, there is no ETA available for your route';

const requiredSlots = [
    'routeIndex',
    'stopIndex',
  ];

// 3. Helper Functions ==========================================================================



const stopAPI = {
    hostname: 'presidiobus.com',
    path: `/stop/${data.stops[data.routeID][data.stopID].id}/Arrivals`,
    method: 'GET',
};

// function saveStop(userID)
// {
//     databaseHelper.storeData(userID,data)
//     .then(function(result) {
//         return result;
//       }).catch(function(error) {
//         console.log(error);
//       });

// }
// function loadStop(userID)
// {
//     databaseHelper.readData(userId).then(function(result) {
//         if(result === undefined)
//         {
//             data.stopID=-1;
//             data.routeID=-1;
//         }
//         else
//         {
//             data.stopID = result['stopID'];
//             data.routeID = result['routeID'];
//         }
//       });
// }

function formatTime(seconds)
{
    var time = '';
    const hour = 60*60;
    const min = 60;

    var chkHr = Math.round(seconds/hour);
    if(chkHr >=1)
    {
        if(time.length !=0)
            time+=' ';
        time += chkHr + ' hour';
        if(chkHr >=2)
            time += 's';
        seconds %= hour;
    }
    
    var chkMin = Math.round(seconds/min);
    if(chkMin >=1)
    {
        if(time.length !=0)
            time+=' ';
        time += chkMin + ' minute';
        if(chkMin >=2)
            time += 's';
        seconds %= min;
    }
    if(seconds > 0)
    {
        if(time.length !=0)
            time+=' ';
        time += seconds + ' second';
        if(seconds >=1)
            time += 's';
    }

    return time;
}

function getETA(callback) {
    const req = https.request(stopAPI, (res) => {
        res.setEncoding('utf8');
        let returnData = '';
        res.on('data', (chunk) => {
            returnData += chunk;
        });
        
        res.on('end', () => {
            //callback('success',returnData);
            const root = JSON.parse(returnData);
            var timeInSec= [];
            var timeString = [];

            for (var j = 0; j < root.length; j++) {
                var obj = root[j];
                //make sure the route is right
                if(obj.RouteID !== data.routes[data.routeID].pattern_id)
                    continue;

                for (var i = 0; i < obj.Arrivals.length; i++) {
                    var arrival = obj.Arrivals[i];
                    timeInSec[i] = Math.round(arrival.SecondsToArrival);
                    timeString[i] = arrival.ArriveTime;
                }
                break;
            }

            callback(timeInSec,timeString);
        });
    });
    req.end();

    // var stop = data.stops[data.routeID][data.stopID];
    // var timeInSec= stop.id;
    // var timeString = ['1pm'];
    // callback(timeInSec,timeString);

}
const LocalizationInterceptor = {
    process(handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true,
        });

        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function (...args) {
            return localizationClient.t(...args);
        };
    },
};

// 4. Export =====================================================================================

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchHandler,
        ETAHandler,
       // InProgressRecommendationIntent,
        //CompletedRecommendationIntent,
        StopHandler,
        FallbackHandler,
        SessionEndedHandler
    )
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .lambda();
