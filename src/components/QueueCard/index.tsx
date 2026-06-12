import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { QueueItem } from '@/types';
import classNames from 'classnames';

interface QueueCardProps {
  item: QueueItem;
}

const QueueCard: React.FC<QueueCardProps> = ({ item }) => {
  const getStatusInfo = () => {
    switch (item.status) {
      case 'crowded':
        return { text: '拥挤', color: '#F53F3F', bg: 'rgba(245, 63, 63, 0.1)' };
      case 'busy':
        return { text: '繁忙', color: '#FF7D00', bg: 'rgba(255, 125, 0, 0.1)' };
      default:
        return { text: '畅通', color: '#00B42A', bg: 'rgba(0, 180, 42, 0.1)' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View className={styles.card}>
      <Image className={styles.image} src={item.image} mode="aspectFill" />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{item.name}</Text>
          <View
            className={styles.status}
            style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
          >
            {statusInfo.text}
          </View>
        </View>
        <View className={styles.waitInfo}>
          <Text className={styles.waitLabel}>预计等待</Text>
          <View className={styles.waitTime}>
            <Text className={styles.timeNum}>{item.waitTime}</Text>
            <Text className={styles.timeUnit}>分钟</Text>
          </View>
        </View>
        <View className={styles.category}>
          <Text className={styles.catText}>{item.category}</Text>
        </View>
      </View>
    </View>
  );
};

export default QueueCard;
