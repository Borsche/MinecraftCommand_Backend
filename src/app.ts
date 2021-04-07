import express from 'express';
import bodyParser from 'body-parser';
import * as settings from "../settings.json";
import * as eventtext from "../eventtext.json";
import { MinecraftCommader } from './minecraftCommander';
import { Request, SpawnEnemyRequest, EffectRequest, PlaySoundRequest, ChangeDifficultyRequest } from './interface/request';
import { Difficulties, Effects, Mobs, Sounds } from './options';



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
    const request = req.body as Request;
    const payload = request.payload as PlaySoundRequest
    const text = replaceVariables(eventtext.playsound, request);

    mcCommander.playSound(payload).then((requestStatus) => {
        if(requestStatus.code == 200) {
            mcCommander.say(text)
        }
        res.status(requestStatus.code);
        res.send(requestStatus.message);
    })
})

app.post('/changedifficulty', (req, res) => {
    const request = req.body as Request;
    const payload = request.payload as ChangeDifficultyRequest
    const text = replaceVariables(eventtext.changedifficulty, request);

    mcCommander.changeDifficulty(payload).then((requestStatus) => {
        if(requestStatus.code == 200) {
            mcCommander.say(text)
        }
        res.status(requestStatus.code);
        res.send(requestStatus.message);
    })
})

app.get('/players', (req, res) => {
    mcCommander.getPlayersOnServer().then((players) => {
        res.send(players);
    })
})

app.get('/mobs', (req, res) => {
    res.send(Object.keys(Mobs));
})

app.get('/effects', (req, res) => {
    res.send(Object.keys(Effects));
})

app.get('/sounds', (req, res) => {
    res.send(Object.keys(Sounds));
})

app.get('/difficulties', (req, res) => {
    res.send(Object.keys(Difficulties));
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