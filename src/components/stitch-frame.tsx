export function StitchFrame({ src, title }: { src: string; title: string }) {
  return (
    <iframe
      src={src}
      title={title}
      className="block h-screen w-full border-0 bg-[#fdf9f4]"
      loading="eager"
    />
  );
}

