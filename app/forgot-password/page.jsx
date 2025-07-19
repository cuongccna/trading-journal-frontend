"use client";
import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      message.success("Đã gửi email đặt lại mật khẩu! Vui lòng kiểm tra hộp thư.");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        message.error("Tài khoản không tồn tại!");
      } else if (err.code === "auth/invalid-email") {
        message.error("Email không hợp lệ!");
      } else {
        message.error("Không gửi được email. Vui lòng thử lại!");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div style={{ minWidth: 360, background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 2px 16px #0001" }}>
        <Typography.Title level={3} className="text-center mb-6" style={{ color: "#1677ff", marginBottom: 32 }}>
          Quên mật khẩu
        </Typography.Title>
        {sent ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Typography.Title level={4} type="success">✅ Gửi email thành công!</Typography.Title>
            <p>
              Vui lòng kiểm tra email để nhận link đặt lại mật khẩu.<br />
              Nếu không thấy, hãy kiểm tra cả mục "Spam" hoặc "Quảng cáo".
            </p>
            <div style={{ marginTop: 24 }}>
              <Link href="/login">
                <Button type="primary" block size="large">Về trang đăng nhập</Button>
              </Link>
            </div>
          </div>
        ) : (
          <Form layout="vertical" onFinish={onFinish} autoComplete="off">
            <Form.Item label="Email" name="email" rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" }
            ]}>
              <Input size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Gửi link đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        )}
        <div className="text-center mt-3">
          <Link href="/login" className="text-primary fw-semibold">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
