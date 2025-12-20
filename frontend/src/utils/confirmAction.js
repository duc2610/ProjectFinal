import { Modal } from "antd";

/**
 * Helper dùng chung để hiển thị modal xác nhận.
 * Giảm lặp code Modal.confirm / window.confirm khắp nơi.
 */
export function confirmAction({
  title = "Xác nhận thao tác",
  content = "Bạn có chắc chắn muốn tiếp tục?",
  okText = "Đồng ý",
  cancelText = "Hủy",
  okType = "primary",
  onOk,
}) {
  Modal.confirm({
    title,
    content,
    okText,
    cancelText,
    okType,
    onOk,
  });
}


