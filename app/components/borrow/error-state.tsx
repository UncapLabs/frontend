import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
}

export function ErrorState({ 
  error, 
  onRetry, 
  title = "Failed to load position", 
  description = "There was an error loading your position data. Please try again."
}: ErrorStateProps) {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Card className="max-w-md w-full border border-slate-200">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-600 mb-4">{description}</p>
          {error?.message && (
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Error: {error.message}
            </p>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}