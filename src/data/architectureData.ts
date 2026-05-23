import { SystemNode, ApiEndpoint, GameLevel } from '../types';

export const SYSTEM_NODES: SystemNode[] = [
  {
    id: 'client',
    label: 'Mobile Client (React Native)',
    category: 'client',
    description: 'Renders the fast, modular UI, houses the offline puzzle physics/movement engine, local state cache (Zustand/Redux Toolkit), and MMKV for lightning-fast disk access. Implements SSL pinning, payload obfuscation, and anti-tamper checksum structures.',
    tech: 'React Native + Reanimated + TanStack Query + MMKV',
    role: 'Presents core gameplay, coordinates client-side level resolution, collects analytics telemetry, secures receipt payloads, and fires push subscriptions.',
    metricLabel: 'Render Frame Latency',
    metricValue: '16.6ms (60 FPS)'
  },
  {
    id: 'cdn',
    label: 'CloudFront CDN',
    category: 'external',
    description: 'Serves static gameplay assets (MP3 sound fx, modular puzzle level JSON presets, localized image grids, and Dynamic LiveOps structures) globally with sub-20ms edge replication.',
    tech: 'AWS CloudFront / Edge Locations',
    role: 'Lightens origin gateway load, hosts level presets, caches remote config flags, and mitigates layer 4/7 DDoS probes.',
    metricLabel: 'Edge Asset Cache Hit',
    metricValue: '98.4%'
  },
  {
    id: 'gateway',
    label: 'AWS API Gateway',
    category: 'gateway',
    description: 'Aggregates all REST and WebSocket ingress traffic. Houses token authentication, SSL termination, and rate-limiting rules (token bucket style) with low-overhead routing matrices.',
    tech: 'AWS API Gateway / ALB / WAF',
    role: 'Authenticates requests, issues rate throttles, terminates HTTPS handshakes, sanitizes inputs, and routes to respective backend microservices.',
    metricLabel: 'Ingress Peak RPS',
    metricValue: '55,000 / sec'
  },
  {
    id: 'ms_auth',
    label: 'Auth Microservice',
    category: 'service',
    description: 'Manages identity provider integrations (Guest, Facebook, Apple, and Google Auth), executes passwordless/device-based signing, signs JWT session state claims, and handles refresh schedules.',
    tech: 'NestJS / Node.js + JWT Engine',
    role: 'Validates OAuth signatures, generates securely hashed JWTs, tracks sessions, and manages account linking profiles.',
    metricLabel: 'Auth Verification Time',
    metricValue: '35ms'
  },
  {
    id: 'ms_player',
    label: 'Player Service',
    category: 'service',
    description: 'Stores metadata profiles, XP progression records, custom client avatar unlocks, level star completion states, and offline-override settings keys.',
    tech: 'NestJS / Node.js + TypeORM',
    role: 'Provides basic identity profile fetches, handles level progression updates, compiles achievements progress, and backs up local configurations.',
    metricLabel: 'Read Path Latency',
    metricValue: '8ms (95th %)'
  },
  {
    id: 'ms_economy',
    label: 'Economy & Validation Service',
    category: 'service',
    description: 'Crucial server-authoritative engine handling gold, gems, custom skins shop transactions, daily sign-in streak calendars, and App Store/Play Store cryptographic receipt validations.',
    tech: 'NestJS / Node.js + Isolation Transactions',
    role: 'Manages user wallets, executes highly-isolated transaction mutations, verifies Google Play / Apple IAP receipt integrity, and awards level completion loot.',
    metricLabel: 'Receipt Validation Delay',
    metricValue: '120ms (External)'
  },
  {
    id: 'ms_leaderboard',
    label: 'Leaderboard Service',
    category: 'service',
    description: 'Fast, high-throughput microservice answering rank lookups, friends scopes, state global percentiles, and periodic season resets utilizing Redis Sorted Sets.',
    tech: 'NestJS / Go / Redis Cluster',
    role: 'Maintains live scores, compiles rank arrays, yields friend score arrays, and triggers rewards during seasonal boundaries.',
    metricLabel: 'Redis Lookup Complex',
    metricValue: 'O(log N) < 2ms'
  },
  {
    id: 'kafka',
    label: 'Event Broker (Kafka/SQS)',
    category: 'broker',
    description: 'Acts as the asynchronous decoupler across systems. Distributes gameplay events internally (such as a level cleared or item bought) to analytics, notification, and auditing downstream microservices.',
    tech: 'Apache Kafka / Amazon SQS Cluster',
    role: 'Assures reliable async stream ingestion, buffers peak event spikes, logs transaction logs, and enables atomic multi-consumer subscriptions.',
    metricLabel: 'Message Queue Ingress',
    metricValue: '1.2M events/min'
  },
  {
    id: 'db_pg',
    label: 'Primary Postgres DB',
    category: 'db',
    description: 'Dual Multi-AZ instances acting as the resilient, transactional source of truth (ACID) storing players database data, IAP transactions ledger, and strict relational audit schemas.',
    tech: 'AWS RDS Aurora PostgreSQL',
    role: 'Guarantees perfect transactional boundaries, persists relational user states, coordinates row-level locking during economy trades, and manages point-in-time recoveries.',
    metricLabel: 'Db Read-Write Ratio',
    metricValue: '4:1 (Read Favored)'
  },
  {
    id: 'db_redis',
    label: 'Redis Cache & Leaderboard DB',
    category: 'db',
    description: 'In-memory data store in Multi-AZ configuration using cluster partitioning to achieve sub-millisecond leaderboard rendering, token token caching, and configuration metadata caches.',
    tech: 'Amazon ElastiCache Redis',
    role: 'Powers global leaderboard sorted sets, buffers user sessions tokens, intercepts gateway reads, and caches frequently static active configurations.',
    metricLabel: 'Redis Cache Hit Ratio',
    metricValue: '99.2%'
  },
  {
    id: 'ms_analytics',
    label: 'Analytics Service',
    category: 'service',
    description: 'Eats incoming clickstream telemetry, conversion funnels, level collapse states to measure puzzle friction, and dynamic performance counts, streaming them into column-oriented engines.',
    tech: 'NestJS / Go + Kafka Consumer',
    role: 'Validates data format, batch-buffers analytics streams, maps player cohorts, and writes to column engines fast.',
    metricLabel: 'Batch Flush Latency',
    metricValue: '1200ms'
  },
  {
    id: 'db_clickhouse',
    label: 'ClickHouse Analytics Engine',
    category: 'db',
    description: 'Ultra-fast column-oriented database. Queries billions of visual player click events, Level-fail cohorts, and ad conversion performance in milliseconds without slowing down live gaming.',
    tech: 'ClickHouse / AWS Cloud',
    role: 'Supports BI visualizations, tracks puzzle levels drop-off metrics, handles marketing campaign ROAS grids, and stores long-term gaming metrics.',
    metricLabel: 'Query Over 500M Rows',
    metricValue: '0.45 sec'
  },
  {
    id: 'iap',
    label: 'Crypto IAP Handlers (Apple/Google)',
    category: 'external',
    description: 'Outer ecosystems verifying transactional receipts cryptographically off-network.',
    tech: 'Apple StoreKit / Google Play Billing API',
    role: 'Authorizes real-money purchases, delivers verifiable validation signals, and records localized item catalogs.',
    metricLabel: 'External Check delay',
    metricValue: '180ms'
  },
  {
    id: 'firebase_fcm',
    label: 'Firebase FCM & APNs',
    category: 'external',
    description: 'Global push notification gateways streaming background state hooks, daily gift reminders, and dynamic offline challenge updates.',
    tech: 'FCM / Apple APNs Gateway',
    role: 'Maintains background channels with clients, handles priority message bursts, and processes batch retry targets.',
    metricLabel: 'Push Success Rate',
    metricValue: '94.8%'
  }
];

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    path: '/api/auth/guest',
    method: 'POST',
    description: 'Allows instant friction-free login on mobile start. Generates user ID, basic starting coin balance, energy count, and returning JWT token credentials for succeeding transactions.',
    requestBody: `{
  "device_id": "uuid-9f83a-742a-4bc1",
  "client_version": "1.0.4",
  "platform": "iOS"
}`,
    responseTemplate: {
      success: true,
      user_id: "usr_guest_8f29axb",
      token: "jwt_session_eyJhbGciOiJIUzI1NiIsIn...",
      profile: {
        username: "Guest_4821",
        xp: 0,
        coins: 150,
        energy: 5,
        level: 1
      },
      latencyMs: 15
    }
  },
  {
    path: '/api/progress',
    method: 'GET',
    description: 'Fetches the fully authenticated player progress, level completions, star achievements counts, individual timestamps, and level configurations flags.',
    responseTemplate: {
      levelsCompleted: [1, 2, 3],
      currentLevelId: 4,
      stars: 8,
      completionTimes: { "1": 24, "2": 32, "3": 19 },
      backupSyncedAt: "2026-05-21T16:32:00Z"
    }
  },
  {
    path: '/api/progress/update',
    method: 'POST',
    description: 'Submits level resolution results for validation. Server checks move sequence and timeTaken against level definitions to prevent speedhacks, before granting gold rewards.',
    requestBody: `{
  "level_id": 4,
  "stars": 3,
  "score": 1250,
  "moves": 6,
  "timeTaken": 14.2,
  "antiCheatHash": "h8a983bca91bfa3c678"
}`,
    responseTemplate: {
      success: true,
      earnedStars: 3,
      xpGranted: 100,
      coinsGranted: 15,
      newLevelUnlocked: 5,
      checksumValidated: true,
      latencyMs: 14
    }
  },
  {
    path: '/api/reward/claim',
    method: 'POST',
    description: 'Claims daily login streaks, seasonal events rewards, or quest completions. Economy validations prevent double claim attacks.',
    requestBody: `{
  "rewardType": "Daily Bonus",
  "streakDay": 3
}`,
    responseTemplate: {
      success: true,
      claimed: "Daily Bonus",
      rewards: {
        coins: 50,
        energy: 1
      },
      updatedBalance: {
        coins: 200,
        energy: 5
      }
    }
  },
  {
    path: '/api/leaderboard/global',
    method: 'GET',
    description: 'Grabs top global highscores from Redis Sorted Set. Instantly paginates leaderboard indices with O(log N) efficiency and provides relative player tier percentile.',
    responseTemplate: {
      leaderboard: [
        { rank: 1, username: "ArrowMaster", score: 45200, level: 98 },
        { rank: 2, username: "FuriousCursor", score: 42100, level: 85 },
        { rank: 3, username: "ZenGrid", score: 39950, level: 80 },
        { rank: 4, username: "PuzzleWizard", score: 38200, level: 75 },
        { rank: 5, username: "FastlaneBuilder", score: 34500, level: 69 },
      ],
      yourRank: 42,
      totalPlayers: 124502
    }
  }
];

