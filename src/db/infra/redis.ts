import { createClient } from 'redis';

class RedisCache {
  private client = createClient({ url: process.env.REDIS_URI });

  constructor() {
    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  public async connect(): Promise<void> {
    await this.client.connect();
    console.log('Redis connected');
  }

  public async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.client.set(key, value, { EX: ttl });
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}

export default RedisCache;
