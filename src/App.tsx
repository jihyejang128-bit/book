import React, { useState, useEffect, useRef } from 'react';
import { Project } from './types/storybook';
import { loadProject, saveProject, getCurrentProjectId, setCurrentProjectId } from './services/storage';
import { SAMPLE_PROJECT } from './data/seedData';
import { Header } from './components/Header';
import { StepSidebar } from './components/StepSidebar';
import { HelpAndPromptPanel } from './components/HelpAndPromptPanel';
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { Step1Planning } from './components/steps/Step1Planning';
import { Step2Story } from './components/steps/Step2Story';
import { Step3StyleFormat } from './components/steps/Step3StyleFormat';
import { Step4CharacterBible } from './components/steps/Step4CharacterBible';
import { Step5ConsistencyTest } from './components/steps/Step5ConsistencyTest';
import { Step6Storyboard } from './components/steps/Step6Storyboard';
import { Step7Illustrations } from './components/steps/Step7Illustrations';
import { Step8Publishing } from './components/steps/Step8Publishing';

// 8단계별 멘토링 데이터
const STEP_MENTORING = {
  1: {
    author: "5~7세 아이들은 '왜?'라는 복잡한 논리보다 '앗, 이게 뭐지?' 하는 직관적 호기심과 감각적 의성어/의태어에 먼저 반응합니다. 주인공이 겪는 결핍이나 소망을 단순하고 명확하게 잡아주세요.",
    artDirector: "첫 아이디어 기획 단계에서부터 주조색(Key Color) 1~2가지를 마음속에 정해두면, 나중에 AI 프롬프트를 짤 때 그림의 분위기가 흐트러지지 않습니다.",
    tools: {
      recommendedAi: ['ChatGPT 4o', 'Claude 3.5 Sonnet', 'Gemini 1.5 Pro'],
      usageGuide: '기획 프롬프트를 복사하여 대화형 AI에 붙여넣고, 마음에 드는 아이디어를 선택하거나 조합하세요.'
    }
  },
  2: {
    author: "동화책은 어른이 읽어줄 때 소리 내어 말하는 입말의 맛이 생명입니다. 한 장면에 2~3문장 이상 길어지면 아이의 집중력이 흐려집니다. '교훈을 주입'하지 말고 아이가 주인공의 감정에 저절로 젖어 들게 하세요.",
    artDirector: "10개 장면의 시각적 리듬을 머릿속으로 그려보세요. 1~2장의 차분한 도입, 3~5장의 모험, 7~8장의 눈부신 클라이맥스 컬러 폭발, 10장의 따뜻한 귀환이 색채로 표현되어야 합니다.",
    tools: {
      recommendedAi: ['Claude 3.5 Sonnet (문체 감성 추천)', 'ChatGPT 4o'],
      usageGuide: 'JSON 형식으로 답변을 요청하면 본 웹앱에서 10장면으로 번호별 자동 분할 파싱됩니다.'
    }
  },
  3: {
    author: "유아기 그림책은 그림 자체가 또 하나의 서사 언어입니다. 따스하고 안도감을 주는 이야기라면 수채화나 파스텔을, 익살맞고 명랑한 이야기라면 3D 애니메이션이나 플랫 벡터를 선택하세요.",
    artDirector: "판형은 책의 첫인상입니다. 5~7세 베스트셀러는 정방형(1:1, 200x200mm)이 양손에 쥐기 가장 편안합니다. 인쇄 시 잘려나가는 도련 3mm를 항상 염두에 두세요.",
    tools: {
      recommendedAi: ['Midjourney v6', 'Recraft v3', 'DALL-E 3'],
      usageGuide: '선택한 스타일가이드의 영문 프롬프트 키워드와 네거티브 키워드가 후속 단계에 자동 삽입됩니다.'
    }
  },
  4: {
    author: "주인공에게 확실한 시각적 트레이드마크(예: 별 자수가 놓인 남색 멜빵바지, 쫑긋한 귀 안쪽의 흰 털)를 부여하세요. 글에서 언급되는 소품이 그림에 항상 일치해야 아이들의 몰입이 깨지지 않습니다.",
    artDirector: "캐릭터 바이블은 AI에게 건네는 가장 엄격한 약속입니다. [절대 고정 속성]은 프롬프트에서 절대 빼놓지 말고 명사형으로 꽉 잡아두어야 합니다.",
    tools: {
      recommendedAi: ['Midjourney Niji 6', 'Stable Diffusion', 'Leonardo.ai'],
      usageGuide: '4종 시트(턴어라운드, 표정, 동작, 디테일) 중 하나를 선택해 이미지를 생성하고 앱에 등록하세요.'
    }
  },
  5: {
    author: "빛과 상황이 변해도 '아, 저 친구는 루미구나!' 하고 아이가 1초 만에 알아볼 수 있어야 합니다. 밤하늘 장면에서 털 색이 검게 뭉개지지 않는지 꼭 살펴보세요.",
    artDirector: "Midjourney 사용 시 STEP 4의 기준 이미지를 URL로 첨부하고 --cw 100 또는 --cref 파라미터를 활용하면 얼굴형과 의상 일관성을 크게 높일 수 있습니다.",
    tools: {
      recommendedAi: ['Midjourney --cref', 'Stable Diffusion IP-Adapter', 'Recraft'],
      usageGuide: '낮/밤/액션 3가지 테스트 이미지를 업로드하고 6대 일관성 체크리스트를 점검하세요.'
    }
  },
  6: {
    author: "그림책에서 글자는 그림의 방해꾼이 아니라, 그림과 춤을 추는 친구입니다. 텍스트가 얹어질 공간(Negative Space)에 산만한 디테일이 생기지 않도록 구도를 미리 비워두세요.",
    artDirector: "모든 장면을 같은 거리에서 찍으면 지루해집니다. 와이드 샷으로 숲 전체를 보여주다가, 손안의 별빛은 클로즈업으로 당겨 시각적 강약을 연출하세요.",
    tools: {
      recommendedAi: ['ChatGPT 4o', 'Claude 3.5 Sonnet'],
      usageGuide: '스토리보드 계획 프롬프트로 10장면의 샷, 시점, 조명 밸런스를 검토하고 수정하세요.'
    }
  },
  7: {
    author: "AI가 그려준 그림 속에 엉뚱한 외계어 글자가 박혀있지 않은지 반드시 확인하세요! 네거티브 프롬프트에 'no text, no letters'를 넣는 이유입니다.",
    artDirector: "2페이지 펼침(Spread View)에서 왼쪽 페이지와 오른쪽 페이지의 지평선 높이나 조명 톤이 어색하게 끊어지지 않는지 한눈에 비교 검토하세요.",
    tools: {
      recommendedAi: ['Midjourney v6', 'Recraft', 'Whisk', 'DALL-E 3'],
      usageGuide: '합성된 긍정/부정 프롬프트를 1클릭 복사하여 이미지 생성 후, 각 장면 슬롯에 드래그하거나 업로드하세요.'
    }
  },
  8: {
    author: "완성된 동화책을 아이에게 처음 읽어줄 때의 감동은 그 어떤 것과도 비교할 수 없습니다. 낭독 음성을 녹음하여 Book Creator에서 함께 들어보세요.",
    artDirector: "자가출판(POD) 사이트에 주문할 때는 꼭 1권만 시험 인쇄(Proof)를 먼저 받아보세요. 모니터(RGB)와 실제 종이 인쇄물(CMYK)의 색감 차이를 육안으로 확인하는 것이 안전합니다.",
    tools: {
      recommendedAi: ['Canva (인쇄용 레이아웃)', 'Book Creator (전자책/오디오)', '부크크/교보 POD'],
      usageGuide: 'PDF 초안과 ZIP 패키지를 다운로드하여 Canva나 Book Creator에 무료로 가져와 완성하세요.'
    }
  }
};

