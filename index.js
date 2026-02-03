import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;
const HF_TOKEN = process.env.HF;

app.use(express.json());

/* ========= FRONTEND ========= */
app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>🎨 Generador de Imágenes IA</title>

  <style>
    body {
      background: linear-gradient(135deg, #667eea, #764ba2);
      font-family: Arial, sans-serif;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }

    .card {
      background: rgba(0,0,0,0.35);
      padding: 25px;
      border-radius: 16px;
      width: 380px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    textarea {
      width: 100%;
      height: 90px;
      border-radius: 8px;
      border: none;
      padding: 10px;
      font-size: 14px;
      resize: none;
    }

    button {
      margin-top: 12px;
      width: 100%;
      padding: 10px;
      font-size: 16px;
      border: none;
      border-radius: 8px;
      background: #00d2ff;
      cursor: pointer;
    }

    button:hover {
      background: #00b4e0;
    }

    img {
      margin-top: 15px;
      max-width: 100%;
      border-radius: 12px;
      display: none;
    }

    .error {
      color: #ffb3b3;
      margin-top: 10px;
    }
  </style>
</head>

<body>
  <div class="card">
    <h2>🎨 Generador de Imágenes IA</h2>

    <textarea id="prompt" placeholder="Un dragón amigable estilo caricatura, colores suaves, para niños"></textarea>
    <button onclick="generar()">Generar imagen</button>

    <div id="error" class="error"></div>
    <img id="resultado" />
  </div>

  <script>
    async function generar() {
      const prompt = document.getElementById("prompt").value;
      const img = document.getElementById("resultado");
      const error = document.getElementById("error");

      error.textContent = "";
      img.style.display = "none";

      try {
        const res = await fetch("/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });

        const data = await res.json();

        if (!res.ok) {
          error.textContent = "⚠️ " + (data.detalle || data.error);
          return;
        }

        img.src = data.image;
        img.style.display = "block";

      } catch (e) {
        error.textContent = "❌ Error de conexión";
      }
    }
  </script>
</body>
</html>`);
});

/* ========= BACKEND HF ========= */
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + HF_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          options: { wait_for_model: true }
        })
      }
    );

    const contentType = hfRes.headers.get("content-type");

    if (!contentType || !contentType.startsWith("image/")) {
      const text = await hfRes.text();
      return res.status(500).json({
        error: "HF no devolvió imagen",
        detalle: text
      });
    }

    const buffer = Buffer.from(await hfRes.arrayBuffer());

    res.json({
      image: "data:image/png;base64," + buffer.toString("base64")
    });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    res.status(500).json({ error: "Error interno backend" });
  }
});

app.listen(PORT, () => {
  console.log("🧠 AI Image Generator is running!");
});
