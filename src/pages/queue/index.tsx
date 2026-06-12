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

const getNextShowTime = (name: string, currentMin: number): string | undefined => {
  const matched = shows.find((s) => s.name.includes(name) || name.includes(s.name) || s.venue.includes(name));
  if (!matched || !matched.times.length) return undefined;
  return matched.times[0];
};

const getAllShowTimes = (name: string): string[] => {
  const matched = shows.find((s) => s.name.includes(name) || name.includes(s.name) || s.venue.includes(name));
  return matched ? matched.times : [];
};

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const getPeriod = (mins: number): 'morning' | 'afternoon' | 'evening' => {
  if (mins < 11 * 60) return 'morning';
  if (mins < 17 * 60) return 'afternoon';
  return 'evening';
};

const getCurrentPeriod = (currentMin: number): 'morning' | 'afternoon' | 'evening' => {
  return getPeriod(currentMin);
};

const generatePlan = (): PlanStop[] => {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const currentPeriod = getCurrentPeriod(currentMin);

  const periodOrder: Record<string, number> = { morning: 0, afternoon: 1, evening: 2 };

  interface ScoredItem {
    id: string;
    name: string;
    category: '景点' | '演出';
    isShow: boolean;
    waitTime: number;
    image?: string;
    showTime?: string;
    showTimeMin: number;
    period: 'morning' | 'afternoon' | 'evening';
    isPast: boolean;
    score: number;
    detailId?: string;
    reason: string;
  }

  const scored: ScoredItem[] = [];

  queueItems.forEach((item) => {
    const isShow = item.category === '演出';
    const showTimes = isShow ? getAllShowTimes(item.name) : [];
    const detailId = isShow
      ? shows.find((s) => s.name.includes(item.name) || item.name.includes(s.name) || s.venue.includes(item.name))?.id
      : undefined;

    if (isShow && showTimes.length > 0) {
      showTimes.forEach((t) => {
        const tMin = timeToMinutes(t);
        const isPast = tMin <= currentMin;
        const period = getPeriod(tMin);
        const minsUntil = tMin - currentMin;

        let score = 0;
        let reason = '';

        if (isPast) {
          score = -999;
          reason = `${t}场已开场，建议下一场`;
        } else {
          const periodWeight =
            periodOrder[period] - periodOrder[currentPeriod] < 0
              ? -1000
              : (2 - Math.abs(periodOrder[period] - periodOrder[currentPeriod])) * 100;
          score += periodWeight;

          if (minsUntil < 60) {
            score += 80;
            reason = `${Math.max(1, minsUntil)}分钟后开场，赶紧过去`;
          } else if (minsUntil < 180) {
            score += 60;
            reason = `${Math.floor(minsUntil / 60)}小时后开场，提前排队`;
          } else {
            score += 20;
            reason = `${t}开场，安排在后面`;
          }

          score += Math.max(0, 30 - item.waitTime);
        }

        scored.push({
          id: `${item.id}-${t}`,
          name: item.name,
          category: item.category,
          isShow: true,
          waitTime: item.waitTime,
          image: item.image,
          showTime: t,
          showTimeMin: tMin,
          period,
          isPast,
          score,
          detailId,
          reason,
        });
      });
    } else {
      const period: 'morning' | 'afternoon' | 'evening' = 'afternoon';
      const score = 30 + Math.max(0, 30 - item.waitTime);
      scored.push({
        id: item.id,
        name: item.name,
        category: item.category,
        isShow: false,
        waitTime: item.waitTime,
        image: item.image,
        showTime: undefined,
        showTimeMin: currentMin + item.waitTime,
        period,
        isPast: false,
        score,
        detailId: undefined,
        reason: item.waitTime <= 10 ? `仅${item.waitTime}分钟，错峰好时机` : '顺路安排游玩',
      });
    }
  });

  const pastItems = scored.filter((s) => s.isPast).sort((a, b) => b.showTimeMin - a.showTimeMin);
  const validItems = scored.filter((s) => !s.isPast);

  const periodGroup: Record<string, typeof validItems> = { morning: [], afternoon: [], evening: [] };
  validItems.forEach((v) => {
    if (periodGroup[v.period]) periodGroup[v.period].push(v);
  });

  const sortPeriod = (arr: typeof validItems) =>
    [...arr].sort((a, b) => {
      if (a.isShow && b.isShow) return a.showTimeMin - b.showTimeMin;
      if (a.isShow) return -1;
      if (b.isShow) return 1;
      return a.waitTime - b.waitTime;
    });

  const sortedValid: ScoredItem[] = [];
  ['morning', 'afternoon', 'evening'].forEach((p) => {
    if (periodOrder[p] >= periodOrder[currentPeriod]) {
      sortedValid.push(...sortPeriod(periodGroup[p]));
    }
  });

  const seenNames = new Set<string>();
  const picked: ScoredItem[] = [];
  for (const item of sortedValid) {
    if (picked.length >= 4) break;
    if (!seenNames.has(item.name)) {
      seenNames.add(item.name);
      picked.push(item);
    }
  }

  if (picked.length < 4 && pastItems.length > 0) {
    const pastSeen = new Set(picked.map((p) => p.name));
    for (const item of pastItems) {
      if (picked.length >= 4) break;
      if (!pastSeen.has(item.name)) {
        pastSeen.add(item.name);
        picked.push(item);
      }
    }
  }

  const distances = ['80m', '180m', '260m', '320m'];
  const walkTimes = ['约2分钟', '约3分钟', '约4分钟', '约6分钟'];

  const plan: PlanStop[] = picked.map((item, idx) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    type: item.isShow ? 'show' : 'scenic',
    waitTime: item.waitTime,
    distance: distances[idx] || '150m',
    walkTime: walkTimes[idx] || '约2分钟',
    nextShowTime: item.showTime,
    image: item.image,
    reason: item.reason,
    detailId: item.detailId,
  }));

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
