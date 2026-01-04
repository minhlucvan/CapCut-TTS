import express, { Request, Response, text } from 'express';

import getAudioBuffer from '../api/getAudioBuffer';
import { getUserRandom, getCredentialsRandom } from '../token';
import createAudioStream from '../api/createAudioStream';
import { synthesizeTTS, fetchAudioBuffer } from '../api/ttsApi';
import speakerParser, { parseSpeaker } from '../utils/speakerParser';
import env from '../config/env';
import logger from '../utils/log';

export default async function synthesize(req: Request, res: Response) {

    if (req.query.text === undefined) {
        res.status(400).json({
            error: "Bad Request"
        });
        return;
    }
    if (req.query.type === undefined) {
        req.query.type = '0';
    }
    if (req.query.pitch === undefined) {
        req.query.pitch = '10';
    }
    if (req.query.speed === undefined) {
        req.query.speed = '10';
    }
    if (req.query.volume === undefined) {
        req.query.volume = '10';
    }

    // Use new API by default, fall back to legacy WebSocket if api=legacy
    const useNewApi = req.query.api !== 'legacy';

    if (useNewApi) {
        // New HTTP-based TTS API
        const credentials = getCredentialsRandom();
        if (!credentials.cookie) {
            res.status(500).json({
                error: "No credentials configured"
            });
            return;
        }

        // Get speaker info - supports speaker ID or type number
        const speakerInput = req.query.speaker as string || speakerParser(Number(req.query.type));
        const speakerInfo = parseSpeaker(speakerInput);
        const speaker = speakerInfo.speaker;
        const speakerName = req.query.speaker_name as string || speakerInfo.name;

        // Convert pitch/speed from 0-20 scale to -100 to 100 scale
        const pitchRate = ((Number(req.query.pitch) - 10) / 10) * 100;
        const speedRate = ((Number(req.query.speed) - 10) / 10) * 100;

        const result = await synthesizeTTS(
            req.query.text as string,
            speaker,
            speakerName,
            speedRate,
            pitchRate,
            credentials.deviceTime,
            credentials.sign,
            credentials.cookie,
            credentials.workspaceId
        );

        if (!result) {
            res.status(500).json({
                error: "TTS synthesis failed"
            });
            return;
        }

        // Fetch the audio file
        const audioBuffer = await fetchAudioBuffer(result.audioUrl);

        if (!audioBuffer) {
            res.status(500).json({
                error: "Failed to fetch audio"
            });
            return;
        }

        res.type('audio/mp3').status(200).end(audioBuffer);
        return;
    }

    // Legacy WebSocket-based API
    if (req.query.method === undefined || req.query.method == 'buffer') {
        const USER = getUserRandom();
        const audioBuffer = await getAudioBuffer(USER.token, USER.appKey,
            req.query.text as string,
            Number(req.query.type),
            Number(req.query.pitch),
            Number(req.query.speed),
            Number(req.query.volume));

        if (!audioBuffer) {
            res.status(500).json({
                error: "can't get buffer"
            });
            return;
        }

        res.type('audio/wav').status(200).end(audioBuffer);
        return;
    } else if (req.query.method == 'stream') {
        const USER = getUserRandom();
        const audioStream = createAudioStream(USER.token, USER.appKey,
            req.query.text as string,
            Number(req.query.type),
            Number(req.query.pitch),
            Number(req.query.speed),
            Number(req.query.volume));

        if (!audioStream) {
            res.status(500).json({
                error: "can't get stream"
            });
            return;
        }
        res.on('close', () => audioStream.destroy());
        res.type('audio/wav');
        audioStream.on('data', (data)=>{
            res.write(data);
        });
        audioStream.on('close', ()=>{
            res.end();
        });
        return;
    }
}
