import React, { useState, useEffect, useCallback } from 'react';
import SplashLoader from './components/SplashLoader';
import AppShell from './components/AppShell';
import Dashboard from './components/Dashboard';
import FileScanner from './components/FileScanner';
import StudyArena from './components/StudyArena';
import LeaderboardView from './components/LeaderboardView';
import FeynmanStudio from './components/FeynmanStudio';
import AITutorDrawer from './components/AITutorDrawer';
import AnalyticsView from './components/AnalyticsView';
import QuickReviewer from './components/QuickReviewer';
import AskBeeAnything from './components/AskBeeAnything';
import OnboardingModal from './components/OnboardingModal';
import AdminLoginPage from './components/AdminLoginPage';
import AdminPanel from './components/AdminPanel';
import { getUserStats, updateUserStats, db } from './services/storageService';
import { getStoredSession } from './services/authService';
import { getSupabaseClient } from './services/supabaseService';

const isAdminRoute = window.location.pathname === '/admin' || window.location.hash === '#/admin';

export default function App() {
  const [showSplash, setShowSplash] = useState(!isAdminRoute);
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSessionDeck, setActiveSessionDeck] = useState(null);
  const [activeSessionCards, setActiveSessionCards] = useState([]);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [cardContextForBee, setCardContextForBee] = useState('');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredSession());

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => sessionStorage.getItem('bee_admin_session') === 'true'
  );

  // ── Load User Stats (from Supabase if logged in, else local IndexedDB) ──
  const loadStats = useCallback(async () => {
    if (isAdminRoute) return;

    if (currentUser?.userId && currentUser.userId !== 'local_user') {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', currentUser.userId)
          .maybeSingle();

        if (data) {
          let streakVal = data.current_streak ?? 1;
          if ((data.total_xp ?? 0) === 0 && streakVal !== 1) {
            streakVal = 1;
            supabase.from('user_stats').update({ current_streak: 1, longest_streak: 1 }).eq('user_id', currentUser.userId);
          }

          setUserStats({
            userId: data.user_id,
            username: data.username,
            totalXp: data.total_xp ?? 0,
            weeklyXp: data.weekly_xp ?? 0,
            currentStreak: streakVal,
            longestStreak: Math.max(streakVal, data.longest_streak ?? 1),
            level: data.level ?? 1,
            cardsMastered: data.cards_mastered ?? 0,
            cardsStudiedToday: data.cards_studied_today ?? 0,
            dailyGoalTarget: data.daily_goal_target ?? 20,
            cityLocation: data.city_location || '',
            educationLevel: data.education_level || '',
            avatarUrl: data.avatar_url || null,
            leagueTier: data.league_tier || 'Bronze',
          });
          return;
        }
      }
    }

    const localStats = await getUserStats();
    setUserStats(localStats);
  }, [currentUser]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // ── Admin Route ──────────────────────────────────────────────────────────
  if (isAdminRoute) {
    if (!isAdminAuthenticated) {
      return <AdminLoginPage onAdminAuthenticated={setIsAdminAuthenticated} />;
    }
    return (
      <AdminPanel
        onLogout={() => {
          sessionStorage.removeItem('bee_admin_session');
          setIsAdminAuthenticated(false);
        }}
      />
    );
  }

  // ── Session & XP Handlers ────────────────────────────────────────────────
  const handleStartSession = async (deck) => {
    const cards = await db.cards.where('deckId').equals(deck.id).toArray();
    setActiveSessionDeck(deck);
    setActiveSessionCards(cards);
  };

  const handleFinishSession = () => {
    setActiveSessionDeck(null);
    setActiveSessionCards([]);
    setActiveTab('dashboard');
  };

  const handleOpenAskBee = (contextText) => {
    setCardContextForBee(contextText || '');
    setAiTutorOpen(true);
  };

  const handleClaimXp = async (amount) => {
    const currentXp = userStats?.totalXp ?? 0;
    const currentWeekly = userStats?.weeklyXp ?? 0;
    const newTotal = currentXp + amount;
    const newWeekly = currentWeekly + amount;

    const updated = { ...userStats, totalXp: newTotal, weeklyXp: newWeekly };
    setUserStats(updated);
    await updateUserStats({ totalXp: newTotal, weeklyXp: newWeekly });

    if (currentUser?.userId && currentUser.userId !== 'local_user') {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('user_stats')
          .update({ total_xp: newTotal, weekly_xp: newWeekly })
          .eq('user_id', currentUser.userId);
      }
    }
  };

  const handleUpdateUserStats = async (updates) => {
    const updated = { ...userStats, ...updates };
    setUserStats(updated);
    await updateUserStats(updates);

    if (currentUser?.userId && currentUser.userId !== 'local_user') {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('user_stats')
          .update({
            city_location: updates.cityLocation,
            education_level: updates.educationLevel,
            target_exam: updates.targetExam,
            preferred_study_style: updates.preferredStudyStyle,
          })
          .eq('user_id', currentUser.userId);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserStats(null);
  };

  if (showSplash) {
    return <SplashLoader onFinished={() => setShowSplash(false)} />;
  }

  return (
    <AppShell
      userStats={userStats}
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveSessionDeck(null);
        setActiveTab(tab);
      }}
      onOpenScan={() => { setActiveSessionDeck(null); setActiveTab('studio'); }}
      onOpenQuickReview={() => { setActiveSessionDeck(null); setActiveTab('quick'); }}
      currentUser={currentUser}
      onUserAuthChange={(user) => setCurrentUser(user)}
      onLogout={handleLogout}
      onUpdateUserStats={handleUpdateUserStats}
    >
      {activeSessionDeck ? (
        <StudyArena
          deck={activeSessionDeck}
          cards={activeSessionCards}
          onFinishSession={handleFinishSession}
          onAskBee={handleOpenAskBee}
          onClaimXp={handleClaimXp}
        />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <Dashboard
              userStats={userStats}
              onStartSession={handleStartSession}
              onOpenScan={() => setActiveTab('studio')}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onClaimXp={handleClaimXp}
            />
          )}
          {activeTab === 'library' && (
            <Dashboard
              userStats={userStats}
              onStartSession={handleStartSession}
              onOpenScan={() => setActiveTab('studio')}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onClaimXp={handleClaimXp}
            />
          )}
          {activeTab === 'quick' && <QuickReviewer onClose={() => setActiveTab('dashboard')} />}
          {activeTab === 'askbee' && <AskBeeAnything />}
          {activeTab === 'studio' && (
            <FileScanner
              onDeckCreated={(newDeckId) => {
                db.decks.get(newDeckId).then((d) => { if (d) handleStartSession(d); });
              }}
            />
          )}
          {activeTab === 'leaderboard' && <LeaderboardView userStats={userStats} />}
          {activeTab === 'feynman' && <FeynmanStudio onClaimXp={handleClaimXp} />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </>
      )}

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={(profileData) => {
          handleClaimXp(100);
          handleUpdateUserStats(profileData);
        }}
      />

      <AITutorDrawer
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
        cardContext={cardContextForBee}
      />
    </AppShell>
  );
}
