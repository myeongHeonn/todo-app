# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요
Tika는 티켓 기반 칸반 보드 TODO 앱이다.
Next.js App Router 기반으로, 프론트엔드와 백엔드를 디렉토리 수준에서 분리한다.
src/shared/에서 타입과 검증 스키마를 공유한다.

## 개발 명령어

```bash
npm run dev                              # 개발 서버 (http://localhost:3000)
npm run build                            # 프로덕션 빌드 (타입 에러 시 실패)
npm run lint                             # ESLint
npm run format                           # Prettier

npm test                                 # 전체 테스트
npm test -- --watch                      # 감시 모드
npm test -- path/to/file.test.ts         # 단일 파일 실행

npx drizzle-kit push                     # 개발 DB에 스키마 즉시 반영
npx drizzle-kit generate                 # 마이그레이션 파일 생성
npx drizzle-kit migrate                  # 프로덕션 마이그레이션 실행

vercel env pull .env.local               # Vercel 환경 변수 로컬 동기화 (초기 설정 필수)
```

## 프로젝트 구조

```
app/api/tickets/
├── route.ts             # GET /api/tickets, POST /api/tickets
├── reorder/route.ts     # PATCH /api/tickets/reorder
└── [id]/
    ├── route.ts         # GET·PATCH·DELETE /api/tickets/:id
    └── complete/route.ts  # PATCH /api/tickets/:id/complete

src/
├── server/
│   ├── db/
│   │   ├── index.ts     # Drizzle 인스턴스 (모듈 스코프 싱글톤)
│   │   └── schema.ts    # tickets 테이블 스키마
│   └── services/
│       └── ticketService.ts  # 티켓 CRUD 비즈니스 로직 전부
├── client/
│   ├── api/ticketApi.ts      # 유일한 API 호출 경로 (직접 fetch 금지)
│   ├── components/
│   └── hooks/
└── shared/
    ├── types/index.ts         # Ticket, TicketStatus, BoardData 등 공유 타입
    └── validations/ticketSchema.ts  # Zod 스키마 (프론트·백 동시 사용)
```

## 기술 스택
- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode)
- Frontend: React 19, Tailwind CSS 4, @dnd-kit/core + @dnd-kit/sortable
- Backend: Drizzle ORM, Vercel Postgres (Neon)
- Validation: Zod
- Testing: Jest + React Testing Library

## 프로젝트 문서 (반드시 참조)
- 제품 요구사항: /docs/PRD.md
- 기술 요구사항: /docs/TRD.md
- 상세 요구사항: /docs/REQUIREMENTS.md
- API 명세: /docs/API_SPEC.md
- 데이터 모델: /docs/DATA_MODEL.md
- 컴포넌트 명세: /docs/COMPONENT_SPEC.md
- 테스트 케이스: /docs/TEST_CASES.md

## 핵심 아키텍처 결정사항

### 계층 경계 (절대 규칙)
```
src/client  ──✗──►  src/server  (절대 금지)
src/server  ──✗──►  src/client  (절대 금지)
src/client, src/server  모두 src/shared에서 import 가능
```
- Route Handler는 요청 파싱 → 서비스 호출 → 응답 반환만. 비즈니스 로직 금지
- DB 접근은 `src/server/` 에서만

### API 분기: reorder vs complete
드래그앤드롭 완료 시 **대상 칼럼에 따라 호출 API가 다르다**:
- Done 칼럼으로 이동 → `PATCH /api/tickets/:id/complete` (completedAt 자동 설정)
- 그 외 칼럼 이동 → `PATCH /api/tickets/reorder` (status + position 트랜잭션)
- reorder API는 DONE 상태를 허용하지 않는다

### position 관리 알고리즘
- 새 티켓 생성: 해당 칼럼 `min(position) - 1024` (Backlog 맨 위)
- 카드 사이 삽입: `Math.floor((prev + next) / 2)`
- 맨 앞: `firstPosition - 1024`, 맨 뒤: `lastPosition + 1024`, 빈 칼럼: `0`
- 간격이 1 이하로 좁아지면 해당 칼럼 전체 1024 간격으로 재정렬

### 자동 설정 필드 (사용자 직접 수정 불가)
| 이벤트 | 동작 |
|--------|------|
| TODO로 이동 | `startedAt = 현재 시각` |
| BACKLOG로 복귀 | `startedAt = null` |
| DONE으로 이동 | `completedAt = 현재 시각` |
| DONE에서 복귀 | `completedAt = null` |

### Done 칼럼 24시간 필터
`GET /api/tickets` 응답의 DONE 칼럼은 `completedAt >= now - 24h` 인 티켓만 포함한다. 이 필터는 서버에서 적용한다.

### isOverdue 계산
`dueDate < 오늘 AND status ≠ DONE` 일 때 true. DB에 저장하지 않고 `GET /api/tickets` 조회 시 서버에서 계산하여 응답에 포함한다.

### status/priority 타입
PostgreSQL ENUM 미사용. `VARCHAR + Zod 검증`으로 제약한다 (마이그레이션 편의상).

## 코딩 컨벤션

### TypeScript (공통)
- strict 모드, `any` 사용 금지 (`unknown` + 타입 가드 사용)
- 인터페이스는 I 접두사 없이 명사로 (예: `Ticket`, `BoardData`)
- enum 대신 `const` 객체 + `typeof` 패턴
- 공유 타입은 반드시 `@/shared/types`에서 import

### 백엔드 (app/api/ + src/server/)
- Zod 검증: `shared/validations`에서 import
- 에러 응답: `{ error: { code, message } }` 형식 통일
- HTTP 상태 코드: 200, 201, 204, 400, 404, 500만 사용
- DB 쿼리: Drizzle ORM만 (raw SQL 금지)

### 프론트엔드 (src/client/)
- 함수 컴포넌트 + 화살표 함수
- Props 타입은 컴포넌트 파일 내 정의
- 파일명: PascalCase (예: `TicketCard.tsx`)

## 개발 규칙

### 반드시 지켜야 할 것
- 새 기능 구현 전 TEST_CASES.md의 해당 테스트부터 작성 (TDD)
- API 구현 시 API_SPEC.md 명세를 정확히 따르기
- 컴포넌트 구현 시 COMPONENT_SPEC.md의 Props와 동작 준수
- 타입 변경 시 src/shared/types 먼저 수정

### 하지 말아야 할 것
- 명세에 없는 기능 임의 추가
- 테스트 코드 삭제 또는 skip
- `console.log` 커밋 (디버깅 후 제거)

### TDD 사이클 규칙
- **Red**: 테스트 코드만 작성, 구현 코드 생성 금지
- **Green**: 테스트를 통과하는 최소한의 코드만 작성, 테스트 코드 수정 금지
- **Refactor**: 코드 개선만, 새 기능 추가 금지, 테스트 통과 유지
- 테스트 실패 시 구현을 수정 (테스트를 수정하지 말 것 — 명세 오류인 경우 명세 먼저 수정)
