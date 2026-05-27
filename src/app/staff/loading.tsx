import { PageSkeleton } from "@/components/feedback-state";

export default function Loading() {
  return <PageSkeleton title="Đang tải khu vực nội dung" rows={4} variant="dashboard" />;
}
