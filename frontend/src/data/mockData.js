export const stats = [
  { label: 'Total Students', value: '156', change: '+12%', color: 'bg-blue-500' },
  { label: 'Active Lessons', value: '42', change: '+8%', color: 'bg-green-500' },
  { label: 'This Month Revenue', value: '$12,450', change: '+15%', color: 'bg-purple-500' },
  { label: 'Completion Rate', value: '87%', change: '+3%', color: 'bg-orange-500' }
];

export const students = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '(555) 123-4567', lessons: 8, status: 'Active', nextLesson: '2024-11-10' },
  { id: 2, name: 'Mike Chen', email: 'mike.c@email.com', phone: '(555) 234-5678', lessons: 15, status: 'Active', nextLesson: '2024-11-09' },
  { id: 3, name: 'Emily Davis', email: 'emily.d@email.com', phone: '(555) 345-6789', lessons: 20, status: 'Completed', nextLesson: null },
  { id: 4, name: 'James Wilson', email: 'james.w@email.com', phone: '(555) 456-7890', lessons: 5, status: 'Active', nextLesson: '2024-11-12' },
  { id: 5, name: 'Lisa Brown', email: 'lisa.b@email.com', phone: '(555) 567-8901', lessons: 12, status: 'On Hold', nextLesson: null }
];

export const lessons = [
  { id: 1, student: 'Sarah Johnson', instructor: 'John Smith', date: '2024-11-10', time: '09:00 AM', type: 'Highway Driving', status: 'Scheduled' },
  { id: 2, student: 'Mike Chen', instructor: 'Jane Doe', date: '2024-11-09', time: '02:00 PM', type: 'Parking Practice', status: 'Scheduled' },
  { id: 3, student: 'James Wilson', instructor: 'John Smith', date: '2024-11-12', time: '11:00 AM', type: 'City Driving', status: 'Scheduled' },
  { id: 4, student: 'Emily Davis', instructor: 'Jane Doe', date: '2024-11-08', time: '10:00 AM', type: 'Test Preparation', status: 'Completed' }
];

export const instructors = [
  { id: 1, name: 'John Smith', rating: 4.9, students: 45, hours: 320, available: true },
  { id: 2, name: 'Jane Doe', rating: 4.8, students: 38, hours: 285, available: true },
  { id: 3, name: 'Robert Lee', rating: 4.7, students: 32, hours: 240, available: false }
];