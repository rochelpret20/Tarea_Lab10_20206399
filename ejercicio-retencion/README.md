# Ejercicio resuelto: registro de lectura

## Enunciado

Crea una página para registrar libros leídos. Debe mostrar un contador que se conserve al cerrar y volver a abrir el navegador usando `localStorage`, y otro que se conserve al recargar la misma pestaña usando `sessionStorage`. Al registrar una lectura, guarda también el título y la fecha en MySQL mediante una API Java. Muestra los últimos registros y permite reiniciar los contadores del navegador sin borrar el historial SQL.

## Solución incluida

- `src/main/resources/static/app.js`: lectura, escritura y sincronización de los contadores, y llamadas a la API.
- `src/main/resources/static/index.html` y `style.css`: interfaz.
- `src/main/java/com/ejercicio/lectura/`: aplicación Java 17, controlador, modelo y repositorio.
- `base_datos.sql`: creación de la base de datos y de la tabla.
- `pom.xml`: dependencias de Spring Web, JDBC y MySQL.

Los contadores viven en el navegador y el historial vive en MySQL: son datos independientes. Una vez que la API responde correctamente, los contadores se actualizan en la pestaña que hizo el registro. Los registros hechos desde otro navegador no cambian esos contadores locales. En caso de un fallo de comunicación, revisa el historial antes de reintentar: el servidor podría haber guardado el evento aunque la respuesta no haya llegado.

## Requisitos

Java 17, Maven, MySQL 8 y un navegador moderno. El servidor usa el puerto 8080 y MySQL el 3306.

## Pasos para ejecutar

1. Inicia MySQL. Abre `base_datos.sql` en MySQL Workbench y ejecuta todo el contenido con el botón del rayo. También puedes usar `mysql -u root -p < base_datos.sql` desde esta carpeta.
2. El proyecto usa por defecto el usuario `root`. En la terminal configura tu contraseña antes de arrancar. En macOS o Linux:

   ```bash
   export DB_PASSWORD='tu_contraseña'
   ```

   En PowerShell:

   ```powershell
   $env:DB_PASSWORD='tu_contraseña'
   ```

   Si usas otro usuario, configura también `DB_USER` de la misma forma. Para cambiar puerto o servidor de MySQL, edita `src/main/resources/application.properties`.
3. En la carpeta que contiene `pom.xml`, ejecuta:

   ```bash
   mvn spring-boot:run
   ```

4. Abre <http://localhost:8080>.

## Cómo comprobar la retención

1. Registra una lectura y recarga la página: ambos contadores se mantienen.
2. Abre una pestaña nueva manualmente e introduce la misma URL: verás el total compartido y la sesión nueva en cero. Si duplicas una pestaña, el navegador puede copiar inicialmente su sessionStorage; por eso se recomienda abrirla manualmente.
3. Cierra la pestaña y abre otra: el total persiste y el contador de la nueva sesión comienza en cero. Ambos dependen del mismo origen (protocolo, host y puerto).
4. Pulsa «Reiniciar contadores del navegador»: el historial SQL permanece. Para consultarlo en Workbench ejecuta:

   ```sql
   USE lectura_lab;
   SELECT * FROM eventos_lectura ORDER BY id DESC;
   ```

El evento `storage` actualiza el total en otras pestañas del mismo origen. La actualización simultánea desde varias pestañas no es atómica, así que el contador es una demostración local y no un total global de la base de datos.
