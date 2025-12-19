import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Card } from "antd";
import styles from "@shared/styles/Rules.module.css";

const { Title, Paragraph, Text } = Typography;

export default function Rules() {
  const lastUpdated = "18/10/2025";
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.key]);

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={1} className={styles.title}>
            Quy định sử dụng
          </Title>
          <Text type="secondary" className={styles.lastUpdated}>
            Cập nhật lần cuối: {lastUpdated}
          </Text>
        </div>

        <Divider />

        <div className={styles.content}>
          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              1. Giới thiệu
            </Title>
            <Paragraph>
              Trang <strong>Quy định sử dụng</strong> này nhằm hướng dẫn và quy định cách thức sử dụng dịch vụ 
              <strong> Toeic Genius</strong> một cách đúng đắn và hiệu quả. Các quy định này được thiết lập để đảm bảo 
              trải nghiệm học tập tốt nhất cho tất cả người dùng và duy trì chất lượng của nền tảng.
            </Paragraph>
            <Paragraph>
              Bằng việc sử dụng Dịch vụ, bạn đồng ý tuân thủ các quy định được nêu trong tài liệu này. 
              Vi phạm các quy định có thể dẫn đến việc tạm ngừng hoặc chấm dứt tài khoản của bạn.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              2. Quy định về tài khoản
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  <strong>Một người một tài khoản:</strong> Mỗi người dùng chỉ được phép tạo và sử dụng một tài khoản duy nhất. 
                  Việc tạo nhiều tài khoản để gian lận hoặc lạm dụng dịch vụ là không được phép.
                </li>
                <li>
                  <strong>Thông tin chính xác:</strong> Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi đăng ký 
                  và sử dụng tài khoản. Không được giả mạo danh tính hoặc cung cấp thông tin sai lệch.
                </li>
                <li>
                  <strong>Bảo mật tài khoản:</strong> Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình. Không được 
                  chia sẻ tài khoản với người khác hoặc để người khác sử dụng tài khoản của bạn.
                </li>
                <li>
                  <strong>Thông báo vi phạm:</strong> Nếu phát hiện tài khoản của bạn bị truy cập trái phép hoặc có hoạt động 
                  đáng ngờ, bạn phải thông báo ngay cho chúng tôi.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              3. Quy định về làm bài thi và luyện tập
            </Title>
            <Paragraph>
              <strong>3.1. Trong quá trình làm bài:</strong>
              <ul className={styles.list}>
                <li>
                  <strong>Trung thực:</strong> Bạn phải làm bài một cách trung thực, không sử dụng bất kỳ hình thức gian lận nào 
                  như sử dụng công cụ dịch thuật, nhờ người khác làm hộ, hoặc tra cứu đáp án từ nguồn khác trong khi đang làm bài.
                </li>
                <li>
                  <strong>Thời gian làm bài:</strong> Bạn phải tuân thủ thời gian quy định của bài thi. Hệ thống sẽ tự động nộp bài 
                  khi hết thời gian.
                </li>
                <li>
                  <strong>Lưu tiến độ:</strong> Tiến độ làm bài được lưu tự động. Bạn có thể tiếp tục làm bài từ điểm đã lưu trong 
                  vòng thời gian quy định của bài thi.
                </li>
                <li>
                  <strong>Không làm gián đoạn:</strong> Không được cố ý làm gián đoạn hoặc can thiệp vào quá trình làm bài của người dùng khác.
                </li>
              </ul>
            </Paragraph>
            <Paragraph>
              <strong>3.2. Về kết quả và điểm số:</strong>
              <ul className={styles.list}>
                <li>
                  <strong>Kết quả chỉ mang tính tham khảo:</strong> Điểm số và kết quả trên nền tảng chỉ mang tính chất tham khảo 
                  cho mục đích luyện tập. Chúng không đảm bảo sẽ khớp với điểm số trong kỳ thi TOEIC chính thức.
                </li>
                <li>
                  <strong>Chấm điểm AI:</strong> Đối với phần Speaking và Writing, điểm số được tính bằng công nghệ AI và có thể có 
                  sai sót. Bạn không được khiếu nại về độ chính xác của điểm AI.
                </li>
                <li>
                  <strong>Không chia sẻ đáp án:</strong> Bạn không được chia sẻ đáp án, câu hỏi, hoặc nội dung bài thi với người khác 
                  để đảm bảo tính công bằng cho tất cả người dùng.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              4. Quy định về Flashcard
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  <strong>Nội dung phù hợp:</strong> Flashcard bạn tạo phải có nội dung phù hợp, chính xác và phục vụ mục đích học tập. 
                  Không được tạo flashcard có nội dung sai lệch, phản cảm, hoặc vi phạm đạo đức xã hội.
                </li>
                <li>
                  <strong>Bản quyền:</strong> Bạn phải đảm bảo rằng nội dung flashcard không vi phạm bản quyền của bên thứ ba. 
                  Không được sao chép nguyên văn từ các nguồn có bản quyền mà không có sự cho phép.
                </li>
                <li>
                  <strong>Flashcard công khai:</strong> Khi đánh dấu flashcard là "công khai", bạn đồng ý cho phép người dùng khác 
                  xem và sử dụng flashcard đó. Chúng tôi có quyền kiểm duyệt và xóa flashcard không phù hợp.
                </li>
                <li>
                  <strong>Không spam:</strong> Không được tạo số lượng lớn flashcard không có giá trị hoặc spam để làm giảm chất lượng 
                  nội dung trên nền tảng.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              5. Quy định về hành vi và giao tiếp
            </Title>
            <Paragraph>
              Bạn không được thực hiện các hành vi sau:
            </Paragraph>
            <ul className={styles.list}>
              <li>
                <strong>Gian lận và lừa đảo:</strong> Không được sử dụng các công cụ, phần mềm, hoặc phương thức gian lận để đạt điểm cao 
                hoặc lợi dụng hệ thống.
              </li>
              <li>
                <strong>Quấy rối:</strong> Không được quấy rối, đe dọa, hoặc làm phiền người dùng khác thông qua bất kỳ hình thức nào.
              </li>
              <li>
                <strong>Nội dung không phù hợp:</strong> Không được tạo, tải lên, hoặc chia sẻ nội dung có tính chất bạo lực, phân biệt đối xử, 
                hoặc vi phạm pháp luật.
              </li>
              <li>
                <strong>Spam và quảng cáo:</strong> Không được sử dụng Dịch vụ để gửi spam, quảng cáo, hoặc các thông điệp không mong muốn.
              </li>
              <li>
                <strong>Can thiệp hệ thống:</strong> Không được cố gắng hack, phá hoại, hoặc can thiệp vào hoạt động bình thường của hệ thống.
              </li>
              <li>
                <strong>Vi phạm pháp luật:</strong> Không được sử dụng Dịch vụ để thực hiện các hành vi vi phạm pháp luật Việt Nam hoặc quốc tế.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              6. Quy định về báo cáo và khiếu nại
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  <strong>Báo cáo câu hỏi:</strong> Nếu bạn phát hiện câu hỏi có sai sót, lỗi kỹ thuật, hoặc nội dung không phù hợp, 
                  bạn có thể báo cáo thông qua tính năng báo cáo trên nền tảng.
                </li>
                <li>
                  <strong>Báo cáo vi phạm:</strong> Nếu bạn phát hiện người dùng khác vi phạm quy định, vui lòng báo cáo cho chúng tôi 
                  qua email hoặc tính năng báo cáo.
                </li>
                <li>
                  <strong>Khiếu nại:</strong> Mọi khiếu nại về dịch vụ phải được gửi bằng văn bản qua email hoặc kênh chính thức của chúng tôi. 
                  Chúng tôi sẽ xem xét và phản hồi trong thời gian hợp lý.
                </li>
                <li>
                  <strong>Báo cáo sai:</strong> Việc báo cáo sai hoặc cố ý vu khống có thể dẫn đến việc tài khoản của bạn bị xử lý.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              7. Quy định về quyền sở hữu và sử dụng nội dung
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  <strong>Nội dung của Toeic Genius:</strong> Tất cả câu hỏi, bài thi, hình ảnh, âm thanh và các tài nguyên khác do 
                  Toeic Genius tạo ra đều thuộc quyền sở hữu của chúng tôi. Bạn không được sao chép, phân phối, hoặc sử dụng cho mục đích 
                  thương mại mà không có sự cho phép.
                </li>
                <li>
                  <strong>Nội dung của bạn:</strong> Flashcard và các nội dung khác bạn tạo thuộc quyền sở hữu của bạn, nhưng bạn cấp cho 
                  Toeic Genius quyền sử dụng và hiển thị trên nền tảng.
                </li>
                <li>
                  <strong>Không tải xuống:</strong> Bạn không được tải xuống, sao chép, hoặc lưu trữ nội dung bài thi, câu hỏi để sử dụng 
                  ngoài nền tảng.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              8. Xử lý vi phạm
            </Title>
            <Paragraph>
              Khi phát hiện vi phạm các quy định này, chúng tôi có quyền áp dụng các biện pháp xử lý sau:
            </Paragraph>
            <ul className={styles.list}>
              <li>
                <strong>Cảnh báo:</strong> Lần vi phạm đầu tiên hoặc vi phạm nhẹ có thể được xử lý bằng cảnh báo qua email hoặc thông báo trên nền tảng.
              </li>
              <li>
                <strong>Tạm ngừng tài khoản:</strong> Vi phạm nghiêm trọng hoặc tái phạm có thể dẫn đến việc tạm ngừng tài khoản trong một khoảng thời gian nhất định.
              </li>
              <li>
                <strong>Chấm dứt tài khoản:</strong> Vi phạm rất nghiêm trọng hoặc vi phạm nhiều lần có thể dẫn đến việc chấm dứt vĩnh viễn tài khoản.
              </li>
              <li>
                <strong>Xóa nội dung:</strong> Nội dung vi phạm sẽ bị xóa ngay lập tức mà không cần thông báo trước.
              </li>
              <li>
                <strong>Khởi kiện pháp lý:</strong> Trong trường hợp vi phạm pháp luật, chúng tôi có quyền khởi kiện và yêu cầu bồi thường thiệt hại.
              </li>
            </ul>
            <Paragraph>
              Quyết định xử lý vi phạm của chúng tôi là cuối cùng và không thể thương lượng trong hầu hết các trường hợp.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              9. Thay đổi quy định
            </Title>
            <Paragraph>
              Chúng tôi có quyền cập nhật và thay đổi các quy định này bất cứ lúc nào để phản ánh các thay đổi trong dịch vụ, 
              công nghệ, hoặc yêu cầu pháp lý. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo cho bạn qua email hoặc thông báo 
              trên nền tảng. Ngày "Cập nhật lần cuối" ở đầu trang này sẽ được cập nhật.
            </Paragraph>
            <Paragraph>
              Việc bạn tiếp tục sử dụng Dịch vụ sau khi các thay đổi có hiệu lực được coi là bạn đã chấp nhận các quy định mới. 
              Chúng tôi khuyến khích bạn xem xét lại các quy định này định kỳ.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              10. Liên hệ
            </Title>
            <Paragraph>
              Nếu bạn có bất kỳ câu hỏi nào về các quy định này hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi:
            </Paragraph>
            <ul className={styles.contactList}>
              <li>
                <strong>Email:</strong> support@toeicgenius.com
              </li>
              <li>
                <strong>Điện thoại:</strong> +84 123 456 789
              </li>
              <li>
                <strong>Địa chỉ:</strong> Khu công nghệ cao Hòa Lạc, Hà Nội
              </li>
            </ul>
          </section>

          <Divider />

          <div className={styles.footer}>
            <Paragraph className={styles.acknowledgment}>
              Bằng việc sử dụng Dịch vụ, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ tất cả các quy định được nêu trong tài liệu này. 
              Việc vi phạm các quy định có thể dẫn đến hậu quả nghiêm trọng đối với tài khoản của bạn.
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}


