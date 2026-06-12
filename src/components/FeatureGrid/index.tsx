import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

interface FeatureItem {
  icon: string;
  name: string;
  path?: string;
  onClick?: () => void;
}

interface FeatureGridProps {
  items: FeatureItem[];
  columns?: number;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ items, columns = 4 }) => {
  const handleClick = (item: FeatureItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.path) {
      Taro.navigateTo({ url: item.path });
    }
  };

  return (
    <View className={styles.grid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {items.map((item, index) => (
        <View key={index} className={styles.item} onClick={() => handleClick(item)}>
          <View className={styles.iconWrap}>
            <Text className={styles.icon}>{item.icon}</Text>
          </View>
          <Text className={styles.name}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
};

export default FeatureGrid;
