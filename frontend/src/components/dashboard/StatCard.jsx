import { Users, Car, DollarSign, CheckCircle } from 'lucide-react';

const StatCard = ({ stat, index }) => {
  const icons = [Users, Car, DollarSign, CheckCircle];
  const Icon = icons[index];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
        </div>
        <div className={`${stat.color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;