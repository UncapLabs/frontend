import { Outlet } from "react-router";
import type { Route } from "./+types/dashboard";
import Header from "~/components/header";

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <Header />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
