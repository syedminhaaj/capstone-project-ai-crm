import { useState } from 'react';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Lessons from './pages/Lessons';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderPage = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'students':
        return <Students />;
      case 'lessons':
        return <Lessons />;
      default:
        return <Dashboard />;
    }
  };
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
   
    
    <Header />
    <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    <main className="max-w-7xl mx-auto px-6 py-8">
      {renderPage()}
    </main>
  </div>
)
}

export default App;