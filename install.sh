#!/bin/bash

# מערכת ניהול פרויקטים Pro - סקריפט התקנה מהיר
# Quick Installation Script for Project Management Pro

set -e  # Exit on any error

echo "🚀 מתחיל התקנה של מערכת ניהול פרויקטים Pro..."
echo "🚀 Starting Project Management Pro installation..."

# בדיקת דרישות מערכת
echo "🔍 בודק דרישות מערכת..."
echo "🔍 Checking system requirements..."

# בדיקת Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן. אנא התקן Node.js 18+ מ-https://nodejs.org/"
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
echo "✅ Node.js גרסה $NODE_VERSION"
echo "✅ Node.js version $NODE_VERSION"

# בדיקת npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm לא מותקן"
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm מותקן"
echo "✅ npm found"

# בדיקת Git
if ! command -v git &> /dev/null; then
    echo "❌ Git לא מותקן. אנא התקן Git מ-https://git-scm.com/"
    echo "❌ Git not found. Please install Git from https://git-scm.com/"
    exit 1
fi

echo "✅ Git מותקן"
echo "✅ Git found"

# התקנת תלויות
echo "📦 מתקין תלויות..."
echo "📦 Installing dependencies..."

npm install

if [ $? -eq 0 ]; then
    echo "✅ תלויות הותקנו בהצלחה"
    echo "✅ Dependencies installed successfully"
else
    echo "❌ שגיאה בהתקנת תלויות"
    echo "❌ Error installing dependencies"
    exit 1
fi

# בדיקת build
echo "🔨 בונה את הפרויקט..."
echo "🔨 Building project..."

npm run build

if [ $? -eq 0 ]; then
    echo "✅ הפרויקט נבנה בהצלחה"
    echo "✅ Project built successfully"
else
    echo "❌ שגיאה בבניית הפרויקט"
    echo "❌ Error building project"
    exit 1
fi

echo ""
echo "🎉 ההתקנה הושלמה בהצלחה!"
echo "🎉 Installation completed successfully!"
echo ""
echo "📋 פקודות שימושיות:"
echo "📋 Useful commands:"
echo ""
echo "  npm run dev        # הפעלה במצב פיתוח / Start development server"
echo "  npm run build      # בנייה לייצור / Build for production"
echo "  npm run preview    # תצוגה מקדימה / Preview build"
echo "  npm run lint       # בדיקת קוד / Lint code"
echo ""
echo "💡 להפעלת השרת הפיתוח הרץ:"
echo "💡 To start the development server run:"
echo ""
echo "  npm run dev"
echo ""
echo "🌐 הפרויקט יהיה זמין ב-http://localhost:8080"
echo "🌐 Project will be available at http://localhost:8080"
echo ""

# יצירת קובץ פקודות מהירות
cat > quick-commands.sh << 'EOF'
#!/bin/bash

echo "🚀 פקודות מהירות למערכת ניהול פרויקטים Pro"
echo "🚀 Quick commands for Project Management Pro"
echo ""
echo "1. npm run dev      - הפעלת שרת פיתוח"
echo "2. npm run build    - בנייה לייצור"
echo "3. npm run preview  - תצוגה מקדימה"
echo "4. npm run lint     - בדיקת קוד"
echo ""
read -p "בחר אפשרות (1-4): " choice

case $choice in
    1)
        echo "🚀 מפעיל שרת פיתוח..."
        npm run dev
        ;;
    2)
        echo "🔨 בונה לייצור..."
        npm run build
        ;;
    3)
        echo "👀 מציג תצוגה מקדימה..."
        npm run preview
        ;;
    4)
        echo "🔍 בודק קוד..."
        npm run lint
        ;;
    *)
        echo "❌ אפשרות לא חוקית"
        ;;
esac
EOF

chmod +x quick-commands.sh

echo "📁 נוצר קובץ quick-commands.sh לפקודות מהירות"
echo "📁 Created quick-commands.sh for quick commands"
echo ""
echo "🎯 מוכן לשימוש! Ready to use!"