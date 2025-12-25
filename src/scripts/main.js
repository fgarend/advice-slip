class AdviceService {
  constructor() {
    this.apiUrl = "https://api.adviceslip.com";
  }

  async fetchAdvice() {
    const response = await fetch(`${this.apiUrl}/advice`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = await response.json();
    return data.slip;
  }

  getBaseUrl() {
    return this.apiUrl;
  }

  getAdviceUrl(slipId) {
    return slipId ? `${this.apiUrl}/advice/${slipId}` : this.apiUrl;
  }
}

class AdviceRenderer {
  constructor() {
    this.adviceEl = document.getElementById("advice");
    this.citationEl = document.getElementById("advice-citation");
    this.citationLinkEl = this.citationEl.querySelector("a");
  }

  updateBlockquote(text, citeUrl) {
    this.adviceEl.setAttribute("cite", citeUrl);
    this.adviceEl.textContent = text;
  }

  showCitation(slipId, citeUrl) {
    this.citationLinkEl.href = citeUrl;
    this.citationLinkEl.textContent = `#${slipId}`;
    this.citationEl.style.visibility = "visible";
  }

  hideCitation() {
    this.citationEl.style.visibility = "hidden";
  }

  showAdvice(slip, citeUrl) {
    this.updateBlockquote(slip.advice, citeUrl);

    if (slip.id) {
      this.showCitation(slip.id, citeUrl);
    } else {
      this.hideCitation();
    }
  }

  showLoading(baseUrl) {
    this.updateBlockquote("Loading advice...", baseUrl);
    this.hideCitation();
  }

  showFallback(baseUrl) {
    this.updateBlockquote("Unable to load advice right now, so remember: Keep it simple.", baseUrl);
    this.hideCitation();
  }
}

class AdviceApp {
  constructor() {
    this.service = new AdviceService();
    this.renderer = new AdviceRenderer();
    this.button = document.getElementById("new-advice-btn");
  }

  async load() {
    const baseUrl = this.service.getBaseUrl();
    this.renderer.showLoading(baseUrl);

    try {
      const slip = await this.service.fetchAdvice();
      const citeUrl = this.service.getAdviceUrl(slip.id);
      this.renderer.showAdvice(slip, citeUrl);
    } catch (err) {
      this.renderer.showFallback(baseUrl);
    }
  }

  async handleButtonClick() {
    this.button.disabled = true;
    await this.load();
    this.button.disabled = false;
  }

  init() {
    this.load();
    this.button.addEventListener("click", () => this.handleButtonClick());
  }
}

const app = new AdviceApp();
app.init();
