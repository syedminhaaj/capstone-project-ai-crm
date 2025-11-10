import LessonTable from '../components/lessons/LessonTable';
import { lessons } from '../data/mockData';

const Lessons = () => {
  return <LessonTable lessons={lessons} />;
};

export default Lessons;