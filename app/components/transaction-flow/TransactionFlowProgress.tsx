import { Button } from '~/components/ui/button';
import { useCurrentTransaction, useTransactionActions } from '~/stores/transaction-flow.store';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import type { TransactionStep } from '~/types/transaction-flow';

export function TransactionFlowProgress() {
  const transaction = useCurrentTransaction();
  const { cancelTransaction } = useTransactionActions();

  if (!transaction) return null;

  const currentStep = transaction.steps[transaction.currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Transaction title and progress */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-slate-800">
          {transaction.title}
        </h3>
        <p className="text-sm text-slate-600">
          Step {transaction.currentStepIndex + 1} of {transaction.steps.length}
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-3">
        {transaction.steps.map((step, index) => (
          <StepDisplay
            key={step.id}
            step={step}
            isActive={index === transaction.currentStepIndex}
            isCompleted={index < transaction.currentStepIndex}
            stepNumber={index + 1}
          />
        ))}
      </div>

      {/* Current step status */}
      {currentStep && (
        <div className="space-y-4">
          {currentStep.state === 'loading' && (
            <>
              <p className="text-sm text-slate-600 text-center">
                {currentStep.description || 'Processing transaction...'}
              </p>
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            </>
          )}

          {currentStep.state === 'success' && currentStep.transactionHash && (
            <>
              <p className="text-sm text-slate-600 text-center">
                Transaction confirmed!
              </p>
              <p className="text-xs text-slate-500 text-center font-mono break-all">
                TX: {currentStep.transactionHash}
              </p>
            </>
          )}

          {currentStep.state === 'error' && (
            <>
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm text-red-800">
                  {currentStep.error || 'Transaction failed'}
                </p>
              </div>
              <Button onClick={cancelTransaction} variant="destructive" className="w-full">
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Individual step display component
function StepDisplay({
  step,
  isActive,
  isCompleted,
  stepNumber,
}: {
  step: TransactionStep;
  isActive: boolean;
  isCompleted: boolean;
  stepNumber: number;
}) {
  const getStepIcon = () => {
    if (step.state === 'success' || isCompleted) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }
    if (step.state === 'error') {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
    if (step.state === 'loading') {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    }
    return (
      <div className={`h-5 w-5 rounded-full border-2 ${
        isActive ? 'border-blue-600 bg-blue-100' : 'border-slate-300'
      }`} />
    );
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      isActive ? 'bg-slate-50' : ''
    }`}>
      <div className="flex-shrink-0">
        {getStepIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          isActive ? 'text-slate-800' : 'text-slate-600'
        }`}>
          {stepNumber}. {step.name}
        </p>
        {step.state === 'error' && step.error && (
          <p className="text-xs text-red-500 mt-1">
            {step.error}
          </p>
        )}
      </div>
    </div>
  );
}