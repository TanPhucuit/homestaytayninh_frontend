import { Pill } from "./ui";

const amenities = ["Gáº§n NÃºi BÃ  Äen", "CÃ³ BBQ", "Há»“ bÆ¡i", "BÃ£i Ä‘áº­u xe", "Ä‚n sÃ¡ng", "Báº¿p riÃªng"];

export function CustomerFilters() {
  return (
    <aside className="card h-fit p-5">
      <h2 className="text-2xl font-bold text-[#466550]">Bá»™ lá»c tÃ¬m kiáº¿m</h2>
      <p className="mt-2 text-sm text-[#75675f]">Äá»§ cÃ¡c trÆ°á»ng theo BA: ngÃ y, sá»‘ khÃ¡ch, loáº¡i hÃ¬nh, giÃ¡ vÃ  tiá»‡n Ã­ch.</p>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-[#466550]">
          NgÃ y nháº­n phÃ²ng
          <input className="field" type="date" defaultValue="2026-05-28" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">
          NgÃ y tráº£ phÃ²ng
          <input className="field" type="date" defaultValue="2026-05-30" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">
          Sá»‘ khÃ¡ch
          <input className="field" type="number" defaultValue={4} min={1} />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">
          Loáº¡i hÃ¬nh
          <select className="field" defaultValue="all">
            <option value="all">Táº¥t cáº£</option>
            <option value="room">PhÃ²ng</option>
            <option value="tent">Lá»u</option>
            <option value="house">NhÃ  nguyÃªn cÄƒn</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#466550]">
          Khoáº£ng giÃ¡
          <select className="field" defaultValue="500-3000">
            <option value="0-1000">DÆ°á»›i 1.000.000Ä‘/Ä‘Ãªm</option>
            <option value="500-3000">500.000Ä‘ - 3.000.000Ä‘/Ä‘Ãªm</option>
            <option value="3000-plus">TrÃªn 3.000.000Ä‘/Ä‘Ãªm</option>
          </select>
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-bold text-[#466550]">Tiá»‡n Ã­ch</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((item, index) => (
            <Pill key={item} tone={index < 3 ? "green" : "sand"}>{item}</Pill>
          ))}
        </div>
      </div>

      <button className="btn-primary mt-6 w-full" type="button">Ãp dá»¥ng bá»™ lá»c</button>
    </aside>
  );
}

