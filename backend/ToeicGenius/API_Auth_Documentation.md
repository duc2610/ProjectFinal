# Tài liệu API Authentication - ToeicGenius

## Tổng quan

Tài liệu này mô tả các API endpoints cho phần xác thực (Authentication) của hệ thống ToeicGenius, giúp frontend team tích hợp và sử dụng các API này.

## Base URL
```
https://your-api-domain.com/api/auth
```

## Cấu trúc Response chung

Tất cả API đều trả về response theo cấu trúc chuẩn:

```json
{
  "statusCode": 200,
  "message": "Thông báo",
  "data": {},
  "success": true
}
```

### Các trạng thái HTTP thường gặp:
- `200`: Thành công
- `400`: Bad Request (dữ liệu đầu vào không hợp lệ)
- `401`: Unauthorized (chưa đăng nhập hoặc token không hợp lệ)
- `404`: Not Found (không tìm thấy tài nguyên)
- `500`: Internal Server Error (lỗi hệ thống)

---

## 1. Đăng nhập (Login)

### Endpoint
```
POST /api/auth/login
```

### Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Validation Rules
- `email`: Bắt buộc, định dạng email hợp lệ
- `password`: Bắt buộc

### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string_here",
    "userId": "12345678-1234-1234-1234-123456789012",
    "fullname": "Nguyễn Văn A",
    "email": "user@example.com",
    "expireAt": "2024-01-01T12:00:00Z"
  },
  "success": true
}
```

### Response Error (400)
```json
{
  "statusCode": 400,
  "message": "Email hoặc mật khẩu không đúng.",
  "data": null,
  "success": false
}
```

---

## 2. Đăng ký (Registration)

### 2.1. Gửi OTP đăng ký

#### Endpoint
```
POST /api/auth/register
```

#### Request Body
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123"
}
```

#### Validation Rules
- `fullName`: Bắt buộc, tối đa 100 ký tự
- `email`: Bắt buộc, định dạng email hợp lệ
- `password`: Bắt buộc, tối thiểu 8 ký tự, tối đa 100 ký tự, phải chứa cả chữ và số

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Thao tác thành công.",
  "data": "",
  "success": true
}
```

#### Response Error (400)
```json
{
  "statusCode": 400,
  "message": "Email đã được sử dụng.",
  "data": null,
  "success": false
}
```

### 2.2. Xác thực OTP và hoàn tất đăng ký

#### Endpoint
```
POST /api/auth/verify-register
```

#### Request Body
```json
{
  "email": "user@example.com",
  "otpCode": "123456",
  "fullName": "Nguyễn Văn A",
  "password": "password123"
}
```

#### Validation Rules
- `email`: Bắt buộc, định dạng email hợp lệ
- `otpCode`: Bắt buộc
- `fullName`: Bắt buộc, tối đa 100 ký tự
- `password`: Bắt buộc, tối thiểu 8 ký tự, tối đa 100 ký tự, phải chứa cả chữ và số

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Đăng ký tài khoản thành công.",
  "data": "",
  "success": true
}
```

#### Response Error (400)
```json
{
  "statusCode": 400,
  "message": "Mã OTP không hợp lệ hoặc đã hết hạn",
  "data": null,
  "success": false
}
```

---

## 3. Đặt lại mật khẩu (Reset Password)

### 3.1. Yêu cầu đặt lại mật khẩu

#### Endpoint
```
POST /api/auth/request-reset-password
```

#### Request Body
```json
{
  "email": "user@example.com"
}
```

#### Validation Rules
- `email`: Bắt buộc, định dạng email hợp lệ

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Thao tác thành công.",
  "data": "",
  "success": true
}
```

#### Response Error (404)
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy người dùng.",
  "data": null,
  "success": false
}
```

### 3.2. Xác thực OTP đặt lại mật khẩu

#### Endpoint
```
POST /api/auth/verify-reset-otp
```

#### Request Body
```json
{
  "email": "user@example.com",
  "otpCode": "123456"
}
```

#### Validation Rules
- `email`: Bắt buộc, định dạng email hợp lệ
- `otpCode`: Bắt buộc

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Thao tác thành công.",
  "data": "",
  "success": true
}
```

### 3.3. Xác nhận đặt lại mật khẩu

#### Endpoint
```
POST /api/auth/reset-password
```

#### Request Body
```json
{
  "email": "user@example.com",
  "otpCode": "123456",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

#### Validation Rules
- `email`: Bắt buộc, định dạng email hợp lệ
- `otpCode`: Bắt buộc
- `newPassword`: Bắt buộc, tối thiểu 8 ký tự, tối đa 100 ký tự
- `confirmNewPassword`: Bắt buộc, phải trùng với `newPassword`

#### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Đổi mật khẩu thành công.",
  "data": "",
  "success": true
}
```

---

## 4. Đổi mật khẩu (Change Password)

### Endpoint
```
POST /api/auth/change-password
```

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

### Validation Rules
- `oldPassword`: Bắt buộc
- `newPassword`: Bắt buộc, tối thiểu 8 ký tự, phải chứa cả chữ và số
- `confirmNewPassword`: Bắt buộc, phải trùng với `newPassword`

### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Đổi mật khẩu thành công.",
  "data": "",
  "success": true
}
```

