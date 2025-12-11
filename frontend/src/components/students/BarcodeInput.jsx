import { useState, useRef, useEffect } from "react";
import { Scan, Loader } from "lucide-react";

const BarcodeInput = ({ onBarcodeScanned, loading }) => {
  const [barcode, setBarcode] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus the input when component mounts
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!barcode.trim()) return;
    onBarcodeScanned(barcode);
    setBarcode("");
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Scan Driver's License Barcode
      </label>

      <div className="relative mb-3">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <Scan className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <textarea
          ref={inputRef}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Click here and scan barcode with scanner..."
          disabled={loading}
          className="w-full min-h-[120px] pl-10 pr-4 py-3 border-2 border-dashed border-blue-300 
             rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
             focus:border-blue-500 bg-blue-50 text-gray-900 placeholder-gray-500
             resize-y"
        ></textarea>
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!barcode.trim() || loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium 
                   disabled:bg-blue-300 hover:bg-blue-700 transition-colors"
      >
        {loading ? "Processing..." : "Submit Barcode"}
      </button>
    </div>
  );
};

export default BarcodeInput;
