# Design System - Hebrew Project Management

חבילת עיצוב מלאה עבור אפליקציית ניהול פרויקטים בעברית עם תמיכה RTL ועיצוב בסגנון macOS.

## 📁 מבנה הקבצים

```
design-system/
├── design-tokens.css      # משתני עיצוב בסיסיים (צבעים, גרדיאנטים, צללים)
├── base-styles.css        # סגנונות בסיס (RTL, גופנים, פוקוס)
├── utility-classes.css    # קלאסים שימושיים (אפקטים, אינדיקטורים)
├── animations.css         # מערכת אנימציות (keyframes, transitions)
├── components-styles.css  # סגנונות קומפוננטים ספציפיים
└── README.md             # מדריך זה
```

## 🎨 מערכת הצבעים

### צבעים בסיסיים
- `--primary`: כחול ראשי (220 70% 55%)
- `--secondary`: אפור משני (210 40% 96%) 
- `--success`: ירוק הצלחה (142 71% 45%)
- `--warning`: כתום אזהרה (38 92% 50%)
- `--destructive`: אדום סכנה (0 84% 60%)

### גרדיאנטים
- `--gradient-primary`: גרדיאנט כחול-סגול
- `--gradient-success`: גרדיאנט ירוק
- `--gradient-warning`: גרדיאנט כתום
- `--gradient-danger`: גרדיאנט אדום

## 🌓 תמיכה במצב כהה

כל הצבעים מוגדרים עם תמיכה במצב כהה באמצעות קלאס `.dark`.

## ✨ אפקטים ויזואליים

### Glass Effect
```css
.glass {
  backdrop-filter: blur(12px);
  background: hsl(var(--background) / 0.8);
  border: 1px solid hsl(var(--border) / 0.5);
}
```

### macOS Card Style
```css
.card-macos {
  background: hsl(var(--card) / 0.95);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: var(--shadow-medium);
}
```

## 🎭 אנימציות

### אנימציות בסיסיות
- `animate-float`: תנועה צפה
- `animate-pulse-glow`: דפיקה עם זוהר
- `animate-slide-up`: החלקה למעלה
- `animate-fade-in`: דהייה פנימה

### אנימציות אינטראקטיביות
- `hover-scale`: הגדלה בהובר
- `story-link`: קו תחתון מונפש

## 📊 אינדיקטורי סטטוס

### סטטוס פרויקט
- `.status-not-started`: לא התחיל (אפור)
- `.status-in-progress`: בתהליך (כחול)
- `.status-in-review`: בבדיקה (צהוב)
- `.status-completed`: הושלם (ירוק)
- `.status-on-hold`: בהמתנה (כתום)

### עדיפות משימות
- `.priority-low`: נמוכה (ירוק)
- `.priority-medium`: בינונית (צהוב)
- `.priority-high`: גבוהה (אדום)

## 🖱️ אלמנטים אינטראקטיביים

### כפתורים
```css
.btn-gradient      /* כפתור עם גרדיאנט */
.btn-glass         /* כפתור עם אפקט זכוכית */
```

### כרטיסים
```css
.card-elevated     /* כרטיס מורם */
.card-glass        /* כרטיס עם אפקט זכוכית */
```

### תגיות (Badges)
```css
.badge-gradient      /* תגית עם גרדיאנט */
.badge-outline-glow  /* תגית עם זוהר */
```

## 📱 תמיכה RTL

המערכת כוללת תמיכה מלאה בכיוון מימין לשמאל:
- `direction: rtl` על האלמנט body
- גופן עברי אופטימלי
- התאמות לייאוט RTL

## 🖥️ אופטימיזציה macOS

### תכונות macOS
- Titlebar drag regions
- macOS style focus outlines
- Anti-aliased text rendering
- Native scrollbar styling

### צללים בסגנון macOS
- `--shadow-macos`: צל עמוק לחלונות
- `--shadow-elegant`: צל אלגנטי לכרטיסים
- `--shadow-glow`: צל זוהר לאפקטים

## 🚀 שימוש

### ייבוא מלא
```css
@import './design-system/design-tokens.css';
@import './design-system/base-styles.css';
@import './design-system/utility-classes.css';
@import './design-system/animations.css';
@import './design-system/components-styles.css';
```

### שימוש בקלאסים
```html
<div class="card-macos animate-slide-up">
  <h3 class="text-gradient-primary">כותרת</h3>
  <span class="status-completed">הושלם</span>
</div>
```

## 🎯 עקרונות העיצוב

1. **עקביות**: כל הצבעים והמרחקים מוגדרים כמשתנים
2. **נגישות**: ניגודיות גבוהה וגדלי גופן קריאים
3. **ביצועים**: CSS אופטימלי ללא עומס מיותר
4. **גמישות**: תמיכה במצב כהה ו-RTL
5. **חוויית משתמש**: אנימציות חלקות ואפקטים עדינים

---

**הערה**: כל הצבעים מוגדרים בפורמט HSL לגמישות מקסימלית ותמיכה במצב כהה.