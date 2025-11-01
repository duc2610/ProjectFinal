import React from "react";
import { Modal, Card, Row, Col, Typography } from "antd";
import { EditOutlined, DatabaseOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function TestTypeSelectionModal({ open, onClose, onSelect }) {
    return (
        <Modal
            title="Chọn loại bài thi"
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <Row gutter={24}>
                <Col span={12}>
                    <Card
                        hoverable
                        onClick={() => onSelect("manual")}
                        style={{ 
                            textAlign: "center", 
                            height: "100%",
                            border: "2px solid #1890ff"
                        }}
                    >
                        <EditOutlined style={{ fontSize: 48, color: "#1890ff", marginBottom: 16 }} />
                        <Title level={4}>Simulator Test</Title>
                        <Title level={5} type="secondary">(Tạo thủ công)</Title>
                        <Paragraph>
                            Tự tạo đề thi hoàn chỉnh với cấu trúc TOEIC chuẩn.
                            Nhập từng câu hỏi, đáp án và giải thích.
                        </Paragraph>
                        <Paragraph type="secondary">
                            • Tự do thiết kế nội dung<br/>
                            • Upload audio/ảnh<br/>
                            • Validate theo cấu trúc TOEIC
                        </Paragraph>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        hoverable
                        onClick={() => onSelect("fromBank")}
                        style={{ 
                            textAlign: "center", 
                            height: "100%",
                            border: "2px solid #52c41a"
                        }}
                    >
                        <DatabaseOutlined style={{ fontSize: 48, color: "#52c41a", marginBottom: 16 }} />
                        <Title level={4}>Practice Test</Title>
                        <Title level={5} type="secondary">(Tạo từ ngân hàng)</Title>
                        <Paragraph>
                            Tạo đề thi luyện tập từ ngân hàng câu hỏi có sẵn.
                            Chọn câu hỏi theo ID hoặc random.
                        </Paragraph>
                        <Paragraph type="secondary">
                            • Nhanh chóng, tiện lợi<br/>
                            • Sử dụng câu hỏi đã có<br/>
                            • Tạo nhiều đề cùng lúc
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
}

