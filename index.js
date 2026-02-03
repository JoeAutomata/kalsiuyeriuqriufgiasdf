import express from "express";
import axios from "axios";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

// ─────────────────────────────
// HOME
// ─────────────────────────────
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// ─────────────────────────────
// GENERAR IMAGEN (HUGGING FACE)
// ─────────────────────────────
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.length < 3) {
      return res.status(400).json({ error: "Prompt inválido" });
    }

    console.log("🎨 Prompt:", prompt);

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer",
        timeout: 120000,
        validateStatus: () => true // ← permite leer JSON de error
      }
    );

    const contentType = response.headers["content-type"];

    // ────────────────
    // HF devuelve JSON (modelo cargando, rate limit, etc)
    // ────────────────
    if (contentType && contentType.includes("application/json")) {
      const text = response.data.toString("utf8");
      console.warn("⚠️ HF JSON:", text);

      return res.json({
        error: "El modelo se está iniciando ⏳ esperá unos segundos y reintentá"
      });
    }

    // ────────────────
    // HF devuelve imagen
    // ────────────────
    if (contentType && contentType.includes("image")) {
      const imageBase64 = Buffer.from(response.data).toString("base64");
      return res.json({ image: imageBase64 });
    }

    // ────────────────
    // Respuesta inesperada
    // ────────────────
    return res.json({
      error: "Respuesta inesperada del modelo"
    });

  } catch (error) {
    console.error("❌ Error HF:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ─────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 AI Image Generator running on port ${PORT}`);
});
