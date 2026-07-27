import { useCallback, useMemo, useState } from 'react';
import { HomeScreen } from '@/components/screens/HomeScreen/HomeScreen';
import { ObjectSelectionScreen } from '@/components/screens/ObjectSelectionScreen/ObjectSelectionScreen';
import { ScanScreen } from '@/components/screens/ScanScreen/ScanScreen';
import { ProjectsScreen } from '@/components/screens/ProjectsScreen/ProjectsScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen/SettingsScreen';
import { BottomNav, type TabKey } from '@/components/ui/BottomNav';
import { CONSTRUCTION_OBJECTS } from '@/data/mockData';
import { useScanReports } from '@/hooks/useScanReports';
import type { AnalysisResult } from '@/services/aiVision';

type Route =
  | { name: 'home' }
  | { name: 'object-select'; objectId?: string }
  | { name: 'scan'; objectId: string; block: string; floor: string; room: string };

export default function App() {
  const [tab, setTab] = useState<TabKey>('home');
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const { persist } = useScanReports();

  const selection = useMemo(() => {
    if (route.name !== 'scan') return null;
    const obj = CONSTRUCTION_OBJECTS.find((o) => o.id === route.objectId) ?? CONSTRUCTION_OBJECTS[0];
    return { obj, block: route.block, floor: route.floor, room: route.room };
  }, [route]);

  const startScan = useCallback(() => setRoute({ name: 'object-select' }), []);

  const launchScanner = useCallback(
    (objectId: string, block: string, floor: string, room: string) =>
      setRoute({ name: 'scan', objectId, block, floor, room }),
    [],
  );


  const goHome = useCallback(() => {
    setRoute({ name: 'home' });
    setTab('home');
  }, []);

  const openObjectFromProjects = useCallback((objectId: string) => {
    setRoute({ name: 'object-select', objectId });
  }, []);

  const handleTabChange = useCallback((next: TabKey) => {
    setTab(next);
    setRoute({ name: 'home' });
  }, []);

  const isScanning = route.name === 'scan';

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-md min-h-screen bg-surface relative shadow-float">
        {!isScanning && (
          <>
            {tab === 'home' && (
              <>
                {route.name === 'home' && <HomeScreen onStartScan={startScan} />}
                {route.name === 'object-select' && (
                  <ObjectSelectionScreen
                    initialObjectId={route.objectId}
                    onBack={() => setRoute({ name: 'home' })}
                    onLaunchScanner={launchScanner}
                  />
                )}
              </>
            )}
            {tab === 'projects' && (
              <ProjectsScreen onOpenObject={openObjectFromProjects} />
            )}
            {tab === 'settings' && <SettingsScreen />}
            <BottomNav active={tab} onChange={handleTabChange} />
          </>
        )}

        {isScanning && selection && (
<ScanScreen
  objectId={selection.obj.id}
  objectName={selection.obj.name}
  blockName={selection.block}
  floorName={selection.floor}
  roomName={selection.room}
  onBack={goHome}
  onOpenReports={() => {
    setRoute({ name: 'home' });
    setTab('projects');
  }}
  onPersist={persist}
/>
        )}
      </div>
    </div>
  );
}
