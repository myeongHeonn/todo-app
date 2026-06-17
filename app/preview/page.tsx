'use client';

// ─────────────────────────────────────────────────────────────
// /preview — 컴포넌트 갤러리 (개발용, DB 연결 불필요)
//
// Phase별로 컴포넌트가 추가되며, 각 섹션은 독립 목 데이터로 렌더링됩니다.
// Phase 0  ticketApi (런타임 확인 불가, 스킵)
// Phase 1  Button · Badge · Modal         ← 완료
// Phase 2  ConfirmDialog · TicketCard · TicketForm  ← ConfirmDialog 완료
// Phase 3  TicketDetailView · Column · BoardHeader · TicketModal
// Phase 4  useTickets (hook, 스킵)
// Phase 5  Board · BoardContainer
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Button } from '@/client/components/ui/Button';
import { Badge, PriorityBadge, DueDateBadge } from '@/client/components/ui/Badge';
import { Modal } from '@/client/components/ui/Modal';
import { ConfirmDialog } from '@/client/components/ConfirmDialog';
import { Board } from '@/client/components/Board';
import { Column } from '@/client/components/Column';
import { TicketCard } from '@/client/components/TicketCard';
import { DndContext } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { TicketWithMeta, BoardData } from '@/shared/types';

// ── 타입 정의 (공유 타입이 생기면 @/shared/types에서 import) ──────
type TicketStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';

interface MockTicket {
  id: number;
  title: string;
  description: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  position: number;
  plannedStartDate: string | null;
  dueDate: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
}

// ── 목 데이터 ────────────────────────────────────────────────
const MOCK_TICKETS: MockTicket[] = [
  {
    id: 1,
    title: '로그인 페이지 UI 구현',
    description: '디자인 시안을 기반으로 로그인 폼을 구현합니다.',
    status: 'TODO',
    priority: 'HIGH',
    position: 0,
    plannedStartDate: '2026-06-10',
    dueDate: '2026-06-20',
    startedAt: '2026-06-11T09:00:00Z',
    completedAt: null,
    createdAt: '2026-06-09T10:00:00Z',
    updatedAt: '2026-06-11T09:00:00Z',
    isOverdue: false,
  },
  {
    id: 2,
    title: '오버듀 티켓 — 마감일 지남',
    description: null,
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    position: 1024,
    plannedStartDate: null,
    dueDate: '2026-05-01',
    startedAt: '2026-05-20T09:00:00Z',
    completedAt: null,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-20T09:00:00Z',
    isOverdue: true,
  },
  {
    id: 3,
    title: '낮은 우선순위 · 날짜 없음',
    description: '설명이 있는 티켓입니다. 짧은 설명.',
    status: 'BACKLOG',
    priority: 'LOW',
    position: 2048,
    plannedStartDate: null,
    dueDate: null,
    startedAt: null,
    completedAt: null,
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
    isOverdue: false,
  },
  {
    id: 4,
    title: '완료된 티켓',
    description: null,
    status: 'DONE',
    priority: 'MEDIUM',
    position: 0,
    plannedStartDate: '2026-06-01',
    dueDate: '2026-06-15',
    startedAt: '2026-06-02T09:00:00Z',
    completedAt: '2026-06-12T17:00:00Z',
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-12T17:00:00Z',
    isOverdue: false,
  },
  {
    id: 5,
    title: '매우 긴 제목 테스트 — 이 제목은 카드 영역을 초과하여 말줄임 처리가 되어야 합니다 그래서 의도적으로 길게 작성했습니다',
    description: '긴 제목 말줄임 테스트용 카드입니다.',
    status: 'TODO',
    priority: 'LOW',
    position: 3072,
    plannedStartDate: null,
    dueDate: '2026-07-01',
    startedAt: null,
    completedAt: null,
    createdAt: '2026-06-05T08:00:00Z',
    updatedAt: '2026-06-05T08:00:00Z',
    isOverdue: false,
  },
  {
    id: 6,
    title: '긴급 기능 — 결제 모듈 오류 수정',
    description: '프로덕션에서 결제 실패 케이스가 발생하고 있습니다.',
    status: 'BACKLOG',
    priority: 'HIGH',
    position: -1024,
    plannedStartDate: null,
    dueDate: '2026-06-25',
    startedAt: null,
    completedAt: null,
    createdAt: '2026-06-15T08:00:00Z',
    updatedAt: '2026-06-15T08:00:00Z',
    isOverdue: false,
  },
  {
    id: 7,
    title: 'API 문서 업데이트 — 마감일 지남',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    position: -512,
    plannedStartDate: null,
    dueDate: '2026-05-15',
    startedAt: null,
    completedAt: null,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-01T08:00:00Z',
    isOverdue: true,
  },
];

