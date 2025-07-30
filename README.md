# מערכת ניהול פרויקטים Pro 🚀

מערכת ניהול פרויקטים מתקדמת המותאמת לשולחן העבודה עבור macOS.

## תכונות עיקריות

- ✨ ניהול פרויקטים מתקדם עם משימות ותת-משימות
- 📊 לוח בקרה אינטראקטיבי עם נתונים חיים
- 📋 רשימת משימות מהירות בסיידבר
- 🎨 עיצוב מותאם למק עם אנימציות חלקות
- ⌨️ קיצורי דרך למקלדת (CMD+N, CMD+E, CMD+1, CMD+2)
- 📱 תמיכה מלאה בעברית (RTL)
- 🔍 חיפוש וסינון מתקדם
- 📄 ייצוא נתונים לקובץ CSV
- 💰 מעקב תשלומים ומחירים
- 📞 פעולות קשר ישירות (טלפון, וואטסאפ, מייל)
- 📁 פתיחת תיקיות בFinder

## דרישות מערכת

- macOS 10.15 (Catalina) ומעלה
- Node.js 18.0.0 ומעלה
- 4GB זכרון פנוי
- 500MB שטח פנוי בדיסק

## התקנה למק

### שלב 1: הורדת הפרויקט
```bash
git clone https://github.com/your-username/project-management-pro.git
cd project-management-pro
```

### שלב 2: התקנת dependencies
```bash
npm install
```

### שלב 3: בנייה לייצור
```bash
npm run build
```

### שלב 4: הוספת פלטפורמות native
```bash
# iOS (עבור מק)
npx cap add ios
```

### שלב 5: סנכרון הפרויקט
```bash
npx cap sync
```

### שלב 6: פתיחה ב-Xcode (למק)
```bash
npx cap open ios
```

## קיצורי מקלדת

- `⌘ + N` - יצירת פרויקט חדש
- `⌘ + E` - ייצוא נתונים לCSV
- `⌘ + 1` - מעבר ללוח בקרה
- `⌘ + 2` - מעבר לטאב פרויקטים
- `ESC` - סגירת מודלים פתוחים

## פיתוח מקומי

```bash
# הפעלה במצב פיתוח
npm run dev

# בנייה לייצור
npm run build

# בדיקת build
npm run preview
```

## הגדרות אפליקציה

הקובץ `capacitor.config.ts` מכיל את הגדרות האפליקציה:

- **App ID**: `app.lovable.c31801b6534f41cd9c671e50db5bd43a`
- **App Name**: מערכת ניהול פרויקטים Pro
- **פורט**: 5173 (פיתוח)

## שפה ותרבות

- תמיכה מלאה בעברית (RTL)
- עיצוב מותאם לתרבות המקומית
- פונטים מותאמים למק
- תמיכה בסמלי מטבע ישראליים

## תמיכה טכנית

בעיות נפוצות ופתרונות:

### בעיית הרשאות על מק
```bash
sudo xcode-select --install
```

### בעיות Node.js
```bash
# בדיקת גרסה
node --version
npm --version

# עדכון npm
npm install -g npm@latest
```

### בעיות Capacitor
```bash
# ניקוי cache
npm run clean
npx cap clean

# התקנה מחדש
rm -rf node_modules package-lock.json
npm install
npx cap sync
```

## רישיון

פרויקט זה מופץ תחת רישיון MIT.

---

**הערה**: פרויקט זה פותח במיוחד עבור macOS ומותאם לעבודה עם מסכים גדולים ואינטראקציה עם עכבר ומקלדת.

## מידע על הפרויקט המקורי

**URL**: https://lovable.dev/projects/c31801b6-534f-41cd-9c67-1e50db5bd43a

הפרויקט בנוי עם:
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Capacitor (לאפליקציה שולחנית)