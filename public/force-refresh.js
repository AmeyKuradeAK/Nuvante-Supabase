// Emergency cache clearing script
// This can be included via CDN or direct link to force cache clearing

(function() {
  console.log('🔄 Nuvante: Force refresh script loaded');
  
  // Clear all possible caches
  function clearAllCaches() {
    return Promise.all([
      // Clear Cache API
      'caches' in window ? caches.keys().then(names => 
        Promise.all(names.map(name => caches.delete(name)))
      ) : Promise.resolve(),
      
      // Update service workers
      'serviceWorker' in navigator ? navigator.serviceWorker.getRegistrations().then(registrations => 
        Promise.all(registrations.map(registration => registration.update()))
      ) : Promise.resolve(),
    ]);
  }
  
  // Clear storage (preserve auth)
  function clearStorage() {
    // Clear localStorage except auth
    const authKeys = ['clerk-session', 'clerk-db-jwt', '__clerk_'];
    Object.keys(localStorage).forEach(key => {
      if (!authKeys.some(authKey => key.includes(authKey))) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Set emergency flag
    localStorage.setItem('nuvante-emergency-refresh', Date.now().toString());
  }
  
  // Force refresh function
  function forceRefresh() {
    clearAllCaches()
      .then(() => {
        clearStorage();
        console.log('🧹 Nuvante: Cache cleared, reloading...');
        // Force reload with cache bypass
        window.location.reload(true);
      })
      .catch(error => {
        console.error('❌ Nuvante: Error clearing cache:', error);
        clearStorage();
        window.location.reload(true);
      });
  }
  
  // Check if emergency refresh is needed
  const lastRefresh = localStorage.getItem('nuvante-emergency-refresh');
  const currentTime = Date.now();
  const refreshTime = new Date('2024-12-29T01:00:00Z').getTime(); // Set to deployment time
  
  if (!lastRefresh || parseInt(lastRefresh) < refreshTime) {
    console.log('🚨 Nuvante: Emergency refresh triggered');
    forceRefresh();
  }
  
  // Expose global function for manual refresh
  window.nuvanteClearCache = forceRefresh;
  
  console.log('💡 Nuvante: Type nuvanteClearCache() in console to manually clear cache');
})(); 