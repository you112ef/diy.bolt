import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('SmartCacheManager');

export interface CacheItem<T = any> {
  value: T;
  timestamp: number;
  expiry: number;
  accessCount: number;
  lastAccessed: number;
  size?: number;
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  maxItems?: number; // Maximum number of items
  tags?: string[]; // Tags for cache invalidation
  serialize?: boolean; // Whether to serialize the value
  compress?: boolean; // Whether to compress the value
}

export class SmartCacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private persistentCache: Storage | null = null;
  private maxMemorySize: number;
  private maxMemoryItems: number;
  private currentMemorySize = 0;
  private compressionEnabled = false;

  constructor(options?: {
    maxMemorySize?: number;
    maxMemoryItems?: number;
    enablePersistence?: boolean;
    enableCompression?: boolean;
  }) {
    this.maxMemorySize = options?.maxMemorySize || 50 * 1024 * 1024; // 50MB
    this.maxMemoryItems = options?.maxMemoryItems || 1000;
    this.compressionEnabled = options?.enableCompression || false;

    if (options?.enablePersistence && typeof window !== 'undefined') {
      this.persistentCache = window.localStorage;
    }

    // تنظيف دوري للتخزين المؤقت
    this.startCleanupTimer();
  }

  // حفظ في التخزين المؤقت
  set<T>(key: string, value: T, options?: CacheOptions): boolean {
    try {
      const now = Date.now();
      const ttl = options?.ttl || 3600000; // 1 hour default
      const expiry = now + ttl;

      // حساب حجم البيانات
      const serializedValue = this.serializeValue(value, options?.serialize);
      const size = this.calculateSize(serializedValue);

      // فحص حدود الذاكرة
      if (size > this.maxMemorySize) {
        logger.warn('Item too large for cache', { key, size });
        return false;
      }

      // تنظيف مساحة إذا لزم الأمر
      this.ensureSpace(size);

      const cacheItem: CacheItem<T> = {
        value: serializedValue,
        timestamp: now,
        expiry,
        accessCount: 0,
        lastAccessed: now,
        size,
        tags: options?.tags,
      };

      this.memoryCache.set(key, cacheItem);
      this.currentMemorySize += size;

      // حفظ في التخزين الدائم إذا كان متاحاً
      if (this.persistentCache && options?.serialize !== false) {
        this.saveToPersistentCache(key, cacheItem);
      }

      logger.debug('Cache item stored', { key, size, expiry });

      return true;
    } catch (error) {
      logger.error('Failed to store cache item', { key, error });
      return false;
    }
  }

  // استرجاع من التخزين المؤقت
  get<T>(key: string): T | null {
    try {
      let cacheItem = this.memoryCache.get(key);

      // البحث في التخزين الدائم إذا لم توجد في الذاكرة
      if (!cacheItem && this.persistentCache) {
        cacheItem = this.loadFromPersistentCache(key) || undefined;

        if (cacheItem) {
          this.memoryCache.set(key, cacheItem);
          this.currentMemorySize += cacheItem.size || 0;
        }
      }

      if (!cacheItem) {
        return null;
      }

      // فحص انتهاء الصلاحية
      if (Date.now() > cacheItem.expiry) {
        this.delete(key);
        return null;
      }

      // تحديث إحصائيات الوصول
      cacheItem.accessCount++;
      cacheItem.lastAccessed = Date.now();

      return this.deserializeValue(cacheItem.value);
    } catch (error) {
      logger.error('Failed to retrieve cache item', { key, error });
      return null;
    }
  }

  // حذف من التخزين المؤقت
  delete(key: string): boolean {
    try {
      const cacheItem = this.memoryCache.get(key);

      if (cacheItem) {
        this.currentMemorySize -= cacheItem.size || 0;
        this.memoryCache.delete(key);
      }

      if (this.persistentCache) {
        this.persistentCache.removeItem(`cache_${key}`);
      }

      logger.debug('Cache item deleted', { key });

      return true;
    } catch (error) {
      logger.error('Failed to delete cache item', { key, error });
      return false;
    }
  }

  // مسح التخزين المؤقت بالكامل
  clear(): void {
    this.memoryCache.clear();
    this.currentMemorySize = 0;

    if (this.persistentCache) {
      const keys = Object.keys(this.persistentCache);
      keys.forEach((key) => {
        if (key.startsWith('cache_')) {
          this.persistentCache!.removeItem(key);
        }
      });
    }

    logger.info('Cache cleared');
  }

  // مسح التخزين المؤقت بالعلامات
  clearByTags(tags: string[]): number {
    let clearedCount = 0;

    for (const [key, item] of this.memoryCache.entries()) {
      if (item.tags && item.tags.some((tag) => tags.includes(tag))) {
        this.delete(key);
        clearedCount++;
      }
    }

    logger.info('Cache cleared by tags', { tags, clearedCount });

    return clearedCount;
  }

  // فحص وجود المفتاح
  has(key: string): boolean {
    const item = this.memoryCache.get(key);

    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.delete(key);
      return false;
    }

    return true;
  }

  // الحصول على إحصائيات التخزين المؤقت
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    let totalAccess = 0;

    for (const item of this.memoryCache.values()) {
      if (now > item.expiry) {
        expiredCount++;
      }

      totalAccess += item.accessCount;
    }

    return {
      totalItems: this.memoryCache.size,
      currentSize: this.currentMemorySize,
      maxSize: this.maxMemorySize,
      maxItems: this.maxMemoryItems,
      expiredItems: expiredCount,
      totalAccess,
      hitRate: this.calculateHitRate(),
      memoryUsage: (this.currentMemorySize / this.maxMemorySize) * 100,
    };
  }

  // تنظيف العناصر المنتهية الصلاحية
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        this.delete(key);
        cleanedCount++;
      }
    }

    logger.debug('Cache cleanup completed', { cleanedCount });

    return cleanedCount;
  }

  // ضمان توفر مساحة كافية
  private ensureSpace(requiredSize: number): void {
    // تنظيف العناصر المنتهية الصلاحية أولاً
    this.cleanup();

    // فحص عدد العناصر
    while (this.memoryCache.size >= this.maxMemoryItems) {
      this.evictLeastUsed();
    }

    // فحص حجم الذاكرة
    while (this.currentMemorySize + requiredSize > this.maxMemorySize) {
      if (!this.evictLeastUsed()) {
        break; // لا توجد عناصر للحذف
      }
    }
  }

  // حذف العنصر الأقل استخداماً
  private evictLeastUsed(): boolean {
    if (this.memoryCache.size === 0) {
      return false;
    }

    let leastUsedKey = '';
    let leastUsedScore = Infinity;

    const now = Date.now();

    for (const [key, item] of this.memoryCache.entries()) {
      // حساب نقاط الاستخدام (أقل = أولوية للحذف)
      const timeSinceAccess = now - item.lastAccessed;
      const score = item.accessCount / (timeSinceAccess / 1000 / 60); // access per minute

      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.delete(leastUsedKey);
      logger.debug('Evicted least used item', { key: leastUsedKey, score: leastUsedScore });

      return true;
    }

    return false;
  }

  // حفظ في التخزين الدائم
  private saveToPersistentCache(key: string, item: CacheItem): void {
    if (!this.persistentCache) {
      return;
    }

    try {
      const serialized = JSON.stringify({
        value: item.value,
        timestamp: item.timestamp,
        expiry: item.expiry,
        tags: item.tags,
      });

      this.persistentCache.setItem(`cache_${key}`, serialized);
    } catch (error) {
      logger.warn('Failed to save to persistent cache', { key, error });
    }
  }

  // تحميل من التخزين الدائم
  private loadFromPersistentCache(key: string): CacheItem | null {
    if (!this.persistentCache) {
      return null;
    }

    try {
      const serialized = this.persistentCache.getItem(`cache_${key}`);

      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized);

      return {
        value: parsed.value,
        timestamp: parsed.timestamp,
        expiry: parsed.expiry,
        accessCount: 0,
        lastAccessed: Date.now(),
        size: this.calculateSize(parsed.value),
        tags: parsed.tags,
      };
    } catch (error) {
      logger.warn('Failed to load from persistent cache', { key, error });
      return null;
    }
  }

  // تسلسل القيمة
  private serializeValue<T>(value: T, shouldSerialize?: boolean): any {
    if (shouldSerialize === false) {
      return value;
    }

    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }

  // إلغاء تسلسل القيمة
  private deserializeValue<T>(value: any): T {
    return value;
  }

  // حساب حجم البيانات
  private calculateSize(value: any): number {
    try {
      return new Blob([JSON.stringify(value)]).size;
    } catch {
      return JSON.stringify(value).length * 2; // تقدير تقريبي
    }
  }

  // حساب معدل النجاح
  private calculateHitRate(): number {
    // هذا تقدير بسيط - يمكن تحسينه بتتبع أكثر تفصيلاً
    const totalAccess = Array.from(this.memoryCache.values()).reduce((sum, item) => sum + item.accessCount, 0);

    return totalAccess > 0 ? (this.memoryCache.size / totalAccess) * 100 : 0;
  }

  // بدء مؤقت التنظيف
  private startCleanupTimer(): void {
    setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    ); // تنظيف كل 5 دقائق
  }
}

