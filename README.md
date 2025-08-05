# Pilot Sync Nexus - Capacitor App

## פקודות הרצה (מעודכנות):

### פיתוח:
```bash
npm run dev
```

### בניה והרצה על Mac:
```bash
npm run cap:build
npm run cap:run:ios
```

### פתיחה ב-Xcode:
```bash
npm run cap:open:ios
```

### בדיקת תקינות:
```bash
npm run cap:doctor
```

## הערה חשובה:
הפרויקט מבוסס על **Capacitor** ולא Tauri. השתמש בפקודות cap: במקום tauri.

## 🌟 תכונות עיקריות

### ✅ ניהול פרויקטים מתקדם
- ניהול פרויקטים עם משימות ותת-משימות
- מעקב סטטוס ועדיפויות
- מעקב תשלומים ומחירים
- ניהול לקוחות עם פרטי קשר מלאים

### ✅ אינטגרציה נטיבית למק
- **פתיחת תיקיות ישירה ב-Finder**
- שמירת נתונים מקומית בטוחה
- אופטימיזציה לביצועים במחשב שולחני
- תמיכה בקיצורי מקלדת מק

### ✅ ממשק משתמש מתקדם
- לוח בקרה אינטראקטיבי עם נתונים חיים
- עיצוב מותאם למק עם אנימציות חלקות
- תמיכה מלאה בעברית (RTL)
- רספונסיבי לכל גדלי מסך

### ✅ יכולות מתקדמות
- חיפוש וסינון חכם עם debouncing
- ייצוא נתונים לקובץ CSV
- פעולות קשר ישירות (טלפון, וואטסאפ, מייל)
- לוגו מותאם אישית עם שמירה קבועה

## 🚀 התקנה מהירה למחשב Mac

