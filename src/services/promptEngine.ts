import { Character, Project, Storyboard, ArtStyle } from '../types/storybook';
import { ART_STYLES } from '../data/seedData';

/**
 * AI 그림동화 공방 - 전문 프롬프트 빌더 엔진
 * 20년 경력 아동문학 작가 & 그림책 아트디렉터의 노하우를 집약한 프롬프트 생성기
 */

// 스타일 정보 안전 조회
function getStyle(styleId: string): ArtStyle {
  return ART_STYLES.find(s => s.id === styleId) || ART_STYLES[0];
}

/**
 * STEP 1: 동화책 아이디어 3종 발굴 프롬프트
 * 외부 거대 언어 모델(ChatGPT, Claude 등)에 전달하여 5~7세 특화 아이디어를 얻는 프롬프트
 */
export function buildIdeaPrompt(project: Partial<Project>): string {
  const age = project.targetAge || '5~7세';
  const theme = project.theme || '우정과 나눔';
  const tone = project.tone || '따뜻하고 몽환적이며 다정한';
  const lesson = project.lesson || '혼자보다 함께할 때 어려움을 이겨낼 수 있다는 감동';
  const protagonistType = project.protagonistType || '사랑스러운 꼬마 동물 친구';

  return `[역할 부여]
당신은 20년 경력의 베스트셀러 아동문학 작가이자 한국 안데르센상 심사위원입니다.
${age} 어린이를 위한 10장면 창작 그림동화의 핵심 아이디어 3가지를 제안해 주세요.

[기획 조건]
1. 대상 독자: ${age} (유아 발달 수준 고려: 직관적 인과관계, 시각적 상상력, 리듬감 있는 어휘)
2. 핵심 주제: ${theme}
3. 전체 정서 및 톤앤매너: ${tone}
4. 교육적 가치 및 메시지: ${lesson} (설교하거나 교훈을 주입하지 않고, 아이가 스스로 따뜻함을 느끼도록 구성)
5. 주인공 성격/유형: ${protagonistType}
6. 본문 분량: 10장면 (총 10장면의 기승전결 그림책)

[출력 형식]
반드시 다음 구조로 서로 다른 매력을 가진 아이디어 3개를 작성해 주세요:

---
■ 아이디어 1: [제목(안)]
- 한 줄 콘셉트:
- 주인공과 결핍:
- 뜻밖의 사건(모험의 계기):
- 절정의 순간(어린이다운 주도적 해결):
- 5~7세 아이들이 열광할 시각적/감각적 포인트:

■ 아이디어 2: [제목(안)]
- 한 줄 콘셉트:
- 주인공과 결핍:
- 뜻밖의 사건(모험의 계기):
- 절정의 순간(어린이다운 주도적 해결):
- 5~7세 아이들이 열광할 시각적/감각적 포인트:

■ 아이디어 3: [제목(안)]
- 한 줄 콘셉트:
- 주인공과 결핍:
- 뜻밖의 사건(모험의 계기):
- 절정의 순간(어린이다운 주도적 해결):
- 5~7세 아이들이 열광할 시각적/감각적 포인트:
---`;
}

/**
 * STEP 2: 스토리 및 10장면 원고 개발 프롬프트
 */
export function buildStoryPrompt(project: Partial<Project>): string {
  const age = project.targetAge || '5~7세';
  const title = project.name || '제목 미정';
  const theme = project.theme || '우정과 협력';
  const idea = project.storyIdea || '아이디어 요약';
  const tone = project.tone || '따뜻한 감성';

  return `[역할 부여]
당신은 칼데콧 상 수상작 수준의 서정성과 스토리텔링을 구현하는 전문 그림책 작가입니다.
아래 기획안을 바탕으로 ${age} 어린이를 위한 10장면 정식 그림책 원고와 시놉시스를 작성해 주세요.

[작품 기획 정보]
- 가제: ${title}
- 대상 연령: ${age}
- 채택된 아이디어: ${idea}
- 핵심 주제: ${theme}
- 작품 분위기: ${tone}

[집필 가이드라인]
1. 어휘와 문장: 5~7세의 발화와 청취 수준에 맞춘 의성어, 의태어, 운율감 있는 종결어미(~했어요, ~지요, ~일까요?) 활용.
2. 장면당 문장 수: 장면당 2~3문장 내외 (읽어주기 적합한 15~25초 호흡).
3. 10장면 기승전결 배분:
   - 장면 1: [시작] 주인공과 친근한 일상의 배경 소개
   - 장면 2: [결핍] 주인공의 아쉬움이나 특별한 소망
   - 장면 3: [계기] 일상을 뒤흔드는 뜻밖의 사건이나 초대
   - 장면 4: [모험] 문제를 해결하기 위해 첫 발을 내딛음
   - 장면 5: [시련] 생각지 못한 어려움에 부딪힘
   - 장면 6: [전환] 친구의 도움이나 작은 아이디어의 발견
   - 장면 7: [협력] 힘을 모아 함께 시도하는 따뜻한 행동
   - 장면 8: [절정] 가장 눈부신 마법 같은 변화나 감정의 폭발
   - 장면 9: [해결] 문제가 시원하고 행복하게 풀림
   - 장면 10: [여운] 일상으로 돌아와 미소 지으며 잠드는 마무리

[출력 형식]
아래 JSON 형식 또는 번호가 매겨진 텍스트 형식으로 작성해 주세요:
{
  "title": "확정된 동화책 제목",
  "logline": "1~2문장의 핵심 줄거리 요약",
  "synopsis": "기승전결 6단계 상세 줄거리",
  "scenes": [
    { "sceneNumber": 1, "text": "장면 1 본문 내용 (2~3문장)" },
    ...
    { "sceneNumber": 10, "text": "장면 10 본문 내용 (2~3문장)" }
  ]
}`;
}

