/**
 * N8N Keep-Alive Utility
 * Prevents n8n instance from sleeping on free hosting services like Render
 */

interface KeepAliveConfig {
  webhookUrl: string;
  interval: number; // in milliseconds
  enabled: boolean;
  maxRetries: number;
  timeout: number;
}

class N8NKeepAlive {
  private config: KeepAliveConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private failureCount = 0;
  private lastSuccessTime = Date.now();

  constructor(config: Partial<KeepAliveConfig> = {}) {
    this.config = {
      webhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '',
      interval: 8000, // 8 seconds (between 5-10 as requested)
      enabled: true,
      maxRetries: 3,
      timeout: 5000, // 5 second timeout
      ...config
    };
  }

  /**
   * Start the keep-alive pinging
   */
  start(): void {
    if (this.isRunning || !this.config.enabled || !this.config.webhookUrl) {
      console.log('N8N Keep-Alive: Already running or disabled/no URL');
      return;
    }

    console.log('🚀 N8N Keep-Alive: Starting with interval:', this.config.interval + 'ms');
    this.isRunning = true;
    this.failureCount = 0;

    // Initial ping
    this.ping();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.config.interval);
  }

  /**
   * Stop the keep-alive pinging
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ N8N Keep-Alive: Stopped');
  }

  /**
   * Ping the n8n instance with a lightweight request
   */
  private async ping(): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      // Send a lightweight ping request
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Keep-Alive': 'true'
        },
        body: JSON.stringify({
          ping: true,
          timestamp: Date.now(),
          source: 'nuvante-keepalive'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 400) {
        // 400 is expected for ping requests (invalid order data)
        this.onPingSuccess();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error: any) {
      this.onPingFailure(error);
    }
  }

  /**
   * Handle successful ping
   */
  private onPingSuccess(): void {
    if (this.failureCount > 0) {
      console.log('✅ N8N Keep-Alive: Connection restored');
    }
    this.failureCount = 0;
    this.lastSuccessTime = Date.now();
  }

  /**
   * Handle ping failure
   */
  private onPingFailure(error: Error): void {
    this.failureCount++;
    
    if (this.failureCount <= this.config.maxRetries) {
      console.warn(`⚠️ N8N Keep-Alive: Ping failed (${this.failureCount}/${this.config.maxRetries}):`, error.message);
    } else {
      console.error('❌ N8N Keep-Alive: Max retries exceeded. Stopping keep-alive.');
      this.stop();
    }
  }

  /**
   * Get current status
   */
  getStatus(): {
    isRunning: boolean;
    failureCount: number;
    lastSuccessTime: number;
    timeSinceLastSuccess: number;
  } {
    return {
      isRunning: this.isRunning,
      failureCount: this.failureCount,
      lastSuccessTime: this.lastSuccessTime,
      timeSinceLastSuccess: Date.now() - this.lastSuccessTime
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<KeepAliveConfig>): void {
    const wasRunning = this.isRunning;
    
    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...newConfig };

    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }
}

// Create singleton instance
const n8nKeepAlive = new N8NKeepAlive();

// Auto-start in browser environment (not during SSR)
if (typeof window !== 'undefined') {
  // Start after a short delay to avoid interfering with page load
  setTimeout(() => {
    n8nKeepAlive.start();
  }, 2000);

  // Stop when page is about to unload
  window.addEventListener('beforeunload', () => {
    n8nKeepAlive.stop();
  });

  // Handle visibility changes (pause when tab is hidden)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      n8nKeepAlive.stop();
    } else {
      // Resume after tab becomes visible again
      setTimeout(() => {
        n8nKeepAlive.start();
      }, 1000);
    }
  });
}

export default n8nKeepAlive;
export { N8NKeepAlive };
export type { KeepAliveConfig }; 