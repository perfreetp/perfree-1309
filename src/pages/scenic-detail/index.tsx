import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { scenicSpots } from '@/data/scenic';
import { useAppStore } from '@/store/useAppStore';
import { Review, ItineraryItem } from '@/types';
import classNames from 'classnames';

const defaultReviews = [
  { id: '1', name: '小明', rating: 5, content: '非常震撼的演出，值得一看！强烈推荐大家来体验。', date: '2026-06-10' },
  { id: '2', name: '旅行者', rating: 4, content: '场景很逼真，演员表演也很到位，就是人有点多。', date: '2026-06-08' },
];

const ScenicDetailPage: React.FC = () => {
  const router = useRouter();
  const [spot, setSpot] = useState(scenicSpots[0]);
  const { reviews, addReview, addItineraryItem, itinerary } = useAppStore();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planTime, setPlanTime] = useState('10:00');

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

  const spotReviews = useMemo(() => {
    return reviews.filter((r) => r.targetId === spot.id && r.targetType === 'scenic');
  }, [reviews, spot.id]);

  const allReviews = [...spotReviews, ...defaultReviews];

  const handleNavigate = () => {
    console.log('[ScenicDetail] 导航');
    Taro.showToast({ title: '正在打开地图导航...', icon: 'none' });
  };

  const inItinerary = useMemo(() => {
    return itinerary.some((i) => i.targetId === spot.id && i.type === 'scenic');
  }, [itinerary, spot.id]);

  const handleAddItinerary = () => {
    if (inItinerary) {
      Taro.showToast({ title: '已在行程中', icon: 'none' });
      return;
    }
    setShowPlanModal(true);
  };

  const handleConfirmPlan = () => {
    const duration = parseInt(spot.duration.replace(/[^0-9]/g, ''), 10) || 60;
    const newItem: ItineraryItem = {
      id: `it_${Date.now()}`,
      type: 'scenic',
      targetId: spot.id,
      name: spot.name,
      image: spot.image,
      plannedTime: planTime,
      duration,
      walkTime: '约5分钟',
      memberIds: ['1'],
    };
    addItineraryItem(newItem);
    setShowPlanModal(false);
    Taro.showToast({ title: '已加入行程', icon: 'success' });
  };

  const handleSubmitReview = () => {
    if (!reviewContent.trim()) {
      Taro.showToast({ title: '请输入评价内容', icon: 'none' });
      return;
    }
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const newReview: Review = {
      id: `r_${Date.now()}`,
      targetId: spot.id,
      targetType: 'scenic',
      targetName: spot.name,
      rating: reviewRating,
      content: reviewContent.trim(),
      date: dateStr,
      userName: '我',
      mine: true,
    };
    addReview(newReview);
    setReviewContent('');
    setReviewRating(5);
    setShowReviewForm(false);
    Taro.showToast({ title: '评价成功', icon: 'success' });
    console.log('[ScenicDetail] 提交评价:', newReview);
  };

  const renderStars = (current: number, interactive: boolean = false) => {
    return (
      <View className={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            className={classNames(styles.star, star <= current && styles.starActive)}
            onClick={() => interactive && setReviewRating(star)}
          >
            {star <= current ? '⭐' : '☆'}
          </Text>
        ))}
      </View>
    );
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
              <Text className={styles.reviewCount}>({allReviews.length})</Text>
            </Text>
            <View className={styles.reviewList}>
              {allReviews.map((review) => (
                <View key={review.id} className={styles.reviewItem}>
                  <View className={styles.reviewHeader}>
                    <View className={styles.reviewAvatar}>
                      <Text>👤</Text>
                    </View>
                    <View className={styles.reviewUser}>
                      <Text className={styles.reviewName}>{review.name || review.userName}</Text>
                      <Text className={styles.reviewDate}>{review.date}</Text>
                    </View>
                    <Text className={styles.reviewRating}>⭐ {review.rating}</Text>
                  </View>
                  <Text className={styles.reviewContent}>{review.content}</Text>
                </View>
              ))}
            </View>
          </View>

          {showReviewForm && (
            <View className={styles.reviewForm}>
              <Text className={styles.reviewFormTitle}>📝 写评价</Text>
              <View className={styles.ratingSelect}>
                <Text className={styles.ratingLabel}>评分：</Text>
                {renderStars(reviewRating, true)}
              </View>
              <Input
                className={styles.reviewInput}
                placeholder="分享你的游玩体验..."
                value={reviewContent}
                onInput={(e) => setReviewContent(e.detail.value)}
              />
              <View className={styles.reviewFormActions}>
                <View className={styles.reviewCancelBtn} onClick={() => setShowReviewForm(false)}>
                  <Text>取消</Text>
                </View>
                <View className={styles.reviewSubmitBtn} onClick={handleSubmitReview}>
                  <Text>提交评价</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={`${styles.bottomBtn} ${styles.btnSecondary}`}
          onClick={() => setShowReviewForm(true)}
        >
          <Text>📝 写评价</Text>
        </View>
        <View
          className={`${styles.bottomBtn} ${styles.btnPlan} ${inItinerary ? styles.btnPlanActive : ''}`}
          onClick={handleAddItinerary}
        >
          <Text>{inItinerary ? '✅ 已加入' : '📅 加入行程'}</Text>
        </View>
        <View
          className={`${styles.bottomBtn} ${styles.btnPrimary}`}
          onClick={handleNavigate}
        >
          <Text>🧭 导航前往</Text>
        </View>
      </View>

      {showPlanModal && (
        <View className={styles.modalMask} onClick={() => setShowPlanModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>加入今日行程</Text>
            <Text className={styles.modalSub}>{spot.name}</Text>

            <View className={styles.modalSection}>
              <Text className={styles.modalLabel}>计划到达时间</Text>
              <View className={styles.timeChips}>
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '19:00', '20:00'].map((t) => (
                  <View
                    key={t}
                    className={`${styles.timeChip} ${planTime === t ? styles.timeChipActive : ''}`}
                    onClick={() => setPlanTime(t)}
                  >
                    <Text>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>建议游玩时长</Text>
              <Text className={styles.modalValue}>{spot.duration}</Text>
            </View>

            <View className={styles.modalActions}>
              <View
                className={styles.modalCancelBtn}
                onClick={() => setShowPlanModal(false)}
              >
                <Text>取消</Text>
              </View>
              <View className={styles.modalConfirmBtn} onClick={handleConfirmPlan}>
                <Text>确认加入</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ScenicDetailPage;
