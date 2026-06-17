# Tika Design System

Lark Suite 스타일의 깔끔하고 전문적인 칸반 보드 UI를 위한 디자인 시스템.

---

## 디자인 원칙

| 원칙 | 설명 |
|------|------|
| **명료함** | 정보 계층을 시각적으로 분명히 구분. 중요한 것이 먼저 눈에 들어온다. |
| **절제** | 불필요한 장식 제거. 색상은 의미를 전달할 때만 사용한다. |
| **일관성** | 동일한 상태는 항상 동일한 시각적 처리를 받는다. 입력 요소 스타일은 어디서나 동일하다. |
| **피드백** | 모든 인터랙션에 즉각적이고 명확한 시각 반응을 제공한다. |

---

## 레이아웃 구조

```
┌─────────────────────────────────────────────────────────────┐
│  TopBar (높이 56px)                                          │
├──────────┬──────────────────────────────────────────────────┤
│          │  FilterBar (높이 48px)                           │
│  Backlog │──────────────────────────────────────────────────┤
│  사이드바 │                                                  │
│          │   TODO        In Progress       Done             │
│  (전체   │                                                  │
│  높이,   │   스윔레인     스윔레인           스윔레인          │
│  280px   │                                                  │
│  고정)   │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 영역별 규격

| 영역 | 너비 | 높이 | 비고 |
|------|------|------|------|
| Backlog 사이드바 | 280px (고정) | 100vh - TopBar | 스크롤 독립 |
| FilterBar | 우측 콘텐츠 너비 전체 | 48px (고정) | 상단 고정 |
| 칸반 컬럼 3개 | 균등 분할 (flex-1) | FilterBar 아래 나머지 | 개별 스크롤 |

---

## 스윔레인 색상 (Swimlane Colors)

4개 레인은 서로 다른 배경색으로 명확하게 구분된다. 색상 토큰은 `colors.json > swimlane`에 정의되어 있다.

| 레인 | bg | headerBg | divider | indicator |
|------|-----|----------|---------|-----------|
| **Backlog** | `#F3F4F6` | `#E8EAEF` | `#D1D5E0` | `#98A2B3` |
| **TODO** | `#EEF3FF` | `#DDE6FF` | `#B8CBFF` | `#1677FF` |
| **In Progress** | `#FFF8EE` | `#FFEDCC` | `#FFD999` | `#F59E0B` |
| **Done** | `#EEFAF4` | `#D4F5E4` | `#9EE9BE` | `#22C55E` |

- **bg**: 레인 전체 배경 (column body)
- **headerBg**: 레인 헤더 영역 배경 (컬럼 상단 타이틀 바)
- **divider**: 레인 구분선 색상 (좌우 경계, 1px solid)
- **indicator**: 헤더 좌측 3px 액센트 바, 카운트 배지 dot

### 선택 근거
- Backlog: 무채색 회색 → "아직 시작 전" 느낌
- TODO: 차분한 파란빛 → "준비 완료"
- In Progress: 따뜻한 앰버빛 → "진행 중, 에너지"
- Done: 맑은 민트빛 → "완료, 안도"
- 네 색 모두 채도를 최소화해 장시간 화면을 봐도 눈이 편안하다

### 스윔레인 구분선 규칙
```
레인과 레인 사이: 1px solid swimlane.{lane}.divider
Backlog와 우측 콘텐츠 사이: 1px solid border.default (#E4E6EA)
FilterBar 하단 경계: 1px solid border.default (#E4E6EA)
```

---

## 색상 시스템

색상 토큰은 `src/shared/design/colors.json`에 정의되어 있다.

### 팔레트 (Palette)

원시 색상값. 시멘틱 토큰을 통해 간접 참조하며, 컴포넌트에서 직접 사용하지 않는다.

| 계열 | 대표색 | 용도 |
|------|--------|------|
| `gray` | `#667085` | 중립, Backlog, 비활성 |
| `blue` | `#1677FF` | 브랜드 주색, TODO |
| `amber` | `#F59E0B` | In Progress, medium 우선순위 |
| `green` | `#22C55E` | Done, success |
| `red` | `#F43F5E` | urgent 우선순위, 오류, 기한 초과 |
| `orange` | `#F97316` | high 우선순위 |

