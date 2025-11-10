import StudentTable from '../components/students/StudentTable';
import { students } from '../data/mockData';

const Students = () => {
  return <StudentTable students={students} />;
};

export default Students;