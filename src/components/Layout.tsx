import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MainContent } from './MainContent';

export function Layout() {
  /** Default to Rebalancing (`refresh`) — task list shows first; row / “Create new” opens workspace. */
  const [activeMainNavId, setActiveMainNavId] = useState('refresh');
  /** While on Rebalancing: `true` = task list (screenshot), `false` = assortment workspace. Reset when Rebalancing is selected in the sidebar. */
  const [rebalancingShowTaskList, setRebalancingShowTaskList] = useState(true);

  const handleMainNavChange = (id: string) => {
    if (id === 'refresh') {
      setRebalancingShowTaskList(true);
    }
    setActiveMainNavId(id);
  };

  const enterRebalancingWorkspace = () => {
    setRebalancingShowTaskList(false);
  };

  const showRebalancingTaskList = activeMainNavId === 'refresh' && rebalancingShowTaskList;

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar
        activeMainNavId={activeMainNavId}
        onMainNavChange={handleMainNavChange}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeMainNavId={activeMainNavId}
          rebalancingHeaderMode={showRebalancingTaskList ? 'taskList' : 'workspace'}
          onSwitchBack={() => handleMainNavChange('home')}
          onCreateNewRebalancing={showRebalancingTaskList ? enterRebalancingWorkspace : undefined}
        />
        <MainContent
          activeMainNavId={activeMainNavId}
          rebalancingListIntroCompleted={
            activeMainNavId !== 'refresh' || !rebalancingShowTaskList
          }
          onEnterRebalancingWorkspace={enterRebalancingWorkspace}
        />
      </div>
    </div>
  );
}
