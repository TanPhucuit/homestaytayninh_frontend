import { StitchFrame } from "@/components/stitch-frame";
import { stitchPages } from "@/lib/stitch-pages";

export default function HomePage() {
  return <StitchFrame src={stitchPages.home} title="Terra & Leaf Homestay - Tây Ninh" interaction="home" />;
}
