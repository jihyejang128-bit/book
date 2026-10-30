import React from 'react';
import { X, Download, Trash2, ZoomIn } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  onDelete?: () => void;
  onDownload?: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = '이미지 미리보기',
  subtitle,
  onDelete,
  onDownload
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${title.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 id="image-modal-title" className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-purple-600" />
              {title}
            </h3>
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
              title="이미지 다운로드"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">다운로드</span>
            </button>

            {onDelete && (
              <button
                onClick={() => {
                  if (confirm('이 이미지를 삭제하시겠습니까?')) {
                    onDelete();
                    onClose();
                  }
                }}
                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
                title="이미지 삭제"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">삭제</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-950/5 min-h-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
