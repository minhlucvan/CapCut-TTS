import 'dotenv/config';
const env = {
    CapCutAPIURL: process.env.CAPCUT_API_URL as string,
    ByteintlApi: process.env.BYTEINTL_API_URL as string,
    DeviceTime: process.env.DEVICE_TIME as string,
    Sign: process.env.SIGN as string,
    UserAgent: process.env.USER_AGENT as string,
    // Node Setting
    ErrorHandle: process.env.ERROR_HANDLE == 'true' ? true : false,
    // Server Setting
    Host: process.env.HOST as string,
    Port: Number(process.env.PORT),
    Origin: process.env.ORIGIN as string,
    TokenInterval: Number(process.env.TOKEN_INTERVAL),

    // support multiple token
    DeviceTimes: (process.env.DEVICE_TIMES || "").split(','),
    Signs: (process.env.SIGNS || "").split(','),

    // New TTS API settings
    Cookie: process.env.COOKIE as string || '',
    WebId: process.env.WEB_ID as string || '7562437725447964177',
    WorkspaceId: process.env.WORKSPACE_ID as string || '7444016137714581565',

    // Multiple cookies support
    Cookies: (process.env.COOKIES || "").split('|||'),
}

export default env;