export const PRESET_LEVELS: GameLevel[] = [
  {
    id: 1,
    name: "Classic Grid Intro",
    difficulty: "Easy",
    gridSize: 5,
    arrows: [
      { id: '1', row: 1, col: 2, dir: 'UP', status: 'active' },
      { id: '2', row: 3, col: 2, dir: 'DOWN', status: 'active' },
      { id: '3', row: 2, col: 1, dir: 'LEFT', status: 'active' },
      { id: '4', row: 2, col: 3, dir: 'RIGHT', status: 'active' }
    ]
  },
  {
    id: 2,
    name: "Congested Tunnel",
    difficulty: "Medium",
    gridSize: 5,
    arrows: [
      { id: '11', row: 0, col: 2, dir: 'UP', status: 'active' },
      { id: '12', row: 1, col: 2, dir: 'DOWN', status: 'active' }, // Blocks 13? No, travels DOWN, blocks 14
      { id: '13', row: 2, col: 2, dir: 'UP', status: 'active' },   // Blocks 12 from travelling UP
      { id: '14', row: 3, col: 2, dir: 'DOWN', status: 'active' },
      { id: '15', row: 2, col: 1, dir: 'RIGHT', status: 'active' },
      { id: '16', row: 2, col: 3, dir: 'LEFT', status: 'active' },
      { id: '17', row: 1, col: 1, dir: 'LEFT', status: 'active' }
    ]
  },
  {
    id: 3,
    name: "The Interlock Matrix",
    difficulty: "Hard",
    gridSize: 5,
    arrows: [
      { id: '21', row: 0, col: 1, dir: 'DOWN', status: 'active' },
      { id: '22', row: 1, col: 0, dir: 'RIGHT', status: 'active' },
      { id: '23', row: 1, col: 2, dir: 'LEFT', status: 'active' },
      { id: '24', row: 2, col: 1, dir: 'UP', status: 'active' },
      { id: '25', row: 2, col: 3, dir: 'DOWN', status: 'active' },
      { id: '26', row: 3, col: 2, dir: 'RIGHT', status: 'active' },
      { id: '27', row: 3, col: 4, dir: 'LEFT', status: 'active' },
      { id: '28', row: 4, col: 3, dir: 'UP', status: 'active' },
    ]
  }
];

