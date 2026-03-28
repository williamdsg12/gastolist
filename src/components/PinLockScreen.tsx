import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Lock, Delete, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const PIN_HASH_KEY = 'finance-pin-hash';
const LEGACY_PIN_KEY = 'finance-pin';

const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'finance-app-salt-v1');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

interface PinLockScreenProps {
  onUnlock: () => void;
}

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState<string[]>(['', '', '', '']);
  const [confirmPin, setConfirmPin] = useState<string[]>(['', '', '', '']);
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [showPin, setShowPin] = useState(false);
  const [shake, setShake] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const hasPin = !!localStorage.getItem(PIN_HASH_KEY) || !!localStorage.getItem(LEGACY_PIN_KEY);

  useEffect(() => {
    // Migrate legacy plaintext PIN to hashed
    const legacyPin = localStorage.getItem(LEGACY_PIN_KEY);
    if (legacyPin && !localStorage.getItem(PIN_HASH_KEY)) {
      hashPin(legacyPin).then(hash => {
        localStorage.setItem(PIN_HASH_KEY, hash);
        localStorage.removeItem(LEGACY_PIN_KEY);
      });
    }
  }, []);

  useEffect(() => {
    if (!hasPin) {
      setIsSettingPin(true);
    }
  }, [hasPin]);

  useEffect(() => {
    if (lockedUntil) {
      const timer = setInterval(() => {
        if (Date.now() >= lockedUntil) {
          setLockedUntil(null);
          setFailedAttempts(0);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleNumberClick = async (num: string) => {
    if (isLocked) return;

    if (isSettingPin) {
      if (step === 'enter') {
        const newPinCopy = [...newPin];
        const emptyIndex = newPinCopy.findIndex(d => d === '');
        if (emptyIndex !== -1) {
          newPinCopy[emptyIndex] = num;
          setNewPin(newPinCopy);
          
          if (emptyIndex === 3) {
            setTimeout(() => {
              setStep('confirm');
            }, 200);
          }
        }
      } else {
        const confirmPinCopy = [...confirmPin];
        const emptyIndex = confirmPinCopy.findIndex(d => d === '');
        if (emptyIndex !== -1) {
          confirmPinCopy[emptyIndex] = num;
          setConfirmPin(confirmPinCopy);
          
          if (emptyIndex === 3) {
            setTimeout(async () => {
              if (confirmPinCopy.join('') === newPin.join('')) {
                const hash = await hashPin(newPin.join(''));
                localStorage.setItem(PIN_HASH_KEY, hash);
                localStorage.removeItem(LEGACY_PIN_KEY);
                toast.success('PIN configurado com sucesso!');
                onUnlock();
              } else {
                setShake(true);
                setTimeout(() => setShake(false), 500);
                toast.error('Os PINs não coincidem');
                setConfirmPin(['', '', '', '']);
              }
            }, 200);
          }
        }
      }
    } else {
      const pinCopy = [...pin];
      const emptyIndex = pinCopy.findIndex(d => d === '');
      if (emptyIndex !== -1) {
        pinCopy[emptyIndex] = num;
        setPin(pinCopy);
        
        if (emptyIndex === 3) {
          setTimeout(async () => {
            const enteredHash = await hashPin(pinCopy.join(''));
            const storedHash = localStorage.getItem(PIN_HASH_KEY);
            
            if (enteredHash === storedHash) {
              setFailedAttempts(0);
              toast.success('Bem-vindo!');
              onUnlock();
            } else {
              const attempts = failedAttempts + 1;
              setFailedAttempts(attempts);
              setShake(true);
              setTimeout(() => setShake(false), 500);
              
              if (attempts >= 5) {
                setLockedUntil(Date.now() + 60000); // Lock for 60s
                toast.error('Muitas tentativas. Bloqueado por 60 segundos.');
              } else {
                toast.error(`PIN incorreto (${5 - attempts} tentativas restantes)`);
              }
              setPin(['', '', '', '']);
            }
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    if (isLocked) return;
    if (isSettingPin) {
      if (step === 'enter') {
        const newPinCopy = [...newPin];
        let lastFilledIndex = -1;
        for (let i = newPinCopy.length - 1; i >= 0; i--) {
          if (newPinCopy[i] !== '') { lastFilledIndex = i; break; }
        }
        if (lastFilledIndex !== -1) { newPinCopy[lastFilledIndex] = ''; setNewPin(newPinCopy); }
      } else {
        const confirmPinCopy = [...confirmPin];
        let lastFilledIndex = -1;
        for (let i = confirmPinCopy.length - 1; i >= 0; i--) {
          if (confirmPinCopy[i] !== '') { lastFilledIndex = i; break; }
        }
        if (lastFilledIndex !== -1) { confirmPinCopy[lastFilledIndex] = ''; setConfirmPin(confirmPinCopy); }
      }
    } else {
      const pinCopy = [...pin];
      let lastFilledIndex = -1;
      for (let i = pinCopy.length - 1; i >= 0; i--) {
        if (pinCopy[i] !== '') { lastFilledIndex = i; break; }
      }
      if (lastFilledIndex !== -1) { pinCopy[lastFilledIndex] = ''; setPin(pinCopy); }
    }
  };

  const currentPin = isSettingPin ? (step === 'enter' ? newPin : confirmPin) : pin;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center animate-fade-in">
          <div className="inline-flex p-4 rounded-2xl bg-primary mb-4">
            <Wallet className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Finanças</h1>
          <p className="text-sm text-muted-foreground mt-1">William & Andressa</p>
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex p-3 rounded-full bg-secondary mb-3">
            <Lock className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {isLocked
              ? 'Bloqueado. Aguarde...'
              : isSettingPin 
                ? step === 'enter' 
                  ? 'Crie um PIN de 4 dígitos' 
                  : 'Confirme seu PIN'
                : 'Digite seu PIN para acessar'
            }
          </p>
        </div>

        <div 
          className={`flex justify-center gap-4 animate-fade-in ${shake ? 'animate-shake' : ''}`}
          style={{ animationDelay: '0.2s' }}
        >
          {currentPin.map((digit, index) => (
            <div
              key={index}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-200 ${
                digit 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card'
              }`}
            >
              {digit ? (showPin ? digit : '•') : ''}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => setShowPin(!showPin)} className="text-muted-foreground">
            {showPin ? (<><EyeOff className="w-4 h-4 mr-2" />Ocultar</>) : (<><Eye className="w-4 h-4 mr-2" />Mostrar</>)}
          </Button>
        </div>

        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  variant="secondary"
                  className="h-14 text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                  onClick={() => handleNumberClick(num.toString())}
                  disabled={isLocked}
                >
                  {num}
                </Button>
              ))}
              <div />
              <Button
                variant="secondary"
                className="h-14 text-xl font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => handleNumberClick('0')}
                disabled={isLocked}
              >
                0
              </Button>
              <Button variant="ghost" className="h-14 text-muted-foreground hover:text-destructive" onClick={handleDelete} disabled={isLocked}>
                <Delete className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {isSettingPin && step === 'confirm' && (
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { setStep('enter'); setConfirmPin(['', '', '', '']); }}>
            Voltar e alterar PIN
          </Button>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
