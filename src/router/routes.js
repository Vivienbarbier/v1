import store from '@/state/store'

export default [
  {
    path: '/',
    name: 'default',
    meta: {
      authRequired: true,
    },
    component: () => import('./views/dashboards/default'),
  },
  {
    path: "/case",
    name: "list-view",
    meta: { authRequired: true },
    component: () => import('./views/case/list-view')
  },
  {
    path: '/case/detail/:bu/:caseId',
    name: 'case-detail',
    meta: { authRequired: true },
    component: () => import('./views/case/case-detail'),
    props: true,
  },
  {
    path: "/case/create",
    name: "case-create",
    meta: { authRequired: true },
    component: () => import('./views/case/case-create')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/account/login'),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters['auth/loggedIn']) {
          // Redirect to the home page instead
          next({ name: 'default' })
        } else {
          // Continue to the login page
          next()
        }
      },
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./views/account/register'),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters['auth/loggedIn']) {
          // Redirect to the home page instead
          next({ name: 'default' })
        } else {
          // Continue to the login page
          next()
        }
      },
    },
  },
  {
    path: '/forgot-password',
    name: 'Forgot password',
    component: () => import('./views/account/forgot-password'),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters['auth/loggedIn']) {
          // Redirect to the home page instead
          next({ name: 'default' })
        } else {
          // Continue to the login page
          next()
        }
      },
    },
  },
  {
    path: '/logout',
    name: 'logout',
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        if (process.env.VUE_APP_DEFAULT_AUTH === "firebase") {
          store.dispatch('auth/logOut')
        } else {
          store.dispatch('authfack/logout')
        }
        const authRequiredOnPreviousRoute = routeFrom.matched.some(
          (route) => route.push('/login')
        )
        // Navigate back to previous page, or home as a fallback
        next(authRequiredOnPreviousRoute ? { name: 'default' } : { ...routeFrom })
      },
    },
  },
  {
    path: '/404',
    name: '404',
    component: require('./views/utility/404').default,
  },
  // Redirect any unmatched routes to the 404 page. This may
  // require some server configuration to work in production:
  // https://router.vuejs.org/en/essentials/history-mode.html#example-server-configurations
  {
    path: '*',
    redirect: '404',
  },
  
]
