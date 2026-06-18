import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { tickets } from '../src/server/db/schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const rawUrl = process.env.POSTGRES_URL!;
const sql = postgres(rawUrl);
const db = drizzle(sql);

const now = new Date();
const today = now.toISOString().split('T')[0];

function daysFromNow(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function daysAgo(n: number) {
  return daysFromNow(-n);
}

function tsAgo(days: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return d;
}

async function seed() {
  console.log('기존 데이터 삭제 중...');
  await db.delete(tickets);

  console.log('예시 데이터 삽입 중...');

  await db.insert(tickets).values([
    // BACKLOG (position 내림차순 — 낮은 position이 위)
    {
      title: '다크 모드 지원 추가',
      description: '시스템 테마를 감지하여 자동으로 다크 모드를 적용한다.',
      status: 'BACKLOG',
      priority: 'LOW',
      position: -3072,
      plannedStartDate: daysFromNow(14),
      dueDate: daysFromNow(30),
    },
    {
      title: '모바일 반응형 레이아웃',
      description: '화면 너비 768px 이하에서 칸반 보드를 스크롤 가능한 단일 컬럼으로 전환한다.',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      position: -2048,
      plannedStartDate: daysFromNow(7),
      dueDate: daysFromNow(21),
    },
    {
      title: '티켓 검색 기능',
      description: '제목 및 설명으로 티켓을 실시간 검색할 수 있는 검색바를 추가한다.',
      status: 'BACKLOG',
      priority: 'HIGH',
      position: -1024,
      plannedStartDate: daysFromNow(3),
      dueDate: daysFromNow(10),
    },
    {
      title: '키보드 단축키 지원',
      description: 'N키로 새 티켓 생성, ESC로 모달 닫기, Del로 삭제 확인 등 단축키를 추가한다.',
      status: 'BACKLOG',
      priority: 'LOW',
      position: 0,
      plannedStartDate: daysFromNow(20),
      dueDate: daysFromNow(40),
    },
    {
      title: '빠른 완료 버튼',
      description: '티켓 카드에서 모달 없이 바로 완료 처리할 수 있는 체크 버튼을 추가한다.',
      status: 'BACKLOG',
      priority: 'MEDIUM',
      position: 1024,
      plannedStartDate: daysFromNow(5),
      dueDate: daysFromNow(15),
    },

    // TODO
    {
      title: 'API 응답 캐싱 전략 수립',
      description: 'GET /api/tickets 응답에 SWR stale-while-revalidate 캐싱을 적용한다.',
      status: 'TODO',
      priority: 'HIGH',
      position: -2048,
      plannedStartDate: daysAgo(1),
      dueDate: daysFromNow(5),
      startedAt: tsAgo(1),
    },
    {
      title: '필터 기능 구현',
      description: '우선순위(LOW/MEDIUM/HIGH)와 오버듀 여부로 티켓을 필터링하는 UI를 구현한다.',
      status: 'TODO',
      priority: 'MEDIUM',
      position: -1024,
      plannedStartDate: daysAgo(2),
      dueDate: daysFromNow(3),
      startedAt: tsAgo(2),
    },
    {
      title: '티켓 생성 폼 유효성 검사 메시지 개선',
      description: '필드별 에러 메시지를 더 구체적으로 표시하고 포커스를 에러 필드로 이동한다.',
      status: 'TODO',
      priority: 'LOW',
      position: 0,
      plannedStartDate: today,
      dueDate: daysFromNow(7),
      startedAt: tsAgo(0),
    },

    // IN PROGRESS
    {
      title: 'Drizzle 마이그레이션 자동화',
      description: 'CI 파이프라인에서 drizzle-kit migrate를 자동 실행하도록 GitHub Actions를 설정한다.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      position: -2048,
      plannedStartDate: daysAgo(5),
      dueDate: daysFromNow(2),
      startedAt: tsAgo(5),
    },
    {
      title: '오버듀 알림 배지',
      description: '헤더에 오버듀 티켓 수를 표시하는 빨간 배지를 추가한다.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      position: -1024,
      plannedStartDate: daysAgo(3),
      dueDate: daysAgo(1), // overdue
      startedAt: tsAgo(3),
    },
    {
      title: 'position 재정렬 트랜잭션 테스트',
      description: 'position 간격이 1 이하가 될 때 전체 재정렬 로직을 검증하는 통합 테스트를 작성한다.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      position: 0,
      plannedStartDate: daysAgo(2),
      dueDate: daysAgo(2), // overdue
      startedAt: tsAgo(2),
    },

    // DONE (completedAt이 24시간 이내여야 보임)
    {
      title: 'TicketCard 접근성 개선',
      description: 'aria-label, role, tabIndex를 추가해 스크린 리더 지원을 강화한다.',
      status: 'DONE',
      priority: 'MEDIUM',
      position: -1024,
      plannedStartDate: daysAgo(7),
      dueDate: daysAgo(2),
      startedAt: tsAgo(7),
      completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2시간 전
    },
    {
      title: 'Vercel 배포 설정',
      description: '동적 렌더링 및 Neon DB 직접 연결 설정을 완료한다.',
      status: 'DONE',
      priority: 'HIGH',
      position: 0,
      plannedStartDate: daysAgo(10),
      dueDate: daysAgo(5),
      startedAt: tsAgo(10),
      completedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5시간 전
    },
    {
      title: '생성 폼 CSS 스타일링',
      description: '티켓 생성 폼 레이아웃과 색상 토큰을 디자인 시스템 가이드에 맞게 정비한다.',
      status: 'DONE',
      priority: 'LOW',
      position: 1024,
      plannedStartDate: daysAgo(3),
      dueDate: today,
      startedAt: tsAgo(3),
      completedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1시간 전
    },
  ]);

  console.log('완료! 총 14개 티켓 삽입');
  await sql.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
