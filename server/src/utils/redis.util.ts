import { Redis as UpstashRedis } from '@upstash/redis';
import { Redis as IORedis } from 'ioredis';
import {
  REDIS_URL,
  UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN,
  NODE_ENV,
  USE_UPSTASH,
} from './config.util.js';

export interface IRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: any[]): Promise<'OK' | string | null>;
  del(...keys: (string | string[])[]): Promise<number>;
}

class UpstashRedisAdapter implements IRedisClient {
  private client: UpstashRedis;

  constructor(url: string, token: string) {
    this.client = new UpstashRedis({ url, token });
  }

  async get(key: string): Promise<string | null> {
    try {
      const val = await this.client.get(key);
      if (val === null || val === undefined) return null;
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    } catch (err: any) {
      console.error('[Upstash Redis Error] get:', err?.message || err);
      return null;
    }
  }

  async set(key: string, value: string, ...args: any[]): Promise<'OK' | string | null> {
    try {
      if (args.length >= 2 && typeof args[0] === 'string' && args[0].toUpperCase() === 'EX') {
        const seconds = Number(args[1]);
        await this.client.set(key, value, { ex: seconds });
        return 'OK';
      }
      if (args.length >= 2 && typeof args[0] === 'string' && args[0].toUpperCase() === 'PX') {
        const ms = Number(args[1]);
        await this.client.set(key, value, { px: ms });
        return 'OK';
      }
      await this.client.set(key, value);
      return 'OK';
    } catch (err: any) {
      console.error('[Upstash Redis Error] set:', err?.message || err);
      return null;
    }
  }

  async del(...keys: (string | string[])[]): Promise<number> {
    try {
      const flatKeys = keys.flat();
      if (flatKeys.length === 0) return 0;
      return await this.client.del(...flatKeys);
    } catch (err: any) {
      console.error('[Upstash Redis Error] del:', err?.message || err);
      return 0;
    }
  }
}

class LocalRedisAdapter implements IRedisClient {
  private client: IORedis;

  constructor(url: string) {
    this.client = new IORedis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
      retryStrategy(times: number) {
        if (times > 5) {
          return null;
        }
        return Math.min(times * 150, 2000);
      },
    });

    this.client.on('error', (err: any) => {
      console.warn('[Local Redis Warning]:', err?.message || err);
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err: any) {
      console.error('[Local Redis Error] get:', err?.message || err);
      return null;
    }
  }

  async set(key: string, value: string, ...args: any[]): Promise<'OK' | string | null> {
    try {
      // @ts-ignore
      return await this.client.set(key, value, ...args);
    } catch (err: any) {
      console.error('[Local Redis Error] set:', err?.message || err);
      return null;
    }
  }

  async del(...keys: (string | string[])[]): Promise<number> {
    try {
      const flatKeys = keys.flat();
      if (flatKeys.length === 0) return 0;
      return await this.client.del(...flatKeys);
    } catch (err: any) {
      console.error('[Local Redis Error] del:', err?.message || err);
      return 0;
    }
  }
}

const isProduction = NODE_ENV === 'production';
const hasUpstashConfig = Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
const shouldConnectUpstash = USE_UPSTASH || (isProduction && hasUpstashConfig);

let redis: IRedisClient;

if (shouldConnectUpstash) {
  console.log('⚡ Redis: Using Upstash REST Client (Deployment / Upstash Mode)');
  redis = new UpstashRedisAdapter(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN);
} else {
  console.log('⚡ Redis: Using Local Redis Client (ioredis)');
  redis = new LocalRedisAdapter(REDIS_URL);
}

export const redisKeys = {
  // Email verification tokens (alternative to DB, for quick expiry)
  emailVerificationToken: (token: string) => `email_verification:${token}`,
  emailVerificationByUser: (userId: string) => `email_verification:user:${userId}`,

  // Password reset tokens
  passwordResetToken: (token: string) => `password_reset:${token}`,
  passwordResetByUser: (userId: string) => `password_reset:user:${userId}`,

  // Sessions (prefer DB but cache in Redis for speed)
  sessionToken: (token: string) => `session:${token}`,
  userSessions: (userId: string) => `sessions:user:${userId}`,

  // Rate limiting
  loginAttempts: (identifier: string) => `login_attempts:${identifier}`,
  signupAttempts: (email: string) => `signup_attempts:${email}`,
  emailVerifyAttempts: (email: string) => `email_verify_attempts:${email}`,

  // Email deduplication (prevent duplicate signup requests)
  pendingSignupEmail: (email: string) => `pending_signup:${email}`,
};

export default redis;