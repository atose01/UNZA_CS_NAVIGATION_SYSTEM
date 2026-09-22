import { useMemo, useState } from 'react';
import { Building2, CalendarDays, Home, LogOut, Map as MapIcon, Users } from 'lucide-react';
import { EventsTab } from './EventsTab';
import { HomeTab } from './HomeTab';
import { LecturerDirectory } from './LecturerDirectory';
import { LecturerProfileManager } from './LecturerProfileManager';
import { LoginPage } from './LoginPage';
import { MapTab } from './components/MapData/MapTab';
import { getRoleCapabilities, LECTURER_PROFILES, type LecturerProfile, type Session, type Tab, type View } from './navigationLogic';

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('home');
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerProfile | null>(null);
  const [pendingOfficeTarget, setPendingOfficeTarget] = useState<string | null>(null);
  const capabilities = getRoleCapabilities(session.role);

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: <Home size={14} /> },
    { id: 'lecturers', label: 'Lecturers', icon: <Users size={14} /> },
    { id: 'map', label: 'Map', icon: <MapIcon size={14} /> },
    { id: 'events', label: 'Events', icon: <CalendarDays size={14} /> },
  ] as const;

  const lecturerProfile = useMemo(
    () => selectedLecturer ?? LECTURER_PROFILES.find((lecturer) => lecturer.id === session.lecturerProfileId) ?? null,
    [selectedLecturer, session.lecturerProfileId],
  );

  const handleSelectLecturer = (lecturer: LecturerProfile) => {
    setSelectedLecturer(lecturer);
    setPendingOfficeTarget(null);
  };

  const handleNavigateToOffice = (lecturer: LecturerProfile) => {
    setSelectedLecturer(lecturer);
    setPendingOfficeTarget(lecturer.officeRoomId ?? null);
    setTab('map');
  };

  const handleSaveLecturer = (updatedLecturer: LecturerProfile) => {
    const nextLecturer = LECTURER_PROFILES.find((entry) => entry.id === updatedLecturer.id) ?? updatedLecturer;
    Object.assign(nextLecturer, updatedLecturer);
    setSelectedLecturer({ ...updatedLecturer });
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-[#1e3a6e] px-4 py-2 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10">
            <Building2 size={15} className="text-blue-200" />
          </div>
          <div>
            <div className="text-xs font-semibold">UNZA CS NAVIGATION SYSTEM</div>
            <div className="text-[10px] text-blue-200">University of Zambia</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-blue-100">
          <span className="hidden sm:inline">{session.displayName} · {session.role}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 rounded-lg border border-blue-400/30 px-2.5 py-1 text-blue-200 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900 px-2 py-1">
        {tabs.map((buttonTab) => (
          <button
            key={buttonTab.id}
            onClick={() => setTab(buttonTab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition ${
              tab === buttonTab.id
                ? 'border-b-2 border-blue-500 bg-slate-800 text-blue-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {buttonTab.icon}
            {buttonTab.label}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-hidden">
        {tab === 'home' && <HomeTab session={session} onTabChange={setTab} />}
        {tab === 'lecturers' && !selectedLecturer && (
          <LecturerDirectory onSelectLecturer={handleSelectLecturer} onNavigateToOffice={handleNavigateToOffice} />
        )}
        {tab === 'lecturers' && selectedLecturer && (
          <LecturerProfileManager
            lecturer={selectedLecturer}
            editable={session.role === 'lecturer_admin' || capabilities.canManageLecturers}
            onBack={() => setSelectedLecturer(null)}
            onSave={handleSaveLecturer}
          />
        )}
        {tab === 'map' && <MapTab role={session.role} destinationRoomId={pendingOfficeTarget ?? undefined} />}
        {tab === 'events' && <EventsTab session={session} />}
      </main>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>('login');
  const [session, setSession] = useState<Session | null>(null);

  const handleLogin = (nextSession: Session) => {
    setSession(nextSession);
    setView('dashboard');
  };

  const handleLogout = () => {
    setSession(null);
    setView('login');
  };

  if (view === 'login' || !session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard session={session} onLogout={handleLogout} />;
}
