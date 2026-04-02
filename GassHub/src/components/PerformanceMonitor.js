import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

const PerformanceMonitor = ({ children }) => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    renderTime: 0,
    memoryUsage: 0,
    fps: 0,
    componentCount: 0
  });
  
  const renderStartTime = useRef(0);
  const frameCount = useRef(0);
  const lastFrameTime = useRef(0);

  // Monitor render performance
  useEffect(() => {
    if (!isMonitoring) return;

    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      setPerformanceData(prev => ({
        ...prev,
        renderTime: Math.round(renderTime * 100) / 100
      }));
    };
  });

  // Monitor FPS
  useEffect(() => {
    if (!isMonitoring) return;

    let frameId;
    
    const measureFPS = () => {
      const now = performance.now();
      frameCount.current++;
      
      if (now >= lastFrameTime.current + 1000) {
        const fps = Math.round((frameCount.current * 1000) / (now - lastFrameTime.current));
        setPerformanceData(prev => ({ ...prev, fps }));
        frameCount.current = 0;
        lastFrameTime.current = now;
      }
      
      frameId = requestAnimationFrame(measureFPS);
    };

    lastFrameTime.current = performance.now();
    frameId = requestAnimationFrame(measureFPS);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isMonitoring]);

  // Monitor memory usage (if available)
  useEffect(() => {
    if (!isMonitoring || !performance.memory) return;

    const interval = setInterval(() => {
      setPerformanceData(prev => ({
        ...prev,
        memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      // Reset data when starting monitoring
      setPerformanceData({
        renderTime: 0,
        memoryUsage: 0,
        fps: 0,
        componentCount: 0
      });
    }
  };

  if (!isMonitoring) {
    return (
      <View style={styles.container}>
        {children}
        <TouchableOpacity 
          style={styles.monitorButton}
          onPress={toggleMonitoring}
        >
          <Text style={styles.monitorButtonText}>📊 Start Performance Monitor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {children}
      
      {/* Performance Overlay */}
      <View style={styles.overlay}>
        <View style={styles.performancePanel}>
          <View style={styles.header}>
            <Text style={styles.title}>Performance Monitor</Text>
            <TouchableOpacity onPress={toggleMonitoring}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{performanceData.renderTime}ms</Text>
              <Text style={styles.metricLabel}>Render Time</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{performanceData.fps}</Text>
              <Text style={styles.metricLabel}>FPS</Text>
            </View>
            
            {performance.memory && (
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{performanceData.memoryUsage}MB</Text>
                <Text style={styles.metricLabel}>Memory</Text>
              </View>
            )}
          </View>
          
          {performanceData.renderTime > 16 && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ Render time is above 16ms (1 frame)
              </Text>
            </View>
          )}
          
          {performanceData.fps < 30 && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ FPS is below 30 (target: 60)
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monitorButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 1000,
  },
  monitorButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  performancePanel: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricCard: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    minWidth: 80,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  warning: {
    backgroundColor: '#FFF3CD',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PerformanceMonitor;