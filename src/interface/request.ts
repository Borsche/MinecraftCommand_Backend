export interface Request {
    requestInfo: RequestInfo,
    payload: SpawnEnemyRequest | EffectRequest
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

export interface CameraShakeRequest {
    player: string,
    duration: number
}

export interface ChangeDifficultyRequest {
    difficulty: string
}

export interface RequestStatus {
    success: boolean,
    message: string,
}