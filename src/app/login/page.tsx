import { StitchFrame } from "@/components/stitch-frame";
import { stitchPages } from "@/lib/stitch-pages";

export default function LoginPage() {
  return <StitchFrame src={stitchPages.login} title="Đăng nhập hệ thống Terra & Leaf" interaction="login" />;
}
