import { PageSkeleton } from "@/components/feedback-state";

export default function Loading() {
  return <PageSkeleton title="Đang tải chi tiết homestay" rows={3} variant="detail" />;
}
