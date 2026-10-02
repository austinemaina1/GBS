# Getting quote notifications working

Your quote form on the Contact page is wired up to email you the moment someone submits it, using a free service called **Formspree**. Since Gmail already pushes notifications to your phone, this lands the same way a text would — just as an email.

Until you complete the one setup step below, the form will show a friendly "please call or WhatsApp us instead" message — it won't look broken to visitors, it just won't reach you yet.

---

## Setup (5 minutes, free)

1. Go to https://formspree.io and sign up for a free account using **generationbuilderssuppliers@gmail.com**.
2. Create a new form. Formspree will give you an endpoint URL that looks like:
   `https://formspree.io/f/abcdwxyz`
3. Open `assets/js/main.js` in the project, find this line near the top of the quote-form section:
   ```js
   var FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";
   ```
   Replace the placeholder URL with your real one.
4. The **first** real submission to a brand-new Formspree form doesn't email you — instead, Formspree sends *you* a confirmation email asking you to verify the form. Click that link once, and every submission after that (including that first test one, if you resend it) will land in your inbox normally.
5. That's it — no hosting changes needed. This works even while testing locally on Live Server, and will keep working on whatever host you eventually put the site on.

**Free tier limits:** 50 submissions per month, which comfortably covers a small business's quote requests. If you outgrow that, Formspree's paid plans start cheap — or we can revisit the SMS option below.

---

## Optional: real SMS instead of email (paid, more setup)

If email notifications aren't enough later and you want an actual SMS text, that's still possible — it just costs a small fee per message (roughly KES 0.8–1 via Africa's Talking) and needs real hosting with serverless functions (e.g. Netlify), since SMS credentials can never live in the browser-side code.

The groundwork for this is already built and sitting unused in the project:
- `netlify/functions/quote.js` — a working serverless function that sends an SMS via Africa's Talking
- `package.json` and `netlify.toml` — so Netlify auto-detects and deploys it

To switch to this path later: point the quote form back at `/.netlify/functions/quote` instead of Formspree in `main.js`, deploy the site to Netlify, create an Africa's Talking account (Live app, topped up with credit — Sandbox does not deliver real SMS), and set the `AT_USERNAME`, `AT_API_KEY`, and `NOTIFY_PHONE` environment variables in Netlify's dashboard. Ask me when you're ready and I'll wire it back in and walk you through it step by step.
