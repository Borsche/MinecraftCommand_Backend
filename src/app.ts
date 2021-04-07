import express from 'express';
import * as settings from "../settings.json";
import * as eventtext from "../eventtext.json";
import { MinecraftCommader } from './minecraftCommander';
import { Request, SpawnEnemyRequest, EffectRequest, PlaySoundRequest, CameraShakeRequest, ChangeDifficultyRequest } from './interface/request';

const app = express();
const port = 8080;

const mcCommander = new MinecraftCommader();
mcCommander.connect(settings);

app.post('/spawnenemy', (req, res) => {
    const request = req.body as Request;
    const payload = request.payload as SpawnEnemyRequest
    const text = replaceVariables(eventtext.spawnenemy, request);

    const requestStatus = mcCommander.spawnEnemy(payload);

    if(requestStatus.success) {
        mcCommander.say(text)
        res.status(200);
        res.send(requestStatus.message);
    } else {
        res.status(404)
        res.send(requestStatus.message);
    }
})

app.post('/effect', (req, res) => {
    const request = req.body as Request;
    const payload = request.payload as EffectRequest
    const text = replaceVariables(eventtext.effect, request);

    mcCommander.effect(payload);
    mcCommander.say(text);
})

app.post('/playsound', (req, res) => {

})

app.post('/camerashake', (req, res) => {

})

app.post('/changedifficulty', (req, res) => {

})

app.listen(port, () => {
    console.log(`server listening on ${port}`)
})

function replaceVariables(string, request) {
    const properties = Object.getOwnPropertyNames(request);

    properties.forEach((property) =>{
        if(typeof request[property] !== "object") {
            string = string.replace(`@${property}`, request[property]);
            console.log(property)
        } else {
            const innerProps = Object.getOwnPropertyNames(request[property]);
            console.log("found object: " + innerProps)
            innerProps.forEach((innerProp) => {
                console.log(innerProp)
                string = string.replace(`@${innerProp}`, request[property][innerProp]);
            })
        }
    })

    return string;
}