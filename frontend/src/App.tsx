import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PosTerminal from './pages/PosTerminal';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<PosTerminal />} />
          <Route path="reports" element={<div className="p-10 text-center">Reports Coming Soon</div>} />
          <Route path="settings" element={<div className="p-10 text-center">Settings Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
