import { Outlet } from "react-router";
import type { Route } from "./+types/app";
import Header from "~/components/header";
import Footer from "~/components/footer";
import { Banner1 } from "~/components/banner1";
import { useFeatureFlag } from "~/hooks/use-feature-flag";

export default function Dashboard({}: Route.ComponentProps) {
  const { data: winddownBannerFlag } = useFeatureFlag("show_winddown_banner");
  const { data: outageBannerFlag } = useFeatureFlag("show_outage_banner");

  return (
    <div className="flex flex-col min-h-screen">
      {outageBannerFlag?.enabled && (
        <Banner1
          title="Service Update"
          description="We're currently experiencing technical difficulties."
          linkText="Check our Twitter for updates"
          linkUrl="https://x.com/uncapfinance"
          defaultVisible={true}
        />
      )}
      {winddownBannerFlag?.enabled && (
        <Banner1
          title="Uncap is winding down."
          description="The protocol continues to function normally. You have until August 2026 to withdraw your funds."
          linkText="Learn more"
          linkUrl="https://x.com/uncapfinance"
          defaultVisible={true}
        />
      )}
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
