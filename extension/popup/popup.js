const API_BASE = "http://localhost:8000";

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const input = document.getElementById("input").value.trim();
  const status = document.getElementById("status");
  const btn = document.getElementById("analyzeBtn");

  if (!input || input.length < 10) {
    status.textContent = "Please enter at least 10 characters.";
    return;
  }

  btn.disabled = true;
  status.textContent = "🪲 Rolling the ball... analyzing...";

  try {
    const resp = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input }),
    });

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    const resultUrl = `http://localhost:3000/r/${data.content_hash}`;
    status.innerHTML = `
      <div style="text-align:left; margin-top:8px;">
        <div>📡 Signal: <strong>${data.signal.score}/10</strong> — ${data.signal.reason}</div>
        <div>✨ Novelty: <strong>${data.novelty.score}/10</strong> — ${data.novelty.reason}</div>
        <div>💩 Slop: <strong>${data.slop.score}/10</strong> — ${data.slop.reason}</div>
        <div style="margin-top:8px;">
          <a href="${resultUrl}" target="_blank" style="color:#7856ff;">View full report →</a>
        </div>
      </div>
    `;
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
  } finally {
    btn.disabled = false;
  }
});
