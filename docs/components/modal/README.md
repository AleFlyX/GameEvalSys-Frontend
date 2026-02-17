## 三层modal组件设计思路

> `页面 → UserConfirmDelete → ConfirmModal → BaseModal`

由于这三层组件，只需要BaseModal来控制显示或隐藏，为了避免中间组件重复定义props的visible变量，就使用$attrs API来实现无感传输visible的值来控制显隐

## $attrs

**$attrs 就是：父组件传过来，但我没在 props 里接收的所有东西。**

---

### **_核心_**

你在父组件写：

```vue
<Child title="标题" :visible="true" class="xxx" />
```

子组件里：

```js
defineProps({
  title: String,
});
```

- **title** → 你接收了 → 进 `props`
- **visible、class、id、style...** → 你没接收 → 自动进 **`$attrs`**

---

## 在你那三层 modal 里到底干嘛？

你三层：
`页面 → UserConfirmDelete → ConfirmModal → BaseModal`

只有 **BaseModal** 真正需要 `visible`：

```js
defineProps({ visible: Boolean });
```

中间两层 Confirm、UserDelete 都 **没写 visible 在 props 里**  
→ 所以 `visible` 就会一直存在 `$attrs` 里。

然后你写：

```vue
<BaseModal v-bind="$attrs" />
```

等于：

```vue
<BaseModal :visible="xxx" :class="xxx" ... />
```

**自动把所有没接收的属性，全部丢给下一层。**

---

## 超简总结

- **$attrs** = 路过的属性集合
- **v-bind="$attrs"** = 你们要的参数我不用，直接传给我儿子
- 你那三层弹窗，就是靠它实现 **零代码透传 v-model**

---

## inheritAttrs:false

中间组件最好加一句：

```js
defineOptions({ inheritAttrs: false });
```

意思是：**不要把这些属性自动挂到根DOM上，我自己用 $attrs 传。**

---

### 简而言之

**父传子，没写进 props 的，全在 $attrs 里。**  
**v-bind="$attrs" = 一键往下传。**

## inheritAttrs

我用**最直白、不绕弯**的方式给你讲懂：
**inheritAttrs = 要不要把 $attrs 自动绑到根元素上**

---

### inheritAttrs 到底是啥？

默认情况下，Vue 会做一件事：

> 你传给组件，但**没写在 props 里**的属性（class、id、style、disabled、visible…）
> Vue 会**自动**把它们绑到**组件最外层的 DOM 上**。

这就叫：
**inheritAttrs = true（默认）**

---

### 为什么你这里要设为 false？

因为你现在是 **三层嵌套组件**：
DeleteUserModal → ConfirmModal → BaseModal

你希望的是：

- `visible` 这个属性 **只传给最里面的 BaseModal**
- 不要绑在 ConfirmModal、DeleteUserModal 的根 div 上（即父组件的根元素）

如果不写 `inheritAttrs: false`，就会出事：

```html
<!-- ConfirmModal 根元素会莫名其妙挂上 visible -->
<div class="confirm-modal" visible="true">
  <div class="base-modal">...</div>
</div>
```

你根本不需要外面这个 div 有 `visible`，
它既不是 props，也不是正常 DOM 属性，**纯属多余、甚至报错、样式错乱**。

---

### 简而言之

**inheritAttrs: false**
= **我自己控制 $attrs 传给谁，不要Vue自动帮我绑到根DOM。**

你这种**多层透传、组件套组件**，**必须写 false**。

---

### 什么时候用 true（默认）？

只有简单组件才用默认，比如：

```vue
<MyButton type="primary" class="mr-10" />
```

你希望 class、type 自动挂到 button 上，
这时候就**不用写 inheritAttrs**。

---

### 总结

- **inheritAttrs: true（默认）**
  → 自动把多余属性绑到根DOM
- **inheritAttrs: false**
  → 不自动绑，我自己用 `v-bind="$attrs"` 手动传

**三层 modal 全是中间转发层，所以全部要 false。**
