const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'backgrounds');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const images = [
  {
    name: 'trending-gaming-bg.jpg',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2560&auto=format&fit=crop',
  },
  {
    name: 'cyberpunk-city-bg.jpg',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2560&auto=format&fit=crop',
  },
  {
    name: 'tactical-arena-bg.jpg',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2560&auto=format&fit=crop',
  },
];

async function downloadAll() {
  for (const img of images) {
    const dest = path.join(targetDir, img.name);
    console.log(`Downloading ${img.name}...`);
    try {
      const res = await fetch(img.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(dest, buffer);
      console.log(`Saved ${img.name} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`Failed ${img.name}:`, err.message);
    }
  }
}

downloadAll();
