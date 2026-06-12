export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/map/index',
    'pages/show/index',
    'pages/queue/index',
    'pages/mine/index',
    'pages/food/index',
    'pages/service/index',
    'pages/scenic-detail/index',
    'pages/show-detail/index',
    'pages/squad/index',
    'pages/itinerary/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#C8102E',
    navigationBarTitleText: '万岁山游玩管家',
    navigationBarTextStyle: 'white',
    backgroundColor: '#FAF7F2',
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#C8102E',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
      },
      {
        pagePath: 'pages/map/index',
        text: '地图',
      },
      {
        pagePath: 'pages/show/index',
        text: '演出',
      },
      {
        pagePath: 'pages/queue/index',
        text: '排队',
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
      },
    ],
  },
});
