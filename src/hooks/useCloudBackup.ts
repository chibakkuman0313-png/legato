import { useState } from 'react';
import { DigitalAsset } from '../types/asset';
import { encryptAssets, decryptAssets } from './useShareLink';

const CLOUD_CONFIG_KEY  = 'dlv_cloud_config';
const CLOUD_SYNC_KEY    = 'dlv_cloud_last_sync';
const BACKUP_TABLE      = 'legacyvault_backups';

export interface CloudConfig {
  supabaseUrl:     string;
  supabaseAnonKey: string;
  backupId:        string;
  passphrase:      string;
}

export type CloudStatus = 'idle' | 'uploading' | 'downloading' | 'success' | 'error';

export function useCloudBackup() {
  const [config, setConfigState] = useState<CloudConfig>(() => {
    try { return JSON.parse(localStorage.getItem(CLOUD_CONFIG_KEY) ?? '{}'); }
    catch { return {} as CloudConfig; }
  });
  const [status, setStatus]   = useState<CloudStatus>('idle');
  const [lastSync, setLastSync] = useState<string | null>(
    () => localStorage.getItem(CLOUD_SYNC_KEY)
  );
  const [error, setError] = useState<string | null>(null);

  const isConfigured = !!(
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    config.backupId &&
    config.passphrase
  );

  function saveConfig(cfg: CloudConfig) {
    setConfigState(cfg);
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(cfg));
  }

  async function getClient() {
    const { createClient } = await import('@supabase/supabase-js');
    return createClient(config.supabaseUrl, config.supabaseAnonKey);
  }

  /** 資産をAES-256-GCM暗号化してSupabaseへアップロード */
  async function uploadBackup(assets: DigitalAsset[]): Promise<boolean> {
    if (!isConfigured) { setError('設定が不完全です'); return false; }
    setStatus('uploading');
    setError(null);
    try {
      const supabase      = await getClient();
      const encryptedData = await encryptAssets(assets, config.passphrase);

      const { error: upsertError } = await supabase
        .from(BACKUP_TABLE)
        .upsert(
          { backup_key: config.backupId, encrypted_data: encryptedData, updated_at: new Date().toISOString() },
          { onConflict: 'backup_key' }
        );
      if (upsertError) throw new Error(upsertError.message);

      const now = new Date().toISOString();
      setLastSync(now);
      localStorage.setItem(CLOUD_SYNC_KEY, now);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロードに失敗しました');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
      return false;
    }
  }

  /** Supabaseからダウンロードして復号 */
  async function downloadBackup(): Promise<DigitalAsset[] | null> {
    if (!isConfigured) { setError('設定が不完全です'); return null; }
    setStatus('downloading');
    setError(null);
    try {
      const supabase = await getClient();
      const { data, error: fetchError } = await supabase
        .from(BACKUP_TABLE)
        .select('encrypted_data')
        .eq('backup_key', config.backupId)
        .single();
      if (fetchError) throw new Error(fetchError.message);
      if (!data)      throw new Error('バックアップが見つかりません');

      const assets = await decryptAssets(data.encrypted_data as string, config.passphrase);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2500);
      return assets;
    } catch (e) {
      setError(e instanceof Error ? e.message : '復元に失敗しました');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
      return null;
    }
  }

  return {
    config, saveConfig,
    uploadBackup, downloadBackup,
    status, lastSync, error, isConfigured,
  };
}
