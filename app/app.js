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
        this.ask('Voulez vous avoir les horaires ?');

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

    'HorairesIntent': function(type, code, station) {
        if (!this.alexaSkill().isDialogCompleted()) {
            this.alexaSkill().dialogDelegate()
            
        } else if (this.alexaSkill().getIntentConfirmationStatus() !== 'CONFIRMED') {
            
            let la_station = station.alexaSkill.resolutions.resolutionsPerAuthority[0].values[0].value.name;

            this.alexaSkill().dialogConfirmIntent(
                'Vous recherchez les horaires du bus 58' +
                ' station ' + la_station +
                 ' ?'
            );
        
        } else if (this.alexaSkill().getIntentConfirmationStatus() === 'CONFIRMED') {
            let HorairesData = {
                type: 'bus',
                code: '58',
                station: station,
                error: true                
            };
            this.toIntent('HorairesApiIntent', HorairesData);
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
