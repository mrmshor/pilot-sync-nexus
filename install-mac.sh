#!/bin/bash

echo "🖥️ בונה אפליקציית שולחן נטיבית למק עם Capacitor..."

# בדיקת דרישות
if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן. הורד מ: https://nodejs.org/"
    exit 1
fi

if ! command -v xcode-select &> /dev/null; then
    echo "❌ Xcode Command Line Tools לא מותקן."
    echo "הרץ: xcode-select --install"
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

echo "🔨 בונה אפליקציית React (offline mode)..."
NODE_ENV=production npm run build

echo "🖥️ מכין אפליקציית שולחן נטיבית..."
npx cap add ios
npx cap sync ios

echo "⚙️ מגדיר אפליקציית שולחן נטיבית (לא web app)..."