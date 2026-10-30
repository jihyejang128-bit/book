import React, { useState, useEffect } from 'react';
import {
  Clapperboard,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Users,
  Camera,
  Sun,
  Maximize2
} from 'lucide-react';
import { Project, Storyboard, Asset } from '../../types/storybook';
import { buildStoryboardPrompt } from '../../services/promptEngine';
import { getAssetFromIndexedDB } from '../../services/storage';

interface Step6StoryboardProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
}

export const Step6Storyboard: React.FC<Step6StoryboardProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
  onSetDynamicPrompt
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedSceneNum, setSelectedSceneNum] = useState<number>(1);
  const [copySuccess, setCopySuccess] = useState(false);
  const [characterKeyAssets, setCharacterKeyAssets] = useState<Record<string, Asset>>({});

  const storyboardPrompt = buildStoryboardPrompt(project);

  // 캐릭터 대표 이미지 로드
  useEffect(() => {
    async function loadCharImages() {
      const map: Record<string, Asset> = {};
      for (const char of project.characters || []) {
        if (char.keyReferenceAssetId) {
          const a = await getAssetFromIndexedDB(char.keyReferenceAssetId);
          if (a) map[char.id] = a;
        }
      }
      setCharacterKeyAssets(map);
    }
    loadCharImages();
  }, [project.characters]);

  useEffect(() => {
    onSetDynamicPrompt('10장면 스토리보드 시각 연출 계획 프롬프트', storyboardPrompt);
  }, [project.name, project.targetAge, project.manuscript]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(storyboardPrompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateScene = (sceneIndex: number, field: keyof Storyboard, value: any) => {
    const updated = [...project.storyboards];
    updated[sceneIndex] = {
      ...updated[sceneIndex],
      [field]: value
    };
    onUpdateProject({ storyboards: updated });
  };

  const handleToggleSceneApproval = (sceneIndex: number) => {
    const updated = [...project.storyboards];
    const current = updated[sceneIndex];
    updated[sceneIndex] = {
      ...current,
      approved: !current.approved
    };

    const allApproved = updated.every(s => s.approved);
    onUpdateProject({
      storyboards: updated,
      approvals: {
        ...project.approvals,
        step6_storyboardApproved: allApproved
      }
    });
  };

  const handleApproveAll = () => {
    const updated = project.storyboards.map(s => ({ ...s, approved: true }));
    onUpdateProject({
      storyboards: updated,
      approvals: {
        ...project.approvals,
        step6_storyboardApproved: true
      }
    });
  };

  const selectedScene = project.storyboards.find(s => s.sceneNumber === selectedSceneNum) || project.storyboards[0];
  const selectedSceneIndex = project.storyboards.findIndex(s => s.sceneNumber === selectedSceneNum);

  const approvedCount = project.storyboards.filter(s => s.approved).length;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <Clapperboard className="w-4 h-4" />
          <span>STEP 06. 연출 및 스토리보드 설계</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          10장면 시각 설계 및 텍스트 안전 여백 배치
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          10장면 원고에 맞는 카메라 시점, 샷 크기, 조명, 인물 행동, 그리고 글자가 얹어질 안전 여백(Negative Space)을 정밀하게 설계합니다. 등장 인물의 바이블과 기준 이미지가 자동 연결됩니다.
        </p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              카드 상세 보기
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              표(Table) 요약 보기
            </button>
          </div>

          <span className="text-xs text-stone-500 hidden sm:inline">
            검토 완료: <strong>{approvedCount}/10</strong> 장면
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copySuccess ? 'bg-emerald-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copySuccess ? '복사 완료' : '스토리보드 전체 프롬프트'}
          </button>

          <button
            type="button"
            onClick={handleApproveAll}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            10장면 일괄 승인
          </button>
        </div>
      </div>

      {/* Card View Mode */}
      {viewMode === 'cards' ? (
        <div className="space-y-6">
          {/* 10 Scenes Horizontal Stepper */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {project.storyboards.map(scene => {
              const isSelected = selectedSceneNum === scene.sceneNumber;
              return (
                <button
                  key={scene.sceneNumber}
                  onClick={() => setSelectedSceneNum(scene.sceneNumber)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-600 text-white shadow-sm'
                      : scene.approved
                      ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-[11px] font-bold">장면 {scene.sceneNumber}</div>
                  <div className="text-[9px] truncate mt-0.5 opacity-80">
                    {scene.approved ? '승인됨' : '작성 중'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Scene Detailed Visual Editor */}
          {selectedScene && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {selectedScene.sceneNumber}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-stone-900">
                      장면 {selectedScene.sceneNumber} 시각 연출 계획
                    </h2>
                    <p className="text-[11px] text-stone-500">
                      기승전결 역할: {selectedScene.narrativePurpose}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSceneApproval(selectedSceneIndex)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    selectedScene.approved
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedScene.approved ? '승인 완료' : '이 장면 승인하기'}</span>
                </button>
              </div>

              {/* Manuscript Text Readout */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-stone-200/80 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 block">
                  원고 본문 (STEP 2에서 연동됨)
                </span>
                <p className="text-xs font-medium text-stone-900 leading-relaxed">
                  "{selectedScene.text || '본문이 아직 입력되지 않았습니다.'}"
                </p>
              </div>

              {/* Character Links & Key Reference Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  등장 인물 선택 (해당 캐릭터 바이블 자동 참조)
                </label>
                <div className="flex flex-wrap gap-2">
                  {project.characters.map(char => {
                    const isChecked = selectedScene.characterIds?.includes(char.id);
                    const keyAsset = characterKeyAssets[char.id];

                    return (
                      <label
                        key={char.id}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-purple-300 bg-purple-50/80'
                            : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const current = selectedScene.characterIds || [];
                            const updated = e.target.checked
                              ? [...current, char.id]
                              : current.filter(id => id !== char.id);
                            handleUpdateScene(selectedSceneIndex, 'characterIds', updated);
                          }}
                          className="rounded text-purple-600 focus:ring-0"
                        />
                        {keyAsset && (
                          <img
                            src={keyAsset.dataUrl}
                            alt={char.name}
                            className="w-6 h-6 rounded-full object-cover border border-purple-200"
                          />
                        )}
                        <span className="text-xs font-semibold text-stone-800">
                          {char.name}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          ({char.role})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Visual Directing Form (Shot, Camera, Lighting, Location, Time) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    샷 크기 (구도)
                  </label>
                  <select
                    value={selectedScene.composition}
                    onChange={(e) => handleUpdateScene(selectedSceneIndex, 'composition', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 bg-white"
                  >
                    <option value="와이드 샷 (Wide Establishing Shot)">와이드 샷 (배경 중심)</option>
                    <option value="미디엄 풀샷 (Medium Full Shot)">미디엄 풀샷 (전신 행동)</option>
                    <option value="미디엄 샷 (Medium Shot)">미디엄 샷 (상반신 표준)</option>
                    <option value="클로즈업 샷 (Close-up Shot)">클로즈업 샷 (감정 극대화)</option>
                    <option value="익스트림 클로즈업 (Extreme Close-up)">익스트림 클로즈업 (손/소품)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    카메라 앵글 및 시점
                  </label>
                  <select
                    value={selectedScene.camera}
                    onChange={(e) => handleUpdateScene(selectedSceneIndex, 'camera', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 bg-white"
                  >
                    <option value="눈높이 정면 시점 (Eye-level Frontal View)">눈높이 정면 (친근함)</option>
                    <option value="약간 로우 앵글 (Low Angle)">로우 앵글 (웅장함/용기)</option>
                    <option value="하이 앵글 (High Angle Bird-eye)">하이 앵글 (위에서 내려다봄)</option>
                    <option value="3/4 쿼터뷰 (Three-quarter View)">3/4 쿼터뷰 (입체적 공간감)</option>
                    <option value="대각선 다이내믹 앵글 (Dutch / Dynamic Tilt)">대각선 다이내믹 앵글</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    텍스트 배치 여백 (Negative Space)
                  </label>
                  <select
                    value={selectedScene.textPlacement}
                    onChange={(e) => handleUpdateScene(selectedSceneIndex, 'textPlacement', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 bg-white"
                  >
                    <option value="top">상단 1/3 여백 (하늘/단색 공간)</option>
                    <option value="bottom">하단 1/3 여백 (풀밭/바닥 공간)</option>
                    <option value="left">좌측 여백 (인물 우측 배치)</option>
                    <option value="right">우측 여백 (인물 좌측 배치)</option>
                  </select>
                </div>
              </div>

              {/* Action, Emotion, Lighting, Props */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    인물의 구체적 신체 동작 (Action)
                  </label>
                  <input
                    type="text"
                    value={selectedScene.action}
                    onChange={(e) => handleUpdateScene(selectedSceneIndex, 'action', e.target.value)}
                    placeholder="예: 떨어진 차가운 별 조각을 두 손으로 꼭 감싸 쥐고 입김을 부는 모습"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    감정선 (Emotion)
                  </label>
                  <input
                    type="text"
                    value={selectedScene.emotion}
                    onChange={(e) => handleUpdateScene(selectedSceneIndex, 'emotion', e.target.value)}
                    placeholder="예: 안타까움과 다정한 집중"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    조명 및 분위기 (Lighting)
                  </label>
                  <input
                    type="text"
                    value={selectedScene.lighting}
                    onChange={(e) => handleUpdateScene(selectedSceneIndex, 'lighting', e.target.value)}
                    placeholder="예: 차가운 밤하늘과 손안의 따스한 노란 불씨"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    연속성 주의점 (Continuity Notes)
                  </label>
                  <input
                    type="text"
                    value={selectedScene.continuityNotes}
                    onChange={(e) => handleUpdateScene(selectedSceneIndex, 'continuityNotes', e.target.value)}
                    placeholder="예: 앞 장면과 동일한 별 자수 남색 멜빵바지 유지"
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Table View Mode */
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
              <tr>
                <th className="py-3 px-3 w-12 text-center">장면</th>
                <th className="py-3 px-3 w-48">기승전결 목적</th>
                <th className="py-3 px-3">본문 원고</th>
                <th className="py-3 px-3 w-28">구도/시점</th>
                <th className="py-3 px-3 w-28">글자 여백</th>
                <th className="py-3 px-3 w-20 text-center">승인</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {project.storyboards.map((scene, idx) => (
                <tr
                  key={scene.sceneNumber}
                  onClick={() => {
                    setSelectedSceneNum(scene.sceneNumber);
                    setViewMode('cards');
                  }}
                  className="hover:bg-purple-50/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-center text-purple-900">
                    {scene.sceneNumber}
                  </td>
                  <td className="py-3 px-3 font-medium text-stone-900">
                    {scene.narrativePurpose}
                  </td>
                  <td className="py-3 px-3 text-stone-600 max-w-xs truncate">
                    {scene.text}
                  </td>
                  <td className="py-3 px-3 text-stone-500">
                    {scene.composition.split('(')[0]}
                  </td>
                  <td className="py-3 px-3 text-stone-500">
                    {scene.textPlacement}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {scene.approved ? (
                      <span className="text-emerald-700 font-bold">✓</span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <span>일관성 테스트로</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition-all shadow-sm"
        >
          <span>장면별 삽화 프롬프트 및 이미지 관리</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
