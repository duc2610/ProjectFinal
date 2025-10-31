import { api } from "./apiClient";

// 📘 Helper function: log API call
function logApiCall(title, url, method, payload, response) {
  console.log(`✅ ${title}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`📦 Method: ${method}`);
  console.log(`📤 Payload:`, payload ?? null);
  console.log(`📥 Response:`, response?.data ?? response);
  console.log(`📊 Status:`, response?.status ?? "unknown");
  console.log("-----------------------------------");
}

// 📋 Lấy danh sách tất cả user
export async function getAllUsers() {
  const url = `/api/Users`;
  try {
    const res = await api.get(url);
    logApiCall("GET ALL USERS", url, "GET", null, res);

    // Trích đúng danh sách người dùng từ cấu trúc data bạn gửi
    return res?.data?.data?.dataPaginated ?? [];
  } catch (error) {
    console.error("❌ Error fetching all users:", error);
    throw error;
  }
}

// 🔍 Lấy thông tin user theo ID
export async function getUserById(userId) {
  const url = `/api/Users/${userId}`;
  try {
    const res = await api.get(url);
    logApiCall("GET USER BY ID", url, "GET", null, res);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`❌ Error fetching user ${userId}:`, error);
    throw error;
  }
}

// ➕ Tạo mới user
export async function createUser(data) {
  const url = `/api/Users`;
  try {
    const res = await api.post(url, data);
    logApiCall("CREATE USER", url, "POST", data, res);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error("❌ Error creating user:", error);
    throw error;
  }
}

// ✏️ Cập nhật thông tin user
export async function updateUser(userId, data) {
  const url = `/api/Users/${userId}`;
  try {
    const res = await api.put(url, data);
    logApiCall("UPDATE USER", url, "PUT", data, res);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`❌ Error updating user ${userId}:`, error);
    throw error;
  }
}

// 🔒 Khóa (ban) user
export async function banUser(userId) {
  const url = `/api/Users/${userId}/ban`;
  try {
    const res = await api.put(url);
    logApiCall("BAN USER", url, "PUT", null, res);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`❌ Error banning user ${userId}:`, error);
    throw error;
  }
}

// 🔓 Mở khóa (unban) user
export async function unbanUser(userId) {
  const url = `/api/Users/${userId}/unban`;
  try {
    const res = await api.put(url);
    logApiCall("UNBAN USER", url, "PUT", null, res);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`❌ Error unbanning user ${userId}:`, error);
    throw error;
  }
}
