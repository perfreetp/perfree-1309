import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { shows } from '@/data/shows';
import { useAppStore } from '@/store/useAppStore';

const ShowDetailPage: React.FC = () => {
  const router = useRouter();
  const { favorites, toggleFavorite } = useAppStore();
  const [show, setShow] = useState(shows[0]);
  const [reminders, setReminders] = useState<string[]>([]);

  useEffect(() => {
    const id = router.params.id;
    if (id) {
      const found = shows.find((s) => s.id === id);
      if (found) {
        setShow(found);
        Taro.setNavigationBarTitle({ title: found.name });
      }
    }
  }, [router.params.id]);

  const isFavorite = favorites.includes(show.id);

  const reviews = [
    { id: '1', name: '戏剧爱好者', rating: 5, content: '太震撼了！舞美和灯光效果一流，演员表演非常专业，强烈推荐！', date: '2026-06-10' },
    { id: '2', name: '家庭出游', rating: 4, content: '孩子很喜欢，就是位置有点偏，建议提前到场。', date: '2026-06-08' },
  ];

  const handleFavorite = () => {
    toggleFavorite(show.id);
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '收藏成功',
      icon: 'none',
    });
    console.log('[ShowDetail] 收藏演出:', show.id, !isFavorite);
  };

  const handleSetReminder = (time: string) => {
    const key = `${show.id}_${time}`;
    if (reminders.includes(key)) {
      setReminders(reminders.filter((r) => r !== key));
      Taro.showToast({ title: '已取消提醒', icon: 'none' });
    } else {
      setReminders([...reminders, key]);
      Taro.showToast({ title: '提醒已开启', icon: 'success' });
    }
    console.log('[ShowDetail] 设置提醒:', key);
  };

  const handleBuyTicket = () => {
    console.log('[ShowDetail] 购买演出票');
    Taro.showToast({ title: '购票功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.headerImage}>
        <Image className={styles.headerBg} src={show.image} mode="aspectFill" />
        <View className={styles.headerOverlay}>
          <Text className={styles.showTitle}>{show.name}</Text>
          <Text className={styles.showSubtitle}>
            {show.category} · {show.duration}分钟 · {show.times.length}场
          </Text>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.infoCard}>
            <Text className={styles.infoTitle}>
              <Text>🕐</Text>
              <Text>演出时间</Text>
            </Text>
            <View className={styles.timesList}>
              {show.times.map((time, idx) => {
                const key = `${show.id}_${time}`;
                const hasReminder = reminders.includes(key);
                return (
                  <View
                    key={idx}
                    className={classNames(styles.timeItem, hasReminder && styles.upcoming)}
                    onClick={() => handleSetReminder(time)}
                  >
                    <Text>{time}</Text>
                    {hasReminder && <Text className={styles.reminderBadge}>🔔 已提醒</Text>}
                  </View>
                );
              })}
            </View>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.infoTitle}>
              <Text>ℹ️</Text>
              <Text>演出信息</Text>
            </Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>演出地点</Text>
              <Text className={styles.infoValue}>{show.venue}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>演出时长</Text>
              <Text className={styles.infoValue}>{show.duration}分钟</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>评分</Text>
              <Text className={styles.infoValue}>⭐ {show.rating} 分</Text>
            </View>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.infoTitle}>
              <Text>📖</Text>
              <Text>演出介绍</Text>
            </Text>
            <Text className={styles.descText}>{show.description}</Text>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.infoTitle}>
              <Text>💬</Text>
              <Text>观众评价</Text>
            </Text>
            {reviews.map((review) => (
              <View key={review.id} className={styles.reviewItem}>
                <View className={styles.reviewHeader}>
                  <View className={styles.reviewAvatar}>
                    <Text>👤</Text>
                  </View>
                  <View className={styles.reviewUser}>
                    <Text className={styles.reviewName}>{review.name}</Text>
                    <Text className={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <Text className={styles.reviewRating}>⭐ {review.rating}</Text>
                </View>
                <Text className={styles.reviewContent}>{review.content}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={`${styles.bottomBtn} ${styles.btnFavorite}`}
          onClick={handleFavorite}
        >
          <Text>{isFavorite ? '❤️' : '🤍'}</Text>
        </View>
        <View className={`${styles.bottomBtn} ${styles.btnPrimary}`} onClick={handleBuyTicket}>
          <Text>🎫 立即预订</Text>
        </View>
      </View>
    </View>
  );
};

export default ShowDetailPage;
