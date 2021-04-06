import { Rcon } from 'rcon-client'
import { SpawnEnemyRequest } from './interface/request';
import { Settings } from './interface/settings'

export class MinecraftCommader {

    private rcon: Rcon;

    constructor() {}

    public async connect(settings: Settings) {
        this.rcon = await Rcon.connect({
            host: settings.host,
            port: settings.port,
            password: settings.password
        });
    }

    public spawnEnemy(request: SpawnEnemyRequest){
        this.rcon.send('');
    }

    public effect(){

    }

    public playSound() {

    }

    public fog() {

    }

    public camerashake() {

    }

    public changeDifficulty() {

    }

    public say(text:string) {
        this.rcon.send(`say ${text}`);
    }
}