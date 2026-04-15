import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ChatWidget } from './components/ChatWidget';
import { Compare } from './pages/Compare';
import { Evaluator } from './pages/Evaluator';
import { Home } from './pages/Home';
import { Methodology } from './pages/Methodology';
import { HelpCenter } from './pages/HelpCenter';
import { Login } from './pages/Login';
import { Resources } from './pages/Resources';
import { Results } from './pages/Results';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="evaluator" element={<Evaluator />} />
          <Route path="compare" element={<Compare />} />
          <Route path="comparison" element={<Navigate to="/compare" replace />} />
          <Route path="results" element={<Results />} />
          <Route path="login" element={<Login />} />
          <Route path="resources" element={<Resources />} />
          <Route path="help" element={<HelpCenter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <ChatWidget />
    </>
  );
}
