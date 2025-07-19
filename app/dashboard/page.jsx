"use client";
import { useEffect, useState } from "react";
import { Typography, Spin, Card, Tag, Button, Row, Col } from "antd";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      setPlan(userDoc.exists() ? userDoc.data().plan : "free");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <Row align="middle" justify="space-between">
          <Col>
            <Typography.Title level={3} style={{ margin: 0 }}>
              Xin chào {user.displayName || user.email}!
            </Typography.Title>
            <Tag color={plan === "pro" ? "gold" : "blue"} style={{ fontSize: 16 }}>
              {plan === "pro" ? "PRO" : "MIỄN PHÍ"}
            </Tag>
          </Col>
          <Col>
            <Button type="primary" href="/journal" size="large">
              Quản lý nhật ký giao dịch
            </Button>
          </Col>
        </Row>
        <div className="mt-8">
          <Typography.Title level={5}>Quyền lợi gói của bạn:</Typography.Title>
          <ul className="mb-3">
            {plan === "pro" ? (
              <>
                <li>✅ Thống kê giao dịch nâng cao, AI phân tích dòng tiền</li>
                <li>✅ Kết nối đa sàn, xuất Excel, biểu đồ nâng cao</li>
                <li>✅ Alert real-time, dashboard tuỳ chỉnh</li>
                <li>✅ Hỗ trợ trực tiếp từ admin</li>
              </>
            ) : (
              <>
                <li>✅ Xem lịch sử giao dịch cơ bản</li>
                <li>❌ Không export báo cáo, không cảnh báo real-time</li>
                <li>❌ Không phân tích AI, không dashboard nâng cao</li>
              </>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}
