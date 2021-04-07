import express from 'express';
import bodyParser from 'body-parser';
import * as settings from "../settings.json";
import * as eventtext from "../eventtext.json";
import { MinecraftCommader } from './minecraftCommander';
import { Request, SpawnEnemyRequest, EffectRequest, PlaySoundRequest, CameraShakeRequest, ChangeDifficultyRequest } from './interface/request';
import { Mobs } from './options';



const app = express();
app.use(bodyParser.json());

const port = 8080;

const mcCommander = new MinecraftCommader();
mcCommander.connect(settings);



app.post('/spawnenemy', (req, res) => {
    const request = req.body as Request;
    const payload = request.payload as SpawnEnemyRequest
    const text = replaceVariables(eventtext.spawnenemy, request);

    mcCommander.spawnEnemy(payload).then((requestStatus) => {
        if(requestStatus.code == 200) {
            mcCommander.say(text)
        }
        res.status(requestStatus.code);
        res.send(requestStatus.message);
    });
})

app.post('/effect', (req, res) => {
    const request = req.body as Request;
    const payload = request.payload as EffectRequest
    const text = replaceVariables(eventtext.effect, request);

    mcCommander.effect(payload).then((requestStatus) => {
        if(requestStatus.code == 200) {
            mcCommander.say(text)
        }
        res.status(requestStatus.code);
        res.send(requestStatus.message);
    });
})

app.post('/playsound', (req, res) => {

})

app.post('/camerashake', (req, res) => {

})

app.post('/changedifficulty', (req, res) => {

})

app.get('/players', (req, res) => {
    mcCommander.getPlayersOnServer().then((players) => {
        res.send(players);
    })
})

app.get('/mobs', (req, res) => {
    res.send(Object.values(Mobs));
})

app.listen(port, () => {
    console.log(`server listening on ${port}`)
})

function replaceVariables(string, request) {
    const properties = Object.getOwnPropertyNames(request);

    properties.forEach((property) =>{
        if(typeof request[property] !== "object") {
            string = string.replace(`@${property}`, request[property]);
        } else {
            const innerProps = Object.getOwnPropertyNames(request[property]);
            innerProps.forEach((innerProp) => {
                string = string.replace(`@${innerProp}`, request[property][innerProp]);
            })
        }
    })

    return string;
}