const MOCK_BOARD = {
  BACKLOG: [MOCK_TICKETS[2], MOCK_TICKETS[5]],        // LOW + HIGH = 2
  TODO: [MOCK_TICKETS[0], MOCK_TICKETS[4], MOCK_TICKETS[6]], // HIGH + LOW + isOverdue = 3
  IN_PROGRESS: [MOCK_TICKETS[1]],                     // 1
  DONE: [MOCK_TICKETS[3]],                            // 1
};

const BOARD_DATA = MOCK_BOARD as unknown as BoardData;

// ── 프리뷰 레이아웃 헬퍼 ─────────────────────────────────────
function PreviewPage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F4F5F7', padding: '0 0 4rem' }}>
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #E4E7EC',
          padding: '0 2rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 18, color: '#1D2939' }}>Tika</span>
        <span
          style={{
            background: '#EEF1FD',
            color: '#4361EE',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Component Preview
        </span>
        <nav style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem' }}>
          {['Phase 1', 'Phase 2', 'Phase 3', 'Phase 5'].map((p) => (
            <a
              key={p}
              href={`#${p.toLowerCase().replace(' ', '-')}`}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 20,
                fontSize: 13,
                color: '#667085',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              {p}
            </a>
          ))}
        </nav>
      </header>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem 0' }}>
        {children}
      </main>
    </div>
  );
}

