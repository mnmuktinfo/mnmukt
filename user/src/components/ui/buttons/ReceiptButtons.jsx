import { Download } from "lucide-react";

const ReceiptButtons = ({ generatePDF }) => (
  <button
    onClick={generatePDF}
    className="w-full border border-orange-500 text-orange-500 py-3 rounded-lg font-semibold hover:bg-orange-50 mt-4 flex items-center justify-center">
    <Download className="mr-2" size={20} /> Download Receipt Again
  </button>
);

export default ReceiptButtons;