### 시멘틱 토큰 (Semantic)

#### 배경

| 토큰 | 값 | 사용 |
|------|----|------|
| `background.base` | `#F0F2F5` | 앱 전체 배경 (body) |
| `background.surface` | `#FFFFFF` | 카드, 모달, 드롭다운, 입력 필드 |
| `background.sidebar` | `#F3F4F6` | Backlog 사이드바 (swimlane.backlog.bg와 동일) |
| `background.overlay` | `rgba(16,24,40,0.4)` | 모달 오버레이 |

#### 경계선

| 토큰 | 값 | 사용 |
|------|----|------|
| `border.subtle` | `#F0F2F5` | 카드 내부 구분 |
| `border.default` | `#E4E6EA` | 카드, 입력 필드 기본 경계 |
| `border.strong` | `#D0D5DD` | 드래그 활성, 강조 경계 |

#### 텍스트

| 토큰 | 값 | 사용 |
|------|----|------|
| `text.primary` | `#1D2939` | 제목 (14px bold) |
| `text.secondary` | `#475467` | 설명, 레이블 (12px) |
| `text.tertiary` | `#667085` | 메타 정보, 타임스탬프 (12px) |
| `text.placeholder` | `#98A2B3` | 입력 필드 placeholder (12px) |
| `text.disabled` | `#D0D5DD` | 비활성 텍스트 |
| `text.inverse` | `#FFFFFF` | 컬러 배경 위 텍스트 |
| `text.link` | `#1677FF` | 링크, 인터랙티브 텍스트 |

#### 인터랙티브

| 토큰 | 값 | 사용 |
|------|----|------|
| `interactive.primary` | `#1677FF` | 기본 버튼 |
| `interactive.primaryHover` | `#0D65E8` | 기본 버튼 hover |
| `interactive.primaryActive` | `#0A52CC` | 기본 버튼 active |
| `interactive.primarySubtle` | `#EFF6FF` | 아이콘 버튼 hover 배경 |
| `interactive.ghost` | `transparent` | ghost 버튼 |
| `interactive.ghostHover` | `#F5F6F8` | ghost 버튼 hover |

---

### 칸반 상태 색상 (Status Colors)

배지와 상태 표시에 적용. 스윔레인 배경과 같은 색계열이지만 더 진하다.

| 상태 | indicator | bg | text | border |
|------|-----------|-----|------|--------|
| **BACKLOG** | `#98A2B3` | `#F3F4F6` | `#475467` | `#D0D5DD` |
| **TODO** | `#1677FF` | `#EEF3FF` | `#0A52CC` | `#93C5FD` |
| **IN_PROGRESS** | `#F59E0B` | `#FFF8EE` | `#B45309` | `#FCD34D` |
| **DONE** | `#22C55E` | `#EEFAF4` | `#15803D` | `#86EFAC` |

### 우선순위 색상 (Priority Colors)

| 우선순위 | dot | bg | text | border |
|---------|-----|-----|------|--------|
| **urgent** | `#F43F5E` | `#FFF1F2` | `#BE123C` | `#FDA4AF` |
| **high** | `#F97316` | `#FFF7ED` | `#C2410C` | `#FDBA74` |
| **medium** | `#F59E0B` | `#FFFBEB` | `#B45309` | `#FDE68A` |
| **low** | `#98A2B3` | `#F5F6F8` | `#475467` | `#D0D5DD` |

---

## 타이포그래피

**폰트**: Inter (fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)

### 핵심 규칙

> **제목**: 14px / font-weight 700 (bold)  
> **내용 · 입력**: 12px / font-weight 400

이 두 단계만 사용한다. 예외는 페이지 레벨 타이틀뿐이다.

### 스케일

| 이름 | size | weight | line-height | 사용 |
|------|------|--------|-------------|------|
| `page-title` | 20px | 700 | 1.3 | 보드 이름 (TopBar) |
| `title` | 14px | 700 | 1.4 | 칼럼 헤더, 카드 제목, 섹션 레이블 |
| `body` | 12px | 400 | 1.5 | 카드 설명, 메타 정보, 배지 텍스트 |
| `input` | 12px | 400 | 1.5 | 입력 필드, placeholder |
| `caption` | 11px | 400 | 1.4 | 타임스탬프 (최소 크기, 최대한 자제) |

