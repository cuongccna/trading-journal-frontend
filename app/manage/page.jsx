"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Table,
  Popconfirm,
  message,
  Tabs,
} from "antd";
import {
  collection,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../firebaseConfig";

export default function ManagePage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("accounts");
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [assets, setAssets] = useState([]);
  const [tags, setTags] = useState([]);

  const [accountForm] = Form.useForm();
  const [assetForm] = Form.useForm();
  const [tagForm] = Form.useForm();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        window.location.href = "/login";
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qAcc = query(
      collection(db, "accounts"),
      where("userId", "==", user.uid)
    );
    const unsubAcc = onSnapshot(qAcc, (snap) => {
      const data = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setAccounts(data);
    });

    const qAsset = query(
      collection(db, "assets"),
      where("userId", "==", user.uid)
    );
    const unsubAsset = onSnapshot(qAsset, (snap) => {
      const data = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setAssets(data);
    });

    const qTag = query(
      collection(db, "tags"),
      where("userId", "==", user.uid)
    );
    const unsubTag = onSnapshot(qTag, (snap) => {
      const data = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setTags(data);
    });

    return () => {
      unsubAcc();
      unsubAsset();
      unsubTag();
    };
  }, [user]);

  const addAccount = async (values) => {
    try {
      await addDoc(collection(db, "accounts"), {
        ...values,
        userId: user.uid,
      });
      accountForm.resetFields();
      message.success("Đã thêm tài khoản!");
    } catch {
      message.error("Không thêm được");
    }
  };

  const addAsset = async (values) => {
    try {
      await addDoc(collection(db, "assets"), {
        ...values,
        userId: user.uid,
      });
      assetForm.resetFields();
      message.success("Đã thêm asset!");
    } catch {
      message.error("Không thêm được");
    }
  };

  const addTag = async (values) => {
    try {
      await addDoc(collection(db, "tags"), {
        ...values,
        userId: user.uid,
      });
      tagForm.resetFields();
      message.success("Đã thêm tag!");
    } catch {
      message.error("Không thêm được");
    }
  };

  const deleteItem = async (col, id) => {
    try {
      await deleteDoc(doc(db, col, id));
      message.success("Đã xoá!");
    } catch {
      message.error("Không xoá được");
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;

  const accountColumns = [
    { title: "Tên tài khoản", dataIndex: "name" },
    {
      title: "Hành động",
      render: (_, r) => (
        <Popconfirm title="Xoá?" onConfirm={() => deleteItem("accounts", r.id)}>
          <a>Xoá</a>
        </Popconfirm>
      ),
    },
  ];

  const assetColumns = [
    { title: "Asset", dataIndex: "symbol" },
    {
      title: "Hành động",
      render: (_, r) => (
        <Popconfirm title="Xoá?" onConfirm={() => deleteItem("assets", r.id)}>
          <a>Xoá</a>
        </Popconfirm>
      ),
    },
  ];

  const tagColumns = [
    { title: "Tag", dataIndex: "name" },
    {
      title: "Hành động",
      render: (_, r) => (
        <Popconfirm title="Xoá?" onConfirm={() => deleteItem("tags", r.id)}>
          <a>Xoá</a>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <Card style={{ maxWidth: 800, margin: "auto" }}>
        <Tabs activeKey={tab} onChange={setTab}>
          <Tabs.TabPane tab="Tài khoản" key="accounts">
            <Form layout="inline" form={accountForm} onFinish={addAccount}>
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Nhập tên tài khoản" }]}
              >
                <Input placeholder="Tên tài khoản" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm
                </Button>
              </Form.Item>
            </Form>
            <Table
              style={{ marginTop: 16 }}
              columns={accountColumns}
              dataSource={accounts}
              rowKey="id"
              pagination={false}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Assets" key="assets">
            <Form layout="inline" form={assetForm} onFinish={addAsset}>
              <Form.Item
                name="symbol"
                rules={[{ required: true, message: "Nhập mã" }]}
              >
                <Input placeholder="Ký hiệu" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm
                </Button>
              </Form.Item>
            </Form>
            <Table
              style={{ marginTop: 16 }}
              columns={assetColumns}
              dataSource={assets}
              rowKey="id"
              pagination={false}
            />
          </Tabs.TabPane>

          <Tabs.TabPane tab="Tags" key="tags">
            <Form layout="inline" form={tagForm} onFinish={addTag}>
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Nhập tag" }]}
              >
                <Input placeholder="Tên tag" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Thêm
                </Button>
              </Form.Item>
            </Form>
            <Table
              style={{ marginTop: 16 }}
              columns={tagColumns}
              dataSource={tags}
              rowKey="id"
              pagination={false}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
