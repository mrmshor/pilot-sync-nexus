#!/bin/bash

echo "🚀 מתקין אפליקציית שולחן נטיבית למק..."

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

echo "🔨 בונה אפליקציה..."
npm run build

echo "📱 מכין אפליקציה נטיבית לשולחן..."
npx cap add ios
npx cap sync ios

# הגדרות נוספות לאפליקציית שולחן
echo "⚙️ מגדיר אפליקציית שולחן נטיבית..."

echo "🍎 פותח ב-Xcode להתקנה סופית..."
npx cap open ios

echo ""
echo "🎯 כמעט סיימנו!"
echo ""
echo "בXcode:"
echo "1. בחר Target: Mac (Designed for iPad)"
echo "2. בחר Destination: My Mac (Mac Catalyst)"
echo "3. וודא שזה NOT Simulator"
echo "4. לחץ Play (▶️) או Cmd+R"
echo ""
echo "🖥️ האפליקציה תותקן כאפליקציית שולחן מלאה! 🎉"
echo ""
echo "💡 טיפ: אם יש שגיאת חתימה, בSigning & Capabilities שנה ל-'Sign to Run Locally'"
echo "📁 הנתונים יישמרו מקומית במחשב שלך (לא באינטרנט)"