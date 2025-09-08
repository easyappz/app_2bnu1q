import React, { useMemo, useState } from 'react';
import { Layout, Menu, Typography, Button, theme } from 'antd';
import { DashboardOutlined, BarChartOutlined, CreditCardOutlined, TeamOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/stats')) return 'stats';
    if (location.pathname.startsWith('/payments')) return 'payments';
    if (location.pathname.startsWith('/subscribers')) return 'subscribers';
    if (location.pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  const items = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Панель' },
    { key: 'stats', icon: <BarChartOutlined />, label: 'Статистика' },
    { key: 'payments', icon: <CreditCardOutlined />, label: 'Платежи' },
    { key: 'subscribers', icon: <TeamOutlined />, label: 'Подписчики' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Настройки' },
  ];

  const onMenuClick = (e) => {
    navigate(`/${e.key}`);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="lg">
        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? 0 : '0 16px', color: '#fff', fontWeight: 700, fontSize: 16 }}>
          {collapsed ? 'EA' : 'Easyappz Admin'}
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={items} onClick={onMenuClick} />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, borderBottom: `1px solid ${colorBorderSecondary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
          <Typography.Title level={4} style={{ margin: 0 }}>Админ-панель</Typography.Title>
          <Button icon={<LogoutOutlined />} onClick={onLogout}>Выйти</Button>
        </Header>
        <Content style={{ margin: 16 }}>
          <div style={{ background: colorBgContainer, padding: 16, borderRadius: 10, minHeight: 'calc(100vh - 56px - 32px)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
