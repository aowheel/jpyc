# JPYC Contract Interaction Sample

このプロジェクトはSepoliaテストネット上のJPYCコントラクトと対話するためのサンプル実装です。

## セットアップ

1. **リポジトリのクローン**
```sh
git clone <このリポジトリのURL>
cd jpyc
```

2. **依存関係のインストール**
```sh
pnpm install
```

3. **環境変数ファイルのコピー**
```sh
cp scripts/.env.example scripts/.env
cp frontend/.env.example frontend/.env
```

4. **フロントエンドの起動**
```sh
pnpm frontend dev
```

5. **スクリプトのヘルプ表示**
```sh
pnpm scripts start -h
```
