import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  BookOpen,
  Copy,
  Check,
  Upload,
  Eye,
  Download,
  Trash2,
  Columns,
  List,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Project, Storyboard, Asset } from '../../types/storybook';
import { buildSceneImagePrompt } from '../../services/promptEngine';
import { saveAssetToIndexedDB, getAssetFromIndexedDB, deleteAssetFromIndexedDB } from '../../services/storage';
import { ImageModal } from '../ImageModal';

interface Step7IllustrationsProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
}

export const Step7Illustrations: React.FC<Step7IllustrationsProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
  onSetDynamicPrompt
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'spread'>('list');
  const [selectedSceneNum, setSelectedSceneNum] = useState<number>(1);
  const [spreadPagePair, setSpreadPagePair] = useState<number>(1); // 1 (1-2), 3 (3-4), 5 (5-6), 7 (7-8), 9 (9-10)
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [sceneAssets, setSceneAssets] = useState<Record<string, Asset>>({});
  const [modalImage, setModalImage] = useState<{ url: string; title: string; assetId?: string } | null>(null);

  // 모든 장면의 이미지 에셋 로드
  useEffect(() => {
    async function loadAllSceneImages() {
      const map: Record<string, Asset> = {};
      for (const scene of project.storyboards) {
        if (scene.imageAssetId) {
          const a = await getAssetFromIndexedDB(scene.imageAssetId);
          if (a) map[scene.imageAssetId] = a;
        }
      }
      setSceneAssets(map);
    }
    loadAllSceneImages();
  }, [project.storyboards]);

  const selectedScene = project.storyboards.find(s => s.sceneNumber === selectedSceneNum) || project.storyboards[0];
  const selectedSceneIndex = project.storyboards.findIndex(s => s.sceneNumber === selectedSceneNum);

  // 현재 장면 프롬프트 생성
  const currentPromptObj = buildSceneImagePrompt(project, selectedScene);

  useEffect(() => {
    onSetDynamicPrompt(`장면 ${selectedScene.sceneNumber} 고품질 삽화 프롬프트`, currentPromptObj.positivePrompt);
  }, [selectedSceneNum, project.styleId, project.characters]);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(`${label} 복사 완료!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUploadSceneImage = async (sceneIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const targetScene = project.storyboards[sceneIndex];

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const assetId = `asset_scene_${targetScene.sceneNumber}_` + Date.now().toString(36);
      const newAsset: Asset = {
        id: assetId,
        projectId: project.id,
        category: 'scene_illustration',
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl,
        sceneNumber: targetScene.sceneNumber,
        createdAt: new Date().toISOString()
      };

      try {
        await saveAssetToIndexedDB(newAsset);
        setSceneAssets(prev => ({ ...prev, [assetId]: newAsset }));

        const updated = [...project.storyboards];
        updated[sceneIndex] = {
          ...updated[sceneIndex],
          imageAssetId: assetId
        };

        const allImagesUploaded = updated.every(s => !!s.imageAssetId);
        onUpdateProject({
          storyboards: updated,
          approvals: {
            ...project.approvals,
            step7_illustrationsApproved: allImagesUploaded
          }
        });
      } catch (err: any) {
        alert('이미지 저장 실패: ' + (err?.message || 'IndexedDB 용량 부족'));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteSceneImage = async (sceneIndex: number, assetId: string) => {
    await deleteAssetFromIndexedDB(assetId);
    const updated = [...project.storyboards];
    updated[sceneIndex] = {
      ...updated[sceneIndex],
      imageAssetId: undefined
    };

    onUpdateProject({
      storyboards: updated,
      approvals: {
        ...project.approvals,
        step7_illustrationsApproved: false
      }
    });

    setSceneAssets(prev => {
      const copy = { ...prev };
      delete copy[assetId];
      return copy;
    });
  };

  const uploadedCount = project.storyboards.filter(s => !!s.imageAssetId).length;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <ImageIcon className="w-4 h-4" />
          <span>STEP 07. 장면별 정밀 삽화 및 이미지 통합</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          장면별 AI 프롬프트 생성 및 삽화 갤러리
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          원고 내용, 캐릭터 고정 속성, 그림 스타일가이드, 카메라 앵글, 그리고 글자 배치용 여백(Negative Space)을 결합하여 고품질 복사 프롬프트를 만듭니다. 외부 AI에서 생성한 이미지를 등록하고 2페이지 펼침(Spread)으로 검토하세요.
        </p>
      </div>

      {/* Mode Toggle & Progress */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              10장면 목록 보기
            </button>
            <button
              onClick={() => setViewMode('spread')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'spread' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              책 펼침 미리보기 (Spread View)
            </button>
          </div>

          <span className="text-xs text-stone-500 hidden sm:inline">
            삽화 완성률: <strong>{uploadedCount}/10</strong> 장
          </span>
        </div>

        {copySuccess && (
          <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> {copySuccess}
          </span>
        )}
      </div>

      {/* List Mode: Detailed Scene Inspector */}
      {viewMode === 'list' ? (
        <div className="space-y-6">
          {/* 10 Scenes Stepper */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {project.storyboards.map(scene => {
              const isSelected = selectedSceneNum === scene.sceneNumber;
              const hasImg = !!scene.imageAssetId;
              return (
                <button
                  key={scene.sceneNumber}
                  onClick={() => setSelectedSceneNum(scene.sceneNumber)}
                  className={`p-2 rounded-xl text-center border transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-600 text-white shadow-sm'
                      : hasImg
                      ? 'border-emerald-300 bg-emerald-50/70 text-emerald-800'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-[11px] font-bold">장면 {scene.sceneNumber}</div>
                  <div className="text-[9px] truncate mt-0.5 opacity-80">
                    {hasImg ? '이미지 등록됨' : '대기 중'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Scene Studio Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                  {selectedScene.sceneNumber}
                </span>
                <div>
                  <h2 className="text-sm font-bold text-stone-900">
                    장면 {selectedScene.sceneNumber} 삽화 제작 스튜디오
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    {selectedScene.narrativePurpose}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(currentPromptObj.positivePrompt, `장면 ${selectedScene.sceneNumber} 프롬프트`)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>프롬프트 복사</span>
                </button>
              </div>
            </div>

            {/* Split: Left Image Upload Slot vs Right Synthesized Prompt & Guidelines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Left: Illustration Slot */}
              <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    장면 {selectedScene.sceneNumber} 등록된 삽화
                  </span>
                  {selectedScene.imageAssetId && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      등록 완료
                    </span>
                  )}
                </div>

                {selectedScene.imageAssetId && sceneAssets[selectedScene.imageAssetId] ? (
                  <div className="relative group rounded-lg overflow-hidden border border-stone-200 bg-white flex-1 min-h-[260px] flex items-center justify-center">
                    <img
                      src={sceneAssets[selectedScene.imageAssetId].dataUrl}
                      alt={`장면 ${selectedScene.sceneNumber}`}
                      className="max-h-[300px] w-auto object-contain mx-auto"
                    />

                    {/* Overlay Action Buttons */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setModalImage({
                          url: sceneAssets[selectedScene.imageAssetId!].dataUrl,
                          title: `장면 ${selectedScene.sceneNumber} 삽화`,
                          assetId: selectedScene.imageAssetId
                        })}
                        className="p-2 bg-white text-stone-900 rounded-lg shadow-sm font-medium text-xs flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> 확대
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSceneImage(selectedSceneIndex, selectedScene.imageAssetId!)}
                        className="p-2 bg-rose-600 text-white rounded-lg shadow-sm font-medium text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> 삭제
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 min-h-[240px] border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-2 bg-white">
                    <ImageIcon className="w-8 h-8 text-stone-300" />
                    <p className="text-xs text-stone-600">
                      장면 {selectedScene.sceneNumber}에 삽화 이미지를 등록하세요
                    </p>
                    <label className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs">
                      이미지 파일 업로드
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUploadSceneImage(selectedSceneIndex, e)}
                      />
                    </label>
                  </div>
                )}

                {/* Replacement Button if already exists */}
                {selectedScene.imageAssetId && (
                  <label className="block text-center py-1.5 text-xs text-purple-700 hover:text-purple-800 font-medium cursor-pointer border border-purple-200 rounded-lg bg-purple-50/50">
                    다른 이미지로 교체하기
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadSceneImage(selectedSceneIndex, e)}
                    />
                  </label>
                )}
              </div>

              {/* Right: Synthesized Prompt Box */}
              <div className="space-y-3 flex flex-col justify-between">
                {/* Positive Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-950">
                      합성된 이미지 생성 프롬프트 (Positive)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentPromptObj.positivePrompt, '긍정 프롬프트')}
                      className="text-[11px] text-purple-700 hover:underline font-semibold"
                    >
                      복사
                    </button>
                  </div>
                  <textarea
                    value={currentPromptObj.positivePrompt}
                    readOnly
                    rows={6}
                    className="w-full p-2.5 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl leading-relaxed text-stone-800 focus:outline-none"
                  />
                </div>

                {/* Negative Prompt */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-rose-900">
                      제외 요소 (Negative Prompt)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentPromptObj.negativePrompt, '부정 프롬프트')}
                      className="text-[11px] text-rose-700 hover:underline font-semibold"
                    >
                      복사
                    </button>
                  </div>
                  <textarea
                    value={currentPromptObj.negativePrompt}
                    readOnly
                    rows={2}
                    className="w-full p-2 text-xs font-mono bg-rose-50/50 border border-rose-200 rounded-lg text-rose-900 focus:outline-none"
                  />
                </div>

                {/* Manuscript and Continuity Notes */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-stone-200 space-y-1 text-xs">
                  <span className="font-bold text-stone-800 block">
                    📖 배치될 본문:
                  </span>
                  <p className="text-stone-700">
                    "{selectedScene.text}"
                  </p>
                  <div className="text-[11px] text-stone-500 pt-1">
                    여백 위치: <strong>{selectedScene.textPlacement}</strong> · {selectedScene.continuityNotes}
                  </div>
                </div>
              </div>
            </div>

            {/* Cross-Scene Consistency Checklist */}
            <div className="p-4 bg-purple-50/40 rounded-xl border border-purple-200 space-y-2 text-xs text-purple-950">
              <span className="font-bold flex items-center gap-1.5 text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                장면 간 연속성 점검 체크리스트
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-purple-900/80">
                <li>앞 장면(Scene {selectedScene.sceneNumber > 1 ? selectedScene.sceneNumber - 1 : 1})과 인물의 털 색상 및 멜빵바지 자수가 일치하는가?</li>
                <li>이미지 내에 AI가 제멋대로 생성한 글자(text/letters)나 워터마크가 없는가?</li>
                <li>본문 텍스트가 얹어질 공간(상단/하단 여백)이 충분히 확보되었는가?</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Spread (2-Page Facing) View Mode */
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              책 펼침 (Book Spread) 미리보기: 장면 {spreadPagePair} & 장면 {spreadPagePair + 1}
            </h2>

            {/* Spread Pagination */}
            <div className="flex items-center gap-2">
              {[1, 3, 5, 7, 9].map(p => (
                <button
                  key={p}
                  onClick={() => setSpreadPagePair(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    spreadPagePair === p
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {p}-{p + 1}p
                </button>
              ))}
            </div>
          </div>

          {/* 2 Facing Pages Visual Spread */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-100 p-4 rounded-2xl border border-stone-200 shadow-inner">
            {/* Left Page (spreadPagePair) */}
            {(() => {
              const scLeft = project.storyboards.find(s => s.sceneNumber === spreadPagePair);
              const imgLeft = scLeft?.imageAssetId ? sceneAssets[scLeft.imageAssetId] : null;

              return (
                <div className="bg-white p-6 rounded-xl border border-stone-300 shadow-sm flex flex-col justify-between aspect-square">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 block mb-2">
                      페이지 {spreadPagePair} · {scLeft?.narrativePurpose}
                    </span>
                    {imgLeft ? (
                      <img
                        src={imgLeft.dataUrl}
                        alt={`장면 ${spreadPagePair}`}
                        className="w-full h-56 object-cover rounded-lg border border-stone-200"
                      />
                    ) : (
                      <div className="w-full h-56 bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-xs text-stone-400">
                        삽화 이미지 미등록
                      </div>
                    )}
                  </div>
                  <div className="pt-4 text-center">
                    <p className="text-xs font-medium text-stone-800 leading-relaxed">
                      "{scLeft?.text || '원고 없음'}"
                    </p>
                    <span className="text-[10px] text-stone-400 mt-2 block">- {spreadPagePair} -</span>
                  </div>
                </div>
              );
            })()}

            {/* Right Page (spreadPagePair + 1) */}
            {(() => {
              const rightNum = spreadPagePair + 1;
              const scRight = project.storyboards.find(s => s.sceneNumber === rightNum);
              const imgRight = scRight?.imageAssetId ? sceneAssets[scRight.imageAssetId] : null;

              return (
                <div className="bg-white p-6 rounded-xl border border-stone-300 shadow-sm flex flex-col justify-between aspect-square">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 block mb-2">
                      페이지 {rightNum} · {scRight?.narrativePurpose}
                    </span>
                    {imgRight ? (
                      <img
                        src={imgRight.dataUrl}
                        alt={`장면 ${rightNum}`}
                        className="w-full h-56 object-cover rounded-lg border border-stone-200"
                      />
                    ) : (
                      <div className="w-full h-56 bg-stone-50 border-2 border-dashed border-stone-200 rounded-lg flex items-center justify-center text-xs text-stone-400">
                        삽화 이미지 미등록
                      </div>
                    )}
                  </div>
                  <div className="pt-4 text-center">
                    <p className="text-xs font-medium text-stone-800 leading-relaxed">
                      "{scRight?.text || '원고 없음'}"
                    </p>
                    <span className="text-[10px] text-stone-400 mt-2 block">- {rightNum} -</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
          imageUrl={modalImage.url}
          title={modalImage.title}
          onDelete={modalImage.assetId ? () => handleDeleteSceneImage(selectedSceneIndex, modalImage.assetId!) : undefined}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={onPrevStep}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>스토리보드로</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition-all shadow-sm"
        >
          <span>편집 및 출판 준비로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