/**
 * STEP 4: 캐릭터 마스터 프롬프트
 */
export function buildCharacterMasterPrompt(project: Partial<Project>, character: Character): string {
  const style = getStyle(project.styleId || 'watercolor');

  return `[Character Master Concept Sheet]
Positive Prompt:
${character.species}, named ${character.name}, ${character.ageAppearance}, ${character.shape}, ${character.proportions}, ${character.face}, ${character.eyes}, ${character.ears}, ${character.hairOrFur}.
Costume & Props: ${character.clothes}, ${character.accessories}.
Fixed Color Palette: ${character.palette.join(', ')}.
Art Style: ${style.guide.artKeywordsEnglish}.
Lighting & Ambience: ${style.guide.lighting}, ${style.guide.texture}.
Composition: Full body character reference sheet, clean soft off-white background, neutral studio lighting, 4K picturebook quality, lovable and charming protagonist.

Negative Prompt:
--no ${style.guide.negativeElements.join(', ')}, ugly, extra limbs, bad proportions, realistic human anatomy, adult features, text, letters, watermark, blurry, low quality

[아트디렉터 한국어 가이드]
- 절대 고정 속성: ${character.immutableTraits}
- 장면별 허용 가변 속성: ${character.variableTraits}
- 생성 팁: Midjourney/DALL-E 생성 시 이 프롬프트를 기본으로 사용하고, 가장 잘 나온 이미지를 저장하여 STEP 4의 '기준 이미지'로 등록하세요.`;
}

/**
 * STEP 4: 캐릭터 턴어라운드 / 표정 / 동작 시트 프롬프트
 */
export function buildCharacterSheetPrompt(
  project: Partial<Project>,
  character: Character,
  sheetType: 'turnaround' | 'expressions' | 'poses' | 'details'
): string {
  const style = getStyle(project.styleId || 'watercolor');
  const baseBio = `${character.species} named ${character.name}, ${character.proportions}, ${character.hairOrFur}, wearing ${character.clothes}`;

  switch (sheetType) {
    case 'turnaround':
      return `[Character Sheet: Model Turnaround 4-Views]
Prompt:
Character turnaround model sheet of ${baseBio}.
Four distinct angles lined up side by side: Front view, 45-degree three-quarter view, 90-degree side profile view, and full back view.
Showing identical proportions, identical clothing (${character.clothes}), exact ear and tail placement.
Clean white neutral backdrop, reference sheet grid alignment, ${style.guide.artKeywordsEnglish}.
--no multiple different outfits, distorted limbs, text, words, watermark --ar 16:9`;

    case 'expressions':
      return `[Character Sheet: 6 Facial Expressions Grid]
Prompt:
Expression sheet of ${baseBio}.
A clean 2x3 grid displaying 6 distinct facial expressions:
1. Pure Joy & Giggling (smiling with eyes curved, blushing)
2. Curious Wonder (eyes wide open, head tilted, mouth round 'O')
3. Worried & Sad (drooping ears, tiny tear glistens, pouty lips)
4. Surprised & Startled (wide pupil, ears perk straight up)
5. Determined & Brave (confident smile, raised fist, sparkling amber eyes)
6. Peaceful Sleepy / Cozy Relief (soft shut eyes, cozy gentle sigh)
Consistent facial shape, identical eye color, ${style.guide.artKeywordsEnglish}.
--no distorted face, mature look, text, speech bubble, labels --ar 4:3`;

    case 'poses':
      return `[Character Sheet: 6 Dynamic Action Poses]
Prompt:
Action pose sheet of ${baseBio}.
A collection of 6 charming storybook action poses on clean parchment paper:
1. Walking energetically with a crossbag
2. Kneeling down and blowing gently with warm breath
3. Leaping joyfully into the air
4. Hugging a large object tightly with two paws
5. Pointing towards the starry sky
6. Sitting cross-legged sipping a warm mug
Maintaining identical 2.5 heads ratio, identical overalls with star embroidery.
${style.guide.artKeywordsEnglish}.
--no style change, extra legs, extra ears, letters, words --ar 16:9`;

    case 'details':
      return `[Character Sheet: Costume & Key Props Close-up]
Prompt:
Detailed design breakdown sheet for ${baseBio}.
Close-up illustrations showing:
- Front and back details of the ${character.clothes}
- The texture of the little brass buckle leather crossbag
- The glowing glass bottle necklace containing golden star dust
- Fur texture swatch of apricot orange and white chest fluff
Crisp children book illustrative study, palette swatches (${character.palette.join(', ')}), ${style.guide.artKeywordsEnglish}.
--no messy lines, text, watermark, photo realism --ar 4:3`;
  }
}

