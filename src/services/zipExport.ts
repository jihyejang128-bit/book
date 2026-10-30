import JSZip from 'jszip';
import { Project } from '../types/storybook';
import { getProjectAssetsFromIndexedDB } from './storage';
import { buildSceneImagePrompt } from './promptEngine';

/**
 * 프로젝트 전체 자산 ZIP 묶음 다운로드 서비스
 */
export async function generateProjectZipBundle(
  project: Project,
  onProgress?: (percent: number, message: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  onProgress?.(10, '원고 및 텍스트 자료 정리 중...');

  // 1. 원고 전문 및 기획서
  const manuscriptContent = `=====================================================
[AI 그림동화 공방] 창작 동화책 완성 원고 및 기획서
=====================================================

■ 도서명: ${project.name || '제목 없음'}
■ 부제: ${project.coverSubtitle || '-'}
■ 작가명: ${project.authorName || '작가'}
■ 대상 연령: ${project.targetAge}
■ 핵심 주제: ${project.theme}
■ 교육적 메시지: ${project.lesson}
■ 전체 정서 및 톤: ${project.tone}
■ 핵심 아이디어: ${project.storyIdea}

-----------------------------------------------------
■ 3문장 로그라인
-----------------------------------------------------
${project.logline || '작성 전'}

-----------------------------------------------------
■ 기승전결 시놉시스
-----------------------------------------------------
${project.synopsis || '작성 전'}

-----------------------------------------------------
■ 10장면 본문 원고
-----------------------------------------------------
${project.storyboards.map(s => `[장면 ${s.sceneNumber}] (${s.narrativePurpose})\n${s.text || '원고 없음'}\n`).join('\n')}

-----------------------------------------------------
■ 뒤표지 소개글
-----------------------------------------------------
${project.backCoverBlurb || '작성 전'}
`;
  zip.file('00_원고전문_및_기획개요.txt', manuscriptContent);

  // 2. 캐릭터 바이블
  const characterContent = `=====================================================
[AI 그림동화 공방] 캐릭터 바이블 & 일관성 규정집
=====================================================

${(project.characters || []).map((c, idx) => `
[캐릭터 ${idx + 1}: ${c.name} (${c.role})]
- 종/외형: ${c.species} (${c.ageAppearance})
- 비율: ${c.proportions}
- 얼굴/눈/귀: ${c.face} / ${c.eyes} / ${c.ears}
- 털/헤어: ${c.hairOrFur}
- 의상 및 소품: ${c.clothes} / ${c.accessories}
- 대표 색상 코드: ${c.palette.join(', ')}

★ [절대 고정 속성 (Immutable Traits)]
${c.immutableTraits}

★ [장면별 가변 속성 (Variable Traits)]
${c.variableTraits}

★ 마스터 프롬프트:
${c.masterPrompt}
`).join('\n-----------------------------------------------------\n')}
`;
  zip.file('01_캐릭터_바이블.txt', characterContent);

  // 3. 스토리보드 시각 연출 계획표
  const storyboardContent = `=====================================================
[AI 그림동화 공방] 10장면 스토리보드 시각 연출 계획표
=====================================================

${project.storyboards.map(s => `
[장면 ${s.sceneNumber}] ${s.narrativePurpose}
- 장소 및 시간: ${s.location || '미정'} / ${s.time || '미정'}
- 등장 캐릭터: ${s.characterIds.join(', ') || '없음'}
- 인물 동작: ${s.action}
- 감정선: ${s.emotion}
- 카메라 및 구도: ${s.composition} (${s.camera})
- 조명/색조: ${s.lighting}
- 글자 여백 위치: ${s.textPlacement}
- 본문: "${s.text}"
- 연속성 점검: ${s.continuityNotes || '특이사항 없음'}
`).join('\n-----------------------------------------------------\n')}
`;
  zip.file('02_스토리보드_시각연출계획.txt', storyboardContent);

  // 4. 장면별 AI 이미지 생성 프롬프트 모음
  const promptsContent = `=====================================================
[AI 그림동화 공방] 장면별 고품질 이미지 생성 프롬프트 모음
(Midjourney, DALL-E 3, Stable Diffusion, Recraft 등 활용)
=====================================================

${project.storyboards.map(s => {
  const generated = buildSceneImagePrompt(project, s);
  return `
[장면 ${s.sceneNumber} 프롬프트]
■ 긍정 프롬프트 (Positive):
${generated.positivePrompt}

■ 부정 프롬프트 (Negative):
${generated.negativePrompt}

■ 가이드 메모:
${generated.guidanceNotes}
`;
}).join('\n-----------------------------------------------------\n')}
`;
  zip.file('03_장면별_AI_프롬프트_모음.txt', promptsContent);

  // 5. Canva 및 Book Creator 수동 가져오기 가이드
  const externalToolGuide = `=====================================================
[AI 그림동화 공방] Canva & Book Creator 편집 가이드
=====================================================

1. 캔바(Canva)에서 제작하기:
   - Canva(www.canva.com) 로그인 -> [맞춤형 크기] 선택
   - 정방형 그림책: 200mm x 200mm (또는 2000px x 2000px) 입력
   - 이 ZIP 파일의 'images' 폴더에 있는 장면별 이미지들을 업로드
   - '00_원고전문_및_기획개요.txt'의 본문 텍스트를 복사하여 각 페이지에 폰트(Pretendard, 나눔손글씨 등)로 배치
   - 표지, 1~10페이지, 뒤표지 순으로 정렬 후 [PDF 인쇄]로 다운로드

2. 북 크리에이터(Book Creator)에서 제작하기:
   - Book Creator(app.bookcreator.com) 접속 -> [New Book] 클릭
   - 책 판형 선택: [Square 1:1] 또는 [Landscape 4:3]
   - 각 페이지에 본 ZIP의 일러스트 이미지를 [Import]로 삽입
   - 텍스트 도구(Text)로 원고를 붙여넣고, [Record] 버튼으로 낭독 오디오를 직접 녹음할 수 있습니다.
   - [Read Online]으로 전자책 링크를 학부모나 학생들과 공유하세요.

3. POD(주문형 인쇄) 자가출판 준비:
   - 국내 주요 플랫폼: 부크크(Bookk), 교보문고 퍼플(Pubple), 유페이퍼(ePaper)
   - 해외 플랫폼: 아마존 KDP (Kindle Direct Publishing)
   - 인쇄 시 필수 확인: 재단 시 잘려나가는 도련(Bleed 3mm)과 안전 여백(Safe Margin 5mm) 내에 글자와 중요 인물이 배치되었는지 인쇄용 PDF 뷰어에서 1:1 크기로 반드시 확인하세요.
`;
  zip.file('04_외부도구_편집_및_출판_가이드.txt', externalToolGuide);

  // 6. 이미지 에셋 패키징
  onProgress?.(40, '이미지 에셋 패키징 중...');
  const imgFolder = zip.folder('images');
  try {
    const assets = await getProjectAssetsFromIndexedDB(project.id);
    let assetCount = 0;

    for (const asset of assets) {
      if (asset.dataUrl && imgFolder) {
        // Base64 Data URL을 바이너리로 변환
        const parts = asset.dataUrl.split(',');
        const base64Data = parts[1];
        if (base64Data) {
          let extension = 'png';
          if (asset.mimeType?.includes('jpeg') || asset.mimeType?.includes('jpg')) extension = 'jpg';
          else if (asset.mimeType?.includes('webp')) extension = 'webp';

          let fileName = `asset_${asset.id}.${extension}`;
          if (asset.category === 'scene_illustration' && asset.sceneNumber) {
            fileName = `scene_${String(asset.sceneNumber).padStart(2, '0')}_illustration.${extension}`;
          } else if (asset.category === 'character_ref') {
            fileName = `character_${asset.characterId || 'ref'}_${asset.id.slice(-4)}.${extension}`;
          } else if (asset.category === 'cover_front') {
            fileName = `cover_front.${extension}`;
          } else if (asset.category === 'cover_back') {
            fileName = `cover_back.${extension}`;
          }

          imgFolder.file(fileName, base64Data, { base64: true });
          assetCount++;
        }
      }
    }
  } catch (e) {
    console.warn('이미지 에셋 압축 중 일부 오류:', e);
  }

  // 7. 프로젝트 JSON 백업 파일 포함
  onProgress?.(80, '프로젝트 백업 데이터 통합 중...');
  zip.file(`${project.name || '동화'}_프로젝트백업.json`, JSON.stringify(project, null, 2));

  onProgress?.(95, 'ZIP 파일 압축 생성 중...');
  const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.(Math.round(metadata.percent), `압축 진행 중: ${Math.round(metadata.percent)}%`);
  });

  return blob;
}
