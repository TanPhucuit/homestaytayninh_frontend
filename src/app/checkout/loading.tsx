import { PageSkeleton } from "@/components/feedback-state";

export default function Loading() {
  return <PageSkeleton title="Đang tải thông tin đặt phòng" rows={4} variant="detail" />;
}
