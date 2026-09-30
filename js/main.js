document.addEventListener("DOMContentLoaded", () => {
    let productosDisponibles = [];

    const selectProducto = document.getElementById("producto");
    const contenedorProductos = document.getElementById("contenedor-productos");
    const formPedido = document.getElementById("form-pedido");
    const mensajeEstado = document.getElementById("mensaje-estado");


    async function obtenerProductos() {
        try {
            const respuesta = await fetch("./data/productos.json");

            if (!respuesta.ok) {
                throw new Error("No se pudo obtener el catálogo de productos.");
            }

            productosDisponibles = await respuesta.json();

            renderizarCatalogo(productosDisponibles);
            poblarSelect(productosDisponibles);

            Toastify({
                text: "✅ Catálogo cargado con éxito",
                duration: 3000,
                gravity: "top",
                position: "right",
                style: {
                    background: "#2e7d32",
                }
            }).showToast();

        } catch (error) {
            console.error("Error al cargar productos:", error.message);
            contenedorProductos.innerHTML = `<p style="color: red;">❌ Error al cargar los productos. Intentá más tarde.</p>`;

            // Notificación de error con SweetAlert2
            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: "No se pudieron cargar los productos desde el servidor.",
                confirmButtonColor: "#d33"
            });
        }
    }


    function renderizarCatalogo(lista) {
        contenedorProductos.innerHTML = ""; 

        lista.forEach((p) => {
            const card = document.createElement("div");
            card.classList.add("tarjeta-producto");
            card.innerHTML = `
                <h4>${p.nombre}</h4>
                <p>Precio por gramo: <strong>$${p.precioPorGramo}</strong></p>
                <p>Stock disponible: ${p.stockGramos}g</p>
            `;
            contenedorProductos.appendChild(card);
        });
    }

    function poblarSelect(lista) {
        selectProducto.innerHTML = `<option value="">-- Seleccionar producto --</option>`;
        lista.forEach((p) => {
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = `${p.nombre} ($${p.precioPorGramo}/g)`;
            selectProducto.appendChild(option);
        });
    }

    obtenerProductos();

    formPedido.addEventListener("submit", (e) => {
        e.preventDefault();

        const idProducto = parseInt(selectProducto.value);
        const cantidad = parseFloat(document.getElementById("cantidad").value);

        try {
            if (!idProducto) {
                throw new Error("Por favor, seleccioná un producto.");
            }

            if (isNaN(cantidad) || cantidad <= 0) {
                throw new Error("Ingresá una cantidad válida en gramos (mayor a 0).");
            }

            const productoEncontrado = productosDisponibles.find((p) => p.id === idProducto);

            if (!productoEncontrado) {
                throw new Error("El producto seleccionado no existe.");
            }

            if (cantidad > productoEncontrado.stockGramos) {
                throw new Error(`Stock insuficiente. Solo quedan ${productoEncontrado.stockGramos}g.`);
            }

            const total = cantidad * productoEncontrado.precioPorGramo;

            Swal.fire({
                title: "¡Presupuesto Calculado!",
                html: `Vas a llevar <strong>${cantidad}g</strong> de <strong>${productoEncontrado.nombre}</strong>.<br><br>Total: <strong>$${total.toLocaleString("es-AR")}</strong>`,
                icon: "success",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#2e7d32"
            });

            mensajeEstado.innerHTML = `✅ Total calculado: $${total.toLocaleString("es-AR")}`;

        } catch (error) {
            Toastify({
                text: `⚠️ ${error.message}`,
                duration: 3500,
                gravity: "bottom",
                position: "center",
                style: {
                    background: "#c62828",
                }
            }).showToast();

            mensajeEstado.innerHTML = `⚠️ <span style="color: red;">${error.message}</span>`;
        } finally {
            console.log("Proceso de simulación finalizado.");
        }
    });
});