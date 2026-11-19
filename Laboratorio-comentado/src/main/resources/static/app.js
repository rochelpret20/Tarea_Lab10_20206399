// Estado del temporizador, identificadores y contadores guardados en el navegador.
let segundos = 0;
let burbujaId = 0;
let nemo = Number(localStorage.getItem('nemo') || 0);
let dory = Number(sessionStorage.getItem('dory') || 0);
const pecera = document.getElementById('pecera');

// Valida la dimensión y construye la cuadrícula y las zonas de los peces.
function crearPecera(x) {
  x = Number(x);
  if (!Number.isInteger(x) || x < 2 || x > 12) {
    alert('Ingresa un número entero entre 2 y 12');
    return;
  }

  pecera.replaceChildren();
  const cuadricula = document.createElement('div');
  cuadricula.className = 'cuadricula';
  cuadricula.style.gridTemplateColumns = `repeat(${x}, 1fr)`;
  cuadricula.style.gridTemplateRows = `repeat(${x}, 1fr)`;
  for (let i = 0; i < x * x; i++) {
    const celda = document.createElement('div');
    celda.className = 'celda';
    cuadricula.appendChild(celda);
  }
  pecera.appendChild(cuadricula);

  const burbujas = document.createElement('div');
  burbujas.className = 'burbujas';
  burbujas.id = 'burbujas';
  pecera.appendChild(burbujas);

  const peces = document.createElement('div');
  peces.className = 'peces';
  peces.innerHTML = `
    <div class="pez" id="zonaNemo" data-pez="Nemo">
      <div class="emoji">🐠</div>
      <strong>Nemo: <span id="nemo">${nemo}</span></strong>
      <button id="btnNemo">Contar Nemo</button>
      <div class="mensaje-zona" role="status" aria-live="polite"></div>
    </div>
    <div class="pez" id="zonaDory" data-pez="Dory">
      <div class="emoji">🐟</div>
      <strong>Dory: <span id="dory">${dory}</span></strong>
      <button id="btnDory">Contar Dory</button>
      <div class="mensaje-zona" role="status" aria-live="polite"></div>
    </div>`;
  pecera.appendChild(peces);
  document.getElementById('btnNemo').addEventListener('click', () => sumar('Nemo', 'boton'));
  document.getElementById('btnDory').addEventListener('click', () => sumar('Dory', 'boton'));

  // Permite soltar una burbuja y comprueba si corresponde al pez.
  for (const zona of peces.querySelectorAll('.pez')) {
    zona.addEventListener('dragover', (evento) => {
      evento.preventDefault();
      zona.classList.add('sobre');
    });
    zona.addEventListener('dragleave', () => zona.classList.remove('sobre'));
    zona.addEventListener('drop', (evento) => {
      evento.preventDefault();
      zona.classList.remove('sobre');
      const id = evento.dataTransfer.getData('text/plain');
      const burbuja = document.getElementById(id);
      if (!burbuja || !burbuja.classList.contains('burbuja')) return;

      if (burbuja.dataset.pez === zona.dataset.pez) {
        mostrarMensaje(zona, `¡Correcto! Burbuja de ${zona.dataset.pez}.`, true);
        sumar(zona.dataset.pez, 'burbuja');
        burbuja.remove();
      } else {
        mostrarMensaje(zona, `Incorrecto. Esta burbuja es de ${burbuja.dataset.pez}.`, false);
      }
    });
  }
}

// Muestra un aviso temporal de acierto o error en la zona elegida.
function mostrarMensaje(zona, texto, correcto) {
  const mensaje = zona.querySelector('.mensaje-zona');
  clearTimeout(mensaje.temporizador);
  mensaje.textContent = texto;
  mensaje.className = `mensaje-zona visible ${correcto ? 'correcto' : 'incorrecto'}`;
  mensaje.temporizador = setTimeout(() => {
    mensaje.textContent = '';
    mensaje.className = 'mensaje-zona';
  }, 3000);
}

