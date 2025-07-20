"use client";
import { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Import đúng đường dẫn

import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // hoặc đường dẫn đúng theo dự án của bạn


async function ensureUserDoc(user) {
  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);
  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      email: user.email,
      plan: "free",
      createdAt: serverTimestamp(),
    });
  }
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");

  const onFinish = async (values) => {
  setLoading(true);
  setLoginEmail(values.email);
  try {
    // Đăng nhập Firebase Auth FE
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;
        // ===== LẤY TOKEN SAU KHI ĐĂNG NHẬP =====
    const token = await user.getIdToken();
    // ===== LƯU TOKEN VÀO localStorage =====
    localStorage.setItem('token', token);
    await ensureUserDoc(user); // Đảm bảo có doc trên Firestore
    // Không check emailVerified nếu bạn không bật xác thực email
    message.success("Đăng nhập thành công!");
    window.location.href = "/dashboard";
  } catch (err) {
    if (err.code === "auth/wrong-password") {
      message.error("Mật khẩu không đúng!");
    } else if (err.code === "auth/user-not-found") {
      message.error("Tài khoản không tồn tại!");
    } else if (err.code === "auth/invalid-email") {
      message.error("Email không hợp lệ!");
    } else {
      message.error(err.message || "Đăng nhập thất bại!");
    }
  }
  setLoading(false);
};


  // Hàm gửi lại email xác thực
  const handleResend = async () => {
    if (!auth.currentUser) {
      try {
        await signInWithEmailAndPassword(auth, loginEmail, "dummy");
      } catch {}
    }
    try {
      await sendEmailVerification(auth.currentUser);
      message.success("Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư.");
      setShowResend(false);
    } catch (err) {
      message.error("Không gửi được email xác thực.");
    }
  };

  // Đăng nhập với Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);
      message.success("Đăng nhập bằng Google thành công!");
      window.location.href = "/dashboard";
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        message.warning("Bạn đã đóng cửa sổ đăng nhập Google.");
      } else {
        message.error("Đăng nhập bằng Google thất bại!");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div style={{ minWidth: 360, background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 2px 16px #0001" }}>
        <Typography.Title level={2} className="text-center mb-6" style={{ color: "#1677ff", marginBottom: 32 }}>
          Trading Journal
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item label="Email" name="email" rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" }
          ]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" }
          ]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <Button
          onClick={handleGoogleLogin}
          type="default"
          block
          size="large"
          icon={
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="google"
              style={{ width: 20, marginRight: 8, verticalAlign: "middle" }}
            />
          }
          style={{ marginTop: 8, marginBottom: 6 }}
        >
          Đăng nhập với Google
        </Button>
        {showResend && (
          <div className="text-center mt-3">
            <Button type="link" onClick={handleResend}>
              Gửi lại email xác thực
            </Button>
          </div>
        )}
        <div className="text-center mt-3">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="text-primary fw-semibold">Đăng ký ngay</Link>
        </div>
        <div className="text-center mt-2">
          <Link href="/forgot-password" className="text-primary fw-semibold">Quên mật khẩu?</Link>
        </div>
      </div>
    </div>
  );
}
