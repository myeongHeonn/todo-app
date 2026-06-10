# TRD (Technical Requirements Document)

**프로젝트명:** Tika  
**버전:** 1.0 (MVP)  
**작성일:** 2026-06-10

---

## 1. 시스템 아키텍처

### 1-1. 전체 구조

Vercel 단일 배포 환경에서 Next.js App Router가 프론트엔드와 백엔드를 모두 담당한다.  
별도 백엔드 서버 없이 Route Handler가 API 진입점 역할을 수행한다.

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                       │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────────────┐ │
│  │   Next.js App    │      │   Vercel Postgres (Neon)  │ │
│  │                  │      │                          │ │
│  │  ┌────────────┐  │      │   tickets table          │ │
│  │  │  React UI  │  │      │                          │ │
│  │  │ (src/client)│ │      └──────────────────────────┘ │
│  │  └─────┬──────┘  │                 ▲                 │
│  │        │ fetch   │                 │                 │
│  │  ┌─────▼──────┐  │                 │                 │
│  │  │   Route    │  │                 │                 │
│  │  │  Handler   │  │                 │                 │
│  │  │ (app/api/) │  │                 │                 │
│  │  └─────┬──────┘  │                 │                 │
│  │        │ call    │                 │                 │
│  │  ┌─────▼──────┐  │                 │                 │
│  │  │  Service   │  │                 │                 │
│  │  │(src/server)│  │                 │                 │
│  │  └─────┬──────┘  │                 │                 │
│  │        │ query   │                 │                 │
│  │  ┌─────▼──────┐  │                 │                 │
│  │  │   Drizzle  ├──┼─────────────────┘                 │
│  │  │    ORM     │  │                                   │
│  │  └────────────┘  │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

### 1-2. 요청 흐름

```
Client Component
    │
    │  fetch (src/client/api/ticketApi.ts)
    ▼
Route Handler  (app/api/tickets/[id]/route.ts)
    │  요청 파싱 + Zod 검증
    ▼
Service        (src/server/services/ticketService.ts)
    │  비즈니스 로직
    ▼
Drizzle ORM    (src/server/db/)
    │  SQL 생성
    ▼
Vercel Postgres (Neon)
```

### 1-3. 디렉터리 구조

```
todo-app/
├── app/
│   ├── api/
│   │   └── tickets/
│   │       ├── route.ts          # GET /api/tickets, POST /api/tickets
│   │       ├── reorder/
│   │       │   └── route.ts      # PATCH /api/tickets/reorder
│   │       └── [id]/
│   │           ├── route.ts      # GET·PATCH·DELETE /api/tickets/:id
│   │           └── complete/
│   │               └── route.ts  # PATCH /api/tickets/:id/complete
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   ├── server/                   # 백엔드 전용 (브라우저 번들 제외)
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle 인스턴스
│   │   │   └── schema.ts         # 테이블 스키마 정의
│   │   └── services/
│   │       └── ticketService.ts  # 티켓 CRUD 비즈니스 로직
│   ├── client/                   # 프론트엔드 전용
│   │   ├── api/
│   │   │   └── ticketApi.ts      # fetch 래퍼 (유일한 API 호출 경로)
│   │   ├── components/
│   │   └── hooks/
│   └── shared/                   # 프론트·백 공유
│       ├── types/
│       │   └── index.ts          # Ticket, TicketStatus 등
│       └── validations/
│           └── ticketSchema.ts   # Zod 스키마
├── docs/
└── CLAUDE.md
```

---

## 2. 기술 스택 상세

### 2-1. Framework — Next.js 15 (App Router)

| 항목 | 내용 |
|------|------|
| 버전 | 15.x (최신 안정) |
| 선정 이유 | 프론트·백을 단일 레포로 관리. Route Handler가 Express 없이 API 제공. RSC로 초기 HTML 서버 렌더링 |
| 주요 사용 | `app/api/` Route Handler, `app/page.tsx` Client Shell |

**대안 비교**

| | Next.js 15 | Remix | SvelteKit |
|---|---|---|---|
| React 생태계 호환 | ✅ | ✅ | ❌ |
| Vercel 네이티브 | ✅ | △ | △ |
| App Router 성숙도 | 높음 | - | - |

### 2-2. Runtime — Node.js (Vercel Serverless Functions)

