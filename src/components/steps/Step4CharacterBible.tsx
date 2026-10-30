import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Copy,
  Check,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Star,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Project, Character, Asset } from '../../types/storybook';
import { buildCharacterMasterPrompt, buildCharacterSheetPrompt } from '../../services/promptEngine';
import { saveAssetToIndexedDB, getAssetFromIndexedDB, deleteAssetFromIndexedDB } from '../../services/storage';
import { ImageModal } from '../ImageModal';

interface Step4CharacterBibleProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
}

export const Step4CharacterBible: React.FC<Step4CharacterBibleProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
  onSetDynamicPrompt
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    project.characters[0]?.id || ''
  );
  const [activeSheetTab, setActiveSheetTab] = useState<'master' | 'turnaround' | 'expressions' | 'poses' | 'details'>('master');
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  const [loadedAssets, setLoadedAssets] = useState<Record<string, Asset>>({});
  const [modalImage, setModalImage] = useState<{ url: string; title: string; assetId?: string } | null>(null);

  const selectedCharacter = project.characters.find(c => c.id === selectedCharId) || project.characters[0];

  // 에셋 로딩
  useEffect(() => {
    async function loadAssets() {
      if (!selectedCharacter) return;
      const map: Record<string, Asset> = {};
      for (const id of selectedCharacter.referenceAssetIds || []) {
        const asset = await getAssetFromIndexedDB(id);
        if (asset) map[id] = asset;
      }
      setLoadedAssets(map);
    }
    loadAssets();
  }, [selectedCharId, selectedCharacter?.referenceAssetIds]);

  // 프롬프트 생성 및 패널 동기화
  useEffect(() => {
    if (!selectedCharacter) return;

    if (activeSheetTab === 'master') {
      const p = buildCharacterMasterPrompt(project, selectedCharacter);
      onSetDynamicPrompt(`캐릭터 마스터 프롬프트 (${selectedCharacter.name})`, p);
    } else {
      const p = buildCharacterSheetPrompt(project, selectedCharacter, activeSheetTab);
      const tabNames = {
        turnaround: '4방향 턴어라운드 모델 시트',
        expressions: '6종 표정 그리드 시트',
        poses: '6종 동작 포즈 시트',
        details: '의상 및 핵심 소품 디테일 시트'
      };
      onSetDynamicPrompt(`${tabNames[activeSheetTab]} (${selectedCharacter.name})`, p);
    }
  }, [selectedCharId, activeSheetTab, selectedCharacter, project.styleId]);

  const handleAddCharacter = () => {
    const newId = 'char_' + Date.now().toString(36);
    const newChar: Character = {
      id: newId,
      name: '새 캐릭터',
      role: '조연',
      species: '동물 친구',
      personality: '온화하고 상냥한 성격',
      ageAppearance: '5세 어린이 인상',
      shape: '둥글고 부드러운 타원형 실루엣',
      proportions: '2.5등신 귀여운 비율',
      face: '발그레한 볼과 웃는 입',
      eyes: '초롱초롱한 맑은 눈',
      ears: '둥근 귀',
      hairOrFur: '보드라운 털',
      palette: ['#FFB703', '#FB8500', '#023047'],
      clothes: '단정한 멜빵바지',
      accessories: '작은 목걸이',
      immutableTraits: '눈 색상, 의상 기본 형태, 귀 모양, 2.5등신 비율',
      variableTraits: '표정, 손짓, 서 있는 자세',
      masterPrompt: '',
      referenceAssetIds: [],
      approved: false
    };

    onUpdateProject({
      characters: [...project.characters, newChar]
    });
    setSelectedCharId(newId);
  };

  const handleUpdateCurrentChar = (field: keyof Character, value: any) => {
    if (!selectedCharacter) return;
    const updatedChars = project.characters.map(c => {
      if (c.id === selectedCharacter.id) {
        return {
          ...c,
          [field]: value
        };
      }
      return c;
    });
    onUpdateProject({ characters: updatedChars });
  };

  const handleDeleteCurrentChar = (id: string) => {
    if (project.characters.length <= 1) {
      alert('동화책에 최소 1명의 캐릭터가 존재해야 합니다.');
      return;
    }
    if (confirm('이 캐릭터를 삭제하시겠습니까?')) {
      const remaining = project.characters.filter(c => c.id !== id);
      onUpdateProject({ characters: remaining });
      setSelectedCharId(remaining[0].id);
    }
  };

  // 이미지 업로드 (IndexedDB)
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCharacter) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. 15MB 이하의 이미지를 업로드해 주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const assetId = 'asset_char_' + Date.now().toString(36);
      const newAsset: Asset = {
        id: assetId,
        projectId: project.id,
        category: 'character_ref',
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl,
        characterId: selectedCharacter.id,
        createdAt: new Date().toISOString()
      };

      try {
        await saveAssetToIndexedDB(newAsset);
        setLoadedAssets(prev => ({ ...prev, [assetId]: newAsset }));

        const newRefIds = [...(selectedCharacter.referenceAssetIds || []), assetId];
        handleUpdateCurrentChar('referenceAssetIds', newRefIds);

        // 첫 번째 이미지인 경우 대표 이미지로 자동 지정
        if (!selectedCharacter.keyReferenceAssetId) {
          handleUpdateCurrentChar('keyReferenceAssetId', assetId);
        }
      } catch (err: any) {
        alert('이미지 저장 실패: ' + (err?.message || 'IndexedDB 용량 부족'));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!selectedCharacter) return;
    await deleteAssetFromIndexedDB(assetId);
    const updated = (selectedCharacter.referenceAssetIds || []).filter(id => id !== assetId);
    const newKeyId = selectedCharacter.keyReferenceAssetId === assetId ? updated[0] || undefined : selectedCharacter.keyReferenceAssetId;

    handleUpdateCurrentChar('referenceAssetIds', updated);
    handleUpdateCurrentChar('keyReferenceAssetId', newKeyId);

    setLoadedAssets(prev => {
      const copy = { ...prev };
      delete copy[assetId];
      return copy;
    });
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice(`${label} 복사 완료!`);
      setTimeout(() => setCopyNotice(null), 2000);
    } catch (e) {
      console.warn(e);
    }
  };

  // 캐릭터 승인 가능 여부 체크
  const hasMinTraits = Boolean(selectedCharacter && selectedCharacter.name && selectedCharacter.species && selectedCharacter.clothes);
  const hasImage = Boolean(selectedCharacter && (selectedCharacter.referenceAssetIds?.length || 0) > 0 && !!selectedCharacter.keyReferenceAssetId);
  const isApproved = !!selectedCharacter?.approved;

  const handleToggleApprove = () => {
    if (!selectedCharacter) return;
    handleUpdateCurrentChar('approved', !isApproved);
  };

  const currentPrompt = selectedCharacter
    ? activeSheetTab === 'master'
      ? buildCharacterMasterPrompt(project, selectedCharacter)
      : buildCharacterSheetPrompt(project, selectedCharacter, activeSheetTab)
    : '';

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <Users className="w-4 h-4" />
          <span>STEP 04. 캐릭터 바이블 및 모델 시트</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          인물 속성 분리 및 캐릭터 시트 생성
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          장면이 바뀌어도 주인공이 엉뚱한 모습으로 바뀌지 않도록 [절대 고정 속성]과 [장면별 가변 속성]을 엄격히 규정합니다. 외부 AI에서 생성한 턴어라운드/표정 시트를 업로드하여 기준 이미지로 확정하세요.
        </p>
      </div>

      {/* Character Selector & Add Bar */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {project.characters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedCharId(char.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCharId === char.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span>{char.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                selectedCharId === char.id ? 'bg-purple-700 text-white' : 'bg-stone-100 text-stone-500'
              }`}>
                {char.role}
              </span>
              {char.approved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddCharacter}
          className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>새 캐릭터 추가</span>
        </button>
      </div>

      {selectedCharacter && (
        <>
          {/* Character Details & Trait Separation Form */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-stone-900">
                  1. [{selectedCharacter.name}] 외형 바이블 작성
                </h2>
                <span className="text-xs text-stone-500 font-mono">
                  ID: {selectedCharacter.id}
                </span>
              </div>

              {project.characters.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteCurrentChar(selectedCharacter.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  삭제
                </button>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  이름 (영문 병기 권장)
                </label>
                <input
                  type="text"
                  value={selectedCharacter.name}
                  onChange={(e) => handleUpdateCurrentChar('name', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  역할
                </label>
                <select
                  value={selectedCharacter.role}
                  onChange={(e) => handleUpdateCurrentChar('role', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none bg-white"
                >
                  <option value="주인공">주인공</option>
                  <option value="조연">조연</option>
                  <option value="조력자">조력자</option>
                  <option value="멘토">멘토</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  종 (동물/사람/환상종)
                </label>
                <input
                  type="text"
                  value={selectedCharacter.species}
                  onChange={(e) => handleUpdateCurrentChar('species', e.target.value)}
                  placeholder="예: 붉은 아기 여우"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Proportion and Silhouette */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  등신 비율 (5~7세용 기본 2~2.5등신)
                </label>
                <input
                  type="text"
                  value={selectedCharacter.proportions}
                  onChange={(e) => handleUpdateCurrentChar('proportions', e.target.value)}
                  placeholder="예: 2.5등신의 아담하고 통통한 비율"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  얼굴형 & 실루엣
                </label>
                <input
                  type="text"
                  value={selectedCharacter.shape}
                  onChange={(e) => handleUpdateCurrentChar('shape', e.target.value)}
                  placeholder="예: 찹쌀떡 같은 둥근 타원형"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  눈 & 표정 특징
                </label>
                <input
                  type="text"
                  value={selectedCharacter.eyes}
                  onChange={(e) => handleUpdateCurrentChar('eyes', e.target.value)}
                  placeholder="예: 맑은 호박색 큰 눈망울"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Fur, Clothes, Props */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  헤어 / 털 질감
                </label>
                <input
                  type="text"
                  value={selectedCharacter.hairOrFur}
                  onChange={(e) => handleUpdateCurrentChar('hairOrFur', e.target.value)}
                  placeholder="예: 살구빛 주황색 부드러운 털"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  기본 의상 (형태와 색상)
                </label>
                <input
                  type="text"
                  value={selectedCharacter.clothes}
                  onChange={(e) => handleUpdateCurrentChar('clothes', e.target.value)}
                  placeholder="예: 별 자수가 수놓아진 남색 멜빵바지"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  대표 소품 및 악세서리
                </label>
                <input
                  type="text"
                  value={selectedCharacter.accessories}
                  onChange={(e) => handleUpdateCurrentChar('accessories', e.target.value)}
                  placeholder="예: 별빛 유리병 목걸이, 작은 가죽 가방"
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Trait Separation Box (Crucial for AI consistency) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-200">
              <div>
                <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5 mb-1">
                  <Star className="w-3.5 h-3.5 text-purple-700" />
                  [절대 고정 속성 (Immutable Traits)]
                </label>
                <p className="text-[10px] text-purple-800 mb-1.5">
                  어떤 장면에서도 바뀌면 안 되는 불변의 시각 요소 (털 색, 귀 모양, 멜빵바지, 눈동자 색)
                </p>
                <textarea
                  value={selectedCharacter.immutableTraits}
                  onChange={(e) => handleUpdateCurrentChar('immutableTraits', e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs border border-purple-200 rounded-lg bg-white focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                  [장면별 가변 속성 (Variable Traits)]
                </label>
                <p className="text-[10px] text-stone-600 mb-1.5">
                  장면의 감정과 행동에 따라 자연스럽게 변화해도 좋은 요소 (표정, 손짓, 가방 착용 여부)
                </p>
                <textarea
                  value={selectedCharacter.variableTraits}
                  onChange={(e) => handleUpdateCurrentChar('variableTraits', e.target.value)}
                  rows={2}
                  className="w-full p-2.5 text-xs border border-stone-200 rounded-lg bg-white focus:ring-1 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4 Types of Character Sheet Prompts */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="text-sm font-bold text-stone-900">
                2. 캐릭터 시트 생성 프롬프트 4종
              </h2>
              {copyNotice && (
                <span className="text-xs text-emerald-800 font-medium">
                  {copyNotice}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-stone-200 pb-2">
              {[
                { id: 'master', label: '마스터 콘셉트 시트' },
                { id: 'turnaround', label: '턴어라운드 (4방향)' },
                { id: 'expressions', label: '표정 그리드 (6종)' },
                { id: 'poses', label: '동작 포즈 (6종)' },
                { id: 'details', label: '의상·소품 디테일' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSheetTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeSheetTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Prompt preview */}
            <div className="relative">
              <textarea
                value={currentPrompt}
                readOnly
                rows={5}
                className="w-full p-3 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none leading-relaxed"
              />
              <button
                type="button"
                onClick={() => handleCopyText(currentPrompt, '선택된 시트 프롬프트')}
                className="absolute top-2 right-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-colors"
              >
                <Copy className="w-3 h-3" />
                복사
              </button>
            </div>
          </div>

          {/* Character Asset Upload & Key Reference Selection */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-600" />
                  3. 생성 이미지 업로드 및 기준 이미지 지정
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  외부 AI에서 위 프롬프트로 생성한 이미지를 업로드하고, 가장 캐릭터 일관성이 뛰어난 1장을 [기준 이미지]로 지정하세요.
                </p>
              </div>

              <label className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                <Plus className="w-3.5 h-3.5" />
                이미지 파일 추가
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleUploadImage}
                />
              </label>
            </div>

            {/* Reference Images Gallery */}
            {(selectedCharacter.referenceAssetIds?.length || 0) === 0 ? (
              <div className="p-8 border-2 border-dashed border-stone-200 rounded-xl text-center space-y-2">
                <Users className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs font-semibold text-stone-600">
                  아직 등록된 캐릭터 이미지가 없습니다.
                </p>
                <p className="text-[11px] text-stone-600 max-w-md mx-auto">
                  외부 AI 도구(Midjourney, DALL-E, Recraft 등)에서 생성한 캐릭터 시트를 위 [이미지 파일 추가] 버튼을 눌러 등록해 주세요.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {selectedCharacter.referenceAssetIds.map(assetId => {
                  const asset = loadedAssets[assetId];
                  const isKey = selectedCharacter.keyReferenceAssetId === assetId;
                  if (!asset) return null;

                  return (
                    <div
                      key={assetId}
                      className={`relative group rounded-xl overflow-hidden border transition-all ${
                        isKey ? 'border-purple-500 ring-2 ring-purple-300 shadow-md' : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <img
                        src={asset.dataUrl}
                        alt="캐릭터 참조"
                        className="w-full h-36 object-cover bg-stone-100"
                      />

                      {/* Key Reference Badge */}
                      {isKey && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          기준 이미지
                        </div>
                      )}

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalImage({ url: asset.dataUrl, title: `${selectedCharacter.name} 참조 이미지`, assetId })}
                            className="p-1 bg-white/90 hover:bg-white text-stone-800 rounded shadow-xs"
                            title="확대 보기"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAsset(assetId)}
                            className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded shadow-xs"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {!isKey && (
                          <button
                            type="button"
                            onClick={() => handleUpdateCurrentChar('keyReferenceAssetId', assetId)}
                            className="w-full py-1 text-[11px] font-bold bg-white text-stone-900 rounded hover:bg-purple-50 hover:text-purple-700 transition-colors shadow-xs"
                          >
                            기준 이미지로 지정
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Human Verification Checklist & Approval */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-800">
                  창작자 직접 검수 체크리스트
                </h3>
                <span className="text-[11px] text-stone-500">
                  * AI 자동 보증이 아닌 작가 본인의 육안 검수입니다.
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMinTraits}
                    readOnly
                    className="rounded text-purple-600 focus:ring-0"
                  />
                  <span>외형 바이블 작성 완료 (이름, 종, 의상, 고정 속성)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasImage}
                    readOnly
                    className="rounded text-purple-600 focus:ring-0"
                  />
                  <span>참조 이미지 1장 이상 등록 및 대표 [기준 이미지] 지정</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleToggleApprove}
                  disabled={!hasMinTraits || !hasImage}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isApproved
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : hasMinTraits && hasImage
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isApproved ? '캐릭터 승인 완료 (클릭하여 취소)' : '이 캐릭터 승인하기'}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Full-view Modal */}
      {modalImage && (
        <ImageModal
          isOpen={!!modalImage}
          onClose={() => setModalImage(null)}
          imageUrl={modalImage.url}
          title={modalImage.title}
          onDelete={modalImage.assetId ? () => handleDeleteAsset(modalImage.assetId!) : undefined}
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
          <span>스타일·판형으로</span>
        </button>

        <button
          type="button"
          onClick={onNextStep}
          disabled={!project.characters.some(c => c.approved)}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            project.characters.some(c => c.approved)
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
          title={!project.characters.some(c => c.approved) ? '최소 1명의 캐릭터를 승인해야 다음 단계로 갈 수 있습니다.' : ''}
        >
          <span>일관성 테스트로 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