### 적용 원칙
- 카드 **제목**: `title` (14px / 700 / text.primary)
- 카드 **설명**: `body` (12px / 400 / text.secondary)
- 컬럼 **헤더 텍스트**: `title` (14px / 700 / text.primary)
- 배지·태그 텍스트: `body` (12px / 400)
- 모든 **입력 필드** 텍스트: `input` (12px / 400)
- 마감일, ID 등 **메타**: `body` (12px / 400 / text.tertiary)

---

## 입력 필드 (Input)

모든 입력 요소(text input, textarea, select, search)는 동일한 스타일 토큰을 따른다.
토큰은 `colors.json > input`에 정의되어 있다.

### 기본 스펙

| 속성 | 값 | 토큰 |
|------|-----|------|
| 배경 | `#FFFFFF` | `input.bg` |
| 경계 | `1px solid #D0D5DD` | `input.border` |
| 경계 반지름 | `8px` | `input.radius` |
| 높이 (단행) | `36px` | `input.height` |
| 패딩 | `8px 12px` | `input.padding` |
| 글자 크기 | `12px` | `input.fontSize` |
| 글자 색 | `#1D2939` | `input.text` |
| Placeholder | `#98A2B3` | `input.placeholder` |

### 상태별 경계 색상

| 상태 | 경계 색 | 추가 효과 |
|------|---------|-----------|
| 기본 | `#D0D5DD` (`input.border`) | — |
| Hover | `#98A2B3` (`input.borderHover`) | — |
| Focus | `#1677FF` (`input.borderFocus`) | `box-shadow: 0 0 0 3px rgba(22,119,255,0.15)` |
| Error | `#F43F5E` (`input.borderError`) | — |
| Disabled | `#E4E6EA` | `background: #F5F6F8`, `cursor: not-allowed` |

### CSS 공통 패턴

```css
/* 모든 input에 공통 적용 */
.input-base {
  height: 36px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #1D2939;
  background: #FFFFFF;
  border: 1px solid #D0D5DD;
  border-radius: 8px;
  outline: none;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input-base::placeholder { color: #98A2B3; }
.input-base:hover        { border-color: #98A2B3; }
.input-base:focus        { border-color: #1677FF; box-shadow: 0 0 0 3px rgba(22,119,255,0.15); }
.input-base:disabled     { background: #F5F6F8; color: #98A2B3; cursor: not-allowed; }
```

---

## 간격 (Spacing)

4px 기반 스케일. Tailwind CSS 기본 스케일과 호환.

| 토큰 | 값 | 사용 |
|------|----|------|
| `space-1` | 4px | 아이콘 내부 패딩, 최소 간격 |
| `space-2` | 8px | 배지 패딩, 아이콘–텍스트 간격, 입력 상하 패딩 |
| `space-3` | 12px | 입력 좌우 패딩, 카드 패딩 (compact) |
| `space-4` | 16px | 카드 기본 패딩 |
| `space-5` | 20px | 칼럼 상하 패딩 |
| `space-6` | 24px | FilterBar 좌우 패딩 |
| `space-8` | 32px | 칼럼 간격 |

---

## 그림자 / 엘리베이션

| 레벨 | CSS값 | 사용 |
|------|-------|------|
| `shadow-xs` | `0 1px 2px rgba(16,24,40,0.05)` | 기본 카드 |
| `shadow-sm` | `0 1px 3px rgba(16,24,40,0.10), 0 1px 2px rgba(16,24,40,0.06)` | 카드 hover |
| `shadow-md` | `0 4px 8px rgba(16,24,40,0.10), 0 2px 4px rgba(16,24,40,0.06)` | 드래그 중 카드 |
| `shadow-lg` | `0 12px 16px rgba(16,24,40,0.08), 0 4px 6px rgba(16,24,40,0.03)` | 모달, 드롭다운 |

---

## 경계 반지름 (Border Radius)

| 토큰 | 값 | 사용 |
|------|----|------|
| `radius-sm` | 4px | 배지, 태그 |
| `radius-md` | 8px | 카드, 입력 필드, 버튼 |
| `radius-lg` | 12px | 모달, 패널 |
| `radius-full` | 9999px | 아바타, 원형 버튼 |

---

## 컴포넌트별 토큰 적용 가이드

