import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import QueueCard from '@/components/QueueCard';
import { queueItems, queueTips } from '@/data/queue';

type FilterType = 'all' | 'scenic' | 'show';
type SortType = 'default' | 'timeAsc' | 'timeDesc';

const QueuePage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('default');

  const filteredItems = useMemo(() => {
    let result = [...queueItems];

    if (filter !== 'all') {
      result = result.filter((item) =>
        filter === 'scenic' ? item.category === '景点' : item.category === '演出'
      );
    }

    if (sort === 'timeAsc') {
      result.sort((a, b) => a.waitTime - b.waitTime);
    } else if (sort === 'timeDesc') {
      result.sort((a, b) => b.waitTime - a.waitTime);
    }

    return result;
  }, [filter, sort]);

  const stats = useMemo(() => {
    const total = queueItems.length;
    const normal = queueItems.filter((i) => i.status === 'normal').length;
    const avgWait = Math.round(
      queueItems.reduce((sum, i) => sum + i.waitTime, 0) / total
    );
    return { total, normal, avgWait };
  }, []);

  const handlePlanRoute = () => {
    console.log('[Queue] 错峰规划');
    Taro.showToast({ title: '智能规划中...', icon: 'loading' });
    setTimeout(() => {
      Taro.showToast({ title: '已生成错峰路线', icon: 'success' });
    }, 1500);
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.statsCard}>
        <Text className={styles.statsTitle}>📊 实时排队概况</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.total}</Text>
            <Text className={styles.statLabel}>开放项目</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.normal}</Text>
            <Text className={styles.statLabel}>畅通项目</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{stats.avgWait}</Text>
            <Text className={styles.statLabel}>平均等待(分)</Text>
          </View>
        </View>
      </View>

      <View className={styles.tipsSection}>
        <View className={styles.tipsHeader}>
          <Text className={styles.tipsIcon}>💡</Text>
          <Text className={styles.tipsTitle}>错峰小贴士</Text>
        </View>
        <View className={styles.tipsList}>
          {queueTips.slice(0, 3).map((tip, idx) => (
            <Text key={idx} className={styles.tipItem}>
              {tip}
            </Text>
          ))}
        </View>
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>排队列表</Text>
        <View className={styles.planBtn} onClick={handlePlanRoute}>
          <Text>🗺️ 错峰规划</Text>
        </View>
      </View>

      <View className={styles.filterBar}>
        <View
          className={classNames(styles.filterBtn, filter === 'all' && styles.active)}
          onClick={() => setFilter('all')}
        >
          全部
        </View>
        <View
          className={classNames(styles.filterBtn, filter === 'scenic' && styles.active)}
          onClick={() => setFilter('scenic')}
        >
          景点
        </View>
        <View
          className={classNames(styles.filterBtn, filter === 'show' && styles.active)}
          onClick={() => setFilter('show')}
        >
          演出
        </View>
        <View
          className={classNames(styles.filterBtn, sort === 'timeAsc' && styles.active)}
          onClick={() => setSort(sort === 'timeAsc' ? 'default' : 'timeAsc')}
        >
          等待↑
        </View>
      </View>

      <View className={styles.queueList}>
        {filteredItems.map((item) => (
          <QueueCard key={item.id} item={item} />
        ))}
      </View>
    </ScrollView>
  );
};

export default QueuePage;
