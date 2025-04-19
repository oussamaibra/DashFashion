import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import axios from "axios";

const { Text } = Typography;

const ClientModalAddEdit = (props) => {
  const { visible, onCancel, action, record, refetch } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with record data when modal opens
  useEffect(() => {
    if (visible) {
      if (action === "EDIT" && record) {
        form.setFieldsValue({
          nom: record.nom,
          adresse: record.adresse,
          telephone: record.telephone,
          email: record.email,
          notes: record.notes,
        });
      } else {
        // Reset form for new client
        form.resetFields();
      }
    }
  }, [visible, record, action, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (action === "EDIT") {
        await axios.put(`https://www.rafrafi.shop:8443/clients/${record._id}`, values);
        message.success("Client mis à jour avec succès");
      } else {
        await axios.post("https://www.rafrafi.shop:8443/clients", values);
        message.success("Client créé avec succès");
      }

      refetch();
      onCancel();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement du client");
      console.error("API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={action === "EDIT" ? "MODIFIER LE CLIENT" : "AJOUTER UN NOUVEAU CLIENT"}
      visible={visible}
      width={700}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={action === "EDIT" ? "Mettre à jour" : "Créer"}
      cancelText="Annuler"
      destroyOnClose
    >
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Card>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="nom"
                label="Nom complet"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { max: 100, message: "Maximum 100 caractères" }
                ]}
              >
                <Input placeholder="Entrez le nom complet du client" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="adresse"
                label="Adresse"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { max: 200, message: "Maximum 200 caractères" }
                ]}
              >
                <Input.TextArea 
                  placeholder="Entrez l'adresse complète du client" 
                  rows={3}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="telephone"
                label="Téléphone"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { 
                    pattern: /^[0-9]{8,15}$/,
                    message: "Numéro de téléphone invalide" 
                  }
                ]}
              >
                <Input 
                  placeholder="Entrez le numéro de téléphone" 
                  addonBefore="+216"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { 
                    type: 'email', 
                    message: "Email invalide" 
                  },
                  { max: 100, message: "Maximum 100 caractères" }
                ]}
              >
                <Input placeholder="Entrez l'email du client" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="notes"
                label="Notes"
                rules={[
                  { max: 500, message: "Maximum 500 caractères" }
                ]}
              >
                <Input.TextArea 
                  placeholder="Entrez des notes supplémentaires sur le client" 
                  rows={3}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default ClientModalAddEdit;