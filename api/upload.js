export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb'
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Tidak ada data foto' });
    }

    const apiKey = (process.env.IMGBB_API_KEY || '').trim();
    if (!apiKey) {
      return res.status(500).json({ error: 'IMGBB_API_KEY belum diatur di Vercel' });
    }

    const params = new URLSearchParams();
    params.append('key', apiKey);
    params.append('image', imageBase64);

    const uploadRes = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: params
    });

    const rawText = await uploadRes.text();
    let result;
    try{
      result = JSON.parse(rawText);
    } catch(parseErr){
      return res.status(502).json({ error: `Respons tidak valid dari ImgBB (HTTP ${uploadRes.status}): ${rawText.slice(0, 200)}` });
    }

    if (!result || !result.success || !result.data || !result.data.url) {
      const msg = (result && result.error && (result.error.message || result.error))
        || result?.status_txt
        || `ImgBB menolak upload (HTTP ${uploadRes.status})`;
      return res.status(502).json({ error: String(msg) });
    }

    return res.status(200).json({ url: result.data.url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal mengunggah foto' });
  }
}
