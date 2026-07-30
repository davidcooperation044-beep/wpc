
const WIMPY_SUPABASE_URL = 'https://wwlgrktvcrkmrbyapyml.supabase.co';
const WIMPY_SUPABASE_ANON_KEY = 'sb_publishable_DPYC6KjZPjmQgSPeRYYq6g_HA9xgLpI';
ime a form submits
let _wimpySupabaseClient = null;
function getWimpySupabase() {
  if (_wimpySupabaseClient) return _wimpySupabaseClient;
  if (!window.supabase) return null;
  _wimpySupabaseClient = window.supabase.createClient(WIMPY_SUPABASE_URL, WIMPY_SUPABASE_ANON_KEY);
  return _wimpySupabaseClient;
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('pointerenter', () => {
      hero.style.transform = 'translateY(-4px)';
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.transform = 'translateY(0)';
    });
  }
}

const toggleAffiliateDetails = () => {
  const roleSelect = document.querySelector('#roleInterest');
  const affiliateSection = document.querySelector('#affiliateDetailsSection');
  const affiliateTextarea = document.querySelector('#affiliateDetails');

  if (!roleSelect || !affiliateSection || !affiliateTextarea) {
    return;
  }

  const isAffiliate = roleSelect.value === 'Affiliate / Partner';
  affiliateSection.classList.toggle('hidden-field', !isAffiliate);
  affiliateSection.setAttribute('aria-hidden', String(!isAffiliate));
  affiliateTextarea.required = isAffiliate;
};

document.addEventListener('DOMContentLoaded', () => {
  const roleSelect = document.querySelector('#roleInterest');
  if (roleSelect) {
    roleSelect.addEventListener('change', toggleAffiliateDetails);
    toggleAffiliateDetails();
  }
});


(function () {
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');

  if (!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 640 && mobileNav.classList.contains('is-open')) {
      mobileNav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

function showFormMessage(form, text, isError) {
  let el = form.querySelector('.form-submit-message');
  if (!el) {
    el = document.createElement('p');
    el.className = 'form-submit-message';
    form.appendChild(el);
  }
  el.textContent = text;
  el.style.color = isError ? '#e05a4e' : '#4cc77f';
  el.style.fontWeight = '600';
  el.style.marginTop = '0.75rem';
}

function setSubmitting(form, isSubmitting, label) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = isSubmitting;
  if (isSubmitting) {
    btn.dataset.originalLabel = btn.textContent;
    btn.textContent = label;
  } else {
    btn.textContent = btn.dataset.originalLabel || btn.textContent;
  }
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const wimpySupabase = getWimpySupabase();
    if (!wimpySupabase) {
      showFormMessage(contactForm, 'Form service unavailable right now. Please email us directly.', true);
      return;
    }

    const data = new FormData(contactForm);
    setSubmitting(contactForm, true, 'Sending…');

    const { error } = await wimpySupabase.from('applications').insert({
      type: 'project_inquiry',
      name: data.get('name'),
      email: data.get('email'),
      project_type: data.get('projectType'),
      budget: data.get('budget'),
      custom_budget: data.get('customBudget') || null,
      message: data.get('message')
    });

    setSubmitting(contactForm, false);

    if (error) {
      console.error('Contact form submit error:', error);
      showFormMessage(contactForm, 'There was a problem sending your inquiry. Please try again.', true);
      return;
    }

    showFormMessage(contactForm, "Thanks — we've got your project brief and will be in touch soon.", false);
    contactForm.reset();
  });
}

const careerForm = document.getElementById('careerForm');
if (careerForm) {
  careerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const wimpySupabase = getWimpySupabase();
    if (!wimpySupabase) {
      showFormMessage(careerForm, 'Form service unavailable right now. Please email us directly.', true);
      return;
    }

    const data = new FormData(careerForm);
    const cvFile = data.get('cv');
    setSubmitting(careerForm, true, 'Submitting…');

    let cvStoragePath = null;

    if (cvFile && cvFile.size > 0) {
      const safeName = cvFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const path = `${Date.now()}_${safeName}`;

      const { error: uploadError } = await wimpySupabase.storage
        .from('cv-uploads')
        .upload(path, cvFile);

      if (uploadError) {
        console.error('CV upload error:', uploadError);
        setSubmitting(careerForm, false);
        showFormMessage(careerForm, 'There was a problem uploading your CV. Please try again.', true);
        return;
      }

      cvStoragePath = path;
    }

    const { error } = await wimpySupabase.from('applications').insert({
      type: 'job_application',
      name: data.get('name'),
      email: data.get('email'),
      role_interest: data.get('role'),
      affiliate_details: data.get('affiliateDetails') || null,
      portfolio_url: data.get('portfolio') || null,
      cv_storage_path: cvStoragePath,
      pitch: data.get('pitch')
    });

    setSubmitting(careerForm, false);

    if (error) {
      console.error('Career form submit error:', error);
      showFormMessage(careerForm, 'There was a problem sending your application. Please try again.', true);
      return;
    }

    showFormMessage(careerForm, "Thanks — we've got your application and will follow up soon.", false);
    careerForm.reset();
    toggleAffiliateDetails();
  });
}