/**
 * STEP 5: 일관성 테스트 프롬프트 3종
 */
export function buildConsistencyTestPrompt(
  project: Partial<Project>,
  character: Character,
  testType: 'daylight_front' | 'night_side' | 'action_emotion'
): string {
  const style = getStyle(project.styleId || 'watercolor');
  const coreDesc = `${character.species} named ${character.name}, ${character.proportions}, ${character.hairOrFur}, wearing ${character.clothes}`;

  if (testType === 'daylight_front') {
    return `[Consistency Test 1: Daylight / Front View]
Prompt:
${coreDesc}, standing proudly in the middle of a sun-drenched flower meadow, frontal eye-level view.
Bright warm daylight, cheerful smile, clear view of all immutable traits (${character.immutableTraits}).
Empty top area for picture book text layout.
Art Style: ${style.guide.artKeywordsEnglish}.
Lighting: Soft morning sunlight, clear sharp focal subject.
--no text, words, letters, watermark, distorted hands, realistic adult proportions --ar ${project.format?.eBookRatio === '1:1' ? '1:1' : '4:3'}`;
  } else if (testType === 'night_side') {
    return `[Consistency Test 2: Night Atmosphere / Side Profile]
Prompt:
${coreDesc}, gazing up at a majestic twilight night sky, 90-degree side profile view on a grassy hilltop.
Deep indigo and purple evening sky filled with twinkling dust, subtle rim light illuminating the ears and fur edges.
Maintaining exact clothing colors and proportion under cool atmospheric lighting.
Negative space on left side for story text.
Art Style: ${style.guide.artKeywordsEnglish}.
--no text, letters, watermark, blacked-out silhouette, muddy colors --ar ${project.format?.eBookRatio === '1:1' ? '1:1' : '4:3'}`;
  } else {
    return `[Consistency Test 3: Dynamic Action / Emotional Shift]
Prompt:
${coreDesc}, dynamically leaping through the air with arms outstretched in ecstatic celebration!
Holding a glowing amber star, mouth wide open in pure laughter, tail swishing high with excitement.
Preserving identical clothing details (${character.clothes}), distinct facial markings, and 2.5 heads cute chibi build.
Art Style: ${style.guide.artKeywordsEnglish}.
--no morphing face, missing ears, blurry motion, text, watermark --ar ${project.format?.eBookRatio === '1:1' ? '1:1' : '4:3'}`;
  }
}

/**
 * STEP 6: 스토리보드 10장면 시각 설계 프롬프트
 */
