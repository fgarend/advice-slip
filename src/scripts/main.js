const ADVICE_API_URL = "https://api.adviceslip.com";

class AdviceRenderer {
  constructor() {
    this.LOADING_MESSAGE = "Loading advice...";
    this.FALLBACK_MESSAGE = "Unable to load advice right now, so remember: Keep it simple.";

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

  showAdvice(slip) {
    const citeUrl = slip.id ? `${ADVICE_API_URL}/advice/${slip.id}` : ADVICE_API_URL;

    this.updateBlockquote(slip.advice, citeUrl);

    if (slip.id) {
      this.showCitation(slip.id, citeUrl);
    } else {
      this.hideCitation();
    }
  }

  showLoading() {
    this.updateBlockquote(this.LOADING_MESSAGE, ADVICE_API_URL);
    this.hideCitation();
  }

  showFallback() {
    this.updateBlockquote(this.FALLBACK_MESSAGE, ADVICE_API_URL);
    this.hideCitation();
  }
}

class AdviceApp {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.renderer = new AdviceRenderer();
    this.button = document.getElementById("new-advice-btn");
  }

  async fetchAdvice() {
    const response = await fetch(`${this.apiUrl}/advice`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = await response.json();
    return data.slip;
  }

  async load() {
    this.renderer.showLoading();

    try {
      const slip = await this.fetchAdvice();
      this.renderer.showAdvice(slip);
    } catch (err) {
      this.renderer.showFallback();
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

const app = new AdviceApp(ADVICE_API_URL);
app.init();
