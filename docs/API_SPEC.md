# API_SPEC (API 명세)

**프로젝트명:** Tika  
**버전:** 1.0 (MVP)  
**작성일:** 2026-06-10  
**Base URL:** `/api`

---

## 공통 규칙

### 요청

- `Content-Type: application/json`
- 날짜 형식: `YYYY-MM-DD` (DATE 타입 필드)
- 시각 형식: ISO 8601 (`2026-06-10T09:00:00.000Z`)

### 응답

**성공 응답**: 데이터를 직접 반환 (래퍼 객체 없음)

**에러 응답**: 모든 에러는 동일한 구조 사용

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목을 입력해주세요"
  }
}
```

**에러 코드 목록**

| code | HTTP 상태 | 설명 |
|------|-----------|------|
| `VALIDATION_ERROR` | 400 | 입력 값 검증 실패 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |

**HTTP 상태 코드**: `200`, `201`, `204`, `400`, `404`, `500`

### 티켓 객체 (Ticket)

모든 티켓 응답에서 공통으로 사용하는 객체 구조.

```json
{
  "id": 1,
  "title": "API 설계 문서 작성",
  "description": "REST API 명세를 작성한다",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "position": 0,
  "plannedStartDate": "2026-06-01",
  "dueDate": "2026-06-15",
  "startedAt": "2026-06-02T09:00:00.000Z",
  "completedAt": null,
  "createdAt": "2026-06-01T08:00:00.000Z",
  "updatedAt": "2026-06-02T09:00:00.000Z"
}
```

**보드 조회 응답 한정**: `isOverdue` 파생 필드 추가

```json
{
  ...티켓 필드,
  "isOverdue": true
}
```

---

## 엔드포인트 목록

| 메서드 | URL | 설명 | FR |
|--------|-----|------|-----|
| GET | `/api/tickets` | 보드 전체 조회 | FR-002 |
| POST | `/api/tickets` | 티켓 생성 | FR-001 |
| GET | `/api/tickets/:id` | 티켓 상세 조회 | FR-003 |
| PATCH | `/api/tickets/:id` | 티켓 수정 | FR-004 |
| DELETE | `/api/tickets/:id` | 티켓 삭제 | FR-006 |
| PATCH | `/api/tickets/reorder` | 상태/순서 변경 | FR-007 |
| PATCH | `/api/tickets/:id/complete` | 완료 처리 | FR-005 |

---

## GET /api/tickets

칸반 보드에 표시할 전체 티켓을 상태별로 그룹화하여 반환한다.  
Done 칼럼은 `completedAt` 기준 **24시간 이내** 티켓만 포함한다.  
각 티켓에 `isOverdue` 파생 필드가 포함된다.

### 응답

**200 OK**

```json
{
  "BACKLOG": [
    {
      "id": 7,
      "title": "알림 기능 조사",
      "description": null,
      "status": "BACKLOG",
      "priority": "LOW",
      "position": 0,
      "plannedStartDate": null,
      "dueDate": null,
      "startedAt": null,
      "completedAt": null,
      "createdAt": "2026-06-01T08:00:00.000Z",
      "updatedAt": "2026-06-01T08:00:00.000Z",
      "isOverdue": false
    }
  ],
  "TODO": [ ...TicketWithMeta[] ],
  "IN_PROGRESS": [ ...TicketWithMeta[] ],
  "DONE": [ ...TicketWithMeta[] ]
}
```

- 각 칼럼 내 정렬: `position` 오름차순
- `isOverdue` 판정: `dueDate < 오늘 AND status ≠ DONE`
- DONE 칼럼 필터: `completedAt >= now - 24h` 인 티켓만 포함

---

## POST /api/tickets

새 티켓을 생성하여 Backlog 칼럼 맨 위에 추가한다.

### 요청 본문

```json
{
  "title": "새로운 할 일",
  "description": "상세 설명",
  "priority": "HIGH",
  "plannedStartDate": "2026-06-15",
  "dueDate": "2026-06-30"
}
```

| 필드 | 타입 | 필수 | 제약조건 | 기본값 |
|------|------|------|----------|--------|
| `title` | string | **O** | 1~200자, 공백만 불가 | - |
| `description` | string | X | 최대 1000자 | `null` |
| `priority` | `"LOW"` \| `"MEDIUM"` \| `"HIGH"` | X | - | `"MEDIUM"` |
| `plannedStartDate` | string | X | `YYYY-MM-DD` | `null` |
| `dueDate` | string | X | `YYYY-MM-DD`, 오늘 이후 | `null` |

### 처리 규칙

- `status` = `BACKLOG` (고정)
- `position` = 해당 칼럼 `min(position) - 1024`. 칼럼이 비어있으면 `0`
- `createdAt`, `updatedAt` 자동 설정

### 응답

**201 Created** — 생성된 티켓 전체 반환

```json
{
  "id": 10,
  "title": "새로운 할 일",
  "description": "상세 설명",
  "status": "BACKLOG",
  "priority": "HIGH",
  "position": -1024,
  "plannedStartDate": "2026-06-15",
  "dueDate": "2026-06-30",
  "startedAt": null,
  "completedAt": null,
  "createdAt": "2026-06-10T10:00:00.000Z",
  "updatedAt": "2026-06-10T10:00:00.000Z"
}
```

**400 Bad Request** — 검증 실패

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "제목을 입력해주세요" } }
```

