import { useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { AlertPanel } from './components/AlertPanel';
import { RecordList } from './components/RecordList';
import { DistributionView } from './components/DistributionView';
import { RecordForm } from './components/RecordForm';
import { BatchActionBar } from './components/BatchActionBar';
import { useRecordStore } from './store/useRecordStore';

function App() {
  const { initRecords, viewMode } = useRecordStore();

  useEffect(() => {
    initRecords();
  }, [initRecords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterBar />
        <AlertPanel />

        {viewMode === 'list' ? <RecordList /> : <DistributionView />}
      </main>

      <RecordForm />
      <BatchActionBar />
    </div>
  );
}

export default App;
