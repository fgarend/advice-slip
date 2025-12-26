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
    this.citationLinkEl.innerHTML = `#${slipId}<svg class="icon icon-external" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-labelledby="external-link-title"><title id="external-link-title">Opens in new tab</title><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"/><path d="m21 3-9 9"/><path d="M15 3h6v6"/></svg>`;
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
