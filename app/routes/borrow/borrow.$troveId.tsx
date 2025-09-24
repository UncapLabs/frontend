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
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
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
