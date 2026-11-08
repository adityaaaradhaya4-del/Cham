CHAM — Cloudflare Pages upload package

UPLOAD
1. In Cloudflare Workers & Pages, choose Create application > Upload your static files.
2. Upload this ZIP, or upload the contents of this folder with index.html at the root.
3. Deploy.

IMPORTANT — API KEYS
The Firebase web config is included in index.html; this is normal for Firebase browser apps.
After deployment, open Workers & Pages > your CHAM project > Settings > Variables and add:
- GEMINI_API_KEY (required for Gemini chat/tool responses and image generation)
- HF_TOKEN (optional; required for music generation)
Optional:
- GEMINI_MODEL (defaults to gemini-3.5-flash)
- IMAGE_MODEL (defaults to gemini-2.5-flash-image)
- MUSIC_MODEL (defaults to facebook/musicgen-small)

Set secrets/variables for Production (and Preview if needed), then redeploy.
Never put API keys in index.html or share them publicly.

FIREBASE
In Firebase Authentication > Settings > Authorized domains, add the exact new hostname, e.g. cham-ai.pages.dev.
Keep your existing Firestore rules; this package uses the existing per-user path.

NOTES
- The package uses Cloudflare Pages Functions under /functions/api for Gemini, image and music endpoints.
- CHAM's local WebLLM fallback still depends on the phone/browser supporting WebGPU and downloading its model.
- Test Google sign-in from the deployed HTTPS pages.dev URL in Chrome.
