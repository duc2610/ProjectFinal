const API_URL = "http://localhost:3001";

function base64Encode(obj) {
  return btoa(JSON.stringify(obj));
}

function base64Decode(str) {
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    return null;
  }
}

export function generateFakeToken(user, expiresInSeconds = 3600) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Date.now();
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name || null,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + expiresInSeconds * 1000) / 1000),
    role: user.role || "user",
  };
  const signature = "dev-signature";
  return `${base64Encode(header)}.${base64Encode(payload)}.${btoa(signature)}`;
}

export function verifyFakeToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = base64Decode(parts[1]);
  if (!payload || !payload.exp) return null;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  return payload;
}

export async function login(email, password) {
  const res = await fetch(
    `${API_URL}/users?email=${email}&password=${password}`
  );
  const data = await res.json();
  if (data.length > 0) {
    const user = data[0];
    const token = generateFakeToken(user, 60 * 60);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    return { success: true, user, token };
  }
  return { success: false, message: "Email hoặc mật khẩu không đúng" };
}
// hoặc từ cùng file nếu bạn để chung

export async function register(formValues) {
  try {
    const { confirmPassword, accept, dob, province, district, ward, ...rest } =
      formValues;

    const collapseSpace = (s) =>
      typeof s === "string" ? s.replace(/\s+/g, " ").trim() : s;
    const trimOnly = (s) => (typeof s === "string" ? s.trim() : s);

    const firstName = collapseSpace(rest.firstName);
    const lastName = collapseSpace(rest.lastName);
    const email = (rest.email || "").toLowerCase().trim();
    const phoneRaw = trimOnly(rest.phone);
    const password = trimOnly(rest.password);
    const dobStr =
      dob && typeof dob?.format === "function"
        ? dob.format("YYYY-MM-DD")
        : dob || null;

    // ✅ Gom lỗi theo field
    const errors = {};
    if (accept !== true) errors.accept = "Bạn cần đồng ý điều khoản & bảo mật.";
    if (!lastName) errors.lastName = "Vui lòng nhập họ hợp lệ.";
    if (!firstName) errors.firstName = "Vui lòng nhập tên hợp lệ.";

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) errors.email = "Email không hợp lệ.";

    const phone = (phoneRaw || "").replace(/\D/g, "");
    if (!/^\d{9,11}$/.test(phone)) errors.phone = "Số điện thoại không hợp lệ.";

    if (!password || password.length < 6)
      errors.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (confirmPassword !== password)
      errors.confirmPassword = "Mật khẩu không khớp.";

    // (Nếu cần bắt buộc địa chỉ)
    // if (!province) errors.province = "Chọn tỉnh/thành phố";
    // if (!district) errors.district = "Chọn quận/huyện";
    // if (!ward) errors.ward = "Chọn phường/xã";

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Check trùng email
    const check = await fetch(
      `${API_URL}/users?email=${encodeURIComponent(email)}`
    );
    if (!check.ok)
      return {
        success: false,
        message: `HTTP ${check.status} khi kiểm tra email`,
      };
    const exist = await check.json();
    if (Array.isArray(exist) && exist.length > 0) {
      return { success: false, errors: { email: "Email đã tồn tại" } };
    }

    const payload = {
      ...rest,
      firstName,
      lastName,
      email,
      phone,
      password,
      dob: dobStr,
      address: {
        provinceId: province ?? null,
        districtId: district ?? null,
        wardId: ward ?? null,
      },
      role: "user",
      createdAt: new Date().toISOString(),
    };

    const res = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok)
      return { success: false, message: `HTTP ${res.status} khi tạo user` };
    const user = await res.json();
    return { success: true, user, token };
  } catch (e) {
    return { success: false, message: e?.message || "Register lỗi" };
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const token = getToken();
  const payload = verifyFakeToken(token);
  if (!payload) return null;
  const stored = localStorage.getItem("user");
  return stored
    ? JSON.parse(stored)
    : { id: payload.sub, email: payload.email, name: payload.name };
}

export function isAuthenticated() {
  return !!verifyFakeToken(getToken());
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
