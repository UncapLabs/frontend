import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Landing page without header/layout
  index("routes/landing.tsx"),

  // All other pages with header/layout
  layout("routes/app.tsx", [
    route("/unanim/dashboard", "routes/dashboard/dashboard.tsx"),
    route("/unanim/borrow", "routes/borrow/borrow.tsx"),
    route("unanim/borrow/liquidated", "routes/borrow/borrow.liquidated.tsx"),
    route("unanim/borrow/:troveId", "routes/borrow/borrow.$troveId.tsx", [
      route("update", "routes/borrow/borrow.$troveId.update.tsx"),
      route("close", "routes/borrow/borrow.$troveId.close.tsx"),
    ]),
    route("unanim/earn", "routes/earn/earn.tsx"),
    route("unanim/claim", "routes/claim/claim.tsx"),
    route("price-management", "routes/admin.price-management.tsx"),
    route("mint-btc", "routes/admin.mint-btc.tsx"),
    route("test", "routes/test.tsx"),
  ]),
] satisfies RouteConfig;
