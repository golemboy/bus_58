'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const {App} = require('jovo-framework');
const ratp = require('./ratp_calls');
const tools = require('./tools');
const config = {
    logging: false,
    saveUserOnResponseEnabled: true,
    userDataCol: 'userData',

    intentMap: {
        'AMAZON.RepeatIntent': 'RepeatIntent',
        'AMAZON.CancelIntent': 'CancelIntent',
        'AMAZON.HelpIntent': 'HelpIntent',
        'AMAZON.StopIntent': 'StopIntent',
        'AMAZON.NavigateHomeIntent': 'NavigateHomeIntent',
        'AMAZON.YesIntent': 'YesIntent',
        'AMAZON.NoIntent': 'NoIntent',
    },

    db: {
        type: 'dynamodb',
        tableName: 'Bus_58_data',
    },
};

//go
const app = new App(config);


// =================================================================================
// App Logic
// =================================================================================

app.setHandler({
    'LAUNCH': function() {
        this.ask('Pour quelle station souhaitez-vous connaître les horaires de passage ?');

    },
    'CancelIntent': function()  {
        this.tell('Merci pour votre recherche et à bientôt.')
    },
    'StopIntent': function()  {
        this.tell('Merci pour votre recherche et à bientôt.')
    },
    'HelpIntent': function()  {
        this.ask('Pouvez vous m\'indiquer le nom de la station dont vous souhaitez connaitre les horaires de passage de la ligne ?');
        
    },
    'NavigateHomeIntent': function()  { 
        this.toIntent('LAUNCH')
    },

    'RepeatIntent': function()  {
        
        let userData  = this.user().data
        
        if ( userData !== undefined  
            && !tools.isEmpty(userData)
            && !userData.HorairesData.error ) {            
            this.toIntent('HorairesApiIntent', userData.HorairesData);
        }
        else {
            this.toIntent('LAUNCH');
        }
    },
    //'ConfirmState' : {
/*
        'YesIntent' : function(station) {
            console.log('...yes...')
            //console.log(station)
            let HorairesData = {
                type: 'bus',
                code: '58',
                station: station,
                error: true                
            };
            this.toIntent('HorairesApiIntent', HorairesData);
        },
        */

        'NoIntent' : function() {
            this.toIntent('LAUNCH');
        },

    //},

    'HorairesIntent': function(station) {
        console.log(station)
        console.log(this.alexaSkill().getIntentConfirmationStatus())
        if (!this.alexaSkill().isDialogCompleted()) {
            this.alexaSkill().dialogDelegate()
        }
        else {
            switch (this.alexaSkill().getIntentConfirmationStatus()) {               
                case 'DENIED': //réponse non
                    this.toIntent('LAUNCH');
                    break;
                case 'CONFIRMED': //réponse oui 
                    let HorairesData = {
                        type: 'bus',
                        code: '58',
                        station: station,
                        error: true                
                    };
                    this.toIntent('HorairesApiIntent', HorairesData);
                    break;
                default:
                    let la_station = station.alexaSkill.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                    
                    let speech = 'Vous recherchez les horaires de passage du bus 58 station '+la_station+' ?';
                    let reprompt = "Veuillez répondre par oui ou non s'il vous plait.";

                    this.alexaSkill().dialogConfirmIntent(speech,reprompt)
                    break;
            }
        }
        
        
    },
    'HorairesApiIntent': function(HorairesData) {
        let type = 'bus'
        let code = '58'
        let station = HorairesData.station.alexaSkill.resolutions.resolutionsPerAuthority[0].values[0].value.id

        Promise.all([
            ratp.call_schedules(type, code, station, 'A'),
            ratp.call_schedules(type, code, station, 'R')
        ].map(p => p.catch(() => [{"message":"no_data","destination":"no_data"}]))).then ((output) => {
            //console.log(JSON.stringify(tools.flat(output)))
            
            this.tell(tools.display(tools.flat(output)))
            
            HorairesData.error = false
            this.user().data.HorairesData = HorairesData
            
        }
        ).catch((error) => {
            this.tell(tools.display(error))

            HorairesData.error = true
            this.user().data.HorairesData = HorairesData

        })
    },
});



module.exports.app = app;
