/**
 * Regenerates `RebalancingPrototypeV1.tsx` from a monolithic `MainContent.tsx` workspace slice.
 * After running, copy `RebalancingPrototypeV1.tsx` to V2/V3 and replace `RebalancingPrototypeV1`
 * with `RebalancingPrototypeV2` / `RebalancingPrototypeV3` if you need all three reset from one source.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const mainPath = path.join(root, 'src/components/MainContent.tsx');
const v1Path = path.join(
  root,
  'src/components/rebalancing/prototypes/RebalancingPrototypeV1.tsx'
);

const text = fs.readFileSync(mainPath, 'utf8');
const lines = text.split('\n');

function rewriteImports(line) {
  if (line.includes('RebalancingTaskListScreen')) return null;
  if (line.includes('mainNavModuleIds')) return null;
  return line
    .replaceAll("from './rebalancing/", "from '../")
    .replaceAll("from './", "from '../../")
    .replaceAll("from '../data/", "from '../../../data/")
    .replaceAll("from '../types'", "from '../../../types'")
    .replaceAll("from '../lib/", "from '../../../lib/")
    .replaceAll("from '../tableColumnCustomise'", "from '../../../tableColumnCustomise'");
}

const importBlock = lines.slice(0, 50).map(rewriteImports).filter(Boolean);

const typesAndHelpers = lines.slice(51, 101);
const hookBody = lines.slice(118, 489);
const mainReturn = lines.slice(521, 1045);

const v1Source = [
  ...importBlock,
  '',
  ...typesAndHelpers,
  '',
  'export type RebalancingPrototypeV1Props = {',
  '  prototypeVersion: PrototypeVersionId;',
  '};',
  '',
  'export function RebalancingPrototypeV1({',
  '  prototypeVersion,',
  '}: RebalancingPrototypeV1Props) {',
  ...hookBody,
  ...mainReturn,
  '}',
  '',
].join('\n');

fs.mkdirSync(path.dirname(v1Path), { recursive: true });
fs.writeFileSync(v1Path, v1Source);

const newMain = `import type { PrototypeVersionId } from '../lib/prototypeVersion';
import { MAIN_NAV_ASSORTMENT_BODY_IDS } from '../mainNavModuleIds';
import { RebalancingTaskListScreen } from './rebalancing/RebalancingTaskListScreen';
import { RebalancingPrototypeV1 } from './rebalancing/prototypes/RebalancingPrototypeV1';
import { RebalancingPrototypeV2 } from './rebalancing/prototypes/RebalancingPrototypeV2';
import { RebalancingPrototypeV3 } from './rebalancing/prototypes/RebalancingPrototypeV3';

type MainContentProps = {
  /** Primary sidebar selection — assortment UI only when Rebalancing (\`refresh\`) is active. */
  activeMainNavId?: string;
  /** Prototype variant from Layout rail — each value renders a module under \`rebalancing/prototypes/\`. */
  prototypeVersion?: PrototypeVersionId;
  /** After first task list visit, workspace is shown (persisted in localStorage). */
  rebalancingListIntroCompleted?: boolean;
  onEnterRebalancingWorkspace?: () => void;
};

function rebalancingWorkspaceForVersion(prototypeVersion: PrototypeVersionId) {
  switch (prototypeVersion) {
    case 'v1':
      return <RebalancingPrototypeV1 prototypeVersion={prototypeVersion} />;
    case 'v2':
      return <RebalancingPrototypeV2 prototypeVersion={prototypeVersion} />;
    case 'v3':
      return <RebalancingPrototypeV3 prototypeVersion={prototypeVersion} />;
    default:
      return <RebalancingPrototypeV1 prototypeVersion="v1" />;
  }
}

export function MainContent({
  activeMainNavId = 'home',
  prototypeVersion = 'v1',
  rebalancingListIntroCompleted = true,
  onEnterRebalancingWorkspace,
}: MainContentProps) {
  if (!MAIN_NAV_ASSORTMENT_BODY_IDS.has(activeMainNavId)) {
    return (
      <main
        className="flex min-h-0 flex-1 flex-col bg-slate-50"
        data-prototype-version={prototypeVersion}
      >
        <div className="flex flex-1 flex-col min-h-0 items-center justify-center bg-white px-6 py-4">
          <p className="max-w-md text-center text-sm text-[#4b535c]">
            Select <span className="font-medium text-[#00050a]">Rebalancing</span> in the sidebar to open
            the assortment workspace.
          </p>
        </div>
      </main>
    );
  }

  if (!rebalancingListIntroCompleted) {
    return (
      <main
        className="relative left-0 flex min-h-0 min-w-0 w-full flex-1 flex-col bg-slate-50"
        data-prototype-version={prototypeVersion}
      >
        <RebalancingTaskListScreen
          onOpenTask={() => {
            onEnterRebalancingWorkspace?.();
          }}
        />
      </main>
    );
  }

  return rebalancingWorkspaceForVersion(prototypeVersion);
}
`;

fs.writeFileSync(mainPath, newMain);

console.log('Wrote', v1Path);
console.log('Updated', mainPath);
