    <template> 
      <v-sheet class="fill-height d-flex flex-column sidebar-wrapper" color="white" >
        <!-- Logo --> <div class="d-flex align-center justify-center py-4 border-b"> 
          <v-img src="/logo.png" max-width="200" contain /> </div> <!-- Navigation --> 
          <transition name="fade"> <v-list nav class="flex-grow-1 overflow-y-auto mt-2">
            <v-list-item v-for="item in items" :key="item.title" :to="item.to" link exact class="sidebar-item" >
    <template #prepend> <v-icon class="sidebar-icon">{{ item.icon }}</v-icon> 
    </template> 
    <transition name="slide-fade">
      <v-list-item-title v-show="!isCollapsed" class="sidebar-title" > {{ item.title }}
        </v-list-item-title>
          </transition> 
          </v-list-item> 
          </v-list>
          </transition> 
          </v-sheet> 
    </template> 
    
    <script setup lang="ts"> 
    import { inject } from 'vue' 
    const isCollapsed = inject('isCollapsed', false) 
    const items = [ { title: 'Dashboard', icon: 'mdi-home-outline', to: '/dean/dashboard' }, 
    { title: 'Periods', icon: 'mdi-clock-outline', to: '/dean/periods' }, 
    { title: 'Subjects', icon: 'mdi-book-open-outline', to: '/dean/subjects' }, 
    { title: 'Teachers', icon: 'mdi-account-outline', to: '/dean/teachers' },
     { title: 'Classes', icon: 'mdi-clipboard-text-outline', to: '/dean/classes' },
      { title: 'Schedules', icon: 'mdi-calendar-outline', to: '/dean/schedules' }, 
      ] 
    </script>
    <style scoped> 
    .border-b { border-bottom: 1px solid #e0e0e0; } /* Sidebar base */ 
    .sidebar-wrapper { transition: all 0.25s ease; width: 100%; } /* List items */ 
    .sidebar-item {
       border-radius: 8px; margin: 4px 8px;
       padding: 10px 14px !important; 
       font-weight: 500; color: #2c3e50; 
       transition: all 0.2s ease; 
       display: flex !important; 
       align-items: center; } /* Icon */ 
    .sidebar-icon { font-size: 22px; color: #2c3e50; transition: color 0.2s ease; } /* Active State */ 
    .v-list-item--active { background-color: #1E88E5 !important; color: white !important; font-weight: 600; border-radius: 8px; } 
    .v-list-item--active .sidebar-icon { color: white !important; } /* When collapsed: center icons properly */ 
    .v-navigation-drawer--rail .sidebar-item { justify-content: center !important; padding: 10px 0 !important; } 
    .v-navigation-drawer--rail .sidebar-icon { margin: 0 auto !important; } 
    .v-navigation-drawer--rail .sidebar-title { display: none !important; } /* Animation: subtle fade when toggling sidebar */ 
    .fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; } 
    .fade-enter-from, .fade-leave-to { opacity: 0; } /* Slide text in/out smoothly */ 
    .slide-fade-enter-active, .slide-fade-leave-active { transition: all 0.25s ease; } 
    .slide-fade-enter-from { opacity: 0; transform: translateX(-6px); } 
    .slide-fade-leave-to { opacity: 0; transform: translateX(-6px); } 
    </style>