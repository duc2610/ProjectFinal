import { Tabs } from "antd";
import styles from "@shared/styles/Profile.module.css";
import { useAuth } from "@shared/hooks/useAuth";
import { Form, Input, Button, Row, Col, Card } from "antd";
export default function Profile() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <Tabs
          defaultActiveKey="personal"
          className={styles.tabs}
          items={[
            {
              key: "personal",
              label: "Thông tin cá nhân",
              children: <PersonalTab user={user} />,
            },
            {
              key: "history",
              label: "Lịch sử thi",
              children: <div>Lịch sử thi</div>,
            },
          ]}
        />
      </div>
    </div>
  );
}
export function PersonalTab({ user }) {
  return (
    // <div className={styles.tabPane}>
    //   <h2 className={styles.title}>Profile Information</h2>

    //   <Row gutter={24}>
    //     <Col xs={24} md={14} lg={14}>
    //       <Form layout="vertical" className={styles.form}>
    //         <Form.Item label="Full Name">
    //           <Input value={user.fullname} readOnly />
    //         </Form.Item>
    //         <Form.Item label="Email Address">
    //           <Input value={user.email} readOnly />
    //         </Form.Item>
    //         {/* <Form.Item label="Member Since">
    //         <Input value={user.memberSince} readOnly />
    //       </Form.Item> */}
    //       </Form>
    //     </Col>

    //     <Col xs={24} md={10} lg={10}>
    //       <Card className={styles.statsCard} bordered={false}>
    //         <img
    //           style={{ width: "100%" }}
    //           src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSR4n24Z5TvS0hyDQQvuJXFUZMHVdvgB9_7gOxTkSsV5oRv7431EtH7pwAEchHW3b74lhgYWWtBKhjzWg3B332Sls4AoLsPs6izNpFMcQ"
    //         />
    //       </Card>
    //       <Button block className={styles.primaryBtn}>
    //         Change Password
    //       </Button>
    //       <Button block className={styles.ghostBtn} type="default">
    //         Update Profile
    //       </Button>
    //     </Col>
    //   </Row>
    // </div>
  );
}
