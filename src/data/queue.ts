import { QueueItem } from '@/types';

export const queueItems: QueueItem[] = [
  {
    id: 'q001',
    name: '大宋武侠城',
    waitTime: 15,
    status: 'normal',
    category: '景点',
    image: 'https://picsum.photos/id/1036/600/400',
  },
  {
    id: 'q002',
    name: '清明上河图景区',
    waitTime: 25,
    status: 'busy',
    category: '景点',
    image: 'https://picsum.photos/id/1044/600/400',
  },
  {
    id: 'q003',
    name: '校场马战',
    waitTime: 40,
    status: 'crowded',
    category: '演出',
    image: 'https://picsum.photos/id/1018/600/400',
  },
  {
    id: 'q004',
    name: '万岁山大剧院',
    waitTime: 5,
    status: 'normal',
    category: '演出',
    image: 'https://picsum.photos/id/1039/600/400',
  },
  {
    id: 'q005',
    name: '大宋科举',
    waitTime: 10,
    status: 'normal',
    category: '演出',
    image: 'https://picsum.photos/id/1082/600/400',
  },
  {
    id: 'q006',
    name: '祝家庄景区',
    waitTime: 30,
    status: 'busy',
    category: '景点',
    image: 'https://picsum.photos/id/1044/600/400',
  },
  {
    id: 'q007',
    name: '水浒文化街',
    waitTime: 0,
    status: 'normal',
    category: '景点',
    image: 'https://picsum.photos/id/1082/600/400',
  },
  {
    id: 'q008',
    name: '三打祝家庄演出',
    waitTime: 35,
    status: 'crowded',
    category: '演出',
    image: 'https://picsum.photos/id/1044/600/400',
  },
];

export const queueTips = [
  '上午10点前入园人少，建议早到',
  '午餐时间(12:00-13:30)景点排队较短',
  '下午3点后游客逐渐减少',
  '周末和节假日客流量较大，建议工作日出行',
];
