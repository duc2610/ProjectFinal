import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Card, Collapse, Input, Row, Col, Tag } from "antd";
import {
  QuestionCircleOutlined,
  SearchOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
  SafetyOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import styles from "@shared/styles/FAQ.module.css";

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

export default function FAQ() {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [activeKeys, setActiveKeys] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  const faqCategories = [
    {
      key: "account",
      title: "Tài khoản",
      icon: <UserOutlined />,
      color: "#1890ff",
      questions: [
        {
          key: "account-1",
          question: "Làm thế nào để đăng ký tài khoản?",
          answer: (
            <div>
              <Paragraph>
                Để đăng ký tài khoản trên Toeic Genius, bạn thực hiện các bước sau:
              </Paragraph>
              <ol className={styles.orderedList}>
                <li>Truy cập trang chủ và click vào nút "Đăng ký" ở góc trên bên phải</li>
                <li>Điền đầy đủ thông tin: Email, Mật khẩu, Họ tên</li>
                <li>Xác nhận email để kích hoạt tài khoản (nếu có)</li>
                <li>Đăng nhập và bắt đầu sử dụng dịch vụ</li>
              </ol>
            </div>
          ),
        },
        {
          key: "account-2",
          question: "Tôi quên mật khẩu, làm sao để lấy lại?",
          answer: (
            <div>
              <Paragraph>
                Nếu bạn quên mật khẩu, bạn có thể khôi phục bằng cách:
              </Paragraph>
              <ol className={styles.orderedList}>
                <li>Truy cập trang đăng nhập và click vào "Quên mật khẩu?"</li>
                <li>Nhập email đã đăng ký</li>
                <li>Kiểm tra email và click vào link khôi phục mật khẩu</li>
                <li>Đặt mật khẩu mới và đăng nhập lại</li>
              </ol>
              <Paragraph>
                <strong>Lưu ý:</strong> Nếu không nhận được email, vui lòng kiểm tra thư mục Spam hoặc liên hệ với chúng tôi qua email support@toeicgenius.com
              </Paragraph>
            </div>
          ),
        },
        {
          key: "account-3",
          question: "Tôi có thể thay đổi thông tin tài khoản không?",
          answer: (
            <div>
              <Paragraph>
                Có, bạn có thể thay đổi thông tin tài khoản:
              </Paragraph>
              <ul className={styles.list}>
                <li>Vào mục "Cá nhân" hoặc "Cài đặt" trong tài khoản</li>
                <li>Chỉnh sửa thông tin như Họ tên, Email (nếu được phép)</li>
                <li>Lưu thay đổi</li>
              </ul>
              <Paragraph>
                <strong>Lưu ý:</strong> Một số thông tin như Email có thể yêu cầu xác nhận lại.
              </Paragraph>
            </div>
          ),
        },
        {
          key: "account-4",
          question: "Tài khoản của tôi bị khóa, tôi phải làm gì?",
          answer: (
            <div>
              <Paragraph>
                Nếu tài khoản của bạn bị khóa, có thể do:
              </Paragraph>
              <ul className={styles.list}>
                <li>Vi phạm quy định sử dụng dịch vụ</li>
                <li>Hoạt động đáng ngờ hoặc gian lận</li>
                <li>Nhiều lần đăng nhập sai mật khẩu</li>
              </ul>
              <Paragraph>
                Để được hỗ trợ:
              </Paragraph>
              <ol className={styles.orderedList}>
                <li>Liên hệ với chúng tôi qua email support@toeicgenius.com</li>
                <li>Cung cấp thông tin tài khoản và mô tả tình huống</li>
                <li>Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ</li>
              </ol>
            </div>
          ),
        },
      ],
    },
    {
      key: "test",
      title: "Bài thi và Luyện tập",
      icon: <BookOutlined />,
      color: "#52c41a",
      questions: [
        {
          key: "test-1",
          question: "Làm thế nào để làm bài thi?",
          answer: (
            <div>
              <Paragraph>
                Để làm bài thi trên Toeic Genius:
              </Paragraph>
              <ol className={styles.orderedList}>
                <li>Đăng nhập vào tài khoản của bạn</li>
                <li>Vào mục "Bài thi" hoặc "Luyện tập"</li>
                <li>Chọn bài thi bạn muốn làm</li>
                <li>Đọc kỹ hướng dẫn và click "Bắt đầu làm bài"</li>
                <li>Làm bài theo thời gian quy định</li>
                <li>Click "Nộp bài" khi hoàn thành hoặc hệ thống sẽ tự động nộp khi hết thời gian</li>
              </ol>
            </div>
          ),
        },
        {
          key: "test-2",
          question: "Tiến độ làm bài có được lưu tự động không?",
          answer: (
            <div>
              <Paragraph>
                Có, hệ thống sẽ tự động lưu tiến độ làm bài của bạn:
              </Paragraph>
              <ul className={styles.list}>
                <li>Bạn có thể dừng làm bài bất cứ lúc nào và quay lại tiếp tục sau</li>
                <li>Tiến độ được lưu trong vòng thời gian quy định của bài thi</li>
                <li>Khi quay lại, bạn sẽ tiếp tục từ câu hỏi đã làm dở</li>
              </ul>
              <Paragraph>
                <strong>Lưu ý:</strong> Sau khi hết thời gian quy định, bạn không thể tiếp tục làm bài nữa.
              </Paragraph>
            </div>
          ),
        },
        {
          key: "test-3",
          question: "Có bao nhiêu loại bài thi?",
          answer: (
            <div>
              <Paragraph>
                Toeic Genius cung cấp các loại bài thi sau:
              </Paragraph>
              <ul className={styles.list}>
                <li><strong>Bài thi mô phỏng:</strong> Bài thi đầy đủ 4 kỹ năng (Listening, Reading, Speaking, Writing)</li>
                <li><strong>Luyện tập Listening & Reading:</strong> Chỉ tập trung vào 2 kỹ năng L&R</li>
                <li><strong>Luyện tập Speaking & Writing:</strong> Chỉ tập trung vào 2 kỹ năng S&W</li>
                <li><strong>Bài thi từ ngân hàng câu hỏi:</strong> Bài thi được tạo từ ngân hàng câu hỏi có sẵn</li>
              </ul>
            </div>
          ),
        },
        {
          key: "test-4",
          question: "Tôi có thể làm lại bài thi đã làm chưa?",
          answer: (
            <div>
              <Paragraph>
                Tùy thuộc vào loại bài thi:
              </Paragraph>
              <ul className={styles.list}>
                <li><strong>Bài thi mô phỏng:</strong> Thông thường bạn chỉ có thể làm một lần</li>
                <li><strong>Bài luyện tập:</strong> Bạn có thể làm lại nhiều lần để cải thiện điểm số</li>
                <li><strong>Bài thi từ ngân hàng:</strong> Có thể làm lại nếu được phép</li>
              </ul>
              <Paragraph>
                Bạn có thể xem lại kết quả và đáp án của các bài thi đã làm trong mục "Lịch sử làm bài".
              </Paragraph>
            </div>
          ),
        },
        {
          key: "test-5",
          question: "Điểm số có chính xác như kỳ thi TOEIC thực tế không?",
          answer: (
            <div>
              <Paragraph>
                Điểm số trên Toeic Genius chỉ mang tính chất tham khảo cho mục đích luyện tập:
              </Paragraph>
              <ul className={styles.list}>
                <li>Điểm số được tính dựa trên số câu trả lời đúng và độ khó của câu hỏi</li>
                <li>Đối với phần Speaking và Writing, điểm được tính bằng công nghệ AI</li>
                <li>Điểm số không đảm bảo sẽ khớp hoàn toàn với kỳ thi TOEIC chính thức</li>
                <li>Mục đích chính là giúp bạn đánh giá trình độ và cải thiện kỹ năng</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    {
      key: "flashcard",
      title: "Flashcard",
      icon: <TrophyOutlined />,
      color: "#faad14",
      questions: [
        {
          key: "flashcard-1",
          question: "Làm thế nào để tạo Flashcard?",
          answer: (
            <div>
              <Paragraph>
                Để tạo Flashcard mới:
              </Paragraph>
              <ol className={styles.orderedList}>
                <li>Vào mục "Flashcard" trên thanh menu</li>
                <li>Click vào nút "Tạo Flashcard mới"</li>
                <li>Điền thông tin: Từ vựng, Nghĩa, Ví dụ (tùy chọn), Ghi chú (tùy chọn)</li>
                <li>Chọn chế độ công khai hoặc riêng tư</li>
                <li>Click "Lưu" để hoàn tất</li>
              </ol>
              <Paragraph>
                Bạn cũng có thể tìm kiếm và sử dụng các Flashcard công khai từ người dùng khác.
              </Paragraph>
            </div>
          ),
        },
        {
          key: "flashcard-2",
          question: "Tôi có thể chia sẻ Flashcard với người khác không?",
          answer: (
            <div>
              <Paragraph>
                Có, bạn có thể chia sẻ Flashcard:
              </Paragraph>
              <ul className={styles.list}>
                <li>Khi tạo Flashcard, chọn chế độ "Công khai" để cho phép mọi người xem và sử dụng</li>
                <li>Flashcard công khai sẽ xuất hiện trong danh sách tìm kiếm của người dùng khác</li>
                <li>Bạn có thể thay đổi chế độ từ riêng tư sang công khai bất cứ lúc nào</li>
                <li>Flashcard riêng tư chỉ bạn mới có thể xem và sử dụng</li>
              </ul>
            </div>
          ),
        },
        {
          key: "flashcard-3",
          question: "Làm thế nào để học Flashcard hiệu quả?",
          answer: (
            <div>
              <Paragraph>
                Để học Flashcard hiệu quả:
              </Paragraph>
              <ul className={styles.list}>
                <li>Ôn tập thường xuyên, đặc biệt là các từ vựng khó</li>
                <li>Sử dụng tính năng đánh dấu để theo dõi từ vựng cần ôn lại</li>
                <li>Tạo các bộ Flashcard theo chủ đề để dễ nhớ</li>
                <li>Kết hợp học từ vựng với làm bài thi để áp dụng kiến thức</li>
                <li>Xem lại các ví dụ và ghi chú để hiểu rõ hơn về cách sử dụng từ</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    {
      key: "technical",
      title: "Kỹ thuật và Sự cố",
      icon: <SettingOutlined />,
      color: "#722ed1",
      questions: [
        {
          key: "technical-1",
          question: "Tôi phát hiện câu hỏi có sai sót, làm sao để báo cáo?",
          answer: (
            <div>
              <Paragraph>
                Chúng tôi rất cảm ơn bạn đã phát hiện và báo cáo sai sót. Để báo cáo:
              </Paragraph>
              <ol className={styles.orderedList}>
                <li>Trong khi làm bài, click vào nút "Báo cáo câu hỏi" ở câu hỏi có vấn đề</li>
                <li>Mô tả chi tiết vấn đề bạn phát hiện (ví dụ: đáp án sai, câu hỏi không rõ ràng, lỗi kỹ thuật)</li>
                <li>Gửi báo cáo cho chúng tôi</li>
                <li>Hoặc gửi email trực tiếp đến support@toeicgenius.com với tiêu đề "Báo cáo câu hỏi"</li>
              </ol>
              <Paragraph>
                Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất. Cảm ơn bạn đã góp phần cải thiện chất lượng nội dung!
              </Paragraph>
            </div>
          ),
        },
        {
          key: "technical-2",
          question: "Tôi có thể sử dụng Toeic Genius trên điện thoại không?",
          answer: (
            <div>
              <Paragraph>
                Có, Toeic Genius được thiết kế responsive và có thể sử dụng trên:
              </Paragraph>
              <ul className={styles.list}>
                <li>Máy tính để bàn và laptop</li>
                <li>Tablet</li>
                <li>Điện thoại thông minh (smartphone)</li>
              </ul>
              <Paragraph>
                Bạn chỉ cần truy cập website qua trình duyệt trên thiết bị của mình. 
                Giao diện sẽ tự động điều chỉnh để phù hợp với kích thước màn hình.
              </Paragraph>
              <Paragraph>
                <strong>Lưu ý:</strong> Để có trải nghiệm tốt nhất, chúng tôi khuyến nghị sử dụng trình duyệt Chrome, Firefox, hoặc Safari phiên bản mới nhất.
              </Paragraph>
            </div>
          ),
        },
        {
          key: "technical-3",
          question: "Trang web không tải được hoặc bị lỗi, tôi phải làm gì?",
          answer: (
            <div>
              <Paragraph>
                Nếu gặp vấn đề kỹ thuật, bạn có thể thử:
              </Paragraph>
              <ol className={styles.orderedList}>
                <li>Làm mới trang (F5 hoặc Ctrl+R)</li>
                <li>Xóa cache và cookie của trình duyệt</li>
                <li>Thử sử dụng trình duyệt khác</li>
                <li>Kiểm tra kết nối internet</li>
                <li>Đăng xuất và đăng nhập lại</li>
              </ol>
              <Paragraph>
                Nếu vấn đề vẫn tiếp tục, vui lòng liên hệ với chúng tôi qua email support@toeicgenius.com 
                và mô tả chi tiết vấn đề bạn gặp phải (bao gồm trình duyệt, thiết bị, và thời điểm xảy ra lỗi).
              </Paragraph>
            </div>
          ),
        },
      ],
    },
    {
      key: "policy",
      title: "Quy định và Chính sách",
      icon: <SafetyOutlined />,
      color: "#f5222d",
      questions: [
        {
          key: "policy-1",
          question: "Dịch vụ có miễn phí không?",
          answer: (
            <div>
              <Paragraph>
                Toeic Genius cung cấp nhiều tính năng miễn phí cho người dùng:
              </Paragraph>
              <ul className={styles.list}>
                <li>Đăng ký và sử dụng tài khoản</li>
                <li>Làm bài thi và luyện tập</li>
                <li>Tạo và sử dụng Flashcard</li>
                <li>Xem kết quả và phân tích điểm số</li>
                <li>Truy cập các Flashcard công khai</li>
              </ul>
              <Paragraph>
                Một số tính năng nâng cao có thể yêu cầu đăng ký gói Premium. 
                Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.
              </Paragraph>
            </div>
          ),
        },
        {
          key: "policy-2",
          question: "Tôi có thể chia sẻ tài khoản với người khác không?",
          answer: (
            <div>
              <Paragraph>
                <strong>Không được phép.</strong> Theo quy định sử dụng dịch vụ:
              </Paragraph>
              <ul className={styles.list}>
                <li>Mỗi người dùng chỉ được phép tạo và sử dụng một tài khoản duy nhất</li>
                <li>Không được chia sẻ tài khoản với người khác</li>
                <li>Việc chia sẻ tài khoản có thể dẫn đến việc tài khoản bị khóa</li>
              </ul>
              <Paragraph>
                Để đảm bảo tính công bằng và bảo mật, mỗi người dùng nên có tài khoản riêng.
              </Paragraph>
            </div>
          ),
        },
        {
          key: "policy-3",
          question: "Tôi có thể tải xuống nội dung bài thi không?",
          answer: (
            <div>
              <Paragraph>
                <strong>Không được phép.</strong> Theo quy định về quyền sở hữu:
              </Paragraph>
              <ul className={styles.list}>
                <li>Bạn không được tải xuống, sao chép, hoặc lưu trữ nội dung bài thi, câu hỏi để sử dụng ngoài nền tảng</li>
                <li>Tất cả nội dung bài thi thuộc quyền sở hữu của Toeic Genius</li>
                <li>Việc chia sẻ đáp án hoặc nội dung bài thi với người khác là vi phạm quy định</li>
              </ul>
              <Paragraph>
                Mục đích của nền tảng là giúp bạn luyện tập, không phải để sao chép nội dung.
              </Paragraph>
            </div>
          ),
        },
      ],
    },
  ];

  // Filter FAQs based on search text
  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchText.toLowerCase()) ||
        (typeof q.answer === "string" && q.answer.toLowerCase().includes(searchText.toLowerCase()))
    ),
  })).filter((category) => category.questions.length > 0);

  const handleSearch = (value) => {
    setSearchText(value);
    if (value) {
      // Auto expand all panels when searching
      const allKeys = filteredCategories.flatMap((cat) => cat.questions.map((q) => q.key));
      setActiveKeys(allKeys);
    } else {
      setActiveKeys([]);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <Card className={styles.heroCard}>
          <div className={styles.heroContent}>
            <QuestionCircleOutlined className={styles.heroIcon} />
            <Title level={1} className={styles.heroTitle}>
              Câu hỏi thường gặp
            </Title>
            <Paragraph className={styles.heroDescription}>
              Tìm câu trả lời nhanh cho các câu hỏi phổ biến về Toeic Genius. 
              Nếu không tìm thấy câu trả lời, vui lòng liên hệ với chúng tôi.
            </Paragraph>
            <div className={styles.searchContainer}>
              <Search
                placeholder="Tìm kiếm câu hỏi..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* FAQ Categories */}
      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => (
          <Card key={category.key} className={styles.card}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryIcon} style={{ color: category.color }}>
                {category.icon}
              </div>
              <Title level={2} className={styles.categoryTitle} style={{ color: category.color }}>
                {category.title}
              </Title>
            </div>
            <Collapse
              activeKey={activeKeys}
              onChange={setActiveKeys}
              items={category.questions.map((q) => ({
                key: q.key,
                label: q.question,
                children: q.answer,
              }))}
              className={styles.faqCollapse}
              expandIcon={({ isActive }) => (
                <QuestionCircleOutlined rotate={isActive ? 90 : 0} style={{ color: category.color }} />
              )}
            />
          </Card>
        ))
      ) : (
        <Card className={styles.card}>
          <div className={styles.noResults}>
            <QuestionCircleOutlined className={styles.noResultsIcon} />
            <Title level={3} className={styles.noResultsTitle}>
              Không tìm thấy kết quả
            </Title>
            <Paragraph className={styles.noResultsText}>
              Không có câu hỏi nào khớp với từ khóa tìm kiếm của bạn. 
              Vui lòng thử lại với từ khóa khác hoặc liên hệ với chúng tôi qua email support@toeicgenius.com
            </Paragraph>
          </div>
        </Card>
      )}

      {/* Contact CTA */}
      <Card className={styles.card}>
        <div className={styles.ctaSection}>
          <Title level={2} className={styles.ctaTitle}>
            Vẫn chưa tìm thấy câu trả lời?
          </Title>
          <Paragraph className={styles.ctaText}>
            Nếu bạn có câu hỏi khác hoặc cần hỗ trợ thêm, đừng ngần ngại liên hệ với chúng tôi.
            Đội ngũ hỗ trợ của Toeic Genius luôn sẵn sàng giúp đỡ bạn.
          </Paragraph>
          <div className={styles.ctaContact}>
            <Text strong className={styles.ctaContactText}>
              Email: support@toeicgenius.com | Hotline: +84 123 456 789
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}