export function buildStoryboardPrompt(project: Partial<Project>): string {
  const charactersDesc = project.characters?.map(c => `- ${c.name} (${c.role}): ${c.species}, ${c.clothes}`).join('\n') || '';

  return `[역할 부여]
당신은 디즈니/픽사 출신의 전문 스토리보드 아티스트이자 그림책 아트디렉터입니다.
아래의 10장면 동화책 원고를 바탕으로, 시각적 리듬감(샷 크기, 시점, 빛, 감정선)이 완벽하게 조율된 10장면 스토리보드 시각 연출 계획을 수립해 주세요.

[동화책 정보]
- 제목: ${project.name}
- 대상 연령: ${project.targetAge}
- 주요 등장인물:
${charactersDesc}

[원고 전문]
${project.manuscript}

[스토리보드 설계 핵심 원칙]
1. 시각적 완급 조절: 와이드 샷(배경) -> 미디엄(인물 행동) -> 클로즈업(감정 극대화)의 자연스러운 교차.
2. 5~7세 인지 배려: 핵심 인물의 동작이 한눈에 들어오는 명확한 실루엣, 산만하지 않은 배경 정리.
3. 글자 여백(Negative Space): 텍스트가 얹어질 상단/하단 여백을 미리 카메라 구도에 반영.
4. 캐릭터 연속성: 앞 장면과 이어지는 의상, 소품(가방, 목걸이 등) 위치 고정.

[출력 형식]
10개 장면 각각에 대해:
- 장면 번호 (Scene 1~10)
- 샷 크기 & 앵글 (예: Wide Establishing Shot, High Angle)
- 조명 및 색채 톤 (예: Warm Sunset Gold, Deep Twilight Indigo)
- 인물 구체적 신체 동작 & 감정선
- 글자가 들어갈 안전 여백 위치 (상단 / 하단 / 좌측 / 우측)`;
}

/**
 * STEP 7: 장면별 정밀 삽화 생성 프롬프트
 * 장면 원고 + 캐릭터 바이블 + 스타일가이드 + 구도 + 텍스트 여백을 모두 결합한 최종 마스터 프롬프트
 */
export function buildSceneImagePrompt(
  project: Partial<Project>,
  scene: Storyboard
): { positivePrompt: string; negativePrompt: string; guidanceNotes: string } {
  const style = getStyle(project.styleId || 'watercolor');

  // 등장 캐릭터 추출
  const sceneCharacters = (project.characters || []).filter(c => scene.characterIds.includes(c.id));
  const charactersPromptPart = sceneCharacters.length > 0
    ? sceneCharacters.map(c =>
        `Featuring ${c.name} (${c.species}, 2.5 heads chibi proportion, ${c.hairOrFur}, wearing ${c.clothes}, amber eyes)`
      ).join('. Also featuring ')
    : 'Charming fairytale characters';

  // 텍스트 여백 지시문
  const textSpaceInstruction = scene.textPlacement === 'top'
    ? 'Composition design: Clear empty negative space at the TOP third of the image with soft uncluttered gradient for children picturebook typography overlay'
    : scene.textPlacement === 'bottom'
    ? 'Composition design: Spacious uncluttered negative space at the BOTTOM third of the image for text layout'
    : scene.textPlacement === 'left'
    ? 'Composition design: Subject arranged on the right, calm open negative space on the LEFT side for text'
    : 'Composition design: Subject arranged on the left, calm open negative space on the RIGHT side for text';

  // 비율 파라미터
  const arParam = project.format?.eBookRatio === '4:3'
    ? '--ar 4:3'
    : project.format?.eBookRatio === '3:2'
    ? '--ar 3:2'
    : '--ar 1:1';

  const positivePrompt = [
    `Scene ${scene.sceneNumber}: ${scene.narrativePurpose}.`,
    charactersPromptPart + '.',
    `Action & Narrative: ${scene.action}.`,
    `Emotion & Atmosphere: Expressing ${scene.emotion}, in ${scene.location} during ${scene.time}.`,
    scene.props && scene.props.length > 0 ? `Key props: ${scene.props.join(', ')}.` : '',
    `Camera & Composition: ${scene.composition}, ${scene.camera}.`,
    `Lighting & Palette: ${scene.lighting}.`,
    textSpaceInstruction + '.',
    `Art Style: ${style.guide.artKeywordsEnglish}, ${style.guide.linework}, ${style.guide.texture}.`,
    `Masterpiece children picturebook illustration, high narrative warmth, rich emotional storytelling.`
  ].filter(Boolean).join(' ');

  const negativePrompt = [
    ...style.guide.negativeElements,
    'text',
    'words',
    'typography',
    'letters',
    'watermark',
    'signature',
    'distorted face',
    'extra limbs',
    'deformed hands',
    'bad anatomy',
    'busy cluttered composition in text area',
    'photorealistic adult proportions'
  ].join(', ');

  const guidanceNotes = [
    `[원고 연계] "${scene.text}"`,
    `[연속성 체크] ${scene.continuityNotes || '앞 장면과의 의상/소품 일관성 유지'}`,
    `[참조 이미지 활용] Midjourney v6/Niji 6 사용 시 STEP 4에서 승인한 캐릭터 대표 이미지를 첨부(Image Prompt)하고 가중치(--cw 100 또는 --cref)를 부여하세요.`
  ].join('\n');

  return {
    positivePrompt: `${positivePrompt} --no ${negativePrompt} ${arParam}`,
    negativePrompt: `--no ${negativePrompt}`,
    guidanceNotes
  };
}
