import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ChatWidget } from './components/ChatWidget';
import { Compare } from './pages/Compare';
import { Evaluator } from './pages/Evaluator';
import { Evidence } from './pages/Evidence';
import { Home } from './pages/Home';
import { Methodology } from './pages/Methodology';
import { Reproducibility } from './pages/Reproducibility';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="evidence" element={<Evidence />} />
          <Route path="evaluator" element={<Evaluator />} />
          <Route path="compare" element={<Compare />} />
          <Route path="reproducibility" element={<Reproducibility />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ChatWidget />
    </>
  );
}