function PhaseSection({
  id,
  phase,
  title,
  description,
  children,
  status = 'pending',
}: {
  id: string;
  phase: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  status?: 'done' | 'wip' | 'pending';
}) {
  const statusStyle: Record<string, React.CSSProperties> = {
    done:    { background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0' },
    wip:     { background: '#FFF7ED', color: '#D97706', border: '1px solid #FDE68A' },
    pending: { background: '#F9FAFB', color: '#9CA3AF', border: '1px solid #E5E7EB' },
  };
  const statusLabel = { done: '완료', wip: '진행 중', pending: '대기' };

  return (
    <section id={id} style={{ marginBottom: '3rem' }}>
      {/* 섹션 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #E4E7EC',
        }}
      >
        <span
          style={{
            background: '#4361EE',
            color: '#fff',
            borderRadius: 6,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {phase}
        </span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1D2939' }}>
          {title}
        </h2>
        <span
          style={{
            marginLeft: 'auto',
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 600,
            ...statusStyle[status],
          }}
        >
          {statusLabel[status]}
        </span>
      </div>
      <p style={{ margin: '0 0 1.25rem', color: '#667085', fontSize: 13 }}>
        {description}
      </p>

      {children ?? (
        <div
          style={{
            border: '2px dashed #E4E7EC',
            borderRadius: 10,
            padding: '2.5rem',
            textAlign: 'center',
            color: '#98A2B3',
            fontSize: 14,
            background: '#FAFAFA',
          }}
        >
          구현 완료 후 컴포넌트가 여기에 추가됩니다
        </div>
      )}
    </section>
  );
}

function PreviewCard({
  title,
  hint,
  children,
  background = '#fff',
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  background?: string;
}) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E4E7EC',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.5rem 1rem',
          borderBottom: '1px solid #F0F2F5',
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: '#344054' }}>{title}</span>
        {hint && (
          <span style={{ fontSize: 12, color: '#98A2B3' }}>{hint}</span>
        )}
      </div>
      <div
        style={{
          padding: '1.5rem',
          background,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Grid({ cols = 2, children }: { cols?: number; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '1rem',
      }}
    >
      {children}
    </div>
  );
}

// ── 목 데이터 뷰어 (개발 참고용) ─────────────────────────────
function MockDataViewer() {
  return (
    <section style={{ marginBottom: '3rem' }}>
      <details>
        <summary
          style={{
            cursor: 'pointer',
            padding: '0.5rem 0',
            fontSize: 13,
            color: '#667085',
            fontWeight: 500,
            userSelect: 'none',
          }}
        >
          목 데이터 보기 (MOCK_TICKETS · MOCK_BOARD)
        </summary>
        <pre
          style={{
            marginTop: '0.5rem',
            background: '#1D2939',
            color: '#A5B4FC',
            padding: '1rem 1.25rem',
            borderRadius: 8,
            fontSize: 12,
            overflow: 'auto',
            maxHeight: 320,
            lineHeight: 1.6,
          }}
        >
          {JSON.stringify({ MOCK_TICKETS, MOCK_BOARD }, null, 2)}
        </pre>
      </details>
    </section>
  );
}

// ── Phase 1 인터랙션 상태 ─────────────────────────────────────
function Phase1Preview() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Grid cols={2}>
      <PreviewCard title="Button" hint="네 가지 variant">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </PreviewCard>

      <PreviewCard title="Button (isLoading)" hint="처리 중 상태">
        <Button isLoading>저장</Button>
        <Button variant="danger" isLoading>삭제</Button>
      </PreviewCard>

      <PreviewCard title="Modal" hint="버튼 클릭으로 열기 / ESC · 오버레이 클릭으로 닫기" background="#F4F5F7">
        <Button onClick={() => setIsModalOpen(true)}>모달 열기</Button>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="예시 모달">
          <p style={{ margin: '0 0 1rem', color: '#344054' }}>
            ESC 키 또는 바깥 클릭으로 닫을 수 있습니다.
          </p>
          <Button variant="secondary" onClick={() => setIsModalOpen(false)}>닫기</Button>
        </Modal>
      </PreviewCard>

      <PreviewCard title="Badge" hint="priority · overdue · date">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#667085', width: 70 }}>Priority</span>
            <PriorityBadge priority="LOW" />
            <PriorityBadge priority="MEDIUM" />
            <PriorityBadge priority="HIGH" />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#667085', width: 70 }}>DueDate</span>
            <DueDateBadge date="2026-12-31" isOverdue={false} />
            <DueDateBadge date="2026-01-01" isOverdue={true} />
          </div>
        </div>
      </PreviewCard>
    </Grid>
  );
}

function Phase2Preview() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <Grid cols={2}>
      <PreviewCard title="ConfirmDialog" hint="버튼 클릭으로 열기">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>삭제</Button>
          {lastAction && (
            <span style={{ fontSize: 13, color: '#667085' }}>마지막 액션: {lastAction}</span>
          )}
          <ConfirmDialog
            isOpen={confirmOpen}
            onConfirm={() => { setLastAction('확인 (삭제)'); setConfirmOpen(false); }}
            onCancel={() => { setLastAction('취소'); setConfirmOpen(false); }}
          />
        </div>
      </PreviewCard>

      <PreviewCard title="TicketCard" hint="일반 · isOverdue · DONE 세 가지 상태" background="#F4F5F7">
        <DndContext id="preview-ticket-cards">
          <SortableContext items={[MOCK_TICKETS[0].id, MOCK_TICKETS[6].id, MOCK_TICKETS[3].id]}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <TicketCard
                ticket={MOCK_TICKETS[0] as unknown as TicketWithMeta}
                onClick={() => {}}
              />
              <TicketCard
                ticket={MOCK_TICKETS[6] as unknown as TicketWithMeta}
                onClick={() => {}}
              />
              <TicketCard
                ticket={MOCK_TICKETS[3] as unknown as TicketWithMeta}
                onClick={() => {}}
              />
            </div>
          </SortableContext>
        </DndContext>
      </PreviewCard>

      <PreviewCard title="TicketForm" hint="Phase 2 구현 후 추가">
        <div style={{ color: '#98A2B3', fontSize: 13 }}>구현 완료 후 추가됩니다</div>
      </PreviewCard>
    </Grid>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function PreviewPageRoute() {
  return (
    <PreviewPage>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: 26, fontWeight: 700, color: '#1D2939' }}>
          컴포넌트 갤러리
        </h1>
        <p style={{ margin: 0, color: '#667085', fontSize: 14 }}>
          Phase별 구현 진행상황을 확인합니다. DB 연결 없이 목 데이터로 렌더링됩니다.
        </p>
      </div>

      <MockDataViewer />

      {/* ── Phase 1: 원자 컴포넌트 ── */}
      <PhaseSection
        id="phase-1"
        phase="Phase 1"
        title="원자 컴포넌트 — Button · Badge · Modal"
        description="외부 프로젝트 의존 없는 최소 단위 컴포넌트. src/client/components/ui/"
        status="done"
      >
        <Phase1Preview />
      </PhaseSection>

      {/* ── Phase 2: 분자 컴포넌트 ── */}
      <PhaseSection
        id="phase-2"
        phase="Phase 2"
        title="분자 컴포넌트 — ConfirmDialog · TicketCard · TicketForm"
        description="Phase 1 원자 컴포넌트에 의존. src/client/components/"
        status="wip"
      >
        <Phase2Preview />
      </PhaseSection>

      {/* ── Phase 3: 유기체 컴포넌트 ── */}
      <PhaseSection
        id="phase-3"
        phase="Phase 3"
        title="유기체 컴포넌트 — Column · BoardHeader · TicketModal"
        description="Phase 1+2 컴포넌트에 의존. Column은 DndContext로 감싸 렌더링."
        status="wip"
      >
        <Grid cols={1}>
          <PreviewCard title="BoardHeader" hint="새 업무 버튼">
            <div style={{ color: '#98A2B3', fontSize: 13 }}>BoardHeader 구현 후 추가</div>
          </PreviewCard>

          <PreviewCard
            title="Column"
            hint="BACKLOG (2) · TODO (3, 하나 overdue)"
            background="#F4F5F7"
          >
            <DndContext id="preview-columns">
              <div style={{ display: 'flex', gap: '1rem', width: '100%', alignItems: 'flex-start' }}>
                <div style={{ flex: '0 0 280px' }}>
                  <Column
                    status="BACKLOG"
                    tickets={MOCK_BOARD.BACKLOG as unknown as TicketWithMeta[]}
                    onTicketClick={() => {}}
                  />
                </div>
                <div style={{ flex: '0 0 280px' }}>
                  <Column
                    status="TODO"
                    tickets={MOCK_BOARD.TODO as unknown as TicketWithMeta[]}
                    onTicketClick={() => {}}
                  />
                </div>
              </div>
            </DndContext>
          </PreviewCard>

          <PreviewCard title="TicketModal" hint="상세보기 · 수정 · 삭제" background="#F4F5F7">
            <div style={{ color: '#98A2B3', fontSize: 13 }}>TicketModal 구현 후 추가</div>
          </PreviewCard>
        </Grid>
      </PhaseSection>

      {/* ── Phase 5: 풀 보드 ── */}
      <PhaseSection
        id="phase-5"
        phase="Phase 5"
        title="풀 보드 — Board (목 데이터, DnD 활성)"
        description="Board 컴포넌트 전체. BACKLOG 2개·TODO 3개·IN_PROGRESS 1개·DONE 1개. 드래그 시 레이아웃 확인."
        status="wip"
      >
        <div
          style={{
            height: 560,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #E4E7EC',
            borderRadius: 10,
          }}
        >
          <Board
            board={BOARD_DATA}
            onTicketClick={() => {}}
            onDragEnd={() => {}}
            activeTicket={null}
          />
        </div>
      </PhaseSection>

    </PreviewPage>
  );
}