// إنشاء مدير تخزين مؤقت مشترك
export const smartCache = new SmartCacheManager({
  maxMemorySize: 50 * 1024 * 1024, // 50MB
  maxMemoryItems: 1000,
  enablePersistence: true,
  enableCompression: false,
});

// مدير طلبات محسّن
export class RequestManager {
  private cache: SmartCacheManager;
  private pendingRequests = new Map<string, Promise<any>>();
  private requestQueue: Array<() => Promise<any>> = [];
  private maxConcurrentRequests = 6;
  private activeRequests = 0;

  constructor(cache: SmartCacheManager) {
    this.cache = cache;
  }

  // طلب محسّن مع تخزين مؤقت
  async request<T>(
    url: string,
    options?: RequestInit & {
      cacheKey?: string;
      cacheTTL?: number;
      retries?: number;
      timeout?: number;
    },
  ): Promise<T> {
    const cacheKey = options?.cacheKey || `request_${url}_${JSON.stringify(options)}`;

    // فحص التخزين المؤقت أولاً
    const cached = this.cache.get<T>(cacheKey);

    if (cached) {
      logger.debug('Request served from cache', { url, cacheKey });
      return cached;
    }

    // فحص الطلبات المعلقة
    if (this.pendingRequests.has(cacheKey)) {
      logger.debug('Request already pending', { url, cacheKey });
      return this.pendingRequests.get(cacheKey);
    }

    // إنشاء طلب جديد
    const requestPromise = this.executeRequest<T>(url, options);
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // حفظ في التخزين المؤقت
      this.cache.set(cacheKey, result, {
        ttl: options?.cacheTTL || 300000, // 5 minutes default
        tags: ['request'],
      });

      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  // تنفيذ الطلب مع إدارة التزامن
  private async executeRequest<T>(
    url: string,
    options?: RequestInit & { retries?: number; timeout?: number },
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const executeNow = async () => {
        this.activeRequests++;

        try {
          const result = await this.performRequest<T>(url, options);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.activeRequests--;
          this.processQueue();
        }
      };

      if (this.activeRequests < this.maxConcurrentRequests) {
        executeNow();
      } else {
        this.requestQueue.push(executeNow);
      }
    });
  }

  // تنفيذ الطلب الفعلي
  private async performRequest<T>(
    url: string,
    options?: RequestInit & { retries?: number; timeout?: number },
  ): Promise<T> {
    const retries = options?.retries || 3;
    const timeout = options?.timeout || 10000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = (await response.json()) as T;
        logger.debug('Request completed', { url, attempt });

        return result;
      } catch (error) {
        logger.warn('Request attempt failed', { url, attempt, error });

        if (attempt === retries) {
          throw error;
        }

        // انتظار متزايد بين المحاولات
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw new Error('All request attempts failed');
  }

  // معالجة طابور الطلبات
  private processQueue(): void {
    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const nextRequest = this.requestQueue.shift();

      if (nextRequest) {
        nextRequest();
      }
    }
  }

  // مسح تخزين الطلبات المؤقت
  clearRequestCache(): void {
    this.cache.clearByTags(['request']);
  }
}

// إنشاء مدير طلبات مشترك
export const requestManager = new RequestManager(smartCache);
