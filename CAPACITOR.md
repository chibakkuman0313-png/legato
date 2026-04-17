# Capacitor ネイティブアプリ化ガイド

Web版Legato（Vite+React）をiOS/Androidアプリとしてビルド・公開する手順です。

## 📦 セットアップ済み

- `@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android` をインストール済み
- `capacitor.config.ts` 作成済み（appId: `com.legato.app`）
- `ios/`, `android/` ネイティブプロジェクト生成済み

## 🔧 前提ツール

### iOS（macOS必須）
- **Xcode**（App Store から）
- **CocoaPods**: `sudo gem install cocoapods`

### Android
- **Android Studio**（ https://developer.android.com/studio ）
- **JDK 17+**

## 🚀 開発ワークフロー

```bash
# 1. 通常のWeb開発
npm run dev

# 2. ネイティブに反映
npm run cap:sync           # ビルド＋同期のみ
npm run cap:ios            # Xcode を開く
npm run cap:android        # Android Studio を開く
```

## 📱 iOSビルド手順

```bash
cd ios/App
pod install                # 初回のみ（CocoaPods依存関係）
cd ../..
npm run cap:ios            # Xcode 起動
```

Xcode内で：
1. 左上「App」をクリック → Signing & Capabilities
2. Team: ご自身のApple Developer Account（$99/年）
3. Bundle Identifier: `com.legato.app`（重複防止のため変更推奨）
4. Cmd+R でシミュレータ起動 / 実機接続して Play

## 🤖 Androidビルド手順

```bash
npm run cap:android        # Android Studio 起動
```

Android Studio内で：
1. Gradle sync 完了を待つ
2. Run → Run 'app' でエミュレータ/実機実行

APK生成:
- Build → Build Bundle(s) / APK(s) → Build APK(s)

## 🏪 App Store / Google Play 公開

### App Store Connect
1. https://appstoreconnect.apple.com でアプリ新規作成
2. Xcode → Product → Archive → Distribute App
3. スクリーンショット（6.5インチ/5.5インチ）必須
4. プライバシーポリシーURL: `https://legato-lp.vercel.app/#privacy`
5. 審査（通常1〜3日）

### Google Play Console
1. https://play.google.com/console でアプリ新規作成（$25一度きり）
2. Android Studio → Build → Generate Signed Bundle/APK → AAB
3. Playコンソールに .aab をアップロード
4. 内部テスト → クローズドテスト → 本番公開

## 🔄 コード変更時

Webコードを更新したら：
```bash
npm run cap:sync           # dist → ネイティブへ反映
```

その後 Xcode/Android Studio でリビルド。

## ⚠️ 注意点

- **LocalStorage** はCapacitorでも動作しますが、より堅牢な `@capacitor/preferences` プラグインへの移行も検討
- **通知機能** はPWAのService Workerでは限定的。ネイティブでは `@capacitor/push-notifications` を使うとより確実
- **iOS ATT**: トラッキング許可はすでに `TrackingConsent.tsx` で実装済み。`@capacitor/app-tracking-transparency` プラグインでネイティブATTダイアログを表示可能

## 📦 推奨追加プラグイン

```bash
npm i @capacitor/preferences      # LocalStorage代替（iCloud同期可）
npm i @capacitor/push-notifications # プッシュ通知
npm i @capacitor/share            # ネイティブ共有シート
npm i @capacitor/haptics          # 触覚フィードバック
npm i @capacitor/status-bar       # ステータスバー制御
```
