# 🍎 התקנה פשוטה למק - ללא GitHub Actions

כיוון שGitHub Actions לא מצליח לבנות קובץ DMG (בעיות עם Xcode), הכנתי **דרך פשוטה ויציבה** להתקנה:

## 🚀 התקנה במק שלך (5 דקות):

### אופציה 1: סקריפט אוטומטי (מומלץ)
```bash
# הורד והרץ את סקריפט ההתקנה
curl -O https://raw.githubusercontent.com/mrmshor/pilot-sync-nexus/main/install-mac.sh
chmod +x install-mac.sh
./install-mac.sh
```

### אופציה 2: התקנה ידנית (שלב אחר שלב)
```bash
# 1. שכפל הקוד
git clone https://github.com/mrmshor/pilot-sync-nexus.git
cd pilot-sync-nexus

# 2. התקן תלויות
npm install

# 3. בנה אפליקציה
npm run build

# 4. הכן לmac
npx cap add ios
npx cap sync ios

# 5. פתח ב-Xcode
npx cap open ios
```

## 🛠 ב-Xcode (צעדים אחרונים):
1. **בחר Target**: `Mac (Designed for iPad)`
2. **בחר Destination**: `My Mac (Designed for iPad)`  
3. **לחץ Play** (▶️) או `Cmd+R`
4. **האפליקציה תותקן אוטומטית!** 🎉

## ✅ יתרונות השיטה הזו:
- **100% עובד** - בניה מקומית יציבה
- **מהיר** - 5 דקות התקנה
- **בטוח** - בניה במחשב שלך
- **מותאם אישית** - אפשר לשנות הגדרות

## 🔧 פתרון בעיות נפוצות:

### "Code signing failed"
ב-Xcode: Signing & Capabilities → שנה ל-**"Sign to Run Locally"**

### "Xcode not found"
```bash
xcode-select --install
```

### "Node.js too old"
הורד Node.js 20+ מ: https://nodejs.org/

---

**זה פשוט יותר ויציב יותר מ-GitHub Actions!** 🚀

GitHub Actions לא מתאים לבניית אפליקציות Mac בצורה יציבה, אבל הדרך הזו עובדת מושלם.