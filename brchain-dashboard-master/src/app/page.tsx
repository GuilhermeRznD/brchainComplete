import AdminGuard from "@/components/common/AdminGuard";
import DashboardLayout from "@/components/common/DashboardLayout";

export default function Home() {
  return (
    <AdminGuard>
      <DashboardLayout />
    </AdminGuard>
  );
}
