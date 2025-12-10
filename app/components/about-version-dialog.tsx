import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { ExternalLink } from "lucide-react";
import { useMediaQuery } from "~/hooks/use-media-query";
import { FRONTEND_COMMIT_HASH, FRONTEND_REPO_URL } from "~/lib/version";
import mainnetAddresses from "~/lib/contracts/mainnet_addresses.json";

interface AboutVersionDialogProps {
  children: React.ReactNode;
}

// Starknet block explorer URL for contracts
const VOYAGER_CONTRACT_URL = "https://voyager.online/contract";

// Helper to shorten address for display
function shortenAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Contract display configuration
interface ContractInfo {
  name: string;
  address: string;
}

function getMainContracts(): ContractInfo[] {
  const contracts: ContractInfo[] = [
    { name: "USDU Token", address: mainnetAddresses.USDU },
    {
      name: "Collateral Registry",
      address: mainnetAddresses.collateralRegistry,
    },
  ];

  // Add WBTC key contracts
  if (mainnetAddresses.WWBTC) {
    contracts.push(
      {
        name: "WBTC Trove Manager",
        address: mainnetAddresses.WWBTC.troveManager,
      },
      {
        name: "WBTC Borrower Operations",
        address: mainnetAddresses.WWBTC.borrowerOperations,
      },
      {
        name: "WBTC Stability Pool",
        address: mainnetAddresses.WWBTC.stabilityPool,
      }
    );
  }

  // Add xLBTC key contracts
  // if (mainnetAddresses.WXLBTC) {
  //   contracts.push(
  //     { name: "xLBTC Trove Manager", address: mainnetAddresses.WXLBTC.troveManager },
  //     { name: "xLBTC Borrower Operations", address: mainnetAddresses.WXLBTC.borrowerOperations },
  //     { name: "xLBTC Stability Pool", address: mainnetAddresses.WXLBTC.stabilityPool }
  //   );
  // }

  return contracts;
}

export function AboutVersionDialog({ children }: AboutVersionDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 640px)");
  const contracts = getMainContracts();

  const content = (
    <div className="space-y-6">
      {/* Version Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium font-sora text-neutral-500 uppercase tracking-wide">
          About this version
        </h3>
        <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium font-sora text-neutral-700">
              App Commit
            </span>
            <a
              href={`${FRONTEND_REPO_URL}/commit/${FRONTEND_COMMIT_HASH}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-sm font-mono text-neutral-800 transition-colors"
            >
              {FRONTEND_COMMIT_HASH}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Deployed Contracts */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium font-sora text-neutral-500 uppercase tracking-wide">
          Deployed Contracts
        </h3>
        <div className="bg-neutral-50 rounded-xl p-4 space-y-2 max-h-64 overflow-y-auto">
          {contracts.map((contract) => (
            <div
              key={contract.address}
              className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0"
            >
              <span className="text-sm font-medium font-sora text-neutral-700">
                {contract.name}
              </span>
              <a
                href={`${VOYAGER_CONTRACT_URL}/${contract.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded text-xs font-mono text-neutral-600 transition-colors"
                title={contract.address}
              >
                {shortenAddress(contract.address)}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uncap Finance</DialogTitle>
            <DialogDescription>
              Protocol information and deployed contracts
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <div className="overflow-y-auto flex-1">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-medium font-sora text-[#242424]">
              Uncap Finance
            </DrawerTitle>
            <DrawerDescription className="text-neutral-600 text-sm font-normal font-sora">
              Protocol information and deployed contracts
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8">{content}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
