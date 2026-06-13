# Tika 프론트엔드 구현 계획 (FRONTEND_TASKS.md)

> 구현 순서: 말단 컴포넌트 → 컨테이너 (bottom-up)
> TDD 사이클: Red → Green → Refactor (CLAUDE.md 규칙 준수)
> 관련 문서: COMPONENT_SPEC.md, TEST_CASES.md, REQUIREMENTS.md

---

## 의존성 그래프

```
page.tsx
  └── BoardContainer
        ├── useTickets ──────────────── ticketApi.ts
        ├── BoardHeader
        │     └── [Button]
        ├── Board
        │     ├── [DndContext / DragOverlay]  @dnd-kit/core
        │     └── Column ×4
        │           ├── [SortableContext]     @dnd-kit/sortable
        │           └── TicketCard
        │                 └── [Badge]
        └── TicketModal
              ├── [Modal]
              ├── TicketDetailView
              │     └── [Badge]
              ├── TicketForm
              │     └── [Button]
              └── ConfirmDialog
                    ├── [Modal]
                    └── [Button]

[  ] = 공통 UI (src/client/components/ui/)
```

---

## Phase 0 — API 클라이언트

> 모든 컴포넌트/훅의 기반. 컴포넌트 구현 전에 완료한다.

### 📄 `src/client/api/ticketApi.ts`

**역할**: 서버 API를 호출하는 유일한 경로. 컴포넌트에서 직접 fetch 금지.

**구현 함수**:
| 함수 | 메서드 | 엔드포인트 |
|------|--------|-----------|
| `getBoard()` | GET | `/api/tickets` |
| `createTicket(data)` | POST | `/api/tickets` |
| `updateTicket(id, data)` | PATCH | `/api/tickets/:id` |
| `deleteTicket(id)` | DELETE | `/api/tickets/:id` |
| `reorderTicket(data)` | PATCH | `/api/tickets/reorder` |
| `completeTicket(id, data)` | PATCH | `/api/tickets/:id/complete` |

**TDD 체크리스트** (`src/client/api/ticketApi.test.ts`):
- [ ] `getBoard()` — 200 응답 시 `BoardData` 반환
- [ ] `createTicket()` — 201 응답 시 `Ticket` 반환
- [ ] `updateTicket()` — 200 응답 시 `Ticket` 반환
- [ ] `deleteTicket()` — 204 응답 시 `undefined` 반환
- [ ] `reorderTicket()` — 200 응답 시 `Ticket` 반환
- [ ] `completeTicket()` — 200 응답 시 `Ticket` 반환
- [ ] API 오류 응답 시 `{ error: { code, message } }` 파싱 후 `Error` throw

---

## Phase 1 — 원자 컴포넌트 (외부 의존 없음)

> 다른 프로젝트 컴포넌트에 의존하지 않는 최소 단위.
> 파일 위치: `src/client/components/ui/`

---

### 📄 `Button.tsx`

**Props**: `variant` (primary|secondary|ghost|danger), `size` (sm|md|lg), `isLoading`, `disabled`, `onClick`, `type`, `children`

**TDD 체크리스트** (`Button.test.tsx`):
- [ ] `variant="primary"` — `.btn--primary` 클래스 적용
- [ ] `variant="danger"` — `.btn--danger` 클래스 적용
- [ ] `variant="ghost"` — `.btn--ghost` 클래스 적용
- [ ] `variant="secondary"` — `.btn--secondary` 클래스 적용
- [ ] `size="sm"` — `.btn--sm` 클래스 적용
- [ ] `size="lg"` — `.btn--lg` 클래스 적용
- [ ] `isLoading=true` — 스피너 표시 + `disabled` 속성 추가
- [ ] `disabled=true` — 클릭 이벤트 차단
- [ ] `onClick` — 클릭 시 핸들러 호출

---

### 📄 `Badge.tsx`

**Props**: `variant` (low|medium|high|overdue|date), `children`

