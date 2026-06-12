import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import { FoodShop } from '@/types';

interface FoodCardProps {
  shop: FoodShop;
  onClick?: () => void;
}

const FoodCard: React.FC<FoodCardProps> = ({ shop, onClick }) => {
  return (
    <View className={styles.card} onClick={onClick}>
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
