type StreamController = ReadableStreamDefaultController<Uint8Array>;

interface Subscriber {
  id: string;
  controller: StreamController;
  createdAt: number;
}

class RealtimeHub {
  private channels: Map<string, Set<Subscriber>> = new Map();
  private encoder = new TextEncoder();

  /**
   * Register a new SSE subscriber for a specific board slug
   */
  public subscribe(slug: string, controller: StreamController): string {
    const normalizedSlug = slug.toLowerCase();
    if (!this.channels.has(normalizedSlug)) {
      this.channels.set(normalizedSlug, new Set());
    }

    const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const subscriber: Subscriber = {
      id: subscriberId,
      controller,
      createdAt: Date.now(),
    };

    this.channels.get(normalizedSlug)!.add(subscriber);

    // Send initial handshake
    this.sendEventToController(controller, "CONNECTED", {
      status: "connected",
      slug: normalizedSlug,
      timestamp: new Date().toISOString(),
    });

    return subscriberId;
  }

  /**
   * Unsubscribe a client
   */
  public unsubscribe(slug: string, subscriberId: string): void {
    const normalizedSlug = slug.toLowerCase();
    const channel = this.channels.get(normalizedSlug);
    if (!channel) return;

    for (const sub of channel) {
      if (sub.id === subscriberId) {
        channel.delete(sub);
        break;
      }
    }

    if (channel.size === 0) {
      this.channels.delete(normalizedSlug);
    }
  }

  /**
   * Broadcast an event and payload to all active clients watching a board
   */
  public broadcast(slug: string, event: string, data: unknown): void {
    const normalizedSlug = slug.toLowerCase();
    const channel = this.channels.get(normalizedSlug);
    if (!channel || channel.size === 0) return;

    const deadSubscribers: string[] = [];

    channel.forEach((sub) => {
      try {
        this.sendEventToController(sub.controller, event, data);
      } catch (err) {
        // Stream closed or error
        deadSubscribers.push(sub.id);
      }
    });

    // Cleanup dead connections
    deadSubscribers.forEach((id) => this.unsubscribe(normalizedSlug, id));
  }

  /**
   * Send SSE-formatted payload
   */
  private sendEventToController(
    controller: StreamController,
    event: string,
    data: unknown
  ): void {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    controller.enqueue(this.encoder.encode(message));
  }

  /**
   * Get active subscriber count for monitoring
   */
  public getSubscriberCount(slug?: string): number {
    if (slug) {
      return this.channels.get(slug.toLowerCase())?.size ?? 0;
    }
    let total = 0;
    this.channels.forEach((set) => {
      total += set.size;
    });
    return total;
  }
}

// Global singleton instance across Next.js module reloads
const globalForHub = global as unknown as { rankhubRealtimeInstance?: RealtimeHub };
export const realtimeHub = globalForHub.rankhubRealtimeInstance || new RealtimeHub();
if (process.env.NODE_ENV !== "production") {
  globalForHub.rankhubRealtimeInstance = realtimeHub;
}
