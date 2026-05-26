# UI Stitch + BA Review

Ngày rà soát: 26/05/2026

## Kết quả xác minh qua Stitch MCP
- Project được kiểm tra trực tiếp: `projects/15601276592685210686` (`BA Document Blueprint`).
- Thời điểm project trả về từ MCP: `2026-05-26T03:01:56.897361Z`.
- Đã tải code HTML từ MCP và đối chiếu SHA-256 với từng file đang serve trong `public/stitch_ba_document_blueprint`.
- Kết quả: `19/19` screen được frontend sử dụng khớp byte-for-byte với code Stitch MCP.

| Nhóm giao diện | Screen đã xác minh |
| --- | --- |
| Customer discovery | Landing, search results, homestay detail, login |
| Checkout & payment | Checkout, add-on services, confirm payment, pending, paid, failed |
| Customer booking | Booking history, booking detail |
| Owner/Owner Staff | Owner dashboard, booking operation, proxy booking |
| Staff/Admin | CMS, user moderation, admin dashboard, access denied |

## Nguyên tắc áp dụng
- Source of truth của frontend UI là các file `code.html` trong `stitch_ba_document_blueprint`.
- Next.js serve trực tiếp HTML Stitch qua `StitchFrame`, không chèn header/layout từ thiết kế cũ để tránh lệch UI.
- Các route nghiệp vụ vẫn nằm ở App Router để giữ đúng URL, role guard và flow theo `BA_Document.md`.
- Màu, font, spacing, radius và composition lấy từ HTML Stitch. Không tự ý thiết kế lại UI riêng.

## Mapping màn hình

| Route | Blueprint Stitch | Trạng thái |
| --- | --- | --- |
| `/` | `trang_ch_homestay_t_y_ninh_premium` | Serve trực tiếp Stitch HTML |
| `/homestays` | `k_t_qu_t_m_ki_m_homestay` | Serve trực tiếp Stitch HTML |
| `/homestays/[id]` | `chi_ti_t_homestay_terra_leaf_n_i_b` | Serve trực tiếp Stitch HTML |
| `/login` | `ng_nh_p_h_th_ng` | Serve trực tiếp Stitch HTML |
| `/checkout` | `quy_tr_nh_thanh_to_n_premium` | Serve trực tiếp Stitch HTML |
| `/checkout/services` | `thanh_to_n_b_c_2_d_ch_v_b_sung` | Serve trực tiếp Stitch HTML |
| `/checkout/confirm` | `thanh_to_n_b_c_3_x_c_nh_n_thanh_to_n` | Serve trực tiếp Stitch HTML |
| `/payment/result?status=pending` | `thanh_to_n_ang_x_l` | Serve trực tiếp Stitch HTML |
| `/payment/result?status=paid` | `thanh_to_n_th_nh_c_ng` | Serve trực tiếp Stitch HTML |
| `/payment/result?status=failed/expired` | `thanh_to_n_th_t_b_i` | Serve trực tiếp Stitch HTML |
| `/bookings` | `qu_n_l_t_ph_ng_c_a_t_i_premium_3` | Serve trực tiếp Stitch HTML |
| `/bookings/[id]` | `chi_ti_t_n_t_ph_ng_tl_8923a` | Serve trực tiếp Stitch HTML |
| `/owner` | `b_ng_i_u_khi_n_ch_homestay_premium_2` hoặc `v_n_h_nh_booking_nh_n_vi_n_qu_n_l` theo role | Serve trực tiếp Stitch HTML + role guard |
| `/owner/manage` | `b_ng_i_u_khi_n_ch_homestay_premium_2` | Serve trực tiếp Stitch HTML + role guard |
| `/owner/proxy-booking` | `t_h_kh_ch_h_ng_nh_n_vi_n` | Serve trực tiếp Stitch HTML + role guard |
| `/staff` | `qu_n_l_c_m_nang_n_i_dung` | Serve trực tiếp Stitch HTML + role guard |
| `/staff/moderation` | `qu_n_l_n_i_dung_ng_i_d_ng_premium` | Serve trực tiếp Stitch HTML + role guard |
| `/admin` | `qu_n_tr_h_th_ng_t_ng_th_premium_2` | Serve trực tiếp Stitch HTML + role guard |
| Access denied | `th_ng_b_o_truy_c_p` | Serve trực tiếp Stitch HTML |

## Đối chiếu BA
- Customer Portal: landing, search/filter, detail, checkout, add-on services, payment result và order history đã có route hiển thị bằng Stitch.
- Owner/Owner Staff Portal: dashboard owner, booking operation, proxy booking và access guard đã có route.
- Staff Portal: CMS và user moderation đã có route.
- Admin Portal: dashboard tổng quan, user/role/revenue/report UI đã có route.
- Payment UI: pending, success, failed/expired được map theo query `status` của `/payment/result`.
- RBAC: các portal `owner`, `staff`, `admin` và `owner/proxy-booking` có guard ngoài iframe.

## Lưu ý kỹ thuật
- Cách hiện tại ưu tiên pixel-match với Stitch. HTML trong iframe là static blueprint nên không bind trực tiếp form/button với API.
- Nếu cần interactive API đầy đủ mà vẫn giữ visual 100% Stitch, bước tiếp theo phải convert từng `code.html` thành React component theo đúng markup/class của Stitch, rồi gắn API vào component đó.