| 조건 | message |
|------|---------|
| 제목 누락 또는 공백만 입력 | `"제목을 입력해주세요"` |
| 제목 200자 초과 | `"제목은 200자 이내로 입력해주세요"` |
| 설명 1000자 초과 | `"설명은 1000자 이내로 입력해주세요"` |
| 잘못된 priority 값 | `"우선순위는 LOW, MEDIUM, HIGH 중 선택해주세요"` |
| dueDate가 과거 날짜 | `"종료예정일은 오늘 이후 날짜를 선택해주세요"` |

---

## GET /api/tickets/:id

특정 티켓의 전체 정보를 반환한다.

### 경로 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 티켓 ID |

### 응답

**200 OK** — 티켓 객체 반환 (`isOverdue` 미포함)

```json
{
  "id": 1,
  "title": "API 설계 문서 작성",
  "description": "REST API 명세를 작성한다",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "position": 0,
  "plannedStartDate": null,
  "dueDate": "2026-06-15",
  "startedAt": "2026-06-02T09:00:00.000Z",
  "completedAt": null,
  "createdAt": "2026-06-01T08:00:00.000Z",
  "updatedAt": "2026-06-02T09:00:00.000Z"
}
```

**404 Not Found**

```json
{ "error": { "code": "NOT_FOUND", "message": "티켓을 찾을 수 없습니다" } }
```

---

## PATCH /api/tickets/:id

티켓의 내용(제목·설명·우선순위·날짜)을 수정한다.  
전송된 필드만 업데이트하는 부분 수정(Partial Update)이다.  
`status`, `position`, `startedAt`, `completedAt`은 이 엔드포인트로 변경 불가.

### 경로 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 티켓 ID |

### 요청 본문

```json
{
  "title": "수정된 제목",
  "description": null,
  "priority": "LOW",
  "plannedStartDate": "2026-06-20",
  "dueDate": null
}
```

| 필드 | 타입 | 제약조건 | 비고 |
|------|------|----------|------|
| `title` | string | 1~200자, 공백만 불가 | 선택 |
| `description` | string \| `null` | 최대 1000자 | `null` 전송 시 삭제 |
| `priority` | `"LOW"` \| `"MEDIUM"` \| `"HIGH"` | - | 선택 |
| `plannedStartDate` | string \| `null` | `YYYY-MM-DD` | `null` 전송 시 삭제 |
| `dueDate` | string \| `null` | `YYYY-MM-DD`, 오늘 이후 | `null` 전송 시 삭제 |

### 처리 규칙

- 빈 본문(`{}`)도 허용 (변경 없음, `updatedAt`만 갱신)
- `updatedAt` 자동 갱신

### 응답

**200 OK** — 수정된 티켓 전체 반환

