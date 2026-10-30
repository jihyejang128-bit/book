import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Copy,
  Upload,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Activity,
  Trash2
} from 'lucide-react';
import { Project, Character, ConsistencyTest, Asset } from '../../types/storybook';
import { buildConsistencyTestPrompt } from '../../services/promptEngine';
import { saveAssetToIndexedDB, getAssetFromIndexedDB, deleteAssetFromIndexedDB } from '../../services/storage';
import { ImageModal } from '../ImageModal';

interface Step5ConsistencyTestProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
  onJumpToStep: (step: number) => void;
}

export const Step5ConsistencyTest: React.FC<Step5ConsistencyTestProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
  onSetDynamicPrompt,
  onJumpToStep
}) => {
  const activeChar = project.characters.find(c => c.approved) || project.characters[0];
  const [selectedCharId, setSelectedCharId] = useState<string>(activeChar?.id || '');
  const [activeTestType, setActiveTestType] = useState<'daylight_front' | 'night_side' | 'action_emotion'>('daylight_front');
  const [copySuccess, setCopySuccess] = useState(false);
  const [testAssets, setTestAssets] = useState<Record<string, Asset>>({});
  const [modalImage, setModalImage] = useState<{ url: string; title: string; assetId?: string } | null>(null);

  const character = project.characters.find(c => c.id === selectedCharId) || activeChar;

  // 일관성 테스트 데이터 초기화 또는 가져오기
  const currentTests: ConsistencyTest[] = (project.consistencyTests && character && project.consistencyTests[character.id]) || [
    {
      testType: 'daylight_front',
      title: '테스트 1: 낮 / 정면 (기본 외형과 등신 비율)',
      prompt: character ? buildConsistencyTestPrompt(project, character, 'daylight_front') : '',
      checklist: {
        faceShapeMatched: false,
        eyesMatched: false,
        uniquePatternMatched: false,
        costumeMatched: false,
        proportionsMatched: false,
        artStyleMatched: false
      }
    },
    {
      testType: 'night_side',
      title: '테스트 2: 밤 / 측면 (조명 변화 시 색감 및 귀/꼬리 형태)',
      prompt: character ? buildConsistencyTestPrompt(project, character, 'night_side') : '',
      checklist: {
        faceShapeMatched: false,
        eyesMatched: false,
        uniquePatternMatched: false,
        costumeMatched: false,
        proportionsMatched: false,
        artStyleMatched: false
      }
    },
    {
      testType: 'action_emotion',
      title: '테스트 3: 동적 액션 / 감정 변화 (표정 왜곡 없는 멜빵바지 유지)',
      prompt: character ? buildConsistencyTestPrompt(project, character, 'action_emotion') : '',
      checklist: {
        faceShapeMatched: false,
        eyesMatched: false,
        uniquePatternMatched: false,
        costumeMatched: false,
        proportionsMatched: false,
        artStyleMatched: false
      }
    }
  ];

  const currentTest = currentTests.find(t => t.testType === activeTestType) || currentTests[0];

  // 에셋 로딩
  useEffect(() => {
    async function loadTestAssets() {
      const map: Record<string, Asset> = {};
      for (const t of currentTests) {
        if (t.assetId) {
          const a = await getAssetFromIndexedDB(t.assetId);
          if (a) map[t.assetId] = a;
        }
      }
      setTestAssets(map);
    }
    loadTestAssets();
  }, [selectedCharId, currentTests]);

  // 프롬프트 패널 동기화
  useEffect(() => {
    if (character && currentTest) {
      onSetDynamicPrompt(`캐릭터 일관성 검증: ${currentTest.title}`, currentTest.prompt);
    }
  }, [selectedCharId, activeTestType, character, project.styleId]);

  const handleCopyPrompt = async () => {
    if (!currentTest) return;
    try {
      await navigator.clipboard.writeText(currentTest.prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateChecklist = (field: keyof ConsistencyTest['checklist'], value: boolean) => {
    if (!character) return;
    const updatedTests = currentTests.map(t => {
      if (t.testType === activeTestType) {
        return {
          ...t,
          checklist: {
            ...t.checklist,
            [field]: value
          }
        };
      }
      return t;
    });

    onUpdateProject({
      consistencyTests: {
        ...(project.consistencyTests || {}),
        [character.id]: updatedTests
      }
    });
  };

  const handleUploadTestImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !character) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const assetId = `asset_test_${activeTestType}_` + Date.now().toString(36);
      const newAsset: Asset = {
        id: assetId,
        projectId: project.id,
        category: 'consistency_test',
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl,
        characterId: character.id,
        testType: activeTestType,
        createdAt: new Date().toISOString()
      };

      try {
        await saveAssetToIndexedDB(newAsset);
        setTestAssets(prev => ({ ...prev, [assetId]: newAsset }));

        const updatedTests = currentTests.map(t => {
          if (t.testType === activeTestType) {
            return { ...t, assetId };
          }
          return t;
        });

        onUpdateProject({
          consistencyTests: {
            ...(project.consistencyTests || {}),
            [character.id]: updatedTests
          }
        });
      } catch (err: any) {
        alert('이미지 저장 실패: ' + (err?.message || 'IndexedDB 오류'));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteTestImage = async (assetId: string) => {
    if (!character) return;
    await deleteAssetFromIndexedDB(assetId);
    const updatedTests = currentTests.map(t => {
      if (t.assetId === assetId) {
        return { ...t, assetId: undefined };
      }
      return t;
    });

    onUpdateProject({
      consistencyTests: {
        ...(project.consistencyTests || {}),
        [character.id]: updatedTests
      }
    });

    setTestAssets(prev => {
      const copy = { ...prev };
      delete copy[assetId];
      return copy;
    });
  };

  // 모든 테스트 체크 여부 (각 테스트마다 4개 이상 체크 시 통과 인정)
  const isAllChecklistPassed = currentTests.every(t => {
    const checks = Object.values(t.checklist);
    const passedCount = checks.filter(Boolean).length;
    return passedCount >= 4;
  });

  const isApproved = !!project.approvals?.step5_consistencyApproved;

  const handleToggleFinalApproval = () => {
    onUpdateProject({
      approvals: {
        ...project.approvals,
        step5_consistencyApproved: !isApproved
      }
    });
  };

  if (!character) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200">
        <p className="text-xs text-stone-600">
          먼저 STEP 4에서 캐릭터를 1명 이상 등록하고 승인해 주세요.
        </p>
        <button
          onClick={() => onJumpToStep(4)}
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold"
        >
          STEP 4 캐릭터 바이블로 이동
        </button>
      </div>
    );
  }

  const currentAsset = currentTest.assetId ? testAssets[currentTest.assetId] : null;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <CheckCircle className="w-4 h-4" />
          <span>STEP 05. 캐릭터 일관성 스트레스 테스트</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          낮/밤/동작 3종 일관성 검증 및 6대 체크리스트
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          동화책은 여러 장면에 걸쳐 동일 인물이 등장하므로, 빛과 앵글, 동작이 변해도 캐릭터의 정체성이 유지되는지 확인해야 합니다. 3가지 가혹 테스트를 거쳐 작가가 직접 눈으로 확인하고 승인합니다.
        </p>
      </div>

      {/* Character Switcher */}
      {project.characters.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">검증 대상 인물:</span>
          {project.characters.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCharId(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCharId === c.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* 3 Test Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            type: 'daylight_front' as const,
            title: '1. 낮 / 정면 샷',
            icon: Sun,
            desc: '기본 얼굴형, 2.5등신 비율, 눈 색상'
          },
          {
            type: 'night_side' as const,
            title: '2. 밤 / 측면 프로필',
            icon: Moon,
            desc: '어두운 조명에서 털 색감 유지, 귀/꼬리 형태'
          },
          {
            type: 'action_emotion' as const,
            title: '3. 역동적 액션 / 큰 감정',
            icon: Activity,
            desc: '입을 크게 벌리고 뛰는 동작에서도 의상 유지'
          }
        ].map(item => {
          const Icon = item.icon;
          const isSelected = activeTestType === item.type;
          const testData = currentTests.find(t => t.testType === item.type);
          const hasImage = !!testData?.assetId;

          return (
            <button
              key={item.type}
              type="button"
              onClick={() => setActiveTestType(item.type)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-purple-500 bg-purple-50/70 ring-1 ring-purple-300 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {hasImage && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    이미지 등록됨
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-stone-900">{item.title}</h3>
              <p className="text-[11px] text-stone-500 mt-0.5">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Active Test Inspection Stage */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              [{currentTest.title}] 검증 워크스페이스
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              프롬프트를 복사하여 AI 도구에서 이미지를 생성한 후 아래에 업로드하세요.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopyPrompt}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copySuccess ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
            }`}
          >
            {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copySuccess ? '복사 완료!' : '테스트 프롬프트 복사'}
          </button>
        </div>

        {/* 2-Column Split: Image Upload & Preview (Left) vs 6 Checklist (Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left: Test Image Card */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between space-y-3">
            <span className="text-xs font-bold text-stone-800 block">
              테스트 생성 이미지 결과물
            </span>

            {currentAsset ? (
              <div className="relative group rounded-lg overflow-hidden border border-stone-200 bg-white flex-1 min-h-[240px] flex items-center justify-center">
                <img
                  src={currentAsset.dataUrl}
                  alt={currentTest.title}
                  className="max-h-[280px] w-auto object-contain mx-auto"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalImage({ url: currentAsset.dataUrl, title: currentTest.title, assetId: currentAsset.id })}
                    className="p-2 bg-white text-stone-900 rounded-lg shadow-sm font-medium text-xs flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" /> 크게 보기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTestImage(currentAsset.id)}
                    className="p-2 bg-rose-600 text-white rounded-lg shadow-sm font-medium text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> 삭제
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-[220px] border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center p-6 text-center space-y-2 bg-white">
                <Upload className="w-7 h-7 text-stone-300" />
                <p className="text-xs text-stone-600">
                  생성된 테스트 이미지를 등록해 주세요
                </p>
                <label className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs">
                  이미지 파일 업로드
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadTestImage}
                  />
                </label>
              </div>
            )}

            {currentAsset && (
              <label className="block text-center py-1.5 text-xs text-purple-700 hover:text-purple-800 font-medium cursor-pointer border border-purple-200 rounded-lg bg-purple-50/50">
                다른 이미지로 교체하기
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadTestImage}
                />
              </label>
            )}
          </div>

          {/* Right: 6 Consistency Checkpoints */}
          <div className="border border-stone-200 rounded-xl p-4 bg-white flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-stone-900 block mb-1">
                6대 일관성 육안 검수 항목
              </span>
              <p className="text-[11px] text-stone-500 mb-3">
                기준 이미지와 비교하여 동일하게 유지되었는지 체크하세요.
              </p>

              <div className="space-y-2.5">
                {[
                  { key: 'faceShapeMatched', label: '1. 얼굴형 및 볼 살 일치', tip: '턱선이나 볼의 둥글기가 기준과 동일한가?' },
                  { key: 'eyesMatched', label: '2. 눈매 및 눈동자 색상 일치', tip: '호박색(Amber) 맑은 눈빛이 유지되었는가?' },
                  { key: 'uniquePatternMatched', label: '3. 고유 무늬(귀/꼬리 끝 흰 털) 일치', tip: '동물 특유의 배색 패턴이 누락되지 않았는가?' },
                  { key: 'costumeMatched', label: '4. 의상 및 소품 디테일 일치', tip: '별 자수가 새겨진 남색 멜빵바지가 유지되었는가?' },
                  { key: 'proportionsMatched', label: '5. 2.5등신 귀여운 아동 체형 비율', tip: '성인처럼 다리가 길어지거나 왜곡되지 않았는가?' },
                  { key: 'artStyleMatched', label: '6. 지정된 그림 스타일 톤앤매너 일치', tip: '수채화/지브리 등 지정된 브러시 질감이 일정한가?' }
                ].map(item => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!(currentTest.checklist as any)[item.key]}
                      onChange={(e) => handleUpdateChecklist(item.key as any, e.target.checked)}
                      className="mt-0.5 rounded text-purple-600 focus:ring-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-stone-800 block">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {item.tip}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Problem Troubleshooting Box */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                일관성이 자꾸 무너지나요?
              </span>
              <p className="text-[11px] text-amber-800 leading-snug">
                의상 색이나 형태가 변형된다면 STEP 4의 <strong>[절대 고정 속성]</strong> 키워드를 더 간결하고 강한 명사형으로 다듬거나, 생성 시 이미지 참조 가중치(--cw 100)를 높여보세요.
              </p>
              <button
                type="button"
                onClick={() => onJumpToStep(4)}
                className="text-[11px] font-bold text-amber-900 underline mt-1"
              >
                STEP 4 캐릭터 바이블 속성 수정하러 가기 →
              </button>
            </div>
          </div>
        </div>

        {/* Final Consistency Approval */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600">
            <strong>검수 현황:</strong> 3가지 테스트의 체크리스트를 점검하고, 본문 10장면 삽화 제작에 착수할 준비가 되었다면 승인하세요.
          </div>

          <button
            type="button"
            onClick={handleToggleFinalApproval}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              isApproved
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : isAllChecklistPassed
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isApproved ? '일관성 승인 완료 (수정하려면 클릭)' : '3종 테스트 완료 및 일관성 승인'}</span>
          </button>
        </div>
      </div>

      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
          imageUrl={modalImage.url}
          title={modalImage.title}
          onDelete={modalImage.assetId ? () => handleDeleteTestImage(modalImage.assetId!) : undefined}
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
          <span>캐릭터 바이블로</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition-all shadow-sm"
        >
          <span>스토리보드 시각 연출로</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
