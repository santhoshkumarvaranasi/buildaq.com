// Server-side Google Analytics proxy
// This would require a backend service to hide the GA ID

class SecureAnalytics {
    constructor() {
        this.endpoint = '/api/analytics'; // Your backend endpoint
    }
    
    async trackPageView(page) {
        await this.sendEvent('page_view', { page });
    }
    
    async trackEvent(eventName, parameters) {
        await this.sendEvent(eventName, parameters);
    }
    
    async sendEvent(eventName, parameters) {
        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    parameters: parameters,
                    timestamp: Date.now(),
                    origin: window.location.origin
                })
            });
        } catch (error) {
            console.error('Analytics tracking failed:', error);
        }
    }
}

// Usage
const analytics = new SecureAnalytics();
analytics.trackPageView(window.location.pathname);