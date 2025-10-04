# JPYC SDK v1 サンプルプロジェクト

このプロジェクトは、JPYC SDK v1を使用してSepoliaテストネット上のJPYCコントラクトと対話するためのサンプル実装です。

## 前提条件

- Node.js ^20.12.0
- yarn

## セットアップ

1. **リポジトリのクローン**
   ```bash
   git clone <このリポジトリのURL>
   cd jpyc-sdk-v1
   ```

2. **依存関係のインストール**
   ```bash
   yarn install
   ```

3. **環境変数の設定**
   ```bash
   cp .env.example .env
   ```
   
   `.env`ファイルを編集して、以下の値を設定してください：
   - `RPC_ENDPOINT`: AlchemyやInfuraなどのEthereum RPC URL
   - `PRIVATE_KEY`: 使用するウォレットの秘密鍵（テスト用）

## 使用方法

`src/index.ts`の実行：

```bash
yarn start
```

## 主要な依存関係

- `@jpyc/sdk-v1`: JPYC公式SDK
- `viem`: Ethereumとの対話用ライブラリ
