# Hướng dẫn deploy TOEICGenius lên Render (miễn phí) — **chi tiết, dễ làm**

Tài liệu này hướng dẫn bạn deploy đầy đủ:
- **Database**: Render PostgreSQL (free tier nếu còn)
- **Backend .NET**: `backend/ToeicGenius` (ASP.NET Core 8, Docker)
- **2 service chấm điểm**: `speaking-api` + `writing-api` (Python/FastAPI, Docker)
- **Frontend**: `frontend` (React + Vite) dưới dạng **Static Site**

> Mục tiêu: bạn **không cần commit** `.env` hoặc `appsettings.Development.json`. Tất cả secrets/config sẽ nhập ở Render → **Environment Variables**.

---

## 0) Cảnh báo bảo mật (bắt buộc đọc)

Trong `backend/ToeicGenius/appsettings.Development.json` của bạn có **mail password / AWS keys / Google secret**.
- **KHÔNG COMMIT** các file này lên GitHub.
- Nếu bạn đã từng đưa lên GitHub hoặc gửi cho người khác: hãy **rotate/revoke** ngay (Gmail App Password, AWS keys, Google Client Secret, Gemini/Azure keys…).

---

## 1) Chuẩn bị repo GitHub (để Render kéo code)

### 1.1 Đảm bảo không push file nhạy cảm
Trong `.gitignore`, đảm bảo có (hoặc tương đương):
- `backend/ToeicGenius/appsettings.Development.json`
- `backend/.env`
- `frontend/.env`
- `**/.env*`

### 1.2 Push code lên GitHub
Render sẽ build từ GitHub, nên bạn cần push repo (không chứa secret).

---

## 2) Tạo Database trên Render (PostgreSQL)

### 2.1 Tạo DB
- Render Dashboard → **New** → **PostgreSQL**
- Chọn Free (nếu còn) → Create

### 2.2 Lấy thông tin DB
Trong trang DB, bạn sẽ thấy **Internal Database URL** hoặc host/user/password/dbname.
Bạn sẽ dùng nó để set ENV cho backend .NET:
- `ConnectionStrings__MyCnn` = Postgres connection string

