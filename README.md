# Pilot Sync Nexus

[![Capacitor Build Check](https://github.com/YOUR_USERNAME/pilot-sync-nexus/actions/workflows/capacitor-build.yml/badge.svg)](https://github.com/YOUR_USERNAME/pilot-sync-nexus/actions/workflows/capacitor-build.yml)
[![Code Quality Check](https://github.com/YOUR_USERNAME/pilot-sync-nexus/actions/workflows/code-quality.yml/badge.svg)](https://github.com/YOUR_USERNAME/pilot-sync-nexus/actions/workflows/code-quality.yml)

מערכת ניהול פרויקטים מתקדמת עם Capacitor + React + TypeScript.

## 🚀 פקודות נכונות:

### פיתוח:
```bash
npm run dev     # http://localhost:8080 (לא 5173!)
```

### בניה והרצה:
```bash
npm run build          # בניה
npx cap sync           # סנכרון עם iOS
npx cap run ios        # הרצה על Mac
npx cap open ios       # פתיחה ב-Xcode
```

### בדיקת תקינות:
```bash
npx cap doctor
npm run lint
npx tsc --noEmit
```

⚠️ **חשוב**: הפרויקט רץ על פורט 8080, לא 5173!

## 🛠️ פתרון בעיות נפוצות

### בעיית Build:
```bash
rm -rf dist
npm run build
npx cap sync ios
```

### בעיית Dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### בעיות iOS:
```bash
npx cap clean ios
npx cap add ios
npx cap sync ios
```

## 📋 מבנה פרויקט
```
pilot-sync-nexus/
├── src/
│   ├── components/       # רכיבי React
│   ├── hooks/           # Custom hooks + Capacitor optimizations
│   ├── utils/           # כלים + Safe Memory
│   └── main.tsx         # Entry point
├── ios/                 # פרויקט iOS נטיבי
├── capacitor.config.ts  # תצורת Capacitor
├── vite.config.ts       # תצורת Vite
└── scripts/            # סקריפטי עזר
```

## 🎯 טכנולוגיות
- **Frontend**: React 18 + TypeScript + Vite
- **Mobile**: Capacitor 5 + iOS
- **Platform**: macOS (Designed for iPad)
- **Styling**: Tailwind CSS + SWC
- **Port**: 8080

## ⚡ פיצ'רים מתקדמים
- ✅ TypeScript מלא עם Capacitor types
- ✅ Error handling ו-Safe Memory management
- ✅ Performance optimizations
- ✅ Platform-specific optimizations
- ✅ Health check ו-Diagnostics

## 🔍 Debug ו-Troubleshooting
- בדוק logs ב-Console
- השתמש ב-SafeMemoryManager לניהול זיכרון
- הרץ health-check.js לבדיקה מקיפה
- בדוק cap doctor לבעיות Capacitor

הפרויקט מותאם במיוחד ל-macOS עם אינטגרציה עמוקה של Capacitor.