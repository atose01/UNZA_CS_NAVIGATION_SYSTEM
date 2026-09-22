import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Home, LogOut, Map as MapIcon, Users } from 'lucide-react';
import unzaLogo from './assets/UNZA logo.png';
import { EventsTab } from './EventsTab';
import { HomeTab } from './HomeTab';
import { LecturerDirectory } from './LecturerDirectory';
import { LecturerProfileManager } from './LecturerProfileManager';
import { LoginPage } from './LoginPage';
import { MapTab } from './components/MapData/MapTab';
import { getRoleCapabilities, type Announcement, type EventRecord, type LecturerProfile, type Session, type Tab, type TimetableEntry, type View } from './navigationLogic';
import { restoreSession, signOut, updateOwnProfile } from './services/authService';
import {
  createEvent,
  createLecturer,
  deleteEvent,
  getDashboardSummary,
  listAnnouncements,
  listEvents,
  listLecturers,
  listTimetable,
  updateEvent,
  updateLecturer,
  type DashboardSummary,
} from './services/appData';

function Dashboard({ session, onLogout }: { session: Session; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('home');
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerProfile | null>(null);
  const [pendingOfficeTarget, setPendingOfficeTarget] = useState<string | null>(null);
  const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dataError, setDataError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const capabilities = getRoleCapabilities(session.role);

  const tabs = [
    { id: 'home', label: 'Dashboard', icon: <Home size={14} /> },
    { id: 'lecturers', label: 'Lecturers', icon: <Users size={14} /> },
    { id: 'map', label: 'Map', icon: <MapIcon size={14} /> },
    { id: 'events', label: 'Events', icon: <CalendarDays size={14} /> },
  ] as const;

  const loadData = async () => {
    setDataError('');
    setLoadingData(true);
    const results = await Promise.allSettled([
      listLecturers(),
      listEvents(),
      listAnnouncements(),
      listTimetable(),
      getDashboardSummary(),
    ]);
    const [lecturerResult, eventResult, announcementResult, timetableResult, summaryResult] = results;
    if (lecturerResult.status === 'fulfilled') setLecturers(lecturerResult.value);
    if (eventResult.status === 'fulfilled') setEvents(eventResult.value);
    if (announcementResult.status === 'fulfilled') setAnnouncements(announcementResult.value);
    if (timetableResult.status === 'fulfilled') setTimetable(timetableResult.value);
    if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);

    const firstError = results.find((result) => result.status === 'rejected');
    if (firstError?.status === 'rejected') {
      setDataError(firstError.reason instanceof Error ? firstError.reason.message : 'Unable to load department data.');
    }
    setLoadingData(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const lecturerProfile = useMemo(
    () => selectedLecturer ?? lecturers.find((lecturer) => lecturer.id === session.lecturerProfileId) ?? null,
    [lecturers, selectedLecturer, session.lecturerProfileId],
  );

  const handleSelectLecturer = (lecturer: LecturerProfile) => {
    setSelectedLecturer(lecturer);
    setPendingOfficeTarget(null);
  };

  const handleCreateLecturer = () => {
    setSelectedLecturer({
      id: '',
      fullName: '',
      academicTitle: 'Lecturer',
      department: 'Computer Science',
      specialization: '',
      coursesTaught: [],
      email: '',
      phone: '',
      building: 'Computer Science Building',
      floor: 'Ground Floor',
      room: '',
      officeRoomId: undefined,
      status: 'active',
    });
    setTab('lecturers');
  };

  const handleNavigateToOffice = (lecturer: LecturerProfile) => {
    setSelectedLecturer(lecturer);
    setPendingOfficeTarget(lecturer.officeRoomId ?? null);
    setTab('map');
  };

  const handleSaveLecturer = async (updatedLecturer: LecturerProfile) => {
    try {
      if (session.role === 'lecturer_admin' && session.userId && updatedLecturer.id === session.lecturerProfileId) {
        await updateOwnProfile({
          full_name: updatedLecturer.fullName,
          email: updatedLecturer.email,
          phone_number: updatedLecturer.phone,
          department: updatedLecturer.department,
          office_room: updatedLecturer.officeRoomId || updatedLecturer.room,
          profile_image: updatedLecturer.profileImage || null,
        });
      }
      const saved = updatedLecturer.id ? await updateLecturer(updatedLecturer) : await createLecturer(updatedLecturer);
      setLecturers((current) => updatedLecturer.id
        ? current.map((lecturer) => lecturer.id === saved.id ? { ...lecturer, ...updatedLecturer } : lecturer)
        : [...current, saved]);
      setSelectedLecturer({ ...saved });
      setDataError('');
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to save lecturer profile.');
      throw error;
    }
  };

  const handleCreateEvent = async (event: EventRecord) => {
    const saved = await createEvent(event, session.userId);
    setEvents((current) => [...current, saved].sort((a, b) => a.startDateTime.localeCompare(b.startDateTime)));
  };

  const handleUpdateEvent = async (event: EventRecord) => {
    const saved = await updateEvent(event);
    setEvents((current) => current.map((item) => item.id === saved.id ? saved : item));
  };

  const handleDeleteEvent = async (id: string) => {
    await deleteEvent(id);
    setEvents((current) => current.filter((event) => event.id !== id));
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 bg-[#1e3a6e] px-4 py-2 text-white">
        <div className="flex items-center gap-3">
            <img src={unzaLogo} alt="University of Zambia" className="h-8 w-8 rounded-full bg-white p-1 object-contain" />
          <div>
            <div className="text-xs font-semibold">UNZA CS NAVIGATION SYSTEM</div>
            <div className="text-[10px] text-blue-200">University of Zambia</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-blue-100">
          <span className="hidden sm:inline">{session.displayName} · {session.role}</span>
          <button onClick={onLogout} className="flex items-center gap-1 rounded-lg border border-blue-400/30 px-2.5 py-1 text-blue-200 transition hover:bg-white/10 hover:text-white">
            <LogOut size={12} /> Logout
          </button>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-800 bg-slate-900 px-2 py-1">
        {tabs.map((buttonTab) => (
          <button key={buttonTab.id} onClick={() => setTab(buttonTab.id)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition ${tab === buttonTab.id ? 'border-b-2 border-blue-500 bg-slate-800 text-blue-300' : 'text-slate-400 hover:text-slate-200'}`}>
            {buttonTab.icon}
            {buttonTab.label}
          </button>
        ))}
      </nav>

      <main className="min-h-0 flex-1 overflow-hidden">
        {dataError && <div className="mx-4 mt-3 rounded-lg border border-amber-700/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{dataError}</div>}
        {loadingData && <div className="mx-4 mt-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-400">Loading department data…</div>}
        {tab === 'home' && <HomeTab session={session} onTabChange={setTab} summary={summary} announcements={announcements} events={events} timetable={timetable} />}
        {tab === 'lecturers' && !lecturerProfile && <LecturerDirectory lecturers={lecturers} canManage={capabilities.canManageLecturers} onCreateLecturer={handleCreateLecturer} onSelectLecturer={handleSelectLecturer} onNavigateToOffice={handleNavigateToOffice} />}
        {tab === 'lecturers' && lecturerProfile && <LecturerProfileManager lecturer={lecturerProfile} editable={session.role === 'developer_admin' || (session.role === 'lecturer_admin' && lecturerProfile.id === session.lecturerProfileId)} onBack={() => setSelectedLecturer(null)} onSave={handleSaveLecturer} />}
        {tab === 'map' && <MapTab role={session.role} destinationRoomId={pendingOfficeTarget ?? undefined} />}
        {tab === 'events' && <EventsTab session={session} events={events} canManage={capabilities.canManageEvents} onCreate={handleCreateEvent} onUpdate={handleUpdateEvent} onDelete={handleDeleteEvent} />}
      </main>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>('login');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    void restoreSession().then((restored) => {
      if (restored) {
        setSession(restored);
        setView('dashboard');
      }
    }).catch(() => undefined);
  }, []);

  const handleLogin = (nextSession: Session) => {
    setSession(nextSession);
    setView('dashboard');
  };

  const handleBrowseAsVisitor = () => {
    setSession({ email: '', displayName: 'Visitor', role: 'student', mode: 'regular' });
    setView('dashboard');
  };

  const handleLogout = () => {
    void signOut().finally(() => {
      setSession(null);
      setView('login');
    });
  };

  if (view === 'login' || !session) return <LoginPage onLogin={handleLogin} onBrowse={handleBrowseAsVisitor} />;
  return <Dashboard session={session} onLogout={handleLogout} />;
}
