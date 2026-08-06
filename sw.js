const CACHE_NAME = 'ferreteria-v3';
const ARCHIVOS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/manifest.json',
    '/assets/img/logo-ferreteria.jpg',
    // Agrega aquí imágenes clave que quieras cachear
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(res => res || fetch(event.request))
    );
});
