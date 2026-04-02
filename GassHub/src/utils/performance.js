import { useCallback, useMemo, useState, useEffect } from 'react';

// Utility for debouncing function calls
export const useDebounce = (callback, delay) => {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
    
    setTimeoutId(newTimeoutId);
  }, [callback, delay, timeoutId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
};

// Utility for throttling function calls
export const useThrottle = (callback, delay) => {
  const [lastCall, setLastCall] = useState(0);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      callback(...args);
      setLastCall(now);
    }
  }, [callback, delay, lastCall]);

  return throttledCallback;
};

// Utility for lazy loading components
export const useLazyLoad = (loadingThreshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  const observerCallback = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsVisible(true);
      setHasBeenVisible(true);
    }
  }, []);

  const resetVisibility = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible: hasBeenVisible || isVisible,
    observerCallback,
    resetVisibility
  };
};

// Utility for caching expensive computations
export const useExpensiveMemo = (factory, deps) => {
  return useMemo(() => {
    try {
      return factory();
    } catch (error) {
      console.warn('Expensive computation failed:', error);
      return null;
    }
  }, deps);
};

// Utility for preventing excessive re-renders
export const useStableCallback = (callback) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => {
    return callbackRef.current(...args);
  }, []);
};

// Utility for batching state updates
export const useBatchUpdates = (initialState) => {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef({});

  const updateState = useCallback((updates) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };
    
    // Batch updates to prevent multiple re-renders
    requestAnimationFrame(() => {
      if (Object.keys(pendingUpdates.current).length > 0) {
        setState(prev => ({ ...prev, ...pendingUpdates.current }));
        pendingUpdates.current = {};
      }
    });
  }, []);

  return [state, updateState];
};

// Utility for measuring component render performance
export const useRenderPerformance = (componentName) => {
  const renderStart = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    if (renderTime > 16) { // More than 1 frame (16ms)
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }
    renderStart.current = performance.now();
  });
};

// Utility for optimizing list rendering
export const useOptimizedList = (items, keyExtractor) => {
  const [renderedItems, setRenderedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadItems = async () => {
      setLoading(true);
      
      // Process items in batches to prevent blocking
      const batchSize = 20;
      const processedItems = [];
      
      for (let i = 0; i < items.length; i += batchSize) {
        if (!isMounted) break;
        
        const batch = items.slice(i, i + batchSize);
        processedItems.push(...batch);
        
        setRenderedItems([...processedItems]);
        
        // Small delay to allow UI updates
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      setLoading(false);
    };

    loadItems();

    return () => {
      isMounted = false;
    };
  }, [items]);

  return { items: renderedItems, loading };
};

// Utility for caching API responses
export const useApiCache = (apiCall, cacheKey, ttl = 300000) => { // 5 minutes default
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const cacheKeyWithTTL = `${cacheKey}_ttl`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(cacheKeyWithTTL);
    
    const isCacheValid = cachedData && 
      cacheTimestamp && 
      (Date.now() - parseInt(cacheTimestamp)) < ttl;

    if (!forceRefresh && isCacheValid && cachedData) {
      try {
        setData(JSON.parse(cachedData));
        return JSON.parse(cachedData);
      } catch (e) {
        console.warn('Failed to parse cached data');
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify(result));
      localStorage.setItem(cacheKeyWithTTL, Date.now().toString());
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, cacheKey, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData(true) };
};

// Utility for optimizing image loading
export const useImagePreloader = (imageUrls) => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  useEffect(() => {
    const preloadImages = async () => {
      const promises = imageUrls.map(url => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, url]));
            resolve();
          };
          img.onerror = () => resolve(); // Continue even if image fails
          img.src = url;
        });
      });

      await Promise.all(promises);
    };

    if (imageUrls.length > 0) {
      preloadImages();
    }
  }, [imageUrls]);

  return loadedImages;
};

// Export all utilities
export default {
  useDebounce,
  useThrottle,
  useLazyLoad,
  useExpensiveMemo,
  useStableCallback,
  useBatchUpdates,
  useRenderPerformance,
  useOptimizedList,
  useApiCache,
  useImagePreloader
};