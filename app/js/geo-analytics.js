/**
 * GEO Analytics Script for Sanicle FemTech Mobile
 * Tracks AI crawler visits and GEO performance metrics
 */

(function() {
    'use strict';

    // AI Crawler Detection
    const AI_CRAWLERS = [
        'GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 
        'Claude-Web', 'PerplexityBot', 'YouBot', 'BingBot',
        'Googlebot', 'Bard', 'Gemini', 'ClaudeBot'
    ];

    // GEO Analytics Configuration
    const GEO_CONFIG = {
        apiEndpoint: '/api/geo-analytics', // Update with your analytics endpoint
        enableTracking: true,
        debugMode: false
    };

    /**
     * Detect if the current visitor is an AI crawler
     */
    function detectAICrawler() {
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;
        
        const isAICrawler = AI_CRAWLERS.some(crawler => 
            userAgent.includes(crawler) || referrer.includes(crawler.toLowerCase())
        );

        return {
            isAICrawler,
            userAgent,
            referrer,
            detectedCrawler: AI_CRAWLERS.find(crawler => 
                userAgent.includes(crawler) || referrer.includes(crawler.toLowerCase())
            )
        };
    }

    /**
     * Track AI crawler visit
     */
    function trackAICrawlerVisit(crawlerInfo) {
        if (!GEO_CONFIG.enableTracking) return;

        const analyticsData = {
            type: 'ai_crawler_visit',
            timestamp: Date.now(),
            page: window.location.pathname,
            url: window.location.href,
            userAgent: crawlerInfo.userAgent,
            referrer: crawlerInfo.referrer,
            detectedCrawler: crawlerInfo.detectedCrawler,
            sessionId: getSessionId(),
            pageTitle: document.title,
            pageDescription: getMetaDescription()
        };

        // Send to analytics endpoint
        sendAnalytics(analyticsData);

        // Log for debugging
        if (GEO_CONFIG.debugMode) {
            console.log('GEO Analytics - AI Crawler Detected:', analyticsData);
        }
    }

    /**
     * Track page engagement metrics
     */
    function trackPageEngagement() {
        if (!GEO_CONFIG.enableTracking) return;

        let engagementData = {
            type: 'page_engagement',
            timestamp: Date.now(),
            page: window.location.pathname,
            sessionId: getSessionId(),
            timeOnPage: 0,
            scrollDepth: 0,
            interactions: 0
        };

        // Track time on page
        const startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            engagementData.timeOnPage = Date.now() - startTime;
            sendAnalytics(engagementData);
        });

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollDepth = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
            engagementData.scrollDepth = maxScrollDepth;
        });

        // Track interactions
        let interactionCount = 0;
        ['click', 'touchstart', 'keydown'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                interactionCount++;
                engagementData.interactions = interactionCount;
            }, { once: false });
        });
    }

    /**
     * Track GEO-specific events
     */
    function trackGEOEvents() {
        // Track if AI instructions are being read
        const llmsScripts = document.querySelectorAll('script[type="text/llms.txt"]');
        if (llmsScripts.length > 0) {
            sendAnalytics({
                type: 'geo_instructions_present',
                timestamp: Date.now(),
                page: window.location.pathname,
                instructionCount: llmsScripts.length,
                sessionId: getSessionId()
            });
        }

        // Track structured data presence
        const structuredData = document.querySelectorAll('script[type="application/ld+json"]');
        if (structuredData.length > 0) {
            sendAnalytics({
                type: 'structured_data_present',
                timestamp: Date.now(),
                page: window.location.pathname,
                dataCount: structuredData.length,
                sessionId: getSessionId()
            });
        }
    }

    /**
     * Send analytics data
     */
    function sendAnalytics(data) {
        if (!GEO_CONFIG.apiEndpoint) {
            // Log to console if no endpoint configured
            if (GEO_CONFIG.debugMode) {
                console.log('GEO Analytics Data:', data);
            }
            return;
        }

        // Use fetch API with error handling
        fetch(GEO_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }).catch(error => {
            if (GEO_CONFIG.debugMode) {
                console.error('GEO Analytics Error:', error);
            }
        });
    }

    /**
     * Generate or retrieve session ID
     */
    function getSessionId() {
        let sessionId = sessionStorage.getItem('geo_session_id');
        if (!sessionId) {
            sessionId = 'geo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('geo_session_id', sessionId);
        }
        return sessionId;
    }

    /**
     * Get meta description
     */
    function getMetaDescription() {
        const metaDesc = document.querySelector('meta[name="description"]');
        return metaDesc ? metaDesc.content : '';
    }

    /**
     * Initialize GEO Analytics
     */
    function initGEOAnalytics() {
        // Detect AI crawler
        const crawlerInfo = detectAICrawler();
        if (crawlerInfo.isAICrawler) {
            trackAICrawlerVisit(crawlerInfo);
        }

        // Track page engagement
        trackPageEngagement();

        // Track GEO-specific events
        trackGEOEvents();

        // Track page load completion
        window.addEventListener('load', () => {
            sendAnalytics({
                type: 'page_load_complete',
                timestamp: Date.now(),
                page: window.location.pathname,
                loadTime: performance.now(),
                sessionId: getSessionId(),
                isAICrawler: crawlerInfo.isAICrawler
            });
        });
    }

    /**
     * GEO Performance Metrics
     */
    const GEOMetrics = {
        // Track AI recommendation success
        trackRecommendationSuccess: function(source, query, position) {
            sendAnalytics({
                type: 'ai_recommendation_success',
                timestamp: Date.now(),
                source: source,
                query: query,
                position: position,
                sessionId: getSessionId()
            });
        },

        // Track conversion from AI traffic
        trackConversion: function(source, action, value) {
            sendAnalytics({
                type: 'geo_conversion',
                timestamp: Date.now(),
                source: source,
                action: action,
                value: value,
                sessionId: getSessionId()
            });
        },

        // Track AI query coverage
        trackQueryCoverage: function(query, covered, page) {
            sendAnalytics({
                type: 'query_coverage',
                timestamp: Date.now(),
                query: query,
                covered: covered,
                page: page,
                sessionId: getSessionId()
            });
        }
    };

    // Make GEOMetrics available globally
    window.GEOMetrics = GEOMetrics;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGEOAnalytics);
    } else {
        initGEOAnalytics();
    }

})();

/**
 * GEO Analytics Dashboard Helper Functions
 * These functions help analyze GEO performance
 */

window.GEOAnalytics = {
    // Get current GEO metrics
    getMetrics: function() {
        return {
            sessionId: sessionStorage.getItem('geo_session_id'),
            page: window.location.pathname,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
    },

    // Check if current visitor is AI crawler
    isAICrawler: function() {
        const AI_CRAWLERS = [
            'GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 
            'Claude-Web', 'PerplexityBot', 'YouBot'
        ];
        const userAgent = navigator.userAgent;
        return AI_CRAWLERS.some(crawler => userAgent.includes(crawler));
    },

    // Get page GEO readiness score
    getGEOScore: function() {
        let score = 0;
        
        // Check for llms.txt instructions
        if (document.querySelector('script[type="text/llms.txt"]')) score += 30;
        
        // Check for structured data
        if (document.querySelector('script[type="application/ld+json"]')) score += 25;
        
        // Check for meta description
        if (document.querySelector('meta[name="description"]')) score += 20;
        
        // Check for keywords
        if (document.querySelector('meta[name="keywords"]')) score += 15;
        
        // Check for proper title
        if (document.title && document.title.length > 10) score += 10;
        
        return Math.min(score, 100);
    }
};
