// V6 True Bulletproof Architecture (IndexedDB + Epoch Leadership)

const DB_NAME = 'ai_gym_db';
const DB_VERSION = 1;
const STORE_NAME = 'wal_queue';

class ResilientStore {
    constructor() {
        this.syncing = false;
        
        // Leader Election State
        this.nodeId = crypto.randomUUID();
        this.epoch = 0;
        this.isLeader = false;
        this.lastHeartbeat = 0;
        this.channel = new BroadcastChannel('ai_gym_sync_channel');
        
        this.globalConfig = null;
        this.circuitTripped = false;
        this.circuitCooldownEnd = 0;
        this.db = null;
        this.queueSize = 0; 
        this.lastSuccessfulSync = Date.now();
        this.globalRateLimitedUntil = 0; // Cross-tab 429 cooldown

        this.initDB().then(async () => {
            const queue = await this.getQueue();
            this.queueSize = queue.filter(i => !i.id.startsWith('lock_') && !i.id.startsWith('meta_')).length;
            
            // Rehydrate 429 cooldown state from IndexedDB on init (catches tab restarts)
            const rateMeta = await this._getMeta('rate_limit');
            if (rateMeta) this.globalRateLimitedUntil = rateMeta.until || 0;
            
            this.setupLeaderElection();
            this.fetchConfig();
            
            setInterval(() => this.attemptSync(), 5000);
            setInterval(() => this.fetchConfig(), 300000);
            
            // Periodic Queue Reconciliation (Hybrid Model)
            setInterval(async () => {
                const queue = await this.getQueue();
                this.queueSize = queue.filter(i => !i.id.startsWith('lock_') && !i.id.startsWith('meta_')).length;
            }, 15000);
            
            // Stuck Queue Detector
            setInterval(() => {
                if (this.queueSize > 0 && Date.now() - this.lastSuccessfulSync > 60000) {
                    console.warn("🚨 [ANOMALY] QUEUE_STUCK detected.");
                    fetch('/api/telemetry', { 
                        method: 'POST', 
                        body: JSON.stringify([{ type: 'queue_stuck' }]) 
                    }).catch(()=>{});
                }
            }, 10000);

            window.addEventListener('online', () => {
                if (this.isLeader) this.attemptSync();
            });
        }).catch(err => {
            console.error("IndexedDB initialization failed. Degrading system.", err);
            this.circuitTripped = true;
            this.circuitCooldownEnd = Date.now() + 86400000; // 24h
        });
    }

    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onerror = (event) => reject(event.target.error);
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }

    async fetchConfig() {
        try {
            const res = await fetch('/api/config');
            if (res.ok) this.globalConfig = await res.json();
        } catch (e) {
            console.warn("Could not fetch global config");
        }
    }

    setupLeaderElection() {
        // Initial bid for leadership
        this.claimLeadership();

        this.channel.onmessage = (event) => {
            if (event.data.type === 'heartbeat') {
                const { epoch: incomingEpoch, nodeId: incomingNodeId } = event.data;
                
                // Highest epoch wins. If tied, highest nodeId string wins.
                if (incomingEpoch > this.epoch || (incomingEpoch === this.epoch && incomingNodeId > this.nodeId)) {
                    if (this.isLeader) {
                        console.log(`[WAL] Demoting self. Node ${incomingNodeId} has higher claim.`);
                    }
                    this.isLeader = false;
                    this.epoch = incomingEpoch; // Sync epoch
                    this.lastHeartbeat = Date.now();
                } else if (incomingEpoch < this.epoch) {
                    // Tell the older node we are the true leader
                    this.channel.postMessage({ type: 'heartbeat', epoch: this.epoch, nodeId: this.nodeId });
                }
            } else if (event.data.type === 'sync_complete') {
                // Background sync done by another node
            } else if (event.data.type === 'queue_delta') {
                this.queueSize += event.data.delta;
                if (this.queueSize < 0) this.queueSize = 0;
            } else if (event.data.type === 'rate_limited') {
                // Instantly propagate 429 cooldown to all tabs via BroadcastChannel
                this.globalRateLimitedUntil = event.data.until;
                console.warn(`[RATE LIMIT] Cooldown received from peer. Pausing until ${new Date(event.data.until).toISOString()}`);
            }
        };

        // Watchdog: If true leader dies, increment epoch and take over
        setInterval(() => {
            if (!this.isLeader && (Date.now() - this.lastHeartbeat > 15000)) {
                console.warn("[WAL] Leader dead. Incrementing epoch and taking over.");
                this.epoch++;
                this.claimLeadership();
            } else if (this.isLeader) {
                this.channel.postMessage({ type: 'heartbeat', epoch: this.epoch, nodeId: this.nodeId });
            }
        }, 5000);
    }

    claimLeadership() {
        this.isLeader = true;
        this.lastHeartbeat = Date.now();
        this.channel.postMessage({ type: 'heartbeat', epoch: this.epoch, nodeId: this.nodeId });
    }

    generateIdempotencyKey(actionType, payloadText) {
        const intentId = Math.random().toString(36).substring(2, 10);
        return `req_${actionType}_${btoa(payloadText).substring(0,20)}_${intentId}`;
    }

    getQueue() {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve([]);
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    saveItem(item) {
        return new Promise((resolve, reject) => {
            if (!this.db) return reject(new Error("DB not initialized"));
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    deleteItem(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) return resolve();
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async acquireLock(lockName) {
        return new Promise((resolve) => {
            if (!this.db) return resolve(false);
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const req = store.get(`lock_${lockName}`);
            req.onsuccess = () => {
                const lock = req.result;
                if (lock && Date.now() - lock.timestamp < 10000) return resolve(false);
                store.put({ id: `lock_${lockName}`, timestamp: Date.now(), owner: this.nodeId }).onsuccess = () => resolve(true);
            };
            req.onerror = () => resolve(false);
        });
    }

    async checkLockOwnership(lockName) {
        return new Promise((resolve) => {
            if (!this.db) return resolve(false);
            const req = this.db.transaction([STORE_NAME], 'readonly').objectStore(STORE_NAME).get(`lock_${lockName}`);
            req.onsuccess = () => resolve(req.result?.owner === this.nodeId);
            req.onerror = () => resolve(false);
        });
    }

    // ─── Meta key helpers (non-queue storage for rate-limit state etc) ───
    _getMeta(key) {
        return new Promise((resolve) => {
            if (!this.db) return resolve(null);
            const req = this.db.transaction([STORE_NAME], 'readonly').objectStore(STORE_NAME).get(`meta_${key}`);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => resolve(null);
        });
    }

    _setMeta(key, value) {
        return new Promise((resolve) => {
            if (!this.db) return resolve();
            const req = this.db.transaction([STORE_NAME], 'readwrite').objectStore(STORE_NAME).put({ id: `meta_${key}`, ...value });
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
        });
    }

    async _applyGlobalRateLimit(retryAfterMs = 30000) {
        const until = Date.now() + retryAfterMs;
        this.globalRateLimitedUntil = until;
        // Persist so restarted tabs inherit the cooldown
        await this._setMeta('rate_limit', { until });
        // Instantly broadcast to all open tabs — they must also pause
        this.channel.postMessage({ type: 'rate_limited', until });
        console.warn(`[RATE LIMIT] 429 detected. All sync paused for ${retryAfterMs/1000}s.`);
    }

    async _tryAcquireToken() {
        // Shared cross-tab token bucket stored in IndexedDB
        return new Promise((resolve) => {
            if (!this.db) return resolve(false);
            const tx = this.db.transaction([STORE_NAME], 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get('meta_token_bucket');
            req.onsuccess = () => {
                const now = Date.now();
                const bucket = req.result || { id: 'meta_token_bucket', tokens: 10, lastRefill: now };
                
                // Refill: 1 token per 600ms (≈ 100 req/min across all tabs)
                const elapsed = now - bucket.lastRefill;
                const refill = Math.floor(elapsed / 600);
                bucket.tokens = Math.min(10, bucket.tokens + refill);
                bucket.lastRefill = refill > 0 ? now : bucket.lastRefill;

                if (bucket.tokens <= 0) {
                    store.put(bucket);
                    return resolve(false); // No tokens available
                }

                bucket.tokens--;
                store.put(bucket).onsuccess = () => resolve(true);
            };
            req.onerror = () => resolve(false); 
        });
    }

    async enqueue(item, priority = 'TRANSIENT') {
        try {
            const queue = await this.getQueue();
            const actualItems = queue.filter(i => !i.id.startsWith('lock_'));
            
            if (actualItems.length >= 100) {
                if (priority === 'CRITICAL') {
                    alert("Storage full! Please reconnect to sync your progress.");
                    return false;
                } else {
                    const transItems = actualItems.filter(i => i.priority === 'TRANSIENT');
                    if (transItems.length > 0) {
                        await this.deleteItem(transItems[0].id);
                    } else {
                        return false; 
                    }
                }
            }

            item.priority = priority;
            item.status = 'pending';
            item.retries = 0;
            item.id = crypto.randomUUID();
            item.idempotencyKey = item.id; // Native WAL idempotency key
            item.schemaVersion = 2;
            item.timestamp = Date.now();
            
            // Ensure idempotency key is passed in headers
            item.headers = item.headers || {};
            if (!item.headers['x-idempotency-key']) {
                item.headers['x-idempotency-key'] = item.idempotencyKey;
            }

            await this.saveItem(item);
            this.queueSize++; 
            this.channel.postMessage({ type: 'queue_delta', delta: 1 }); // Sync across tabs

            if (this.isLeader) this.attemptSync();
            return true;
        } catch (err) {
            console.error("WAL Write Failed", err);
            return false;
        }
    }

    async attemptSync() {
        if (this.syncing || !this.isLeader || !this.db) return;
        
        // Offline mode block
        if (!navigator.onLine) return;
        
        // True Execution Lock
        if (!(await this.acquireLock('sync'))) return;

        try {
            const queue = await this.getQueue();
            
            // ── Global 429 Cooldown Check ──
            // If any tab detected a rate limit, all tabs must respect it
            if (Date.now() < this.globalRateLimitedUntil) {
                const remaining = Math.ceil((this.globalRateLimitedUntil - Date.now()) / 1000);
                console.log(`[RATE LIMIT] Sync paused. ${remaining}s remaining.`);
                return;
            }

            // Rehydrate blocked items with damping
            for (let i of queue) {
                if (i.status === 'blocked' && !i.id.startsWith('lock_') && !i.id.startsWith('meta_')) {
                    if (Date.now() - (i.lastAttemptAt || 0) < 5000) continue; // Recovery damping
                    i.status = 'pending';
                    await this.saveItem(i);
                }
            }

            // Priority Handling: Sort CRITICAL first, then by timestamp
            const pending = queue.filter(i => ['pending', 'retrying'].includes(i.status) && !i.id.startsWith('lock_') && !i.id.startsWith('meta_')).sort((a,b) => {
                if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
                if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1;
                return a.timestamp - b.timestamp;
            });

            if (pending.length === 0) return;

            this.syncing = true;
            let syncedCount = 0;

            const MAX_CONCURRENT = 3;
            
            for (let i = 0; i < pending.length; i += MAX_CONCURRENT) {
                // Lock ownership validation before every batch
                if (!(await this.checkLockOwnership('sync'))) {
                    this.syncing = false;
                    return;
                }

                // ── Shared Token Bucket: Cross-tab rate coordination ──
                // All tabs, all users behind the same IP share this budget
                if (!(await this._tryAcquireToken())) {
                    console.warn('[RATE LIMIT] Token bucket empty. Pausing batch.');
                    await new Promise(r => setTimeout(r, 600 + Math.random() * 400)); // Wait + jitter
                    i -= MAX_CONCURRENT; // Retry this batch
                    continue;
                }

                const batch = pending.slice(i, i + MAX_CONCURRENT);
                await Promise.all(batch.map(async (item) => {
                    try {
                        const response = await fetch(item.url, {
                            method: item.method,
                            headers: item.headers,
                            body: item.body
                        });

                        if (response.headers.get('x-backend-health') === 'degraded') {
                            this.tripCircuitBreaker();
                        }

                        if (response.ok || response.status === 409) { 
                            await this.deleteItem(item.id);
                            syncedCount++;
                            this.queueSize--;
                            this.channel.postMessage({ type: 'queue_delta', delta: -1 });
                            this.lastSuccessfulSync = Date.now();
                        } else if (response.status === 429) {
                            // ── 429 = Full global stop ──
                            const retryAfter = parseInt(response.headers.get('retry-after') || '30') * 1000;
                            await this._applyGlobalRateLimit(retryAfter);
                            item.retries++;
                            item.status = 'retrying';
                            await this.saveItem(item);
                            // Abort the entire sync cycle immediately
                            throw new Error('RATE_LIMITED');
                        } else if (response.status >= 500) {
                            item.retries++;
                            item.status = 'retrying';
                            if (item.retries > 3) item.status = 'failed';
                            await this.saveItem(item);
                            this.fetchConfig();
                        } else if (response.status >= 400) {
                            item.status = 'failed';
                            await this.saveItem(item);
                        }
                    } catch (err) {
                        if (err.message === 'RATE_LIMITED') throw err; // Re-throw to break batch loop
                        item.status = 'blocked';
                        item.lastAttemptAt = Date.now();
                        await this.saveItem(item);
                    }
                }));
            }

            this.syncing = false;
            if (syncedCount > 0) this.channel.postMessage({ type: 'sync_complete' });
        } catch (e) {
            this.syncing = false;
        } finally {
            await this.deleteItem('lock_sync');
        }
    }

    tripCircuitBreaker() {
        const cooldown = this.globalConfig?.cooldown_period_ms || 300000;
        this.circuitCooldownEnd = Date.now() + cooldown;
        this.circuitTripped = true;
        console.warn(`[CIRCUIT BREAKER] Tripped. Fallback mode activated for ${cooldown/1000}s`);
    }

    isBackendDegraded() {
        if (this.circuitTripped && Date.now() < this.circuitCooldownEnd) {
            return true;
        }
        this.circuitTripped = false;
        return false;
    }
}

window.appStore = new ResilientStore();