### דרישות מערכת
- **macOS 11.0 ואילך (Big Sur או חדש יותר)**
- **Xcode 14.0 ואילך** (נדרש להתקנה) - [הורד מה-App Store](https://apps.apple.com/us/app/xcode/id497799835)
- **Node.js 18 ואילך** - [הורד כאן](https://nodejs.org/)
- **Git** - [הורד כאן](https://git-scm.com/)
- **4GB זכרון פנוי**
- **1GB שטח פנוי בדיסק**

### שלב 1: הורדת הקוד 📥
```bash
# שכפול הפרויקט (החלף עם ה-URL של ה-repo שלך)
git clone [YOUR_GITHUB_REPO_URL]
cd pilot-sync-nexus

# התקנת התלויות
npm install
```

### שלב 2: הכנת האפליקציה הנטיבית 🔨
```bash
# בניית הפרויקט
npm run build

# הוספת פלטפורמת iOS למחשבי Mac
npx cap add ios

# עדכון התלויות הנטיביות
npx cap update ios

# סנכרון הקוד לאפליקציה הנטיבית
npx cap sync ios
```

### שלב 3: פתיחת הפרויקט ב-Xcode 🛠
```bash
# פתיחת הפרויקט ב-Xcode
npx cap open ios
```

### שלב 4: הגדרה ב-Xcode ⚙️
1. **בחר Target**: בתפריט העליון של Xcode, בחר `App` → `Mac (Designed for iPad)`
2. **הגדר צוות פיתוח**: 
   - Project Navigator → App → Signing & Capabilities
   - בחר Team (אם אין לך, צור Apple Developer Account)
3. **שנה Bundle Identifier** (אופציונלי):
   - במידת הצורך, שנה את ה-Bundle Identifier להיות יחודי
   - לדוגמה: `com.yourcompany.projectmanager`
4. **ודא הרשאות**: ודא שההרשאות הבאות מופעלות:
   - File System Access
   - Network Access

### שלב 5: בניה והתקנה 🎯
1. **בחר יעד**: בתפריט העליון של Xcode, בחר `My Mac (Designed for iPad)`
2. **הרץ**: לחץ על כפתור ה-Play (▶️) או לחץ `Cmd+R`
3. **התקנה**: האפליקציה תיבנה ותותקן אוטומטי במחשב שלך

## 🔧 פיתוח מקומי

### הרצה במצב פיתוח
```bash
# שרת פיתוח (יפתח בדפדפן)
npm run dev

# בטאב/חלון טרמינל נפרד - סנכרון לאפליקציה נטיבית
npm run build
npx cap sync ios
npx cap run ios
```

### עדכון האפליקציה אחרי שינויים
```bash
# אחרי כל שינוי בקוד
npm run build
npx cap sync ios
# ואז הרץ שוב ב-Xcode או npx cap run ios
```

## 📱 יכולות מיוחדות למק

### 🗂 פתיחת תיקיות מקומיות
- לחיצה על כפתור "פתח תיקייה" פותחת ישירות ב-Finder
- תמיכה מלאה בנתיבי תיקיות של macOS
- בחירת תיקיות חדשות באמצעות סייר הקבצים הנטיבי

### 💾 שמירת נתונים מקומית ובטוחה
- כל הנתונים נשמרים במחשב המקומי (לא בענן)
- גיבוי אוטומטי של כל השינויים
- לוגו מותאם אישית נשמר בקובץ מקומי

### ⌨️ קיצורי מקלדת מק
- `Cmd+N` - פרויקט חדש
- `Cmd+E` - ייצוא נתונים לCSV
- `Cmd+1` - מעבר לדאשבורד
- `Cmd+2` - מעבר לפרויקטים
- `ESC` - סגירת חלונות קופצים

### 🎨 ממשק מותאם למק
- עיצוב שמשתלב עם סגנון macOS
- תמיכה בצבעי המערכת ומצב כהה/בהיר
- אנימציות חלקות המותאמות למק
- גופנים עבריים איכותיים

## 🛠 פתרון בעיות נפוצות

### האפליקציה לא נפתחת ❌
```bash
# נקה את הבניה ובנה מחדש
rm -rf dist ios/App/App/public
npm run build
npx cap sync ios
```

### בעיות הרשאות macOS 🔒
1. פתח `System Preferences` → `Security & Privacy`
2. בטאב `Privacy`, הוסף את האפליקציה ל-`Files and Folders`
3. אשר גישה לתיקיות שברצונך לפתוח
4. הפעל מחדש את האפליקציה

### Xcode לא מוצא קבצים 📁
```bash
# ודא שהקבצים עודכנו
npx cap sync ios
# ב-Xcode: Product → Clean Build Folder (Cmd+Shift+K)
```

### עדכון התלויות 🔄
```bash
# עדכון חבילות NPM
npm update

# עדכון Capacitor
npx cap update ios
npx cap sync ios

# במקרה של בעיות - התקנה מחדש מלאה
rm -rf node_modules package-lock.json
npm install
npx cap sync ios
```

### בעיות Node.js 🟢
```bash
# בדיקת גרסה (צריך להיות 18+)
node --version
npm --version

# עדכון npm
npm install -g npm@latest

# אם יש בעיות גרסה, התקן Node.js מחדש מהאתר הרשמי
```

## 📝 פקודות זמינות

```bash
npm run dev          # שרת פיתוח (http://localhost:5173)
npm run build        # בניית פרודקשן
npm run preview      # תצוגה מקדימה של הבניה
npm run lint         # בדיקת איכות קוד
npx cap sync         # סנכרון עם הפלטפורמה הנטיבית
npx cap run ios      # הרצה על מק (אחרי build)
npx cap open ios     # פתיחה ב-Xcode
```

## 🏗 מבנה הפרויקט

```
pilot-sync-nexus/
├── src/
│   ├── components/         # רכיבי React
│   │   ├── ui/            # רכיבי UI בסיסיים (shadcn)
│   │   ├── ProjectManagementApp.tsx    # הרכיב הראשי
│   │   ├── EnhancedDashboard.tsx       # לוח הבקרה
│   │   └── ...            # רכיבים נוספים
│   ├── pages/             # עמודי האפליקציה
│   ├── hooks/             # React hooks מותאמים
│   ├── utils/             # פונקציות עזר וניהול זיכרון
│   ├── types/             # הגדרות TypeScript
│   └── services/          # שירותי נתונים
├── ios/                   # קוד iOS נטיבי (נוצר אוטומטית)
├── public/               # קבצים סטטיים
├── capacitor.config.ts   # הגדרות Capacitor
├── tailwind.config.ts    # הגדרות Tailwind CSS
└── package.json          # תלויות ופקודות
```

## ⚡ אופטימיזציות ביצועים

### לכמויות גדולות של נתונים
- **רינדור וירטואלי**: רק הפרויקטים הנראים נטענים בזיכרון
- **חיפוש עם Debouncing**: חיפוש מהיר בלי איטיות
- **מטמון חכם**: תמונות ונתונים נשמרים בזיכרון למהירות
- **ניהול זיכרון אוטומטי**: מניעת איטיות וקריסות

### הגדרות מתקדמות
- בקובץ `src/utils/memoryManager.ts` ניתן להתאים את הגדרות הזיכרון
- בקובץ `src/hooks/usePerformanceOptimizations.ts` ניתן להתאים את האופטימיזציות

## 🔒 אבטחה ופרטיות

- **שמירה מקומית בלבד**: כל הנתונים נשמרים במחשב המקומי
- **ללא שליחת נתונים**: האפליקציה לא שולחת נתונים לשרתים חיצוניים
- **הצפנה מקומית**: נתונים רגישים מוצפנים ברמת הקובץ
- **גיבוי בטוח**: אפשרות לגבות ולשחזר נתונים

## 📞 תמיכה והדרכה

### בעיות נפוצות
1. **"Cannot find Xcode"**: התקן Xcode מה-App Store
2. **"Node version too old"**: עדכן Node.js לגרסה 18+
3. **"Permission denied"**: הרץ עם `sudo` או שנה הרשאות תיקיה
4. **אפליקציה לא נפתחת**: נקה build ובנה מחדש

### קבלת עזרה
- בדוק את לוגי הקונסול ב-Xcode בתפריט View → Debug Area → Console
- ודא שכל הדרישות המערכת מתקיימות
- נסה לבנות מחדש את הפרויקט בצעדים הבאים:

```bash
# נקה הכל ובנה מחדש
rm -rf node_modules package-lock.json dist ios
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## 🎯 תכונות מתקדמות

### ניהול פרויקטים
- יצירה, עריכה ומחיקה של פרויקטים
- הוספת משימות ותת-משימות
- מעקב התקדמות בזמן אמת
- ניהול תאריכי יעד ועדיפויות

### ניהול לקוחות
- פרטי קשר מלאים (טלפון, וואטסאפ, מייל)
- לחיצה ישירה לשיחה או הודעה
- מעקב תשלומים ומחירים
- קישור לתיקיות פרויקט

### דוחות ונתונים
- לוח בקרה עם סטטיסטיקות
- ייצוא נתונים לקובץ CSV
- מעקב התקדמות בגרפים
- דוחות תשלומים

---

**גירסה**: 1.0.0  
**פלטפורמה**: macOS (iPad App on Mac)  
**טכנולוגיות**: React + TypeScript + Capacitor + Tailwind CSS + shadcn/ui

**הערה חשובה**: פרויקט זה פותח במיוחד עבור macOS ומותאם לעבודה עם מסכים גדולים, עכבר, מקלדת ואינטגרציה עמוקה עם מערכת ההפעלה.

---

### 🚀 פרויקט Lovable מקורי
**URL**: https://lovable.dev/projects/c31801b6-534f-41cd-9c67-1e50db5bd43a

להמשך פיתוח וחזרה לעריכה מקוונת, בקר בקישור לעיל.