import { useState, useRef, useEffect } from 'react';
import { Scan, Loader } from 'lucide-react';

const BarcodeInput = ({ onBarcodeScanned, loading }) => {
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Auto-focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBarcode(value);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout to process barcode after user stops typing
    // Barcode scanners typically input data very quickly
    timeoutRef.current = setTimeout(() => {
      if (value.length > 50) { // PDF417 barcodes are long
        onBarcodeScanned(value);
        setBarcode(''); // Clear for next scan
      }
    }, 500);
  };

  const handleKeyDown = (e) => {
    // If Enter key is pressed, process immediately
    if (e.key === 'Enter' && barcode.length > 0) {
      e.preventDefault();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onBarcodeScanned(barcode);
      setBarcode('');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Scan Driver's License Barcode
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <Scan className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Click here and scan barcode with scanner..."
          disabled={loading}
          className="w-full pl-10 pr-4 py-3 border-2 border-dashed border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50 text-gray-900 placeholder-gray-500"
        />
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Place cursor in field above and use your barcode scanner to scan the PDF417 barcode on the back of the license
      </p>
    </div>
  );
};

export default BarcodeInput;