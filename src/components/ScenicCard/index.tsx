import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { ScenicSpot } from '@/types';

interface ScenicCardProps {
  spot: ScenicSpot;
  layout?: 'horizontal' | 'vertical';
}

const ScenicCard: React.FC<ScenicCardProps> = ({ spot, layout = 'horizontal' }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/scenic-detail/index?id=${spot.id}`,
    });
  };

  if (layout === 'vertical') {
    return (
      <View className={styles.cardVertical} onClick={handleClick}>
        <View className={styles.imageWrapVertical}>
          <Image className={styles.image} src={spot.image} mode="aspectFill" />
          <View className={styles.category}>{spot.category}</View>
        </View>
        <View className={styles.contentVertical}>
          <Text className={styles.name}>{spot.name}</Text>
          <Text className={styles.desc}>{spot.description}</Text>
          <View className={styles.tags}>
            {spot.tags.slice(0, 2).map((tag, idx) => (
              <Text key={idx} className={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image className={styles.imageH} src={spot.image} mode="aspectFill" />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{spot.name}</Text>
          <View className={styles.rating}>
            <Text className={styles.star}>⭐</Text>
            <Text className={styles.ratingText}>{spot.rating}</Text>
          </View>
        </View>
        <Text className={styles.desc}>{spot.description}</Text>
        <View className={styles.meta}>
          <Text className={styles.metaItem}>⏱ {spot.duration}</Text>
          <Text className={styles.metaItem}>🕐 {spot.openTime}</Text>
        </View>
      </View>
    </View>
  );
};

export default ScenicCard;
