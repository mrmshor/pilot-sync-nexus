#!/bin/bash

echo "🚀 מתקין מערכת ניהול פרויקטים Pro למק..."

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

echo "📱 מכין אפליקציה נטיבית..."
npx cap add ios
npx cap sync ios

echo "🍎 פותח ב-Xcode להתקנה סופית..."
npx cap open ios

echo ""
echo "🎯 כמעט סיימנו!"
echo ""
echo "בXcode:"
echo "1. בחר Target: Mac (Designed for iPad)"
echo "2. בחר Destination: My Mac"
echo "3. לחץ Play (▶️) או Cmd+R"
echo ""
echo "האפליקציה תותקן אוטומטית! 🎉"
echo ""
echo "💡 טיפ: אם יש שגיאת חתימה, בSignin & Capabilities שנה ל-'Sign to Run Locally'"