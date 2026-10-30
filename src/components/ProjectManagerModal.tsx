import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, FolderOpen, Download, Upload, Trash2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Project } from '../types/storybook';
import {
  getProjectsMetaList,
  ProjectMeta,
  createNewProject,
  deleteProject,
  exportProjectJson,
  importProjectJson,
  loadProject
} from '../services/storage';
import { SAMPLE_PROJECT } from '../data/seedData';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project;
  onSelectProject: (project: Project) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onSelectProject
}) => {
  const [projectList, setProjectList] = useState<ProjectMeta[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setStatusMsg(null);
    }
  }, [isOpen]);

  const refreshList = () => {
    const list = getProjectsMetaList();
    setProjectList(list);
  };

  if (!isOpen) return null;

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim() || '새 그림동화';
    const project = createNewProject(name);
    setNewProjectName('');
    refreshList();
    onSelectProject(project);
    setStatusMsg({ text: `"${name}" 프로젝트가 생성되었습니다.` });
  };

  const handleLoadSample = () => {
    // 예제 프로젝트 불러오기 (이미 있으면 로드, 없으면 새로 생성)
    const existing = projectList.find(p => p.id === SAMPLE_PROJECT.id);
    if (existing) {
      const p = loadProject(SAMPLE_PROJECT.id);
      onSelectProject(p);
    } else {
      const p = { ...SAMPLE_PROJECT, updatedAt: new Date().toISOString() };
      createNewProject(p.name);
      onSelectProject(p);
    }
    refreshList();
    setStatusMsg({ text: '예제 프로젝트 "별빛을 수선하는 작은 여우"를 불러왔습니다.' });
  };

  const handleSelect = (id: string) => {
    const p = loadProject(id);
    onSelectProject(p);
    onClose();
  };

  const handleDelete = (id: string, name: string) => {
    if (projectList.length <= 1) {
      alert('최소 1개의 프로젝트가 유지되어야 합니다.');
      return;
    }
    if (confirm(`"${name}" 프로젝트를 완전히 삭제하시겠습니까? (삭제된 데이터는 복구할 수 없습니다)`)) {
      deleteProject(id);
      refreshList();
      const updatedList = getProjectsMetaList();
      if (updatedList.length > 0) {
        onSelectProject(loadProject(updatedList[0].id));
      }
      setStatusMsg({ text: `"${name}" 프로젝트가 삭제되었습니다.` });
    }
  };

  const handleExportJson = async (includeImages: boolean) => {
    setIsExporting(true);
    setStatusMsg(null);
    try {
      const result = await exportProjectJson(currentProject, includeImages);
      const blob = new Blob([result.jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name || '동화'}_백업_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const sizeKb = (result.sizeBytes / 1024).toFixed(1);
      setStatusMsg({
        text: `JSON 파일 내보내기 완료 (${sizeKb} KB)${result.warning ? ` · ${result.warning}` : ''}`
      });
    } catch (e: any) {
      setStatusMsg({ text: '내보내기 실패: ' + (e?.message || '알 수 없는 오류'), isError: true });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await importProjectJson(text);
      if (result.success && result.project) {
        refreshList();
        onSelectProject(result.project);
        setStatusMsg({ text: `"${result.project.name}" 프로젝트를 성공적으로 복원했습니다.` });
      } else {
        setStatusMsg({ text: result.error || '프로젝트 복원 실패', isError: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: '파일 읽기 오류: ' + (err?.message || ''), isError: true });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-manager-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 id="project-manager-title" className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-purple-600" />
              프로젝트 관리 및 데이터 백업
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              브라우저 로컬 저장소와 IndexedDB에 안전하게 분리 보관됩니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`px-6 py-2.5 text-xs flex items-center gap-2 ${
            statusMsg.isError ? 'bg-rose-50 text-rose-700 border-b border-rose-200' : 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
          }`}>
            {statusMsg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* New Project Form */}
          <form onSubmit={handleCreateNew} className="flex gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="새 동화책 제목 입력..."
              className="flex-1 px-4 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              새 프로젝트
            </button>
          </form>

          {/* Project List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-stone-500 tracking-wide">
                내 프로젝트 목록 ({projectList.length}개)
              </h4>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-xs text-purple-700 hover:text-purple-800 font-medium flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                예제 작품(별빛을 수선하는 여우) 불러오기
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {projectList.map((p) => {
                const isActive = p.id === currentProject.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? 'border-purple-300 bg-purple-50/70 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                    }`}
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleSelect(p.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-stone-900 truncate">
                          {p.name}
                        </span>
                        {isActive && (
                          <span className="text-[11px] font-medium text-purple-700">
                            [현재 작업 중]
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span>{p.targetAge}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.currentStep}단계 진행 중</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(p.updatedAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {!isActive && (
                        <button
                          onClick={() => handleSelect(p.id)}
                          className="px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200/80 rounded-lg transition-colors"
                        >
                          열기
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="프로젝트 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup & Restore Tools */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <h4 className="text-xs font-semibold text-stone-700">
              데이터 백업 및 JSON 복원
            </h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              작업 중인 프로젝트를 JSON 파일로 내보내어 안전하게 보관하거나, 다른 컴퓨터에서 가져오기로 즉시 이어할 수 있습니다.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleExportJson(true)}
                disabled={isExporting}
                className="px-3.5 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                {isExporting ? '압축 중...' : '전체 백업 (이미지 포함 JSON)'}
              </button>

              <button
                type="button"
                onClick={() => handleExportJson(false)}
                disabled={isExporting}
                className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                텍스트만 가볍게 백업
              </button>

              <label className="px-3.5 py-2 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-stone-600" />
                JSON 파일 가져오기
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-200/80 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
