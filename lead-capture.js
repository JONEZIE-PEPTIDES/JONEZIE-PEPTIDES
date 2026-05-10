(() => {
  const library = window.JONEZIE_SITE_LIBRARY || null;
  if (!library) return;

  const pathname = window.location.pathname || '';
  const isCheckout = pathname.endsWith('/checkout.html') || pathname.endsWith('checkout.html');
  if (isCheckout) return;

  const STORAGE_KEY = 'jonezie_lead_capture_state';
  const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
  const existingState = getState();
  const hasRecentDismissal = existingState.dismissedAt && (Date.now() - existingState.dismissedAt) < MAX_AGE_MS;
  const hasSignup = Boolean(existingState.email);

  bindInlineForms();
  if (hasSignup || hasRecentDismissal) return;

  const modal = injectModal();
  if (!modal) return;
  bindTriggers(modal);

  function bindInlineForms() {
    const forms = document.querySelectorAll('[data-lead-inline-form], .vendor-form-updates');
    forms.forEach((form) => {
      if (form.dataset.leadBound) return;
      form.dataset.leadBound = 'true';

      const trigger = form.querySelector('[data-lead-inline-submit], .vendor-submit');
      const emailInput = form.querySelector('input[type="email"]');
      const phoneInput = form.querySelector('input[name="updatesPhone"], input[name="phone"]');
      const feedback = ensureInlineFeedback(form);

      trigger?.addEventListener('click', () => {
        const email = String(emailInput?.value || '').trim();
        if (!isValidEmail(email)) {
          feedback.textContent = 'Enter a valid email to get the quick reference.';
          return;
        }

        const state = {
          email,
          phone: String(phoneInput?.value || '').trim(),
          source: 'Inline signup',
          trigger: 'Inline form',
          subscribedAt: Date.now()
        };
        persistState(state);
        feedback.innerHTML = `You are set. <a href="${library.RESOURCE_DOWNLOAD.pageHref}">Open the quick reference</a> or <a href="${library.RESOURCE_DOWNLOAD.fileHref}" download>download the text version</a>.`;
        window.location.href = library.getLeadMagnetMailto({
          email: state.email,
          phone: state.phone,
          source: state.source,
          trigger: state.trigger,
          page: window.location.href
        });
      });
    });
  }

  function injectModal() {
    const wrapper = document.createElement('div');
    wrapper.className = 'lead-capture-modal';
    wrapper.hidden = true;
    wrapper.innerHTML = `
      <div class="lead-capture-backdrop" data-lead-close></div>
      <div class="lead-capture-dialog" role="dialog" aria-modal="true" aria-label="Jonezie Labs research updates">
        <button class="lead-capture-close" type="button" data-lead-close aria-label="Close sign-up prompt">&times;</button>
        <p class="eyebrow">Stay Connected</p>
        <h2>Get the RUO quick reference and future Jonezie updates.</h2>
        <p>We will keep this simple: one signup path, one fast download, and direct internal links back into the catalog, guides, and tools.</p>
        <form class="lead-capture-form" data-lead-modal-form>
          <label>
            <span>Email</span>
            <input type="email" name="email" placeholder="Email" required />
          </label>
          <label>
            <span>Research focus</span>
            <select name="interest">
              <option value="Metabolic">Metabolic</option>
              <option value="Recovery">Recovery</option>
              <option value="Aesthetics">Aesthetics</option>
              <option value="Growth">Growth</option>
              <option value="Cognitive">Cognitive</option>
              <option value="Cellular">Cellular</option>
              <option value="Support">Support / specialty</option>
            </select>
          </label>
          <button class="button primary lead-capture-submit" type="submit">Get Quick Reference</button>
          <p class="lead-capture-feedback" data-lead-feedback aria-live="polite"></p>
          <div class="resource-links-inline lead-capture-downloads" data-lead-downloads hidden>
            <a class="button secondary comparison-inline-link" href="${library.RESOURCE_DOWNLOAD.pageHref}">Open Quick Reference</a>
            <a class="button secondary comparison-inline-link" href="${library.RESOURCE_DOWNLOAD.fileHref}" download>Download Text Version</a>
          </div>
        </form>
      </div>`;
    document.body.appendChild(wrapper);
    library.enhanceCustomSelects(wrapper);

    const form = wrapper.querySelector('[data-lead-modal-form]');
    const feedback = wrapper.querySelector('[data-lead-feedback]');
    const downloads = wrapper.querySelector('[data-lead-downloads]');
    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get('email') || '').trim();
      if (!isValidEmail(email)) {
        feedback.textContent = 'Enter a valid email to continue.';
        return;
      }

      const state = {
        email,
        interest: String(formData.get('interest') || '').trim(),
        source: 'Lead capture modal',
        trigger: wrapper.dataset.trigger || 'Manual',
        subscribedAt: Date.now()
      };
      persistState(state);
      feedback.textContent = 'Signup captured. Open the resource below and check your email draft to keep the handoff organized.';
      if (downloads) downloads.hidden = false;
      window.location.href = library.getLeadMagnetMailto({
        email: state.email,
        interest: state.interest,
        source: state.source,
        trigger: state.trigger,
        page: window.location.href
      });
    });

    wrapper.querySelectorAll('[data-lead-close]').forEach((button) => {
      button.addEventListener('click', () => dismiss(wrapper));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !wrapper.hidden) dismiss(wrapper);
    });

    return wrapper;
  }

  function bindTriggers(modal) {
    let shown = false;

    const open = (trigger) => {
      if (shown || getState().email) return;
      shown = true;
      modal.hidden = false;
      modal.dataset.trigger = trigger;
      document.body.classList.add('lead-capture-open');
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const depth = window.scrollY / scrollable;
      if (depth >= 0.55) {
        window.removeEventListener('scroll', onScroll);
        open('Scroll depth');
      }
    };

    const onMouseOut = (event) => {
      if (event.clientY > 18) return;
      document.removeEventListener('mouseout', onMouseOut);
      open('Exit intent');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onMouseOut);
    window.setTimeout(() => open('Time on page'), 30000);
  }

  function dismiss(modal) {
    modal.hidden = true;
    document.body.classList.remove('lead-capture-open');
    const state = getState();
    persistState({ ...state, dismissedAt: Date.now() });
  }

  function ensureInlineFeedback(form) {
    let feedback = form.querySelector('[data-lead-inline-feedback]');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.setAttribute('data-lead-inline-feedback', '');
      feedback.className = 'lead-inline-feedback';
      form.appendChild(feedback);
    }
    return feedback;
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function getState() {
    try {
      return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function persistState(state) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
})();
