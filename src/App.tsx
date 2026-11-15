// Rutas de la app, generadas por Cosmos a partir del plan. Cada pantalla vive en su propio archivo.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import HomeScreen from './components/HomeScreen';
import CheckInScreen from './components/CheckInScreen';
import RecommendationScreen from './components/RecommendationScreen';
import GuidedSessionScreen from './components/GuidedSessionScreen';
import LibraryScreen from './components/LibraryScreen';
import AuthScreen from './components/AuthScreen';
import ProfileScreen from './components/ProfileScreen';
import SubscriptionScreen from './components/SubscriptionScreen';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/check-in" element={<CheckInScreen />} />
          <Route path="/recommendation" element={<RecommendationScreen />} />
          <Route path="/session/:practiceId" element={<GuidedSessionScreen />} />
          <Route path="/library" element={<LibraryScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/subscription" element={<SubscriptionScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
