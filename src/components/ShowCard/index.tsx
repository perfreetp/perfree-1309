import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Show } from '@/types';
import classNames from 'classnames';

interface ShowCardProps {
  show: Show;
  isFavorite?: boolean;
  onFavorite?: () => void;
}

const ShowCard: React.FC<ShowCardProps> = ({ show, isFavorite, onFavorite }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/show-detail/index?id=${show.id}`,
    });
  };

  const handleFavorite = (e: any) => {
    e.stopPropagation();
    onFavorite?.();
  };

  const getStatusText = () => {
    if (show.times.length === 0) return '暂无场次';
    return `今日 ${show.times.length} 场`;
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image className={styles.image} src={show.image} mode="aspectFill" />
        <View className={styles.category}>{show.category}</View>
        {onFavorite && (
          <View
            className={classNames(styles.favorite, isFavorite && styles.active)}
            onClick={handleFavorite}
          >
            <Text>{isFavorite ? '❤️' : '🤍'}</Text>
          </View>
        )}
      </View>
      <View className={styles.content}>
        <Text className={styles.name}>{show.name}</Text>
        <View className={styles.info}>
          <Text className={styles.venue}>📍 {show.venue}</Text>
          <Text className={styles.duration}>⏱ {show.duration}分钟</Text>
        </View>
        <View className={styles.bottom}>
          <Text className={styles.times}>{getStatusText()}</Text>
          <View className={styles.rating}>
            <Text className={styles.star}>⭐</Text>
            <Text className={styles.ratingText}>{show.rating}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ShowCard;
