import React, { useState } from 'react';
import { BookOpen, Copy, Check, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { Project, Storyboard } from '../../types/storybook';
import { buildStoryPrompt } from '../../services/promptEngine';

interface Step2StoryProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
}

export const Step2Story: React.FC<Step2StoryProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
  onSetDynamicPrompt
}) => {
  const [aiStoryPaste, setAiStoryPaste] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
  const [parseNotice, setParseNotice] = useState<string | null>(null);

  const storyPrompt = buildStoryPrompt(project);

  React.useEffect(() => {
    onSetDynamicPrompt('스토리 시놉시스 및 10장면 원고 집필 프롬프트', storyPrompt);
  }, [project.storyIdea, project.name, project.targetAge, project.theme]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(storyPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  // AI 응답 파싱 (JSON 또는 구조화된 텍스트 자동 반영)
  const handleParseAiStory = () => {
    if (!aiStoryPaste.trim()) return;

    setParseNotice(null);

    // 1. 순수 JSON 파싱 시도
    try {
      // JSON 코드블록 제거
      const cleaned = aiStoryPaste.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonStr);

        const updated: Partial<Project> = {};
        if (parsed.title) updated.name = parsed.title;
        if (parsed.logline) updated.logline = parsed.logline;
        if (parsed.synopsis) updated.synopsis = parsed.synopsis;

        if (Array.isArray(parsed.scenes)) {
          const newStoryboards = [...project.storyboards];
          const manuscriptLines: string[] = [];

          parsed.scenes.forEach((sc: any, idx: number) => {
            const scNum = sc.sceneNumber || idx + 1;
            const text = sc.text || '';
            if (scNum >= 1 && scNum <= 10) {
              newStoryboards[scNum - 1] = {
                ...newStoryboards[scNum - 1],
                text
              };
              manuscriptLines.push(`${scNum}. ${text}`);
            }
          });

          updated.storyboards = newStoryboards;
          updated.manuscript = manuscriptLines.join('\n');
        }

        onUpdateProject(updated);
        setParseNotice('✓ 구조화된 JSON 데이터가 성공적으로 반영되었습니다.');
        return;
      }
    } catch (e) {
      // JSON 파싱 실패 시 일반 텍스트 분석으로 폴백
    }

    // 2. 일반 텍스트 줄단위 분석
    const lines = aiStoryPaste.split('\n').map(l => l.trim()).filter(Boolean);
    const newStoryboards = [...project.storyboards];
    let matchedCount = 0;

    lines.forEach(line => {
      const match = line.match(/^(?:장면\s*|Scene\s*)?(\d{1,2})[\.\:\)]\s*(.*)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        const text = match[2].trim();
        if (num >= 1 && num <= 10 && text) {
          newStoryboards[num - 1] = {
            ...newStoryboards[num - 1],
            text
          };
          matchedCount++;
        }
      }
    });

    if (matchedCount > 0) {
      const compiled = newStoryboards.map(s => `${s.sceneNumber}. ${s.text}`).join('\n');
      onUpdateProject({
        storyboards: newStoryboards,
        manuscript: compiled
      });
      setParseNotice(`✓ ${matchedCount}개 장면 원고를 텍스트에서 성공적으로 추출했습니다.`);
    } else {
      // 파싱이 어려우면 시놉시스나 원고 전체에 원문 보존
      onUpdateProject({
        manuscript: aiStoryPaste
      });
      setParseNotice('원문 텍스트를 원고 전문에 보존하였습니다. 아래에서 장면별로 검토 및 편집해 주세요.');
    }
  };

  const handleUpdateSceneText = (index: number, text: string) => {
    const updated = [...project.storyboards];
    updated[index] = {
      ...updated[index],
      text
    };

    const compiled = updated.map(s => `${s.sceneNumber}. ${s.text}`).join('\n');
    onUpdateProject({
      storyboards: updated,
      manuscript: compiled
    });
  };

  // 원고 확정 처리
  const handleApproveStory = () => {
    onUpdateProject({
      approvals: {
        ...project.approvals,
        step2_storyApproved: true
      }
    });
  };

  // 확정 후 원고 수정 시 후속 단계 승인 해제 경고 모달 열기
  const handleModifyApprovedStory = () => {
    setShowConfirmResetModal(true);
  };

  const handleConfirmReset = () => {
    onUpdateProject({
      approvals: {
        ...project.approvals,
        step2_storyApproved: false,
        step6_storyboardApproved: false,
        step7_illustrationsApproved: false,
        step8_publishReady: false
      }
    });
    setShowConfirmResetModal(false);
  };

  const isStoryApproved = !!project.approvals?.step2_storyApproved;
  const isAllScenesFilled = project.storyboards.every(s => !!s.text && s.text.trim().length > 5);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
      {/* Step Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <BookOpen className="w-4 h-4" />
          <span>STEP 02. 서사 및 원고 개발</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          시놉시스 및 10장면 동화책 원고 완성
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          선택한 아이디어를 5~7세 독서 눈높이에 맞춘 10장면 기승전결 그림책 원고로 발전시킵니다. 설교식 결말을 지양하고, 아이들이 공감할 수 있는 인과관계와 리듬감을 갖춥니다.
        </p>
      </div>

      {/* AI Prompt & Paste Tool */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900">
            1. 외부 AI 원고 작성 프롬프트
          </h2>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copySuccess ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
            }`}
          >
            {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copySuccess ? '복사 완료!' : '원고 집필 프롬프트 복사'}
          </button>
        </div>

        <p className="text-xs text-stone-600">
          ChatGPT나 Claude에 복사하여 완성된 10장면 원고(JSON 또는 줄글 형태)를 응답받아 아래에 붙여넣으세요.
        </p>

        <div className="space-y-2">
          <textarea
            value={aiStoryPaste}
            onChange={(e) => setAiStoryPaste(e.target.value)}
            rows={4}
            placeholder="AI가 작성한 원고 전체 또는 JSON 코드를 여기에 붙여넣으세요..."
            className="w-full p-3 text-xs border border-stone-300 rounded-xl font-mono focus:ring-2 focus:ring-purple-400 focus:outline-none bg-stone-50/60"
          />
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleParseAiStory}
              disabled={!aiStoryPaste.trim()}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              10장면 원고에 자동 반영하기
            </button>
            {parseNotice && (
              <span className="text-xs text-emerald-800 font-medium">
                {parseNotice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Logline & Synopsis */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100">
          2. 로그라인 및 줄거리 개요
        </h2>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            3문장 핵심 로그라인 (도서 홍보 및 핵심 줄거리)
          </label>
          <textarea
            value={project.logline || ''}
            onChange={(e) => onUpdateProject({ logline: e.target.value })}
            rows={2}
            placeholder="예: 별빛이 희미해져 길을 잃은 밤의 숲에서, 작은 여우 루미가 친구들과 함께 떨어진 별 조각을 모아 따스한 우정으로 불빛을 되살리고 온 숲을 환하게 밝힙니다."
            className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            기승전결 상세 시놉시스 (시작-결핍-모험-시련-전환-협력-절정-해결-여운)
          </label>
          <textarea
            value={project.synopsis || ''}
            onChange={(e) => onUpdateProject({ synopsis: e.target.value })}
            rows={5}
            placeholder="기승전결 6단계 줄거리를 정리해 두면 후속 스토리보드 작업이 수월해집니다..."
            className="w-full p-3 text-xs border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-mono text-stone-800"
          />
        </div>
      </div>

      {/* 10 Scenes Manuscript Editor */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              3. 10장면 본문 원고 편집
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              각 장면은 5~7세 어린이가 소리 내어 읽거나 부모가 읽어줄 때 적합한 2~3문장 분량으로 다듬어 주세요.
            </p>
          </div>

          <div>
            {isStoryApproved ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> 원고 확정 완료
                </span>
                <button
                  type="button"
                  onClick={handleModifyApprovedStory}
                  className="text-xs text-stone-600 hover:text-stone-800 underline font-medium"
                >
                  수정하기
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleApproveStory}
                disabled={!isAllScenesFilled}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  isAllScenesFilled
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>10장면 원고 확정하기</span>
              </button>
            )}
          </div>
        </div>

        {/* 10 Scenes List */}
        <div className="space-y-3 pt-1">
          {project.storyboards.map((scene, idx) => (
            <div
              key={scene.sceneNumber}
              className="p-3.5 bg-stone-50/70 border border-stone-200 rounded-xl space-y-1.5 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900">
                  장면 {scene.sceneNumber}
                  <span className="text-stone-400 font-normal ml-2">
                    ({scene.narrativePurpose || '기승전결'})
                  </span>
                </span>
                <span className="text-[11px] text-stone-600">
                  {scene.text ? `${scene.text.length}자` : '미작성'}
                </span>
              </div>
              <textarea
                value={scene.text}
                onChange={(e) => handleUpdateSceneText(idx, e.target.value)}
                disabled={isStoryApproved}
                rows={2}
                placeholder={`장면 ${scene.sceneNumber}의 본문 문장을 입력하세요...`}
                className={`w-full p-2.5 text-xs border rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none transition-colors ${
                  isStoryApproved
                    ? 'bg-stone-100 border-stone-200 text-stone-600'
                    : 'bg-white border-stone-300 text-stone-900'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmResetModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-stone-900">
                원고를 수정하시겠습니까?
              </h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                이미 확정된 원고를 수정할 경우, 원고 내용을 기반으로 한 후속 단계(스토리보드 시각 연출, 삽화 승인 등)의 확정 상태가 초기화되어 재검토가 필요합니다.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmResetModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                취소 (확정 유지)
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors"
              >
                수정 모드로 전환
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={onPrevStep}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>기획 단계로</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          disabled={!isStoryApproved}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            isStoryApproved
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
          title={!isStoryApproved ? '10장면 원고를 확정해야 다음 단계로 갈 수 있습니다.' : ''}
        >
          <span>그림 스타일 및 판형 선택</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
