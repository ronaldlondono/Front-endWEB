const API_BASE = 'https://webservice-ayaj.onrender.com';
const API_URL  = `${API_BASE}/libros`; 

// Elementos DOM
const libroForm = document.getElementById('libroForm');
const tablaLibros = document.getElementById('tablaLibros');
const cargando = document.getElementById('cargando');
const sinLibros = document.getElementById('sinLibros');
const btnRecargar = document.getElementById('btnRecargar');
const editarModal = new bootstrap.Modal('#editarModal');
const btnGuardarCambios = document.getElementById('btnGuardarCambios');

// Eventos
document.addEventListener('DOMContentLoaded', cargarLibros);
libroForm.addEventListener('submit', agregarLibro);
btnRecargar.addEventListener('click', cargarLibros);
btnGuardarCambios.addEventListener('click', actualizarLibro);

// Cargar libros desde la API
async function cargarLibros() {
    mostrarCargando(true);
    try {
        console.log("Intentando cargar libros desde:", API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            console.error("Respuesta no OK:", response.status, response.statusText);
            throw new Error('Error al cargar libros');
        }
        
        const libros = await response.json();
        console.log("Libros recibidos:", libros);
        mostrarLibros(libros);
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al cargar los libros. Intenta recargar la página.');
    } finally {
        mostrarCargando(false);
    }
}

// Mostrar libros en la tabla
function mostrarLibros(libros) {
    if (libros.length === 0) {
        sinLibros.classList.remove('d-none');
        tablaLibros.innerHTML = '';
        return;
    }
    
    sinLibros.classList.add('d-none');
    tablaLibros.innerHTML = '';
    
    libros.forEach(libro => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${libro.titulo}</td>
            <td>${libro.autor}</td>
            <td>${libro.año_publicacion}</td>
            <td>${libro.genero}</td>
            <td>
                <span class="badge ${libro.prestado ? 'bg-danger' : 'bg-success'}">
                    ${libro.prestado ? 'Prestado' : 'Disponible'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning btn-action" onclick="abrirModalEditar(${libro.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger btn-action" onclick="eliminarLibro(${libro.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tablaLibros.appendChild(fila);
    });
}

// Agregar nuevo libro
async function agregarLibro(e) {
    e.preventDefault();
    
    const nuevoLibro = {
        titulo: document.getElementById('titulo').value,
        autor: document.getElementById('autor').value,
        año_publicacion: parseInt(document.getElementById('año').value),
        genero: document.getElementById('genero').value,
        prestado: document.getElementById('estado').value === 'true'
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoLibro)
        });
        
        if (!response.ok) throw new Error('Error al agregar libro');
        
        cargarLibros();
        libroForm.reset();
        mostrarExito('Libro agregado correctamente');
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al agregar el libro. Verifica los datos.');
    }
}

// Abrir modal para editar
async function abrirModalEditar(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al cargar libro');
        }
        
        const libro = await response.json();
        
        document.getElementById('editarId').value = libro.id;
        document.getElementById('editarTitulo').value = libro.titulo;
        document.getElementById('editarAutor').value = libro.autor;
        document.getElementById('editarAño').value = libro.año_publicacion;
        document.getElementById('editarGenero').value = libro.genero;
        document.getElementById('editarEstado').value = libro.prestado ? 'true' : 'false';
        
        editarModal.show();
    } catch (error) {
        console.error('Error:', error);
        mostrarError(`Error al cargar libro: ${error.message}`);
    }
}

// Actualizar libro
async function actualizarLibro() {
    const id = document.getElementById('editarId').value;
    const libroActualizado = {
        titulo: document.getElementById('editarTitulo').value,
        autor: document.getElementById('editarAutor').value,
        año_publicacion: parseInt(document.getElementById('editarAño').value), // Convertir a número
        genero: document.getElementById('editarGenero').value,
        prestado: document.getElementById('editarEstado').value === 'true'
    };
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(libroActualizado)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar libro');
        }
        
        editarModal.hide();
        cargarLibros();
        mostrarExito('Libro actualizado correctamente');
    } catch (error) {
        console.error('Error:', error);
        mostrarError(`Error al actualizar libro: ${error.message}`);
    }
}

// Eliminar libro
async function eliminarLibro(id) {
    if (!confirm('¿Estás seguro de eliminar este libro? Esta acción no se puede deshacer.')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE' 
        });
        
        if (!response.ok) throw new Error('Error al eliminar libro');
        
        cargarLibros();
        mostrarExito('Libro eliminado correctamente');
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error al eliminar el libro');
    }
}

// Funciones auxiliares
function mostrarCargando(mostrar) {
    cargando.style.display = mostrar ? 'block' : 'none';
}

function mostrarError(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-danger position-fixed top-0 end-0 m-3';
    alerta.style.zIndex = '1050';
    alerta.textContent = mensaje;
    
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

function mostrarExito(mensaje) {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success position-fixed top-0 end-0 m-3';
    alerta.style.zIndex = '1050';
    alerta.textContent = mensaje;
    
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 3000);
}

// Hacer funciones disponibles globalmente
window.abrirModalEditar = abrirModalEditar;
window.eliminarLibro = eliminarLibro;