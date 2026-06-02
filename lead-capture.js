(() => {
  const library = window.JONEZIE_SITE_LIBRARY || null;
  if (!library) return;

  const pathname = window.location.pathname || '';
  const isCheckout = pathname.endsWith('/checkout.html') || pathname.endsWith('checkout.html');
  if (isCheckout) return;
  const searchParams = new URLSearchParams(window.location.search);
  const forcePreview = searchParams.get('showLeadCapture') === '1';

  const STORAGE_KEY = 'jonezie_lead_capture_state';
  const DAILY_EXPOSURE_MS = 1000 * 60 * 60 * 24;
  const existingState = getState();
  const lastExposureAt = existingState.lastShownAt || existingState.dismissedAt || 0;
  const hasRecentExposure = lastExposureAt && (Date.now() - lastExposureAt) < DAILY_EXPOSURE_MS;
  const hasSignup = Boolean(existingState.email);

  bindInlineForms();
  if (!forcePreview && (hasSignup || hasRecentExposure)) return;

  const modal = injectModal();
  if (!modal) return;
  if (forcePreview) {
    modal.hidden = false;
    modal.dataset.trigger = 'Preview override';
    document.body.classList.add('lead-capture-open');
  }
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

      trigger?.addEventListener('click', async () => {
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
        trigger.disabled = true;
        feedback.textContent = 'Saving your signup...';
        const submission = await submitLeadSignup(state);
        trigger.disabled = false;
        if (!submission.ok) {
          feedback.textContent = 'We could not save that signup. Email customerservice@jonezielabs.com and we will get you added.';
          return;
        }
        persistState(state);
        feedback.innerHTML = `You are set. <a href="${library.RESOURCE_DOWNLOAD.pageHref}">Open the quick reference</a> or <a href="${library.RESOURCE_DOWNLOAD.fileHref}" download>download the text version</a>.`;
      });
    });
  }

  function injectModal() {
    const wrapper = document.createElement('div');
    wrapper.className = 'lead-capture-modal';
    wrapper.hidden = true;
    wrapper.innerHTML = `
      <div class="lead-capture-backdrop" data-lead-close></div>
      <div class="lead-capture-dialog" role="dialog" aria-modal="true" aria-label="Jonezie Labs insider access">
        <button class="lead-capture-close" type="button" data-lead-close aria-label="Close sign-up prompt">&times;</button>
        <div class="lead-capture-brand">
          <img class="lead-capture-logo" src="jonezie-logo-white-text-transparent.webp" alt="Jonezie Labs" />
        </div>
        <p class="eyebrow">Jonezie Labs</p>
        <h2>Stay Connected</h2>
        <p>New drops. Clean references. Major sales.</p>
        <form class="lead-capture-form" data-lead-modal-form>
          <label>
            <span class="sr-only">Email</span>
            <input type="email" name="email" placeholder="Email" aria-label="Email" required />
          </label>
          <button class="button primary lead-capture-submit" type="submit">Get Access</button>
          <p class="lead-capture-feedback" data-lead-feedback aria-live="polite"></p>
          <p class="lead-capture-note">No spam. Research reference only.</p>
        </form>
      </div>`;
    document.body.appendChild(wrapper);

    const form = wrapper.querySelector('[data-lead-modal-form]');
    const feedback = wrapper.querySelector('[data-lead-feedback]');
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const email = String(formData.get('email') || '').trim();
      if (!isValidEmail(email)) {
        feedback.textContent = 'Enter a valid email to continue.';
        return;
      }

      const state = {
        email,
        source: 'Lead capture modal',
        trigger: wrapper.dataset.trigger || 'Manual',
        subscribedAt: Date.now()
      };
      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) submitButton.disabled = true;
      feedback.textContent = 'Saving your signup...';
      const submission = await submitLeadSignup(state);
      if (submitButton) submitButton.disabled = false;
      if (!submission.ok) {
        feedback.textContent = 'We could not save that signup. Email customerservice@jonezielabs.com and we will get you added.';
        return;
      }
      persistState(state);
      feedback.textContent = 'You are in. Watch your inbox for drops, updates, and sales.';
      window.setTimeout(() => dismiss(wrapper), 1200);
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
      const state = getState();
      persistState({ ...state, lastShownAt: Date.now() });
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

  async function submitLeadSignup(state) {
    if (typeof library.submitLeadCapture !== 'function') {
      return { ok: false, reason: 'missing-submit-handler' };
    }

    return library.submitLeadCapture({
      email: state.email,
      phone: state.phone,
      source: state.source,
      trigger: state.trigger,
      page: window.location.href
    });
  }
})();
