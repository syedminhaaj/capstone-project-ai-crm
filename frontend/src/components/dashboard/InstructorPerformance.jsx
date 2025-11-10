const InstructorPerformance = ({ instructors }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Instructor Performance</h3>
      <div className="space-y-3">
        {instructors.map(instructor => (
          <div key={instructor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {instructor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-gray-900">{instructor.name}</p>
                <p className="text-sm text-gray-600">{instructor.students} students • {instructor.hours}h</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">⭐ {instructor.rating}</p>
              <span className={`text-xs ${instructor.available ? 'text-green-600' : 'text-gray-400'}`}>
                {instructor.available ? 'Available' : 'Busy'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorPerformance;