import React from 'react';

interface StyleSvgPreviewProps {
  styleId: string;
  className?: string;
}

/**
 * 그림 스타일 8종의 미적 특성을 표현하는 순수 인라인 SVG 그래픽 도해
 * 외부 이미지 URL 없이 동작하며, AI 생성 삽화로 오인되지 않도록 구조적 도해로 디자인
 */
export const StyleSvgPreview: React.FC<StyleSvgPreviewProps> = ({ styleId, className = 'w-full h-32' }) => {
  switch (styleId) {
    case 'watercolor':
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="wc-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
            </filter>
            <linearGradient id="wc-sky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C7CEEA" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#F6D186" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#A7D7C5" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="#FAF5EE" />
          <circle cx="60" cy="50" r="35" fill="url(#wc-sky)" filter="url(#wc-blur)" />
          <path d="M 30 110 Q 70 60 120 85 T 180 90 L 200 120 L 0 120 Z" fill="#A7D7C5" opacity="0.65" filter="url(#wc-blur)" />
          <path d="M 90 120 Q 130 75 170 95 L 200 120 Z" fill="#F4A261" opacity="0.5" filter="url(#wc-blur)" />
          {/* 부드러운 연필선 터치 */}
          <path d="M 45 48 C 55 35, 75 35, 85 45 C 90 55, 70 70, 50 60 Z" fill="none" stroke="#8C7A6B" strokeWidth="1.2" strokeDasharray="3,1" opacity="0.7" />
          <circle cx="65" cy="45" r="2" fill="#5C4D3C" />
          {/* 번진 물방울 */}
          <circle cx="140" cy="35" r="5" fill="#F6D186" opacity="0.6" />
          <circle cx="155" cy="42" r="3" fill="#C7CEEA" opacity="0.5" />
        </svg>
      );

    case '3d_animation':
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="c-sphere" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FFEAA7" />
              <stop offset="40%" stopColor="#FF9F43" />
              <stop offset="90%" stopColor="#D35400" />
            </radialGradient>
            <radialGradient id="c-blue-sphere" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#74B9FF" />
              <stop offset="60%" stopColor="#0984E3" />
              <stop offset="100%" stopColor="#1B1464" />
            </radialGradient>
            <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
              <feOffset dx="0" dy="6" result="offsetblur" />
              <feComponentTransfer><feFuncA type="linear" slope="0.25" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="200" height="120" fill="#F1F2F6" />
          {/* 점토 바닥 그림자 */}
          <ellipse cx="80" cy="98" rx="35" ry="9" fill="#CED6E0" opacity="0.6" />
          <ellipse cx="145" cy="100" rx="25" ry="7" fill="#CED6E0" opacity="0.6" />
          {/* 둥근 클레이 구체 캐릭터 실루엣 */}
          <circle cx="80" cy="65" r="32" fill="url(#c-sphere)" filter="url(#soft-shadow)" />
          {/* 귀여운 동물 귀 */}
          <ellipse cx="60" cy="36" rx="8" ry="14" fill="#FF9F43" transform="rotate(-20 60 36)" />
          <ellipse cx="100" cy="36" rx="8" ry="14" fill="#FF9F43" transform="rotate(20 100 36)" />
          {/* 보드라운 작은 클레이 공 */}
          <circle cx="145" cy="78" r="22" fill="url(#c-blue-sphere)" filter="url(#soft-shadow)" />
          {/* 하이라이트 림 라이트 */}
          <circle cx="72" cy="56" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="88" cy="56" r="3" fill="#FFFFFF" opacity="0.9" />
          <path d="M 76 68 Q 80 72 84 68" fill="none" stroke="#6C3483" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'gouache':
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" fill="#EAE7D6" />
          {/* 도톰한 평붓 스트로크 느낌 */}
          <path d="M 10 95 Q 60 85 110 92 T 190 88" stroke="#2D4059" strokeWidth="18" strokeLinecap="square" fill="none" opacity="0.9" />
          <path d="M 20 70 Q 75 60 130 68 T 195 62" stroke="#EA5455" strokeWidth="22" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M 30 40 Q 90 32 150 42" stroke="#FFD460" strokeWidth="26" strokeLinecap="square" fill="none" opacity="0.9" />
          <path d="M 70 20 Q 110 15 170 24" stroke="#8E9A82" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.85" />
          {/* 단순화된 식물 형태 구아슈 실루엣 */}
          <circle cx="75" cy="62" r="14" fill="#2D4059" />
          <path d="M 75 76 L 75 105" stroke="#2D4059" strokeWidth="3" />
          <ellipse cx="65" cy="85" rx="6" ry="3" fill="#8E9A82" transform="rotate(-30 65 85)" />
          <ellipse cx="85" cy="90" rx="6" ry="3" fill="#8E9A82" transform="rotate(30 85 90)" />
        </svg>
      );

    case 'anime':
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="anime-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2F80ED" />
              <stop offset="70%" stopColor="#56CCF2" />
              <stop offset="100%" stopColor="#E0F7FA" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#anime-sky)" />
          {/* 뭉게구름 */}
          <path d="M 100 80 Q 110 50 135 55 Q 155 45 175 60 Q 190 70 195 85 Q 170 95 100 80 Z" fill="#FFFFFF" opacity="0.95" />
          <path d="M 125 78 Q 135 60 150 63 Q 165 58 175 70 Q 160 80 125 78 Z" fill="#E1F5FE" />
          {/* 풀밭 언덕과 한 줄기 빛 */}
          <path d="M -10 120 Q 60 85 140 100 T 210 95 L 210 120 Z" fill="#27AE60" />
          <path d="M 20 120 Q 90 98 160 110 L 210 120 Z" fill="#2ECC71" />
          {/* 틴들 현상 빛줄기 */}
          <polygon points="30,0 70,0 120,120 70,120" fill="#FFFFFF" opacity="0.15" />
          <polygon points="80,0 110,0 170,120 130,120" fill="#FFFFFF" opacity="0.12" />
          {/* 날아가는 작은 새 실루엣 */}
          <path d="M 75 35 Q 80 30 85 35 Q 90 30 95 35" fill="none" stroke="#1A365D" strokeWidth="1.2" />
          <path d="M 90 42 Q 93 38 97 42 Q 101 38 105 42" fill="none" stroke="#1A365D" strokeWidth="1" />
        </svg>
      );

    case 'colored_pencil':
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" fill="#FAF6EE" />
          {/* 해칭 사선 패턴 */}
          <g stroke="#F28482" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
            <line x1="30" y1="40" x2="55" y2="15" />
            <line x1="35" y1="45" x2="60" y2="20" />
            <line x1="40" y1="50" x2="65" y2="25" />
            <line x1="45" y1="55" x2="70" y2="30" />
            <line x1="50" y1="60" x2="75" y2="35" />
          </g>
          <g stroke="#84A59D" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
            <line x1="110" y1="90" x2="135" y2="65" />
            <line x1="115" y1="95" x2="140" y2="70" />
            <line x1="120" y1="100" x2="145" y2="75" />
            <line x1="125" y1="105" x2="150" y2="80" />
            <line x1="130" y1="110" x2="155" y2="85" />
          </g>
          {/* 손그림 느낌의 곰/동물 스케치 라인 */}
          <ellipse cx="90" cy="65" rx="26" ry="22" fill="#F7EDE2" stroke="#6B705C" strokeWidth="1.5" strokeDasharray="6,2" />
          <circle cx="75" cy="46" r="7" fill="#F7EDE2" stroke="#6B705C" strokeWidth="1.5" />
          <circle cx="105" cy="46" r="7" fill="#F7EDE2" stroke="#6B705C" strokeWidth="1.5" />
          <circle cx="83" cy="63" r="2.5" fill="#4A4E69" />
          <circle cx="97" cy="63" r="2.5" fill="#4A4E69" />
          <ellipse cx="90" cy="70" rx="3" ry="2" fill="#E07A5F" />
        </svg>
      );

    case 'flat_vector':
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" fill="#F4F1DE" />
          {/* 기하학적 블록 컴포지션 */}
          <circle cx="65" cy="65" r="38" fill="#E07A5F" />
          <rect x="95" y="40" width="60" height="60" fill="#3D405B" rx="8" />
          <polygon points="125,15 155,55 95,55" fill="#81B29A" />
          <path d="M 40 95 A 35 35 0 0 0 90 95 Z" fill="#F2CC8F" />
          {/* 미니멀한 그래픽 디테일 */}
          <circle cx="125" cy="70" r="12" fill="#F4F1DE" />
          <line x1="55" y1="55" x2="75" y2="55" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'paper_collage':
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="paper-drop" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#073B4C" floodOpacity="0.25" />
            </filter>
          </defs>
          <rect width="200" height="120" fill="#FFFBEB" />
          {/* 겹겹이 오려 붙인 종이 단면 */}
          <path d="M -10 120 L 40 70 L 95 85 L 140 60 L 210 100 L 210 120 Z" fill="#118AB2" filter="url(#paper-drop)" />
          <path d="M 15 120 L 60 80 L 115 95 L 165 75 L 210 115 L 210 120 Z" fill="#06D6A0" filter="url(#paper-drop)" />
          {/* 오려낸 태양과 구름 조각 */}
          <polygon points="45,20 60,30 55,48 35,48 30,30" fill="#FFD166" filter="url(#paper-drop)" />
          <path d="M 105 35 L 125 25 L 150 30 L 165 42 L 135 48 Z" fill="#EF476F" filter="url(#paper-drop)" />
        </svg>
      );

    case 'pastel':
    default:
      return (
        <svg viewBox="0 0 200 120" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="pastel-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="1" />
              <stop offset="50%" stopColor="#FDE2E4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#DFCCF1" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="200" height="120" fill="#EBF4F6" />
          {/* 몽환적 파스텔 구름 */}
          <circle cx="70" cy="55" r="45" fill="url(#pastel-glow)" />
          <circle cx="130" cy="65" r="40" fill="#DFCCF1" opacity="0.6" />
          <circle cx="100" cy="75" r="35" fill="#FDE2E4" opacity="0.7" />
          {/* 반짝이는 별빛 */}
          <path d="M 70 30 L 73 40 L 83 43 L 73 46 L 70 56 L 67 46 L 57 43 L 67 40 Z" fill="#FFEAA7" />
          <path d="M 140 45 L 142 50 L 147 52 L 142 54 L 140 59 L 138 54 L 133 52 L 138 50 Z" fill="#FFEAA7" />
          <circle cx="105" cy="40" r="2.5" fill="#FFFFFF" />
          <circle cx="50" cy="70" r="2" fill="#FFFFFF" />
        </svg>
      );
  }
};
