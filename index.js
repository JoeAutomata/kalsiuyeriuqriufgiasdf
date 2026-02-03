import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

/* ===============================
   CONFIGURACIÓN GENERAL
================================ */
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const PORT = process.env.PORT || 3000;

/* ===============================
   RUTA DE PRUEBA (IMPORTANTE)
   Sirve para chequear que Render
   esté levantando bien el servicio
================================ */
app.get("/", (req, res) => {
  res.send("Backend Mascota IA funcionando OK 🚀");
});

/* ===============================
   GENERAR IMAGEN CON HF
================================ */
app.post("/generar", async (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre || !descripcion) {
    return res.status(400).json({
      error: "Faltan datos (nombre o descripción)"
    });
  }

  const prompt = `
Mascota virtual infantil.
Nombre: ${nombre}.
Descripción: ${descripcion}.
Estilo cartoon, amigable, colores suaves.
Ojos grandes, simétricos y bien separados.
Boca centrada y clara.
Ilustración limpia, fondo simple.
Alta calidad, sin texto, sin marcas.
`;

  try {
    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error("HF ERROR:", errorText);
      return res.status(500).json({
        error: "Error en HuggingFace"
      });
    }

    const buffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    res.json({
      image: `data:image/png;base64,${base64Image}`
    });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({
      error: "Error interno del servidor"
    });
  }
});

/* ===============================
   INICIAR SERVIDOR
================================ */
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
