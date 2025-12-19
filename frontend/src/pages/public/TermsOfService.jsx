import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Typography, Divider, Card } from "antd";
import styles from "@shared/styles/TermsOfService.module.css";

const { Title, Paragraph, Text } = Typography;

export default function TermsOfService() {
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
            Điều khoản sử dụng
          </Title>
          <Text type="secondary" className={styles.lastUpdated}>
            Cập nhật lần cuối: {lastUpdated}
          </Text>
        </div>

        <Divider />

        <div className={styles.content}>
          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              1. Chấp nhận điều khoản
            </Title>
            <Paragraph>
              Bằng việc truy cập và sử dụng nền tảng <strong>Toeic Genius</strong> 
            , bạn đồng ý tuân thủ và bị ràng buộc bởi 
              các điều khoản và điều kiện sử dụng được nêu trong tài liệu này. 
              Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng Dịch vụ.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              2. Định nghĩa và tính năng dịch vụ
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  <strong>"Dịch vụ"</strong> đề cập đến nền tảng Toeic Genius, bao gồm các tính năng:
                  <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                    <li><strong>Luyện tập Listening & Reading:</strong> Hệ thống câu hỏi luyện tập kỹ năng nghe và đọc theo cấu trúc TOEIC</li>
                    <li><strong>Luyện tập Speaking & Writing:</strong> Luyện nói và viết với công nghệ AI tự động chấm điểm và đánh giá</li>
                    <li><strong>Bài thi TOEIC đầy đủ:</strong> Bao gồm bài thi Simulator (mô phỏng) và Practice (luyện tập) với đầy đủ 4 kỹ năng</li>
                    <li><strong>Flashcard:</strong> Hệ thống học từ vựng với thẻ ghi nhớ, hỗ trợ tạo bộ flashcard riêng hoặc sử dụng bộ công khai</li>
                    <li><strong>Lịch sử làm bài:</strong> Theo dõi tiến độ và kết quả các bài thi đã làm</li>
                  </ul>
                </li>
                <li>
                  <strong>"Người dùng"</strong> hoặc <strong>"Bạn"</strong> đề cập đến 
                  cá nhân truy cập và sử dụng Dịch vụ để học tập và luyện thi TOEIC.
                </li>
                <li>
                  <strong>"Nội dung"</strong> bao gồm tất cả các câu hỏi, bài thi, flashcard, 
                  tài liệu học tập, hình ảnh, âm thanh, file audio và các tài nguyên khác trên Dịch vụ.
                </li>
                <li>
                  <strong>"Tài khoản"</strong> là tài khoản được tạo bởi Người dùng 
                  để truy cập và sử dụng các tính năng của Dịch vụ.
                </li>
                <li>
                  <strong>"Chấm điểm AI"</strong> là tính năng sử dụng công nghệ trí tuệ nhân tạo 
                  để tự động đánh giá và chấm điểm các bài thi Speaking và Writing.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              3. Đăng ký tài khoản
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  Để sử dụng đầy đủ các tính năng của Dịch vụ (làm bài thi, lưu tiến độ, tạo flashcard), 
                  bạn cần tạo tài khoản bằng cách cung cấp thông tin chính xác, đầy đủ và cập nhật. 
                  Một số tính năng như xem flashcard công khai có thể được truy cập mà không cần đăng nhập.
                </li>
                <li>
                  Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình và không được 
                  chia sẻ thông tin này với bất kỳ bên thứ ba nào.
                </li>
                <li>
                  Bạn chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của mình, 
                  bao gồm cả việc tạo flashcard và các nội dung khác.
                </li>
                <li>
                  Chúng tôi có quyền từ chối hoặc hủy bỏ tài khoản nếu phát hiện vi phạm 
                  các điều khoản sử dụng.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              4. Quyền và trách nhiệm của người dùng
            </Title>
            <Paragraph>
              <strong>4.1. Quyền của bạn:</strong>
              <ul className={styles.list}>
                <li>
                  Làm bài thi TOEIC (Simulator và Practice), luyện tập Listening & Reading, 
                  Speaking & Writing với chấm điểm AI.
                </li>
                <li>
                  Tạo và quản lý bộ flashcard cá nhân, học từ vựng với flashcard công khai.
                </li>
                <li>
                  Xem lịch sử làm bài, kết quả và tiến độ học tập của mình.
                </li>
                <li>
                  Báo cáo câu hỏi có vấn đề hoặc sai sót cho quản trị viên.
                </li>
              </ul>
            </Paragraph>
            <Paragraph>
              <strong>4.2. Qui định chung:</strong>
              <ul className={styles.list}>
                <li>
                  Bạn được cấp quyền sử dụng Dịch vụ cho mục đích học tập và luyện thi TOEIC cá nhân.
                </li>
                <li>
                  Bạn không được phép sao chép, phân phối, sửa đổi, tạo tác phẩm phái sinh, 
                  hoặc khai thác thương mại Nội dung mà không có sự cho phép bằng văn bản từ chúng tôi.
                </li>
                <li>
                  Bạn không được phép sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp nào 
                  hoặc vi phạm quyền của bên thứ ba.
                </li>
                <li>
                  Bạn không được phép sử dụng các công cụ tự động, bot, hoặc các phương thức 
                  khác để truy cập hoặc sử dụng Dịch vụ một cách không hợp lý hoặc gây quá tải hệ thống.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              5. Nội dung và quyền sở hữu trí tuệ
            </Title>
            <Paragraph>
              <strong>5.1. Quyền sở hữu của Toeic Genius:</strong>
              <ul className={styles.list}>
                <li>
                  Tất cả Nội dung trên Dịch vụ do Toeic Genius tạo ra, bao gồm nhưng không giới hạn ở 
                  câu hỏi, bài thi, hình ảnh, âm thanh, file audio, văn bản, logo, thiết kế giao diện 
                  và thuật toán chấm điểm AI, đều thuộc quyền sở hữu của Toeic Genius hoặc các bên cấp phép.
                </li>
                <li>
                  Bạn không được phép tải xuống, sao chép, phân phối, sửa đổi, hoặc sử dụng Nội dung 
                  của Toeic Genius cho mục đích thương mại mà không có sự cho phép bằng văn bản.
                </li>
                <li>
                  Việc vi phạm quyền sở hữu trí tuệ có thể dẫn đến các hậu quả pháp lý nghiêm trọng.
                </li>
              </ul>
            </Paragraph>
            <Paragraph>
              <strong>5.2. Nội dung do người dùng tạo:</strong>
              <ul className={styles.list}>
                <li>
                  Khi bạn tạo flashcard trên Dịch vụ, bạn giữ quyền sở hữu đối với nội dung đó. 
                  Tuy nhiên, bằng việc tải lên, bạn cấp cho Toeic Genius quyền sử dụng, hiển thị 
                  và phân phối nội dung đó trên Dịch vụ.
                </li>
                <li>
                  Đối với flashcard được đánh dấu là "công khai", bạn đồng ý cho phép người dùng khác 
                  xem và sử dụng flashcard đó cho mục đích học tập.
                </li>
                <li>
                  Bạn chịu trách nhiệm đảm bảo rằng nội dung bạn tạo không vi phạm quyền sở hữu trí tuệ 
                  của bên thứ ba. Toeic Genius không chịu trách nhiệm cho bất kỳ vi phạm bản quyền nào 
                  từ nội dung do người dùng tạo.
                </li>
                <li>
                  Toeic Genius có quyền xóa, chỉnh sửa hoặc ẩn flashcard do người dùng tạo nếu phát hiện 
                  vi phạm điều khoản hoặc không phù hợp.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              6. Hành vi của người dùng và nội dung
            </Title>
            <Paragraph>
              Bạn đồng ý không thực hiện các hành vi sau:
            </Paragraph>
            <ul className={styles.list}>
              <li>
                Sử dụng Dịch vụ để gian lận trong các kỳ thi hoặc đánh giá, bao gồm việc sử dụng 
                công cụ dịch thuật, trợ giúp từ người khác, hoặc các phương thức gian lận khác 
                trong quá trình làm bài thi.
              </li>
              <li>
                Cố gắng truy cập trái phép vào hệ thống, tài khoản của người dùng khác, 
                hoặc các phần không được phép của Dịch vụ.
              </li>
              <li>
                Tải lên hoặc phát tán virus, malware, mã độc hại, hoặc nội dung không phù hợp 
                khi tạo flashcard.
              </li>
              <li>
                Tạo flashcard có chứa thông tin sai lệch, phản cảm, hoặc vi phạm đạo đức xã hội.
              </li>
              <li>
                Tạo flashcard vi phạm bản quyền, bao gồm sao chép nội dung từ các nguồn khác mà 
                không có quyền sử dụng.
              </li>
              <li>
                Giả mạo danh tính hoặc cung cấp thông tin sai lệch khi đăng ký tài khoản.
              </li>
              <li>
                Sử dụng Dịch vụ để vi phạm pháp luật hoặc quy định hiện hành.
              </li>
            </ul>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              7. Kết quả, điểm số và chấm điểm AI
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  <strong>Điểm số Listening & Reading:</strong> Được tính toán tự động dựa trên 
                  số câu trả lời đúng theo thang điểm chuẩn TOEIC (0-990 điểm). Kết quả chỉ mang 
                  tính chất tham khảo cho mục đích luyện tập.
                </li>
                <li>
                  <strong>Chấm điểm AI cho Speaking & Writing:</strong> Hệ thống sử dụng công nghệ 
                  trí tuệ nhân tạo để tự động đánh giá và chấm điểm các bài thi Speaking và Writing 
                  (thang điểm 0-200). Điểm số được tính dựa trên các tiêu chí như phát âm, ngữ điệu, 
                  độ trôi chảy (Speaking) và ngữ pháp, từ vựng, cấu trúc câu (Writing).
                </li>
                <li>
                  <strong>Giới hạn của chấm điểm AI:</strong> Bạn hiểu và đồng ý rằng công nghệ AI 
                  có thể có sai sót và không hoàn toàn chính xác như đánh giá của giám khảo con người. 
                  Điểm số AI chỉ mang tính chất tham khảo và hỗ trợ học tập.
                </li>
                <li>
                  Chúng tôi không đảm bảo rằng điểm số trên Dịch vụ (bao gồm cả điểm AI) sẽ khớp 
                  với điểm số trong kỳ thi TOEIC chính thức do ETS tổ chức.
                </li>
                <li>
                  Bạn hiểu và đồng ý rằng việc sử dụng Dịch vụ không đảm bảo bạn sẽ đạt được 
                  điểm số mong muốn trong kỳ thi thực tế.
                </li>
                <li>
                  Tiến độ làm bài được lưu tự động trong quá trình làm bài. Bạn có thể tiếp tục 
                  làm bài từ điểm đã lưu trong vòng thời gian quy định của bài thi.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              8. Bảo mật thông tin
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo Chính sách Bảo mật 
                  của chúng tôi.
                </li>
                <li>
                  Bạn đồng ý rằng việc truyền tải dữ liệu qua internet không hoàn toàn an toàn 
                  và chúng tôi không thể đảm bảo tuyệt đối về tính bảo mật của dữ liệu.
                </li>
                <li>
                  Bạn chịu trách nhiệm giữ bí mật thông tin đăng nhập và thông báo ngay cho 
                  chúng tôi nếu phát hiện vi phạm bảo mật.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              9. Từ chối trách nhiệm
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  Dịch vụ được cung cấp "như hiện tại" và "như có sẵn" mà không có bất kỳ 
                  bảo đảm nào, dù là rõ ràng hay ngụ ý.
                </li>
                <li>
                  Chúng tôi không đảm bảo rằng Dịch vụ sẽ không bị gián đoạn, không có lỗi, 
                  hoặc hoàn toàn an toàn.
                </li>
                <li>
                  Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc 
                  sử dụng hoặc không thể sử dụng Dịch vụ.
                </li>
                <li>
                  Chúng tôi có quyền tạm ngừng hoặc chấm dứt Dịch vụ bất cứ lúc nào mà không 
                  cần thông báo trước.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              10. Thay đổi điều khoản
            </Title>
            <Paragraph>
              Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có 
              hiệu lực ngay sau khi được đăng tải trên Dịch vụ. Việc bạn tiếp tục sử dụng Dịch vụ 
              sau khi các thay đổi có hiệu lực được coi là bạn đã chấp nhận các điều khoản mới. 
              Chúng tôi khuyến khích bạn xem xét lại các điều khoản này định kỳ.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              11. Chấm dứt dịch vụ và xử lý dữ liệu
            </Title>
            <Paragraph>
              <ul className={styles.list}>
                <li>
                  Bạn có quyền chấm dứt tài khoản của mình bất cứ lúc nào bằng cách liên hệ 
                  với chúng tôi hoặc sử dụng tính năng xóa tài khoản trong cài đặt (nếu có).
                </li>
                <li>
                  Chúng tôi có quyền tạm ngừng hoặc chấm dứt tài khoản của bạn nếu phát hiện 
                  vi phạm các điều khoản này mà không cần thông báo trước.
                </li>
                <li>
                  Sau khi chấm dứt tài khoản, quyền truy cập của bạn vào Dịch vụ sẽ bị hủy bỏ ngay lập tức. 
                  Tuy nhiên, một số dữ liệu có thể được lưu trữ để phục vụ mục đích thống kê hoặc tuân thủ 
                  pháp luật.
                </li>
                <li>
                  Flashcard bạn đã tạo và đánh dấu là "công khai" có thể được giữ lại trên hệ thống để 
                  người dùng khác tiếp tục sử dụng, trừ khi có yêu cầu xóa cụ thể.
                </li>
                <li>
                  Lịch sử làm bài và kết quả của bạn có thể được lưu trữ để thống kê và cải thiện dịch vụ, 
                  nhưng sẽ không được hiển thị công khai sau khi tài khoản bị chấm dứt.
                </li>
              </ul>
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              12. Luật áp dụng
            </Title>
            <Paragraph>
              Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Bất kỳ tranh chấp nào 
              phát sinh từ việc sử dụng Dịch vụ sẽ được giải quyết tại tòa án có thẩm quyền tại Việt Nam.
            </Paragraph>
          </section>

          <section className={styles.section}>
            <Title level={2} className={styles.sectionTitle}>
              13. Liên hệ
            </Title>
            <Paragraph>
              Nếu bạn có bất kỳ câu hỏi nào về các điều khoản sử dụng này, vui lòng liên hệ với chúng tôi:
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
              Bằng việc sử dụng Dịch vụ, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý tuân thủ 
              tất cả các điều khoản và điều kiện được nêu trong tài liệu này.
            </Paragraph>
          </div>
        </div>
      </Card>
    </div>
  );
}

