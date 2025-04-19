import {
  Row,
  Col,
  Card,
  Table,
  Upload,
  message,
  Button,
  Typography,
  Modal,
  Input,
  notification,
  Badge,
  Tag,
  Divider,
  Progress,
  Select,
} from "antd";
import {
  DeleteTwoTone,
  EditTwoTone,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";
import _ from "lodash";
import ProduitModalAddEdit from "./Modals/ProduitModalAddEdit";
import Text from "antd/lib/typography/Text";

const { confirm } = Modal;
const { Option } = Select;

const Produit = () => {
  const [data, setData] = useState([]);
  const [filterData, setfilterData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [action, setAction] = useState("");
  const [search, setSearch] = useState("");
  const [record, setrecord] = useState(null);
  const [refetech, setrefetech] = useState(false);
  const [show, setshow] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const abilities = JSON.parse(localStorage.getItem("user"))?.abilities?.find(
    (el) => el.page === "produit"
  )?.can;

  useEffect(() => {
    fetchData();
  }, [refetech]);

  const fetchData = () => {
    axios.get("https://www.rafrafi.shop:8443/produit").then((response) => {
      if (response.data) {
        setSearch("");
        setfilterData([]);
        let sorted_obj = _.sortBy(response.data, function (o) {
          return Number(o.reference);
        });
        setData(sorted_obj);
      } else {
        notification.error({ message: "No Data Found" });
      }
    });
  };

  const handrefetech = () => {
    setrefetech(!refetech);
  };

  const showPromiseConfirm = (alldata, dataDelete) => {
    confirm({
      title: "Vous voulez supprimer " + alldata.nom + "?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        axios
          .delete("https://www.rafrafi.shop:8443/produit/" + dataDelete)
          .then((response) => {
            message.success("Produit supprimer avec success.");
            handrefetech();
          });
      },
      onCancel() {},
    });
  };

  const columns = [
    {
      title: "Référence",
      dataIndex: "reference",
      key: "reference",
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
    },
    {
      title: "Catégorie",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Options",
      key: "options",
      render: (_, record) => (
        <Tag color="blue">{record.options?.length || 0} variants</Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <div className="action-buttons">
          <Row gutter={8}>
            <Col>
              <Button
                onClick={() => {
                  setVisible(true);
                  setrecord(record);
                  setAction("EDIT");
                }}
              >
                <EditTwoTone />
              </Button>
            </Col>
            <Col>
              <Button
                onClick={() => {
                  setshow(true);
                  setrecord(record);
                  setSelectedColor(record.options?.[0]?.color || null);
                }}
              >
                <InfoCircleOutlined />
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                danger
                onClick={() => showPromiseConfirm(record, record._id)}
              >
                <DeleteTwoTone twoToneColor="#FFFFFF" />
              </Button>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearch(search);
    // if (!search) {
    //   fetchData();
    //   return;
    // }
    const filtered = data.filter(
      (item) =>
        item.nom.toLowerCase().includes(search.toLowerCase()) ||
        item.reference.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );
    setfilterData(filtered);
  };

  // const handleExcelImport = async (options) => {
  //   const { file } = options;
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   setFileUploading(true);

  //   try {
  //     const response = await axios.post(
  //       "https://www.rafrafi.shop:8443/produit/import",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     message.success(`${file.name} importé avec succès`);
  //     handrefetech();
  //   } catch (error) {
  //     message.error(`Échec de l'importation de ${file.name}: ${error.message}`);
  //   } finally {
  //     setFileUploading(false);
  //   }
  // };

  const calculateStock = (option) => {
    const availableStock =
      option.quantiteInitiale - option.quantiteVendue - option.quantitePerdue;
    const stockPercentage = (availableStock / option.quantiteInitiale) * 100;

    return {
      availableStock,
      stockPercentage,
      status:
        availableStock <= 0
          ? "RUPTURE DE STOCK"
          : availableStock <= 5
          ? "STOCK FAIBLE"
          : "EN STOCK",
    };
  };

  return (
    <>
      <h1>Produits</h1>
      <div className="tabled">
        <Row gutter={[24, 0]}>
          <Col xs="24" xl={24}>
            <Card
              bordered={false}
              className="criclebox tablespace mb-24"
              title="Liste des produits"
              extra={
                <div className="d-flex">
                  <Input
                    placeholder="Rechercher par nom, référence ou catégorie"
                    style={{ marginRight: 25, width: 250 }}
                    value={search}
                    onChange={(e) => handleSearch(e)}
                    // onPressEnter={handleSearch}
                    suffix={<SearchOutlined onClick={handleSearch} />}
                  />

                  <Button
                    style={{ marginRight: 25 }}
                    type="primary"
                    onClick={() => {
                      setVisible(true);
                      setrecord({});
                      setAction("ADD");
                    }}
                  >
                    Ajouter un produit
                  </Button>
                </div>
              }
            >
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={search ? filterData : data}
                  pagination={true}
                  className="ant-border-space"
                  rowKey="reference"
                />
              </div>
            </Card>
          </Col>
        </Row>

        <ProduitModalAddEdit
          visible={visible}
          record={action === "EDIT" ? record : {}}
          refetch={handrefetech}
          type={action}
          onCancel={() => setVisible(false)}
        />

        <Modal
          visible={show}
          destroyOnClose
          width={1000}
          onCancel={() => setshow(false)}
          footer={false}
        >
          {record && (
            <Badge.Ribbon
              text="Détails Produit"
              color="red"
              style={{ marginTop: 15 }}
            >
              <Card>
                <Row gutter={16}>
                  <Col span={12}>
                    <h3>Informations de base</h3>
                    <p>
                      <strong>Référence:</strong> {record.reference}
                    </p>
                    <p>
                      <strong>Nom:</strong> {record.nom}
                    </p>
                    <p>
                      <strong>Catégorie:</strong> {record.category}
                    </p>
                    <p>
                      <strong>Prix d'achat:</strong> {record.prixAchat} TND
                    </p>
                    <p>
                      <strong>Prix de vente:</strong> {record.prixVente} TND
                    </p>
                  </Col>

                  <Col span={12}>
                    <h3 style={{ marginBottom: 16 }}>Variantes disponibles</h3>
                    <Select
                      style={{ width: "100%" }}
                      value={selectedColor}
                      onChange={(value) => setSelectedColor(value)}
                      placeholder="Sélectionner une couleur"
                      optionLabelProp="label"
                      showSearch
                      filterOption={(input, option) =>
                        option.label.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {record?.options?.map((option, index) => (
                        <Select.Option
                          key={index}
                          value={option.color}
                          style={{
                            backgroundColor: option.color,
                          }}
                          label={`${option.sizes}`}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {option.sizes}
                            {option.images && (
                              <img
                                src={option.images.split(",")[0]}
                                alt=""
                                style={{
                                  width: 20,
                                  height: 20,
                                  marginLeft: 8,
                                  objectFit: "cover",
                                }}
                              />
                            )}
                          </div>
                        </Select.Option>
                      ))}
                    </Select>
                  </Col>
                </Row>

                {selectedColor && (
                  <Card
                    title={`Stock pour la variante ${selectedColor}`}
                    style={{ marginTop: 16 }}
                    bordered={false}
                  >
                    {record.options
                      ?.filter((option) => option.color === selectedColor)
                      ?.map((option, index) => {
                        const { availableStock, stockPercentage, status } =
                          calculateStock(option);

                        return (
                          <div key={index}>
                            <Row gutter={16} align="middle">
                              <Col span={8}>
                                <Text strong>Taille:</Text>
                                <Text style={{ marginLeft: 8 }}>
                                  {option.sizes}
                                </Text>
                              </Col>

                              <Col span={8}>
                                <Text strong>Stock disponible:</Text>
                                <Badge
                                  count={availableStock}
                                  style={{
                                    backgroundColor:
                                      status === "RUPTURE DE STOCK"
                                        ? "#f5222d"
                                        : status === "STOCK FAIBLE"
                                        ? "#faad14"
                                        : "#52c41a",
                                    marginLeft: 8,
                                  }}
                                />
                              </Col>

                              <Col span={8}>
                                <Progress
                                  percent={Math.round(stockPercentage)}
                                  status={
                                    stockPercentage > 50
                                      ? "success"
                                      : stockPercentage > 20
                                      ? "normal"
                                      : "exception"
                                  }
                                />
                              </Col>
                            </Row>

                            <Row gutter={16} style={{ marginTop: 8 }}>
                              <Col span={12}>
                                <Text type="secondary">
                                  Initial: {option.quantiteInitiale} | Vendu:{" "}
                                  {option.quantiteVendue} | Perdu:{" "}
                                  {option.quantitePerdue}
                                </Text>
                              </Col>
                              <Col span={12}>
                                <Tag
                                  color={
                                    status === "RUPTURE DE STOCK"
                                      ? "red"
                                      : status === "STOCK FAIBLE"
                                      ? "orange"
                                      : "green"
                                  }
                                >
                                  {status}
                                </Tag>
                              </Col>
                            </Row>

                            {index < record.options.length - 1 && (
                              <Divider style={{ margin: "12px 0" }} />
                            )}
                          </div>
                        );
                      })}
                  </Card>
                )}
              </Card>
            </Badge.Ribbon>
          )}
        </Modal>
      </div>
    </>
  );
};

export default Produit;
