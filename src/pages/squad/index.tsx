import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useAppStore } from '@/store/useAppStore';

const SquadPage: React.FC = () => {
  const { squadMembers, parkingRecord, setParkingRecord } = useAppStore();
  const [showParking, setShowParking] = useState(false);

  const handleInvite = () => {
    console.log('[Squad] 邀请成员');
    Taro.showModal({
      title: '邀请亲友',
      content: '小队编号：WSS-20260612-001\n分享给好友加入小队',
      confirmText: '复制编号',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({ data: 'WSS-20260612-001' });
          Taro.showToast({ title: '已复制', icon: 'success' });
        }
      },
    });
  };

  const handleShareLocation = () => {
    console.log('[Squad] 共享位置');
    Taro.showToast({ title: '位置共享已开启', icon: 'success' });
  };

  const handleRecordParking = () => {
    if (parkingRecord) {
      Taro.showModal({
        title: '停车记录',
        content: `区域：${parkingRecord.area}\n车位：${parkingRecord.spotNumber}`,
        confirmText: '清除记录',
        success: (res) => {
          if (res.confirm) {
            setParkingRecord(null);
            Taro.showToast({ title: '已清除', icon: 'none' });
          }
        },
      });
    } else {
      Taro.showActionSheet({
        itemList: ['A区', 'B区', 'C区', 'D区'],
        success: (res) => {
          const areas = ['A区', 'B区', 'C区', 'D区'];
          const area = areas[res.tapIndex];
          const spot = `${['A', 'B', 'C', 'D'][res.tapIndex]}${String(Math.floor(Math.random() * 200 + 1)).padStart(3, '0')}`;
          setParkingRecord({
            area,
            spotNumber: spot,
            enterTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          });
          Taro.showToast({ title: '已记录停车位', icon: 'success' });
          console.log('[Squad] 记录停车:', area, spot);
        },
      });
    }
  };

  const handleFindCar = () => {
    console.log('[Squad] 找车');
    Taro.showToast({ title: '正在导航至停车场...', icon: 'none' });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.squadCard}>
        <Text className={styles.squadTitle}>👥 我的小队</Text>
        <Text className={styles.squadCode}>小队编号：WSS-20260612-001</Text>
        <View className={styles.squadMembers}>
          {squadMembers.map((member) => (
            <View
              key={member.id}
              className={classNames(styles.memberAvatar, member.isOnline && styles.online)}
            >
              <Text>👤</Text>
            </View>
          ))}
          <View className={styles.addMember} onClick={handleInvite}>
            <Text>+</Text>
          </View>
        </View>
      </View>

      <View className={styles.squadActions}>
        <View className={styles.actionBtn} onClick={handleShareLocation}>
          <Text>📍</Text>
          <Text>共享位置</Text>
        </View>
        <View className={styles.actionBtn} onClick={handleInvite}>
          <Text>📨</Text>
          <Text>邀请亲友</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>小队成员</Text>
          <Text style={{ fontSize: 24, color: '#86909C' }}>共{squadMembers.length}人</Text>
        </View>
        <View className={styles.memberList}>
          {squadMembers.map((member) => (
            <View key={member.id} className={styles.memberItem}>
              <View className={classNames(styles.memberAvatar, member.isOnline && styles.online)}>
                <Text>👤</Text>
              </View>
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>{member.name}</Text>
                <View className={styles.memberStatus}>
                  <View
                    className={classNames(
                      styles.statusDot,
                      member.isOnline ? styles.online : styles.offline
                    )}
                  />
                  <Text>{member.isOnline ? '在线' : '离线'}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 24, color: '#C8102E' }}>
                {member.isOnline ? '距离约50m' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.parkingSection}>
        <Text className={styles.parkingTitle}>
          <Text>🅿️</Text>
          <Text>停车记录</Text>
        </Text>
        {parkingRecord ? (
          <>
            <View className={styles.parkingInfo}>
              <View className={styles.parkingIcon}>
                <Text>🚗</Text>
              </View>
              <View className={styles.parkingDetails}>
                <Text className={styles.parkingSpot}>
                  {parkingRecord.area} · {parkingRecord.spotNumber}
                </Text>
                <Text className={styles.parkingTime}>入场时间：{parkingRecord.enterTime}</Text>
                <Text className={styles.parkingCar}>已停约 2小时30分</Text>
              </View>
            </View>
            <View className={styles.recordBtn} onClick={handleFindCar}>
              <Text>🧭 导航找车</Text>
            </View>
          </>
        ) : (
          <>
            <View className={styles.noParking}>
              <Text>暂无停车记录</Text>
            </View>
            <View className={styles.recordBtn} onClick={handleRecordParking}>
              <Text>📝 记录停车位</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SquadPage;
