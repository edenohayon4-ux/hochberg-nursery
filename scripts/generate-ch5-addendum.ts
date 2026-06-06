import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, Footer, PageNumber, Header,
} from "docx";
import * as fs from "fs";
import * as path from "path";

const FONT = "David";
const RTL = true;

const p = (text: string, opts: any = {}) =>
  new Paragraph({
    bidirectional: RTL,
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    spacing: { after: opts.spacing ?? 140, line: 340 },
    children: [new TextRun({ text, font: FONT, size: opts.size ?? 22, bold: opts.bold, italics: opts.italics, rightToLeft: true, color: opts.color })],
  });

const h2 = (text: string) =>
  new Paragraph({
    bidirectional: RTL, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.RIGHT,
    spacing: { before: 280, after: 160 },
    children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: "2E75B6", rightToLeft: true })],
  });

const h3 = (text: string) =>
  new Paragraph({
    bidirectional: RTL, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.RIGHT,
    spacing: { before: 220, after: 120 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: "375F91", rightToLeft: true })],
  });

const children: any[] = [];

// === HEADER ===
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 200 }, bidirectional: RTL,
    children: [new TextRun({ text: "תוספת לפרק 5 — תובנות מחקריות נוספות (5.3.10–5.3.13)", font: FONT, size: 32, bold: true, color: "1F4E79", rightToLeft: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 360 }, bidirectional: RTL,
    children: [new TextRun({ text: "פרויקט גמר משתלת הוכברג — להוספה כהמשך לסעיף 5.3", font: FONT, size: 22, italics: true, color: "595959", rightToLeft: true })],
  }),

  // ============================================================
  // INSIGHT 10
  // ============================================================
  h3("5.3.10 תובנה 10 — פער הרווח הגולמי-נטו חושף את משקל ההוצאות הקבועות"),
  p(
    "השוואת שיעורי הרווח הגולמי לשיעורי הרווח הנקי בשלושת הזנים חושפת תופעה עקבית: בכולם הפער עולה על 39 נקודות אחוז (Cercis 58.2% → 14.7%; Albizia 41.2% → 1.6%; Lagerstroemia 41.8% → 2.0%). המשמעות המחקרית: ההוצאות הקבועות \"בולעות\" כמעט מחצית מהרווח הגולמי בכל מוצר באופן עקבי. תופעה זו אינה מקרית — היא מאפיין מבני של משק חקלאי עתיר תשתית, שבו רוב העלויות (קרקע, מבנים, ציוד, כוח אדם קבוע) אינן משתנות עם כמות הייצור. תובנה זו מצביעה על כך שאסטרטגיית שיפור בענף זה חייבת להתמקד בהגדלת הכנסות יותר מאשר בהפחתת עלויות משתנות, מאחר שהמשתנות מהוות חלק קטן מסך העלויות."
  ),

  // ============================================================
  // INSIGHT 11
  // ============================================================
  h3("5.3.11 תובנה 11 — פרודוקטיביות לעובד אינה מנבאת רווחיות"),
  p(
    "תובנה זו עומדת בניגוד לתפיסה ניהולית מקובלת. חישוב יחס היחידות לעובד מלא מציג מדרג הפוך לחלוטין למדרג הרווחיות: Albizia מציגה 6,230 יחידות/עובד (הגבוה ביותר) אך שיעור רווח נקי של 1.6% בלבד; Cercis מציגה 2,667 יחידות/עובד אך שיעור רווח של 14.7% (הגבוה ביותר); Lagerstroemia מציגה 2,500 יחידות/עובד עם 2.0% רווח. המשמעות המחקרית: מדדי פרודוקטיביות תפעוליים מסורתיים — כמות לעובד, יעילות שעות — אינם מדדים תקפים לרווחיות בענף שבו ערך היחידה משתנה משמעותית בין המוצרים. הניתוח מצריך מעבר ממדדי תפוקה למדדי ערך כספי לעובד (Revenue/FTE או Profit/FTE), שאינם מסורתיים בענף החקלאי הישראלי."
  ),

  // ============================================================
  // INSIGHT 12
  // ============================================================
  h3("5.3.12 תובנה 12 — שיטת הקצאת ההוצאות הקבועות היא עצמה משתנה מחקרי"),
  p(
    "במחקר זה נבחרה שיטת ההקצאה לפי חלק יחסי בהכנסות (Revenue-Share Allocation), המקצה ל-Cercis 83% מההוצאות הקבועות. שיטה חלופית — הקצאה לפי שטח גידול (Area-Based) — הייתה מקצה לו 71%. ההפרש (12 נקודות אחוז) שווה ערך לכ-1.49 מיליון ₪ בהוצאות הקבועות שהיו עוברים אל Albizia ו-Lagerstroemia, ובכך הופכים את שניהם להפסדיים בעוד Cercis היה הופך לרווחי יותר. המשמעות המחקרית: שיטת ההקצאה אינה החלטה טכנית-חשבונאית בלבד, אלא בחירה מתודולוגית שמייצרת מסקנות שונות מאותם נתונים. ארגון המאמץ מודל חישובי דוגמת זה חייב להבין שהבחירה במנגנון הקצאה היא אקט ניהולי הראוי לתיעוד, לדיון ולהשוואה תקופתית לחלופות."
  ),

  // ============================================================
  // INSIGHT 13
  // ============================================================
  h3("5.3.13 תובנה 13 — פער בספרות הקיימת ביחס לענף משתלות הנוי המייצאות"),
  p(
    "סקירת הספרות בפרק 2 כיסתה מאמרים על חקלאות קומודיטית (חיטה, תירס, אורז), על משתלות מסחריות (Setty et al., 2025 בהודו) ועל היבטים פיננסיים כלליים (Khachatryan & Wei, 2020). אולם, אף מאמר לא עסק במאפיינים המשולבים הייחודיים של משתלת הוכברג: מחזורי גידול ארוכים (פחות ממחזור אחד בשנה — Cercis 0.95, Albizia 0.85, Lagerstroemia 0.92), תמחור פרימיום דיפרנציאלי, ושיעורי יצוא חריגים (עד 55%). המשמעות המחקרית: ממצאינו תורמים מילוי ראשוני של פער ספרותי בקטגוריה זו, ומציעים מסגרת תיאורטית — שילוב ABC, MFCA ו-Time-Lag FX Risk — שטרם אוחדה במחקר על משתלות הנוי המייצאות. כיוון מחקר עתידי: השוואה בין-לאומית של משתלות נוי מייצאות (ישראל, איטליה, הולנד) עשויה לחזק את ההכללה של ממצאי הפרויקט."
  )
);

const doc = new Document({
  creator: "Hochberg Nursery Project — Chapter 5 Addendum",
  title: "תוספת לפרק 5 — תובנות מחקריות נוספות",
  styles: { default: { document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 340 } } } } },
  sections: [{
    properties: { page: { margin: { top: 1100, right: 1100, bottom: 1100, left: 1100 } } },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER, bidirectional: RTL,
          children: [new TextRun({ text: "פרויקט גמר — משתלת הוכברג | תוספת לפרק 5", font: FONT, size: 18, color: "808080", rightToLeft: true })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "עמוד ", font: FONT, size: 18, rightToLeft: true }),
            new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 }),
            new TextRun({ text: " מתוך ", font: FONT, size: 18, rightToLeft: true }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18 }),
          ],
        })],
      }),
    },
    children,
  }],
});

(async () => {
  const buffer = await Packer.toBuffer(doc);
  const outDir = path.join(process.cwd(), "docs");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "תוספת-פרק-5-תובנות-נוספות.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Document generated: ${outPath}`);
  console.log(`📄 Size: ${(buffer.length / 1024).toFixed(1)} KB`);
})();
