// Aumentamos la versión para forzar al navegador a actualizar el caché viejo
const CACHE_NAME = 'genaro-dashboard-v2'; 

// Lista de archivos para que tu Dashboard funcione sin internet
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './iconog.png',
  './horario.html',
  './ahorro.html',
  './meta.html',
  './salud.html',
  './notas.html',
  './habitos.html'
];

// Instalación: Guarda los archivos iniciales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché de Genaro actualizado a v2');
        return cache.addAll(urlsToCache);
      })
  );
  // Fuerza a que el nuevo Service Worker tome el control inmediatamente
  self.skipWaiting();
});

// Estrategia: Network First (Primero red, luego caché)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay conexión, guardamos la versión más nueva en el caché silenciosamente
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si falla la red (estás sin internet), buscamos en el caché
        return caches.match(event.request);
      })
  );
});

// Activación: Borra cachés viejos (v1) para no ocupar espacio a lo tonto
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Reclama el control de las ventanas abiertas inmediatamente
  return self.clients.claim();
});