import { PageSkeleton } from "@/components/feedback-state";

export default function Loading() {
  return <PageSkeleton title="Đang tải danh sách homestay" rows={6} variant="media" />;
}
