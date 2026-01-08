import { useState, useEffect } from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [showText, setShowText] = useState(false);
  const [showSlogan, setShowSlogan] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animation sequence
    const timers = [
      setTimeout(() => setShowContent(true), 200),
      setTimeout(() => setShowText(true), 800),
      setTimeout(() => setShowSlogan(true), 1400),
      setTimeout(() => setShowButton(true), 2000),
      setTimeout(() => handleAutoTransition(), 4000),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleAutoTransition = () => {
    setIsExiting(true);
    setTimeout(onComplete, 600);
  };

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onComplete, 600);
  };

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center p-6 transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(220 14% 92%) 0%, hsl(0 0% 100%) 50%, hsl(152 30% 95%) 100%)',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Animated Logo */}
        <div 
          className={`relative transition-all duration-700 ease-out ${
            showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="relative">
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-30"
              style={{ background: 'linear-gradient(135deg, hsl(152 69% 40%), hsl(45 93% 47%))' }}
            />
            
            {/* Main coin container */}
            <div 
              className="relative p-6 rounded-full shadow-2xl animate-spin-slow"
              style={{
                background: 'linear-gradient(145deg, hsl(45 93% 50%), hsl(38 92% 50%))',
                animationDuration: '3s',
              }}
            >
              <Coins className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
            
            {/* Orbiting chart icon */}
            <div 
              className={`absolute -right-2 -top-2 p-2 rounded-full shadow-lg transition-all duration-500 ${
                showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{ 
                background: 'linear-gradient(135deg, hsl(152 69% 40%), hsl(152 69% 50%))',
                transitionDelay: '0.3s'
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* App Title */}
        <div className="text-center space-y-3">
          <h1 
            className={`text-2xl md:text-3xl font-bold tracking-tight transition-all duration-700 ${
              showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ 
              fontFamily: "'Inter', system-ui, sans-serif",
              background: 'linear-gradient(135deg, hsl(220 15% 25%), hsl(152 50% 35%))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            <span className="font-extrabold">G</span>estão{' '}
            <span className="font-extrabold">F</span>inanceira{' '}
            <span className="font-extrabold">F</span>amiliar
          </h1>
          
          {/* Slogan */}
          <p 
            className={`text-sm text-muted-foreground max-w-xs mx-auto transition-all duration-700 ${
              showSlogan ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Controle, equilíbrio e prosperidade todos os meses.
          </p>
        </div>

        {/* Enter Button */}
        <div 
          className={`transition-all duration-700 ${
            showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            onClick={handleEnter}
            size="lg"
            className="px-8 py-6 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-subtle"
            style={{
              background: 'linear-gradient(135deg, hsl(152 69% 40%), hsl(152 60% 45%))',
            }}
          >
            Entrar no App
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div 
        className={`pb-8 transition-all duration-700 ${
          showSlogan ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-xs text-muted-foreground">
          by William & Andressa 💚
        </p>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s ease-in-out;
          animation-iteration-count: 1;
        }
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); box-shadow: 0 10px 30px -10px hsl(152 69% 40% / 0.4); }
          50% { transform: scale(1.03); box-shadow: 0 15px 40px -10px hsl(152 69% 40% / 0.5); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
