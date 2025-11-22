import { Instagram, Github } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="flex flex-col items-center justify-center gap-2 md:gap-4">
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            © 2025 All rights reserved <span className="font-semibold text-foreground">Gopalkrishna Rathod</span>
          </p>

          <div className="flex items-center gap-3 md:gap-4">
            <a
              href="https://instagram.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-smooth hover-scale"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 md:w-5 md:h-5" />
            </a>
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-smooth hover-scale"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 md:w-5 md:h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
