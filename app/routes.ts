import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/app.tsx", [
    index("routes/dashboard.tsx"),
    route("borrow", "routes/borrow.tsx"),
    route("borrow/:troveId", "routes/borrow.$troveId.tsx", [
      route("update", "routes/borrow.$troveId.update.tsx"),
      route("close", "routes/borrow.$troveId.close.tsx"),
    ]),
    // route("test", "routes/test.tsx"),
  ]),
] satisfies RouteConfig;
