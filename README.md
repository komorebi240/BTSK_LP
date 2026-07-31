# TY Health — Personalized Health Quiz

[Tiếng Việt](#tiếng-việt) | [English](#english)

---

## Tiếng Việt

Một trang phễu (funnel) dạng quiz single-file, không cần build step — chạy được ngay khi mở `index.html` trên trình duyệt. Người dùng trả lời một chuỗi câu hỏi cá nhân hóa theo giới tính/độ tuổi, nhận điểm số + gợi ý chăm sóc, sau đó để lại thông tin liên hệ để nhận tư vấn.

### Cấu trúc thư mục

```
index.html      ← toàn bộ HTML + CSS + JS nằm trong 1 file
img/
  logo.png      ← logo dùng cho header, favicon (apple-touch-icon) và màn hình success
  favicon.png   ← favicon hiển thị trên tab trình duyệt
```

> Lưu ý: `img/logo.png` và `img/favicon.png` cần được đặt đúng thư mục cạnh `index.html` thì logo/favicon mới hiển thị.

### Luồng màn hình (screens)

| id            | Nội dung                                                        |
|---------------|------------------------------------------------------------------|
| `#s-home`     | Trang chủ — giới thiệu, nút bắt đầu, 4 thẻ lợi ích               |
| `#s-quiz`     | Màn hình câu hỏi — render động theo `curQ` và `getQuestionFlow()`|
| `#s-result`   | Kết quả — điểm số (donut), nhóm ưu tiên chăm sóc, gợi ý sản phẩm, form thu lead |
| `#s-success`  | Cảm ơn sau khi gửi form                                          |

Chuyển màn hình bằng hàm `show(id)` (thêm/bỏ class `.active`).

### Cách quiz hoạt động

- **Câu hỏi đầu tiên** (`profileQuestion`) hỏi vai trò người dùng (nữ trẻ / nữ trung niên / nam / phụ huynh...).
- Nếu chọn "phụ huynh", có thêm `childAgeQuestion` để hỏi độ tuổi con.
- `getQuestionFlow()` trả về danh sách câu hỏi tương ứng, lấy từ `QUESTION_SETS` (khai báo theo từng nhóm: `f_young`, `f_mid`, `male`, `child_under2`, `child_2_5`, `child_6_12`, `child_13_plus`...).
- Mỗi câu hỏi có: `tag` (nhãn nhóm), `text`, `sub` (mô tả phụ, optional), `key` (định danh lưu đáp án), `hint` (lưu ý y tế, optional), `opts` (danh sách đáp án tạo bằng hàm `opt(text, sub, val, scores)`).
- Chọn đáp án → `selectOpt()` cập nhật `answers`/`answerScores`, rồi gọi `renderOpts()` để **chỉ vẽ lại phần đáp án** (không vẽ lại cả thẻ câu hỏi, tránh giật khi bấm).
- Chuyển câu (`nextQ()`/`prevQ()`) gọi `_renderQ()` để vẽ lại toàn bộ thẻ câu hỏi kèm hiệu ứng chuyển động.
- Trả lời xong tất cả → `showResult()` tính điểm và render `#s-result`.

### Logic tính kết quả & sản phẩm

- `buildResult(answers)` tổng hợp điểm theo các trục (`AXIS_LABELS`: giấc ngủ, dinh dưỡng, nội tiết/sắc đẹp, xương khớp, đề kháng, chuyển hóa...) và chọn nhóm ưu tiên (`primaryLabel`).
- Mức điểm (`high` / `mid` / `low`) quyết định tông giọng thông điệp (`tierMsg`) — badge, tiêu đề, box khuyến khích (`enc`).
- Danh sách sản phẩm nằm trong object sản phẩm (tìm theo key `magie`, `b12`, `vitc`, `zinc`, `d3k2`, `canxi`, `joint`, `her`, `his`, `hair`, `femme`, `selenium`, `metabolic`, `colostrum`, `quercetin`...), chia thành `coreProds` (nền tảng) và `boostProds` (theo mục tiêu).

### Hệ thống icon

Toàn bộ icon trong trang là SVG line-art tự vẽ, khai báo trong object `ICONS` (đầu thẻ `<script>`) và render qua hàm `icon(name, size)`.

- Trong JS (mọi nơi dùng template string): gọi trực tiếp `${icon('leaf', 18)}`.
- Trong HTML tĩnh (trang chủ, success...): dùng placeholder `<span class="ico" data-icon="leaf" data-size="18"></span>` — được tự động điền icon bởi đoạn script chạy ngay sau khi khai báo `icon()`.

Muốn thêm icon mới: thêm một key vào `ICONS` với path SVG (viewBox `0 0 24 24`, stroke, không fill) rồi dùng như trên.

### Form thu lead

- Các trường validate khi rời khỏi ô (`onblur="validateField(this)"`), dựa vào `data-rule` (`required`, `phone`, `email`, `dob`, `select`). Sai → viền đỏ + rung nhẹ + hiện dòng lỗi ngay dưới ô; không dùng `alert()`.
- `submitForm()` validate lại toàn bộ trước khi gửi, cuộn tới và focus ô lỗi đầu tiên nếu có.
- Dữ liệu gửi bằng `fetch` (POST, `mode: "no-cors"`, FormData) tới `FORM_ENDPOINT` — hiện đang trỏ tới một Google Apps Script Web App (`/exec`). Đổi hằng số này ở đầu file `<script>` nếu cần trỏ sang endpoint khác. Nếu để trống, dữ liệu chỉ log ra console (chế độ test).
- Payload gửi kèm: thông tin liên hệ, kết quả bài test, UTM params (`utm_source/medium/campaign/content/term`), `page_url`, `user_agent`.

### Tuỳ biến giao diện

- **Màu sắc & khoảng cách**: khai báo tập trung ở `:root` (đầu `<style>`) — đổi `--g` (xanh chính), `--au`/`--ap` (vàng gold), `--bg` (nền be), v.v. sẽ áp dụng toàn trang.
- **Font**: `Fraunces` (serif, dùng cho tiêu đề/điểm số) + `Be Vietnam Pro` (sans, dùng cho phần thân) — load qua Google Fonts ở thẻ `<link>` đầu `<head>`.
- **Responsive**: có media query riêng cho `max-width:430px` (mobile, mặc định) và `min-width:1024px` (desktop, giới hạn khung `#app` rộng hơn).

### Chạy thử / triển khai

Không cần build: mở trực tiếp `index.html` bằng trình duyệt, hoặc host như một static file (Netlify, Vercel, GitHub Pages, hoặc bất kỳ static hosting nào). Chỉ cần đảm bảo thư mục `img/` đi kèm.

### Lưu ý

Nội dung bài test mang tính tham khảo/giáo dục sức khỏe, không thay thế chẩn đoán y tế chuyên nghiệp — disclaimer này đã có sẵn ở cuối màn hình kết quả, không nên xoá khi chỉnh sửa nội dung.

---

## English

A single-file quiz funnel — no build step required, just open `index.html` in a browser. Users answer a series of questions personalized by gender/age group, get a health score plus care suggestions, then leave their contact info to receive follow-up advice.

### Folder structure

```
index.html      ← all HTML + CSS + JS live in this one file
img/
  logo.png      ← used for the header logo, apple-touch-icon, and the success screen
  favicon.png   ← browser tab favicon
```

> Note: `img/logo.png` and `img/favicon.png` must sit in the same folder as `index.html` for the logo/favicon to show up.

### Screen flow

| id            | Content                                                          |
|---------------|-------------------------------------------------------------------|
| `#s-home`     | Landing screen — intro copy, start button, 4 benefit cards        |
| `#s-quiz`     | Question screen — rendered dynamically from `curQ` and `getQuestionFlow()` |
| `#s-result`   | Results — score donut, priority care group, product suggestions, lead form |
| `#s-success`  | Thank-you screen after form submission                             |

Screens are switched via `show(id)` (toggles the `.active` class).

### How the quiz works

- The **first question** (`profileQuestion`) asks about the user's profile (young woman / midlife woman / man / parent...).
- If "parent" is selected, `childAgeQuestion` follows to ask the child's age group.
- `getQuestionFlow()` returns the matching question list, pulled from `QUESTION_SETS` (grouped by segment: `f_young`, `f_mid`, `male`, `child_under2`, `child_2_5`, `child_6_12`, `child_13_plus`...).
- Each question has: `tag` (group label), `text`, `sub` (optional subtext), `key` (answer storage key), `hint` (optional medical note), and `opts` (answer options built with the `opt(text, sub, val, scores)` helper).
- Selecting an answer → `selectOpt()` updates `answers`/`answerScores`, then calls `renderOpts()` to **re-render only the answers area** (not the whole question card, so the card doesn't jump on every click).
- Moving between questions (`nextQ()`/`prevQ()`) calls `_renderQ()`, which re-renders the full question card with its entrance animation.
- After the last question → `showResult()` computes the score and renders `#s-result`.

### Scoring & product logic

- `buildResult(answers)` aggregates scores across axes (`AXIS_LABELS`: sleep, nutrition, hormones/beauty, bone/joint, immunity, metabolism...) and picks the top-priority group (`primaryLabel`).
- The score tier (`high` / `mid` / `low`) drives the messaging tone (`tierMsg`) — badge, title, and the encouragement box (`enc`).
- Product entries live in a product-data object (keyed by `magie`, `b12`, `vitc`, `zinc`, `d3k2`, `canxi`, `joint`, `her`, `his`, `hair`, `femme`, `selenium`, `metabolic`, `colostrum`, `quercetin`...), split into `coreProds` (foundational) and `boostProds` (goal-based).

### Icon system

Every icon on the page is a hand-drawn SVG line icon, defined in the `ICONS` object (top of the `<script>` tag) and rendered through the `icon(name, size)` helper.

- In JS (anywhere using a template literal): call it directly, e.g. `${icon('leaf', 18)}`.
- In static HTML (home screen, success screen...): use a placeholder `<span class="ico" data-icon="leaf" data-size="18"></span>` — it's auto-filled by a small script that runs right after `icon()` is defined.

To add a new icon: add a key to `ICONS` with an SVG path (viewBox `0 0 24 24`, stroke-based, no fill), then use it as shown above.

### Lead capture form

- Fields validate on blur (`onblur="validateField(this)"`), based on `data-rule` (`required`, `phone`, `email`, `dob`, `select`). Invalid → red border + a brief shake + an inline error message under the field; no `alert()` popups.
- `submitForm()` re-validates everything before sending, scrolling to and focusing the first invalid field if any.
- Data is sent via `fetch` (POST, `mode: "no-cors"`, FormData) to `FORM_ENDPOINT` — currently pointed at a Google Apps Script Web App (`/exec`). Change this constant near the top of the `<script>` tag to point elsewhere. If left empty, submissions are only logged to the console (test mode).
- The payload includes contact details, quiz results, UTM params (`utm_source/medium/campaign/content/term`), `page_url`, and `user_agent`.

### Customizing the look

- **Colors & spacing**: centralized in `:root` (top of `<style>`) — change `--g` (primary green), `--au`/`--ap` (gold accent), `--bg` (warm background), etc. to restyle the whole page.
- **Fonts**: `Fraunces` (serif, used for headings/score numbers) + `Be Vietnam Pro` (sans, used for body copy) — loaded via Google Fonts in the `<link>` tag in `<head>`.
- **Responsive behavior**: separate media queries for `max-width:430px` (mobile, default) and `min-width:1024px` (desktop, widens the `#app` frame).

### Running / deploying

No build step: open `index.html` directly in a browser, or host it as a static file (Netlify, Vercel, GitHub Pages, or any static host). Just make sure the `img/` folder ships alongside it.

### Disclaimer

The quiz content is for reference/health-education purposes only and doesn't replace professional medical diagnosis — this disclaimer already appears at the bottom of the results screen and shouldn't be removed when editing content.
