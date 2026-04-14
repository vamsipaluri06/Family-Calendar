const sharp = require('sharp');
const path = require('path');

const sizes = [192, 512];
const publicDir = path.join(__dirname, 'public');

// SVG template for the calendar icon with gradient background
const createIconSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Rounded background -->
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  
  <!-- Calendar body -->
  <rect x="${size * 0.2}" y="${size * 0.28}" width="${size * 0.6}" height="${size * 0.52}" rx="${size * 0.05}" fill="white"/>
  
  <!-- Calendar header -->
  <rect x="${size * 0.2}" y="${size * 0.28}" width="${size * 0.6}" height="${size * 0.15}" rx="${size * 0.05}" fill="#667eea"/>
  <rect x="${size * 0.2}" y="${size * 0.35}" width="${size * 0.6}" height="${size * 0.08}" fill="#667eea"/>
  
  <!-- Calendar rings -->
  <rect x="${size * 0.32}" y="${size * 0.18}" width="${size * 0.06}" height="${size * 0.15}" rx="${size * 0.02}" fill="white"/>
  <rect x="${size * 0.62}" y="${size * 0.18}" width="${size * 0.06}" height="${size * 0.15}" rx="${size * 0.02}" fill="white"/>
  
  <!-- Calendar dots (grid) -->
  <circle cx="${size * 0.30}" cy="${size * 0.55}" r="${size * 0.03}" fill="#667eea"/>
  <circle cx="${size * 0.43}" cy="${size * 0.55}" r="${size * 0.03}" fill="#667eea"/>
  <circle cx="${size * 0.56}" cy="${size * 0.55}" r="${size * 0.03}" fill="#667eea"/>
  <circle cx="${size * 0.69}" cy="${size * 0.55}" r="${size * 0.03}" fill="#667eea"/>
  
  <circle cx="${size * 0.30}" cy="${size * 0.67}" r="${size * 0.03}" fill="#667eea"/>
  <circle cx="${size * 0.43}" cy="${size * 0.67}" r="${size * 0.03}" fill="#667eea"/>
  <circle cx="${size * 0.56}" cy="${size * 0.67}" r="${size * 0.03}" fill="#667eea"/>
  <circle cx="${size * 0.69}" cy="${size * 0.67}" r="${size * 0.03}" fill="#667eea"/>
</svg>
`;

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');
  
  for (const size of sizes) {
    const svg = createIconSvg(size);
    const outputPath = path.join(publicDir, `pwa-${size}x${size}.png`);
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Created pwa-${size}x${size}.png`);
  }
  
  // Also create apple-touch-icon
  const appleSvg = createIconSvg(180);
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ Created apple-touch-icon.png (180x180)');
  
  console.log('\n🎉 PWA icons generated successfully!');
}

generateIcons().catch(console.error);
