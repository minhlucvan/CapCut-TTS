import fetch, { Headers } from 'node-fetch';
import env from '../config/env';
import {
    TTSCreateRequest,
    TTSCreateParams,
    TTSCreateReqJson,
    TTSCreateResponse,
    TTSQueryRequest,
    TTSQueryResponse,
} from '../types/capcut';
import logger from '../utils/log';
import { sleep } from '../utils/util';

const SMART_TOOL_TYPE_TTS = 39;
const TTS_STATUS_COMPLETED = 2;
const MAX_POLL_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 500;

function buildHeaders(deviceTime: string, sign: string, cookie: string): Headers {
    const headers = new Headers();
    headers.append('Accept', 'application/json, text/plain, */*');
    headers.append('Accept-Language', 'en-US,en;q=0.9');
    headers.append('Appid', '348188');
    headers.append('Appvr', '8.4.0');
    headers.append('Cache-Control', 'no-cache');
    headers.append('Content-Type', 'application/json');
    headers.append('Cookie', cookie);
    headers.append('Device-Time', deviceTime);
    headers.append('Did', env.WebId);
    headers.append('Origin', 'https://www.capcut.com');
    headers.append('Pf', '7');
    headers.append('Pragma', 'no-cache');
    headers.append('Referer', 'https://www.capcut.com/');
    headers.append('Sign', sign);
    headers.append('Sign-Ver', '1');
    headers.append('Store-Country-Code', 'vn');
    headers.append('Store-Country-Code-Src', 'uid');
    headers.append('User-Agent', env.UserAgent);
    return headers;
}

function buildCreateUrl(): string {
    const babiParam = encodeURIComponent(JSON.stringify({
        scenario: 'video_editor',
        feature_key: 'text_to_speech',
        feature_entrance: 'tool',
        feature_entrance_detail: 'tool-feature-text_to_speech'
    }));
    return `${env.CapCutAPIURL}/lv/v2/intelligence/create?babi_param=${babiParam}&aid=548669&device_platform=web&region=VN&web_id=${env.WebId}`;
}

function buildQueryUrl(): string {
    const babiParam = encodeURIComponent(JSON.stringify({
        scenario: 'video_editor',
        feature_key: 'text_to_speech',
        feature_entrance: 'tool',
        feature_entrance_detail: 'tool-feature-text_to_speech'
    }));
    return `${env.CapCutAPIURL}/lv/v2/intelligence/query?babi_param=${babiParam}&aid=548669&device_platform=web&region=VN&web_id=${env.WebId}`;
}

export async function createTTSTask(
    text: string,
    speaker: string,
    speakerName: string,
    speechRate: number = 0,
    pitchRate: number = 0,
    deviceTime: string,
    sign: string,
    cookie: string,
    workspaceId: string
): Promise<string | null> {
    const headers = buildHeaders(deviceTime, sign, cookie);
    const url = buildCreateUrl();

    const params: TTSCreateParams = {
        text: text,
        breaks: [],
        platform: 1
    };

    const reqJson: TTSCreateReqJson = {
        speaker: speaker,
        audio_config: {
            speech_rate: speechRate,
            pitch_rate: pitchRate
        },
        disable_caption: false,
        speaker_name: speakerName
    };

    const body: TTSCreateRequest = {
        workspace_id: workspaceId,
        smart_tool_type: SMART_TOOL_TYPE_TTS,
        scene: 0,
        params: JSON.stringify(params),
        req_json: JSON.stringify(reqJson)
    };

    try {
        logger.debug(`Creating TTS task for text: "${text.substring(0, 50)}..."`);
        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            logger.error(`TTS create request failed with status: ${res.status}`);
            return null;
        }

        const response = await res.json() as TTSCreateResponse;

        if (response.ret !== 'OK' && response.ret !== '0') {
            logger.error(`TTS create failed: ${response.errmsg}`);
            return null;
        }

        logger.debug(`TTS task created with ID: ${response.data.task_id}`);
        return response.data.task_id;
    } catch (error) {
        logger.error(`TTS create error: ${error}`);
        return null;
    }
}

