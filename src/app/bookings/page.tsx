import { StitchFrame } from "@/components/stitch-frame";
import { stitchPages } from "@/lib/stitch-pages";

export default function BookingsPage() {
  return <StitchFrame src={stitchPages.bookings} title="Quản lý đặt phòng của tôi" />;
}

