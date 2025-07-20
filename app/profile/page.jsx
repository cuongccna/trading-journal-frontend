"use client";

import { Card, Button, Typography, message, Spin, Tag, Input } from "antd";
import { useUserRedux } from "@/hooks/useUserRedux";

import { useDispatch } from "react-redux";
import { updatePlan } from "../../store/userSlice.js";
import { setLoading } from '../../store/userSlice.js';
import axios from "axios";

import { useState, useEffect } from "react";
import useFetchUser from "@/hooks/useFetchUser";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";


export default function ProfilePage() {
    useFetchUser(); // THÊM DÒNG NÀY
  const { user, loading, error } = useUserRedux();
  const dispatch = useDispatch();
  const [upgrading, setUpgrading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (user && user.displayName) {
      setName(user.displayName);
    }
  }, [user]);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await axios.patch(`/api/users/${user.id}`, { plan: "pro" });
      dispatch(updatePlan("pro"));
      message.success("Nâng cấp thành công! 🎉");
    } catch (err) {
      message.error("Nâng cấp thất bại.");
    }
    setUpgrading(false);
  };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() });
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          displayName: name.trim(),
        });
        message.success("Đã cập nhật tên!");
      }
    } catch {
      message.error("Không cập nhật được tên.");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  if (loading) return <Spin className="mt-16" tip="Đang tải thông tin..." />;
  if (!user) return <div className="text-red-500">{error || "Lỗi."}</div>;

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <Card title="Thông tin tài khoản" style={{ width: 400 }}>
        <Typography.Text>Email: {user.email}</Typography.Text>
        <br />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên hiển thị"
          style={{ marginTop: 8 }}
        />
        <Button
          onClick={handleSaveName}
          type="default"
          size="small"
          loading={saving}
          style={{ marginTop: 8 }}
        >
          Lưu tên
        </Button>
        <Typography.Text>
          Gói hiện tại:{" "}
          <Tag color={user.plan === "pro" ? "green" : "default"}>
            {user.plan?.toUpperCase() || "FREE"}
          </Tag>
        </Typography.Text>
        <br />
        <Typography.Text type="secondary">
          Ngày tạo: {new Date(user.created_at).toLocaleString("vi-VN")}
        </Typography.Text>
        <br />
        {user.plan !== "pro" && (
          <Button
            type="primary"
            block
            loading={upgrading}
            style={{ marginTop: 24 }}
            onClick={handleUpgrade}
          >
            Nâng cấp lên Pro
          </Button>
        )}
        <Button
          danger
          block
          style={{ marginTop: 16 }}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button>
      </Card>
    </div>
  );
}
