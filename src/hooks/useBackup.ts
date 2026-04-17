import { DigitalAsset } from '../types/asset';
import { TrustedContact } from '../types/asset';

export interface BackupData {
  version: '1.0';
  exportedAt: string;
  assets: DigitalAsset[];
  contacts: TrustedContact[];
  switchMessage: string;
  triggerDays: number;
}

/** ② JSONバックアップをダウンロード */
export function exportBackup(data: Omit<BackupData, 'version' | 'exportedAt'>): void {
  const payload: BackupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    ...data,
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `legacyvault-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** ② JSONファイルを読み込んでBackupDataを返す */
export function importBackup(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as BackupData;
        if (!parsed.version || !Array.isArray(parsed.assets)) {
          reject(new Error('バックアップファイルの形式が正しくありません'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('JSONの解析に失敗しました'));
      }
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsText(file);
  });
}