**TDD 체크리스트** (`Badge.test.tsx`):
- [ ] `variant="low"` — `.badge--low` 클래스 + 회색 스타일
- [ ] `variant="medium"` — `.badge--medium` 클래스 + 파란색 스타일
- [ ] `variant="high"` — `.badge--high` 클래스 + 빨간색 스타일
- [ ] `variant="overdue"` — `.badge--overdue` 클래스 + 빨간색 스타일
- [ ] `variant="date"` — `.badge--date` 클래스 + 중립 스타일
- [ ] `children` — 전달된 텍스트 렌더링

---

### 📄 `Modal.tsx`

**Props**: `isOpen`, `onClose`, `children`, `title` (optional)

**동작**: ESC 키 닫기, 오버레이 클릭 닫기, body 스크롤 잠금, 열림/닫힘 애니메이션

**TDD 체크리스트** (`Modal.test.tsx`):
- [ ] `isOpen=false` — 렌더링 안 함 (null 반환)
- [ ] `isOpen=true` — 오버레이 + 모달 컨텐츠 렌더링
- [ ] ESC 키 — `onClose` 호출
- [ ] 오버레이 클릭 — `onClose` 호출
- [ ] 모달 내부 클릭 — `onClose` 호출 안 함 (이벤트 버블링 차단)
- [ ] `isOpen=true` — `document.body.style.overflow = 'hidden'`
- [ ] `isOpen=false` (언마운트) — body overflow 복원

---

## Phase 2 — 분자 컴포넌트 (Phase 1에 의존)

> 파일 위치: `src/client/components/`

---

### 📄 `ConfirmDialog.tsx`

**의존**: `Modal`, `Button`

**Props**: `isOpen`, `onConfirm`, `onCancel`, `message` (기본: "정말 삭제하시겠습니까?"), `confirmLabel` (기본: "삭제"), `isLoading`

**TDD 체크리스트** (`ConfirmDialog.test.tsx`) — TC-COMP-006:
- [ ] C006-1: "확인(삭제)" 버튼 클릭 — `onConfirm` 호출
- [ ] C006-2: "취소" 버튼 클릭 — `onCancel` 호출
- [ ] `isOpen=false` — 렌더링 안 함
- [ ] `isLoading=true` — 확인 버튼 비활성화
- [ ] 확인 버튼 — `variant="danger"` 스타일

---

### 📄 `TicketCard.tsx`

**의존**: `Badge`

**Props**: `ticket: TicketWithMeta`, `onClick: () => void`, `isDragging?: boolean`

**TDD 체크리스트** (`TicketCard.test.tsx`) — TC-COMP-001:
- [ ] C001-1: 제목 렌더링
- [ ] C001-1: 우선순위 뱃지 렌더링
- [ ] C001-1: dueDate 있을 때 날짜 표시 (YYYY-MM-DD 포맷)
- [ ] C001-2: `isOverdue=true` — `.ticket-card--overdue` 클래스 + 경고 아이콘
- [ ] C001-4: `dueDate=null` — 날짜 영역 미표시
- [ ] C001-5: 카드 클릭 — `onClick` 호출
- [ ] C001-6: 긴 제목 — CSS `-webkit-line-clamp` 말줄임 (스냅샷)
- [ ] C001-7: LOW → 회색 뱃지, MEDIUM → 파란색, HIGH → 빨간색
- [ ] `isDragging=true` — `.ticket-card--dragging` 클래스 (반투명)
- [ ] `role="button"`, `aria-label="티켓: {title}"` 접근성 속성
- [ ] 드래그 중 클릭 이벤트 차단 (isDragging=true 시 onClick 호출 안 함)

---

### 📄 `TicketForm.tsx`

**의존**: `Button`

**Props**: `mode: 'create' | 'edit'`, `initialData?: Partial<Ticket>`, `onSubmit`, `onCancel`, `isLoading`

**폼 필드**: title (필수), description, priority (기본 MEDIUM), plannedStartDate, dueDate