export const CODE_SNIPPETS: { [key: string]: { file: string, code: string, lang: string } } = {
  nestjs_economy: {
    file: 'economy.service.ts',
    lang: 'typescript',
    code: `import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { UserWallet } from './entities/wallet.entity';
import { TransactionLedger } from './entities/ledger.entity';

@Injectable()
export class EconomyService {
  constructor(
    @InjectRepository(UserWallet)
    private walletRepo: Repository<UserWallet>,
    private connection: Connection
  ) {}

  /**
   * Server-authoritative item purchase with Row-Level Isolation.
   * Leverages full transactional boundaries to prevent balance exploitation.
   */
  async purchaseItem(userId: string, itemId: string, costGems: number): Promise<UserWallet> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');

    try {
      // 1. Fetch wallet with explicit row-level lock (FOR UPDATE)
      const wallet = await queryRunner.manager.findOne(UserWallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' }
      });

      if (!wallet) throw new BadRequestException('Wallet not found');
      if (wallet.gems < costGems) {
        throw new BadRequestException('Insufficient gold/gem currency balances');
      }

      // 2. Perform safe mutation
      wallet.gems -= costGems;
      wallet.updatedAt = new Date();
      await queryRunner.manager.save(wallet);

      // 3. Record transaction ledger audit block
      const ledger = new TransactionLedger();
      ledger.userId = userId;
      ledger.amount = -costGems;
      ledger.currencyType = 'GEMS';
      ledger.source = \`PURCHASE_ITEM_\${itemId}\`;
      ledger.createdAt = new Date();
      await queryRunner.manager.save(ledger);

      await queryRunner.commitTransaction();
      return wallet;
    } catch (err) {
      // Rollback database state seamlessly in case of collisions or connection failures
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}`
  },
  redis_leaderboard: {
    file: 'leaderboard.service.ts',
    lang: 'typescript',
    code: `import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class LeaderboardService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: 6379,
      maxRetriesPerRequest: 3,
    });
  }

  /**
   * Updates scoring index securely in O(log N).
   */
  async updateScore(userId: string, score: number): Promise<number> {
    const leaderboardKey = 'leaderboard:global';
    // NX: Only update if score is higher, or standard ZADD
    await this.redis.zadd(leaderboardKey, score.toString(), userId);
    return score;
  }

  /**
   * Fetches paginated global ranking list instantly.
   */
  async getTopPlayers(offset = 0, limit = 9): Promise<Array<{userId: string, rank: number, score: number}>> {
    const leaderboardKey = 'leaderboard:global';
    const rawScores = await this.redis.zrevrange(
      leaderboardKey, 
      offset, 
      offset + limit, 
      'WITHSCORES'
    );

    const rankings = [];
    for (let i = 0; i < rawScores.length; i += 2) {
      rankings.push({
        userId: rawScores[i],
        score: parseInt(rawScores[i + 1], 10),
        rank: offset + Math.floor(i / 2) + 1
      });
    }
    return rankings;
  }

  /**
   * Identifies custom rank index for specific player with single query.
   */
  async getPlayerRank(userId: string): Promise<{ rank: number | null, score: number }> {
    const leaderboardKey = 'leaderboard:global';
    const [zrank, zscore] = await Promise.all([
      this.redis.zrevrank(leaderboardKey, userId),
      this.redis.zscore(leaderboardKey, userId)
    ]);

    return {
      rank: zrank !== null ? zrank + 1 : null,
      score: zscore !== null ? parseInt(zscore, 10) : 0
    };
  }
}`
  },
  anti_cheat: {
    file: 'anti-cheat.validator.ts',
    lang: 'typescript',
    code: `import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class AntiCheatValidator {
  private readonly SECRET_HMAC_SALT = process.env.CHECKSUM_HMAC_KEY || 'arrow-system-salt-392';

  /**
   * Validates level parameters server-side to prevent game exploitation.
   * Asserts human-possible moves limits, minimum delays, and payload signature key validations.
   */
  validateLevelSubmission(payload: {
    userId: string;
    levelId: number;
    stars: number;
    score: number;
    moves: number;
    timeTaken: number;
    antiCheatHash: string;
  }): boolean {
    const { userId, levelId, score, moves, timeTaken, antiCheatHash } = payload;

    // Rule 1: Validate computational integrity via HMAC checksum generated by native bundle
    const reconstructSource = \`\${userId}:\${levelId}:\${score}:\${moves}:\${timeTaken.toFixed(1)}\`;
    const expectedHash = crypto
      .createHmac('sha256', this.SECRET_HMAC_SALT)
      .update(reconstructSource)
      .digest('hex');

    if (antiCheatHash !== expectedHash) {
      throw new BadRequestException('Security validation failed: Manifest signature is mathematically compromised.');
    }

    // Rule 2: Physical possibility boundaries
    // Assumes no puzzle solved in under 1.5 seconds, or average speed faster than 120ms per screen interaction sequence
    const minPossibleTime = 1.5;
    const msPerInteraction = (timeTaken * 1000) / (moves || 1);

    if (timeTaken < minPossibleTime) {
      throw new BadRequestException('Exploit Trigger: Human level solution time is physically impossible.');
    }

    if (msPerInteraction < 100) {
      throw new BadRequestException('Exploit Trigger: Command sequence rate conforms to bot activity patterns.');
    }

    return true;
  }
}`
  },
  kafka_events: {
    file: 'event.dispatcher.ts',
    lang: 'typescript',
    code: `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class EventDispatcher implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'arrow-economy-service',
      brokers: (process.env.KAFKA_BROKERS || 'kafka-broker-1:9092,kafka-broker-2:9092').split(',')
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('[Kafka Event Broker] Connected successfully.');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  /**
   * Publishes critical events asynchronously to let analytical engines ingestion continue without delaying player UI path.
   */
  async dispatchLevelCompleted(userId: string, levelId: number, score: number, coinsEarned: number) {
    const eventPayload = {
      eventId: \`evt_\${Math.random().toString(36).substr(2, 9)}\`,
      eventType: 'level_completed',
      userId,
      timestamp: new Date().toISOString(),
      details: {
        levelId,
        score,
        coinsEarned
      }
    };

    await this.producer.send({
      topic: 'game-events-global',
      messages: [
        {
          key: userId,
          value: JSON.stringify(eventPayload),
          headers: { 'event-version': '1.0' }
        }
      ]
    });
  }
}`
  }
};
