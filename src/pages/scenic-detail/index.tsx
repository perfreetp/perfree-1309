import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { scenicSpots } from '@/data/scenic';

const ScenicDetailPage: React.FC = () => {
  const router = useRouter();
  const [spot, setSpot] = useState(scenicSpots[0]);

  useEffect(() => {
    const id = router.params.id;
    if (id) {
      const found = scenicSpots.find((s) => s.id === id);
      if (found) {
        setSpot(found);
        Taro.setNavigationBarTitle({ title: found.name });
      }
    }
  }, [router.params.id]);

  const reviews = [
    { id: '1', name: '小明', rating: 5, content: '非常震撼的演出，值得一看！强烈推荐大家来体验。', date: '2026-06-10' },
    { id: '2', name: '旅行者', rating: 4, content: '场景很逼真，演员表演也很到位，就是人有点多。', date: '2026-06-08' },
  ];

  const handleNavigate = () => {
    console.log('[ScenicDetail] 导航');
    Taro.showToast({ title: '正在打开地图导航...', icon: 'none' });
  };

  const handleReview = () => {
    console.log('[ScenicDetail] 评价');
    Taro.showToast({ title: '评价功能开发中', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <Image className={styles.headerImage} src={spot.image} mode="aspectFill" />

      <ScrollView scrollY>
        <View className={styles.content}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{spot.name}</Text>
            <View className={styles.rating}>
              <Text className={styles.ratingStar}>⭐</Text>
              <Text className={styles.ratingNum}>{spot.rating}</Text>
              <Text className={styles.ratingCount}>({spot.reviewCount}条评价)</Text>
            </View>
          </View>

          <View className={styles.tags}>
            {spot.tags.map((tag, idx) => (
              <Text key={idx} className={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.infoTitle}>
              <Text>ℹ️</Text>
              <Text>基本信息</Text>
            </Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>开放时间</Text>
              <Text className={styles.infoValue}>{spot.openTime}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>建议游玩</Text>
              <Text className={styles.infoValue}>{spot.duration}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>景点类型</Text>
              <Text className={styles.infoValue}>{spot.category}</Text>
            </View>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.infoTitle}>
              <Text>📖</Text>
              <Text>景点介绍</Text>
            </Text>
            <Text className={styles.descText}>{spot.description}</Text>
          </View>

          <View className={styles.infoCard}>
            <Text className={styles.infoTitle}>
              <Text>💬</Text>
              <Text>游客评价</Text>
            </Text>
            <View className={styles.reviewList}>
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
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={`${styles.bottomBtn} ${styles.btnSecondary}`} onClick={handleReview}>
          <Text>📝 写评价</Text>
        </View>
        <View className={`${styles.bottomBtn} ${styles.btnPrimary}`} onClick={handleNavigate}>
          <Text>🧭 导航前往</Text>
        </View>
      </View>
    </View>
  );
};

export default ScenicDetailPage;
