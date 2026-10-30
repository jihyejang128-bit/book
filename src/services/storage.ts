import { Asset, Project } from '../types/storybook';
import { SAMPLE_PROJECT } from '../data/seedData';

const DB_NAME = 'ai_storybook_db';
const DB_VERSION = 1;
const ASSETS_STORE = 'assets';
const PROJECTS_KEY = 'ai_storybook_projects_meta';
const CURRENT_PROJECT_ID_KEY = 'ai_storybook_current_project_id';
const PROJECT_PREFIX = 'ai_storybook_project_';

/**
 * IndexedDB 연결 초기화
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB를 지원하지 않는 브라우저 환경입니다.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        const store = db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB 연결 실패'));
  });
}

/**
 * 이미지 에셋 저장 (IndexedDB)
 */
export async function saveAssetToIndexedDB(asset: Asset): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readwrite');
    const store = tx.objectStore(ASSETS_STORE);
    const req = store.put(asset);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error('이미지 에셋 저장 실패'));
  });
}

/**
 * 이미지 에셋 단건 조회 (IndexedDB)
 */
export async function getAssetFromIndexedDB(id: string): Promise<Asset | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readonly');
    const store = tx.objectStore(ASSETS_STORE);
    const req = store.get(id);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error('이미지 에셋 조회 실패'));
  });
}

/**
 * 특정 프로젝트의 모든 이미지 에셋 조회
 */
export async function getProjectAssetsFromIndexedDB(projectId: string): Promise<Asset[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readonly');
    const store = tx.objectStore(ASSETS_STORE);
    const index = store.index('projectId');
    const req = index.getAll(projectId);

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error || new Error('프로젝트 에셋 목록 조회 실패'));
  });
}

/**
 * 이미지 에셋 삭제
 */
export async function deleteAssetFromIndexedDB(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ASSETS_STORE, 'readwrite');
    const store = tx.objectStore(ASSETS_STORE);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error('에셋 삭제 실패'));
  });
}

// ----------------------------------------------------
// LocalStorage 프로젝트 관리
// ----------------------------------------------------

export interface ProjectMeta {
  id: string;
  name: string;
  targetAge: string;
  updatedAt: string;
  currentStep: number;
  theme: string;
}

/**
 * 저장된 모든 프로젝트 메타 목록 조회
 */
export function getProjectsMetaList(): ProjectMeta[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) {
      // 최초 실행 시 예제 프로젝트 메타 등록
      const initialList: ProjectMeta[] = [
        {
          id: SAMPLE_PROJECT.id,
          name: SAMPLE_PROJECT.name,
          targetAge: SAMPLE_PROJECT.targetAge,
          updatedAt: SAMPLE_PROJECT.updatedAt,
          currentStep: SAMPLE_PROJECT.currentStep,
          theme: SAMPLE_PROJECT.theme
        }
      ];
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(initialList));
      localStorage.setItem(`${PROJECT_PREFIX}${SAMPLE_PROJECT.id}`, JSON.stringify(SAMPLE_PROJECT));
      return initialList;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('프로젝트 목록 로드 실패:', e);
    return [];
  }
}

/**
 * 현재 활성화된 프로젝트 ID 조회
 */
export function getCurrentProjectId(): string {
  try {
    const current = localStorage.getItem(CURRENT_PROJECT_ID_KEY);
    if (current) return current;
    const list = getProjectsMetaList();
    if (list.length > 0) {
      localStorage.setItem(CURRENT_PROJECT_ID_KEY, list[0].id);
      return list[0].id;
    }
  } catch (e) {
    console.error(e);
  }
  return SAMPLE_PROJECT.id;
}

/**
 * 활성 프로젝트 ID 설정
 */
export function setCurrentProjectId(id: string): void {
  localStorage.setItem(CURRENT_PROJECT_ID_KEY, id);
}

/**
 * 프로젝트 단건 로드 (LocalStorage)
 */
export function loadProject(id: string): Project {
  try {
    const raw = localStorage.getItem(`${PROJECT_PREFIX}${id}`);
    if (raw) {
      return JSON.parse(raw);
    }
    if (id === SAMPLE_PROJECT.id) {
      return { ...SAMPLE_PROJECT };
    }
  } catch (e) {
    console.error('프로젝트 로드 오류:', e);
  }
  return { ...SAMPLE_PROJECT, id };
}

/**
 * 프로젝트 저장 (LocalStorage + 메타 갱신)
 */
export function saveProject(project: Project): { success: boolean; error?: string } {
  try {
    const updatedProject = {
      ...project,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(`${PROJECT_PREFIX}${project.id}`, JSON.stringify(updatedProject));

    // 메타 목록 동기화
    const list = getProjectsMetaList();
    const existingIndex = list.findIndex(p => p.id === project.id);
    const meta: ProjectMeta = {
      id: project.id,
      name: project.name || '제목 없음',
      targetAge: project.targetAge || '5~7세',
      updatedAt: updatedProject.updatedAt,
      currentStep: project.currentStep,
      theme: project.theme || ''
    };

    if (existingIndex >= 0) {
      list[existingIndex] = meta;
    } else {
      list.unshift(meta);
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));

    return { success: true };
  } catch (e: any) {
    console.error('프로젝트 저장 실패:', e);
    return {
      success: false,
      error: e?.name === 'QuotaExceededError'
        ? '브라우저 LocalStorage 용량이 초과되었습니다. 필요 없는 프로젝트를 정리하거나 JSON 백업 후 삭제하세요.'
        : '저장 중 오류가 발생했습니다: ' + (e?.message || '알 수 없는 오류')
    };
  }
}

