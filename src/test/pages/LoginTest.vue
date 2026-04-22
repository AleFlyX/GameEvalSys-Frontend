<template>
  <div class="biophilic-login-container">
    <!-- Background Layers: Nature Image + Abstract Organic Patterns + Animated Elements -->
    <div class="background-layer">
      <!-- Base Nature Image (Forest/Sky) -->
      <div class="nature-bg"></div>
      <!-- Gradient Overlay for Serenity -->
      <div class="gradient-overlay"></div>
      <!-- Abstract Organic Patterns (Leaf Veins/Water Ripples) -->
      <div class="organic-patterns">
        <div class="pattern pattern-veins"></div>
        <div class="pattern pattern-ripples"></div>
      </div>
      <!-- Animated Natural Elements (Falling Leaves, Drifting Clouds) -->
      <div class="animated-elements" ref="animatedElementsRef">
        <!-- Leaves will be dynamically generated -->
      </div>
    </div>

    <!-- Login Container: Organic Form, Soft Edges, Frosted Glass -->
    <div class="login-container" :class="{ 'error-shake': isError, 'success-bloom': isSuccess }">
      <!-- Header: Natural Typography -->
      <div class="login-header">
        <h1 class="login-title">Welcome Back</h1>
        <p class="login-subtitle">A moment of calm before you begin</p>
      </div>

      <!-- Login Form: Organic Inputs, Nature-Inspired Buttons -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <!-- Username Input: Organic Border, Focus Bloom -->
        <div class="form-group" :class="{ 'focused': isUsernameFocused, 'error': isError && !username }">
          <label class="form-label" for="username">Username</label>
          <div class="input-wrapper">
            <input id="username" v-model="username" type="text" class="organic-input" @focus="isUsernameFocused = true"
              @blur="isUsernameFocused = false" placeholder="Enter your username" />
            <div class="input-border-bloom"></div>
          </div>
          <div class="form-error" v-if="isError && !username">
            <span class="error-icon">🍂</span>
            <span>Please enter your username</span>
          </div>
        </div>

        <!-- Password Input: Organic Border, Focus Bloom -->
        <div class="form-group" :class="{ 'focused': isPasswordFocused, 'error': isError && !password }">
          <label class="form-label" for="password">Password</label>
          <div class="input-wrapper">
            <input id="password" v-model="password" type="password" class="organic-input"
              @focus="isPasswordFocused = true" @blur="isPasswordFocused = false" placeholder="Enter your password" />
            <div class="input-border-bloom"></div>
          </div>
          <div class="form-error" v-if="isError && !password">
            <span class="error-icon">🍂</span>
            <span>Please enter your password</span>
          </div>
        </div>

        <!-- Submit Button: Stone/Leaf Shape, Natural Feedback -->
        <button type="submit" class="organic-submit-btn" :class="{ 'loading': isLoading }" :disabled="isLoading">
          <span v-if="!isLoading && !isSuccess">Enter the Space</span>
          <span v-else-if="isLoading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </span>
          <span v-else-if="isSuccess" class="success-text">
            <span class="success-icon">🌸</span>
            Welcome!
          </span>
        </button>
      </form>

      <!-- Footer: Subtle Natural Link -->
      <div class="login-footer">
        <a href="#" class="natural-link">Forgot your password? <span class="link-accent">🌿</span></a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// State Management
const username = ref('');
const password = ref('');
const isUsernameFocused = ref(false);
const isPasswordFocused = ref(false);
const isLoading = ref(false);
const isError = ref(false);
const isSuccess = ref(false);
const animatedElementsRef = ref(null);

// Generate Falling Leaves Animation
const createFallingLeaves = () => {
  if (!animatedElementsRef.value) return;

  const leafEmojis = ['🍃', '🌿', '🍂', '🌱'];
  const container = animatedElementsRef.value;

  // Create 15 leaves for natural density
  for (let i = 0; i < 15; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf';
    leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];

    // Randomize position, size, animation duration/delay
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.top = `-50px`;
    leaf.style.fontSize = `${12 + Math.random() * 18}px`;
    leaf.style.animationDuration = `${8 + Math.random() * 12}s`;
    leaf.style.animationDelay = `${Math.random() * 10}s`;
    leaf.style.opacity = `${0.3 + Math.random() * 0.4}`;

    container.appendChild(leaf);
  }
};

