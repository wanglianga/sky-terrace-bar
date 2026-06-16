<template>
  <div class="app-root">
    <nav class="top-nav">
      <router-link to="/customer" class="nav-link" :class="{ active: $route.path === '/customer' }">
        <span class="nav-icon">📱</span> 顾客端
      </router-link>
      <router-link to="/staff" class="nav-link" :class="{ active: $route.path === '/staff' }">
        <span class="nav-icon">📋</span> 店员端
      </router-link>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-nav {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(10, 15, 30, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 180, 100, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-link {
  padding: 8px 18px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-link:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 180, 100, 0.1);
}

.nav-link.active {
  background: linear-gradient(135deg, #ff8c42 0%, #ff5c8a 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 140, 66, 0.3);
}

.nav-icon {
  font-size: 16px;
}

.main-content {
  flex: 1;
}
</style>