/**
 * 새 프로젝트 생성
 */
export function createNewProject(name: string = '새 그림동화'): Project {
  const newId = 'project_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  const newProject: Project = {
    ...SAMPLE_PROJECT,
    id: newId,
    name,
    authorName: '창작자',
    coverSubtitle: '',
    backCoverBlurb: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1,
    storyIdea: '',
    candidateIdeas: [],
    logline: '',
    synopsis: '',
    manuscript: `1. 
2. 
3. 
4. 
5. 
6. 
7. 
8. 
9. 
10. `,
    characters: [],
    consistencyTests: {},
    storyboards: Array.from({ length: 10 }, (_, i) => ({
      sceneNumber: i + 1,
      narrativePurpose: `장면 ${i + 1}`,
      location: '',
      time: '',
      action: '',
      emotion: '',
      characterIds: [],
      props: [],
      composition: '미디엄 샷',
      camera: '정면 아이레벨',
      lighting: '자연광',
      text: '',
      textPlacement: 'bottom',
      continuityNotes: '',
      visualPrompt: '',
      negativePrompt: '',
      approved: false
    })),
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

  saveProject(newProject);
  setCurrentProjectId(newId);
  return newProject;
}

/**
 * 프로젝트 삭제
 */
export function deleteProject(id: string): void {
  try {
    localStorage.removeItem(`${PROJECT_PREFIX}${id}`);
    const list = getProjectsMetaList().filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
    if (getCurrentProjectId() === id) {
      if (list.length > 0) {
        setCurrentProjectId(list[0].id);
      } else {
        const fresh = createNewProject('내 첫 그림동화');
        setCurrentProjectId(fresh.id);
      }
    }
  } catch (e) {
    console.error('프로젝트 삭제 실패:', e);
  }
}

/**
 * 프로젝트 JSON 내보내기 (이미지 포함 여부 옵션)
 */
export async function exportProjectJson(
  project: Project,
  includeImages: boolean = true
): Promise<{ jsonString: string; sizeBytes: number; warning?: string }> {
  let assets: Asset[] = [];
  let warning: string | undefined;

  if (includeImages) {
    try {
      assets = await getProjectAssetsFromIndexedDB(project.id);
    } catch (e) {
      console.warn('에셋 로드 중 오류:', e);
      warning = '일부 이미지 에셋을 가져오지 못했습니다. 텍스트 데이터 위주로 백업됩니다.';
    }
  }

  const exportPayload = {
    app: 'ai_picturebook_workshop',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    project,
    assets: includeImages ? assets : []
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const sizeBytes = new Blob([jsonString]).size;

  if (sizeBytes > 25 * 1024 * 1024) {
    warning = `백업 파일 크기가 ${(sizeBytes / (1024 * 1024)).toFixed(1)}MB로 큽니다. 브라우저에 따라 다운로드가 지연될 수 있습니다.`;
  }

  return { jsonString, sizeBytes, warning };
}

/**
 * 프로젝트 JSON 가져오기
 */
export async function importProjectJson(
  jsonString: string
): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || (!parsed.project && !parsed.id)) {
      return { success: false, error: '유효한 AI 그림동화 공방 프로젝트 파일 형식이 아닙니다.' };
    }

    const importedProject: Project = parsed.project || parsed;

    // 버전 체크 및 기본값 보정
    if (!importedProject.id || !importedProject.name) {
      return { success: false, error: '프로젝트 필수 정보(ID, 제목)가 누락되었습니다.' };
    }

    // ID 충돌 방지: 기존 프로젝트와 겹칠 경우 새 ID 발급
    const existingMeta = getProjectsMetaList();
    if (existingMeta.some(m => m.id === importedProject.id)) {
      importedProject.id = importedProject.id + '_복사본_' + Date.now().toString(36);
      importedProject.name = importedProject.name + ' (가져옴)';
    }

    // 에셋 복원 (IndexedDB)
    if (Array.isArray(parsed.assets) && parsed.assets.length > 0) {
      for (const asset of parsed.assets) {
        if (asset && asset.id && asset.dataUrl) {
          asset.projectId = importedProject.id;
          await saveAssetToIndexedDB(asset);
        }
      }
    }

    saveProject(importedProject);
    setCurrentProjectId(importedProject.id);

    return { success: true, project: importedProject };
  } catch (e: any) {
    return { success: false, error: 'JSON 파싱 오류: ' + (e?.message || '파일이 손상되었거나 올바르지 않습니다.') };
  }
}
