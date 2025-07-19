"use client";
import { useEffect, useState } from "react";
import {
  Card, Button, Typography, Tag, Input, Modal, Form, InputNumber, Select,
  DatePicker, Row, Col, Spin, message, Space, Popconfirm, Drawer
} from "antd";
import {
  SearchOutlined, FilterOutlined, PlusOutlined,
  EditOutlined, DeleteOutlined
} from "@ant-design/icons";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebaseConfig";
import {
  doc, getDoc, addDoc, updateDoc, deleteDoc,
  collection, serverTimestamp, query, where, getDocs, orderBy,
} from "firebase/firestore";
import dayjs from "dayjs";


const assetTypes = [
  { label: "Stock", value: "Stock" }, { label: "Crypto", value: "Crypto" },
  { label: "Forex", value: "Forex" }, { label: "Futures", value: "Futures" },
  { label: "Options", value: "Options" },
];
const emotionColors = {
  "Tích cực": "green",
  "Bình thường": "blue",
  "Lo lắng": "orange",
  "Hoảng loạn": "red",
  "": "default",
};

function formatDate(val) {
  if (!val) return "";
  try {
    return typeof val === "string"
      ? new Date(val).toLocaleString()
      : val.format("YYYY-MM-DD HH:mm");
  } catch {
    return "";
  }
}

