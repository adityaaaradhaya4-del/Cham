export async function onRequestPost({ request, env }) {
  const headers = { "Content-Type": "application/json" };
  if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({error:"Set GEMINI_API_KEY in Cloudflare Pages environment variables."}), {status:500, headers});
  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({error:"Invalid request"}), {status:400, headers}); }
  const prompt = String(body.prompt || "").slice(0, 8000);
  if (!prompt.trim()) return new Response(JSON.stringify({error:"Write a prompt first"}), {status:400, headers});
  const input = [];
  if (body.imageData) input.push({type:"image", data:body.imageData, mime_type:body.mimeType || "image/jpeg"});
  input.push({type:"text", text:prompt});
  const model = env.GEMINI_MODEL || "gemini-3.5-flash";
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method:"POST", headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
      body:JSON.stringify({model,input})
    });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({error:data.error?.message || "Gemini error"}), {status:res.status, headers});
    const text = data.output_text || (data.outputs || []).map(o=>o.text || "").filter(Boolean).join("\n") ||
      (data.steps || []).flatMap(s=>s.content || []).map(c=>c.text || "").filter(Boolean).join("\n");
    return new Response(JSON.stringify({text}), {status:200, headers});
  } catch { return new Response(JSON.stringify({error:"Could not reach Gemini"}), {status:502, headers}); }
                                                                                                               }