### Response Error (401)
```json
{
  "statusCode": 401,
  "message": "Token không hợp lệ.",
  "data": null,
  "success": false
}
```

---

## 5. Lấy thông tin profile

### Endpoint
```
GET /api/auth/profile
```

### Headers
```
Authorization: Bearer <access_token>
```

### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Thao tác thành công.",
  "data": {
    "userId": "12345678-1234-1234-1234-123456789012",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A"
  },
  "success": true
}
```

### Response Error (401)
```json
{
  "statusCode": 401,
  "message": "Bạn không có quyền truy cập.",
  "data": null,
  "success": false
}
```

---

## 6. Đăng xuất (Logout)

### Endpoint
```
POST /api/auth/logout
```

### Headers
```
Authorization: Bearer <access_token>
```

### Request Body
```json
"refresh_token_string_here"
```

### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Đăng xuất thành công.",
  "data": "",
  "success": true
}
```

---

## 7. Làm mới token (Refresh Token)

### Endpoint
```
POST /api/auth/refresh-token
```

### Request Body
```json
{
  "refreshToken": "refresh_token_string_here"
}
```

### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Thao tác thành công.",
  "data": {
    "token": "new_access_token_here",
    "refreshToken": "new_refresh_token_here",
    "expireAt": "2024-01-01T12:00:00Z"
  },
  "success": true
}
```

---

## 8. Đăng nhập Google

### Endpoint
```
GET /api/auth/signin-google?code=<google_auth_code>
```

### Response Success (200)
```json
{
  "statusCode": 200,
  "message": "Đăng nhập thành công.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string_here",
    "userId": "12345678-1234-1234-1234-123456789012",
    "fullname": "Nguyễn Văn A",
    "email": "user@gmail.com",
    "expireAt": "2024-01-01T12:00:00Z"
  },
  "success": true
}
```

---

## Authentication Flow

### 1. Đăng nhập thông thường
1. Gọi API `POST /api/auth/login`
2. Lưu `token` và `refreshToken` từ response
3. Sử dụng `token` trong header `Authorization: Bearer <token>` cho các API cần xác thực

### 2. Xử lý token hết hạn
1. Khi nhận được response 401 (Unauthorized)
2. Gọi API `POST /api/auth/refresh-token` với `refreshToken`
3. Cập nhật `token` và `refreshToken` mới
4. Retry request ban đầu với token mới

### 3. Đăng xuất
1. Gọi API `POST /api/auth/logout` với `refreshToken`
2. Xóa `token` và `refreshToken` khỏi storage

---

## Error Handling

### Các lỗi thường gặp:

1. **400 - Bad Request**: Dữ liệu đầu vào không hợp lệ
2. **401 - Unauthorized**: Token không hợp lệ hoặc hết hạn
3. **404 - Not Found**: Không tìm thấy người dùng
4. **500 - Internal Server Error**: Lỗi hệ thống

### Xử lý lỗi trong frontend:

```javascript
// Ví dụ xử lý lỗi trong JavaScript
try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData)
  });
  
  const result = await response.json();
  
  if (!result.success) {
    // Hiển thị thông báo lỗi từ result.message
    showError(result.message);
  } else {
    // Xử lý thành công
    handleSuccess(result.data);
  }
} catch (error) {
  // Xử lý lỗi network hoặc parsing
  showError('Có lỗi xảy ra, vui lòng thử lại');
}
```

---

## Security Notes

1. **Luôn sử dụng HTTPS** trong production
2. **Lưu trữ token an toàn** (không lưu trong localStorage nếu có thể)
3. **Xử lý token hết hạn** bằng cách refresh token
4. **Validate dữ liệu đầu vào** trước khi gửi request
5. **Logout khi ứng dụng đóng** hoặc user không hoạt động

---

## Testing

### Sử dụng file ToeicGenius.http để test:

File `ToeicGenius.http` trong project có chứa các ví dụ request để test các API endpoints.

---

*Tài liệu này được tạo để hỗ trợ frontend team tích hợp với API Authentication của ToeicGenius. Nếu có thắc mắc hoặc cần hỗ trợ thêm, vui lòng liên hệ backend team.*
