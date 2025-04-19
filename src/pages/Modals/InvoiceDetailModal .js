import React from "react";
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Image,
  Divider,
  Typography,
  Space,
} from "antd";
import dayjs from "dayjs";

const { Text, Title } = Typography;

const InvoiceDetailModal = ({ visible, invoice, onCancel }) => {
  const columns = [
    {
      title: "Produit",
      dataIndex: "nom",
      key: "nom",
      render: (text, record) => (
        <Space>
          <Image
            width={50}
            height={50}
            src={record.image}
            fallback="https://via.placeholder.com/50"
            style={{ objectFit: "cover" }}
          />
          <div>
            <div>{text}</div>
            <Text type="secondary">{record.reference}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Détails",
      key: "details",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <div>
            <Text strong>Couleur: </Text>
            <Space size="small">
              <div
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: record.color,
                  borderRadius: "50%",
                  display: "inline-block",
                  verticalAlign: "middle",
                }}
              />
              <Text>{record.color}</Text>
            </Space>
          </div>
          <div>
            <Text strong>Taille: </Text>
            <Text>{record.size}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Quantité",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Prix unitaire",
      dataIndex: "prixVente",
      key: "prixVente",
      render: (text) => `${text.toFixed(2)} TND`,
      align: "right",
    },
    {
      title: "Total",
      key: "total",
      render: (_, record) => `${(record.quantity * record.prixVente).toFixed(2)} TND`,
      align: "right",
    },
  ];

  const statusColor = {
    pending: "orange",
    valid: "green",
    rejected: "red",
  };

  return (
    <Modal
      visible={visible}
      title={`Facture ${invoice?.invoiceNumber}`}
      width={800}
      footer={null}
      onCancel={onCancel}
    >
      {invoice && (
        <>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Date">
              {invoice?.date}
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={statusColor[invoice.status]}>
                {invoice.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Client" span={2}>
              {invoice.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Téléphone">
              {invoice.customerPhone}
            </Descriptions.Item>
            <Descriptions.Item label="Adresse">
              {invoice.customerAddress}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Articles</Divider>

          <Table
            columns={columns}
            dataSource={invoice.items}
            pagination={false}
            rowKey="_id"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <Text strong>Sous-total:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong>{invoice.subtotal.toFixed(2)} TND</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <Text strong>Taxe:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Text strong>{invoice.tax.toFixed(2)} TND</Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <Title level={5} style={{ margin: 0 }}>
                      Total:
                    </Title>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <Title level={5} style={{ margin: 0 }}>
                      {invoice.total.toFixed(2)} TND
                    </Title>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          {invoice.notes && (
            <>
              <Divider orientation="left">Notes</Divider>
              <Text>{invoice.notes}</Text>
            </>
          )}

          <Divider />

          <Descriptions column={1}>
            <Descriptions.Item label="Créé le">
              {dayjs(invoice.createdAt).format("DD MMMM YYYY, HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Dernière mise à jour">
              {dayjs(invoice.updatedAt).format("DD MMMM YYYY, HH:mm:ss")}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Modal>
  );
};

export default InvoiceDetailModal;