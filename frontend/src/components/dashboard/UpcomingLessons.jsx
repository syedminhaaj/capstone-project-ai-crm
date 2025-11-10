import { Clock } from 'lucide-react';

const UpcomingLessons = ({ lessons }) => {
  const scheduledLessons = lessons.filter(l => l.status === 'Scheduled').slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Upcoming Lessons Today</h3>
      <div className="space-y-3">
        {scheduledLessons.map(lesson => (
          <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{lesson.student}</p>
                <p className="text-sm text-gray-600">{lesson.time} - {lesson.type}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{lesson.instructor}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingLessons;