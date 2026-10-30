import React, { useState } from 'react';
import { Sparkles, Check, Copy, ArrowRight, Lightbulb, Compass, HeartHandshake } from 'lucide-react';
import { Project, TargetAge } from '../../types/storybook';
import { buildIdeaPrompt } from '../../services/promptEngine';

interface Step1PlanningProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNextStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
}

const AGE_OPTIONS: { value: TargetAge; label: string; desc: string }[] = [
  { value: '5세', label: '5세 (첫 그림책)', desc: '단순한 반복 구조와 리듬감, 친숙한 사물 및 동물' },
  { value: '6세', label: '6세 (상상 그림책)', desc: '호기심 확장, 가벼운 갈등과 친구와의 협력' },
  { value: '7세', label: '7세 (취학 전 이야기)', desc: '명확한 기승전결, 자아존중 및 용기 있는 스스로의 선택' },
  { value: '5~7세 공통', label: '5~7세 통합', desc: '누구나 공감할 수 있는 보편적 온기와 감동' }
];

const THEME_PRESETS = [
  '우정과 나눔',
  '용기와 첫 도전',
  '배려와 협력',
  '자연과 생명의 소중함',
  '어둠/실패의 두려움 극복',
  '내 모습 그대로 사랑하기'
];

const TONE_PRESETS = [
  '따뜻하고 몽환적이며 다정한 위로',
  '유쾌하고 통통 튀며 장난기 넘치는',
  '신비롭고 호기심을 자극하는 모험',
  '포근하고 안도감을 주는 잠자리 동화'
];

