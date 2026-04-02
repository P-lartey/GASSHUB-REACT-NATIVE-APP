const sharp = require('sharp');
const path = require('path');

async function fixIcons() {
  const inputPath = path.join(__dirname, 'assets', 'images', 'gass-logo.png');
  const outputPath = path.join(__dirname, 'assets', 'images', 'icon-fixed.png');
  
  try {
    // Resize to 1024x1024 square (standard app icon size)
    await sharp(inputPath)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    
    console.log('✓ Icon fixed successfully!');
    console.log(`Output: ${outputPath}`);
  } catch (error) {
    console.error('Error fixing icon:', error);
  }
}

fixIcons();
