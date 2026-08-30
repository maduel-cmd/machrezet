# חיבור ל־GitHub (חד־פעמי)

הסוכן לא יכול ליצור ריפו חדש עם הטוקן הנוכחי. אחרי יצירת ריפו ריק:

```bash
cd /home/ubuntu/machrezet   # או אחרי clone מקומי של התיקייה
git remote add origin https://github.com/maduel-cmd/machrezet.git
git push -u origin main
```

מומלץ: ריפו **ציבורי** בשם `machrezet` תחת `maduel-cmd`.

אחר כך ב־Netlify (אתר `machrezet-beads`): Site settings → Build & deploy → Link repository → בחר את הריפו החדש (root = `/`, build = `npm run build`, publish = `dist`).
