import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MainContent } from './MainContent';

export function Layout() {
  const [activeMainNavId, setActiveMainNavId] = useState('home');

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        activeMainNavId={activeMainNavId}
        onMainNavChange={setActiveMainNavId}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeMainNavId={activeMainNavId}
          onSwitchBack={() => setActiveMainNavId('home')}
        />
        <MainContent activeMainNavId={activeMainNavId} />
      </div>
    </div>
  );
}
