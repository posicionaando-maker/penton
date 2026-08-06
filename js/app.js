// ======== DATOS DE PRODUCTOS ========
let productos = [];

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

// ======== CARGAR PRODUCTOS DESDE JSON ========
async function cargarProductos() {
    try {
        const respuesta = await fetch('productos.json');
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status} - ${respuesta.statusText}`);
        }
        
        const datos = await respuesta.json();
        
        // Validar que los datos sean un array y no estén vacíos
        if (!Array.isArray(datos)) {
            throw new Error('El archivo JSON no contiene un array válido');
        }
        
        if (datos.length === 0) {
            throw new Error('El archivo JSON está vacío');
        }
        
        productos = datos;
        console.log('✅ Productos cargados correctamente:', productos.length, 'productos');
        renderizarProductos();
        
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        mostrarError(`Error al cargar productos: ${error.message}`);
    }
}

// ======== MOSTRAR ERROR EN CATÁLOGO ========
function mostrarError(mensaje) {
    if (catalogo) {
        catalogo.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:3rem; background:#f8d7da; border:1px solid #f5c6cb; border-radius:8px;">
                <h3 style="color:#721c24; margin-bottom:1rem;">⚠️ Error al cargar los productos</h3>
                <p style="color:#721c24; margin-bottom:0.5rem;">${mensaje}</p>
                <p style="color:#721c24; font-size:0.9rem; margin-bottom:1.5rem;">Verifica que el archivo productos.json exista y tenga formato válido</p>
                <button onclick="location.reload()" style="padding:0.7rem 2rem; background:#007bff; color:white; border:none; border-radius:5px; cursor:pointer; font-size:1rem;">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }
}

// ======== RENDERIZAR PRODUCTOS ========
function renderizarProductos(filtro = "todos", busqueda = "") {
    // Verificar que el catálogo exista
    if (!catalogo) {
        console.error('❌ Elemento #catalogo no encontrado');
        return;
    }
    
    // Verificar que productos esté cargado
    if (!productos || productos.length === 0) {
        catalogo.innerHTML = `
            <p style="grid-column:1/-1; text-align:center; padding:2rem; color:#888;">
                <span style="display:inline-block; animation: spin 1s linear infinite;">⟳</span>
                Cargando productos...
            </p>
        `;
        return;
    }
    
    let filtrados = [...productos];
    
    // Aplicar filtro de categoría
    if (filtro && filtro !== "todos") {
        filtrados = filtrados.filter(p => p.categoria === filtro);
    }
    
    // Aplicar filtro de búsqueda
    if (busqueda && busqueda.trim() !== "") {
        const term = busqueda.toLowerCase().trim();
        filtrados = filtrados.filter(p => 
            p.nombre.toLowerCase().includes(term) || 
            p.categoria.toLowerCase().includes(term)
        );
    }
    
    // Mostrar mensaje si no hay productos
    if (filtrados.length === 0) {
        catalogo.innerHTML = `
            <p style="grid-column:1/-1; text-align:center; padding:2rem; color:#888; background:#f8f9fa; border-radius:8px;">
                🔍 No encontramos productos. ¡Escríbenos por WhatsApp y te ayudamos!
            </p>
        `;
        return;
    }
    
    // Renderizar productos
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
    if (!productos || productos.length === 0) {
        alert('Los productos aún no se han cargado. Intenta de nuevo.');
        return;
    }
    
    const producto = productos.find(p => p.id === id);
    if (!producto) {
        console.error(`❌ Producto con ID ${id} no encontrado`);
        return;
    }
    
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
    // Verificar que los elementos existan
    if (!contadorCarrito || !listaCarrito || !totalCarrito) {
        console.error('❌ Elementos del carrito no encontrados');
        return;
    }
    
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    contadorCarrito.textContent = totalItems;
    
    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li style="color:#888; text-align:center; padding:1rem 0;">🛒 Tu carrito está vacío</li>';
        totalCarrito.textContent = '$0.00';
        return;
    }
    
    listaCarrito.innerHTML = carrito.map(item => `
        <li style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem 0; border-bottom:1px solid #eee;">
            <span style="flex:1;">${item.nombre} <strong>x${item.cantidad}</strong></span>
            <span style="margin-left:1rem;">
                $${(item.precio * item.cantidad).toFixed(2)}
                <button onclick="eliminarDelCarrito(${item.id})" style="background:#e74c3c; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; margin-left:8px; font-size:14px; line-height:24px; text-align:center;">
                    ✕
                </button>
            </span>
        </li>
    `).join('');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    totalCarrito.textContent = `$${total.toFixed(2)}`;
}

// ======== ENVIAR POR WHATSAPP ========
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert('🛒 Tu carrito está vacío. Agrega productos primero.');
        return;
    }
    
    const mensaje = carrito.map(item => 
        `• ${item.nombre} x${item.cantidad} = $${(item.precio * item.cantidad).toFixed(2)}`
    ).join('\n');
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const textoCompleto = `🛒 *Nuevo Pedido - Ferretería*\n\n${mensaje}\n\n📦 *Total: $${total.toFixed(2)}*\n\n📍 Matanzas, Cuba\n📱 Teléfono: 5X XXXXXXX\n\n¿Pueden confirmar disponibilidad y coordinar entrega? ¡Gracias!`;
    
    // Número de WhatsApp de la ferretería (cámbialo por el tuyo)
    const telefono = "53XXXXXXXXX";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(textoCompleto)}`;
    
    window.open(url, '_blank');
}

// ======== EVENT LISTENERS ========
// Configurar categorías
document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        categoriaActual = this.dataset.categoria;
        renderizarProductos(categoriaActual, searchInput ? searchInput.value : "");
    });
});

// Configurar búsqueda
if (searchInput) {
    searchInput.addEventListener('input', function() {
        renderizarProductos(categoriaActual, this.value);
    });
}

// Configurar toggle carrito
if (toggleCarritoBtn && carritoContenido) {
    toggleCarritoBtn.addEventListener('click', function() {
        carritoContenido.classList.toggle('abierto');
    });
}

// Configurar enviar WhatsApp
if (enviarWhatsAppBtn) {
    enviarWhatsAppBtn.addEventListener('click', enviarPedidoWhatsApp);
}

// ======== INICIALIZAR ========
// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
});

// ======== PWA: REGISTRAR SERVICE WORKER ========
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('✅ Service Worker registrado'))
        .catch(err => console.log('❌ Error al registrar SW:', err));
}

// ======== ESTILO DE CARGA (OPCIONAL) ========
// Agregar animación de carga
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
