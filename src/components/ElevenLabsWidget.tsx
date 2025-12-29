import { useEffect, useRef, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ElevenLabsWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load the ElevenLabs script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Create the custom element only when open
    if (isOpen && widgetRef.current && !widgetRef.current.hasChildNodes()) {
      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', 'agent_7801k7bqcv88fqhszm8q5kx7hgpg');
      widgetRef.current.appendChild(widget);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 md:h-16 md:w-16 rounded-full shadow-elegant hover:shadow-[0_10px_40px_rgba(147,51,234,0.4)] bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-110"
        aria-label={isOpen ? "Close voice agent" : "Open voice agent"}
      >
        {isOpen ? (
          <X className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
        ) : (
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
        )}
      </Button>

      {/* Voice Agent Widget - Small and Mobile Responsive */}
      {isOpen && (
        <div className="fixed bottom-28 md:bottom-32 right-4 md:right-6 z-50 animate-scale-in w-[280px] sm:w-[320px] md:w-[360px] max-h-[400px] md:max-h-[480px]">
          <div 
            ref={widgetRef}
            className="w-full h-full transition-all duration-300 rounded-2xl overflow-hidden shadow-elegant"
            style={{
              maxHeight: '400px'
            }}
          />
        </div>
      )}
    </>
  );
};

export default ElevenLabsWidget;
