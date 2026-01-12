import { useState, useEffect } from 'react';
import { getItems } from './hooks/useRiotApi';
import { useItemBuilder } from './hooks/useItemBuilder';
import { ItemGrid } from './components/ItemGrid';
import { SelectedItems } from './components/SelectedItems';
import { BuildTree } from './components/BuildTree';
import { StatsPanel } from './components/StatsPanel';
import { WinrateDisplay } from './components/WinrateDisplay';
import './App.css';

function App() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    selectedItems,
    addItem,
    removeItem,
    clearItems,
    getBuildTree,
    calculateStats,
    calculateTotalGold,
    isFull
  } = useItemBuilder(items);

  useEffect(() => {
    async function loadItems() {
      try {
        setLoading(true);
        const itemsData = await getItems('ko_KR');
        setItems(itemsData);
      } catch (err) {
        setError('아이템 데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, []);

  const handleItemClick = (itemId) => {
    if (selectedItems.includes(itemId)) {
      removeItem(itemId);
    } else if (!isFull) {
      addItem(itemId);
    }
  };

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="loader">
          <div className="spinner"></div>
          <p>아이템 데이터 로딩중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app error-screen">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="logo-icon">⚔️</span>
          LoL 아이템 빌더
        </h1>
        <p className="subtitle">아이템을 선택하고 빌드를 분석하세요</p>
      </header>

      <main className="app-main">
        <section className="selected-section">
          <SelectedItems
            selectedItems={selectedItems}
            allItems={items}
            onRemove={removeItem}
            onClear={clearItems}
          />
        </section>

        <div className="content-grid">
          <section className="items-section">
            <ItemGrid
              items={items}
              selectedItems={selectedItems}
              onItemClick={handleItemClick}
            />
          </section>

          <aside className="sidebar">
            <StatsPanel
              stats={calculateStats()}
              totalGold={calculateTotalGold()}
            />

            <WinrateDisplay
              selectedItems={selectedItems}
              allItems={items}
            />
          </aside>
        </div>

        <section className="build-tree-section">
          <BuildTree
            selectedItems={selectedItems}
            allItems={items}
            getBuildTree={getBuildTree}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>Riot Games Data Dragon API 사용 | 승률 데이터는 예시입니다</p>
      </footer>
    </div>
  );
}

export default App;
