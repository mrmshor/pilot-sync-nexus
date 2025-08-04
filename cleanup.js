const fs = require('fs');
const path = require('path');

console.log('🧹 מנקה קבצי אייקונים...');

const iconsPath = path.join(process.cwd(), 'src-tauri', 'icons');
if (fs.existsSync(iconsPath)) {
    fs.rmSync(iconsPath, { recursive: true, force: true });
    console.log('✅ תיקיית אייקונים נמחקה');
}

console.log('🎉 ניקוי הושלם!');