import { Rcon } from 'rcon-client'
import { ChangeDifficultyRequest, EffectRequest, PlayerPosition, PlaySoundRequest, RequestStatus, SpawnEnemyRequest } from './interface/request';
import { Settings } from './interface/settings'
import { Difficulties, Effects, Mobs, Sounds } from './options';

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

        const position = await this.getPlayerPosition(player);
        if(!position) {
            return {
                message: "Could not locate the player",
                code: 404
            }
        }

        const command = `summon minecraft:${mob} ${position.x} ${position.y} ${position.z}`;

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
                message: "The requested sound is not in the list of available sounds",
                code: 404
            };
        }

        const command = `playsound minecraft:${sound.toLowerCase()} ambient ${player}`

        return this.rcon.send(command).then(() => {
            return {
                message: "successfully applied sound",
                code: 200
            }
        }).catch((reason) => {
            return {
                message: "something went wrong: " + reason,
                code: 500
            }
        })
    }

    public async changeDifficulty(request: ChangeDifficultyRequest): Promise<RequestStatus> {
        let difficulty;
        if(request.difficulty && this.existsIn(Difficulties, request.difficulty)){
            difficulty = Difficulties[request.difficulty];
        } else if(!request.difficulty) {
            difficulty = this.getRandomDifficulty();
        } else {
            return {
                message: "The requested difficulty is not in the list of available difficulties",
                code: 404
            };
        }

        if(difficulty == await this.getCurrentDifficulty()) {
            return {
                message: "The difficulty is already " + difficulty,
                code: 400
            };
        }

        const command = `difficulty ${difficulty}`;
        return this.rcon.send(command).then(() => {
            return {
                message: "successfully changed difficulty",
                code: 200
            }
        }).catch((reason) => {
            return {
                message: "something went wrong: " + reason,
                code: 500
            }
        })
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

    private getRandomDifficulty() {
        const difficulty = Object.values(Difficulties);
        const currentDifficulty = this.getCurrentDifficulty()
        let randomDifficulty;
        do
            randomDifficulty = difficulty[this.returnRdmInt(difficulty.length)]
        while (randomDifficulty == currentDifficulty)
        return randomDifficulty;
    }

    private existsIn(obj: any, value: any): boolean {
        let found = false;
        for(const val in obj) {
            if(val.toLowerCase() == value.toLowerCase()) found = true 
        }
        return found
    }

    private returnRdmInt(max: number){
        return Math.floor(Math.random() * max)
    }

    private async getPlayerPosition(player: string): Promise<PlayerPosition> {
        const position = await this.rcon.send("ploc " + player);
        return JSON.parse(position) as PlayerPosition
    }

    private async getCurrentDifficulty(): Promise<String> {
        const diffString = await this.rcon.send("difficulty");
        const diffStringWords = diffString.split(" ");
        
        return diffStringWords[diffStringWords.length - 1].toLocaleLowerCase()
    }
}