import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import styles from '@CSS/NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn tìm kiếm không tồn tại hoặc đã bị xóa."
        extra={
          <Button
            type="primary"
            size="large"
            className={styles.button}
            onClick={() => navigate('/')}
          >
            Quay lại trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
