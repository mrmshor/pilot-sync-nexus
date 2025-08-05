#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 מנקה שאריות Tauri...');

const foldersToDelete = ['src-tauri', '.tauri'];
const filesToDelete = ['tauri.conf.json', 'Cargo.toml', 'Cargo.lock'];

foldersToDelete.forEach(folder => {
    const fullPath = path.join(process.cwd(), folder);
    if (fs.existsSync(fullPath)) {
        console.log(`🗑️ מוחק: ${folder}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
});

filesToDelete.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
        console.log(`🗑️ מוחק: ${file}`);
        fs.unlinkSync(fullPath);
    }
});

console.log('✅ ניקוי הושלם!');