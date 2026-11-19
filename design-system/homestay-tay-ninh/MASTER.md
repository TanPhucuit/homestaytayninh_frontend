# Homestay Tây Ninh – Design System v3 "Nắng & Đất"

Sinh bằng skill ui-ux-pro-max (styles: Nature Distilled + Organic Biophilic; typography: serif editorial + humanist sans).
Hướng: sáng, ấm, thủ công, như giấy kraft và đất nung; thay cho giao diện tối "cinematic" v2.

## Màu (token trong `src/app/globals.css`)
| Token | Giá trị | Vai trò |
|---|---|---|
| brand | #C4542D | CTA, giá, chữ nhấn (đất nung) |
| leaf | #5B6B2F | trạng thái tốt, biểu tượng phụ (ô-liu) |
| bark | #2A1D14 | nền tối: chân trang, portal hero, thẻ nổi bật (nâu espresso) |
| gold | #D9A23A | điểm nhấn trên nền tối (không dùng chữ vàng trên nền sáng) |
| sand / cream | #F3EBDC / #FBF6EC | nền trang / mặt thẻ |
| ink / muted | #1F1710 / #6A5B4B | chữ chính / chữ phụ (≥ 4.5:1 trên sand) |

## Chữ
Fraunces (SOFT 100, opsz) cho tiêu đề, có bộ ký tự tiếng Việt; Be Vietnam Pro cho nội dung.

## Hình khối và chuyển động
- Cửa vòm (`.arch`, `.arch-lg`) là hình khối nhận diện cho ảnh hero và biểu tượng; thẻ homestay bo góc phải trên lớn.
- Hạt giấy toàn trang (một lớp fixed, opacity 3.5%).
- Nút dạng viên thuốc, quét sáng khi hover; reveal khi cuộn; tôn trọng `prefers-reduced-motion`.
- Tránh: chữ vàng trên nền sáng, glass trên nền sáng, emoji làm biểu tượng.
