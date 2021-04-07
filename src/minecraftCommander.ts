import { Rcon } from 'rcon-client'
import { CameraShakeRequest, ChangeDifficultyRequest, EffectRequest, PlaySoundRequest, RequestStatus, SpawnEnemyRequest } from './interface/request';
import { Settings } from './interface/settings'
import { Mobs } from './options';

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

    public spawnEnemy(request: SpawnEnemyRequest): RequestStatus{
        // check if the player is defined or on the server
        let player;
        if(request.player && this.isPlayerOnServer(request.player)){
            player = request.player;
        } else if(!request.player) {
            player = this.getRandomPlayerOnServer();
        } else {
            let requestStatus: RequestStatus;
            requestStatus.message = "The request player is not on the server";
            requestStatus.success = false;
            return requestStatus;
        }
        if(player) {
            let requestStatus: RequestStatus;
            requestStatus.message = "No players are currently on the server";
            requestStatus.success = false;
            return requestStatus;
        }

        // check if the mob is assigned and exist in the predefined mobs enum
        let mob;
        if(request.entity && request.entity in Mobs){
            mob = request.entity;
        } else if(!request.entity) {
            mob = this.getRandomMob();
        } else {
            let requestStatus: RequestStatus;
            requestStatus.message = "The requested entity is not in the list of available mobs";
            requestStatus.success = false;
            return requestStatus;
        }

        let command = `execute @a[name=${player}] ~ ~ ~ summon ${mob} ~ ~1 ~`;
        this.rcon.send(command).then(() => {
            let requestStatus: RequestStatus;
            requestStatus.message = "successfully spawned!";
            requestStatus.success = true;
            return requestStatus;
        }).catch((reason) => {
            let requestStatus: RequestStatus;
            requestStatus.message = "something went wrong: " + reason;
            requestStatus.success = false;
            return requestStatus;
        });

    }

    public effect(request: EffectRequest){

    }

    public playSound(request: PlaySoundRequest) {

    }

    public camerashake(request: CameraShakeRequest) {

    }

    public changeDifficulty(request: ChangeDifficultyRequest) {

    }

    public say(text:string) {
        this.rcon.send(`say ${text}`);
    }

    public async getPlayersOnServer(): Promise<string[]> {
        const playersListString = await this.rcon.send("list");
        // the returned string of this looks similiar to this: 'Currently there are 2 players online: Player1, Player2'
        const playersString = playersListString.substring(playersListString.indexOf(':') + 2);
        // after this the string looks like this: 'Player1, Player2'
        const players = playersString.split(', ');
        // we should now receive a string array with the names of the players on the server.
        
        return players;
    }

    private async getRandomPlayerOnServer(): Promise<string> {
        const players = await this.getPlayersOnServer();
        return players[Math.round(Math.random() * players.length)]
    }

    private async isPlayerOnServer(player: string): Promise<boolean> {
        const players = await this.getPlayersOnServer();
        return players.includes(player);
    }

    private getRandomMob(): string {
        return Mobs[Math.round(Math.random() * Object.keys(Mobs).length)]
    }
}