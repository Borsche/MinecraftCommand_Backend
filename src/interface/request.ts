import { Mobs } from "../options";

export interface Request {
    requestInfo: RequestInfo,
    payload: SpawnEnemyRequest | EffectRequest | PlaySoundRequest | ChangeDifficultyRequest
}

export interface RequestInfo {
    user: string,
}

export interface SpawnEnemyRequest {
    player: string,
    entity: string,
}

export interface EffectRequest {
    player: string,
    effect: string,
    duration: number
}

export interface PlaySoundRequest {
    player: string,
    sound: string,
}

export interface ChangeDifficultyRequest {
    difficulty: string
}

export interface RequestStatus {
    code: number,
    message: string,
}

export interface PlayerPosition {
    x: number,
    y: number,
    z: number
}