**400 Bad Request** — 검증 실패 (POST와 동일한 메시지 구조)

**404 Not Found**

```json
{ "error": { "code": "NOT_FOUND", "message": "티켓을 찾을 수 없습니다" } }
```

---

## DELETE /api/tickets/:id

티켓을 영구 삭제한다 (하드 삭제).

### 경로 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 티켓 ID |

### 응답

**204 No Content** — 본문 없음

**404 Not Found**

```json
{ "error": { "code": "NOT_FOUND", "message": "티켓을 찾을 수 없습니다" } }
```

---

## PATCH /api/tickets/reorder

티켓을 다른 칼럼으로 이동하거나 같은 칼럼 내 순서를 변경한다.  
**DONE으로의 이동은 허용하지 않는다** — Done 이동은 `/api/tickets/:id/complete` 사용.

### 요청 본문

```json
{
  "ticketId": 3,
  "status": "IN_PROGRESS",
  "position": 512
}
```

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|------|----------|
| `ticketId` | number | **O** | 존재하는 티켓 ID |
| `status` | `"BACKLOG"` \| `"TODO"` \| `"IN_PROGRESS"` | **O** | `DONE` 불가 |
| `position` | number | **O** | 정수 |

### 처리 규칙

- `status`와 `position` 동시 업데이트 (트랜잭션)
- **TODO로 이동 시**: `startedAt = 현재 시각`
- **TODO → BACKLOG로 이동 시**: `startedAt = null`
- **DONE에서 복귀(DONE → 다른 상태)**: `completedAt = null`
- **그 외 이동**: `startedAt`, `completedAt` 변경 없음

**position 계산 기준**

| 상황 | position 값 |
|------|-------------|
| 두 카드 사이 삽입 | `Math.floor((prevPosition + nextPosition) / 2)` |
| 맨 앞 삽입 | `firstCardPosition - 1024` |
| 맨 뒤 삽입 | `lastCardPosition + 1024` |
| 칼럼이 비어있음 | `0` |
| 간격이 1 이하 | 해당 칼럼 전체 1024 간격으로 재정렬 후 삽입 |

### 응답

**200 OK** — 이동된 티켓 반환

```json
{
  "id": 3,
  "title": "API 설계 문서 작성",
  "status": "IN_PROGRESS",
  "position": 512,
  "startedAt": "2026-06-10T10:00:00.000Z",
  ...나머지 티켓 필드
}
```

**400 Bad Request**

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요" } }
```

| 조건 | message |
|------|---------|
| `status`가 `DONE`이거나 허용값 외 | `"상태는 BACKLOG, TODO, IN_PROGRESS 중 선택해주세요"` |

**404 Not Found**

```json
{ "error": { "code": "NOT_FOUND", "message": "티켓을 찾을 수 없습니다" } }
```

---

## PATCH /api/tickets/:id/complete

티켓을 Done으로 이동하거나 Done에서 다른 칼럼으로 되돌릴 때 사용한다.  
`completedAt`을 자동 설정·초기화한다.

### 경로 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `id` | number | 티켓 ID |

### 요청 본문

```json
{
  "status": "DONE",
  "position": 0
}
```

| 필드 | 타입 | 필수 | 제약조건 |
|------|------|------|----------|
| `status` | `"DONE"` \| `"BACKLOG"` \| `"TODO"` \| `"IN_PROGRESS"` | **O** | 전체 상태 허용 |
| `position` | number | **O** | 정수 |

### 처리 규칙

- **`status = DONE`으로 변경**: `completedAt = 현재 시각`
- **`status ≠ DONE`으로 변경 (복귀)**: `completedAt = null`
- `updatedAt` 자동 갱신

### 응답

**200 OK** — 업데이트된 티켓 전체 반환

```json
{
  "id": 5,
  "title": "로그인 페이지 구현",
  "status": "DONE",
  "position": 0,
  "completedAt": "2026-06-10T15:30:00.000Z",
  ...나머지 티켓 필드
}
```

**404 Not Found**

```json
{ "error": { "code": "NOT_FOUND", "message": "티켓을 찾을 수 없습니다" } }
```
