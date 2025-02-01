import { Outlet } from "react-router";

export default function AuthenticationLayout() {
  return (
    <main className="flex items-center justify-center bg-purple-200 h-screen">
      <Outlet />
    </main>);
}
