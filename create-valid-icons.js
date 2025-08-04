import fs from 'fs';
import path from 'path';

// Valid minimal PNG data - 1x1 pixel transparent PNG
const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
const validPngBuffer = Buffer.from(validPngBase64, 'base64');

// Simple 32x32 blue square PNG
const icon32Base64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAiklEQVRYhe2XwQ6AIAwE6/8/2jdIE4hNOhyMneTGQfZMd0sIubBTBfjtgSVW2+1VBVQaBBo0Gn0j+XWt7PZqNBpNK/k1pdNo0Gg0bdLotJI/iEaj0bRJo9O0kj+IRqPRtJJf00p+TSv5Na3k17SSX9NKfk0r+TWt5Ne0kl/TSn5NK/k1reTXtJJf00p+TSv5NK3k17SSX0H+IA+gBw==';
const icon32Buffer = Buffer.from(icon32Base64, 'base64');

// Create icons directory if it doesn't exist
const iconsDir = 'src-tauri/icons';
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Create all required icon files
const iconFiles = [
    { path: 'src-tauri/icons/icon.png', buffer: validPngBuffer },
    { path: 'src-tauri/icons/32x32.png', buffer: icon32Buffer },
    { path: 'src-tauri/icons/128x128.png', buffer: validPngBuffer },
    { path: 'src-tauri/icons/128x128@2x.png', buffer: validPngBuffer }
];

iconFiles.forEach(({ path, buffer }) => {
    fs.writeFileSync(path, buffer);
    console.log(`✅ Created valid icon: ${path}`);
});

console.log('✅ All icons created successfully!');