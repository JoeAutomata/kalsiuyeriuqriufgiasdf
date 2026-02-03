import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

if (!HF_TOKEN) {
  console.error("❌ ERROR: Falta la variable de entorno HF");
}

app.use(express.json());
app.use(express.static("public"));

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt vacío" });
    }

    console.log("🧠 Prompt recibido:", prompt);

    const hfResponse = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + HF_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          options: {
            wait_for_model: true
          }
        })
      }
    );

    console.log("📡 HF status:", hfResponse.status);

    const contentType = hfResponse.headers.get("content-type");

    // ❌ HF no devolvió imagen
    if (!contentType || !contentType.startsWith("image/")) {
      const errorText = await hfResponse.text();
      console.error("❌ Respuesta HF:", errorText);
      return res.status(500).json({
        error: "HF no devolvió una imagen",
        detalle: errorText
      });
    }

    // ✅ Imagen OK
    const buffer = Buffer.from(await hfResponse.arrayBuffer());

    res.json({
      image: "data:image/png;base64," + buffer.toString("base64")
    });

  } catch (err) {
    console.error("🔥 ERROR BACKEND:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log("🧠 AI Image Generator is running!");
});
