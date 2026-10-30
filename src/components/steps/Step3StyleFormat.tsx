import React, { useState } from 'react';
import { Palette, Check, ArrowRight, ArrowLeft, Printer, Tablet, ShieldCheck, CheckCircle2, Sliders } from 'lucide-react';
import { Project, AspectRatioType, PodTrimType, StyleGuide } from '../../types/storybook';
import { ART_STYLES } from '../../data/seedData';
import { StyleSvgPreview } from '../StyleSvgPreview';

interface Step3StyleFormatProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
}

export const Step3StyleFormat: React.FC<Step3StyleFormatProps> = ({
  project,
  onUpdateProject,
  onNextStep,
  onPrevStep,
  onSetDynamicPrompt
}) => {
  const selectedStyle = ART_STYLES.find(s => s.id === project.styleId) || ART_STYLES[0];

  React.useEffect(() => {
    onSetDynamicPrompt(
      `그림 스타일 가이드: ${selectedStyle.name}`,
      `[선택된 스타일 가이드 요약]
- 스타일명: ${selectedStyle.name} (${selectedStyle.englishName})
- 색채 감성: ${selectedStyle.colorMood}
- 윤곽선 처리: ${selectedStyle.guide.linework}
- 표면 질감: ${selectedStyle.guide.texture}
- 조명 설정: ${selectedStyle.guide.lighting}
- 배경 묘사: ${selectedStyle.guide.backgroundDetail}
- 제외 요소 (Negative): ${selectedStyle.guide.negativeElements.join(', ')}
- 영어 핵심 키워드: ${selectedStyle.guide.artKeywordsEnglish}`
    );
  }, [project.styleId]);

  const handleSelectStyle = (styleId: string) => {
    const styleObj = ART_STYLES.find(s => s.id === styleId);
    if (!styleObj) return;

    onUpdateProject({
      styleId,
      styleGuide: styleObj.guide,
      approvals: {
        ...project.approvals,
        step3_styleApproved: true
      }
    });
  };

  const handleUpdateFormat = (field: string, value: any) => {
    onUpdateProject({
      format: {
        ...project.format,
        [field]: value
      }
    });
  };

  const handleConfirmStyleAndFormat = () => {
    onUpdateProject({
      approvals: {
        ...project.approvals,
        step3_styleApproved: true
      }
    });
  };

  const isConfirmed = !!project.approvals?.step3_styleApproved;

  // 인쇄 규격 수치 계산
  let trimW = 200;
  let trimH = 200;
  if (project.format.podTrim === '254x190') {
    trimW = 254;
    trimH = 190;
  } else if (project.format.podTrim === '210x297') {
    trimW = 210;
    trimH = 297;
  } else if (project.format.podTrim === '148x210') {
    trimW = 148;
    trimH = 210;
  } else if (project.format.customWidthMm && project.format.customHeightMm) {
    trimW = project.format.customWidthMm;
    trimH = project.format.customHeightMm;
  }

  const bleedW = trimW + project.format.bleedMm * 2;
  const bleedH = trimH + project.format.bleedMm * 2;
  const safeW = trimW - project.format.safeMarginMm * 2;
  const safeH = trimH - project.format.safeMarginMm * 2;

  // 300 DPI 픽셀 계산
  const pxWidth = Math.round((bleedW / 25.4) * 300);
  const pxHeight = Math.round((bleedH / 25.4) * 300);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <Palette className="w-4 h-4" />
          <span>STEP 03. 비주얼 언어 및 물리적 판형</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          그림책 시각 스타일 8종 및 판형 규격 확정
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          동화책의 정서와 장르에 가장 어울리는 그림 스타일을 선택하고, 전자책 화면 비율과 POD(주문형 인쇄) 판형 규격을 설정합니다. 확정된 스타일 규칙은 이후 모든 캐릭터와 삽화 프롬프트에 자동으로 결합됩니다.
        </p>
      </div>

      {/* 8 Art Styles Grid */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              1. 그림 스타일 8종 탐색 및 선택
            </h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              각 카드의 도해는 스타일 고유의 색감과 기법 특성을 나타내는 순수 벡터 그래픽입니다.
            </p>
          </div>
          {isConfirmed && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              스타일 확정됨
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ART_STYLES.map((style) => {
            const isSelected = project.styleId === style.id;
            return (
              <div
                key={style.id}
                onClick={() => handleSelectStyle(style.id)}
                className={`flex flex-col rounded-xl border overflow-hidden cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 ring-2 ring-purple-300 shadow-md bg-purple-50/20'
                    : 'border-stone-200 hover:border-stone-300 bg-white hover:shadow-xs'
                }`}
              >
                {/* SVG Style Preview */}
                <div className="relative border-b border-stone-100 bg-stone-50">
                  <StyleSvgPreview styleId={style.id} className="w-full h-28" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1 shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Style Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-stone-900">
                        {style.name}
                      </h3>
                      <span className="text-[10px] text-stone-600 font-mono">
                        {style.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      {style.tagline}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-stone-600">
                    <div>
                      <span className="font-semibold text-stone-700">추천 장르: </span>
                      <span>{style.recommendedGenre.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700">색조: </span>
                      <span className="line-clamp-1">{style.colorMood}</span>
                    </div>
                  </div>

                  {/* Color Palette Swatches */}
                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-stone-600 block mb-1">
                      대표 팔레트
                    </span>
                    <div className="flex gap-1">
                      {style.guide.palette.map((hex, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-md border border-black/10 shrink-0"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Caution Badge */}
                  <div className="pt-1 border-t border-stone-100 text-[10px] text-stone-600 leading-tight">
                    <span className="font-semibold">⚠️ 생성 주의:</span> {style.cautions[0]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Style Deep-Dive Inspection Box */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              선택된 [{selectedStyle.name}] 스타일가이드 명세서 (후속 프롬프트 자동 삽입)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-stone-700">
            <div className="p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">선 처리 (Linework)</span>
              <p className="text-[11px] text-stone-600">{selectedStyle.guide.linework}</p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">질감 (Texture)</span>
              <p className="text-[11px] text-stone-600">{selectedStyle.guide.texture}</p>
            </div>
            <div className="p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="font-bold text-stone-900 block mb-1">조명 & 배경</span>
              <p className="text-[11px] text-stone-600">{selectedStyle.guide.lighting}</p>
            </div>
          </div>

          <div className="p-2.5 bg-white rounded-lg border border-stone-200 text-xs">
            <span className="font-bold text-rose-800 block mb-1">
              금지 요소 (Negative Keywords)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedStyle.guide.negativeElements.map((neg, i) => (
                <span key={i} className="px-2 py-0.5 text-[10px] bg-rose-50 text-rose-700 rounded border border-rose-100">
                  no {neg}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Format & POD Spec Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2 pb-2 border-b border-stone-100">
          <Printer className="w-4 h-4 text-purple-600" />
          2. 전자책 화면비 및 POD 종이책 판형 설정
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* eBook Aspect Ratio */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Tablet className="w-3.5 h-3.5 text-purple-600" />
              전자책(eBook) 및 AI 이미지 화면비 (Aspect Ratio)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '1:1', label: '1:1 정방형', sub: '그림책 베스트셀러 표준' },
                { id: '4:3', label: '4:3 가로형', sub: '아이패드/태블릿 화면 맞춤' },
                { id: '3:2', label: '3:2 와이드', sub: 'A4/B5 영화적 화면비' }
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => handleUpdateFormat('eBookRatio', ratio.id)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    project.format.eBookRatio === ratio.id
                      ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300'
                      : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs font-bold text-stone-900">{ratio.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{ratio.sub}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              * 선택한 비율은 프롬프트의 <code className="text-purple-700 font-mono">--ar {project.format.eBookRatio}</code> 파라미터로 자동 반영됩니다.
            </p>
          </div>

          {/* POD Physical Trim Size */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5 text-purple-600" />
              POD 자가출판 목표 판형 (mm)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: '200x200', label: '200 × 200 mm', platform: '부크크/교보 정방형' },
                { id: '254x190', label: '254 × 190 mm', platform: '와이드 아동 양장본' },
                { id: '210x297', label: '210 × 297 mm', platform: 'A4 대형 판형' },
                { id: '148x210', label: '148 × 210 mm', platform: 'A5 콤팩트 북' }
              ].map((pod) => (
                <button
                  key={pod.id}
                  type="button"
                  onClick={() => handleUpdateFormat('podTrim', pod.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    project.format.podTrim === pod.id
                      ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300'
                      : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs font-bold text-stone-900">{pod.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5">{pod.platform}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500">
              * POD 인쇄 시 각 인쇄소(부크크, 교보, 아마존) 규격에 따라 재확인이 필요합니다.
            </p>
          </div>
        </div>

        {/* POD Print Safety Box Calculator */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              POD 인쇄 규격 안전 계산기 (300 DPI 기준)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
              <span className="text-[11px] text-stone-500 block">최종 재단 크기</span>
              <span className="font-bold text-stone-900 text-sm">{trimW} × {trimH} mm</span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
              <span className="text-[11px] text-stone-500 block">도련 포함 인쇄 크기 (+{project.format.bleedMm}mm)</span>
              <span className="font-bold text-stone-900 text-sm">{bleedW} × {bleedH} mm</span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
              <span className="text-[11px] text-stone-500 block">안전 여백 박스 (-{project.format.safeMarginMm}mm)</span>
              <span className="font-bold text-stone-900 text-sm">{safeW} × {safeH} mm</span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-emerald-100">
              <span className="text-[11px] text-stone-500 block">권장 픽셀 해상도 (300 DPI)</span>
              <span className="font-bold text-purple-700 text-sm">{pxWidth} × {pxHeight} px</span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-950/80 leading-relaxed">
            💡 <strong>인쇄소 납품 전 체크:</strong> 글자나 주요 인물의 얼굴이 안전 여백(외곽에서 5mm 이상 안쪽)을 벗어나지 않도록 스토리보드와 편집 단계에서 텍스트 여백을 철저히 배려해야 합니다.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={onPrevStep}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>원고 개발로</span>
        </button>

        <button
          type="button"
          onClick={() => {
            handleConfirmStyleAndFormat();
            onNextStep();
          }}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition-all shadow-sm"
        >
          <span>캐릭터 바이블 설계로</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
