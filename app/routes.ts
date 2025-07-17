import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/dashboard.tsx", [
    index("routes/borrow.tsx"),
    route("borrow/:troveId", "routes/borrow.$troveId.tsx", [
      index("routes/borrow.$troveId._index.tsx"),
      route("update", "routes/borrow.$troveId.update.tsx"),
      route("rate", "routes/borrow.$troveId.rate.tsx"),
      route("close", "routes/borrow.$troveId.close.tsx"),
    ]),
    route("my-troves", "routes/my-troves.tsx"),
    // route("positions", "routes/positions.tsx"),
    // route("stake", "routes/stake.tsx"),
    // route("borrow", "routes/home.tsx"),
    route("test", "routes/test.tsx"),
  ]),
] satisfies RouteConfig;
