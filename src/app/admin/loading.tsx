import { PageSkeleton } from "@/components/feedback-state";

export default function Loading() {
  return <PageSkeleton title="Đang tải khu vực quản trị" rows={4} variant="dashboard" />;
}
