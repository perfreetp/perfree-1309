import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import ShowCard from '@/components/ShowCard';
import { shows, showCategories } from '@/data/shows';
import { useAppStore } from '@/store/useAppStore';

const ShowPage: React.FC = () => {
  const { favorites, toggleFavorite } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'favorite'>('all');

  const filteredShows = useMemo(() => {
    let result = shows;
    if (activeCategory !== 'all') {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (viewMode === 'favorite') {
      result = result.filter((s) => favorites.includes(s.id));
    }
    return result;
  }, [activeCategory, viewMode, favorites]);

  const handleFavorite = (id: string) => {
    toggleFavorite(id);
    const isAdding = !favorites.includes(id);
    Taro.showToast({
      title: isAdding ? '已收藏' : '已取消收藏',
      icon: 'none',
    });
    console.log('[Show] 收藏演出:', id, isAdding);
  };

  const handleSetReminder = (showId: string) => {
    console.log('[Show] 设置提醒:', showId);
    Taro.showToast({ title: '提醒已开启', icon: 'success' });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <ScrollView scrollX className={styles.categoryTabs}>
        {showCategories.map((cat) => (
          <View
            key={cat.id}
            className={classNames(styles.categoryTab, activeCategory === cat.id && styles.active)}
            onClick={() => setActiveCategory(cat.id)}
          >
            <Text>{cat.name}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <View className={styles.dateSection}>
          <Text className={styles.dateText}>今日演出</Text>
          <View style={{ display: 'flex', gap: '16rpx' }}>
            <Text
              className={classNames(
                styles.reminderTip,
                viewMode === 'all' && styles.activeTab
              )}
              style={{
                padding: '8rpx 20rpx',
                borderRadius: '32rpx',
                background: viewMode === 'all' ? 'rgba(200,16,46,0.1)' : 'transparent',
                color: viewMode === 'all' ? '#C8102E' : '#86909C',
              }}
              onClick={() => setViewMode('all')}
            >
              全部
            </Text>
            <Text
              className={classNames(
                styles.reminderTip,
                viewMode === 'favorite' && styles.activeTab
              )}
              style={{
                padding: '8rpx 20rpx',
                borderRadius: '32rpx',
                background: viewMode === 'favorite' ? 'rgba(200,16,46,0.1)' : 'transparent',
                color: viewMode === 'favorite' ? '#C8102E' : '#86909C',
              }}
              onClick={() => setViewMode('favorite')}
            >
              ❤️ 我的收藏 ({favorites.length})
            </Text>
          </View>
        </View>

        {filteredShows.length > 0 ? (
          <View className={styles.showList}>
            {filteredShows.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                isFavorite={favorites.includes(show.id)}
                onFavorite={() => handleFavorite(show.id)}
              />
            ))}
          </View>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🎭</Text>
            <Text className={styles.emptyText}>
              {viewMode === 'favorite' ? '暂无收藏的演出' : '暂无演出信息'}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default ShowPage;
