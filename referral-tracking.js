// ============================================================
// Referral click tracking
// Include this on every page that could be a referral landing
// page (homepage especially). Detects ?ref=CODE in the URL,
// records one "tap" via a Supabase RPC, then cleans the URL.
//
// Self-contained on purpose — doesn't depend on scripts.js,
// since not every page in this site currently loads that file.
// ============================================================

// Same project as the rest of the corporate site / portal.
// Fill in once — same values as in scripts.js.
const REFERRAL_SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const REFERRAL_SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

(function trackReferralClick() {
  if (!window.supabase) return; // Supabase SDK script tag must load before this file

  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (!code) return;

  // Dedupe: only record one tap per referral code per browser session,
  // so refreshing the page or clicking around the site doesn't inflate
  // the count. A brand-new visit (new tab/session) counts as a new tap.
  const dedupeKey = `wimpy_ref_recorded_${code}`;
  if (sessionStorage.getItem(dedupeKey)) return;

  const client = window.supabase.createClient(REFERRAL_SUPABASE_URL, REFERRAL_SUPABASE_ANON_KEY);

  client.rpc('record_referral_click', { p_code: code })
    .then(({ error }) => {
      if (error) {
        console.error('Referral click tracking failed:', error);
        return;
      }
      sessionStorage.setItem(dedupeKey, 'true');
    });
})();
