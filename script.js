"use strict";

class Producto {
  constructor(id, nombre, precio, categoria = "General", stock = 10, ...etiquetas) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.stock = stock;
    this.etiquetas = etiquetas;
  }
  get precioFormateado() {
    return `S/ ${this.precio.toFixed(2)}`;
  }
  obtenerDescuento(cantidad) {
    return 0;
  }
  calcularSubtotal(cantidad) {
    const descuento = this.obtenerDescuento(cantidad);
    return this.precio * cantidad * (1 - descuento);
  }
  obtenerIcono() {
    return "📦";
  }
}

class Electronico extends Producto {
  obtenerDescuento(cantidad) {
    return cantidad >= 3 ? 0.12 : cantidad >= 2 ? 0.05 : 0;
  }
  obtenerIcono() {
    return "💻";
  }
}

class Ropa extends Producto {
  obtenerDescuento(cantidad) {
    return cantidad >= 4 ? 0.15 : 0;
  }
  obtenerIcono() {
    return "👕";
  }
}

class Libro extends Producto {
  obtenerDescuento(cantidad) {
    return cantidad >= 2 ? 0.08 : 0;
  }
  obtenerIcono() {
    return "📚";
  }
}

class CarritoCompras {
  #items;
  constructor() {
    this.#items = new Map();
  }
  agregar(producto, cantidad = 1) {
    const actual = this.#items.get(producto.id);
    if (actual) {
      actual.cantidad += cantidad;
    } else {
      this.#items.set(producto.id, { producto, cantidad });
    }
  }
  quitar(idProducto) {
    this.#items.delete(idProducto);
  }
  actualizarCantidad(idProducto, cantidad) {
    const entrada = this.#items.get(idProducto);
    if (!entrada) return;
    entrada.cantidad = cantidad;
    if (entrada.cantidad <= 0) this.#items.delete(idProducto);
  }
  vaciar() {
    this.#items.clear();
  }
  obtenerItems() {
    return Array.from(this.#items.values());
  }
  get totalItems() {
    return this.obtenerItems().reduce((acc, it) => acc + it.cantidad, 0);
  }
  get total() {
    return this.obtenerItems().reduce(
      (acc, it) => acc + it.producto.calcularSubtotal(it.cantidad),
      0
    );
  }
}

const catalogo = [
  new Electronico(1, "Audífonos Bluetooth", 89.9, "Electrónica", 15, "audio", "inalámbrico"),
  new Electronico(2, "Mouse Gamer", 59.9, "Electrónica", 20, "gamer"),
  new Electronico(3, "Teclado Mecánico", 149.9, "Electrónica", 8, "gamer"),
  new Ropa(4, "Polo Algodón", 39.9, "Ropa", 30, "casual"),
  new Ropa(5, "Casaca Impermeable", 129.9, "Ropa", 12, "outdoor"),
  new Ropa(6, "Gorra Deportiva", 24.9, "Ropa", 25, "casual"),
  new Libro(7, "Curso Práctico de JavaScript", 45.0, "Libros", 18, "programación"),
  new Libro(8, "Estructuras de Datos con JS", 55.0, "Libros", 10, "programación"),
];

const carrito = new CarritoCompras();

function calcularPuntosFidelidad(monto) {
  if (monto < 10) return 0;
  return 1 + calcularPuntosFidelidad(monto - 10);
}

function sumaRecursivaCantidades(items) {
  if (items.length === 0) return 0;
  const [primero, ...resto] = items;
  return primero.cantidad + sumaRecursivaCantidades(resto);
}

function inicializarProductos() {
  renderizarProductos(catalogo);
}

function filtrarPorCategoria(lista, categoria) {
  switch (categoria) {
    case "Electrónica":
      return lista.filter((p) => p.categoria === "Electrónica");
    case "Ropa":
      return lista.filter((p) => p.categoria === "Ropa");
    case "Libros":
      return lista.filter((p) => p.categoria === "Libros");
    case "Todos":
    default:
      return lista;
  }
}

function crearTarjetaProducto(producto, indice) {
  const disponible = producto.stock > 0;
  const tarjeta = document.createElement("article");
  tarjeta.className = "productCard";
  tarjeta.style.animationDelay = `${indice * 0.05}s`;
  tarjeta.dataset.id = producto.id;
  tarjeta.innerHTML = `
    <div class="productImg">${producto.obtenerIcono()}</div>
    <div class="productName">${producto.nombre}</div>
    <div class="productCategory">${producto.categoria}</div>
    <div class="productPrice">${producto.precioFormateado}</div>
    <div class="productStock">${disponible ? `Stock: ${producto.stock}` : "Sin stock"}</div>
    <button class="addBtn" data-action="agregar" ${disponible ? "" : "disabled"}>
      ${disponible ? "Agregar al carrito" : "Agotado"}
    </button>
  `;
  return tarjeta;
}

function renderizarProductos(lista) {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  if (lista.length === 0) {
    grid.innerHTML = `<p style="color:#d8dade">No se encontraron productos.</p>`;
    return;
  }
  let i = 0;
  while (i < lista.length) {
    grid.appendChild(crearTarjetaProducto(lista[i], i));
    i++;
  }
}

function renderizarCarrito() {
  const contenedor = document.getElementById("cartItems");
  const items = carrito.obtenerItems();
  contenedor.innerHTML = "";
  for (const item of items) {
    const fila = document.createElement("div");
    fila.className = "cartItem";
    fila.dataset.id = item.producto.id;
    fila.innerHTML = `
      <div class="cartItemInfo">
        <strong>${item.producto.nombre}</strong>
        <span>${item.producto.precioFormateado} x ${item.cantidad}</span>
      </div>
      <div class="cartItemActions">
        <button class="qtyBtn" data-action="restar">-</button>
        <span>${item.cantidad}</span>
        <button class="qtyBtn" data-action="sumar">+</button>
        <button class="removeBtn" data-action="quitar">Quitar</button>
      </div>
    `;
    contenedor.appendChild(fila);
  }
  document.getElementById("cartCount").textContent = carrito.totalItems;
  document.getElementById("cartTotal").textContent = `S/ ${carrito.total.toFixed(2)}`;
  document.getElementById("loyaltyPoints").textContent = calcularPuntosFidelidad(carrito.total);
}

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function abrirModal(titulo, cuerpo) {
  document.getElementById("modalTitle").textContent = titulo;
  document.getElementById("modalBody").textContent = cuerpo;
  document.getElementById("modalOverlay").classList.add("show");
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("show");
}

function registrarEvento(mensaje, tipo) {
  const log = document.getElementById("eventLog");
  const linea = document.createElement("div");
  linea.className = tipo === "captura" ? "capturaLine" : "burbujeoLine";
  const hora = new Date().toLocaleTimeString();
  linea.textContent = `[${hora}] ${mensaje}`;
  log.appendChild(linea);
}

function aplicarCupon(codigo, total) {
  const cuponesValidos = { VERANO10: 0.1, BIENVENIDA: 0.05 };
  const clave = codigo.trim().toUpperCase();
  const tieneDescuento = typeof cuponesValidos[clave] === "number";
  const factor = tieneDescuento ? 1 - cuponesValidos[clave] : 1;
  return { totalConDescuento: total * factor, aplicado: tieneDescuento };
}

function iniciarCuentaRegresiva(segundosIniciales) {
  let segundosRestantes = segundosIniciales;
  const elemento = document.getElementById("countdown");
  const intervalo = setInterval(() => {
    segundosRestantes--;
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;
    elemento.textContent = `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
    if (segundosRestantes <= 0) {
      clearInterval(intervalo);
      elemento.textContent = "00:00";
    }
  }, 1000);
}

function validarCantidadPositiva(valorInicial) {
  let valor = valorInicial;
  do {
    valor = Math.max(1, valor);
    break;
  } while (valor < 1);
  return valor;
}

function manejarClicProducto(evento) {
  const tarjeta = evento.target.closest(".productCard");
  if (!tarjeta) return;
  const boton = evento.target.closest("[data-action='agregar']");
  if (!boton) return;
  const id = Number(tarjeta.dataset.id);
  const producto = catalogo.find((p) => p.id === id);
  if (!producto || producto.stock <= 0) return;
  const cantidadAAgregar = validarCantidadPositiva(1);
  carrito.agregar(producto, cantidadAAgregar);
  producto.stock -= cantidadAAgregar;
  renderizarCarrito();
  renderizarProductos(obtenerListaFiltradaActual());
  mostrarToast(`${producto.nombre} agregado al carrito`);
}

function manejarClicCarrito(evento) {
  const fila = evento.target.closest(".cartItem");
  if (!fila) return;
  const id = Number(fila.dataset.id);
  const accion = evento.target.dataset.action;
  const item = carrito.obtenerItems().find((it) => it.producto.id === id);
  if (!item) return;
  if (accion === "sumar") {
    carrito.actualizarCantidad(id, item.cantidad + 1);
    item.producto.stock -= 1;
  } else if (accion === "restar") {
    carrito.actualizarCantidad(id, item.cantidad - 1);
    item.producto.stock += 1;
  } else if (accion === "quitar") {
    item.producto.stock += item.cantidad;
    carrito.quitar(id);
  }
  renderizarCarrito();
  renderizarProductos(obtenerListaFiltradaActual());
}

let categoriaActual = "Todos";
let terminoBusqueda = "";

function obtenerListaFiltradaActual() {
  const porCategoria = filtrarPorCategoria(catalogo, categoriaActual);
  const termino = terminoBusqueda.toLowerCase();
  return porCategoria.filter((p) => p.nombre.toLowerCase().includes(termino));
}

function configurarNavegacionCategorias() {
  const nav = document.getElementById("categoryNav");
  nav.addEventListener("click", (evento) => {
    const boton = evento.target.closest(".catBtn");
    if (!boton) return;
    nav.querySelectorAll(".catBtn").forEach((b) => b.classList.remove("active"));
    boton.classList.add("active");
    categoriaActual = boton.dataset.cat;
    renderizarProductos(obtenerListaFiltradaActual());
  });
}

function configurarBusqueda() {
  const input = document.getElementById("searchInput");
  input.addEventListener("keyup", (evento) => {
    terminoBusqueda = evento.target.value;
    renderizarProductos(obtenerListaFiltradaActual());
  });
  input.addEventListener("focus", () => input.parentElement.style.opacity = "1");
  input.addEventListener("blur", () => input.parentElement.style.opacity = "0.9");
}

function configurarPropagacionEventos() {
  const grid = document.getElementById("productGrid");
  document.body.addEventListener(
    "click",
    () => registrarEvento("Fase de captura recibida en <body>", "captura"),
    true
  );
  grid.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-action='agregar']");
    if (boton) {
      registrarEvento("Burbujeo: clic en botón agregar detenido en el contenedor", "burbujeo");
      evento.stopPropagation();
    }
  });
  document.addEventListener("click", () => registrarEvento("Burbujeo llegó hasta document", "burbujeo"));
}

function configurarScroll() {
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    const activo = window.scrollY > 40;
    header.classList.toggle("scrolled", activo);
  });
}

function configurarCarritoToggle() {
  const panel = document.getElementById("cartPanel");
  document.getElementById("cartToggle").addEventListener("click", () => {
    panel.classList.toggle("hidden");
  });
  document.getElementById("closeCart").addEventListener("click", () => {
    panel.classList.add("hidden");
  });
}

function configurarCheckout() {
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (carrito.totalItems === 0) {
      abrirModal("Carrito vacío", "Agrega al menos un producto antes de finalizar la compra.");
      return;
    }
    const codigoCupon = document.getElementById("couponInput").value;
    const { totalConDescuento, aplicado } = aplicarCupon(codigoCupon, carrito.total);
    const puntos = calcularPuntosFidelidad(totalConDescuento);
    const mensaje = aplicado
      ? `Cupón aplicado. Total final: S/ ${totalConDescuento.toFixed(2)}. Ganaste ${puntos} puntos.`
      : `Total: S/ ${totalConDescuento.toFixed(2)}. Ganaste ${puntos} puntos.`;
    abrirModal("Compra confirmada", mensaje);
    carrito.vaciar();
    renderizarCarrito();
  });
  document.getElementById("modalClose").addEventListener("click", cerrarModal);
  document.getElementById("modalOverlay").addEventListener("click", (evento) => {
    if (evento.target.id === "modalOverlay") cerrarModal();
  });
}

function configurarLimpiarLog() {
  document.getElementById("clearLog").addEventListener("click", () => {
    document.getElementById("eventLog").innerHTML = "";
  });
}

function inicializarEventosProducto() {
  document.getElementById("productGrid").addEventListener("click", manejarClicProducto);
  document.getElementById("cartItems").addEventListener("click", manejarClicCarrito);
}

window.addEventListener("load", () => {
  inicializarProductos();
  configurarNavegacionCategorias();
  configurarBusqueda();
  configurarPropagacionEventos();
  configurarScroll();
  configurarCarritoToggle();
  configurarCheckout();
  configurarLimpiarLog();
  inicializarEventosProducto();
  iniciarCuentaRegresiva(300);
  renderizarCarrito();
  mostrarToast("Bienvenido a TechCart");
});
