export default function HistoryPlaceholder() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900">היסטוריית דאטה</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
        כאן יופיעו כל הסנאפשוטים שתשמרי. בקרוב — כפתור שמירה ורשימת היסטוריה
        עם תאריך, שעה ואפשרות מחיקה של כל מקטע בנפרד.
      </p>
      <p className="mt-4 text-xs text-gray-400">
        🚧 שלב 2 — דורש הגדרת מאגר נתונים ב-Vercel
      </p>
    </div>
  );
}
