import { Button } from '~/components/ui/button';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface TransactionProgressProps {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: Error | null;
  transactionHash?: string;
  onClose: () => void;
}

export function TransactionProgress({
  isPending,
  isSuccess,
  isError,
  error,
  transactionHash,
  onClose,
}: TransactionProgressProps) {
  const steps = [
    {
      id: 'borrow',
      name: 'Create Borrow Position',
      description: 'Approve TBTC spending and open trove in one transaction',
    },
  ];

  // Determine step states based on transaction status
  const getStepState = (stepIndex: number) => {
    if (isError) {
      return 'error';
    }
    if (isSuccess) {
      return 'success';
    }
    if (isPending || transactionHash) {
      return 'loading';
    }
    return 'idle';
  };

  const getStepIcon = (stepIndex: number) => {
    const state = getStepState(stepIndex);
    
    switch (state) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return (
          <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Transaction title and progress */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-slate-800">
          Borrow bitUSD
        </h3>
        <p className="text-sm text-slate-600">
          {isSuccess ? 'Transaction complete!' :
           isError ? 'Transaction failed' :
           isPending ? 'Processing transaction...' :
           'Preparing transaction'}
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              getStepState(index) === 'loading' ? 'bg-slate-50' : ''
            }`}
          >
            <div className="flex-shrink-0">
              {getStepIcon(index)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">
                {step.name}
              </p>
              {getStepState(index) === 'loading' && (
                <p className="text-xs text-slate-500 mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Transaction hash */}
      {transactionHash && (
        <div className="text-center">
          <p className="text-xs text-slate-500 font-mono break-all">
            TX: {transactionHash}
          </p>
        </div>
      )}

      {/* Error message */}
      {isError && error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-800">
            {error.message || 'Transaction failed'}
          </p>
        </div>
      )}

      {/* Close button for failed transactions only */}
      {isError && (
        <Button onClick={onClose} variant="outline" className="w-full">
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
      )}
    </div>
  );
}