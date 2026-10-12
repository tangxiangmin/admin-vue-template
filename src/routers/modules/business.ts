/**
 * 业务静态路由（前端注册，不再依赖后端接口返回菜单 JSON）
 *
 * 说明：
 * - 本数组同时承担两个职责：
 *   1. 在 staticRouter.ts 中作为 layout 的 children 注册到 vue-router；
 *   2. 在 auth store 中作为菜单列表，供侧边栏 / 面包屑 / 搜索菜单渲染。
 * - meta 字段含义见 src/routers/index.ts 顶部注释。
 * - 权限路由通过 meta.permission 声明完整权限编码；新增业务页面在此注册。
 */
export const businessRouter: Menu.IMenuOptions[] = [
  {
    path: "/home/index",
    name: "home",
    component: () => import("@/views/home/index.vue"),
    meta: {
      icon: "i-ep-home-filled",
      title: "首页",
      isLink: "",
      isHide: false,
      isFull: false,
      isAffix: true,
      isKeepAlive: true
    }
  },
  {
    path: "/system",
    name: "system",
    redirect: "/system/privileges",
    meta: { title: "权限管理", icon: "i-ep-lock", isHide: false, isFull: false, isAffix: false, isKeepAlive: false },
    children: [
      {
        path: "/system/privileges",
        name: "systemPrivilege",
        component: () => import("@/views/system/privilege.vue"),
        meta: {
          title: "权限点管理",
          icon: "i-ep-menu",
          permission: "permission.privilege.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/system/roles",
        name: "systemRole",
        component: () => import("@/views/system/role.vue"),
        meta: {
          title: "角色管理",
          icon: "i-ep-menu",
          permission: "permission.role.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/system/users",
        name: "systemUser",
        component: () => import("@/views/system/user.vue"),
        meta: {
          title: "管理员管理",
          icon: "i-ep-menu",
          permission: "permission.user.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      }
    ]
  },
  {
    path: "/templates",
    name: "templates",
    redirect: "/templates/crud",
    meta: {
      title: "CRUD 页面模板",
      icon: "i-ep-document",
      isHide: false,
      isFull: false,
      isAffix: false,
      isKeepAlive: false
    },
    children: [
      {
        path: "/templates/crud",
        name: "templateCrud",
        component: () => import("@/views/templates/crud.vue"),
        meta: {
          title: "基础表格与弹窗",
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/templates/crud-drawer",
        name: "templateCrudDrawer",
        component: () => import("@/views/templates/crud-drawer.vue"),
        meta: {
          title: "表格与抽屉交互",
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      }
    ]
  },
  {
    path: "/examples/crud-drawer",
    name: "exampleCrudDrawerRedirect",
    redirect: "/templates/crud-drawer",
    meta: {
      title: "表格与抽屉交互",
      icon: "i-ep-document",
      permission: "template.example.view",
      isHide: true,
      isFull: false,
      isAffix: false,
      isKeepAlive: false
    }
  },
  {
    path: "/standards",
    name: "standards",
    redirect: "/standards/table",
    meta: {
      title: "标准页面示例",
      icon: "i-ep-grid",
      isHide: false,
      isFull: false,
      isAffix: false,
      isKeepAlive: false
    },
    children: [
      {
        path: "/standards/table",
        name: "standardTable",
        component: () => import("@/views/standards/table.vue"),
        meta: {
          title: "标准表格列表",
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/standards/query-tabs",
        name: "standardQueryTabs",
        component: () => import("@/views/standards/query-tabs.vue"),
        meta: {
          title: "多 Tab 查询列表",
          queryTabs: true,
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/standards/tree",
        name: "standardTree",
        component: () => import("@/views/standards/tree.vue"),
        meta: {
          title: "左树右表",
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/standards/cards",
        name: "standardCards",
        component: () => import("@/views/standards/cards.vue"),
        meta: {
          title: "卡片列表",
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/standards/inbound",
        name: "standardInbound",
        component: () => import("@/views/standards/inbound.vue"),
        meta: {
          title: "入站参数与深链",
          queryInboundKeys: ["keyword", "status", "groupId"],
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/standards/customize",
        name: "standardCustomize",
        component: () => import("@/views/standards/customize.vue"),
        meta: {
          title: "字段级定制",
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/standards/forms",
        name: "standardForms",
        component: () => import("@/views/standards/forms.vue"),
        meta: {
          title: "表单场景与挽留",
          icon: "i-ep-document",
          permission: "template.example.view",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      }
    ]
  },
  {
    path: "/examples",
    name: "examples",
    redirect: "/examples/search-record",
    meta: {
      title: "工具示例",
      icon: "i-ep-collection",
      isHide: false,
      isFull: false,
      isAffix: false,
      isKeepAlive: false
    },
    children: [
      {
        path: "/examples/form-leave",
        name: "exampleFormLeave",
        component: () => import("@/views/examples/form-leave.vue"),
        meta: {
          title: "未保存修改挽留",
          icon: "i-ep-warning",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/examples/ui",
        name: "exampleUi",
        component: () => import("@/views/examples/ui.vue"),
        meta: {
          title: "UI 组件规范",
          icon: "i-ep-brush",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/examples/charts",
        name: "exampleCharts",
        component: () => import("@/views/examples/charts.vue"),
        meta: {
          title: "G2Plot 数据图表",
          icon: "i-ep-data-analysis",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/examples/search-record",
        name: "exampleSearchRecord",
        component: () => import("@/views/examples/search-record.vue"),
        meta: {
          title: "路由搜索记录",
          icon: "i-ep-search",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      },
      {
        path: "/examples/storage",
        name: "exampleStorage",
        component: () => import("@/views/examples/storage.vue"),
        meta: { title: "存储模型", icon: "i-ep-box", isHide: false, isFull: false, isAffix: false, isKeepAlive: false }
      },
      {
        path: "/examples/vueuse",
        name: "exampleVueUse",
        component: () => import("@/views/examples/vueuse.vue"),
        meta: {
          title: "VueUse 快捷用法",
          icon: "i-ep-magic-stick",
          isHide: false,
          isFull: false,
          isAffix: false,
          isKeepAlive: false
        }
      }
    ]
  }
];
