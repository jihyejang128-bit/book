/**
 * AI 그림동화 공방 (AI Illustrated Children's Book Workshop)
 * Data Models & Type Definitions
 */

export type TargetAge = '5세' | '6세' | '7세' | '5~7세 공통';

export interface StyleGuide {
  palette: string[];
  linework: string;
  texture: string;
  lighting: string;
  backgroundDetail: string;
  negativeElements: string[];
  koreanDescription: string;
  artKeywordsEnglish: string;
}

export interface ArtStyle {
  id: string;
  name: string;
  englishName: string;
  tagline: string;
  characteristics: string[];
  recommendedGenre: string[];
  colorMood: string;
  cautions: string[];
  guide: StyleGuide;
}

export type AspectRatioType = '1:1' | '4:3' | '3:2' | 'custom';
export type PodTrimType = '200x200' | '254x190' | '210x297' | '148x210' | 'custom';

export interface FormatConfig {
  eBookRatio: AspectRatioType;
  podTrim: PodTrimType;
  customWidthMm?: number;
  customHeightMm?: number;
  bleedMm: number;        // 도련 (기본 3mm)
  safeMarginMm: number;   // 안전 여백 (기본 5mm)
  dpi: number;            // 300 DPI
  spreadType: 'single' | 'spread'; // 단면 / 양면(스프레드)
}

export interface Character {
  id: string;
  name: string;
  role: '주인공' | '조연' | '조력자' | '멘토' | string;
  species: string;            // 종 (예: 붉은 여우, 아기 곰, 꼬마 요정 등)
  personality: string;        // 성격
  ageAppearance: string;      // 외형 나이 (5세 수준의 귀여운 인상)
  shape: string;              // 실루엣 & 얼굴형 (둥글둥글한 곡선형, 타원형)
  proportions: string;        // 등신 비율 (2.5등신, 큰 머리와 통통한 손발)
  face: string;               // 얼굴 특징 (발그레한 볼, 작은 코, 웃는 입)
  eyes: string;               // 눈 (초롱초롱한 호박색 눈동자, 맑은 하이라이트)
  ears: string;               // 귀 (쫑긋 솟은 뾰족한 여우 귀, 안쪽 흰 털)
  hairOrFur: string;          // 털/헤어 (보드라운 살구빛 주황 털)
  palette: string[];          // 대표 색상 HEX 코드 리스트
  clothes: string;            // 기본 의상 (별 자수가 놓인 남색 멜빵바지)
  accessories: string;        // 소품/악세서리 (별빛을 담는 유리병 목걸이)
  immutableTraits: string;    // [절대 고정 속성]
  variableTraits: string;     // [장면별 변경 가능 속성]
  masterPrompt: string;       // 캐릭터 기본 마스터 프롬프트
  referenceAssetIds: string[]; // 업로드된 참조 이미지 ID 목록
  keyReferenceAssetId?: string; // 대표 기준 이미지 ID
  approved: boolean;          // 사용자 검수 승인 여부
  approvalChecklist?: {
    facialFeatureChecked: boolean;
    costumeChecked: boolean;
    proportionsChecked: boolean;
    keyImageSelected: boolean;
  };
}

export interface ConsistencyTest {
  testType: 'daylight_front' | 'night_side' | 'action_emotion';
  title: string;
  prompt: string;
  assetId?: string;
  checklist: {
    faceShapeMatched: boolean;
    eyesMatched: boolean;
    uniquePatternMatched: boolean;
    costumeMatched: boolean;
    proportionsMatched: boolean;
    artStyleMatched: boolean;
  };
  notes?: string;
}

export interface Storyboard {
  sceneNumber: number;        // 1 ~ 10
  narrativePurpose: string;   // 기승전결 역할 (도입, 계기, 갈등, 협력, 절정, 여운 등)
  location: string;           // 장소
  time: string;               // 시간대 / 날씨
  action: string;             // 캐릭터의 구체적인 동작
  emotion: string;            // 주요 감정선
  characterIds: string[];     // 등장 캐릭터 ID 목록
  props: string[];            // 등장 핵심 소품
  composition: string;        // 구도 (와이드, 미디엄, 클로즈업, 로우앵글 등)
  camera: string;             // 카메라 시점 (정면 아이레벨, 3/4 쿼터뷰 등)
  lighting: string;           // 조명 / 빛 (따스한 황금빛 노을광, 몽환적 별빛 등)
  text: string;               // 동화책 본문 원고 (2~3문장)
  textPlacement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  continuityNotes: string;    // 연속성 주의사항 (의상, 소품 위치 유지)
  visualPrompt: string;       // 생성된 최종 이미지 프롬프트
  negativePrompt: string;     // 제외 요소 프롬프트
  imageAssetId?: string;      // 연결된 삽화 이미지 Asset ID
  approved: boolean;          // 장면 승인 여부
}

export interface Asset {
  id: string;
  projectId: string;
  category: 'character_ref' | 'consistency_test' | 'scene_illustration' | 'cover_front' | 'cover_back';
  filename: string;
  mimeType: string;
  size: number;
  dataUrl: string;            // Base64 Data URL
  sceneNumber?: number;
  characterId?: string;
  testType?: string;
  createdAt: string;
}

export interface ProjectApprovals {
  step1_ideaApproved?: boolean;
  step2_storyApproved?: boolean;
  step3_styleApproved?: boolean;
  step4_characterApproved?: boolean;
  step5_consistencyApproved?: boolean;
  step6_storyboardApproved?: boolean;
  step7_illustrationsApproved?: boolean;
  step8_publishReady?: boolean;
}

export interface Project {
  schemaVersion: string;      // "1.0.0"
  id: string;
  name: string;               // 책 제목
  authorName: string;         // 작가명
  coverSubtitle: string;      // 표지 부제
  backCoverBlurb: string;     // 뒤표지 추천/소개글
  createdAt: string;
  updatedAt: string;
  currentStep: number;        // 1 ~ 8

  // STEP 1: 기획
  targetAge: TargetAge;
  theme: string;              // 주제 (우정, 용기, 배려 등)
  lesson: string;             // 교육적 메시지
  tone: string;               // 정서 및 분위기
  protagonistType: string;    // 주인공 유형
  pageCount: number;          // 기본 10
  storyIdea: string;          // 채택된 핵심 아이디어
  candidateIdeas?: string[];  // 생성된 3개 후보 아이디어

  // STEP 2: 스토리 개발
  logline: string;            // 3문장 로그라인
  synopsis: string;           // 기승전결 상세 시놉시스
  manuscript: string;         // 원고 전문 (10장면 묶음)

  // STEP 3: 그림 스타일 및 판형
  styleId: string;
  styleGuide: StyleGuide;
  format: FormatConfig;

  // STEP 4: 캐릭터 바이블
  characters: Character[];

  // STEP 5: 일관성 테스트
  consistencyTests: Record<string, ConsistencyTest[]>; // characterId -> 3 tests

  // STEP 6: 스토리보드 (10장면)
  storyboards: Storyboard[];

  // STEP 8: 표지 및 출판 자산
  coverFrontAssetId?: string;
  coverBackAssetId?: string;

  // 전체 승인 상태
  approvals: ProjectApprovals;
}
