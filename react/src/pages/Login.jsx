import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Typography, message, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login, registerAdmin } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [formLogin] = Form.useForm();
  const [formRegister] = Form.useForm();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await login(values);
      if (res?.token) {
        localStorage.setItem('token', res.token);
        message.success('Добро пожаловать!');
        navigate('/dashboard', { replace: true });
      } else if (res?.ok && res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        message.success('Вход выполнен');
        navigate('/dashboard', { replace: true });
      } else {
        message.error('Не удалось авторизоваться');
      }
    } catch (e) {
      message.error(e?.response?.data?.error || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailedLogin = () => {
    message.error('Пожалуйста, исправьте ошибки в форме входа');
  };

  const onRegisterAdmin = async (values) => {
    setRegLoading(true);
    try {
      const res = await registerAdmin(values);
      if (res?.ok) {
        message.success('Администратор создан. Теперь выполните вход.');
        formRegister.resetFields();
      } else {
        message.info('Заявка отправлена. Попробуйте выполнить вход.');
      }
    } catch (e) {
      message.error(e?.response?.data?.error || 'Ошибка при создании администратора');
    } finally {
      setRegLoading(false);
    }
  };

  const onFinishFailedRegister = () => {
    message.error('Пожалуйста, исправьте ошибки в форме регистрации администратора');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%)',
        padding: 16,
      }}
    >
      <Card style={{ width: 460, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} bordered>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          Easyappz — Вход
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
          Управление подписчиками, платежами и настройками
        </Typography.Paragraph>

        <Form
          form={formLogin}
          name="loginForm"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailedLogin}
          initialValues={{ email: '', password: '' }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' },
            ]}
          >
            <Input type="email" placeholder="you@email.com" size="large" />
          </Form.Item>
          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Минимум 6 символов' },
            ]}
          >
            <Input.Password placeholder="Введите пароль" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large">
            Войти
          </Button>
        </Form>

        <Divider plain style={{ margin: '20px 0' }}>Или</Divider>

        <div>
          <Typography.Title level={5} style={{ marginBottom: 8 }}>
            Создать администратора
          </Typography.Title>
          <Typography.Paragraph style={{ marginTop: 0, color: '#666' }}>
            Если в системе ещё нет администратора, создайте первого пользователя.
          </Typography.Paragraph>

          <Form
            form={formRegister}
            name="registerForm"
            layout="vertical"
            onFinish={onRegisterAdmin}
            onFinishFailed={onFinishFailedRegister}
            style={{ marginTop: 8 }}
          >
            <Form.Item
              label="Email администратора"
              name="email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Введите корректный email' },
              ]}
              extra="На этот email будет создан администратор"
            >
              <Input placeholder="admin@company.com" size="large" disabled={regLoading} />
            </Form.Item>
            <Form.Item
              label="Пароль администратора"
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Минимум 6 символов' },
              ]}
            >
              <Input.Password placeholder="Минимум 6 символов" size="large" disabled={regLoading} />
            </Form.Item>
            <Button
              type="primary"
              ghost
              htmlType="submit"
              loading={regLoading}
              disabled={regLoading}
              block
              size="large"
            >
              Создать администратора
            </Button>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Login;
