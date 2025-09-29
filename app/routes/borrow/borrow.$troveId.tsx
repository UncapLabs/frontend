import type { Route } from "./+types/borrow.$troveId";
import { Outlet } from "react-router";

function TroveLayout() {
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
