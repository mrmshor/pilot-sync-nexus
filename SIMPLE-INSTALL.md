# 🖥️ התקנת אפליקציית שולחן נטיבית למק

**אפליקציית שולחן מלאה עם Capacitor Mac Catalyst - ללא תלות באינטרנט**

## 🚀 התקנה קלה (5 דקות):

### אופציה 1: הורדת קובץ מוכן (מומלץ)
1. **לך ל-GitHub Actions** בפרויקט שלך
2. **לחץ על Build האחרון** (עם ✅ ירוק) 
3. **הורד** את `ProjectManager-Native-macOS-Desktop.zip`
4. **פתח את קובץ ה-DMG** 
5. **גרור את האפליקציה לתיקיית Applications** ✅

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

# 3. בנה אפליקציה (offline mode)
NODE_ENV=production npm run build

# 4. הכן לmac desktop
npx cap add ios
npx cap sync ios

# 5. פתח ב-Xcode
npx cap open ios

# בXcode: בחר Mac Catalyst → My Mac → Run
```

## ✅ מה תקבל:
- **🖥️ אפליקציית שולחן נטיבית** עם Mac Catalyst
- **📁 נתונים מקומיים** במחשב שלך (לא באינטרנט)
- **⚡ ביצועים נטיביים** למק  
- **🔐 פרטיות מלאה** - הכל במחשב שלך
- **📱 ממשק נטיבי** למק עם תפריטים
- **🔓 עבודה ללא אינטרנט** - 100% standalone
- **💾 שמירה מקומית** בתיקיות המערכת

## 🔧 פתרון בעיות נפוצות:

### "App can't be opened" 
```bash
# פתר בעיית חתימה
sudo xattr -rd com.apple.quarantine "/Applications/מערכת ניהול פרויקטים Pro.app"
```

### "Xcode not found"
```bash
xcode-select --install
```

### "Node.js too old"
הורד Node.js 20+ מ: https://nodejs.org/

### "Code signing failed" בXcode
1. Signing & Capabilities
2. שנה ל-**"Sign to Run Locally"**

---

**זו אפליקציית שולחן אמיתית עם Mac Catalyst!** 🚀

🎯 **יתרונות Mac Catalyst:**
- ✅ אפליקציית Mac נטיבית (לא web app)
- ✅ ללא תלות באינטרנט כלל
- ✅ נתונים מקומיים בלבד
- ✅ ביצועים נטיביים מלאים  
- ✅ תפריטים נטיביים למק
- ✅ התקנה רגילה דרך DMG
- ✅ שילוב מלא עם מערכת ההפעלה