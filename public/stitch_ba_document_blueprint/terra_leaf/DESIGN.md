---
name: Terra & Leaf
colors:
  surface: '#fdf9f4'
  surface-dim: '#ddd9d5'
  surface-bright: '#fdf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ee'
  surface-container: '#f1ede8'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e6e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#56423d'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f4f0eb'
  outline: '#89726c'
  outline-variant: '#dcc0ba'
  surface-tint: '#9d422b'
  primary: '#7b2914'
  on-primary: '#ffffff'
  primary-container: '#9a4029'
  on-primary-container: '#ffc9bb'
  inverse-primary: '#ffb4a2'
  secondary: '#466550'
  on-secondary: '#ffffff'
  secondary-container: '#c8ebd0'
  on-secondary-container: '#4c6b56'
  tertiary: '#7b2914'
  on-tertiary: '#ffffff'
  tertiary-container: '#9a4029'
  on-tertiary-container: '#ffc9bb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a2'
  on-primary-fixed: '#3c0800'
  on-primary-fixed-variant: '#7e2b16'
  secondary-fixed: '#c8ebd0'
  secondary-fixed-dim: '#accfb5'
  on-secondary-fixed: '#022110'
  on-secondary-fixed-variant: '#2f4d3a'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0700'
  on-tertiary-fixed-variant: '#7e2b16'
  background: '#fdf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e6e2dd'
typography:
  display-lg:
    fontFamily: Libre Caslon Text
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Libre Caslon Text
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Libre Caslon Text
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Libre Caslon Text
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter-mobile: 16px
  gutter-desktop: 24px
  margin-edge: 24px
  container-max-width: 1200px
---

## Brand & Style
Hệ thống thiết kế này được xây dựng dựa trên sự giao thoa giữa hơi thở của đất sét nung (Terracotta) và sự tĩnh lặng của đại ngàn (Forest Green), dành riêng cho nền tảng đặt phòng Homestay tại Tây Ninh. 

Phong cách chủ đạo là **Minimalism kết hợp với Premium Tactile**. Mục tiêu là gợi dậy cảm giác ấm áp, đáng tin cậy và gần gũi với thiên nhiên. UI tập trung vào việc sử dụng khoảng trắng (whitespace) có mục đích để tôn vinh hình ảnh kiến trúc và cảnh quan, tạo ra một trải nghiệm thư thái như chính một kỳ nghỉ dưỡng. Cảm xúc hướng tới là sự sang trọng nhưng không phô trương, chân thực và đậm chất bản địa.

## Colors
Bảng màu được lấy cảm hứng từ bảng màu tự nhiên của vùng đất Tây Ninh:
- **Primary (Terracotta):** Màu đất nung ấm áp, đại diện cho bản sắc và sự hiếu khách.
- **Secondary (Forest Green):** Màu xanh rừng già, mang lại cảm giác bình yên và sự sống.
- **Surface (Soft Sand):** Màu nền chủ đạo thay thế cho màu trắng tinh khiết, giúp giảm mỏi mắt và tạo cảm giác cao cấp, nhẹ nhàng.
- **Border Neutral:** Sử dụng cho các đường kẻ mảnh và viền card để phân tách không gian mà không gây đứt gãy thị giác.

## Typography
Sự kết hợp giữa hai phông chữ tạo nên sự cân bằng giữa tính di sản và tính hiện đại:
- **Libre Caslon Text:** Sử dụng cho các tiêu đề lớn và thông tin quan trọng. Kiểu chữ Serif này mang lại vẻ đẹp cổ điển, sang trọng và có tính thẩm mỹ cao.
- **Be Vietnam Pro:** Sử dụng cho nội dung văn bản và nhãn. Đây là phông chữ Sans-serif hiện đại, tối ưu cho hiển thị tiếng Việt, đảm bảo tính dễ đọc trên mọi thiết bị.
- **Cấu trúc:** Ưu tiên căn lề trái để tạo sự ổn định. Khoảng cách dòng (line-height) được nới rộng để tăng độ thoáng cho văn bản.

## Layout & Spacing
Hệ thống sử dụng mô hình **Bento Grid** cho các trang tổng quan (Dashboard) và hệ thống **Card-based** linh hoạt cho danh sách phòng.

- **Grid:** Hệ thống 12 cột cho desktop và 4 cột cho mobile.
- **Bento Logic:** Các ô nội dung được nhóm lại theo chức năng với kích thước không đồng nhất nhưng luôn tuân theo tỷ lệ vàng, giúp thông tin quan trọng (như ảnh bìa homestay) nổi bật hơn.
- **Spacing:** Sử dụng hệ số nhân của 4px. Khoảng cách giữa các card (gutter) luôn giữ ở mức 24px trên desktop để tạo cảm giác thoáng đãng, cao cấp.

## Elevation & Depth
Thay vì sử dụng bóng đổ (shadow) đậm, hệ thống sử dụng **Tonal Layers** và **Low-contrast outlines** để phân cấp:

- **Lớp bề mặt:** Các Card sử dụng màu nền trắng hoặc Soft Sand sáng hơn một tông so với nền trang.
- **Đường viền:** Sử dụng viền 1px màu `Border neutral` (#e8e1d5) để định hình khối. 
- **Shadow:** Chỉ sử dụng bóng đổ rất mờ (blur 20px, opacity 4%, cùng tông màu Terracotta ám nhẹ) khi người dùng di chuột (hover) vào card để tạo cảm giác vật lý nhẹ nhàng.

## Shapes
Hệ thống hình khối sử dụng các góc bo tròn lớn để làm mềm giao diện, tạo cảm giác thân thiện và hữu cơ:
- **Nút bấm & Card nhỏ:** Bo góc 12px.
- **Card lớn & Bento Containers:** Bo góc 16px.
- **Inputs:** Bo góc 8px để giữ tính chuyên nghiệp và gọn gàng.
Sự nhất quán trong độ bo góc giúp các thành phần trông như được cắt gọt tỉ mỉ từ những khối vật liệu tự nhiên.

## Components
- **Buttons:** Nút chính (Primary) sử dụng màu Terracotta với chữ trắng. Nút phụ (Secondary) sử dụng viền Forest Green với nền trong suốt. Trạng thái hover sẽ chuyển sang Dark Terracotta.
- **Cards:** Là thành phần cốt lõi. Hình ảnh trong card luôn chiếm tỷ lệ lớn (thường là 3:2 hoặc 1:1 trong bento grid). Thông tin giá cả và tiêu đề được đặt gọn gàng phía dưới với typography rõ ràng.
- **Chips (Tag):** Sử dụng để hiển thị tiện ích (Wifi, Pool, v.v.). Nền màu nhạt của Forest Green hoặc Terracotta với độ trong suốt thấp (10%), bo tròn dạng pill-shape.
- **Inputs:** Ô nhập liệu tối giản với đường viền mảnh. Khi focus, đường viền chuyển sang màu Forest Green để tạo cảm giác an tâm.
- **Calendar/Date Picker:** Thành phần quan trọng nhất cho nền tảng booking. Sử dụng lưới ngày sạch sẽ, ngày được chọn (selected) sẽ có hình tròn màu Terracotta.