// Actualiza el contador local y envía el evento a la API para guardarlo.
async function sumar(pez, tipo) {
  if (pez === 'Nemo') {
    nemo++;
    localStorage.setItem('nemo', String(nemo));
  } else {
    dory++;
    sessionStorage.setItem('dory', String(dory));
  }
  document.getElementById(pez.toLowerCase()).textContent = pez === 'Nemo' ? nemo : dory;
  try {
    const respuesta = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pez, tipo })
    });
    if (!respuesta.ok) throw new Error('No se pudo guardar');
    document.getElementById('estado').textContent = 'Evento guardado en MySQL';
  } catch (error) {
    document.getElementById('estado').textContent = 'Contador actualizado; error al guardar en MySQL';
  }
}

// Crea una burbuja arrastrable para un pez aleatorio y limita su cantidad.
function generarBurbuja() {
  const pez = Math.random() < 0.5 ? 'Nemo' : 'Dory';
  const burbuja = document.createElement('div');
  burbuja.id = 'burbuja-' + (++burbujaId);
  burbuja.className = 'burbuja ' + (pez === 'Nemo' ? 'naranja' : 'azul');
  burbuja.textContent = pez === 'Nemo' ? 'N' : 'D';
  burbuja.dataset.pez = pez;
  burbuja.draggable = true;
  burbuja.addEventListener('dragstart', (evento) => {
    evento.dataTransfer.setData('text/plain', burbuja.id);
  });
  const contenedor = document.getElementById('burbujas');
  contenedor.appendChild(burbuja);
  while (contenedor.children.length > 10) contenedor.firstElementChild.remove();
}

// Cambia gradualmente el color del agua durante 60 segundos.
setInterval(() => {
  segundos++;
  const avance = Math.min(segundos / 60, 1);
  const inicio = [166, 220, 238];
  const fin = [112, 211, 156];
  const rgb = inicio.map((valor, i) => Math.round(valor + (fin[i] - valor) * avance));
  pecera.style.setProperty('--agua', `rgb(${rgb.join(',')})`);
}, 1000);
// Genera una nueva burbuja cada dos segundos.
setInterval(generarBurbuja, 2000);

// Consulta la API y muestra los eventos guardados o un mensaje de error.
async function cargarHistorial() {
  const destino = document.getElementById('historial');
  try {
    const respuesta = await fetch('/api/eventos');
    if (!respuesta.ok) throw new Error();
    const eventos = await respuesta.json();
    destino.replaceChildren();
    if (!eventos.length) {
      destino.textContent = 'Todavía no hay eventos';
      return;
    }
    for (const evento of eventos) {
      const fila = document.createElement('p');
      fila.textContent = `#${evento.id} | ${evento.pez} | ${evento.tipo} | ${evento.fecha}`;
      destino.appendChild(fila);
    }
  } catch (error) {
    destino.textContent = 'No se pudo consultar el historial';
  }
}

// Conecta los controles de la página con sus acciones.
document.getElementById('crear').addEventListener('click', () => {
  crearPecera(document.getElementById('dimension').value);
});
document.getElementById('reiniciar').addEventListener('click', () => {
  nemo = 0;
  dory = 0;
  localStorage.setItem('nemo', '0');
  sessionStorage.setItem('dory', '0');
  crearPecera(document.getElementById('dimension').value);
});
document.getElementById('actualizar').addEventListener('click', cargarHistorial);
// Sincroniza el contador de Nemo cuando cambia en otra pestaña del mismo origen.
window.addEventListener('storage', (evento) => {
  if (evento.key === 'nemo') {
    nemo = Number(evento.newValue || 0);
    const contador = document.getElementById('nemo');
    if (contador) contador.textContent = nemo;
  }
});
// Construye la vista inicial y solicita el historial.
crearPecera(6);
cargarHistorial();