- Route Handler는 Vercel Serverless Function으로 실행
- Edge Runtime 미사용 (Drizzle + Neon TCP 드라이버가 Node.js 필요)
- 콜드 스타트 최소화를 위해 DB 연결은 모듈 스코프에서 싱글톤으로 유지

### 2-3. ORM — Drizzle ORM

| 항목 | 내용 |
|------|------|
| 선정 이유 | TypeScript-first: 스키마 정의가 곧 타입 소스. 코드 생성 불필요. Vercel Postgres 공식 지원 |
| 마이그레이션 | `drizzle-kit push` (개발) / `drizzle-kit migrate` (프로덕션) |

**대안 비교**

| | Drizzle ORM | Prisma | Kysely |
|---|---|---|---|
| 코드 생성 | 불필요 | 필요 (`prisma generate`) | 불필요 |
| 번들 크기 | 작음 | 큼 (Query Engine 포함) | 작음 |
| Vercel Postgres 공식 지원 | ✅ | △ (어댑터 필요) | ❌ |
| TypeScript 타입 추론 | 완전 | 완전 | 완전 |

### 2-4. Database — Vercel Postgres (Neon 기반)

| 항목 | 내용 |
|------|------|
| 선정 이유 | Vercel 대시보드에서 프로비저닝·연결 변수 자동 주입. Neon 서버리스 드라이버로 커넥션 풀 자동 관리 |
| 연결 방식 | `@vercel/postgres` 또는 Neon serverless driver (`neon-http`) |
| 로컬 개발 | `vercel env pull .env.local` 로 연결 문자열 동기화 |

### 2-5. Drag & Drop — @dnd-kit

| 패키지 | 용도 |
|--------|------|
| `@dnd-kit/core` | DndContext, 센서(Pointer/Keyboard), 충돌 감지 |
| `@dnd-kit/sortable` | 컬럼 내 카드 순서 정렬 |

- **접근성**: 키보드 드래그 기본 지원 (aria-grabbed, live region)
- **대안**: react-beautiful-dnd (유지보수 종료), react-dnd (낮은 접근성)

### 2-6. Validation — Zod

- `src/shared/validations/`에 스키마 정의 → 프론트(폼 검증)·백(Route Handler 파싱) 동시 사용
- `z.infer<>` 로 타입 중복 제거

### 2-7. Testing — Jest + React Testing Library

| 레이어 | 테스트 전략 |
|--------|-------------|
| 서비스 (src/server) | Jest 단위 테스트, DB는 실제 테스트 DB 사용 |
| 컴포넌트 (src/client) | React Testing Library, 사용자 인터랙션 기준 |
| API Route | Jest + node-fetch 통합 테스트 |

---

## 3. 데이터 흐름

### 3-1. 읽기 (GET)

```
Board 컴포넌트 마운트
    │
    │  useEffect / React Query
    ▼
ticketApi.ts  →  GET /api/tickets
    │
Route Handler  →  ticketService.getAll()
    │
Drizzle  →  SELECT * FROM tickets ORDER BY position
    │
JSON 응답  →  상태 업데이트  →  칸반 보드 렌더링
```

### 3-2. 쓰기 (POST / PATCH)

```
폼 입력
    │
    │  Zod 클라이언트 검증 (createTicketSchema)
    ▼
ticketApi.ts  →  POST /api/tickets  { title, description, ... }
    │
Route Handler  →  Zod 서버 검증 (동일 스키마 재사용)
    │
ticketService.create(data)
    │
Drizzle  →  INSERT INTO tickets ...
    │
201 Created  →  낙관적 업데이트 or 리패치
```

### 3-3. 드래그 앤 드롭 (상태 이동)

```
onDragEnd 이벤트
    │
    │  1. 낙관적 UI 업데이트 (로컬 상태 즉시 반영)
    ▼
ticketApi.ts  →  PATCH /api/tickets/reorder  { ticketId, status, position }
    │
Route Handler  →  Zod 검증 (status: BACKLOG | TODO | IN_PROGRESS만 허용)
    │
ticketService.reorder({ ticketId, status, position })
    │  트랜잭션: status + position 동시 업데이트
    │  TODO 이동 시 startedAt 자동 기록
    │  BACKLOG 복귀 시 startedAt = null
    ▼
Drizzle  →  UPDATE tickets SET status, position WHERE id (트랜잭션)
    │
성공: 완료 / 실패: 롤백 (원래 상태 복원)
```

