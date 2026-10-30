import { ArtStyle, Project } from '../types/storybook';

export const ART_STYLES: ArtStyle[] = [
  {
    id: 'watercolor',
    name: '감성 수채화',
    englishName: 'Emotional Watercolor Storybook',
    tagline: '맑고 투명한 물맛과 따스한 감성 번짐 효과',
    characteristics: [
      '부드러운 물 번짐(wet-on-wet)과 자연스러운 수채화 종이 질감',
      '파스텔톤의 서정적인 색감과 편안한 감정선 표현',
      '자연 풍경, 밤하늘, 숲속 이야기 등 따뜻한 동화에 최적화'
    ],
    recommendedGenre: ['우정', '마음 치유', '자연과 동물', '잠자리 동화'],
    colorMood: '따스한 아이보리, 세이지 그린, 은은한 라벤더, 부드러운 살구빛',
    cautions: [
      '색감이 지나치게 흐려져 인물 외곽선이 뭉개지지 않도록 경계선(pencil contour) 키워드 유지 필요',
      '배경이 너무 복잡하면 글자가 얹어질 공간(Negative Space)이 부족해짐'
    ],
    guide: {
      palette: ['#FAF5EE', '#A7D7C5', '#F6D186', '#C7CEEA', '#F4A261'],
      linework: '부드러운 연필 선과 연한 갈색 세피아 윤곽선, 경계가 자연스럽게 번지는 선',
      texture: '두툼한 300g 수채화 콜드프레스 종이 결, 맑은 물방울 번짐과 잉크 드롭렛',
      lighting: '부드러운 아침 햇살 또는 은은한 노을의 자연광, 높은 채도의 인공 조명 배제',
      backgroundDetail: '여백을 살린 몽환적인 원경 처리, 주제가 되는 인물에 포커스 집중',
      negativeElements: ['photorealistic', 'glossy 3D', 'neon glow', 'dark heavy shadows', 'harsh black outlines', 'text', 'watermark'],
      koreanDescription: '맑고 서정적인 물 번짐이 살아있는 클래식 수채화 그림책 스타일',
      artKeywordsEnglish: 'warm emotional watercolor illustration, children book art style, soft bleeding edges, cold-press paper texture, gentle pastel wash, charming soft contour lines, studio lighting for picturebook'
    }
  },
  {
    id: '3d_animation',
    name: '3D 애니메이션',
    englishName: 'Soft 3D CGI Children Style',
    tagline: '픽사/디즈니 풍의 둥글고 생생한 클레이 & 렌더 질감',
    characteristics: [
      '만지고 싶을 만큼 보드라운 점토/벨벳 텍스처와 볼륨감',
      '귀여운 2.5등신의 둥근 실루엣과 풍부하고 사랑스러운 표정',
      '선명한 입체감으로 5~7세 아이들의 몰입도를 극대화'
    ],
    recommendedGenre: ['모험', '코믹', '호기심', '친구 만들기'],
    colorMood: '선명하고 생동감 넘치는 시트러스 오렌지, 청량한 하늘색, 크림 옐로우',
    cautions: [
      '실사 영화처럼 번쩍이는 플라스틱 광택이나 과도한 금속 반사를 피하고 소프트 매트(soft matte clay) 텍스처 유지',
      '인체 비율이 어른처럼 변형되지 않도록 2.5등신 귀여운 비율 명시'
    ],
    guide: {
      palette: ['#FF9F43', '#54A0FF', '#1DD1A1', '#FECA57', '#5F27CD'],
      linework: '외곽선 없이 입체 음영과 볼륨으로 형태를 잡는 부드러운 3D 셰이프',
      texture: '보송보송한 매트 점토 질감, 미세한 펠트/패브릭 섬유 결',
      lighting: '풍부하고 부드러운 스튜디오 3점 조명, 따스한 림 라이트(Rim Light)',
      backgroundDetail: '아기자기한 미니어처 디오라마 풍의 깔끔하고 정리된 배경',
      negativeElements: ['photorealistic human', 'creepy uncanny valley', 'metallic glare', 'dark cyberpunk', 'scary shadows', 'text'],
      koreanDescription: '포근하고 만지고 싶은 둥근 볼륨감의 따스한 3D 클레이 애니메이션 스타일',
      artKeywordsEnglish: 'soft cute 3D animated style, Pixar and Disney inspired, stylized clay render, velvety tactile surface, warm rim lighting, adorable 2.5 heads chibi proportion, friendly facial expression, clean diorama background'
    }
  },
  {
    id: 'gouache',
    name: '구아슈',
    englishName: 'Warm Opaque Gouache',
    tagline: '밀도 높은 불투명 과슈와 정겨운 손맛의 붓 터치',
    characteristics: [
      '차분하고 깊이 있는 매트한 색면과 붓 결이 살아있는 회화적 매력',
      '유럽 클래식 그림책의 아늑하고 빈티지한 분위기',
      '사계절의 변화와 숲속, 다정한 집안 풍경에 적합'
    ],
    recommendedGenre: ['가족 이야기', '전통/민화 재해석', '계절 이야기', '잔잔한 감동'],
    colorMood: '올리브 그린, 테라코타, 겨자색, 톤 다운된 네이비',
    cautions: [
      '색감이 너무 어두워지지 않도록 하이라이트와 밝은 파스텔 면적을 30% 이상 확보할 것',
      '붓 결이 지나치게 거칠면 캐릭터의 섬세한 표정이 묻힐 수 있음'
    ],
    guide: {
      palette: ['#2D4059', '#EA5455', '#F07B3F', '#FFD460', '#8E9A82'],
      linework: '넓은 평붓 자국과 자연스럽게 중첩되는 불투명 물감 경계',
      texture: '밀도 높은 아크릴 구아슈 매트 질감, 종이 위의 도톰한 안료 느낌',
      lighting: '창문을 통해 들어오는 자연광과 아늑한 램프 조명',
      backgroundDetail: '단순화된 형태감과 패턴화된 나뭇잎, 아기자기한 집기류 묘사',
      negativeElements: ['digital gradient', 'glossy finish', '3D render', 'neon', 'hyper-sharp photo', 'text'],
      koreanDescription: '불투명 물감의 도톰한 안료감과 클래식한 유럽 그림책의 온기',
      artKeywordsEnglish: 'opaque acrylic gouache painting, Scandinavian picturebook style, visible painterly brushstrokes, matte velvet finish, warm earthen color palette, stylized cozy flat shapes, charming artisanal craft feel'
    }
  },
  {
    id: 'anime',
    name: '일본 감성 애니메이션',
    englishName: 'Ghibli-Inspired Anime Storybook',
    tagline: '맑은 하늘과 서정적인 자연 풍경이 어우러진 지브리 감성',
    characteristics: [
      '청량하고 투명한 뭉게구름, 푸른 초원, 반짝이는 빛가루 연출',
      '깔끔한 카툰 잉크 윤곽선과 수채 배경의 완벽한 조화',
      '신비로운 환상 동화와 꼬마 탐험가의 모험에 인기'
    ],
    recommendedGenre: ['환상 판타지', '모험', '하늘과 바다', '호기심'],
    colorMood: '코발트 블루, 싱그러운 잔디 그린, 맑은 해바라기 옐로우, 몽환적 노을',
    cautions: [
      '성인용 애니메이션 풍의 날카롭거나 과도한 디테일을 배제하고 아동용 순수 감성 유지',
      '과도한 하이라이트 효과로 화면이 어지러워지지 않도록 절제'
    ],
    guide: {
      palette: ['#3A86FF', '#8338EC', '#FF006E', '#FB5607', '#FFBE0B'],
      linework: '단정하고 얇은 애니메이션 셀 애니메이션 잉크 라인',
      texture: '셀 애니메이션 캐릭터 채색 + 핸드페인팅 풍경 배경 질감',
      lighting: '눈부신 틴들 효과(빛내림), 역광 실루엣, 반짝이는 별빛 입자',
      backgroundDetail: '바람에 흔들리는 풀잎, 뭉게구름이 피어나는 광활한 하늘',
      negativeElements: ['shonen anime style', 'sharp aggressive lines', 'dark gore', 'cyberpunk', 'text', 'watermark'],
      koreanDescription: '지브리 스튜디오를 연상시키는 청량하고 맑은 자연과 순수한 캐릭터',
      artKeywordsEnglish: 'Studio Ghibli aesthetic, Hayao Miyazaki storybook art, whimsical hand-painted background, anime cell animation style, lush emerald meadow, billowy cumulus clouds, pure sunlight rays, gentle innocence'
    }
  },
  {
    id: 'colored_pencil',
    name: '색연필 손그림',
    englishName: 'Colored Pencil Sketch & Hatching',
    tagline: '사각사각 소리가 들릴 듯한 따뜻한 색연필 결',
    characteristics: [
      '종이 결을 따라 은은하게 채워지는 색연필의 다정한 사선 해칭',
      '아이가 직접 크레용으로 그린 듯한 친근감과 순수함',
      '동물 주인공의 포근한 털 질감 묘사에 최고의 표현력'
    ],
    recommendedGenre: ['아기 동물', '첫 감정 배우기', '엄마와 아기', '잠자리 동화'],
    colorMood: '부드러운 크림, 베이지 브라운, 피치 핑크, 스카이 블루',
    cautions: [
      '스케치 선이 너무 거칠어져 지저분해 보이지 않도록 정돈된 해칭 지시',
      '인쇄 시 흐려질 수 있으므로 핵심 인물은 충분한 채도 확보'
    ],
    guide: {
      palette: ['#F7EDE2', '#F5CAC3', '#84A59D', '#F28482', '#6B705C'],
      linework: '부드러운 흑연 및 갈색 색연필의 자연스러운 손그림 스케치선',
      texture: '크라프트지나 거친 도화지 위의 색연필 사선 결(hatching)',
      lighting: '따스한 오후의 창가 자연광, 은은한 음영 그라데이션',
      backgroundDetail: '단순화된 가구와 소품, 몽환적이고 부드러운 생략 기법',
      negativeElements: ['harsh vector', 'shiny plastic', 'dark noir', 'complex industrial', 'text'],
      koreanDescription: '정성스런 색연필 결로 마음을 따뜻하게 감싸주는 친근한 손그림',
      artKeywordsEnglish: 'soft colored pencil illustration, delicate pencil hatching on textured cream paper, gentle crayon sketch, cozy warm nursery room mood, fluffy animal fur details, innocent hand-drawn aesthetic'
    }
  },
  {
    id: 'flat_vector',
    name: '플랫 벡터',
    englishName: 'Modern Flat Graphic & Shape Play',
    tagline: '단순하고 명확한 도형미와 세련된 북유럽 컬러',
    characteristics: [
      '시각적 인지력이 발달하는 5~6세에게 가장 직관적인 형태감',
      '군더더기 없는 기하학적 도형(원, 세모, 네모)의 리듬감 있는 배치',
      '현대적이고 감각적인 그래픽 디자인 동화책에 제격'
    ],
    recommendedGenre: ['사물 인지', '모양과 색깔', '유쾌한 행동 발달', '리듬감 있는 말놀이'],
    colorMood: '볼드한 머스터드 옐로우, 세이지 그린, 네이비 블루, 코랄 레드',
    cautions: [
      '너무 건조한 인포그래픽 느낌이 나지 않도록 종이 질감(paper grain) 오버레이 추가',
      '얼굴 표정의 단순화가 캐릭터의 감정을 헤치지 않도록 눈/입 묘사 유지'
    ],
    guide: {
      palette: ['#E76F51', '#F4A261', '#E9C46A', '#2A9D8F', '#264653'],
      linework: '외곽선이 없거나 굵고 균일한 모던 아웃라인',
      texture: '미세한 노이즈 그레인(grain) 텍스처가 얹힌 세련된 플랫 면',
      lighting: '명확한 평면 조명과 대담한 쉐도우 블록',
      backgroundDetail: '기하학적으로 단순화된 나무, 산, 건물, 패턴화된 배경',
      negativeElements: ['3D gradients', 'complex realism', 'dirty shadows', 'unclear outlines', 'text'],
      koreanDescription: '명쾌한 형태와 절제된 북유럽 색채의 세련된 현대 그래픽 동화',
      artKeywordsEnglish: 'modern flat vector picturebook art, Scandinavian minimalist illustration, bold geometric shapes, subtle paper grain texture, playful balance, clean graphic shapes, vibrant color blocking'
    }
  },
  {
    id: 'paper_collage',
    name: '종이 콜라주',
    englishName: 'Paper Cutout Collage & Craft',
    tagline: '에릭 칼 스타일의 오려붙인 종이 단면과 입체적인 그림자',
    characteristics: [
      '물감을 칠한 종이를 가위로 오려 겹겹이 층을 쌓은 듯한 수공예 느낌',
      '종이 단면(cut paper edges)과 층위 사이의 미세한 그림자 효과',
      '아이들의 촉각적 호기심과 상상력을 자극하는 독창적인 기법'
    ],
    recommendedGenre: ['자연 탐구', '동물과 곤충', '창의력과 미술 놀이'],
    colorMood: '원색과 파스텔이 조화롭게 레이어드된 풍성한 다채로움',
    cautions: [
      '너무 복잡하게 조각나면 인물의 핵심 동작이 눈에 띄지 않으므로 큰 덩어리감 유지',
      '각 레이어의 그림자 깊이(drop shadow)를 과하지 않게 조절'
    ],
    guide: {
      palette: ['#06D6A0', '#118AB2', '#EF476F', '#FFD166', '#073B4C'],
      linework: '가위로 자른 듯한 삐뚤빼뚤하지만 매력적인 종이 단면 모서리',
      texture: '직접 손으로 칠한 다양한 질감의 색종이, 스펀지 롤러 자국',
      lighting: '종이 층위 사이로 생기는 미세하고 부드러운 입체 그림자',
      backgroundDetail: '색종이 조각을 흩뿌려놓은 듯한 콜라주 풍경',
      negativeElements: ['smooth CGI', 'glossy plastic', 'blurry realism', 'monochrome', 'text'],
      koreanDescription: '손으로 오려 붙인 듯한 정겨운 종이 질감과 다채로운 색채 레이어',
      artKeywordsEnglish: 'Eric Carle inspired paper cutout collage, layered torn painted paper craft, subtle cast paper shadows, textured tissue paper collage, vibrant tactile shapes, handcrafted mixed media art'
    }
  },
  {
    id: 'pastel',
    name: '파스텔 동화풍',
    englishName: 'Soft Pastel Whimsical Storybook',
    tagline: '보송보송 솜사탕처럼 부드럽고 몽환적인 꿈결 일러스트',
    characteristics: [
      '손가락으로 문지른 듯한 초미세 파스텔 가루의 포근한 그라데이션',
      '구름 위, 밤하늘의 별빛, 달님과의 만남 등 환상적인 세계관에 특화',
      '5~7세 어린이에게 안도감과 편안한 수면을 유도하는 힐링 아트'
    ],
    recommendedGenre: ['잠자리 동화', '꿈과 소원', '마음 위로', '상상 여행'],
    colorMood: '밀키 핑크, 라벤더 퍼플, 민트 크림, 은은한 레몬 버터',
    cautions: [
      '전체적인 명도가 너무 높아지면 책으로 인쇄했을 때 경계가 날아갈 수 있음',
      '캐릭터의 눈, 코, 입은 선명한 포인트 컬러로 또렷하게 잡아주어야 함'
    ],
    guide: {
      palette: ['#FFCAD4', '#B5E2FA', '#EDAFB8', '#F7D6E0', '#D8E2DC'],
      linework: '경계가 문질러진 소프트 스머징 라인, 은은한 파스텔 빛 번짐',
      texture: '보송보송한 파스텔 파우더 가루감, 부드러운 벨루어 종이 결',
      lighting: '자체 발광하는 듯한 은은한 별빛과 달빛, 몽환적인 글로우',
      backgroundDetail: '솜사탕 구름, 쏟아지는 별무리, 둥근 파스텔 언덕',
      negativeElements: ['harsh high-contrast', 'black shadows', 'sharp vector lines', 'gloomy dark colors', 'text'],
      koreanDescription: '달콤한 솜사탕 구름 속을 걷는 듯 포근하고 신비로운 파스텔 판타지',
      artKeywordsEnglish: 'whimsical soft oil pastel illustration, dreamy glowing starlight, smudged powdery texture, fluffy pastel clouds, gentle candy colors, cozy fairytale book atmosphere, comforting warmth'
    }
  }
];

