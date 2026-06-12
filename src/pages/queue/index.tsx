import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import QueueCard from '@/components/QueueCard';
import { queueItems, queueTips } from '@/data/queue';
import { shows } from '@/data/shows';

type FilterType = 'all' | 'scenic' | 'show';
type SortType = 'default' | 'timeAsc' | 'timeDesc';

interface PlanStop {
  id: string;
  name: string;
  category: '景点' | '演出';
  type: 'scenic' | 'show';
  waitTime: number;
  distance: string;
  walkTime: string;
  nextShowTime?: string;
  image?: string;
  reason: string;
  detailId?: string;
}

const getNextShowTime = (name: string): string | undefined => {
  const matched = shows.find((s) => s.name.includes(name) || name.includes(s.name) || s.venue.includes(name));
  if (!matched || !matched.times.length) return undefined;
  return matched.times[0];
};

const generatePlan = (): PlanStop[] => {
  const sorted = [...queueItems].sort((a, b) => a.waitTime - b.waitTime);
  const plan: PlanStop[] = [];
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  sorted.slice(0, 4).forEach((item, idx) => {
    const isShow = item.category === '演出';
    const detailId = isShow
      ? shows.find((s) => s.name.includes(item.name) || item.name.includes(s.name) || s.venue.includes(item.name))?.id
      : undefined;

    const distances = ['50m', '180m', '300m', '220m'];
    const walkTimes = ['1分钟', '2分钟', '4分钟', '3分钟'];
    const reasons = [
      `当前等待仅${item.waitTime}分钟，趁人少先去`,
      '顺路经过，顺便游览',
      '即将开场，建议提前到达',
      '排队时间适中，体验感好',
    ];

    plan.push({
      id: item.id,
      name: item.name,
      category: item.category,
      type: isShow ? 'show' : 'scenic',
      waitTime: item.waitTime,
      distance: distances[idx] || '150m',
      walkTime: walkTimes[idx] || '2分钟',
      nextShowTime: isShow ? getNextShowTime(item.name) : undefined,
      image: item.image,
      reason: reasons[idx] || '推荐游玩',
      detailId,
    });
  });
  return plan;
};

const QueuePage: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('default');
  const [showPlan, setShowPlan] = useState(false);
  const [plan] = useState<PlanStop[]>(() => generatePlan());

  const filteredItems = useMemo(() => {
    let result = [...queueItems];

    if (filter !== 'all') {
      result = result.filter((item) => (filter === 'scenic' ? item.category === '景点' : item.category === '演出'));
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
    const avgWait = Math.round(queueItems.reduce((sum, i) => sum + i.waitTime, 0) / total);
    return { total, normal, avgWait };
  }, []);

  const handlePlanRoute = () => {
    setShowPlan(!showPlan);
    console.log('[Queue] 切换错峰规划显示');
  };

  const handleStopClick = (stop: PlanStop) => {
    if (stop.type === 'show' && stop.detailId) {
      Taro.navigateTo({ url: `/pages/show-detail/index?id=${stop.detailId}` });
    } else if (stop.type === 'scenic') {
      Taro.switchTab({ url: '/pages/map/index' }).catch(() => {});
      setTimeout(() => {
        Taro.showToast({ title: `正在为您规划前往${stop.name}的路线`, icon: 'none' });
      }, 500);
    } else {
      Taro.showToast({ title: `跳转至${stop.name}`, icon: 'none' });
    }
    console.log('[Queue] 点击规划站点:', stop.name);
  };

  const handleStopNavigate = (stop: PlanStop) => {
    Taro.switchTab({ url: '/pages/map/index' }).catch(() => {});
    setTimeout(() => {
      Taro.showToast({ title: `正在导航至${stop.name}`, icon: 'none' });
    }, 500);
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
          <Text>🗺️ {showPlan ? '收起规划' : '错峰规划'}</Text>
        </View>
      </View>

      {showPlan && (
        <View className={styles.planSection}>
          <View className={styles.planHeader}>
            <Text className={styles.planTitle}>
              🎯 智能错峰路线（{plan.length}站）
            </Text>
            <Text className={styles.planSubtitle}>按等待时间、距离、演出时间综合排序</Text>
          </View>
          <View className={styles.planTimeline}>
            {plan.map((stop, idx) => (
              <View key={stop.id} className={styles.planStop}>
                <View className={styles.planStopLeft}>
                  <View
                    className={classNames(
                      styles.planStopNumber,
                      idx === plan.length - 1 && styles.last
                    )}
                  >
                    <Text>{idx + 1}</Text>
                  </View>
                  {idx < plan.length - 1 && <View className={styles.planConnector} />}
                </View>
                <View className={styles.planStopCard}>
                  <View className={styles.planStopHeader}>
                    <View>
                      <Text className={styles.planStopName}>{stop.name}</Text>
                      <View className={styles.planStopTags}>
                        <Text className={styles.planStopCategory}>{stop.category}</Text>
                        {stop.nextShowTime && (
                          <Text className={styles.planStopShow}>🎭 {stop.nextShowTime}</Text>
                        )}
                      </View>
                    </View>
                    <View className={styles.planWaitBadge}>
                      <Text className={styles.planWaitNum}>{stop.waitTime}</Text>
                      <Text className={styles.planWaitUnit}>分钟</Text>
                    </View>
                  </View>
                  <Text className={styles.planReason}>💡 {stop.reason}</Text>
                  <View className={styles.planMeta}>
                    <Text>📍 {stop.distance}</Text>
                    <Text>🚶 {stop.walkTime}</Text>
                  </View>
                  <View className={styles.planActions}>
                    <View
                      className={styles.planActionBtn}
                      onClick={() => handleStopNavigate(stop)}
                    >
                      <Text>去地图</Text>
                    </View>
                    <View
                      className={styles.planActionBtnPrimary}
                      onClick={() => handleStopClick(stop)}
                    >
                      <Text>{stop.type === 'show' ? '看详情' : '查看'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

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