export default function App() {
  const [project, setProject] = useState<Project>(() => {
    const curId = getCurrentProjectId();
    return loadProject(curId);
  });

  const [currentStep, setCurrentStep] = useState<number>(project.currentStep || 1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);

  // 우측 도킹 패널용 동적 프롬프트 상태
  const [dynamicPromptTitle, setDynamicPromptTitle] = useState('전문 프롬프트');
  const [dynamicPromptText, setDynamicPromptText] = useState('');

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 프로젝트 변경 시 자동 저장 (Debounce 300ms)
  const handleUpdateProject = (updated: Partial<Project>) => {
    setSaveStatus('saving');

    setProject(prev => {
      const next: Project = {
        ...prev,
        ...updated,
        currentStep: updated.currentStep || currentStep,
        updatedAt: new Date().toISOString()
      };

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        const res = saveProject(next);
        if (res.success) {
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
          console.error(res.error);
        }
      }, 300);

      return next;
    });
  };

  const handleSelectStep = (step: number) => {
    setCurrentStep(step);
    handleUpdateProject({ currentStep: step });
  };

  const handleNextStep = () => {
    if (currentStep < 8) {
      handleSelectStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      handleSelectStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectProjectFromManager = (selected: Project) => {
    setProject(selected);
    setCurrentStep(selected.currentStep || 1);
    setCurrentProjectId(selected.id);
    setSaveStatus('saved');
  };

  const currentMentoring = STEP_MENTORING[currentStep as keyof typeof STEP_MENTORING] || STEP_MENTORING[1];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-800 flex flex-col selection:bg-purple-200 selection:text-purple-900">
      {/* Top Bar Header */}
      <Header
        project={project}
        onUpdateProjectName={(name) => handleUpdateProject({ name })}
        saveStatus={saveStatus}
        onOpenProjectManager={() => setIsProjectManagerOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main App Layout: Sidebar (Left) + Workspace (Center) + Prompt & Help Panel (Right) */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {/* Step Sidebar */}
        <StepSidebar
          currentStep={currentStep}
          onSelectStep={handleSelectStep}
          project={project}
          isOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Central Workspace: Steps 1 to 8 */}
        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
          {currentStep === 1 && (
            <Step1Planning
              project={project}
              onUpdateProject={handleUpdateProject}
              onNextStep={handleNextStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}

          {currentStep === 2 && (
            <Step2Story
              project={project}
              onUpdateProject={handleUpdateProject}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}

          {currentStep === 3 && (
            <Step3StyleFormat
              project={project}
              onUpdateProject={handleUpdateProject}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}

          {currentStep === 4 && (
            <Step4CharacterBible
              project={project}
              onUpdateProject={handleUpdateProject}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}

          {currentStep === 5 && (
            <Step5ConsistencyTest
              project={project}
              onUpdateProject={handleUpdateProject}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onJumpToStep={handleSelectStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}

          {currentStep === 6 && (
            <Step6Storyboard
              project={project}
              onUpdateProject={handleUpdateProject}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}

          {currentStep === 7 && (
            <Step7Illustrations
              project={project}
              onUpdateProject={handleUpdateProject}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}

          {currentStep === 8 && (
            <Step8Publishing
              project={project}
              onUpdateProject={handleUpdateProject}
              onPrevStep={handlePrevStep}
              onSetDynamicPrompt={(title, text) => {
                setDynamicPromptTitle(title);
                setDynamicPromptText(text);
              }}
            />
          )}
        </main>

        {/* Right Help & Dynamic Prompt Inspector Dock */}
        <HelpAndPromptPanel
          currentStep={currentStep}
          promptTitle={dynamicPromptTitle}
          promptText={dynamicPromptText}
          authorTip={currentMentoring.author}
          artDirectorTip={currentMentoring.artDirector}
          externalToolAdvice={currentMentoring.tools}
          onEditPrompt={(text) => setDynamicPromptText(text)}
        />
      </div>

      {/* Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        currentProject={project}
        onSelectProject={handleSelectProjectFromManager}
      />
    </div>
  );
}