Ví dụ connection string Postgres (format C# hay dùng):

`Host=<HOST>;Port=5432;Database=<DB>;Username=<USER>;Password=<PASS>;SSL Mode=Require;Trust Server Certificate=true`

---

## 3) Deploy 2 Python service chấm điểm (rất quan trọng)

Backend .NET của bạn gọi sang 2 service này theo URL:
- Speaking: `POST {SpeakingApiUrl}/assess`
- Writing: `POST {WritingApiUrl}/assess/sentence` và `POST {WritingApiUrl}/assess`

Vì vậy bạn **phải deploy 2 service này trước**, lấy URL rồi mới cấu hình backend .NET.

### 3.1 Deploy `speaking-api` (port 8001)
- Render → **New** → **Web Service**
- Chọn repo GitHub → runtime: **Docker**
- **Root Directory**: `backend/python-service/python-services/speaking-assessment`
- **Port**: `8001`
- Environment Variables (bắt buộc):
  - `GEMINI_API_KEY`
  - `AZURE_SPEECH_KEY`
  - `AZURE_SPEECH_REGION`

Kiểm tra sau deploy:
- `GET https://<speaking-service>.onrender.com/health` → phải trả JSON `{ "status": "healthy", ... }`

### 3.2 Deploy `writing-api` (port 8002)
- Render → **New** → **Web Service**
- runtime: **Docker**
- **Root Directory**: `backend/python-service/python-services/writing-assessment`
- **Port**: `8002`
- Environment Variables (bắt buộc):
  - `GEMINI_API_KEY`

Kiểm tra sau deploy:
- `GET https://<writing-service>.onrender.com/health` → phải trả JSON `{ "status": "healthy", ... }`

> Free tier thường có **cold start**: lần gọi đầu có thể chậm 30–60s (hoặc hơn).

---

## 4) Deploy Backend .NET (ToeicGenius) lên Render (Docker)

### 4.1 Tạo Web Service
- Render → **New** → **Web Service**
- runtime: **Docker**
- **Root Directory**: `backend/ToeicGenius`
- Dockerfile: `Dockerfile`
- **Port**: `8080`

### 4.2 ENV cho backend .NET (copy tên biến cho đúng)
Vào backend service → **Environment** → Add các biến sau:

#### A) Database (bắt buộc)
- `ConnectionStrings__MyCnn` = connection string Postgres (mục 2.2)
- (khuyến nghị) `DB_PROVIDER=postgres`

#### B) Trỏ sang 2 Python service (bắt buộc)
- `PythonApiSettings__SpeakingApiUrl` = `https://<speaking-service>.onrender.com`
- `PythonApiSettings__WritingApiUrl` = `https://<writing-service>.onrender.com`
- `PythonApiSettings__TimeoutSeconds` = `300` (hoặc `600` nếu hay timeout)

#### C) JWT (bắt buộc)
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__SecretKey`
- `Jwt__ExpireMinutes`

#### D) Google OAuth (nếu dùng login Google)
- `Authentication__Google__ClientId`
- `Authentication__Google__ClientSecret`
- `Authentication__Google__RedirectUri`

> Frontend của bạn dùng `@react-oauth/google`, nhiều bạn để `RedirectUri=postmessage` (như bạn đang có). Nếu bạn dùng flow khác, hãy set đúng Redirect URI theo cấu hình Google Cloud Console.

#### E) DefaultAccounts (bắt buộc vì có seed user mặc định)
- `DefaultAccounts__Admin__Email`
- `DefaultAccounts__Admin__FullName`
- `DefaultAccounts__Admin__Password`
- `DefaultAccounts__TestCreator__Email`
- `DefaultAccounts__TestCreator__FullName`
- `DefaultAccounts__TestCreator__Password`
- `DefaultAccounts__Examinee__Email`
- `DefaultAccounts__Examinee__FullName`
- `DefaultAccounts__Examinee__Password`

#### F) MailSettings (chỉ cần nếu hệ thống có gửi mail)
- `MailSettings__Host`
- `MailSettings__Port`
- `MailSettings__UserName`
- `MailSettings__Password`
- `MailSettings__From`

#### G) AWS (chỉ cần nếu bạn upload S3/CloudFront)
- `AWS__Region`
- `AWS__S3BucketName`
- `AWS__CloudFrontDomain`
- `AWS__AccessKey`
- `AWS__SecretKey`

#### H) CORS (bắt buộc để frontend gọi được)
- `Cors__AllowedOrigins` = `https://<ten-frontend>.onrender.com`
  - Nếu bạn muốn dùng local dev cùng lúc: `http://localhost:3000,https://<ten-frontend>.onrender.com`

### 4.3 Kiểm tra backend sau deploy
- Mở: `https://<backend>.onrender.com`
- Nếu bạn bật swagger ở Development thì sẽ có: `https://<backend>.onrender.com/swagger`
- Nếu bị lỗi: vào **Logs** của backend service để xem lỗi DB/CORS/thiếu ENV.

---

## 5) Deploy Frontend (React + Vite) lên Render (Static Site)

### 5.1 Tạo Static Site
- Render → **New** → **Static Site**
- Connect repo
- **Root Directory**: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`

### 5.2 ENV cho Frontend (bắt buộc)
Trong frontend Static Site → Environment:
- `VITE_API_BASE_URL` = `https://<backend>.onrender.com`
- `VITE_GOOGLE_CLIENT_ID` = Google Client ID

> Lưu ý: **Vite chỉ lấy ENV lúc build**, nên đổi ENV xong bạn cần **Trigger Deploy** lại frontend để build lại.

---

## 6) Checklist chạy thử (5 phút biết đúng/sai)

### 6.1 Test 2 python service
- `GET https://<speaking-service>.onrender.com/health` → `status=healthy`
- `GET https://<writing-service>.onrender.com/health` → `status=healthy`

### 6.2 Test backend
- Mở backend URL → không crash
- Trong log backend có thể thấy call python dạng:
  - `Calling Python: {Url}/assess`

### 6.3 Test frontend
- Mở frontend URL → login thử → mở DevTools → Network
- Check request gọi đúng base URL (`VITE_API_BASE_URL`) và không bị CORS.

---

## 7) Lỗi hay gặp & cách sửa nhanh

### 7.1 Sai `VITE_API_BASE_URL`
Triệu chứng: frontend gọi về `localhost` hoặc gọi sai domain.
- Sửa: set `VITE_API_BASE_URL=https://<backend>.onrender.com` trong Render (frontend) và **deploy lại frontend**.

### 7.2 CORS bị chặn
Triệu chứng: browser báo CORS error.
- Sửa: set `Cors__AllowedOrigins` trên backend đúng domain frontend Render.

### 7.3 Python service “sleep” làm backend timeout
Triệu chứng: request chấm điểm bị timeout lần đầu.
- Sửa: tăng `PythonApiSettings__TimeoutSeconds` lên `600`
- Chấp nhận cold start free tier (hoặc nâng plan).

### 7.4 Python service lỗi “Missing required environment variables”
Triệu chứng: speaking-api crash khi thiếu key.
- Sửa: speaking-api phải có đủ `GEMINI_API_KEY`, `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`

### 7.5 DB connect fail
Triệu chứng: backend log lỗi connection string / migrate.
- Sửa:
  - kiểm tra `ConnectionStrings__MyCnn`
  - đảm bảo bạn dùng connection string Postgres (có `Host=`)
  - (khuyến nghị) set `DB_PROVIDER=postgres`

---

## 8) Vì sao không khuyến nghị SQL Server trên Render free?
Render **không có managed SQL Server miễn phí**. Tự chạy SQL Server container thường:
- khó đảm bảo **persist data** ổn định trên free tier
- tốn RAM/CPU, dễ bị kill

=> Hướng ổn nhất cho free tier: **Render PostgreSQL**.
