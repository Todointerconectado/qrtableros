(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  let sedeActual = window.__SEDE__ || urlParams.get("sede");

  const RUTA_JSON = "./data/tableros_completo.json"; // Ruta desde sede.html
  const STORAGE_KEY = "tablerosDatos";
  const STORAGE_HASH_KEY = "tablerosDatosHash";

  const procesarDatos = (datos) => {
    // Si no hay sedeActual, tomar la sede del primer registro válido
    if (!sedeActual) {
      const primerRegistro = datos.find(item => item["id del tablero"]);
      sedeActual = primerRegistro ? primerRegistro.sede : null;

      if (!sedeActual) {
        console.warn("No hay sede disponible en el JSON");
        return;
      }
    }

    const normalizar = s => s.toLowerCase().replace(/\s+/g, "-").trim();
    const registro = datos.find(item => normalizar(item.sede) === normalizar(sedeActual));

    if (!registro) {
      console.warn("No se encontró tablero para esta sede:", sedeActual);
      return;
    }

    const baseText = "www.cosaca.com.ar/relevamiento-tablero-eléctrico";
    const nuevoContenido = `${baseText} | ${registro["id del tablero"]}`;

    // Actualizar og:description
    let ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    if (ogDescription) {
      ogDescription.setAttribute("content", nuevoContenido);
    } else {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      ogDescription.setAttribute("content", nuevoContenido);
      document.head.appendChild(ogDescription);
    }

    // Actualizar twitter:description
    let twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
    );
    if (twitterDescription) {
      twitterDescription.setAttribute("content", nuevoContenido);
    } else {
      twitterDescription = document.createElement("meta");
      twitterDescription.setAttribute("name", "twitter:description");
      twitterDescription.setAttribute("content", nuevoContenido);
      document.head.appendChild(twitterDescription);
    }

    // Actualizar <title>
    document.title = `Sede: ${registro["id del tablero"]}`;

    console.log("Meta descriptions y título actualizados:", nuevoContenido);
  };

  const calcularHash = async (texto) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const cargarJSON = async () => {
    try {
      const response = await fetch(RUTA_JSON);
      const textoJSON = await response.text();
      const hashActual = await calcularHash(textoJSON);
      const datos = JSON.parse(textoJSON).datos;

      const hashGuardado = localStorage.getItem(STORAGE_HASH_KEY);

      if (hashGuardado !== hashActual) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
        localStorage.setItem(STORAGE_HASH_KEY, hashActual);
      }

      procesarDatos(datos);
    } catch (error) {
      console.error("Error cargando tableros_completo.json:", error);
    }
  };

  const datosGuardados = localStorage.getItem(STORAGE_KEY);

  if (!datosGuardados) {
    await cargarJSON();
  } else {
    try {
      const response = await fetch(RUTA_JSON);
      const textoJSON = await response.text();
      const hashActual = await calcularHash(textoJSON);
      const hashGuardado = localStorage.getItem(STORAGE_HASH_KEY);

      if (hashGuardado !== hashActual) {
        await cargarJSON();
      } else {
        procesarDatos(JSON.parse(datosGuardados));
      }
    } catch (error) {
      console.error("Error cargando tableros_completo.json:", error);
    }
  }
})();
