import { api } from "./apiClient";

function buildUserQuery({
  page = 1,
  pageSize = 10,
  status,
  keyword,
  role,
} = {}) {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("pageSize", pageSize);

  if (status) params.append("Status", status);
  if (keyword) params.append("Keyword", keyword.trim());
  if (role && role !== "all") params.append("Role", role);

  return params;
}

function mapUsersResponse(res, fallback) {
  const payload = res?.data?.data ?? {};
  return {
    items: payload?.dataPaginated ?? fallback ?? [],
    pagination: {
      currentPage: payload?.currentPage ?? 1,
      pageSize: payload?.pageSize ?? 10,
      totalCount: payload?.totalCount ?? (fallback?.length ?? 0),
      totalPages: payload?.totalPages ?? 1,
      hasNextPage: payload?.hasNextPage ?? false,
      hasPreviousPage: payload?.hasPreviousPage ?? false,
    },
  };
}

// Lấy danh sách tất cả user (có hỗ trợ phân trang & filter)
export async function getAllUsers(options = {}) {
  const params = buildUserQuery(options);
  const url = `/api/Users?${params.toString()}`;

  try {
    const res = await api.get(url);
    return mapUsersResponse(res, []);
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

// Lấy danh sách tài khoản bị ban (Status=Banned)
export async function getBannedUsers(options = {}) {
  return getAllUsers({ ...options, status: "Banned" });
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