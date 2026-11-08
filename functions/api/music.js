export async function onRequestPost({ request, env }) {
  const headers = { "Content-Type": "application/json" };
  if (!env.HF_TOKEN) return new Response(JSON.stringify({error:"Set HF_TOKEN in Cloudflare Pages environment variables to enable music generation."}), {status:500,headers});
  let body;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({error:"Invalid request"}), {status:400,headers}); }
  const prompt = String(body.prompt || "").slice(0,300).trim();
  if (!prompt) return new Response(JSON.stringify({error:"Describe the song first"}), {status:400,headers});
  const model = env.MUSIC_MODEL || "facebook/musicgen-small";
  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/models/${model}`, {
      method:"POST", headers:{Authorization:`Bearer ${env.HF_TOKEN}`,"Content-Type":"application/json"},
      body:JSON.stringify({inputs:prompt})
    });
    if (res.status === 503) return new Response(JSON.stringify({error:"The music model is starting up. Wait a minute and try again."}), {status:503,headers});
    if (!res.ok) return new Response(JSON.stringify({error:"Music service error: "+(await res.text()).slice(0,200)}), {status:res.status,headers});
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = ""; for (let i=0;i<bytes.length;i+=0x8000) binary += String.fromCharCode(...bytes.subarray(i,i+0x8000));
    const audio = btoa(binary);
    return new Response(JSON.stringify({audio,mimeType:res.headers.get("content-type") || "audio/flac"}), {status:200,headers});
  } catch { return new Response(JSON.stringify({error:"Could not reach the music service"}), {status:502,headers}); }
    }
  
