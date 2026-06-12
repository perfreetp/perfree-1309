import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import FoodCard from '@/components/FoodCard';
import { foodShops, coupons } from '@/data/food';

type TabType = 'all' | 'restaurant' | 'shop';

const FoodPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [claimedCoupons, setClaimedCoupons] = useState<string[]>([]);

  const tabs = [
    { id: 'all' as TabType, name: '全部' },
    { id: 'restaurant' as TabType, name: '美食餐厅' },
    { id: 'shop' as TabType, name: '特色商铺' },
  ];

  const filteredShops = useMemo(() => {
    if (activeTab === 'all') return foodShops;
    return foodShops.filter((s) => s.type === activeTab);
  }, [activeTab]);

  const handleClaimCoupon = (couponId: string, e: any) => {
    e.stopPropagation();
    if (claimedCoupons.includes(couponId)) {
      Taro.showToast({ title: '已领取', icon: 'none' });
      return;
    }
    setClaimedCoupons([...claimedCoupons, couponId]);
    Taro.showToast({ title: '领取成功', icon: 'success' });
    console.log('[Food] 领取优惠券:', couponId);
  };

  const availableCoupons = coupons.filter((c) => {
    if (activeTab === 'all') return true;
    const shop = foodShops.find((s) => s.id === c.shopId);
    return shop?.type === activeTab;
  });

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
            <FoodCard key={shop.id} shop={shop} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default FoodPage;
