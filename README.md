## Stair Crusher Club Admin

계단뿌셔클럽 어드민 사이트

![PNPM](https://img.shields.io/badge/pnpm-%234a4a4a.svg?style=for-the-badge&logo=pnpm&logoColor=f69220) ![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) [![Static Badge](https://img.shields.io/badge/localhost-3066-brightgreen?style=for-the-badge)](http://localhost:3066)

## 시작하기

### 이 프로젝트는 pnpm을 사용합니다.

```bash
npm i -g corepack@latest
corepack use pnpm@latest-10
corepack enable pnpm
```

```bash
# 인스톨
pnpm i
# 스타일 설정
pnpm panda
# dev 서버 실행
pnpm dev
```

### 환경 설정

`.env` 파일 혹은 환경변수에 `NEXT_PUBLIC_DEPLOY_TYPE`을 `dev` | `live`로 설정하여 연결되는 엔드포인트를 변경할 수 있습니다.

```sh
# live 서버로 연결하기
NEXT_PUBLIC_DEPLOY_TYPE=live pnpm dev
```

### 로컬 실행

`pnpm dev`를 통해 로컬에서 실행한 경우, 3066 포트를 사용합니다. [http://localhost:3066](http://localhost:3066)

### 배포

- DEV - `main` 브랜치에 커밋될 때마다 자동으로 배포됩니다.
- PROD - semantic versioning 을 따르는 이름의 태그가 push 되면 배포가 시작됩니다.
