(() => {
  const PROCESSED = new WeakSet();
  const BUTTON_CLASS = "slop-radar-btn";
  const API_BASE = "http://localhost:8000";

  function trackEvent(event, contentHash, meta) {
    fetch(`${API_BASE}/api/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, content_hash: contentHash, source: "extension", meta }),
    }).catch(() => {});
  }

  function getTweetText(article) {
    const textEl = article.querySelector('[data-testid="tweetText"]');
    return textEl ? textEl.innerText.trim() : "";
  }

  function getTweetUrl(article) {
    const timeLink = article.querySelector("a time")?.parentElement;
    return timeLink ? timeLink.href : window.location.href;
  }

  function createBeetleButton() {
    const btn = document.createElement("button");
    btn.className = BUTTON_CLASS;
    btn.innerHTML = `<span class="slop-beetle-icon">🪲</span>`;
    btn.title = "AI Slop Radar — Check this post";
    return btn;
  }

  function createResultCard(data) {
    const card = document.createElement("div");
    card.className = "slop-radar-card";

    const signalColor = data.signal.score >= 7 ? "#4ade80" : data.signal.score >= 4 ? "#facc15" : "#f87171";
    const noveltyColor = data.novelty.score >= 7 ? "#4ade80" : data.novelty.score >= 4 ? "#facc15" : "#f87171";
    const slopColor = data.slop.score <= 3 ? "#4ade80" : data.slop.score <= 6 ? "#facc15" : "#f87171";

    card.innerHTML = `
      <div class="slop-card-header">
        <span class="slop-beetle-hero">🪲</span>
        <span class="slop-card-title">Slop Radar</span>
        <button class="slop-card-close">&times;</button>
      </div>
      <div class="slop-card-summary">${escapeHtml(data.summary)}</div>
      <div class="slop-scores">
        <div class="slop-score-item">
          <div class="slop-score-bar" style="--score-pct: ${data.signal.score * 10}%; --bar-color: ${signalColor}"></div>
          <div class="slop-score-label">Signal <strong>${data.signal.score}/10</strong></div>
          <div class="slop-score-reason">${escapeHtml(data.signal.reason)}</div>
        </div>
        <div class="slop-score-item">
          <div class="slop-score-bar" style="--score-pct: ${data.novelty.score * 10}%; --bar-color: ${noveltyColor}"></div>
          <div class="slop-score-label">Novelty <strong>${data.novelty.score}/10</strong></div>
          <div class="slop-score-reason">${escapeHtml(data.novelty.reason)}</div>
        </div>
        <div class="slop-score-item">
          <div class="slop-score-bar" style="--score-pct: ${data.slop.score * 10}%; --bar-color: ${slopColor}"></div>
          <div class="slop-score-label">Slop <strong>${data.slop.score}/10</strong></div>
          <div class="slop-score-reason">${escapeHtml(data.slop.reason)}</div>
        </div>
      </div>
      ${data.sources.length > 0 ? `
        <div class="slop-sources">
          <div class="slop-sources-title">📡 Earlier Sources</div>
          ${data.sources.slice(0, 3).map(s => `
            <a class="slop-source-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">
              ${escapeHtml(s.title)}
              ${s.published ? `<span class="slop-source-date">${s.published.slice(0, 10)}</span>` : ""}
            </a>
          `).join("")}
        </div>
      ` : ""}
      <div class="slop-card-footer">
        <a class="slop-share-btn" href="http://localhost:3000/r/${data.content_hash}" target="_blank">Share Result</a>
      </div>
    `;

    card.querySelector(".slop-card-close").addEventListener("click", () => card.remove());
    return card;
  }

  function escapeHtml(text) {
    const d = document.createElement("div");
    d.textContent = text;
    return d.innerHTML;
  }

  function injectButton(article) {
    if (PROCESSED.has(article)) return;
    PROCESSED.add(article);

    const text = getTweetText(article);
    if (!text || text.length < 20) return;

    const actionBar = article.querySelector('[role="group"]');
    if (!actionBar) return;

    const btn = createBeetleButton();
    actionBar.appendChild(btn);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const existingCard = article.querySelector(".slop-radar-card");
      if (existingCard) {
        existingCard.remove();
        return;
      }

      btn.classList.add("slop-loading");
      btn.innerHTML = `<span class="slop-beetle-icon slop-spin">🪲</span>`;
      trackEvent("click", null, { url: getTweetUrl(article) });

      chrome.runtime.sendMessage(
        { type: "ANALYZE", text, url: getTweetUrl(article) },
        (response) => {
          btn.classList.remove("slop-loading");
          btn.innerHTML = `<span class="slop-beetle-icon">🪲</span>`;

          if (response?.ok) {
            trackEvent("analyze_success", response.data.content_hash);
            const card = createResultCard(response.data);
            article.appendChild(card);
          } else {
            btn.title = `Error: ${response?.error || "Unknown"}`;
            btn.classList.add("slop-error");
          }
        }
      );
    });
  }

  function scan() {
    document.querySelectorAll('article[data-testid="tweet"]').forEach(injectButton);
  }

  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
  scan();
})();
