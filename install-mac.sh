#!/bin/bash

echo "🖥️ בונה אפליקציית שולחן נטיבית למק עם Tauri..."

# בדיקת דרישות
if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן. הורד מ: https://nodejs.org/"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "❌ Rust לא מותקן. הורד מ: https://rustup.rs/"
    echo "מתקין Rust עכשיו..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source ~/.cargo/env
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

echo "📦 מתקין תלויות Node.js..."
npm install

echo "🦀 מתקין Tauri CLI..."
cargo install tauri-cli --version "^1.0"

echo "📁 מוסיף תלויות Rust..."
cd src-tauri
cargo add dirs
cd ..

echo "🔨 בונה אפליקציית React..."
npm run build

echo "🖥️ בונה אפליקציית שולחן נטיבית עם Tauri..."
cargo tauri build

echo ""
echo "🎉 הבנייה הושלמה!"
echo ""
echo "📁 קבצי ההתקנה נמצאים ב: src-tauri/target/release/bundle/"
echo "🖥️ חפש קובץ DMG בתיקייה!"
echo ""
echo "✅ זוהי אפליקציית שולחן נטיבית אמיתית:"
echo "   - 🔓 לא דורשת אינטרנט כלל"
echo "   - 💾 נתונים שמורים מקומית במחשב"
echo "   - ⚡ ביצועים נטיביים מלאים"
echo "   - 🖥️ אפליקציית Mac אמיתית"
echo "   - 🦀 בנויה ב-Rust + React"