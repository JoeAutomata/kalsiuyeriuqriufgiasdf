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
// GENERAR IMAGEN
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
        timeout: 120000 // ⏳ importante en Render
      }
    );

    const imageBase64 = Buffer.from(response.data).toString("base64");

    res.json({ image: imageBase64 });

  } catch (error) {
    console.error("❌ Error HF:", error.response?.data || error.message);
    res.status(500).json({ error: "No se pudo generar la imagen" });
  }
});

// ─────────────────────────────
app.listen(PORT, () =>
  console.log(`🚀 AI Image Generator running on port ${PORT}`)
);