### 3-4. 완료 처리 (PATCH /api/tickets/:id/complete)

```
Done 컬럼으로 드롭 (onDragEnd)
    │
    │  1. 낙관적 UI 업데이트
    ▼
ticketApi.ts  →  PATCH /api/tickets/:id/complete  { status }
    │
Route Handler  →  status 값 검증
    │
ticketService.complete(id, status)
    │  DONE으로 이동: completedAt = 현재 시각
    │  DONE에서 복귀: completedAt = null
    ▼
Drizzle  →  UPDATE tickets SET status, completedAt WHERE id
    │
성공: 완료 / 실패: 롤백
```

---

## 4. 계층 간 경계 규칙

```
┌─────────────┐     import 허용     ┌─────────────┐
│  src/client │ ◄──────────────────► │  src/shared │
└─────────────┘                      └─────────────┘
                                           ▲
┌─────────────┐     import 허용            │
│  src/server │ ◄──────────────────────────┘
└─────────────┘

src/client  ──✗──►  src/server   (절대 금지)
src/server  ──✗──►  src/client   (절대 금지)
```

| 규칙 | 내용 |
|------|------|
| Route Handler 역할 | 요청 파싱 → 서비스 호출 → 응답 반환만. 비즈니스 로직 작성 금지 |
| DB 접근 경로 | `src/server/` 에서만 허용. `src/client/` 에서 직접 DB 접근 금지 |
| 타입 공유 | `src/shared/types/` 에서만 정의. 양측에서 동일 타입 import |
| API 호출 경로 | `src/client/api/ticketApi.ts` 를 통해서만. 컴포넌트 내 직접 fetch 금지 |

---

## 5. 개발 환경 설정

### 5-1. 초기 설정

```bash
# 패키지 설치
npm install

# Vercel 환경 변수 로컬 동기화 (Vercel 프로젝트 연결 필요)
vercel env pull .env.local

# DB 마이그레이션 적용
npx drizzle-kit push
```

### 5-2. 개발 서버

```bash
npm run dev        # Next.js 개발 서버 (http://localhost:3000)
```

### 5-3. 테스트

```bash
npm test                        # 전체 테스트 실행
npm test -- --watch             # 감시 모드
npm test -- path/to/file.test.ts  # 단일 파일 실행
```

### 5-4. Lint / 포매팅

```bash
npm run lint       # ESLint
npm run format     # Prettier
```

### 5-5. DB 마이그레이션

```bash
npx drizzle-kit generate   # 마이그레이션 파일 생성
npx drizzle-kit push       # 개발 DB에 즉시 반영
npx drizzle-kit migrate    # 프로덕션 마이그레이션 실행
```

---

## 6. 배포 전략

### 6-1. 배포 흐름

```
로컬 개발
    │  git push origin main
    ▼
GitHub
    │  webhook
    ▼
Vercel CI
    │  npm run build
    │  타입 체크 + ESLint
    ▼
Production 배포 (main 브랜치)
```

### 6-2. Preview 배포

- PR 생성 시 Vercel이 자동으로 Preview URL 생성
- Preview 환경은 별도 환경 변수 세트 사용 (Vercel Dashboard에서 `Preview` 범위 설정)

### 6-3. 환경 변수 관리

| 변수명 | 설명 | 관리 위치 |
|--------|------|-----------|
| `POSTGRES_URL` | Vercel Postgres 연결 문자열 | Vercel Dashboard |
| `POSTGRES_PRISMA_URL` | 마이그레이션용 연결 문자열 | Vercel Dashboard |
| `POSTGRES_URL_NON_POOLING` | 직접 연결 (마이그레이션 시 필요) | Vercel Dashboard |

- `.env.local`은 `.gitignore`에 포함 (커밋 금지)
- 로컬 개발 시 `vercel env pull .env.local` 로 동기화

### 6-4. 빌드 요구사항

- `npm run build` 성공 필수 (타입 에러 = 빌드 실패)
- 테스트 전체 통과 필수
- `any` 타입 사용 시 ESLint 오류로 빌드 차단
