
<p align="center">Templates for the <a href="https://github.com/jovotech/jovo-framework-nodejs">Jovo Framework</a> ⭐️</p>

<p align="center">
<a href="https://www.jovo.tech/framework/docs/"><strong>Documentation</strong></a> -
<a href="https://github.com/jovotech/jovo-cli"><strong>CLI </strong></a> - <a href="https://github.com/jovotech/jovo-framework-nodejs/blob/master/CONTRIBUTING.md"><strong>Contributing</strong></a> - <a href="https://twitter.com/jovotech"><strong>Twitter</strong></a></p>
<br/>

# Template: Alexa Dialog Interface

Jovo Sample Alexa Skill that uses the Alexa Dialog Interface.

```sh
jovo new bus_58 --template alexa/dialoginterface --locale fr-FR
npm install aws-sdk
jovo get alexaSkill --skill-id amzn1.ask.skill.xxxxxxxxx
jovo init alexaSkill
jovo build --reverse

#en local
jovo build --stage local
jovo deploy --stage local
jovo run --stage local

#sur AWS
jovo build --stage dev
jovo deploy --stage dev --ask-profile default
```

