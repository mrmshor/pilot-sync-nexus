# 🖥️ התקנת אפליקציית שולחן נטיבית למק

**אפליקציית שולחן מלאה עם Electron - ללא תלות באינטרנט**

## 🚀 התקנה קלה (3 דקות):

### אופציה 1: הורדת קובץ מוכן (מומלץ)
1. **לך ל-GitHub Actions** בפרויקט שלך
2. **לחץ על Build האחרון** (עם ✅ ירוק)
3. **הורד** את `ProjectManager-macOS-Native.zip`
4. **פתח את קובץ ה-DMG** והשתמש בו להתקנה
5. **גרור לתיקיית Applications** ✅

### אופציה 2: בנייה מקומית
```bash
# הורד והרץ את סקריפט הבנייה
curl -O https://raw.githubusercontent.com/mrmshor/pilot-sync-nexus/main/install-mac.sh
chmod +x install-mac.sh
./install-mac.sh
```

### אופציה 3: בנייה ידנית
```bash
# 1. שכפל הקוד
git clone https://github.com/mrmshor/pilot-sync-nexus.git
cd pilot-sync-nexus

# 2. התקן תלויות
npm install

# 3. התקן Electron
npm install electron electron-builder --save-dev

# 4. בנה אפליקציה
npm run build

# 5. בנה אפליקציית שולחן
npx electron-builder --mac --publish=never
```

## ✅ מה תקבל:
- **🖥️ אפליקציית שולחן מלאה** עם Electron
- **📁 נתונים מקומיים** במחשב שלך (לא באינטרנט) 
- **⚡ ביצועים נטיביים** למק
- **🔐 פרטיות מלאה** - הכל במחשב שלך
- **📱 ממשק נטיבי** עם תפריטים למק
- **🔓 עבודה ללא אינטרנט** - 100% standalone

## 🔧 פתרון בעיות נפוצות:

### "App can't be opened"
```bash
# פתר בעיית חתימה
sudo xattr -rd com.apple.quarantine "/Applications/מערכת ניהול פרויקטים Pro.app"
```

### "Node.js not found"
הורד Node.js 20+ מ: https://nodejs.org/

### "Build failed"
```bash
# נקה והתקן מחדש
rm -rf node_modules package-lock.json
npm install
```

---

**זו אפליקציית שולחן אמיתית עם Electron!** 🚀

🎯 **יתרונות Electron:**
- ✅ אפליקציית שולחן מלאה (לא web app)
- ✅ ללא תלות באינטרנט
- ✅ נתונים מקומיים במחשב
- ✅ ביצועים נטיביים
- ✅ תפריטים נטיביים למק
- ✅ התקנה רגילה דרך DMG