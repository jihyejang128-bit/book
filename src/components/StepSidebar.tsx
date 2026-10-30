import React from 'react';
import {
  Sparkles,
  BookMarked,
  Palette,
  Users,
  CheckCircle,
  Clapperboard,
  Image as ImageIcon,
  Printer,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Project } from '../types/storybook';

export interface StepItem {
  id: number;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: (p: Project) => boolean;
  warningReason?: (p: Project) => string | null;
}

export const STEPS: StepItem[] = [
  {
    id: 1,
    title: '동화책 기획',
    shortDesc: '연령, 주제 및 아이디어 3선',
    icon: Sparkles,
    isComplete: (p) => !!p.storyIdea,
    warningReason: (p) => (!p.storyIdea ? '선택된 핵심 아이디어가 없습니다.' : null)
  },
  {
    id: 2,
    title: '스토리 개발',
    shortDesc: '10장면 원고 및 시놉시스',
    icon: BookMarked,
    isComplete: (p) => !!p.approvals?.step2_storyApproved,
    warningReason: (p) => (!p.approvals?.step2_storyApproved ? '10장면 원고 확정이 필요합니다.' : null)
  },
  {
    id: 3,
    title: '그림 스타일·판형',
    shortDesc: '8종 스타일과 전자책/POD 규격',
    icon: Palette,
    isComplete: (p) => !!p.styleId && !!p.approvals?.step3_styleApproved,
    warningReason: (p) => (!p.approvals?.step3_styleApproved ? '그림 스타일 및 판형 확정이 필요합니다.' : null)
  },
  {
    id: 4,
    title: '캐릭터 바이블',
    shortDesc: '인물 속성 분리 및 4종 시트',
    icon: Users,
    isComplete: (p) => (p.characters?.length > 0 && p.characters.some(c => c.approved)),
    warningReason: (p) => (p.characters?.length === 0 ? '등록된 캐릭터가 없습니다.' : !p.characters.some(c => c.approved) ? '승인된 캐릭터가 없습니다.' : null)
  },
  {
    id: 5,
    title: '일관성 테스트',
    shortDesc: '낮/밤/액션 3종 테스트 검수',
    icon: CheckCircle,
    isComplete: (p) => !!p.approvals?.step5_consistencyApproved,
    warningReason: (p) => (!p.approvals?.step5_consistencyApproved ? '3종 일관성 테스트 육안 검수가 필요합니다.' : null)
  },
  {
    id: 6,
    title: '스토리보드',
    shortDesc: '10장면 시각 설계 및 여백',
    icon: Clapperboard,
    isComplete: (p) => p.storyboards?.every(s => s.approved),
    warningReason: (p) => {
      const unapprovedCount = (p.storyboards || []).filter(s => !s.approved).length;
      return unapprovedCount > 0 ? `${unapprovedCount}개 장면의 시각 연출 검토 필요` : null;
    }
  },
  {
    id: 7,
    title: '장면별 삽화 관리',
    shortDesc: '최종 프롬프트 및 스프레드 뷰',
    icon: ImageIcon,
    isComplete: (p) => p.storyboards?.every(s => !!s.imageAssetId),
    warningReason: (p) => {
      const missingCount = (p.storyboards || []).filter(s => !s.imageAssetId).length;
      return missingCount > 0 ? `${missingCount}개 장면의 삽화 업로드 대기` : null;
    }
  },
  {
    id: 8,
    title: '편집·출판 준비',
    shortDesc: 'PDF 초안, ZIP 묶음, POD 가이드',
    icon: Printer,
    isComplete: (p) => !!p.approvals?.step8_publishReady,
    warningReason: () => null
  }
];

interface StepSidebarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  project: Project;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const StepSidebar: React.FC<StepSidebarProps> = ({
  currentStep,
  onSelectStep,
  project,
  isOpen,
  onCloseMobile
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-[57px] bottom-0 left-0 z-30 w-72 bg-[#FAF8F5] border-r border-stone-200 flex flex-col transition-transform duration-200 shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-stone-200/80 bg-stone-100/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-stone-700 tracking-wide">
              창작 공정 워크플로우
            </h2>
            <span className="text-[11px] text-stone-500">
              4일 완성 교육 코스
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            기획부터 인쇄·전자책 출판 준비까지 8단계
          </p>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5" aria-label="단계 선택">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = step.isComplete(project);
            const warning = step.warningReason ? step.warningReason(project) : null;

            return (
              <button
                key={step.id}
                onClick={() => {
                  onSelectStep(step.id);
                  onCloseMobile();
                }}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 group relative ${
                  isActive
                    ? 'bg-white shadow-sm border border-purple-200 ring-1 ring-purple-100 text-stone-900'
                    : 'hover:bg-stone-100/80 text-stone-600 border border-transparent'
                }`}
              >
                {/* Step Number & Status Icon */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-600 group-hover:bg-stone-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                  ) : (
                    <span>0{step.id}</span>
                  )}
                </div>

                {/* Step Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold truncate ${isActive ? 'text-purple-950' : 'text-stone-800'}`}>
                      {step.title}
                    </span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-purple-600 shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {step.shortDesc}
                  </p>

                  {/* Warning / Status helper */}
                  {warning && !isCompleted && (
                    <div className="flex items-center gap-1 text-[10px] text-stone-600 mt-1">
                      <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{warning}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Educational Note at Sidebar Bottom */}
        <div className="p-3.5 border-t border-stone-200 bg-[#F4EFE6]/60 text-[11px] text-stone-600 leading-snug">
          <p className="font-semibold text-stone-800 mb-1">
            💡 강사 & 수강생 안내
          </p>
          <p>
            본 웹앱은 자체 AI API를 호출하지 않으며, 공방에서 생성된 고품질 프롬프트를 복사하여 외부 생성형 AI에 입력하는 학습 실습 도구입니다.
          </p>
        </div>
      </aside>
    </>
  );
};
