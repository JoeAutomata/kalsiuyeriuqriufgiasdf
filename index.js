import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static("public")); // 👈 CLAVE PARA CSS/JS

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt vacío" });
    }

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
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

    const contentType = hfResponse.headers.get("content-type");

    // ⚠️ HF suele devolver JSON si hay error
    if (!contentType || !contentType.startsWith("image/")) {
      const errorText = await hfResponse.text();
      console.error("HF ERROR:", errorText);
      return res.status(500).json({
        error: "Hugging Face no devolvió una imagen"
      });
    }

    const buffer = Buffer.from(await hfResponse.arrayBuffer());
    const base64Image = buffer.toString("base64");

    res.json({
      image: `data:image/png;base64,${base64Image}`
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 AI Image Generator running on port ${PORT}`);
});
