import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Result from './pages/Result';
import Calendar from './pages/Calendar';
import Library from './pages/Library';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col max-w-lg mx-auto">
        <div className="flex-1 pb-24">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/result" element={<Result />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/library" element={<Library />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Navbar />
      </div>
    </BrowserRouter>
  );
}
