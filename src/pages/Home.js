import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Statistic,
  Divider,
  Progress,
  Tag,
  Badge,
  List,
  Radio,
  Tabs,
  Table,
} from "antd";
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  ShoppingOutlined,
  EuroOutlined,
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import EChart from "../components/chart/EChart";
import EChartMarge from "../components/chart/EChartMarge";

const { Title, Text } = Typography;

// View modes for the chart
const viewModes = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
  DAILY: "daily",
  STATUS: "status",
};

function Home() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(viewModes.MONTHLY);
  const [selectedYear, setSelectedYear] = useState(moment().year());

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:3003/invoice");
        setInvoices(response.data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Calculate statistics
  const calculateStats = (status) => {
    const filtered = invoices.filter((inv) => inv.status === status);
    const count = filtered.length;
    const total = filtered.reduce((sum, inv) => sum + inv.total, 0);
    return { count, total };
  };

  const paidStats = calculateStats("valid");
  const unpaidStats = calculateStats("rejected");
  const pendingStats = calculateStats("pending");
  const partialStats = calculateStats("partially_paid");

  const todayInvoices = invoices.filter((inv) =>
    moment(inv.date, "MMMM Do YYYY, h:mm:ss a").isSame(moment(), "day")
  );

  const recentInvoices = [...invoices]
    .sort(
      (a, b) =>
        moment(b.date, "MMMM Do YYYY, h:mm:ss a") -
        moment(a.date, "MMMM Do YYYY, h:mm:ss a")
    )
    .slice(0, 5);

  const stats = [
    {
      title: "Total Factures",
      value: invoices.length,
      icon: <FileDoneOutlined style={{ fontSize: 24 }} />,
      color: "#1890ff",
    },
    {
      title: "Chiffre d'Affaires",
      value: `${invoices
        .reduce((sum, inv) => sum + inv.total, 0)
        .toFixed(2)} TND`,
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      color: "#52c41a",
    },
    {
      title: "Factures Valid",
      value: paidStats.count,
      subValue: `${paidStats.total.toFixed(2)} TND`,
      icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
      color: "#52c41a",
    },
    {
      title: "Factures En Attente",
      value: pendingStats.count,
      subValue: `${pendingStats.total.toFixed(2)} TND`,
      icon: <ClockCircleOutlined style={{ fontSize: 24 }} />,
      color: "#1890ff",
    },
    {
      title: "Factures Rejecter",
      value: unpaidStats.count,
      subValue: `${unpaidStats.total.toFixed(2)} TND`,
      icon: <CloseCircleOutlined style={{ fontSize: 24 }} />,
      color: "#faad14",
    },
    {
      title: "Aujourd'hui",
      value: todayInvoices.length,
      subValue: `${todayInvoices
        .reduce((sum, inv) => sum + inv.total, 0)
        .toFixed(2)} TND`,
      icon: <FileDoneOutlined style={{ fontSize: 24 }} />,
      color: "#722ed1",
    },
  ];

  const getStatusTag = (status) => {
    const statusMap = {
      paid: { color: "green", text: "Payée" },
      unpaid: { color: "red", text: "Impayée" },
      pending: { color: "blue", text: "En attente" },
      partially_paid: { color: "orange", text: "Partiellement Payée" },
    };
    return <Tag color={statusMap[status].color}>{statusMap[status].text}</Tag>;
  };

  // Year selection dropdown for the chart
  const availableYears = [
    ...new Set(
      invoices.map((inv) => moment(inv.date, "MMMM Do YYYY, h:mm:ss a").year())
    ),
  ].sort((a, b) => b - a);

  const invoicesWithMargin = invoices.map((invoice) => {
    const itemsWithMargin = invoice.items.map((item) => {
      const marge = (item.prixVente - item.prixAchat) * item.quantity;
      return {
        ...item,
        Marge: parseFloat(marge.toFixed(2)),
      };
    });

    const totalMarge = itemsWithMargin.reduce(
      (sum, item) => sum + item.Marge,
      0
    );

    return {
      ...invoice,
      items: itemsWithMargin,
      totalMarge: parseFloat(totalMarge.toFixed(2)),
    };
  });

  const getYearlyData = () => {
    const years = [
      ...new Set(
        invoices.map((inv) =>
          moment(inv.date, "MMMM Do YYYY, h:mm:ss a").year()
        )
      ),
    ].sort();

    return years.map((year) => {
      const yearInvoices = invoices.filter(
        (inv) => moment(inv.date, "MMMM Do YYYY, h:mm:ss a").year() === year
      );
      const total = yearInvoices.reduce((sum, inv) => sum + inv.total, 0);

      return {
        year: year.toString(),
        total: parseFloat(total.toFixed(2)),
        count: yearInvoices.length,
      };
    });
  };

  const getYearlyDataMarge = () => {
    const years = [
      ...new Set(
        invoicesWithMargin.map((inv) =>
          moment(inv.date, "MMMM Do YYYY, h:mm:ss a").year()
        )
      ),
    ].sort();

    return years.map((year) => {
      const yearInvoices = invoicesWithMargin.filter(
        (inv) => moment(inv.date, "MMMM Do YYYY, h:mm:ss a").year() === year
      );
      const total = yearInvoices.reduce((sum, inv) => sum + inv.totalMarge, 0);

      return {
        year: year.toString(),
        total: parseFloat(total.toFixed(2)),
        count: yearInvoices.length,
      };
    });
  };

  return (
    <div className="layout-content">
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={8} xl={8} key={index}>
            <Card
              bordered={false}
              loading={loading}
              style={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s ease",
                height: "100%",
              }}
              bodyStyle={{
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    backgroundColor: `${stat.color}20`,
                    borderRadius: "50%",
                    width: 48,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  {React.cloneElement(stat.icon, {
                    style: { fontSize: 20, color: stat.color },
                  })}
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "rgba(0, 0, 0, 0.45)",
                      fontWeight: 500,
                    }}
                  >
                    {stat.title}
                  </Text>
                  <Title
                    level={3}
                    style={{ margin: 0, color: stat.color, fontWeight: 600 }}
                  >
                    {stat.value}
                  </Title>
                </div>
              </div>

              {stat.subValue && (
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 12,
                    borderTop: "1px dashed #f0f0f0",
                  }}
                >
                  <Text strong style={{ fontSize: 13 }}>
                    <span style={{ color: "rgba(0, 0, 0, 0.45)" }}>
                      Montant:{" "}
                    </span>
                    <span style={{ color: stat.color }}>{stat.subValue}</span>
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Card
        title="Analyse des Marge"
        bordered={false}
        loading={loading}
        extra={
          <div style={{ display: "flex", gap: 16 }}>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={viewModes.MONTHLY}>Mensuel</Radio.Button>
              <Radio.Button value={viewModes.YEARLY}>Annuel</Radio.Button>
            </Radio.Group>

            {viewMode === viewModes.MONTHLY && (
              <Radio.Group
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                buttonStyle="solid"
              >
                {availableYears.map((year) => (
                  <Radio.Button key={year} value={year}>
                    {year}
                  </Radio.Button>
                ))}
              </Radio.Group>
            )}
          </div>
        }
      >
        {viewMode === viewModes.YEARLY ? (
          <EChartMarge
            invoices={getYearlyDataMarge()}
            viewMode={viewMode}
            chartType="line"
            xAxis="year"
            yAxis="total"
            title="Total des Marges par Année"
          />
        ) : (
          <EChartMarge
            invoices={invoicesWithMargin}
            viewMode={viewMode}
            yearFilter={viewMode === viewModes.MONTHLY ? selectedYear : null}
          />
        )}
      </Card>

      <Divider />

      <Card
        title="Analyse des Factures"
        bordered={false}
        loading={loading}
        extra={
          <div style={{ display: "flex", gap: 16 }}>
            <Radio.Group
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={viewModes.MONTHLY}>Mensuel</Radio.Button>
              <Radio.Button value={viewModes.YEARLY}>Annuel</Radio.Button>
            </Radio.Group>

            {viewMode === viewModes.MONTHLY && (
              <Radio.Group
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                buttonStyle="solid"
              >
                {availableYears.map((year) => (
                  <Radio.Button key={year} value={year}>
                    {year}
                  </Radio.Button>
                ))}
              </Radio.Group>
            )}
          </div>
        }
      >
        {viewMode === viewModes.YEARLY ? (
          <EChart
            invoices={getYearlyData()}
            viewMode={viewMode}
            chartType="line"
            xAxis="year"
            yAxis="total"
            title="Total des Factures par Année"
          />
        ) : (
          <EChart
            invoices={invoices}
            viewMode={viewMode}
            yearFilter={viewMode === viewModes.MONTHLY ? selectedYear : null}
          />
        )}
      </Card>

      <Divider />

      <Card
        title="Statut de Paiement"
        bordered={false}
        loading={loading}
        headStyle={{ fontSize: "18px", fontWeight: "600" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={24} md={6}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={
                  Math.round((paidStats.count / invoices.length) * 100) || 0
                }
                strokeColor="#52c41a"
                strokeWidth={10}
                format={(percent) => (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "24px", fontWeight: "600" }}>
                      {percent}%
                    </span>
                    <span style={{ fontSize: "14px", color: "#52c41a" }}>
                      Payées
                    </span>
                  </div>
                )}
              />
              <div style={{ marginTop: "16px" }}>
                <Text strong>{paidStats.count} factures</Text>
                <br />
                <Text type="secondary">{paidStats.total.toFixed(2)} TND</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={24} md={6}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={
                  Math.round((pendingStats.count / invoices.length) * 100) || 0
                }
                strokeColor="#1890ff"
                strokeWidth={10}
                format={(percent) => (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "24px", fontWeight: "600" }}>
                      {percent}%
                    </span>
                    <span style={{ fontSize: "14px", color: "#1890ff" }}>
                      En Attente
                    </span>
                  </div>
                )}
              />
              <div style={{ marginTop: "16px" }}>
                <Text strong>{pendingStats.count} factures</Text>
                <br />
                <Text type="secondary">
                  {pendingStats.total.toFixed(2)} TND
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={24} md={6}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={
                  Math.round((unpaidStats.count / invoices.length) * 100) || 0
                }
                strokeColor="#ff4d4f"
                strokeWidth={10}
                format={(percent) => (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "24px", fontWeight: "600" }}>
                      {percent}%
                    </span>
                    <span style={{ fontSize: "14px", color: "#ff4d4f" }}>
                      Impayées
                    </span>
                  </div>
                )}
              />
              <div style={{ marginTop: "16px" }}>
                <Text strong>{unpaidStats.count} factures</Text>
                <br />
                <Text type="secondary">{unpaidStats.total.toFixed(2)} TND</Text>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={24} md={6}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="dashboard"
                percent={
                  Math.round((partialStats.count / invoices.length) * 100) || 0
                }
                strokeColor="#faad14"
                strokeWidth={10}
                format={(percent) => (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "24px", fontWeight: "600" }}>
                      {percent}%
                    </span>
                    <span style={{ fontSize: "14px", color: "#faad14" }}>
                      Partielles
                    </span>
                  </div>
                )}
              />
              <div style={{ marginTop: "16px" }}>
                <Text strong>{partialStats.count} factures</Text>
                <br />
                <Text type="secondary">
                  {partialStats.total.toFixed(2)} TND
                </Text>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <Row gutter={24}>
          <Col span={24}>
            <div
              style={{
                background: "#fafafa",
                padding: "16px",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text strong style={{ fontSize: "16px" }}>
                Total Factures: {invoices.length}
              </Text>
              <Text strong style={{ fontSize: "16px" }}>
                Montant Total:{" "}
                {invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}{" "}
                TND
              </Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default Home;
