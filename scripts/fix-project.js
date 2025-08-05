#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 מתחיל תיקון מלא של פרויקט Capacitor...');

// שלב 1: ניקוי
console.log('🧹 מנקה קבצים ישנים...');
const cleanDirs = ['node_modules', 'dist', 'ios', 'android', '.capacitor'];
const cleanFiles = ['package-lock.json', 'yarn.lock'];

cleanDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
        console.log(`🗑️ מוחק: ${dir}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
    }
});

cleanFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
        console.log(`🗑️ מוחק: ${file}`);
        fs.unlinkSync(fullPath);
    }
});

// שלב 2: התקנה
console.log('📦 מתקין dependencies...');
execSync('npm install', { stdio: 'inherit' });

// שלב 3: בניה ראשונית
console.log('🔨 בונה פרויקט...');
execSync('npm run build', { stdio: 'inherit' });

// שלב 4: הוספת פלטפורמות
console.log('📱 מוסיף פלטפורמת iOS...');
execSync('npx cap add ios', { stdio: 'inherit' });

// שלב 5: סנכרון
console.log('🔄 מסנכרן עם Capacitor...');
execSync('npx cap sync', { stdio: 'inherit' });

// שלב 6: בדיקה
console.log('🩺 בודק תקינות...');
execSync('npx cap doctor', { stdio: 'inherit' });

console.log('');
console.log('🎉 תיקון הושלם בהצלחה!');
console.log('');
console.log('📋 פקודות זמינות:');
console.log('  npm run dev              - פיתוח (localhost:8080)');
console.log('  npm run cap:build        - בניה + סנכרון');
console.log('  npm run cap:run:ios      - הרצה על Mac');
console.log('  npm run cap:live         - live reload על Mac');
console.log('  npm run cap:open:ios     - פתיחה ב-Xcode');