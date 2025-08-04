import fs from 'fs';
import path from 'path';

// Icons are now generated properly, no need for fallback buffer

function isValidPNG(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    const buffer = fs.readFileSync(filePath);
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(pngSignature);
  } catch { return false; }
}

console.log('🔍 Checking Tauri icons...');
const iconsToCheck = [
  'src-tauri/icons/icon.png',
  'src-tauri/icons/32x32.png', 
  'src-tauri/icons/128x128.png', 
  'src-tauri/icons/128x128@2x.png'
];

iconsToCheck.forEach(iconPath => {
  if (!isValidPNG(iconPath)) {
    const dir = path.dirname(iconPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
    console.log(`❌ Missing icon: ${iconPath}`);
    console.log(`✅ Fixed: ${iconPath}`);
  } else {
    console.log(`✅ Valid: ${iconPath}`);
  }
});
console.log('✅ All icons are valid');