import { Outlet } from "react-router";
import type { Route } from "./+types/app";
import Header from "~/components/header";
import Footer from "~/components/footer";

export default function Dashboard({}: Route.ComponentProps) {
  return (
    <div>
      <Header />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}
