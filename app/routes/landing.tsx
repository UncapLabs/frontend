import type { Route } from "./+types/landing";

export default function Landing({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Coming Soon</h1>
        <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>
    </div>
  );
}
