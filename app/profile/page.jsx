"use client";
import { Card, Button, Typography, message, Spin, Tag } from "antd";
import { useUserRedux } from "@/hooks/useUserRedux";
import { useDispatch } from "react-redux";
import { updatePlan } from "@/store/userSlice";
import axios from "axios";
import { useState } from "react";

export default function ProfilePage() {
  const { user, loading, error } = useUserRedux();
  const dispatch = useDispatch();
  const [upgrading, setUpgrading] = useState(false);

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

  if (loading) return <Spin className="mt-16" tip="Đang tải thông tin..." />;
  if (!user) return <div className="text-red-500">{error || "Lỗi."}</div>;

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <Card title="Thông tin tài khoản" style={{ width: 400 }}>
        <Typography.Text>Email: {user.email}</Typography.Text>
        <br />
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
      </Card>
    </div>
  );
}
