import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Upload, User, Mail, Phone, CreditCard, MapPin, Calendar, AlertCircle, Scan } from 'lucide-react';
import { addStudent, updateStudent, parseBarcodeData, scanLicenseImage, clearScannedData, clearError } from '../../store/slices/studentSlice';
import BarcodeInput from './BarcodeInput';

const StudentModal = ({ isOpen, onClose, student = null }) => {
  const dispatch = useDispatch();
  const { scanLoading, scannedData, error } = useSelector(state => state.students);
  
  const [mode, setMode] = useState(null); // 'scan', 'barcode', 'manual'
  const [localError, setLocalError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license_number: '',
    address: '',
    date_of_birth: '',
    emergency_contact: '',
    emergency_phone: '',
  });

  // If editing, pre-fill the form
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        license_number: student.license_number || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth || '',
        emergency_contact: student.emergency_contact || '',
        emergency_phone: student.emergency_phone || '',
      });
      setMode('manual'); // Go directly to form for editing
    }
  }, [student]);

  // Auto-fill form when barcode/scan data is available
  useEffect(() => {
    if (scannedData) {
      setFormData(prev => ({
        ...prev,
        name: scannedData.name || prev.name,
        license_number: scannedData.license_number || prev.license_number,
        date_of_birth: scannedData.date_of_birth || prev.date_of_birth,
        address: scannedData.address || prev.address,
      }));
      setMode('manual'); // Show form with pre-filled data
    }
  }, [scannedData]);

  const handleBarcodeScanned = async (barcodeText) => {
    setLocalError('');
    try {
      await dispatch(parseBarcodeData(barcodeText)).unwrap();
    } catch (err) {
      setLocalError('Error parsing barcode. Please try manual entry.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLocalError('');
    try {
      await dispatch(scanLicenseImage(file)).unwrap();
    } catch (err) {
      setLocalError('Error scanning license image. Please try manual entry.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      if (student) {
        // Update existing student
        await dispatch(updateStudent({ id: student.id, data: formData })).unwrap();
      } else {
        // Add new student
        await dispatch(addStudent(formData)).unwrap();
      }
      handleClose();
    } catch (err) {
      setLocalError(err.message || 'Error saving student. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      license_number: '',
      address: '',
      date_of_birth: '',
      emergency_contact: '',
      emergency_phone: '',
    });
    setMode(null);
    dispatch(clearScannedData());
    dispatch(clearError());
    setLocalError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {student ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!mode && !student && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">Choose how you'd like to add the student:</p>
              
              {/* Barcode Scanner Option */}
              <button
                onClick={() => setMode('barcode')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Scan className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Scan Barcode</h3>
                    <p className="text-sm text-gray-600">Use barcode scanner to read PDF417 barcode</p>
                  </div>
                </div>
              </button>

              {/* Image Upload Option */}
              <button
                onClick={() => setMode('scan')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Upload License Image</h3>
                    <p className="text-sm text-gray-600">AI will extract information from photo</p>
                  </div>
                </div>
              </button>

              {/* Manual Entry Option */}
              <button
                onClick={() => setMode('manual')}
                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
                    <User className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">Manual Entry</h3>
                    <p className="text-sm text-gray-600">Type all details manually</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Barcode Scanner Mode */}
          {mode === 'barcode' && !scannedData && (
            <div>
              <button
                onClick={() => setMode(null)}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>← Back</span>
              </button>
              
              <BarcodeInput 
                onBarcodeScanned={handleBarcodeScanned}
                loading={scanLoading}
              />
            </div>
          )}

          {/* Image Upload Mode */}
          {mode === 'scan' && !scannedData && (
            <div>
              <button
                onClick={() => setMode(null)}
                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <span>← Back</span>
              </button>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Upload Driver's License Photo
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  AI will extract name, license number, DOB, and address
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={scanLoading}
                  />
                  <span className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-block transition-colors">
                    {scanLoading ? 'Scanning...' : 'Choose File'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Show errors */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800">{localError || error}</p>
              </div>
            </div>
          )}

     {/* Success message when data is scanned */}
          {scannedData && mode !== 'manual' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 font-medium">
                ✓ Data extracted successfully! Review and complete the form below.
              </p>
            </div>
          )}

          {/* Form (shown after scan/barcode or in manual mode) */}
          {mode === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!student && (
                <button
                  type="button"
                  onClick={() => {
                    setMode(null);
                    dispatch(clearScannedData());
                  }}
                  className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <span>← Back</span>
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="D1234567"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows="2"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                {/* Emergency Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                  disabled={scanLoading}
                >
                  {student ? 'Update Student' : 'Add Student'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentModal;