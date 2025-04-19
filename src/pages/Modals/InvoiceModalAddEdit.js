import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Table,
  InputNumber,
  Space,
  Divider,
  notification,
  Row,
  Col,
} from "antd";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";

const { Option } = Select;

const InvoiceModalAddEdit = ({
  visible,
  record,
  refetech,
  type,
  customers,
  products,
  stores,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type === "EDIT" && record) {
      form.setFieldsValue({
        ...record,
        date: dayjs(record.date) || new Date(),
        customerId: record?.customerId || null,
      });
      setItems(record.items || []);
      calculateTotals(record.items || []);
    } else {
      form.resetFields();
      setItems([]);
      setSubtotal(0);
      setTax(0);
      setTotal(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record, type]);

  const calculateTotals = (items) => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.prixVente,
      0
    );
    const newTax = newSubtotal * 0.2; // Assuming 20% tax
    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        stockId: null,
        color: "",
        size: "",
        image: "",
        reference: "",
        nom: "",
        quantity: 1,
        prixAchat: 0,
        prixVente: 0,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    calculateTotals(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // If product is selected, update product details
    if (field === "stockId" && value) {
      const product = products.find((p) => p._id === value);
      if (product) {
        newItems[index].reference = product.reference;
        newItems[index].nom = product.nom;
        newItems[index].color = product.color || "";
        newItems[index].size = product.size || "";
        newItems[index].image = product.image || "";
        newItems[index].prixAchat = product.prixAchat;
        newItems[index].prixVente = product.prixVente;
      }
    }

    setItems(newItems);
    calculateTotals(newItems);
  };

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((c) => c._id === customerId);
    if (customer) {
      form.setFieldsValue({
        customerName: customer.nom,
        customerAddress: customer.adresse,
        customerPhone: customer.telephone,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        invoiceNumber: values.invoiceNumber,
        date: values.date.toISOString(),
        customerName: values.customerName,
        customerAddress: values.customerAddress,
        customerPhone: values.customerPhone,
        items: items.map(item => ({
          stockId: item.stockId,
          color: item.color,
          size: item.size,
          image: item.image,
          reference: item.reference,
          nom: item.nom,
          quantity: item.quantity,
          prixAchat: item.prixAchat,
          prixVente: item.prixVente
        })),
        subtotal,
        tax,
        total,
        status: "pending",
        notes: values.notes || "",
      };

      if (type === "EDIT") {
        await axios.put(`http://127.0.0.1:3003/invoice/${record._id}`, payload);
        notification.success({ message: "Facture mise à jour avec succès" });
      } else {
        await axios.post("http://127.0.0.1:3003/invoice", payload);
        notification.success({ message: "Facture créée avec succès" });
      }

      refetech();
      onCancel();
    } catch (error) {
      console.log("errr", error);
      notification.error({ message: "Erreur", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Produit",
      dataIndex: "stockId",
      key: "stockId",
      render: (value, record, index) => (
        <Select
          value={value}
          style={{ width: "100%" }}
          onChange={(val) => handleItemChange(index, "stockId", val)}
          showSearch
          optionFilterProp="children"
        >
          {products.map((product) => (
            <Option key={product._id} value={product._id}>
              {product.nom} ({product.reference})
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Couleur",
      dataIndex: "color",
      key: "color",
      render: (value, record, index) => (
        <Input
          value={value}
          onChange={(e) => handleItemChange(index, "color", e.target.value)}
        />
      ),
    },
    {
      title: "Taille",
      dataIndex: "size",
      key: "size",
      render: (value, record, index) => (
        <Input
          value={value}
          onChange={(e) => handleItemChange(index, "size", e.target.value)}
        />
      ),
    },
    {
      title: "Quantité",
      dataIndex: "quantity",
      key: "quantity",
      render: (value, record, index) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleItemChange(index, "quantity", val)}
        />
      ),
    },
    {
      title: "Prix",
      dataIndex: "prixVente",
      key: "prixVente",
      render: (value) => `${value.toFixed(2)} TND`,
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) =>
        `${(record.quantity * record.prixVente).toFixed(2)} TND`,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record, index) => (
        <Button
          danger
          type="text"
          icon={<MinusOutlined />}
          onClick={() => handleRemoveItem(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      visible={visible}
      title={type === "EDIT" ? "Modifier la facture" : "Créer une facture"}
      width="100%"
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Annuler
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Enregistrer
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="invoiceNumber"
              label="Numéro de facture"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabled={type === "EDIT"}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="customerName"
              label="Nom du client"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customerPhone"
              label="Téléphone"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="customerAddress"
              label="Adresse"
              rules={[{ required: true, message: "Ce champ est requis" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Articles</Divider>

        <Button
          type="dashed"
          onClick={handleAddItem}
          block
          icon={<PlusOutlined />}
        >
          Ajouter un article
        </Button>

        <Table
          dataSource={items}
          pagination={false}
          rowKey={(record, index) => index}
          columns={columns}
        />

        <Divider orientation="left">Total</Divider>

        <Row justify="end" gutter={16}>
          <Col>
            <Space direction="vertical" size="middle">
              <div>
                <span style={{ marginRight: 16 }}>Sous-total:</span>
                <span>{subtotal.toFixed(2)} TND</span>
              </div>
              <div>
                <span style={{ marginRight: 16 }}>Taxe (20%):</span>
                <span>{tax.toFixed(2)} TND</span>
              </div>
              <div>
                <span style={{ marginRight: 16 }}>Total:</span>
                <span>{total.toFixed(2)} TND</span>
              </div>
            </Space>
          </Col>
        </Row>

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InvoiceModalAddEdit;