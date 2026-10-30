import React, { useState } from 'react';
import { BookOpen, CheckCircle2, RefreshCw, FolderOpen, Edit3, Check, Menu } from 'lucide-react';
import { Project } from '../types/storybook';

interface HeaderProps {
  project: Project;
  onUpdateProjectName: (name: string) => void;
  saveStatus: 'saved' | 'saving' | 'error';
  lastSavedTime?: string;
  onOpenProjectManager: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onUpdateProjectName,
  saveStatus,
  lastSavedTime,
  onOpenProjectManager,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(project.name);

  // 진행률 계산 (8단계 중 승인 또는 완료된 단계 수)
  const calculateProgress = () => {
    let completedSteps = 0;
    if (project.storyIdea) completedSteps++;
    if (project.approvals?.step2_storyApproved) completedSteps++;
    if (project.styleId) completedSteps++;
    if (project.characters?.some(c => c.approved)) completedSteps++;
    if (project.approvals?.step5_consistencyApproved) completedSteps++;
    if (project.storyboards?.some(s => s.approved)) completedSteps++;
    if (project.storyboards?.some(s => s.imageAssetId)) completedSteps++;
    if (project.approvals?.step8_publishReady) completedSteps++;

    const percent = Math.round((completedSteps / 8) * 100);
    return { completedSteps, percent };
  };

  const { completedSteps, percent } = calculateProgress();

  const handleTitleSubmit = () => {
    if (tempTitle.trim()) {
      onUpdateProjectName(tempTitle.trim());
    } else {
      setTempTitle(project.name);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/90 px-4 md:px-7 py-3 transition-all">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark & mobile toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
            aria-label="단계 메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="/" className="flex items-center gap-2.5 text-stone-900 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-purple-200 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-base font-bold tracking-tight whitespace-nowrap">
              AI 그림동화 공방
            </span>
          </a>
        </div>

        {/* Zone 2: Center Project Info & Progress */}
        <div className="hidden sm:flex items-center gap-4 flex-1 max-w-xl min-w-0">
          {/* Project Title Editor */}
          <div className="flex items-center gap-1.5 min-w-0">
            {isEditingTitle ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  className="px-2 py-0.5 text-xs font-semibold border border-purple-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 w-44"
                />
                <button
                  onClick={handleTitleSubmit}
                  className="p-1 text-purple-700 hover:bg-purple-100 rounded"
                  title="저장"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  setTempTitle(project.name);
                  setIsEditingTitle(true);
                }}
                className="flex items-center gap-1.5 cursor-pointer hover:bg-stone-200/50 px-2 py-1 rounded-md transition-colors group truncate"
                title="클릭하여 작품명 수정"
              >
                <span className="text-xs font-semibold text-stone-800 truncate">
                  {project.name || '제목 없음'}
                </span>
                <Edit3 className="w-3 h-3 text-stone-400 group-hover:text-stone-700 shrink-0" />
              </div>
            )}
            <span className="text-stone-300 text-xs" aria-hidden="true">|</span>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 flex-1 min-w-[130px]">
            <div className="flex-1 h-2 bg-stone-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-stone-500 whitespace-nowrap">
              {completedSteps}/8단계 ({percent}%)
            </span>
          </div>

          {/* Real-time Save Status */}
          <div className="flex items-center gap-1 text-[11px] text-stone-500 whitespace-nowrap shrink-0">
            {saveStatus === 'saving' ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-purple-600" />
                <span>저장 중...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>방금 저장됨</span>
              </>
            ) : (
              <span className="text-rose-600">저장 오류</span>
            )}
          </div>
        </div>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProjectManager}
            className="px-3.5 py-1.5 text-xs font-medium text-purple-900 bg-purple-100/80 hover:bg-purple-200/90 border border-purple-200 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <FolderOpen className="w-3.5 h-3.5 text-purple-700" />
            <span>프로젝트 관리 / 백업</span>
          </button>
        </div>
      </div>
    </header>
  );
};
