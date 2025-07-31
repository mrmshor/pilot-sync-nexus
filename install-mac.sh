#!/bin/bash

echo "🖥️ בונה אפליקציית שולחן נטיבית למק עם Electron..."

# בדיקת דרישות
if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן. הורד מ: https://nodejs.org/"
    exit 1
fi

echo "✅ בודק דרישות מערכת..."

# יצירת תיקיית התקנה
INSTALL_DIR="$HOME/ProjectManager-Pro"
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# שכפול הקוד (אם עוד לא קיים)
if [ ! -d ".git" ]; then
    echo "📥 מוריד קוד מ-GitHub..."
    git clone https://github.com/mrmshor/pilot-sync-nexus.git .
fi

echo "📦 מתקין תלויות..."
npm install

echo "📦 מתקין Electron..."
npm install electron electron-builder concurrently wait-on --save-dev

echo "🔨 בונה אפליקציית React..."
npm run build

echo "🖥️ בונה אפליקציית שולחן נטיבית..."
npx electron-builder --mac --publish=never

echo ""
echo "🎉 הבנייה הושלמה!"
echo ""
echo "📁 קובץ ההתקנה נמצא ב: dist-electron/"
echo "🖥️ פתח את קובץ ה-DMG והשתמש בו להתקנה!"
echo ""
echo "✅ זוהי אפליקציית שולחן מלאה:"
echo "   - 🔓 לא דורשת אינטרנט"
echo "   - 💾 נתונים שמורים מקומית"
echo "   - ⚡ ביצועים נטיביים"
echo "   - 🖥️ מותקנת כאפליקציה רגילה"