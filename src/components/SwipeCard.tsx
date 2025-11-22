import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { X, Heart } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = "",
}: SwipeCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const threshold = window.innerWidth * 0.3;

    const draggableInstance = Draggable.create(card, {
      type: "x,y",
      edgeResistance: 0.65,
      bounds: { minX: -threshold * 2, maxX: threshold * 2 },
      inertia: true,
      onDragStart: () => setIsDragging(true),
      onDrag: function () {
        const x = this.x;
        const rotation = (x / threshold) * 15;
        gsap.to(card, { rotation, duration: 0.1 });
      },
      onDragEnd: function () {
        const x = this.x;
        setIsDragging(false);

        if (Math.abs(x) > threshold) {
          const direction = x > 0 ? 1 : -1;
          gsap.to(card, {
            x: direction * window.innerWidth,
            rotation: direction * 30,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              if (direction > 0 && onSwipeRight) {
                onSwipeRight();
              } else if (direction < 0 && onSwipeLeft) {
                onSwipeLeft();
              }
              gsap.set(card, { x: 0, y: 0, rotation: 0, opacity: 1 });
            },
          });
        } else {
          gsap.to(card, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.4,
            ease: "elastic.out(1, 0.5)",
          });
        }
      },
    });

    return () => {
      if (draggableInstance && draggableInstance[0]) {
        draggableInstance[0].kill();
      }
    };
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <div className="relative w-full max-w-md mx-auto" style={{ touchAction: "none" }}>
      <div
        ref={cardRef}
        className={`cursor-grab active:cursor-grabbing ${
          isDragging ? "z-50" : ""
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

interface SwipeButtonsProps {
  onReject: () => void;
  onAccept: () => void;
}

export const SwipeButtons = ({ onReject, onAccept }: SwipeButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-8 mt-6 md:mt-8">
      <button
        onClick={onReject}
        className="group relative w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-destructive bg-card hover:bg-destructive/10 transition-smooth shadow-card active:scale-95"
        aria-label="Reject"
      >
        <X className="w-7 h-7 md:w-8 md:h-8 text-destructive absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={onAccept}
        className="group relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-success bg-card hover:bg-success/10 transition-smooth shadow-glow active:scale-95"
        aria-label="Accept"
      >
        <Heart className="w-8 h-8 md:w-10 md:h-10 text-success absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};
