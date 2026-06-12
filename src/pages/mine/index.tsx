import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useAppStore';

const MinePage: React.FC = () => {
  const { favorites, parkingRecord } = useAppStore();

  const menuItems = [
    { icon: '🅿️', name: '停车记录', path: '', badge: parkingRecord ? '已停车' : '' },
    { icon: '❤️', name: '我的收藏', path: '', badge: String(favorites.length) },
    { icon: '👥', name: '亲友同行', path: '/pages/squad/index' },
    { icon: '📝', name: '我的评价', path: '' },
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

  const handleShowQrCode = () => {
    console.log('[Mine] 显示入园二维码');
    Taro.showModal({
      title: '入园二维码',
      content: '请将二维码对准闸机扫码入园',
      showCancel: false,
    });
  };

  const handleBindTicket = () => {
    console.log('[Mine] 绑定门票');
    Taro.showToast({ title: '门票绑定功能开发中', icon: 'none' });
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
            <Text>普通游客</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.ticketCard}>
          <View className={styles.ticketHeader}>
            <Text className={styles.ticketTitle}>我的门票</Text>
            <Text className={styles.ticketStatus}>✓ 已购票</Text>
          </View>
          <View className={styles.ticketInfo}>
            <View className={styles.qrCode}>
              <Text>📱</Text>
            </View>
            <View className={styles.ticketDetails}>
              <Text className={styles.ticketType}>成人票 - 全价票</Text>
              <Text className={styles.ticketTime}>有效期：2026.06.12 当日有效</Text>
              <Text className={styles.ticketCode}>票号：WSS20260612001</Text>
            </View>
          </View>
          <View className={styles.ticketFooter}>
            <Text className={styles.ticketTip}>凭二维码可直接入园</Text>
            <View className={styles.showQrBtn} onClick={handleShowQrCode}>
              <Text>出示二维码</Text>
            </View>
          </View>
        </View>

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
              <Text className={styles.statNum}>0</Text>
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
