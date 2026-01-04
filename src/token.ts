import getToken, { getTokenIndex } from "./api/getToken";
import env from "./config/env";
import logger from "./utils/log";
import { sleep } from "./utils/util";

export const USER = {
    token: '',
    appKey: ''
}

interface User {
    token: string;
    appKey: string;
}

export const USERS: User[] = [];

export const getUserRandom = () => {

    if (USERS.length === 0) {
        return USER;
    }

    const randomIndex = Math.floor(Math.random() * USERS.length);
    return USERS[randomIndex];
}

// New credentials for HTTP-based TTS API
interface Credentials {
    deviceTime: string;
    sign: string;
    cookie: string;
    workspaceId: string;
}

const CREDENTIALS: Credentials[] = [];

export const getCredentialsRandom = (): Credentials => {
    // If we have multiple credentials configured
    if (CREDENTIALS.length > 0) {
        const randomIndex = Math.floor(Math.random() * CREDENTIALS.length);
        return CREDENTIALS[randomIndex];
    }

    // Fall back to single credential from env
    return {
        deviceTime: env.DeviceTime || String(Math.floor(Date.now() / 1000)),
        sign: env.Sign,
        cookie: env.Cookie,
        workspaceId: env.WorkspaceId
    };
}

export function initCredentials() {
    // Initialize multiple credentials if configured
    if (env.Cookies && env.Cookies.length > 0 && env.Cookies[0] !== '') {
        for (let i = 0; i < env.Cookies.length; i++) {
            const deviceTime = env.DeviceTimes[i] || env.DeviceTime || String(Math.floor(Date.now() / 1000));
            const sign = env.Signs[i] || env.Sign;
            const cookie = env.Cookies[i];

            if (cookie) {
                CREDENTIALS.push({
                    deviceTime,
                    sign,
                    cookie,
                    workspaceId: env.WorkspaceId
                });
                logger.info(`Credentials ${i} loaded`);
            }
        }
    } else if (env.Cookie) {
        // Single credential
        CREDENTIALS.push({
            deviceTime: env.DeviceTime || String(Math.floor(Date.now() / 1000)),
            sign: env.Sign,
            cookie: env.Cookie,
            workspaceId: env.WorkspaceId
        });
        logger.info('Single credential loaded');
    }

    logger.info(`Total credentials loaded: ${CREDENTIALS.length}`);
}

export async function tokenTask() {
    logger.info("Token Task started");

    // Initialize new credentials
    initCredentials();

    if (Array.isArray(env.DeviceTimes) && Array.isArray(env.Signs)) {
        tokenTaskMultiple();
    } else {
        tokenTaskSingle();
    }
}

export async function tokenTaskSingle() {
    logger.info("Token Task Single started");
    while(true) {
        if (Number.isNaN(env.TokenInterval)) throw ".env TOKEN_INTERVAL is invalid.";
        logger.info("Token generated");
        const tokenRes = await getToken();
        if (!tokenRes) continue;
        USER.token = tokenRes.data.token;
        USER.appKey = tokenRes.data.app_key;
        await sleep(1000 * 60 * 60 * env.TokenInterval);
    }
}

export async function tokenTaskMultiple() {
    logger.info("Token Task Multiple started");
    while(true) {
        if (Number.isNaN(env.TokenInterval)) throw ".env TOKEN_INTERVAL is invalid.";
        for (let i = 0; i < env.DeviceTimes.length; i++) {
            const tokenRes = await getTokenIndex(i);
            if (tokenRes) {
                USERS[i] = {
                    token: tokenRes.data.token,
                    appKey: tokenRes.data.app_key
                };
            }
            logger.info(`Token ${i} generated`);

            await sleep(1000);
        }
        await sleep(1000 * 60 * 60 * env.TokenInterval);
    }
}
