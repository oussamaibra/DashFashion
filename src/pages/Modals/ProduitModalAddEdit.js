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
import TextArea from "antd/lib/input/TextArea";

const { Text } = Typography;

const ProduitModalAddEdit = (props) => {
  const { visible, onCancel, type, record, refetch } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [packageOptions, setPackageOptions] = useState([]);
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
        images:
          typeof opt.images === "string"
            ? opt.images.split(",").filter((url) => url)
            : opt.images,
      }));

      setOptions(formattedOptions);

      // Set package options if they exist
      setPackageOptions(record.packageOptions || []);

      form.setFieldsValue({
        ...record,
        category: record.category || "Homme",
      });
    } else {
      form.resetFields();
      setOptions([]);
      setPackageOptions([]);
    }
  }, [visible, record, form]);

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

  const handleAddPackageOption = () => {
    const newId =
      packageOptions.length > 0
        ? Math.max(...packageOptions.map((opt) => opt.id)) + 1
        : 1;

    setPackageOptions([
      ...packageOptions,
      {
        id: newId,
        name: "",
        label: "",
        itemNb: 1,
        price: 0,
        originalPrice: 0,
      },
    ]);
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleRemovePackageOption = (index) => {
    const newPackageOptions = [...packageOptions];
    newPackageOptions.splice(index, 1);
    setPackageOptions(newPackageOptions);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handlePackageOptionChange = (index, field, value) => {
    const newPackageOptions = [...packageOptions];
    newPackageOptions[index][field] = value;
    setPackageOptions(newPackageOptions);
  };

  const handleImageUpload = (index, info) => {
    const { fileList } = info;
    const newOptions = [...options];

    // Process fileList to get only the URLs of successfully uploaded images
    newOptions[index].images = fileList
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
          images: Array.isArray(opt.images) ? opt.images.join(",") : opt.images,
          quantiteInitiale: Number(opt.quantiteInitiale),
          quantiteVendue: Number(opt.quantiteVendue),
          quantitePerdue: Number(opt.quantitePerdue),
        })),
        packageOptions: packageOptions.map((pkg) => ({
          ...pkg,
          id: Number(pkg.id),
          itemNb: Number(pkg.itemNb),
          price: Number(pkg.price),
          originalPrice: Number(pkg.originalPrice),
        })),
      };

      if (type === "EDIT") {
        await axios.put(
          `https://www.rafrafi.shop:8443/produit/${record?._id}`,
          payload
        );
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

  const colorColumns = [
    {
      title: "Couleur",
      dataIndex: "color",
      render: (_, __, index) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="color"
            value={options[index]?.color || "#ffffff"}
            onChange={(e) => handleOptionChange(index, "color", e.target.value)}
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
      render: (_, __, index) => (
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
      render: (_, __, index) => (
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
      render: (_, __, index) => (
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
      render: (_, __, index) => (
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
      render: (_, __, index) => (
        <Upload
          multiple
          listType="picture-card"
          fileList={
            Array.isArray(options[index]?.images)
              ? options[index]?.images?.map((url) => ({
                  uid: url,
                  name: url,
                  status: "done",
                  url: url,
                })) || []
              : []
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
            if (Array.isArray(newOptions[index].images)) {
              newOptions[index].images = newOptions[index].images.filter(
                (url) => url !== file.url
              );
              setOptions(newOptions);
            }
            return false; // Prevent default remove behavior
          }}
        >
          {Array.isArray(options[index]?.images) &&
          options[index]?.images?.length >= 8 ? null : (
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

  const packageColumns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (_, __, index) => (
        <InputNumber
          value={packageOptions[index]?.id}
          onChange={(value) => handlePackageOptionChange(index, "id", value)}
          min={1}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Nom",
      dataIndex: "name",
      render: (_, __, index) => (
        <Input
          value={packageOptions[index]?.name}
          onChange={(e) =>
            handlePackageOptionChange(index, "name", e.target.value)
          }
          placeholder="Nom du package"
        />
      ),
    },
    {
      title: "Label",
      dataIndex: "label",
      render: (_, __, index) => (
        <Input
          value={packageOptions[index]?.label}
          onChange={(e) =>
            handlePackageOptionChange(index, "label", e.target.value)
          }
          placeholder="Label du package"
        />
      ),
    },
    {
      title: "Nombre d'articles",
      dataIndex: "itemNb",
      render: (_, __, index) => (
        <InputNumber
          value={packageOptions[index]?.itemNb}
          onChange={(value) =>
            handlePackageOptionChange(index, "itemNb", value)
          }
          min={1}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Prix",
      dataIndex: "price",
      render: (_, __, index) => (
        <InputNumber
          value={packageOptions[index]?.price}
          onChange={(value) => handlePackageOptionChange(index, "price", value)}
          min={0}
          step={0.01}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Prix d'origine",
      dataIndex: "originalPrice",
      render: (_, __, index) => (
        <InputNumber
          value={packageOptions[index]?.originalPrice}
          onChange={(value) =>
            handlePackageOptionChange(index, "originalPrice", value)
          }
          min={0}
          step={0.01}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Action",
      render: (_, __, index) => (
        <MinusCircleOutlined onClick={() => handleRemovePackageOption(index)} />
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
                name="details"
                label="Details Produit"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                ]}
              >
                <TextArea placeholder="Entrez Details Produit" />
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
              <Form.Item name="discount" label="Discount (TND)">
                <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Text
                strong
                style={{ display: "block", marginBottom: 16, marginTop: 16 }}
              >
                Options par Couleur/Taille
              </Text>

              <Table
                columns={colorColumns}
                dataSource={options}
                pagination={false}
                rowKey={(_, index) => `option-${index}`}
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

            <Col span={24}>
              <Text
                strong
                style={{ display: "block", marginBottom: 16, marginTop: 24 }}
              >
                Options de Package
              </Text>

              <Table
                columns={packageColumns}
                dataSource={packageOptions}
                pagination={false}
                rowKey={(_, index) => `package-${index}`}
                footer={() => (
                  <Button
                    type="dashed"
                    onClick={handleAddPackageOption}
                    block
                    icon={<PlusOutlined />}
                  >
                    Ajouter une Option de Package
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
