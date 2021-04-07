import { Rcon } from 'rcon-client'
import { CameraShakeRequest, ChangeDifficultyRequest, EffectRequest, PlaySoundRequest, RequestStatus, SpawnEnemyRequest } from './interface/request';
import { Settings } from './interface/settings'
import { Effects, Mobs, Sounds } from './options';

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

    public async spawnEnemy(request: SpawnEnemyRequest): Promise<RequestStatus>{
        // check if the player is defined or on the server
        let player;
        if(request.player && this.isPlayerOnServer(request.player)){
            player = request.player;
        } else if(!request.player) {
            player = await this.getRandomPlayerOnServer()
        } else {
            return {
                message: "The request player is not on the server",
                code: 404
            };
        }
        if(!player) {
            return {
                message: "No players are currently on the server",
                code: 404
            };
        }

        // check if the mob is assigned and exist in the predefined mobs enum
        let mob;
        if(request.entity && this.existsIn(Mobs, request.entity)){
            mob = Mobs[request.entity];
        } else if(!request.entity) {
            mob = this.getRandomMob();
        } else {
            return {
                message: "The requested entity is not in the list of available mobs",
                code: 404
            };
        }

        const command = `execute @a[name=${player}] ~ ~ ~ summon ${mob} ~ ~1 ~`;

        return this.rcon.send(command).then(() => {
            return {
                message: "successfully spawned!",
                code: 200
            }
        }).catch((reason) => {
            return {
                message: "something went wrong: " + reason,
                code: 500
            }
        });
    }

    public async effect(request: EffectRequest): Promise<RequestStatus>{
        let player;
        if(request.player && this.isPlayerOnServer(request.player)){
            player = request.player;
        } else if(!request.player) {
            player = await this.getRandomPlayerOnServer()
        } else {
            return {
                message: "The request player is not on the server",
                code: 404
            };
        }
        if(!player) {
            return {
                message: "No players are currently on the server",
                code: 404
            };
        }

        let effect;
        if(request.effect && this.existsIn(Effects, request.effect)) {
            effect = Effects[request.effect];
        } else if(!request.effect) {
            effect = this.getRandomEffect();
        } else {
            return {
                message: "The requested effect is not in the list of available effects",
                code: 404
            };
        }

        let duration;
        if(request.duration && request.duration >= 0) {
            duration = request.duration;
        } else {
            duration = 60;
        }

        const command = `effect give ${player} minecraft:${effect.toLowerCase()} ${duration}`

        return this.rcon.send(command).then(() => {
            return {
                message: "successfully applied effect",
                code: 200
            }
        }).catch((reason) => {
            return {
                message: "something went wrong: " + reason,
                code: 500
            }
        })
    }   

    public async playSound(request: PlaySoundRequest): Promise<RequestStatus>{
        let player;
        if(request.player && this.isPlayerOnServer(request.player)){
            player = request.player;
        } else if(!request.player) {
            player = await this.getRandomPlayerOnServer()
        } else {
            return {
                message: "The request player is not on the server",
                code: 404
            };
        }
        if(!player) {
            return {
                message: "No players are currently on the server",
                code: 404
            };
        }

        let sound;
        if(request.sound && this.existsIn(Sounds, request.sound)){
            sound = Sounds[request.sound];
        } else if(!request.sound) {
            sound = this.getRandomSound();
        } else {
            return {
                message: "The requested effect is not in the list of available effects",
                code: 404
            };
        }

        const command = `playsound minecraft:${sound.toLowerCase()} ambient ${player}`

        return this.rcon.send(command).then(() => {
            return {
                message: "successfully applied effect",
                code: 200
            }
        }).catch((reason) => {
            return {
                message: "something went wrong: " + reason,
                code: 500
            }
        })
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
        return players[this.returnRdmInt(players.length)]
    }

    private async isPlayerOnServer(player: string): Promise<boolean> {
        const players = await this.getPlayersOnServer();
        return players.includes(player);
    }

    private getRandomMob(): string {
        const mobs = Object.values(Mobs);
        return mobs[this.returnRdmInt(mobs.length)]
    }

    private getRandomEffect(): string {
        const effects = Object.values(Effects);
        return effects[this.returnRdmInt(effects.length)]
    }

    private getRandomSound(): string {
        const sounds = Object.values(Sounds);
        return sounds[this.returnRdmInt(sounds.length)]
    }

    private existsIn(obj: any, value: any): boolean {
        let found = false;
        for(const val in obj) {
            if(val.toLowerCase() == value.toLowerCase()) found = true 
        }
        return found
    }

    private returnRdmInt(max){
        return Math.floor(Math.random() * max)
    }
}