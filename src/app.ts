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
    mcCommander.spawnEnemy(request.payload as SpawnEnemyRequest);
    mcCommander.say(eventtext.spawnenemy)
})

app.post('/effect', (req, res) => {

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