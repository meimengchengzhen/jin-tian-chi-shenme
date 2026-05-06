// 菜品图片组件：先尝试加载真实图片（Unsplash Source），失败则回退到渐变 + emoji。
// 用 onError 切到 fallback 状态，避免「红叉」破图。

import { useState } from "react";
import type { DishVisual } from "@/lib/dishVisual";

interface DishImageProps {
  visual: DishVisual;
  alt: string;
  className?: string;
  /** 大图模式：会同时显示 emoji 角标。 */
  large?: boolean;
  /** 关闭真实图片，纯渐变 + emoji（用于性能敏感的场景，如锁定中的食材小图）。 */
  noPhoto?: boolean;
}

export function DishImage({ visual, alt, className, large, noPhoto }: DishImageProps) {
  const [errored, setErrored] = useState(false);
  const showPhoto = !noPhoto && !errored;
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        background: `linear-gradient(135deg, ${visual.gradient[0]}, ${visual.gradient[1]})`,
      }}
    >
      {showPhoto && (
        <img
          src={visual.imageUrl}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* fallback：emoji 永远渲染在底层 */}
      <span
        aria-hidden
        className={`relative flex h-full w-full items-center justify-center drop-shadow-sm ${
          large ? "text-5xl sm:text-6xl" : "text-2xl"
        }`}
        style={{
          opacity: showPhoto ? 0 : 1,
          transition: "opacity 200ms",
        }}
      >
        {visual.emoji}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.32), transparent 55%)",
        }}
      />
    </div>
  );
}