**TDD 체크리스트** (`TicketForm.test.tsx`) — TC-COMP-004:
- [ ] C004-1: 생성 모드 — 빈 폼, 우선순위 MEDIUM 기본 선택
- [ ] C004-2: 수정 모드 — `initialData` 값이 각 필드에 반영
- [ ] C004-3: 빈 제목 제출 — "제목을 입력해주세요" 에러 표시, `onSubmit` 미호출
- [ ] 공백만 제목 제출 — "제목을 입력해주세요" 에러 표시
- [ ] 제목 200자 초과 — "제목은 200자 이내로 입력해주세요" 에러 표시
- [ ] 설명 1000자 초과 — "설명은 1000자 이내로 입력해주세요" 에러 표시
- [ ] C004-4: 과거 dueDate — "종료예정일은 오늘 이후 날짜를 선택해주세요" 에러 표시
- [ ] C004-5: plannedStartDate date input 렌더링 확인
- [ ] C004-6: 정상 제출 — `onSubmit(data)` 호출, 전달 데이터 구조 확인
- [ ] C004-7: `isLoading=true` — 제출 버튼 비활성화 + 스피너
- [ ] "취소" 클릭 — `onCancel` 호출

---

## Phase 3 — 유기체 컴포넌트 (Phase 1+2에 의존)

---

### 📄 `TicketDetailView.tsx`

**의존**: `Badge`

**Props**: `ticket: TicketWithMeta`

**역할**: TicketModal 내 읽기 전용 시스템 필드 표시 (status, startedAt, completedAt, createdAt)

**TDD 체크리스트** (`TicketDetailView.test.tsx`):
- [ ] status 표시 (한국어 레이블: BACKLOG/TODO/IN_PROGRESS/DONE)
- [ ] `startedAt` 있을 때 날짜 표시, 없을 때 "-" 표시
- [ ] `completedAt` 있을 때 날짜 표시, 없을 때 "-" 표시
- [ ] `createdAt` 항상 표시
- [ ] 모든 필드가 편집 불가(읽기 전용)임을 확인 (input 없음)

---

### 📄 `Column.tsx`

**의존**: `TicketCard`, `@dnd-kit/sortable (SortableContext, useDroppable)`

**Props**: `status: TicketStatus`, `tickets: TicketWithMeta[]`, `onTicketClick`

**TDD 체크리스트** (`Column.test.tsx`) — TC-COMP-002:
- [ ] C002-1: 티켓 목록 렌더링 + 개수 뱃지 표시
- [ ] C002-2: `tickets=[]` — "이 칼럼에 티켓이 없습니다" 텍스트 표시
- [ ] C002-3: 칼럼 헤더에 칼럼명 + 티켓 수 표시
- [ ] 칼럼 상태에 맞는 색상 닷(dot) 표시 (BACKLOG=회색, TODO=파랑, IN_PROGRESS=주황, DONE=초록)
- [ ] 각 TicketCard에 `onTicketClick` 전달 확인

---

### 📄 `BoardHeader.tsx`

**의존**: `Button`

**Props**: `onCreateClick: () => void`

**TDD 체크리스트** (`BoardHeader.test.tsx`):
- [ ] "새 업무" 버튼 렌더링
- [ ] "새 업무" 클릭 — `onCreateClick` 호출
- [ ] 앱 타이틀/로고 영역 렌더링 (있을 경우)

---

### 📄 `TicketModal.tsx`

**의존**: `Modal`, `TicketDetailView`, `TicketForm`, `ConfirmDialog`, `Button`

**Props**: `ticket`, `isOpen`, `onClose`, `onUpdate`, `onDelete`

**TDD 체크리스트** (`TicketModal.test.tsx`) — TC-COMP-005:
- [ ] C005-1: `isOpen=false` — 렌더링 안 함
- [ ] C005-1: `isOpen=true` — 티켓 데이터 표시
- [ ] C005-2: status, startedAt, completedAt, createdAt 읽기 전용 표시
- [ ] C005-3: title, description, priority, plannedStartDate, dueDate 편집 가능
- [ ] C005-4: ESC 키 — `onClose` 호출
- [ ] C005-5: 오버레이 클릭 — `onClose` 호출
- [ ] C005-6: 삭제 버튼 클릭 — ConfirmDialog 표시
- [ ] C005-6: ConfirmDialog 확인 — `onDelete(ticket.id)` 호출
- [ ] C005-6: ConfirmDialog 취소 — 다이얼로그만 닫힘, 모달 유지
- [ ] 수정 제출 — `onUpdate(ticket.id, changedData)` 호출

