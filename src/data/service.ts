import { LostItem } from '@/types';

export const serviceItems = [
  {
    id: 's001',
    name: '游客服务中心',
    icon: '🎧',
    description: '一键拨打游客服务热线',
    phone: '400-888-0000',
  },
  {
    id: 's002',
    name: '失物招领',
    icon: '🔍',
    description: '提交失物信息，帮助寻找',
  },
  {
    id: 's003',
    name: '紧急求助',
    icon: '🆘',
    description: '遇到紧急情况一键求助',
    phone: '110',
  },
  {
    id: 's004',
    name: '医疗服务',
    icon: '🏥',
    description: '景区医务室位置及电话',
    phone: '0371-12345678',
  },
  {
    id: 's005',
    name: '投诉建议',
    icon: '💬',
    description: '您的意见对我们很重要',
  },
  {
    id: 's006',
    name: '停车服务',
    icon: '🅿️',
    description: '记录停车位，快速找车',
  },
];

export const faqs = [
  {
    id: 'faq001',
    question: '景区开放时间是什么时候？',
    answer: '景区旺季(3月-11月)开放时间为08:00-18:00，淡季(12月-2月)为08:30-17:30。夜间演出另行安排。',
  },
  {
    id: 'faq002',
    question: '门票价格是多少？',
    answer: '成人票120元/人，儿童票(1.2-1.4米)60元/人，60岁以上老人凭身份证免票。',
  },
  {
    id: 'faq003',
    question: '可以带宠物入园吗？',
    answer: '为了游客安全和景区环境，禁止携带宠物入园。导盲犬等工作犬除外。',
  },
  {
    id: 'faq004',
    question: '景区内有餐厅吗？',
    answer: '景区内有多家餐厅和小吃摊，提供各种开封特色美食和简餐。',
  },
  {
    id: 'faq005',
    question: '停车场怎么收费？',
    answer: '小型车10元/次，大型车20元/次，不限时。凭当日景区门票可享5元优惠。',
  },
];

export const lostItems: LostItem[] = [
  {
    id: 'l001',
    title: '黑色双肩包',
    description: '内有一部手机和钱包，在武侠城附近丢失',
    location: '大宋武侠城',
    time: '2026-06-10 14:30',
    contact: '138****8888',
    status: 'pending',
    type: 'lost',
  },
  {
    id: 'l002',
    title: '儿童蓝色水杯',
    description: '印有奥特曼图案，在校场附近拾到',
    location: '校场',
    time: '2026-06-11 11:00',
    contact: '请到游客服务中心领取',
    status: 'found',
    type: 'found',
  },
  {
    id: 'l003',
    title: '一串钥匙',
    description: '约5把钥匙，带一个小熊挂件',
    location: '水浒文化街',
    time: '2026-06-11 16:00',
    contact: '请到游客服务中心领取',
    status: 'found',
    type: 'found',
  },
];
