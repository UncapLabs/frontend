import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { truncateTroveId } from "~/lib/utils/trove-id";
import type { Route } from "./+types/borrow.$troveId";
import { useParams, useNavigate, Outlet } from "react-router";

function TroveLayout() {
  const { troveId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="flex justify-between items-baseline">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">
            Position #{troveId ? truncateTroveId(troveId) : ""}
          </h1>
        </div>
      </div>
      <Separator className="mb-8 bg-slate-200" />

      {/* Child routes will render here */}
      <Outlet />
    </div>
  );
}

export default TroveLayout;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Position - Uncap" },
    { name: "description", content: "Manage your Uncap borrowing position" },
  ];
}
