import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

app.use(express.json());
app.use(express.static("public"));

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    console.log("📩 Prompt recibido:", prompt);

    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }
        })
      }
    );

    console.log("📡 HF status:", response.status);
    console.log("📦 HF content-type:", response.headers.get("content-type"));

    const contentType = response.headers.get("content-type");

    // ❌ HF no devolvió imagen
    if (!contentType || !contentType.startsWith("image/")) {
      const text = await response.text();
      console.error("❌ HF RESPUESTA:", text);
      return res.status(500).json({
        error: "HF no devolvió imagen",
        detalle: text
      });
    }

    // ✅ HF devolvió imagen
    const buffer = Buffer.from(await response.arrayBuffer());

    res.json({
      image: `data:image/png;base64,${buffer.toString("base64")}`
    });

  } catch (err) {
    console.error("🔥 ERROR BACKEND:", err);
    res.status(500).json({ error: "Error interno backend" });
  }
});

app.listen(PORT, () => {
  console.log("🧠 AI Image Generator is running!");
});
