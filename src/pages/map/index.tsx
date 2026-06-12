import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import ScenicCard from '@/components/ScenicCard';
import { scenicSpots, facilities } from '@/data/scenic';

type TabType = 'spot' | 'toilet' | 'medical';

const facilityDistances: Record<string, string> = {
  f001: '80m',
  f002: '260m',
  f003: '150m',
  f004: '320m',
  f005: '480m',
  f006: '50m',
  f007: '120m',
};

const MapPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('spot');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [myLocation, setMyLocation] = useState('中心广场附近');

  const facilityTabs = [
    { id: 'spot' as TabType, name: '全部景点', icon: '🏛️' },
    { id: 'toilet' as TabType, name: '卫生间', icon: '🚻' },
    { id: 'medical' as TabType, name: '医务点', icon: '🏥' },
  ];

  const allSearchable = useMemo(() => {
    const items: Array<{ id: string; name: string; type: string; icon: string; distance: string; category: string }> = [];
    scenicSpots.forEach((s) => {
      items.push({ id: s.id, name: s.name, type: 'spot', icon: '🏯', distance: '—', category: s.category });
    });
    facilities.forEach((f) => {
      const iconMap: Record<string, string> = { toilet: '🚻', medical: '🏥', entrance: '🚪', exit: '🚪' };
      items.push({ id: f.id, name: f.name, type: f.type, icon: iconMap[f.type] || '📍', distance: facilityDistances[f.id] || '—', category: f.type === 'toilet' ? '卫生间' : f.type === 'medical' ? '医务点' : '设施' });
    });
    return items;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchKeyword.trim()) return [];
    const kw = searchKeyword.trim().toLowerCase();
    return allSearchable.filter((item) => item.name.toLowerCase().includes(kw) || item.category.toLowerCase().includes(kw));
  }, [searchKeyword, allSearchable]);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      if (activeTab === 'spot') return true;
      return f.type === activeTab;
    }).map((f) => ({ ...f, distance: facilityDistances[f.id] || '—' }));
  }, [activeTab]);

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'toilet': return '🚻';
      case 'medical': return '🏥';
      case 'entrance': return '🚪';
      case 'exit': return '🚪';
      default: return '📍';
    }
  };

  const handleSearchInput = (e: any) => {
    setSearchKeyword(e.detail.value);
  };

  const handleLocate = () => {
    console.log('[Map] 点击定位');
    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        setMyLocation(`已定位 (${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)})`);
        Taro.showToast({ title: '定位成功', icon: 'success' });
        console.log('[Map] 定位成功:', res.latitude, res.longitude);
      },
      fail: () => {
        setMyLocation('模拟定位：中心广场');
        Taro.showToast({ title: '使用模拟定位', icon: 'none' });
        console.log('[Map] 定位失败，使用模拟位置');
      },
    });
  };

  const handleNavigateTo = (name: string) => {
    Taro.showToast({ title: `正在导航至${name}...`, icon: 'none' });
    console.log('[Map] 导航至:', name);
  };

  return (
    <View className={styles.container}>
      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchField}
            placeholder="搜索景点、厕所、医务点"
            placeholderClass={styles.searchPlaceholder}
            value={searchKeyword}
            onInput={handleSearchInput}
            onFocus={() => setShowSearch(true)}
          />
          {searchKeyword && (
            <Text className={styles.searchClear} onClick={() => { setSearchKeyword(''); setShowSearch(false); }}>✕</Text>
          )}
        </View>
        <View className={styles.locationBtn} onClick={handleLocate}>
          <Text>📍</Text>
        </View>
      </View>

      {showSearch && searchKeyword.trim() ? (
        <ScrollView scrollY className={styles.searchResults}>
          <View className={styles.searchHeader}>
            <Text className={styles.searchCount}>找到 {searchResults.length} 个结果</Text>
          </View>
          {searchResults.length > 0 ? (
            searchResults.map((item) => (
              <View key={item.id} className={styles.searchItem} onClick={() => {
                setShowSearch(false);
                setSearchKeyword('');
                if (item.type === 'spot') {
                  Taro.navigateTo({ url: `/pages/scenic-detail/index?id=${item.id}` });
                } else {
                  handleNavigateTo(item.name);
                }
              }}>
                <View className={styles.searchItemIcon}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.searchItemInfo}>
                  <Text className={styles.searchItemName}>{item.name}</Text>
                  <Text className={styles.searchItemCat}>{item.category}</Text>
                </View>
                <View className={styles.searchItemRight}>
                  {item.distance !== '—' && <Text className={styles.searchItemDist}>{item.distance}</Text>}
                  <Text className={styles.searchItemNav}>导航 →</Text>
                </View>
              </View>
            ))
          ) : (
            <View className={styles.searchEmpty}>
              <Text>未找到相关结果</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <>
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
                <Text className={styles.markerLabel}>{myLocation}</Text>
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
                  <View key={f.id} className={styles.facilityItem} onClick={() => handleNavigateTo(f.name)}>
                    <View className={styles.facilityIcon}>
                      <Text>{getFacilityIcon(f.type)}</Text>
                    </View>
                    <View className={styles.facilityInfo}>
                      <Text className={styles.facilityName}>{f.name}</Text>
                      <Text className={styles.facilityDesc}>距离约 {f.distance}</Text>
                    </View>
                    <Text className={styles.facilityDistance}>导航 →</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default MapPage;
