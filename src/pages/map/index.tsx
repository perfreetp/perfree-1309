import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import ScenicCard from '@/components/ScenicCard';
import { scenicSpots, facilities } from '@/data/scenic';
import { useAppStore } from '@/store/useAppStore';
import { NavTarget } from '@/types';

type TabType = 'spot' | 'toilet' | 'medical';

interface SearchableItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  distance: string;
  distanceMeters: number;
  category: string;
  leftPct: number;
  topPct: number;
}

const facilityDistances: Record<string, { m: number; left: number; top: number }> = {
  f001: { m: 80, left: 30, top: 40 },
  f002: { m: 260, left: 70, top: 55 },
  f003: { m: 150, left: 45, top: 70 },
  f004: { m: 320, left: 80, top: 35 },
  f005: { m: 480, left: 15, top: 80 },
  f006: { m: 50, left: 55, top: 50 },
  f007: { m: 120, left: 60, top: 25 },
};

const spotPositions: Record<string, { left: number; top: number; distance: number }> = {
  s001: { left: 25, top: 30, distance: 120 },
  s002: { left: 70, top: 25, distance: 200 },
  s003: { left: 20, top: 70, distance: 180 },
  s004: { left: 75, top: 65, distance: 300 },
  s005: { left: 50, top: 45, distance: 90 },
  s006: { left: 35, top: 55, distance: 150 },
};

const calcWalkTime = (meters: number) => {
  const minutes = Math.max(1, Math.round(meters / 80));
  return minutes < 60 ? `${minutes}分钟` : `${Math.floor(minutes / 60)}小时${minutes % 60}分`;
};

