import React, { useState } from 'react';
import { Copy, Check, Sparkles, BookOpen, ExternalLink, HelpCircle, ChevronRight, ChevronLeft } from 'lucide-react';

interface HelpAndPromptPanelProps {
  currentStep: number;
  promptText: string;
  promptTitle: string;
  authorTip: string;
  artDirectorTip: string;
  externalToolAdvice: {
    recommendedAi: string[];
    usageGuide: string;
  };
  onEditPrompt?: (newText: string) => void;
}

export const HelpAndPromptPanel: React.FC<HelpAndPromptPanelProps> = ({
  currentStep,
  promptText,
  promptTitle,
  authorTip,
  artDirectorTip,
  externalToolAdvice,
  onEditPrompt
}) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('클립보드 복사 실패:', e);
    }
  };

  if (isCollapsed) {
    return (
      <div className="hidden xl:flex flex-col items-center py-4 px-1.5 border-l border-stone-200 bg-[#FAF8F5] shrink-0">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
          title="도움말 및 프롬프트 패널 열기"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[11px] font-bold text-stone-400 [writing-mode:vertical-lr] tracking-widest mt-6">
          프롬프트 & 멘토링
        </span>
      </div>
    );
  }

  return (
    <aside className="w-full xl:w-96 border-t xl:border-t-0 xl:border-l border-stone-200 bg-[#FAF8F5] flex flex-col shrink-0">
      {/* Panel Top Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-100/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-stone-800 tracking-wide">
            전문 프롬프트 & 작가 멘토링
          </h3>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="hidden xl:inline-flex p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200 transition-colors"
          title="패널 접기"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Generated Prompt Box */}
        <div className="bg-white rounded-xl border border-purple-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <span>{promptTitle}</span>
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>프롬프트 복사</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-stone-500">
            아래 생성된 프롬프트를 복사하여 외부 생성형 AI에 입력하세요.
          </p>

          <div className="relative">
            <textarea
              value={promptText}
              onChange={(e) => onEditPrompt?.(e.target.value)}
              readOnly={!onEditPrompt}
              rows={9}
              className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-400 resize-y"
              placeholder="현재 단계에 필요한 프롬프트가 여기에 생성됩니다."
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1">
            <span>{promptText.length}자</span>
            <span>단어 수: {promptText.trim().split(/\s+/).filter(Boolean).length}개</span>
          </div>
        </div>

        {/* External AI Recommendation */}
        <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
            <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
            <span>추천 외부 AI 도구</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {externalToolAdvice.recommendedAi.map((ai, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[11px] font-medium bg-white border border-stone-200 rounded text-stone-700 shadow-2xs"
              >
                {ai}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed mt-1">
            {externalToolAdvice.usageGuide}
          </p>
        </div>

        {/* 20-Year Author Advice */}
        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>20년 경력 아동문학 작가의 조언</span>
          </div>
          <p className="text-[11px] text-amber-950/90 leading-relaxed">
            {authorTip}
          </p>
        </div>

        {/* Art Director Advice */}
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>그림책 아트디렉터 팁</span>
          </div>
          <p className="text-[11px] text-emerald-950/90 leading-relaxed">
            {artDirectorTip}
          </p>
        </div>
      </div>
    </aside>
  );
};
