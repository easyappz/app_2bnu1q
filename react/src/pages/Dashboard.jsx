import React from 'react';
import { Card, Col, Row, Skeleton, Statistic, Typography, Button, Space } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { summary } from '../api/stats';
import { formatCurrency } from '../utils/format';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const qDay = useQuery({ queryKey: ['stats-summary', 'day'], queryFn: () => summary('day') });
  const qWeek = useQuery({ queryKey: ['stats-summary', 'week'], queryFn: () => summary('week') });
  const qMonth = useQuery({ queryKey: ['stats-summary', 'month'], queryFn: () => summary('month') });

  const renderCard = (title, q) => (
    <Card>
      {q.isLoading ? (
        <Skeleton active />
      ) : (
        <>
          <Statistic title={title} value={formatCurrency(q.data?.amountCents || 0, 'USD')} />
          <Typography.Text type="secondary">Платежей: {q.data?.count || 0}</Typography.Text>
        </>
      )}
    </Card>
  );

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>{renderCard('Сегодня', qDay)}</Col>
        <Col xs={24} md={8}>{renderCard('За неделю', qWeek)}</Col>
        <Col xs={24} md={8}>{renderCard('За месяц', qMonth)}</Col>
      </Row>
      <Card>
        <Typography.Title level={4} style={{ marginBottom: 16 }}>Быстрые действия</Typography.Title>
        <Space wrap>
          <Button type="primary" onClick={() => navigate('/stats')}>Открыть статистику</Button>
          <Button onClick={() => navigate('/payments')}>Список платежей</Button>
          <Button onClick={() => navigate('/subscribers')}>Список подписчиков</Button>
          <Button onClick={() => navigate('/settings')}>Настройки и интеграции</Button>
        </Space>
      </Card>
    </Space>
  );
};

export default Dashboard;
