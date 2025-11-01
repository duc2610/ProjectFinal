import { api } from "./apiClient";

// Lấy danh sách tất cả user
export async function getAllUsers() {
  const url = `/api/Users`;
  try {
    const res = await api.get(url);
    return res?.data?.data?.dataPaginated ?? [];
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

// Lấy danh sách tài khoản bị ban (Status=Banned)
export async function getBannedUsers() {
  const params = new URLSearchParams();
  params.append("Status", "Banned");

  const url = `/api/Users?${params.toString()}`;
  try {
    const res = await api.get(url);
    return res?.data?.data?.dataPaginated ?? [];
  } catch (error) {
    console.error("Error fetching banned users:", error);
    throw error;
  }
}

// Lấy thông tin user theo ID
export async function getUserById(userId) {
  const url = `/api/Users/${userId}`;
  try {
    const res = await api.get(url);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
}

// Tạo mới user
export async function createUser(data) {
  const url = `/api/Users`;
  try {
    const res = await api.post(url, data);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Cập nhật thông tin user
export async function updateUser(userId, data) {
  const url = `/api/Users/${userId}`;
  try {
    const res = await api.put(url, data);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
}

// Khóa (ban) user
export async function banUser(userId) {
  const url = `/api/Users/${userId}/ban`;
  try {
    const res = await api.put(url);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`Error banning user ${userId}:`, error);
    throw error;
  }
}

// Mở khóa (unban) user
export async function unbanUser(userId) {
  const url = `/api/Users/${userId}/unban`;
  try {
    const res = await api.put(url);
    return res?.data?.data ?? res?.data;
  } catch (error) {
    console.error(`Error unbanning user ${userId}:`, error);
    throw error;
  }
}