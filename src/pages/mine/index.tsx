import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { SingleTicket } from '@/types';

const ticketOptions: Array<{ type: string; price: number; desc: string }> = [
  { type: '成人票', price: 120, desc: '全价票，当日有效' },
  { type: '儿童票', price: 60, desc: '1.2-1.4米儿童，当日有效' },
  { type: '老人票', price: 0, desc: '60岁以上免票，需凭身份证' },
];

type MineTabType = 'ticket' | 'review' | 'lost' | 'coupon';

const MinePage: React.FC = () => {
  const {
    favorites,
    parkingRecord,
    tickets,
    reviews,
    lostItems,
    claimedCoupons,
    squadMembers,
    addTickets,
    removeTicket,
    clearTickets,
    removeReview,
    removeLostItem,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<MineTabType>('ticket');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyTicketType, setBuyTicketType] = useState(ticketOptions[0]);
  const [buyCount, setBuyCount] = useState(1);
  const [buyHolders, setBuyHolders] = useState<string[]>(['我']);
  const [expandedQr, setExpandedQr] = useState<string | null>(null);

  const tabs: { id: MineTabType; name: string; icon: string }[] = [
    { id: 'ticket', name: '我的门票', icon: '🎫' },
    { id: 'coupon', name: '我的优惠券', icon: '🎁' },
    { id: 'review', name: '我的评价', icon: '📝' },
    { id: 'lost', name: '失物记录', icon: '🔍' },
  ];

  const myReviews = useMemo(() => {
    return reviews.filter((r) => r.mine || r.userName === '我');
  }, [reviews]);

  const myLostItems = useMemo(() => {
    return lostItems.filter((l) => l.contact === '我提交的');
  }, [lostItems]);

  const handleBuyOptionSelect = (opt: typeof ticketOptions[0]) => {
    setBuyTicketType(opt);
  };

  const handleBuyCountChange = (delta: number) => {
    const next = Math.min(10, Math.max(1, buyCount + delta));
    setBuyCount(next);
    const newHolders = [...buyHolders];
    while (newHolders.length < next) {
      const availableMember = squadMembers.find((m) => !newHolders.includes(m.name));
      newHolders.push(availableMember ? availableMember.name : `亲友${newHolders.length + 1}`);
    }
    while (newHolders.length > next) newHolders.pop();
    setBuyHolders(newHolders);
  };

  const handleHolderChange = (idx: number, name: string) => {
    const next = [...buyHolders];
    next[idx] = name;
    setBuyHolders(next);
  };

  const handleConfirmBuy = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const newTickets: SingleTicket[] = [];
    for (let i = 0; i < buyCount; i++) {
      const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      newTickets.push({
        id: `t_${Date.now()}_${i}`,
        type: buyTicketType.type,
        price: buyTicketType.price,
        validDate: `${dateStr} 当日有效`,
        code: `WSS${dateStr.replace(/\./g, '')}${rand}`,
        bound: false,
        holderName: buyHolders[i] || `第${i + 1}位`,
      });
    }
    addTickets(newTickets);
    setShowBuyModal(false);
    setBuyCount(1);
    setBuyHolders(['我']);
    Taro.showToast({ title: `成功购买${buyCount}张票`, icon: 'success' });
  };

  const handleBind = () => {
    Taro.showModal({
      title: '绑定门票',
      content: '请输入票面编号',
      editable: true,
      placeholderText: '如：WSS20260612001',
      success: (res) => {
        if (res.confirm && res.content) {
          const now = new Date();
          const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
          const newTicket: SingleTicket = {
            id: `t_bind_${Date.now()}`,
            type: '已绑定门票',
            price: 0,
            validDate: `${dateStr} 当日有效`,
            code: res.content.trim(),
            bound: true,
            holderName: '我',
          };
          addTickets([newTicket]);
          Taro.showToast({ title: '绑定成功', icon: 'success' });
        }
      },
    });
  };

  const handleToggleQr = (ticketId: string) => {
    setExpandedQr(expandedQr === ticketId ? null : ticketId);
  };

  const handleRemoveTicket = (ticketId: string, holderName: string) => {
    Taro.showModal({
      title: '提示',
      content: `确认删除${holderName}的这张门票？`,
      success: (res) => {
        if (res.confirm) {
          removeTicket(ticketId);
          Taro.showToast({ title: '已删除', icon: 'none' });
        }
      },
    });
  };

  const handleClearAll = () => {
    if (tickets.length === 0) return;
    Taro.showModal({
      title: '提示',
      content: '确认删除所有门票？',
      success: (res) => {
        if (res.confirm) {
          clearTickets();
          setExpandedQr(null);
        }
      },
    });
  };

  const handleRemoveReview = (id: string) => {
    Taro.showModal({
      title: '提示',
      content: '确认删除这条评价？',
      success: (res) => {
        if (res.confirm) removeReview(id);
      },
    });
  };

  const handleRemoveLost = (id: string) => {
    Taro.showModal({
      title: '提示',
      content: '确认删除这条失物记录？',
      success: (res) => {
        if (res.confirm) removeLostItem(id);
      },
    });
  };

  const handleMenuClick = (path: string, tab?: MineTabType) => {
    if (tab) {
      setActiveTab(tab);
      return;
    }
    if (path) {
      Taro.navigateTo({ url: path });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>👤</Text>
          </View>
          <View className={styles.userText}>
            <Text className={styles.username}>游客朋友</Text>
            <Text className={styles.userDesc}>欢迎来到万岁山武侠城</Text>
          </View>
          <View className={styles.vipBadge}>
            <Text>{tickets.length > 0 ? `已购${tickets.length}张` : '游客'}</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.statsCard}>
          <Text className={styles.statsTitle}>📊 游玩数据</Text>
          <View className={styles.statsRow}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{tickets.length}</Text>
              <Text className={styles.statLabel}>门票</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{favorites.length}</Text>
              <Text className={styles.statLabel}>收藏</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{claimedCoupons.length}</Text>
              <Text className={styles.statLabel}>优惠券</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{myReviews.length}</Text>
              <Text className={styles.statLabel}>评价</Text>
            </View>
          </View>
        </View>

        <View className={styles.tabBar}>
          {tabs.map((t) => (
            <View
              key={t.id}
              className={classNames(styles.tabItem, activeTab === t.id && styles.active)}
              onClick={() => setActiveTab(t.id)}
            >
              <Text>{t.icon} {t.name}</Text>
            </View>
          ))}
        </View>

        {activeTab === 'ticket' && (
          <View className={styles.ticketSection}>
            {tickets.length > 0 ? (
              <>
                <View className={styles.sectionActionBar}>
                  <Text className={styles.sectionActionBarTitle}>🎫 我的票包（{tickets.length}张）</Text>
                  <Text className={styles.sectionActionBarText} onClick={handleClearAll}>
                    清空全部
                  </Text>
                </View>
                {tickets.map((t) => (
                  <View key={t.id} className={styles.ticketCard}>
                    <View className={styles.ticketHeader}>
                      <View className={styles.ticketHolderInfo}>
                        <Text className={styles.ticketHolderAvatar}>👤</Text>
                        <View>
                          <Text className={styles.ticketHolderName}>{t.holderName}</Text>
                          <Text className={styles.ticketStatus}>
                            {t.bound ? '已绑定' : '已购票'}
                          </Text>
                        </View>
                      </View>
                      <Text className={styles.ticketType}>{t.type}</Text>
                    </View>

                    <View className={styles.ticketInfo}>
                      <View className={styles.qrCode} onClick={() => handleToggleQr(t.id)}>
                        {expandedQr === t.id ? (
                          <Text className={styles.qrText}>收起</Text>
                        ) : (
                          <Text className={styles.qrIcon}>📱</Text>
                        )}
                      </View>
                      <View className={styles.ticketDetails}>
                        <Text className={styles.ticketTime}>有效期：{t.validDate}</Text>
                        <Text className={styles.ticketCode}>票号：{t.code}</Text>
                        {t.price > 0 && <Text className={styles.ticketPrice}>￥{t.price}</Text>}
                      </View>
                    </View>

                    {expandedQr === t.id && (
                      <View className={styles.qrFullWrap}>
                        <View className={styles.qrFullBox}>
                          <Text className={styles.qrFullIcon}>📱</Text>
                          <Text className={styles.qrFullLabel}>{t.holderName}的入园码</Text>
                          <Text className={styles.qrFullCode}>{t.code}</Text>
                        </View>
                      </View>
                    )}

                    <View className={styles.ticketFooter}>
                      <Text className={styles.ticketRemove} onClick={() => handleRemoveTicket(t.id, t.holderName)}>
                        删除
                      </Text>
                      <View className={styles.showQrBtn} onClick={() => handleToggleQr(t.id)}>
                        <Text>{expandedQr === t.id ? '收起二维码' : '出示二维码'}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                <View className={styles.addTicketRow}>
                  <View className={styles.addTicketBtn} onClick={handleBind}>
                    <Text>🔗 绑定新门票</Text>
                  </View>
                  <View className={styles.addTicketBtnPrimary} onClick={() => setShowBuyModal(true)}>
                    <Text>🎫 继续购票</Text>
                  </View>
                </View>
              </>
            ) : (
              <View className={styles.ticketCard}>
                <View className={styles.ticketHeader}>
                  <Text className={styles.ticketTitle}>我的门票</Text>
                </View>
                <View className={styles.noTicket}>
                  <Text className={styles.noTicketIcon}>🎫</Text>
                  <Text className={styles.noTicketText}>暂无门票，请购买或绑定</Text>
                </View>
                <View className={styles.ticketFooter}>
                  <View className={styles.bindBtn} onClick={handleBind}>
                    <Text>🔗 绑定门票</Text>
                  </View>
                  <View className={styles.showQrBtn} onClick={() => setShowBuyModal(true)}>
                    <Text>🎫 购买门票</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {activeTab === 'coupon' && (
          <View className={styles.listSection}>
            <View className={styles.sectionActionBar}>
              <Text className={styles.sectionActionBarTitle}>🎁 我的优惠券（{claimedCoupons.length}张）</Text>
              <Text className={styles.sectionActionBarText} onClick={() => Taro.navigateTo({ url: '/pages/food/index' })}>
                去领券 →
              </Text>
            </View>
            {claimedCoupons.length === 0 ? (
              <View className={styles.emptyHint}>
                <Text className={styles.emptyIcon}>🎁</Text>
                <Text className={styles.emptyText}>还没有优惠券，去餐饮购物页面领取吧</Text>
              </View>
            ) : (
              <MyCouponList />
            )}
          </View>
        )}

        {activeTab === 'review' && (
          <View className={styles.listSection}>
            <View className={styles.sectionActionBar}>
              <Text className={styles.sectionActionBarTitle}>📝 我的评价（{myReviews.length}条）</Text>
            </View>
            {myReviews.length === 0 ? (
              <View className={styles.emptyHint}>
                <Text className={styles.emptyIcon}>📝</Text>
                <Text className={styles.emptyText}>还没有评价，去景点或演出详情页写一条吧</Text>
              </View>
            ) : (
              <View className={styles.recordList}>
                {myReviews.map((r) => (
                  <View key={r.id} className={styles.recordCard}>
                    <View className={styles.recordHeader}>
                      <Text className={styles.recordTitle}>{r.targetName || (r.targetType === 'scenic' ? '景点评价' : '演出评价')}</Text>
                      <Text className={styles.recordDelete} onClick={() => handleRemoveReview(r.id)}>删除</Text>
                    </View>
                    <View className={styles.recordStars}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Text key={i}>{i < r.rating ? '⭐' : '☆'}</Text>
                      ))}
                      <Text className={styles.recordDate}>{r.date}</Text>
                    </View>
                    <Text className={styles.recordContent}>{r.content}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'lost' && (
          <View className={styles.listSection}>
            <View className={styles.sectionActionBar}>
              <Text className={styles.sectionActionBarTitle}>🔍 失物记录（{myLostItems.length}条）</Text>
              <Text className={styles.sectionActionBarText} onClick={() => Taro.navigateTo({ url: '/pages/service/index' })}>
                去提交 →
              </Text>
            </View>
            {myLostItems.length === 0 ? (
              <View className={styles.emptyHint}>
                <Text className={styles.emptyIcon}>🔍</Text>
                <Text className={styles.emptyText}>还没有失物记录</Text>
              </View>
            ) : (
              <View className={styles.recordList}>
                {myLostItems.map((l) => (
                  <View key={l.id} className={styles.recordCard}>
                    <View className={styles.recordHeader}>
                      <Text className={styles.recordTitle}>{l.title}</Text>
                      <Text className={styles.recordDelete} onClick={() => handleRemoveLost(l.id)}>删除</Text>
                    </View>
                    <Text className={styles.recordStatus}>
                      {l.status === 'pending' ? '🔴 寻找中' : '🟢 已找到'}
                    </Text>
                    <Text className={styles.recordContent}>{l.description}</Text>
                    <View className={styles.recordMeta}>
                      <Text>📍 {l.location}</Text>
                      <Text>🕐 {l.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleMenuClick('/pages/squad/index')}>
            <Text className={styles.menuIcon}>🅿️</Text>
            <Text className={styles.menuText}>停车记录</Text>
            {parkingRecord && <Text className={styles.menuBadge}>已停车</Text>}
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('', 'review')}>
            <Text className={styles.menuIcon}>❤️</Text>
            <Text className={styles.menuText}>我的收藏</Text>
            <Text className={styles.menuBadge}>{favorites.length}</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('/pages/squad/index')}>
            <Text className={styles.menuIcon}>👥</Text>
            <Text className={styles.menuText}>亲友同行</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('', 'ticket')}>
            <Text className={styles.menuIcon}>🎫</Text>
            <Text className={styles.menuText}>购票记录</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>

        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleMenuClick('/pages/service/index')}>
            <Text className={styles.menuIcon}>🛟</Text>
            <Text className={styles.menuText}>服务求助</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('')}>
            <Text className={styles.menuIcon}>🔔</Text>
            <Text className={styles.menuText}>消息通知</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('')}>
            <Text className={styles.menuIcon}>⚙️</Text>
            <Text className={styles.menuText}>设置</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
          <View className={styles.menuItem} onClick={() => handleMenuClick('')}>
            <Text className={styles.menuIcon}>💬</Text>
            <Text className={styles.menuText}>意见反馈</Text>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      {showBuyModal && (
        <View className={styles.buyModal} onClick={() => setShowBuyModal(false)}>
          <View className={styles.buyContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.buyTitle}>选择票种并分配亲友</Text>

            <View className={styles.buyTypeList}>
              {ticketOptions.map((opt) => (
                <View
                  key={opt.type}
                  className={classNames(styles.buyTypeItem, buyTicketType.type === opt.type && styles.selected)}
                  onClick={() => handleBuyOptionSelect(opt)}
                >
                  <View>
                    <Text className={styles.buyType}>{opt.type}</Text>
                    <Text className={styles.buyDesc}>{opt.desc}</Text>
                  </View>
                  <Text className={styles.buyPrice}>{opt.price === 0 ? '免费' : `￥${opt.price}`}</Text>
                  {buyTicketType.type === opt.type && <Text className={styles.checkMark}>✓</Text>}
                </View>
              ))}
            </View>

            <View className={styles.buyCountRow}>
              <Text className={styles.buyCountLabel}>购买数量</Text>
              <View className={styles.buyCountControl}>
                <View className={styles.countBtn} onClick={() => handleBuyCountChange(-1)}>
                  <Text>−</Text>
                </View>
                <Text className={styles.countNum}>{buyCount}</Text>
                <View className={styles.countBtn} onClick={() => handleBuyCountChange(1)}>
                  <Text>+</Text>
                </View>
              </View>
            </View>

            <Text className={styles.buyHolderTitle}>分配给（{buyCount}人）</Text>
            <View className={styles.holderGrid}>
              {Array.from({ length: buyCount }).map((_, idx) => (
                <View key={idx} className={styles.holderSelect}>
                  <Text className={styles.holderIdx}>第{idx + 1}位</Text>
                  <View className={styles.holderChips}>
                    {squadMembers.map((m) => (
                      <Text
                        key={m.id}
                        className={classNames(
                          styles.holderChip,
                          buyHolders[idx] === m.name && styles.holderChipSelected
                        )}
                        onClick={() => handleHolderChange(idx, m.name)}
                      >
                        {m.name}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View className={styles.buyTotal}>
              <Text className={styles.buyTotalLabel}>合计：</Text>
              <Text className={styles.buyTotalPrice}>
                ￥{buyTicketType.price * buyCount}
              </Text>
            </View>

            <View className={styles.buyActions}>
              <View className={styles.buyCancelBtn} onClick={() => setShowBuyModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.buyConfirmBtn} onClick={handleConfirmBuy}>
                <Text>确认购买</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

import { coupons } from '@/data/food';
const MyCouponList: React.FC = () => {
  const { claimedCoupons } = useAppStore();
  const list = coupons.filter((c) => claimedCoupons.includes(c.id));
  return (
    <View className={styles.recordList}>
      {list.map((c) => (
        <View key={c.id} className={styles.couponCard}>
          <View className={styles.couponAmount}>
            <Text>{c.discount}</Text>
          </View>
          <View className={styles.couponInfo}>
            <Text className={styles.couponShop}>{c.shopName}</Text>
            <Text className={styles.couponCondition}>{c.condition}</Text>
            <Text className={styles.couponExpire}>有效期至 {c.expireDate}</Text>
          </View>
          <View className={styles.couponUsed}>已领取</View>
        </View>
      ))}
    </View>
  );
};

export default MinePage;
