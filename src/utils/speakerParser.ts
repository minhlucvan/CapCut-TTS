import { getVoiceById } from '../config/voices';

// Legacy type-based speaker selection (for backward compatibility)
export default function speakerParser(type: number, lang = 'vi'): string {
    // Vietnamese voices
    if (lang === 'vi') {
        const viVoices = [
            'BV074_streaming',      // 0 - Cute Female
            'BV075_streaming',      // 1 - Confident Male
            'vi_female_huong',      // 2 - Giọng nữ phổ thông
            'BV560_streaming',      // 3 - Anh Dũng
            'BV562_streaming',      // 4 - Chí Mai
            'BV421_vivn_streaming', // 5 - Sweet Little Girl
        ];
        return viVoices[type] || viVoices[0];
    }

    // Japanese voices (legacy mapping)
    const jaVoices = [
        'BV525_streaming',  // 0 - Male 1
        'BV528_streaming',  // 1 - Boy
        'BV017_streaming',  // 2 - Kawaii Voice
        'BV016_streaming',  // 3 - Onee-san
        'BV023_streaming',  // 4 - Girl
        'BV024_streaming',  // 5 - Female
        'BV018_streaming',  // 6 - Male 2
        'BV523_streaming',  // 7 - Young Master
        'BV521_streaming',  // 8 - Female 2
        'BV522_streaming',  // 9 - Female Announcer
        'BV524_streaming',  // 10 - Male Announcer
        'BV520_streaming',  // 11 - Genki Loli
        'VOV401_bytesing3_kangkangwuqu', // 12 - Bright Honey
        'VOV402_bytesing3_oh',           // 13 - Gentle Lady
        'VOV402_bytesing3_aidelizan',    // 14 - Elegant Mezzo-soprano
        'jp_005',           // 15 - Sakura
    ];

    return jaVoices[type] || 'BV016_streaming';
}

// Get speaker info by speaker ID
export function getSpeakerInfo(speakerId: string): { speaker: string; name: string; platform: number } {
    const voice = getVoiceById(speakerId);
    if (voice) {
        return {
            speaker: voice.speaker,
            name: voice.name,
            platform: voice.platform
        };
    }

    // Default fallback
    return {
        speaker: speakerId,
        name: 'Unknown Voice',
        platform: 1
    };
}

// Parse speaker from request (can be ID, name, or type number)
export function parseSpeaker(input: string | number, lang = 'vi'): { speaker: string; name: string; platform: number } {
    // If it's a number, use legacy type-based selection
    if (typeof input === 'number') {
        const speaker = speakerParser(input, lang);
        return getSpeakerInfo(speaker);
    }

    // If it's a string, try to find by ID first
    const voice = getVoiceById(input);
    if (voice) {
        return {
            speaker: voice.speaker,
            name: voice.name,
            platform: voice.platform
        };
    }

    // Assume it's a valid speaker ID
    return {
        speaker: input,
        name: input,
        platform: 1
    };
}
