import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { serviceItems, faqs, lostItems } from '@/data/service';
import classNames from 'classnames';

const ServicePage: React.FC = () => {
  const handleServiceClick = (item: any) => {
    console.log('[Service] 点击服务:', item.name);
    if (item.phone) {
      Taro.makePhoneCall({
        phoneNumber: item.phone,
      }).catch(() => {
        Taro.showToast({ title: '拨打电话失败', icon: 'none' });
      });
    } else if (item.name === '失物招领') {
      Taro.showToast({ title: '失物招领', icon: 'none' });
    } else if (item.name === '停车服务') {
      Taro.switchTab({ url: '/pages/mine/index' });
    } else {
      Taro.showToast({ title: `${item.name}功能开发中`, icon: 'none' });
    }
  };

  const handleSubmitLost = () => {
    console.log('[Service] 提交失物');
    Taro.showModal({
      title: '提交失物信息',
      content: '请联系游客服务中心 400-888-0000',
      showCancel: false,
    });
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
        {lostItems.map((item) => (
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

      <View className={styles.submitBtn} onClick={handleSubmitLost}>
        <Text>📝 提交失物信息</Text>
      </View>

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
