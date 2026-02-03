async function generateImage() {
  const prompt = document.getElementById("prompt").value;
  const status = document.getElementById("status");
  const img = document.getElementById("result");

  if (!prompt) {
    alert("Escribí un prompt 😉");
    return;
  }

  status.innerText = "🧠 Generando imagen...";
  img.style.display = "none";

  try {
    const res = await fetch("/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    if (data.image) {
      img.src = "data:image/png;base64," + data.image;
      img.style.display = "block";
      status.innerText = "✅ Imagen generada";
    } else {
      status.innerText = "⚠️ No se pudo generar imagen";
    }

  } catch (e) {
    status.innerText = "❌ Error";
  }
}
