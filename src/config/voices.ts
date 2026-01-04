export interface Voice {
    id: string;
    speaker: string;
    name: string;
    gender: 'male' | 'female';
    language: string;
    platform: number; // 1 = standard, 2 = premium/special
    description?: string;
}

// Vietnamese voices
export const vietnameseVoices: Voice[] = [
    {
        id: 'vi_female_huong',
        speaker: 'vi_female_huong',
        name: 'Giọng nữ phổ thông',
        gender: 'female',
        language: 'vi',
        platform: 1,
        description: 'Standard Vietnamese female voice'
    },
    {
        id: 'BV074_streaming',
        speaker: 'BV074_streaming',
        name: 'Cute Female',
        gender: 'female',
        language: 'vi',
        platform: 1,
        description: 'Cute Vietnamese female voice'
    },
    {
        id: 'BV075_streaming',
        speaker: 'BV075_streaming',
        name: 'Confident Male',
        gender: 'male',
        language: 'vi',
        platform: 1,
        description: 'Confident Vietnamese male voice'
    },
    {
        id: 'BV560_streaming',
        speaker: 'BV560_streaming',
        name: 'Anh Dũng',
        gender: 'male',
        language: 'vi',
        platform: 1,
        description: 'Vietnamese male voice - Anh Dũng'
    },
    {
        id: 'BV562_streaming',
        speaker: 'BV562_streaming',
        name: 'Chí Mai',
        gender: 'female',
        language: 'vi',
        platform: 1,
        description: 'Vietnamese female voice - Chí Mai'
    },
    {
        id: 'BV421_vivn_streaming',
        speaker: 'BV421_vivn_streaming',
        name: 'Sweet Little Girl',
        gender: 'female',
        language: 'vi',
        platform: 1,
        description: 'Sweet little girl Vietnamese voice'
    },
    {
        id: 'pGapy9MNHCukzJtjavF0',
        speaker: 'pGapy9MNHCukzJtjavF0',
        name: 'Hà Nữ',
        gender: 'female',
        language: 'vi',
        platform: 2,
        description: 'Premium Vietnamese female voice - Hà Nữ'
    },
];

// Japanese voices (from existing speakerParser)
export const japaneseVoices: Voice[] = [
    {
        id: 'BV525_streaming',
        speaker: 'BV525_streaming',
        name: 'Male 1',
        gender: 'male',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV528_streaming',
        speaker: 'BV528_streaming',
        name: 'Boy',
        gender: 'male',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV017_streaming',
        speaker: 'BV017_streaming',
        name: 'Kawaii Voice',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV016_streaming',
        speaker: 'BV016_streaming',
        name: 'Onee-san',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV023_streaming',
        speaker: 'BV023_streaming',
        name: 'Girl',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV024_streaming',
        speaker: 'BV024_streaming',
        name: 'Female',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV018_streaming',
        speaker: 'BV018_streaming',
        name: 'Male 2',
        gender: 'male',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV523_streaming',
        speaker: 'BV523_streaming',
        name: 'Young Master',
        gender: 'male',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV521_streaming',
        speaker: 'BV521_streaming',
        name: 'Female 2',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV522_streaming',
        speaker: 'BV522_streaming',
        name: 'Female Announcer',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV524_streaming',
        speaker: 'BV524_streaming',
        name: 'Male Announcer',
        gender: 'male',
        language: 'ja',
        platform: 1
    },
    {
        id: 'BV520_streaming',
        speaker: 'BV520_streaming',
        name: 'Genki Loli',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'jp_005',
        speaker: 'jp_005',
        name: 'Sakura',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
];

// Singing voices (Japanese)
export const singingVoices: Voice[] = [
    {
        id: 'VOV401_bytesing3_kangkangwuqu',
        speaker: 'VOV401_bytesing3_kangkangwuqu',
        name: 'Bright Honey',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'VOV402_bytesing3_oh',
        speaker: 'VOV402_bytesing3_oh',
        name: 'Gentle Lady',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
    {
        id: 'VOV402_bytesing3_aidelizan',
        speaker: 'VOV402_bytesing3_aidelizan',
        name: 'Elegant Mezzo-soprano',
        gender: 'female',
        language: 'ja',
        platform: 1
    },
];

// All voices combined
export const allVoices: Voice[] = [
    ...vietnameseVoices,
    ...japaneseVoices,
    ...singingVoices,
];

// Helper functions
export function getVoiceById(id: string): Voice | undefined {
    return allVoices.find(v => v.id === id || v.speaker === id);
}

export function getVoicesByLanguage(language: string): Voice[] {
    return allVoices.filter(v => v.language === language);
}

export function getVoicesByGender(gender: 'male' | 'female'): Voice[] {
    return allVoices.filter(v => v.gender === gender);
}

export function getDefaultVoice(language: string = 'vi'): Voice {
    const voices = getVoicesByLanguage(language);
    return voices[0] || vietnameseVoices[0];
}

// Export voice list as JSON for API response
export function getVoiceList(): { id: string; name: string; gender: string; language: string }[] {
    return allVoices.map(v => ({
        id: v.id,
        name: v.name,
        gender: v.gender,
        language: v.language
    }));
}
