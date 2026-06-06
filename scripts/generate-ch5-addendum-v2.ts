import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Footer, PageNumber, Header,
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

const h3 = (text: string) =>
  new Paragraph({
    bidirectional: RTL, heading: HeadingLevel.HEADING_3, alignment: AlignmentType.RIGHT,
    spacing: { before: 220, after: 120 },
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: "375F91", rightToLeft: true })],
  });

const children: any[] = [];

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
  h3("5.3.10 תובנה 10 — מבנה ההוצאות הקבועות הוא הגורם הדומיננטי בעיצוב הרווחיות"),
  p(
    "אחת התובנות העקרוניות שעולות מהמחקר היא שבמשתלה — וכנראה גם בארגונים חקלאיים דומים — שיעור הרווח הגולמי אינו מנבא טוב את שיעור הרווח הנקי. בכל שלושת הזנים שנבחנו נצפה פער מהותי ועקבי בין שני המדדים: רווחיות גולמית סבירה והפסד נטו שולי, או רווחיות גולמית גבוהה ורווח נטו מתון. תופעה זו מצביעה על כך שמרבית הוצאות המשתלה הן הוצאות מבניות שאינן משתנות עם היקף הייצור — קרקע, מבנים, ציוד, כוח אדם קבוע. המשמעות המחקרית: ניתוח רווחיות בענף זה חייב להתמקד בשכבת ההוצאות הקבועות ולא בעלויות הייצור המשתנות, ואסטרטגיית שיפור תלויה יותר בהגדלת הכנסות מאשר בקיצוץ עלויות תפעוליות."
  ),

  // ============================================================
  // INSIGHT 11
  // ============================================================
  h3("5.3.11 תובנה 11 — פרודוקטיביות תפעולית אינה מתחלפת ברווחיות כלכלית"),
  p(
    "מדדי פרודוקטיביות מסורתיים בענף החקלאי — יחידות לעובד, שעות עבודה ליחידה — נוטים להציג את המוצרים בעלי תהליכי הייצור היעילים ביותר כ\"מוצלחים ביותר\". המחקר חושף שהנחה זו אינה תקפה במשתלה: דווקא המוצר עם הפרודוקטיביות התפעולית הגבוהה ביותר לעובד הוא מבין הגבוליים מבחינת רווחיות, ולהפך — המוצר עתיר העבודה ביותר הוא הרווחי ביותר. הסיבה: ערך היחידה הנמכרת אינו אחיד בין המוצרים, ומדדי פרודוקטיביות שמתעלמים מהערך הכספי מציגים תמונה מטעה. המשמעות המחקרית: בענפים שבהם ערך היחידה משתנה משמעותית בין מוצרים, נדרשים מדדים היברידיים — ערך כספי לעובד, רווח נקי ליחידה — ולא מדדים תפעוליים בלבד. תובנה זו רלוונטית גם לתחומים נוספים שבהם תמהיל המוצרים הטרוגני."
  ),

  // ============================================================
  // INSIGHT 12
  // ============================================================
  h3("5.3.12 תובנה 12 — שיטת הקצאת ההוצאות הקבועות היא עצמה בחירה מחקרית-ניהולית"),
  p(
    "בכל מודל עלויות שמטפל ביותר ממוצר אחד, נדרשת הקצאה של ההוצאות הקבועות בין המוצרים. הבחירה בשיטת ההקצאה — לפי הכנסות, לפי שטח גידול, לפי שעות עבודה, לפי משאבים ישירים — אינה החלטה טכנית-חשבונאית בלבד, אלא בחירה מתודולוגית שיכולה לשנות באופן מהותי את הניתוח. במחקרנו, מעבר בין שיטות הקצאה היה משנה את סדר הרווחיות בין המוצרים ואת ההמלצות הנגזרות מהם. המשמעות המחקרית: ארגון שמאמץ מודל חישובי דוגמת זה חייב לתעד את בחירת מנגנון ההקצאה כהחלטה ניהולית מודעת, לנמק אותה, ולבחון אותה מחדש מעת לעת. שקיפות מתודולוגית היא חלק בלתי נפרד משקיפות פיננסית."
  ),

  // ============================================================
  // INSIGHT 13
  // ============================================================
  h3("5.3.13 תובנה 13 — פער בספרות הקיימת ביחס לענף משתלות הנוי המייצאות"),
  p(
    "סקירת הספרות בפרק 2 כיסתה מאמרים על חקלאות קומודיטית, על משתלות מסחריות ועל היבטים פיננסיים כלליים. אולם, אף מאמר לא עסק במאפיינים המשולבים הייחודיים למשתלת הוכברג: מחזורי גידול שאינם משלימים שנה שלמה, תמחור פרימיום דיפרנציאלי לפי איכות הזן, ושיעורי יצוא משמעותיים המייצרים חשיפת מטבע ארוכת-טווח. ענף משתלות הנוי המייצאות מאופיין בשילוב יוצא דופן של מחזור גידול ארוך, תלות בשווקים זרים, ועונתיות גבוהה — מאפיינים שאינם מקבלים מענה הולם בספרות הקיימת. המשמעות המחקרית: ממצאי הפרויקט תורמים מילוי ראשוני של פער ספרותי בקטגוריה זו, ומציעים מסגרת תיאורטית — שילוב ABC, MFCA ומושג Time-Lag FX Risk — שטרם אוחדה במחקר ייעודי על משתלות הנוי המייצאות. כיוון מחקר עתידי מתבקש: השוואה בין-לאומית של משתלות נוי מייצאות בישראל, באיטליה ובהולנד, שתאפשר תיקוף נוסף של המסגרת ובחינת ההכללה שלה."
  )
);

const doc = new Document({
  creator: "Hochberg Nursery Project — Chapter 5 Addendum v2",
  title: "תוספת לפרק 5 — תובנות מחקריות נוספות (גרסה מקצועית)",
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
  const outPath = path.join(outDir, "תוספת-פרק-5-תובנות-נוספות-v2.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Document generated: ${outPath}`);
  console.log(`📄 Size: ${(buffer.length / 1024).toFixed(1)} KB`);
})();
