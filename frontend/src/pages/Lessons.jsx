// src/pages/LessonsPage.jsx
import { useState } from "react";
import LessonTable from "../components/lessons/LessonTable";
import ScheduleLesson from "../components/lessons/ScheduleLesson";

const Lessons = () => {
  // In real app, pull these from Redux or API
  const [lessons, setLessons] = useState([
    {
      id: 1,
      student: "John Doe",
      instructor: "Sarah Lee",
      date: "2025-01-10",
      time: "10:00 AM",
      type: "In-Car Lesson",
      status: "Scheduled",
    },
  ]);

  const students = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Maria Smith" },
  ];

  const instructors = [
    { id: 1, name: "Sarah Lee" },
    { id: 2, name: "Ahmed Khan" },
  ];

  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const handleScheduleLessonClick = () => {
    setShowScheduleForm(true);
  };

  const handleCreateLesson = async (data) => {
    // For now just add to local state
    // later: call your backend/Redux here
    const student = students.find(
      (s) => String(s.id) === String(data.studentId)
    );
    const instructor = instructors.find(
      (i) => String(i.id) === String(data.instructorId)
    );

    const newLesson = {
      id: Date.now(),
      student: student?.name || "Unknown",
      instructor: instructor?.name || "Unknown",
      date: data.date,
      time: data.time,
      type: data.type,
      status: "Scheduled",
      location: data.location,
      notes: data.notes,
    };

    setLessons((prev) => [newLesson, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Show schedule form only when button clicked */}
      {showScheduleForm && (
        <ScheduleLesson
          students={students}
          instructors={instructors}
          onSubmit={handleCreateLesson}
          onClose={() => setShowScheduleForm(false)}
        />
      )}

      <LessonTable
        lessons={lessons}
        onScheduleLesson={handleScheduleLessonClick}
      />
    </div>
  );
};

export default Lessons;
