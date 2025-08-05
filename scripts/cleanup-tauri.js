#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 מנקה שאריות Tauri מהפרויקט...');

const foldersToDelete = ['src-tauri', '.tauri'];
const filesToDelete = ['tauri.conf.json', 'Cargo.toml', 'Cargo.lock', 'build.rs'];

console.log('🗑️ מוחק תיקיות...');
foldersToDelete.forEach(folder => {
    const fullPath = path.join(process.cwd(), folder);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✓ מוחק תיקייה: ${folder}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
});

console.log('🗑️ מוחק קבצים...');
filesToDelete.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
        console.log(`   ✓ מוחק קובץ: ${file}`);
        fs.unlinkSync(fullPath);
    }
});

console.log('✅ ניקוי הושלם! הפרויקט נקי משאריות Tauri.');