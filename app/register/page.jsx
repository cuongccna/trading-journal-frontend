"use client";
import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import Link from "next/link";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Import đúng đường dẫn file config của bạn

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    if (values.password !== values.confirm) {
      message.error("Mật khẩu nhập lại không khớp!");
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await sendEmailVerification(userCredential.user);
      setShowConfirm(true);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        message.error("Email đã tồn tại!");
      } else if (err.code === "auth/invalid-email") {
        message.error("Email không hợp lệ!");
      } else if (err.code === "auth/weak-password") {
        message.error("Mật khẩu quá yếu!");
      } else {
        message.error(err.message || "Đăng ký thất bại!");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div style={{ minWidth: 360, background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 2px 16px #0001" }}>
        <Typography.Title level={3} className="text-center mb-6" style={{ color: "#1677ff", marginBottom: 32 }}>
          Đăng ký Trading Journal
        </Typography.Title>
        {showConfirm ? (
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Typography.Title level={4} type="success">🎉 Đăng ký thành công!</Typography.Title>
            <p>
              Vui lòng kiểm tra email và bấm vào link xác thực để kích hoạt tài khoản.<br />
              Sau khi xác thực, bạn có thể đăng nhập.
            </p>
            <div style={{ marginTop: 24 }}>
              <Link href="/login">
                <Button type="primary" block size="large">Đến trang đăng nhập</Button>
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
            <Form.Item label="Mật khẩu" name="password" rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu ít nhất 6 ký tự!" }
            ]}>
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item label="Nhập lại mật khẩu" name="confirm" dependencies={['password']} rules={[
              { required: true, message: "Vui lòng nhập lại mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                },
              }),
            ]}>
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        )}
        <div className="text-center mt-3">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-primary fw-semibold">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
