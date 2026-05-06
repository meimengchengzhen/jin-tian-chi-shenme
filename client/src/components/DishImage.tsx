// 菜品图片组件：
//  - 默认显示 images.unsplash.com 的真实菜品图。
//  - 加载失败时先切到 FALLBACK_IMAGE_URL（通用菜品图），仍失败才回到 emoji 渐变。
//  - 可用 noPhoto 强制走 emoji（性能敏感的场景小图）。
//  - 加 onLoad 控制状态，确保图加载完前不显示「红叉」。

import { useEffect, useState } from "react";
import { FALLBACK_IMAGE_URL, type DishVisual } from "@/lib/dishVisual";

interface DishImageProps {
  visual: DishVisual;
  alt: string;
  className?: string;
  /** 大图模式：会同时显示 emoji 角标。 */
  large?: boolean;
  /** 关闭真实图片，纯渐变 + emoji（用于性能敏感的场景，如锁定中的食材小图）。 */
  noPhoto?: boolean;
}

type ImgState = "loading" | "loaded" | "fallback" | "errored";

export function DishImage({ visual, alt, className, large, noPhoto }: DishImageProps) {
  const [state, setState] = useState<ImgState>("loading");

  useEffect(() => {
    setState("loading");
  }, [visual.imageUrl]);

  const showPhoto = !noPhoto && state !== "errored";
  const currentSrc = state === "fallback" ? FALLBACK_IMAGE_URL : visual.imageUrl;

  function handleError() {
    if (state === "loading" || state === "loaded") {
      setState("fallback");
    } else if (state === "fallback") {
      setState("errored");
    }
  }

  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{
        background: `linear-gradient(135deg, ${visual.gradient[0]}, ${visual.gradient[1]})`,
      }}
    >
      {showPhoto && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setState((s) => (s === "fallback" ? "fallback" : "loaded"))}
          onError={handleError}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
          style={{ opacity: state === "loaded" || state === "fallback" ? 1 : 0 }}
        />
      )}
      {/* fallback 层：emoji 永远渲染在底层；图加载完成后被覆盖 */}
      <span
        aria-hidden
        className={`relative flex h-full w-full items-center justify-center drop-shadow-sm ${
          large ? "text-5xl sm:text-6xl" : "text-2xl"
        }`}
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
