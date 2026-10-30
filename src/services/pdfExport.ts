import { jsPDF } from 'jspdf';
import { Project, Storyboard } from '../types/storybook';
import { getAssetFromIndexedDB } from './storage';

/**
 * PDF 초안 내보내기 서비스
 * 브라우저 캔버스를 활용하여 한글 서체(Pretendard), 이미지, 도련/안전마진을 왜곡 없이 렌더링
 */
export async function generatePictureBookPdf(
  project: Project,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  // 규격 결정 (mm)
  let widthMm = 200;
  let heightMm = 200;

  if (project.format.podTrim === '254x190') {
    widthMm = 254;
    heightMm = 190;
  } else if (project.format.podTrim === '210x297') {
    widthMm = 210;
    heightMm = 297;
  } else if (project.format.podTrim === '148x210') {
    widthMm = 148;
    heightMm = 210;
  } else if (project.format.customWidthMm && project.format.customHeightMm) {
    widthMm = project.format.customWidthMm;
    heightMm = project.format.customHeightMm;
  }

  const orientation = widthMm > heightMm ? 'landscape' : 'portrait';
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm, heightMm]
  });

  const totalPages = 12; // 표지(1) + 10장면 + 뒤표지(1)

  // 캔버스 크기 계산 (고화질 300 DPI에 근접하도록 scale 설정)
  const scale = 3; // 1mm 당 약 3px (~76 DPI 화면 배율 고려 시 고해상도)
  const canvasWidth = Math.round(widthMm * scale);
  const canvasHeight = Math.round(heightMm * scale);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('캔버스 그래픽 컨텍스트를 생성할 수 없습니다.');
  }

  // 헬퍼: 텍스트 줄바꿈 렌더링
  const renderWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    align: 'left' | 'center' | 'right' = 'center'
  ) => {
    ctx.textAlign = align;
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  // 헬퍼: 이미지 비동기 로드
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = src;
    });
  };

  // 1. 앞표지 렌더링
  onProgress?.(1, totalPages, '앞표지 생성 중...');
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 표지 장식 테두리
  ctx.strokeStyle = '#E8E2D8';
  ctx.lineWidth = 3;
  ctx.strokeRect(canvasWidth * 0.05, canvasHeight * 0.05, canvasWidth * 0.9, canvasHeight * 0.9);

  // 표지 이미지 로드 시도
  let coverAssetDataUrl: string | null = null;
  if (project.coverFrontAssetId) {
    const asset = await getAssetFromIndexedDB(project.coverFrontAssetId);
    if (asset?.dataUrl) coverAssetDataUrl = asset.dataUrl;
  }
  // 표지 이미지가 없으면 1번 장면 이미지나 8번 절정 장면 이미지 활용
  if (!coverAssetDataUrl && project.storyboards[0]?.imageAssetId) {
    const asset = await getAssetFromIndexedDB(project.storyboards[0].imageAssetId);
    if (asset?.dataUrl) coverAssetDataUrl = asset.dataUrl;
  }

  if (coverAssetDataUrl) {
    try {
      const coverImg = await loadImage(coverAssetDataUrl);
      const imgW = canvasWidth * 0.76;
      const imgH = canvasHeight * 0.48;
      const imgX = (canvasWidth - imgW) / 2;
      const imgY = canvasHeight * 0.28;
      ctx.drawImage(coverImg, imgX, imgY, imgW, imgH);
      ctx.strokeStyle = '#D4CEBF';
      ctx.lineWidth = 1;
      ctx.strokeRect(imgX, imgY, imgW, imgH);
    } catch (e) {
      console.warn('표지 이미지 렌더 실패:', e);
    }
  } else {
    // 이미지 미등록 시 감성적인 도해 일러스트 박스
    const boxW = canvasWidth * 0.76;
    const boxH = canvasHeight * 0.45;
    const boxX = (canvasWidth - boxW) / 2;
    const boxY = canvasHeight * 0.28;
    ctx.fillStyle = '#F4EFE6';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#8B5CF6';
    ctx.font = `600 ${Math.round(canvasWidth * 0.035)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✨ AI 그림동화 공방 출판 초안', canvasWidth / 2, boxY + boxH * 0.45);
    ctx.fillStyle = '#78716C';
    ctx.font = `400 ${Math.round(canvasWidth * 0.024)}px sans-serif`;
    ctx.fillText('[표지 삽화 등록 영역]', canvasWidth / 2, boxY + boxH * 0.6);
  }

  // 표지 텍스트
  ctx.fillStyle = '#292524';
  ctx.font = `bold ${Math.round(canvasWidth * 0.058)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(project.name || '제목 없는 동화', canvasWidth / 2, canvasHeight * 0.16);

  if (project.coverSubtitle) {
    ctx.fillStyle = '#78716C';
    ctx.font = `400 ${Math.round(canvasWidth * 0.026)}px sans-serif`;
    ctx.fillText(project.coverSubtitle, canvasWidth / 2, canvasHeight * 0.22);
  }

  // 표지 작가명
  ctx.fillStyle = '#44403C';
  ctx.font = `500 ${Math.round(canvasWidth * 0.032)}px sans-serif`;
  ctx.fillText(`글·그림  ${project.authorName || '작가'}`, canvasWidth / 2, canvasHeight * 0.88);

  ctx.fillStyle = '#A8A29E';
  ctx.font = `400 ${Math.round(canvasWidth * 0.02)}px sans-serif`;
  ctx.fillText('AI 그림동화 공방 교육 워크숍 초안본', canvasWidth / 2, canvasHeight * 0.93);

  // PDF 1페이지에 표지 추가
  doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, widthMm, heightMm);

  // 2. 본문 10장면 렌더링
  for (let i = 0; i < 10; i++) {
    const sceneNum = i + 1;
    onProgress?.(sceneNum + 1, totalPages, `본문 ${sceneNum}장면 생성 중...`);
    doc.addPage([widthMm, heightMm], orientation);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const storyboard: Storyboard | undefined = project.storyboards[i];
    const sceneText = storyboard?.text || `${sceneNum}번 장면 원고가 아직 작성되지 않았습니다.`;

    // 이미지 로드
    let sceneAssetDataUrl: string | null = null;
    if (storyboard?.imageAssetId) {
      const asset = await getAssetFromIndexedDB(storyboard.imageAssetId);
      if (asset?.dataUrl) sceneAssetDataUrl = asset.dataUrl;
    }

    const marginX = canvasWidth * 0.08;
    const contentW = canvasWidth * 0.84;

    if (sceneAssetDataUrl) {
      try {
        const sceneImg = await loadImage(sceneAssetDataUrl);
        const imgH = canvasHeight * 0.62;
        const imgY = canvasHeight * 0.08;
        ctx.drawImage(sceneImg, marginX, imgY, contentW, imgH);
        ctx.strokeStyle = '#E7E5E4';
        ctx.lineWidth = 1;
        ctx.strokeRect(marginX, imgY, contentW, imgH);
      } catch (e) {
        console.warn(`장면 ${sceneNum} 이미지 로드 실패:`, e);
      }
    } else {
      // 이미지 미등록 시 가이드 프레임
      const imgH = canvasHeight * 0.58;
      const imgY = canvasHeight * 0.08;
      ctx.fillStyle = '#FBF9F5';
      ctx.fillRect(marginX, imgY, contentW, imgH);
      ctx.strokeStyle = '#E8E2D8';
      ctx.lineWidth = 1;
      ctx.strokeRect(marginX, imgY, contentW, imgH);

      ctx.fillStyle = '#A8A29E';
      ctx.font = `500 ${Math.round(canvasWidth * 0.028)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`장면 ${sceneNum} 삽화 등록 대기`, canvasWidth / 2, imgY + imgH * 0.45);
      ctx.font = `400 ${Math.round(canvasWidth * 0.02)}px sans-serif`;
      ctx.fillText(`[${storyboard?.narrativePurpose || '스토리보드 시각 연출'}]`, canvasWidth / 2, imgY + imgH * 0.58);
    }

    // 본문 원고 텍스트 (하단 배치, 5~7세용 넉넉한 자간과 행간)
    ctx.fillStyle = '#1C1917';
    ctx.font = `500 ${Math.round(canvasWidth * 0.034)}px sans-serif`;
    const textStartY = canvasHeight * 0.76;
    renderWrappedText(sceneText, canvasWidth / 2, textStartY, contentW * 0.92, Math.round(canvasWidth * 0.052), 'center');

    // 페이지 번호
    ctx.fillStyle = '#A8A29E';
    ctx.font = `400 ${Math.round(canvasWidth * 0.022)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`- ${sceneNum} -`, canvasWidth / 2, canvasHeight * 0.95);

    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, widthMm, heightMm);
  }

  // 3. 뒤표지 렌더링
  onProgress?.(totalPages, totalPages, '뒤표지 및 판권지 생성 중...');
  doc.addPage([widthMm, heightMm], orientation);

  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 뒤표지 테두리
  ctx.strokeStyle = '#E8E2D8';
  ctx.lineWidth = 2;
  ctx.strokeRect(canvasWidth * 0.06, canvasHeight * 0.06, canvasWidth * 0.88, canvasHeight * 0.88);

  // 추천사 / 소개글
  ctx.fillStyle = '#292524';
  ctx.font = `600 ${Math.round(canvasWidth * 0.038)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('마음을 밝히는 다정한 이야기', canvasWidth / 2, canvasHeight * 0.2);

  ctx.fillStyle = '#57534E';
  ctx.font = `400 ${Math.round(canvasWidth * 0.028)}px sans-serif`;
  const blurbText = project.backCoverBlurb ||
    '작은 존재들이 서로의 온기를 나누며 밤하늘의 길을 찾아가는 아름다운 여정. 5~7세 아이들에게 배려와 협력의 따스함을 선물합니다.';
  renderWrappedText(blurbText, canvasWidth / 2, canvasHeight * 0.28, canvasWidth * 0.74, Math.round(canvasWidth * 0.046), 'center');

  // 판권지 정보 (Colophon)
  const colophonY = canvasHeight * 0.58;
  ctx.fillStyle = '#E7E5E4';
  ctx.fillRect(canvasWidth * 0.12, colophonY, canvasWidth * 0.76, 1);

  ctx.fillStyle = '#78716C';
  ctx.font = `400 ${Math.round(canvasWidth * 0.022)}px sans-serif`;
  ctx.textAlign = 'left';
  const infoX = canvasWidth * 0.14;
  ctx.fillText(`도서명: ${project.name}`, infoX, colophonY + canvasHeight * 0.05);
  ctx.fillText(`지은이 / 그린이: ${project.authorName || '창작자'}`, infoX, colophonY + canvasHeight * 0.09);
  ctx.fillText(`발행일: ${new Date().toLocaleDateString('ko-KR')}`, infoX, colophonY + canvasHeight * 0.13);
  ctx.fillText(`판형: ${widthMm} x ${heightMm} mm (도련 ${project.format.bleedMm}mm, 안전여백 ${project.format.safeMarginMm}mm)`, infoX, colophonY + canvasHeight * 0.17);
  ctx.fillText(`기획/제작: AI 그림동화 공방 (교육용 검토 초안본)`, infoX, colophonY + canvasHeight * 0.21);

  // 바코드 및 POD 알림 박스
  const barcodeX = canvasWidth * 0.62;
  const barcodeY = colophonY + canvasHeight * 0.05;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(barcodeX, barcodeY, canvasWidth * 0.24, canvasHeight * 0.16);
  ctx.strokeStyle = '#D6D3D1';
  ctx.strokeRect(barcodeX, barcodeY, canvasWidth * 0.24, canvasHeight * 0.16);
  ctx.fillStyle = '#A8A29E';
  ctx.font = `400 ${Math.round(canvasWidth * 0.018)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('[바코드 / ISBN 영역]', barcodeX + (canvasWidth * 0.12), barcodeY + canvasHeight * 0.07);
  ctx.fillText('정식 출판 시 교체', barcodeX + (canvasWidth * 0.12), barcodeY + canvasHeight * 0.11);

  doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, widthMm, heightMm);

  return doc.output('blob');
}