const MapPage: React.FC = () => {
  const { navTarget, setNavTarget } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('spot');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [myLocation, setMyLocation] = useState('中心广场附近');

  const myPos = { leftPct: 50, topPct: 60 };

  const facilityTabs = [
    { id: 'spot' as TabType, name: '全部景点', icon: '🏛️' },
    { id: 'toilet' as TabType, name: '卫生间', icon: '🚻' },
    { id: 'medical' as TabType, name: '医务点', icon: '🏥' },
  ];

  const allSearchable = useMemo<SearchableItem[]>(() => {
    const items: SearchableItem[] = [];
    scenicSpots.forEach((s) => {
      const pos = spotPositions[s.id] || { left: 50, top: 50, distance: 150 };
      items.push({
        id: s.id,
        name: s.name,
        type: 'spot',
        icon: '🏯',
        distance: `${pos.distance}m`,
        distanceMeters: pos.distance,
        category: s.category,
        leftPct: pos.left,
        topPct: pos.top,
      });
    });
    facilities.forEach((f) => {
      const info = facilityDistances[f.id] || { m: 150, left: 50, top: 50 };
      const iconMap: Record<string, string> = { toilet: '🚻', medical: '🏥', entrance: '🚪', exit: '🚪' };
      items.push({
        id: f.id,
        name: f.name,
        type: f.type,
        icon: iconMap[f.type] || '📍',
        distance: `${info.m}m`,
        distanceMeters: info.m,
        category: f.type === 'toilet' ? '卫生间' : f.type === 'medical' ? '医务点' : '设施',
        leftPct: info.left,
        topPct: info.top,
      });
    });
    return items;
  }, []);

  const searchResults = useMemo(() => {
    if (!searchKeyword.trim()) return [];
    const kw = searchKeyword.trim().toLowerCase();
    return allSearchable.filter(
      (item) => item.name.toLowerCase().includes(kw) || item.category.toLowerCase().includes(kw)
    );
  }, [searchKeyword, allSearchable]);

  const filteredFacilities = useMemo(() => {
    return facilities
      .filter((f) => {
        if (activeTab === 'spot') return true;
        return f.type === activeTab;
      })
      .map((f) => {
        const info = facilityDistances[f.id] || { m: 150, left: 50, top: 50 };
        return { ...f, distance: `${info.m}m`, distanceMeters: info.m, walkTime: calcWalkTime(info.m), leftPct: info.left, topPct: info.top };
      });
  }, [activeTab]);

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
      },
      fail: () => {
        setMyLocation('模拟定位：中心广场');
        Taro.showToast({ title: '使用模拟定位', icon: 'none' });
      },
    });
  };

  const handleNavigateTo = (item: SearchableItem) => {
    const target: NavTarget = {
      id: item.id,
      name: item.name,
      icon: item.icon,
      type: item.type,
      distanceMeters: item.distanceMeters,
      leftPct: item.leftPct,
      topPct: item.topPct,
    };
    setNavTarget(target);
    setShowSearch(false);
    setSearchKeyword('');
    Taro.showToast({ title: `导航至${item.name}`, icon: 'none' });
    console.log('[Map] 开始导航到:', item.name);
  };

  const handleNavigateFacility = (f: any) => {
    const target: NavTarget = {
      id: f.id,
      name: f.name,
      icon: getFacilityIcon(f.type),
      type: f.type,
      distanceMeters: f.distanceMeters,
      leftPct: f.leftPct,
      topPct: f.topPct,
    };
    setNavTarget(target);
    Taro.showToast({ title: `导航至${f.name}`, icon: 'none' });
  };

  const handleCloseNav = () => {
    setNavTarget(null);
  };

  useDidShow(() => {
    if (navTarget) {
      console.log('[Map] 恢复导航目标:', navTarget.name);
    }
  });

  const navLinePoints = navTarget
    ? `${myPos.leftPct}% ${myPos.topPct}%, ${navTarget.leftPct}% ${navTarget.topPct}%`
    : '';

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
            <Text
              className={styles.searchClear}
              onClick={() => {
                setSearchKeyword('');
                setShowSearch(false);
              }}
            >
              ✕
            </Text>
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
              <View
                key={item.id}
                className={styles.searchItem}
                onClick={() => {
                  if (item.type === 'spot') {
                    Taro.navigateTo({ url: `/pages/scenic-detail/index?id=${item.id}` });
                  } else {
                    handleNavigateTo(item);
                  }
                }}
              >
                <View className={styles.searchItemIcon}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.searchItemInfo}>
                  <Text className={styles.searchItemName}>{item.name}</Text>
                  <Text className={styles.searchItemCat}>
                    {item.category} · 步行约{calcWalkTime(item.distanceMeters)}
                  </Text>
                </View>
                <View className={styles.searchItemRight}>
                  <Text className={styles.searchItemDist}>{item.distance}</Text>
                  <View
                    className={styles.goBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateTo(item);
                    }}
                  >
                    <Text>去这里</Text>
                  </View>
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
                <Text>
                  {tab.icon} {tab.name}
                </Text>
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
              <View
                className={classNames(styles.marker, styles.markerCurrent)}
                style={{ left: `${myPos.leftPct}%`, top: `${myPos.topPct}%` }}
              >
                <Text className={styles.markerIcon}>📍</Text>
                <Text className={styles.markerLabel}>{myLocation}</Text>
              </View>

              {scenicSpots.map((spot) => {
                const pos = spotPositions[spot.id] || { left: 50, top: 50, distance: 150 };
                const isTarget = navTarget?.id === spot.id;
                return (
                  <View
                    key={spot.id}
                    className={classNames(styles.marker, isTarget && styles.markerTarget)}
                    style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
                    onClick={() => {
                      Taro.navigateTo({ url: `/pages/scenic-detail/index?id=${spot.id}` });
                    }}
                  >
                    <Text className={styles.markerIcon}>🏯</Text>
                    <Text className={styles.markerLabel}>{spot.name}</Text>
                  </View>
                );
              })}

              {navTarget && navTarget.type !== 'spot' && (
                <View
                  className={classNames(styles.marker, styles.markerTarget)}
                  style={{ left: `${navTarget.leftPct}%`, top: `${navTarget.topPct}%` }}
                >
                  <Text className={styles.markerIcon}>{navTarget.icon}</Text>
                  <Text className={styles.markerLabel}>{navTarget.name}</Text>
                </View>
              )}

              {navTarget && (
                <svg className={styles.routeSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line
                    x1={myPos.leftPct}
                    y1={myPos.topPct}
                    x2={navTarget.leftPct}
                    y2={navTarget.topPct}
                    stroke="#C8102E"
                    strokeWidth="0.8"
                    strokeDasharray="2,1.5"
                  />
                </svg>
              )}
            </View>
          </View>

          {navTarget && (
            <View className={styles.navPanel}>
              <View className={styles.navInfo}>
                <Text className={styles.navIcon}>{navTarget.icon}</Text>
                <View className={styles.navText}>
                  <Text className={styles.navName}>{navTarget.name}</Text>
                  <Text className={styles.navMeta}>
                    {navTarget.distanceMeters}m · 步行约{calcWalkTime(navTarget.distanceMeters)}
                  </Text>
                </View>
              </View>
              <View className={styles.navClose} onClick={handleCloseNav}>
                <Text>✕</Text>
              </View>
            </View>
          )}

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
                {filteredFacilities.map((f) => {
                  return (
                    <View key={f.id} className={styles.facilityItem}>
                      <View className={styles.facilityIcon}>
                        <Text>{getFacilityIcon(f.type)}</Text>
                      </View>
                      <View className={styles.facilityInfo}>
                        <Text className={styles.facilityName}>{f.name}</Text>
                        <Text className={styles.facilityDesc}>
                          距离 {f.distance} · 步行约{f.walkTime}
                        </Text>
                      </View>
                      <View
                        className={styles.goBtn}
                        onClick={() => handleNavigateFacility(f)}
                      >
                        <Text>去这里</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default MapPage;