export const Step1Planning: React.FC<Step1PlanningProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onSetDynamicPrompt
}) => {
  const [customTheme, setCustomTheme] = useState('');
  const [aiPasteText, setAiPasteText] = useState('');
  const [customIdeaInput, setCustomIdeaInput] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // 동적 프롬프트 생성
  const ideaPrompt = buildIdeaPrompt(project);

  // 상위 도움말 패널에 현재 프롬프트 동기화
  React.useEffect(() => {
    onSetDynamicPrompt('동화책 아이디어 3종 발굴 프롬프트', ideaPrompt);
  }, [project.targetAge, project.theme, project.lesson, project.tone, project.protagonistType]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(ideaPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.warn('복사 실패:', e);
    }
  };

  const handleAdoptIdea = (idea: string) => {
    onUpdateProject({
      storyIdea: idea,
      approvals: {
        ...project.approvals,
        step1_ideaApproved: true
      }
    });
  };

  const handleParseAiResponse = () => {
    if (!aiPasteText.trim()) return;

    // AI 응답에서 아이디어 후보 분리 시도
    const lines = aiPasteText.split('\n');
    const candidates: string[] = [];
    let currentBlock = '';

    for (const line of lines) {
      if (line.includes('아이디어 1') || line.includes('아이디어 2') || line.includes('아이디어 3') || line.startsWith('■') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.')) {
        if (currentBlock.trim()) candidates.push(currentBlock.trim());
        currentBlock = line + '\n';
      } else {
        currentBlock += line + '\n';
      }
    }
    if (currentBlock.trim()) candidates.push(currentBlock.trim());

    if (candidates.length > 0) {
      onUpdateProject({ candidateIdeas: candidates });
    } else {
      onUpdateProject({ candidateIdeas: [aiPasteText.trim()] });
    }
  };

  const canProceed = !!project.storyIdea && !!project.name;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Step Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <Compass className="w-4 h-4" />
          <span>STEP 01. 기획 및 발상 설계</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          5~7세 동화책 기획 및 아이디어 발굴
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          유아의 발달 단계와 심리적 안정감을 고려하여 핵심 주제와 주인공을 설정하고, 외부 AI를 통해 서로 다른 3가지 창의적 아이디어를 제안받습니다.
        </p>
      </div>

      {/* Basic Planning Fields */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
          <Lightbulb className="w-4 h-4 text-purple-600" />
          1. 기본 기획 프로필
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              임시 작품명 (제목) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => onUpdateProject({ name: e.target.value })}
              placeholder="예: 별빛을 수선하는 작은 여우"
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          {/* Protagonist Type */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              주인공 유형 / 인물상
            </label>
            <input
              type="text"
              value={project.protagonistType || ''}
              onChange={(e) => onUpdateProject({ protagonistType: e.target.value })}
              placeholder="예: 손재주가 좋고 마음이 따뜻한 꼬마 붉은 여우"
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Target Age */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            대상 독자 연령
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {AGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdateProject({ targetAge: opt.value })}
                className={`p-3 text-left rounded-xl border transition-all ${
                  project.targetAge === opt.value
                    ? 'border-purple-400 bg-purple-50/80 ring-1 ring-purple-300'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                }`}
              >
                <div className="text-xs font-bold text-stone-900">{opt.label}</div>
                <div className="text-[11px] text-stone-500 mt-1 leading-snug">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-2">
            핵심 주제 선택 또는 직접 입력
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {THEME_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onUpdateProject({ theme: t })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  project.theme === t
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={project.theme}
            onChange={(e) => onUpdateProject({ theme: e.target.value })}
            placeholder="직접 입력: 예) 이사 가서 새로운 동네 친구를 사귀는 두려움과 기쁨"
            className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        {/* Tone and Message */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              작품 분위기 및 정서
            </label>
            <input
              type="text"
              value={project.tone}
              onChange={(e) => onUpdateProject({ tone: e.target.value })}
              placeholder="예: 따뜻하고 몽환적이며 다정한 위로"
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              교육적 메시지 (설교식 지양)
            </label>
            <input
              type="text"
              value={project.lesson}
              onChange={(e) => onUpdateProject({ lesson: e.target.value })}
              placeholder="예: 서로 온기를 나눌 때 깜깜한 두려움도 함께 이겨낼 수 있어요"
              className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Idea Prompt Generation & AI Result Workflow */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            2. 외부 AI 아이디어 발굴 및 선택
          </h2>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copySuccess ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
            }`}
          >
            {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copySuccess ? '복사 완료!' : '발상 프롬프트 복사'}
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          ChatGPT, Claude, Gemini 웹사이트 등에 위 프롬프트를 붙여넣어 제안받은 3가지 아이디어 답변을 아래에 입력하세요.
        </p>

        {/* AI Result Paste Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700">
              외부 AI 응답 붙여넣기
            </label>
            {aiPasteText && (
              <button
                type="button"
                onClick={handleParseAiResponse}
                className="text-xs text-purple-700 hover:text-purple-800 font-semibold"
              >
                아이디어 후보 카드로 분리하기
              </button>
            )}
          </div>
          <textarea
            value={aiPasteText}
            onChange={(e) => setAiPasteText(e.target.value)}
            rows={5}
            placeholder="AI가 생성한 3가지 아이디어 텍스트를 여기에 붙여넣으세요..."
            className="w-full p-3 text-xs border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-purple-400 focus:outline-none bg-stone-50/60"
          />
        </div>

        {/* Candidate Idea Cards */}
        {project.candidateIdeas && project.candidateIdeas.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-stone-800">
              추출된 아이디어 후보 (클릭하여 채택)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {project.candidateIdeas.map((idea, index) => {
                const isSelected = project.storyIdea === idea;
                return (
                  <div
                    key={index}
                    onClick={() => handleAdoptIdea(idea)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/80 ring-1 ring-purple-300 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-stone-900">
                        후보 {index + 1}
                      </span>
                      {isSelected ? (
                        <span className="text-purple-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> 채택됨
                        </span>
                      ) : (
                        <span className="text-stone-400 hover:text-purple-600">이 아이디어 채택</span>
                      )}
                    </div>
                    <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">
                      {idea}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected or Custom Idea Field */}
        <div className="pt-2">
          <label className="block text-xs font-bold text-stone-900 mb-1.5">
            최종 채택된 핵심 아이디어 <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-stone-500 mb-2">
            위 후보 중 선택하거나 직접 수정하여 완성하세요. 이 아이디어가 STEP 2 스토리 원고의 출발점이 됩니다.
          </p>
          <textarea
            value={project.storyIdea}
            onChange={(e) => onUpdateProject({
              storyIdea: e.target.value,
              approvals: { ...project.approvals, step1_ideaApproved: !!e.target.value }
            })}
            rows={3}
            placeholder="채택된 핵심 스토리 아이디어가 여기에 표시됩니다..."
            className="w-full p-3.5 text-xs border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white font-medium text-stone-900 leading-relaxed"
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <div className="text-xs text-stone-500">
          {!project.name && '작품명을 입력하세요.'}
          {project.name && !project.storyIdea && '핵심 아이디어를 채택하거나 입력하세요.'}
          {canProceed && <span className="text-emerald-700 font-semibold">✓ 기획 설정 완료! 다음 단계로 이동 가능합니다.</span>}
        </div>

        <button
          type="button"
          onClick={onNextStep}
          disabled={!canProceed}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            canProceed
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <span>스토리 개발로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
