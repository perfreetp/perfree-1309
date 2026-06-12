import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { FoodShop } from '@/types';

interface FoodCardProps {
  shop: FoodShop;
}

const FoodCard: React.FC<FoodCardProps> = ({ shop }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/food/index?id=${shop.id}`,
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image className={styles.image} src={shop.image} mode="aspectFill" />
        {shop.hasCoupon && (
          <View className={styles.couponBadge}>
            <Text className={styles.couponText}>{shop.couponText}</Text>
          </View>
        )}
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{shop.name}</Text>
          <View className={styles.type}>
            <Text>{shop.type === 'restaurant' ? '🍽️' : '🛍️'}</Text>
          </View>
        </View>
        <Text className={styles.desc}>{shop.description}</Text>
        <View className={styles.footer}>
          <View className={styles.rating}>
            <Text className={styles.star}>⭐</Text>
            <Text className={styles.ratingText}>{shop.rating}</Text>
          </View>
          <Text className={styles.distance}>📍 {shop.distance}</Text>
        </View>
      </View>
    </View>
  );
};

export default FoodCard;
