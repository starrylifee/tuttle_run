# 거북이 학교 보물찾기

프로토타입 HTML을 유지보수 가능한 `React + TypeScript + Vite` 구조로 옮긴 버전입니다.

## 실행

```bash
yarn install
yarn dev
```

## Live Server로 열 때

이 프로젝트의 루트 `index.html`은 Vite 개발용 진입점이라서 `Live Server`로 바로 열면 동작하지 않습니다.

`Live Server`를 써야 한다면 아래 순서로 진행해야 합니다.

```bash
yarn build
```

그다음 `dist/index.html`을 열거나, `dist` 폴더를 서버 루트로 잡아 실행하세요.

## 핵심 개선점

- 단일 HTML/스크립트를 컴포넌트, 게임 로직, 데이터, 유틸로 분리
- 브라우저 로컬 스토리지에 현재 진행 상태와 기록 자동 저장
- 모바일에서도 무너지지 않도록 반응형 레이아웃으로 재구성
- 지도 밖 이동, 타원형 운동장 충돌, 명령 실행 종료 피드백 등 프로토타입의 빈틈 보완

## 폴더 구조

```text
src/
  components/game/   UI 컴포넌트
  data/              맵, 레벨, 상수
  hooks/             게임 상태와 실행 로직
  styles/            테마와 전역 스타일
  types/             타입 정의
  utils/             충돌 계산, 시간, 저장 유틸
```
"# tuttle_run" 
