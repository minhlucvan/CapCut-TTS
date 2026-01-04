export type SynthesizePayload = {
    text: string;
    speaker: string;
    pitch: number;
    speed: number;
    volume: number;
    rate: number;
    appid: string;
}

export type Synthesize = {
    token: string;
    appkey: string;
    namespace: string
    event: string;
    payload: string;
}

export type TaskStatus = {
    task_id: string;
    message_id: string;
    namespace: string;
    event: string;
    status_code: number;
    status_text: string;
};

// New TTS API types

export type TTSCreateRequest = {
    workspace_id: string;
    smart_tool_type: number;
    scene: number;
    params: string; // JSON string: {"text": string, "breaks": [], "platform": number}
    req_json: string; // JSON string: {"speaker": string, "audio_config": {...}, "disable_caption": boolean, "speaker_name": string}
}

export type TTSCreateParams = {
    text: string;
    breaks: any[];
    platform: number;
}

export type TTSCreateReqJson = {
    speaker: string;
    audio_config: {
        speech_rate: number;
        pitch_rate: number;
    };
    disable_caption: boolean;
    speaker_name: string;
}

export type TTSCreateResponse = {
    ret: string;
    errmsg: string;
    data: {
        task_id: string;
    };
}

export type TTSQueryRequest = {
    task_id: string;
    workspace_id: string;
    smart_tool_type: number;
}

export type TTSQueryResponse = {
    ret: string;
    errmsg: string;
    data: {
        task_id: string;
        status: number; // 1 = processing, 2 = completed
        result_json?: string; // JSON string with audio info when completed
    };
}

export type TTSQueryResult = {
    asset_id: string;
    audio: {
        path: string;
        duration: number;
        md5: string;
        size: number;
    };
}