### Backlog 사이드바

```
배경:      swimlane.backlog.bg (#F3F4F6)
우측 경계: 1px solid border.default (#E4E6EA)
너비:      280px (고정)
높이:      100% (TopBar 아래 전체)
헤더:      swimlane.backlog.headerBg (#E8EAEF)
헤더 텍스트: title (14px / 700 / text.primary)
```

### FilterBar

```
배경:      background.surface (#FFFFFF)
하단 경계: 1px solid border.default (#E4E6EA)
높이:      48px (고정)
패딩:      0 24px
입력 요소: input 토큰 공통 적용 (높이 36px, 12px)
```

### 칸반 칼럼 (KanbanColumn)

```
배경:       swimlane.{status}.bg
헤더 배경:  swimlane.{status}.headerBg
좌측 경계:  3px solid swimlane.{status}.indicator
우측 경계:  1px solid swimlane.{status}.divider (마지막 컬럼 제외)
헤더 텍스트: title (14px / 700 / text.primary)
카운트 배지: body (12px) / status.{status}.bg + status.{status}.text
```

### TicketCard

```
배경:        background.surface (#FFFFFF)
경계:        1px solid border.default (#E4E6EA)
경계 반지름: radius-md (8px)
그림자:      shadow-xs (기본), shadow-sm (hover)
패딩:        16px
제목:        title (14px / 700 / text.primary)
설명:        body (12px / 400 / text.secondary)
메타 정보:   body (12px / 400 / text.tertiary)
```

드래그 활성:
```
그림자:  shadow-md
경계:    1px solid border.strong (#D0D5DD)
opacity: 0.95
```

### PriorityBadge

```
배경:        priority.{level}.bg
텍스트:      body (12px / 400) / priority.{level}.text
경계:        1px solid priority.{level}.border
경계 반지름: radius-sm (4px)
패딩:        2px 6px
```

### StatusBadge

```
배경:        status.{status}.bg
텍스트:      body (12px / 400) / status.{status}.text
경계:        1px solid status.{status}.border
경계 반지름: radius-sm (4px)
패딩:        2px 6px
```

### DueDateBadge

```
정상:   bg state.info.bg / text state.info.text / border state.info.border
초과:   bg state.overdue.bg / text state.overdue.text / border state.overdue.border
크기:   body (12px / 400)
경계 반지름: radius-sm (4px)
패딩:   2px 6px
```

### Button (Primary)

```
배경:        interactive.primary (#1677FF)
배경 hover:  interactive.primaryHover (#0D65E8)
배경 active: interactive.primaryActive (#0A52CC)
텍스트:      text.inverse (#FFFFFF) / 12px / 500
경계 반지름: radius-md (8px)
높이:        36px
패딩:        0 16px
```

### Button (Ghost)

```
배경:        transparent
배경 hover:  interactive.ghostHover (#F5F6F8)
텍스트:      text.secondary (#475467) / 12px / 400
경계:        1px solid border.default (#E4E6EA)
경계 반지름: radius-md (8px)
높이:        36px
패딩:        0 16px
```

### FilterTab

```
높이:        48px (FilterBar와 동일)
비활성:      body (12px / 400) / text.tertiary, 하단 경계 없음
활성:        body (12px / 500) / text.link (#1677FF), 하단 2px solid #1677FF
hover:       interactive.primarySubtle 배경
```

---

## 색상 사용 원칙

1. **스윔레인 배경**은 반드시 `swimlane.{lane}.bg` 토큰을 사용한다. 직접 색상값 입력 금지.
2. **컴포넌트 배경**(`status.bg`, `priority.bg`)은 스윔레인 배경보다 항상 진해야 한다. 배경이 비슷하면 배지가 묻힌다.
3. **주색(#1677FF)**은 인터랙션 요소(버튼, 링크, 활성 탭, input focus)에만 사용한다.
4. **빨간색**은 urgent 우선순위와 오류/기한 초과에만 사용한다. 두 용도의 혼용 금지.
5. **그림자**는 실제 엘리베이션 차이가 있을 때만 추가한다. 장식적 그림자 금지.
6. **입력 요소**는 예외 없이 `input.*` 토큰을 사용한다. 커스텀 스타일 추가 시 기존 토큰 우선 검토.
