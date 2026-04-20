import { useState } from 'react';
import type { PrototypeVersionId } from '../lib/prototypeVersion';
import { Header } from './Header';
import { MainContent } from './MainContent';
import { PrototypeVersionRail } from './PrototypeVersionRail';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [prototypeVersion, setPrototypeVersion] = useState<PrototypeVersionId>('v1');
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Header
          activeMainNavId={activeMainNavId}
          prototypeVersion={prototypeVersion}
          rebalancingHeaderMode={showRebalancingTaskList ? 'taskList' : 'workspace'}
          onSwitchBack={() => handleMainNavChange('home')}
          onCreateNewRebalancing={showRebalancingTaskList ? enterRebalancingWorkspace : undefined}
        />
        <MainContent
          activeMainNavId={activeMainNavId}
          prototypeVersion={prototypeVersion}
          rebalancingListIntroCompleted={
            activeMainNavId !== 'refresh' || !rebalancingShowTaskList
          }
          onEnterRebalancingWorkspace={enterRebalancingWorkspace}
        />
        <PrototypeVersionRail value={prototypeVersion} onChange={setPrototypeVersion} />
      </div>
    </div>
  );
}
