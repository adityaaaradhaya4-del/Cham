export async function onRequestPost({ request, env }) {
  const headers = { "Content-Type": "application/json" };
  if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({error:"Set GEMINI_API_KEY in Cloudflare Pages environment variables."}), {status:500, headers});
  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({error:"Invalid request"}), {status:400, headers}); }
  const prompt = String(body.prompt || "").slice(0, 2000).trim();
  if (!prompt) return new Response(JSON.stringify({error:"Describe the image first"}), {status:400, headers});
  const parts = [];
  if (body.imageData) parts.push({inline_data:{mime_type:body.mimeType || "image/png", data:body.imageData}});
  parts.push({text:prompt});
  const model = env.IMAGE_MODEL || "gemini-2.5-flash-image";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({contents:[{parts}],generationConfig:{responseModalities:["IMAGE","TEXT"]}})
    });
    const data = await res.json();
    if (!res.ok) return new Response(JSON.stringify({error:data.error?.message || "Image service error"}), {status:res.status, headers});
    const out = data.candidates?.[0]?.content?.parts || [];
    const img = out.find(p=>p.inlineData || p.inline_data);
    if (!img) return new Response(JSON.stringify({error:out.map(p=>p.text || "").join(" ").trim() || "No image returned"}), {status:502, headers});
    const inline = img.inlineData || img.inline_data;
    return new Response(JSON.stringify({image:inline.data,mimeType:inline.mimeType || inline.mime_type || "image/png"}), {status:200,headers});
  } catch { return new Response(JSON.stringify({error:"Could not reach the image service"}), {status:502,headers}); }
                                                                                        }
      
