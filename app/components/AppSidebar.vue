<template>
  <v-navigation-drawer app permanent width="220">
    <v-list nav>
      <v-list-item to="/dean/dashboard" link><v-list-item-icon><v-icon>mdi-view-dashboard</v-icon></v-list-item-icon><v-list-item-title>Dashboard</v-list-item-title></v-list-item>
      <v-list-item to="/dean/schedules" link><v-list-item-icon><v-icon>mdi-calendar-grid</v-icon></v-list-item-icon><v-list-item-title>Schedules</v-list-item-title></v-list-item>
      <v-list-item to="/dean/teachers" link><v-list-item-icon><v-icon>mdi-account-tie</v-icon></v-list-item-icon><v-list-item-title>Teachers</v-list-item-title></v-list-item>
      <v-list-item to="/dean/classes" link><v-list-item-icon><v-icon>mdi-account-group</v-icon></v-list-item-icon><v-list-item-title>Classes</v-list-item-title></v-list-item>
      <v-list-item to="/dean/subjects" link><v-list-item-icon><v-icon>mdi-book-open</v-icon></v-list-item-icon><v-list-item-title>Subjects</v-list-item-title></v-list-item>
      <v-list-item to="/dean/rooms" link><v-list-item-icon><v-icon>mdi-door</v-icon></v-list-item-icon><v-list-item-title>Rooms</v-list-item-title></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>
