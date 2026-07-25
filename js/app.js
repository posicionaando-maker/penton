// ======== DATOS DE PRODUCTOS ========
// En producción, carga esto desde productos.json con fetch
const productos = [
    { id: 1, nombre: "Martillo de acero 500g", categoria: "herramientas", precio: 350, img: "assets/img/martillo.jpg" },
    { id: 2, nombre: "Destornillador plano 6x100mm", categoria: "herramientas", precio: 180, img: "assets/img/destornillador.jpg" },
    { id: 3, nombre: "Cable eléctrico 2.5mm (metro)", categoria: "electricos", precio: 45, img: "assets/img/cable.jpg" },
    { id: 4, nombre: "Tubo PVC 1/2\" x 3m", categoria: "fontaneria", precio: 120, img: "assets/img/tubo-pvc.jpg" },
    // ... más productos
];

// ======== ESTADO DEL CARRITO ========
let carrito = [];
let categoriaActual = "todos";

// ======== REFERENCIAS DOM ========
const catalogo = document.getElementById('catalogo');
const searchInput = document.getElementById('searchInput');
const listaCarrito = document.getElementById('listaCarrito');
const contadorCarrito = document.getElementById('contadorCarrito');
const totalCarrito = document.getElementById('totalCarrito');
const toggleCarritoBtn = document.getElementById('toggleCarrito');
const carritoContenido = document.getElementById('carritoContenido');
const enviarWhatsAppBtn = document.getElementById('enviarWhatsApp');

// ======== RENDERIZAR PRODUCTOS ========
function renderizarProductos(filtro = "todos", busqueda = "") {
    let filtrados = productos;
    
    if (filtro !== "todos") {
        filtrados = filtrados.filter(p => p.categoria === filtro);
    }
    
    if (busqueda.trim() !== "") {
        const term = busqueda.toLowerCase().trim();
        filtrados = filtrados.filter(p => 
            p.nombre.toLowerCase().includes(term) || 
            p.categoria.includes(term)
        );
    }
    
    if (filtrados.length === 0) {
        catalogo.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:2rem; color:#888;">
            No encontramos productos. ¡Escríbenos por WhatsApp y te ayudamos!
        </p>`;
        return;
    }
    
    catalogo.innerHTML = filtrados.map(p => `
        <div class="producto" data-id="${p.id}">
            <img src="${p.img}" alt="${p.nombre}" loading="lazy" onerror="this.src='assets/img/placeholder.jpg'">
            <span class="categoria-tag">${p.categoria}</span>
            <h3>${p.nombre}</h3>
            <span class="precio">$${p.precio}</span>
            <button onclick="agregarAlCarrito(${p.id})">➕ Agregar</button>
        </div>
    `).join('');
}

// ======== AGREGAR AL CARRITO ========
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    const existente = carrito.find(item => item.id === id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    actualizarCarrito();
}

// ======== ELIMINAR DEL CARRITO ========
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarCarrito();
}

// ======== ACTUALIZAR CARRITO UI ========
function actualizarCarrito() {
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    contadorCarrito.textContent = totalItems;
    
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li style="color:#888; text-align:center;">Tu carrito está vacío</li>';
        totalCarrito.textContent = '$0.00';
        return;
    }
    
    listaCarrito.innerHTML = carrito.map(item => `
        <li>
            <span>${item.nombre} x${item.cantidad}</span>
            <span>
                $${item.precio * item.cantidad}
                <button onclick="eliminarDelCarrito(${item.id})" style="background:#e74c3c;color:white;border:none;border-radius:50%;width:22px;height:22px;cursor:pointer;margin-left:8px;">✕</button>
            </span>
        </li>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

// ======== ENVIAR POR WHATSAPP ========
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega productos primero.');
        return;
    }
    
    const mensaje = carrito.map(item => 
        `• ${item.nombre} x${item.cantidad} = $${item.precio * item.cantidad}`
    ).join('\n');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const textoCompleto = `🛒 *Nuevo Pedido - Ferretería [Tu Nombre]*\n\n${mensaje}\n\n📦 *Total: $${total.toFixed(2)}*\n\n📍 Matanzas, Cuba\n📱 Mi teléfono: 5X XXXXXXX\n\n¿Pueden confirmar disponibilidad y coordinar entrega? ¡Gracias!`;
    
    // Número de WhatsApp de la ferretería (cámbialo por el tuyo)
    const telefono = "53XXXXXXXXX";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(textoCompleto)}`;
    
    window.open(url, '_blank');
}

// ======== EVENT LISTENERS ========
// Categorías
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        categoriaActual = this.dataset.categoria;
        renderizarProductos(categoriaActual, searchInput.value);
    });
});

// Búsqueda
searchInput.addEventListener('input', function() {
    renderizarProductos(categoriaActual, this.value);
});

// Toggle carrito
toggleCarritoBtn.addEventListener('click', function() {
    carritoContenido.classList.toggle('abierto');
});

// Enviar WhatsApp
enviarWhatsAppBtn.addEventListener('click', enviarPedidoWhatsApp);

// ======== INICIALIZAR ========
renderizarProductos();

// ======== PWA: REGISTRAR SERVICE WORKER ========
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.log('❌ Error SW:', err));
}
