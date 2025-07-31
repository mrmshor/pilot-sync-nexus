# 🍎 הוראות התקנה מפורטות למחשב Mac

## 🚀 התקנה אוטומטית (מומלץ)

### אופציה 1: הורדת קובץ מוכן (DMG)
1. **עבור לעמוד Releases** בGitHub repo
2. **הורד את הקובץ `ProjectManager-macOS.dmg`** הכי חדש
3. **פתח את קובץ ה-DMG** (לחיצה כפולה)
4. **גרור את האפליקציה** לתיקיית `Applications`
5. **פתח את האפליקציה** מתיקיית Applications

## 🔨 בניה ידנית (מפתחים)

### שלב 1: הכנת הסביבה
```bash
# ודא שיש לך את הגרסאות הנדרשות
node --version  # צריך להיות 18+
xcode-select --version  # צריך להיות מותקן

# אם Xcode לא מותקן
xcode-select --install
```

### שלב 2: שכפול והתקנה
```bash
# שכפול הפרויקט
git clone https://github.com/[YOUR_USERNAME]/[YOUR_REPO_NAME].git
cd [YOUR_REPO_NAME]

# התקנת תלויות
npm install

# בניית הפרויקט
npm run build
```

### שלב 3: הכנת אפליקציה נטיבית
```bash
# הוספת פלטפורמת iOS (עבור Mac)
npx cap add ios

# עדכון תלויות נטיביות
npx cap update ios

# סנכרון קבצים
npx cap sync ios
```

### שלב 4: פתיחה ובניה ב-Xcode
```bash
# פתיחת הפרויקט ב-Xcode
npx cap open ios
```

**ב-Xcode:**
1. **בחר Target**: `App` → `Mac (Designed for iPad)`
2. **הגדר Team**: Signing & Capabilities → בחר Team
3. **בחר Destination**: `My Mac (Designed for iPad)`
4. **הרץ**: כפתור Play (▶️) או `Cmd+R`

## 🛠 פתרון בעיות התקנה

### ❌ "Cannot open because it is from an unidentified developer"
```bash
# הרץ בטרמינל:
sudo spctl --master-disable

# או לחילופין:
sudo xattr -rd com.apple.quarantine /Applications/App.app
```

### ❌ "Xcode Command Line Tools not found"
```bash
# התקן Xcode Command Line Tools
xcode-select --install

# ודא שהתקנה תקינה
xcode-select -p
```

### ❌ "Node.js version too old"
```bash
# התקן Node.js חדש מהאתר הרשמי
# https://nodejs.org/

# או עם Homebrew:
brew install node
```

### ❌ "Permission denied" בעת התקנה
```bash
# תן הרשאות מלאות לתיקיית הפרויקט
sudo chown -R $(whoami) .
chmod -R 755 .
```

### ❌ "Code signing failed"
ב-Xcode:
1. Project Navigator → App
2. Signing & Capabilities
3. שנה Bundle Identifier להיות יחודי (לדוגמה: `com.yourname.projectmanager`)
4. בחר Team או שנה ל-"Sign to Run Locally"

### ❌ "Build failed - iOS Simulator not available"
```bash
# ודא ש-Xcode מותקן מלא (לא רק Command Line Tools)
# הורד מה-App Store: https://apps.apple.com/us/app/xcode/id497799835

# אחרי התקנה:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## 🎯 התקנה למשתמשים שלא מפתחים

### אם אין לך Xcode ולא רוצה להתקין
1. **בקש מהמפתח** לספק קובץ DMG מוכן
2. **הורד את הקובץ** מעמוד Releases ב-GitHub
3. **פתח ותגרור** לתיקיית Applications
4. **הפעל** - זהו!

### הגדרת הרשאות
אחרי ההתקנה, האפליקציה תבקש הרשאות:
1. **Files and Folders** - כדי לפתוח תיקיות ב-Finder
2. **Camera** (אופציונלי) - להוספת תמונות לפרויקטים

## 📱 הפעלה ושימוש ראשון

### הפעלה ראשונה
1. **פתח את האפליקציה** מתיקיית Applications
2. **אשר הרשאות** אם נדרש
3. **המתן לטעינה** (רגעים אחדים)
4. **ברוך הבא!** - האפליקציה מוכנה לשימוש

### הוספת לוגו מותאם
1. **לחץ על "העלה לוגו"** בתפריט העליון
2. **בחר קובץ תמונה** (PNG/JPG, עד 2MB)
3. **הלוגו יישמר** אוטומטית למשתמש הנוכחי

### יצירת פרויקט ראשון
1. **לחץ על כפתור "+"** או `Cmd+N`
2. **מלא פרטי פרויקט** (שם, לקוח, מחיר)
3. **הוסף נתיב תיקייה** לפרויקט (אופציונלי)
4. **שמור** - הפרויקט מוכן!

## 🔄 עדכון האפליקציה

### עדכון אוטומטי (אם זמין)
- האפליקציה תודיע על עדכונים זמינים
- לחץ "עדכן" ההורדה תתחיל אוטומטית

### עדכון ידני
1. **עבור לעמוד GitHub** של הפרויקט
2. **הורד גירסה חדשה** מעמוד Releases
3. **החלף את האפליקציה** בתיקיית Applications
4. **הפעל מחדש** - כל הנתונים יישמרו

## 💾 גיבוי נתונים

### מיקום קבצי נתונים
הנתונים נשמרים ב:
```
~/Library/Containers/[APP_BUNDLE_ID]/Data/Documents/
```

### יצירת גיבוי
```bash
# יצירת גיבוי של כל הנתונים
cp -R "~/Library/Containers/app.lovable.*/Data/Documents/" ~/Desktop/ProjectManager-Backup/
```

### שחזור גיבוי
```bash
# שחזור מגיבוי
cp -R ~/Desktop/ProjectManager-Backup/* "~/Library/Containers/app.lovable.*/Data/Documents/"
```

## 🚀 קיצורי דרך שימושיים

### קיצורי מקלדת
- `Cmd+N` - פרויקט חדש
- `Cmd+E` - ייצוא לCSV
- `Cmd+1` - דאשבורד
- `Cmd+2` - פרויקטים
- `Cmd+Q` - יציאה מהאפליקציה

### קיצורי עכבר
- **לחיצה כפולה על פרויקט** - עריכה מהירה
- **לחיצה ימנית** - תפריט הקשר
- **גלילה** - ניווט ברשימות ארוכות

---

## 🆘 קבלת עזרה

### בעיות טכניות
1. **בדוק את לוגי הקונסול** ב-Console.app (Applications → Utilities)
2. **נסה הפעלה מחדש** של האפליקציה
3. **בדוק עדכונים** באתר הפרויקט

### יצירת קשר
- **GitHub Issues**: דווח על באגים ובעיות
- **Email**: [הוסף כתובת מייל אם רלוונטי]
- **תיעוד מלא**: קרא את README.md לפרטים נוספים

---

**✅ בהצלחה! האפליקציה מוכנה לשימוש על המק שלך**