// Form Submission Handler (Simulate API Call)
const handleSubmit = async () => {
  // Reset states
  isError.value = false;
  isSuccess.value = false;

  // Basic validation
  if (!username.value || !password.value) {
    isError.value = true;
    // Trigger shake animation
    setTimeout(() => isError.value = false, 800);
    return;
  }

  // Simulate loading
  isLoading.value = true;

  try {
    // Simulate API call (2s delay)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate success
    isSuccess.value = true;
    isLoading.value = false;

    // Optional: Redirect after success
    // setTimeout(() => {
    //   router.push('/home');
    // }, 1500);
  } catch (err) {
    // Simulate error
    isError.value = true;
    isLoading.value = false;
    setTimeout(() => isError.value = false, 800);
  }
};

// Lifecycle Hooks
onMounted(() => {
  createFallingLeaves();
});

onUnmounted(() => {
  // Clean up leaves if needed
  if (animatedElementsRef.value) {
    animatedElementsRef.value.innerHTML = '';
  }
});
</script>

<style scoped>
/* -------------------------- Global Container & Background -------------------------- */
.biophilic-login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: "Noto Sans JP", "Lora", "PingFang SC", serif;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Base Nature Background (High-Quality Forest/Sky Image) */
.nature-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: brightness(0.9) contrast(0.95) saturate(0.9);
  z-index: 1;
}

/* Serene Gradient Overlay (Forest Green + Sky Blue + Earthy Brown) */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
      rgba(46, 125, 50, 0.15) 0%,
      rgba(13, 71, 161, 0.1) 30%,
      rgba(62, 39, 35, 0.2) 70%,
      rgba(255, 112, 67, 0.1) 100%);
  z-index: 2;
}

/* Abstract Organic Patterns (Leaf Veins + Water Ripples) */
.organic-patterns {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  opacity: 0.3;
  pointer-events: none;
}

.pattern-veins {
  position: absolute;
  top: 10%;
  left: 5%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle at 30% 30%, transparent 0%, transparent 40%, rgba(46, 125, 50, 0.1) 41%, transparent 42%),
    radial-gradient(circle at 70% 70%, transparent 0%, transparent 40%, rgba(46, 125, 50, 0.1) 41%, transparent 42%);
  transform: rotate(45deg);
}

.pattern-ripples {
  position: absolute;
  bottom: 10%;
  right: 5%;
  width: 300px;
  height: 300px;
  background: repeating-radial-gradient(circle, transparent 0%, transparent 10px, rgba(13, 71, 161, 0.08) 11px, transparent 12px);
  animation: ripple-drift 20s ease-in-out infinite;
}

@keyframes ripple-drift {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(-20px, 10px) scale(1.05);
  }
}

/* Animated Natural Elements (Falling Leaves) */
.animated-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

.falling-leaf {
  position: absolute;
  animation: leaf-fall linear infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

@keyframes leaf-fall {
  0% {
    transform: translateY(0) rotate(0deg) translateX(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(110vh) rotate(720deg) translateX(50px);
    opacity: 0;
  }
}

/* -------------------------- Login Container: Organic Form -------------------------- */
.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 3rem 2.5rem;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px) saturate(1.2);
  border-radius: 32px;
  /* Large organic rounded corners */
  box-shadow:
    0 20px 60px rgba(62, 39, 35, 0.25),
    0 8px 24px rgba(46, 125, 50, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Error State: Withering Effect */
.login-container.error-shake {
  animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  border-color: rgba(255, 112, 67, 0.5);
  box-shadow:
    0 20px 60px rgba(255, 112, 67, 0.2),
    0 8px 24px rgba(255, 112, 67, 0.1);
}

@keyframes shake {

  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }

  30%,
  50%,
  70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%,
  60% {
    transform: translate3d(4px, 0, 0);
  }
}

/* Success State: Blooming Effect */
.login-container.success-bloom {
  border-color: rgba(46, 125, 50, 0.6);
  box-shadow:
    0 20px 60px rgba(46, 125, 50, 0.3),
    0 8px 24px rgba(46, 125, 50, 0.2),
    0 0 40px rgba(46, 125, 50, 0.15);
  animation: bloom 0.8s ease-out;
}

@keyframes bloom {
  0% {
    transform: scale(0.98);
  }

  50% {
    transform: scale(1.02);
  }

  100% {
    transform: scale(1);
  }
}

/* -------------------------- Typography: Natural & Readable -------------------------- */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 400;
  color: #2e3b4e;
  margin: 0 0 0.5rem 0;
  letter-spacing: 1px;
  font-family: "Lora", "Noto Serif SC", serif;
}

