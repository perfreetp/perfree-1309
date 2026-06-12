import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { coupons, foodShops } from '@/data/food';
import styles from './index.module.scss';

const getTimePeriod = (time: string) => {
  const h = parseInt(time.split(':')[0], 10);
  if (h < 11) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const periodLabels = {
  morning: { label: '上午', icon: '🌅', color: '#FFB020' },
  afternoon: { label: '下午', icon: '☀️', color: '#FF8A00' },
  evening: { label: '夜场', icon: '🌙', color: '#5B5BD6' },
};

const ItineraryPage: React.FC = () => {
  const { itinerary, squadMembers, claimedCoupons, removeItineraryItem, toggleMemberInItem } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof itinerary> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    itinerary.forEach((item) => {
      const p = getTimePeriod(item.plannedTime);
      groups[p].push(item);
    });
    return groups;
  }, [itinerary]);

  const getCouponsForFood = (foodId: string) => {
    const shop = foodShops.find((s) => s.id === foodId);
    if (!shop) return [];
    return coupons.filter(
      (c) => claimedCoupons.includes(c.id) && shop.couponIds?.includes(c.id)
    );
  };

  const handleGoDetail = (item: any) => {
    if (item.type === 'show') {
      Taro.navigateTo({ url: `/pages/show-detail/index?id=${item.targetId}` });
    } else if (item.type === 'scenic') {
      Taro.switchTab({ url: '/pages/map/index' });
      Taro.showToast({ title: '已切换到地图', icon: 'none' });
    } else if (item.type === 'food') {
      Taro.navigateTo({ url: `/pages/food/index?id=${item.targetId}` });
    }
  };

  const handleGoMap = (item: any) => {
    Taro.switchTab({ url: '/pages/map/index' });
    Taro.showToast({ title: '已切换到地图', icon: 'none' });
  };

  const handleDeleteItem = (id: string, name: string) => {
    Taro.showModal({
      title: '移除行程',
      content: `确定将"${name}"移出今日行程？`,
      success: (res) => {
        if (res.confirm) {
          removeItineraryItem(id);
          Taro.showToast({ title: '已移除', icon: 'success' });
        }
      },
    });
  };

  const getTypeIcon = (type: string) => {
    if (type === 'show') return '🎭';
    if (type === 'food') return '🍜';
    return '🏞️';
  };

  const getTypeColor = (type: string) => {
    if (type === 'show') return 'linear-gradient(135deg,#FF7E5F,#FEB47B)';
    if (type === 'food') return 'linear-gradient(135deg,#667eea,#764ba2)';
    return 'linear-gradient(135deg,#11998e,#38ef7d)';
  };

  const today = new Date();
  const todayStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.dateLabel}>今日行程</Text>
          <Text className={styles.dateValue}>{todayStr}</Text>
        </View>
        <View className={styles.headerRight}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{itinerary.length}</Text>
            <Text className={styles.statText}>项安排</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{squadMembers.filter((m) => m.isOnline).length}</Text>
            <Text className={styles.statText}>人同行</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.scroll}>
        {itinerary.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📅</Text>
            <Text className={styles.emptyTitle}>还没有行程安排</Text>
            <Text className={styles.emptyDesc}>去景点、演出或餐饮页面，</Text>
            <Text className={styles.emptyDesc}>点击「加入行程」开始规划吧</Text>
            <View
              className={styles.emptyBtn}
              onClick={() => Taro.switchTab({ url: '/pages/map/index' })}
            >
              <Text>去看看</Text>
            </View>
          </View>
        ) : (
          <>
            {(['morning', 'afternoon', 'evening'] as const).map((period) => (
              <View key={period} className={styles.periodSection}>
                <View className={styles.periodHeader}>
                  <View
                    className={styles.periodIcon}
                    style={{ backgroundColor: periodLabels[period].color }}
                  >
                    <Text>{periodLabels[period].icon}</Text>
                  </View>
                  <Text className={styles.periodLabel}>{periodLabels[period].label}</Text>
                  <View className={styles.periodLine} />
                  <Text className={styles.periodCount}>{grouped[period].length}项</Text>
                </View>

                <View className={styles.timeline}>
                  {grouped[period].length === 0 ? (
                    <View className={styles.emptyPeriod}>
                      <Text className={styles.emptyPeriodText}>暂无安排</Text>
                    </View>
                  ) : (
                    grouped[period].map((item, index) => {
                      const isExpanded = expandedId === item.id;
                      const isLast = index === grouped[period].length - 1;
                      const foodCoupons = item.type === 'food' ? getCouponsForFood(item.targetId) : [];
                      return (
                        <View key={item.id} className={styles.stopItem}>
                          <View className={styles.stopTimeline}>
                            <View
                              className={styles.stopDot}
                              style={{ background: getTypeColor(item.type) }}
                            >
                              <Text className={styles.stopDotIcon}>{getTypeIcon(item.type)}</Text>
                            </View>
                            {!isLast && <View className={styles.stopLine} />}
                          </View>

                          <View
                            className={styles.stopCard}
                            onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          >
                            <View className={styles.stopTop}>
                              <View className={styles.stopTimeBox}>
                                <Text className={styles.stopTime}>{item.plannedTime}</Text>
                                <Text className={styles.stopDur}>{item.duration}分钟</Text>
                              </View>
                              <Text
                                className={styles.stopType}
                                style={{ color: getTypeColor(item.type).split(',')[0].replace('linear-gradient(135deg,', '') }}
                              >
                                {item.type === 'show' ? '演出' : item.type === 'food' ? '餐饮' : '景点'}
                              </Text>
                            </View>

                            <View className={styles.stopInfo}>
                              <Text className={styles.stopName}>{item.name}</Text>
                              <View className={styles.stopMeta}>
                                {item.walkTime && (
                                  <View className={styles.metaTag}>
                                    <Text>🚶 {item.walkTime}</Text>
                                  </View>
                                )}
                                {item.waitTime ? (
                                  <View className={styles.metaTag}>
                                    <Text>⏳ 排队{item.waitTime}分钟</Text>
                                  </View>
                                ) : null}
                                {item.showTime && (
                                  <View className={styles.metaTag}>
                                    <Text>🎬 {item.showTime}开演</Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            {foodCoupons.length > 0 && (
                              <View className={styles.couponHint}>
                                <Text className={styles.couponHintIcon}>🎫</Text>
                                <Text className={styles.couponHintText}>
                                  您有{foodCoupons.length}张可用券
                                </Text>
                                {foodCoupons.slice(0, 2).map((c) => (
                                  <View key={c.id} className={styles.couponMini}>
                                    <Text className={styles.couponMiniAmount}>¥{c.amount}</Text>
                                    <Text className={styles.couponMiniDesc}>满{c.minSpend}可用</Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            <View className={styles.membersRow}>
                              <Text className={styles.membersLabel}>同行：</Text>
                              <View className={styles.memberChips}>
                                {squadMembers.map((m) => {
                                  const selected = item.memberIds.includes(m.id);
                                  return (
                                    <View
                                      key={m.id}
                                      className={`${styles.memberChip} ${selected ? styles.memberChipActive : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMemberInItem(item.id, m.id);
                                      }}
                                    >
                                      <Text className={styles.memberChipAvatar}>
                                        {m.name.charAt(0)}
                                      </Text>
                                      <Text className={styles.memberChipName}>{m.name}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>

                            {isExpanded && (
                              <View className={styles.stopActions}>
                                <View
                                  className={styles.actionBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGoMap(item);
                                  }}
                                >
                                  <Text>🗺️ 去地图</Text>
                                </View>
                                <View
                                  className={styles.actionBtn}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGoDetail(item);
                                  }}
                                >
                                  <Text>📄 看详情</Text>
                                </View>
                                <View
                                  className={`${styles.actionBtn} ${styles.actionDanger}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteItem(item.id, item.name);
                                  }}
                                >
                                  <Text>🗑️ 移除</Text>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
            ))}
            <View style={{ height: '180rpx' }} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ItineraryPage;
