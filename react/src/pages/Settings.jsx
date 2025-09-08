import React from 'react';
import { Card, Col, Form, Input, Row, Space, Button, Skeleton, message, InputNumber, Select, Typography } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../api/settings';
import { setWebhook, testSend } from '../api/telegram';

const { Title, Text } = Typography;

const Settings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings });

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      message.success('Настройки сохранены');
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (e) => message.error(e?.response?.data?.error || 'Ошибка сохранения настроек'),
  });

  const onFinish = (values) => {
    const payload = {
      botToken: values.botToken || '',
      providerToken: values.providerToken || '',
      channelId: values.channelId || '',
      channelUsername: values.channelUsername || '',
      productName: values.productName || '',
      priceCents: Math.trunc(Number(values.priceCents || 0)),
      currency: values.currency || 'RUB',
      description: values.description || '',
      webhookUrl: values.webhookUrl || '',
    };

    if (payload.priceCents < 0) {
      payload.priceCents = 0;
    }

    updateMutation.mutate(payload);
  };

  const onSetWebhook = async (values) => {
    try {
      const res = await setWebhook({ url: values.webhookUrl });
      if (res?.ok) message.success('Вебхук установлен');
      else message.info('Запрос отправлен');
    } catch (e) {
      message.error(e?.response?.data?.error || 'Ошибка установки вебхука');
    }
  };

  const onTestSend = async (values) => {
    try {
      const res = await testSend({ chat_id: values.testChatId, text: values.testText || 'Тестовое сообщение' });
      if (res?.ok) message.success('Сообщение отправлено');
      else message.info('Запрос отправлен');
    } catch (e) {
      message.error(e?.response?.data?.error || 'Ошибка отправки сообщения');
    }
  };

  const data = settingsQuery.data?.data || {};

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Общие настройки">
            {settingsQuery.isLoading ? (
              <Skeleton active />
            ) : (
              <Form layout="vertical" onFinish={onFinish} initialValues={{
                botToken: data.botToken || '',
                providerToken: data.providerToken || '',
                channelId: data.channelId || '',
                channelUsername: data.channelUsername || '',
                productName: data.productName || '',
                priceCents: typeof data.priceCents === 'number' ? data.priceCents : 0,
                currency: data.currency || 'RUB',
                description: data.description || '',
                webhookUrl: data.webhookUrl || '',
              }}>
                <Title level={5} style={{ marginTop: 0 }}>Telegram бот</Title>
                <Form.Item label="Bot Token" name="botToken" tooltip="Токен бота из @BotFather">
                  <Input placeholder="123456:ABC-DEF..." />
                </Form.Item>

                <Form.Item label="Webhook URL" name="webhookUrl" tooltip="URL для вебхука Telegram">
                  <Input placeholder="https://example.com/api/telegram/webhook" />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Channel ID" name="channelId" tooltip="Например: -1001234567890">
                      <Input placeholder="-1001234567890" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Username канала" name="channelUsername" tooltip="Без @, например: mychannel">
                      <Input placeholder="mychannel" />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={5}>Оплата</Title>
                <Form.Item label="Provider Token" name="providerToken" rules={[{ required: true, message: 'Укажите providerToken' }]} tooltip="Провайдер-токен платежей">
                  <Input placeholder="provider_live_xxx" />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Название продукта" name="productName" rules={[{ required: true, message: 'Укажите название продукта' }]}
                      tooltip="Отображается при оплате">
                      <Input placeholder="Доступ к каналу" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Цена (в копейках)" name="priceCents" rules={[{ required: true, message: 'Укажите цену в копейках' }]}
                      tooltip="Целое число, например 19900 = 199 ₽">
                      <InputNumber min={0} step={1} precision={0} style={{ width: '100%' }} placeholder="19900" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Валюта" name="currency" rules={[{ required: true, message: 'Выберите валюту' }]} tooltip="Сейчас поддерживается только RUB">
                      <Select options={[{ value: 'RUB', label: 'RUB' }]} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Описание" name="description" tooltip="Описание товара/подписки (необязательно)">
                      <Input placeholder="Описание" />
                    </Form.Item>
                  </Col>
                </Row>

                <Space>
                  <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Сохранить</Button>
                </Space>
              </Form>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card title="Telegram: вебхук">
              <Text type="secondary">Установите вебхук для приёма обновлений от Telegram.</Text>
              <Form layout="vertical" onFinish={onSetWebhook} initialValues={{ webhookUrl: data?.webhookUrl || '' }} style={{ marginTop: 12 }}>
                <Form.Item label="Webhook URL" name="webhookUrl" rules={[{ required: true, message: 'Укажите URL вебхука' }]}>
                  <Input placeholder="https://example.com/api/telegram/webhook" />
                </Form.Item>
                <Button type="primary" htmlType="submit">Установить вебхук</Button>
              </Form>
            </Card>

            <Card title="Telegram: тестовое сообщение">
              <Text type="secondary">Отправьте тестовое сообщение в чат, указав Chat ID.</Text>
              <Form layout="vertical" onFinish={onTestSend} style={{ marginTop: 12 }}>
                <Form.Item label="Chat ID" name="testChatId" rules={[{ required: true, message: 'Укажите Chat ID' }]}>
                  <Input placeholder="123456789" />
                </Form.Item>
                <Form.Item label="Текст" name="testText">
                  <Input placeholder="Тестовое сообщение" />
                </Form.Item>
                <Button type="primary" htmlType="submit">Отправить</Button>
              </Form>
            </Card>
          </Space>
        </Col>
      </Row>
    </Space>
  );
};

export default Settings;
