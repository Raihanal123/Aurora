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
    const { imageBase64, filename, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Tidak ada data foto' });
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' });

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, filename || 'foto-rumah.jpg');

    const uploadRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });

    const resultText = await uploadRes.text();
    const url = resultText.trim();

    if (!url.startsWith('http')) {
      return res.status(502).json({ error: 'Layanan penyimpanan foto sedang bermasalah' });
    }

    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal mengunggah foto' });
  }
}
