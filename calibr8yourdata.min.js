/**
 * calibr8yourdata SDK v1.0.0
 * Enterprise-grade behavioral signal collection SDK
 * 
 * Usage:
 *   calibr8yourdata.init({ projectKey: "...", apiUrl: "..." });
 *   calibr8yourdata.collect();
 *   calibr8yourdata.send();
 * 
 * @license Proprietary - calibr8yourdata
 * @copyright 2024 calibr8yourdata
 */
(function(global, factory) {
  'use strict';
  
  // UMD wrapper for compatibility
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(global);
  } else {
    factory(global);
  }
  
})(typeof window !== 'undefined' ? window : this, function(global) {
  'use strict';
  
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // GUARD: Prevent duplicate initialization
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  
  if (global.calibr8yourdata && global.calibr8yourdata._initialized) {
    return global.calibr8yourdata;
  }
  
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PRIVATE: Internal state (not exposed globally)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  
  var _instance = null;
  var _config = null;
  var _initialized = false;
  var _version = '1.0.0';
  
  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Embedded ingress endpoint (obfuscated, not configurable)
  // This URL is baked into the SDK at build time for security.
  // ─────────────────────────────────────────────────────────────────────────────
  var _sdkIngressPath = (function() {
    // Obfuscated path construction to prevent casual reverse-engineering
    var p = [115, 100, 107, 47, 115, 117, 98, 109, 105, 116]; // 'sdk/submit'
    var s = '';
    for (var i = 0; i < p.length; i++) { s += String.fromCharCode(p[i]); }
    return s;
  })();
  
  // Base URL - configured at init or uses default
  var _baseApiUrl = null;
  
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PRIVATE: FraudDetectionV12 Class (fully encapsulated)
  // 100% PRESERVED - No logic changes
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  
  var FraudDetectionV12 = (function() {
    
    function FraudDetectionV12(options) {
      if (options === void 0) { options = {}; }
      
      this.options = {
        detectionInterval: 30000,
        minDataPoints: 10,
        enableClipboard: true,
        enableVisibility: true,
        enableKeyboard: true,
        enableMouse: true,
        enableAntiDetect: true,
        enableDevTools: true,
        enableNetwork: true,
        enableStorage: true,
        enableSynthetic: true,
        enableWindowSync: true,
        enableHoneypot: true,
        honeypotFieldName: 'website_url',
        honeypotContainerId: null
      };
      
      // Merge options
      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          this.options[key] = options[key];
        }
      }
      
      this.sessionId = this.generateUUID();
      this.startTime = Date.now();
      this.detectionCycles = 0;
      
      // Data collectors with enhanced fields
      this.keyboardData = {
        keydowns: [], keyups: [], intervals: [], holdTimes: [],
        totalKeystrokes: 0, diGraphs: new Map(),
        lastKey: null, lastKeyTime: null,
        bursts: [], currentBurstStart: null, currentBurstCount: 0
      };
      
      this.mouseData = {
        movements: [], clicks: [], scrolls: [],
        totalMovements: 0, totalClicks: 0,
        lastPosition: null, lastMoveTime: null,
        velocities: [], accelerations: [],
        clickTimes: [], contextMenuCount: 0,
        scrollDeltas: [], scrollTimes: []
      };
      
      this.clipboardData = {
        pastes: [], copies: [], totalPastes: 0, totalCopies: 0,
        pasteIntervals: [], lastPasteTime: null
      };
      
      this.visibilityData = {
        changes: [], hiddenTime: 0, visibleTime: 0,
        lastChangeTime: Date.now(), isHidden: document.hidden,
        focusChanges: [], hasFocus: document.hasFocus(),
        focusLostTime: 0, idlePeriods: [], lastActivityTime: Date.now()
      };
      
      this.syntheticEvents = {
        detected: [], count: 0,
        byType: { keyboard: 0, mouse: 0, click: 0, other: 0 }
      };
      
      this.windowSyncData = {
        otherTabsDetected: false, tabCount: 1, messages: [],
        lastHeartbeat: Date.now(), tabId: this.sessionId.substring(0, 8)
      };
      
      this.touchData = {
        touches: [],
        totalTouches: 0,
        multiTouchCount: 0,
        swipes: [],
        pinches: [],
        lastTouchTime: null,
        lastTouchPosition: null
      };
      
      this.formData = {
        focusEvents: [],
        blurEvents: [],
        fieldTimings: new Map(),
        tabPresses: 0,
        totalFieldTime: 0
      };
      
      this.honeypotData = {
        triggered: false,
        triggerCount: 0,
        triggerEvents: [],
        fieldValue: '',
        firstTriggerTime: null,
        lastTriggerTime: null,
        focusCount: 0,
        inputCount: 0,
        honeypotElement: null,
        isInjected: false
      };
      
      this.detectionResults = {};
      this.boundHandlers = {};
      this.isRunning = false;
      this.intervalId = null;
      this.fingerprint = null;
      this.broadcastChannel = null;
    }
    
    // Lifecycle
    FraudDetectionV12.prototype.start = function() {
      if (this.isRunning) return;
      this.isRunning = true;
      
      this.fingerprint = this.collectFingerprint();
      this.initKeyboardTracking();
      this.initMouseTracking();
      this.initTouchTracking();
      this.initClipboardTracking();
      this.initVisibilityTracking();
      this.initWindowSync();
      this.initFormTracking();
      this.initHoneypotTracking();
      
      var self = this;
      this.intervalId = setInterval(function() { self.runDetectionCycle(); }, this.options.detectionInterval);
      this.runDetectionCycle();
    };
    
    FraudDetectionV12.prototype.stop = function() {
      if (!this.isRunning) return;
      this.isRunning = false;
      if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
      if (this.broadcastChannel) { this.broadcastChannel.close(); this.broadcastChannel = null; }
      this.removeEventListeners();
    };
    
    FraudDetectionV12.prototype.runDetectionCycle = function() {
      this.detectionCycles++;
      var cycleStart = performance.now();
      this.updateIdleTime();
      
      this.detectionResults = {
        clipboard: this.analyzeClipboard(),
        visibility: this.analyzeVisibility(),
        keyboard: this.analyzeKeyboard(),
        mouse: this.analyzeMouse(),
        touch: this.analyzeTouch(),
        antiDetect: this.detectAntiDetectBrowser(),
        devTools: this.detectDevTools(),
        network: this.analyzeNetwork(),
        storage: this.analyzeStorage(),
        syntheticEvents: this.analyzeSyntheticEvents(),
        windowSync: this.analyzeWindowSync(),
        formInteraction: this.analyzeFormInteraction(),
        honeypot: this.analyzeHoneypot()
      };
      
      this.detectionResults.performance = {
        cycleNumber: this.detectionCycles,
        cycleTimeMs: Math.round((performance.now() - cycleStart) * 100) / 100,
        totalRuntime: Date.now() - this.startTime,
        lastDetectionTimeMs: performance.now() - cycleStart
      };
      this.sendHeartbeat();
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // KEYBOARD TRACKING
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initKeyboardTracking = function() {
      if (!this.options.enableKeyboard) return;
      var self = this;
      var lastKeydownTime = null;
      var keydownTimes = new Map();
      var BURST_THRESHOLD = 500;
      
      this.boundHandlers.keydown = function(e) {
        var now = performance.now();
        self.visibilityData.lastActivityTime = Date.now();
        
        if (!e.isTrusted) {
          self.syntheticEvents.detected.push({ type: 'keyboard', time: now });
          self.syntheticEvents.count++;
          self.syntheticEvents.byType.keyboard++;
        }
        
        if (!keydownTimes.has(e.code)) keydownTimes.set(e.code, now);
        
        if (lastKeydownTime !== null) {
          var interval = now - lastKeydownTime;
          if (interval > 0 && interval < 5000) {
            self.keyboardData.intervals.push(interval);
            
            if (interval < BURST_THRESHOLD) {
              if (!self.keyboardData.currentBurstStart) {
                self.keyboardData.currentBurstStart = lastKeydownTime;
                self.keyboardData.currentBurstCount = 2;
              } else {
                self.keyboardData.currentBurstCount++;
              }
            } else {
              if (self.keyboardData.currentBurstCount >= 3) {
                self.keyboardData.bursts.push({
                  count: self.keyboardData.currentBurstCount,
                  duration: lastKeydownTime - self.keyboardData.currentBurstStart
                });
              }
              self.keyboardData.currentBurstStart = null;
              self.keyboardData.currentBurstCount = 0;
            }
          }
        }
        
        if (self.keyboardData.lastKey && self.keyboardData.lastKeyTime) {
          var diGraphKey = self.keyboardData.lastKey + '-' + e.code;
          var diGraphTime = now - self.keyboardData.lastKeyTime;
          if (diGraphTime < 2000) {
            if (!self.keyboardData.diGraphs.has(diGraphKey)) {
              self.keyboardData.diGraphs.set(diGraphKey, []);
            }
            var diGraphArray = self.keyboardData.diGraphs.get(diGraphKey);
            diGraphArray.push(diGraphTime);
            if (diGraphArray.length > 50) {
              self.keyboardData.diGraphs.set(diGraphKey, diGraphArray.slice(-50));
            }
          }
          if (self.keyboardData.diGraphs.size > 200) {
            var keys = Array.from(self.keyboardData.diGraphs.keys());
            for (var i = 0; i < 50; i++) {
              self.keyboardData.diGraphs.delete(keys[i]);
            }
          }
        }
        
        lastKeydownTime = now;
        self.keyboardData.lastKey = e.code;
        self.keyboardData.lastKeyTime = now;
        self.keyboardData.keydowns.push({ time: now, code: e.code, isTrusted: e.isTrusted });
        self.keyboardData.totalKeystrokes++;
        
        if (self.keyboardData.intervals.length > 500) {
          self.keyboardData.intervals = self.keyboardData.intervals.slice(-500);
        }
      };
      
      this.boundHandlers.keyup = function(e) {
        var now = performance.now();
        var downTime = keydownTimes.get(e.code);
        if (downTime) {
          var holdTime = now - downTime;
          if (holdTime > 0 && holdTime < 2000) self.keyboardData.holdTimes.push(holdTime);
          keydownTimes.delete(e.code);
        }
        if (self.keyboardData.holdTimes.length > 500) {
          self.keyboardData.holdTimes = self.keyboardData.holdTimes.slice(-500);
        }
      };
      
      document.addEventListener('keydown', this.boundHandlers.keydown, { passive: true });
      document.addEventListener('keyup', this.boundHandlers.keyup, { passive: true });
    };
    
    FraudDetectionV12.prototype.analyzeKeyboard = function() {
      var data = this.keyboardData;
      var result = {
        enabled: this.options.enableKeyboard,
        totalKeystrokes: data.totalKeystrokes,
        hasInsufficientData: data.intervals.length < this.options.minDataPoints,
        botScore: 0,
        isSuspicious: false,
        analysis: {}
      };
      
      if (result.hasInsufficientData) return result;
      
      var intervals = data.intervals.slice(-100);
      var holdTimes = data.holdTimes.slice(-100);
      
      var avgInterval = this.mean(intervals);
      var stdInterval = this.standardDeviation(intervals);
      var cvInterval = avgInterval > 0 ? stdInterval / avgInterval : 0;
      var avgHold = this.mean(holdTimes);
      var intervalEntropy = this.calculateEntropy(intervals, 20);
      var holdEntropy = this.calculateEntropy(holdTimes, 20);
      var uniformRatio = this.calculateUniformRatio(intervals);
      var autocorr = this.calculateAutocorrelation(intervals);
      var hurstExponent = this.calculateHurstExponent(intervals);
      var benfordResult = this.analyzeBenfordsLaw(intervals);
      var diGraphConsistency = this.analyzeDiGraphConsistency();
      var burstAnalysis = this.analyzeTypingBursts();
      
      result.analysis = {
        avgIntervalMs: Math.round(avgInterval * 100) / 100,
        avgHoldTimeMs: Math.round(avgHold * 100) / 100,
        intervalCV: Math.round(cvInterval * 1000) / 1000,
        intervalEntropy: Math.round(intervalEntropy * 1000) / 1000,
        holdTimeEntropy: Math.round(holdEntropy * 1000) / 1000,
        uniformRatio: Math.round(uniformRatio * 1000) / 1000,
        autocorrelation: Math.round(autocorr * 1000) / 1000,
        hurstExponent: Math.round(hurstExponent * 1000) / 1000,
        benfordDeviation: Math.round(benfordResult.deviation * 1000) / 1000,
        benfordSuspicious: benfordResult.suspicious,
        diGraphConsistency: Math.round(diGraphConsistency * 1000) / 1000,
        typingBurstCount: burstAnalysis.count,
        rhythmPattern: this.detectTypingRhythm(cvInterval, intervalEntropy, hurstExponent)
      };
      
      return result;
    };
    
    FraudDetectionV12.prototype.analyzeBenfordsLaw = function(intervals) {
      if (intervals.length < 30) return { deviation: 0, suspicious: false };
      var benfordExpected = [0, 0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];
      var firstDigits = intervals.map(function(i) { return Math.floor(i); }).filter(function(i) { return i > 0; }).map(function(i) { return parseInt(String(i)[0]); });
      if (firstDigits.length < 20) return { deviation: 0, suspicious: false };
      
      var counts = new Array(10).fill(0);
      firstDigits.forEach(function(d) { counts[d]++; });
      var total = firstDigits.length;
      
      var chiSquare = 0;
      for (var i = 1; i <= 9; i++) {
        var expected = benfordExpected[i] * total;
        var diff = counts[i] - expected;
        chiSquare += (diff * diff) / Math.max(expected, 1);
      }
      return { deviation: chiSquare / 8, suspicious: chiSquare / 8 > 15.51 };
    };
    
    FraudDetectionV12.prototype.analyzeDiGraphConsistency = function() {
      if (this.keyboardData.diGraphs.size < 3) return 1;
      var self = this;
      var consistentCount = 0, totalChecked = 0;
      this.keyboardData.diGraphs.forEach(function(times) {
        if (times.length >= 3) {
          var cv = self.standardDeviation(times) / self.mean(times);
          if (cv >= 0.15 && cv <= 0.8) consistentCount++;
          totalChecked++;
        }
      });
      return totalChecked > 0 ? consistentCount / totalChecked : 1;
    };
    
    FraudDetectionV12.prototype.analyzeTypingBursts = function() {
      var bursts = this.keyboardData.bursts;
      if (bursts.length === 0) return { count: 0, avgLength: 0 };
      return { count: bursts.length, avgLength: this.mean(bursts.map(function(b) { return b.count; })) };
    };
    
    FraudDetectionV12.prototype.detectTypingRhythm = function(cv, entropy, hurst) {
      if (cv < 0.15 && entropy < 2.5 && hurst < 0.55) return 'ROBOTIC';
      if (cv > 0.8 || entropy > 4.0) return 'ERRATIC';
      if (hurst >= 0.6 && hurst <= 0.8 && cv >= 0.2 && cv <= 0.6) return 'HUMAN';
      return 'UNCERTAIN';
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // MOUSE TRACKING
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initMouseTracking = function() {
      if (!this.options.enableMouse) return;
      var self = this;
      var sampleCounter = 0, lastVelocity = null;
      
      this.boundHandlers.mousemove = function(e) {
        if (++sampleCounter % 3 !== 0) return;
        var now = performance.now();
        self.visibilityData.lastActivityTime = Date.now();
        
        if (!e.isTrusted) {
          self.syntheticEvents.count++;
          self.syntheticEvents.byType.mouse++;
        }
        
        var movement = { x: e.clientX, y: e.clientY, time: now, isTrusted: e.isTrusted };
        
        if (self.mouseData.lastPosition && self.mouseData.lastMoveTime) {
          var dx = e.clientX - self.mouseData.lastPosition.x;
          var dy = e.clientY - self.mouseData.lastPosition.y;
          var dt = now - self.mouseData.lastMoveTime;
          
          if (dt > 0) {
            var distance = Math.sqrt(dx * dx + dy * dy);
            var velocity = distance / dt;
            movement.velocity = velocity;
            movement.angle = Math.atan2(dy, dx);
            movement.distance = distance;
            self.mouseData.velocities.push(velocity);
            
            if (lastVelocity !== null) {
              self.mouseData.accelerations.push(Math.abs((velocity - lastVelocity) / dt));
            }
            lastVelocity = velocity;
          }
        }
        
        self.mouseData.movements.push(movement);
        self.mouseData.totalMovements++;
        self.mouseData.lastPosition = { x: e.clientX, y: e.clientY };
        self.mouseData.lastMoveTime = now;
        
        if (self.mouseData.movements.length > 500) self.mouseData.movements = self.mouseData.movements.slice(-500);
        if (self.mouseData.velocities.length > 300) self.mouseData.velocities = self.mouseData.velocities.slice(-300);
        if (self.mouseData.accelerations.length > 300) self.mouseData.accelerations = self.mouseData.accelerations.slice(-300);
      };
      
      this.boundHandlers.click = function(e) {
        var now = performance.now();
        self.visibilityData.lastActivityTime = Date.now();
        if (!e.isTrusted) { self.syntheticEvents.count++; self.syntheticEvents.byType.click++; }
        self.mouseData.clickTimes.push(now);
        self.mouseData.clicks.push({ x: e.clientX, y: e.clientY, time: now, button: e.button });
        self.mouseData.totalClicks++;
      };
      
      this.boundHandlers.scroll = function(e) {
        self.visibilityData.lastActivityTime = Date.now();
        self.mouseData.scrolls.push({ time: performance.now(), deltaY: e.deltaY });
        self.mouseData.scrollDeltas.push(Math.abs(e.deltaY));
        if (self.mouseData.scrollDeltas.length > 100) self.mouseData.scrollDeltas = self.mouseData.scrollDeltas.slice(-100);
      };
      
      this.boundHandlers.contextmenu = function() { self.mouseData.contextMenuCount++; };
      
      document.addEventListener('mousemove', this.boundHandlers.mousemove, { passive: true });
      document.addEventListener('click', this.boundHandlers.click, { passive: true });
      document.addEventListener('scroll', this.boundHandlers.scroll, { passive: true });
      document.addEventListener('contextmenu', this.boundHandlers.contextmenu, { passive: true });
    };
    
    FraudDetectionV12.prototype.analyzeMouse = function() {
      var data = this.mouseData;
      var result = {
        enabled: this.options.enableMouse,
        totalMovements: data.totalMovements,
        totalClicks: data.totalClicks,
        hasInsufficientData: data.movements.length < this.options.minDataPoints,
        botScore: 0,
        isSuspicious: false,
        analysis: {}
      };
      
      if (result.hasInsufficientData) return result;
      
      var velocities = data.velocities.slice(-150);
      var accelerations = data.accelerations.slice(-150);
      var movements = data.movements.slice(-200);
      
      if (velocities.length < 10) return result;
      
      var avgVelocity = this.mean(velocities);
      var cvVelocity = avgVelocity > 0 ? this.standardDeviation(velocities) / avgVelocity : 0;
      var velocityEntropy = this.calculateEntropy(velocities, 15);
      var hurstExponent = this.calculateHurstExponent(velocities);
      var velocityJitter = this.calculateJitter(velocities);
      var straightLineRatio = this.detectStraightLines(movements);
      var curvatures = this.calculateCurvatures(movements);
      var avgCurvature = curvatures.length > 0 ? this.mean(curvatures) : 0;
      var curvatureEntropy = curvatures.length > 10 ? this.calculateEntropy(curvatures, 15) : 0;
      var accelerationEntropy = accelerations.length > 10 ? this.calculateEntropy(accelerations, 15) : 0;
      var scrollEntropy = data.scrollDeltas.length > 5 ? this.calculateEntropy(data.scrollDeltas, 10) : 0;
      
      var clickIntervals = [];
      for (var i = 1; i < data.clickTimes.length; i++) {
        var interval = data.clickTimes[i] - data.clickTimes[i - 1];
        if (interval < 10000) clickIntervals.push(interval);
      }
      var clickEntropy = clickIntervals.length > 5 ? this.calculateEntropy(clickIntervals, 10) : 0;
      
      result.analysis = {
        avgVelocity: Math.round(avgVelocity * 1000) / 1000,
        velocityCV: Math.round(cvVelocity * 1000) / 1000,
        velocityEntropy: Math.round(velocityEntropy * 1000) / 1000,
        straightLineRatio: Math.round(straightLineRatio * 1000) / 1000,
        avgCurvature: Math.round(avgCurvature * 1000) / 1000,
        curvatureEntropy: Math.round(curvatureEntropy * 1000) / 1000,
        hurstExponent: Math.round(hurstExponent * 1000) / 1000,
        velocityJitter: Math.round(velocityJitter * 10000) / 10000,
        accelerationEntropy: Math.round(accelerationEntropy * 1000) / 1000,
        clickEntropy: Math.round(clickEntropy * 1000) / 1000,
        scrollEntropy: Math.round(scrollEntropy * 1000) / 1000,
        scrollEventCount: data.scrolls.length,
        contextMenuCount: data.contextMenuCount,
        movementPattern: this.detectMovementPattern(cvVelocity, straightLineRatio, velocityEntropy, hurstExponent)
      };
      
      return result;
    };
    
    FraudDetectionV12.prototype.calculateJitter = function(velocities) {
      if (velocities.length < 3) return 0;
      var diffs = [];
      for (var i = 2; i < velocities.length; i++) {
        diffs.push(Math.abs(velocities[i] - 2 * velocities[i-1] + velocities[i-2]));
      }
      return this.mean(diffs);
    };
    
    FraudDetectionV12.prototype.detectStraightLines = function(movements) {
      if (movements.length < 5) return 0;
      var straightCount = 0;
      for (var i = 0; i < movements.length - 5; i++) {
        if (this.isNearlyLinear(movements.slice(i, i + 5))) straightCount++;
      }
      return straightCount / (movements.length - 5);
    };
    
    FraudDetectionV12.prototype.isNearlyLinear = function(points) {
      if (points.length < 3) return true;
      var first = points[0], last = points[points.length - 1];
      var dx = last.x - first.x, dy = last.y - first.y;
      var length = Math.sqrt(dx * dx + dy * dy);
      if (length < 5) return true;
      
      var maxDev = 0;
      for (var i = 1; i < points.length - 1; i++) {
        var t = i / (points.length - 1);
        var expectedX = first.x + dx * t, expectedY = first.y + dy * t;
        var dev = Math.sqrt(Math.pow(points[i].x - expectedX, 2) + Math.pow(points[i].y - expectedY, 2));
        maxDev = Math.max(maxDev, dev);
      }
      return maxDev < 3;
    };
    
    FraudDetectionV12.prototype.calculateCurvatures = function(movements) {
      var curvatures = [];
      for (var i = 2; i < movements.length; i++) {
        var p1 = movements[i-2], p2 = movements[i-1], p3 = movements[i];
        var ax = p2.x - p1.x, ay = p2.y - p1.y, bx = p3.x - p2.x, by = p3.y - p2.y;
        var cross = ax * by - ay * bx, dot = ax * bx + ay * by;
        var curv = Math.abs(Math.atan2(cross, dot));
        if (!isNaN(curv) && isFinite(curv)) curvatures.push(curv);
      }
      return curvatures;
    };
    
    FraudDetectionV12.prototype.detectMovementPattern = function(cv, straightRatio, entropy, hurst) {
      if (cv < 0.25 && straightRatio > 0.3 && entropy < 2.5) return 'ROBOTIC';
      if (cv > 0.8 || entropy > 4.0) return 'ERRATIC';
      if (hurst >= 0.6 && hurst <= 0.85 && cv >= 0.25) return 'NATURAL';
      return 'UNCERTAIN';
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // TOUCH TRACKING
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initTouchTracking = function() {
      var self = this;
      
      this.boundHandlers.touchstart = function(e) {
        var now = performance.now();
        self.visibilityData.lastActivityTime = Date.now();
        
        if (!e.isTrusted) {
          self.syntheticEvents.count++;
          self.syntheticEvents.byType.other++;
        }
        
        var touch = e.touches[0];
        if (touch) {
          self.touchData.touches.push({
            time: now,
            x: touch.clientX,
            y: touch.clientY,
            touchCount: e.touches.length,
            isTrusted: e.isTrusted
          });
          self.touchData.totalTouches++;
          
          if (e.touches.length > 1) {
            self.touchData.multiTouchCount++;
          }
          
          self.touchData.lastTouchTime = now;
          self.touchData.lastTouchPosition = { x: touch.clientX, y: touch.clientY };
        }
        
        if (self.touchData.touches.length > 200) {
          self.touchData.touches = self.touchData.touches.slice(-200);
        }
      };
      
      this.boundHandlers.touchmove = function(e) {
        var now = performance.now();
        var touch = e.touches[0];
        
        if (touch && self.touchData.lastTouchPosition) {
          var dx = touch.clientX - self.touchData.lastTouchPosition.x;
          var dy = touch.clientY - self.touchData.lastTouchPosition.y;
          var distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 30) {
            self.touchData.swipes.push({
              time: now,
              distance: distance,
              direction: Math.atan2(dy, dx)
            });
          }
          
          self.touchData.lastTouchPosition = { x: touch.clientX, y: touch.clientY };
        }
      };
      
      this.boundHandlers.touchend = function(e) {
        self.touchData.lastTouchTime = performance.now();
      };
      
      document.addEventListener('touchstart', this.boundHandlers.touchstart, { passive: true });
      document.addEventListener('touchmove', this.boundHandlers.touchmove, { passive: true });
      document.addEventListener('touchend', this.boundHandlers.touchend, { passive: true });
    };
    
    FraudDetectionV12.prototype.analyzeTouch = function() {
      var data = this.touchData;
      var result = {
        enabled: true,
        totalTouches: data.totalTouches,
        multiTouchCount: data.multiTouchCount,
        swipeCount: data.swipes.length,
        isMobileInteraction: data.totalTouches > 0,
        botScore: 0,
        isSuspicious: false,
        analysis: {}
      };
      
      if (data.touches.length === 0) {
        return result;
      }
      
      var touchTimes = data.touches.map(function(t) { return t.time; });
      var intervals = [];
      for (var i = 1; i < touchTimes.length; i++) {
        intervals.push(touchTimes[i] - touchTimes[i - 1]);
      }
      
      if (intervals.length > 5) {
        var avgInterval = this.mean(intervals);
        var intervalCV = avgInterval > 0 ? this.standardDeviation(intervals) / avgInterval : 0;
        var intervalEntropy = this.calculateEntropy(intervals, 10);
        
        result.analysis = {
          avgIntervalMs: Math.round(avgInterval),
          intervalCV: Math.round(intervalCV * 1000) / 1000,
          intervalEntropy: Math.round(intervalEntropy * 1000) / 1000
        };
      }
      
      var untrustedCount = data.touches.filter(function(t) { return !t.isTrusted; }).length;
      result.analysis.untrustedCount = untrustedCount;
      
      return result;
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // CLIPBOARD TRACKING
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initClipboardTracking = function() {
      if (!this.options.enableClipboard) return;
      var self = this;
      
      this.boundHandlers.paste = function(e) {
        var now = performance.now();
        if (self.clipboardData.lastPasteTime !== null) {
          self.clipboardData.pasteIntervals.push(now - self.clipboardData.lastPasteTime);
        }
        self.clipboardData.lastPasteTime = now;
        self.clipboardData.pastes.push({ time: now });
        self.clipboardData.totalPastes++;
      };
      
      this.boundHandlers.copy = function() { self.clipboardData.totalCopies++; };
      
      document.addEventListener('paste', this.boundHandlers.paste, { passive: true });
      document.addEventListener('copy', this.boundHandlers.copy, { passive: true });
    };
    
    FraudDetectionV12.prototype.analyzeClipboard = function() {
      var data = this.clipboardData;
      var result = {
        enabled: this.options.enableClipboard,
        totalPasteEvents: data.totalPastes,
        totalCopyEvents: data.totalCopies,
        botScore: 0,
        isSuspicious: false,
        analysis: {}
      };
      
      if (data.pastes.length === 0) return result;
      
      var rapidPasteCount = 0;
      for (var i = 1; i < data.pastes.length; i++) {
        if (data.pastes[i].time - data.pastes[i-1].time < 500) rapidPasteCount++;
      }
      
      var pasteFreq = data.totalPastes / ((Date.now() - this.startTime) / 1000);
      var intervalEntropy = data.pasteIntervals.length > 3 ? this.calculateEntropy(data.pasteIntervals, 10) : 0;
      
      result.analysis = {
        rapidPasteCount: rapidPasteCount,
        pasteFrequencyPerSec: Math.round(pasteFreq * 1000) / 1000,
        intervalEntropy: Math.round(intervalEntropy * 1000) / 1000
      };
      result.rapidPasteCount = rapidPasteCount;
      
      return result;
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // VISIBILITY TRACKING
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initVisibilityTracking = function() {
      if (!this.options.enableVisibility) return;
      var self = this;
      
      this.boundHandlers.visibilitychange = function() {
        var now = Date.now();
        var duration = now - self.visibilityData.lastChangeTime;
        if (self.visibilityData.isHidden) self.visibilityData.hiddenTime += duration;
        else self.visibilityData.visibleTime += duration;
        self.visibilityData.isHidden = document.hidden;
        self.visibilityData.lastChangeTime = now;
        self.visibilityData.changes.push({ time: now, hidden: document.hidden });
      };
      
      this.boundHandlers.focus = function() { self.visibilityData.focusChanges.push({ time: Date.now(), hasFocus: true }); self.visibilityData.hasFocus = true; };
      this.boundHandlers.blur = function() { self.visibilityData.focusChanges.push({ time: Date.now(), hasFocus: false }); self.visibilityData.hasFocus = false; };
      
      document.addEventListener('visibilitychange', this.boundHandlers.visibilitychange);
      window.addEventListener('focus', this.boundHandlers.focus);
      window.addEventListener('blur', this.boundHandlers.blur);
    };
    
    FraudDetectionV12.prototype.updateIdleTime = function() {
      var now = Date.now();
      var timeSinceActivity = now - this.visibilityData.lastActivityTime;
      if (timeSinceActivity > 5000) {
        var lastIdle = this.visibilityData.idlePeriods[this.visibilityData.idlePeriods.length - 1];
        if (!lastIdle || lastIdle.end) {
          this.visibilityData.idlePeriods.push({ start: this.visibilityData.lastActivityTime + 5000, end: null });
        }
      } else {
        var lastIdle = this.visibilityData.idlePeriods[this.visibilityData.idlePeriods.length - 1];
        if (lastIdle && !lastIdle.end) lastIdle.end = this.visibilityData.lastActivityTime;
      }
    };
    
    FraudDetectionV12.prototype.analyzeVisibility = function() {
      var data = this.visibilityData;
      var now = Date.now();
      var currentDuration = now - data.lastChangeTime;
      var hiddenTime = data.hiddenTime + (data.isHidden ? currentDuration : 0);
      var visibleTime = data.visibleTime + (data.isHidden ? 0 : currentDuration);
      var totalTime = hiddenTime + visibleTime;
      var visibilityRatio = totalTime > 0 ? visibleTime / totalTime : 1;
      
      var idleDurations = data.idlePeriods.filter(function(p) { return p.end; }).map(function(p) { return p.end - p.start; });
      var idleEntropy = idleDurations.length > 3 ? this.calculateEntropy(idleDurations, 10) : 0;
      var totalIdleTime = idleDurations.reduce(function(a, b) { return a + b; }, 0);
      var switchRate = data.changes.length / (totalTime / 60000);
      
      var result = {
        enabled: this.options.enableVisibility,
        totalWindowSwitches: data.changes.length,
        totalHiddenTimeSeconds: Math.round(hiddenTime / 1000 * 100) / 100,
        visibilityRatio: Math.round(visibilityRatio * 1000) / 1000,
        focusChangeCount: data.focusChanges.length,
        totalIdleTimeSeconds: Math.round(totalIdleTime / 1000 * 100) / 100,
        idleEntropy: Math.round(idleEntropy * 1000) / 1000,
        switchRate: Math.round(switchRate * 100) / 100,
        idlePeriodCount: idleDurations.length,
        botScore: 0,
        isSuspicious: false
      };
      
      return result;
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // WINDOW SYNC
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initWindowSync = function() {
      if (!this.options.enableWindowSync) return;
      var self = this;
      
      if (typeof BroadcastChannel !== 'undefined') {
        try {
          this.broadcastChannel = new BroadcastChannel('fraud_detection_v11');
          this.broadcastChannel.onmessage = function(event) {
            var type = event.data.type;
            var tabId = event.data.tabId;
            if (type === 'heartbeat' && tabId !== self.windowSyncData.tabId) {
              self.windowSyncData.otherTabsDetected = true;
              self.windowSyncData.messages.push({ type: type, tabId: tabId, receivedAt: Date.now() });
              if (self.windowSyncData.messages.length > 50) self.windowSyncData.messages = self.windowSyncData.messages.slice(-50);
            }
            if (type === 'announce') self.windowSyncData.tabCount++;
          };
          this.broadcastChannel.postMessage({ type: 'announce', tabId: this.windowSyncData.tabId, timestamp: Date.now() });
          return;
        } catch (e) {
          // BroadcastChannel failed, fall through to localStorage
        }
      }
      
      this.initLocalStorageSync();
    };
    
    FraudDetectionV12.prototype.initLocalStorageSync = function() {
      var key = 'v11_active_tabs';
      var tabId = this.windowSyncData.tabId;
      var self = this;
      
      try {
        var tabs = JSON.parse(localStorage.getItem(key) || '{}');
        var now = Date.now();
        
        Object.keys(tabs).forEach(function(id) {
          if (now - tabs[id] > 30000) delete tabs[id];
        });
        
        tabs[tabId] = now;
        localStorage.setItem(key, JSON.stringify(tabs));
        
        var otherTabs = Object.keys(tabs).filter(function(id) { return id !== tabId; });
        if (otherTabs.length > 0) {
          this.windowSyncData.otherTabsDetected = true;
          this.windowSyncData.tabCount = otherTabs.length + 1;
        }
        
        this.boundHandlers.storage = function(e) {
          if (e.key === key && e.newValue) {
            try {
              var newTabs = JSON.parse(e.newValue);
              var others = Object.keys(newTabs).filter(function(id) { return id !== tabId; });
              if (others.length > 0) {
                self.windowSyncData.otherTabsDetected = true;
                self.windowSyncData.tabCount = others.length + 1;
              }
            } catch (err) {}
          }
        };
        window.addEventListener('storage', this.boundHandlers.storage);
        
        window.addEventListener('beforeunload', function() {
          try {
            var t = JSON.parse(localStorage.getItem(key) || '{}');
            delete t[tabId];
            localStorage.setItem(key, JSON.stringify(t));
          } catch (err) {}
        });
      } catch (e) {
        // localStorage sync failed
      }
    };
    
    FraudDetectionV12.prototype.sendHeartbeat = function() {
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({ type: 'heartbeat', tabId: this.windowSyncData.tabId, timestamp: Date.now() });
        } catch (e) {}
      }
    };
    
    FraudDetectionV12.prototype.analyzeWindowSync = function() {
      var data = this.windowSyncData;
      var uniqueTabs = new Set(data.messages.map(function(m) { return m.tabId; }));
      return {
        enabled: this.options.enableWindowSync,
        multiSession: {
          detected: data.otherTabsDetected,
          tabCount: Math.max(uniqueTabs.size, data.tabCount),
          confidence: data.otherTabsDetected ? 0.9 : 0
        }
      };
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // FORM TRACKING
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initFormTracking = function() {
      var self = this;
      
      this.boundHandlers.focusin = function(e) {
        var target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          var now = performance.now();
          self.formData.focusEvents.push({
            time: now,
            field: target.name || target.id || target.type || 'unnamed',
            tagName: target.tagName
          });
          self.formData.fieldTimings.set(target, now);
          
          if (self.formData.focusEvents.length > 100) {
            self.formData.focusEvents = self.formData.focusEvents.slice(-100);
          }
        }
      };
      
      this.boundHandlers.focusout = function(e) {
        var target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          var now = performance.now();
          var startTime = self.formData.fieldTimings.get(target);
          var duration = startTime ? now - startTime : 0;
          
          self.formData.blurEvents.push({
            time: now,
            field: target.name || target.id || target.type || 'unnamed',
            duration: duration
          });
          
          self.formData.totalFieldTime += duration;
          self.formData.fieldTimings.delete(target);
          
          if (self.formData.blurEvents.length > 100) {
            self.formData.blurEvents = self.formData.blurEvents.slice(-100);
          }
        }
      };
      
      document.addEventListener('focusin', this.boundHandlers.focusin, { passive: true });
      document.addEventListener('focusout', this.boundHandlers.focusout, { passive: true });
    };
    
    FraudDetectionV12.prototype.analyzeFormInteraction = function() {
      var data = this.formData;
      var result = {
        totalFocusEvents: data.focusEvents.length,
        totalBlurEvents: data.blurEvents.length,
        totalFieldTimeMs: data.totalFieldTime,
        avgFieldTimeMs: 0,
        fieldTimingEntropy: 0,
        isSuspicious: false
      };
      
      if (data.blurEvents.length > 0) {
        var durations = data.blurEvents.map(function(e) { return e.duration; }).filter(function(d) { return d > 0; });
        if (durations.length > 0) {
          result.avgFieldTimeMs = Math.round(this.mean(durations));
          if (durations.length > 3) {
            result.fieldTimingEntropy = Math.round(this.calculateEntropy(durations, 10) * 1000) / 1000;
          }
        }
      }
      
      return result;
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // HONEYPOT TRACKING
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.initHoneypotTracking = function() {
      if (!this.options.enableHoneypot) return;
      var self = this;
      
      this.createHoneypotField();
      
      if (this.honeypotData.honeypotElement) {
        this.boundHandlers.honeypotInput = function(e) {
          self.handleHoneypotInteraction('input', e);
        };
        
        this.boundHandlers.honeypotFocus = function(e) {
          self.handleHoneypotInteraction('focus', e);
        };
        
        this.boundHandlers.honeypotChange = function(e) {
          self.handleHoneypotInteraction('change', e);
        };
        
        this.boundHandlers.honeypotPaste = function(e) {
          self.handleHoneypotInteraction('paste', e);
        };
        
        var field = this.honeypotData.honeypotElement;
        field.addEventListener('input', this.boundHandlers.honeypotInput, { passive: true });
        field.addEventListener('focus', this.boundHandlers.honeypotFocus, { passive: true });
        field.addEventListener('change', this.boundHandlers.honeypotChange, { passive: true });
        field.addEventListener('paste', this.boundHandlers.honeypotPaste, { passive: true });
      }
    };
    
    FraudDetectionV12.prototype.createHoneypotField = function() {
      try {
        var wrapper = document.createElement('div');
        wrapper.id = '__fd_hp_wrapper__';
        wrapper.setAttribute('aria-hidden', 'true');
        wrapper.style.cssText = 'position:absolute!important;left:-9999px!important;top:-9999px!important;width:0!important;height:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important;visibility:hidden!important;z-index:-9999!important;';
        
        var honeypotField = document.createElement('input');
        honeypotField.type = 'text';
        honeypotField.name = this.options.honeypotFieldName;
        honeypotField.id = '__fd_honeypot__';
        honeypotField.autocomplete = 'off';
        honeypotField.tabIndex = -1;
        honeypotField.setAttribute('aria-hidden', 'true');
        honeypotField.setAttribute('data-honeypot', 'true');
        honeypotField.style.cssText = 'position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important;opacity:0!important;';
        
        wrapper.appendChild(honeypotField);
        
        if (this.options.honeypotContainerId) {
          var container = document.getElementById(this.options.honeypotContainerId);
          if (container) {
            container.appendChild(wrapper);
          } else {
            document.body.appendChild(wrapper);
          }
        } else {
          document.body.appendChild(wrapper);
        }
        
        this.honeypotData.honeypotElement = honeypotField;
        this.honeypotData.isInjected = true;
        
      } catch (e) {
        this.honeypotData.isInjected = false;
      }
    };
    
    FraudDetectionV12.prototype.handleHoneypotInteraction = function(eventType, event) {
      var now = performance.now();
      var field = this.honeypotData.honeypotElement;
      
      this.honeypotData.triggered = true;
      this.honeypotData.triggerCount++;
      
      if (!this.honeypotData.firstTriggerTime) {
        this.honeypotData.firstTriggerTime = now;
      }
      this.honeypotData.lastTriggerTime = now;
      
      if (field) {
        this.honeypotData.fieldValue = field.value || '';
      }
      
      if (eventType === 'focus') {
        this.honeypotData.focusCount++;
      } else if (eventType === 'input') {
        this.honeypotData.inputCount++;
      }
      
      this.honeypotData.triggerEvents.push({
        type: eventType,
        time: now,
        timestamp: Date.now(),
        value: field ? field.value : '',
        isTrusted: event ? event.isTrusted : null
      });
      
      if (this.honeypotData.triggerEvents.length > 100) {
        this.honeypotData.triggerEvents = this.honeypotData.triggerEvents.slice(-100);
      }
    };
    
    FraudDetectionV12.prototype.getHoneypotValue = function() {
      if (this.honeypotData.honeypotElement) {
        return this.honeypotData.honeypotElement.value || '';
      }
      return this.honeypotData.fieldValue;
    };
    
    FraudDetectionV12.prototype.isHoneypotTriggered = function() {
      var field = this.honeypotData.honeypotElement;
      if (field && field.value && field.value.length > 0) {
        this.honeypotData.triggered = true;
        this.honeypotData.fieldValue = field.value;
      }
      return this.honeypotData.triggered || (this.honeypotData.fieldValue.length > 0);
    };
    
    FraudDetectionV12.prototype.analyzeHoneypot = function() {
      var data = this.honeypotData;
      var self = this;
      
      if (data.honeypotElement) {
        var currentValue = data.honeypotElement.value || '';
        if (currentValue.length > 0 && !data.triggered) {
          data.triggered = true;
          data.fieldValue = currentValue;
          data.triggerCount++;
        }
      }
      
      var result = {
        enabled: this.options.enableHoneypot,
        isInjected: data.isInjected,
        triggered: data.triggered,
        triggerCount: data.triggerCount,
        fieldValue: data.fieldValue,
        fieldValueLength: data.fieldValue.length,
        focusCount: data.focusCount,
        inputCount: data.inputCount,
        botScore: 0,
        isSuspicious: false,
        isHighRisk: false,
        analysis: {}
      };
      
      if (!data.isInjected) {
        result.analysis.status = 'not_injected';
        return result;
      }
      
      if (data.triggered || data.fieldValue.length > 0) {
        var syntheticCount = data.triggerEvents.filter(function(e) { return e.isTrusted === false; }).length;
        
        var avgInterval = 0;
        if (data.triggerEvents.length > 1) {
          var intervals = [];
          for (var i = 1; i < data.triggerEvents.length; i++) {
            intervals.push(data.triggerEvents[i].time - data.triggerEvents[i - 1].time);
          }
          avgInterval = self.mean(intervals);
        }
        
        result.analysis = {
          status: 'triggered',
          triggerType: data.fieldValue.length > 0 ? 'value_set' : 'interaction_detected',
          eventTypes: Array.from(new Set(data.triggerEvents.map(function(e) { return e.type; }))),
          syntheticEvents: syntheticCount,
          timeSinceFirstTrigger: data.firstTriggerTime ? performance.now() - data.firstTriggerTime : 0,
          avgInteractionInterval: avgInterval
        };
      } else {
        result.analysis.status = 'clean';
      }
      
      return result;
    };
    
    FraudDetectionV12.prototype.removeHoneypotField = function() {
      if (this.honeypotData.honeypotElement) {
        var field = this.honeypotData.honeypotElement;
        
        if (this.boundHandlers.honeypotInput) {
          field.removeEventListener('input', this.boundHandlers.honeypotInput);
        }
        if (this.boundHandlers.honeypotFocus) {
          field.removeEventListener('focus', this.boundHandlers.honeypotFocus);
        }
        if (this.boundHandlers.honeypotChange) {
          field.removeEventListener('change', this.boundHandlers.honeypotChange);
        }
        if (this.boundHandlers.honeypotPaste) {
          field.removeEventListener('paste', this.boundHandlers.honeypotPaste);
        }
        
        var wrapper = document.getElementById('__fd_hp_wrapper__');
        if (wrapper && wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
        
        this.honeypotData.honeypotElement = null;
        this.honeypotData.isInjected = false;
      }
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ANTI-DETECT BROWSER DETECTION
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.detectAntiDetectBrowser = function() {
      var result = {
        enabled: this.options.enableAntiDetect,
        isAntiDetectBrowser: false,
        browserType: 'Regular Browser',
        confidence: 0,
        detections: [],
        checksTotal: 11,
        checksPassed: 0
      };
      
      var checks = [
        this.checkWebDriver(),
        this.checkAutomation(),
        this.checkHeadless(),
        this.checkPlugins(),
        this.checkWebGL(),
        this.checkCanvas(),
        this.checkTimezone(),
        this.checkLanguage(),
        this.checkScreen(),
        this.checkChrome(),
        this.checkNavigator()
      ];
      
      result.checksTotal = checks.length;
      var detected = checks.filter(function(c) { return c.detected; });
      result.detections = detected;
      result.checksPassed = checks.length - detected.length;
      
      var totalWeight = checks.reduce(function(s, c) { return s + c.weight; }, 0);
      var detectedWeight = detected.reduce(function(s, c) { return s + c.weight; }, 0);
      result.confidence = Math.round((detectedWeight / totalWeight) * 1000) / 1000;
      
      return result;
    };
    
    FraudDetectionV12.prototype.checkWebDriver = function() {
      var indicators = [];
      if (navigator.webdriver) indicators.push('webdriver');
      if (window.callPhantom || window._phantom) indicators.push('phantom');
      if (window.__nightmare) indicators.push('nightmare');
      if (window.domAutomation || window.domAutomationController) indicators.push('domAutomation');
      return { type: 'webdriver', detected: indicators.length > 0, weight: 1.0, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkAutomation = function() {
      var indicators = [];
      if (window.chrome && !window.chrome.runtime) indicators.push('chrome_no_runtime');
      var seleniumProps = ['__driver_evaluate', '__webdriver_evaluate', '__selenium_evaluate', '__fxdriver_evaluate'];
      for (var i = 0; i < seleniumProps.length; i++) {
        var prop = seleniumProps[i];
        if (document[prop] || window[prop]) { indicators.push(prop); break; }
      }
      for (var prop in document) { if (prop.match && prop.match(/^cdc_/)) { indicators.push('cdc_property'); break; } }
      return { type: 'automation', detected: indicators.length > 0, weight: 0.9, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkHeadless = function() {
      var indicators = [];
      if (/HeadlessChrome/.test(navigator.userAgent)) indicators.push('headless_ua');
      if (navigator.userAgent.includes('Chrome') && navigator.plugins.length === 0 && !this.isMobile()) indicators.push('chrome_no_plugins');
      try {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl');
        if (!gl) indicators.push('no_webgl');
        else {
          var debug = gl.getExtension('WEBGL_debug_renderer_info');
          if (debug) {
            var renderer = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
            if (renderer.includes('SwiftShader') || renderer.includes('llvmpipe')) indicators.push('software_renderer');
          }
        }
      } catch (e) { indicators.push('webgl_error'); }
      return { type: 'headless', detected: indicators.length > 0, weight: 0.8, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkPlugins = function() {
      var indicators = [];
      if (navigator.userAgent.includes('Chrome') && navigator.plugins.length === 0 && !this.isMobile()) indicators.push('chrome_no_plugins');
      return { type: 'plugins', detected: indicators.length > 0, weight: 0.6, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkWebGL = function() {
      var indicators = [];
      try {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl');
        if (gl) {
          var debug = gl.getExtension('WEBGL_debug_renderer_info');
          if (debug) {
            var renderer = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
            if (renderer.includes('SwiftShader')) indicators.push('swiftshader');
            if (renderer.includes('llvmpipe')) indicators.push('llvmpipe');
          }
        }
      } catch (e) {}
      return { type: 'webgl', detected: indicators.length > 0, weight: 0.7, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkCanvas = function() {
      var indicators = [];
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 50;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f60'; ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = '#069'; ctx.fillText('Canvas Test', 2, 15);
        var urls = [];
        for (var i = 0; i < 3; i++) {
          ctx.clearRect(0, 0, 200, 50);
          ctx.fillStyle = '#f60'; ctx.fillRect(0, 0, 200, 50);
          ctx.fillStyle = '#069'; ctx.fillText('Canvas Test', 2, 15);
          urls.push(canvas.toDataURL());
        }
        if (new Set(urls).size > 1) indicators.push('canvas_noise');
      } catch (e) { indicators.push('canvas_blocked'); }
      return { type: 'canvas', detected: indicators.length > 0, weight: 0.8, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkTimezone = function() {
      var indicators = [];
      try {
        var reportedOffset = new Date().getTimezoneOffset();
        var intlTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (!intlTimezone || intlTimezone === 'Etc/Unknown') {
          indicators.push('unknown_timezone');
        }
        
        if (intlTimezone) {
          if (Math.abs(reportedOffset) > 840) {
            indicators.push('impossible_offset');
          }
        }
        
        var localeTimezone = new Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (localeTimezone !== intlTimezone) {
          indicators.push('timezone_mismatch');
        }
      } catch (e) {
        indicators.push('timezone_error');
      }
      return { type: 'timezone', detected: indicators.length > 0, weight: 0.5, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkLanguage = function() {
      var indicators = [];
      if (navigator.languages && navigator.languages.length > 0 && navigator.languages.indexOf(navigator.language) === -1) {
        indicators.push('language_mismatch');
      }
      return { type: 'language', detected: indicators.length > 0, weight: 0.4, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkScreen = function() {
      var indicators = [];
      if (screen.width < window.innerWidth || screen.height < window.innerHeight) indicators.push('screen_mismatch');
      if (screen.width === 0 || screen.height === 0) indicators.push('zero_screen');
      return { type: 'screen', detected: indicators.length > 0, weight: 0.5, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkChrome = function() {
      var indicators = [];
      if (navigator.userAgent.includes('Chrome') && !window.chrome) indicators.push('no_chrome_object');
      return { type: 'chrome', detected: indicators.length > 0, weight: 0.6, details: indicators };
    };
    
    FraudDetectionV12.prototype.checkNavigator = function() {
      var indicators = [];
      if (navigator.hardwareConcurrency === 0 || navigator.hardwareConcurrency > 128) indicators.push('unusual_cores');
      if (navigator.deviceMemory !== undefined && (navigator.deviceMemory < 0.25 || navigator.deviceMemory > 256)) indicators.push('unusual_memory');
      return { type: 'navigator', detected: indicators.length > 0, weight: 0.7, details: indicators };
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // DEVTOOLS, NETWORK, STORAGE, SYNTHETIC
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.detectDevTools = function () {
      var result = {
        enabled: this.options.enableDevTools,
        isOpen: false,
        isSuspicious: false,
        skippedReason: null
      };

      if (!this.options.enableDevTools) {
        return result;
      }

      var ua = navigator.userAgent || "";

      // Real mobile/tablet detection
      var isMobileOrTablet =
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(ua);

      // iPad desktop mode fix
      var isIPadDesktopMode =
        navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

      // Embedded webview detection
      var isWebView =
        /wv/.test(ua) ||
        /WebView/i.test(ua) ||
        /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

      if (isMobileOrTablet || isIPadDesktopMode || isWebView) {
        result.skippedReason = "unsupported_environment";
        return result;
      }

      try {
        var widthDiff = window.outerWidth - window.innerWidth;
        var heightDiff = window.outerHeight - window.innerHeight;

        // Docked devtools usually causes big viewport difference
        if (widthDiff > 180 || heightDiff > 180) {
          result.isOpen = true;
          result.isSuspicious = true;
        }
      } catch (err) {
        console.warn("DevTools detection failed:", err);
      }

      return result;
    };
    
    FraudDetectionV12.prototype.analyzeNetwork = function() {
      var result = {
        enabled: this.options.enableNetwork,
        connectionType: 'unknown',
        proxyLikelihood: 0,
        isSuspicious: false,
        analysis: {}
      };
      var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        result.connectionType = conn.effectiveType || 'unknown';
        result.analysis = { effectiveType: conn.effectiveType, downlink: conn.downlink, rtt: conn.rtt };
        if (conn.rtt !== undefined && conn.effectiveType === '4g' && conn.rtt > 500) result.proxyLikelihood += 20;
        if (conn.rtt !== undefined && conn.rtt < 5) result.proxyLikelihood += 15;
      }
      result.proxyLikelihood = Math.min(100, result.proxyLikelihood);
      return result;
    };
    
    FraudDetectionV12.prototype.analyzeStorage = function() {
      var result = {
        enabled: this.options.enableStorage,
        consistencyScore: 100,
        isSuspicious: false,
        analysis: {}
      };
      try {
        var key = '__v11_test__', val = 'test_' + Date.now();
        localStorage.setItem(key, val);
        if (localStorage.getItem(key) !== val) { result.consistencyScore -= 30; result.analysis.localStorageIssue = true; }
        localStorage.removeItem(key);
        sessionStorage.setItem(key, val);
        if (sessionStorage.getItem(key) !== val) { result.consistencyScore -= 20; result.analysis.sessionStorageIssue = true; }
        sessionStorage.removeItem(key);
        if (!window.indexedDB) { result.consistencyScore -= 10; result.analysis.indexedDBUnavailable = true; }
        if (!navigator.cookieEnabled) { result.consistencyScore -= 15; result.analysis.cookiesDisabled = true; }
      } catch (e) { result.consistencyScore -= 40; result.analysis.storageError = e.message; }
      return result;
    };
    
    FraudDetectionV12.prototype.analyzeSyntheticEvents = function() {
      var result = {
        enabled: this.options.enableSynthetic,
        syntheticCount: this.syntheticEvents.count,
        byType: {
          keyboard: this.syntheticEvents.byType.keyboard,
          mouse: this.syntheticEvents.byType.mouse,
          click: this.syntheticEvents.byType.click,
          other: this.syntheticEvents.byType.other
        },
        botScore: 0,
        isSuspicious: false
      };
      return result;
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // FINGERPRINT
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.collectFingerprint = function() {
      var fp = {
        userAgent: navigator.userAgent, platform: navigator.platform,
        language: navigator.language, languages: navigator.languages ? Array.prototype.slice.call(navigator.languages) : [navigator.language],
        hardwareConcurrency: navigator.hardwareConcurrency, deviceMemory: navigator.deviceMemory,
        maxTouchPoints: navigator.maxTouchPoints || 0, cookiesEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        screen: { width: screen.width, height: screen.height, colorDepth: screen.colorDepth, pixelRatio: window.devicePixelRatio },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset()
      };
      fp.canvasHash = this.getCanvasFingerprint();
      fp.webglInfo = this.getWebGLFingerprint();
      fp.audioHash = this.getAudioFingerprint();
      return fp;
    };
    
    FraudDetectionV12.prototype.getCanvasFingerprint = function() {
      try {
        var canvas = document.createElement('canvas');
        canvas.width = 200; canvas.height = 50;
        var ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top'; ctx.font = '14px Arial';
        ctx.fillStyle = '#f60'; ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = '#069'; ctx.fillText('V11 Canvas FP', 2, 15);
        return this.hashString(canvas.toDataURL()).substring(0, 32);
      } catch (e) { return null; }
    };
    
    FraudDetectionV12.prototype.getWebGLFingerprint = function() {
      try {
        var canvas = document.createElement('canvas');
        var gl = canvas.getContext('webgl');
        if (!gl) return null;
        var result = { vendor: gl.getParameter(gl.VENDOR), renderer: gl.getParameter(gl.RENDERER) };
        var debug = gl.getExtension('WEBGL_debug_renderer_info');
        if (debug) {
          result.unmaskedVendor = gl.getParameter(debug.UNMASKED_VENDOR_WEBGL);
          result.unmaskedRenderer = gl.getParameter(debug.UNMASKED_RENDERER_WEBGL);
        }
        result.hash = this.hashString(JSON.stringify(result)).substring(0, 32);
        return result;
      } catch (e) { return null; }
    };
    
    FraudDetectionV12.prototype.getAudioFingerprint = function() {
      try {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return null;
        var ctx = new AudioContext();
        var osc = ctx.createOscillator();
        var analyser = ctx.createAnalyser();
        var gain = ctx.createGain();
        gain.gain.value = 0;
        osc.type = 'triangle'; osc.frequency.value = 10000;
        osc.connect(analyser); analyser.connect(gain); gain.connect(ctx.destination);
        osc.start(0);
        var fp = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(fp);
        osc.stop(); ctx.close();
        return this.hashString(fp.reduce(function(a, b) { return a + b; }, 0).toString()).substring(0, 16);
      } catch (e) { return null; }
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // REPORT & CLEANUP
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.generateReport = function() {
      this.runDetectionCycle();
      return {
        session: {
          id: this.sessionId,
          startTime: new Date(this.startTime).toISOString(),
          uptimeSeconds: Math.round((Date.now() - this.startTime) / 1000),
          totalDetectionCycles: this.detectionCycles,
          browserInfo: this.getBrowserInfo()
        },
        clipboard: this.detectionResults.clipboard,
        visibility: this.detectionResults.visibility,
        keyboard: this.detectionResults.keyboard,
        mouse: this.detectionResults.mouse,
        antiDetect: this.detectionResults.antiDetect,
        devTools: this.detectionResults.devTools,
        network: this.detectionResults.network,
        storage: this.detectionResults.storage,
        syntheticEvents: this.detectionResults.syntheticEvents,
        windowSync: this.detectionResults.windowSync,
        formInteraction: this.detectionResults.formInteraction,
        touch: this.detectionResults.touch,
        honeypot: this.detectionResults.honeypot,
        browserFingerprint: this.fingerprint,
        performance: this.detectionResults.performance
      };
    };
    
    FraudDetectionV12.prototype.getBrowserInfo = function () {
      var ua = navigator.userAgent;
      var uaLower = ua.toLowerCase();

      var browser = 'Unknown', version = 0;

      var getVersion = function (regex, index) {
        index = index || 1;
        var m = uaLower.match(regex);
        return m ? parseInt(m[index], 10) : 0;
      };

      // ----------- Priority detection -----------

      if (uaLower.includes("torbrowser")) {
        browser = "Tor Browser";
        version = getVersion(/firefox\/(\d+)/);
      }

      else if (
        uaLower.includes("duckduckgo") ||
        window.duckduckgo ||
        navigator.globalPrivacyControl === true
      ) {
        browser = "DuckDuckGo Browser";
        version =
          getVersion(/duckduckgo\/(\d+)/) ||
          getVersion(/version\/(\d+)/);
      }

      else if (navigator.brave && typeof navigator.brave.isBrave === "function") {
        browser = "Brave";
        version = getVersion(/chrome\/(\d+)/);
      }

      // ----------- iOS browsers (VERY IMPORTANT FIRST) -----------

      else if (uaLower.includes("crios")) {
        browser = "Chrome (iOS)";
        version = getVersion(/crios\/(\d+)/);
      }
      else if (uaLower.includes("fxios")) {
        browser = "Firefox (iOS)";
        version = getVersion(/fxios\/(\d+)/);
      }
      else if (uaLower.includes("edgios")) {
        browser = "Edge (iOS)";
        version = getVersion(/edgios\/(\d+)/);
      }

      // ----------- Edge / Opera -----------

      else if (uaLower.includes("edg/")) {
        browser = "Edge";
        version = getVersion(/edg\/(\d+)/);
      }
      else if (uaLower.includes("opr/") || uaLower.includes("opera")) {
        browser = "Opera";
        version = getVersion(/(opr|opera)\/(\d+)/, 2);
      }
      else if (uaLower.includes("opera touch")) {
        browser = "Opera Touch";
      }

      // ----------- Secure / Chromium variants -----------

      else if (uaLower.includes("avast")) browser = "Avast Secure Browser";
      else if (uaLower.includes("avg")) browser = "AVG Secure Browser";
      else if (uaLower.includes("vivaldi")) browser = "Vivaldi";

      // ----------- Mobile / OEM -----------

      else if (uaLower.includes("samsungbrowser")) {
        browser = "Samsung Browser";
        version = getVersion(/samsungbrowser\/(\d+)/);
      }
      else if (uaLower.includes("miuibrowser")) browser = "MIUI Browser";
      else if (uaLower.includes("huawei")) browser = "Huawei Browser";
      else if (uaLower.includes("heytap")) browser = "HeyTap";
      else if (uaLower.includes("silk")) browser = "Silk";

      // ----------- Chinese / Asian -----------

      else if (uaLower.includes("ucbrowser") || uaLower.includes("uc mini")) browser = "UCBrowser";
      else if (uaLower.includes("qqbrowser")) browser = "QQBrowser";
      else if (uaLower.includes("qq/")) browser = "QQ";
      else if (uaLower.includes("quark")) browser = "Quark";
      else if (uaLower.includes("whale")) browser = "Whale";
      else if (uaLower.includes("naver")) browser = "NAVER";
      else if (uaLower.includes("kakaotalk")) browser = "KAKAOTALK";
      else if (uaLower.includes("line")) browser = "Line";

      // ----------- Social browsers -----------

      else if (uaLower.includes("fbav") || uaLower.includes("facebook")) browser = "Facebook";
      else if (uaLower.includes("instagram")) browser = "Instagram";
      else if (uaLower.includes("tiktok")) browser = "TikTok";
      else if (uaLower.includes("wechat")) browser = "WeChat";
      else if (uaLower.includes("metasr")) browser = "MetaSr";

      // ----------- WebView (Fraud important) -----------

      else if (
        uaLower.includes("wv") ||
        (uaLower.includes("android") && uaLower.includes("version/") && !uaLower.includes("chrome"))
      ) {
        browser = "Android WebView";
      }

      // ----------- Desktop browsers -----------

      else if (uaLower.includes("yabrowser")) browser = "Yandex";
      else if (uaLower.includes("maxthon")) browser = "Maxthon";
      else if (uaLower.includes("seamonkey")) browser = "SeaMonkey";
      else if (uaLower.includes("oculusbrowser")) browser = "Oculus Browser";

      // ----------- Chrome family -----------

      else if (uaLower.includes("headlesschrome")) {
        browser = "Chrome Headless";
        version = getVersion(/headlesschrome\/(\d+)/);
      }
      else if (uaLower.includes("chromium")) {
        browser = "Chromium";
      }
      else if (uaLower.includes("chrome")) {
        browser = "Chrome";
        version = getVersion(/chrome\/(\d+)/);
      }

      // ----------- Firefox / Safari -----------

      else if (uaLower.includes("firefox")) {
        browser = "Firefox";
        version = getVersion(/firefox\/(\d+)/);
      }
      else if (uaLower.includes("safari") && !uaLower.includes("chrome") && !uaLower.includes("crios")) {
        browser = "Safari";
        version = getVersion(/version\/(\d+)/);
      }

      // ----------- Fallback -----------

      else if (uaLower.includes("webkit")) browser = "WebKit";
      else if (uaLower.includes("mozilla")) browser = "Mozilla";

      return {
        browser: browser,
        version: version,
        mobile: this.isMobile(),
        userAgent: ua
      };
    };
    
    FraudDetectionV12.prototype.isMobile = function() { return /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent); };
    
    FraudDetectionV12.prototype.removeEventListeners = function() {
      var self = this;
      var handlers = ['keydown', 'keyup', 'mousemove', 'click', 'scroll', 'contextmenu', 'paste', 'copy', 'visibilitychange', 'focusin', 'focusout', 'touchstart', 'touchmove', 'touchend'];
      handlers.forEach(function(h) { if (self.boundHandlers[h]) document.removeEventListener(h, self.boundHandlers[h]); });
      if (this.boundHandlers.focus) window.removeEventListener('focus', this.boundHandlers.focus);
      if (this.boundHandlers.blur) window.removeEventListener('blur', this.boundHandlers.blur);
      if (this.boundHandlers.storage) window.removeEventListener('storage', this.boundHandlers.storage);
      this.removeHoneypotField();
      this.boundHandlers = {};
    };
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // UTILITIES
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    FraudDetectionV12.prototype.generateUUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    };
    
    FraudDetectionV12.prototype.mean = function(arr) { if (!arr || arr.length === 0) return 0; return arr.reduce(function(a, b) { return a + b; }, 0) / arr.length; };
    
    FraudDetectionV12.prototype.standardDeviation = function(arr) {
      if (!arr || arr.length === 0) return 0;
      var self = this;
      var avg = this.mean(arr);
      return Math.sqrt(this.mean(arr.map(function(v) { return Math.pow(v - avg, 2); })));
    };
    
    FraudDetectionV12.prototype.calculateEntropy = function(values, numBins) {
      if (numBins === void 0) { numBins = 20; }
      if (!values || values.length === 0) return 0;
      var min = Math.min.apply(null, values), max = Math.max.apply(null, values), range = max - min;
      if (range === 0) return 0;
      var binSize = range / numBins, bins = new Array(numBins).fill(0);
      for (var i = 0; i < values.length; i++) bins[Math.min(Math.floor((values[i] - min) / binSize), numBins - 1)]++;
      var entropy = 0;
      for (var i = 0; i < bins.length; i++) { var c = bins[i]; if (c > 0) { var p = c / values.length; entropy -= p * Math.log(p) / Math.log(2); } }
      return entropy;
    };
    
    FraudDetectionV12.prototype.calculateUniformRatio = function(values) {
      if (!values || values.length < 2) return 0;
      var mean = this.mean(values), threshold = mean * 0.1;
      var count = 0;
      for (var i = 1; i < values.length; i++) { if (Math.abs(values[i] - values[i-1]) < threshold) count++; }
      return count / (values.length - 1);
    };
    
    FraudDetectionV12.prototype.calculateAutocorrelation = function(values, lag) {
      if (lag === void 0) { lag = 1; }
      if (!values || values.length <= lag) return 0;
      var mean = this.mean(values);
      var num = 0, den = 0;
      for (var i = 0; i < values.length - lag; i++) num += (values[i] - mean) * (values[i + lag] - mean);
      for (var i = 0; i < values.length; i++) den += Math.pow(values[i] - mean, 2);
      return den === 0 ? 0 : num / den;
    };
    
    FraudDetectionV12.prototype.calculateHurstExponent = function(values) {
      if (!values || values.length < 20) return 0.5;
      var mean = this.mean(values);
      var Y = []; var cumSum = 0;
      for (var i = 0; i < values.length; i++) { cumSum += values[i] - mean; Y.push(cumSum); }
      var R = Math.max.apply(null, Y) - Math.min.apply(null, Y);
      var S = this.standardDeviation(values);
      if (S === 0 || R === 0) return 0.5;
      return Math.max(0.1, Math.min(0.99, Math.log(R / S) / Math.log(values.length)));
    };
    
    FraudDetectionV12.prototype.hashString = function(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash = hash & hash; }
      return Math.abs(hash).toString(16).padStart(16, '0');
    };
    
    return FraudDetectionV12;
    
  })();
  
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // SECURE TRANSPORT: WebCrypto Encryption Module (NO EXTERNAL DEPS)
  // Enterprise-grade AES-GCM with ephemeral key derivation
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  
  /**
   * @private
   * Secure transport module - Isolated IIFE to prevent scope pollution.
   * Uses WebCrypto API exclusively for cryptographic operations.
   * Designed for CDN distribution with zero external dependencies.
   */
  var _secureTransport = (function() {
    'use strict';
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // CONSTANTS: Security parameters (non-secret, algorithm config only)
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    var ALGO_AES = 'AES-GCM';
    var ALGO_PBKDF2 = 'PBKDF2';
    var ALGO_SHA = 'SHA-256';
    var KEY_LENGTH_BITS = 256;
    var IV_LENGTH_BYTES = 12;
    var SALT_LENGTH_BYTES = 16;
    var PBKDF2_ITERATIONS = 100000;
    var REQUEST_TIMEOUT_MS = 30000;
    var NONCE_LENGTH_BYTES = 16;
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // CAPABILITY CHECK: Verify WebCrypto availability
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @private
     * Determines if the current environment supports WebCrypto.
     * @returns {boolean} True if WebCrypto is available and functional.
     */
    function isWebCryptoAvailable() {
      try {
        return !!(
          typeof window !== 'undefined' &&
          window.crypto &&
          window.crypto.subtle &&
          typeof window.crypto.subtle.encrypt === 'function' &&
          typeof window.crypto.subtle.deriveKey === 'function' &&
          typeof window.crypto.getRandomValues === 'function'
        );
      } catch (e) {
        return false;
      }
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // RANDOM GENERATION: Secure entropy sources only
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @private
     * Generates cryptographically secure random bytes.
     * @param {number} length - Number of bytes to generate.
     * @returns {Uint8Array} Random byte array.
     */
    function generateSecureRandomBytes(length) {
      var bytes = new Uint8Array(length);
      window.crypto.getRandomValues(bytes);
      return bytes;
    }
    
    /**
     * @private
     * Generates a random nonce for anti-replay protection.
     * @returns {string} Hex-encoded nonce.
     */
    function generateNonce() {
      var bytes = generateSecureRandomBytes(NONCE_LENGTH_BYTES);
      return bytesToHex(bytes);
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ENCODING UTILITIES: Binary <-> String conversions
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @private
     * Converts a Uint8Array to a hexadecimal string.
     * @param {Uint8Array} bytes - Byte array to convert.
     * @returns {string} Hex string representation.
     */
    function bytesToHex(bytes) {
      var hex = '';
      for (var i = 0; i < bytes.length; i++) {
        hex += ('0' + bytes[i].toString(16)).slice(-2);
      }
      return hex;
    }
    
    /**
     * @private
     * Converts a string to a Uint8Array using UTF-8 encoding.
     * Cross-browser compatible implementation.
     * @param {string} str - String to encode.
     * @returns {Uint8Array} UTF-8 encoded byte array.
     */
    function stringToBytes(str) {
      if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(str);
      }
      // Fallback for older browsers (IE11, older Safari)
      var utf8 = unescape(encodeURIComponent(str));
      var bytes = new Uint8Array(utf8.length);
      for (var i = 0; i < utf8.length; i++) {
        bytes[i] = utf8.charCodeAt(i);
      }
      return bytes;
    }
    
    /**
     * @private
     * Converts a Uint8Array to a Base64 string.
     * Cross-browser compatible implementation.
     * @param {Uint8Array} bytes - Byte array to convert.
     * @returns {string} Base64 encoded string.
     */
    function bytesToBase64(bytes) {
      var binary = '';
      for (var i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // KEY DERIVATION: Ephemeral key material via PBKDF2
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @private
     * Derives an ephemeral AES key from project key and random salt.
     * Uses PBKDF2 with SHA-256 for secure key derivation.
     * Key is never stored - derived fresh per-request for forward secrecy.
     * @param {string} projectKey - Project identifier used as base material.
     * @param {Uint8Array} salt - Random salt for this derivation.
     * @returns {Promise<CryptoKey>} Derived AES-GCM key.
     */
    function deriveEphemeralKey(projectKey, salt) {
      var keyMaterial = stringToBytes(projectKey);
      
      return window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: ALGO_PBKDF2 },
        false,
        ['deriveKey']
      ).then(function(baseKey) {
        return window.crypto.subtle.deriveKey(
          {
            name: ALGO_PBKDF2,
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: ALGO_SHA
          },
          baseKey,
          { name: ALGO_AES, length: KEY_LENGTH_BITS },
          false,
          ['encrypt']
        );
      });
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // ENCRYPTION: AES-GCM with random IV
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @private
     * Encrypts plaintext data using AES-GCM.
     * Generates fresh IV and salt per invocation.
     * Returns concatenated salt + IV + ciphertext as Base64.
     * @param {string} plaintext - Data to encrypt (JSON string).
     * @param {string} projectKey - Project key for key derivation.
     * @returns {Promise<string>} Encrypted payload as Base64.
     */
    function encryptPayload(plaintext, projectKey) {
      var salt = generateSecureRandomBytes(SALT_LENGTH_BYTES);
      var iv = generateSecureRandomBytes(IV_LENGTH_BYTES);
      var plaintextBytes = stringToBytes(plaintext);
      
      return deriveEphemeralKey(projectKey, salt).then(function(key) {
        return window.crypto.subtle.encrypt(
          { name: ALGO_AES, iv: iv },
          key,
          plaintextBytes
        );
      }).then(function(ciphertext) {
        // Concatenate: salt (16) + iv (12) + ciphertext (variable)
        // Backend uses salt and iv to reconstruct key and decrypt
        var ciphertextBytes = new Uint8Array(ciphertext);
        var combined = new Uint8Array(salt.length + iv.length + ciphertextBytes.length);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(ciphertextBytes, salt.length + iv.length);
        return bytesToBase64(combined);
      });
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // PAYLOAD CONSTRUCTION: Minimal, encoded structure
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @private
     * Constructs the minimal submission payload with anti-replay fields.
     * @param {Object} data - Collected behavioral data.
     * @param {string} projectKey - Project identifier.
     * @param {string} sessionId - Current session ID.
     * @param {string} sdkVersion - SDK version string.
     * @returns {Object} Structured payload for encryption.
     */
    function constructPayloadObject(data, projectKey, sessionId, sdkVersion, userId, transactionId, projectId) {
      return {
        d: data,           // Behavioral data blob
        pk: projectKey,    // Project key
        sid: sessionId,    // Session identifier
        v: sdkVersion,     // SDK version
        ts: Date.now(),    // Timestamp (anti-replay)
        n: generateNonce(), // Nonce (anti-replay),
        userId: userId || null, // Optional user identifier
        transactionId: transactionId || null, // Optional transition identifier
        projectId: projectId || null  // Optional project identifier
      };
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // NETWORK: Secure POST with timeout and error handling
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @private
     * Executes a secure POST request with timeout.
     * Uses fetch API with XMLHttpRequest fallback.
     * @param {string} url - Target endpoint.
     * @param {string} encryptedPayload - Base64-encoded encrypted data.
     * @param {string} projectKey - Project key for header.
     * @param {string} sessionId - Session ID for header.
     * @param {string} sdkVersion - SDK version for header.
     * @param {number} timestamp - Request timestamp.
     * @returns {Promise<Object>} Parsed backend response.
     */
    function executeSecurePost(url, encryptedPayload, projectKey, sessionId, sdkVersion, timestamp, userId, transactionId, projectId) {
      var requestBody = JSON.stringify({
        payload: encryptedPayload,
        ts: timestamp,
        pk: projectKey,
        sid: sessionId,
        v: sdkVersion,
        uid: userId || null,
        tid: transactionId || null,
        pid: projectId || null
      });
      
      var headers = {
        'Content-Type': 'application/json'
      };
      
      // Timeout wrapper for fetch
      function fetchWithTimeout(fetchUrl, fetchOptions, timeoutMs) {
        return new Promise(function(resolve, reject) {
          var didTimeout = false;
          
          var timeoutId = setTimeout(function() {
            didTimeout = true;
            reject(new Error('Request timeout after ' + timeoutMs + 'ms'));
          }, timeoutMs);
          
          fetch(fetchUrl, fetchOptions).then(function(response) {
            clearTimeout(timeoutId);
            if (!didTimeout) {
              resolve(response);
            }
          }).catch(function(error) {
            clearTimeout(timeoutId);
            if (!didTimeout) {
              reject(error);
            }
          });
        });
      }
      
      // XHR with timeout implementation
      function xhrWithTimeout(xhrUrl, body, xhrHeaders, timeoutMs) {
        return new Promise(function(resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', xhrUrl, true);
          xhr.timeout = timeoutMs;
          
          for (var headerName in xhrHeaders) {
            if (xhrHeaders.hasOwnProperty(headerName)) {
              xhr.setRequestHeader(headerName, xhrHeaders[headerName]);
            }
          }
          
          xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                resolve({ status: 'ok', raw: xhr.responseText });
              }
            } else {
              reject(new Error('HTTP error: ' + xhr.status));
            }
          };
          
          xhr.onerror = function() {
            reject(new Error('Network error'));
          };
          
          xhr.ontimeout = function() {
            reject(new Error('Request timeout after ' + timeoutMs + 'ms'));
          };
          
          xhr.send(body);
        });
      }
      
      // Use fetch if available, fallback to XHR
      if (typeof fetch === 'function') {
        return fetchWithTimeout(url, {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          headers: headers,
          body: requestBody,
          keepalive: true
        }, REQUEST_TIMEOUT_MS).then(function(response) {
          if (!response.ok) {
            throw new Error('HTTP error: ' + response.status);
          }
          return response.json();
        });
      } else {
        return xhrWithTimeout(url, requestBody, headers, REQUEST_TIMEOUT_MS);
      }
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // PUBLIC INTERFACE: submit function
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    /**
     * @public
     * Securely submits collected data to the backend.
     * Encrypts payload using AES-GCM with ephemeral keys.
     * Includes anti-replay protection via timestamp and nonce.
     * Fails safely if WebCrypto is unavailable.
     * 
     * @param {Object} params - Submission parameters.
     * @param {Object} params.data - Collected behavioral data.
     * @param {string} params.projectKey - Project identifier.
     * @param {string} params.sessionId - Current session ID.
     * @param {string} params.apiUrl - Backend endpoint URL.
     * @param {string} params.sdkVersion - SDK version.
     * @returns {Promise<Object>} Backend response or error object.
     */
    function submit(params) {
      // Defensive: Validate required parameters
      if (!params || typeof params !== 'object') {
        return Promise.reject(new Error('Invalid submission parameters'));
      }
      
      if (!params.data || !params.projectKey || !params.sessionId ) {
        return Promise.reject(new Error('Missing required submission parameters'));
      }
      
      // Fail safely if WebCrypto unavailable
      if (!isWebCryptoAvailable()) {
        return Promise.reject(new Error('Secure transport unavailable: WebCrypto not supported'));
      }
      
      var timestamp = Date.now();
      var sdkVersion = params.sdkVersion || '1.0.0';
      // Construct payload with anti-replay fields
      var payloadObject = constructPayloadObject(
        params.data,
        params.projectKey,
        params.sessionId,
        sdkVersion,
        params.userId || null,
        params.transactionId || null,
        params.projectId || null
      );
      
      var plaintextPayload = JSON.stringify(payloadObject);
      
      // Encrypt and transmit
      return encryptPayload(plaintextPayload, params.projectKey)
        .then(function(encryptedPayload) {
          return executeSecurePost(
            'https://api.calibr8yourdata.com/api/v1/sdk/submit',
            encryptedPayload,
            params.projectKey,
            params.sessionId,
            sdkVersion,
            timestamp,
            params.userId || null,
            params.transactionId || null,
            params.projectId || null
          );
        })
        .catch(function(error) {
          // Wrap all errors for consistent handling
          return Promise.reject({
            error: true,
            message: error.message || 'Submission failed',
            code: 'SUBMIT_ERROR'
          });
        });
    }
    
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // MODULE EXPORT: Minimal surface area
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    
    return {
      submit: submit,
      isAvailable: isWebCryptoAvailable
    };
    
  })();
  
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // PUBLIC API: calibr8yourdata SDK
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  
  var sdk = {
    _initialized: false,
    _version: _version,
    
    /**
     * Initialize the SDK with configuration
     * @param {Object} config - Configuration object
     * @param {string} config.projectKey - Your project API key
     * @param {string} config.apiUrl - API endpoint URL
     * @param {boolean} [config.autoStart=true] - Automatically start collection
     * @param {Object} [config.options] - Detection options
     */
    init: function(config) {
      try {
        if (_initialized) {
          console.warn('[calibr8yourdata] SDK already initialized');
          return this;
        }
        
        if (!config || typeof config !== 'object') {
          console.error('[calibr8yourdata] Configuration object required');
          return this;
        }
        
        if (!config.projectKey) {
          console.error('[calibr8yourdata] projectKey is required');
          return this;
        }
        
        // apiUrl is now optional - uses embedded ingress path if not provided
        // When provided, it serves as the base URL for the SDK ingress endpoint
        var baseUrl = config.apiUrl || config.baseUrl;
        
        // Construct the SDK ingress URL
        // If baseUrl provided, append the embedded ingress path
        // This ensures the actual submission endpoint is never exposed in config
        var sdkIngressUrl = baseUrl;
        if (baseUrl && baseUrl.length > 0) {
          // Normalize: remove trailing slash, append ingress path
          sdkIngressUrl = baseUrl.replace(/\/$/, '') + '/' + _sdkIngressPath;
        }
        
        _config = {
          projectKey: config.projectKey,
          apiUrl: config.apiUrl || sdkIngressUrl,
          sdkIngressUrl: sdkIngressUrl,
          autoStart: config.autoStart !== false,
          options: config.options || {},
          userId: config.userId || null,
          transactionId: config.transactionId || null,
          projectId: config.projectId || null
        };
        
        // Store base URL for internal use
        _baseApiUrl = baseUrl;
        
        // Create instance
        _instance = new FraudDetectionV12(_config.options);
        
        // Auto-start if enabled
        if (_config.autoStart) {
          _instance.start();
        }
        
        _initialized = true;
        sdk._initialized = true;
        
        return this;
        
      } catch (e) {
        // Graceful failure - never break host site
        console.error('[calibr8yourdata] Initialization error:', e.message);
        return this;
      }
    },
    
    /**
     * Start collection if not auto-started
     * @returns {Object} SDK instance for chaining
     */
    start: function() {
      try {
        if (!_initialized || !_instance) {
          console.warn('[calibr8yourdata] SDK not initialized. Call init() first.');
          return this;
        }
        _instance.start();
        return this;
      } catch (e) {
        console.error('[calibr8yourdata] Start error:', e.message);
        return this;
      }
    },
    
    /**
     * Stop collection and cleanup
     * @returns {Object} SDK instance for chaining
     */
    stop: function() {
      try {
        if (_instance) {
          _instance.stop();
        }
        return this;
      } catch (e) {
        console.error('[calibr8yourdata] Stop error:', e.message);
        return this;
      }
    },
    
    /**
     * Collect behavioral signals (does not send)
     * @returns {Object|null} Collected data or null on error
     */
    collect: function() {
      try {
        if (!_initialized || !_instance) {
          console.warn('[calibr8yourdata] SDK not initialized. Call init() first.');
          return null;
        }
        return _instance.generateReport();
      } catch (e) {
        console.error('[calibr8yourdata] Collect error:', e.message);
        return null;
      }
    },
    
    /**
     * Generate fraud report and submit to backend for analysis.
     * This is the primary entry point for SDK consumers.
     * 
     * Internally:
     *   1. Collects behavioral telemetry via generateReport()
     *   2. Encrypts payload using AES-GCM (WebCrypto)
     *   3. Submits to backend via secure POST
     *   4. Returns backend's fraud analysis response
     * 
     * The SDK is transport-only - all fraud logic lives in backend.
     * 
     * @param {Object} [options] - Options object
     * @param {Function} [options.onSuccess] - Success callback with response
     * @param {Function} [options.onError] - Error callback with error
     * @returns {Promise<Object>} Promise resolving to backend fraud response
     * 
     * @example
     * calibr8yourdata.generateReport()
     *   .then(function(response) {
     *     console.log('Fraud score:', response.data.fraud_score);
     *     console.log('Passed:', response.data.passed);
     *   })
     *   .catch(function(error) {
     *     console.error('Analysis failed:', error);
     *   });
     */
    generateReport: function(options) {
      var self = this;
      options = options || {};
      
      return new Promise(function(resolve, reject) {
        try {
          // ── Guard: SDK must be initialized ──
          if (!_initialized || !_config) {
            var initErr = new Error('SDK not initialized. Call init() first.');
            if (options.onError) options.onError(initErr);
            reject(initErr);
            return;
          }
          
          // ── Guard: Secure transport must be available ──
          if (!_secureTransport || !_secureTransport.isAvailable()) {
            var cryptoErr = new Error('Secure transport unavailable: WebCrypto not supported.');
            if (options.onError) options.onError(cryptoErr);
            reject(cryptoErr);
            return;
          }
          
          // ── Guard: SDK ingress URL must be configured ──
          if (!_config.sdkIngressUrl) {
            var urlErr = new Error('SDK ingress URL not configured. Provide apiUrl or baseUrl in init().');
            if (options.onError) options.onError(urlErr);
            reject(urlErr);
            return;
          }
          
          // ── Collect behavioral telemetry ──
          var collectedData = self.collect();
          if (!collectedData) {
            var dataErr = new Error('No data collected. Ensure collection is active.');
            if (options.onError) options.onError(dataErr);
            reject(dataErr);
            return;
          }
          // ── Submit via secure encrypted channel ──
          // Uses the embedded SDK ingress path, not the user-configured apiUrl
          _secureTransport.submit({
            data: collectedData,
            projectKey: _config.projectKey,
            sessionId: _instance ? _instance.sessionId : self.getSessionId(),
            apiUrl: _config.sdkIngressUrl,
            sdkVersion: _version,
            userId: _config.userId || null,
            transactionId: _config.transactionId || null,
            projectId: _config.projectId || null
          })
          .then(function(backendResponse) {
            // Success: Return backend fraud response to caller
            if (options.onSuccess) options.onSuccess(backendResponse);
            resolve(backendResponse);
          })
          .catch(function(submitError) {
            // Failure: Normalize and propagate error
            var normalizedError = submitError && submitError.message 
              ? submitError 
              : new Error('Report submission failed');
            if (options.onError) options.onError(normalizedError);
            reject(normalizedError);
          });
          
        } catch (unexpectedError) {
          // Catch-all: Never throw - graceful degradation
          var safeError = new Error('Unexpected error: ' + (unexpectedError.message || 'Unknown'));
          if (options.onError) options.onError(safeError);
          reject(safeError);
        }
      });
    },
    
    /**
     * Send collected data to configured endpoint
     * @param {Object} [options] - Send options
     * @param {Function} [options.onSuccess] - Success callback
     * @param {Function} [options.onError] - Error callback
     * @returns {Promise} Promise resolving to response
     */
    send: function(options) {
      var self = this;
      options = options || {};
      
      return new Promise(function(resolve, reject) {
        try {
          if (!_initialized || !_config) {
            var err = new Error('SDK not initialized');
            if (options.onError) options.onError(err);
            reject(err);
            return;
          }
          
          var data = self.collect();
          if (!data) {
            var err = new Error('No data collected');
            if (options.onError) options.onError(err);
            reject(err);
            return;
          }
          
          var payload = {
            projectKey: _config.projectKey,
            timestamp: new Date().toISOString(),
            sdkVersion: _version,
            data: data,
            userId: _config.userId || null,
            transactionId: _config.transactionId || null,
            projectId: _config.projectId || null
          };
          
          // Use fetch with fallback to XMLHttpRequest
          if (typeof fetch === 'function') {
            fetch(_config.apiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-SDK-Version': _version
              },
              body: JSON.stringify(payload),
              keepalive: true // Ensure delivery even on page unload
            })
            .then(function(response) {
              if (!response.ok) {
                throw new Error('HTTP ' + response.status);
              }
              return response.json();
            })
            .then(function(result) {
              if (options.onSuccess) options.onSuccess(result);
              resolve(result);
            })
            .catch(function(err) {
              if (options.onError) options.onError(err);
              reject(err);
            });
          } else {
            // XMLHttpRequest fallback
            var xhr = new XMLHttpRequest();
            xhr.open('POST', _config.apiUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('X-SDK-Version', _version);
            xhr.onload = function() {
              if (xhr.status >= 200 && xhr.status < 300) {
                var result = JSON.parse(xhr.responseText);
                if (options.onSuccess) options.onSuccess(result);
                resolve(result);
              } else {
                var err = new Error('HTTP ' + xhr.status);
                if (options.onError) options.onError(err);
                reject(err);
              }
            };
            xhr.onerror = function() {
              var err = new Error('Network error');
              if (options.onError) options.onError(err);
              reject(err);
            };
            xhr.send(JSON.stringify(payload));
          }
        } catch (e) {
          if (options.onError) options.onError(e);
          reject(e);
        }
      });
    },
    
    /**
     * Check if honeypot was triggered (quick check for form validation)
     * @returns {boolean} True if honeypot was triggered
     */
    isHoneypotTriggered: function() {
      try {
        if (!_instance) return false;
        return _instance.isHoneypotTriggered();
      } catch (e) {
        return false;
      }
    },
    
    /**
     * Securely submit collected data to backend using encrypted transport.
     * Uses WebCrypto AES-GCM encryption with ephemeral keys.
     * Payload is invisible in DevTools - only encrypted blob transmitted.
     * Includes anti-replay protection via timestamp and cryptographic nonce.
     * 
     * @param {Object} [options] - Submission options.
     * @param {Function} [options.onSuccess] - Success callback receiving backend response.
     * @param {Function} [options.onError] - Error callback receiving error object.
     * @returns {Promise<Object>} Promise resolving to backend response.
     * 
     * @example
     * calibr8yourdata.submit()
     *   .then(function(response) { console.log('Backend decision:', response); })
     *   .catch(function(error) { console.error('Submission failed:', error); });
     */
    submit: function(options) {
      var self = this;
      options = options || {};
      
      return new Promise(function(resolve, reject) {
        try {
          // ── Guard: SDK must be initialized ──
          if (!_initialized || !_config) {
            var initErr = new Error('SDK not initialized. Call init() first.');
            if (options.onError) options.onError(initErr);
            reject(initErr);
            return;
          }
          
          // ── Guard: Secure transport must be available ──
          if (!_secureTransport || !_secureTransport.isAvailable()) {
            var cryptoErr = new Error('Secure transport unavailable: WebCrypto not supported in this browser.');
            if (options.onError) options.onError(cryptoErr);
            reject(cryptoErr);
            return;
          }
          
          // ── Collect behavioral data ──
          var collectedData = self.collect();
          if (!collectedData) {
            var dataErr = new Error('No data collected. Ensure collection is active.');
            if (options.onError) options.onError(dataErr);
            reject(dataErr);
            return;
          }
          
          // ── Execute secure submission ──
          _secureTransport.submit({
            data: collectedData,
            projectKey: _config.projectKey,
            sessionId: _instance ? _instance.sessionId : self.getSessionId(),
            apiUrl: _config.apiUrl,
            sdkVersion: _version,
            userId: _config.userId || null,
            transactionId: _config.transactionId || null,
            projectId: _config.projectId || null
          })
          .then(function(backendResponse) {
            // Success: Return backend response to caller
            if (options.onSuccess) options.onSuccess(backendResponse);
            resolve(backendResponse);
          })
          .catch(function(submitError) {
            // Failure: Normalize and propagate error
            var normalizedError = submitError && submitError.message 
              ? submitError 
              : new Error('Submission failed');
            if (options.onError) options.onError(normalizedError);
            reject(normalizedError);
          });
          
        } catch (unexpectedError) {
          // Catch-all: Never throw - graceful degradation
          var safeError = new Error('Unexpected submission error: ' + (unexpectedError.message || 'Unknown'));
          if (options.onError) options.onError(safeError);
          reject(safeError);
        }
      });
    },
    
    /**
     * Check if secure transport (WebCrypto) is available in current browser.
     * Useful for feature detection before calling submit().
     * @returns {boolean} True if secure submit is available.
     */
    isSecureTransportAvailable: function() {
      try {
        return _secureTransport && _secureTransport.isAvailable();
      } catch (e) {
        return false;
      }
    },
    
    /**
     * Get SDK version
     * @returns {string} SDK version
     */
    getVersion: function() {
      return _version;
    },
    
    /**
     * Get session ID
     * @returns {string|null} Session ID or null
     */
    getSessionId: function() {
      try {
        if (!_instance) return null;
        return _instance.sessionId;
      } catch (e) {
        return null;
      }
    }
  };
  
  // Expose to global namespace
  global.calibr8yourdata = sdk;
  
  return sdk;
  
});