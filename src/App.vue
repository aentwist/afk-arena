<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink :to="{ name: 'abex' }">Abyssal Expedition</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
