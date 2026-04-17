import { useState, useMemo } from 'react';
import { Plus, Search, SlidersHorizontal, Lock, Sparkles } from 'lucide-react';
import { useAssets } from '../hooks/useAssets';
import { useContacts } from '../hooks/useContacts';
import { usePremium, FREE_ASSET_LIMIT } from '../hooks/usePremium';
import { Header } from './Header';
import { AssetCard } from './AssetCard';
import { AssetForm } from './AssetForm';
import { DeadManBanner } from './DeadManBanner';
import { SponsorBanner } from './SponsorBanner';
import { UpgradeModal } from './UpgradeModal';
import { DigitalAsset, AssetCategory, CATEGORY_LABELS } from '../types/asset';

const ALL_CATEGORIES = 'all' as const;
type FilterCategory = AssetCategory | typeof ALL_CATEGORIES;

export function Dashboard() {
  const {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    confirmAsset,
    totalMonthlyCost,
    lastLogin,
    daysSinceLastLogin,
    isDeadManSwitchTriggered,
  } = useAssets();
  const { triggerDays } = useContacts();
  const { isPremium } = usePremium();

  function handleSaveAudio(id: string, base64: string) {
    updateAsset(id, { audioMemo: base64 });
  }

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<DigitalAsset | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>(ALL_CATEGORIES);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 資産制限チェック
  const isAtLimit = !isPremium && assets.length >= FREE_ASSET_LIMIT;

  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch =
        searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.loginId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        filterCategory === ALL_CATEGORIES || asset.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [assets, searchQuery, filterCategory]);

  function handleSave(data: Omit<DigitalAsset, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editingAsset) {
      updateAsset(editingAsset.id, data);
    } else {
      addAsset(data);
    }
    setIsFormOpen(false);
    setEditingAsset(undefined);
  }

  function handleEdit(asset: DigitalAsset) {
    setEditingAsset(asset);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingAsset(undefined);
  }

  /** +ボタンのクリックハンドラ */
  function handleAddClick() {
    if (isAtLimit) {
      setShowUpgradeModal(true);
    } else {
      setIsFormOpen(true);
    }
  }

  // カテゴリ別件数
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<AssetCategory, number>> = {};
    assets.forEach(a => {
      counts[a.category] = (counts[a.category] ?? 0) + 1;
    });
    return counts;
  }, [assets]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header
        totalAssets={assets.length}
        totalMonthlyCost={totalMonthlyCost}
        lastLogin={lastLogin}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* デッドマンズスイッチバナー */}
        <DeadManBanner
          daysSinceLastLogin={daysSinceLastLogin}
          triggerDays={triggerDays}
          isTriggered={isDeadManSwitchTriggered}
        />

        {/* 資産制限の警告バナー */}
        {isAtLimit && (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-700/40 rounded-xl px-4 py-3 transition-all hover:border-indigo-500/60 group"
          >
            <div className="w-8 h-8 bg-indigo-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-indigo-400 group-hover:hidden" />
              <Sparkles className="w-4 h-4 text-indigo-400 hidden group-hover:block" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-white">
                資産登録の上限（{FREE_ASSET_LIMIT}件）に達しました
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                プレミアムプランで無制限に登録できます
              </p>
            </div>
            <span className="text-xs text-indigo-400 font-bold flex-shrink-0">
              詳細 →
            </span>
          </button>
        )}

        {/* 検索 & フィルター */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="サービス名・メモで検索..."
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-600 transition-all"
            />
          </div>

          {/* カテゴリフィルター */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <button
              onClick={() => setFilterCategory(ALL_CATEGORIES)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filterCategory === ALL_CATEGORIES
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              すべて ({assets.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as AssetCategory[]).map(cat => {
              const count = categoryCounts[cat] ?? 0;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filterCategory === cat
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {CATEGORY_LABELS[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 資産リスト */}
        <div className="space-y-2">
          {filteredAssets.length > 0 ? (
            filteredAssets.map((asset, i) => (
              <div key={asset.id}>
                <AssetCard
                  asset={asset}
                  onEdit={handleEdit}
                  onDelete={deleteAsset}
                  onConfirm={confirmAsset}
                  onSaveAudio={handleSaveAudio}
                />
                {/* 3件目の後にコンパクト広告を挟む */}
                {i === 2 && filteredAssets.length > 3 && (
                  <div className="mt-2">
                    <SponsorBanner slot="dashboard" compact />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-slate-500">
              {searchQuery || filterCategory !== ALL_CATEGORIES ? (
                <>
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">該当する資産が見つかりません</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">🔐</div>
                  <p className="text-sm font-medium text-slate-400">まだ資産が登録されていません</p>
                  <p className="text-xs mt-1">「＋ 追加」ボタンから始めましょう</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* 資産リスト下の広告（コンテンツ間） */}
        {filteredAssets.length > 0 && (
          <SponsorBanner slot="dashboard-bottom" />
        )}
      </main>

      {/* 追加ボタン（FAB） */}
      <button
        onClick={handleAddClick}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
          isAtLimit
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-purple-900/60'
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/60'
        } text-white`}
        aria-label={isAtLimit ? 'プランをアップグレード' : '資産を追加'}
      >
        {isAtLimit ? <Sparkles className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>

      {/* フォームモーダル */}
      {isFormOpen && (
        <AssetForm
          initialData={editingAsset}
          onSave={handleSave}
          onClose={handleCloseForm}
        />
      )}

      {/* アップグレードモーダル */}
      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
