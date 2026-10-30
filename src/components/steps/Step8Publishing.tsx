import React, { useState, useEffect } from 'react';
import {
  Printer,
  Download,
  BookOpen,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';
import { Project, Asset } from '../../types/storybook';
import { generatePictureBookPdf } from '../../services/pdfExport';
import { generateProjectZipBundle } from '../../services/zipExport';
import { getAssetFromIndexedDB, saveAssetToIndexedDB } from '../../services/storage';

interface Step8PublishingProps {
  project: Project;
  onUpdateProject: (updated: Partial<Project>) => void;
  onPrevStep: () => void;
  onSetDynamicPrompt: (title: string, text: string) => void;
}

export const Step8Publishing: React.FC<Step8PublishingProps> = ({
  project,
  onUpdateProject,
  onPrevStep,
  onSetDynamicPrompt
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0); // 0: 앞표지, 1~10: 본문, 11: 뒤표지
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number; msg: string } | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [allAssets, setAllAssets] = useState<Record<string, Asset>>({});

  useEffect(() => {
    async function loadAssets() {
      const map: Record<string, Asset> = {};
      // 표지 및 본문 에셋 로드
      if (project.coverFrontAssetId) {
        const a = await getAssetFromIndexedDB(project.coverFrontAssetId);
        if (a) map[project.coverFrontAssetId] = a;
      }
      for (const s of project.storyboards) {
        if (s.imageAssetId) {
          const a = await getAssetFromIndexedDB(s.imageAssetId);
          if (a) map[s.imageAssetId] = a;
        }
      }
      setAllAssets(map);
    }
    loadAssets();
  }, [project.storyboards, project.coverFrontAssetId]);

  useEffect(() => {
    onSetDynamicPrompt(
      '출판 검토 및 배포 체크리스트',
      `[AI 그림동화 공방 출판 체크리스트]
1. 인쇄 규격: ${project.format.podTrim} mm (도련 ${project.format.bleedMm}mm, 안전여백 ${project.format.safeMarginMm}mm)
2. 해상도: 300 DPI 기준 삽화 검수
3. 저작권: 상업적 이용 가능 여부 및 라이선스 확인
4. 텍스트: 5~7세 소리 내어 읽기 적합성 및 맞춤법
5. 연계 플랫폼: Canva, Book Creator, 부크크, 교보 POD, 아마존 KDP`
    );
  }, []);

  // PDF 내보내기 실행
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setPdfProgress({ current: 0, total: 12, msg: 'PDF 생성 시작...' });

    try {
      const pdfBlob = await generatePictureBookPdf(project, (current, total, msg) => {
        setPdfProgress({ current, total, msg });
      });

      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name || '동화'}_출판검토초안.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      onUpdateProject({
        approvals: {
          ...project.approvals,
          step8_publishReady: true
        }
      });
    } catch (e: any) {
      alert('PDF 생성 오류: ' + (e?.message || '알 수 없는 오류'));
    } finally {
      setIsExportingPdf(false);
      setPdfProgress(null);
    }
  };

  // ZIP 묶음 다운로드 실행
  const handleExportZip = async () => {
    setIsExportingZip(true);
    setZipProgress('자료 패키징 준비 중...');

    try {
      const zipBlob = await generateProjectZipBundle(project, (percent, msg) => {
        setZipProgress(`${msg} (${percent}%)`);
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name || '동화'}_전체패키지자료.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert('ZIP 압축 다운로드 실패: ' + (e?.message || '알 수 없는 오류'));
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  };

  const handleCopyCanvaScript = async () => {
    const text = project.storyboards.map(s => `[${s.sceneNumber}페이지]\n${s.text}\n`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Canva용 페이지별 원고가 복사되었습니다!');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch (e) {
      console.warn(e);
    }
  };

  // 표지 이미지 업로드 처리
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const assetId = 'asset_cover_' + Date.now().toString(36);
      const newAsset: Asset = {
        id: assetId,
        projectId: project.id,
        category: 'cover_front',
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        dataUrl,
        createdAt: new Date().toISOString()
      };

      await saveAssetToIndexedDB(newAsset);
      setAllAssets(prev => ({ ...prev, [assetId]: newAsset }));
      onUpdateProject({ coverFrontAssetId: assetId });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 mb-1">
          <Printer className="w-4 h-4" />
          <span>STEP 08. 출판 편집 및 산출물 내보내기</span>
        </div>
        <h1 className="text-xl font-bold text-stone-900 tracking-tight">
          완성 동화책 검토, PDF 초안 및 ZIP 패키지 다운로드
        </h1>
        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
          앞표지, 10장면 본문, 뒤표지를 한 권의 책으로 미리 넘겨보며 편집을 마무리합니다. 실제 작동하는 PDF 초안과 이미지/원고가 포함된 ZIP 번들을 내려받아 Canva, Book Creator, POD 인쇄소에 적용하세요.
        </p>
      </div>

      {/* Book Cover and Meta Quick Editor */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center justify-between">
          <span>1. 도서 표지 및 판권 메타데이터</span>
          <label className="text-xs text-purple-700 font-semibold cursor-pointer hover:underline">
            + 전용 앞표지 삽화 교체
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadCoverImage}
            />
          </label>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              확정 도서명
            </label>
            <input
              type="text"
              value={project.name}
              onChange={(e) => onUpdateProject({ name: e.target.value })}
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              표지 부제 (선택)
            </label>
            <input
              type="text"
              value={project.coverSubtitle || ''}
              onChange={(e) => onUpdateProject({ coverSubtitle: e.target.value })}
              placeholder="예: 어둠이 무서운 숲속 친구들을 위한 이야기"
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              지은이 / 그린이
            </label>
            <input
              type="text"
              value={project.authorName || ''}
              onChange={(e) => onUpdateProject({ authorName: e.target.value })}
              placeholder="예: 김동화 & AI 그림동화 공방"
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            뒤표지 소개글 (책 소개 및 추천사)
          </label>
          <textarea
            value={project.backCoverBlurb || ''}
            onChange={(e) => onUpdateProject({ backCoverBlurb: e.target.value })}
            rows={2}
            placeholder="책의 감동과 교육적 가치를 전하는 2~3줄의 뒤표지 문구..."
            className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-purple-400 text-stone-800"
          />
        </div>
      </div>

      {/* Interactive 12-Page Book Reader Flip Preview */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-stone-900">
              2. 동화책 전체 책장 넘겨보기 ({currentPage === 0 ? '앞표지' : currentPage === 11 ? '뒤표지' : `본문 ${currentPage}장면`})
            </h2>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-stone-800 px-2 min-w-[70px] text-center">
              {currentPage === 0 ? '표지' : currentPage === 11 ? '뒤표지' : `${currentPage} / 10`}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(11, p + 1))}
              disabled={currentPage === 11}
              className="p-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Container Styled like a Children's Picture Book Page */}
        <div className="bg-[#FAF8F5] p-6 sm:p-10 rounded-2xl border border-stone-300 flex items-center justify-center min-h-[440px] shadow-sm">
          {currentPage === 0 ? (
            /* Front Cover Page */
            <div className="max-w-md w-full bg-white p-8 rounded-xl border border-stone-200 shadow-md text-center space-y-4 aspect-square flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-purple-700 font-bold uppercase tracking-wider">
                  PICTURE BOOK FOR AGES {project.targetAge}
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-2">
                  {project.name || '제목 없는 동화'}
                </h3>
                {project.coverSubtitle && (
                  <p className="text-xs text-stone-500 mt-1">{project.coverSubtitle}</p>
                )}
              </div>

              {/* Cover Image */}
              <div className="flex-1 flex items-center justify-center my-2 overflow-hidden rounded-lg bg-stone-50 border border-stone-100">
                {(() => {
                  let coverImgUrl: string | undefined;
                  if (project.coverFrontAssetId && allAssets[project.coverFrontAssetId]) {
                    coverImgUrl = allAssets[project.coverFrontAssetId].dataUrl;
                  } else if (project.storyboards[0]?.imageAssetId && allAssets[project.storyboards[0].imageAssetId]) {
                    coverImgUrl = allAssets[project.storyboards[0].imageAssetId].dataUrl;
                  }

                  return coverImgUrl ? (
                    <img src={coverImgUrl} alt="표지" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-xs text-stone-400 p-6">
                      [표지 삽화 이미지 영역]
                    </div>
                  );
                })()}
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-800">
                  글·그림 {project.authorName || '작가'}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  AI 그림동화 공방 출판 검토본
                </p>
              </div>
            </div>
          ) : currentPage === 11 ? (
            /* Back Cover Page */
            <div className="max-w-md w-full bg-white p-8 rounded-xl border border-stone-200 shadow-md text-center space-y-6 aspect-square flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-stone-400">뒤표지</span>
                <h4 className="text-base font-bold text-stone-800 mt-3">
                  작은 온기가 만들어낸 눈부신 기적
                </h4>
                <p className="text-xs text-stone-600 mt-3 leading-relaxed px-4">
                  {project.backCoverBlurb || '서로의 온기를 모아 밤하늘의 길을 찾아가는 아름다운 여정.'}
                </p>
              </div>

              <div className="border-t border-stone-200 pt-4 text-[11px] text-stone-500 text-left space-y-1 bg-stone-50 p-3 rounded-lg">
                <div><strong>도서명:</strong> {project.name}</div>
                <div><strong>작가:</strong> {project.authorName}</div>
                <div><strong>판형:</strong> {project.format.podTrim} mm · 300 DPI</div>
                <div><strong>출판형태:</strong> 전자책 및 POD 자가출판 준비용</div>
              </div>
            </div>
          ) : (
            /* Manuscript Scenes 1 to 10 */
            (() => {
              const currentScene = project.storyboards[currentPage - 1];
              const sceneImg = currentScene?.imageAssetId ? allAssets[currentScene.imageAssetId] : null;

              return (
                <div className="max-w-md w-full bg-white p-6 rounded-xl border border-stone-200 shadow-md flex flex-col justify-between aspect-square">
                  {/* Top Image or Illustration Area */}
                  <div className="flex-1 rounded-lg overflow-hidden bg-stone-50 border border-stone-200 flex items-center justify-center">
                    {sceneImg ? (
                      <img src={sceneImg.dataUrl} alt={`장면 ${currentPage}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-1" />
                        <span className="text-xs text-stone-400">장면 {currentPage} 삽화 미등록</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Text Area */}
                  <div className="pt-4 text-center">
                    <p className="text-xs font-medium text-stone-900 leading-relaxed min-h-[40px]">
                      "{currentScene?.text || '본문 없음'}"
                    </p>
                    <span className="text-[10px] text-stone-400 mt-2 block">- {currentPage} -</span>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Real Export Actions */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-600" />
          3. 실제 파일 내보내기 및 다운로드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PDF Draft Export Card */}
          <div className="p-5 rounded-xl border border-purple-200 bg-purple-50/30 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-purple-900 font-bold text-sm mb-1">
                <Printer className="w-4 h-4 text-purple-700" />
                동화책 PDF 초안 내보내기 (jsPDF)
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                사용자가 지정한 판형 규격({project.format.podTrim}mm)과 여백을 적용하여 표지, 10장면, 뒤표지가 포함된 인쇄 검토용 PDF를 생성합니다.
              </p>
              <div className="text-[10px] text-stone-600 mt-2">
                * 인쇄 규격 적합성은 사전 검토용 초안이며, 정식 인쇄소 발주 전 1:1 출력을 권장합니다.
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? (pdfProgress?.msg || 'PDF 생성 중...') : 'PDF 초안 파일 다운로드'}</span>
            </button>
          </div>

          {/* ZIP Package Bundle Card */}
          <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm mb-1">
                <Package className="w-4 h-4 text-stone-700" />
                전체 프로젝트 산출물 ZIP 묶음 (JSZip)
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                모든 장면 이미지 원본, 원고 텍스트, 캐릭터 바이블, AI 프롬프트 모음집, Canva/Book Creator 연계 가이드가 정리된 ZIP 압축 파일을 내려받습니다.
              </p>
              <div className="text-[10px] text-stone-600 mt-2">
                * 별도 프로그램 없이 압축을 풀면 인쇄소나 디자인 툴로 즉시 이관 가능합니다.
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="w-full py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingZip ? (zipProgress || 'ZIP 압축 중...') : '전체 자료 ZIP 번들 다운로드'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* External Production Guides (Canva, Book Creator, POD Services) */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-stone-900 pb-2 border-b border-stone-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          4. 외부 서비스 수동 가져오기 및 출판 가이드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Canva Guide */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">
                Canva (캔바)에서 편집 및 디자인
              </span>
              <a
                href="https://www.canva.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-700 hover:underline flex items-center gap-0.5"
              >
                공식 사이트 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              ZIP 번들 속 이미지와 원고를 Canva의 맞춤형 페이지({project.format.podTrim}mm)에 업로드하고, 예쁜 한글 폰트(나눔손글씨, 프리텐다드 등)를 입혀 완성형 PDF로 인쇄할 수 있습니다.
            </p>
            <button
              type="button"
              onClick={handleCopyCanvaScript}
              className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg text-xs font-semibold text-stone-800 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Copy className="w-3 h-3 text-purple-600" />
              <span>{copyFeedback || 'Canva용 페이지별 원고 복사'}</span>
            </button>
          </div>

          {/* Book Creator Guide */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900">
                Book Creator (북 크리에이터) 오디오북
              </span>
              <a
                href="https://bookcreator.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-700 hover:underline flex items-center gap-0.5"
              >
                공식 사이트 <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Book Creator는 자동 연동을 지원하지 않으므로, 새 책을 생성한 후 [Square 1:1] 또는 [Landscape 4:3]을 선택하고 이미지를 수동 등록합니다. 아이의 낭독 목소리를 직접 녹음하여 멀티미디어 전자책으로 배포하세요.
            </p>
            <div className="text-[10px] text-stone-500">
              * 무료 계정으로도 최대 40권의 전자책을 무료 제작하여 링크 공유가 가능합니다.
            </div>
          </div>
        </div>

        {/* POD Self-Publishing Status & Checklist */}
        <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-2 text-xs text-amber-950">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            POD(주문형 인쇄) 자가출판 '제작 준비' 상태 규정 안내
          </div>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            본 웹앱의 PDF는 <strong>'교육용 출판 제작 준비(Pre-flight Draft)'</strong> 상태입니다. 부크크(Bookk), 교보문고 퍼플, 아마존 KDP 등 실제 인쇄 플랫폼에 접수하기 전에는 각 플랫폼의 도련선, 표지 책등(Spine) 두께 계산기, 본문 내지 CMYK 변환 사양을 재확인하고 1회 시험 인쇄(Proof Copy)를 진행하시기 바랍니다.
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
          <span>장면별 삽화 관리로</span>
        </button>

        <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>8단계 워크숍 전 과정 완성</span>
        </div>
      </div>
    </div>
  );
};
