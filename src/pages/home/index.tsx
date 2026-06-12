import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import FeatureGrid from '@/components/FeatureGrid';
import SectionHeader from '@/components/SectionHeader';
import ShowCard from '@/components/ShowCard';
import { routes, scenicSpots } from '@/data/scenic';
import { shows } from '@/data/shows';
import { useAppStore } from '@/store/useAppStore';

const HomePage: React.FC = () => {
  const { favorites, toggleFavorite } = useAppStore();
  const [todayDate] = useState(() => {
    const now = new Date();
    return `${now.getMonth() + 1}月${now.getDate()}日`;
  });

  const featureItems = [
    { icon: '🎫', name: '我的门票', path: '/pages/mine/index', isTab: true },
    { icon: '🗺️', name: '地图导览', path: '/pages/map/index', isTab: true },
    { icon: '🎭', name: '演出日程', path: '/pages/show/index', isTab: true },
    { icon: '⏱️', name: '排队提醒', path: '/pages/queue/index', isTab: true },
    { icon: '🍜', name: '餐饮购物', path: '/pages/food/index' },
    { icon: '👥', name: '亲友同行', path: '/pages/squad/index' },
    { icon: '🛟', name: '服务求助', path: '/pages/service/index' },
    { icon: '🅿️', name: '停车记录', path: '/pages/squad/index' },
  ];

  const hotShows = shows.slice(0, 3);

  const handleRouteClick = (routeId: string) => {
    console.log('[Home] 点击路线:', routeId);
    Taro.showToast({ title: '路线规划中...', icon: 'none' });
  };

  const handleShowTicket = () => {
    console.log('[Home] 点击门票');
    Taro.switchTab({ url: '/pages/mine/index' });
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.title}>万岁山·武侠城</Text>
            <Text className={styles.subtitle}>{todayDate} · 欢迎游玩</Text>
          </View>
          <View className={styles.weather}>
            <Text className={styles.weatherIcon}>☀️</Text>
            <Text className={styles.weatherText}>28°C</Text>
          </View>
        </View>

        <View className={styles.timeCard}>
          <View className={styles.timeInfo}>
            <Text className={styles.timeIcon}>🕐</Text>
            <View className={styles.timeText}>
              <Text className={styles.timeLabel}>今日开放时间</Text>
              <Text className={styles.timeValue}>08:00 - 18:00</Text>
            </View>
          </View>
          <View className={styles.ticketBtn} onClick={handleShowTicket}>
            <Text>🎫 我的门票</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.featureSection}>
          <FeatureGrid items={featureItems} columns={4} />
        </View>

        <View className={styles.routeSection}>
          <SectionHeader
            title="推荐路线"
            subtitle="精选游玩路线"
            extra={<Text className={styles.sectionMore}>查看全部 →</Text>}
          />
          <ScrollView scrollX className={styles.routeList}>
            {routes.map((route) => (
              <View
                key={route.id}
                className={styles.routeCard}
                onClick={() => handleRouteClick(route.id)}
              >
                <Image
                  className={styles.routeImage}
                  src={scenicSpots[0]?.image || 'https://picsum.photos/id/1036/600/300'}
                  mode="aspectFill"
                />
                <View className={styles.routeContent}>
                  <Text className={styles.routeName}>{route.name}</Text>
                  <Text className={styles.routeDesc}>{route.description}</Text>
                  <View className={styles.routeMeta}>
                    <View className={styles.routeTags}>
                      {route.tags.slice(0, 2).map((tag, idx) => (
                        <Text key={idx} className={styles.routeTag}>
                          {tag}
                        </Text>
                      ))}
                    </View>
                    <Text className={styles.routeDistance}>{route.duration}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.showSection}>
          <SectionHeader
            title="热门演出"
            subtitle="今日必看"
            extra={<Text className={styles.sectionMore}>更多 →</Text>}
          />
          <View className={styles.showList}>
            {hotShows.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                isFavorite={favorites.includes(show.id)}
                onFavorite={() => toggleFavorite(show.id)}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