export default function JournalPage() {
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addMore, setAddMore] = useState(false);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (!currentUser) {
      window.location.href = "/login";
      return;
    }
    setUser(currentUser);
    console.log("Current user UID:", currentUser.uid);
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    console.log("userDoc:", userDoc.data());
    setPlan(userDoc.exists() ? userDoc.data().plan || "free" : "free");
    await fetchTrades(currentUser.uid);
    setLoading(false);
  });
  return () => unsubscribe();
}, []);

  // Fetch và filter trade data
  async function fetchTrades(uid) {
    const q = query(
      collection(db, "trades"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    let data = [];
    snap.forEach((doc) => data.push({ key: doc.id, ...doc.data() }));
    setTrades(data);
    setFiltered(data);
  }

  // Filter logic
  useEffect(() => {
    let data = [...trades];
    if (search)
      data = data.filter(
        (t) =>
          (t.symbol || "")
            .toLowerCase()
            .includes(search.trim().toLowerCase()) ||
          (t.notes || "").toLowerCase().includes(search.trim().toLowerCase())
      );
    if (filter.asset_type)
      data = data.filter((t) => t.asset_type === filter.asset_type);
    if (filter.side)
      data = data.filter((t) => t.side === filter.side);
    if (filter.strategy && isPro)
      data = data.filter((t) => (t.strategy || "") === filter.strategy);
    if (filter.emotion && isPro)
      data = data.filter((t) => (t.emotion || "") === filter.emotion);
    if (filter.currency && isPro)
      data = data.filter((t) => t.currency === filter.currency);
    if (filter.tags && isPro && filter.tags.length > 0)
      data = data.filter((t) => t.tags && filter.tags.some(tag => t.tags.includes(tag)));
    if (filter.sl_min && isPro)
      data = data.filter((t) => Number(t.stop_loss || 0) >= Number(filter.sl_min));
    if (filter.tp_min && isPro)
      data = data.filter((t) => Number(t.take_profit || 0) >= Number(filter.tp_min));
    if (filter.date_from)
      data = data.filter((t) =>
        t.entry_datetime ? new Date(t.entry_datetime) >= filter.date_from.toDate() : true
      );
    if (filter.date_to)
      data = data.filter((t) =>
        t.entry_datetime ? new Date(t.entry_datetime) <= filter.date_to.toDate() : true
      );
    setFiltered(data);
  }, [trades, search, filter]);

  // Thêm mới giao dịch
  const handleAdd = async (values) => {
    try {
      values.entry_datetime = values.entry_datetime
        ? values.entry_datetime.toISOString()
        : null;
      values.exit_datetime = values.exit_datetime
        ? values.exit_datetime.toISOString()
        : null;
      await addDoc(collection(db, "trades"), {
        ...values,
        userId: user.uid,
        createdAt: serverTimestamp(),
        plan: plan,
      });
      message.success("Đã thêm giao dịch!");
      setModalOpen(false);
      form.resetFields();
      await fetchTrades(user.uid);
      if (addMore) setModalOpen(true);
    } catch {
      message.error("Thêm giao dịch thất bại!");
    }
  };

  // Sửa giao dịch
  const handleEdit = (trade) => {
    setEditData(trade);
    editForm.setFieldsValue({
      ...trade,
      entry_datetime: trade.entry_datetime ? dayjs(trade.entry_datetime) : null,
      exit_datetime: trade.exit_datetime ? dayjs(trade.exit_datetime) : null,
    });
    setEditModal(true);
  };

  const handleEditOk = async (values) => {
    try {
      values.entry_datetime = values.entry_datetime
        ? values.entry_datetime.toISOString()
        : null;
      values.exit_datetime = values.exit_datetime
        ? values.exit_datetime.toISOString()
        : null;
      await updateDoc(doc(db, "trades", editData.key), {
        ...values,
        updatedAt: serverTimestamp(),
      });
      message.success("Cập nhật thành công!");
      setEditModal(false);
      await fetchTrades(user.uid);
    } catch {
      message.error("Không cập nhật được!");
    }
  };

  // Xoá giao dịch
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "trades", id));
      message.success("Đã xoá giao dịch.");
      await fetchTrades(user.uid);
    } catch {
      message.error("Xoá thất bại!");
    }
  };

  // Danh sách filter động
  const isPro = plan === "pro";
  const strategyList = isPro
    ? [...new Set(trades.map((t) => t.strategy).filter(Boolean))]
    : [];
  const tagList = isPro
    ? Array.from(new Set(trades.flatMap((t) => t.tags || [])))
    : [];
  const emotionList = isPro
    ? [...new Set(trades.map((t) => t.emotion || "Bình thường"))]
    : [];
  const currencyList = isPro
    ? Array.from(new Set(trades.map((t) => t.currency).filter(Boolean)))
    : [];

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );

  return (
    <div
      style={{
        minHeight: "94vh",
        background: "linear-gradient(90deg,#f2fbff 70%,#e4eefd 100%)",
        padding: 20,
      }}
    >
      <Card
        style={{
          maxWidth: 1200,
          margin: "auto",
          borderRadius: 14,
          boxShadow: "0 6px 32px #1677ff15",
        }}
        bodyStyle={{ padding: 26, background: "none" }}
      >
        <Row gutter={[18, 18]} align="middle">
          <Col xs={24} md={6} lg={5}>
            <Input
              placeholder="Tìm kiếm nhanh giao dịch"
              prefix={<SearchOutlined />}
              allowClear
              style={{ borderRadius: 8, background: "#f7fafd" }}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>
          <Col xs={24} md={7} lg={7}>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setFilterOpen(true)}
              style={{ borderRadius: 8, marginRight: 10 }}
            >
              Bộ lọc nâng cao
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                borderRadius: 8,
                background: "linear-gradient(90deg,#2563eb 80%,#15c6ff 100%)",
                fontWeight: 600,
              }}
              onClick={() => {
                setModalOpen(true);
                setAddMore(false);
              }}
            >
              Thêm mới
            </Button>
          </Col>
          <Col flex="auto">
            <Typography.Title level={4} style={{ margin: 0, color: "#2563eb" }}>
              DANH SÁCH GIAO DỊCH
              <Tag color={isPro ? "gold" : "blue"} style={{ marginLeft: 10, fontWeight: 600, fontSize: 16 }}>
                {isPro ? "PRO" : "MIỄN PHÍ"}
              </Tag>
            </Typography.Title>
          </Col>
        </Row>

        {/* List dạng Card */}
        <Row gutter={[18, 18]} style={{ marginTop: 18 }}>
          {filtered.length === 0 && (
            <Col span={24} style={{ textAlign: "center", color: "#aaa", marginTop: 40 }}>
              <div>Chưa có giao dịch nào!</div>
            </Col>
          )}
          {filtered.map((trade) => (
            <Col xs={24} sm={12} md={8} lg={6} key={trade.key}>
              <Card
                bordered={false}
                style={{
                  borderRadius: 16,
                  boxShadow: "0 6px 18px #1877ff11",
                  background: trade.asset_type === "Crypto"
                    ? "linear-gradient(120deg,#e0f8ff 80%,#fff)"
                    : trade.asset_type === "Stock"
                    ? "linear-gradient(120deg,#f8ffed 80%,#fff)"
                    : trade.asset_type === "Forex"
                    ? "linear-gradient(120deg,#edf7ff 80%,#fff)"
                    : "#fff",
                  minHeight: 280,
                  marginBottom: 10,
                  borderLeft: `4px solid ${trade.asset_type === "Crypto"
                    ? "#14c8ff"
                    : trade.asset_type === "Stock"
                    ? "#b6e34c"
                    : trade.asset_type === "Forex"
                    ? "#73c1ff"
                    : "#dadada"
                  }`,
                }}
                bodyStyle={{ padding: 16 }}
                actions={[
                  <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(trade)}>
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Bạn chắc chắn xoá giao dịch này?"
                    onConfirm={() => handleDelete(trade.key)}
                    okText="Xoá"
                    cancelText="Huỷ"
                  >
                    <Button size="small" icon={<DeleteOutlined />} danger>
                      Xoá
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <Space direction="vertical" style={{ width: "100%" }} size={3}>
                  <Typography.Text strong style={{ fontSize: 18 }}>
                    {trade.symbol} <Tag color="cyan">{trade.asset_type}</Tag>
                    {isPro && trade.currency && (
                      <Tag color="geekblue" style={{ marginLeft: 8 }}>{trade.currency}</Tag>
                    )}
                  </Typography.Text>
                  <Typography.Text>
                    <b>{trade.side}</b> {trade.size} @ {trade.entry_price}
                  </Typography.Text>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    Vào: {formatDate(trade.entry_datetime)} <br />
                    Đóng: {formatDate(trade.exit_datetime)}
                  </Typography.Text>
                  <Typography.Text>
                    <Tag color={trade.pnl >= 0 ? "green" : "red"}>
                      PnL: {typeof trade.entry_price === "number" && typeof trade.exit_price === "number"
                        ? ((trade.exit_price - trade.entry_price) * (trade.size || 1)).toFixed(2)
                        : "--"}
                    </Tag>
                    {isPro && typeof trade.stop_loss === "number" && (
                      <Tag color="volcano" style={{ marginLeft: 6 }}>SL: {trade.stop_loss}</Tag>
                    )}
                    {isPro && typeof trade.take_profit === "number" && (
                      <Tag color="lime" style={{ marginLeft: 6 }}>TP: {trade.take_profit}</Tag>
                    )}
                  </Typography.Text>
                  <Space>
                    {isPro && trade.strategy && <Tag color="purple">{trade.strategy}</Tag>}
                    {isPro && trade.tags && trade.tags.map((t, i) => <Tag color="blue" key={i}>{t}</Tag>)}
                  </Space>
                  {isPro && (
                    <Typography.Text italic type="secondary" style={{ fontSize: 12 }}>
                      {trade.notes}
                    </Typography.Text>
                  )}
                  {isPro && (
                    <Tag color={emotionColors[trade.emotion || ""] || "default"}>
                      {trade.emotion || "Tâm lý: Bình thường"}
                    </Tag>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Drawer: Bộ lọc nâng cao */}
      <Drawer
        title="Bộ lọc nâng cao"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        width={360}
        footer={
          <div style={{ textAlign: "right" }}>
            <Button
              onClick={() => {
                setFilter({});
                setFilterOpen(false);
              }}
              style={{ marginRight: 10 }}
            >
              Xoá lọc
            </Button>
            <Button type="primary" onClick={() => setFilterOpen(false)}>
              Áp dụng
            </Button>
          </div>
        }
      >
        <Form
          layout="vertical"
          onFinish={vals => setFilter(vals)}
          initialValues={filter}
        >
          <Form.Item label="Loại tài sản" name="asset_type">
            <Select allowClear options={assetTypes} />
          </Form.Item>
          <Form.Item label="Side" name="side">
            <Select allowClear options={[
              { label: "Buy", value: "Buy" },
              { label: "Sell", value: "Sell" },
              { label: "Long", value: "Long" },
              { label: "Short", value: "Short" },
            ]} />
          </Form.Item>
          {isPro && (
            <>
              <Form.Item label="Chiến lược" name="strategy">
                <Select allowClear options={strategyList.map((s) => ({ label: s, value: s }))} />
              </Form.Item>
              <Form.Item label="Tags" name="tags">
                <Select allowClear mode="tags" options={tagList.map((t) => ({ label: t, value: t }))} />
              </Form.Item>
              <Form.Item label="Tâm lý giao dịch" name="emotion">
                <Select allowClear options={emotionList.map((e) => ({ label: e, value: e }))} />
              </Form.Item>
              <Form.Item label="Tiền tệ" name="currency">
                <Select allowClear options={currencyList.map((c) => ({ label: c, value: c }))} />
              </Form.Item>
              <Form.Item label="SL lớn hơn" name="sl_min">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item label="TP lớn hơn" name="tp_min">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </>
          )}
          <Form.Item label="Ngày vào lệnh từ" name="date_from">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Ngày vào lệnh đến" name="date_to">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Áp dụng bộ lọc
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* Modal: Thêm mới giao dịch */}
      <Modal
        open={modalOpen}
        title="Thêm mới giao dịch"
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleAdd} form={form}>
          <Form.Item name="symbol" label="Mã giao dịch" rules={[{ required: true }]}>
            <Input placeholder="VD: BTCUSD, AAPL..." />
          </Form.Item>
          <Form.Item name="asset_type" label="Loại tài sản" rules={[{ required: true }]}>
            <Select options={assetTypes} placeholder="Chọn loại tài sản" />
          </Form.Item>
          <Form.Item name="side" label="Buy/Sell" rules={[{ required: true }]}>
            <Select options={[
              { label: "Buy", value: "Buy" },
              { label: "Sell", value: "Sell" },
              { label: "Long", value: "Long" },
              { label: "Short", value: "Short" },
            ]} />
          </Form.Item>
          <Form.Item name="size" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="entry_price" label="Giá vào lệnh" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="entry_datetime" label="Thời điểm vào lệnh" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="exit_price" label="Giá đóng lệnh">
            <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="exit_datetime" label="Thời điểm đóng lệnh">
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          {isPro && (
            <>
              <Form.Item name="stop_loss" label="Stop Loss">
                <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="take_profit" label="Take Profit">
                <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="commissions" label="Phí giao dịch">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="tags" label="Tags">
                <Select mode="tags" placeholder="Ví dụ: swing, breakout, news..." />
              </Form.Item>
              <Form.Item name="strategy" label="Chiến lược giao dịch">
                <Input placeholder="Trend-following, Scalping, ..." />
              </Form.Item>
              <Form.Item name="emotion" label="Tâm lý giao dịch">
                <Select
                  allowClear
                  options={[
                    { label: "Tích cực", value: "Tích cực" },
                    { label: "Bình thường", value: "Bình thường" },
                    { label: "Lo lắng", value: "Lo lắng" },
                    { label: "Hoảng loạn", value: "Hoảng loạn" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Nhật ký cảm xúc, quyết định, ..." />
              </Form.Item>
              <Form.Item name="currency" label="Tiền tệ">
                <Select options={[
                  { label: "USD", value: "USD" },
                  { label: "VND", value: "VND" },
                  { label: "EUR", value: "EUR" },
                ]} placeholder="Chọn tiền tệ" />
              </Form.Item>
              <Form.Item name="timezone" label="Múi giờ">
                <Input placeholder="VD: Asia/Ho_Chi_Minh" />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: "linear-gradient(90deg,#2563eb 70%,#15c6ff 100%)",
                  fontWeight: 600,
                  borderRadius: 8,
                }}
                onClick={() => setAddMore(false)}
              >
                Thêm & Đóng
              </Button>
              <Button
                type="dashed"
                htmlType="submit"
                onClick={() => setAddMore(true)}
              >
                Thêm nữa
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Sửa */}
      <Modal
        open={editModal}
        title="Sửa giao dịch"
        onCancel={() => setEditModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleEditOk} form={editForm}>
          <Form.Item name="symbol" label="Mã giao dịch" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="asset_type" label="Loại tài sản" rules={[{ required: true }]}>
            <Select options={assetTypes} />
          </Form.Item>
          <Form.Item name="side" label="Buy/Sell" rules={[{ required: true }]}>
            <Select options={[
              { label: "Buy", value: "Buy" },
              { label: "Sell", value: "Sell" },
              { label: "Long", value: "Long" },
              { label: "Short", value: "Short" },
            ]} />
          </Form.Item>
          <Form.Item name="size" label="Số lượng" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="entry_price" label="Giá vào lệnh" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="entry_datetime" label="Thời điểm vào lệnh" rules={[{ required: true }]}>
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="exit_price" label="Giá đóng lệnh">
            <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="exit_datetime" label="Thời điểm đóng lệnh">
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          {isPro && (
            <>
              <Form.Item name="stop_loss" label="Stop Loss">
                <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="take_profit" label="Take Profit">
                <InputNumber min={0} step={0.0001} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="commissions" label="Phí giao dịch">
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="tags" label="Tags">
                <Select mode="tags" />
              </Form.Item>
              <Form.Item name="strategy" label="Chiến lược giao dịch">
                <Input />
              </Form.Item>
              <Form.Item name="emotion" label="Tâm lý giao dịch">
                <Select
                  allowClear
                  options={[
                    { label: "Tích cực", value: "Tích cực" },
                    { label: "Bình thường", value: "Bình thường" },
                    { label: "Lo lắng", value: "Lo lắng" },
                    { label: "Hoảng loạn", value: "Hoảng loạn" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item name="currency" label="Tiền tệ">
                <Select options={[
                  { label: "USD", value: "USD" },
                  { label: "VND", value: "VND" },
                  { label: "EUR", value: "EUR" },
                ]} />
              </Form.Item>
              <Form.Item name="timezone" label="Múi giờ">
                <Input />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                background: "linear-gradient(90deg,#2563eb 70%,#15c6ff 100%)",
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
