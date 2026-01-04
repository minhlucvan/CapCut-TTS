import { Request, Response } from 'express';
import { allVoices, getVoicesByLanguage, getVoicesByGender, getVoiceList, Voice } from '../config/voices';

export default function voices(req: Request, res: Response) {
    const language = req.query.language as string;
    const gender = req.query.gender as 'male' | 'female';

    let filteredVoices: Voice[] = allVoices;

    if (language) {
        filteredVoices = filteredVoices.filter(v => v.language === language);
    }

    if (gender) {
        filteredVoices = filteredVoices.filter(v => v.gender === gender);
    }

    const result = filteredVoices.map(v => ({
        id: v.id,
        speaker: v.speaker,
        name: v.name,
        gender: v.gender,
        language: v.language,
        platform: v.platform,
        description: v.description
    }));

    res.json({
        count: result.length,
        voices: result
    });
}
