// Cargar JSON de tableros
fetch("./data/tableros_completo.json")
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("grid-container");
    data.datos.forEach((tablero) => {
      const card = document.createElement("div");
      card.className = "qr-card";

      // Insertar QR como imagen (puede ser SVG o PNG)
      const qrImg = document.createElement("img");
      qrImg.src = tablero.qr;
      qrImg.alt = tablero["id del tablero"];
      card.appendChild(qrImg);

      // Nombre + icono
      const nameDiv = document.createElement("div");
      nameDiv.className = "qr-name";

      // Reemplazamos solo el primer ":" por ":\n"
      const idConSalto = tablero["id del tablero"].replace(":", ":\n");

      nameDiv.innerHTML = `<img src="./assets/icons/logo-cosaca.png" alt="Icono Cosaca">${idConSalto}`;
      card.appendChild(nameDiv);

      container.appendChild(card);
    });
  })
  .catch((err) => console.error("Error cargando tableros:", err));
