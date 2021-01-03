// 如果需要嵌入子路由 需要在父极路由上添加入hasChildren: true

const menus = [
  {
    path: '/home',
    name: '主页',
    component: () => import('../view/home/Index.vue'),
    // children: [
    //   {
    //     path: '/home/sub',
    //     name: '主页详情',
    //     component: () => import('../view/home/Detail.vue'),
    //   },
    // ],
  },
  {
    path: '/time',
    name: '时间轴',
    component: () => import('../view/home/Detail.vue'),
  },
  {
    path: '/render',
    name: 'render',
    component: () => import('../view/testRender/Wrap.vue'),
  },
  {
    path: '/canvas',
    name: 'canvas',
    component: () => import('../view/canvas/Index.vue'),
  },
  {
    path: '/testkey',
    name: 'testkey',
    component: () => import('../view/testKey/Index.vue'),
  },
  {
    path: '/weblabel',
    name: 'weblabel',
    component: () => import('../view/weblabel/Index.vue'),
  },
];

export default menus;
