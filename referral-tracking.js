const REFERRAL_SUPABASE_URL = 'https://wwlgrktvcrkmrbyapyml.supabase.co';
const REFERRAL_SUPABASE_ANON_KEY = 'sb_publishable_DPYC6KjZPjmQgSPeRYYq6g_HA9xgLpI';

(function trackReferralClick() {
  if (!window.supabase) return; 
  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref');
  if (!code) return;

 
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
