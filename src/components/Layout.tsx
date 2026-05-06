import { useCallback, useRef, useState } from 'react';
import type { PrototypeVersionId } from '../lib/prototypeVersion';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { PrototypeVersionRail } from './PrototypeVersionRail';
import { Sidebar } from './Sidebar';

/** Snapshot of navigation state pushed onto the history stack on every forward navigation. */
type NavSnapshot = {
  activeMainNavId: string;
  rebalancingShowTaskList: boolean;
};

export function Layout() {
  const [prototypeVersion, setPrototypeVersion] = useState<PrototypeVersionId>('v1');
  /** Default to Rebalancing (`refresh`) — task list shows first; row / “Create new” opens workspace. */
  const [activeMainNavId, setActiveMainNavId] = useState('refresh');
  /** While on Rebalancing: `true` = task list (screenshot), `false` = assortment workspace. Reset when Rebalancing is selected in the sidebar. */
  const [rebalancingShowTaskList, setRebalancingShowTaskList] = useState(true);
  /** Stack of prior screens — every forward navigation pushes the current state, the header back button pops it. */
  const [navHistory, setNavHistory] = useState<NavSnapshot[]>([]);
  /**
   * Rebalancing workspace can handle one “step” internally (e.g. close product-transfer drill)
   * before Layout pops sidebar/task-list history — avoids skipping a screen on back.
   */
  const workspaceBackHandlerRef = useRef<(() => boolean) | null>(null);

  const registerWorkspaceBackHandler = useCallback((handler: (() => boolean) | null) => {
    workspaceBackHandlerRef.current = handler;
  }, []);

  const pushHistory = () => {
    setNavHistory((h) => [...h, { activeMainNavId, rebalancingShowTaskList }]);
  };

  const handleMainNavChange = (id: string) => {
    if (id === activeMainNavId) return;
    pushHistory();
    if (id === 'refresh') {
      setRebalancingShowTaskList(true);
    }
    setActiveMainNavId(id);
  };

  const enterRebalancingWorkspace = () => {
    pushHistory();
    setRebalancingShowTaskList(false);
  };

  const handleBack = () => {
    if (
      activeMainNavId === 'refresh' &&
      !rebalancingShowTaskList &&
      workspaceBackHandlerRef.current?.()
    ) {
      return;
    }
    if (navHistory.length === 0) {
      // First-load fallback: from the rebalancing task list there is no recorded prior screen, so step out to home.
      if (activeMainNavId === 'refresh' && rebalancingShowTaskList) {
        setActiveMainNavId('home');
      } else if (activeMainNavId === 'refresh') {
        setRebalancingShowTaskList(true);
      }
      return;
    }
    const prev = navHistory[navHistory.length - 1];
    setActiveMainNavId(prev.activeMainNavId);
    setRebalancingShowTaskList(prev.rebalancingShowTaskList);
    setNavHistory(navHistory.slice(0, -1));
  };

  const showRebalancingTaskList = activeMainNavId === 'refresh' && rebalancingShowTaskList;

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        activeMainNavId={activeMainNavId}
        onMainNavChange={handleMainNavChange}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          activeMainNavId={activeMainNavId}
          prototypeVersion={prototypeVersion}
          rebalancingHeaderMode={showRebalancingTaskList ? 'taskList' : 'workspace'}
          onSwitchBack={() => handleMainNavChange('home')}
          onCreateNewRebalancing={showRebalancingTaskList ? enterRebalancingWorkspace : undefined}
          onBack={handleBack}
        />
        <MainContent
          activeMainNavId={activeMainNavId}
          prototypeVersion={prototypeVersion}
          rebalancingListIntroCompleted={
            activeMainNavId !== 'refresh' || !rebalancingShowTaskList
          }
          onEnterRebalancingWorkspace={enterRebalancingWorkspace}
          registerWorkspaceBackHandler={registerWorkspaceBackHandler}
        />
        <PrototypeVersionRail value={prototypeVersion} onChange={setPrototypeVersion} />
      </div>
    </div>
  );
}
