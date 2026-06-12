import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import FoodCard from '@/components/FoodCard';
import { foodShops, coupons, menuItems } from '@/data/food';
import { useAppStore } from '@/store/useAppStore';
import { ItineraryItem } from '@/types';

type TabType = 'all' | 'restaurant' | 'shop';

const FoodPage: React.FC = () => {
  const router = useRouter();
  const { claimedCoupons, claimCoupon, addItineraryItem, itinerary } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [detailShopId, setDetailShopId] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planTime, setPlanTime] = useState('12:00');

  const shopIdFromUrl = router.params.id;
  const viewingShop = shopIdFromUrl
    ? foodShops.find((s) => s.id === shopIdFromUrl)
    : detailShopId
    ? foodShops.find((s) => s.id === detailShopId)
    : null;

  const tabs = [
    { id: 'all' as TabType, name: '全部' },
    { id: 'restaurant' as TabType, name: '美食餐厅' },
    { id: 'shop' as TabType, name: '特色商铺' },
  ];

  const filteredShops = useMemo(() => {
    if (activeTab === 'all') return foodShops;
    return foodShops.filter((s) => s.type === activeTab);
  }, [activeTab]);

  const shopCoupons = useMemo(() => {
    if (!viewingShop) return [];
    return coupons.filter((c) => c.shopId === viewingShop.id);
  }, [viewingShop]);

  const shopMenu = useMemo(() => {
    if (!viewingShop || viewingShop.type !== 'restaurant') return [];
    return menuItems;
  }, [viewingShop]);

  const handleClaimCoupon = (couponId: string, e?: any) => {
    if (e) e.stopPropagation();
    if (claimedCoupons.includes(couponId)) {
      Taro.showToast({ title: '已领取', icon: 'none' });
      return;
    }
    claimCoupon(couponId);
    Taro.showToast({ title: '领取成功', icon: 'success' });
    console.log('[Food] 领取优惠券:', couponId);
  };

  const handleShopClick = (shopId: string) => {
    setDetailShopId(shopId);
    console.log('[Food] 查看商家:', shopId);
  };

  const handleBack = () => {
    setDetailShopId(null);
  };

  const inItinerary = useMemo(() => {
    if (!viewingShop) return false;
    return itinerary.some((i) => i.targetId === viewingShop.id && i.type === 'food');
  }, [itinerary, viewingShop]);

  const handleAddItinerary = () => {
    if (!viewingShop) return;
    if (inItinerary) {
      Taro.showToast({ title: '已在行程中', icon: 'none' });
      return;
    }
    setPlanTime(viewingShop.type === 'restaurant' ? '12:00' : '15:00');
    setShowPlanModal(true);
  };

  const handleConfirmPlan = () => {
    if (!viewingShop) return;
    const newItem: ItineraryItem = {
      id: `it_${Date.now()}`,
      type: 'food',
      targetId: viewingShop.id,
      name: viewingShop.name,
      image: viewingShop.image,
      plannedTime: planTime,
      duration: 60,
      walkTime: '约5分钟',
      memberIds: ['1'],
    };
    addItineraryItem(newItem);
    setShowPlanModal(false);
    Taro.showToast({ title: '已加入行程', icon: 'success' });
  };

  const availableCoupons = coupons.filter((c) => {
    if (activeTab === 'all') return true;
    const shop = foodShops.find((s) => s.id === c.shopId);
    return shop?.type === activeTab;
  });

  if (viewingShop) {
    return (
      <View className={styles.detailPage}>
        <ScrollView scrollY className={styles.detailScroll}>
          <Image className={styles.detailBanner} src={viewingShop.image} mode="aspectFill" />
          <View className={styles.detailContent}>
            <Text className={styles.detailName}>{viewingShop.name}</Text>
            <View className={styles.detailRating}>
              <Text>⭐ {viewingShop.rating}</Text>
              <Text className={styles.detailDistance}>📍 {viewingShop.distance}</Text>
            </View>
            <Text className={styles.detailDesc}>{viewingShop.description}</Text>
            <View className={styles.detailInfo}>
              <Text className={styles.detailLocation}>📍 位置：{viewingShop.location}</Text>
              <Text className={styles.detailType}>{viewingShop.type === 'restaurant' ? '🍽️ 餐厅' : '🛍️ 商铺'}</Text>
            </View>

            {shopCoupons.length > 0 && (
              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>🎁 可用优惠券</Text>
                {shopCoupons.map((coupon) => (
                  <View key={coupon.id} className={styles.detailCoupon}>
                    <View className={styles.detailCouponLeft}>
                      <Text className={styles.detailCouponAmount}>{coupon.discount}</Text>
                      <Text className={styles.detailCouponCondition}>{coupon.condition}</Text>
                    </View>
                    <View
                      className={classNames(
                        styles.detailCouponBtn,
                        claimedCoupons.includes(coupon.id) && styles.couponUsed
                      )}
                      onClick={() => handleClaimCoupon(coupon.id)}
                    >
                      <Text>{claimedCoupons.includes(coupon.id) ? '已领取 ✓' : '领取'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {shopMenu.length > 0 && (
              <View className={styles.detailSection}>
                <Text className={styles.detailSectionTitle}>📋 菜单</Text>
                {shopMenu.map((item) => (
                  <View key={item.id} className={styles.menuItem}>
                    <View className={styles.menuInfo}>
                      <Text className={styles.menuName}>{item.name}</Text>
                      <Text className={styles.menuDesc}>{item.description}</Text>
                    </View>
                    <Text className={styles.menuPrice}>￥{item.price}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 140 }} />
          </View>
        </ScrollView>

        <View className={styles.detailBottomBar}>
          <View
            className={`${styles.detailBottomBtn} ${styles.btnSecondary}`}
            onClick={() => Taro.switchTab({ url: '/pages/map/index' })}
          >
            <Text>📍 导航</Text>
          </View>
          <View
            className={`${styles.detailBottomBtn} ${styles.btnPlan} ${inItinerary ? styles.btnPlanActive : ''}`}
            onClick={handleAddItinerary}
          >
            <Text>{inItinerary ? '✓ 已加行程' : '📅 加行程'}</Text>
          </View>
          <View className={`${styles.detailBottomBtn} ${styles.btnPrimary}`}>
            <Text>📞 联系商家</Text>
          </View>
        </View>

        {showPlanModal && (
          <View className={styles.modalMask} onClick={() => setShowPlanModal(false)}>
            <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <Text className={styles.modalTitle}>加入今日行程</Text>
              <Text className={styles.modalSub}>{viewingShop.name}</Text>

              <View className={styles.modalSection}>
                <Text className={styles.modalLabel}>计划到达时间</Text>
                <View className={styles.timeChips}>
                  {['11:00', '12:00', '13:00', '17:00', '18:00', '19:00', '15:00', '20:00'].map((t) => (
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
                <Text className={styles.modalLabel}>预计用餐</Text>
                <Text className={styles.modalValue}>约60分钟</Text>
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
  }

  return (
    <View className={styles.container}>
      <View className={styles.tabBar}>
        {tabs.map((tab) => (
          <View
            key={tab.id}
            className={classNames(styles.tabItem, activeTab === tab.id && styles.active)}
            onClick={() => setActiveTab(tab.id)}
          >
            <Text>{tab.name}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {availableCoupons.length > 0 && (
          <View className={styles.couponSection}>
            <View className={styles.couponTitle}>
              <Text>🎁</Text>
              <Text>优惠券</Text>
            </View>
            <ScrollView scrollX className={styles.couponScroll}>
              {availableCoupons.map((coupon) => (
                <View key={coupon.id} className={styles.couponCard}>
                  <Text className={styles.couponAmount}>{coupon.discount}</Text>
                  <Text className={styles.couponCondition}>{coupon.condition}</Text>
                  <Text className={styles.couponShop}>{coupon.shopName}</Text>
                  <View
                    className={classNames(
                      styles.couponBtn,
                      claimedCoupons.includes(coupon.id) && styles.used
                    )}
                    onClick={(e) => handleClaimCoupon(coupon.id, e)}
                  >
                    <Text>{claimedCoupons.includes(coupon.id) ? '已领取' : '立即领取'}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ padding: '0 32rpx' }}>
          <Text className={styles.listTitle}>
            {activeTab === 'all' ? '全部商家' : activeTab === 'restaurant' ? '美食餐厅' : '特色商铺'}
            ({filteredShops.length})
          </Text>
        </View>

        <View className={styles.shopList}>
          {filteredShops.map((shop) => (
            <View key={shop.id} onClick={() => handleShopClick(shop.id)}>
              <FoodCard shop={shop} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default FoodPage;
