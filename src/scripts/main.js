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

  getApiBaseUrl() {
    return this.apiUrl;
  }

  buildAdviceUrl(slipId) {
    return slipId ? `${this.apiUrl}/advice/${slipId}` : this.apiUrl;
  }
}

class AdviceRenderer {
  constructor() {
    this.adviceEl = document.getElementById("advice");
    this.citationEl = document.getElementById("advice-citation");
    this.citationLinkEl = this.citationEl.querySelector("a");
    this.button = document.getElementById("new-advice-btn");
  }

  setAdviceText(text, citeUrl) {
    this.adviceEl.setAttribute("cite", citeUrl);
    this.adviceEl.textContent = text;
  }

  showCitation(slipId, citeUrl) {
    this.citationLinkEl.href = citeUrl;
    this.citationLinkEl.textContent = `#${slipId}`;
    this.citationEl.classList.remove("hidden");
  }

  hideCitation() {
    this.citationEl.classList.add("hidden");
  }

  showAdvice(slip, citeUrl) {
    this.setAdviceText(slip.advice, citeUrl);

    if (slip.id) {
      this.showCitation(slip.id, citeUrl);
    } else {
      this.hideCitation();
    }
  }

  showLoading(baseUrl) {
    this.setAdviceText("Loading advice...", baseUrl);
    this.hideCitation();
  }

  showFallback(baseUrl) {
    this.setAdviceText("Unable to load advice right now, so remember: Keep it simple.", baseUrl);
    this.hideCitation();
  }

  disableCtaButton() {
    this.button.disabled = true;
  }

  enableCtaButton() {
    this.button.disabled = false;
  }
}

class AdviceApp {
  constructor() {
    this.service = new AdviceService();
    this.renderer = new AdviceRenderer();
  }

  async getNewAdvice() {
    this.renderer.disableCtaButton();
    const baseUrl = this.service.getApiBaseUrl();
    this.renderer.showLoading(baseUrl);

    try {
      const slip = await this.service.fetchAdvice();
      const citeUrl = this.service.buildAdviceUrl(slip.id);
      this.renderer.showAdvice(slip, citeUrl);
    } catch (err) {
      this.renderer.showFallback(baseUrl);
    }

    this.renderer.enableCtaButton();
  }

  init() {
    this.getNewAdvice();
    this.renderer.button.addEventListener("click", () => this.getNewAdvice());
  }
}

const app = new AdviceApp();
app.init();
