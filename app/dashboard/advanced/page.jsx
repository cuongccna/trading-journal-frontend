"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  Card,
  Typography,
  Row,
  Col,
  Spin,
} from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA46BE"]; 

export default function AdvancedDashboardPage() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalTrades: 0, totalPnl: 0, winRate: 0 });
  const [pnlByMonth, setPnlByMonth] = useState([]);
  const [assetDist, setAssetDist] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      setPlan(userDoc.exists() ? userDoc.data().plan || "free" : "free");
      await fetchTrades(currentUser.uid);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function fetchTrades(uid) {
    const q = query(collection(db, "trades"), where("userId", "==", uid));
    const snap = await getDocs(q);
    const trades = [];
    snap.forEach((doc) => trades.push({ id: doc.id, ...doc.data() }));

    let totalPnl = 0,
      win = 0,
      closed = 0;
    const monthMap = {};
    const assetMap = {};

    trades.forEach((t) => {
      if (typeof t.entry_price === "number" && typeof t.exit_price === "number") {
        const pnl = (t.exit_price - t.entry_price) * (t.size || 1);
        totalPnl += pnl;
        closed += 1;
        if (pnl >= 0) win += 1;
        const m = (t.entry_datetime
          ? new Date(t.entry_datetime)
          : new Date()).toISOString().slice(0, 7);
        monthMap[m] = (monthMap[m] || 0) + pnl;
      }
      if (t.asset_type) assetMap[t.asset_type] = (assetMap[t.asset_type] || 0) + 1;
    });

    setStats({
      totalTrades: trades.length,
      totalPnl: totalPnl.toFixed(2),
      winRate: closed ? ((win / closed) * 100).toFixed(2) : 0,
    });
    setPnlByMonth(
      Object.keys(monthMap)
        .sort()
        .map((m) => ({ month: m, pnl: monthMap[m] }))
    );
    setAssetDist(
      Object.keys(assetMap).map((k) => ({ name: k, value: assetMap[k] }))
    );
  }

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Typography.Title level={3} style={{ marginBottom: 24 }}>
        Dashboard nâng cao
      </Typography.Title>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Typography.Text>Tổng giao dịch: {stats.totalTrades}</Typography.Text>
            <br />
            <Typography.Text>Tổng PnL: {stats.totalPnl}</Typography.Text>
            <br />
            <Typography.Text>Tỷ lệ thắng: {stats.winRate}%</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="PnL theo tháng">
            <LineChart width={320} height={260} data={pnlByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pnl" stroke="#8884d8" />
            </LineChart>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Phân bổ tài sản">
            <PieChart width={320} height={260}>
              <Pie
                data={assetDist}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {assetDist.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
