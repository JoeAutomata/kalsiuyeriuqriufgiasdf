async function generar() {
  const prompt = document.getElementById("prompt").value;
  const estado = document.getElementById("estado");
  const img = document.getElementById("imagen");

  estado.innerText = "🧠 Creando...";
  img.src = "";

  const res = await fetch("/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: prompt + ", cute kawaii monster, simple shapes, white background"
    })
  });

  const data = await res.json();

  if (data.image) {
    img.src = data.image;
    estado.innerText = "✨ ¡Tu deMonIA nació!";
  } else {
    estado.innerText = "⚠️ No se pudo generar imagen";
  }
}