---

## Phase 4 — 커스텀 훅

### 📄 `src/client/hooks/useTickets.ts`

**의존**: `ticketApi.ts`

**인터페이스**:
```typescript
function useTickets(initialData: BoardData): {
  board: BoardData;
  isLoading: boolean;
  error: string | null;
  create: (data: CreateTicketInput) => Promise<void>;
  update: (id: number, data: UpdateTicketInput) => Promise<void>;
  remove: (id: number) => Promise<void>;
  reorder: (ticketId: number, status: ReorderableStatus, position: number) => Promise<void>;
  complete: (id: number, position: number) => Promise<void>;
}
```

**TDD 체크리스트** (`useTickets.test.ts`):

*초기 상태*:
- [ ] `initialData`로 board 초기화
- [ ] `isLoading=false`, `error=null` 초기값

*create*:
- [ ] 호출 중 `isLoading=true`
- [ ] 성공 시 새 티켓이 `board.BACKLOG` 맨 앞에 추가 (낙관적 업데이트)
- [ ] 성공 시 `isLoading=false`
- [ ] 실패 시 board 원래 상태로 롤백 + `error` 설정

*update*:
- [ ] 성공 시 해당 칼럼의 티켓 데이터 업데이트
- [ ] 실패 시 board 롤백 + `error` 설정

*remove*:
- [ ] 성공 시 해당 티켓 board에서 제거
- [ ] 실패 시 board 롤백 + `error` 설정

*reorder (Done 제외 칼럼 이동)*:
- [ ] 낙관적 업데이트: 출발 칼럼에서 제거 + 대상 칼럼에 즉시 삽입
- [ ] `ticketApi.reorderTicket()` 호출 시 올바른 인자 전달
- [ ] 실패 시 board 롤백 + `error` 설정

*complete (Done 이동)*:
- [ ] 낙관적 업데이트: 출발 칼럼에서 제거 + `board.DONE` 삽입
- [ ] `ticketApi.completeTicket()` 호출 시 올바른 인자 전달
- [ ] 실패 시 board 롤백 + `error` 설정

---

## Phase 5 — 페이지 조립

### 📄 `src/client/components/Board.tsx`

**의존**: `Column`, `@dnd-kit/core (DndContext, DragOverlay, PointerSensor, KeyboardSensor)`, `TicketCard`

**Props**: `board: BoardData`, `onTicketClick`, `onDragEnd`, `activeTicket: TicketWithMeta | null`

**TDD 체크리스트** (`Board.test.tsx`) — TC-COMP-003:
- [ ] C003-1: BACKLOG, TODO, IN_PROGRESS, DONE 4개 Column 렌더링
- [ ] C003-2: BACKLOG Column이 사이드바 영역(`.board-sidebar`)에 배치
- [ ] C003-3: TODO/IN_PROGRESS/DONE이 메인 영역(`.board-main`)에 배치
- [ ] DragOverlay: `activeTicket` 있을 때 TicketCard 복제본 렌더링
- [ ] 각 Column에 해당 status의 tickets 전달 확인

---

### 📄 `src/client/components/BoardContainer.tsx`

**의존**: `Board`, `BoardHeader`, `TicketModal`, `TicketForm`, `useTickets`, `Modal`

**Props**: `initialData: BoardData`

**내부 상태**: `board`, `activeTicket`, `selectedTicket`, `isCreating`

**DnD 핸들러 체크리스트** (TC-INT-001 기반):
- [ ] `onDragStart` — `activeTicket` 설정
- [ ] `onDragEnd` — 대상 칼럼 판별
  - [ ] Done 칼럼 → `useTickets.complete()` 호출 (reorder 아님)
  - [ ] 그 외 칼럼 → `useTickets.reorder()` 호출
  - [ ] 같은 칼럼 내 이동 → `useTickets.reorder()` 호출
  - [ ] 드롭 위치 없음 (취소) → 아무것도 호출 안 함
