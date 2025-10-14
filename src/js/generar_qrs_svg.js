/* Objetivo:
- Leer tableros_completo.json.
- Detectar todas las sedes y sus QR existentes.
- Generar SVG solo para las sedes nuevas (que no tengan QR).
- Guardar los SVG en assets/images/qrs_svg/.
- Actualizar el JSON con la ruta relativa del QR (../assets/images/qrs_svg/<SEDE>.svg).
- Los QR apuntan a la página de la sede, no al tablero.
*/

import fs from "fs";
import path from "path";
import QRCode from "qrcode";

// 🔗 URL base del sitio donde están las páginas de sedes
const BASE_URL = "https://todointerconectado.com/qrtableros/";

// 📂 Rutas
const jsonPath = path.resolve("./data/tableros_completo.json");
const qrFolder = path.resolve("assets/images/qrs_svg");

// Crear carpeta si no existe
if (!fs.existsSync(qrFolder)) {
  fs.mkdirSync(qrFolder, { recursive: true });
}

// Leer JSON
const rawData = fs.readFileSync(jsonPath, "utf-8");
const data = JSON.parse(rawData);

(async () => {
  // Mapear sedes ya generadas
  const sedesGeneradas = new Set();
  for (const item of data.datos) {
    if (item.qr && item.qr.trim() !== "") {
      const sedeName = path.basename(item.qr, ".svg").toLowerCase();
      sedesGeneradas.add(sedeName);
    }
  }

  // Generar QR solo para sedes nuevas
  for (const item of data.datos) {
    const sede = item.sede.toUpperCase();
    const qrFileName = `${sede}.svg`;
    const qrFilePath = path.join(qrFolder, qrFileName);
    const sedeURL = `${BASE_URL}${encodeURIComponent(sede)}`;

    if (!sedesGeneradas.has(sede)) {
      await QRCode.toFile(qrFilePath, sedeURL, { type: "svg" });

      item.qr = `../assets/images/qrs_svg/${qrFileName}`;
      sedesGeneradas.add(sede);

      console.log(`QR generado para sede: ${sede} → ${sedeURL}`);
    } else {
      // Mantener ruta si ya existe
      if (!item.qr || item.qr.trim() === "") {
        item.qr = `../assets/images/qrs_svg/${qrFileName}`;
      }
    }
  }

  // Guardar JSON actualizado
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  console.log("✅ QR generados y JSON actualizado.");
})();

