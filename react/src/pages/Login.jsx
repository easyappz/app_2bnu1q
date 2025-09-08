import React, { useEffect, useState } from 'react';
import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login, registerAdmin } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

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

  const onRegisterAdmin = async (values) => {
    setRegLoading(true);
    try {
      const res = await registerAdmin(values);
      if (res?.ok) {
        message.success('Администратор создан. Теперь выполните вход.');
      } else {
        message.info('Заявка отправлена. Попробуйте выполнить вход.');
      }
    } catch (e) {
      message.error(e?.response?.data?.error || 'Ошибка при создании администратора');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f5ff 0%, #ffffff 100%)', padding: 16 }}>
      <Card style={{ width: 420 }} bordered>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Easyappz — Вход</Typography.Title>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: '', password: '' }}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }]}> 
            <Input type="email" placeholder="you@email.com" />
          </Form.Item>
          <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}> 
            <Input.Password placeholder="Введите пароль" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block style={{ marginTop: 8 }}>Войти</Button>
        </Form>
        <div style={{ marginTop: 16 }}>
          <Typography.Text type="secondary">Нет администратора?</Typography.Text>
          <Form layout="vertical" onFinish={onRegisterAdmin} style={{ marginTop: 8 }}>
            <Form.Item name="email" rules={[{ required: true, message: 'Введите email' }]}> 
              <Input placeholder="Email для администратора" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}> 
              <Input.Password placeholder="Пароль администратора" />
            </Form.Item>
            <Button loading={regLoading} block>Создать администратора</Button>
          </Form>
        </div>
      </Card>
    </div>
  );
};

export default Login;
