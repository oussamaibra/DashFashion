import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Table,
  Typography,
  Upload,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import axios from "axios";

const { Text } = Typography;

const ProduitModalAddEdit = (props) => {
  const { visible, onCancel, type, record, refetch } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Load categories
    setCategories([
      {
        _id: "Homme",
        nom: "Homme",
      },
      {
        _id: "Femme",
        nom: "Femme",
      },
    ]);

    if (type === "EDIT" && record) {
      // Convert the record data to match the form structure
      const formattedOptions = record.options.map((opt) => ({
        ...opt,
        sizes: opt.sizes,
        images: opt.images
          .split(",")
          // .map((url) => url.trim())
          .filter((url) => url),
      }));

      setOptions(formattedOptions);
      form.setFieldsValue({
        ...record,
        category: record.category || "Homme",
      });
    } else {
      form.resetFields();
      setOptions([]);
    }
  }, [visible, record]);

  const handleAddOption = () => {
    setOptions([
      ...options,
      {
        color: "",
        sizes: "",
        quantiteInitiale: 0,
        quantiteVendue: 0,
        quantitePerdue: 0,
        images: [],
      },
    ]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleImageUpload = (index, info) => {
    const { fileList } = info;
    const newOptions = [...options];

    // Process fileList to get only the URLs of successfully uploaded images
    newOptions[index].images = fileList
      // .filter((file) => file.status === "done") // Only keep completed uploads
      .map((file) => {
        // For existing images (already have full URL)
        if (file.url) {
          return file.url;
        }
        // For newly uploaded images - construct URL from API response
        if (file.status === "uploading") {
          const filename = file.name.replace(",", "");
          return `https://www.rafrafi.shop:8443/upload/${filename}`;
        }
        return null;
      })
      .filter((url) => url); // Remove any null/undefined values

    setOptions(newOptions);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,

        options: options.map((opt) => ({
          ...opt,
          images: opt.images.join(","),
          quantiteInitiale: Number(opt.quantiteInitiale),
          quantiteVendue: Number(opt.quantiteVendue),
          quantitePerdue: Number(opt.quantitePerdue),
        })),
      };

      if (type === "EDIT") {
        await axios.put(`https://www.rafrafi.shop:8443/produit/${record._id}`, payload);
        message.success("Produit mis à jour avec succès");
      } else {
        await axios.post("https://www.rafrafi.shop:8443/produit", payload);
        message.success("Produit créé avec succès");
      }
      refetch();
      onCancel();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Couleur",
      dataIndex: "color",
      render: (_, record, index) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* <Input
            value={options[index]?.color || ""}
            onChange={(e) => handleOptionChange(index, "color", e.target.value)}
            placeholder="Nom de la couleur"
            style={{ flex: 1 }}
          /> */}
          <input
            type="color"
            value={options[index]?.color || "#ffffff"}
            onChange={(e) =>
              handleOptionChange(index, "color", e.target.value)
            }
            style={{
              width: 30,
              height: 30,
              padding: 0,
              border: "1px solid #d9d9d9",
            }}
          />
        </div>
      ),
    },
    {
      title: "Tailles",
      dataIndex: "sizes",
      render: (_, record, index) => (
        <Select
          mode="tags"
          value={options[index]?.sizes ? options[index].sizes.split(",") : []}
          onChange={(values) =>
            handleOptionChange(index, "sizes", values.join(","))
          }
          placeholder="Sélectionner les tailles"
          style={{ width: "100%" }}
        >
          {["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"].map((size) => (
            <Select.Option key={size} value={size.toString()}>
              {size}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Quantité Initiale",
      dataIndex: "quantiteInitiale",
      render: (_, record, index) => (
        <InputNumber
          value={options[index]?.quantiteInitiale}
          onChange={(value) =>
            handleOptionChange(index, "quantiteInitiale", value)
          }
          min={0}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Quantité Vendue",
      dataIndex: "quantiteVendue",
      render: (_, record, index) => (
        <InputNumber
          value={options[index]?.quantiteVendue}
          onChange={(value) =>
            handleOptionChange(index, "quantiteVendue", value)
          }
          min={0}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Quantité Perdue",
      dataIndex: "quantitePerdue",
      render: (_, record, index) => (
        <InputNumber
          value={options[index]?.quantitePerdue}
          onChange={(value) =>
            handleOptionChange(index, "quantitePerdue", value)
          }
          min={0}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Images",
      dataIndex: "images",
      render: (_, record, index) => (
        <Upload
          multiple
          listType="picture-card"
          fileList={
            options[index]?.images?.map((url) => ({
              uid: url,
              name: url,
              status: "done",
              url: url,
            })) || []
          }
          onChange={(info) => handleImageUpload(index, info)}
          action="https://www.rafrafi.shop:8443/upload"
          accept="image/*"
          beforeUpload={(file) => {
            const isImage = file.type.startsWith("image/");
            const isLt5M = file.size / 1024 / 1024 < 5;

            if (!isImage) {
              message.error("You can only upload image files!");
              return Upload.LIST_IGNORE;
            }
            if (!isLt5M) {
              message.error("Image must be smaller than 5MB!");
              return Upload.LIST_IGNORE;
            }
            return true;
          }}
          onPreview={(file) => {
            window.open(
              file.url ||
                `https://www.rafrafi.shop:8443/upload/${file.response?.filename}`,
              "_blank"
            );
          }}
          onRemove={(file) => {
            const newOptions = [...options];
            newOptions[index].images = newOptions[index].images.filter(
              (url) => url !== file.url
            );
            setOptions(newOptions);
            return false; // Prevent default remove behavior
          }}
        >
          {options[index]?.images?.length >= 8 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      ),
    },
    {
      title: "Action",
      render: (_, __, index) => (
        <MinusCircleOutlined onClick={() => handleRemoveOption(index)} />
      ),
    },
  ];

  return (
    <Modal
      title={
        type === "EDIT" ? "MODIFIER LE PRODUIT" : "AJOUTER UN NOUVEAU PRODUIT"
      }
      visible={visible}
      width={1200}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={type === "EDIT" ? "Mettre à jour" : "Créer"}
      cancelText="Annuler"
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Card>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nom"
                label="Nom du Produit"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input placeholder="Entrez le nom du produit" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="reference"
                label="Référence"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Input placeholder="Entrez la référence" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="category"
                label="Catégorie"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <Select placeholder="Sélectionnez une catégorie">
                  {categories.map((cat) => (
                    <Select.Option key={cat._id} value={cat._id}>
                      {cat.nom}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="prixAchat"
                label="Prix d'Achat (TND)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="prixVente"
                label="Prix de Vente (TND)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
            </Col>

            
            <Col span={12}>
              <Form.Item
                name="discount"
                label="Discount (TND)"
                rules={[
                  { required: false, message: "Ce champ est obligatoire" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Text strong style={{ display: "block", marginBottom: 16 }}>
                Options par Couleur/Taille
              </Text>

              <Table
                columns={columns}
                dataSource={options}
                pagination={false}
                rowKey={(_, index) => index}
                footer={() => (
                  <Button
                    type="dashed"
                    onClick={handleAddOption}
                    block
                    icon={<PlusOutlined />}
                  >
                    Ajouter une Option (Couleur/Taille)
                  </Button>
                )}
              />
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default ProduitModalAddEdit;