.login-subtitle {
  font-size: 0.95rem;
  color: #5d6d7e;
  margin: 0;
  font-weight: 300;
  font-style: italic;
}

/* -------------------------- Form Elements: Nature-Inspired -------------------------- */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
}

.form-group {
  position: relative;
  transition: all 0.3s ease;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  color: #5d6d7e;
  margin-bottom: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Organic Input Wrapper (For Bloom Border) */
.input-wrapper {
  position: relative;
  width: 100%;
}

.organic-input {
  width: 100%;
  padding: 1rem 1.2rem;
  font-size: 1rem;
  color: #2e3b4e;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(139, 195, 74, 0.25);
  border-radius: 20px;
  /* Organic rounded input */
  outline: none;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-sizing: border-box;
  font-family: inherit;
}

.organic-input::placeholder {
  color: #95a5a6;
  font-weight: 300;
}

/* Focus State: Bloom Effect */
.input-border-bloom {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid transparent;
  border-radius: 20px;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.form-group.focused .organic-input {
  border-color: rgba(46, 125, 50, 0.5);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.1);
}

.form-group.focused .input-border-bloom {
  border-color: rgba(46, 125, 50, 0.3);
  transform: scale(1.02);
}

/* Error State: Withering Input */
.form-group.error .organic-input {
  border-color: rgba(255, 112, 67, 0.6);
  background: rgba(255, 243, 224, 0.8);
}

.form-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #e64a19;
}

/* -------------------------- Submit Button: Stone/Leaf Shape -------------------------- */
.organic-submit-btn {
  position: relative;
  width: 100%;
  padding: 1.1rem;
  margin-top: 0.5rem;
  font-size: 1.05rem;
  font-weight: 500;
  color: #fff;
  background: linear-gradient(135deg, #2e7d32 0%, #43a047 100%);
  border: none;
  border-radius: 24px;
  /* Organic stone/leaf shape */
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow:
    0 8px 20px rgba(46, 125, 50, 0.35),
    0 2px 8px rgba(46, 125, 50, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  font-family: inherit;
  letter-spacing: 0.5px;
  overflow: hidden;
}

.organic-submit-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.01);
  box-shadow:
    0 12px 28px rgba(46, 125, 50, 0.45),
    0 4px 12px rgba(46, 125, 50, 0.25);
  background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
}

.organic-submit-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
  box-shadow:
    0 4px 12px rgba(46, 125, 50, 0.3),
    0 1px 4px rgba(46, 125, 50, 0.2);
}

/* Loading State: Gentle Pulsing Dots */
.organic-submit-btn.loading {
  cursor: not-allowed;
  background: linear-gradient(135deg, #689f38 0%, #8bc34a 100%);
}

.loading-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 0 3px;
  background: #fff;
  border-radius: 50%;
  animation: dot-pulse 1.4s infinite ease-in-out both;
}

.loading-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-pulse {

  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Success State: Blooming Text */
.success-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.success-icon {
  animation: icon-bounce 0.6s ease-out;
}

@keyframes icon-bounce {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.3);
  }
}

/* -------------------------- Footer: Subtle Natural Link -------------------------- */
.login-footer {
  text-align: center;
  margin-top: 2rem;
}

.natural-link {
  font-size: 0.9rem;
  color: #5d6d7e;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 300;
}

.natural-link:hover {
  color: #2e7d32;
}

.link-accent {
  transition: transform 0.3s ease;
  display: inline-block;
}

.natural-link:hover .link-accent {
  transform: rotate(15deg) scale(1.1);
}

/* -------------------------- Responsive Design -------------------------- */
@media (max-width: 768px) {
  .login-container {
    max-width: 90%;
    padding: 2.5rem 2rem;
    border-radius: 28px;
  }

  .login-title {
    font-size: 1.7rem;
  }

  .organic-submit-btn {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 2rem 1.5rem;
  }

  .login-header {
    margin-bottom: 2rem;
  }
}
</style>
