export default function PrescriptionFooter() {
  return (
    <div
  className="mt-3 border-t-2 border-red-700"
  style={{
    pageBreakInside: "avoid",
    breakInside: "avoid",
  }}
>

      {/* Header */}
      <div className="flex items-center">

        <div className="flex-1 bg-green-800 text-white text-[11px] font-semibold px-3 py-1">
          पर्ची की वैधता 15 दिनों के लिए मान्य होगा
        </div>

        <div className="bg-red-700 text-white text-[11px] font-semibold px-3 py-1 whitespace-nowrap">
          This is not valid for Medico Legal Purpose
        </div>

      </div>

      {/* Body */}
      <div className="border border-gray-300 border-t-0 bg-gray-50 px-4 py-3 text-[11px] leading-6">

        <div>
          <span className="font-bold">1.</span>{" "}
          किसी प्रकार का रिएक्शन होने पर दवा बंद कर दें एवं डॉक्टर साहब से
          कंसल्ट करें।
        </div>

        <div>
          <span className="font-bold">2.</span>{" "}
          इलाज के बाद किसी प्रकार का सर्टिफिकेट देने का आग्रह न करें।
        </div>

        <div>
          <span className="font-bold">3.</span>{" "}
          अपेक्षित लाभ न होने पर किसी अन्य चिकित्सक से परामर्श ले सकते हैं।
        </div>

      </div>

    </div>
  );
}