// Las claves identifican los datos de este ejercicio en el navegador.
const CLAVE_TOTAL = 'lectura.total';
const CLAVE_SESION = 'lectura.sesion';
const totalElemento = document.getElementById('total');
const sesionElemento = document.getElementById('sesion');
const estado = document.getElementById('estado');
const formulario = document.getElementById('formulario');

// Lee un contador guardado o devuelve cero si todavía no existe.
function leerContador(almacenamiento, clave) {
  return Number(almacenamiento.getItem(clave) || 0);
}

// Actualiza los valores visibles desde los dos almacenamientos.
function mostrarContadores() {
  totalElemento.textContent = leerContador(localStorage, CLAVE_TOTAL);
  sesionElemento.textContent = leerContador(sessionStorage, CLAVE_SESION);
}

// Obtiene los últimos eventos de MySQL a través de la API.
async function cargarHistorial() {
  const lista = document.getElementById('historial');
  try {
    const respuesta = await fetch('/api/eventos');
    if (!respuesta.ok) throw new Error('Error al consultar');
    const eventos = await respuesta.json();
    lista.replaceChildren();
    if (eventos.length === 0) {
      const elemento = document.createElement('li');
      elemento.textContent = 'Todavía no hay registros.';
      lista.appendChild(elemento);
    }
    for (const evento of eventos) {
      const elemento = document.createElement('li');
      elemento.textContent = `#${evento.id} — ${evento.titulo} — ${evento.fecha}`;
      lista.appendChild(elemento);
    }
  } catch (error) {
    lista.textContent = 'No se pudo consultar la base de datos.';
  }
}

// Primero guarda el evento en el servidor; si funciona, incrementa ambos contadores.
formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const campo = document.getElementById('titulo');
  const titulo = campo.value.trim();
  if (!titulo) {
    estado.textContent = 'Escribe un título.';
    return;
  }
  const boton = formulario.querySelector('button');
  boton.disabled = true;
  try {
    const respuesta = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo })
    });
    if (!respuesta.ok) throw new Error('Error al guardar');
    localStorage.setItem(CLAVE_TOTAL, String(leerContador(localStorage, CLAVE_TOTAL) + 1));
    sessionStorage.setItem(CLAVE_SESION, String(leerContador(sessionStorage, CLAVE_SESION) + 1));
    mostrarContadores();
    campo.value = '';
    estado.textContent = 'Lectura registrada correctamente.';
    await cargarHistorial();
  } catch (error) {
    estado.textContent = 'No se pudo completar el registro. Revisa la conexión y vuelve a cargar el historial antes de reintentar.';
  } finally {
    boton.disabled = false;
  }
});

// Reinicia solo los datos del navegador; no elimina registros de MySQL.
document.getElementById('reiniciar').addEventListener('click', () => {
  localStorage.setItem(CLAVE_TOTAL, '0');
  sessionStorage.setItem(CLAVE_SESION, '0');
  mostrarContadores();
  estado.textContent = 'Contadores del navegador reiniciados.';
});

document.getElementById('actualizar').addEventListener('click', cargarHistorial);

// Refleja en esta pestaña los cambios de localStorage hechos en otra pestaña.
window.addEventListener('storage', (evento) => {
  if (evento.key === CLAVE_TOTAL) mostrarContadores();
});

mostrarContadores();
cargarHistorial();
