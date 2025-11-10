import StatCard from '../components/dashboard/StatCard';
import UpcomingLessons from '../components/dashboard/UpcomingLessons';
import InstructorPerformance from '../components/dashboard/InstructorPerformance';
import { stats, lessons, instructors } from '../data/mockData';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} stat={stat} index={idx} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingLessons lessons={lessons} />
        <InstructorPerformance instructors={instructors} />
      </div>
    </div>
  );
};

export default Dashboard;