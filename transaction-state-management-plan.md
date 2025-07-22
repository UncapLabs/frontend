# Transaction State Management Plan

## Overview

This document outlines a plan to implement a reusable transaction state management system for the BitUSD application. The system will handle various transaction types (borrow, claim rewards, modify trove, etc.) using a finite state machine pattern with localStorage persistence.

## Goals

1. **Eliminate URL-based state tracking** - Remove dependency on transaction hashes in URLs
2. **Persist user progress** - Maintain form data and transaction state across page refreshes
3. **Provide clear state transitions** - Use finite state machine for predictable state management
4. **Create reusable solution** - Build a generic system that works for all transaction types
5. **Minimize useEffect usage** - Reduce complexity and side effects

## State Machine Design

### Core States

```typescript
type TransactionState = 
  | 'idle'        // Initial state, no data entered
  | 'editing'     // User is filling form/preparing transaction
  | 'confirming'  // Wallet confirmation in progress
  | 'pending'     // Transaction submitted, waiting for chain confirmation
  | 'success'     // Transaction completed successfully
  | 'error'       // Transaction failed
```

### State Transitions

```
idle → editing → confirming → pending → success
                     ↓           ↓         ↓
                  editing     error      idle
                              ↓
                            idle
```

## Implementation Architecture

### 1. Generic Transaction State Hook

```typescript
interface TransactionConfig<TFormData> {
  storageKey: string;
  staleTimeout?: number; // Default: 24 hours
  initialFormData: TFormData;
}

interface TransactionState<TFormData> {
  state: TransactionState;
  formData: TFormData;
  transactionHash?: string;
  error?: Error;
  timestamp: number;
}

function useTransactionState<TFormData>(
  config: TransactionConfig<TFormData>
): {
  currentState: TransactionState;
  formData: TFormData;
  transactionHash?: string;
  error?: Error;
  
  // State transitions
  startEditing: () => void;
  startConfirming: () => void;
  setPending: (hash: string) => void;
  setSuccess: () => void;
  setError: (error: Error) => void;
  reset: () => void;
  
  // Form data management
  updateFormData: (data: Partial<TFormData>) => void;
  clearStaleData: () => void;
}
```

### 2. Storage Structure

Each transaction type will store data under a unique key:

```typescript
// localStorage keys
const STORAGE_KEYS = {
  borrow: 'bitusd_tx_borrow',
  claimRewards: 'bitusd_tx_claim_rewards',
  modifyTrove: 'bitusd_tx_modify_trove',
  // ... other transaction types
};
```

### 3. Example Usage for Borrow

```typescript
// Define form data type
interface BorrowFormData {
  collateralAmount?: number;
  borrowAmount?: number;
  interestRate: number;
  selectedCollateralToken: string;
}

// In Borrow component
const {
  currentState,
  formData,
  transactionHash,
  error,
  startEditing,
  startConfirming,
  setPending,
  setSuccess,
  setError,
  reset,
  updateFormData,
} = useTransactionState<BorrowFormData>({
  storageKey: STORAGE_KEYS.borrow,
  initialFormData: {
    interestRate: 5,
    selectedCollateralToken: 'tBTC',
  },
});
```

## Implementation Steps

### Phase 1: Core Infrastructure
1. Create `useTransactionState` hook with localStorage integration
2. Implement state transition logic with validation
3. Add automatic stale data cleanup
4. Create TypeScript types and interfaces

### Phase 2: Borrow Form Migration
1. Remove URL-based transaction tracking
2. Integrate `useTransactionState` into borrow form
3. Update UI to render based on state machine state
4. Migrate form persistence to new system

### Phase 3: Extend to Other Transactions
1. Implement for claim rewards functionality
2. Implement for modify trove functionality
3. Create shared UI components for transaction states
4. Document patterns and best practices

## Key Benefits

1. **Resilient User Experience**
   - Form data persists across refreshes
   - Users can resume interrupted transactions
   - Clear recovery from errors

2. **Simplified Code**
   - No complex useEffect chains
   - Predictable state transitions
   - Centralized state management

3. **Reusability**
   - Single pattern for all transaction types
   - Shared UI components
   - Consistent user experience

4. **Better Error Handling**
   - Errors don't lose form data
   - Clear error states
   - Easy retry mechanisms

## Technical Considerations

1. **Storage Cleanup**
   - Clear stale data after 24 hours
   - Clear on successful completion
   - Provide manual clear option

2. **Type Safety**
   - Full TypeScript support
   - Generic types for form data
   - Strict state transitions

3. **Performance**
   - Debounced localStorage writes
   - Minimal re-renders
   - Efficient state updates

## Migration Strategy

1. Start with borrow form as proof of concept
2. Extract reusable components
3. Gradually migrate other transaction types
4. Remove old URL-based system once complete

## Success Metrics

- Zero data loss on page refresh
- Reduced code complexity (fewer useEffects)
- Consistent UX across all transaction types
- Improved error recovery rates