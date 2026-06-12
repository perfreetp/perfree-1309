import React, { useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import ScenicCard from '@/components/ScenicCard';
import { scenicSpots, facilities } from '@/data/scenic';

type TabType = 'spot' | 'toilet' | 'medical';

const MapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('spot');

  const facilityTabs = [
    { id: 'spot' as TabType, name: '全部景点', icon: '🏛️' },
    { id: 'toilet' as TabType, name: '卫生间', icon: '🚻' },
    { id: 'medical' as TabType, name: '医务点', icon: '🏥' },
  ];

  const filteredFacilities = facilities.filter((f) => {
    if (activeTab === 'spot') return true;
    return f.type === activeTab;
  });

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'toilet':
        return '🚻';
      case 'medical':
        return '🏥';
      case 'entrance':
        return '🚪';
      case 'exit':
        return '🚪';
      default:
        return '📍';
    }
  };

  const handleSearch = () => {
    console.log('[Map] 点击搜索');
    Taro.showToast({ title: '搜索功能开发中', icon: 'none' });
  };

  const handleLocate = () => {
    console.log('[Map] 点击定位');
    Taro.showToast({ title: '正在定位...', icon: 'none' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <View className={styles.searchInput} onClick={handleSearch}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchText}>搜索景点、设施</Text>
        </View>
        <View className={styles.locationBtn} onClick={handleLocate}>
          <Text>📍</Text>
        </View>
      </View>

      <View className={styles.facilityTabs}>
        {facilityTabs.map((tab) => (
          <View
            key={tab.id}
            className={classNames(styles.facilityTab, activeTab === tab.id && styles.active)}
            onClick={() => setActiveTab(tab.id)}
          >
            <Text>{tab.icon} {tab.name}</Text>
          </View>
        ))}
      </View>

      <View className={styles.mapArea}>
        <Image
          className={styles.mapBg}
          src="https://picsum.photos/id/1036/750/500"
          mode="aspectFill"
        />
        <View className={styles.mapMarkers}>
          <View className={classNames(styles.marker, styles.markerCurrent)} style={{ left: '50%', top: '60%' }}>
            <Text className={styles.markerIcon}>📍</Text>
            <Text className={styles.markerLabel}>我的位置</Text>
          </View>
          {scenicSpots.slice(0, 4).map((spot, idx) => (
            <View
              key={spot.id}
              className={styles.marker}
              style={{
                left: `${20 + idx * 20}%`,
                top: `${30 + (idx % 2) * 25}%`,
              }}
            >
              <Text className={styles.markerIcon}>🏯</Text>
              <Text className={styles.markerLabel}>{spot.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY className={styles.contentSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {activeTab === 'spot' ? '景点列表' : activeTab === 'toilet' ? '卫生间' : '医务点'}
          </Text>
          <Text className={styles.sectionCount}>
            共{activeTab === 'spot' ? scenicSpots.length : filteredFacilities.length}个
          </Text>
        </View>

        {activeTab === 'spot' ? (
          <View className={styles.spotList}>
            {scenicSpots.map((spot) => (
              <ScenicCard key={spot.id} spot={spot} />
            ))}
          </View>
        ) : (
          <View className={styles.facilityList}>
            {filteredFacilities.map((f) => (
              <View key={f.id} className={styles.facilityItem}>
                <View className={styles.facilityIcon}>
                  <Text>{getFacilityIcon(f.type)}</Text>
                </View>
                <View className={styles.facilityInfo}>
                  <Text className={styles.facilityName}>{f.name}</Text>
                  <Text className={styles.facilityDesc}>距离约 {Math.floor(Math.random() * 300 + 50)}米</Text>
                </View>
                <Text className={styles.facilityDistance}>导航 →</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MapPage;
