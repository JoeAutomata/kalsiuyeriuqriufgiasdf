import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🧠 AI Image Generator is running!");
});

// Endpoint para generar imagen
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).send({ error: "Prompt necesario" });
    }

    // Ejemplo de llamada a la API de imagen de Google
    const url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3:generateImage"; // cambia si el modelo es otro
    const payload = {
      prompt: prompt,
      // Puedes añadir tamaño u otras opciones según API
      size: "1024x1024"
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY
      }
    });

    // Si la API devuelve la imagen en base64:
    const imageBase64 = response.data.data?.[0]?.b64_json;
    if (imageBase64) {
      res.send({ image_base64: imageBase64 });
    } else {
      res.send({ data: response.data });
    }

  } catch (error) {
    console.error("Error generando imagen:", error.response?.data || error.message);
    res.status(500).send({ error: error.response?.data || "Error interno" });
  }
});

app.listen(PORT, () => console.log(`Server en puerto ${PORT}`));
