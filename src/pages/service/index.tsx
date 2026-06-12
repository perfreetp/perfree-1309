import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { serviceItems, faqs, lostItems as defaultLostItems } from '@/data/service';
import classNames from 'classnames';
import { useAppStore } from '@/store/useAppStore';
import { LostItem } from '@/types';

const ServicePage: React.FC = () => {
  const { lostItems, addLostItem } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLocation, setFormLocation] = useState('');

  const allLostItems = [...lostItems, ...defaultLostItems];

  const handleServiceClick = (item: any) => {
    console.log('[Service] 点击服务:', item.name);
    if (item.phone) {
      Taro.makePhoneCall({
        phoneNumber: item.phone,
      }).catch(() => {
        Taro.showToast({ title: '拨打电话失败', icon: 'none' });
      });
    } else if (item.name === '失物招领') {
      setShowForm(true);
    } else if (item.name === '停车服务') {
      Taro.navigateTo({ url: '/pages/squad/index' });
    } else {
      Taro.showToast({ title: `${item.name}功能开发中`, icon: 'none' });
    }
  };

  const handleSubmitLost = () => {
    if (!formTitle.trim()) {
      Taro.showToast({ title: '请输入物品名称', icon: 'none' });
      return;
    }
    if (!formDesc.trim()) {
      Taro.showToast({ title: '请输入描述', icon: 'none' });
      return;
    }
    if (!formLocation.trim()) {
      Taro.showToast({ title: '请输入丢失地点', icon: 'none' });
      return;
    }
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem: LostItem = {
      id: `l_user_${Date.now()}`,
      title: formTitle.trim(),
      description: formDesc.trim(),
      location: formLocation.trim(),
      time: timeStr,
      contact: '我提交的',
      status: 'pending',
      type: 'lost',
    };
    addLostItem(newItem);
    setFormTitle('');
    setFormDesc('');
    setFormLocation('');
    setShowForm(false);
    Taro.showToast({ title: '提交成功', icon: 'success' });
    console.log('[Service] 提交失物:', newItem);
  };

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.serviceGrid}>
        {serviceItems.map((item) => (
          <View
            key={item.id}
            className={styles.serviceCard}
            onClick={() => handleServiceClick(item)}
          >
            <View className={styles.serviceIcon}>
              <Text>{item.icon}</Text>
            </View>
            <Text className={styles.serviceName}>{item.name}</Text>
            <Text className={styles.serviceDesc}>{item.description}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>🔍</Text>
          <Text>失物招领</Text>
        </Text>
        {allLostItems.map((item) => (
          <View key={item.id} className={styles.lostItem}>
            <View className={styles.lostIcon}>
              <Text>{item.type === 'lost' ? '😢' : '🎉'}</Text>
            </View>
            <View className={styles.lostContent}>
              <Text className={styles.lostTitle}>
                {item.title}
                <Text className={classNames(styles.lostStatus, item.status)}>
                  {item.status === 'pending' ? '寻找中' : '已找到'}
                </Text>
              </Text>
              <Text className={styles.lostDesc}>{item.description}</Text>
              <View className={styles.lostMeta}>
                <Text>📍 {item.location}</Text>
                <Text>🕐 {item.time}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {showForm && (
        <View className={styles.formSection}>
          <Text className={styles.formTitle}>📝 提交失物信息</Text>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>物品名称</Text>
            <Input
              className={styles.formInput}
              placeholder="如：黑色双肩包"
              value={formTitle}
              onInput={(e) => setFormTitle(e.detail.value)}
            />
          </View>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>物品描述</Text>
            <Input
              className={styles.formInput}
              placeholder="简要描述物品特征"
              value={formDesc}
              onInput={(e) => setFormDesc(e.detail.value)}
            />
          </View>
          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>丢失地点</Text>
            <Input
              className={styles.formInput}
              placeholder="如：大宋武侠城"
              value={formLocation}
              onInput={(e) => setFormLocation(e.detail.value)}
            />
          </View>
          <View className={styles.formActions}>
            <View className={styles.formCancelBtn} onClick={() => setShowForm(false)}>
              <Text>取消</Text>
            </View>
            <View className={styles.formSubmitBtn} onClick={handleSubmitLost}>
              <Text>提交</Text>
            </View>
          </View>
        </View>
      )}

      {!showForm && (
        <View className={styles.submitBtn} onClick={() => setShowForm(true)}>
          <Text>📝 提交失物信息</Text>
        </View>
      )}

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text>❓</Text>
          <Text>常见问题</Text>
        </Text>
        {faqs.map((faq) => (
          <View key={faq.id} className={styles.faqItem}>
            <Text className={styles.faqQuestion}>Q: {faq.question}</Text>
            <Text className={styles.faqAnswer}>A: {faq.answer}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ServicePage;
