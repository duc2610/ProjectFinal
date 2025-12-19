import { Grid } from "antd";

const { useBreakpoint } = Grid;

/**
 * Hook để lấy pageSize phù hợp với kích thước màn hình
 * - Màn hình nhỏ (< 768px): 6 items/trang
 * - Màn hình lớn (>= 768px): 12 items/trang
 */
export function useResponsivePageSize() {
  const screens = useBreakpoint();
  const isMobile = !screens.md; // md breakpoint = 768px
  return isMobile ? 6 : 12;
}