// 예시 프로젝트: "별빛을 수선하는 작은 여우" (루미)
export const SAMPLE_PROJECT: Project = {
  schemaVersion: '1.0.0',
  id: 'sample-project-fox-lumi',
  name: '별빛을 수선하는 작은 여우',
  authorName: '달빛 작업실 & 아이들',
  coverSubtitle: '어둠이 무서운 숲속 친구들을 위한 반짝반짝 다정한 모험',
  backCoverBlurb: '작은 불빛 하나가 모여 온 숲을 따스하게 비추듯, 우리의 작은 용기와 배려는 누군가의 밤을 가장 찬란하게 밝혀준답니다.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  currentStep: 1,

  targetAge: '6세',
  theme: '배려와 협력',
  lesson: '작은 존재도 누군가에게 큰 빛이 될 수 있으며, 서로 도울 때 어두운 두려움도 함께 이겨낼 수 있어요.',
  tone: '따뜻하고 몽환적이며 다정한 위로',
  protagonistType: '작지만 손재주가 좋고 마음이 따뜻한 동물 아이 (붉은 여우)',
  pageCount: 10,
  storyIdea: '깜깜한 밤이 오면 하늘에서 떨어진 식어버린 별 조각을 주워, 마음의 온기로 닦아 다시 밤하늘로 쏘아 올리는 작은 꼬마 여우 루미의 이야기.',
  candidateIdeas: [
    '깜깜한 밤이 오면 하늘에서 떨어진 식어버린 별 조각을 주워, 마음의 온기로 닦아 다시 밤하늘로 쏘아 올리는 작은 꼬마 여우 루미의 이야기.',
    '구름 솜사탕을 만들어 하늘을 날지 못하는 아기 참새에게 날개를 선물하는 꼬마 곰의 베이킹 모험.',
    '숲속 옹달샘에 소리 보관함을 두고 친구들의 슬픈 울음소리를 모아 경쾌한 실로폰 노래로 바꿔주는 토끼 악단.'
  ],

  logline: '별빛이 희미해져 길을 잃은 밤의 숲에서, 작은 여우 루미가 친구들과 함께 떨어진 별 조각을 모아 따스한 우정으로 불빛을 되살리고 온 숲을 환하게 밝힙니다.',
  synopsis: `[시작-도입] 반딧불이 언덕에 사는 꼬마 여우 루미는 밤마다 하늘에서 톡 떨어진 차가운 별 조각들을 모으는 손재주 좋은 친구예요.
[결핍-계기] 어느 바람 부는 밤, 가장 커다란 길잡이 별이 툭 떨어지며 온 숲이 새까만 어둠에 잠기고 동물 친구들이 두려움에 떨기 시작해요.
[갈등-모험] 루미는 별 조각을 수선하려 하지만, 너무 차갑게 식어 혼자의 입김으로는 불빛이 켜지지 않아요.
[전환-협력] 이때 아기 곰 포포와 다람쥐 치치가 다가와 자신의 소중한 도토리와 따스한 털장갑을 나누며 함께 별을 꼭 안아 체온을 나누어요.
[절정-해결] 친구들의 다정한 마음이 모이자 별 조각이 황금빛으로 눈부시게 피어오르고, 루미는 나뭇가지 새총으로 별을 가장 높은 밤하늘로 쏘아 올립니다.
[결말-여운] 온 숲이 은은한 별빛으로 가득 차고, 친구들은 손을 맞잡고 별빛 언덕에서 따뜻한 코코아를 마시며 미소 지어요.`,
  manuscript: `1. 반딧불이 언덕에 밤이 찾아오면, 작은 여우 루미는 별빛 가방을 메고 살금살금 언덕을 올랐어요.
2. 루미는 하늘에서 톡 떨어진 차가운 별 조각들을 호호 불어 닦아주는 별빛 수선공이랍니다.
3. 쏴아아- 심술궂은 밤바람이 불어오더니, 하늘에서 가장 눈부시던 길잡이 큰 별이 툭 떨어지고 말았어요!
4. "어떡하지? 숲이 너무 캄캄해서 집으로 가는 길을 잃어버렸어!" 아기 곰 포포가 훌쩍이며 울먹였어요.
5. 루미는 큰 별을 품에 안고 따뜻한 입김을 후- 불어넣었지만, 큰 별은 여전히 얼음처럼 차가웠어요.
6. "루미야, 내 따뜻한 털모자도 별님에게 씌워줄게!" 다람쥐 치치가 달려와 모자를 벗어주었어요.
7. 포포의 포근한 앞발, 치치의 도토리 기름, 루미의 다정한 손길이 닿자, 별 조각에서 작고 붉은 불씨가 퐁! 피어올랐어요.
8. 세 친구가 두 손을 꼭 모으고 "반짝여라, 퐁퐁!" 외치자, 눈이 부실 만큼 찬란한 황금빛이 온 숲을 비추었어요!
9. 루미는 가장 탄탄한 팽나무 가지에 별을 걸고, 하늘 가장 높은 곳을 향해 씽- 하고 쏘아 올렸어요.
10. 밤하늘엔 다시 은빛 물결이 찰랑이고, 언덕 위 세 친구의 발그레한 뺨 위로 따스한 별빛이 소복이 내려앉았답니다.`,

  styleId: 'watercolor',
  styleGuide: ART_STYLES[0].guide,
  format: {
    eBookRatio: '1:1',
    podTrim: '200x200',
    bleedMm: 3,
    safeMarginMm: 5,
    dpi: 300,
    spreadType: 'single'
  },

  characters: [
    {
      id: 'char_lumi',
      name: '루미 (Lumi)',
      role: '주인공',
      species: '붉은 아기 여우 (Red Fox Cub)',
      personality: '호기심 많고 손재주가 뛰어나며, 겁 많은 친구를 먼저 챙기는 다정한 마음씨',
      ageAppearance: '5~6세 아이 같은 천진난만하고 아담한 체구',
      shape: '둥글둥글하고 포근한 실루엣, 찹쌀떡 같은 타원형 얼굴',
      proportions: '2.5등신의 사랑스러운 비율, 큰 머리와 통통한 손발, 풍성하고 긴 꼬리',
      face: '복숭앗빛으로 발그레한 뺨, 살짝 올라간 상냥한 입꼬리, 작고 귀여운 코',
      eyes: '반짝이는 호박색(Amber) 큰 눈망울, 별빛을 담은 듯 맑고 둥근 눈',
      ears: '머리 위에 쫑긋 솟은 뾰족한 여우 귀, 귓속에는 보송한 흰 털이 가득함',
      hairOrFur: '보드랍고 따스한 살구빛 감귤 주황색 털, 가슴과 꼬리 끝은 새하얀 털',
      palette: ['#F97316', '#FEF3C7', '#1E293B', '#F59E0B', '#FFFFFF'],
      clothes: '앞주머니에 노란 별자수가 수놓아진 짙은 남색(Navy) 코듀로이 멜빵바지',
      accessories: '별빛 조각을 담는 작은 유리병 목걸이, 황동 버클이 달린 작은 가죽 크로스백',
      immutableTraits: '살구빛 주황색 털, 귀 끝과 꼬리 끝의 흰 털, 별 자수 남색 멜빵바지, 2.5등신 비율, 호박색 큰 눈',
      variableTraits: '표정 변화(놀람, 미소, 집중), 손에 쥐는 도구(부드러운 천, 별 조각), 가죽 가방 착용 각도',
      masterPrompt: 'Cute little red fox cub named Lumi, 2.5 heads tall chibi proportion, soft apricot orange fluffy fur, white fur on chest and tail tip, large warm amber sparkling eyes, fluffy pointed fox ears with white inner fluff, rosy blushing cheeks, wearing navy blue corduroy overalls with tiny yellow star embroidery on the chest pocket, carrying a small brass-buckled leather crossbag and a glowing glass bottle necklace, adorable children book character sheet, consistent features',
      referenceAssetIds: [],
      approved: false // 예제에서는 실제 이미지 업로드 및 검수 전이므로 false 유지
    },
    {
      id: 'char_popo',
      name: '포포 (Popo)',
      role: '조연 / 친구',
      species: '아기 반달가슴곰 (Baby Bear)',
      personality: '몸집은 가장 크지만 눈물이 많고 마음이 여리며, 친구를 꼭 안아주는 것을 좋아함',
      ageAppearance: '5세 꼬마 같은 순박한 느낌',
      shape: '둥글넙적한 통통한 원형 체형',
      proportions: '2등신의 뚠뚠하고 포근한 비율',
      face: '동글동글한 코, 순진무구하고 처진 눈매',
      eyes: '도토리처럼 까맣고 동글동글한 맑은 눈',
      ears: '작고 동그란 곰 귀',
      hairOrFur: '초콜릿 브라운 색상의 복슬복슬한 곱슬 털, 가슴에 흰 반달 무늬',
      palette: ['#78350F', '#FEF08A', '#FEE2E2', '#FFFFFF'],
      clothes: '민트색 털실로 짠 따뜻한 손모아장갑과 방울 달린 털모자',
      accessories: '도토리 모양 딸랑이',
      immutableTraits: '초콜릿 브라운 곱슬 털, 가슴의 흰 반달 무늬, 2등신 둥근 체형, 민트색 털모자',
      variableTraits: '눈물 찔끔 흘리는 표정, 활짝 웃는 표정, 장갑 착용 여부',
      masterPrompt: 'Adorable baby brown bear cub named Popo, 2 heads round chubby proportion, curly chocolate brown fur, white crescent moon patch on chest, innocent round black eyes, wearing a cozy mint green knitted beanie with a pompom and matching mittens, sweet children book character style',
      referenceAssetIds: [],
      approved: false
    }
  ],

  consistencyTests: {
    char_lumi: [
      {
        testType: 'daylight_front',
        title: '테스트 1: 낮 / 정면 (기본 외형과 비율 점검)',
        prompt: 'Lumi the little fox standing in a sunlit meadow, daylight front view, 2.5 heads chibi ratio, navy overalls with star embroidery, soft orange fur, white tail tip, clear lighting, children book watercolor style',
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
        title: '테스트 2: 밤 / 측면 (조명 변화 시 색감과 귀/꼬리 형태 점검)',
        prompt: 'Lumi the little fox looking at night sky, side profile, soft moonlight lighting, glowing glass bottle necklace, fluffy pointed ears, navy overalls, consistent children book watercolor style',
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
        title: '테스트 3: 동적 액션 / 감정 변화 (표정과 멜빵바지 유지 점검)',
        prompt: 'Lumi the little fox leaping with joy, holding a tiny star, cheerful open-mouth smile, dynamic cute movement, star embroidered navy overalls intact, high-spirited children book illustration',
        checklist: {
          faceShapeMatched: false,
          eyesMatched: false,
          uniquePatternMatched: false,
          costumeMatched: false,
          proportionsMatched: false,
          artStyleMatched: false
        }
      }
    ]
  },

  storyboards: [
    {
      sceneNumber: 1,
      narrativePurpose: '도입: 주인공 소개 및 일상의 배경',
      location: '반딧불이 언덕 오솔길',
      time: '별빛이 막 뜨기 시작하는 해질녘',
      action: '작은 가방을 메고 나지막한 풀밭 언덕을 신나게 올라가는 루미',
      emotion: '설렘과 호기심 가득한 미소',
      characterIds: ['char_lumi'],
      props: ['별빛 가방', '유리병 목걸이'],
      composition: '와이드 샷 (오른쪽 언덕으로 걸어가는 루미의 뒷모습과 옆모습)',
      camera: '약간 로우 앵글, 하늘의 웅장함을 살림',
      lighting: '노을의 보랏빛과 언덕 위 풀잎의 황금빛 테두리',
      text: '반딧불이 언덕에 밤이 찾아오면, 작은 여우 루미는 별빛 가방을 메고 살금살금 언덕을 올랐어요.',
      textPlacement: 'top',
      continuityNotes: '루미의 남색 멜빵바지 별 자수가 보이고, 가방은 오른쪽 어깨에 멘 상태 유지',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 2,
      narrativePurpose: '일상: 루미의 특별한 역할(별빛 수선) 묘사',
      location: '커다란 참나무 둥치 아래 작업 벤치',
      time: '푸른 어스름이 깔린 초저녁',
      action: '작은 통나무 의자에 앉아 부드러운 천으로 떨어진 작은 별 조각을 호호 불며 닦는 루미',
      emotion: '정성스럽고 다정한 집중',
      characterIds: ['char_lumi'],
      props: ['별 조각 바구니', '부드러운 흰 천', '작은 돋보기'],
      composition: '미디엄 클로즈업 샷 (루미의 손과 별빛의 따뜻한 반사)',
      camera: '아이레벨 쿼터뷰 (친근하고 아늑한 시선)',
      lighting: '희미하게 빛나는 별 조각의 부드러운 노란빛이 루미의 얼굴을 비춤',
      text: '루미는 하늘에서 톡 떨어진 차가운 별 조각들을 호호 불어 닦아주는 별빛 수선공이랍니다.',
      textPlacement: 'bottom',
      continuityNotes: '작업 중에도 멜빵바지와 유리병 목걸이 착용 유지',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 3,
      narrativePurpose: '사건 발생: 위기의 시작(길잡이 큰 별의 추락)',
      location: '언덕 꼭대기 밤하늘과 풀밭',
      time: '바람이 세차게 부는 깊은 밤',
      action: '하늘에서 커다란 유성이 꼬리를 끌며 숲속 풀밭으로 쿵 떨어져 놀란 루미',
      emotion: '깜짝 놀람, 토끼 눈이 됨',
      characterIds: ['char_lumi'],
      props: ['빛을 잃고 식어가는 커다란 별 조각'],
      composition: '다이내믹 풀샷 (화면 위에서 아래로 떨어지는 별의 궤적과 놀란 루미)',
      camera: '하이 앵글에서 언덕 전체를 조망',
      lighting: '차갑고 푸르스름한 밤바람과 잦아드는 별빛 잔상',
      text: '쏴아아- 심술궂은 밤바람이 불어오더니, 하늘에서 가장 눈부시던 길잡이 큰 별이 툭 떨어지고 말았어요!',
      textPlacement: 'top',
      continuityNotes: '바람에 루미의 귀와 꼬리 털이 휘날림',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 4,
      narrativePurpose: '갈등 심화: 친구의 곤경과 어둠의 공포',
      location: '어두컴컴한 가시덤불 길목',
      time: '별빛이 꺼져 새까만 어둠',
      action: '길을 잃고 주저앉아 눈물을 훔치는 아기 곰 포포를 발견한 루미',
      emotion: '불안, 슬픔, 그리고 친구를 향한 걱정',
      characterIds: ['char_lumi', 'char_popo'],
      props: ['길 잃은 도토리 바구니'],
      composition: '투 샷 (울고 있는 포포에게 다가가 손을 내미는 루미)',
      camera: '정면 눈높이, 두 캐릭터의 표정에 집중',
      lighting: '루미 목걸이의 희미한 한 줄기 빛만이 두 친구를 비춤',
      text: '"어떡하지? 숲이 너무 캄캄해서 집으로 가는 길을 잃어버렸어!" 아기 곰 포포가 훌쩍이며 울먹였어요.',
      textPlacement: 'bottom',
      continuityNotes: '포포의 민트색 털모자와 털장갑 착용 확인',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 5,
      narrativePurpose: '시련: 주인공 혼자만의 노력으로는 한계에 부딪힘',
      location: '풀밭 중앙, 식어버린 큰 별 앞',
      time: '새벽을 앞둔 차가운 밤',
      action: '양손으로 큰 별을 감싸 쥐고 연신 입김을 불어넣지만 여전히 차가운 푸른빛에 속상해하는 루미',
      emotion: '안타까움, 조급함, 좌절감',
      characterIds: ['char_lumi', 'char_popo'],
      props: ['차갑게 굳어버린 크고 뾰족한 회색 별'],
      composition: '미디엄 샷 (별을 둘러싼 루미와 뒤에서 걱정스레 바라보는 포포)',
      camera: '정면 약간 클로즈업',
      lighting: '차갑고 푸른 냉기 조명',
      text: '루미는 큰 별을 품에 안고 따뜻한 입김을 후- 불어넣었지만, 큰 별은 여전히 얼음처럼 차가웠어요.',
      textPlacement: 'top',
      continuityNotes: '별 조각의 크기가 루미 품에 가득 찰 만큼 큼직함',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 6,
      narrativePurpose: '전환: 새로운 조력자의 등장과 자발적 나눔',
      location: '풀밭 중앙',
      time: '어둠 속 희망이 생기는 순간',
      action: '다람쥐 치치가 헐레벌떡 달려와 자신의 따뜻한 빨간 털모자를 벗어 별 모서리에 씌워줌',
      emotion: '용기와 나눔, 희망',
      characterIds: ['char_lumi', 'char_popo'],
      props: ['치치의 빨간 털모자', '마른 나뭇잎'],
      composition: '로우 앵글 세 친구 집결 샷',
      camera: '친밀한 미디엄 샷',
      lighting: '점점 따뜻해지는 호박색 광원',
      text: '"루미야, 내 따뜻한 털모자도 별님에게 씌워줄게!" 다람쥐 치치가 달려와 모자를 벗어주었어요.',
      textPlacement: 'bottom',
      continuityNotes: '치치의 빠른 움직임과 친구들의 놀란 표정',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 7,
      narrativePurpose: '협력: 모두의 온기가 합쳐져 일어나는 기적',
      location: '풀밭 중앙',
      time: '밤하늘 공기가 따스해짐',
      action: '포포의 커다란 발, 치치의 작은 손, 루미의 부드러운 손이 별을 함께 꼭 감싸 쥐자 작은 불씨가 퐁 피어남',
      emotion: '감격, 벅찬 기대감, 친구들과의 일체감',
      characterIds: ['char_lumi', 'char_popo'],
      props: ['빛나기 시작하는 별 조각', '작은 황금 불씨들'],
      composition: '익스트림 클로즈업 샷 (세 동물 친구들의 맞잡은 손과 심장처럼 뛰는 황금 불씨)',
      camera: '탑뷰 버드아이 시점',
      lighting: '황금빛과 코랄 핑크빛이 뿜어져 나오는 극적인 발광',
      text: '포포의 포근한 앞발, 치치의 도토리 기름, 루미의 다정한 손길이 닿자, 별 조각에서 작고 붉은 불씨가 퐁! 피어올랐어요.',
      textPlacement: 'top',
      continuityNotes: '세 동물의 털 색깔과 손 모양 대비 (주황, 갈색, 줄무늬)',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 8,
      narrativePurpose: '절정: 마침내 온 숲을 채우는 눈부신 빛의 축제',
      location: '반딧불이 언덕 전체',
      time: '황홀한 별빛 폭발의 순간',
      action: '세 친구가 환호성을 지르며 서로를 껴안고, 별에서 뿜어나온 황금빛 물결이 숲속 나무들을 환하게 물들임',
      emotion: '최고조의 환희, 기쁨, 성취감',
      characterIds: ['char_lumi', 'char_popo'],
      props: ['환하게 타오르는 길잡이 큰 별'],
      composition: '파노라마 와이드 샷 (언덕에서 숲 전체로 퍼져나가는 황금빛 오로라)',
      camera: '웅장한 롱 샷',
      lighting: '찬란한 골드 앰버와 따스한 샴페인 빛의 장관',
      text: '세 친구가 두 손을 꼭 모으고 "반짝여라, 퐁퐁!" 외치자, 눈이 부실 만큼 찬란한 황금빛이 온 숲을 비추었어요!',
      textPlacement: 'bottom',
      continuityNotes: '어두웠던 숲이 환하게 밝혀져 동물들의 집과 나무가 선명해짐',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 9,
      narrativePurpose: '해결: 별을 제자리인 하늘로 되돌려 보내는 주인공',
      location: '언덕 위 커다란 팽나무 새총 앞',
      time: '동트기 직전의 쪽빛 하늘',
      action: '루미가 팽나무의 튼튼한 가지를 힘껏 당겨 찬란해진 큰 별을 밤하늘 높은 곳으로 쏘아 올림',
      emotion: '당당한 용기와 시원한 해방감',
      characterIds: ['char_lumi', 'char_popo'],
      props: ['팽나무 나뭇가지 새총', '빛나는 큰 별'],
      composition: '로우 앵글 대각선 다이내믹 샷 (하늘을 향해 날아가는 별의 궤적)',
      camera: '올려다보는 극적인 시점',
      lighting: '하늘로 솟구치는 별빛 궤적과 은빛 꼬리',
      text: '루미는 가장 탄탄한 팽나무 가지에 별을 걸고, 하늘 가장 높은 곳을 향해 씽- 하고 쏘아 올렸어요.',
      textPlacement: 'left',
      continuityNotes: '루미의 역동적인 도약 자세와 날아가는 별의 시각 유도선',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    },
    {
      sceneNumber: 10,
      narrativePurpose: '결말과 여운: 평화의 회복과 따뜻한 우정의 잔상',
      location: '언덕 꼭대기 벤치',
      time: '별빛이 은은하게 흐르는 평화로운 새벽',
      action: '루미, 포포, 치치가 나란히 앉아 김이 모락모락 나는 따뜻한 찻잔을 들고 밤하늘을 올려다보며 미소 지음',
      emotion: '평온, 행복, 다정한 유대감',
      characterIds: ['char_lumi', 'char_popo'],
      props: ['김이 나는 도자기 찻잔 3개', '따스한 담요'],
      composition: '안정적인 미디엄 와이드 샷 (세 친구의 뒷모습과 아름다운 밤하늘의 조화)',
      camera: '평온한 수평 눈높이',
      lighting: '은은한 은빛 별빛과 따스한 찻잔의 김 서림',
      text: '밤하늘엔 다시 은빛 물결이 찰랑이고, 언덕 위 세 친구의 발그레한 뺨 위로 따스한 별빛이 소복이 내려앉았답니다.',
      textPlacement: 'top',
      continuityNotes: '세 친구가 하나의 포근한 체크무늬 담요를 함께 덮고 있음',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    }
  ],

  approvals: {
    step1_ideaApproved: false,
    step2_storyApproved: false,
    step3_styleApproved: false,
    step4_characterApproved: false,
    step5_consistencyApproved: false,
    step6_storyboardApproved: false,
    step7_illustrationsApproved: false,
    step8_publishReady: false
  }
};
