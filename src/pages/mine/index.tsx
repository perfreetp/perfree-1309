import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useAppStore, TicketInfo } from '@/store/useAppStore';

const ticketOptions: Array<{ type: string; price: number; desc: string }> = [
  { type: '成人票', price: 120, desc: '全价票，当日有效' },
  { type: '儿童票', price: 60, desc: '1.2-1.4米儿童，当日有效' },
  { type: '老人票', price: 0, desc: '60岁以上免票，需凭身份证' },
];

const MinePage: React.FC = () => {
  const { favorites, parkingRecord, ticket, setTicket, reviews } = useAppStore();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [bindCode, setBindCode] = useState('');
  const [showQr, setShowQr] = useState(false);

  const handleBuy = (opt: typeof ticketOptions[0]) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const code = `WSS${dateStr.replace(/\./g, '')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const info: TicketInfo = {
      type: opt.type,
      price: opt.price,
      validDate: `${dateStr} 当日有效`,
      code,
      bound: false,
    };
    setTicket(info);
    setShowBuyModal(false);
    console.log('[Mine] 购买门票:', info);
    Taro.showToast({ title: '购票成功', icon: 'success' });
  };

  const handleBind = () => {
    Taro.showModal({
      title: '绑定门票',
      content: '请输入票面编号',
      editable: true,
      placeholderText: '如：WSS20260612001',
      success: (res) => {
        if (res.confirm && res.content) {
          const now = new Date();
          const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
          const info: TicketInfo = {
            type: '已绑定门票',
            price: 0,
            validDate: `${dateStr} 当日有效`,
            code: res.content.trim(),
            bound: true,
          };
          setTicket(info);
          console.log('[Mine] 绑定门票:', info);
          Taro.showToast({ title: '绑定成功', icon: 'success' });
        }
      },
    });
  };

  const handleShowQr = () => {
    if (!ticket) return;
    setShowQr(!showQr);
  };

  const handleRemoveTicket = () => {
    Taro.showModal({
      title: '提示',
      content: '确认删除当前门票？',
      success: (res) => {
        if (res.confirm) {
          setTicket(null);
          setShowQr(false);
          console.log('[Mine] 删除门票');
        }
      },
    });
  };

  const menuItems = [
    { icon: '🅿️', name: '停车记录', path: '/pages/squad/index', badge: parkingRecord ? '已停车' : '' },
    { icon: '❤️', name: '我的收藏', path: '', badge: String(favorites.length) },
    { icon: '👥', name: '亲友同行', path: '/pages/squad/index' },
    { icon: '📝', name: '我的评价', path: '', badge: String(reviews.length) },
    { icon: '🎫', name: '购票记录', path: '' },
  ];

  const serviceItems = [
    { icon: '🛟', name: '服务求助', path: '/pages/service/index' },
    { icon: '🔔', name: '消息通知', path: '' },
    { icon: '⚙️', name: '设置', path: '' },
    { icon: '💬', name: '意见反馈', path: '' },
  ];

  const handleMenuClick = (path: string) => {
    console.log('[Mine] 点击菜单项:', path);
    if (path) {
      Taro.navigateTo({ url: path });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>👤</Text>
          </View>
          <View className={styles.userText}>
            <Text className={styles.username}>游客朋友</Text>
            <Text className={styles.userDesc}>欢迎来到万岁山武侠城</Text>
          </View>
          <View className={styles.vipBadge}>
            <Text>{ticket ? '已购票' : '游客'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.ticketCard}>
          <View className={styles.ticketHeader}>
            <Text className={styles.ticketTitle}>我的门票</Text>
            {ticket && <Text className={styles.ticketStatus}>✓ {ticket.bound ? '已绑定' : '已购票'}</Text>}
          </View>

          {ticket ? (
            <>
              <View className={styles.ticketInfo}>
                <View className={styles.qrCode} onClick={handleShowQr}>
                  {showQr ? <Text className={styles.qrText}>二维码</Text> : <Text className={styles.qrIcon}>📱</Text>}
                </View>
                <View className={styles.ticketDetails}>
                  <Text className={styles.ticketType}>{ticket.type}</Text>
                  <Text className={styles.ticketTime}>有效期：{ticket.validDate}</Text>
                  <Text className={styles.ticketCode}>票号：{ticket.code}</Text>
                  {ticket.price > 0 && <Text className={styles.ticketPrice}>￥{ticket.price}</Text>}
                </View>
              </View>

              {showQr && (
                <View className={styles.qrFullWrap}>
                  <View className={styles.qrFullBox}>
                    <Text className={styles.qrFullIcon}>📱</Text>
                    <Text className={styles.qrFullLabel}>入园二维码</Text>
                    <Text className={styles.qrFullCode}>{ticket.code}</Text>
                  </View>
                </View>
              )}

              <View className={styles.ticketFooter}>
                <Text className={styles.ticketRemove} onClick={handleRemoveTicket}>删除门票</Text>
                <View className={styles.showQrBtn} onClick={handleShowQr}>
                  <Text>{showQr ? '收起二维码' : '出示二维码'}</Text>
                </View>
              </View>
            </>
          ) : (
            <>
              <View className={styles.noTicket}>
                <Text className={styles.noTicketIcon}>🎫</Text>
                <Text className={styles.noTicketText}>暂无门票，请购买或绑定</Text>
              </View>
              <View className={styles.ticketFooter}>
                <View className={styles.bindBtn} onClick={handleBind}>
                  <Text>🔗 绑定门票</Text>
                </View>
                <View className={styles.showQrBtn} onClick={() => setShowBuyModal(true)}>
                  <Text>🎫 购买门票</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {showBuyModal && (
          <View className={styles.buyModal}>
            <View className={styles.buyContent}>
              <Text className={styles.buyTitle}>选择票种</Text>
              {ticketOptions.map((opt) => (
                <View key={opt.type} className={styles.buyItem} onClick={() => handleBuy(opt)}>
                  <View className={styles.buyInfo}>
                    <Text className={styles.buyType}>{opt.type}</Text>
                    <Text className={styles.buyDesc}>{opt.desc}</Text>
                  </View>
                  <Text className={styles.buyPrice}>{opt.price === 0 ? '免费' : `￥${opt.price}`}</Text>
                </View>
              ))}
              <View className={styles.buyClose} onClick={() => setShowBuyModal(false)}>
                <Text>取消</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.statsCard}>
          <Text className={styles.statsTitle}>📊 游玩数据</Text>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{favorites.length}</Text>
              <Text className={styles.statLabel}>收藏</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>2</Text>
              <Text className={styles.statLabel}>已看演出</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>3</Text>
              <Text className={styles.statLabel}>游玩景点</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{reviews.length}</Text>
              <Text className={styles.statLabel}>评价</Text>
            </View>
          </View>
        </View>

        <View className={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <View key={idx} className={styles.menuItem} onClick={() => handleMenuClick(item.path)}>
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.name}</Text>
              {item.badge && <Text className={styles.menuBadge}>{item.badge}</Text>}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.menuCard}>
          {serviceItems.map((item, idx) => (
            <View key={idx} className={styles.menuItem} onClick={() => handleMenuClick(item.path)}>
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.name}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
