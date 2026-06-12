import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useAppStore } from '@/store/useAppStore';

const SquadPage: React.FC = () => {
  const {
    squadMembers,
    squadGathered,
    tickets,
    parkingRecord,
    setParkingRecord,
    toggleMemberGathered,
  } = useAppStore();
  const [showTicketFor, setShowTicketFor] = useState<string | null>(null);

  const getMemberTicket = (memberId: string, memberName: string) => {
    return tickets.find((t) => t.holderName === memberName);
  };

  const membersWithStatus = useMemo(() => {
    return squadMembers.map((m) => {
      const ticket = getMemberTicket(m.id, m.name);
      return {
        ...m,
        hasTicket: !!ticket,
        ticket,
        gathered: !!squadGathered[m.id],
      };
    });
  }, [squadMembers, tickets, squadGathered]);

  const gatheredCount = membersWithStatus.filter((m) => m.gathered).length;
  const hasTicketCount = membersWithStatus.filter((m) => m.hasTicket).length;

  const handleInvite = () => {
    Taro.showModal({
      title: '邀请亲友',
      content: '小队编号：WSS-20260612-001\n分享给好友加入小队',
      confirmText: '复制编号',
      success: (res) => {
        if (res.confirm) {
          Taro.setClipboardData({ data: 'WSS-20260612-001' });
          Taro.showToast({ title: '已复制', icon: 'success' });
        }
      },
    });
  };

  const handleRecordParking = () => {
    if (parkingRecord) {
      Taro.showModal({
        title: '停车记录',
        content: `区域：${parkingRecord.area}\n车位：${parkingRecord.spotNumber}`,
        confirmText: '清除记录',
        success: (res) => {
          if (res.confirm) {
            setParkingRecord(null);
            Taro.showToast({ title: '已清除', icon: 'none' });
          }
        },
      });
    } else {
      Taro.showActionSheet({
        itemList: ['A区', 'B区', 'C区', 'D区'],
        success: (res) => {
          const areas = ['A区', 'B区', 'C区', 'D区'];
          const area = areas[res.tapIndex];
          const spot = `${['A', 'B', 'C', 'D'][res.tapIndex]}${String(Math.floor(Math.random() * 200 + 1)).padStart(3, '0')}`;
          setParkingRecord({
            area,
            spotNumber: spot,
            enterTime: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          });
          Taro.showToast({ title: '已记录停车位', icon: 'success' });
        },
      });
    }
  };

  const handleFindCar = () => {
    Taro.showToast({ title: '正在导航至停车场...', icon: 'none' });
  };

  const handleShowTicket = (memberId: string) => {
    setShowTicketFor(memberId);
  };

  const handleToggleGather = (memberId: string) => {
    toggleMemberGathered(memberId);
  };

  const currentMemberTicket = useMemo(() => {
    if (!showTicketFor) return null;
    const m = membersWithStatus.find((x) => x.id === showTicketFor);
    return m?.ticket || null;
  }, [showTicketFor, membersWithStatus]);

  const currentMember = useMemo(() => {
    return membersWithStatus.find((x) => x.id === showTicketFor);
  }, [showTicketFor, membersWithStatus]);

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.squadCard}>
        <View className={styles.squadHeader}>
          <Text className={styles.squadTitle}>👥 我的小队</Text>
          <Text className={styles.squadCode}>WSS-20260612-001</Text>
        </View>

        <View className={styles.squadStats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{gatheredCount}/{squadMembers.length}</Text>
            <Text className={styles.statLabel}>已集合</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{hasTicketCount}</Text>
            <Text className={styles.statLabel}>已购票</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statNum}>¥{Math.round(tickets.reduce((s, t) => s + t.price, 0))}</Text>
            <Text className={styles.statLabel}>票包总额</Text>
          </View>
        </View>

        <View className={styles.squadMembers}>
          {membersWithStatus.map((member) => (
            <View key={member.id} className={styles.memberAvatarWrap}>
              <View
                className={classNames(
                  styles.memberAvatar,
                  member.isOnline && styles.online,
                  member.gathered && styles.gathered
                )}
              >
                <Text>{member.name.charAt(0)}</Text>
              </View>
              <Text className={styles.memberAvatarName}>{member.name}</Text>
              {member.hasTicket && <View className={styles.ticketBadge}>🎫</View>}
              {member.gathered && <View className={styles.gatheredBadge}>✓</View>}
            </View>
          ))}
          <View className={styles.addMember} onClick={handleInvite}>
            <Text>+</Text>
          </View>
        </View>
      </View>

      <View className={styles.squadActions}>
        <View className={styles.actionBtn} onClick={handleInvite}>
          <Text>📨</Text>
          <Text>邀请亲友</Text>
        </View>
        <View
          className={styles.actionBtn}
          onClick={() => Taro.switchTab({ url: '/pages/mine/index' })}
        >
          <Text>🎫</Text>
          <Text>我的票包</Text>
        </View>
        <View
          className={styles.actionBtn}
          onClick={() => Taro.navigateTo({ url: '/pages/itinerary/index' })}
        >
          <Text>�</Text>
          <Text>今日行程</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>成员状态</Text>
          <Text style={{ fontSize: 24, color: '#86909C' }}>
            集合进度 {gatheredCount}/{squadMembers.length}
          </Text>
        </View>
        <View className={styles.memberList}>
          {membersWithStatus.map((member) => (
            <View key={member.id} className={styles.memberItem}>
              <View className={styles.memberAvatarBig}>
                <Text className={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                {member.isOnline && <View className={styles.onlineDot} />}
              </View>

              <View className={styles.memberInfo}>
                <View className={styles.memberNameRow}>
                  <Text className={styles.memberName}>{member.name}</Text>
                  {member.gathered && (
                    <View className={styles.gatherTag}>
                      <Text>✓ 已集合</Text>
                    </View>
                  )}
                </View>
                <View className={styles.memberSub}>
                  {member.hasTicket ? (
                    <Text className={styles.ticketLabel}>🎫 已购票 · {member.ticket?.type}</Text>
                  ) : (
                    <Text className={styles.noTicketLabel}>⚠️ 未购票</Text>
                  )}
                  <Text className={styles.memberDistance}>
                    {member.isOnline ? '· 距离约50m' : '· 离线'}
                  </Text>
                </View>
              </View>

              <View className={styles.memberActions}>
                {member.hasTicket && (
                  <View
                    className={styles.ticketBtn}
                    onClick={() => handleShowTicket(member.id)}
                  >
                    <Text>检票码</Text>
                  </View>
                )}
                <View
                  className={classNames(
                    styles.gatherBtn,
                    member.gathered && styles.gatherBtnActive
                  )}
                  onClick={() => handleToggleGather(member.id)}
                >
                  <Text>{member.gathered ? '已到' : '集合'}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.parkingSection}>
        <Text className={styles.parkingTitle}>
          <Text>🅿️</Text>
          <Text>停车记录</Text>
        </Text>
        {parkingRecord ? (
          <>
            <View className={styles.parkingInfo}>
              <View className={styles.parkingIcon}>
                <Text>🚗</Text>
              </View>
              <View className={styles.parkingDetails}>
                <Text className={styles.parkingSpot}>
                  {parkingRecord.area} · {parkingRecord.spotNumber}
                </Text>
                <Text className={styles.parkingTime}>入场时间：{parkingRecord.enterTime}</Text>
                <Text className={styles.parkingCar}>已停约 2小时30分</Text>
              </View>
            </View>
            <View className={styles.recordBtn} onClick={handleFindCar}>
              <Text>🧭 导航找车</Text>
            </View>
          </>
        ) : (
          <>
            <View className={styles.noParking}>
              <Text>暂无停车记录</Text>
            </View>
            <View className={styles.recordBtn} onClick={handleRecordParking}>
              <Text>📝 记录停车位</Text>
            </View>
          </>
        )}
      </View>

      {showTicketFor && currentMemberTicket && (
        <View className={styles.modalMask} onClick={() => setShowTicketFor(null)}>
          <View className={styles.ticketModal} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.ticketModalTitle}>{currentMember?.name}的入园码</Text>
            <Text className={styles.ticketModalType}>{currentMemberTicket.type}</Text>

            <View className={styles.qrBox}>
              <View className={styles.qrCode}>
                <Text style={{ fontSize: 120, letterSpacing: -8 }}>▓▓▓▓▓▓</Text>
                <Text style={{ fontSize: 120, letterSpacing: -8 }}>▓░░▓░░▓</Text>
                <Text style={{ fontSize: 120, letterSpacing: -8 }}>▓▓▓▓▓▓</Text>
                <Text style={{ fontSize: 120, letterSpacing: -8 }}>▓░▓░░░▓</Text>
                <Text style={{ fontSize: 120, letterSpacing: -8 }}>▓▓▓▓▓▓</Text>
              </View>
              <Text className={styles.qrText}>请向工作人员出示二维码</Text>
            </View>

            <View className={styles.ticketInfoRow}>
              <Text className={styles.ticketInfoLabel}>票号</Text>
              <Text className={styles.ticketInfoValue}>{currentMemberTicket.code}</Text>
            </View>
            <View className={styles.ticketInfoRow}>
              <Text className={styles.ticketInfoLabel}>有效期</Text>
              <Text className={styles.ticketInfoValue}>{currentMemberTicket.validDate}</Text>
            </View>
            <View className={styles.ticketInfoRow}>
              <Text className={styles.ticketInfoLabel}>持有人</Text>
              <Text className={styles.ticketInfoValue}>{currentMember?.name}</Text>
            </View>

            <View className={styles.ticketClose} onClick={() => setShowTicketFor(null)}>
              <Text>关闭</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default SquadPage;
