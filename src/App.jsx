import React, { useState, useEffect } from 'react';
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
import { getUserStats, updateUserStats, db } from './services/storageService';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSessionDeck, setActiveSessionDeck] = useState(null);
  const [activeSessionCards, setActiveSessionCards] = useState([]);
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [cardContextForBee, setCardContextForBee] = useState('');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    userId: 'local_user',
    username: 'Bee Learner',
    email: 'student@beestudy.ai',
    avatarUrl: '/bee_frame_4.png',
    isAuthenticated: true
  });

  useEffect(() => {
    async function loadData() {
      const stats = await getUserStats();
      setUserStats(stats);
    }
    loadData();
  }, []);

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
    const updated = await updateUserStats({
      totalXp: (userStats?.totalXp || 350) + amount,
      weeklyXp: (userStats?.weeklyXp || 350) + amount
    });
    setUserStats(updated);
  };

  const handleUpdateUserStats = async (updates) => {
    const updated = await updateUserStats(updates);
    setUserStats(updated);
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
      onOpenScan={() => {
        setActiveSessionDeck(null);
        setActiveTab('studio');
      }}
      onOpenQuickReview={() => {
        setActiveSessionDeck(null);
        setActiveTab('quick');
      }}
      currentUser={currentUser}
      onUserAuthChange={(user) => {
        setCurrentUser(user);
      }}
      onUpdateUserStats={handleUpdateUserStats}
    >
      {/* Active Study Arena View */}
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

          {activeTab === 'quick' && (
            <QuickReviewer onClose={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'askbee' && <AskBeeAnything />}

          {activeTab === 'studio' && (
            <FileScanner
              onDeckCreated={(newDeckId) => {
                db.decks.get(newDeckId).then((d) => {
                  if (d) handleStartSession(d);
                });
              }}
            />
          )}

          {activeTab === 'leaderboard' && <LeaderboardView />}

          {activeTab === 'feynman' && <FeynmanStudio />}

          {activeTab === 'analytics' && <AnalyticsView userStats={userStats} />}
        </>
      )}

      {/* Onboarding Profile Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={(profileData) => {
          handleClaimXp(100);
          handleUpdateUserStats(profileData);
        }}
      />

      {/* Ask Bee AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
        cardContext={cardContextForBee}
      />
    </AppShell>
  );
}
