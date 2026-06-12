import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useAppStore } from '@/store/useAppStore';
import { coupons, foodShops } from '@/data/food';
import { NavTarget, SingleTicket } from '@/types';
import styles from './index.module.scss';

const spotPositions: Record<string, { left: number; top: number; distance: number; icon: string }> = {
  s001: { left: 25, top: 30, distance: 120, icon: '🏯' },
  s002: { left: 70, top: 25, distance: 200, icon: '🎭' },
  s003: { left: 20, top: 70, distance: 180, icon: '⛩️' },
  s004: { left: 75, top: 65, distance: 300, icon: '🏛️' },
  s005: { left: 50, top: 45, distance: 90, icon: '🌉' },
  s006: { left: 35, top: 55, distance: 150, icon: '🎪' },
};

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
  const {
    itinerary,
    squadMembers,
    squadGathered,
    tickets,
    claimedCoupons,
    removeItineraryItem,
    toggleMemberInItem,
    setNavTarget,
  } = useAppStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCouponModal, setShowCouponModal] = useState<string | null>(null);
  const [showTicketFor, setShowTicketFor] = useState<string | null>(null);

  const membersWithStatus = useMemo(() => {
    return squadMembers.map((m) => {
      const ticket = tickets.find((t) => t.holderName === m.name);
      return {
        ...m,
        hasTicket: !!ticket,
        ticket,
        gathered: !!squadGathered[m.id],
      };
    });
  }, [squadMembers, tickets, squadGathered]);

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
    if (item.type === 'scenic') {
      Taro.navigateTo({ url: `/pages/scenic-detail/index?id=${item.targetId}` });
    } else if (item.type === 'show') {
      Taro.navigateTo({ url: `/pages/show-detail/index?id=${item.targetId}` });
    } else if (item.type === 'food') {
      Taro.navigateTo({ url: `/pages/food/index?id=${item.targetId}` });
    }
  };

  const handleGoMap = (item: any) => {
    let nav: NavTarget | null = null;
    if (item.type === 'scenic') {
      const pos = spotPositions[item.targetId] || { left: 50, top: 50, distance: 150, icon: '📍' };
      nav = {
        id: item.targetId,
        name: item.name,
        icon: pos.icon,
        type: 'spot',
        distanceMeters: pos.distance,
        leftPct: pos.left,
        topPct: pos.top,
      };
    } else if (item.type === 'food') {
      nav = {
        id: item.targetId,
        name: item.name,
        icon: '🍜',
        type: 'food',
        distanceMeters: 120,
        leftPct: 45,
        topPct: 55,
      };
    } else if (item.type === 'show') {
      nav = {
        id: item.targetId,
        name: item.name,
        icon: '🎭',
        type: 'show',
        distanceMeters: 180,
        leftPct: 60,
        topPct: 40,
      };
    }
    if (nav) setNavTarget(nav);
    Taro.switchTab({ url: '/pages/map/index' });
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

  const clickedCoupon = showCouponModal ? coupons.find((c) => c.id === showCouponModal) : null;
  const clickedMemberTicket = showTicketFor
    ? membersWithStatus.find((m) => m.id === showTicketFor)?.ticket || null
    : null;
  const clickedMember = showTicketFor
    ? membersWithStatus.find((m) => m.id === showTicketFor)
    : null;

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
            <Text className={styles.statNum}>{membersWithStatus.filter((m) => m.isOnline).length}</Text>
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
                                style={{ color: '#C8102E' }}
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
                                <View className={styles.couponHintHeader}>
                                  <Text className={styles.couponHintIcon}>🎫</Text>
                                  <Text className={styles.couponHintText}>
                                    您有{foodCoupons.length}张可用券，点击查看
                                  </Text>
                                </View>
                                <View className={styles.couponMiniList}>
                                  {foodCoupons.map((c) => (
                                    <View
                                      key={c.id}
                                      className={styles.couponMini}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowCouponModal(c.id);
                                      }}
                                    >
                                      <View className={styles.couponMiniAmountBox}>
                                        <Text className={styles.couponMiniAmount}>{c.discount}</Text>
                                      </View>
                                      <View className={styles.couponMiniDescBox}>
                                        <Text className={styles.couponMiniTitle}>{c.title}</Text>
                                        <Text className={styles.couponMiniDesc}>{c.condition}</Text>
                                      </View>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}

                            <View className={styles.membersRow}>
                              <Text className={styles.membersLabel}>同行：</Text>
                              <View className={styles.memberChips}>
                                {membersWithStatus.map((m) => {
                                  const selected = item.memberIds.includes(m.id);
                                  return (
                                    <View
                                      key={m.id}
                                      className={`${styles.memberChip} ${selected ? styles.memberChipActive : ''}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (selected && m.hasTicket) {
                                          setShowTicketFor(m.id);
                                        } else {
                                          toggleMemberInItem(item.id, m.id);
                                        }
                                      }}
                                      onLongPress={(e) => {
                                        e.stopPropagation();
                                        if (m.hasTicket) {
                                          setShowTicketFor(m.id);
                                        }
                                      }}
                                    >
                                      <View className={styles.memberChipAvatarBox}>
                                        <Text className={styles.memberChipAvatar}>
                                          {m.name.charAt(0)}
                                        </Text>
                                        {m.gathered && (
                                          <View className={styles.memberChipGathered}>
                                            <Text>✓</Text>
                                          </View>
                                        )}
                                      </View>
                                      <View className={styles.memberChipNameBox}>
                                        <Text className={styles.memberChipName}>{m.name}</Text>
                                        <View className={styles.memberChipBadges}>
                                          {m.hasTicket && (
                                            <Text className={styles.badgeTicket}>🎫有票</Text>
                                          )}
                                          {m.gathered && (
                                            <Text className={styles.badgeGathered}>✓已到</Text>
                                          )}
                                          {!m.hasTicket && !m.gathered && (
                                            <Text className={styles.badgeNone}>待购票</Text>
                                          )}
                                        </View>
                                      </View>
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

      {clickedCoupon && (
        <View className={styles.modalMask} onClick={() => setShowCouponModal(null)}>
          <View className={styles.couponDetailModal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.couponDetailCard}>
              <View className={styles.couponDetailAmount}>
                <Text className={styles.couponDetailAmountText}>{clickedCoupon.discount}</Text>
                <Text className={styles.couponDetailCond}>{clickedCoupon.condition}</Text>
              </View>
              <View className={styles.couponDetailInfo}>
                <Text className={styles.couponDetailTitle}>{clickedCoupon.title}</Text>
                <View className={styles.couponDetailRow}>
                  <Text className={styles.couponDetailLabel}>适用门店</Text>
                  <Text className={styles.couponDetailValue}>{clickedCoupon.shopName}</Text>
                </View>
                <View className={styles.couponDetailRow}>
                  <Text className={styles.couponDetailLabel}>有效期至</Text>
                  <Text className={styles.couponDetailValue}>{clickedCoupon.expireDate}</Text>
                </View>
                <View className={styles.couponDetailRow}>
                  <Text className={styles.couponDetailLabel}>适用时间</Text>
                  <Text className={styles.couponDetailValue}>全天可用（营业时间内）</Text>
                </View>
              </View>
            </View>
            <View className={styles.modalConfirmBtn} onClick={() => setShowCouponModal(null)}>
              <Text>知道了</Text>
            </View>
          </View>
        </View>
      )}

      {clickedMember && clickedMemberTicket && (
        <View className={styles.modalMask} onClick={() => setShowTicketFor(null)}>
          <View className={styles.ticketDetailModal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.ticketCard}>
              <View className={styles.ticketCardHeader}>
                <Text className={styles.ticketCardTitle}>万岁山入园凭证</Text>
                <Text className={styles.ticketCardNo}>票号：{clickedMemberTicket.id}</Text>
              </View>
              <View className={styles.ticketCardBody}>
                <View className={styles.ticketQr}>
                  <View className={styles.qrPlaceholder}>
                    <Text style={{ fontSize: 80 }}>📱</Text>
                    <Text style={{ fontSize: 22, color: '#86909c', marginTop: 12 }}>请对准闸机扫码</Text>
                  </View>
                </View>
                <View className={styles.ticketInfo}>
                  <View className={styles.ticketInfoRow}>
                    <Text className={styles.ticketInfoLabel}>持有人</Text>
                    <Text className={styles.ticketInfoValue}>{clickedMember.name}</Text>
                  </View>
                  <View className={styles.ticketInfoRow}>
                    <Text className={styles.ticketInfoLabel}>票种</Text>
                    <Text className={styles.ticketInfoValue}>{clickedMemberTicket.type}</Text>
                  </View>
                  <View className={styles.ticketInfoRow}>
                    <Text className={styles.ticketInfoLabel}>价格</Text>
                    <Text className={styles.ticketInfoValue}>￥{clickedMemberTicket.price}</Text>
                  </View>
                  <View className={styles.ticketInfoRow}>
                    <Text className={styles.ticketInfoLabel}>有效期</Text>
                    <Text className={styles.ticketInfoValue}>{clickedMemberTicket.validDate}</Text>
                  </View>
                </View>
              </View>
              <View className={styles.ticketCardFooter}>
                <Text>请妥善保管，仅限本人使用</Text>
              </View>
            </View>
            <View className={styles.modalConfirmBtn} onClick={() => setShowTicketFor(null)}>
              <Text>关闭</Text>
            </View>
          </View>
        </View>
      )}

      {clickedMember && !clickedMemberTicket && showTicketFor && (
        <View className={styles.modalMask} onClick={() => setShowTicketFor(null)}>
          <View className={styles.ticketDetailModal} onClick={(e) => e.stopPropagation()}>
            <View className={styles.emptyTicketTip}>
              <Text style={{ fontSize: 60, marginBottom: 16 }}>🎫</Text>
              <Text className={styles.emptyTicketTitle}>{clickedMember.name}暂无门票</Text>
              <Text className={styles.emptyTicketDesc}>请先前往门票购买页面为其分票</Text>
            </View>
            <View className={styles.modalConfirmBtn} onClick={() => setShowTicketFor(null)}>
              <Text>好的</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ItineraryPage;
