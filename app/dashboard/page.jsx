"use client";
import { useEffect, useState } from "react";
import { Typography, Spin, Card, Tag, Button, Row, Col, Modal, Table, message } from "antd";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Dữ liệu demo giao dịch
const demoTrades = [
  { key: 1, symbol: "BTCUSD", type: "Crypto", side: "Buy", entry: 66000, exit: 66800, pnl: 800 },
  { key: 2, symbol: "EURUSD", type: "Forex", side: "Sell", entry: 1.0920, exit: 1.0885, pnl: 350 },
  { key: 3, symbol: "AAPL", type: "Stock", side: "Buy", entry: 190, exit: 196, pnl: 600 },
];

// Cột cho Table
const columns = [
  { title: "Mã", dataIndex: "symbol" },
  { title: "Loại", dataIndex: "type" },
  { title: "Side", dataIndex: "side" },
  { title: "Giá vào", dataIndex: "entry" },
  { title: "Giá ra", dataIndex: "exit" },
  { title: "PnL", dataIndex: "pnl" },
];

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeVisible, setUpgradeVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);
      // Lấy plan từ Firestore
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
    <div className="max-w-3xl mx-auto p-6">
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
          {plan === "free" && (
            <Col>
              <Button type="primary" size="large" onClick={() => setUpgradeVisible(true)}>
                Nâng cấp Pro
              </Button>
            </Col>
          )}
        </Row>

        {/* Quyền lợi các gói */}
        <div className="mt-6">
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

        {/* Danh sách giao dịch (demo) */}
        <Typography.Title level={5}>Lịch sử giao dịch gần nhất:</Typography.Title>
        <Table
          columns={columns}
          dataSource={demoTrades}
          pagination={false}
          className="mb-6"
        />

        {/* Widget chỉ cho Pro */}
        {plan === "pro" ? (
          <Card
            title="Biểu đồ hiệu suất và phân tích AI"
            className="mt-6"
            style={{ background: "#f7fafc" }}
          >
            {/* Có thể tích hợp biểu đồ Recharts, Chart.js, hoặc AI summary ở đây */}
            <ul>
              <li>• PnL Chart, Equity Curve, Heatmap</li>
              <li>• Nhận diện dòng tiền thông minh, phân tích Smart Money</li>
              <li>• Xuất báo cáo Excel/PDF</li>
              <li>• Đề xuất cá nhân hoá qua AI</li>
            </ul>
          </Card>
        ) : (
          <div className="text-center mt-4">
            <Button type="dashed" onClick={() => setUpgradeVisible(true)}>
              Dùng thử bản Pro
            </Button>
          </div>
        )}

        {/* Modal nâng cấp Pro */}
        <Modal
          open={upgradeVisible}
          title="Nâng cấp lên Trading Journal Pro"
          onCancel={() => setUpgradeVisible(false)}
          footer={[
            <Button key="back" onClick={() => setUpgradeVisible(false)}>
              Đóng
            </Button>,
            <Button
              key="upgrade"
              type="primary"
              onClick={() => {
                message.info("Bạn hãy liên hệ admin hoặc tích hợp thanh toán để nâng cấp Pro!");
                setUpgradeVisible(false);
              }}
            >
              Liên hệ nâng cấp
            </Button>,
          ]}
        >
          <ul>
            <li>• Truy cập đầy đủ tính năng AI, thống kê nâng cao</li>
            <li>• Kết nối đa sàn, cảnh báo real-time</li>
            <li>• Ưu tiên hỗ trợ và bảo mật dữ liệu cá nhân</li>
          </ul>
          <div style={{ marginTop: 16 }}>
            <Typography.Text type="secondary">
              * Sau khi nâng cấp, bạn sẽ được kích hoạt tính năng Pro ngay lập tức.
            </Typography.Text>
          </div>
        </Modal>
      </Card>
    </div>
  );
}
