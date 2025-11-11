import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Landing page without header/layout
  // index("routes/landing.tsx"),

  // Resource routes
  route("/robots.txt", "routes/resources/robots.txt.ts"),
  route("/sitemap.xml", "routes/resources/sitemap-index.ts"),
  route("/sitemap-app.xml", "routes/resources/sitemap.ts"),

  // All other pages with header/layout
  layout("routes/app.tsx", [
    index("routes/dashboard/dashboard.tsx"),
    route("/borrow", "routes/borrow/borrow.tsx"),
    route("borrow/liquidated", "routes/borrow/borrow.liquidated.tsx"),
    route("borrow/:troveId", "routes/borrow/borrow.$troveId.tsx", [
      route("update", "routes/borrow/borrow.$troveId.update.tsx"),
      route("close", "routes/borrow/borrow.$troveId.close.tsx"),
    ]),
    route("earn", "routes/earn/earn.tsx"),
    route("points", "routes/points/points.tsx"),
    route("referrals", "routes/points/referrals.tsx"),
    // route("leaderboard", "routes/points/leaderboard.tsx"),
    // route("claim", "routes/claim/claim.tsx"),
    route("terms-and-conditions", "routes/legal/terms.tsx"),
    route("privacy-policy", "routes/legal/privacy.tsx"),
    route("mint-btc", "routes/admin.mint-btc.tsx"),
    // route("admin/price-management", "routes/admin.price-management.tsx"),
  ]),
] satisfies RouteConfig;
