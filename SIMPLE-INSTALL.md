# 🖥️ התקנת אפליקציית שולחן נטיבית למק

**אפליקציית שולחן נטיבית אמיתית עם Tauri (Rust + React) - ללא תלות באינטרנט**

## 🚀 התקנה קלה (3 דקות):

### אופציה 1: הורדת קובץ מוכן (מומלץ)
1. **לך ל-GitHub Actions** בפרויקט שלך
2. **לחץ על Build האחרון** (עם ✅ ירוק)
3. **הורד את הקובץ המתאים למחשב שלך:**
   - **Intel Mac**: `ProjectManager-Native-Desktop-Intel.dmg`
   - **Apple Silicon (M1/M2/M3)**: `ProjectManager-Native-Desktop-AppleSilicon.dmg`
4. **פתח את קובץ ה-DMG** וגרור לתיקיית Applications ✅

### אופציה 2: בנייה מקומית
```bash
# וודא שיש לך Rust מותקן
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# הורד והרץ את סקריפט הבנייה
curl -O https://raw.githubusercontent.com/mrmshor/pilot-sync-nexus/main/install-mac.sh
chmod +x install-mac.sh
./install-mac.sh
```

### אופציה 3: בנייה ידנית
```bash
# 1. התקן Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. שכפל הקוד
git clone https://github.com/mrmshor/pilot-sync-nexus.git
cd pilot-sync-nexus

# 3. התקן תלויות
npm install

# 4. התקן Tauri CLI
cargo install tauri-cli

# 5. בנה אפליקציה
npm run build

# 6. בנה אפליקציית שולחן נטיבית
cargo tauri build
```

## ✅ מה תקבל:
- **🖥️ אפליקציית Mac נטיבית אמיתית** בנויה ב-Rust
- **📁 נתונים מקומיים בלבד** - אף פעם לא נשלח לאינטרנט
- **⚡ ביצועים מקסימליים** - קוד נטיבי מקומפל
- **🔐 פרטיות מלאה** - הכל במחשב שלך בלבד
- **📱 ממשק נטיבי מלא** עם תפריטי Mac
- **🔓 עבודה ללא אינטרנט** - 100% standalone
- **💾 שמירה בתיקיות מערכת** - `~/Library/Application Support/ProjectManagerPro`
- **🦀 בנוי ב-Rust** - ביטחון ויעילות מקסימליים

## 🔧 פתרון בעיות נפוצות:

### "App can't be opened"
```bash
# פתר בעיית חתימה
sudo xattr -rd com.apple.quarantine "/Applications/מערכת ניהול פרויקטים Pro.app"
```

### "Rust not found"
```bash
# התקן Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

### "Node.js too old"
הורד Node.js 20+ מ: https://nodejs.org/

---

**זו אפליקציית שולחן נטיבית אמיתית עם Tauri!** 🚀

🎯 **יתרונות Tauri על פני Capacitor:**
- ✅ **אפליקציית Mac נטיבית 100%** (לא web wrapper)
- ✅ **קובץ קטן ומהיר** - ללא Chrome engine
- ✅ **ביטחון מקסימלי** - Rust + sandbox
- ✅ **ביצועים מעולים** - קוד מקומפל
- ✅ **זיכרון נמוך** - ללא browser overhead
- ✅ **שילוב מלא עם macOS** - תפריטים, הודעות, קבצים
- ✅ **עדכונים אוטומטיים** - מובנה בTauri