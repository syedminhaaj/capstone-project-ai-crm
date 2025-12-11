// ScheduleLesson.jsx
import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Car,
  MapPin,
  FileText,
  ChevronDown,
} from "lucide-react";

const ScheduleLesson = ({
  onSubmit, // function(lessonData) => void | Promise
  students = [], // [{ id, name }]
  instructors = [], // [{ id, name }]
}) => {
  const [formData, setFormData] = useState({
    studentId: "",
    instructorId: "",
    date: "",
    time: "",
    type: "",
    location: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const lessonTypes = [
    "In-Car Lesson",
    "Classroom Session",
    "Road Test Practice",
    "Highway Lesson",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
      // reset after success
      setFormData({
        studentId: "",
        instructorId: "",
        date: "",
        time: "",
        type: "",
        location: "",
        notes: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header (similar style to LessonTable) */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Schedule Lesson</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create a new lesson for any student and instructor.
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student *
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor *
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="instructorId"
                value={formData.instructorId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select instructor</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <div className="relative">
              <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time *
            </label>
            <div className="relative">
              <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lesson Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lesson Type *
            </label>
            <div className="relative">
              <Car className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Select type</option>
                {lessonTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup / Meeting Location
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., 123 Main St or Driving School Office"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <div className="relative">
            <FileText className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Special instructions, pickup details, or focus areas for this lesson"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-gray-100">
          <button
            type="reset"
            onClick={() =>
              setFormData({
                studentId: "",
                instructorId: "",
                date: "",
                time: "",
                type: "",
                location: "",
                notes: "",
              })
            }
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save Lesson"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleLesson;
