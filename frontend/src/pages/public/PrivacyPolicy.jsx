import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Card } from "antd";
import styles from "@shared/styles/PrivacyPolicy.module.css";

const { Title, Paragraph, Text } = Typography;

export default function PrivacyPolicy() {
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
            Chính sách bảo mật
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
              Chào mừng bạn đến với <strong>Toeic Genius</strong>. Chúng tôi cam kết bảo vệ quyền riêng tư 
              và thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, 
              sử dụng, lưu trữ và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng dịch vụ của chúng tôi.
            </Paragraph>
            <Paragraph>
              Bằng việc sử dụng Dịch vụ, bạn đồng ý với việc thu thập và sử dụng thông tin theo chính sách này. 
              Nếu bạn không đồng ý với bất kỳ phần nào của chính sách này, vui lòng không sử dụng Dịch vụ.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              2. Thông tin chúng tôi thu thập
            </Title>
            <Paragraph>
              <strong>2.1. Thông tin bạn cung cấp:</strong>
              <ul className={styles.list}>
                <li>
                  <strong>Thông tin đăng ký tài khoản:</strong> Khi bạn đăng ký tài khoản, chúng tôi thu thập 
                  thông tin như tên, email, mật khẩu (được mã hóa), và các thông tin khác bạn cung cấp.
                </li>
                <li>
                  <strong>Thông tin hồ sơ:</strong> Bạn có thể cung cấp thêm thông tin trong hồ sơ cá nhân 
                  như ảnh đại diện, ngày sinh, giới tính (tùy chọn).
                </li>
                <li>
                  <strong>Nội dung bạn tạo:</strong> Khi bạn tạo flashcard, chúng tôi lưu trữ nội dung flashcard 
                  và các thiết lập liên quan (công khai/riêng tư).
                </li>
                <li>
                  <strong>Phản hồi và báo cáo:</strong> Khi bạn gửi phản hồi, báo cáo câu hỏi hoặc liên hệ với chúng tôi, 
                  chúng tôi thu thập thông tin bạn cung cấp.
                </li>
              </ul>
            </Paragraph>
            <Paragraph>
              <strong>2.2. Thông tin tự động thu thập:</strong>
              <ul className={styles.list}>
                <li>
                  <strong>Dữ liệu sử dụng:</strong> Chúng tôi thu thập thông tin về cách bạn sử dụng Dịch vụ, 
                  bao gồm các bài thi bạn đã làm, kết quả, thời gian làm bài, tiến độ học tập, và các tương tác 
                  với các tính năng của Dịch vụ.
                </li>
                <li>
                  <strong>Thông tin thiết bị:</strong> Chúng tôi có thể thu thập thông tin về thiết bị bạn sử dụng 
                  để truy cập Dịch vụ, bao gồm loại thiết bị, hệ điều hành, trình duyệt, địa chỉ IP, và thông tin 
                  nhận dạng thiết bị.
                </li>
                <li>
                  <strong>Dữ liệu âm thanh:</strong> Khi bạn sử dụng tính năng Speaking, chúng tôi thu thập và lưu trữ 
                  file âm thanh bài nói của bạn để chấm điểm bằng AI và cung cấp phản hồi.
                </li>
                <li>
                  <strong>Dữ liệu văn bản:</strong> Khi bạn làm bài Writing, chúng tôi lưu trữ nội dung bài viết của bạn 
                  để chấm điểm bằng AI.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              3. Cách chúng tôi sử dụng thông tin
            </Title>
            <Paragraph>
              Chúng tôi sử dụng thông tin thu thập được cho các mục đích sau:
            </Paragraph>
            <ul className={styles.list}>
              <li>
                <strong>Cung cấp và cải thiện Dịch vụ:</strong> Để cung cấp các tính năng như làm bài thi, 
                luyện tập, flashcard, lưu tiến độ, và chấm điểm AI cho Speaking & Writing.
              </li>
              <li>
                <strong>Quản lý tài khoản:</strong> Để tạo và quản lý tài khoản của bạn, xác thực danh tính, 
                và cung cấp hỗ trợ khách hàng.
              </li>
              <li>
                <strong>Cá nhân hóa trải nghiệm:</strong> Để hiểu sở thích và nhu cầu của bạn, cung cấp nội dung 
                và đề xuất phù hợp, và cải thiện trải nghiệm học tập.
              </li>
              <li>
                <strong>Phân tích và nghiên cứu:</strong> Để phân tích cách người dùng sử dụng Dịch vụ, 
                cải thiện chất lượng bài thi và câu hỏi, và phát triển các tính năng mới.
              </li>
              <li>
                <strong>Giao tiếp:</strong> Để gửi thông báo về Dịch vụ, cập nhật quan trọng, phản hồi về 
                báo cáo của bạn, và các thông tin liên quan đến tài khoản.
              </li>
              <li>
                <strong>Bảo mật và phòng chống gian lận:</strong> Để phát hiện và ngăn chặn các hoạt động 
                gian lận, lạm dụng, hoặc vi phạm điều khoản sử dụng.
              </li>
              <li>
                <strong>Tuân thủ pháp luật:</strong> Để tuân thủ các nghĩa vụ pháp lý và quy định hiện hành.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              4. Chia sẻ thông tin
            </Title>
            <Paragraph>
              Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba để mục đích 
              tiếp thị. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp sau:
            </Paragraph>
            <ul className={styles.list}>
              <li>
                <strong>Với sự đồng ý của bạn:</strong> Chúng tôi có thể chia sẻ thông tin nếu bạn đồng ý rõ ràng.
              </li>
              <li>
                <strong>Nhà cung cấp dịch vụ:</strong> Chúng tôi có thể chia sẻ thông tin với các nhà cung cấp 
                dịch vụ bên thứ ba giúp chúng tôi vận hành Dịch vụ (như dịch vụ lưu trữ đám mây, phân tích dữ liệu, 
                chấm điểm AI), với điều kiện họ phải bảo mật thông tin và chỉ sử dụng cho mục đích được chỉ định.
              </li>
              <li>
                <strong>Nội dung công khai:</strong> Flashcard bạn đánh dấu là "công khai" sẽ được hiển thị cho 
                tất cả người dùng khác. Tên người dùng của bạn có thể được hiển thị cùng với flashcard công khai.
              </li>
              <li>
                <strong>Yêu cầu pháp lý:</strong> Chúng tôi có thể tiết lộ thông tin nếu được yêu cầu bởi pháp luật, 
                quyết định của tòa án, hoặc cơ quan chính phủ có thẩm quyền.
              </li>
              <li>
                <strong>Bảo vệ quyền lợi:</strong> Chúng tôi có thể chia sẻ thông tin để bảo vệ quyền, tài sản, 
                hoặc an toàn của Toeic Genius, người dùng, hoặc công chúng.
              </li>
              <li>
                <strong>Chuyển giao kinh doanh:</strong> Trong trường hợp sáp nhập, mua lại, hoặc bán tài sản, 
                thông tin của bạn có thể được chuyển giao cho bên mua.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              5. Bảo mật thông tin
            </Title>
            <Paragraph>
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn:
            </Paragraph>
            <ul className={styles.list}>
              <li>
                <strong>Mã hóa:</strong> Mật khẩu của bạn được mã hóa bằng các thuật toán mã hóa mạnh. 
                Dữ liệu nhạy cảm được mã hóa khi truyền tải qua internet.
              </li>
              <li>
                <strong>Kiểm soát truy cập:</strong> Chỉ nhân viên được ủy quyền mới có thể truy cập thông tin cá nhân, 
                và chỉ khi cần thiết để thực hiện công việc của họ.
              </li>
              <li>
                <strong>Giám sát và phát hiện:</strong> Chúng tôi giám sát hệ thống để phát hiện các hoạt động 
                đáng ngờ và vi phạm bảo mật.
              </li>
              <li>
                <strong>Bảo mật cơ sở hạ tầng:</strong> Chúng tôi sử dụng các dịch vụ lưu trữ đám mây uy tín 
                với các biện pháp bảo mật tiên tiến.
              </li>
            </ul>
            <Paragraph>
              Tuy nhiên, không có phương thức truyền tải qua internet hoặc lưu trữ điện tử nào là hoàn toàn an toàn. 
              Mặc dù chúng tôi nỗ lực bảo vệ thông tin của bạn, chúng tôi không thể đảm bảo tuyệt đối về tính bảo mật 
              của dữ liệu. Bạn sử dụng Dịch vụ với rủi ro của chính mình.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              6. Quyền của bạn
            </Title>
            <Paragraph>
              Bạn có các quyền sau đối với thông tin cá nhân của mình:
            </Paragraph>
            <ul className={styles.list}>
              <li>
                <strong>Quyền truy cập:</strong> Bạn có quyền xem và truy cập thông tin cá nhân của mình 
                thông qua tài khoản hoặc bằng cách liên hệ với chúng tôi.
              </li>
              <li>
                <strong>Quyền chỉnh sửa:</strong> Bạn có thể cập nhật thông tin cá nhân của mình bất cứ lúc nào 
                trong phần cài đặt tài khoản.
              </li>
              <li>
                <strong>Quyền xóa:</strong> Bạn có quyền yêu cầu xóa tài khoản và dữ liệu cá nhân của mình, 
                trừ khi chúng tôi có nghĩa vụ pháp lý phải giữ lại một số thông tin.
              </li>
              <li>
                <strong>Quyền rút lại đồng ý:</strong> Bạn có thể rút lại sự đồng ý của mình về việc thu thập 
                và sử dụng thông tin cá nhân, nhưng điều này có thể ảnh hưởng đến khả năng sử dụng một số tính năng.
              </li>
              <li>
                <strong>Quyền phản đối:</strong> Bạn có quyền phản đối việc xử lý thông tin cá nhân của mình 
                cho một số mục đích nhất định.
              </li>
              <li>
                <strong>Quyền xuất dữ liệu:</strong> Bạn có quyền yêu cầu xuất dữ liệu cá nhân của mình 
                ở định dạng có thể đọc được.
              </li>
            </ul>
            <Paragraph>
              Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua email hoặc thông qua các tính năng 
              trong tài khoản của bạn.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              7. Lưu trữ và xóa dữ liệu
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  <strong>Thời gian lưu trữ:</strong> Chúng tôi lưu trữ thông tin cá nhân của bạn trong thời gian 
                  cần thiết để cung cấp Dịch vụ và tuân thủ các nghĩa vụ pháp lý. Kết quả bài thi và lịch sử học tập 
                  được lưu trữ để bạn có thể xem lại tiến độ của mình.
                </li>
                <li>
                  <strong>Xóa tài khoản:</strong> Khi bạn xóa tài khoản, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin 
                  cá nhân của bạn trong thời gian hợp lý, trừ khi pháp luật yêu cầu chúng tôi giữ lại một số thông tin.
                </li>
                <li>
                  <strong>Flashcard công khai:</strong> Nếu bạn đã tạo flashcard công khai, chúng có thể được giữ lại 
                  trên hệ thống để người dùng khác tiếp tục sử dụng, nhưng sẽ không còn liên kết với tài khoản của bạn.
                </li>
                <li>
                  <strong>Dữ liệu thống kê:</strong> Một số dữ liệu có thể được giữ lại ở dạng tổng hợp và ẩn danh 
                  để phục vụ mục đích phân tích và cải thiện Dịch vụ.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              8. Dữ liệu của trẻ em
            </Title>
            <Paragraph>
              Dịch vụ của chúng tôi không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân 
              từ trẻ em dưới 13 tuổi. Nếu chúng tôi phát hiện đã thu thập thông tin từ trẻ em dưới 13 tuổi mà không có 
              sự đồng ý của phụ huynh, chúng tôi sẽ xóa thông tin đó ngay lập tức.
            </Paragraph>
            <Paragraph>
              Nếu bạn là phụ huynh hoặc người giám hộ và tin rằng con bạn đã cung cấp thông tin cá nhân cho chúng tôi, 
              vui lòng liên hệ với chúng tôi để chúng tôi có thể xóa thông tin đó.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              9. Thay đổi chính sách bảo mật
            </Title>
            <Paragraph>
              Chúng tôi có thể cập nhật Chính sách Bảo mật này theo thời gian để phản ánh các thay đổi trong thực tiễn, 
              công nghệ, hoặc yêu cầu pháp lý. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo cho bạn qua email 
              hoặc thông báo trên Dịch vụ. Ngày "Cập nhật lần cuối" ở đầu trang này sẽ được cập nhật để phản ánh 
              thời điểm thay đổi có hiệu lực.
            </Paragraph>
            <Paragraph>
              Chúng tôi khuyến khích bạn xem xét lại Chính sách Bảo mật này định kỳ để nắm được cách chúng tôi bảo vệ 
              thông tin của bạn. Việc bạn tiếp tục sử dụng Dịch vụ sau khi các thay đổi có hiệu lực được coi là bạn 
              đã chấp nhận chính sách mới.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              10. Liên hệ
            </Title>
            <Paragraph>
              Nếu bạn có bất kỳ câu hỏi, mối quan tâm, hoặc yêu cầu về Chính sách Bảo mật này hoặc cách chúng tôi xử lý 
              thông tin cá nhân của bạn, vui lòng liên hệ với chúng tôi:
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
            <Paragraph>
              Chúng tôi sẽ phản hồi các yêu cầu của bạn trong thời gian hợp lý và theo quy định pháp luật hiện hành.
            </Paragraph>
          </section>

          <Divider />

          <div className={styles.footer}>
            <Paragraph className={styles.acknowledgment}>
              Bằng việc sử dụng Dịch vụ, bạn xác nhận rằng bạn đã đọc và hiểu Chính sách Bảo mật này và đồng ý với 
              việc thu thập, sử dụng và chia sẻ thông tin cá nhân của bạn như được mô tả trong chính sách này.
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}

