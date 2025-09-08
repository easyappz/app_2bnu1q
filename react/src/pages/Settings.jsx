import React from 'react';
import { Card, Col, Form, Input, Row, Space, Button, Skeleton, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../api/settings';
import { setWebhook, testSend } from '../api/telegram';

const Settings = () => {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: getSettings });
  const updateMutation = useMutation({ mutationFn: updateSettings, onSuccess: () => { message.success('Настройки сохранены'); queryClient.invalidateQueries({ queryKey: ['settings'] }); }, onError: (e) => message.error(e?.response?.data?.error || 'Ошибка сохранения') });

  const onFinish = (values) => {
    updateMutation.mutate(values);
  };

  const onSetWebhook = async (values) => {
    try {
      const res = await setWebhook({ url: values.telegramWebhookUrl });
      if (res?.ok) message.success('Вебхук установлен'); else message.info('Запрос отправлен');
    } catch (e) {
      message.error(e?.response?.data?.error || 'Ошибка установки вебхука');
    }
  };

  const onTestSend = async (values) => {
    try {
      const res = await testSend({ chatId: values.testChatId, text: values.testText || 'Тестовое сообщение' });
      if (res?.ok) message.success('Сообщение отправлено'); else message.info('Запрос отправлен');
    } catch (e) {
      message.error(e?.response?.data?.error || 'Ошибка отправки сообщения');
    }
  };

  const initialValues = settingsQuery.data?.data || settingsQuery.data || {};

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Общие настройки">
            {settingsQuery.isLoading ? (
              <Skeleton active />
            ) : (
              <Form layout="vertical" onFinish={onFinish} initialValues={initialValues}>
                <Form.Item label="Telegram Bot Token" name="telegramBotToken">
                  <Input placeholder="123456:ABC-DEF..." />
                </Form.Item>
                <Form.Item label="Telegram Webhook URL" name="telegramWebhookUrl">
                  <Input placeholder="https://example.com/api/telegram/webhook" />
                </Form.Item>
                <Form.Item label="YooKassa Shop ID" name="yookassaShopId">
                  <Input placeholder="shopId" />
                </Form.Item>
                <Form.Item label="YooKassa Secret Key" name="yookassaSecret">
                  <Input.Password placeholder="секретный ключ" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>Сохранить</Button>
              </Form>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card title="Telegram: вебхук">
              <Form layout="vertical" onFinish={onSetWebhook} initialValues={{ telegramWebhookUrl: initialValues?.telegramWebhookUrl }}>
                <Form.Item label="Webhook URL" name="telegramWebhookUrl" rules={[{ required: true, message: 'Укажите URL вебхука' }]}>
                  <Input placeholder="https://example.com/api/telegram/webhook" />
                </Form.Item>
                <Button type="primary" htmlType="submit">Установить вебхук</Button>
              </Form>
            </Card>
            <Card title="Telegram: тестовое сообщение">
              <Form layout="vertical" onFinish={onTestSend}>
                <Form.Item label="Chat ID" name="testChatId" rules={[{ required: true, message: 'Укажите chatId' }]}>
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