export async function queryTTSTask(
    taskId: string,
    deviceTime: string,
    sign: string,
    cookie: string,
    workspaceId: string
): Promise<TTSQueryResponse | null> {
    const headers = buildHeaders(deviceTime, sign, cookie);
    const url = buildQueryUrl();

    const body: TTSQueryRequest = {
        task_id: taskId,
        workspace_id: workspaceId,
        smart_tool_type: SMART_TOOL_TYPE_TTS
    };

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            logger.error(`TTS query request failed with status: ${res.status}`);
            return null;
        }

        const response = await res.json() as TTSQueryResponse;
        return response;
    } catch (error) {
        logger.error(`TTS query error: ${error}`);
        return null;
    }
}

export async function waitForTTSCompletion(
    taskId: string,
    deviceTime: string,
    sign: string,
    cookie: string,
    workspaceId: string
): Promise<TTSQueryResponse | null> {
    for (let i = 0; i < MAX_POLL_ATTEMPTS; i++) {
        const response = await queryTTSTask(taskId, deviceTime, sign, cookie, workspaceId);

        if (!response) {
            logger.error(`Poll attempt ${i + 1}/${MAX_POLL_ATTEMPTS} failed`);
            await sleep(POLL_INTERVAL_MS);
            continue;
        }

        if (response.data.status === TTS_STATUS_COMPLETED) {
            logger.debug(`TTS task ${taskId} completed`);
            return response;
        }

        logger.debug(`TTS task ${taskId} status: ${response.data.status}, polling...`);
        await sleep(POLL_INTERVAL_MS);
    }

    logger.error(`TTS task ${taskId} timed out after ${MAX_POLL_ATTEMPTS} attempts`);
    return null;
}

export async function synthesizeTTS(
    text: string,
    speaker: string,
    speakerName: string,
    speechRate: number = 0,
    pitchRate: number = 0,
    deviceTime: string,
    sign: string,
    cookie: string,
    workspaceId: string
): Promise<{ audioUrl: string; duration: number } | null> {
    const startTime = Date.now();

    // Step 1: Create TTS task
    const taskId = await createTTSTask(
        text, speaker, speakerName, speechRate, pitchRate,
        deviceTime, sign, cookie, workspaceId
    );

    if (!taskId) {
        return null;
    }

    // Step 2: Wait for completion
    const result = await waitForTTSCompletion(taskId, deviceTime, sign, cookie, workspaceId);

    if (!result) {
        return null;
    }

    try {
        // Extract audio URL from task_detail
        const taskDetail = (result.data as any).task_detail;
        if (!taskDetail || taskDetail.length === 0) {
            logger.error('No task_detail in result');
            return null;
        }

        // Find the audio resource (resource_type 32 is audio/video)
        const audioResource = taskDetail.find((t: any) => t.resource_type === 32);
        if (!audioResource) {
            logger.error('No audio resource found');
            return null;
        }

        // Get audio URL from transcode_audio_info or fallback to url
        let audioUrl = audioResource.url;
        if (audioResource.transcode_audio_info && audioResource.transcode_audio_info.length > 0) {
            const transcodeUrl = audioResource.transcode_audio_info[0].url;
            if (transcodeUrl) {
                audioUrl = transcodeUrl;
            }
        }

        if (!audioUrl) {
            logger.error('No audio URL in result');
            return null;
        }

        const duration = audioResource.duration || 0;
        logger.debug(`TTS completed in ${Date.now() - startTime}ms, duration: ${duration}ms`);
        return { audioUrl, duration };
    } catch (error) {
        logger.error(`Failed to parse TTS result: ${error}`);
        return null;
    }
}

export async function fetchAudioBuffer(audioUrl: string): Promise<Buffer | null> {
    try {
        const res = await fetch(audioUrl);
        if (!res.ok) {
            logger.error(`Failed to fetch audio: ${res.status}`);
            return null;
        }
        const arrayBuffer = await res.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        logger.error(`Error fetching audio: ${error}`);
        return null;
    }
}