- [ ] `onDragEnd` — `activeTicket = null` 리셋

**TDD 체크리스트** (`BoardContainer.test.tsx`):
- [ ] `initialData` 기반 Board 렌더링
- [ ] "새 업무" 클릭 → TicketForm 생성 모달 열림
- [ ] TicketForm 제출 → `useTickets.create()` 호출 → 모달 닫힘
- [ ] TicketCard 클릭 → TicketModal 열림 (selectedTicket 설정)
- [ ] TicketModal onClose → 모달 닫힘
- [ ] TicketModal onUpdate → `useTickets.update()` 호출
- [ ] TicketModal onDelete → `useTickets.remove()` 호출 → 모달 닫힘

---

### 📄 `app/page.tsx`

**역할**: 서버 컴포넌트. `ticketService.getBoardData()`로 초기 데이터 로드 → `BoardContainer`에 전달.

**TDD 체크리스트**:
- [ ] 서버에서 `BoardData` 조회 후 `BoardContainer`에 `initialData` prop으로 전달
- [ ] `BoardContainer`가 `'use client'` Client Component로 분리되어 있음을 확인

---

## 구현 순서 요약

```
Phase 0  ticketApi.ts
   ↓
Phase 1  Button  Badge  Modal
   ↓
Phase 2  ConfirmDialog  TicketCard  TicketForm
   ↓
Phase 3  TicketDetailView  Column  BoardHeader  TicketModal
   ↓
Phase 4  useTickets
   ↓
Phase 5  Board  →  BoardContainer  →  page.tsx
```

---

## 파일 목록 (생성 대상)

```
src/client/
├── api/
│   └── ticketApi.ts                     ← Phase 0 (파일 존재, 구현 필요)
├── components/
│   ├── ui/
│   │   ├── Button.tsx                   ← Phase 1
│   │   ├── Badge.tsx                    ← Phase 1
│   │   └── Modal.tsx                    ← Phase 1
│   ├── ConfirmDialog.tsx                ← Phase 2
│   ├── TicketCard.tsx                   ← Phase 2
│   ├── TicketForm.tsx                   ← Phase 2
│   ├── TicketDetailView.tsx             ← Phase 3
│   ├── Column.tsx                       ← Phase 3
│   ├── BoardHeader.tsx                  ← Phase 3
│   ├── TicketModal.tsx                  ← Phase 3
│   └── BoardContainer.tsx               ← Phase 5
└── hooks/
    └── useTickets.ts                    ← Phase 4

src/client/components/Board.tsx          ← Phase 5
app/page.tsx                             ← Phase 5 (파일 존재, 구현 필요)
```

---

## 테스트 파일 목록

```
src/client/api/ticketApi.test.ts
src/client/components/ui/Button.test.tsx
src/client/components/ui/Badge.test.tsx
src/client/components/ui/Modal.test.tsx
src/client/components/ConfirmDialog.test.tsx
src/client/components/TicketCard.test.tsx
src/client/components/TicketForm.test.tsx
src/client/components/TicketDetailView.test.tsx
src/client/components/Column.test.tsx
src/client/components/BoardHeader.test.tsx
src/client/components/TicketModal.test.tsx
src/client/components/Board.test.tsx
src/client/components/BoardContainer.test.tsx
src/client/hooks/useTickets.test.ts
```

---

## TDD 진행 규칙 (CLAUDE.md 기준)

1. **Red**: 테스트 파일 먼저 작성. 구현 파일 생성 금지.
2. **Green**: 테스트가 통과하는 최소 구현만 작성. 테스트 수정 금지.
3. **Refactor**: 동작 변경 없이 코드 품질 개선. 테스트 통과 유지.
4. 각 Phase 완료 후 `npm test`로 전체 테스트 통과 확인.
5. 테스트 실패 시 구현을 수정한다 (명세 오류가 아닌 한 테스트 수정 금지).
