import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

// fixes para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middlewares
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// health check
app.get("/", (req, res) => {
  res.send("Backend Mascota IA funcionando OK 🚀");
});

// generar imagen
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt vacío" });
    }

    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
          Accept: "image/png"
        },
        body: JSON.stringify({
          inputs: prompt
        })
      }
    );

    if (!hfResponse.ok) {
      const text = await hfResponse.text();
      return res.status(500).json({
        error: "HF no devolvió una imagen",
        detail: text
      });
    }

    const buffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString("base64");

    res.json({
      image: `data:image/png;base64,${base64Image}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// start
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
