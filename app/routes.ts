import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/app.tsx", [
    index("routes/dashboard/dashboard.tsx"),
    route("borrow", "routes/borrow/borrow.tsx"),
    route("price-management", "routes/admin.price-management.tsx"),
    route("borrow/:troveId", "routes/borrow/borrow.$troveId.tsx", [
      route("update", "routes/borrow/borrow.$troveId.update.tsx"),
      route("close", "routes/borrow/borrow.$troveId.close.tsx"),
    ]),
    // route("test", "routes/test.tsx"),
  ]),
] satisfies RouteConfig;
