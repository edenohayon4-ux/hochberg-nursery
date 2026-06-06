import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, Footer, PageNumber, Header,
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

const formula = (text: string) =>
  new Paragraph({
    bidirectional: RTL, alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120, line: 340 },
    shading: { type: ShadingType.CLEAR, color: "auto", fill: "F2F7FC" },
    children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: "1F4E79", rightToLeft: true })],
  });

const bullet = (text: string) =>
  new Paragraph({
    bidirectional: RTL, alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100, line: 320 }, bullet: { level: 0 },
    children: [new TextRun({ text, font: FONT, size: 22, rightToLeft: true })],
  });

const cell = (text: string, opts: any = {}) =>
  new TableCell({
    shading: opts.bg ? { type: ShadingType.CLEAR, color: "auto", fill: opts.bg } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [new Paragraph({
      bidirectional: RTL, alignment: opts.align ?? AlignmentType.CENTER,
      children: [new TextRun({ text, font: FONT, size: 20, bold: opts.header || opts.bold, color: opts.color || (opts.header ? "FFFFFF" : "000000"), rightToLeft: true })],
    })],
  });

const buildTable = (headers: string[], rows: string[][]) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE }, visuallyRightToLeft: true,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h) => cell(h, { header: true, bg: "2E75B6" })) }),
      ...rows.map((r, i) => new TableRow({ children: r.map((c) => cell(c, { bg: i % 2 === 1 ? "EAF2F9" : undefined })) })),
    ],
  });

const br = () => new Paragraph({ children: [new TextRun("")] });

const children: any[] = [];

children.push(
  // === HEADER ===
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 200 }, bidirectional: RTL,
    children: [new TextRun({ text: "תוספת לסעיף 4.8.2 — חישוב הפער במט\"ח", font: FONT, size: 32, bold: true, color: "1F4E79", rightToLeft: true })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 360 }, bidirectional: RTL,
    children: [new TextRun({ text: "פרויקט גמר משתלת הוכברג — תיקון לפי הערת המרצה", font: FONT, size: 22, italics: true, color: "595959", rightToLeft: true })],
  }),

  // === INTRO ===
  p(
    "הפער במט\"ח שעליו נסמכות כלל התוצאות בסעיף זה נגזר מההשוואה בין שני שערים מרכזיים:"
  ),
  bullet("שער הבסיס — השער ששרר בעת קביעת מחירי המכירה העונתיים: 3.85 EUR/NIS"),
  bullet("השער הנוכחי — השער ברגע ניתוח הנתונים: 3.42 EUR/NIS"),
  br(),

  // === GAP CALCULATION ===
  h3("חישוב הפער הכולל במט\"ח"),
  formula("פער מט\"ח = (שער נוכחי − שער בסיס) ÷ שער בסיס"),
  formula("פער מט\"ח = (3.42 − 3.85) ÷ 3.85 = −0.43 ÷ 3.85 = −11.17%"),
  br(),
  p(
    "המשמעות: היורו נחלש מול השקל בכ-11.17%. עבור כל יורו שמתקבל מלקוח אירופי, המשתלה מקבלת היום 3.42 ₪ במקום 3.85 ₪ — סכום נמוך בכ-11% במונחי שקלים. זהו פער של מעל 10%, שמהווה את אחד הזעזועים המבניים שמשפיעים על תוצאות המשתלה בשנה זו."
  ),
  br(),

  // === RELATIVE IMPACT PER VARIETY ===
  h3("חישוב ההשפעה היחסית לפי זן"),
  p(
    "מאחר ששיעור היצוא שונה בכל מוצר, הפער של 11.17% במט\"ח אינו משפיע באופן אחיד. ההשפעה היחסית על מחיר המכירה הסופי מחושבת לפי הנוסחה:"
  ),
  formula("השפעת מט\"ח על המחיר = % יצוא × פער מט\"ח"),
  br(),
  buildTable(
    ["זן", "% יצוא", "חישוב", "השפעה על המחיר"],
    [
      ["Cercis", "30%", "0.30 × (−11.17%)", "−3.36%"],
      ["Albizia", "10%", "0.10 × (−11.17%)", "−1.12%"],
      ["Lagerstroemia", "55%", "0.55 × (−11.17%)", "−6.17%"],
    ]
  ),
  br(),
  p(
    "מהטבלה עולה ש-Lagerstroemia, עם שיעור היצוא הגבוה ביותר (55%), הוא המוצר הנפגע ביותר מהפיחות במט\"ח — מחירו ירד ב-6.17%, בעוד Albizia נפגע ב-1.12% בלבד. הפער היחסי בין שני המוצרים (פי-5.5) מבטא את ההבדל בחשיפה המבנית של כל זן לסיכון המטבע."
  )
);

const doc = new Document({
  creator: "Hochberg Nursery — FX Gap Addition",
  title: "תוספת לסעיף 4.8.2 — חישוב הפער במט\"ח",
  styles: { default: { document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 340 } } } } },
  sections: [{
    properties: { page: { margin: { top: 1100, right: 1100, bottom: 1100, left: 1100 } } },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER, bidirectional: RTL,
          children: [new TextRun({ text: "פרויקט גמר — משתלת הוכברג | תוספת לסעיף 4.8.2", font: FONT, size: 18, color: "808080", rightToLeft: true })],
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
  const outPath = path.join(outDir, "תוספת-סעיף-4.8.2-חישוב-פער-מטח.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Document generated: ${outPath}`);
  console.log(`📄 Size: ${(buffer.length / 1024).toFixed(1)} KB`);
})();
