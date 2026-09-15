# 3D 온라인 가상 전시 — ROOM A

웹 코딩만으로 만든 첫 번째 완성 전시실입니다. 한쪽에 얕은 단차를 둔 간결한 전시 공간, 작품 8점, 이미지 비율에 맞춘 액자, 1인칭 이동, 벽 충돌, 작품 상세 보기를 포함합니다. PC 시점은 좌우 드래그로만 수평 회전하며 A/D와 좌우 화살표도 좌우 회전에 사용합니다.

## 실행

```bash
npm install
npm run prepare:room-a
npm run dev
```

## 검증

```bash
npm run validate:room-a
npm run typecheck
npm run build
```

## 콘텐츠 수정

- 작품 제목·설명·방 정보: `content/artworks.json`
- 웹용 이미지: `public/artworks/`
- 원본 JPG: 상위 폴더의 `A`, `B`, `C` 폴더에 보존

웹용 이미지를 다시 만들려면 `npm run prepare:room-a`를 실행합니다. 현재 스크립트는 A방의 JPG 8점을 최대 1280px WebP로 변환하며 원본은 수정하지 않습니다.
