<template>
  <v-navigation-drawer app permanent width="220">
    <v-list nav>
      <v-list-item to="/dean/dashboard" link>
        <v-list-item-icon><v-icon>mdi-view-dashboard</v-icon></v-list-item-icon>
        <v-list-item-title>Dashboard</v-list-item-title>
      </v-list-item>

      <v-list-item to="/dean/periods" link>
        <v-list-item-icon><v-icon>mdi-timetable</v-icon></v-list-item-icon>
        <v-list-item-title>Periods</v-list-item-title>
      </v-list-item>

      <v-list-item to="/dean/subjects" link>
        <v-list-item-icon><v-icon>mdi-book-open</v-icon></v-list-item-icon>
        <v-list-item-title>Subjects</v-list-item-title>
      </v-list-item>

      <v-list-item to="/dean/teachers" link>
        <v-list-item-icon><v-icon>mdi-account-tie</v-icon></v-list-item-icon>
        <v-list-item-title>Teachers</v-list-item-title>
      </v-list-item>

      <v-list-item to="/dean/classes" link>
        <v-list-item-icon><v-icon>mdi-account-group</v-icon></v-list-item-icon>
        <v-list-item-title>Classes</v-list-item-title>
      </v-list-item>

      <v-list-item to="/dean/schedules" link>
        <v-list-item-icon><v-icon>mdi-calendar-grid</v-icon></v-list-item-icon>
        <v-list-item-title>Schedules</v-list-item-title>
      </v-list-item>

      <v-divider />
      <v-list-item to="/dean/exam-timetable" link>
        <v-list-item-icon><v-icon>mdi-file-document-box-multiple</v-icon></v-list-item-icon>
        <v-list-item-title>Exam Timetable</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts"></script>

<style scoped>
.v-navigation-drawer {
  background: #ffffff;
}
</style>
